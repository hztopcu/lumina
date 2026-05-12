import { put, type PutBlobResult } from "@vercel/blob";

type PutBody = Parameters<typeof put>[1];
type PutOptions = Parameters<typeof put>[2];

/** Dashboard’dan kopyalanan token’da boşluk / sarmalayan tırnak hatalarını giderir */
function readBlobReadWriteToken(): string {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;
  if (raw == null || raw === "") return "";
  let t = raw.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

type PutPublicExtra = Omit<PutOptions, "access" | "token">;

/**
 * Vercel Blob `put` — `put(..., { access: "public", token })` ile her yükleme herkese açık URL alır.
 * `token` değeri **`process.env.BLOB_READ_WRITE_TOKEN`** üzerinden okunur (trim + tırnak temizliği).
 * "Private access" / yetkisiz indirme: Dashboard’da **Read/Write** token üretin; `.env`’de tırnak/boşluk olmasın.
 */
export async function putPublicBlob(pathname: string, body: PutBody, options?: PutPublicExtra): Promise<PutBlobResult> {
  const blobReadWriteToken = readBlobReadWriteToken();
  if (!blobReadWriteToken) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set, empty, or invalid. Use a fresh Read/Write token from Vercel → Storage → Blob.");
  }

  const extra: PutPublicExtra = options ?? {};

  return put(pathname, body, {
    ...extra,
    access: "public",
    token: blobReadWriteToken, // = process.env.BLOB_READ_WRITE_TOKEN (trim / tırnak temiz)
  });
}
