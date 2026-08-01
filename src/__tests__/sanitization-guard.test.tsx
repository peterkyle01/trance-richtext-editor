import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TranceRenderer } from '../renderer/TranceRenderer';

/**
 * Guard tests for the editor → renderer contract.
 *
 * The editor emits inline styles (text color, alignment), semantic elements
 * (figure, figcaption, iframe, checklists), and attributes (target, rel,
 * loading). If DOMPurify's config ever drifts (version bump, config change),
 * these tests fail loudly — a silent failure would break editor/renderer
 * fidelity (e.g. text color vanishing in the renderer).
 */
describe('Renderer sanitization guard (editor output must survive DOMPurify)', () => {
  it('keeps the full editor output contract intact', () => {
    const contract = `<p style="color: #e11d48; text-align: center">Styled text</p>
<h2>Heading</h2>
<p>Bold <b><strong>and</strong></b> <em>italic</em> <u>underline</u> <s>strike</s> <mark>mark</mark> <code>code</code> <sub>sub</sub> <sup>sup</sup></p>
<ul><li>Bullet</li></ul>
<ol><li>Numbered</li></ol>
<ul type="check"><li aria-checked="true">Done</li><li aria-checked="false">Todo</li></ul>
<blockquote><p>Quote</p></blockquote>
<pre><code>const x = 1;</code></pre>
<table><tr><th>Head</th></tr><tr><td>Cell</td></tr></table>
<hr />
<figure><img src="https://example.com/a.png" alt="An image" loading="lazy" /><figcaption>Caption</figcaption></figure>
<iframe src="https://example.com/embed" width="560" height="315"></iframe>
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>`;

    const { container } = render(<TranceRenderer html={contract} />);

    // Inline styles the editor emits must survive
    expect(container.querySelector('p')?.getAttribute('style')).toContain(
      'color: #e11d48',
    );
    expect(container.querySelector('p')?.getAttribute('style')).toContain(
      'text-align: center',
    );

    // Checklist semantics must survive
    expect(container.querySelector('ul[type="check"]')).not.toBeNull();
    expect(
      container.querySelector('li[aria-checked="true"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('li[aria-checked="false"]'),
    ).not.toBeNull();

    // Allowed semantic elements must survive
    expect(container.querySelector('figure')).not.toBeNull();
    expect(container.querySelector('figcaption')).not.toBeNull();
    expect(container.querySelector('iframe')).not.toBeNull();
    expect(container.querySelector('mark')).not.toBeNull();
    expect(container.querySelector('sub')).not.toBeNull();
    expect(container.querySelector('sup')).not.toBeNull();

    // Allowed attributes must survive
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
    const link = container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });

  it('strips editor internals and dangerous content', () => {
    const dirty = `<div class="trance-paragraph trance-bold">Clean class</div>
<figure data-align="center" data-mode="inline" __lexicalListType="check"><img src="x" onerror="alert(1)" /></figure>
<p onclick="alert(1)">Click</p>
<script>alert('xss')</script>
<iframe src="javascript:alert(1)"></iframe>`;

    const { container } = render(<TranceRenderer html={dirty} />);

    // Editor-internal attributes and data attributes are stripped
    expect(container.querySelector('figure')?.getAttribute('data-align')).toBeNull();
    expect(container.querySelector('figure')?.getAttribute('__lexicalListType')).toBeNull();

    // XSS vectors are neutralized
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')?.getAttribute('onerror')).toBeNull();
    expect(container.querySelector('p')?.getAttribute('onclick')).toBeNull();
  });
});
