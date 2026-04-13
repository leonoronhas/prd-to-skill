import { access } from "node:fs/promises";
import { extname, resolve } from "node:path";

export const extractText = async (filePath: string): Promise<string> => {
  const resolved = resolve(filePath);

  try {
    await access(resolved);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = extname(resolved).toLowerCase();

  let text: string;

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const pdf = new PDFParse({ url: resolved });
    const result = await pdf.getText();
    text = result.text;
  } else if (ext === ".docx" || ext === ".doc") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ path: resolved });
    text = result.value;
  } else {
    throw new Error(`Unsupported file type "${ext}". Supported: .pdf, .docx`);
  }

  text = text.trim().replace(/\n{3,}/g, "\n\n");

  if (!text) {
    throw new Error(
      "No text could be extracted from the document. Is it a scanned PDF? (Scanned PDFs are not supported.)",
    );
  }

  return text;
};
