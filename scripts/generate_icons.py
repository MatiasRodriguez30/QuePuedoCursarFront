"""
Regenerate PWA icons and favicon.svg with Tito the Cobayo (Guinea Pig) Risograph Seal.
Reconstructed based on master sheet front view:
- Loaf of bread head shape ("pan de molde")
- Folded droopy rose ears at the sides with magenta interior
- Ink #111 patch covering right ear and face
- Authentic cowlick hair swirl of 1.5 turns on crown
- Big round glasses, small heart nose, cute rodent mouth
- Favicon 16/32 with full silhouette, droopy ears, patch and glasses
"""
import fitz
from pathlib import Path
from test_logo_maker import generate_logo_svg, generate_favicon_simplified

def render(svg_str, out_path, size):
    doc = fitz.open(stream=svg_str.encode("utf-8"), filetype="svg")
    page = doc[0]
    rect = page.rect
    scale = size / rect.width
    matrix = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    pix.save(str(out_path))
    print(f"Rendered {out_path} -> {pix.width}x{pix.height}")

def main():
    pub = Path("public")
    pub.mkdir(exist_ok=True)

    pwa_svg = generate_logo_svg('pwa')
    maskable_svg = generate_logo_svg('maskable')
    fav_svg = generate_favicon_simplified()

    # 1. Save favicon.svg
    (pub / "favicon.svg").write_text(fav_svg, encoding="utf-8")
    print("Saved public/favicon.svg")

    # 2. Standard icons
    render(pwa_svg, pub / "apple-touch-icon.png", 180)
    render(pwa_svg, pub / "pwa-192.png", 192)
    render(pwa_svg, pub / "pwa-512.png", 512)

    # 3. Maskable icons
    render(maskable_svg, pub / "pwa-maskable-192.png", 192)
    render(maskable_svg, pub / "pwa-maskable-512.png", 512)

    # 4. Favicon PNGs
    render(fav_svg, pub / "favicon-32.png", 32)
    render(fav_svg, pub / "favicon-16.png", 16)
    print("All icons generated successfully in public/!")

if __name__ == "__main__":
    main()
