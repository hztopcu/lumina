# Lumina Read

**A sanctuary for your e-ink world**

---

## Introduction

**Lumina Read** is a calm, wireless bridge between your computer and your **Kindle** or **Kobo** e-reader. It is built around a **transit** idea: files are validated, delivered through the right channel, and **not kept as a personal library on the server**. The interface stays focused on drag-and-drop; setup for Kobo (OPDS sync URL) stays a click away without cluttering the main flow.

---

## Key Features

| | |
| :-- | :-- |
| **Native KePub** | EPUB uploads for Kobo are packaged for **Advanced EPUB (`.kepub.epub`)** delivery—tuned for Direct Sync and on-device reading, without legacy desktop converters on the server. |
| **Direct Sync** | A per-session **OPDS-style sync feed** so Kobo (and tooling like KoboCloud) can pull new books after you drop a file—no short-lived codes, just a bookmarkable catalog URL. |
| **Kindle via Email** | **Resend** sends your document to **Send to Kindle** with sensible filenames and MIME types, including EPUB where appropriate. |
| **Privacy first** | Transit storage on **Vercel Blob** plus catalog metadata in **Upstash KV** is designed to **expire**: after download or a scheduled window, artifacts are removed so nothing lingers by design. |

---

## How it works

1. **Drop** your EPUB, PDF, or other supported format on the sanctuary dropzone.
2. **Choose** delivery: **Kindle** (email + optional transliteration) or **Kobo** (Direct Sync to your feed).
3. **Read** on your e-reader—sync or open your mail, then enjoy. Lumina clears the path behind you.

For Kobo, add your **OPDS Sync URL** once (from the settings control); new uploads appear on the next sync.

---

## Tech stack

| Layer | Choice |
| :-- | :-- |
| App framework | **Next.js** (App Router, Server Actions) |
| Object storage | **Vercel Blob** (transit binaries) |
| Catalog / queue | **Upstash** via **Vercel KV** |
| Transactional email | **Resend** |
| Edge polish | **Middleware** for sync cookies and reader-friendly cache headers on sync routes |

Supporting libraries include **file-type** (magic-byte validation), **jszip** (EPUB packaging), **pdf-lib** (in-memory PDF margin trim for email path), and **sanitize-filename** / **transliteration** where needed.

---

## Self-hosting

You can deploy this app to your own **Vercel** project and connect the services below. Copy `.env.example` to `.env` locally, then add the same variables in the Vercel project **Settings → Environment Variables** (Production / Preview as needed).

### Environment variables

| Variable | Required | Purpose |
| :-- | :--: | :-- |
| `RESEND_API_KEY` | Yes* | Resend API key for outbound email |
| `RESEND_FROM` | Yes* | Verified sender, e.g. `Lumina Read <noreply@yourdomain.com>` |
| `NEXT_PUBLIC_KINDLE_APPROVED_SENDER_EMAIL` | No | Shown in UI as the approved sender users should add at Amazon |
| `NEXT_PUBLIC_APP_URL` | No | Public site URL for correct OPDS acquisition links if proxies strip `Host` |
| `KV_REST_API_URL` | Yes† | Upstash REST URL for Vercel KV |
| `KV_REST_API_TOKEN` | Yes† | Upstash REST token |
| `BLOB_READ_WRITE_TOKEN` | Yes† | Vercel Blob read/write token |

\*Required for **Kindle** email delivery.  
†Required for **Kobo Direct Sync** (blob + catalog).

### Quick start (local)

```bash
cd web
cp .env.example .env
# fill in secrets
npm install
npm run dev
```

Build check:

```bash
npm run build
```

Deploy the `web` directory (or monorepo root configured to build `web`) to Vercel; enable **Blob** and **KV** on the same team and attach tokens as above.

---

## Credits & respect

Inspired by the original vision of **djazz** and the [send.djazz.se](https://send.djazz.se/) idea—simple, reader-first delivery. **Lumina Read** modernizes and re-imagines that spirit for the **serverless** era: no local `kepubify` / `kindlegen` / `pdfcropmargins` binaries on the edge, but the same user promise—**from file to e-ink, with minimal friction**.

---

## About the author

The project is maintained by someone with a professional background at the intersection of **technology and marketing operations**—including experience as a **Senior Event & Marketing Manager**—combined with a disciplined interest in **AI-assisted development**: using automation where it helps, and keeping architecture understandable for humans who ship and operate the product.

---

## License

This project is released under the **[MIT License](./LICENSE)**.

---

<p align="center"><sub>Lumina Read · The Digital Sanctuary</sub></p>
