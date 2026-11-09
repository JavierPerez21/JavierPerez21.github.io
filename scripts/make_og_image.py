"""Render the social preview card (assets/img/og.png, 1200x630).

Usage:
    python scripts/make_og_image.py <serif.ttf> <serif-italic.ttf> <mono.ttf>

(Instrument Serif Regular/Italic and Geist Mono, from Google Fonts.)
"""

import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H, S = 1200, 630, 2  # supersample for smooth lines
PAPER, INK, INK3, ACCENT = (243, 241, 235), (18, 18, 18), (139, 138, 132), (255, 77, 31)


def main(serif: str, italic: str, mono: str) -> None:
    im = Image.new("RGB", (W * S, H * S), PAPER)
    d = ImageDraw.Draw(im, "RGBA")
    rnd = random.Random(1729)

    # Monte Carlo cloud in the lower half.
    x0, x1, y0 = 0.6 * W, 1.02 * W, 0.86 * H
    steps = 120
    for p in range(260):
        y, pts = 0.0, []
        for i in range(steps + 1):
            t = i / steps
            pts.append(((x0 + (x1 - x0) * t) * S, (y0 - y * 34) * S))
            y += 0.03 + 0.09 * rnd.gauss(0, 1)
        d.line(pts, fill=INK + (14,), width=S)
    y, pts = 0.0, []
    for i in range(steps + 1):
        t = i / steps
        pts.append(((x0 + (x1 - x0) * t) * S, (y0 - y * 34) * S))
        y += 0.05 + 0.07 * rnd.gauss(0, 1)
    d.line(pts, fill=ACCENT + (255,), width=3 * S)

    # Epicycles in the top right.
    cx, cy, r = 0.84 * W, 0.3 * H, 92
    a = 0.7
    for k in range(6):
        d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], outline=INK + (40,), width=S)
        nx, ny = cx + r * math.cos(a), cy + r * math.sin(a)
        d.line([(cx * S, cy * S), (nx * S, ny * S)], fill=INK + (110,), width=S)
        cx, cy, r, a = nx, ny, r * 0.52, a * 2.3 + 0.9
    d.ellipse([(cx - 5) * S, (cy - 5) * S, (cx + 5) * S, (cy + 5) * S], fill=ACCENT)

    f_name = ImageFont.truetype(serif, 112 * S)
    f_sub = ImageFont.truetype(italic, 40 * S)
    f_mono = ImageFont.truetype(mono, 17 * S)
    d.text((64 * S, 64 * S), "[ JAVIERPEREZ21.GITHUB.IO ]", font=f_mono, fill=INK3)
    d.text((60 * S, 300 * S), "Javier Perez Tobia", font=f_name, fill=INK, anchor="ls")
    d.text((64 * S, 368 * S), "Applied AI & machine-learning engineer", font=f_sub, fill=INK, anchor="ls")
    d.text((64 * S, H * S - 64 * S), "FOURIER  →  MONTE CARLO  →  ATTENTION", font=f_mono, fill=INK3, anchor="ls")

    out = ROOT / "assets" / "img" / "og.png"
    im.resize((W, H), Image.LANCZOS).save(out, optimize=True)
    print(f"wrote {out} ({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
