import { buildOpdsAcquisitionFeed } from "@/lib/sync/opds";
import { isValidSyncId } from "@/lib/sync/constants";
import { listSyncItems } from "@/lib/sync/feed-store";

function configuredPublicBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return null;
}

function baseUrlFromRequest(req: Request): string {
  const fixed = configuredPublicBaseUrl();
  if (fixed) return fixed;
  const u = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const proto = forwardedProto?.split(",")[0]?.trim() || "https";
    return `${proto}://${forwardedHost}`;
  }
  return u.origin;
}

export async function GET(req: Request, ctx: { params: Promise<{ syncId: string }> }) {
  const { syncId } = await ctx.params;
  if (!isValidSyncId(syncId)) {
    return new Response("Not found", { status: 404 });
  }

  let items;
  try {
    items = await listSyncItems(syncId);
  } catch {
    return new Response("Service unavailable", { status: 503 });
  }

  const base = baseUrlFromRequest(req);
  const xml = buildOpdsAcquisitionFeed(syncId, items, base);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
