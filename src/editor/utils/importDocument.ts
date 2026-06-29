import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, LexicalEditor } from "lexical";

export interface ImportDocumentResult {
  type: "docx";
  title?: string;
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot + 1).toLowerCase();
}

function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function importDocx(editor: LexicalEditor, file: File): Promise<void> {
  // Dynamic import keeps mammoth out of the initial bundle and avoids SSR issues.
  const mammoth = await import("mammoth");
  const arrayBuffer = await fileToArrayBuffer(file);
  const result = await mammoth.convertToHtml({ arrayBuffer });

  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(result.value, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);
    $insertNodes(nodes);
  });
}

export async function importDocument(
  editor: LexicalEditor,
  file: File,
): Promise<ImportDocumentResult> {
  const extension = getFileExtension(file.name);

  if (extension === "docx") {
    await importDocx(editor, file);
    return { type: "docx", title: file.name };
  }

  throw new Error(
    `Unsupported file type: ${extension}. Only .docx is supported.`,
  );
}
