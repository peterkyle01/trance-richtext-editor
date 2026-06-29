import { describe, it, expect } from "vitest";
import { createEditor } from "lexical";
import {
  convertHtmlToJson,
  convertJsonToHtml,
  serializeToHtml,
  deserializeFromHtml,
} from "../serialization";
import { TRANCE_NODES } from "../editor/nodes";
import { tranceLexicalTheme } from "../styles/lexical-theme";

describe("Serialization Utilities", () => {
  const editor = createEditor({
    namespace: "TestEditor",
    nodes: TRANCE_NODES,
    theme: tranceLexicalTheme,
  });

  describe("Headless HTML to JSON", () => {
    it("should convert a simple paragraph to Lexical JSON", () => {
      const html = "<p>Hello world</p>";
      const json = convertHtmlToJson(html);

      expect(json).toBeDefined();
      expect(json.root.children[0].type).toBe("paragraph");
      // Inside paragraph, there should be a text node with "Hello world"
      const pNode = json.root.children[0] as any;
      expect(pNode.children[0].text).toBe("Hello world");
    });

    it("should convert formatted text to Lexical JSON", () => {
      const html = "<p>Hello <strong>bold</strong> world</p>";
      const json = convertHtmlToJson(html);
      const pNode = json.root.children[0] as any;

      expect(pNode.children).toHaveLength(3);
      expect(pNode.children[0].text).toBe("Hello ");
      expect(pNode.children[1].text).toBe("bold");
      expect(pNode.children[1].format).toBe(1); // 1 = Bold format in Lexical
    });
  });

  describe("Headless JSON to HTML", () => {
    it("should convert Lexical JSON back to HTML", () => {
      const json = convertHtmlToJson(
        "<p>Hello <strong>bold</strong> world</p>",
      );
      const html = convertJsonToHtml(json);

      expect(html).toContain("Hello ");
      expect(html).toContain("bold");
      expect(html).toContain("trance-bold");
      expect(html).toContain(" world");
    });
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

    it("should round-trip a background image without creating extra paragraphs", () => {
      const html =
        '<figure class="trance-image-background"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCA0MDAgMjAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg==" alt="bg"></figure><div class="trance-image-background-placeholder">Background Image</div><p>Hello</p>';

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

      const htmlOutput = serializeToHtml(editor);
      expect(htmlOutput).toContain("trance-image-background");
      expect(htmlOutput).toContain("Hello");
    });
  });
});
