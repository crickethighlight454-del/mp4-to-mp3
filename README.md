# MP4 to MP3 Converter — Full PWA (SEO Complete)

Yeh ek **poori tarah client-side** batch video-to-audio converter PWA hai. Koi backend/server nahi chahiye.

## Files
- `index.html` — poora app (UI + conversion logic + SEO tags)
- `manifest.json` — PWA install config
- `service-worker.js` — offline caching
- `icons/` — app icons (192, 512, apple-touch)
- `robots.txt`, `sitemap.xml` — search engine SEO files

## Host Kaise Karein (3 free tareeqay)

**1. GitHub Pages (sabse asaan)**
1. Naya GitHub repo banayein, in sab files ko upload karein.
2. Repo Settings → Pages → Source: `main` branch, root folder select karein.
3. Aapko `https://yourusername.github.io/repo-name/` par live link mil jayega.

**2. Netlify**
1. netlify.com par account banayein.
2. Is folder ko seedha drag-and-drop karein (Netlify Drop).
3. Turant HTTPS link mil jayega — PWA install bhi wahin se test ho sakti hai.

**3. Vercel**
1. `vercel.com` → New Project → yeh folder upload/deploy karein.

> **Zaroori:** PWA (service worker + install prompt) sirf **HTTPS** ya `localhost` par kaam karta hai — file ko seedha double-click kar ke kholne se install/offline feature kaam nahi karega, lekin conversion phir bhi chalegi.

## Apna Domain Set Karein (SEO ke liye)
`index.html`, `robots.txt`, aur `sitemap.xml` mein jahan bhi `https://example.com` likha hai, wahan apna asal domain daal dein — is se Google Search Console aur social share previews sahi kaam karenge.

## Kaise Kaam Karta Hai (Technical)
- Video file browser ke andar `Web Audio API` (`decodeAudioData`) se decode hoti hai.
- Audio samples ko `lamejs` (pure JavaScript MP3 encoder) se MP3 mein encode kiya jata hai.
- Bulk download ke liye `JSZip` se sab MP3s ek ZIP mein pack hote hain.
- Koi file kisi server par nahi jaati — sab kuch user ki apni device par hota hai.

## Limitations (Imandari se batana zaroori hai)
- Bohat lambi (1+ ghanta) ya bohat badi videos convert karne mein zyada RAM/waqt lag sakta hai kyunke sab kuch browser memory mein hota hai.
- Kuch purane/niche browsers har video codec ki audio decode nahi kar paate (Chrome/Edge/Safari mein sab se behtar kaam karta hai).
- Bohat bari files (jaise 1GB+) mobile browsers par slow ho sakti hain.

## Aage Behtar Banane Ke Ideas
- Web Worker mein encoding move karein taake UI kabhi bhi freeze na ho.
- Trim/cut audio, ya sirf ek hissa convert karne ka option add karein.
- Google Analytics ya Plausible add kar ke traffic track karein (SEO ke saath).
- `sitemap.xml` mein aur pages add karein agar future mein blog/guide pages banayein (jaise "MP4 to MP3 kaise karein" guide) — is se organic traffic aur badhega.
