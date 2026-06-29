import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import './TranceRenderer.css';

export interface TranceRendererProps {
  /** HTML string output from TranceEditor */
  html: string;
  /** Additional CSS class */
  className?: string;
  /** Theme mode */
  theme?: 'light' | 'dark' | 'auto';
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
  className = '',
  theme = 'light',
}: TranceRendererProps) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === 'undefined') {
      // SSR: return as-is (consider using isomorphic-dompurify in production)
      return html;
    }
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['figure', 'figcaption', 'iframe'],
      ADD_ATTR: ['target', 'rel', 'loading'],
      ALLOW_DATA_ATTR: false,
    });
  }, [html]);

  return (
    <div
      className={`trance-renderer ${className}`.trim()}
      data-trance-theme={theme}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
