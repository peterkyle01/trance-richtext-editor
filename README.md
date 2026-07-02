# trance-richtext-editor

A plug-and-play rich text editor for React, powered by [Lexical](https://lexical.dev/). Drop in a single component, get a production-quality editor with HTML output and a matching renderer.

Inspired by [Payload CMS's rich text editor](https://payloadcms.com/docs/fields/rich-text), extracted for standalone use — no CMS dependency required.

## Features

- 🎨 **Beautiful out of the box** — polished toolbar, floating formatting bar, dark mode
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

Available flags: `bold`, `italic`, `underline`, `strikethrough`, `code`, `link`, `orderedList`, `unorderedList`, `checkList`, `blockquote`, `codeBlock`, `image`, `table`, `horizontalRule`, `heading`, `textAlign`, `superscript`, `subscript`, `highlight`

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

## Server-Side Utilities

Convert between formats on the server (API routes, SSR, email templates):

```ts
import { convertJsonToHtml, convertHtmlToJson } from 'trance-richtext-editor';

// JSON → HTML
const html = convertJsonToHtml(savedEditorState);

// HTML → JSON
const json = convertHtmlToJson('<p>Hello <strong>world</strong></p>');
```

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

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 90+     |
| Safari  | 15+     |
| Edge    | 90+     |

## License

MIT © [peterkyle01](https://github.com/peterkyle01)
