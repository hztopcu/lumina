"use server";

import { Buffer } from "node:buffer";
import { basename } from "node:path";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { cookies } from "next/headers";
import { putPublicBlob } from "@/lib/vercel-blob/put-public";
import { SYNC_COOKIE_NAME, SYNC_ORPHAN_CLEANUP_MS, isValidSyncId } from "@/lib/sync/constants";
import { appendSyncItem, deleteBlobSafe } from "@/lib/sync/feed-store";
import { purgeSyncOrphan } from "@/lib/sync/purge-item";
import { normalizeEpubForKobo } from "@/lib/send2ereader/normalize-epub-kobo";
import { validateEreaderUpload } from "@/lib/send2ereader/validate-document";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export type KoboSyncFeedResult = { ok: true; message: string } | { ok: false; error: string };

export async function uploadKoboToSyncFeed(formData: FormData): Promise<KoboSyncFeedResult> {
  if (!kvConfigured() || !blobConfigured()) {
    return { ok: false, error: "KV veya Blob yapılandırması eksik." };
  }

  const jar = await cookies();
  const syncId = jar.get(SYNC_COOKIE_NAME)?.value ?? "";
  if (!isValidSyncId(syncId)) {
    return { ok: false, error: "Oturum bulunamadı; sayfayı yenileyip tekrar deneyin." };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "Dosya seçilmedi." };
  }

  const originalName = file.name || "book.epub";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const validated = await validateEreaderUpload(originalName, file.type || "application/octet-stream", buffer);
  if (!validated.ok) {
    return { ok: false, error: validated.message };
  }

  const lower = originalName.toLowerCase();
  if (!lower.endsWith(".epub") && !lower.endsWith(".kepub.epub")) {
    return { ok: false, error: "Kobo Direct Sync yalnızca .epub veya .kepub.epub kabul eder." };
  }

  let uploadBuffer = buffer;
  let uploadName = basename(originalName);
  try {
    const normalized = await normalizeEpubForKobo(buffer, originalName);
    uploadBuffer = Buffer.from(normalized.buffer);
    uploadName = normalized.filename;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "EPUB işlenemedi." };
  }

  const itemId = randomUUID();
  const pathname = `sync/${syncId}/${itemId}-${encodeURIComponent(uploadName).slice(0, 64)}`;

  let url: string;
  try {
    const blob = await putPublicBlob(pathname, uploadBuffer, {
      contentType: "application/epub+zip",
      cacheControlMaxAge: 60,
    });
    url = blob.url;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Yükleme hatası." };
  }

  try {
    await appendSyncItem(syncId, {
      id: itemId,
      blobUrl: url,
      originalName: uploadName,
      addedAt: Date.now(),
    });
  } catch (e) {
    await deleteBlobSafe(url);
    return { ok: false, error: e instanceof Error ? e.message : "Katalog güncellenemedi." };
  }

  after(async () => {
    await sleep(SYNC_ORPHAN_CLEANUP_MS);
    await purgeSyncOrphan(syncId, itemId);
  });

  return {
    ok: true,
    message: "Kitabınız hazır. Kobo cihazınızda Senkronize Et butonuna basın.",
  };
}
