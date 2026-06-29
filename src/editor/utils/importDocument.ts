import { $generateNodesFromDOM } from "@lexical/html";
import {
  $createParagraphNode,
  $createTextNode,
  $insertNodes,
  LexicalEditor,
} from "lexical";

export type ImportedDocumentType = "docx" | "pdf";

export interface ImportDocumentResult {
  type: ImportedDocumentType;
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

async function importPdf(editor: LexicalEditor, file: File): Promise<void> {
  // Dynamic import keeps pdfjs-dist out of the initial bundle and avoids SSR issues.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Configure PDF.js worker. Uses a CDN for simplicity; in production you may
  // want to bundle the worker or host it yourself.
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.mjs";

  const arrayBuffer = await fileToArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n\n";
  }

  editor.update(() => {
    const paragraphs = fullText
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      $insertNodes([$createParagraphNode()]);
      return;
    }

    const nodes = paragraphs.map((text) => {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(text));
      return paragraph;
    });

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

  if (extension === "pdf") {
    await importPdf(editor, file);
    return { type: "pdf", title: file.name };
  }

  throw new Error(`Unsupported file type: ${extension}`);
}
