import argparse
import streamlit as st
from streamlit.components.v1 import iframe
import threading
import subprocess
import shutil
import os
import time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


def _start_static_server(directory: str, port: int):
    # Change working dir for the server thread
    os.chdir(directory)
    handler = SimpleHTTPRequestHandler
    server = ThreadingHTTPServer(("", port), handler)
    server.serve_forever()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dev", action="store_true", help="Embed dev server at http://localhost:5173")
    parser.add_argument("--url", type=str, help="URL of built app (e.g. http://localhost:5000)")
    parser.add_argument("--build", action="store_true", help="Run `npm run build` before serving")
    parser.add_argument("--serve", action="store_true", help="Start a local static server to serve `dist` and embed it")
    parser.add_argument("--port", type=int, default=5000, help="Port to serve static files on when using --serve")
    args = parser.parse_args()

    st.set_page_config(page_title="Smart IPK Planner (Streamlit)", layout="wide")
    st.title("Smart IPK Planner — Streamlit Embed")

    # Priority: --dev, --serve, --url, else interactive guidance
    url = None

    if args.dev:
        url = "http://localhost:5173"

    elif args.serve:
        dist_path = os.path.join(os.getcwd(), "dist")

        if args.build:
            npm = shutil.which("npm")
            if npm is None:
                st.error("npm tidak ditemukan di PATH — pastikan Node.js terinstal untuk build.")
                return
            st.info("Menjalankan `npm run build`... ini mungkin memakan waktu beberapa detik.")
            try:
                subprocess.run([npm, "run", "build"], check=True)
            except subprocess.CalledProcessError as e:
                st.error(f"Build gagal: {e}")
                return

        if not os.path.isdir(dist_path):
            st.error("Folder `dist` tidak ditemukan. Jalankan `npm run build` terlebih dahulu atau gunakan opsi `--build`.")
            return

        port = args.port
        # Start static server in background thread
        t = threading.Thread(target=_start_static_server, args=(dist_path, port), daemon=True)
        t.start()
        # Give server a moment to start
        time.sleep(0.5)
        url = f"http://localhost:{port}"

    elif args.url:
        url = args.url

    else:
        st.markdown("**Cara menjalankan dari repo ini**")
        st.markdown("**Pengembangan (dev)**")
        st.code("npm install\nnpm run dev\nstreamlit run streamlit_app.py -- --dev", language="bash")
        st.markdown("**Produksi (build + serve)**")
        st.code("npm install\nnpm run build\nstreamlit run streamlit_app.py -- --build --serve", language="bash")
        st.info("Atau masukkan URL tempat aplikasi React Anda disajikan:")
        url = st.text_input("URL aplikasi (mis. http://localhost:5000)", "")
        if not url:
            return

    st.markdown(f"Menampilkan aplikasi di: {url}")
    iframe(url, width=1200, height=800, scrolling=True)


if __name__ == "__main__":
    main()
