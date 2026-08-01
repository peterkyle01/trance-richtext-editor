# trance-richtext-editor

A plug-and-play rich text editor for React, powered by [Lexical](https://lexical.dev/). Drop in a single component, get a production-quality editor with HTML output and a matching renderer.

Inspired by [Payload CMS's rich text editor](https://payloadcms.com/docs/fields/rich-text), extracted for standalone use — no CMS dependency required.

## Features

- 🎨 **Beautiful out of the box** — polished toolbar, floating formatting bar on text selection, dark mode
- ⚡ **Plug and play** — single `<TranceEditor />` component, zero config needed
- 📤 **Dual output** — get both HTML strings and Lexical JSON from `onChange`
- 🖼️ **Rich content** — images, tables, code blocks, checklists, blockquotes, horizontal rules
- 🎯 **Feature flags** — enable/disable any formatting feature via props
- 🎭 **Theming** — light, dark, and auto (system preference) themes via CSS custom properties
- 📐 **TranceRenderer** — separate, lightweight component to beautifully render editor HTML
- 📄 **Page sizes** — constrain renderer output to A4, Letter, and other standard formats
- 🔒 **XSS-safe** — renderer sanitizes HTML via DOMPurify
- 📦 **Tree-shakeable** — ESM + CJS dual output, renderer has no Lexical dependency
- ⌨️ **Markdown shortcuts** — type `# `, `**text**`, `- `, etc. for quick formatting
- 🔧 **Ref API** — programmatically get/set HTML, JSON, focus, and clear
- 📝 **TypeScript** — fully typed with exported interfaces

## Installation

```bash
npm install trance-richtext-editor
```

## Quick Start

### Editor

```tsx
import { TranceEditor } from 'trance-richtext-editor';
import 'trance-richtext-editor/styles.css';

function MyEditor() {
  return (
    <TranceEditor
      placeholder="Write something amazing..."
      onChange={({ html, json }) => {
        console.log('HTML:', html);
        console.log('JSON:', json);
      }}
    />
  );
}
```

### Renderer

```tsx
import { TranceRenderer } from 'trance-richtext-editor/renderer';
import 'trance-richtext-editor/styles.css';

function BlogPost({ content }: { content: string }) {
  return <TranceRenderer html={content} theme="dark" />;
}
```

## Props

### `<TranceEditor />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialHtml` | `string` | — | Initialize editor from HTML |
| `initialJson` | `SerializedEditorState` | — | Initialize from Lexical JSON |
| `value` | `string` | — | Controlled HTML value — external changes are pushed into the editor (see [Controlled Mode](#controlled-mode)) |
| `defaultValue` | `string` | — | Initial HTML in uncontrolled mode (alias for `initialHtml`) |
| `placeholder` | `string` | `"Start writing..."` | Placeholder text |
| `onChange` | `(data: { html, json }) => void` | — | Content change callback (debounced) |
| `onBlur` | `() => void` | — | Blur callback |
| `onFocus` | `() => void` | — | Focus callback |
| `features` | `ToolbarFeatures` | all enabled | Feature flags object |
| `onImageUpload` | `(file: File) => Promise<{ url, alt? }>` | base64 fallback | Custom image upload handler |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Theme mode |
| `pageSize` | `PageSize` | — | Constrain editor to a page size (matches TranceRenderer) |
| `className` | `string` | — | Additional CSS class |
| `editable` | `boolean` | `true` | Read-only mode |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `maxLength` | `number` | — | Character limit |
| `debounceMs` | `number` | `300` | Debounce ms for onChange |

### Feature Flags

All features are enabled by default. Disable any via the `features` prop:

```tsx
<TranceEditor
  features={{
    table: false,
    image: false,
    checkList: false,
  }}
/>
```

Available flags: `bold`, `italic`, `underline`, `strikethrough`, `code`, `link`, `orderedList`, `unorderedList`, `checkList`, `blockquote`, `codeBlock`, `image`, `table`, `horizontalRule`, `heading`, `textAlign`, `superscript`, `subscript`, `highlight`, `import`, `textColor`, `floatingBar`

### Ref API

```tsx
import { useRef } from 'react';
import { TranceEditor, TranceEditorRef } from 'trance-richtext-editor';

function MyEditor() {
  const editorRef = useRef<TranceEditorRef>(null);

  return (
    <>
      <TranceEditor ref={editorRef} />
      <button onClick={() => console.log(editorRef.current?.getHtml())}>
        Get HTML
      </button>
      <button onClick={() => editorRef.current?.clear()}>
        Clear
      </button>
    </>
  );
}
```

The ref exposes: `getHtml()`, `getJson()`, `setHtml(html)`, `setJson(json)`, `focus()`, `clear()`, and `getLexicalEditor()` (escape hatch for advanced use).

### `<TranceRenderer />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `html` | `string` | — | HTML string to render |
| `className` | `string` | — | Additional CSS class |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Theme mode |
| `pageSize` | `PageSize` | — | Constrain content to a standard page size |

**`PageSize` options:** `'A3'`, `'A4'`, `'A5'`, `'Letter'`, `'Legal'`, `'Tabloid'`

When `pageSize` is set, both the editor and renderer center themselves with a paper-like background and shadow.
The same page size on both components ensures WYSIWYG fidelity — content appears identical in both:

```tsx
<TranceEditor pageSize="A4" onChange={({ html }) => setHtml(html)} />
<TranceRenderer html={html} pageSize="A4" />
```

> **Note:** The editor has a 1px border, so the content area width accounts for it automatically.
> If you override `box-sizing` globally, you may need to adjust accordingly.

```tsx
<TranceRenderer html={content} pageSize="A4" />
```

## Theming

Override any CSS custom property to customize the look:

```css
[data-trance-theme="light"] {
  --trance-accent: #8b5cf6;           /* Purple accent */
  --trance-font-sans: 'Outfit', sans-serif;
  --trance-radius-md: 12px;
}
```

## Controlled Mode

Pass `value` (HTML) to drive the editor from external state — ideal for forms:

```tsx
import { useState } from 'react';
import { TranceEditor } from 'trance-richtext-editor';

function MyForm() {
  const [html, setHtml] = useState('<p>Start writing...</p>');

  return (
    <TranceEditor
      value={html}
      onChange={({ html }) => setHtml(html)}
    />
  );
}
```

Notes:

- `value` takes precedence over `initialJson`, `defaultValue`, and `initialHtml`.
- The editor only applies the value when it differs from its own content, so echoing `onChange` output back is safe — no cursor resets or update loops.
- `defaultValue` sets the initial content in uncontrolled mode (a React-style alias for `initialHtml`).
- `onChange` remains debounced (`debounceMs`, default 300ms); lower it for tighter form feedback.

## Image Upload

Provide a custom upload handler, or images will be base64-encoded by default:

```tsx
<TranceEditor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await res.json();
    return { url, alt: file.name };
  }}
/>
```

## HTML Output Contract

Content edited in the editor must render **exactly the same** in `TranceRenderer` — that is the core promise of this library, and it is enforced by a parity test suite that compares computed styles between the two components for every feature.

The editor produces clean, semantic HTML with these guarantees:

- **Semantic elements only** — `<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<blockquote>`, `<pre>`, `<table>`, `<hr>`, `<figure>`, `<img>`, `<a>`, `<code>`, `<mark>`, `<sub>`, `<sup>`
- **Checklists round-trip** — exported as `<ul type="check">` with `<li aria-checked="true|false">`; the checked state survives editor → HTML → editor
- **Inline styles for content, not chrome** — text color and alignment export as `style="color: …"` / `style="text-align: …"`, which the renderer preserves
- **No editor internals** — no Lexical theme classes, no `__lexicalListType` attributes, no placeholder or UI markup
- **One preserved class** — `trance-image-background` on `<figure>` marks full-bleed background images (used by `TranceRenderer`)
- **Stable across versions** — output changes are treated as breaking changes and documented in the changelog

For custom editors built on `TRANCE_NODES`, pass `html: { export: TRANCE_HTML_EXPORT }` to keep checklist output faithful.

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 90+     |
| Safari  | 15+     |
| Edge    | 90+     |

## License

MIT © [peterkyle01](https://github.com/peterkyle01)
