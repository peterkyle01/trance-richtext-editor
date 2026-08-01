import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  $getRoot,
  $insertNodes,
  LexicalEditor,
  SerializedEditorState,
} from 'lexical';
import { stripTranceInternals } from '../utils/stripTranceInternals';

/**
 * Serialize the editor's current state to an HTML string.
 *
 * Calls `editor.read()` internally — call it outside of
 * `editor.update()`/`editor.read()` callbacks, or you'll serialize stale
 * (pre-update) content.
 */
export function serializeToHtml(editor: LexicalEditor): string {
  let html = '';
  editor.read(() => {
    html = stripTranceInternals($generateHtmlFromNodes(editor, null));
  });
  return html;
}

/**
 * Replace editor content from an HTML string.
 */
export function deserializeFromHtml(
  editor: LexicalEditor,
  html: string
): void {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom);
    const root = $getRoot();
    root.clear();
    $insertNodes(nodes);
  });
}

/**
 * Get the editor state as serialized JSON.
 */
export function serializeToJson(
  editor: LexicalEditor
): SerializedEditorState {
  return editor.getEditorState().toJSON();
}

/**
 * Replace editor state from JSON.
 */
export function deserializeFromJson(
  editor: LexicalEditor,
  json: SerializedEditorState
): void {
  const editorState = editor.parseEditorState(json);
  editor.setEditorState(editorState);
}

