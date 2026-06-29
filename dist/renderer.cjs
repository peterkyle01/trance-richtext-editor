'use strict';

var react = require('react');
var DOMPurify = require('dompurify');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var DOMPurify__default = /*#__PURE__*/_interopDefault(DOMPurify);

// src/renderer/TranceRenderer.tsx
function TranceRenderer({
  html,
  className = "",
  theme = "light"
}) {
  const sanitizedHtml = react.useMemo(() => {
    if (typeof window === "undefined") {
      return html;
    }
    return DOMPurify__default.default.sanitize(html, {
      ADD_TAGS: ["figure", "figcaption", "iframe"],
      ADD_ATTR: ["target", "rel", "loading"],
      ALLOW_DATA_ATTR: false
    });
  }, [html]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: `trance-renderer ${className}`.trim(),
      "data-trance-theme": theme,
      dangerouslySetInnerHTML: { __html: sanitizedHtml }
    }
  );
}

exports.TranceRenderer = TranceRenderer;
//# sourceMappingURL=renderer.cjs.map
//# sourceMappingURL=renderer.cjs.map