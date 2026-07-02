import React, { useState, useCallback, useRef } from 'react';
import { TranceEditor, TranceEditorRef } from 'trance-richtext-editor';
import { TranceRenderer, PageSize } from 'trance-richtext-editor/renderer';
import 'trance-richtext-editor/styles.css';
import './App.css';

const PAGE_SIZES: PageSize[] = ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid'];

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return <button className="hero-install-copy" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>;
}

function CodeBlock({ code }: { code: string }) {
  const highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\/\/(.*)/g, '<span class="code-comment">$&</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>')
    .replace(/\b(import|from|function|return|const|let|var|export|default|async|await|if|else|for|of|in|typeof|new|throw|try|catch)\b/g,
      '<span class="code-keyword">$1</span>');

  return (
    <div className="code-block">
      <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  );
}

function Section({ id, label, title, desc, children }: {
  id?: string; label?: string; title: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <section className="section" id={id}>
      <div className="section-header">
        {label && <div className="section-label">{label}</div>}
        <h2 className="section-title">{title}</h2>
        {desc && <p className="section-desc">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

const FEATURES = [
  { icon: '🎨', title: 'Beautiful Out of the Box', desc: 'Polished toolbar, dark mode, floating formatting bar.' },
  { icon: '⚡', title: 'Plug and Play', desc: 'Single component, zero config needed.' },
  { icon: '📤', title: 'Dual Output', desc: 'Get both HTML and JSON from onChange.' },
  { icon: '🖼️', title: 'Rich Content', desc: 'Images, tables, code blocks, checklists, blockquotes.' },
  { icon: '🎯', title: 'Feature Flags', desc: 'Enable or disable any feature via props.' },
  { icon: '🎭', title: 'Theming', desc: 'Light, dark, and auto via CSS custom properties.' },
  { icon: '📐', title: 'TranceRenderer', desc: 'Zero Lexical dependency.' },
  { icon: '🔒', title: 'XSS-Safe', desc: 'HTML sanitized via DOMPurify.' },
  { icon: '📦', title: 'Tree-Shakeable', desc: 'ESM + CJS dual output.' },
  { icon: '⌨️', title: 'Markdown Shortcuts', desc: 'Type # , **text**, - for quick formatting.' },
  { icon: '🔧', title: 'Ref API', desc: 'Get/set HTML, JSON, focus, and clear.' },
  { icon: '📝', title: 'TypeScript', desc: 'Fully typed with exported interfaces.' },
];

const PROPS = [
  ['initialHtml', 'string', '—', 'Initialize editor from HTML'],
  ['initialJson', 'SerializedEditorState', '—', 'Initialize from Lexical JSON'],
  ['placeholder', 'string', '"Start writing..."', 'Placeholder text'],
  ['onChange', 'function', '—', 'Content change callback (debounced)'],
  ['onBlur', 'function', '—', 'Blur callback'],
  ['onFocus', 'function', '—', 'Focus callback'],
  ['features', 'ToolbarFeatures', 'all enabled', 'Feature flags object'],
  ['onImageUpload', 'function', '—', 'Custom image upload handler'],
  ['theme', "'light' | 'dark' | 'auto'", "'light'", 'Theme mode'],
  ['pageSize', "'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid'", '—', 'Constrain editor to page size (matches renderer)'],
  ['className', 'string', '—', 'Additional CSS class'],
  ['editable', 'boolean', 'true', 'Read-only mode'],
  ['autoFocus', 'boolean', 'false', 'Auto-focus on mount'],
  ['maxLength', 'number', '—', 'Character limit'],
  ['debounceMs', 'number', '300', 'Debounce ms for onChange'],
];

export default function App() {
  const [liveHtml, setLiveHtml] = useState('');
  const [rendererHtml, setRendererHtml] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [pageSize, setPageSize] = useState<PageSize | undefined>();
  const [rendererTheme, setRendererTheme] = useState<'light' | 'dark'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const editorRef = useRef<TranceEditorRef>(null);

  const getHtml = useCallback(() => setOutputHtml(editorRef.current?.getHtml() || ''), []);
  const getJson = useCallback(() => {
    const json = editorRef.current?.getJson();
    setOutputHtml(JSON.stringify(json, null, 2));
  }, []);
  const clearEditor = useCallback(() => { editorRef.current?.clear(); setOutputHtml(''); }, []);

  return (
    <div>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-spacer" />
        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <a href="#quickstart" className="nav-link" onClick={() => setMenuOpen(false)}>Quick Start</a>
          <a href="#props" className="nav-link" onClick={() => setMenuOpen(false)}>Props</a>
          <a href="#renderer" className="nav-link" onClick={() => setMenuOpen(false)}>Renderer</a>
          <a href="#theming" className="nav-link" onClick={() => setMenuOpen(false)}>Theming</a>
          <a href="#api" className="nav-link" onClick={() => setMenuOpen(false)}>API</a>
          <a href="https://github.com/peterkyle01/trance-richtext-editor" className="nav-github" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}><GitHubIcon /> GitHub</a>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`nav-hamburger-line${menuOpen ? ' open' : ''}`} />
          <span className={`nav-hamburger-line${menuOpen ? ' open' : ''}`} />
          <span className={`nav-hamburger-line${menuOpen ? ' open' : ''}`} />
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">v0.2.3 · MIT</div>
        <h1 className="hero-title"><span className="hero-title-gradient">trance</span><br />Rich Text Editor</h1>
        <p className="hero-subtitle">
          A plug-and-play rich text editor for React, powered by Lexical.
          Drop in a single component, get HTML output and a beautiful renderer.
        </p>
        <div className="hero-actions">
          <a href="#quickstart" className="hero-btn hero-btn-primary">Get Started</a>
          <a href="#demo" className="hero-btn hero-btn-secondary">Live Demo</a>
        </div>
        <div className="hero-install">
          <code>npm install trance-richtext-editor</code>
          <CopyButton text="npm install trance-richtext-editor" />
        </div>
      </section>

      {/* Live Demo */}
      <Section id="demo" label="Live Demo" title="See it in action"
        desc="Type in the editor and watch the rendered HTML update in real time.">
        <div className="demo-panel">
          <div className="demo-panel-header">
            <span>Interactive Editor</span>
            <div className="demo-panel-header-dots">
              <span className="demo-panel-header-dot" /><span className="demo-panel-header-dot" /><span className="demo-panel-header-dot" />
            </div>
          </div>
          <div className="demo-stack">
            <div className="demo-editor-pane">
              <div className="demo-pane-label">Editor</div>
              <TranceEditor theme="dark" placeholder="Start writing..." onChange={({ html }) => setLiveHtml(html)} autoFocus />
            </div>
            <div className="demo-stack-divider" />
            <div className="demo-preview-pane">
              <div className="demo-pane-label">Rendered Output</div>
              {liveHtml ? <TranceRenderer html={liveHtml} theme="dark" />
                : <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Start typing to see the rendered HTML…</p>}
            </div>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section label="Features" title="Everything you need"
        desc="A comprehensive set of rich text features, all available through a single component.">
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick Start */}
      <Section id="quickstart" label="Quick Start" title="Get started in seconds"
        desc="Install, import, and you're ready to write.">
        <CodeBlock code={`import { TranceEditor } from 'trance-richtext-editor';
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
}`} />
        <br />
        <CodeBlock code={`import { TranceRenderer } from 'trance-richtext-editor/renderer';
import 'trance-richtext-editor/styles.css';

function BlogPost({ content }: { content: string }) {
  return <TranceRenderer html={content} theme="dark" />;
}`} />
      </Section>

      {/* Props */}
      <Section id="props" label="API Reference" title="Editor Props">
        <div className="props-table-wrapper">
          <table className="props-table">
            <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {PROPS.map(([prop, type, def, desc]) => (
                <tr key={prop}><td>{prop}</td><td>{type}</td><td>{def}</td><td>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Renderer & Page Sizes */}
      <Section id="renderer" label="Renderer" title="Beautiful HTML output"
        desc="Choose a page size to constrain the rendered output, or leave it full-width.">
        <div className="page-size-selector">
          <button className={`page-size-btn ${pageSize === undefined ? 'active' : ''}`}
            onClick={() => setPageSize(undefined)}>Full Width</button>
          {PAGE_SIZES.map(size => (
            <button key={size} className={`page-size-btn ${pageSize === size ? 'active' : ''}`}
              onClick={() => setPageSize(size)}>{size}</button>
          ))}
        </div>
        <div className="demo-panel">
          <div className="demo-panel-body" style={{ background: 'var(--color-bg)' }}>
            <TranceEditor theme="dark" placeholder="Type to see page sizes in action..." pageSize={pageSize}
              onChange={({ html }) => setRendererHtml(html)} autoFocus />
          </div>
          {rendererHtml && (
            <div style={{ borderTop: '1px solid var(--color-border)', padding: 24 }}>
              <TranceRenderer html={rendererHtml} theme="dark" pageSize={pageSize} />
            </div>
          )}
        </div>
      </Section>

      {/* Theming */}
      <Section id="theming" label="Theming" title="Light, dark, and everything in between"
        desc="Supporting three theme modes: light, dark, and auto.">
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button className={`page-size-btn ${rendererTheme === 'dark' ? 'active' : ''}`}
            onClick={() => setRendererTheme('dark')}>🌙 Dark</button>
          <button className={`page-size-btn ${rendererTheme === 'light' ? 'active' : ''}`}
            onClick={() => setRendererTheme('light')}>☀️ Light</button>
        </div>
        <div className="demo-panel">
          <div className="demo-panel-body" style={{ background: 'var(--color-bg-card)' }}>
            <TranceEditor theme={rendererTheme}
              placeholder={'Currently in ' + rendererTheme + ' mode...'}
              onChange={({ html }) => setRendererHtml(html)} />
          </div>
        </div>
        <br />
        <CodeBlock code={`/* Override any CSS custom property */
[data-trance-theme="light"] {
  --trance-accent: #8b5cf6;
  --trance-font-sans: 'Outfit', sans-serif;
}
[data-trance-theme="dark"] {
  --trance-bg: #0a0a0a;
  --trance-text: #fafafa;
}`} />
      </Section>

      {/* Ref API */}
      <Section id="api" label="Ref API" title="Programmatic control"
        desc="Use the ref to get/set content, focus, and clear programmatically.">
        <div className="demo-panel">
          <div className="demo-panel-body">
            <TranceEditor ref={editorRef} theme="dark"
              placeholder="Type something, then use the buttons below…"
              onChange={({ html }) => setOutputHtml(html)} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button className="hero-btn hero-btn-secondary" onClick={getHtml}
                style={{ padding: '8px 16px', fontSize: '0.8125rem', cursor: 'pointer' }}>Get HTML</button>
              <button className="hero-btn hero-btn-secondary" onClick={getJson}
                style={{ padding: '8px 16px', fontSize: '0.8125rem', cursor: 'pointer' }}>Get JSON</button>
              <button className="hero-btn hero-btn-secondary" onClick={clearEditor}
                style={{ padding: '8px 16px', fontSize: '0.8125rem', cursor: 'pointer' }}>Clear</button>
            </div>
            {outputHtml && (
              <div className="code-block" style={{ marginTop: 16 }}>
                <pre style={{ margin: 0, maxHeight: 200, overflow: 'auto' }}><code>{outputHtml}</code></pre>
              </div>
            )}
          </div>
        </div>
        <br />
        <CodeBlock code={`const editorRef = useRef<TranceEditorRef>(null);

editorRef.current?.getHtml();     // → string
editorRef.current?.getJson();     // → SerializedEditorState
editorRef.current?.setHtml(html); // → void
editorRef.current?.focus();       // → void
editorRef.current?.clear();       // → void`} />
      </Section>

      {/* Server-Side */}
      <Section label="Server-Side" title="Headless serialization"
        desc="Convert between formats on the server — perfect for API routes and SSR.">
        <CodeBlock code={`import { convertJsonToHtml, convertHtmlToJson }
  from 'trance-richtext-editor';

const html = convertJsonToHtml(savedEditorState);
const json = convertHtmlToJson('<p>Hello <strong>world</strong></p>');`} />
        <br />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Uses a headless Lexical editor — no browser DOM required.
        </p>
      </Section>

      {/* Image Upload */}
      <Section label="Image Upload" title="Custom upload handler"
        desc="Provide your own handler, or images are base64-encoded by default.">
        <CodeBlock code={`<TranceEditor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await res.json();
    return { url, alt: file.name };
  }}
/>`} />
      </Section>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with <a href="https://github.com/peterkyle01/trance-richtext-editor" target="_blank" rel="noopener">trance-richtext-editor</a>
          &nbsp;·&nbsp;Powered by <a href="https://lexical.dev" target="_blank" rel="noopener">Lexical</a>
          &nbsp;·&nbsp;MIT License
        </p>
      </footer>
    </div>
  );
}
