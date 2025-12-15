## Run Locally

**Prerequisites:**  Node.js


1. Instal dependensi:
   `npm install`
2. Atur `GEMINI_API_KEY` di [.env.local](.env.local) dengan API key Gemini Anda
3. Jalankan aplikasi:
   `npm run dev`

## Deploy ke Streamlit

Berikut cara menjalankan aplikasi React ini di dalam Streamlit (embed sebagai iframe).


Pilihan 1 — Pengembangan (dev):

```bash
# Jalankan dev server Vite
npm run dev

# Di terminal lain, jalankan Streamlit yang akan embed dev server
streamlit run streamlit_app.py -- --dev
```

Pilihan 2 — Produksi (build + static server):

```bash
# Build aplikasi React
npm run build

# Sajikan folder dist (contoh menggunakan npx serve)
npx serve dist -l 5000

# Jalankan Streamlit dan tunjukkan URL server static
streamlit run streamlit_app.py -- --url http://localhost:5000
```

Catatan:

```bash
python -m venv .venv
source .venv/Scripts/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

Server-side OCR (pytesseract)

Untuk menggunakan OCR server-side di Streamlit (tanpa mengekspos API key), ikuti langkah berikut:

- Install Tesseract binary (harus tersedia di PATH):
   - Windows (saran): download installer dari https://github.com/UB-Mannheim/tesseract/wiki atau gunakan `choco install tesseract` jika Anda pakai Chocolatey.
   - macOS: `brew install tesseract`
   - Linux (Debian/Ubuntu): `sudo apt install tesseract-ocr`

- (Opsional, untuk PDF) Install Poppler (untuk `pdf2image`):
   - Windows: download Poppler binaries and add to PATH (https://blog.alivate.com.au/poppler-windows/)
   - macOS: `brew install poppler`
   - Linux: `sudo apt install poppler-utils`

- Setelah binary tersedia, jalankan:

```bash
pip install -r requirements.txt
```

Di Streamlit sidebar ada panel "Server-side OCR" — unggah gambar atau PDF, jalankan OCR, dan unduh hasil teks/JSON. Ini menjaga kunci Gemini tetap di server bila Anda menggunakan Streamlit untuk selanjutnya memanggil GenAI.

Streamlit Cloud / Auto-embed

- Jika Anda deploy ke Streamlit Cloud dan ingin Streamlit otomatis menampilkan aplikasi React yang dihosting, atur environment variable atau secret `react_url` atau `REACT_APP_URL` dengan URL publik build React Anda (mis. `https://your-gh-pages-url/`).
- Di Streamlit Cloud: buka app dashboard → Settings → Secrets, tambahkan key `react_url` dengan nilai URL. Aplikasi akan otomatis menggunakan nilai ini saat dijalankan tanpa argumen.

Contoh: jika React Anda dihosting di `https://ipkplanner.mycdn.com/`, set `react_url=https://ipkplanner.mycdn.com/`.

Jika Anda lebih memilih tidak meng-host terpisah, Anda perlu mem-build dan menempatkan file statis di host yang dapat diakses publik, karena Streamlit Cloud tidak secara otomatis menyajikan folder build Vite sebagai situs statis.

Opsi build+serve (jalankan build otomatis lalu serve dari Streamlit):

```bash
# Jalankan sekali (membutuhkan Node.js di PATH)
streamlit run streamlit_app.py -- --build --serve
```

Opsi ini akan menjalankan `npm run build` (jika tersedia) lalu memulai server statis pada `http://localhost:5000` dan menampilkan aplikasi melalui iframe di Streamlit.
