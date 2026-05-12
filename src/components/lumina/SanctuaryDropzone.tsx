"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { uploadKoboToSyncFeed, type KoboSyncFeedResult } from "@/app/actions/kobo-sync-feed";
import { sendKindleDocument, type KindleSendState } from "@/app/actions/send-kindle";
import { IconCloudSync, IconCloudUpload, IconMail } from "@/components/lumina/icons";

const glass =
  "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";

type Destination = "kindle" | "kobo";

type Props = {
  kindleSenderDisplay: string | null;
  /** Kindle → Kobo geçişinde OPDS modalını açar */
  onOpenKoboSyncModal?: () => void;
};

export function SanctuaryDropzone({ kindleSenderDisplay, onOpenKoboSyncModal }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [destination, setDestination] = useState<Destination>("kobo");
  const [koboResult, setKoboResult] = useState<KoboSyncFeedResult | null>(null);
  const [kindleResult, setKindleResult] = useState<KindleSendState | null>(null);
  const [pending, startTransition] = useTransition();

  const openPicker = () => inputRef.current?.click();

  const destRef = useRef<Destination>("kobo");
  destRef.current = destination;

  const runKoboForFile = useCallback((f: File) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", f);
      const r = await uploadKoboToSyncFeed(fd);
      setKoboResult(r);
    });
  }, []);

  const assignFile = useCallback(
    (f: File | null) => {
      setFile(f);
      setKoboResult(null);
      setKindleResult(null);
      if (f && destRef.current === "kobo") {
        queueMicrotask(() => runKoboForFile(f));
      }
    },
    [runKoboForFile],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    assignFile(f ?? null);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) assignFile(f);
  };

  const onPickDestination = (d: Destination) => {
    const from = destination;
    setDestination(d);
    setKoboResult(null);
    setKindleResult(null);
    if (d === "kobo" && file && from === "kindle") {
      onOpenKoboSyncModal?.();
    }
    if (d === "kobo" && file) {
      runKoboForFile(file);
    }
  };

  const submitKindleForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData(e.currentTarget);
    formData.set("file", file);
    startTransition(async () => {
      const r = await sendKindleDocument({ ok: false, message: "" }, formData);
      setKindleResult(r);
      if (r.ok) setFile(null);
    });
  };

  const showChooser = Boolean(file);

  return (
    <div className="relative z-10 w-full max-w-3xl">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={onInputChange}
        accept=".txt,.epub,.mobi,.pdf,.cbz,.cbr,.kepub.epub,application/epub+zip,application/epub,application/x-mobipocket-ebook,application/pdf,application/vnd.comicbook+zip,application/vnd.comicbook-rar"
      />

      <div
        className={`rounded-3xl bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-300 p-[1px] shadow-[0_0_50px_-10px_rgba(139,92,246,0.4)] transition-shadow ${dragOver ? "shadow-[0_0_60px_-6px_rgba(167,139,250,0.65)]" : ""}`}
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (e.currentTarget === e.target) setDragOver(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={openPicker}
          className="relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0a0a0c]/80 px-8 py-14 backdrop-blur-md sm:min-h-[320px]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(148, 163, 184, 0.08) 0%, transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 45%)",
          }}
        >
          <IconCloudUpload className="pointer-events-none h-16 w-16 text-violet-300/90 sm:h-20 sm:w-20" />
          <span className="pointer-events-none mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Drag &amp; Drop Documents</span>
          <span className="pointer-events-none mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">or click to browse</span>
          {file ? (
            <p className="pointer-events-none mt-4 max-w-md truncate text-center text-sm text-slate-300">
              <span className="text-[#94a3b8]">Selected: </span>
              <span className="font-medium text-white">{file.name}</span>
            </p>
          ) : null}
          {file ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                assignFile(null);
              }}
              className="pointer-events-auto mt-4 text-xs font-medium text-violet-300/90 underline-offset-2 hover:text-violet-200 hover:underline"
            >
              Clear file
            </button>
          ) : null}
        </div>
      </div>

      {showChooser ? (
        <div className="mt-5 flex justify-center">
          <div
            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl"
            role="tablist"
            aria-label="Delivery target"
          >
            <button
              type="button"
              role="tab"
              aria-selected={destination === "kindle"}
              onClick={() => onPickDestination("kindle")}
              className={
                destination === "kindle"
                  ? "flex items-center gap-2 rounded-full border border-violet-400/40 bg-white/[0.1] px-5 py-2.5 text-xs font-semibold tracking-wide text-white shadow-[0_0_20px_-4px_rgba(139,92,246,0.45)] sm:text-sm"
                  : "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide text-[#94a3b8] transition-colors hover:text-white sm:text-sm"
              }
            >
              <IconMail className="h-4 w-4 shrink-0 opacity-90" />
              Send to Kindle
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={destination === "kobo"}
              onClick={() => onPickDestination("kobo")}
              className={
                destination === "kobo"
                  ? "flex items-center gap-2 rounded-full border border-violet-400/40 bg-white/[0.1] px-5 py-2.5 text-xs font-semibold tracking-wide text-white shadow-[0_0_20px_-4px_rgba(139,92,246,0.45)] sm:text-sm"
                  : "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide text-[#94a3b8] transition-colors hover:text-white sm:text-sm"
              }
            >
              <IconCloudSync className="h-4 w-4 shrink-0 text-sky-200/90" />
              Get for Kobo
            </button>
          </div>
        </div>
      ) : null}

      {showChooser && destination === "kindle" ? (
        <div className={`relative z-20 mx-auto mt-6 max-w-md px-5 py-5 ${glass}`}>
          {kindleSenderDisplay ? (
            <p className="text-xs leading-relaxed text-[#94a3b8]">
              Amazon Kişisel Belgeler listesine ekleyin:{" "}
              <span className="font-mono font-semibold text-white">{kindleSenderDisplay}</span>
            </p>
          ) : (
            <p className="text-xs text-[#94a3b8]">
              <span className="font-mono">RESEND_FROM</span> veya <span className="font-mono">NEXT_PUBLIC_KINDLE_APPROVED_SENDER_EMAIL</span>{" "}
              ayarlayın.
            </p>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Konu ve gövde boş; yalnızca ek.</p>
          <form onSubmit={submitKindleForm} className="mt-4 flex flex-col gap-3">
            <label className="block text-xs font-medium text-[#94a3b8]">
              Send-to-Kindle email
              <input
                name="kindleEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="you@kindle.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none backdrop-blur-md placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-1 focus:ring-violet-500/30"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#94a3b8]">
              <input name="transliteration" type="checkbox" className="rounded border-white/20 bg-white/[0.04]" />
              Transliteration of filename
            </label>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(139,92,246,0.6)] transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send email"}
            </button>
          </form>
          {kindleResult?.message ? (
            <p className={`mt-3 whitespace-pre-wrap text-xs ${kindleResult.ok ? "text-emerald-400" : "text-rose-400"}`} role="status">
              {kindleResult.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {pending && destination === "kobo" && file ? (
        <p className="mt-4 text-center text-xs text-[#94a3b8]">Yükleniyor…</p>
      ) : null}

      {koboResult?.ok === true ? (
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-emerald-400/95">{koboResult.message}</p>
      ) : null}

      {koboResult?.ok === false ? (
        <p className="mt-4 max-w-md text-center text-xs text-rose-400/95">{koboResult.error}</p>
      ) : null}
    </div>
  );
}
