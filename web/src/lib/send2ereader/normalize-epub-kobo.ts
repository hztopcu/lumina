import { basename } from "node:path";
import JSZip from "jszip";

const MIMETYPE = "application/epub+zip";

function epubStemFromFilename(name: string): string {
  const base = basename(name).trim();
  const lower = base.toLowerCase();
  if (lower.endsWith(".kepub.epub")) return base.slice(0, -".kepub.epub".length);
  if (lower.endsWith(".epub")) return base.slice(0, -".epub".length);
  return base.replace(/\.[^/.]+$/, "");
}

/**
 * Kobo için sunucusuz EPUB işleme: OCF zip sırası + sıkıştırma düzeni (mimetype STORE),
 * içerik doğrulaması. kepubify ikilisinin yerine bellek içi, TypeScript/JSZip tabanlıdır.
 */
export async function normalizeEpubForKobo(
  input: Buffer,
  originalFilename: string,
): Promise<{ buffer: Buffer; filename: string }> {
  const zip = await JSZip.loadAsync(input);

  if (zip.files["META-INF/encryption.xml"]) {
    throw new Error("Şifreli EPUB bu akışta desteklenmiyor.");
  }

  const mimetypeEntry = zip.file("mimetype");
  if (!mimetypeEntry) {
    throw new Error("Geçersiz EPUB: mimetype dosyası yok.");
  }
  const mt = (await mimetypeEntry.async("string")).trim();
  if (mt !== MIMETYPE) {
    throw new Error(`Geçersiz EPUB mimetype: beklenen ${MIMETYPE}`);
  }

  const container = zip.file("META-INF/container.xml");
  if (!container) {
    throw new Error("Geçersiz EPUB: META-INF/container.xml yok.");
  }
  const containerXml = await container.async("string");
  if (!/<rootfile\b/i.test(containerXml)) {
    throw new Error("Geçersiz EPUB: paket (OPF) tanımı bulunamadı.");
  }

  const pathSet = new Set<string>();
  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (relativePath === "mimetype") return;
    if (relativePath.startsWith("__MACOSX/") || relativePath.endsWith(".DS_Store")) return;
    pathSet.add(relativePath.replace(/\\/g, "/"));
  });

  const out = new JSZip();
  out.file("mimetype", MIMETYPE, { compression: "STORE" });

  const ordered = [...pathSet].sort((a, b) => a.localeCompare(b));
  for (const p of ordered) {
    const entry = zip.file(p);
    if (!entry) continue;
    const data = await entry.async("nodebuffer");
    out.file(p, data, { compression: "DEFLATE" });
  }

  const buffer = await out.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const stem = epubStemFromFilename(originalFilename);
  const filename = `${stem || "book"}.kepub.epub`;

  return { buffer, filename };
}
