import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, TextNode } from 'lexical';

interface MaxLengthPluginProps {
  maxLength: number;
}

/**
 * Plugin that enforces a character limit on the editor content.
 */
export function MaxLengthPlugin({ maxLength }: MaxLengthPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Enforce the limit on text nodes — trims the excess from the tail of
    // the current text node as the user types.
    return editor.registerNodeTransform(TextNode, (textNode) => {
      const root = $getRoot();
      const totalLength = root.getTextContent().length;
      
      if (totalLength > maxLength) {
        const excess = totalLength - maxLength;
        const currentText = textNode.getTextContent();
        if (currentText.length > excess) {
          textNode.setTextContent(currentText.slice(0, currentText.length - excess));
        }
      }
    });
  }, [editor, maxLength]);

  return null;
}
