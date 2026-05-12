import sanitize from "sanitize-filename";
import { transliterate } from "transliteration";

/** `send2ereader/index.js` `doTransliterate` + multer sonrası `sanitize` davranışı. */
export function transliterateAndSanitizeFilename(filename: string): string {
  const parts = filename.split(".");
  const ext = "." + parts.splice(-1).join(".");
  const base = parts.join(".");
  return sanitize(transliterate(base) + ext);
}
