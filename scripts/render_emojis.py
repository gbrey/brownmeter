#!/usr/bin/env python3
"""Slack emoji pack: 128px transparent brown bandanas."""

import zipfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "emojis"
SIZE = 128
INK_LIGHT = (246, 239, 230, 255)
INK_DARK = (42, 24, 18, 255)

PACK = [
    ("panuelo-clarito", (226, 199, 168), "Marrón clarito", "El del lunes. Casi no se nota.", "smile"),
    ("panuelo-cafe", (165, 107, 69), "Marrón café", "Lo probó una vez y ya dictaminó.", "cup"),
    ("panuelo-chocolate", (107, 62, 42), "Marrón chocolate", "Todo a mano, inclusive lo repetido.", "bar"),
    ("panuelo-espresso", (61, 38, 28), "Marrón espresso", "Acá no aplica. Nunca aplicó.", "cup"),
    ("panuelo-historico", (44, 27, 20), "Marrón histórico", "Ya va a pasar, como todo lo nuevo.", "patch"),
    ("panuelo-cyborg", (22, 48, 51), "Cero pañuelo", "Este no se queda sin trabajo.", "visor"),
    ("panuelo-lunes", (198, 154, 112), "El lunes", "El lunes empiezo. Todos los lunes.", "calendar"),
    ("panuelo-sobrino", (176, 122, 78), "El sobrino", "Eso lo resuelve mi sobrino.", "pair"),
    ("panuelo-a-mano", (140, 86, 52), "A mano", "Prefiero hacerlo a mano.", "needle"),
    ("panuelo-trampa", (120, 64, 40), "Trampa", "Usar IA es hacer trampa.", "ban"),
    ("panuelo-nft", (92, 58, 96), "NFT", "Esto es como los NFT.", "gem"),
    ("panuelo-metaverso", (74, 52, 88), "Metaverso", "Ya va a pinchar, como el metaverso.", "headset"),
    ("panuelo-frio", (90, 110, 122), "Frío", "No es lo mismo. Se siente frío.", "snow"),
    ("panuelo-loro", (92, 120, 64), "El loro", "No le pido a un loro que lea por mí.", "bird"),
    ("panuelo-firma", (126, 78, 48), "La firma", "Hasta que no lo firme un humano, no existe.", "sign"),
    ("panuelo-reunion", (110, 72, 58), "La reunión", "En la reunión lo digo yo.", "people"),
    ("panuelo-datos", (72, 64, 58), "Los datos", "No le voy a dar mis datos a un robot.", "lock"),
    ("panuelo-facultad", (150, 96, 54), "La facultad", "En la facultad no nos enseñaron esto.", "book"),
    ("panuelo-marketing", (168, 92, 64), "Marketing", "Eso es para los de marketing.", "mega"),
    ("panuelo-moda", (186, 140, 96), "La moda", "La IA es una moda.", "stars"),
]


def rgba(color, alpha=255):
    return (*color, alpha)


def luminance(color):
    r, g, b = color
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def shift(color, amount):
    return tuple(max(0, min(255, channel + amount)) for channel in color)


def cloth(draw, color):
    top, right, bot, left = (64, 14), (116, 64), (64, 116), (12, 64)
    draw.polygon([top, right, bot, left], fill=rgba(color))
    draw.polygon([top, right, (64, 64)], fill=rgba(shift(color, 28)))
    draw.polygon([(64, 64), left, bot], fill=rgba(shift(color, -26)))
    stitch = (255, 255, 255, 120) if luminance(color) < 150 else (62, 36, 22, 140)
    draw.line([top, right, bot, left, top], fill=stitch, width=3)
    return INK_LIGHT if luminance(color) < 150 else INK_DARK


def smile(draw, ink):
    draw.ellipse((46, 62, 56, 72), fill=ink)
    draw.ellipse((72, 62, 82, 72), fill=ink)
    draw.arc((48, 70, 80, 96), 20, 160, fill=ink, width=3)


def cup(draw, ink):
    draw.rounded_rectangle((46, 58, 78, 96), radius=6, outline=ink, width=4)
    draw.arc((74, 66, 96, 88), 300, 70, fill=ink, width=4)
    draw.arc((52, 48, 72, 64), 200, 340, fill=ink, width=3)


def bar(draw, ink):
    for row in range(2):
        for col in range(2):
            x, y = 46 + col * 20, 62 + row * 20
            draw.rounded_rectangle((x, y, x + 16, y + 16), radius=3, outline=ink, width=3)


def patch(draw, ink):
    draw.rectangle((44, 60, 86, 98), outline=ink, width=3)
    draw.line((44, 60, 86, 98), fill=ink, width=3)
    draw.line((86, 60, 44, 98), fill=ink, width=3)


def visor(draw, ink):
    cyan = (104, 222, 217, 255)
    draw.rounded_rectangle((36, 66, 92, 86), radius=8, fill=cyan)
    draw.ellipse((40, 70, 52, 82), fill=(16, 24, 28, 255))
    draw.ellipse((76, 70, 88, 82), fill=(16, 24, 28, 255))
    draw.rectangle((92, 72, 104, 80), fill=cyan)


def calendar(draw, ink):
    draw.rounded_rectangle((42, 56, 88, 102), radius=6, outline=ink, width=4)
    draw.rectangle((42, 56, 88, 72), fill=ink)
    draw.line((54, 50, 54, 64), fill=ink, width=4)
    draw.line((76, 50, 76, 64), fill=ink, width=4)


def pair(draw, ink):
    draw.polygon([(78, 58), (100, 78), (78, 100), (56, 78)], outline=ink)
    draw.line([(78, 58), (100, 78), (78, 100), (56, 78), (78, 58)], fill=ink, width=3)
    draw.polygon([(50, 78), (64, 92), (50, 106), (36, 92)], fill=ink)


def needle(draw, ink):
    draw.line((40, 100, 90, 52), fill=ink, width=4)
    draw.ellipse((84, 46, 98, 60), outline=ink, width=3)
    draw.arc((28, 78, 70, 112), 200, 20, fill=ink, width=3)


def ban(draw, ink):
    draw.ellipse((42, 54, 90, 102), outline=ink, width=4)
    draw.line((52, 92, 80, 64), fill=ink, width=4)


def gem(draw, ink):
    draw.polygon([(64, 52), (92, 72), (64, 106), (36, 72)], outline=ink)
    draw.line([(64, 52), (92, 72), (64, 106), (36, 72), (64, 52)], fill=ink, width=3)
    draw.line((48, 72, 80, 72), fill=ink, width=3)
    draw.line((64, 72, 64, 106), fill=ink, width=3)


def headset(draw, ink):
    draw.arc((40, 52, 88, 100), 200, 340, fill=ink, width=4)
    draw.rounded_rectangle((34, 78, 46, 98), radius=4, fill=ink)
    draw.rounded_rectangle((82, 78, 94, 98), radius=4, fill=ink)


def snow(draw, ink):
    draw.line((64, 54, 64, 106), fill=ink, width=3)
    draw.line((40, 68, 88, 92), fill=ink, width=3)
    draw.line((40, 92, 88, 68), fill=ink, width=3)
    for point in ((64, 54), (64, 106), (40, 68), (88, 92), (40, 92), (88, 68)):
        draw.ellipse((point[0] - 3, point[1] - 3, point[0] + 3, point[1] + 3), fill=ink)


def bird(draw, ink):
    draw.ellipse((40, 62, 78, 100), outline=ink, width=4)
    draw.polygon([(74, 74), (98, 80), (74, 88)], fill=ink)
    draw.ellipse((52, 72, 60, 80), fill=ink)
    draw.arc((28, 70, 52, 96), 100, 260, fill=ink, width=3)


def sign(draw, ink):
    draw.line((38, 78, 58, 70, 70, 90, 96, 62), fill=ink, width=4, joint="curve")
    draw.line((40, 102, 92, 102), fill=ink, width=3)


def people(draw, ink):
    for x in (40, 64, 88):
        draw.ellipse((x - 8, 58, x + 8, 74), outline=ink, width=3)
        draw.arc((x - 12, 78, x + 12, 104), 200, 340, fill=ink, width=3)


def lock(draw, ink):
    draw.rounded_rectangle((44, 74, 84, 104), radius=6, outline=ink, width=4)
    draw.arc((50, 52, 78, 82), 180, 360, fill=ink, width=4)
    draw.ellipse((60, 84, 68, 92), fill=ink)


def book(draw, ink):
    draw.polygon([(64, 62), (96, 70), (96, 104), (64, 96)], outline=ink)
    draw.polygon([(64, 62), (32, 70), (32, 104), (64, 96)], outline=ink)
    draw.line([(64, 62), (96, 70), (96, 104), (64, 96), (64, 62)], fill=ink, width=3)
    draw.line([(64, 62), (32, 70), (32, 104), (64, 96)], fill=ink, width=3)
    draw.line((64, 62, 64, 96), fill=ink, width=3)


def mega(draw, ink):
    draw.polygon([(40, 74), (70, 60), (70, 100), (40, 88)], fill=ink)
    draw.rectangle((70, 66, 96, 94), fill=ink)
    draw.line((48, 92, 44, 108), fill=ink, width=4)


def stars(draw, ink):
    for center, radius, alpha in (((48, 86), 8, 255), ((68, 70), 6, 200), ((86, 58), 4, 120)):
        x, y = center
        color = (*ink[:3], alpha)
        draw.regular_polygon((x, y, radius), 4, rotation=0, fill=color)


DRAW = {
    "smile": smile,
    "cup": cup,
    "bar": bar,
    "patch": patch,
    "visor": visor,
    "calendar": calendar,
    "pair": pair,
    "needle": needle,
    "ban": ban,
    "gem": gem,
    "headset": headset,
    "snow": snow,
    "bird": bird,
    "sign": sign,
    "people": people,
    "lock": lock,
    "book": book,
    "mega": mega,
    "stars": stars,
}


def render_one(slug, color, icon):
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    ink = cloth(draw, color)
    DRAW[icon](draw, ink)
    path = OUT / f"{slug}.png"
    image.save(path)
    return path


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    lines = ["const EMOJI_PACK = ["]
    files = []
    for slug, color, name, line, icon in PACK:
        files.append(render_one(slug, color, icon))
        safe_name = name.replace("\\", "\\\\").replace('"', '\\"')
        safe_line = line.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(
            f'  {{ file: "emojis/{slug}.png", code: "{slug}", name: "{safe_name}", line: "{safe_line}" }},'
        )
    lines.append("];\n")
    (ROOT / "public" / "emoji-pack.js").write_text("\n".join(lines))
    zip_path = OUT / "panuelos-slack.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, path.name)
    sheet = Image.new("RGBA", (128 * 5, 128 * 4), (16, 17, 19, 255))
    for index, path in enumerate(files):
        tile = Image.open(path)
        sheet.paste(tile, ((index % 5) * 128, (index // 5) * 128), tile)
    sheet.save("/tmp/panuelos-sheet.png")
    print(f"{len(files)} emojis")


if __name__ == "__main__":
    main()
