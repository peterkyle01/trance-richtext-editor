# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-06-28

### Added

- Initial release of `trance-richtext-editor`
- `<TranceEditor />` component with full rich text editing
- `<TranceRenderer />` component for rendering HTML output
- Toolbar with 20+ formatting actions
- Floating toolbar on text selection
- Feature flags for enabling/disabling editor features
- Dual output: HTML string + Lexical JSON
- Custom nodes: Image (with figure/figcaption), Horizontal Rule
- Image drag-and-drop with base64 fallback
- Custom upload handler support via `onImageUpload`
- Light, dark, and auto theme support
- CSS custom properties for full theming control
- Markdown shortcuts (headings, bold, italic, lists, etc.)
- Serialization utilities: `serializeToHtml`, `convertJsonToHtml`, etc.
- Server-side/headless HTML generation
- XSS protection via DOMPurify in renderer
- Imperative ref API (getHtml, setHtml, getJson, setJson, focus, clear)
- TypeScript support with exported types
- ESM + CJS dual builds via tsup
