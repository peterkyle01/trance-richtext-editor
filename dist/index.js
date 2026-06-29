import { forwardRef, useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { $generateNodesFromDOM, $generateHtmlFromNodes } from '@lexical/html';
import { createCommand, $getRoot, $insertNodes, DecoratorNode, $getSelection, $isRangeSelection, $isRootOrShadowRoot, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL, CAN_UNDO_COMMAND, CAN_REDO_COMMAND, $createParagraphNode, UNDO_COMMAND, REDO_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, COMMAND_PRIORITY_EDITOR, RootNode, TextNode, COMMAND_PRIORITY_LOW, createEditor } from 'lexical';
import { HeadingNode, QuoteNode, $isHeadingNode, $isQuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, $isListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from '@lexical/list';
import { LinkNode, AutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { CodeNode, CodeHighlightNode, $isCodeNode, $createCodeNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode, INSERT_TABLE_COMMAND } from '@lexical/table';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import { $setBlocksType } from '@lexical/selection';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';

// src/editor/TranceEditor.tsx
function $convertImageElement(domNode) {
  const element = domNode;
  if (element.tagName === "IMG") {
    const img = element;
    const node = $createImageNode({
      src: img.src,
      altText: img.alt || "",
      width: img.width || void 0,
      height: img.height || void 0
    });
    return { node };
  }
  if (element.tagName === "FIGURE") {
    const img = element.querySelector("img");
    const figcaption = element.querySelector("figcaption");
    if (img) {
      const node = $createImageNode({
        src: img.src,
        altText: img.alt || "",
        width: img.width || void 0,
        height: img.height || void 0,
        caption: figcaption?.textContent || void 0
      });
      return { node };
    }
  }
  return null;
}
var ImageNode = class _ImageNode extends DecoratorNode {
  static getType() {
    return "image";
  }
  static clone(node) {
    return new _ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__key
    );
  }
  static importJSON(serializedNode) {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption
    });
  }
  static importDOM() {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0
      }),
      figure: () => ({
        conversion: $convertImageElement,
        priority: 0
      })
    };
  }
  constructor(src, altText, width, height, caption, key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
  }
  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption
    };
  }
  exportDOM() {
    const figure = document.createElement("figure");
    figure.style.margin = "0";
    const img = document.createElement("img");
    img.setAttribute("src", this.__src);
    img.setAttribute("alt", this.__altText);
    if (this.__width) {
      img.setAttribute("width", String(this.__width));
    }
    if (this.__height) {
      img.setAttribute("height", String(this.__height));
    }
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    figure.appendChild(img);
    if (this.__caption) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = this.__caption;
      figcaption.style.textAlign = "center";
      figcaption.style.fontSize = "0.875rem";
      figcaption.style.color = "#6b7280";
      figcaption.style.marginTop = "4px";
      figcaption.style.fontStyle = "italic";
      figure.appendChild(figcaption);
    }
    return { element: figure };
  }
  createDOM() {
    const div = document.createElement("div");
    div.className = "trance-image-wrapper";
    return div;
  }
  updateDOM() {
    return false;
  }
  getSrc() {
    return this.__src;
  }
  getAltText() {
    return this.__altText;
  }
  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  decorate() {
    return null;
  }
  isInline() {
    return false;
  }
};
function $createImageNode(payload) {
  return new ImageNode(
    payload.src,
    payload.altText,
    payload.width,
    payload.height,
    payload.caption,
    payload.key
  );
}
function $isImageNode(node) {
  return node instanceof ImageNode;
}
function $convertHorizontalRuleElement() {
  return { node: $createHorizontalRuleNode() };
}
var HorizontalRuleNode = class _HorizontalRuleNode extends DecoratorNode {
  static getType() {
    return "horizontalrule";
  }
  static clone(node) {
    return new _HorizontalRuleNode(node.__key);
  }
  static importJSON() {
    return $createHorizontalRuleNode();
  }
  static importDOM() {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0
      })
    };
  }
  constructor(key) {
    super(key);
  }
  exportJSON() {
    return {
      type: "horizontalrule",
      version: 1
    };
  }
  exportDOM() {
    const hr = document.createElement("hr");
    hr.style.border = "none";
    hr.style.height = "2px";
    hr.style.background = "linear-gradient(90deg, transparent, #d1d5db, transparent)";
    hr.style.margin = "24px 0";
    return { element: hr };
  }
  createDOM() {
    const hr = document.createElement("hr");
    hr.className = "trance-hr";
    return hr;
  }
  updateDOM() {
    return false;
  }
  getTextContent() {
    return "\n";
  }
  isInline() {
    return false;
  }
  decorate() {
    return null;
  }
};
function $createHorizontalRuleNode() {
  return new HorizontalRuleNode();
}
function $isHorizontalRuleNode(node) {
  return node instanceof HorizontalRuleNode;
}

// src/editor/nodes/index.ts
var TRANCE_NODES = [
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
  HorizontalRuleNode
];

// src/styles/lexical-theme.ts
var tranceLexicalTheme = {
  paragraph: "trance-paragraph",
  heading: {
    h1: "trance-h1",
    h2: "trance-h2",
    h3: "trance-h3",
    h4: "trance-h4",
    h5: "trance-h5",
    h6: "trance-h6"
  },
  text: {
    bold: "trance-bold",
    italic: "trance-italic",
    underline: "trance-underline",
    strikethrough: "trance-strikethrough",
    underlineStrikethrough: "trance-underline trance-strikethrough",
    code: "trance-inline-code",
    highlight: "trance-highlight",
    subscript: "trance-subscript",
    superscript: "trance-superscript"
  },
  list: {
    ul: "trance-ul",
    ol: "trance-ol",
    listitem: "trance-li",
    listitemChecked: "trance-li-checked",
    listitemUnchecked: "trance-li-unchecked",
    nested: {
      listitem: "trance-li-nested"
    }
  },
  link: "trance-link",
  quote: "trance-quote",
  code: "trance-code-block",
  codeHighlight: {
    atrule: "trance-token-atrule",
    attr: "trance-token-attr",
    boolean: "trance-token-boolean",
    builtin: "trance-token-builtin",
    cdata: "trance-token-cdata",
    char: "trance-token-char",
    class: "trance-token-class",
    "class-name": "trance-token-class-name",
    comment: "trance-token-comment",
    constant: "trance-token-constant",
    deleted: "trance-token-deleted",
    doctype: "trance-token-doctype",
    entity: "trance-token-entity",
    function: "trance-token-function",
    important: "trance-token-important",
    inserted: "trance-token-inserted",
    keyword: "trance-token-keyword",
    namespace: "trance-token-namespace",
    number: "trance-token-number",
    operator: "trance-token-operator",
    prolog: "trance-token-prolog",
    property: "trance-token-property",
    punctuation: "trance-token-punctuation",
    regex: "trance-token-regex",
    selector: "trance-token-selector",
    string: "trance-token-string",
    symbol: "trance-token-symbol",
    tag: "trance-token-tag",
    url: "trance-token-url",
    variable: "trance-token-variable"
  },
  table: "trance-table",
  tableCell: "trance-table-cell",
  tableCellHeader: "trance-table-cell-header",
  tableRow: "trance-table-row",
  tableRowStriped: "trance-table-row-striped",
  horizontalRule: "trance-hr",
  image: "trance-image-wrapper",
  indent: "trance-indent",
  ltr: "trance-text-left",
  rtl: "trance-text-right"
};
function ToolbarButton({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
  shortcut
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: `trance-toolbar-btn${active ? " active" : ""}`,
      disabled,
      onClick,
      "aria-label": label,
      title: shortcut ? `${label} (${shortcut})` : label,
      children: [
        icon,
        /* @__PURE__ */ jsxs("span", { className: "trance-tooltip", children: [
          label,
          shortcut && /* @__PURE__ */ jsx("span", { style: { opacity: 0.7, marginLeft: 4 }, children: shortcut })
        ] })
      ]
    }
  );
}
function ToolbarSeparator() {
  return /* @__PURE__ */ jsx("div", { className: "trance-toolbar-separator", "aria-hidden": "true" });
}
var BoldIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" }),
  /* @__PURE__ */ jsx("path", { d: "M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" })
] });
var ItalicIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "19", y1: "4", x2: "10", y2: "4" }),
  /* @__PURE__ */ jsx("line", { x1: "14", y1: "20", x2: "5", y2: "20" }),
  /* @__PURE__ */ jsx("line", { x1: "15", y1: "4", x2: "9", y2: "20" })
] });
var UnderlineIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" }),
  /* @__PURE__ */ jsx("line", { x1: "4", y1: "21", x2: "20", y2: "21" })
] });
var StrikethroughIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M16 4H9a3 3 0 0 0-3 3c0 2 1.5 3 3 3" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12h3c2 0 3 1 3 3a3 3 0 0 1-3 3H8" }),
  /* @__PURE__ */ jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" })
] });
var CodeIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("polyline", { points: "16 18 22 12 16 6" }),
  /* @__PURE__ */ jsx("polyline", { points: "8 6 2 12 8 18" })
] });
var LinkIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
  /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
] });
var ImageIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
  /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
] });
var TableIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "15", x2: "21", y2: "15" }),
  /* @__PURE__ */ jsx("line", { x1: "9", y1: "3", x2: "9", y2: "21" }),
  /* @__PURE__ */ jsx("line", { x1: "15", y1: "3", x2: "15", y2: "21" })
] });
var HorizontalRuleIcon = () => /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }) });
var ListBulletIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
  /* @__PURE__ */ jsx("circle", { cx: "4", cy: "6", r: "1", fill: "currentColor" }),
  /* @__PURE__ */ jsx("circle", { cx: "4", cy: "12", r: "1", fill: "currentColor" }),
  /* @__PURE__ */ jsx("circle", { cx: "4", cy: "18", r: "1", fill: "currentColor" })
] });
var ListNumberedIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "10", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "10", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "10", y1: "18", x2: "21", y2: "18" }),
  /* @__PURE__ */ jsx("text", { x: "2", y: "8", fontSize: "8", fill: "currentColor", stroke: "none", fontFamily: "sans-serif", children: "1" }),
  /* @__PURE__ */ jsx("text", { x: "2", y: "14", fontSize: "8", fill: "currentColor", stroke: "none", fontFamily: "sans-serif", children: "2" }),
  /* @__PURE__ */ jsx("text", { x: "2", y: "20", fontSize: "8", fill: "currentColor", stroke: "none", fontFamily: "sans-serif", children: "3" })
] });
var ListCheckIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "5", width: "6", height: "6", rx: "1" }),
  /* @__PURE__ */ jsx("path", { d: "M4.5 8l1.5 1.5 3-3" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "21", y2: "8" }),
  /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "6", height: "6", rx: "1" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "21", y2: "17" })
] });
var AlignLeftIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "15", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "18", y2: "18" })
] });
var AlignCenterIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "6", y1: "12", x2: "18", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "4", y1: "18", x2: "20", y2: "18" })
] });
var AlignRightIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "9", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "6", y1: "18", x2: "21", y2: "18" })
] });
var AlignJustifyIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
] });
var UndoIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("polyline", { points: "1 4 1 10 7 10" }),
  /* @__PURE__ */ jsx("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })
] });
var RedoIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("polyline", { points: "23 4 23 10 17 10" }),
  /* @__PURE__ */ jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
] });
var HeadingIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M6 4v16" }),
  /* @__PURE__ */ jsx("path", { d: "M18 4v16" }),
  /* @__PURE__ */ jsx("path", { d: "M6 12h12" })
] });
var QuoteIcon = () => /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.174 11 15a3 3 0 0 1-3 3c-1.292 0-2.478-.617-3.417-1.679zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.174 21 15a3 3 0 0 1-3 3c-1.292 0-2.478-.617-3.417-1.679z" }) });
var CodeBlockIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx("polyline", { points: "8 8 5 12 8 16" }),
  /* @__PURE__ */ jsx("polyline", { points: "16 8 19 12 16 16" }),
  /* @__PURE__ */ jsx("line", { x1: "13", y1: "7", x2: "11", y2: "17" })
] });
var SuperscriptIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: [
  /* @__PURE__ */ jsx("path", { d: "M5 7l6 8.5L5 24h3l4.5-6.3L17 24h3l-6-8.5L20 7h-3l-4.5 6.3L8 7H5z", transform: "scale(0.7) translate(2, 4)" }),
  /* @__PURE__ */ jsx("text", { x: "16", y: "10", fontSize: "10", fontWeight: "bold", fontFamily: "sans-serif", children: "2" })
] });
var SubscriptIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: [
  /* @__PURE__ */ jsx("path", { d: "M5 3l6 8.5L5 20h3l4.5-6.3L17 20h3l-6-8.5L20 3h-3l-4.5 6.3L8 3H5z", transform: "scale(0.7) translate(2, 0)" }),
  /* @__PURE__ */ jsx("text", { x: "16", y: "22", fontSize: "10", fontWeight: "bold", fontFamily: "sans-serif", children: "2" })
] });
var HighlightIcon = () => /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M12 20h9" }),
  /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" })
] });
var ChevronDownIcon = () => /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "chevron", children: /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" }) });
var BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph", icon: null },
  { value: "h1", label: "Heading 1", icon: /* @__PURE__ */ jsx(HeadingIcon, {}) },
  { value: "h2", label: "Heading 2", icon: /* @__PURE__ */ jsx(HeadingIcon, {}) },
  { value: "h3", label: "Heading 3", icon: /* @__PURE__ */ jsx(HeadingIcon, {}) },
  { value: "h4", label: "Heading 4", icon: /* @__PURE__ */ jsx(HeadingIcon, {}) },
  { value: "h5", label: "Heading 5", icon: /* @__PURE__ */ jsx(HeadingIcon, {}) },
  { value: "h6", label: "Heading 6", icon: /* @__PURE__ */ jsx(HeadingIcon, {}) },
  { value: "quote", label: "Blockquote", icon: /* @__PURE__ */ jsx(QuoteIcon, {}) },
  { value: "code", label: "Code Block", icon: /* @__PURE__ */ jsx(CodeBlockIcon, {}) }
];
function BlockTypeDropdown({
  currentBlockType,
  onSelect
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLabel = BLOCK_TYPES.find((bt) => bt.value === currentBlockType)?.label || "Paragraph";
  const handleSelect = useCallback(
    (value) => {
      onSelect(value);
      setIsOpen(false);
    },
    [onSelect]
  );
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);
  return /* @__PURE__ */ jsxs("div", { className: "trance-block-dropdown-wrapper", ref: dropdownRef, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "trance-block-dropdown-trigger",
        onClick: () => setIsOpen(!isOpen),
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        "aria-label": "Select block type",
        children: [
          currentLabel,
          /* @__PURE__ */ jsx(ChevronDownIcon, {})
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "trance-block-dropdown-menu", role: "listbox", children: BLOCK_TYPES.map(({ value, label, icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        role: "option",
        className: `trance-block-dropdown-item${value === currentBlockType ? " active" : ""}`,
        "aria-selected": value === currentBlockType,
        onClick: () => handleSelect(value),
        children: [
          icon,
          label
        ]
      },
      value
    )) })
  ] });
}
var INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");
function ImagesPlugin({ onImageUpload }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
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
    const handleDrop = async (event) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) return;
      event.preventDefault();
      event.stopPropagation();
      try {
        let url;
        let alt = file.name;
        if (onImageUpload) {
          const result = await onImageUpload(file);
          url = result.url;
          alt = result.alt || file.name;
        } else {
          url = await fileToBase64(file);
        }
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: url,
          altText: alt
        });
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    };
    const handleDragOver = (event) => {
      const files = event.dataTransfer?.types;
      if (files?.includes("Files")) {
        event.preventDefault();
      }
    };
    rootElement.addEventListener("drop", handleDrop);
    rootElement.addEventListener("dragover", handleDragOver);
    return () => {
      rootElement.removeEventListener("drop", handleDrop);
      rootElement.removeEventListener("dragover", handleDragOver);
    };
  }, [editor, onImageUpload]);
  return null;
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
var INSERT_HORIZONTAL_RULE_COMMAND = createCommand("INSERT_HORIZONTAL_RULE_COMMAND");
function HorizontalRulePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const hrNode = $createHorizontalRuleNode();
          $insertNodes([hrNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}
function Toolbar({ features, onImageUpload }) {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsHighlight(selection.hasFormat("highlight"));
      const anchorNode = selection.anchor.getNode();
      let element = anchorNode.getKey() === "root" ? anchorNode : $findMatchingParent(anchorNode, (e) => {
        const parent2 = e.getParent();
        return parent2 !== null && $isRootOrShadowRoot(parent2);
      });
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      activeEditor.getElementByKey(element.getKey());
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        const type = parentList ? parentList.getListType() : element.getListType();
        if (type === "bullet") setBlockType("bullet");
        else if (type === "number") setBlockType("number");
        else if (type === "check") setBlockType("check");
      } else {
        const type = $isHeadingNode(element) ? element.getTag() : $isCodeNode(element) ? "code" : $isQuoteNode(element) ? "quote" : "paragraph";
        setBlockType(type);
      }
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
  const handleBlockTypeChange = useCallback(
    (type) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        if (type === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else if (type.match(/^h[1-6]$/)) {
          $setBlocksType(
            selection,
            () => $createHeadingNode(type)
          );
        } else if (type === "quote") {
          $setBlocksType(selection, () => $createQuoteNode());
        } else if (type === "code") {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    },
    [editor]
  );
  const handleImageInsert = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        let url;
        let alt = file.name;
        if (onImageUpload) {
          const result = await onImageUpload(file);
          url = result.url;
          alt = result.alt || file.name;
        } else {
          url = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: url,
          altText: alt
        });
      } catch (err) {
        console.error("Image insert failed:", err);
      }
    };
    input.click();
  }, [editor, onImageUpload]);
  const handleLinkToggle = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt("Enter URL:");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  }, [editor, isLink]);
  const handleTableInsert = useCallback(() => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: "3",
      columns: "3",
      includeHeaders: true
    });
  }, [editor]);
  return /* @__PURE__ */ jsxs("div", { className: "trance-toolbar", role: "toolbar", "aria-label": "Text formatting", children: [
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(UndoIcon, {}),
        label: "Undo",
        shortcut: "\u2318Z",
        disabled: !canUndo,
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, void 0)
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(RedoIcon, {}),
        label: "Redo",
        shortcut: "\u2318\u21E7Z",
        disabled: !canRedo,
        onClick: () => editor.dispatchCommand(REDO_COMMAND, void 0)
      }
    ),
    /* @__PURE__ */ jsx(ToolbarSeparator, {}),
    features.heading !== false && /* @__PURE__ */ jsx(
      BlockTypeDropdown,
      {
        currentBlockType: blockType,
        onSelect: handleBlockTypeChange
      }
    ),
    /* @__PURE__ */ jsx(ToolbarSeparator, {}),
    features.bold !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(BoldIcon, {}),
        label: "Bold",
        shortcut: "\u2318B",
        active: isBold,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
      }
    ),
    features.italic !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(ItalicIcon, {}),
        label: "Italic",
        shortcut: "\u2318I",
        active: isItalic,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
      }
    ),
    features.underline !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(UnderlineIcon, {}),
        label: "Underline",
        shortcut: "\u2318U",
        active: isUnderline,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
      }
    ),
    features.strikethrough !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(StrikethroughIcon, {}),
        label: "Strikethrough",
        active: isStrikethrough,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
      }
    ),
    features.code !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(CodeIcon, {}),
        label: "Inline Code",
        active: isCode,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
      }
    ),
    features.highlight !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(HighlightIcon, {}),
        label: "Highlight",
        active: isHighlight,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight")
      }
    ),
    features.superscript !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(SuperscriptIcon, {}),
        label: "Superscript",
        active: isSuperscript,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
      }
    ),
    features.subscript !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(SubscriptIcon, {}),
        label: "Subscript",
        active: isSubscript,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
      }
    ),
    /* @__PURE__ */ jsx(ToolbarSeparator, {}),
    features.unorderedList !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(ListBulletIcon, {}),
        label: "Bullet List",
        active: blockType === "bullet",
        onClick: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0)
      }
    ),
    features.orderedList !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(ListNumberedIcon, {}),
        label: "Numbered List",
        active: blockType === "number",
        onClick: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0)
      }
    ),
    features.checkList !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(ListCheckIcon, {}),
        label: "Check List",
        active: blockType === "check",
        onClick: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0)
      }
    ),
    /* @__PURE__ */ jsx(ToolbarSeparator, {}),
    features.link !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(LinkIcon, {}),
        label: "Link",
        shortcut: "\u2318K",
        active: isLink,
        onClick: handleLinkToggle
      }
    ),
    features.image !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(ImageIcon, {}),
        label: "Insert Image",
        onClick: handleImageInsert
      }
    ),
    features.table !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(TableIcon, {}),
        label: "Insert Table",
        onClick: handleTableInsert
      }
    ),
    features.horizontalRule !== false && /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: /* @__PURE__ */ jsx(HorizontalRuleIcon, {}),
        label: "Horizontal Rule",
        onClick: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0)
      }
    ),
    /* @__PURE__ */ jsx(ToolbarSeparator, {}),
    features.textAlign !== false && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        ToolbarButton,
        {
          icon: /* @__PURE__ */ jsx(AlignLeftIcon, {}),
          label: "Align Left",
          onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
        }
      ),
      /* @__PURE__ */ jsx(
        ToolbarButton,
        {
          icon: /* @__PURE__ */ jsx(AlignCenterIcon, {}),
          label: "Align Center",
          onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
        }
      ),
      /* @__PURE__ */ jsx(
        ToolbarButton,
        {
          icon: /* @__PURE__ */ jsx(AlignRightIcon, {}),
          label: "Align Right",
          onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
        }
      ),
      /* @__PURE__ */ jsx(
        ToolbarButton,
        {
          icon: /* @__PURE__ */ jsx(AlignJustifyIcon, {}),
          label: "Justify",
          onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
      )
    ] })
  ] });
}
function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const updateFloatingToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      setIsVisible(false);
      return;
    }
    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));
    setIsCode(selection.hasFormat("code"));
    setIsHighlight(selection.hasFormat("highlight"));
    const nativeSelection = window.getSelection();
    if (!nativeSelection || nativeSelection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }
    const range = nativeSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setIsVisible(false);
      return;
    }
    const toolbarWidth = 280;
    const toolbarHeight = 40;
    setPosition({
      top: rect.top - toolbarHeight - 8 + window.scrollY,
      left: Math.max(
        8,
        Math.min(
          rect.left + rect.width / 2 - toolbarWidth / 2 + window.scrollX,
          window.innerWidth - toolbarWidth - 8
        )
      )
    });
    setIsVisible(true);
  }, []);
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFloatingToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, updateFloatingToolbar]);
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateFloatingToolbar();
      });
    });
  }, [editor, updateFloatingToolbar]);
  useEffect(() => {
    const handleScroll = () => setIsVisible(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);
  if (!isVisible) return null;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: toolbarRef,
        className: "trance-floating-toolbar",
        style: {
          position: "absolute",
          top: position.top,
          left: position.left
        },
        onMouseDown: (e) => e.preventDefault(),
        children: [
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(BoldIcon, {}),
              label: "Bold",
              active: isBold,
              onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(ItalicIcon, {}),
              label: "Italic",
              active: isItalic,
              onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(UnderlineIcon, {}),
              label: "Underline",
              active: isUnderline,
              onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(StrikethroughIcon, {}),
              label: "Strikethrough",
              active: isStrikethrough,
              onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(CodeIcon, {}),
              label: "Code",
              active: isCode,
              onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(HighlightIcon, {}),
              label: "Highlight",
              active: isHighlight,
              onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight")
            }
          ),
          /* @__PURE__ */ jsx(
            ToolbarButton,
            {
              icon: /* @__PURE__ */ jsx(LinkIcon, {}),
              label: "Link",
              onClick: () => {
                const url = prompt("Enter URL:");
                if (url) {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
              }
            }
          )
        ]
      }
    ),
    document.body
  );
}
function HtmlSerializationPlugin({
  onChange,
  debounceMs = 300
}) {
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef(null);
  const handleChange = useCallback(
    (editorState) => {
      if (!onChange) return;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor, null);
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
function MaxLengthPlugin({ maxLength }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerNodeTransform(RootNode, (rootNode) => {
      const text = rootNode.getTextContent();
      if (text.length <= maxLength) return;
      editor.update(() => {
        text.slice(0, maxLength);
        const root = $getRoot();
        const allTextContent = root.getTextContent();
        if (allTextContent.length > maxLength) ;
      });
    });
  }, [editor, maxLength]);
  useEffect(() => {
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
  editorRef
}) {
  const resolvedFeatures = {
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
    ...features
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Toolbar, { features: resolvedFeatures, onImageUpload }),
    /* @__PURE__ */ jsx("div", { className: "trance-editor-content", children: /* @__PURE__ */ jsx(
      RichTextPlugin,
      {
        contentEditable: /* @__PURE__ */ jsx(
          ContentEditable,
          {
            className: "trance-content-editable",
            "aria-placeholder": placeholder || "Start writing...",
            placeholder: /* @__PURE__ */ jsx("div", { className: "trance-editor-placeholder", children: placeholder || "Start writing..." }),
            onBlur,
            onFocus
          }
        ),
        ErrorBoundary: LexicalErrorBoundary
      }
    ) }),
    /* @__PURE__ */ jsx(HistoryPlugin, {}),
    autoFocus && /* @__PURE__ */ jsx(AutoFocusPlugin, {}),
    /* @__PURE__ */ jsx(ListPlugin, {}),
    /* @__PURE__ */ jsx(LinkPlugin, {}),
    /* @__PURE__ */ jsx(CheckListPlugin, {}),
    /* @__PURE__ */ jsx(TabIndentationPlugin, {}),
    /* @__PURE__ */ jsx(TablePlugin, {}),
    /* @__PURE__ */ jsx(MarkdownShortcutPlugin, { transformers: TRANSFORMERS }),
    /* @__PURE__ */ jsx(HtmlSerializationPlugin, { onChange, debounceMs }),
    /* @__PURE__ */ jsx(ImagesPlugin, { onImageUpload }),
    /* @__PURE__ */ jsx(HorizontalRulePlugin, {}),
    maxLength !== void 0 && /* @__PURE__ */ jsx(MaxLengthPlugin, { maxLength }),
    /* @__PURE__ */ jsx(FloatingToolbar, {}),
    editorRef && /* @__PURE__ */ jsx(EditorRefPlugin, { editorRef })
  ] });
}
function EditorRefPlugin({
  editorRef
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
    setHtml: (html) => {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
    },
    setJson: (json) => {
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
    getLexicalEditor: () => editor
  }));
  return null;
}
var TranceEditor = forwardRef(
  function TranceEditor2(props, ref) {
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
      onError: (error) => {
        console.error("[TranceEditor]", error);
      },
      editorState: initialJson ? JSON.stringify(initialJson) : initialHtml ? (editor) => {
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialHtml, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();
          root.select();
          $insertNodes(nodes);
        });
      } : void 0
    };
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: `trance-editor-wrapper ${className}`.trim(),
        "data-trance-theme": theme,
        children: /* @__PURE__ */ jsx(LexicalComposer, { initialConfig, children: /* @__PURE__ */ jsx(EditorInner, { ...rest, editorRef: ref }) })
      }
    );
  }
);
function serializeToHtml(editor) {
  let html = "";
  editor.read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return html;
}
function deserializeFromHtml(editor, html) {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    const root = $getRoot();
    root.clear();
    $insertNodes(nodes);
  });
}
function serializeToJson(editor) {
  return editor.getEditorState().toJSON();
}
function deserializeFromJson(editor, json) {
  const editorState = editor.parseEditorState(json);
  editor.setEditorState(editorState);
}
function convertJsonToHtml(json) {
  const editor = createEditor({
    namespace: "TranceHeadless",
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
    onError: (error) => {
      throw error;
    }
  });
  const editorState = editor.parseEditorState(json);
  let html = "";
  editorState.read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return html;
}
function convertHtmlToJson(html) {
  const editor = createEditor({
    namespace: "TranceHeadless",
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
    onError: (error) => {
      throw error;
    }
  });
  editor.update(
    () => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    },
    { discrete: true }
  );
  return editor.getEditorState().toJSON();
}

export { $createHorizontalRuleNode, $createImageNode, $isHorizontalRuleNode, $isImageNode, HorizontalRuleNode, INSERT_HORIZONTAL_RULE_COMMAND, INSERT_IMAGE_COMMAND, ImageNode, TranceEditor, convertHtmlToJson, convertJsonToHtml, deserializeFromHtml, deserializeFromJson, serializeToHtml, serializeToJson };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map