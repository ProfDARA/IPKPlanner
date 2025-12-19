## Jalankan Secara Lokal

**Prasyarat:**  Node.js

1. Instal dependensi:
   `npm install`
2. Atur `GEMINI_API_KEY` di [.env.local](.env.local) dengan kunci API Gemini Anda
3. Jalankan aplikasi:
   `npm run dev`

## Tentang Smart IPK Tracker

`Smart IPK Tracker` adalah aplikasi single-page (SPA) ringan untuk membantu mahasiswa merencanakan dan memantau IPK (Indeks Prestasi Kumulatif). Aplikasi ini memungkinkan Anda memasukkan atau mengimpor data mata kuliah, mengatur bobot nilai, dan menghitung rata‑rata IPS yang diperlukan di sisa semester agar target IPK tercapai.

- Fitur utama:
   - Simulasi rata‑rata IPS yang diperlukan untuk mencapai target IPK.
   - Impor / ekspor CSV untuk backup dan pemulihan data.
   - Pengaturan skala penilaian yang dapat disesuaikan.
   - Penyimpanan otomatis di Local Storage (data tetap tersimpan di browser Anda).

- Cara singkat menggunakan:
   1. Tambah atau impor daftar mata kuliah (SKS dan nilai).
   2. Atur target IPK dan total SKS yang diperlukan.
   3. Lihat hasil simulasi dan ekspor CSV bila perlu.

- Privasi: semua data pengguna disimpan secara lokal di browser. Hanya konfigurasi API (mis. `GEMINI_API_KEY`) yang dimuat dari `.env.local` bila fitur backend/AI digunakan.

- Deploy: proyek dibangun dengan Vite. Gunakan `npm run build` untuk menghasilkan folder `dist` (Output Directory). Untuk platform seperti Vercel, set `Build Command` ke `npm run build` dan `Output Directory` ke `dist`.


## Link Demo Aplikasi ini
https://ipktracker.vercel.app/
