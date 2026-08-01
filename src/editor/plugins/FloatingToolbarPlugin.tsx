import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { createRectsFromDOMRange, $patchStyleText } from '@lexical/selection';
import { ToolbarButton, ToolbarSeparator } from '../toolbar/ToolbarButton';
import { TextColorPicker } from '../toolbar/TextColorPicker';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  HighlightIcon,
  LinkIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
} from '../toolbar/icons';
import { normalizeUrl } from '../utils/normalizeUrl';
import type { ToolbarFeatures } from '../toolbar/Toolbar';

interface FloatingToolbarPluginProps {
  features: ToolbarFeatures;
}

interface BarRect {
  top: number;
  left: number;
  flip: boolean;
}

/**
 * Floating formatting bar shown above a non-collapsed text selection —
 * bold/italic/underline/strikethrough/code/highlight/link, respecting the
 * same feature flags as the main toolbar.
 */
export function FloatingToolbarPlugin({
  features,
}: FloatingToolbarPluginProps): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [rect, setRect] = useState<BarRect | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [textColor, setTextColor] = useState<string | undefined>(undefined);

  const $updateBar = useCallback(() => {
    if (!editor.isEditable()) {
      setRect(null);
      return;
    }

    const selection = $getSelection();
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      setRect(null);
      return;
    }

    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));
    setIsCode(selection.hasFormat('code'));
    setIsHighlight(selection.hasFormat('highlight'));

    const node = selection.anchor.getNode();
    const parent = node.getParent();
    setIsLink($isLinkNode(parent) || $isLinkNode(node));

    // Current text color from the selection's node styles
    const nodes = selection.getNodes();
    let styleStr = '';
    for (const n of nodes) {
      if ('getStyle' in n && typeof (n as any).getStyle === 'function') {
        const s = (n as any).getStyle();
        if (s) {
          styleStr = s;
          break;
        }
      }
    }
    const colorMatch = styleStr.match(/color:\s*([^;]+)/);
    setTextColor(colorMatch ? colorMatch[1].trim() : undefined);

    // Position via the native DOM selection (the same approach as
    // lexical-playground's floating toolbar).
    const nativeSelection = window.getSelection();
    if (
      !nativeSelection ||
      nativeSelection.isCollapsed ||
      nativeSelection.rangeCount === 0
    ) {
      setRect(null);
      return;
    }
    const rects = createRectsFromDOMRange(
      editor,
      nativeSelection.getRangeAt(0),
    );
    if (rects.length === 0) {
      setRect(null);
      return;
    }
    const domRect = rects[0];

    // Center over the selection, clamped to the viewport. Renders above the
    // selection by default; flips BELOW it when there isn't room above (e.g.
    // selecting the first line would otherwise cover the main toolbar).
    const barWidth = 430;
    const barHeight = 40;
    const gap = 8;
    const rootElement = editor.getRootElement();
    const editorTop = rootElement
      ? rootElement.getBoundingClientRect().top
      : 0;
    const hasSpaceAbove = domRect.top - barHeight - gap >= editorTop;
    const left = Math.min(
      Math.max(domRect.left + domRect.width / 2, barWidth / 2),
      window.innerWidth - barWidth / 2,
    );
    setRect({
      top: hasSpaceAbove ? domRect.top : domRect.bottom,
      left,
      flip: !hasSpaceAbove,
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateBar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateBar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateBar();
      });
    });
  }, [editor, $updateBar]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        setRect(null);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;
    const handleBlur = () => setRect(null);
    rootElement.addEventListener('blur', handleBlur);
    return () => rootElement.removeEventListener('blur', handleBlur);
  }, [editor]);

  const handleTextColorChange = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (color) {
            $patchStyleText(selection, { color });
          } else {
            $patchStyleText(selection, { color: null });
          }
        }
      });
    },
    [editor],
  );

  const handleAlign = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'justify') => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
    },
    [editor],
  );

  if (features.floatingBar === false) {
    return null;
  }

  if (!rect) {
    return null;
  }

  return (
    <div
      className={`trance-floating-toolbar${rect.flip ? ' flip' : ''}`}
      style={{ top: rect.top, left: rect.left }}
      role="toolbar"
      aria-label="Formatting"
      // Keep the editor's selection alive while interacting with the bar
      onMouseDown={(event) => event.preventDefault()}
    >
      {features.bold !== false && (
        <ToolbarButton
          icon={<BoldIcon />}
          label="Bold"
          active={isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        />
      )}
      {features.italic !== false && (
        <ToolbarButton
          icon={<ItalicIcon />}
          label="Italic"
          active={isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        />
      )}
      {features.underline !== false && (
        <ToolbarButton
          icon={<UnderlineIcon />}
          label="Underline"
          active={isUnderline}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }
        />
      )}
      {features.strikethrough !== false && (
        <ToolbarButton
          icon={<StrikethroughIcon />}
          label="Strikethrough"
          active={isStrikethrough}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
          }
        />
      )}
      {features.code !== false && (
        <ToolbarButton
          icon={<CodeIcon />}
          label="Inline Code"
          active={isCode}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        />
      )}
      {features.highlight !== false && (
        <ToolbarButton
          icon={<HighlightIcon />}
          label="Highlight"
          active={isHighlight}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')
          }
        />
      )}
      {features.link !== false && (
        <>
          <ToolbarSeparator />
          <ToolbarButton
            icon={<LinkIcon />}
            label="Link"
            active={isLink}
            onClick={() => {
              if (isLink) {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              } else {
                const url = prompt('Enter URL:');
                if (url) {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, normalizeUrl(url));
                }
              }
            }}
          />
        </>
      )}
      {features.textColor !== false && (
        <>
          <ToolbarSeparator />
          <TextColorPicker
            currentColor={textColor}
            onColorChange={handleTextColorChange}
          />
        </>
      )}
      {features.textAlign !== false && (
        <>
          <ToolbarSeparator />
          <ToolbarButton
            icon={<AlignLeftIcon />}
            label="Align Left"
            onClick={() => handleAlign('left')}
          />
          <ToolbarButton
            icon={<AlignCenterIcon />}
            label="Align Center"
            onClick={() => handleAlign('center')}
          />
          <ToolbarButton
            icon={<AlignRightIcon />}
            label="Align Right"
            onClick={() => handleAlign('right')}
          />
          <ToolbarButton
            icon={<AlignJustifyIcon />}
            label="Justify"
            onClick={() => handleAlign('justify')}
          />
        </>
      )}
    </div>
  );
}
