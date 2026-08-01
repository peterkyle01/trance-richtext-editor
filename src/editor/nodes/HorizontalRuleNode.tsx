import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { ReactNode } from 'react';

export type SerializedHorizontalRuleNode = SerializedLexicalNode;

function $convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() };
}

export class HorizontalRuleNode extends DecoratorNode<ReactNode> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0,
      }),
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    // Semantic, unstyled output — the renderer styles <hr> via CSS custom
    // properties (hardcoded inline colors would break dark mode theming).
    return { element: document.createElement('hr') };
  }

  createDOM(): HTMLElement {
    const hr = document.createElement('hr');
    hr.className = 'trance-hr';
    return hr;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): boolean {
    return false;
  }

  decorate(): ReactNode {
    return null;
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return new HorizontalRuleNode();
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}
