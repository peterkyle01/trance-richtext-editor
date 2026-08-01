import { describe, it, expect } from "vitest";
import { $getRoot, createEditor } from "lexical";
import {
  serializeToHtml,
  deserializeFromHtml,
  serializeToJson,
  deserializeFromJson,
} from "../serialization";
import { TRANCE_NODES, TRANCE_HTML_EXPORT } from "../editor/nodes";
import { tranceLexicalTheme } from "../styles/lexical-theme";

describe("Serialization Utilities", () => {
  const editor = createEditor({
    namespace: "TestEditor",
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
    html: { export: TRANCE_HTML_EXPORT },
  });

  describe("Editor Context Serialization", () => {
    it("should serialize active editor state to HTML", () => {
      editor.update(
        () => {
          deserializeFromHtml(editor, "<p>Test content</p>");
        },
        { discrete: true },
      );

      const htmlOutput = serializeToHtml(editor);
      expect(htmlOutput).toContain("Test content");
    });

    it("should round-trip a background image without including the editor placeholder in output", () => {
      // Note: the placeholder div is an editor-only UI element and should NOT
      // appear in serialized HTML output. The figure class alone preserves the mode.
      const html =
        '<figure class="trance-image-background" data-mode="background"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2MzY2ZjEiLz48L3N2Zz4=" alt="bg"></figure><p>Hello</p>';

      editor.update(
        () => {
          deserializeFromHtml(editor, html);
        },
        { discrete: true },
      );

      const root = editor.getEditorState().toJSON().root as any;
      const imageNode = root.children.find(
        (child: any) => child.type === "image",
      );
      expect(imageNode).toBeDefined();
      expect(imageNode.mode).toBe("background");

      // Re-serialize to HTML - should NOT contain the placeholder div
      const htmlOutput = serializeToHtml(editor);
      expect(htmlOutput).toContain("trance-image-background");
      expect(htmlOutput).toContain("Hello");
      expect(htmlOutput).not.toContain("trance-image-background-placeholder");
      expect(htmlOutput).not.toContain(">Background Image<");
      // Editor theme classes should be stripped
      expect(htmlOutput).not.toContain("trance-paragraph");
    });

    it("should round-trip checklists with checked state", () => {
      editor.update(
        () => {
          deserializeFromHtml(
            editor,
            '<ul type="check"><li aria-checked="true">Done</li><li aria-checked="false">Todo</li></ul>',
          );
        },
        { discrete: true },
      );

      const json = serializeToJson(editor);
      const list = json.root.children[0] as any;
      expect(list.type).toBe("list");
      expect(list.listType).toBe("check");
      expect(list.children[0].checked).toBe(true);
      expect(list.children[1].checked).toBe(false);

      const html = serializeToHtml(editor);
      expect(html).toContain('type="check"');
      expect(html).toContain('aria-checked="true"');
      expect(html).toContain('aria-checked="false"');
      // Editor internals must not leak into checklist output
      expect(html).not.toContain("__lexicalListType");
    });

    it("should serialize cleared editor state", () => {
      editor.update(
        () => {
          $getRoot().clear();
        },
        { discrete: true },
      );

      const json = serializeToJson(editor);
      expect(json).toBeDefined();
      expect(json.root.children).toBeDefined();
    });
  });
});
