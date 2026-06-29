import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { ReactNode } from 'react';

export interface ImagePayload {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  caption?: string;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    caption?: string;
  },
  SerializedLexicalNode
>;

function $convertImageElement(domNode: Node): DOMConversionOutput | null {
  const element = domNode as HTMLElement;
  if (element.tagName === 'IMG') {
    const img = element as HTMLImageElement;
    const node = $createImageNode({
      src: img.src,
      altText: img.alt || '',
      width: img.width || undefined,
      height: img.height || undefined,
    });
    return { node };
  }
  // Handle <figure> wrapping
  if (element.tagName === 'FIGURE') {
    const img = element.querySelector('img');
    const figcaption = element.querySelector('figcaption');
    if (img) {
      const node = $createImageNode({
        src: img.src,
        altText: img.alt || '',
        width: img.width || undefined,
        height: img.height || undefined,
        caption: figcaption?.textContent || undefined,
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

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
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
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
    };
  }

  exportDOM(): DOMExportOutput {
    const figure = document.createElement('figure');
    figure.style.margin = '0';

    const img = document.createElement('img');
    img.setAttribute('src', this.__src);
    img.setAttribute('alt', this.__altText);
    if (this.__width) {
      img.setAttribute('width', String(this.__width));
    }
    if (this.__height) {
      img.setAttribute('height', String(this.__height));
    }
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '8px';
    figure.appendChild(img);

    if (this.__caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = this.__caption;
      figcaption.style.textAlign = 'center';
      figcaption.style.fontSize = '0.875rem';
      figcaption.style.color = '#6b7280';
      figcaption.style.marginTop = '4px';
      figcaption.style.fontStyle = 'italic';
      figure.appendChild(figcaption);
    }

    return { element: figure };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'trance-image-wrapper';
    return div;
  }

  updateDOM(): false {
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
    height: number | undefined
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  decorate(): ReactNode {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
      />
    );
  }

  isInline(): boolean {
    return false;
  }
}

function ImageComponent({
  src,
  altText,
  width,
  height,
  caption,
}: {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  caption?: string;
}) {
  return (
    <figure style={{ margin: 0, display: 'inline-block', maxWidth: '100%' }}>
      <img
        src={src}
        alt={altText}
        width={width}
        height={height}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          display: 'block',
        }}
      />
      {caption && (
        <figcaption className="trance-image-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(
    payload.src,
    payload.altText,
    payload.width,
    payload.height,
    payload.caption,
    payload.key
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
