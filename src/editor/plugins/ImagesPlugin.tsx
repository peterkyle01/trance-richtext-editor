import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { $createImageNode, ImagePayload } from '../nodes/ImageNode';
import { $insertNodes } from 'lexical';

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

interface ImagesPluginProps {
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
}

/**
 * Plugin for inserting images into the editor.
 * Supports drag-and-drop and programmatic insertion via INSERT_IMAGE_COMMAND.
 */
export function ImagesPlugin({ onImageUpload }: ImagesPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload);
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleDrop = async (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith('image/')) return;

      event.preventDefault();
      event.stopPropagation();

      try {
        let url: string;
        let alt: string = file.name;

        if (onImageUpload) {
          const result = await onImageUpload(file);
          url = result.url;
          alt = result.alt || file.name;
        } else {
          // Fallback: convert to base64
          url = await fileToBase64(file);
        }

        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: url,
          altText: alt,
        });
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      const files = event.dataTransfer?.types;
      if (files?.includes('Files')) {
        event.preventDefault();
      }
    };

    rootElement.addEventListener('drop', handleDrop);
    rootElement.addEventListener('dragover', handleDragOver);

    return () => {
      rootElement.removeEventListener('drop', handleDrop);
      rootElement.removeEventListener('dragover', handleDragOver);
    };
  }, [editor, onImageUpload]);

  return null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
