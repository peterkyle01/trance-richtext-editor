import type { Klass, LexicalNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ImageNode } from './ImageNode';
import { HorizontalRuleNode } from './HorizontalRuleNode';

/**
 * All Lexical nodes registered by trance-richtext-editor.
 * Pass this to LexicalComposer's `nodes` config.
 */
export const TRANCE_NODES: Array<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  ImageNode,
  HorizontalRuleNode,
];

export { ImageNode, $createImageNode, $isImageNode } from './ImageNode';
export type { ImagePayload, SerializedImageNode } from './ImageNode';
export {
  HorizontalRuleNode,
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from './HorizontalRuleNode';
