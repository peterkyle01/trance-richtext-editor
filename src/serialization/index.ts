import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  $getRoot,
  $insertNodes,
  createEditor,
  LexicalEditor,
  SerializedEditorState,
} from 'lexical';
import { TRANCE_NODES } from '../editor/nodes';
import { tranceLexicalTheme } from '../styles/lexical-theme';

/**
 * Serialize the current editor state to an HTML string.
 * Must be called within an editor.read() or editor.update() context,
 * or pass the editor and it will call read() for you.
 */
export function serializeToHtml(editor: LexicalEditor): string {
  let html = '';
  editor.read(() => {
    html = $generateHtmlFromNodes(editor, null);
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

/**
 * Convert serialized Lexical JSON to HTML string (server-side / headless).
 * Does NOT require a browser DOM — uses a headless Lexical editor.
 *
 * @example
 * ```ts
 * import { convertJsonToHtml } from 'trance-richtext-editor';
 * const html = convertJsonToHtml(savedJson);
 * ```
 */
export function convertJsonToHtml(
  json: SerializedEditorState
): string {
  const editor = createEditor({
    namespace: 'TranceHeadless',
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
    onError: (error) => {
      throw error;
    },
  });

  const editorState = editor.parseEditorState(json);
  let html = '';

  editorState.read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });

  return html;
}

/**
 * Convert HTML string to serialized Lexical JSON (server-side / headless).
 *
 * @example
 * ```ts
 * import { convertHtmlToJson } from 'trance-richtext-editor';
 * const json = convertHtmlToJson('<p>Hello world</p>');
 * ```
 */
export function convertHtmlToJson(
  html: string
): SerializedEditorState {
  const editor = createEditor({
    namespace: 'TranceHeadless',
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
    onError: (error) => {
      throw error;
    },
  });

  editor.update(
    () => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    },
    { discrete: true }
  );

  return editor.getEditorState().toJSON();
}
