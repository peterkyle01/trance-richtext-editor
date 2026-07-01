import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import "./TranceRenderer.css";

/** Standard page sizes for the renderer */
export type PageSize =
  | "A3"
  | "A4"
  | "A5"
  | "Letter"
  | "Legal"
  | "Tabloid";

const PAGE_SIZE_WIDTHS: Record<PageSize, string> = {
  A3: "297mm",
  A4: "210mm",
  A5: "148mm",
  Letter: "215.9mm",
  Legal: "215.9mm",
  Tabloid: "279.4mm",
};

export interface TranceRendererProps {
  /** HTML string output from TranceEditor */
  html: string;
  /** Additional CSS class */
  className?: string;
  /** Theme mode */
  theme?: "light" | "dark" | "auto";
  /**
   * Constrain content to a standard page size.
   * The renderer centers itself and adds a subtle paper-like background.
   * When omitted, the renderer fills its parent width.
   */
  pageSize?: PageSize;
}

/**
 * TranceRenderer — Beautifully renders HTML output from TranceEditor.
 *
 * - XSS-safe via DOMPurify sanitization
 * - Beautiful typography and styling out of the box
 * - Supports light/dark themes via CSS custom properties
 * - SSR-safe for Next.js/Remix
 *
 * @example
 * ```tsx
 * import { TranceRenderer } from 'trance-richtext-editor/renderer';
 *
 * function BlogPost({ content }: { content: string }) {
 *   return <TranceRenderer html={content} theme="dark" />;
 * }
 * ```
 */
export function TranceRenderer({
  html,
  className = "",
  theme = "light",
  pageSize,
}: TranceRendererProps) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === "undefined") {
      return html;
    }
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ["figure", "figcaption", "iframe"],
      ADD_ATTR: ["target", "rel", "loading"],
      ALLOW_DATA_ATTR: false,
    });
  }, [html]);

  const pageSizeClass = pageSize
    ? ` trance-renderer-page-${pageSize.toLowerCase()}`
    : "";

  return (
    <div
      className={`trance-renderer${pageSizeClass} ${className}`.trim()}
      data-trance-theme={theme}
    >
      <div
        className="trance-renderer-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
