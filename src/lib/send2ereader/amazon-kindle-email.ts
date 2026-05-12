/**
 * Amazon Send to Kindle e-posta adresleri.
 * @see https://www.amazon.com/gp/sendtokindle/email
 */
const SEND_TO_KINDLE_RE = /^[^\s@]+@(kindle|free\.kindle)\.com$/i;

export function normalizeSendToKindleEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isSendToKindleEmail(email: string): boolean {
  return SEND_TO_KINDLE_RE.test(normalizeSendToKindleEmail(email));
}

export function assertSendToKindleEmail(email: string): string {
  const normalized = normalizeSendToKindleEmail(email);
  if (!normalized) {
    throw new Error("Kindle e-posta adresi gerekli.");
  }
  if (!SEND_TO_KINDLE_RE.test(normalized)) {
    throw new Error(
      "Geçerli bir Send to Kindle adresi kullanın (ör. you@kindle.com veya you@free.kindle.com).",
    );
  }
  return normalized;
}
