#!/usr/bin/env python3
"""Make an offline single-page site from the readable source files."""
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/"index.html").read_text(encoding="utf-8")
css=(ROOT/"assets/style.css").read_text(encoding="utf-8")
data=(ROOT/"data/site-data.js").read_text(encoding="utf-8")
js=(ROOT/"assets/app.js").read_text(encoding="utf-8")
html=html.replace('<link rel="stylesheet" href="assets/style.css">', "<style>"+css+"</style>")
html=html.replace('<script defer src="data/site-data.js"></script>',"<script>"+data+"</script>")
html=html.replace('<script defer src="assets/app.js"></script>',"<script>"+js+"</script>")
html=html.replace("<title>AI 跨境电商","<title>离线版 · AI 跨境电商")
(ROOT/"offline.html").write_text(html,encoding="utf-8")
print("Built offline.html")
