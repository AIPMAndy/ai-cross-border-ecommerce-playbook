#!/usr/bin/env python3
"""Optional browser test: pip install playwright && playwright install chromium."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        page=await browser.new_page(viewport={"width":390,"height":844})
        await page.goto((ROOT/"offline.html").as_uri())
        await page.wait_for_timeout(800)
        title=await page.title()
        assert "跨境电商" in title
        maxwidth=await page.evaluate("document.documentElement.scrollWidth")
        viewport=await page.evaluate("window.innerWidth")
        assert maxwidth<=viewport+2,(maxwidth,viewport)
        await browser.close()
        print("PASS browser title and 390px mobile overflow")
asyncio.run(main())
