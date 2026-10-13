#!/usr/bin/env python3
"""
globaldocuzone_scraper.py
--------------------------
Scrapes:
  1. Every product in the shop (https://globaldocuzone.com/shop/ + pagination)
  2. The written text of every category page + the products listed in each category

Then applies configurable filters and exports everything to CSV.

Outputs (written to ./output by default):
  - products.csv    : one row per product (title, url, category, price, short desc, full desc, tags, image)
  - categories.csv  : one row per category (name, url, full written text, word count, product count)
  - products_filtered.csv : the filtered subset

Requires:
    pip install requests beautifulsoup4 lxml

Usage:
    python globaldocuzone_scraper.py
    python globaldocuzone_scraper.py --include passport,visa --exclude czech --out mydata
    python globaldocuzone_scraper.py --no-product-details      # fast pass, listing data only
"""

import argparse
import csv
import json
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

BASE = "https://globaldocuzone.com"
SHOP_URL = f"{BASE}/shop/"
CATEGORY_BASE = f"{BASE}/product-category/"

# Confirmed from the site's product_cat-sitemap.xml
CATEGORY_SLUGS = [
    "certificate",
    "passport",
    "driving-license",
    "residence-permit",
    "id-card",
    "travel-visa",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def clean(text):
    """Collapse whitespace and strip."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def clean_block(text):
    """Preserve paragraph breaks, collapse the rest."""
    if not text:
        return ""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    return text.strip()


def fetch(url, retries=3, timeout=30):
    for attempt in range(1, retries + 1):
        try:
            r = SESSION.get(url, timeout=timeout)
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.text
        except requests.RequestException as e:
            if attempt == retries:
                print(f"  [!] failed {url}: {e}", file=sys.stderr)
                return None
            time.sleep(1.5 * attempt)
    return None


def soup_of(url, **kw):
    html = fetch(url, **kw)
    if html is None:
        return None
    return BeautifulSoup(html, "lxml")


def parse_price(text):
    """Return a float price from a string, or None."""
    if not text:
        return None
    m = re.search(r"[\d,]+(?:\.\d{1,2})?", text.replace("\xa0", " "))
    if not m:
        return None
    try:
        return float(m.group(0).replace(",", ""))
    except ValueError:
        return None


# --------------------------------------------------------------------------- #
# Data model
# --------------------------------------------------------------------------- #
@dataclass
class Product:
    title: str = ""
    url: str = ""
    category: str = ""
    categories_all: str = ""
    price: str = ""
    price_value: float = 0.0
    sku: str = ""
    short_description: str = ""
    full_description: str = ""
    tags: str = ""
    image: str = ""
    source: str = ""          # where the link was discovered
    in_stock: str = ""


# --------------------------------------------------------------------------- #
# 1. Shop listing discovery (with pagination)
# --------------------------------------------------------------------------- #
def discover_shop_products(max_pages=50, delay=0.8):
    """Walk /shop/ and /shop/page/N/ and return a dict url -> partial Product."""
    found = {}
    page = 1
    while page <= max_pages:
        url = SHOP_URL if page == 1 else f"{BASE}/shop/page/{page}/"
        soup = soup_of(url)
        if soup is None:
            break

        items = soup.select("ul.products li.product, li.product")
        if not items:
            break

        for li in items:
            p = parse_listing_item(li, url, source="shop")
            if p:
                found.setdefault(p.url, p)

        # stop when there is no "next" page link
        next_link = soup.select_one("a.next.page-numbers")
        print(f"  shop page {page}: {len(items)} items "
              f"({'next exists' if next_link else 'last page'})")
        if not next_link:
            break
        page += 1
        time.sleep(delay)
    return found


def parse_listing_item(li, page_url, source=""):
    a = (
        li.select_one("a.woocommerce-LoopProduct-link")
        or li.select_one("h2 a")
        or li.select_one("a[href*='/product/']")
    )
    if not a or not a.get("href"):
        return None
    url = urljoin(page_url, a["href"])
    if "/product/" not in url:
        return None

    title_el = li.select_one(".woocommerce-loop-product__title") or li.select_one("h2")
    price_el = li.select_one(".price")
    img_el = li.select_one("img")

    return Product(
        title=clean(title_el.get_text()) if title_el else "",
        url=url.split("?")[0],
        price=clean(price_el.get_text()) if price_el else "",
        price_value=parse_price(price_el.get_text()) if price_el else 0.0,
        image=urljoin(page_url, img_el.get("src", "")) if img_el else "",
        source=source,
    )


# --------------------------------------------------------------------------- #
# 2. Category pages: written text + their products
# --------------------------------------------------------------------------- #
def scrape_category(slug, delay=0.8):
    """Return (category_dict, [Product,...])."""
    url = f"{CATEGORY_BASE}{slug}/"
    soup = soup_of(url)
    if soup is None:
        print(f"  [!] category not found: {url}", file=sys.stderr)
        return None, []

    name_el = (
        soup.select_one(".woocommerce-products-header__title")
        or soup.select_one("h1.page-title")
        or soup.select_one("h1")
    )
    name = clean(name_el.get_text()) if name_el else slug.replace("-", " ").title()

    # The long editorial copy sits in the term description (with fallbacks).
    desc_el = (
        soup.select_one(".term-description")
        or soup.select_one(".woocommerce-Tabs-panel--description")
        or soup.select_one(".taxonomy-description")
    )
    if desc_el:
        body_text = clean_block(desc_el.get_text("\n"))
    else:
        # Fallback: everything between the H1 and the results counter.
        chunks = []
        for sib in (name_el.find_all_next() if name_el else []):
            if "Showing" in sib.get_text() and "results" in sib.get_text():
                break
            if sib.name in ("p", "li", "h2", "h3"):
                t = clean(sib.get_text())
                if t and t not in chunks:
                    chunks.append(t)
        body_text = "\n".join(chunks)

    products = {}
    for li in soup.select("ul.products li.product, li.product"):
        p = parse_listing_item(li, url, source=f"category:{slug}")
        if p:
            if not p.category:
                p.category = name
            products.setdefault(p.url, p)

    cat = {
        "category": name,
        "slug": slug,
        "url": url,
        "description": body_text,
        "word_count": len(body_text.split()),
        "product_count": len(products),
    }
    print(f"  category '{name}': {len(products)} products, {cat['word_count']} words")
    time.sleep(delay)
    return cat, list(products.values())


# --------------------------------------------------------------------------- #
# 3. Product detail page
# --------------------------------------------------------------------------- #
def enrich_product(p: Product):
    soup = soup_of(p.url)
    if soup is None:
        return p

    def txt(sel):
        el = soup.select_one(sel)
        return clean_block(el.get_text("\n")) if el else ""

    title = soup.select_one("h1.product_title") or soup.select_one("h1")
    if title:
        p.title = clean(title.get_text()) or p.title

    price_el = soup.select_one("p.price .woocommerce-Price-amount, .price")
    if price_el:
        p.price = clean(price_el.get_text())
        p.price_value = parse_price(p.price) or p.price_value

    p.sku = txt(".sku")
    p.short_description = txt(".woocommerce-product-details__short-description")
    p.full_description = (
        txt("#tab-description")
        or txt(".woocommerce-Tabs-panel--description")
        or txt(".woocommerce-product-details__description")
    )

    cats = [clean(a.get_text()) for a in soup.select(".posted_in a")]
    if cats:
        p.category = cats[0]
        p.categories_all = " | ".join(cats)

    p.tags = " | ".join(clean(a.get_text()) for a in soup.select(".tagged_as a"))

    img = soup.select_one(".woocommerce-product-gallery img")
    if img and img.get("src"):
        p.image = urljoin(p.url, img["src"])

    stock = soup.select_one(".stock")
    if stock:
        p.in_stock = clean(stock.get_text())
    return p


# --------------------------------------------------------------------------- #
# 4. Filtering
# --------------------------------------------------------------------------- #
def apply_filters(products, args):
    """Apply keyword / category / price filters. Returns filtered list."""
    inc = [k.lower() for k in args.include.split(",") if k.strip()]
    exc = [k.lower() for k in args.exclude.split(",") if k.strip()]
    only_cats = [c.lower() for c in args.only_categories.split(",") if c.strip()]

    out = []
    seen = set()
    for p in products:
        if p.url in seen:
            continue

        blob = f"{p.title} {p.category} {p.tags} {p.short_description}".lower()

        if inc and not any(k in blob for k in inc):
            continue
        if exc and any(k in blob for k in exc):
            continue
        if only_cats and p.category.lower() not in only_cats:
            continue
        if args.min_price and (p.price_value or 0) < args.min_price:
            continue
        if args.with_price_only and not p.price_value:
            continue

        seen.add(p.url)
        out.append(p)
    return out


# --------------------------------------------------------------------------- #
# 5. CSV export
# --------------------------------------------------------------------------- #
PRODUCT_FIELDS = [
    "title", "url", "category", "categories_all", "price", "price_value",
    "sku", "short_description", "full_description", "tags", "image",
    "in_stock", "source",
]
CATEGORY_FIELDS = ["category", "slug", "url", "word_count", "product_count", "description"]


def write_csv(path, rows, fields):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(asdict(r) if hasattr(r, "__dataclass_fields__") else r)
    print(f"  wrote {len(rows)} rows -> {path}")


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser(description="Scrape globaldocuzone.com shop + categories to CSV.")
    ap.add_argument("--out", default="output", help="output directory")
    ap.add_argument("--include", default="", help="comma list of keywords that MUST appear")
    ap.add_argument("--exclude", default="", help="comma list of keywords to drop")
    ap.add_argument("--only-categories", default="", help="comma list of category names to keep")
    ap.add_argument("--min-price", type=float, default=0.0)
    ap.add_argument("--with-price-only", action="store_true")
    ap.add_argument("--delay", type=float, default=0.8, help="seconds between requests")
    ap.add_argument("--no-product-details", action="store_true",
                    help="skip visiting each product page (fast)")
    args = ap.parse_args()

    import os
    os.makedirs(args.out, exist_ok=True)

    print("[1/4] Discovering products in /shop/ ...")
    products = discover_shop_products(delay=args.delay)

    print("[2/4] Scraping category pages + their products ...")
    categories = []
    for slug in CATEGORY_SLUGS:
        cat, prods = scrape_category(slug, delay=args.delay)
        if cat:
            categories.append(cat)
        for p in prods:
            products.setdefault(p.url, p)

    all_products = list(products.values())
    print(f"  total unique products discovered: {len(all_products)}")

    if not args.no_product_details:
        print("[3/4] Enriching product detail pages ...")
        enriched = []
        for i, p in enumerate(all_products, 1):
            if i % 10 == 1:
                print(f"  {i}/{len(all_products)} ...")
            enriched.append(enrich_product(p))
            time.sleep(args.delay)
        all_products = enriched
    else:
        print("[3/4] Skipping product detail pages.")

    print("[4/4] Filtering + exporting ...")
    filtered = apply_filters(all_products, args)

    write_csv(os.path.join(args.out, "products.csv"), all_products, PRODUCT_FIELDS)
    write_csv(os.path.join(args.out, "categories.csv"), categories, CATEGORY_FIELDS)
    write_csv(os.path.join(args.out, "products_filtered.csv"), filtered, PRODUCT_FIELDS)

    print(f"\nDone. {len(all_products)} products, {len(filtered)} after filters, "
          f"{len(categories)} categories.")
    print(f"Output folder: {os.path.abspath(args.out)}")


if __name__ == "__main__":
    main()
