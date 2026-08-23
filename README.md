# 🧰 ToolBox — Free, Installable, Browser-Only Utilities

![License](https://img.shields.io/badge/license-MIT-7C3AED)
![PWA](https://img.shields.io/badge/PWA-installable-EC4899)
![No Backend](https://img.shields.io/badge/backend-none-06B6D4)
![Made with](https://img.shields.io/badge/made%20with-HTML%20%2F%20CSS%20%2F%20JS-F59E0B)

A growing collection of free tools that run **entirely in the browser** — no server, no uploads, no accounts. Install it once as a PWA and it keeps working offline. Currently ships with a **batch MP4 → MP3 converter**; the project is structured so new tools can be dropped in as their own page without touching existing ones.

**Live demo:** replace this with your deployed URL once hosted (see [Deploying](#-deploying) below).

---

## ✨ Features

- 🎬 **MP4 → MP3, in bulk** — convert as many videos as you want in one go
- ⚙️ **Parallel Web Worker encoding** — audio encoding runs off the main thread across multiple workers, so the page never freezes
- 📦 **One-click ZIP export** — download every converted file together, with an optional auto-download once a batch finishes
- 🔒 **100% client-side** — files never leave the device; there is no backend to leak, rate-limit, or pay for
- 📲 **Installable PWA** — add-to-home-screen on mobile, installable app on desktop, works offline after first load
- 🔍 **SEO-complete** — meta tags, Open Graph, Twitter cards, JSON-LD (`WebSite`, `Organization`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList`), `robots.txt`, and `sitemap.xml` out of the box
- 🧩 **Built to grow** — every tool lives on its own page under `/tools/<tool-name>/` with its own SEO metadata, so adding tool #2, #3, #10 never bloats or breaks the existing ones

## 📁 Project Structure

```
.
├── index.html                  # Hub/landing page — lists every available tool
├── manifest.json               # Site-wide PWA manifest (icons, shortcuts, scope)
├── service-worker.js           # Offline caching for the whole site
├── robots.txt
├── sitemap.xml
├── LICENSE
├── assets/
│   ├── styles.css              # Shared design system used by every page
│   ├── pwa.js                  # Shared install-prompt + service worker bootstrap
│   └── encoder-worker.js       # Shared Web Worker (MP3 encoding today, reusable later)
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   └── apple-touch-icon.png
└── tools/
    └── mp4-to-mp3/
        └── index.html          # The converter itself — self-contained page + its own SEO tags
```

## 🚀 Deploying

Any static host works — there's no build step and no server code.

**GitHub Pages**
1. Push this repo to GitHub.
2. Settings → Pages → Source: `main` branch, root folder.
3. Your site is live at `https://<username>.github.io/<repo>/`.

**Netlify**
1. Drag this folder onto [Netlify Drop](https://app.netlify.com/drop), or connect the repo.
2. You get an HTTPS URL immediately.

**Vercel**
1. `vercel.com` → New Project → import this repo (framework preset: "Other").

> ⚠️ **PWA install and offline mode require HTTPS** (or `localhost`). Opening `index.html` by double-clicking it (`file://`) will still let you convert files, but the install button and offline caching won't activate — that's a browser security rule, not a bug in this project.

### Point it at your own domain
Search-and-replace `https://example.com` across `index.html`, every file under `tools/`, `robots.txt`, and `sitemap.xml` with your real domain. This is what makes Open Graph previews, Twitter cards, and Google Search Console line up correctly.

## ➕ Adding a New Tool

The project is deliberately laid out so a new tool never touches existing files. To add one:

1. **Create a folder:** `tools/<your-tool-slug>/`
2. **Add its page:** `tools/<your-tool-slug>/index.html`. Copy the `<head>` block from `tools/mp4-to-mp3/index.html` as a template and update:
   - `<title>` and `<meta name="description">` — unique to this tool
   - `<link rel="canonical">` and the Open Graph / Twitter `url` fields
   - The `BreadcrumbList` and `SoftwareApplication` JSON-LD blocks
   - Link to the shared stylesheet/scripts with `../../assets/...` (same depth as the MP3 tool) and set `window.PWA_ROOT = '../../';` before loading `pwa.js`
3. **Add a card to the hub:** in `index.html`, duplicate a `.tool-card` block inside `.tool-grid` and point it at `tools/<your-tool-slug>/index.html`.
4. **Register it for offline use:** add `'./tools/<your-tool-slug>/index.html'` to the `APP_SHELL` array in `service-worker.js`.
5. **Tell search engines:** add a new `<url>` entry to `sitemap.xml` (there's a commented example already in the file).
6. **(Optional) Add a shortcut:** list it under `"shortcuts"` in `manifest.json` for quick access after install.

That's the whole process — each tool is a self-contained page with its own description, SEO metadata, and (if needed) its own scripts, so the codebase scales without any single file becoming a dumping ground.

## 🛠 How the Converter Works

1. The video file is read and decoded in-browser with the **Web Audio API** (`decodeAudioData`).
2. The raw PCM samples are handed off to a **Web Worker** running [`lamejs`](https://github.com/zhuker/lamejs), a pure-JavaScript MP3 encoder, so encoding never blocks the UI thread.
3. Multiple files are processed **in parallel** across a small pool of workers (sized to the device's CPU cores).
4. Finished files can be downloaded individually, or all together as a single ZIP via [`JSZip`](https://stuk.github.io/jszip/) — with an optional auto-download once a batch completes.

### Known limitations
- Very long or very large videos use more RAM/time, since decoding happens in browser memory.
- Audio-codec decoding support varies slightly by browser; Chrome, Edge, and Safari cover the widest range of formats.
- Multi-gigabyte files can be slow on lower-end mobile devices.

## 🤝 Contributing

Issues and pull requests are welcome — especially new tools that follow the structure above. Please keep new tools dependency-light and 100% client-side to stay true to the project's "nothing ever uploaded" promise.

## 📄 License

[MIT](./LICENSE)
