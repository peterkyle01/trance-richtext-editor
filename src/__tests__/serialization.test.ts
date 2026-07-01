import { describe, it, expect } from "vitest";
import { $getRoot, createEditor } from "lexical";
import {
  convertHtmlToJson,
  convertJsonToHtml,
  serializeToHtml,
  deserializeFromHtml,
  serializeToJson,
  deserializeFromJson,
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

    it("should handle empty HTML string", () => {
      const json = convertHtmlToJson("");
      expect(json).toBeDefined();
      expect(json.root.children).toHaveLength(0);
    });

    it("should convert a heading element", () => {
      const html = "<h1>Title</h1>";
      const json = convertHtmlToJson(html);
      const node = json.root.children[0] as any;

      expect(node.type).toBe("heading");
      expect(node.tag).toBe("h1");
      expect(node.children[0].text).toBe("Title");
    });

    it("should convert an unordered list", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const json = convertHtmlToJson(html);
      const listNode = json.root.children[0] as any;

      expect(listNode.type).toBe("list");
      expect(listNode.listType).toBe("bullet");
      expect(listNode.children).toHaveLength(2);
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

    it("should handle empty JSON", () => {
      const json = convertHtmlToJson("");
      const html = convertJsonToHtml(json);
      // Empty content should produce empty or minimal output
      expect(html).toBeDefined();
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
