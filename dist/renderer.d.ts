import React from 'react';

interface TranceRendererProps {
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
declare function TranceRenderer({ html, className, theme, }: TranceRendererProps): React.JSX.Element;

export { TranceRenderer, type TranceRendererProps };
