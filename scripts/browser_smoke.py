#!/usr/bin/env python3
"""Chromium smoke: main tools remain usable; sources search/filter/TXT downloads work."""
import asyncio
import contextlib
import subprocess
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = 8765

async def main():
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1", "--directory", str(ROOT)],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            for width in (360, 390, 1280):
                page = await browser.new_page(viewport={"width": width, "height": 844}, accept_downloads=True)
                for retry in range(20):
                    try:
                        await page.goto(f"http://127.0.0.1:{PORT}/sources.html", wait_until="domcontentloaded")
                        break
                    except Exception:
                        if retry == 19: raise
                        await asyncio.sleep(0.2)
                await page.locator("#sourceList article").first.wait_for(timeout=15000)
                count = await page.locator("#sourceList article").count()
                assert count >= 29, (width, count)
                assert await page.locator("#summary").inner_text() != "加载失败"
                await page.locator("#search").fill("Amazon")
                await page.locator("#kind").select_option("official")
                filtered = await page.locator("#sourceList article").count()
                assert filtered >= 1, (width, filtered)
                async with page.expect_download() as dl:
                    await page.locator("#export").click()
                download = await dl.value
                assert download.suggested_filename.endswith(".txt")
                destination = Path("/tmp") / f"cross-border-source-{width}.txt"
                await download.save_as(destination)
                text = destination.read_text(encoding="utf-8-sig")
                assert "原始 URL：" in text and "历史核验日不代表今天有效" in text
                await page.locator("#clear").click()
                assert await page.locator("#sourceList article").count() == count
                await page.goto(f"http://127.0.0.1:{PORT}/", wait_until="domcontentloaded")
                assert "跨境电商" in await page.title()
                assert await page.locator('a[href="sources.html"]').count() >= 1
                assert await page.locator("#routeAdvisor").count() == 1
                assert await page.locator("#profitForm").count() == 1
                maxwidth = await page.evaluate("document.documentElement.scrollWidth")
                viewport = await page.evaluate("window.innerWidth")
                assert maxwidth <= viewport + 2, (width, maxwidth, viewport)
                await page.close()
                print(f"PASS Chromium {width}px: source search/filter/reset, TXT byte output, existing tools, no overflow")
            await browser.close()
    finally:
        server.terminate()
        with contextlib.suppress(subprocess.TimeoutExpired):
            server.wait(timeout=5)

asyncio.run(main())
