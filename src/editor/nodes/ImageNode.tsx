import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";

export type ImageAlignment = "left" | "center" | "right";

export interface ImagePayload {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  caption?: string;
  alignment?: ImageAlignment;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    caption?: string;
    alignment?: ImageAlignment;
  },
  SerializedLexicalNode
>;

function $convertImageElement(domNode: Node): DOMConversionOutput | null {
  const element = domNode as HTMLElement;
  if (element.tagName === "IMG") {
    const img = element as HTMLImageElement;
    const node = $createImageNode({
      src: img.src,
      altText: img.alt || "",
      width: img.width || undefined,
      height: img.height || undefined,
    });
    return { node };
  }
  // Handle <figure> wrapping
  if (element.tagName === "FIGURE") {
    const img = element.querySelector("img");
    const figcaption = element.querySelector("figcaption");
    if (img) {
      const node = $createImageNode({
        src: img.src,
        altText: img.alt || "",
        width: img.width || undefined,
        height: img.height || undefined,
        caption: figcaption?.textContent || undefined,
        alignment: (element.dataset.align as ImageAlignment) || undefined,
      });
      return { node };
    }
  }
  return null;
}

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;
  __width: number | undefined;
  __height: number | undefined;
  __caption: string | undefined;
  __alignment: ImageAlignment;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__alignment,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
      alignment: serializedNode.alignment,
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
      figure: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    caption?: string,
    alignment: ImageAlignment = "center",
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
    this.__alignment = alignment;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      alignment: this.__alignment,
    };
  }

  exportDOM(): DOMExportOutput {
    const figure = document.createElement("figure");
    figure.style.margin = "0";
    figure.dataset.align = this.__alignment;
    this.applyAlignmentStyles(figure);

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
    img.style.display = "block";
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

  private applyAlignmentStyles(element: HTMLElement): void {
    element.style.display = "block";
    element.style.width = "fit-content";
    element.style.maxWidth = "100%";

    switch (this.__alignment) {
      case "left":
        element.style.margin = "0 auto 0 0";
        break;
      case "right":
        element.style.margin = "0 0 0 auto";
        break;
      case "center":
      default:
        element.style.margin = "0 auto";
        break;
    }
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = `trance-image-wrapper align-${this.__alignment}`;
    return div;
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement): boolean {
    if (prevNode.__alignment !== this.__alignment) {
      dom.className = `trance-image-wrapper align-${this.__alignment}`;
    }
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setWidthAndHeight(
    width: number | undefined,
    height: number | undefined,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  getAlignment(): ImageAlignment {
    return this.__alignment;
  }

  setAlignment(alignment: ImageAlignment): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  decorate(): ReactNode {
    return (
      <ImageComponent
        nodeKey={this.__key}
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        alignment={this.__alignment}
      />
    );
  }

  isInline(): boolean {
    return false;
  }
}

function ImageComponent({
  nodeKey,
  src,
  altText,
  width,
  height,
  caption,
  alignment,
}: {
  nodeKey: NodeKey;
  src: string;
  altText: string;
  width?: number;
  height?: number;
  caption?: string;
  alignment: ImageAlignment;
}) {
  return (
    <ImageComponentInner
      nodeKey={nodeKey}
      src={src}
      altText={altText}
      width={width}
      height={height}
      caption={caption}
      alignment={alignment}
    />
  );
}

function ImageComponentInner({
  nodeKey,
  src,
  altText,
  width,
  height,
  caption,
  alignment,
}: {
  nodeKey: NodeKey;
  src: string;
  altText: string;
  width?: number;
  height?: number;
  caption?: string;
  alignment: ImageAlignment;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);

  useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setSelected(true);
    },
    [setSelected],
  );

  // Register click command to clear selection when clicking outside image
  useEffect(() => {
    return editor.registerCommand<MouseEvent>(
      CLICK_COMMAND,
      (payload) => {
        const clickedElement = payload.target as Node;
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(clickedElement)
        ) {
          clearSelection();
          return false;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, clearSelection]);

  const startResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsResizing(true);
      setSelected(true);

      const image = imageRef.current;
      if (!image) return;

      const startX = event.clientX;
      const startWidth = image.offsetWidth;
      const aspectRatio = image.naturalWidth / image.naturalHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(80, startWidth + deltaX);
        const newHeight = aspectRatio > 0 ? newWidth / aspectRatio : undefined;

        setCurrentWidth(newWidth);

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.setWidthAndHeight(newWidth, newHeight);
          }
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editor, nodeKey, setSelected],
  );

  const setAlignment = useCallback(
    (newAlignment: ImageAlignment) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setAlignment(newAlignment);
        }
      });
    },
    [editor, nodeKey],
  );

  const innerClassName = ["trance-image-inner", isSelected ? "selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={wrapperRef}
      className={innerClassName}
      onClick={handleClick}
      data-alignment={alignment}
    >
      {(isSelected || isResizing) && (
        <div
          className="trance-image-toolbar"
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className={alignment === "left" ? "active" : ""}
            onClick={() => setAlignment("left")}
            aria-label="Align left"
            title="Align left"
          >
            <AlignLeftIcon />
          </button>
          <button
            type="button"
            className={alignment === "center" ? "active" : ""}
            onClick={() => setAlignment("center")}
            aria-label="Align center"
            title="Align center"
          >
            <AlignCenterIcon />
          </button>
          <button
            type="button"
            className={alignment === "right" ? "active" : ""}
            onClick={() => setAlignment("right")}
            aria-label="Align right"
            title="Align right"
          >
            <AlignRightIcon />
          </button>
        </div>
      )}

      <figure style={{ margin: 0 }}>
        <img
          ref={imageRef}
          src={src}
          alt={altText}
          width={currentWidth}
          height={height}
          draggable={false}
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "8px",
            display: "block",
            cursor: isSelected ? "default" : "pointer",
            userSelect: "none",
          }}
        />
        {caption && (
          <figcaption className="trance-image-caption">{caption}</figcaption>
        )}
      </figure>

      {(isSelected || isResizing) && (
        <div
          className="trance-image-resize-handle"
          onMouseDown={startResize}
          aria-label="Resize image"
          title="Resize image"
        />
      )}
    </div>
  );
}

function AlignLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="13" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="11" y1="12" x2="21" y2="12" />
      <line x1="6" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(
    payload.src,
    payload.altText,
    payload.width,
    payload.height,
    payload.caption,
    payload.alignment || "center",
    payload.key,
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
