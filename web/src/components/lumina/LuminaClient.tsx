"use client";

import { useState } from "react";
import { IconCloudSync, IconCloudUpload, IconCog, IconDeviceReader, IconMail } from "@/components/lumina/icons";
import { KoboOpdsSyncModal } from "@/components/lumina/KoboOpdsSyncModal";
import { SanctuaryDropzone } from "@/components/lumina/SanctuaryDropzone";

const shell = "mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12";

type Props = {
  kindleSenderDisplay: string | null;
};

export function LuminaClient({ kindleSenderDisplay }: Props) {
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0a0a0c] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.42]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(56, 189, 248, 0.12), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background: `
            radial-gradient(closest-side at 18% 22%, rgba(139, 92, 246, 0.14), transparent 72%),
            radial-gradient(closest-side at 82% 18%, rgba(56, 189, 248, 0.11), transparent 70%),
            radial-gradient(closest-side at 50% 38%, rgba(99, 102, 241, 0.08), transparent 68%),
            radial-gradient(ellipse 120% 70% at 50% -5%, rgba(167, 139, 250, 0.07), transparent 52%)
          `,
        }}
      />

      <header className={`relative z-10 flex shrink-0 items-center justify-between py-6 md:py-8 ${shell}`}>
        <div className="text-lg font-bold tracking-tight">Lumina Read</div>
        <button
          type="button"
          onClick={() => setSyncModalOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#94a3b8] backdrop-blur-md transition-colors hover:border-violet-400/30 hover:text-violet-200"
          aria-label="Kobo OPDS sync URL"
        >
          <IconCog className="h-5 w-5" />
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-4 md:px-10 md:pb-24 md:pt-6 lg:px-12">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <section className="mb-8 text-center md:mb-10" aria-labelledby="lumina-hero-title">
            <h1
              id="lumina-hero-title"
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08]"
            >
              Send to Sanctuary
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-sm font-normal leading-relaxed text-[#94a3b8]/95 sm:text-base md:text-lg">
              Your personal bridge between the digital world and the calm of your e-ink screen. Secure, fast, and
              whisper-quiet.
            </p>
          </section>
          <SanctuaryDropzone
            kindleSenderDisplay={kindleSenderDisplay}
            onOpenKoboSyncModal={() => setSyncModalOpen(true)}
          />

          <section
            className="mt-12 w-full max-w-2xl text-center md:mt-14"
            aria-labelledby="lumina-guide-heading"
          >
            <h3
              id="lumina-guide-heading"
              className="text-[15px] font-semibold leading-snug tracking-tight text-[#94a3b8] sm:text-base"
            >
              Simpler than a cable, faster than a cloud.
            </h3>
            <ol className="mt-8 grid list-none gap-8 text-[#94a3b8]/90 md:mt-9 md:grid-cols-3 md:gap-x-6 md:gap-y-8">
              <li className="flex flex-col items-center gap-2.5 px-1">
                <IconCloudUpload className="h-5 w-5 shrink-0 text-[#64748b]" aria-hidden />
                <p className="text-xs font-normal leading-relaxed sm:text-[13px]">
                  Drop your EPUB or PDF here. We handle the rest.
                </p>
              </li>
              <li className="flex flex-col items-center gap-2.5 px-1">
                <span className="flex items-center gap-1.5 text-[#64748b]" aria-hidden>
                  <IconMail className="h-5 w-5" />
                  <IconCloudSync className="h-5 w-5" />
                </span>
                <p className="text-xs font-normal leading-relaxed sm:text-[13px]">
                  Choose your Sanctuary. Kindle via Email or Kobo via Direct Sync.
                </p>
              </li>
              <li className="flex flex-col items-center gap-2.5 px-1">
                <IconDeviceReader className="h-5 w-5 shrink-0 text-[#64748b]" aria-hidden />
                <p className="text-xs font-normal leading-relaxed sm:text-[13px]">
                  Pick up your e-reader and start reading. We delete the file as soon as it&apos;s delivered.
                </p>
              </li>
            </ol>
            <p className="mx-auto mt-10 max-w-xl border-t border-white/[0.06] pt-8 text-[11px] font-normal leading-relaxed text-[#64748b] sm:text-xs">
              EPUBs are normalized to .kepub.epub for Kobo Direct Sync — tuned for on-device reading.
            </p>
          </section>
        </div>
      </main>

      <footer
        className={`relative z-10 shrink-0 border-t border-white/[0.05] py-6 ${shell}`}
      >
        <p className="mx-auto max-w-lg text-center text-[9px] font-extralight leading-relaxed tracking-[0.12em] text-[#64748b]/75 sm:text-[10px] sm:tracking-[0.14em]">
          Inspired by the vision of djazz. Evolved into Lumina Read — your bridge to digital calm.
        </p>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[10px] font-extralight leading-relaxed tracking-wide text-[#64748b]/90">
          <span>© 2026 Lumina Read · The Digital Sanctuary</span>
          <span className="text-white/[0.18]" aria-hidden>
            ·
          </span>
          <span className="text-[#64748b]">Crafted for Kindle &amp; Kobo</span>
        </p>
      </footer>

      <KoboOpdsSyncModal open={syncModalOpen} onClose={() => setSyncModalOpen(false)} />
    </div>
  );
}
