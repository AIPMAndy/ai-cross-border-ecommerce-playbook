#!/usr/bin/env python3
"""Verify actual public GitHub Pages bytes after deployment, not just workflow success."""
import hashlib
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io/ai-cross-border-ecommerce-playbook/"
FILES = [
    "index.html",
    "sources.html",
    "assets/sources.js",
    "research/source-register.csv",
    "robots.txt",
    "sitemap.xml",
    "pdf/ai-cross-border-ecommerce-playbook-guide.pdf",
]

def check_one(name):
    expected = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
    uri = BASE + ("" if name == "index.html" else name)
    last = None
    for retry in range(12):
        try:
            req = urllib.request.Request(uri + "?sha=" + expected[:12],
                  headers={"User-Agent": "AIPMAndy-Pages-Artifact-Verifier/1.0", "Cache-Control": "no-cache"})
            with urllib.request.urlopen(req, timeout=25) as response:
                raw = response.read()
                final = response.geturl()
                code = response.status
            actual = hashlib.sha256(raw).hexdigest()
            if code == 200 and actual == expected:
                print("PASS:", name, "HTTP", code, "SHA-256", actual, "bytes", len(raw))
                return
            last = f"HTTP {code}, sha={actual}, expected={expected}, final={final}"
        except (OSError, urllib.error.URLError) as error:
            last = str(error)
        if retry < 11:
            time.sleep(6)
    raise RuntimeError(f"Published file {name} not verified: {last}")

if __name__ == "__main__":
    for name in FILES:
        check_one(name)
    print("PASS: 7 published resources, including original PDF, match repository SHA-256.")
