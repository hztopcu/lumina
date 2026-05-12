import type { SyncFeedItem } from "@/lib/sync/feed-store";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Kobo / OPDS istemcileri için minimal acquisition feed (Atom + OPDS rel).
 */
export function buildOpdsAcquisitionFeed(syncId: string, items: SyncFeedItem[], baseUrl: string): string {
  const now = new Date().toISOString();
  const entries = items
    .map((item) => {
      const title = item.originalName.replace(/\.[^.]+$/, "") || "Book";
      const hrefRaw = `${baseUrl}/api/sync/${encodeURIComponent(syncId)}/download/${encodeURIComponent(item.id)}`;
      const href = hrefRaw.replace(/&/g, "&amp;");
      const updated = new Date(item.addedAt).toISOString();
      return `
  <entry>
    <title>${esc(title)}</title>
    <id>urn:lumina:sync:${syncId}:item:${item.id}</id>
    <updated>${updated}</updated>
    <link rel="http://opds-spec.org/acquisition" type="application/epub+zip" href="${href}"/>
  </entry>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">
  <id>urn:lumina:sync:${esc(syncId)}</id>
  <title>Lumina Direct Sync</title>
  <subtitle>Transit catalog — add books from lumina.read</subtitle>
  <updated>${now}</updated>
  ${entries}
</feed>`;
}
