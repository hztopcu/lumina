"use server";

import { Buffer } from "node:buffer";
import { extname } from "node:path";
import { Resend } from "resend";
import { cropPdfMarginsInMemory } from "@/lib/send2ereader/crop-pdf-margins";
import { assertSendToKindleEmail } from "@/lib/send2ereader/amazon-kindle-email";
import { transliterateAndSanitizeFilename } from "@/lib/send2ereader/filename-transliterate";
import { sanitizeKindlePersonalDocumentFilename } from "@/lib/send2ereader/kindle-filename";
import { validateEreaderUpload } from "@/lib/send2ereader/validate-document";

export type KindleSendState = {
  ok: boolean;
  message: string;
};

export async function sendKindleDocument(_prev: KindleSendState, formData: FormData): Promise<KindleSendState> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return {
      ok: false,
      message: "Sunucu yapılandırması eksik: RESEND_API_KEY ve RESEND_FROM ortam değişkenlerini ayarlayın.",
    };
  }

  const rawEmail = String(formData.get("kindleEmail") ?? "");
  let to: string;
  try {
    to = assertSendToKindleEmail(rawEmail);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Geçersiz alıcı." };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { ok: false, message: "No file or url selected" };
  }

  const wantTransliteration = formData.get("transliteration") === "on";

  const originalName = file.name || "upload.bin";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const validated = await validateEreaderUpload(originalName, file.type || "application/octet-stream", buffer);
  if (!validated.ok) {
    return { ok: false, message: validated.message };
  }

  const ext = extname(originalName).toLowerCase().replace(/^\./, "");
  let sendBuffer = buffer;
  if (ext === "pdf") {
    try {
      sendBuffer = Buffer.from(await cropPdfMarginsInMemory(buffer));
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "PDF kenar kırpma başarısız." };
    }
  }

  let filename = originalName;
  if (wantTransliteration) {
    filename = transliterateAndSanitizeFilename(filename);
  }
  if (/\.kepub\.epub$/i.test(filename)) {
    filename = filename.replace(/\.kepub\.epub$/i, ".epub");
  }
  filename = sanitizeKindlePersonalDocumentFilename(filename);

  const lowerFn = filename.toLowerCase();
  const contentType =
    lowerFn.endsWith(".pdf")
      ? "application/pdf"
      : lowerFn.endsWith(".mobi")
        ? "application/x-mobipocket-ebook"
        : lowerFn.endsWith(".epub")
          ? "application/epub+zip"
          : lowerFn.endsWith(".txt")
            ? "text/plain; charset=utf-8"
            : lowerFn.endsWith(".html") || lowerFn.endsWith(".htm")
              ? "text/html; charset=utf-8"
              : undefined;

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "",
    text: "",
    attachments: [
      {
        filename,
        content: sendBuffer,
        contentType,
      },
    ],
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: `Upload successful! Sent to a Kindle device.\nFilename: ${filename}${data?.id ? `\nMessage id: ${data.id}` : ""}`,
  };
}
