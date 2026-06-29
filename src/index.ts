// trance-richtext-editor — Main Entry Point
// Editor + Serialization utilities

// Editor component
export { TranceEditor } from './editor/TranceEditor';
export type { TranceEditorProps, TranceEditorRef } from './editor/TranceEditor';
export type { ToolbarFeatures } from './editor/toolbar/Toolbar';

// Serialization utilities
export {
  serializeToHtml,
  deserializeFromHtml,
  serializeToJson,
  deserializeFromJson,
  convertJsonToHtml,
  convertHtmlToJson,
} from './serialization';

// Custom nodes (for advanced users extending the editor)
export { ImageNode, $createImageNode, $isImageNode } from './editor/nodes';
export type { ImagePayload, SerializedImageNode } from './editor/nodes';
export {
  HorizontalRuleNode,
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from './editor/nodes';

// Commands (for advanced users dispatching commands)
export { INSERT_IMAGE_COMMAND } from './editor/plugins/ImagesPlugin';
export { INSERT_HORIZONTAL_RULE_COMMAND } from './editor/plugins/HorizontalRulePlugin';

// Re-export useful Lexical types
export type { SerializedEditorState, LexicalEditor } from 'lexical';
