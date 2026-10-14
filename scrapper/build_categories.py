#!/usr/bin/env python3
"""
scrapper/build_categories.py
Re-scrape the six category pages, preserving heading / paragraph / list structure,
and write lib/categories.json as typed blocks.

Run:  python scrapper/build_categories.py
"""
import json, re, time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "lib" / "categories.json"
BASE = "https://globaldocuzone.com"
SLUGS = ["certificate", "passport", "driving-license", "residence-permit", "id-card", "travel-visa"]
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}
TAGS = ["h2", "h3", "h4", "p", "li"]
KIND = {"h2": "h2", "h3": "h3", "h4": "h2", "p": "p", "li": "li"}


def clean(t: str) -> str:
    return re.sub(r"\s+", " ", t or "").strip()


def collect(iterator):
    """Turn a stream of elements into typed blocks, preserving order."""
    blocks, prev = [], None
    for el in iterator:
        if el.name == "li" and el.find("li"):
            continue                                   # skip nested list wrappers
        text = clean(el.get_text(" "))
        if len(text) < 2 or text == prev:
            continue
        if text.lower().startswith("showing") and "result" in text.lower():
            break
        prev = text
        blocks.append({"type": KIND[el.name], "text": text})
    return blocks


def scrape(slug: str) -> dict:
    url = f"{BASE}/product-category/{slug}/"
    html = requests.get(url, headers=HEADERS, timeout=30).text
    soup = BeautifulSoup(html, "lxml")

    title = soup.select_one(".woocommerce-products-header__title") or soup.select_one("h1")
    name = clean(title.get_text()) if title else slug.replace("-", " ").title()

    container = soup.select_one(".term-description") or soup.select_one(".taxonomy-description")
    if container is not None:
        blocks = collect(container.find_all(TAGS))
    else:
        blocks = collect(title.find_all_next(TAGS)) if title else []

    # drop a leading block that just repeats the H1
    if blocks and blocks[0]["text"].lower() == name.lower():
        blocks = blocks[1:]

    return {
        "slug": slug,
        "name": name,
        "blocks": blocks,
        "wordCount": sum(len(b["text"].split()) for b in blocks),
    }


def main() -> None:
    out = []
    for slug in SLUGS:
        cat = scrape(slug)
        out.append(cat)
        print(f"  {slug}: {len(cat['blocks'])} blocks, {cat['wordCount']} words")
        time.sleep(0.8)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(out)} categories -> {OUT}")


if __name__ == "__main__":
    main()