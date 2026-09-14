#!/usr/bin/env python3
"""
Turns public/avatar.png into a hand-editable pixel-art sprite data file
(src/data/avatar.ts). Run it again if you ever change your photo:

    python3 scripts/make-avatar-sprite.py

It is a build-time convenience only — the game itself never loads the PNG for
the sprite, it uses the generated character grid, exactly like every other
sprite in this project.
"""
import os
from collections import Counter

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "avatar.png")
OUT = os.path.join(ROOT, "src", "data", "avatar.ts")

SIZE = 40          # sprite is SIZE x SIZE pixels
MAX_COLORS = 18    # quantisation target


def to_hex(rgb):
    return "#%02x%02x%02x" % rgb[:3]


def main():
    img = Image.open(SRC).convert("RGBA")

    # Trim to the subject: the source is a square with a circular background,
    # so a small centre crop removes the empty corners.
    w, h = img.size
    inset = int(w * 0.045)
    img = img.crop((inset, inset, w - inset, h - inset))

    # Downsample with a box filter for clean blocky pixels.
    small = img.resize((SIZE, SIZE), Image.BOX)

    # Quantise to a small palette.
    rgb = Image.new("RGB", small.size, (13, 11, 20))
    rgb.paste(small, mask=small.split()[3])
    q = rgb.quantize(colors=MAX_COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
    pal = q.getpalette()
    idx = list(q.getdata())

    used = [c for c, _ in Counter(idx).most_common()]
    chars = "ABCDEFGHIJKLMNOPQRSTUVWX"
    char_of = {}
    colors = {}
    for n, ci in enumerate(used):
        ch = chars[n]
        char_of[ci] = ch
        colors[ch] = to_hex(tuple(pal[ci * 3: ci * 3 + 3]))

    alpha = list(small.split()[3].getdata())

    # Mask to a circle so the sprite reads as a portrait token rather than a
    # square photo. Anything outside the inscribed circle becomes transparent.
    c = (SIZE - 1) / 2.0
    r2 = (SIZE / 2.0 - 0.5) ** 2

    rows = []
    for y in range(SIZE):
        row = ""
        for x in range(SIZE):
            p = y * SIZE + x
            outside = (x - c) ** 2 + (y - c) ** 2 > r2
            row += "." if outside or alpha[p] < 100 else char_of[idx[p]]
        rows.append(row)

    lines = []
    lines.append("/* ===========================================================================")
    lines.append(" * AVATAR — a pixel-art sprite of Abeer, generated from public/avatar.png.")
    lines.append(" *")
    lines.append(" * This file is DATA, not code. It was produced by")
    lines.append(" *     python3 scripts/make-avatar-sprite.py")
    lines.append(" * and you can either re-run that after swapping the photo, or just edit the")
    lines.append(" * characters below by hand like any other sprite in src/data/sprites.ts.")
    lines.append(" *")
    lines.append(" * Each character maps to a colour in AVATAR_COLORS. '.' is transparent.")
    lines.append(" * ======================================================================== */")
    lines.append("")
    lines.append("export const AVATAR_COLORS: Record<string, string> = {")
    for ch in sorted(colors):
        lines.append(f"  {ch}: '{colors[ch]}',")
    lines.append("};")
    lines.append("")
    lines.append("export const AVATAR_SPRITE: string[] = [")
    for r in rows:
        lines.append(f"  '{r}',")
    lines.append("];")
    lines.append("")

    with open(OUT, "w") as f:
        f.write("\n".join(lines))

    print(f"wrote {OUT}: {SIZE}x{SIZE}, {len(colors)} colours")


if __name__ == "__main__":
    main()
