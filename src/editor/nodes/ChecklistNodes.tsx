import type {
  DOMExportOutput,
  DOMExportOutputMap,
  Klass,
  LexicalEditor,
  LexicalNode,
} from 'lexical';
import { isHTMLElement } from '@lexical/utils';
import { $isListNode, ListItemNode, ListNode } from '@lexical/list';

function exportList(
  editor: LexicalEditor,
  target: LexicalNode,
): DOMExportOutput {
  const listNode = target as ListNode;
  const output = listNode.exportDOM(editor);

  if (isHTMLElement(output.element) && listNode.getListType() === 'check') {
    // The base export emits a private `__lexicalListType` attribute that
    // DOMPurify strips in the renderer, so checklists would render as plain
    // bullet lists. `type="check"` is semantic, survives sanitization, and
    // Lexical's own importDOM recognizes checklists via `aria-checked`
    // children, so the round-trip works without custom import logic.
    output.element.setAttribute('type', 'check');
    output.element.removeAttribute('__lexicalListType');
  }

  return output;
}

function exportListItem(
  editor: LexicalEditor,
  target: LexicalNode,
): DOMExportOutput {
  const itemNode = target as ListItemNode;
  const output = itemNode.exportDOM(editor);

  if (isHTMLElement(output.element)) {
    // The base export always sets `text-align: left` on unaligned items —
    // noise that leaks into output. Remove it when it matches the default.
    if (output.element.style.textAlign === 'left') {
      output.element.style.removeProperty('text-align');
    }

    // The base export drops the checked state entirely (it only exists in
    // Lexical JSON). Emitting `aria-checked` is semantically correct and is
    // exactly what Lexical's own `$convertListItemElement` reads back.
    const parent = itemNode.getParent();
    if ($isListNode(parent) && parent.getListType() === 'check') {
      output.element.setAttribute(
        'aria-checked',
        String(itemNode.getChecked() === true),
      );
      // `tabindex` is editor chrome (programmatic focus for the checkbox
      // UI) — meaningless in rendered output.
      output.element.removeAttribute('tabindex');
    }
  }

  return output;
}

/**
 * HTML export overrides that keep checklists faithful in serialized output.
 *
 * Pass to any editor that uses TRANCE_NODES:
 *
 * ```ts
 * createEditor({ nodes: TRANCE_NODES, html: { export: TRANCE_HTML_EXPORT } })
 * ```
 */
export const TRANCE_HTML_EXPORT: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ListNode, exportList],
  [ListItemNode, exportListItem],
]);
