# Progres rebuild

Diperbarui 29 September 2026.

## Semua 42 halaman sudah jadi — dan identik dengan live

| | |
|---|---|
| Halaman diperiksa | **42** + halaman 404 |
| Status 200 di rebuild **dan** live | **42 / 42** |
| `<title>` cocok persis dengan live | **42 / 42** |
| Tampilan identik dengan live (elemen per elemen, hingga subpiksel) | **42 / 42** + 404 — lihat sesi 4 |
| Build produksi | sukses: 48 rute statis (termasuk robots.txt, sitemap.xml) + 2 API |
| Typecheck · lint | bersih · 0 error, 0 warning |

`node tools/compare-pages.mjs http://localhost:3100 https://spabalimoon.com`
mengulang pemeriksaan status/judul; perbandingan tampilan ada di
`tools/live-port/`.

### Rute

- `/` beranda, 11 seksi
- `/seminyak/` daftar harga bertab
- `/seminyak/[slug]/` **24 halaman treatment**
- `/guide/` + `/guide/[slug]/` **7 artikel**
- `/contact/` · `/reservation/` · `/massage-kuta/` ·
  `/outcall-home-service-massage/` · `/villa-hotel-massage/`
- `/wellness-in-bali/` · `/privacy-policy/` · `/terms-and-conditions/`
- `/api/subscribe/` · `/api/search-posts/`

## Bobot (build produksi, 29 September)

| | Live | Rebuild | |
|---|---|---|---|
| CSS | 531,5 KB · 6 file · 5.488 aturan | **266 KB · 2 file** (36 KB gzip) | **−50%** |
| JS | 3047,3 KB · 132 file | **924 KB · 21 file** | **−70%** |

Keduanya mencakup seluruh situs. CSS rebuild hanya memuat aturan live yang
benar-benar dipakai salah satu dari 42 halaman (1.799 dari 6.097). Swiper,
Lenis dan subset Font Awesome sama dengan yang dipakai live.

## Kemiripan beranda (historis, sebelum port 1:1)

Tinggi total **13.017 vs 13.232 px (1,6%)**. Per seksi: hero +12, steps +12,
about −39, slider −17, testimoni −58, katalog +174, intro −24, paket +38,
keunggulan +28, FAQ −70, CTA +22.

Terbukti identik persis: h1 hero 936×156, link nav 52×106, paragraf hero
330×232, kartu langkah 280×302, heading seksi 2 936×130. Halaman treatment:
hero **tepat 848px**, total 12.571 vs 12.477 (0,8%).

## Dua temuan yang berdampak ke semua halaman

1. **Dropdown header harus tetap ada di HTML.** Awalnya hanya dirender saat
   dibuka; itu menghilangkan 23 tautan treatment + 7 artikel dari setiap
   halaman — regresi SEO, bukan sekadar selisih teks. Sekarang selalu dirender
   dan disembunyikan secara visual. Selisih teks halaman treatment turun dari
   11–14% menjadi **3–6%**.
2. **Tab harga juga.** Semua tab dirender, yang non-aktif diberi `hidden`,
   sehingga seluruh harga tetap terbaca mesin pencari.


## Perbaikan visual (28 September, sesi lanjutan)

Pembandingan angka saja ternyata menyesatkan: tinggi dan font cocok, tapi
situsnya terlihat datar karena **elemen dekoratifnya belum ada**. Yang
ditambahkan setelah membandingkan tangkapan layar berdampingan di 1280px:

- **Ornamen bunga kamboja di hero** — 5 SVG asli (3 bunga + 2 kelopak) plus
  glow emas radial, masing-masing beranimasi 13 detik.
- **Ornamen titik di atas judul** — garis · kuncup · bunga · kuncup · garis.
- **Tombol WhatsApp bundar 97px** bergaris emas di sebelah paragraf hero.
- **Tata letak dua foto bertumpuk** yang menjorok keluar tepi kiri.
- **Tepi bergelombang antar-seksi** (`section-decoration-top/bottom`,
  76px dan 74px) — ini penyebab terbesar kenapa situsnya terasa datar.
- **Ornamen daun di tiap seksi** (steps, about, testimoni, katalog, keunggulan).
- **Header diperbaiki**: full-width dengan gutter 50px (bukan container),
  satu baris 106px, tombol "Book an Appointment" baru muncul di ≥1400px —
  persis seperti live.

Hasil di viewport 1280px:

| Elemen hero | Live | Rebuild |
|---|---|---|
| tinggi seksi | 1033 | **1033 — persis** |
| h1 | `[101,402,1070,159]` | `[98,402,1070,159]` |
| paragraf | `[641,596,330,232]` | `[638,596,330,232]` |
| foto 1 | `[78,491,337,487]` | `[75,491,337,487]` |
| foto 2 | `[-102,361,281,377]` | `[-105,361,281,377]` |
| daun | `[0,722,255,367]` | `[0,722,255,367]` — persis |
| logo header | `[50,31,240,44]` | `[50,31,239,44]` |

Selisih x sebesar 3px berasal dari lebar scrollbar, bukan kesalahan tata letak.

Tinggi total beranda di 1280px: **12.250 vs 12.124 (1,0%)**.


## Bug render yang serius (diperbaiki)

Laporan "ada bagian yang tidak terender" benar, dan penyebabnya kesalahan
desainku sendiri: **59 dari 59 elemen `data-reveal` tersangkut di
`opacity: 0`** — katalog kehilangan 43 elemen, keunggulan 6, steps 5.

Akarnya: konten disembunyikan lebih dulu, lalu bergantung pada animasi
keyframe untuk memunculkannya kembali. Karena `animation-fill-mode: both`,
saat jam animasi berhenti (tab tidak di-paint, di-throttle browser) elemen
menahan keyframe 0% selamanya. Hal yang sama terjadi pada panel harga yang
memakai transisi `grid-template-rows: 0fr -> 1fr`.

Prinsip yang sekarang dipakai di seluruh proyek: **visibilitas berasal dari
deklarasi CSS atau atribut `hidden`, animasi hanya pemanis di atasnya.**
Kalau animasinya gagal jalan, yang hilang cuma efeknya — bukan isinya.

- Reveal memakai transisi (`opacity`/`transform`), bukan keyframe; state
  terbuka adalah deklarasi sungguhan.
- Elemen di dalam tab tertutup tidak pernah disembunyikan.
- Tiga jaring pengaman: IntersectionObserver, handler scroll, dan timeout 6
  detik yang memunculkan apa pun yang masih tersembunyi.
- Panel harga memakai atribut `hidden`; slide 400ms hanya tambahan.

Hasil verifikasi: **0 dari 59 elemen tersembunyi**, toggle harga bekerja
(0px → 64px berisi "1 Hour · 250K · View Aloe Vera Massage details" → 0px),
dan tab kategori berpindah dengan benar.

Header lengket juga diperbaiki: live menambahkan kelas `menu-fixed` saat
scroll (latar putih + `0 4px 30px rgba(0,0,0,.05)`, transisi 0.32s). Punyaku
tetap transparan sehingga konten menembus di belakang menu.

### Tinggi seksi beranda pada 1440px

| # | Seksi | Live | Rebuild | Selisih |
|---|---|---|---|---|
| 0 | hero | 1047 | 1033 | -14 |
| 1 | steps | 703 | 744 | +41 |
| 2 | about | 1105 | 970 | -135 |
| 3 | slider | 635 | 650 | +15 |
| 4 | testimoni | 515 | 457 | -58 |
| 5 | katalog | 2321 | 2107 | -214 |
| 6 | intro paket | 700 | 676 | -24 |
| 7 | paket | 966 | 1125 | +159 |
| 8 | keunggulan | 766 | 688 | -78 |
| 9 | FAQ | 1188 | 1523 | **+335** |
| 10 | CTA | 762 | 784 | +22 |
| | **total** | **11.412** | **11.551** | **+139 (1,2%)** |

FAQ adalah selisih terbesar yang tersisa (+28%).


## FAQ, CTA dan footer dibangun ulang

Ketiganya memang strukturnya beda, bukan sekadar meleset ukuran:

| Bagian | Yang kubuat sebelumnya | Struktur live |
|---|---|---|
| FAQ | banner lebar penuh lalu accordion di bawahnya | **dua kolom 654px**: kiri foto 654x908 dengan "Time to Unwind" ditumpuk, kanan kicker + h2 + accordion 514px, item pertama terbuka |
| CTA | panel ink rata 936px | **banner 1408x442, radius 18px**, foto `homepage-5.webp` di balik wash `rgba(28,26,29,.45)`, empat garis bingkai SVG, konten 860px |
| Footer | 4 kolom + baris newsletter + baris bawah terpisah | **5 kolom sebaris** (316/195/195/195/316, tinggi 304) lalu **satu baris copyright terpusat** |

Nilai yang terlewat sebelumnya: judul kolom footer `<h3>` 24px/500 warna
`#2f2924` (bukan abu body), pertanyaan accordion 22px/500, jawaban 16px/29px
warna `#5f5a54`, judul FAQ di atas foto 37.44px/500 putih.

### Hasil pada 1440px

| # | Seksi | Live | Rebuild | Selisih |
|---|---|---|---|---|
| 9 | **FAQ** | 1188 | **1188** | **0** |
| 10 | **CTA** | 762 | **762** | **0** |
| | footer | 598 | 572 | -26 |
| 5 | katalog | 2321 | 2107 | -214 |
| 7 | paket | 966 | 1125 | +159 |
| 2 | about | 1105 | 970 | -135 |
| 8 | keunggulan | 766 | 688 | -78 |
| 4 | testimoni | 515 | 457 | -58 |

Nol aset gagal, nol elemen tersembunyi, build 45 rute sukses, 42/42 halaman
status 200 dengan judul cocok.


## FAQ diselaraskan elemen per elemen

Tinggi seksinya sudah 1188 seperti live, tapi isinya masih meleset di enam
titik. Setelah membandingkan setiap elemen:

| Elemen | Live | Sebelum diperbaiki | Sebabnya |
|---|---|---|---|
| foto | `[50,143,654,908]` | `[12,143,677,908]` | kolom kiri butuh inset 12px |
| konten kanan | `x=798 w=514` | `x=737 w=514` | kolom kanan butuh inset **82px di kedua sisi** (678-164=514) |
| kicker ke h2 | jarak **0** | 8px | `mt-2` tidak ada di live |
| h2 ke accordion | jarak **0** | 32px | `mt-8` tidak ada di live |
| tombol accordion | line-height **35px** | 32px | 1 baris = 35+40 = 75px, 2 baris = 70+40 = 110px, padding 20px |
| "Time to Unwind" | `[100,974]` lh 1 | `[62,960]` lh 1.1 | 50px dari kiri foto, 40px dari bawahnya |

Animasi `panel-open` juga dibuat opacity saja tanpa `transform`: transform-nya
menggeser teks 6px dan menahannya di situ kalau jam animasi berhenti.

### Hasil akhir — seluruh elemen cocok

```
foto       live[50,143,654,908]   baru[47,143,654,908]    COCOK
judulFoto  live[100,974,292,37]   baru[97,974,306,37]     COCOK
kicker     live[798,183,514,30]   baru[795,183,514,30]    COCOK
h2         live[798,213,514,130]  baru[795,213,514,130]   COCOK
tombol1    live[798,343,514,75]   baru[795,343,514,75]    COCOK
jawaban1   live[798,418,514,87]   baru[795,418,514,87]    COCOK
tombol2    live[798,526,514,110]  baru[795,526,514,110]   COCOK
tombol6    live[798,935,514,75]   baru[795,935,514,75]    COCOK
```

Setiap koordinat y dan tinggi identik; x bergeser 3px karena lebar scrollbar,
bukan kesalahan tata letak.


## Detail visual dari tangkapan layar pengguna

Lima hal yang hanya kelihatan dari gambar, bukan dari angka:

| Detail | Live | Yang kubuat |
|---|---|---|
| sudut foto FAQ | pembungkus `border-radius: 30px; overflow: hidden` | kotak tajam |
| ikon accordion | **plus / minus** 20x20 warna `#1c1a1d` | chevron berputar |
| pemisah di CTA | `span 60x1` + **lotus 26x27** + `span 60x1`, gap 15px, margin 18px | garis polos 60px |
| tombol Reserve | ada ikon panah setelah teksnya | tanpa ikon |
| tombol "Book an Appointment" | ada lotus 18x18 setelah teksnya | tanpa ikon |

Ditambah satu kesalahan huruf yang kelihatan jelas: `text-transform: capitalize`
kupasang global untuk semua `h2`, sehingga muncul **"Time To Unwind"** dan
**"A Better Way To Experience Wellness In Bali"**. Di live kedua judul itu
`text-transform: none` ("Time to Unwind"), sementara heading seksi lain
memang `capitalize` — itu sebabnya live menulis "Of The Bali Experience".

Ikon panah dan plus/minus digambar sebagai SVG inline, bukan glyph Font
Awesome Pro seperti di live, supaya tidak menyeret font berlisensi.

Terverifikasi ulang: radius foto 30px, 6 ikon accordion, pemisah lotus ada,
`tt:none` pada dua judul itu dan `tt:capitalize` pada heading seksi, FAQ 1188
dan CTA 762 tetap nol selisih, nol aset gagal.


## Bug SVG (diperbaiki) dan jawaban soal aset

Bingkai CTA tampil sebagai ikon gambar rusak. Penyebabnya berlapis:

1. **Optimizer gambar Next.js menolak SVG.** Semua SVG lewat `next/image`
   balas `400 "image type is not allowed"` — logo, ikon treatment, ikon
   langkah, bingkai CTA, semuanya. Diperbaiki dengan `dangerouslyAllowSVG`
   plus CSP `default-src 'self'; script-src 'none'; sandbox;`.
2. **13 file SVG tidak punya `width`/`height`, 4 di antaranya tidak punya
   `xmlns`.** SVG yang dimuat lewat `<img>` wajib punya namespace, dan tanpa
   dimensi intrinsik `naturalWidth` jadi 0. Diperbaiki langsung di file-nya.
3. **Empat bingkai CTA tetap 0x0** walau file-nya sudah benar: path-nya
   memakai atribut `style` inline, yang ditolak CSP `default-src 'self'`
   milik optimizer. Untuk ornamen sekecil ini tidak sepadan dilawan, jadi
   keempatnya di-inline sebagai JSX di `src/components/ui/CtaFrame.tsx`.
   Hasilnya juga menghilangkan empat permintaan jaringan.

Setelah itu: **0 gambar rusak**, bingkai tergambar pada 1349x30 dan 30x390
(live 1356x30 dan 30x390), tinggi CTA tetap 762 seperti live.

### Aset: tidak ada yang tertinggal

```
dirujuk di kode : 397 path
hilang          : 0
public/images   : 1005 file  (situs live punya 624)
public/icons    : 43 svg hasil ekstraksi, semuanya ber-xmlns
```

Justru berlebih: sekitar 380 gambar sisa desain Taman masih ikut dan belum
dibuang.

### Kenapa tidak memakai kode live apa adanya

CSS dan JS situs live adalah **bundle hasil kompilasi, bukan source** — satu
file CSS 502 KB ter-minify tanpa sumbernya. Tidak ada yang bisa "dirapikan";
paling jauh hanya bisa dipangkas yang tak terpakai, sekitar 531 KB menjadi
~100 KB, dengan markup yang tetap penuh kelas Bootstrap. Rebuild ini sudah di
36 KB dengan komponen yang bisa dikembangkan, jadi jalur itu justru mundur.

> Catatan sesi 3: keputusan ini dibalik untuk beranda, header dan footer —
> lihat bagian berikutnya.


## Slider treatment: kartunya ternyata horizontal

Kartuku vertikal (foto di atas, teks terpusat). Kartu live **horizontal di
semua lebar desktop**:

```
.inner-box    690x318 · flex row · gap 40 · padding 20 · bg #f5f2ec · radius 30px
              align-items: center        <- ini yang menengahkan foto
  .image-box  286x263 · radius 30px · overflow hidden
  .content-box 305x278 · column · justify-content: space-between · self-stretch
    .icon     80x80  /images/spa/<Nama>.svg
    .info     h6 gold 16/500 · h3 24/500 · p 16/29 pt10 mt15
```

Lebar kartu berubah menurut viewport (543 sampai 1200px, 690 dari 1440px),
tapi arahnya tetap horizontal.

Di bawah track ada `.feature-arrys` dengan **dua tombol 30x30** berlatar
`#f9f6f1`, terpusat, `margin-top: 60px` — itu yang mengisi 74px yang tadinya
hilang. Ditambahkan sebagai opsi `arrows` pada `Carousel`.

### Hasil

```
kartu  live[690x318]          baru[690x318]          COCOK
foto   live[32,171,286,263]   baru[32,171,286,263]   COCOK
ikon   live[358,163,80,80]    baru[358,163,80,80]    COCOK
h6/h3/p                       selisih 1px
tinggi seksi  live 635  baru 651  (+16)
```

## Selisih panjang teks yang tersisa

| Halaman | Selisih | Dugaan |
|---|---|---|
| `/guide/` | **+33%** | kartu arsipku menampilkan excerpt, live tidak |
| `/seminyak/` | −22% | sebagian baris harga live belum tereplikasi |
| `/guide/iv-drip/` | −15% | isi artikel lebih pendek dari live |
| `/contact/`, `/reservation/` | −12%, −11% | perlu dicek |
| 24 halaman treatment | −3% … −6% | wajar |

Sesi 3: selisih halaman dalam naik beberapa persen karena header kini
merender dropdown blog di server (live memuatnya setelah hidrasi).

## Beranda 1:1 dengan live (28 September, sesi 3)

Laporan: "berbeda jauh dengan live website". Benar — mengejar kemiripan
dengan menulis ulang tiap seksi di Tailwind tidak pernah tuntas. Pendekatannya
diganti: **markup dan CSS live dipindahkan apa adanya**, bukan ditiru.

- **CSS:** setiap aturan dari 3 file CSS + 9 blok styled-jsx live (5.505
  aturan) diuji terhadap DOM live, termasuk keadaan interaktif. 841 yang
  cocok disalin dengan urutan kaskade aslinya ke `src/styles/live.css`
  (hasil generator, jangan diedit tangan — lihat `tools/live-port/`).
  Tiap selektor diberi `:where(.lh,.lh *)`: hanya berlaku di dalam elemen
  berkelas `lh` dan **spesifisitasnya tidak berubah**, jadi kaskadenya
  persis live, dan reset Bootstrap tidak bocor ke halaman Tailwind.
- **Preflight Tailwind** dibatasi agar tidak menyentuh `.lh`
  (`src/styles/preflight-scoped.css`); aturan dasar `h1–h6`/`a` di
  `globals.css` juga. Folder `components/home` dan `components/layout`
  dikecualikan dari pemindaian Tailwind — kelas Bootstrap seperti `collapse`
  dan `mt-30` bentrok dengan utilitas Tailwind.
- **Markup:** header, menu mobile, 11 seksi, footer, tombol WhatsApp dan
  preloader ditulis ulang dari markup server live + logika komponen dari
  bundle JS live (header lengket di scrollY > 100, pencarian, mega menu,
  tab & panel harga katalog, akordeon FAQ, "Read more" testimoni).
- **Konten** beranda diambil ulang dari bundle live: `src/data/pages/home.ts`
  dan `home-catalog.ts` (38 kartu menu spa; slider treatment menurunkan
  harga "From"-nya dari sini, sama seperti live).
- **Library yang sama dengan live:** Swiper 11 (slider treatment & testimoni)
  dan Lenis 1.3.26 (`lerp: 0.06`). Carousel scroll-snap buatan sendiri tetap
  dipakai halaman treatment.
- **Font & ikon:** file woff2 live sendiri di `public/webfonts/` (Literata,
  Mulish, dan subset Font Awesome 3–6 KB milik live). `next/font` dilepas.
- Logo header (`SMBtitle.svg`) diganti versi live terbaru (viewBox 444).
- Tidak ada animasi reveal di beranda live (WOW.js tidak aktif, durasi 0s),
  jadi beranda baru juga tanpa reveal.

### Hasil (Chrome headless, animasi & slider dibekukan, semua gambar termuat)

| Lebar | Tinggi dokumen live / lokal | Elemen identik | Selisih |
|---|---|---|---|
| 1920 | 11.248 / 11.248 | 2.306 | 0 |
| 1440 | 11.412 / 11.412 | 2.306 | 0 |
| 1280 | 12.129 / 12.129 | 2.304 | 0* |
| 1024 | 13.870 / 13.870 | 2.306 | 0 |
| 768 | 14.545 / 14.545 | 2.304 | 0* |
| 390 | 16.130 / 16.130 | 2.304 | 0* |

\* sisa selisih hanya titik navigasi slider testimoni, karena slider live
sudah berputar otomatis saat dibekukan; keadaan awal keduanya identik.
Keadaan interaktif (header lengket, mega menu, dropdown blog, pencarian, tab
& panel katalog, FAQ, menu mobile) juga dibandingkan: identik. 17 animasi
dekorasi: durasi, delay dan keyframe sama.

CSS produksi: 116 KB (18 KB gzip) + 26 KB, dibanding 531 KB di live.

### Yang sengaja berbeda

- Semua halaman dibungkus `<main>`, live tidak. Dua aturan footer live
  diperluas agar tetap berlaku, dan `main.outcall-page` dirender sebagai
  `div` supaya tidak ada `<main>` bersarang.
- Kolom grid Bootstrap ditulis sebagai pecahan `calc()` (lihat sesi 4) —
  nilainya sama, bentuk tulisannya beda.
- Pencarian header tidak menawarkan "FAQ" (`/faq/` adalah halaman demo theme
  yang tidak dibangun ulang).
- Dropdown blog dirender di server, live baru memuatnya setelah hidrasi.
  Karena itu teks HTML server lebih panjang 3–28% (`tools/compare-pages.mjs`);
  setelah JS jalan, DOM-nya identik.
- Tautan "Skip to content" (tersembunyi sampai difokus keyboard) dan beberapa
  `aria-label` pada tombol ikon.

### Perlu dikonfirmasi

- **Lisensi Font Awesome Pro.** Ikon beranda live memakai glyph FA Pro
  (light/regular/solid). Rebuild memakai file subset yang sama persis dengan
  yang sudah disajikan situs live; pastikan lisensi theme/klien mencakupnya.
  Kalau tidak, ganti dengan ikon FA Free — bentuk `light` akan sedikit beda.
- **Preloader** (logo + "Loading...", 250 ms–1 dtk) ikut disalin karena ada di
  live. Menunda tampilan pertama; hapus `<Preloader />` di
  `src/app/layout.tsx` bila tidak diinginkan.
- **`/reservation/` tanpa H1** (SEO-02). Sesi sebelumnya sengaja menambah H1;
  kini disamakan dengan live. Menambah H1 berarti satu perbedaan kecil dari
  live — keputusan pemilik situs.

## Semua 42 halaman 1:1 dengan live (29 September, sesi 4)

Permintaan: "pricelist harus identik 100%, atau kalau bisa semua pages".
Cara beranda dipakai untuk seluruh situs:

- **CSS** kini dibangun dari DOM ke-42 halaman live sekaligus (5 file CSS + 48
  blok styled-jsx, 6.097 aturan → 1.799 terpakai). Aturan yang hanya dimuat
  sebagian halaman dan bisa bocor ke halaman lain diikat ke halamannya dengan
  `:where(body:has(.p-<halaman>))`; tiap halaman berakar
  `<div class="page-wrapper lh p-<halaman>">`.
- **Komponen** diambil dari modul JS live (di-*decompile* lalu dirapikan) ke
  `src/components/sections/`: PageBanner, AboutIntro, AboutSplit(Alt),
  TreatmentPricing, SessionOptions, Funfacts, TreatmentTestimonials,
  ServiceSlider, FaqSection, ReserveCta, PackageTabs, PackageIntro,
  Testimonials, VideoSection, PageTitle, GuidePost, HomeServiceInfo,
  ContactSection.
- **Isi halaman** dibangkitkan dari pohon komponen live (props apa adanya) ke
  `src/content/`: 24 treatment, 7 artikel guide, 9 halaman lain. Rute di
  `src/app/` tinggal memasang isi itu dan tetap memegang metadata SEO.
- **Kontak** mengikuti live: form tidak mengirim email (live juga
  `whatsappOnly`); submit membuka dialog "We reply on WhatsApp" dengan pesan
  yang sudah tersusun. **Reservation** kini persis live — tanpa banner dan tanpa
  H1 (lihat "Perlu dikonfirmasi").
- **404** kini halaman error milik live (gambar, "Page not found!", form
  cari, "Back to Home") — **tanpa header dan footer**, sama seperti live. Untuk
  itu semua rute dipindah ke route group `src/app/(site)/` yang layout-nya
  memuat header, `<main>` dan footer; root layout hanya memuat yang dipakai
  bersama (CSS, font, tombol WhatsApp, preloader, Lenis). URL tidak berubah.
  Slug treatment/artikel yang tidak ada juga jatuh ke 404 ini.

### Hasil (Chrome headless, animasi & slider dibekukan, semua gambar termuat)

Sapuan akhir: 42 halaman pada 1920 dan 390px, beranda dan pricelist juga
pada 1440/1280/1024/768, dan 404 pada keenam lebar (98 perbandingan).
**Tinggi dokumen sama di semua perbandingan, 0 selisih posisi/ukuran, gaya,
dan isi** (tag, kelas, teks, `src`, `href`), dan **0 selisih subpiksel**
(> 0,02px). Satu-satunya catatan: dua dekorasi di Balinese Massage 1920px
bergeser 10px pada sebagian pengujian. Posisinya mengikuti posisi scroll
terakhir saat dekorasi itu terlihat, dengan kode yang sama persis dengan live;
diuji pada posisi scroll yang sama, nilainya identik.
Sisa "struct" di laporan hanya urutan kelas yang ditambahkan Swiper dan
`main.outcall-page` yang dirender sebagai `div` (rebuild sudah punya
`<main>`).

Interaksi yang dibandingkan dan identik: tab & panel pricelist, tab paket +
buka/tutup baris di outcall (5 tab, 1440 & 390), form kontak → dialog
WhatsApp (isi link, fokus, kunci scroll, Escape), pencarian sidebar artikel
(1440 & 390), akordeon FAQ dan panah slider treatment, plus semua interaksi
beranda dari sesi 3.

### Tiga temuan yang diperbaiki di generator CSS

1. **Jarak footer outcall kurang 113px.** Aturan live
   `:has(> .section__decoration-bottom:last-child) + footer` tidak berlaku
   karena rebuild membungkus halaman dengan `<main>`; kini diperluas seperti
   aturan footer sebelumnya.
2. **Dropdown hasil pencarian artikel tanpa gaya.** Markupnya baru muncul
   setelah mengetik, jadi aturannya terbuang. Markup semacam ini kini bisa
   ditambahkan per blok styled-jsx di `live/extra-jsx-<hash>.html`.
3. **Next 16 membulatkan angka CSS ke 6 digit.** Lightning CSS menyajikan
   `33.33333333%` milik Bootstrap sebagai `33.3333%`, sehingga sepertiga dari
   1434px menjadi 477,98px, bukan 478px. Kolom grid kini ditulis
   `calc(400% / var(--lh-cols, 12))`, yang tidak bisa dilipat dan (diuji di
   Chrome untuk semua lebar 100–2600px) menghasilkan layout yang sama persis.

### Tag `<head>` (SEO) dibandingkan untuk 42 halaman

- **Beranda kehilangan canonical, robots, og:url dan JSON-LD `DaySpa`** sejak
  ditulis ulang di sesi 3 (tidak ada `metadata` di `src/app/(site)/page.tsx`).
  Dikembalikan persis seperti live, termasuk JSON-LD (nilai rating 4,2 / 193
  ulasan dan email `info@spabalimoon.com` seperti di live).
- Isi `robots` kini ditulis sebagai string agar urutannya sama dengan live;
  `application-name` (tidak ada di live) dihapus.
- Gambar share disamakan dengan live (atas permintaan pemilik): hanya 7
  artikel guide yang punya `og:image`/`twitter:image` (URL gambar sampul
  saja, tanpa ukuran/alt); halaman lain tanpa gambar share. Tag
  `article:published_time`/`modified_time` yang tidak ada di live dihapus.
- Hasil `tools/live-port/headcmp.mjs`: semua tag `<head>` ke-42 halaman
  sama dengan live. Satu-satunya sisa adalah `next-head-count`, penanda
  internal Next.js Pages Router milik live yang tidak dibaca mesin pencari.
  404 punya satu tag `robots: noindex` tambahan dari Next; gabungannya tetap
  "noindex, nofollow".

### Berkas di luar halaman

- **`/robots.txt`, `/sitemap.xml` dan `/favicon.ico` tadinya 404** di rebuild.
  Kini disalin byte-per-byte dari live: `src/app/robots.txt`,
  `src/app/sitemap.xml` (42 URL + 40 gambar, semuanya ada di `public/`) dan
  `public/favicon.ico` (di `public/` agar Next tidak menambah tag ikon yang
  tidak ada di live). Perbarui `sitemap.xml` bila ada halaman baru.
- Redirect `/sitemap_index.xml` → `/sitemap.xml` ternyata sudah aktif di live
  (301), jadi dipindah dari `proposedRedirects` ke `liveRedirects`. Redirect
  lain yang aktif dicek ulang terhadap live: semua tujuannya sama.
- `/faq/` dan halaman demo tema lain (`/index-*`, `/shop-*`, …) masih
  dilayani live dengan `noindex` dan tidak ada di sitemap. Tetap tidak
  dibangun ulang (keputusan sesi sebelumnya).

### Bersih-bersih

- 19 file lama hasil tulis-ulang Tailwind (`components/pages`,
  `components/treatments`, beberapa `ui/*`, `data/packages.ts`,
  `data/treatmentIcons.ts`, `lib/article.ts`, `lib/format.ts`) tidak dipakai
  rute mana pun dan dihapus. Cadangannya:
  `migration/removed-pre-live-port-sources.tar.gz`.
- Variabel satu huruf sisa decompile diganti nama yang jelas. Lint 0 error
  0 warning, typecheck bersih.
- `tools/live-port/` diperbarui untuk 42 halaman (lihat README-nya).

## Yang belum beres

- **`/api/subscribe/` belum menyimpan apa pun.** Form membalas sukses; arahkan
  ke backend sebenarnya sebelum go-live.
- **Form kontak tidak mengirim email** — sama seperti live saat ini (mode
  WhatsApp). Bila nanti ada endpoint, logikanya di
  `src/components/sections/ContactSection.tsx`.
- **Data lama hanya untuk metadata:** `src/data/treatments/*.ts` dan
  `src/data/blog/*.ts` masih memuat teks halaman versi lama, padahal kini
  hanya judul/deskripsi/gambar SEO-nya yang dipakai. Bisa dipangkas.
- **Duplikasi harga:** `src/data/pricelist.ts` (dipakai data treatment lama),
  `src/data/pages/pricelist.ts` dan `src/data/pages/home-catalog.ts` memuat
  harga yang sama. Semuanya cocok dengan live, tapi sebaiknya disatukan.
- **±380 gambar desain Taman** masih ikut di `public/images` (folder `beauty`,
  `branding`, `gallery`, `packages`, `treatments`) dan perlu dibuang setelah
  ketahuan mana yang dipakai.
- **`public/icons/` (44 SVG, 240 KB) tidak dipakai lagi** — ikon kini dari
  subset Font Awesome milik live. Bisa dihapus.
