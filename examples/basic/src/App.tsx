import { useState } from "react";
import { TranceEditor } from "trance-richtext-editor";
import { TranceRenderer } from "trance-richtext-editor/renderer";
import "trance-richtext-editor/styles.css";
import "./App.css";

function App() {
  const [html, setHtml] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <div className="app-header-left">
          <h1 className="app-title">
            <span className="app-title-icon">✦</span>
            trance
          </h1>
          <span className="app-subtitle">richtext editor</span>
        </div>
        <div className="app-header-right">
          <button
            className="toggle-btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide" : "Show"} Preview
          </button>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="editor-section">
          <div className="section-header">
            <h2>Editor</h2>
            <span className="badge">Write</span>
          </div>
          <TranceEditor
            placeholder="Start writing something amazing..."
            theme={theme}
            onChange={({ html: newHtml }) => setHtml(newHtml)}
            autoFocus
          />
        </section>

        {showPreview && (
          <section className="preview-section">
            <div className="section-header">
              <h2>Preview</h2>
              <span className="badge">Rendered HTML</span>
            </div>
            <div className="preview-container" data-trance-theme={theme}>
              {html ? (
                <TranceRenderer html={html} theme={theme} />
              ) : (
                <p className="preview-empty">
                  Start typing in the editor to see the rendered output here...
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with{" "}
          <a
            href="https://github.com/peterkyle01/trance-richtext-editor"
            target="_blank"
            rel="noopener"
          >
            trance-richtext-editor
          </a>{" "}
          · Powered by{" "}
          <a href="https://lexical.dev" target="_blank" rel="noopener">
            Lexical
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
