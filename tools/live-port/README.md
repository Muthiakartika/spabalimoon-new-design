# live-port — menyalin tampilan 42 halaman live ke rebuild

Skrip yang menghasilkan `src/styles/live.css`, `src/styles/preflight-scoped.css`
dan draf komponen/halaman dari situs live, plus alat pembanding live ↔ lokal.
Jalankan dari folder ini. Butuh Chrome (atau set `CHROME_PATH`) dan paket
berikut, dipasang sementara tanpa masuk `package.json`:

```bash
npm i --no-save puppeteer-core jsdom postcss postcss-selector-parser css-select htmlparser2 pngjs pixelmatch prettier @babel/parser @babel/traverse @babel/generator @babel/types
```

Folder hasil unduhan (`pages/`, `pages-dom/`, `js/`, `trees/`, `decompiled/`,
`cmp/`, `live/*`) tidak ikut disimpan — buat ulang dengan langkah di bawah.

## Membuat ulang CSS (setelah situs live di-deploy ulang)

| Langkah | Skrip | Hasil |
|---|---|---|
| 1 | `node survey.mjs` | HTML server 42 halaman + 404 (`pages/`) + `pages/survey.json`: CSS dan blok styled-jsx per halaman |
| 2 | `node fetch-assets.mjs` | semua stylesheet (`live/css/`) dan chunk JS (`js/`) |
| 3 | `node capture-all.mjs` | DOM setelah JS tiap halaman (`pages-dom/`) |
| 4 | `node extra.mjs` | DOM beranda dalam keadaan interaktif (tab katalog, panel harga, pencarian, menu mobile, FAQ) |
| 5 | `node jsx-extra.mjs` | blok styled-jsx yang hanya muncul setelah interaksi (toast/prompt kontak) |
| 6 | `node gen-names.mjs` | susun ulang tabel hash styled-jsx → nama di `names.mjs` (blok milik satu halaman diberi nama halamannya; blok bersama yang baru dicetak `UNNAMED` — beri nama di `named`) |
| 7 | `node build-css.mjs` | `../../src/styles/live.css` |
| 8 | `node preflight.mjs` | `../../src/styles/preflight-scoped.css` (ulangi setelah upgrade Tailwind) |

`build-css.mjs` mencocokkan setiap aturan CSS live dengan DOM ke-42 halaman
(css-select, bukan browser) dan hanya menyimpan yang terpakai. Semua aturan
di-*scope* ke `.lh` dengan spesifisitas nol; aturan yang "bocor" antarhalaman
diberi awalan `:where(body:has(.p-<halaman>))`. `live/extra-manual.html` berisi
markup yang tidak pernah muncul saat pengambilan, supaya aturannya ikut
terbawa — tambahkan di situ bila ada komponen kondisional baru.

## Memindahkan komponen / halaman baru

| Skrip | Kegunaan |
|---|---|
| `node pagetree.mjs /seminyak/thai-massage/` | jalankan modul halaman live dengan React palsu → pohon komponen + props (`trees/`) |
| `node decompile.mjs <moduleId>` lalu `node post.mjs` | modul komponen live → JSX (`decompiled/<id>.clean.jsx`) |
| `node tsxify.mjs <moduleId> <Nama> <file.tsx>` | JSX hasil decompile → komponen TSX dengan tipe props |
| `node gen-page.mjs <url> <file.tsx> <Nama>` | pohon halaman → komponen halaman (dipakai untuk `src/content/**`) |
| `node tojsx-page.mjs <url>` | draf JSX per blok dari markup server |
| `node assets-all.mjs` | unduh ke `public/` gambar yang dipakai live tapi belum ada atau isinya berbeda |
| `node rename.mjs <file> a=namaJelas …` | ganti nama variabel hasil minify (sadar scope) |
| `node reach.mjs` (dari root proyek) | daftar file di `src/` yang tidak dipakai rute mana pun |

## Memeriksa kemiripan

```bash
CMP_PATH=/seminyak/ node compare.mjs 1920 1440 1280 1024 768 390   # elemen per elemen -> cmp/report_seminyak_.txt
./batch-compare.sh "1920 390" /contact/ /reservation/ /guide/       # satu baris ringkasan per halaman & lebar
node pixdiff.mjs 1920                                               # selisih piksel beranda per pita 200px
node interact.mjs && node interact-pl.mjs                           # keadaan interaktif beranda & pricelist
node interact-contact.mjs                                           # form kontak -> dialog WhatsApp
node interact-outcall.mjs                                           # tab paket + buka/tutup baris outcall
node interact-search.mjs                                            # dropdown pencarian artikel guide
node interact-treatment.mjs /seminyak/thai-massage/                 # FAQ + panah slider treatment
node matched.mjs /guide/ ".blog-block" width,flex                   # aturan CSS mana yang menentukan properti (CDP)
node headcmp.mjs                                                    # tag <head> (judul, meta, canonical, JSON-LD) ke-42 halaman
node dropdowns.mjs                                                  # buka SEMUA dropdown (FAQ, harga, katalog, read more, menu, cari) -> teks yang tak terlihat
```

Laporan `compare.mjs` juga menghitung `subpx`: elemen yang lolos toleransi
1px tetapi posisinya/ukurannya beda lebih dari 0,02px. Tujuannya menangkap
pergeseran subpiksel seperti pembulatan angka oleh Lightning CSS (lihat
`TWELFTHS` di `build-css.mjs`).

**Sejak 1 Oktober beranda `/` adalah desain baru pilihan pemilik** (draf v3,
lihat PROGRESS.md "Beranda baru"), bukan salinan live. Untuk `/`,
`compare.mjs`, `pixdiff.mjs`, `interact.mjs`, `survey.mjs` dan
`dropdowns.mjs` akan melaporkan selisih — itu disengaja. Judul, deskripsi,
canonical, robots dan JSON-LD beranda sengaja dibiarkan sama dengan live.
41 halaman lainnya tetap dibandingkan seperti biasa.

`compare.mjs` membekukan animasi dan slider, memaksa semua gambar lazy
termuat, lalu membandingkan tag, kelas, teks, `src`/`href`, posisi, ukuran,
font, warna, radius, opacity dan visibility setiap elemen header, menu mobile,
isi halaman dan footer (toleransi 1px). Isi yang baru muncul setelah diklik
(jawaban FAQ, baris harga) tidak ikut terukur di sini — itu tugas
`dropdowns.mjs`. `LOCAL_URL` mengganti alamat rebuild
(bawaan `http://localhost:3100`).
