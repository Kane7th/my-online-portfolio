"""Generate favicon.ico from portfolio branding."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "favicon.ico"
SIZE = 64

img = Image.new("RGBA", (SIZE, SIZE), (10, 14, 39, 255))
draw = ImageDraw.Draw(img)
draw.rounded_rectangle([4, 4, 59, 59], radius=10, outline=(93, 173, 226), width=2)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 28)
except OSError:
    font = ImageFont.load_default()
draw.text((18, 14), "K", fill=(93, 173, 226), font=font)
img.save(OUT, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print(f"Wrote {OUT}")
