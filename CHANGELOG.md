# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.5] - 2026-07-02

### Fixed

- **Editor content area now properly focusable** — clicking anywhere in the editor content area (not just the placeholder text) focuses the editor. The contentEditable now fills its container via flex layout (`flex: 1`) with a `min-height` matching the container.

## [0.2.4] - 2026-07-02

### Changed

- **HTML output is now clean and semantic** — `getHtml()`, `onChange`, `serializeToHtml()`, and `convertJsonToHtml()` no longer output editor-internal `trance-*` CSS classes or `white-space: pre-wrap` inline styles. The HTML output now contains only clean, portable markup that renders identically in `<TranceRenderer />` and any other HTML renderer.
  - Lexical theme classes (`trance-paragraph`, `trance-bold`, `trance-superscript`, etc.) are stripped
  - `white-space: pre-wrap` inline styles are removed
  - Semantic classes like `trance-image-background` (used by the renderer for full-bleed images) are preserved
  - Existing renderer CSS targets semantic elements directly, so no renderer changes needed

## [0.2.3] - 2026-07-02

### Fixed

- **Editor page-size CSS compensation** — removed duplicate CSS class definitions that were overriding the `+2px` border compensation. The `calc(210mm + 2px)` values now properly account for the editor's 1px border, so content width matches the renderer exactly when both use the same `pageSize`.

## [0.2.2] - 2026-07-01

### Added

- **`pageSize` prop on `<TranceEditor />`** — constrain editor content to A4, A3, A5, Letter, Legal, or Tabloid. Matches the existing `pageSize` on `<TranceRenderer />` for pixel-perfect WYSIWYG parity between editor and rendered output.

### Changed

- Docs site deployed to Vercel at https://trance-editor.peterkyle01.me
- CI now runs on Node 22

## [0.2.1] - 2025-07-01

### Changed

- CI: dropped Node 18 support, updated to Node 22
- Updated publish workflow to use granular access token

## [0.2.0] - 2025-07-01

### Added

- `pageSize` prop on `<TranceRenderer />` — constrain content to A4, A3, A5, Letter, Legal, Tabloid
- GitHub Actions CI workflow (test + build + typecheck on push/PR)

### Changed

- **Dark theme redesigned** — switched from navy/slate palette to black + shadcn-style neutral grays (`#0a0a0a` background, `#fafafa` text, `#a3a3a3` secondary). Accent stays indigo.
- Auto theme updated to match new dark palette
- **EditorRefPlugin inlined** — removed unnecessary indirection, `EditorInner` now holds the imperative handle directly
- Version bumped to 0.2.0

### Fixed

- Background image placeholder (`Background Image` text) no longer leaks into serialized HTML / preview — `exportDOM()` no longer includes the editor-only UI element
- Removed unused `.trance-image-background-placeholder` CSS from renderer
- Consolidated duplicate `.trance-editor-content` CSS rule into a single declaration block

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
