import { del } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { SYNC_LIST_KV_EX_SECONDS, SYNC_MAX_ITEMS, syncItemsKey } from "@/lib/sync/constants";

export type SyncFeedItem = {
  id: string;
  blobUrl: string;
  originalName: string;
  addedAt: number;
};

function parseItems(raw: unknown): SyncFeedItem[] {
  if (raw == null) return [];
  try {
    const s = typeof raw === "string" ? raw : JSON.stringify(raw);
    const arr = JSON.parse(s) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is SyncFeedItem =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as SyncFeedItem).id === "string" &&
        typeof (x as SyncFeedItem).blobUrl === "string" &&
        typeof (x as SyncFeedItem).originalName === "string",
    );
  } catch {
    return [];
  }
}

export async function listSyncItems(syncId: string): Promise<SyncFeedItem[]> {
  const raw = await kv.get(syncItemsKey(syncId));
  return parseItems(raw);
}

export async function saveSyncItems(syncId: string, items: SyncFeedItem[]): Promise<void> {
  await kv.set(syncItemsKey(syncId), JSON.stringify(items), { ex: SYNC_LIST_KV_EX_SECONDS });
}

/**
 * Öğeyi listeden çıkarır; silinen öğeyi döndürür (blob silmek için).
 */
export async function popSyncItem(syncId: string, itemId: string): Promise<SyncFeedItem | null> {
  const key = syncItemsKey(syncId);
  const items = await listSyncItems(syncId);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  const [removed] = items.splice(idx, 1);
  if (items.length === 0) {
    await kv.del(key).catch(() => {});
  } else {
    await saveSyncItems(syncId, items);
  }
  return removed ?? null;
}

export async function appendSyncItem(syncId: string, item: SyncFeedItem): Promise<void> {
  const items = await listSyncItems(syncId);
  items.push(item);
  while (items.length > SYNC_MAX_ITEMS) {
    const evicted = items.shift();
    if (evicted?.blobUrl) {
      await del(evicted.blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
    }
  }
  await saveSyncItems(syncId, items);
}

export async function deleteBlobSafe(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  await del(url, { token }).catch(() => {});
}
