#!/usr/bin/env python3
"""
scrapper/build_products.py
Convert the scraped CSVs into typed Next.js data modules.

Run from repo root:  python scrapper/build_products.py

Reads:   scrapper/output/products.csv
         scrapper/output/categories.csv
Writes:  lib/products.json    lib/categories.json    lib/products.ts
"""

import csv, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, LIB = ROOT / "scrapper" / "output", ROOT / "lib"

MARKUP = re.compile(r"[*_]{1,3}")
SIZE_SUFFIX = re.compile(r"-\d{2,4}x\d{2,4}(?=\.[a-zA-Z]{3,4}$)")
REVIEW_START = re.compile(r"^\s*(Review|Testimonial)\s*\d+\b", re.I)
REVIEW_HEADING = re.compile(
    r"^(Real\s+)?Customer\s+Reviews?\b|^Reviews?\s*(and|&)\s*Experiences\b|^Testimonials?\b", re.I
)
RESUME = re.compile(
    r"^\s*(Frequently Asked Questions|FAQs?\b|Conclusion|Final Thoughts|In Conclusion|Summary|Why Choose)",
    re.I,
)


def to_paragraphs(text: str) -> list[str]:
    if not text:
        return []
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\xa0", " ")
    text = MARKUP.sub("", text)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in text.split("\n")]

    paras, buf = [], []
    for ln in lines:
        if ln:
            buf.append(ln)
        elif buf:
            paras.append(" ".join(buf)); buf = []
    if buf:
        paras.append(" ".join(buf))

    out = []
    for p in paras:
        if not out or out[-1] != p:
            out.append(p)
    return out


def drop_reviews(paras: list[str]) -> list[str]:
    """Remove the fake 'Review 1/2/3' testimonial blocks and their heading."""
    out, skipping = [], False
    for p in paras:
        if not skipping and (REVIEW_START.match(p) or REVIEW_HEADING.match(p)):
            skipping = True
            continue
        if skipping:
            if RESUME.match(p):
                skipping = False
                out.append(p)
            continue
        out.append(p)
    return out


def headline_from(text: str, limit: int = 140) -> str:
    if not text:
        return ""
    first = re.split(r"(?<=[.!?])\s", text.strip())[0]
    return first if len(first) <= limit else first[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def slug_from(value: str) -> str:
    return value.rstrip("/").split("/")[-1].lower()


def build_products() -> list[dict]:
    with (SRC / "products.csv").open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    seen, products = set(), []
    for r in rows:
        url = (r.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)

        paras = drop_reviews(to_paragraphs(r.get("full_description", "")))
        short = " ".join(to_paragraphs(r.get("short_description", "")))
        thumb = (r.get("image") or "").strip()

        products.append({
            "slug": slug_from(url),
            "name": (r.get("title") or "").strip(),
            "category": (r.get("category") or "").strip(),
            "categorySlug": slug_from((r.get("category") or "").replace(" ", "-")),
            "headline": headline_from(short),
            "summary": short,
            "paragraphs": paras,
            "tags": [t.strip() for t in (r.get("tags") or "").split("|") if t.strip()],
            "image": thumb,
            "imageFull": SIZE_SUFFIX.sub("", thumb),
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
    return [{
        "slug": (r.get("slug") or "").strip(),
        "name": (r.get("category") or "").strip(),
        "paragraphs": to_paragraphs(r.get("description", "")),
        "wordCount": int(r.get("word_count") or 0),
    } for r in rows]


TS_WRAPPER = '''\
// AUTO-GENERATED wrapper. Edit build_products.py, not this file.
import raw from "./products.json";

export type Product = {
  slug: string; name: string; category: string; categorySlug: string;
  headline: string; summary: string; paragraphs: string[];
  tags: string[]; image: string; imageFull: string; sourceUrl: string;
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
    products, categories = build_products(), build_categories()
    (LIB / "products.json").write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    (LIB / "categories.json").write_text(json.dumps(categories, ensure_ascii=False, indent=2), encoding="utf-8")
    (LIB / "products.ts").write_text(TS_WRAPPER, encoding="utf-8")
    print(f"wrote {len(products)} products, {len(categories)} categories")


if __name__ == "__main__":
    main()
