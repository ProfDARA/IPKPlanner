import argparse
import streamlit as st
from streamlit.components.v1 import iframe


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dev", action="store_true", help="Embed dev server at http://localhost:5173")
    parser.add_argument("--url", type=str, help="URL of built app (e.g. http://localhost:5000)")
    args = parser.parse_args()

    st.set_page_config(page_title="Smart IPK Planner (Streamlit)", layout="wide")
    st.title("Smart IPK Planner — Streamlit Embed")

    if args.dev:
        url = "http://localhost:5173"
    elif args.url:
        url = args.url
    else:
        st.markdown("**Cara menjalankan dari repo ini**")
        st.markdown("**Pengembangan (dev)**")
        st.code("npm run dev\nstreamlit run streamlit_app.py -- --dev", language="bash")
        st.markdown("**Produksi (build + serve)**")
        st.code("npm run build\nnpx serve dist -l 5000\nstreamlit run streamlit_app.py -- --url http://localhost:5000", language="bash")
        st.info("Atau masukkan URL tempat aplikasi React Anda disajikan:")
        url = st.text_input("URL aplikasi (mis. http://localhost:5000)", "")
        if not url:
            return

    st.markdown(f"Menampilkan aplikasi di: {url}")
    iframe(url, width=1200, height=800, scrolling=True)


if __name__ == "__main__":
    main()
