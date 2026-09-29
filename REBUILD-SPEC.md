# Spesifikasi rebuild spabalimoon.com

Tujuan: membangun ulang situs yang sekarang online dengan kode bersih, sambil
mempertahankan tampilannya **sama persis**. Bukan redesain.

Acuan kebenaran: mirror byte-exact di `D:\Next.js Data\new-spa\site`, dijalankan
dengan `npm start` di folder itu (port 3200). Setiap nilai di dokumen ini
diambil dari situs live, bukan dikira-kira.

## Kenapa dibangun ulang

Diukur pada beranda situs live:

| | |
|---|---|
| Aturan CSS terkirim | 5.488 |
| Yang benar-benar dipakai | 806 — **14,7%** |
| CSS terbuang | **448 KB dari 545 KB** |
| JS beranda | 854 KB dalam 22 chunk (110 KB di antaranya polyfill) |

File theme `2b2816c0b48ea140.css` sendirian 507 KB dengan 5.201 aturan, hanya
10,9% terpakai. Situs juga masih menyertakan 6 varian font Font Awesome Pro dan
sekitar 30 halaman demo bawaan theme (`/index-*`, `/shop-*`, `/team`,
`/testimonials`) yang tidak dipakai.

Gambar **tidak** bermasalah: lazy-load sudah jalan, beranda hanya memuat 229 KB
gambar. Jadi target penghematan ada di CSS dan JS.

## Design system (diambil dari CSS live)

```
--theme-color1           #a78627   emas, warna aksen utama
--theme-color2           #1c1a1d   ink, warna gelap utama
--headings-color         #1c1a1d
--text-color             #707070   teks isi
--text-color2            #c4c4c4   teks sekunder
--review-color           #ffc737   bintang rating
--theme-color-cream      #f2e6dd
--theme-color-gray       #f5f2ec
--theme-color-gray2      #fdf6f2
--theme-light-background #f8f6f1
--dark-color1..4         #111 / #232323 / #343434 / #212529
```

Tipografi:

```
judul   "Literata", serif
teks    "Mulish"
h1 72px · h2 50px · h3 36px · h4 24px · h5 22px · h6 20px   (semua weight 400)
body    16px, line-height 1.75
judul   line-height 1.2
```

Keduanya self-hosted di `/webfonts/` pada situs live — pakai `next/font` agar
tetap tanpa permintaan ke Google.

## Struktur beranda (11 seksi)

Tinggi diukur pada viewport 1024px. Total tinggi dokumen **13.232px**.

| # | Kicker | Judul | Tinggi | Catatan |
|---|---|---|---|---|
| 0 | — | Our Seminyak Day Spa | 1030 | hero, ornamen bunga kamboja beranimasi |
| 1 | Book via WhatsApp | How Do You Book Your Spa Experience? | 797 | 4 langkah |
| 2 | Beyond Relaxation | Why Spa Bali Moon Is Part of the Bali Experience | 951 | |
| 3 | From IDR 159K \| 1 Hour | — | 667 | slider treatment |
| 4 | — | — | 515 | slider testimoni |
| 5 | Our Spa Menu | Browse Our Spa Treatments | 2626 | katalog, seksi terpanjang |
| 6 | More to Enjoy | Looking for More Than One Treatment? | 700 | |
| 7 | Spa Packages | Complete Relaxation in One Visit | 1527 | |
| 8 | Why It Matters | What Makes Spa Bali Moon Different | 856 | |
| 9 | Frequently Asked Questions | Time to Unwind | 1593 | |
| 10 | — | A Better Way to Experience Wellness in Bali | 762 | CTA penutup |

Header 150px. Ada dua slider Swiper (seksi 3 dan 4) dan tombol WhatsApp
mengambang.

## Halaman yang harus ada (42)

Beranda · contact · reservation · guide + 7 artikel · seminyak (pricelist) +
23 halaman treatment · massage-kuta · outcall-home-service-massage ·
villa-hotel-massage · wellness-in-bali · privacy-policy · terms-and-conditions

Sekitar 30 halaman demo theme **tidak** dibangun ulang — itu justru sampah yang
ingin dibuang.

## Perilaku yang wajib dipertahankan

- `trailingSlash: true`. Tanpa slash → 308 ke bentuk berslash.
- 28 redirect 301 dari URL lama ke `/seminyak/...`, sudah ada di
  `src/data/redirects.ts` dan terpasang di `next.config.ts`.
- `/api/search-posts/`: `?menu=1` mengembalikan seluruh artikel;
  `?q=` mencocokkan judul + excerpt, case-insensitive, minimal 2 huruf;
  selain itu daftar kosong. Semantik ini diuji langsung ke endpoint produksi.
- `/api/subscribe/`: POST `{email}` → `{success, message}`; GET → 405.
- Halaman 404 asli tetap dibalas dengan status 404.

## Cara memverifikasi kemiripan

Metodenya sudah terbukti saat membuat mirror: ambil sidik jari DOM dari kedua
situs — untuk setiap elemen yang tampak, catat posisi, ukuran, font-family,
font-size, font-weight, color, background-color, letter-spacing, line-height,
border-radius dan text-transform — lalu bandingkan hash-nya.

Penting: samakan dulu fase animasi (`getAnimations()` → `currentTime = 0`,
`pause()`) dan posisi slider (`swiper.slideTo(0, 0)`, autoplay dihentikan).
Tanpa itu, dua tab dari situs yang **sama** pun menghasilkan hash berbeda.

Nilai acuan situs live, setelah dinormalkan:

| Halaman | Viewport | Elemen | Sidik jari |
|---|---|---|---|
| `/` | 1024px | 2047 | `1wohydi` |
| `/seminyak/balinese-massage/` | 1024px | 1338 | `ncxuet` |
| `/` | 375px | 1957 | `16kx1ot` |

Yang dikejar adalah **kesamaan visual**, bukan DOM yang identik. Markup yang
bersih memang akan berbeda strukturnya — justru itu tujuannya. Jadi sidik jari
dipakai untuk membandingkan hasil render per seksi, bukan untuk menuntut angka
yang sama persis dengan tabel di atas.

## Yang dipakai ulang dari repo lama

`src/data` (harga, paket, navigasi, testimoni, redirect, artikel), `src/lib`
(seo, whatsapp, format) dan `public/images`. Semua itu konten dan logika, bukan
desain, dan harganya sudah disinkronkan dengan situs live.

`src/app` dan `src/components` dibangun baru — versi lama berisi desain "Taman"
yang bukan tampilan yang diminta.

## Catatan lisensi

Situs live memuat Font Awesome Pro (6 varian font, berlisensi). Di versi ini
ikon sebaiknya memakai `lucide-react` atau SVG inline: lebih ringan sekaligus
menghindari persoalan lisensi.
