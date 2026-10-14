#!/usr/bin/env python3
"""
rename_brand.py
Rewrite every reference to the source brand — "Docu Zone Global",
"DocuZone", "Global Docu Zone", "globaldocuzone" — to "Docs2Travel".

Run from the repo root:
    python scrapper/rename_brand.py --dry-run
    python scrapper/rename_brand.py

Options:
    --root PATH         repo root (default: current directory)
    --dry-run           report only, write nothing
    --rewrite-domain    also turn globaldocuzone.com into docs2travel.com
                        inside URLs (opt-in: images are still hosted there)
    --exclude a,b       extra path fragments to skip
    --extensions x,y    file extensions to process
"""

import argparse
import os
import re
import sys
from pathlib import Path

# --- rules, applied in order (first match wins per position) ---------------
RULES = [
    (re.compile(r"globaldocuzone\.com", re.I), "docs2travel.com"),
    (re.compile(r"docu\s*zone\s*global", re.I), "Docs2Travel"),
    (re.compile(r"global\s*docu\s*zone", re.I), "Docs2Travel"),
    (re.compile(r"docu\s*zone", re.I), "Docs2Travel"),
    (re.compile(r"globaldocuzone", re.I), "Docs2Travel"),
]

URL_RE = re.compile(r"https?://[^\s\"'<>)\]]+")

DEFAULT_EXT = "ts,tsx,js,jsx,mjs,cjs,json,css,scss,md,mdx,html,svg,txt,csv,py"
DEFAULT_SKIP = {
    "node_modules", ".next", ".git", ".venv", "venv", "__pycache__",
    "dist", "build", ".turbo", ".vercel",
}
SKIP_FILES = {"bun.lock", "bun.lockb", "package-lock.json", "yarn.lock"}
MAX_BYTES = 5_000_000


def apply_rules(text: str) -> tuple[str, int]:
    """Apply brand rules to a chunk of non-URL text. Returns (new, hits)."""
    hits = 0
    for pattern, repl in RULES:
        text, n = pattern.subn(repl, text)
        hits += n
    return text, hits


def transform(text: str, rewrite_domain: bool) -> tuple[str, int]:
    """Rewrite text but leave URLs untouched unless asked."""
    out, hits, last = [], 0, 0
    for m in URL_RE.finditer(text):
        chunk, n = apply_rules(text[last:m.start()])
        out.append(chunk)
        hits += n

        url = m.group(0)
        if rewrite_domain:
            url, n2 = re.subn(r"globaldocuzone\.com", "docs2travel.com", url, flags=re.I)
            hits += n2
        out.append(url)
        last = m.end()

    chunk, n = apply_rules(text[last:])
    out.append(chunk)
    hits += n
    return "".join(out), hits


def collect(root: Path, extensions: set[str], skip: set[str], extra_skip: set[str]):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            d for d in dirnames
            if d not in skip and not any(s in str(Path(dirpath) / d) for s in extra_skip)
        ]
        for name in filenames:
            p = Path(dirpath) / name
            if name in SKIP_FILES or p.suffix.lower().lstrip(".") not in extensions:
                continue
            if any(s in str(p) for s in extra_skip):
                continue
            try:
                if p.stat().st_size > MAX_BYTES:
                    continue
            except OSError:
                continue
            yield p


def main() -> int:
    ap = argparse.ArgumentParser(description="Rename source brand references to Docs2Travel.")
    ap.add_argument("--root", default=".")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--rewrite-domain", action="store_true")
    ap.add_argument("--exclude", default="")
    ap.add_argument("--extensions", default=DEFAULT_EXT)
    args = ap.parse_args()

    root = Path(args.root).resolve()
    extensions = {e.strip().lower().lstrip(".") for e in args.extensions.split(",") if e.strip()}
    extra_skip = {s.strip() for s in args.exclude.split(",") if s.strip()}

    changed, total_hits, scanned = [], 0, 0

    for path in collect(root, extensions, DEFAULT_SKIP, extra_skip):
        scanned += 1
        try:
            original = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue

        updated, hits = transform(original, args.rewrite_domain)
        if not hits:
            continue

        rel = path.relative_to(root)
        changed.append((rel, hits))
        total_hits += hits

        if not args.dry_run:
            path.write_text(updated, encoding="utf-8")

    for rel, hits in sorted(changed, key=lambda x: -x[1]):
        print(f"  {hits:>4}  {rel}")

    verb = "would change" if args.dry_run else "changed"
    print(f"\n{verb} {len(changed)} files, {total_hits} replacements "
          f"({scanned} files scanned, root={root})")
    if args.dry_run:
        print("dry run — nothing written")
    return 0


if __name__ == "__main__":
    sys.exit(main())