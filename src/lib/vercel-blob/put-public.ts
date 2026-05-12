import { put, type PutBlobResult } from "@vercel/blob";

type PutBody = Parameters<typeof put>[1];
type PutOptions = Parameters<typeof put>[2];

/**
 * Vercel Blob `put` — her çağrıda `access: "public"` ve `BLOB_READ_WRITE_TOKEN` zorunlu.
 * Tüm dosya / KePub yükleme yolları bu yardımcı üzerinden gitmeli.
 */
export async function putPublicBlob(pathname: string, body: PutBody, options?: Omit<PutOptions, "access" | "token">): Promise<PutBlobResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  return put(pathname, body, {
    ...options,
    access: "public",
    token,
  });
}
