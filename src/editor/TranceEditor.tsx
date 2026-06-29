import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $insertNodes,
  LexicalEditor,
  SerializedEditorState,
} from "lexical";

import { TRANCE_NODES } from "./nodes";
import { tranceLexicalTheme } from "../styles/lexical-theme";
import { Toolbar, ToolbarFeatures } from "./toolbar/Toolbar";
import { HtmlSerializationPlugin } from "./plugins/HtmlSerializationPlugin";
import { ImagesPlugin } from "./plugins/ImagesPlugin";
import { HorizontalRulePlugin } from "./plugins/HorizontalRulePlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";

// Import styles
import "../styles/variables.css";
import "../styles/editor.css";
import "../styles/toolbar.css";

export interface TranceEditorProps {
  /** Initialize from an HTML string */
  initialHtml?: string;
  /** Initialize from serialized Lexical JSON */
  initialJson?: SerializedEditorState;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Called when editor content changes (debounced) */
  onChange?: (data: { html: string; json: SerializedEditorState }) => void;
  /** Called when editor loses focus */
  onBlur?: () => void;
  /** Called when editor gains focus */
  onFocus?: () => void;
  /** Feature flags — all enabled by default */
  features?: ToolbarFeatures;
  /** Image upload handler. If not provided, images are base64 encoded. */
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
  /** Theme mode */
  theme?: "light" | "dark" | "auto";
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

export interface TranceEditorRef {
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
 * Inner editor component that has access to LexicalComposer context.
 */
function EditorInner({
  placeholder,
  onChange,
  onBlur,
  onFocus,
  features,
  onImageUpload,
  autoFocus,
  maxLength,
  debounceMs,
  editorRef,
}: TranceEditorProps & { editorRef?: React.Ref<TranceEditorRef> }) {
  const resolvedFeatures: ToolbarFeatures = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    code: true,
    link: true,
    orderedList: true,
    unorderedList: true,
    checkList: true,
    blockquote: true,
    codeBlock: true,
    image: true,
    table: true,
    horizontalRule: true,
    heading: true,
    textAlign: true,
    superscript: true,
    subscript: true,
    highlight: true,
    ...features,
  };

  return (
    <>
      <Toolbar features={resolvedFeatures} onImageUpload={onImageUpload} />
      <div className="trance-editor-content">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="trance-content-editable"
              aria-placeholder={placeholder || "Start writing..."}
              placeholder={
                <div className="trance-editor-placeholder">
                  {placeholder || "Start writing..."}
                </div>
              }
              onBlur={onBlur}
              onFocus={onFocus}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>

      {/* Core plugins */}
      <HistoryPlugin />
      {autoFocus && <AutoFocusPlugin />}
      <ListPlugin />
      <LinkPlugin />
      <CheckListPlugin />
      <TabIndentationPlugin />
      <TablePlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

      {/* Custom plugins */}
      <HtmlSerializationPlugin onChange={onChange} debounceMs={debounceMs} />
      <ImagesPlugin onImageUpload={onImageUpload} />
      <HorizontalRulePlugin />
      {maxLength !== undefined && <MaxLengthPlugin maxLength={maxLength} />}

      {/* Ref bridge */}
      {editorRef && <EditorRefPlugin editorRef={editorRef} />}
    </>
  );
}

/**
 * Internal plugin that exposes ref methods using the Lexical context.
 */
function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.Ref<TranceEditorRef>;
}) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(editorRef, () => ({
    getHtml: () => {
      let html = "";
      editor.read(() => {
        html = $generateHtmlFromNodes(editor, null);
      });
      return html;
    },
    getJson: () => {
      return editor.getEditorState().toJSON();
    },
    setHtml: (html: string) => {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
    },
    setJson: (json: SerializedEditorState) => {
      const editorState = editor.parseEditorState(json);
      editor.setEditorState(editorState);
    },
    focus: () => {
      editor.focus();
    },
    clear: () => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
      });
    },
    getLexicalEditor: () => editor,
  }));

  return null;
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
export const TranceEditor = forwardRef<TranceEditorRef, TranceEditorProps>(
  function TranceEditor(props, ref) {
    const {
      initialHtml,
      initialJson,
      theme = "light",
      className = "",
      editable = true,
      ...rest
    } = props;

    const initialConfig = {
      namespace: "TranceEditor",
      theme: tranceLexicalTheme,
      nodes: TRANCE_NODES,
      editable,
      onError: (error: Error) => {
        console.error("[TranceEditor]", error);
      },
      editorState: initialJson
        ? JSON.stringify(initialJson)
        : initialHtml
          ? (editor: LexicalEditor) => {
              editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(initialHtml, "text/html");
                const nodes = $generateNodesFromDOM(editor, dom);
                const root = $getRoot();
                root.select();
                $insertNodes(nodes);
              });
            }
          : undefined,
    };

    return (
      <div
        className={`trance-editor-wrapper ${className}`.trim()}
        data-trance-theme={theme}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <EditorInner {...rest} editorRef={ref} />
        </LexicalComposer>
      </div>
    );
  },
);
