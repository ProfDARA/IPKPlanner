import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path

st.set_page_config(
    page_title="Smart IPK Kalkulator",
    layout="wide",
)

build_dir = Path(__file__).parent / "dist"
html_path = build_dir / "index.html"

html = html_path.read_text(encoding="utf-8")

components.html(
    html,
    height=1000,
    scrolling=True,
)
