"""Publication contract for the cross-border Pages site. No network required."""
import csv
import hashlib
import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io/ai-cross-border-ecommerce-playbook/"

class TestPublication(unittest.TestCase):
    def test_html_metadata(self):
        for name, url in (("index.html", BASE), ("sources.html", BASE + "sources.html")):
            html = (ROOT / name).read_text("utf-8")
            self.assertIn('<link rel="canonical" href="' + url + '">', html)
            self.assertIn("https://metaver.vip/", html)
            self.assertIn("https://www.a6no1.cn/", html)
            self.assertIn("AIPMAndy", html)
            self.assertIn("https://metaver.vip/services", html)
            self.assertEqual(len(re.findall(r"<h1(?:\s|>)", html)), 1)
            scripts = re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', html)
            self.assertTrue(scripts, "missing JSON-LD: " + name)
            for fragment in scripts:
                doc = json.loads(fragment)
                self.assertEqual(doc["@context"], "https://schema.org")
                self.assertEqual(doc["url"], url)
                self.assertEqual(doc["author"]["name"], "AI 酋长 Andy")
                self.assertEqual(doc["publisher"]["url"], "https://www.a6no1.cn/")
        self.assertIn("research/source-register.csv", (ROOT / "sources.html").read_text("utf-8"))
        self.assertIn('href="sources.html"', (ROOT / "index.html").read_text("utf-8"))
        self.assertIn('href="pdf/ai-cross-border-ecommerce-playbook-guide.pdf"', (ROOT / "index.html").read_text("utf-8"))

    def test_robots_sitemap(self):
        robots = (ROOT / "robots.txt").read_text("utf-8")
        self.assertIn("Sitemap: " + BASE + "sitemap.xml", robots)
        root = ET.fromstring((ROOT / "sitemap.xml").read_bytes())
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        urls = {x.findtext(ns + "loc"): x.findtext(ns + "lastmod") for x in root.findall(ns + "url")}
        self.assertEqual(urls[BASE], "2026-11-20")
        self.assertEqual(urls[BASE + "sources.html"], "2026-11-20")
        self.assertIn(BASE + "offline.html", urls)
        self.assertIsNone(urls[BASE + "offline.html"])

    def test_ledger_and_pdf_unchanged(self):
        with (ROOT / "research/source-register.csv").open("r", encoding="utf-8-sig", newline="") as fh:
            records = list(csv.DictReader(fh))
        self.assertGreaterEqual(len(records), 29)
        self.assertEqual(len(records), len({r["id"] for r in records}))
        self.assertTrue(all(r["url"].startswith("https://") for r in records))
        self.assertTrue(all(re.fullmatch(r"\d{4}-\d{2}-\d{2}", r["checked_on"]) for r in records))
        edition = json.loads((ROOT / "pdf/edition.json").read_text("utf-8"))
        pdf = ROOT / edition["pdf_path"]
        self.assertTrue(pdf.is_file())
        self.assertEqual(pdf.stat().st_size, edition["bytes"])
        self.assertEqual(hashlib.sha256(pdf.read_bytes()).hexdigest(), edition["sha256"])

if __name__ == "__main__":
    unittest.main()
