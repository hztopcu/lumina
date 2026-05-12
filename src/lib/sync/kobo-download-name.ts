/**
 * Kobo "Advanced EPUB" indirme adı: [orijinal taban].kepub.epub
 * (send2ereader Kepubify çıktısıyla aynı isimlendirme fikri).
 */
export function koboKepubDownloadFilename(originalName: string): string {
  const trimmed = (originalName || "book").trim();
  let base = trimmed.replace(/\.kepub\.epub$/i, "").replace(/\.epub$/i, "").replace(/\.kepub$/i, "");
  if (!base) base = "book";
  return `${base}.kepub.epub`;
}
