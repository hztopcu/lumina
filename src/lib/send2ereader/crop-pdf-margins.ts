import { PDFDocument } from "pdf-lib";

/** pdfcropmargins benzeri: her sayfada simetrik içe kırpma (PDF koordinatları, alt-sol köken). */
export async function cropPdfMarginsInMemory(
  input: Buffer,
  trimFraction = 0.06,
): Promise<Buffer> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(input);
  } catch (e) {
    throw new Error(
      e instanceof Error && e.message.toLowerCase().includes("encrypt")
        ? "Şifreli PDF desteklenmiyor."
        : "PDF açılamadı veya bozuk.",
    );
  }

  const pages = doc.getPages();
  if (pages.length === 0) {
    throw new Error("PDF sayfa içermiyor.");
  }

  const f = Math.min(0.2, Math.max(0.01, trimFraction));

  for (const page of pages) {
    const { width, height } = page.getSize();
    const dx = width * f;
    const dy = height * f;
    const nw = Math.max(1, width - 2 * dx);
    const nh = Math.max(1, height - 2 * dy);
    page.setCropBox(dx, dy, nw, nh);
  }

  const out = await doc.save();
  return Buffer.from(out);
}
