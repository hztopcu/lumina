"use client";

import { useCallback, useMemo } from "react";
import { SYNC_COOKIE_NAME } from "@/lib/sync/constants";

const glass =
  "rounded-2xl border border-white/10 bg-[#0c0c10]/90 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(139,92,246,0.12),0_24px_48px_-12px_rgba(0,0,0,0.65)]";

function readSyncIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${SYNC_COOKIE_NAME}=([^;]*)`));
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function KoboOpdsSyncModal({ open, onClose }: Props) {
  const catalogUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const id = readSyncIdFromCookie();
    if (!id) return "";
    return `${window.location.origin}/api/sync/${id}`;
  }, [open]);

  const copyCatalog = useCallback(async () => {
    if (!catalogUrl) return;
    try {
      await navigator.clipboard.writeText(catalogUrl);
    } catch {
      /* ignore */
    }
  }, [catalogUrl]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opds-modal-title"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden p-6 sm:p-8 ${glass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300/80">Kobo</p>
        <h2 id="opds-modal-title" className="mt-2 text-xl font-semibold tracking-tight text-white">
          OPDS Sync URL
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
          Bu adresi Kobo&apos;da bir kez katalog olarak ekleyin. Yüklediğiniz kitaplar senkronizasyonla listelenir.
        </p>
        <div className="mt-5 rounded-xl border border-violet-500/20 bg-white/[0.04] px-3 py-3 font-mono text-[11px] leading-relaxed text-sky-100/95 backdrop-blur-md break-all">
          {catalogUrl || "Sayfayı yenileyip tekrar deneyin."}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyCatalog()}
            className="rounded-xl border border-white/12 bg-white/[0.08] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/[0.12]"
          >
            Kopyala
          </button>
          <a
            href={catalogUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-violet-500/35 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-100 transition-colors hover:border-violet-400/50 hover:bg-violet-500/15"
          >
            Önizle
          </a>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
