#!/usr/bin/env python3
"""Render Open Graph insignias for each level and tone."""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "public" / "badges.json").read_text())
OUT = ROOT / "public" / "og"
W, H = 1200, 630
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_ITALIC = "/System/Library/Fonts/Supplemental/Arial Italic.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def background() -> Image.Image:
    img = Image.new("RGB", (W, H))
    px = img.load()
    c0 = (22, 14, 32)
    c1 = (12, 32, 34)
    for y in range(H):
        for x in range(W):
            t = x / W * 0.72 + y / H * 0.28
            px[x, y] = tuple(lerp(c0[i], c1[i], t) for i in range(3))
    return img


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if draw.textlength(trial, font=face) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_badge(level: dict) -> Image.Image:
    img = background()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((28, 28, W - 28, H - 28), radius=28, outline="#68ded9", width=3)

    cx, cy, r = 300, 315, 198
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=level["color"])
    draw.ellipse((cx - r + 18, cy - r + 18, cx + r - 18, cy + r - 18), fill="#141318")
    draw.ellipse((cx - r + 34, cy - r + 34, cx + r - 34, cy + r - 34), outline="#68ded9", width=2)

    kicker = font(FONT, 22)
    small = font(FONT_REG, 22)
    draw.text((cx, cy - 58), "PAÑUELÓMETRO", font=kicker, fill="#68ded9", anchor="mm")
    tag = level["tag"].upper()
    tag_size = 34
    tag_face = font(FONT, tag_size)
    while draw.textlength(tag, font=tag_face) > 290 and tag_size > 16:
        tag_size -= 1
        tag_face = font(FONT, tag_size)
    draw.text((cx, cy + 8), tag, font=tag_face, fill="#f4f1f5", anchor="mm")
    nivel = "CYBORG" if level["slug"] == "limpio" else f"NIVEL {DATA['levels'].index(level):02d}"
    draw.text((cx, cy + 62), nivel, font=small, fill="#a8a5af", anchor="mm")

    name_size = 68
    name_font = font(FONT, name_size)
    while draw.textlength(level["name"], font=name_font) > 560 and name_size > 40:
        name_size -= 2
        name_font = font(FONT, name_size)
    draw.text((560, 168), level["name"], font=name_font, fill="#f4f1f5")

    quote_font = font(FONT_ITALIC, 30)
    lines = wrap(draw, f"“{level['quote']}”", quote_font, 560)
    y = 280
    for line in lines:
        draw.text((560, y), line, font=quote_font, fill="#cec0d1")
        y += 40

    meta = font(FONT_REG, 22)
    draw.text((560, 520), "IA en un sorbo  ·  brownmeter", font=meta, fill="#8d8794")
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for level in DATA["levels"]:
        path = OUT / f"{level['slug']}.png"
        draw_badge(level).save(path, "PNG", optimize=True)
        print(path.name, path.stat().st_size)


if __name__ == "__main__":
    main()
