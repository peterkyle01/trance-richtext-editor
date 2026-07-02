/**
 * CSS classes starting with these prefixes are editor-internal
 * Lexical theme classes that should be stripped from HTML output.
 *
 * NOTE: `trance-image-background` is intentionally NOT included — that
 * class is a semantic marker consumed by TranceRenderer to render
 * full-bleed background images.
 */
const EDITOR_CLASS_PREFIXES = [
  'trance-paragraph',
  'trance-h',
  'trance-bold',
  'trance-italic',
  'trance-underline',
  'trance-strikethrough',
  'trance-inline-code',
  'trance-highlight',
  'trance-subscript',
  'trance-superscript',
  'trance-ul',
  'trance-ol',
  'trance-li',
  'trance-link',
  'trance-quote',
  'trance-code-block',
  'trance-token-',
  'trance-table',
  'trance-hr',
  'trance-image-wrapper',
  'trance-indent',
  'trance-text-',
  'trance-editor-',
];

function isEditorClass(cls: string): boolean {
  return EDITOR_CLASS_PREFIXES.some((prefix) => cls.startsWith(prefix));
}

/**
 * Strips editor-internal CSS classes and `white-space: pre-wrap`
 * inline styles from serialized HTML.
 *
 * Lexical's `$generateHtmlFromNodes` applies theme class names (e.g.
 * `trance-paragraph`, `trance-bold`) and adds `white-space: pre-wrap` on
 * text spans. These are editor internals that should not leak into the
 * output HTML — the renderer styles semantic elements directly via CSS.
 *
 * Preserves semantic classes like `trance-image-background` that
 * the renderer uses to apply special rendering behavior.
 *
 * @param html - Raw HTML string from Lexical serialization
 * @returns Clean HTML with only semantic markup
 */
export function stripTranceInternals(html: string): string {
  if (!html) return html;

  let result = html;

  // 1. Remove editor-internal CSS classes from class attributes
  result = result.replace(
    /class="([^"]*)"/g,
    (_match: string, classes: string) => {
      const filtered = classes
        .split(/\s+/)
        .filter((cls: string) => !isEditorClass(cls))
        .join(' ')
        .trim();
      return filtered ? `class="${filtered}"` : '';
    }
  );

  // 2. Remove white-space: pre-wrap from style attributes
  //    (may coexist with other style properties)
  result = result.replace(
    /style="([^"]*)"/g,
    (_match: string, styleValue: string) => {
      const remaining = styleValue
        .replace(/white-space:\s*pre-wrap;?\s*/g, '')
        .trim();
      return remaining ? `style="${remaining}"` : '';
    }
  );

  // 3. Remove empty class and style attributes
  result = result.replace(/\s+class=""/g, '');
  result = result.replace(/\s+style=""/g, '');

  // 4. Remove empty <span> tags that were only wrappers for classes/styles
  result = result.replace(/<span>\s*<\/span>/g, '');
  result = result.replace(/<span\s*style="">\s*<\/span>/g, '');

  // 5. Clean up trailing whitespace in tags like <p > -> <p>
  result = result.replace(/\s+>/g, '>');

  // 6. Clean up double+ spaces in tag attributes
  result = result.replace(/  +/g, ' ');

  return result;
}
