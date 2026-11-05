"""Resize and compress images for the site.

Two kinds of output:
  * photos  -> assets/img/explore/<name>-sm.webp (thumb) and <name>-lg.webp (lightbox)
  * figures -> assets/img/work/<name>.webp (project/research figures, flattened
               onto the paper colour so diagrams with transparency stay legible)

Usage:
    python scripts/optimize_images.py photos  <src_dir> [<src_dir> ...]
    python scripts/optimize_images.py figures <file> [<file> ...]

After adding photos, list them in assets/js/content.js -> `photos`.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
PAPER = (243, 241, 235)
PHOTO_EXT = {".png", ".jpg", ".jpeg", ".webp", ".heic"}


def _save(im: Image.Image, path: Path, max_side: int, quality: int) -> None:
    im = im.copy()
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)
    print(f"  {path.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  {path.stat().st_size / 1024:.0f} KB")


def trim_black_bars(im: Image.Image, threshold: int = 3) -> Image.Image:
    """Crop letterbox bars (e.g. from phone screen captures) off the top and bottom.

    A row counts as "bar" only if *every* pixel is black, so dark skies survive.
    """
    gray = im.convert("L")
    w, h = gray.size
    rows = [gray.crop((0, y, w, y + 1)).getextrema()[1] for y in range(h)]
    top = next((y for y in range(h) if rows[y] > threshold), 0)
    bottom = next((y for y in range(h - 1, -1, -1) if rows[y] > threshold), h - 1)
    # Skip a thin UI strip (home indicator) left inside the bottom bar.
    while bottom > top and min(rows[bottom - 40 : bottom]) <= threshold:
        bottom -= 1
    if top > 4 and bottom < h - 5:  # letterboxed on both sides
        return im.crop((0, top + 2, w, bottom - 1))
    return im


def photos(src_dirs: list[str]) -> None:
    out = ROOT / "assets" / "img" / "explore"
    for src in src_dirs:
        for f in sorted(Path(src).iterdir()):
            if f.suffix.lower() not in PHOTO_EXT:
                continue
            im = trim_black_bars(ImageOps.exif_transpose(Image.open(f)).convert("RGB"))
            name = f.stem.lower().replace("img_", "p")
            print(f"{f.name}  {im.size[0]}x{im.size[1]}")
            _save(im, out / f"{name}-sm.webp", 720, 74)
            _save(im, out / f"{name}-lg.webp", 2000, 80)


def figures(files: list[str]) -> None:
    out = ROOT / "assets" / "img" / "work"
    for f in map(Path, files):
        im = Image.open(f)
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGBA", im.size, PAPER + (255,))
            im = Image.alpha_composite(bg, im)
        print(f.name)
        _save(im.convert("RGB"), out / f"{f.stem.lower()}.webp", 960, 82)


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in {"photos", "figures"}:
        sys.exit(__doc__)
    {"photos": photos, "figures": figures}[sys.argv[1]](sys.argv[2:])
