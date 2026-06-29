import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND, ListNode } from '@lexical/list';
import { $isCodeNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import { $setBlocksType } from '@lexical/selection';
import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { $createParagraphNode } from 'lexical';
import { INSERT_TABLE_COMMAND } from '@lexical/table';

import { ToolbarButton, ToolbarSeparator } from './ToolbarButton';
import { BlockTypeDropdown } from './BlockTypeDropdown';
import {
  BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
  CodeIcon, LinkIcon, ImageIcon, TableIcon,
  HorizontalRuleIcon, ListBulletIcon, ListNumberedIcon,
  ListCheckIcon, AlignLeftIcon, AlignCenterIcon,
  AlignRightIcon, AlignJustifyIcon, UndoIcon, RedoIcon,
  HighlightIcon, SuperscriptIcon, SubscriptIcon,
} from './icons';
import { INSERT_IMAGE_COMMAND } from '../plugins/ImagesPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../plugins/HorizontalRulePlugin';

export interface ToolbarFeatures {
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

interface ToolbarProps {
  features: ToolbarFeatures;
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
}

/**
 * Main editor toolbar with formatting controls, block type selector,
 * insert actions, alignment, and undo/redo.
 */
export function Toolbar({ features, onImageUpload }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  // Text format states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isLink, setIsLink] = useState(false);

  // Block type
  const [blockType, setBlockType] = useState('paragraph');

  // History
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsHighlight(selection.hasFormat('highlight'));

      // Check block type
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementDOM = activeEditor.getElementByKey(element.getKey());

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
        const type = parentList ? parentList.getListType() : element.getListType();
        if (type === 'bullet') setBlockType('bullet');
        else if (type === 'number') setBlockType('number');
        else if (type === 'check') setBlockType('check');
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : $isCodeNode(element)
            ? 'code'
            : $isQuoteNode(element)
              ? 'quote'
              : 'paragraph';
        setBlockType(type);
      }

      // Check link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateToolbar();
      });
    });
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  // Block type change handler
  const handleBlockTypeChange = useCallback(
    (type: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        if (type === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode());
        } else if (type.match(/^h[1-6]$/)) {
          $setBlocksType(selection, () =>
            $createHeadingNode(type as HeadingTagType)
          );
        } else if (type === 'quote') {
          $setBlocksType(selection, () => $createQuoteNode());
        } else if (type === 'code') {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    },
    [editor]
  );

  const handleImageInsert = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        let url: string;
        let alt: string = file.name;

        if (onImageUpload) {
          const result = await onImageUpload(file);
          url = result.url;
          alt = result.alt || file.name;
        } else {
          url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: url,
          altText: alt,
        });
      } catch (err) {
        console.error('Image insert failed:', err);
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const handleLinkToggle = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt('Enter URL:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  }, [editor, isLink]);

  const handleTableInsert = useCallback(() => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: true,
    });
  }, [editor]);

  return (
    <div className="trance-toolbar" role="toolbar" aria-label="Text formatting">
      {/* Undo / Redo */}
      <ToolbarButton
        icon={<UndoIcon />}
        label="Undo"
        shortcut="⌘Z"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      />
      <ToolbarButton
        icon={<RedoIcon />}
        label="Redo"
        shortcut="⌘⇧Z"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      />

      <ToolbarSeparator />

      {/* Block Type */}
      {features.heading !== false && (
        <BlockTypeDropdown
          currentBlockType={blockType}
          onSelect={handleBlockTypeChange}
        />
      )}

      <ToolbarSeparator />

      {/* Text Formatting */}
      {features.bold !== false && (
        <ToolbarButton
          icon={<BoldIcon />}
          label="Bold"
          shortcut="⌘B"
          active={isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        />
      )}
      {features.italic !== false && (
        <ToolbarButton
          icon={<ItalicIcon />}
          label="Italic"
          shortcut="⌘I"
          active={isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        />
      )}
      {features.underline !== false && (
        <ToolbarButton
          icon={<UnderlineIcon />}
          label="Underline"
          shortcut="⌘U"
          active={isUnderline}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        />
      )}
      {features.strikethrough !== false && (
        <ToolbarButton
          icon={<StrikethroughIcon />}
          label="Strikethrough"
          active={isStrikethrough}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
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
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
        />
      )}
      {features.superscript !== false && (
        <ToolbarButton
          icon={<SuperscriptIcon />}
          label="Superscript"
          active={isSuperscript}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
        />
      )}
      {features.subscript !== false && (
        <ToolbarButton
          icon={<SubscriptIcon />}
          label="Subscript"
          active={isSubscript}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
        />
      )}

      <ToolbarSeparator />

      {/* Lists */}
      {features.unorderedList !== false && (
        <ToolbarButton
          icon={<ListBulletIcon />}
          label="Bullet List"
          active={blockType === 'bullet'}
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        />
      )}
      {features.orderedList !== false && (
        <ToolbarButton
          icon={<ListNumberedIcon />}
          label="Numbered List"
          active={blockType === 'number'}
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        />
      )}
      {features.checkList !== false && (
        <ToolbarButton
          icon={<ListCheckIcon />}
          label="Check List"
          active={blockType === 'check'}
          onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
        />
      )}

      <ToolbarSeparator />

      {/* Insert Actions */}
      {features.link !== false && (
        <ToolbarButton
          icon={<LinkIcon />}
          label="Link"
          shortcut="⌘K"
          active={isLink}
          onClick={handleLinkToggle}
        />
      )}
      {features.image !== false && (
        <ToolbarButton
          icon={<ImageIcon />}
          label="Insert Image"
          onClick={handleImageInsert}
        />
      )}
      {features.table !== false && (
        <ToolbarButton
          icon={<TableIcon />}
          label="Insert Table"
          onClick={handleTableInsert}
        />
      )}
      {features.horizontalRule !== false && (
        <ToolbarButton
          icon={<HorizontalRuleIcon />}
          label="Horizontal Rule"
          onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
        />
      )}

      <ToolbarSeparator />

      {/* Alignment */}
      {features.textAlign !== false && (
        <>
          <ToolbarButton
            icon={<AlignLeftIcon />}
            label="Align Left"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          />
          <ToolbarButton
            icon={<AlignCenterIcon />}
            label="Align Center"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
          />
          <ToolbarButton
            icon={<AlignRightIcon />}
            label="Align Right"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
          />
          <ToolbarButton
            icon={<AlignJustifyIcon />}
            label="Justify"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
          />
        </>
      )}
    </div>
  );
}
