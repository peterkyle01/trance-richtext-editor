/**
 * Canonicalizes HTML for identity comparison in controlled mode.
 *
 * The editor's emitted HTML is not byte-identical to its input — Lexical
 * wraps text runs in classless `<span>` elements and double-wraps bold as
 * `<b><strong>`. A raw string comparison would treat "same content" as
 * "different" and re-push the value, resetting the cursor on every change.
 *
 * This produces a normalized signature: transparent wrappers are skipped,
 * equivalent tags are unified, and only content-relevant attributes are kept.
 * It is a comparison key, not a display format.
 */
export function canonicalizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return html;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return serializeNode(doc.body);
}

/** Attributes that carry content meaning (not chrome) */
const CONTENT_ATTRS = [
  'href',
  'src',
  'alt',
  'type',
  'aria-checked',
  'width',
  'height',
  'start',
  'value',
];

/** Inline style properties that carry content meaning */
const CONTENT_STYLE_PROPS = [
  'color',
  'background-color',
  'text-align',
  'font-size',
  'font-family',
  'font-style',
  'font-weight',
  'text-decoration',
  'vertical-align',
];

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Classless, styleless spans are Lexical text-wrapper artifacts — skip them
  if (tag === 'span' && el.attributes.length === 0) {
    return serializeChildren(el);
  }

  // Unify equivalent tags for identity comparison
  const normTag =
    tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag === 's' ? 'del' : tag;

  const attrs: string[] = [];
  for (const key of CONTENT_ATTRS) {
    if (el.hasAttribute(key)) {
      attrs.push(`${key}="${el.getAttribute(key)}"`);
    }
  }

  const style = el.getAttribute('style');
  if (style) {
    const kept: string[] = [];
    for (const part of style.split(';')) {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) continue;
      const prop = part.slice(0, colonIdx).trim().toLowerCase();
      if (CONTENT_STYLE_PROPS.includes(prop)) {
        kept.push(`${prop}:${part.slice(colonIdx + 1).trim()}`);
      }
    }
    if (kept.length > 0) {
      attrs.push(`style="${kept.join(';')}"`);
    }
  }

  const open = attrs.length > 0 ? `<${normTag} ${attrs.join(' ')}>` : `<${normTag}>`;
  return open + serializeChildren(el) + `</${normTag}>`;
}

function serializeChildren(el: HTMLElement): string {
  let out = '';
  for (const child of el.childNodes) {
    out += serializeNode(child);
  }
  return out;
}
