"""Convert the glyph outlines of a name into polyline JSON for the Fourier hero.

The hero animation (assets/js/scenes/fourier.js) needs the *outline* of each
letter as closed contours, so that it can resample them into one periodic
curve and take its Fourier transform. Rather than ship a font parser to the
browser, we flatten the outlines once, offline, with fontTools.

Usage:
    python scripts/build_name_glyphs.py path/to/InstrumentSerif-Regular.ttf

Writes assets/data/name-glyphs.json. Coordinates are in em units (1 em = 1.0),
y grows downwards, and the baseline sits at y = 0.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

WORDS = ["Javier", "Perez", "Tobia"]
OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "name-glyphs.json"
FLATNESS = 6.0  # target segment length in font units when flattening curves


class FlattenPen(BasePen):
    """Records glyph outlines as closed polylines."""

    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.contours: list[list[tuple[float, float]]] = []
        self._cur: list[tuple[float, float]] | None = None

    def _moveTo(self, p):
        self._cur = [p]

    def _lineTo(self, p):
        self._cur.append(p)

    def _qCurveToOne(self, p1, p2):
        p0 = self._cur[-1]
        n = _steps(p0, p1, p2)
        for i in range(1, n + 1):
            t = i / n
            a, b, c = (1 - t) ** 2, 2 * (1 - t) * t, t * t
            self._cur.append((a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]))

    def _curveToOne(self, p1, p2, p3):
        p0 = self._cur[-1]
        n = _steps(p0, p1, p2, p3)
        for i in range(1, n + 1):
            t = i / n
            a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3
            self._cur.append(
                (
                    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
                    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
                )
            )

    def _closePath(self):
        pts = self._cur or []
        if len(pts) > 1 and pts[0] == pts[-1]:
            pts.pop()
        if len(pts) > 2:
            self.contours.append(pts)
        self._cur = None

    _endPath = _closePath


def _steps(*pts) -> int:
    length = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    return max(2, math.ceil(length / FLATNESS))


def pair_kerning(font: TTFont, left: str, right: str) -> float:
    """Horizontal kerning for a glyph pair from GPOS PairPos lookups (0 if none)."""
    if "GPOS" not in font:
        return 0
    for lookup in font["GPOS"].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            if lookup.LookupType == 9:
                sub = sub.ExtSubTable
            if getattr(sub, "LookupType", lookup.LookupType) != 2 or not hasattr(sub, "Coverage"):
                continue
            cov = sub.Coverage.glyphs
            if left not in cov:
                continue
            if sub.Format == 1:
                for rec in sub.PairSet[cov.index(left)].PairValueRecord:
                    if rec.SecondGlyph == right and rec.Value1 is not None:
                        return getattr(rec.Value1, "XAdvance", 0) or 0
            elif sub.Format == 2:
                c1 = sub.ClassDef1.classDefs.get(left, 0)
                c2 = sub.ClassDef2.classDefs.get(right, 0)
                rec = sub.Class1Record[c1].Class2Record[c2]
                if rec.Value1 is not None and getattr(rec.Value1, "XAdvance", 0):
                    return rec.Value1.XAdvance
    return 0


def main(font_path: str) -> None:
    font = TTFont(font_path)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"]

    def r(v: float) -> float:
        return round(v / upem, 4)

    words = []
    for word in WORDS:
        x = 0.0
        contours = []
        names = [cmap[ord(ch)] for ch in word]
        for i, name in enumerate(names):
            pen = FlattenPen(glyph_set)
            glyph_set[name].draw(pen)
            for contour in pen.contours:
                flat = []
                for px, py in contour:
                    flat.extend((r(px + x), r(-py)))
                contours.append(flat)
            x += hmtx[name][0]
            if i + 1 < len(names):
                x += pair_kerning(font, name, names[i + 1])
        words.append({"text": word, "width": r(x), "contours": contours})

    os2 = font["OS/2"]
    data = {
        "font": font["name"].getDebugName(4),
        "ascender": r(os2.sTypoAscender),
        "descender": r(-os2.sTypoDescender),
        "capHeight": r(getattr(os2, "sCapHeight", os2.sTypoAscender)),
        "space": r(hmtx[cmap[ord(" ")]][0]),
        "words": words,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    n_pts = sum(len(c) // 2 for w in words for c in w["contours"])
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.1f} KB, {n_pts} points)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
