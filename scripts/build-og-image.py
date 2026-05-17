"""Build 1200x630 Open Graph PNG for portfolio link previews."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT = ROOT / "assets" / "mysmartrental-dashboard.png"
OUTPUT = ROOT / "assets" / "og-image.png"

W, H = 1200, 630
BG = (10, 14, 39)
ACCENT = (93, 173, 226)
WHITE = (255, 255, 255)
MUTED = (200, 208, 220)
SUBTLE = (136, 153, 170)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates += [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
    else:
        candidates += [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    draw.rectangle([0, 0, W, 6], fill=ACCENT)

    title_font = load_font(52, bold=True)
    tag_font = load_font(26)
    url_font = load_font(22)
    mono_font = load_font(30, bold=True)

    draw.text((72, 72), "<K>", font=mono_font, fill=ACCENT)
    draw.text((72, 130), "Kane Kabena", font=title_font, fill=WHITE)
    draw.text(
        (72, 210),
        "Full-stack developer  |  MySmartRental  |  London",
        font=tag_font,
        fill=MUTED,
    )
    draw.text(
        (72, 260),
        "Property management  ·  Next.js  ·  PostgreSQL  ·  Mobile",
        font=tag_font,
        fill=SUBTLE,
    )
    draw.text(
        (72, 560),
        "kane7th.github.io/my-online-portfolio",
        font=url_font,
        fill=ACCENT,
    )

    shot = Image.open(SCREENSHOT).convert("RGB")
    panel_w, panel_h = 620, 500
    shot_ratio = shot.width / shot.height
    target_ratio = panel_w / panel_h
    if shot_ratio > target_ratio:
        new_h = panel_h
        new_w = int(shot_ratio * new_h)
    else:
        new_w = panel_w
        new_h = int(new_w / shot_ratio)
    shot = shot.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - panel_w) // 2
    top = 0
    shot = shot.crop((left, top, left + panel_w, top + panel_h))

    panel_x, panel_y = 548, 58
    shadow = Image.new("RGB", (panel_w + 8, panel_h + 8), (5, 8, 22))
    canvas.paste(shadow, (panel_x + 4, panel_y + 6))
    canvas.paste(shot, (panel_x, panel_y))

    border = ImageDraw.Draw(canvas)
    border.rounded_rectangle(
        [panel_x - 2, panel_y - 2, panel_x + panel_w + 1, panel_y + panel_h + 1],
        radius=14,
        outline=ACCENT,
        width=2,
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT, "PNG", optimize=True)
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
