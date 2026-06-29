import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { jsx } from 'react/jsx-runtime';

// src/renderer/TranceRenderer.tsx
function TranceRenderer({
  html,
  className = "",
  theme = "light"
}) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === "undefined") {
      return html;
    }
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ["figure", "figcaption", "iframe"],
      ADD_ATTR: ["target", "rel", "loading"],
      ALLOW_DATA_ATTR: false
    });
  }, [html]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `trance-renderer ${className}`.trim(),
      "data-trance-theme": theme,
      dangerouslySetInnerHTML: { __html: sanitizedHtml }
    }
  );
}

export { TranceRenderer };
//# sourceMappingURL=renderer.js.map
//# sourceMappingURL=renderer.js.map