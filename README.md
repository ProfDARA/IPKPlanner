## Run Locally

**Prerequisites:**  Node.js


1. Instal dependensi:
   `npm install`
2. Atur `GEMINI_API_KEY` di [.env.local](.env.local) dengan API key Gemini Anda
3. Jalankan aplikasi:
   `npm run dev`

## Deploy ke Streamlit

Berikut cara menjalankan aplikasi React ini di dalam Streamlit (embed sebagai iframe).

- **File Streamlit:** [streamlit_app.py](streamlit_app.py)
- **Requirements:** [requirements.txt](requirements.txt)

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
- Jika Anda akan deploy ke platform Streamlit Cloud, pastikan aplikasi React sudah dibuild dan tersedia di URL publik, lalu gunakan opsi `--url` untuk menampilkan aplikasi yang dihosting.
- Instal dependencies Python dengan:

```bash
python -m venv .venv
source .venv/Scripts/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

Opsi build+serve (jalankan build otomatis lalu serve dari Streamlit):

```bash
# Jalankan sekali (membutuhkan Node.js di PATH)
streamlit run streamlit_app.py -- --build --serve
```

Opsi ini akan menjalankan `npm run build` (jika tersedia) lalu memulai server statis pada `http://localhost:5000` dan menampilkan aplikasi melalui iframe di Streamlit.
