import React, { ReactNode } from 'react';
import { SerializedEditorState, LexicalEditor, NodeKey, DecoratorNode, Spread, SerializedLexicalNode, DOMConversionMap, DOMExportOutput, LexicalNode, LexicalCommand } from 'lexical';
export { LexicalEditor, SerializedEditorState } from 'lexical';

interface ToolbarFeatures {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    link?: boolean;
    orderedList?: boolean;
    unorderedList?: boolean;
    checkList?: boolean;
    blockquote?: boolean;
    codeBlock?: boolean;
    image?: boolean;
    table?: boolean;
    horizontalRule?: boolean;
    heading?: boolean;
    textAlign?: boolean;
    superscript?: boolean;
    subscript?: boolean;
    highlight?: boolean;
}

interface TranceEditorProps {
    /** Initialize from an HTML string */
    initialHtml?: string;
    /** Initialize from serialized Lexical JSON */
    initialJson?: SerializedEditorState;
    /** Placeholder text shown when editor is empty */
    placeholder?: string;
    /** Called when editor content changes (debounced) */
    onChange?: (data: {
        html: string;
        json: SerializedEditorState;
    }) => void;
    /** Called when editor loses focus */
    onBlur?: () => void;
    /** Called when editor gains focus */
    onFocus?: () => void;
    /** Feature flags — all enabled by default */
    features?: ToolbarFeatures;
    /** Image upload handler. If not provided, images are base64 encoded. */
    onImageUpload?: (file: File) => Promise<{
        url: string;
        alt?: string;
    }>;
    /** Theme mode */
    theme?: 'light' | 'dark' | 'auto';
    /** Additional CSS class for the editor wrapper */
    className?: string;
    /** Whether the editor is editable */
    editable?: boolean;
    /** Auto-focus editor on mount */
    autoFocus?: boolean;
    /** Maximum character length */
    maxLength?: number;
    /** Debounce ms for onChange */
    debounceMs?: number;
}
interface TranceEditorRef {
    /** Get the current editor content as HTML */
    getHtml: () => string;
    /** Get the current editor state as JSON */
    getJson: () => SerializedEditorState;
    /** Set editor content from HTML string */
    setHtml: (html: string) => void;
    /** Set editor content from JSON */
    setJson: (json: SerializedEditorState) => void;
    /** Focus the editor */
    focus: () => void;
    /** Clear all editor content */
    clear: () => void;
    /** Get the underlying Lexical editor instance (escape hatch) */
    getLexicalEditor: () => LexicalEditor;
}
/**
 * TranceEditor — A plug-and-play rich text editor for React.
 *
 * @example
 * ```tsx
 * import { TranceEditor } from 'trance-richtext-editor';
 * import 'trance-richtext-editor/styles.css';
 *
 * function App() {
 *   return (
 *     <TranceEditor
 *       placeholder="Write something amazing..."
 *       onChange={({ html }) => console.log(html)}
 *     />
 *   );
 * }
 * ```
 */
declare const TranceEditor: React.ForwardRefExoticComponent<TranceEditorProps & React.RefAttributes<TranceEditorRef>>;

/**
 * Serialize the current editor state to an HTML string.
 * Must be called within an editor.read() or editor.update() context,
 * or pass the editor and it will call read() for you.
 */
declare function serializeToHtml(editor: LexicalEditor): string;
/**
 * Replace editor content from an HTML string.
 */
declare function deserializeFromHtml(editor: LexicalEditor, html: string): void;
/**
 * Get the editor state as serialized JSON.
 */
declare function serializeToJson(editor: LexicalEditor): SerializedEditorState;
/**
 * Replace editor state from JSON.
 */
declare function deserializeFromJson(editor: LexicalEditor, json: SerializedEditorState): void;
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
declare function convertJsonToHtml(json: SerializedEditorState): string;
/**
 * Convert HTML string to serialized Lexical JSON (server-side / headless).
 *
 * @example
 * ```ts
 * import { convertHtmlToJson } from 'trance-richtext-editor';
 * const json = convertHtmlToJson('<p>Hello world</p>');
 * ```
 */
declare function convertHtmlToJson(html: string): SerializedEditorState;

interface ImagePayload {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    caption?: string;
    key?: NodeKey;
}
type SerializedImageNode = Spread<{
    src: string;
    altText: string;
    width?: number;
    height?: number;
    caption?: string;
}, SerializedLexicalNode>;
declare class ImageNode extends DecoratorNode<ReactNode> {
    __src: string;
    __altText: string;
    __width: number | undefined;
    __height: number | undefined;
    __caption: string | undefined;
    static getType(): string;
    static clone(node: ImageNode): ImageNode;
    static importJSON(serializedNode: SerializedImageNode): ImageNode;
    static importDOM(): DOMConversionMap | null;
    constructor(src: string, altText: string, width?: number, height?: number, caption?: string, key?: NodeKey);
    exportJSON(): SerializedImageNode;
    exportDOM(): DOMExportOutput;
    createDOM(): HTMLElement;
    updateDOM(): false;
    getSrc(): string;
    getAltText(): string;
    setWidthAndHeight(width: number | undefined, height: number | undefined): void;
    decorate(): ReactNode;
    isInline(): boolean;
}
declare function $createImageNode(payload: ImagePayload): ImageNode;
declare function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode;

type SerializedHorizontalRuleNode = SerializedLexicalNode;
declare class HorizontalRuleNode extends DecoratorNode<ReactNode> {
    static getType(): string;
    static clone(node: HorizontalRuleNode): HorizontalRuleNode;
    static importJSON(): HorizontalRuleNode;
    static importDOM(): DOMConversionMap | null;
    constructor(key?: NodeKey);
    exportJSON(): SerializedHorizontalRuleNode;
    exportDOM(): DOMExportOutput;
    createDOM(): HTMLElement;
    updateDOM(): false;
    getTextContent(): string;
    isInline(): boolean;
    decorate(): ReactNode;
}
declare function $createHorizontalRuleNode(): HorizontalRuleNode;
declare function $isHorizontalRuleNode(node: LexicalNode | null | undefined): node is HorizontalRuleNode;

declare const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload>;

declare const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void>;

export { $createHorizontalRuleNode, $createImageNode, $isHorizontalRuleNode, $isImageNode, HorizontalRuleNode, INSERT_HORIZONTAL_RULE_COMMAND, INSERT_IMAGE_COMMAND, ImageNode, type ImagePayload, type SerializedImageNode, type ToolbarFeatures, TranceEditor, type TranceEditorProps, type TranceEditorRef, convertHtmlToJson, convertJsonToHtml, deserializeFromHtml, deserializeFromJson, serializeToHtml, serializeToJson };
