"""Derive tab favicons from public/icon-*-192.png. Do not overwrite those sources."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public'
LIGHT_192 = OUT / 'icon-light-192.png'
DARK_192 = OUT / 'icon-dark-192.png'

# Turtle-steps uses a 64px tab icon. Padding matches that mark: the circle
# sits inside the square so a rounded tab mask does not clip the ring.
TAB_SIZES = (32, 64)
PAD_RATIO = 0.08


def fit_with_padding(image: Image.Image, size: int, pad_ratio: float = PAD_RATIO) -> Image.Image:
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner = max(1, int(size * (1 - 2 * pad_ratio)))
    resized = image.resize((inner, inner), Image.Resampling.LANCZOS)
    offset = (size - inner) // 2
    canvas.paste(resized, (offset, offset), resized)
    return canvas


def save_png(image: Image.Image, path: Path) -> None:
    image.save(path, format='PNG', optimize=True)


def main() -> None:
    light = Image.open(LIGHT_192).convert('RGBA')
    dark = Image.open(DARK_192).convert('RGBA')

    for size in TAB_SIZES:
        save_png(
            fit_with_padding(light, size),
            OUT / f'favicon-light-{size}.png',
        )
        save_png(
            fit_with_padding(dark, size),
            OUT / f'favicon-dark-{size}.png',
        )

    save_png(fit_with_padding(dark, 180), OUT / 'apple-touch-icon.png')
    save_png(dark.resize((512, 512), Image.Resampling.LANCZOS), OUT / 'icon-512.png')


if __name__ == '__main__':
    main()
