import { describe, it, expect } from 'vitest';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from 'lexical';
import { TRANCE_NODES } from '../editor/nodes';
import { tranceLexicalTheme } from '../styles/lexical-theme';
import { stripTranceInternals } from '../utils/stripTranceInternals';

function generateHtml(content: (root: ReturnType<typeof $getRoot>) => void): string {
  const editor = createEditor({
    namespace: 'Test',
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
    onError: console.error,
  });

  editor.update(
    () => {
      const root = $getRoot();
      content(root);
    },
    { discrete: true }
  );

  let html = '';
  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });

  return html;
}

describe('stripTranceInternals', () => {
  it('should remove trance-* classes from paragraph', () => {
    const raw = generateHtml((root) => {
      const p = $createParagraphNode();
      p.append($createTextNode('Hello world'));
      root.append(p);
    });
    const clean = stripTranceInternals(raw);
    expect(clean).not.toContain('trance-paragraph');
    expect(clean).toContain('<p>');
    expect(clean).toContain('Hello world');
  });

  it('should remove trance-bold from strong tags', () => {
    const raw = generateHtml((root) => {
      const p = $createParagraphNode();
      p.append($createTextNode('Hello '));
      p.append($createTextNode('world').setFormat(1)); // bold
      root.append(p);
    });
    const clean = stripTranceInternals(raw);
    expect(clean).not.toContain('trance-bold');
    // Should keep semantic strong tag
    expect(clean).toMatch(/<strong[>\s]/);
  });

  it('should remove white-space: pre-wrap styles', () => {
    const raw = generateHtml((root) => {
      const p = $createParagraphNode();
      p.append($createTextNode('Test'));
      root.append(p);
    });
    const clean = stripTranceInternals(raw);
    expect(clean).not.toContain('pre-wrap');
  });

  it('should remove empty span wrappers', () => {
    const raw = generateHtml((root) => {
      const p = $createParagraphNode();
      p.append($createTextNode('Hello'));
      root.append(p);
    });
    const clean = stripTranceInternals(raw);
    expect(clean).not.toMatch(/<span[^>]*><\/span>/);
    expect(clean).toContain('Hello');
  });

  it('should produce clean, semantic HTML', () => {
    const raw = generateHtml((root) => {
      const p = $createParagraphNode();
      p.append($createTextNode('Hello '));
      p.append($createTextNode('world').setFormat(1)); // bold
      root.append(p);
    });
    const clean = stripTranceInternals(raw);
    console.log('Raw:', raw);
    console.log('Clean:', clean);
    // Should be simple <p>Hello <strong>world</strong></p> or similar
    expect(clean).not.toContain('class=');
    expect(clean).not.toContain('style=');
    expect(clean).not.toContain('trance-');
    expect(clean).not.toContain('pre-wrap');
  });

  it('should handle empty input', () => {
    expect(stripTranceInternals('')).toBe('');
  });

  it('should not corrupt non-trance classes', () => {
    const html = '<p class="my-custom-class">Hello</p>';
    const clean = stripTranceInternals(html);
    expect(clean).toContain('my-custom-class');
    expect(clean).toContain('<p');
    expect(clean).toContain('Hello');
  });
});
