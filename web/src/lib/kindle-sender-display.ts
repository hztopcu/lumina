/**
 * UI'da gösterilecek onaylı gönderen adresi (RESEND_FROM veya açık env).
 */
export function getKindleSenderDisplayEmail(): string | null {
  const explicit = process.env.NEXT_PUBLIC_KINDLE_APPROVED_SENDER_EMAIL?.trim();
  if (explicit) return explicit;

  const from = process.env.RESEND_FROM?.trim();
  if (!from) return null;

  const angle = from.match(/<([^>]+)>/);
  if (angle?.[1]) return angle[1].trim();

  if (from.includes("@")) return from.trim();

  return null;
}
