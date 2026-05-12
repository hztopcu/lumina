/**
 * Kindle tarayıcı indirmesi için `send2ereader/index.js` (satır 314–316) ile aynı kural:
 * yalnızca `.`, harf, rakam, `_`, `-`, `"`, `'`, `(` `)` — aksi `_` olur.
 */
export function sanitizeKindlePersonalDocumentFilename(filename: string): string {
  return filename.replace(/[^\.\w\-"'()]/g, "_");
}
