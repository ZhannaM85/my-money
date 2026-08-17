"""Derive favicon sizes from docs/branding/logo-*.png. Do not redraw the marks."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'docs' / 'branding'
OUT = ROOT / 'public'

SIZES = (32, 64)


def center_crop(image: Image.Image, fraction: float) -> Image.Image:
    """Keep the middle of the mark so the surrounding asset ring drops out at 16–32px."""
    w, h = image.size
    side = int(min(w, h) * fraction)
    left = (w - side) // 2
    top = (h - side) // 2
    return image.crop((left, top, left + side, top + side))


def save_resized(image: Image.Image, path: Path, size: int) -> None:
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(path, format='PNG', optimize=True)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    light = Image.open(SRC / 'logo-light.png').convert('RGBA')
    dark = Image.open(SRC / 'logo-dark.png').convert('RGBA')

    light_mark = center_crop(light, 0.5)
    dark_mark = center_crop(dark, 0.5)

    for size in SIZES:
        save_resized(light_mark, OUT / f'favicon-light-{size}.png', size)
        save_resized(dark_mark, OUT / f'favicon-dark-{size}.png', size)

    save_resized(dark, OUT / 'apple-touch-icon.png', 180)
    save_resized(light, OUT / 'icon-light-192.png', 192)
    save_resized(dark, OUT / 'icon-dark-192.png', 192)


if __name__ == '__main__':
    main()
