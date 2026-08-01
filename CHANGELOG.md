# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.3] - 2026-08-02

### Fixed

- **Docs site hero badge** now shows the current version (v0.4.2) — it had been left on v0.4.0 after the 0.4.1/0.4.2 releases.
- **Docs site feature claims brought in line with the README** — Page Sizes card added, Rich Content now mentions horizontal rules, floating bar description clarified, `onImageUpload` default corrected.
- **Stale `serializeToHtml` JSDoc** — it claimed the function could be called inside an update context; it always reads the committed state, so calling it there would serialize stale content.
- **Dead code removed from `MaxLengthPlugin`** — a no-op `RootNode` transform with misleading comments; enforcement is the `TextNode` transform.
- **CI workflow updates** — Node 22/24 matrix (20 is EOL), action versions v5, publish workflow step labels and duplicate build removed.
- **Removed the broken `lint` script** — eslint was never a devDependency and no config exists.
- **LICENSE year** updated to 2025-2026; test leftovers (debug console.log, stale comment) removed.

## [0.4.2] - 2026-08-02

### Added

- **Controlled mode** — new `value` prop drives the editor from external state (HTML), with `defaultValue` for uncontrolled initial content. The editor only applies the value when it differs from its own content (canonical comparison), so echoing `onChange` output back is safe — no cursor resets or update loops. Precedence: `value` > `initialJson` > `defaultValue` > `initialHtml`.
- **Floating formatting bar** — a bubble toolbar appears above text selections with the most-used inline formats (bold, italic, underline, strikethrough, code, highlight, link). Respects the main toolbar's feature flags; disable entirely via `features.floatingBar` (default on). Hides on collapsed selection, blur, or Escape.

## [0.4.1] - 2026-08-02

### Fixed

- **Editor ↔ renderer parity — the core promise.** An audit found the renderer used em-based margins while the editor used fixed spacing tokens. Since em scales with the element's own font-size, headings rendered with ~2× the editor's spacing and paragraphs, lists, blockquotes, code blocks, tables, rules, and images all drifted. The renderer now uses the same tokens as the editor.
- **Checklists now render correctly in `TranceRenderer`.** The checked state was dropped during HTML export (Lexical only keeps it in JSON), so checklists rendered as plain bullet lists. Export now emits `<ul type="check">` + `<li aria-checked="true|false">` via `TRANCE_HTML_EXPORT` (Lexical `HTMLConfig` export overrides), which round-trips through Lexical's own import logic and is styled by the renderer.
- **Images and horizontal rules respect the theme in the renderer.** Export embedded hardcoded light-theme hex colors (`#6b7280` captions, `#d1d5db` rules) that broke dark mode; token-based renderer CSS now controls the look. Image vertical spacing also aligned (a stray `0.5em` img margin created 16px gaps vs the editor's 12px), and dead `figure[data-align]` rules were removed (DOMPurify strips `data-*`; alignment travels via inline margins).

### Changed

- **Checklist HTML output shape** — `<ul type="check">` with `<li aria-checked="…">` (previously a private `__lexicalListType` attribute + no checked state). Old stored HTML still imports correctly; new output renders correctly in the renderer.

### Added

- **Parity test suite** — 30 features rendered with both editor CSS and renderer CSS, computed styles compared element-by-element. The suite that makes "exactly the same thing" a checked property.
- **Sanitization guard tests** — the editor's output contract (inline styles, checklist attributes, figure/iframe, target/rel/loading) is pinned so DOMPurify config drift fails loudly instead of silently breaking fidelity.
- **`TRANCE_HTML_EXPORT` and `TRANCE_NODES`** — exported for custom editors built on the library; `TRANCE_NODES` was previously only available internally.
- **README "HTML Output Contract" section** — the written version of what the code enforces.

## [0.4.0] - 2026-08-01

### Removed

- **`convertJsonToHtml` / `convertHtmlToJson` removed** — these claimed to work server-side ("headless") but required browser DOM APIs (`DOMParser`, `document`) that don't exist in Node, so they crashed in the environments the docs recommended. Editor-context serialization (`serializeToHtml`, `deserializeFromHtml`, `serializeToJson`, `deserializeFromJson`) is unchanged. If you need server-side conversion in the future, it must be built on a DOM implementation like jsdom.
- **`@lexical/headless` dependency removed** — it was never imported anywhere in the source.

### Fixed

- **Docs no longer claim a "floating formatting bar"** — that feature was removed in an earlier version but the claim remained in the README, docs site, and a CSS comment.
- **Editor caret color follows the theme** — the text cursor used the indigo accent color (`--trance-accent`); it now uses `--trance-text`, so it's dark in light mode and light in dark mode.

## [0.3.0] - 2026-07-08

### Added

- **Text color feature** — new `textColor` button in the toolbar with a grid of 22 preset colors. Click the **A** icon, pick a color. Supports reset via the "Reset" button. Enable/disable via `features.textColor` prop.

### Changed

- **Editor border-radius reduced** — from `8px` to `4px` for a cleaner look.
- **Focus border color** — removed custom indigo focus ring; editor now uses the default border on focus.
- **Vite dev config** — added `optimizeDeps.include: ['mammoth']` to fix docx import in local dev.
- **Border-radius removed from toolbar** — wrapper `overflow: hidden` handles corner clipping.

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
