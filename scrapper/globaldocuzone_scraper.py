#!/usr/bin/env python3
"""
scrapper/build_products.py
Convert the scraped CSVs into typed Next.js data modules.

Run from the repo root:  python scrapper/build_products.py

Reads:   scrapper/output/products.csv
         scrapper/output/categories.csv
Writes:  lib/products.json     (product records)
         lib/categories.json   (category copy + slug)
         lib/products.ts       (typed wrapper + helpers)
"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scrapper" / "output"
LIB = ROOT / "lib"

# WooCommerce leaves <em>/<strong> markup as _..._ / **...** in the extracted text
MARKUP = re.compile(r"[*_]{1,3}")
SIZE_SUFFIX = re.compile(r"-\d{2,4}x\d{2,4}(?=\.[a-zA-Z]{3,4}$)")


def to_paragraphs(text: str) -> list[str]:
    """Normalise markup, collapse soft wraps, split on blank lines."""
    if not text:
        return []
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\xa0", " ")
    text = MARKUP.sub("", text)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in text.split("\n")]

    paragraphs, buf = [], []
    for ln in lines:
        if ln:
            buf.append(ln)
        elif buf:
            paragraphs.append(" ".join(buf))
            buf = []
    if buf:
        paragraphs.append(" ".join(buf))

    # drop exact consecutive duplicates
    out = []
    for p in paragraphs:
        if not out or out[-1] != p:
            out.append(p)
    return out


def headline_from(text: str, limit: int = 140) -> str:
    """First sentence, trimmed to a card-sized line."""
    if not text:
        return ""
    first = re.split(r"(?<=[.!?])\s", text.strip())[0]
    if len(first) <= limit:
        return first
    return first[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def slug_from(url: str) -> str:
    return url.rstrip("/").split("/")[-1].lower()


def full_size_image(url: str) -> str:
    """.../name-600x417.jpg -> .../name.jpg so we get the source resolution."""
    return SIZE_SUFFIX.sub("", url) if url else ""


def build_products() -> list[dict]:
    src = SRC / "products.csv"
    with src.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    seen, products = set(), []
    for r in rows:
        url = (r.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)

        paragraphs = to_paragraphs(r.get("full_description", ""))
        short = " ".join(to_paragraphs(r.get("short_description", "")))

        products.append({
            "slug": slug_from(url),
            "name": (r.get("title") or "").strip(),
            "category": (r.get("category") or "").strip(),
            "categorySlug": slug_from((r.get("category") or "").replace(" ", "-")),
            "headline": headline_from(short),
            "summary": short,
            "paragraphs": paragraphs,
            "tags": [t.strip() for t in (r.get("tags") or "").split("|") if t.strip()],
            "image": full_size_image((r.get("image") or "").strip()),
            "sourceUrl": url,
        })

    products.sort(key=lambda p: (p["categorySlug"], p["name"].lower()))
    return products


def build_categories() -> list[dict]:
    src = SRC / "categories.csv"
    if not src.exists():
        return []
    with src.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    cats = []
    for r in rows:
        paragraphs = to_paragraphs(r.get("description", ""))
        cats.append({
            "slug": (r.get("slug") or "").strip(),
            "name": (r.get("category") or "").strip(),
            "paragraphs": paragraphs,
            "wordCount": int(r.get("word_count") or 0),
        })
    return cats


TS_WRAPPER = '''\
// AUTO-GENERATED data wrapper. Edit build_products.py, not this file.
import raw from "./products.json";

export type Product = {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  headline: string;
  summary: string;
  paragraphs: string[];
  tags: string[];
  image: string;
  sourceUrl: string;
};

export const products = raw as Product[];

export const productCategories = [
  ...new Map(
    products.map((p) => [p.categorySlug, { slug: p.categorySlug, name: p.category }])
  ).values(),
];

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsInCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}
'''


def main() -> None:
    LIB.mkdir(exist_ok=True)

    products = build_products()
    categories = build_categories()

    (LIB / "products.json").write_text(
        json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (LIB / "categories.json").write_text(
        json.dumps(categories, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (LIB / "products.ts").write_text(TS_WRAPPER, encoding="utf-8")

    print(f"wrote {len(products)} products, {len(categories)} categories")


if __name__ == "__main__":
    main()
