# TOEFL HACK by ZOOPER ACADEMY — Landing Page

Landing page ringan, cepat, dan siap iklan Facebook. Dibangun dengan Tailwind CDN, interaktif untuk mobile, dan sudah terpasang Facebook Pixel + Conversions API (CAPI) via serverless function.

## Fitur
- **UI profesional & responsif** dengan Tailwind.
- **Interaktif**: mobile menu, FAQ accordion, testimonial slider (auto + swipe), animasi scroll, sticky mobile CTA.
- **Branding**: warna biru/emas konsisten dengan logo.
- **Favicon & PWA tags** siap (butuh file ikon sesuai ukuran).
- **Facebook Pixel** (client) dan **CAPI** (server) untuk PageView, Lead, Contact.

## Struktur Proyek
```
lp/
├─ index.html                # Halaman utama (dipakai untuk deploy)
├─ toefl-hack-landing.html   # Salinan/backup halaman
├─ api/
│  └─ meta-capi.js          # Serverless (Vercel) Conversions API
└─ assets/
   ├─ logo.png               # Logo brand
   ├─ site.webmanifest       # Manifest PWA
   └─ favicon/
      ├─ favicon.ico
      ├─ favicon-16x16.png
      ├─ favicon-32x32.png
      ├─ apple-touch-icon.png
      ├─ android-chrome-192x192.png
      ├─ android-chrome-512x512.png
      └─ safari-pinned-tab.svg
```

## Persiapan Lokal
- Buka `index.html` langsung di browser; atau jalankan server statis (opsional).
- Pastikan aset logo dan favicon berada pada path di atas agar tidak 404.

## Variabel Lingkungan (Vercel)
Set di Vercel → Project → Settings → Environment Variables (Production & Preview):
- `META_PIXEL_ID` = Pixel ID (contoh: `600857419781134`)
- `META_ACCESS_TOKEN` = Meta Access Token (jangan ditaruh di frontend)
- (opsional) `META_TEST_EVENT_CODE` = kode test dari Events Manager

Setelah menambahkan ENV, lakukan Redeploy agar function membaca konfigurasi baru.

## Deploy ke Vercel
1. Push folder ini ke repo Git (GitHub/GitLab/Bitbucket).
2. Vercel Dashboard → New Project → Import repo.
3. Framework: pilih "Other" (static + functions).
4. Deploy, lalu tambahkan custom domain jika diinginkan.

## Facebook Pixel & CAPI
- Pixel client code berada di `<head>` `index.html` dan melacak `PageView` otomatis.
- Event yang dikirim:
  - **PageView**: saat halaman dimuat (Pixel + CAPI)
  - **Lead**: klik CTA `#daftar` dan `#harga`
  - **Contact**: klik CTA "Tanya Dulu" dan sticky "Tanya"
- CAPI endpoint: `api/meta-capi.js` (serverless Vercel)
  - Menggunakan `META_PIXEL_ID` dan `META_ACCESS_TOKEN` dari ENV
  - Otomatis mengirim `client_ip_address` & `client_user_agent` dari header
  - Mendukung `META_TEST_EVENT_CODE` (opsional) untuk verifikasi di Test Events
- Frontend menyertakan `_fbp` dan `_fbc` (atau membangun `fbc` dari `fbclid` di URL) agar signal cocok dengan Pixel.

### Uji Coba Tracking
- Gunakan Chrome extension "Meta Pixel Helper" untuk cek Pixel (client).
- Events Manager → Pixel → tab Test Events untuk CAPI (isi `META_TEST_EVENT_CODE` jika perlu).

## Kustomisasi
- **Logo**: ganti `assets/logo.png` dengan logo final.
- **Warna brand**: di `index.html`, bagian `tailwind.config` warna `brand` & `accent` bisa disesuaikan.
- **CTA Link**: ubah `href` tombol "Tanya Dulu"/"Tanya" ke WhatsApp/Form/Link tujuan.
- **SEO/OG**: tambahkan meta Open Graph (title, description, image) sesuai kebutuhan.

## Favicon & Manifest
Pastikan file favicon ada di `assets/favicon/` sesuai referensi di `index.html`. Ukuran yang umum:
- `apple-touch-icon.png` → 180x180
- `favicon-32x32.png` → 32x32
- `favicon-16x16.png` → 16x16
- `android-chrome-192x192.png` → 192x192
- `android-chrome-512x512.png` → 512x512
- `favicon.ico` → multi-size (16/32)

## Troubleshooting
- **Favicons 404**: periksa penempatan file di `assets/favicon/` dan path link di `<head>`.
- **CAPI error 400/401**: cek `META_ACCESS_TOKEN`, `META_PIXEL_ID`, dan log Functions di Vercel.
- **Event tidak muncul di Test Events**: pastikan `META_TEST_EVENT_CODE` di ENV dan redeploy.
- **Pixel Helper warning**: biasanya terkait caching/3rd-party-block. Selama Events Manager mencatat event, setup sudah berfungsi.
- **CORS**: endpoint mengizinkan `*` untuk POST/OPTIONS. Jika domain akan dibatasi, update header CORS di `api/meta-capi.js`.

## Keamanan
- Jangan pernah menaruh Access Token di client. Simpan di ENV server (Vercel) saja.
- Pertimbangkan menyamarkan informasi sensitif di repo publik (gunakan ENV References di Vercel).

---

Jika butuh: integrasi form lead (email/phone) dengan hashing SHA-256 di frontend + pengiriman ke CAPI untuk meningkatkan match rate, integrasi WhatsApp direct, atau penambahan OG tags khusus iklan. Silakan minta penyesuaian lanjut.
