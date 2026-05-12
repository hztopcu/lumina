import { fileTypeFromBuffer } from "file-type";
import { extname } from "path";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_TYPES,
  MAX_KINDLE_EMAIL_BYTES,
  TYPE_EPUB,
} from "@/lib/send2ereader/constants";

function extFromName(originalName: string): string {
  return extname(originalName.toLowerCase()).replace(/^\./, "");
}

/**
 * Sunucu tarafı doğrulama — `send2ereader` `/upload` + `FileType.fromFile` dalı ile uyumlu.
 * `(!type || !allowedTypes.includes(type.mime)) && !allowedTypes.includes(mimetype)` → reddet.
 */
export async function validateEreaderUpload(
  originalName: string,
  declaredMime: string,
  buffer: Buffer,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (buffer.length === 0) {
    return { ok: false, message: "Invalid file submitted (empty file)" };
  }
  if (buffer.length > MAX_KINDLE_EMAIL_BYTES) {
    return {
      ok: false,
      message: `Dosya çok büyük (maks. ${Math.floor(MAX_KINDLE_EMAIL_BYTES / (1024 * 1024))} MB).`,
    };
  }

  const ext = extFromName(originalName);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      ok: false,
      message: `Geçersiz uzantı: .${ext || "?"} (İzinliler: ${ALLOWED_EXTENSIONS.join(", ")})`,
    };
  }

  let mimetype = declaredMime || "application/octet-stream";
  const sniffed = await fileTypeFromBuffer(buffer);

  if (mimetype === "application/octet-stream" && sniffed) {
    mimetype = sniffed.mime;
  }

  if (mimetype === "application/epub") {
    mimetype = TYPE_EPUB;
  }

  const sniffedOk = sniffed && ALLOWED_TYPES.includes(sniffed.mime as (typeof ALLOWED_TYPES)[number]);
  const declaredOk = ALLOWED_TYPES.includes(mimetype as (typeof ALLOWED_TYPES)[number]);

  if (!sniffedOk && !declaredOk) {
    const hint = sniffed ? sniffed.mime : "unknown mimetype";
    return {
      ok: false,
      message: `Uploaded file is of an invalid type: ${originalName} (${hint})`,
    };
  }

  return { ok: true };
}
