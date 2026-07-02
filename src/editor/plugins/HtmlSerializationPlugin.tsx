import { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import type { EditorState, SerializedEditorState } from 'lexical';
import { stripTranceInternals } from '../../utils/stripTranceInternals';

interface HtmlSerializationPluginProps {
  onChange?: (data: { html: string; json: SerializedEditorState }) => void;
  debounceMs?: number;
}

/**
 * Plugin that watches editor state changes and fires onChange
 * with both HTML string and serialized JSON.
 */
export function HtmlSerializationPlugin({
  onChange,
  debounceMs = 300,
}: HtmlSerializationPluginProps): null {
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      if (!onChange) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        editorState.read(() => {
          const html = stripTranceInternals($generateHtmlFromNodes(editor, null));
          const json = editorState.toJSON();
          onChange({ html, json });
        });
      }, debounceMs);
    },
    [editor, onChange, debounceMs]
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      handleChange(editorState);
    });
  }, [editor, handleChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return null;
}
