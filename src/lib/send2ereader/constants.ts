/** MIME + uzantı kapısı; PDF için pdf-lib, Kobo EPUB için JSZip tabanlı paketleme (kepubify/kindlegen yok). */

export const TYPE_EPUB = "application/epub+zip";
export const TYPE_MOBI = "application/x-mobipocket-ebook";

export const ALLOWED_TYPES = [
  TYPE_EPUB,
  TYPE_MOBI,
  "application/pdf",
  "application/vnd.comicbook+zip",
  "application/vnd.comicbook-rar",
  "text/html",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
] as const;

export const ALLOWED_EXTENSIONS = ["epub", "mobi", "pdf", "cbz", "cbr", "html", "txt"] as const;

/** Personal Documents e-postası için üst sınır (Amazon ~50 MB; biraz pay bırakıldı). */
export const MAX_KINDLE_EMAIL_BYTES = 48 * 1024 * 1024;
