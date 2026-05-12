import { deleteBlobSafe, popSyncItem } from "@/lib/sync/feed-store";

/** İndirme tamamlandıktan sonra veya süre dolduğunda tek öğeyi kaldırır. */
export async function purgeSyncOrphan(syncId: string, itemId: string): Promise<void> {
  const removed = await popSyncItem(syncId, itemId);
  if (removed) {
    await deleteBlobSafe(removed.blobUrl);
  }
}
