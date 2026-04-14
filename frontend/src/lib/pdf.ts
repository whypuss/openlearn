/**
 * Browser-based PDF text extraction using PDF.js
 * No server required — runs entirely in the browser
 */

export async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamically load PDF.js
  if (typeof window === "undefined") return "";

  const pdfjs = await import("pdfjs-dist");
  // Use local worker from /public to avoid CORS/CDN issues
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const texts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    if (pageText.trim()) {
      texts.push(`[Page ${i}]\n${pageText}`);
    }
  }

  return texts.join("\n\n");
}

export async function extractTextFromTxt(file: File): Promise<string> {
  return await file.text();
}

export async function extractText(file: File): Promise<string> {
  const mime = file.type;
  if (mime === "application/pdf") {
    return await extractTextFromPdf(file);
  }
  if (mime === "text/plain" || file.name.endsWith(".txt")) {
    return await extractTextFromTxt(file);
  }
  // Fallback: try as text
  try {
    return await file.text();
  } catch {
    throw new Error(`Unsupported file type: ${mime}`);
  }
}
