import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $getSelection, $isRangeSelection, TextNode, RootNode } from 'lexical';

interface MaxLengthPluginProps {
  maxLength: number;
}

/**
 * Plugin that enforces a character limit on the editor content.
 */
export function MaxLengthPlugin({ maxLength }: MaxLengthPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
      const text = rootNode.getTextContent();
      if (text.length <= maxLength) return;

      // Trim the excess content
      editor.update(() => {
        const trimmedText = text.slice(0, maxLength);
        const root = $getRoot();
        const allTextContent = root.getTextContent();
        
        if (allTextContent.length > maxLength) {
          // Simple approach: prevent the update by reverting
          // In practice, we prevent typing beyond the limit
        }
      });
    });
  }, [editor, maxLength]);

  useEffect(() => {
    // Register text node transform to prevent exceeding max length
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
