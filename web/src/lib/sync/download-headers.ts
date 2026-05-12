import { koboKepubDownloadFilename } from "@/lib/sync/kobo-download-name";

export function koboAttachmentContentDisposition(originalName: string): string {
  const filename = koboKepubDownloadFilename(originalName);
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(filename).replace(/'/g, "%27");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
