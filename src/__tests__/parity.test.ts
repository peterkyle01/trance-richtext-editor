import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Editor ↔ renderer parity tests — the core promise of the library:
 * content edited in the editor must render EXACTLY the same in the
 * renderer. Each feature is rendered twice: once with the editor's CSS
 * (theme classes as the editor would render them) and once with the
 * renderer's CSS (the semantic HTML the editor exports), then computed
 * styles are compared.
 *
 * Known jsdom limitations (covered by static assertions at the bottom):
 * - text-decoration (underline/strikethrough) cannot be computed
 * - ::before/::after pseudo-elements (checklist checkboxes) cannot be computed
 *
 * Upgrade path: for true pixel parity, run the same fixture matrix in a
 * real browser (Playwright) and diff screenshots/computed styles there.
 */

const VARIABLES_CSS = readFileSync('src/styles/variables.css', 'utf8');
const EDITOR_CSS = readFileSync('src/styles/editor.css', 'utf8');
const RENDERER_CSS = readFileSync('src/renderer/TranceRenderer.css', 'utf8');

interface Feature {
  name: string;
  editor: string; // HTML as the editor renders it (theme classes)
  renderer: string; // HTML as the editor exports it (semantic, classless)
  editorSel: string;
  rendererSel: string;
  props: string[];
}

const BASE_PROPS = [
  'fontSize',
  'fontWeight',
  'lineHeight',
  'color',
  'fontStyle',
  'letterSpacing',
  'textTransform',
  'textAlign',
  'verticalAlign',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'backgroundColor',
  'borderTopWidth',
  'borderTopColor',
  'borderLeftWidth',
  'borderLeftColor',
  'borderRadius',
  'listStyleType',
  'display',
];

const IMAGE_INLINE = 'display:block;width:fit-content;max-width:100%;margin-left:auto;margin-right:auto';

const FEATURES: Feature[] = [
  {
    name: 'container',
    editor: '<div class="trance-editor-content"></div>',
    renderer: '<div class="trance-renderer-content"></div>',
    editorSel: '.trance-editor-content',
    rendererSel: '.trance-renderer-content',
    props: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'color', 'fontSize', 'lineHeight', 'fontFamily'],
  },
  {
    name: 'paragraph',
    editor: '<p class="trance-paragraph">First paragraph</p><p class="trance-paragraph">Second paragraph</p>',
    renderer: '<p>First paragraph</p><p>Second paragraph</p>',
    editorSel: '.trance-paragraph',
    rendererSel: 'p',
    props: BASE_PROPS,
  },
  {
    name: 'heading h1',
    editor: '<h1 class="trance-h1">Heading one</h1>',
    renderer: '<h1>Heading one</h1>',
    editorSel: '.trance-h1',
    rendererSel: 'h1',
    props: BASE_PROPS,
  },
  {
    name: 'heading h2',
    editor: '<h2 class="trance-h2">Heading two</h2>',
    renderer: '<h2>Heading two</h2>',
    editorSel: '.trance-h2',
    rendererSel: 'h2',
    props: BASE_PROPS,
  },
  {
    name: 'heading h3',
    editor: '<h3 class="trance-h3">Heading three</h3>',
    renderer: '<h3>Heading three</h3>',
    editorSel: '.trance-h3',
    rendererSel: 'h3',
    props: BASE_PROPS,
  },
  {
    name: 'heading h4',
    editor: '<h4 class="trance-h4">Heading four</h4>',
    renderer: '<h4>Heading four</h4>',
    editorSel: '.trance-h4',
    rendererSel: 'h4',
    props: BASE_PROPS,
  },
  {
    name: 'heading h5',
    editor: '<h5 class="trance-h5">Heading five</h5>',
    renderer: '<h5>Heading five</h5>',
    editorSel: '.trance-h5',
    rendererSel: 'h5',
    props: BASE_PROPS,
  },
  {
    name: 'heading h6',
    editor: '<h6 class="trance-h6">Heading six</h6>',
    renderer: '<h6>Heading six</h6>',
    editorSel: '.trance-h6',
    rendererSel: 'h6',
    props: BASE_PROPS,
  },
  {
    name: 'bullet list',
    editor: '<ul class="trance-ul"><li class="trance-li">One</li><li class="trance-li">Two</li></ul>',
    renderer: '<ul><li>One</li><li>Two</li></ul>',
    editorSel: '.trance-ul li',
    rendererSel: 'ul li',
    props: BASE_PROPS,
  },
  {
    name: 'ordered list',
    editor: '<ol class="trance-ol"><li class="trance-li">One</li></ol>',
    renderer: '<ol><li>One</li></ol>',
    editorSel: '.trance-ol li',
    rendererSel: 'ol li',
    props: BASE_PROPS,
  },
  {
    name: 'checklist item checked',
    editor: '<ul class="trance-ul"><li class="trance-li trance-li-checked">Done</li><li class="trance-li trance-li-unchecked">Todo</li></ul>',
    renderer: '<ul type="check"><li aria-checked="true">Done</li><li aria-checked="false">Todo</li></ul>',
    editorSel: '.trance-li-checked',
    rendererSel: 'li[aria-checked="true"]',
    props: BASE_PROPS,
  },
  {
    name: 'checklist item unchecked',
    editor: '<ul class="trance-ul"><li class="trance-li trance-li-checked">Done</li><li class="trance-li trance-li-unchecked">Todo</li></ul>',
    renderer: '<ul type="check"><li aria-checked="true">Done</li><li aria-checked="false">Todo</li></ul>',
    editorSel: '.trance-li-unchecked',
    rendererSel: 'li[aria-checked="false"]',
    props: BASE_PROPS,
  },
  {
    name: 'blockquote',
    editor: '<blockquote class="trance-quote"><p class="trance-paragraph">A quote</p></blockquote>',
    renderer: '<blockquote><p>A quote</p></blockquote>',
    editorSel: '.trance-quote',
    rendererSel: 'blockquote',
    props: BASE_PROPS,
  },
  {
    name: 'code block',
    editor: '<pre class="trance-code-block"><code>const x = 1;</code></pre>',
    renderer: '<pre><code>const x = 1;</code></pre>',
    editorSel: '.trance-code-block',
    rendererSel: 'pre',
    props: BASE_PROPS,
  },
  {
    name: 'table header cell',
    editor: '<table class="trance-table"><tr class="trance-table-row"><th class="trance-table-cell-header">Head</th></tr><tr class="trance-table-row trance-table-row-striped"><td class="trance-table-cell">A</td></tr><tr class="trance-table-row"><td class="trance-table-cell">B</td></tr></table>',
    renderer: '<table><tr><th>Head</th></tr><tr><td>A</td></tr><tr><td>B</td></tr></table>',
    editorSel: '.trance-table-cell-header',
    rendererSel: 'th',
    props: BASE_PROPS,
  },
  {
    name: 'table cell (striped row)',
    editor: '<table class="trance-table"><tr class="trance-table-row"><th class="trance-table-cell-header">Head</th></tr><tr class="trance-table-row trance-table-row-striped"><td class="trance-table-cell">A</td></tr><tr class="trance-table-row"><td class="trance-table-cell">B</td></tr></table>',
    renderer: '<table><tr><th>Head</th></tr><tr><td>A</td></tr><tr><td>B</td></tr></table>',
    editorSel: '.trance-table-row-striped .trance-table-cell',
    rendererSel: 'tr:nth-child(2) td',
    props: BASE_PROPS,
  },
  {
    name: 'table cell (plain row)',
    editor: '<table class="trance-table"><tr class="trance-table-row"><th class="trance-table-cell-header">Head</th></tr><tr class="trance-table-row trance-table-row-striped"><td class="trance-table-cell">A</td></tr><tr class="trance-table-row"><td class="trance-table-cell">B</td></tr></table>',
    renderer: '<table><tr><th>Head</th></tr><tr><td>A</td></tr><tr><td>B</td></tr></table>',
    editorSel: 'tr:last-child .trance-table-cell',
    rendererSel: 'tr:nth-child(3) td',
    props: BASE_PROPS,
  },
  {
    name: 'horizontal rule',
    editor: '<hr class="trance-hr" />',
    renderer: '<hr />',
    editorSel: '.trance-hr',
    rendererSel: 'hr',
    props: ['height', 'marginTop', 'marginBottom', 'borderTopWidth'],
  },
  {
    name: 'bold',
    editor: '<span class="trance-bold">Bold</span>',
    renderer: '<b><strong>Bold</strong></b>',
    editorSel: '.trance-bold',
    rendererSel: 'strong',
    props: ['fontWeight'],
  },
  {
    name: 'italic',
    editor: '<em class="trance-italic">Italic</em>',
    renderer: '<em>Italic</em>',
    editorSel: '.trance-italic',
    rendererSel: 'em',
    props: ['fontStyle'],
  },
  {
    name: 'highlight',
    editor: '<mark class="trance-highlight">Highlight</mark>',
    renderer: '<mark>Highlight</mark>',
    editorSel: '.trance-highlight',
    rendererSel: 'mark',
    props: ['backgroundColor', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius'],
  },
  {
    name: 'inline code',
    editor: '<code class="trance-inline-code">inline</code>',
    renderer: '<code>inline</code>',
    editorSel: '.trance-inline-code',
    rendererSel: 'code',
    props: ['fontSize', 'fontWeight', 'backgroundColor', 'color', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius', 'fontFamily'],
  },
  {
    name: 'subscript',
    editor: '<sub class="trance-subscript">sub</sub>',
    renderer: '<sub>sub</sub>',
    editorSel: '.trance-subscript',
    rendererSel: 'sub',
    props: ['fontSize', 'verticalAlign'],
  },
  {
    name: 'superscript',
    editor: '<sup class="trance-superscript">sup</sup>',
    renderer: '<sup>sup</sup>',
    editorSel: '.trance-superscript',
    rendererSel: 'sup',
    props: ['fontSize', 'verticalAlign'],
  },
  {
    name: 'link',
    editor: '<a class="trance-link" href="https://example.com">Link</a>',
    renderer: '<a href="https://example.com">Link</a>',
    editorSel: '.trance-link',
    rendererSel: 'a',
    props: ['color'],
  },
  {
    name: 'text color (inline style)',
    editor: '<span style="color: #e11d48">Red text</span>',
    renderer: '<span style="color: #e11d48">Red text</span>',
    editorSel: 'span',
    rendererSel: 'span',
    props: ['color'],
  },
  {
    name: 'paragraph alignment (inline style)',
    editor: '<p class="trance-text-center">Centered</p>',
    renderer: '<p style="text-align: center">Centered</p>',
    editorSel: '.trance-text-center',
    rendererSel: 'p',
    props: ['textAlign'],
  },
  {
    name: 'image wrapper',
    editor: '<div class="trance-image-wrapper align-center"><div class="trance-image-inner"><figure><img src="https://example.com/a.png" alt="A" /></figure></div></div>',
    renderer: `<figure style="${IMAGE_INLINE}"><img src="https://example.com/a.png" alt="A" /></figure>`,
    editorSel: '.trance-image-wrapper',
    rendererSel: 'figure',
    props: ['display', 'width', 'maxWidth', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
  },
  {
    name: 'image element',
    editor: '<div class="trance-image-wrapper align-center"><div class="trance-image-inner"><figure><img src="https://example.com/a.png" alt="A" /></figure></div></div>',
    renderer: `<figure style="${IMAGE_INLINE}"><img src="https://example.com/a.png" alt="A" /></figure>`,
    editorSel: '.trance-image-inner img',
    rendererSel: 'figure img',
    props: ['display', 'maxWidth', 'height', 'borderRadius'],
  },
  {
    name: 'image caption',
    editor: '<div class="trance-image-wrapper align-center"><div class="trance-image-inner"><figure><img src="x" alt="A" /><figcaption class="trance-image-caption">Caption</figcaption></figure></div></div>',
    renderer: `<figure style="${IMAGE_INLINE}"><img src="x" alt="A" /><figcaption>Caption</figcaption></figure>`,
    editorSel: '.trance-image-caption',
    rendererSel: 'figcaption',
    props: ['textAlign', 'fontSize', 'color', 'marginTop', 'fontStyle'],
  },
];

describe('Editor ↔ Renderer parity (computed styles)', () => {
  let editorRoot: HTMLElement;
  let rendererRoot: HTMLElement;

  beforeEach(() => {
    document.head.innerHTML = `
      <style id="parity-variables">${VARIABLES_CSS}</style>
      <style id="parity-editor">${EDITOR_CSS}</style>
      <style id="parity-renderer">${RENDERER_CSS}</style>
    `;

    editorRoot = document.createElement('div');
    editorRoot.className = 'trance-editor-wrapper';
    editorRoot.innerHTML = '<div class="trance-editor-content"></div>';
    document.body.appendChild(editorRoot);

    rendererRoot = document.createElement('div');
    rendererRoot.className = 'trance-renderer';
    rendererRoot.innerHTML = '<div class="trance-renderer-content"></div>';
    document.body.appendChild(rendererRoot);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  for (const feature of FEATURES) {
    it(`${feature.name} renders identically`, () => {
      const editorContent = editorRoot.querySelector('.trance-editor-content')!;
      const rendererContent = rendererRoot.querySelector(
        '.trance-renderer-content',
      )!;
      editorContent.innerHTML = feature.editor;
      rendererContent.innerHTML = feature.renderer;

      const editorEl = editorContent.querySelector(feature.editorSel)!;
      const rendererEl = rendererContent.querySelector(feature.rendererSel)!;
      expect(editorEl, `editor element for "${feature.name}"`).not.toBeNull();
      expect(rendererEl, `renderer element for "${feature.name}"`).not.toBeNull();

      const editorStyle = getComputedStyle(editorEl);
      const rendererStyle = getComputedStyle(rendererEl);

      for (const prop of feature.props) {
        expect(
          rendererStyle.getPropertyValue(prop),
          `renderer ${feature.name} ${prop}`,
        ).toBe(editorStyle.getPropertyValue(prop));
      }
    });
  }
});

describe('Editor ↔ Renderer parity (static CSS contract)', () => {
  it('underline and strikethrough rules match (jsdom cannot compute text-decoration)', () => {
    expect(EDITOR_CSS).toContain('.trance-underline');
    expect(EDITOR_CSS).toContain('.trance-strikethrough');
    expect(RENDERER_CSS).toContain('text-decoration: underline');
    expect(RENDERER_CSS).toContain('text-decoration: line-through');
  });

  it('horizontal rule gradient matches (gradients are not computed styles)', () => {
    expect(EDITOR_CSS).toContain('linear-gradient(90deg');
    expect(RENDERER_CSS).toContain('linear-gradient(90deg');
  });

  it('checklist checkbox markup is styled in the renderer (jsdom cannot compute pseudo-elements)', () => {
    expect(RENDERER_CSS).toContain("ul[type='check']");
    expect(RENDERER_CSS).toContain("li[aria-checked='true']");
    expect(RENDERER_CSS).toContain('::before');
    expect(RENDERER_CSS).toContain('::after');
  });
});
