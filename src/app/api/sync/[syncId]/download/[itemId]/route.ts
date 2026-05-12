import { after } from "next/server";
import { isValidSyncId } from "@/lib/sync/constants";
import { listSyncItems } from "@/lib/sync/feed-store";
import { koboAttachmentContentDisposition } from "@/lib/sync/download-headers";
import { purgeSyncOrphan } from "@/lib/sync/purge-item";

const POST_FETCH_CLEANUP_MS = 5_000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ syncId: string; itemId: string }> },
) {
  const { syncId, itemId } = await ctx.params;

  if (!isValidSyncId(syncId) || !isValidSyncId(itemId)) {
    return new Response("Not found", { status: 404 });
  }

  let items;
  try {
    items = await listSyncItems(syncId);
  } catch {
    return new Response("Service unavailable", { status: 503 });
  }

  const item = items.find((i) => i.id === itemId);
  if (!item) {
    return new Response("Not found", { status: 404 });
  }

  let blobRes: Response;
  try {
    blobRes = await fetch(item.blobUrl);
  } catch {
    return new Response("Gone", { status: 410 });
  }

  if (!blobRes.ok || !blobRes.body) {
    return new Response("Gone", { status: 410 });
  }

  after(async () => {
    await sleep(POST_FETCH_CLEANUP_MS);
    await purgeSyncOrphan(syncId, itemId);
  });

  return new Response(blobRes.body, {
    status: 200,
    headers: {
      "Content-Type": "application/epub+zip",
      "Content-Disposition": koboAttachmentContentDisposition(item.originalName),
      "Cache-Control": "no-store",
    },
  });
}
