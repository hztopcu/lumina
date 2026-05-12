/** Tarayıcıdaki anonim Kobo Direct Sync kimliği (middleware ile atanır). */
export const SYNC_COOKIE_NAME = "lumina_sync_id";

/** Feed + öğe listesi KV TTL (liste başına). */
export const SYNC_LIST_KV_EX_SECONDS = 7 * 24 * 60 * 60;

/** İndirilmediyse Blob + KV temizliği: 1 saat. */
export const SYNC_ORPHAN_CLEANUP_MS = 60 * 60 * 1000;

/** Tek sync kuyruğunda en fazla kitap. */
export const SYNC_MAX_ITEMS = 24;

export function syncItemsKey(syncId: string): string {
  return `sync:feed:${syncId}`;
}

export function isValidSyncId(syncId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(syncId);
}
