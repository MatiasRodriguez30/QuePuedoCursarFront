import fitz
from pathlib import Path

# Tito el Carpincho - Vector SVG Maestro
# Pure shapes, no <text>, no <filter>, no CSS classes.
# Perfectly scalable.
LOGO_INNER_SVG = '''
  <!-- Oreja izquierda -->
  <ellipse cx="30" cy="27" rx="7" ry="6" fill="#8a4518"/>
  <ellipse cx="30" cy="27" rx="4" ry="3.5" fill="#f5cda7"/>
  <!-- Oreja derecha con lapicito -->
  <ellipse cx="70" cy="27" rx="7" ry="6" fill="#8a4518"/>
  <ellipse cx="70" cy="27" rx="4" ry="3.5" fill="#f5cda7"/>
  <!-- Lápiz estudiante -->
  <path d="M 67 18 L 81 12 L 83 17 L 69 23 Z" fill="#f59e0b"/>
  <path d="M 81 12 L 86 10 L 88 15 L 83 17 Z" fill="#0284c7"/>
  <polygon points="67,18 61,21 69,23" fill="#f5deb3"/>
  <polygon points="63,20 61,21 64,22" fill="#1a1916"/>
  <!-- Cabeza y hocico de carpincho -->
  <rect x="23" y="25" width="54" height="54" rx="17" fill="#b45d24"/>
  <rect x="25" y="47" width="50" height="34" rx="15" fill="#c97334"/>
  <ellipse cx="50" cy="73" rx="14" ry="9" fill="#e8a56c"/>
  <!-- Nariz / boquita chill -->
  <ellipse cx="50" cy="67" rx="5" ry="3" fill="#262422"/>
  <path d="M 46 73 Q 50 75 54 73" stroke="#262422" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <!-- Ojos pequeños serenos -->
  <circle cx="35" cy="44" r="2.5" fill="#262422"/>
  <circle cx="65" cy="44" r="2.5" fill="#262422"/>
  <!-- Anteojos redondos de alambre intelectual -->
  <circle cx="35" cy="44" r="11" stroke="#262422" stroke-width="3" fill="#ffffff" fill-opacity="0.2"/>
  <circle cx="65" cy="44" r="11" stroke="#262422" stroke-width="3" fill="#ffffff" fill-opacity="0.2"/>
  <path d="M 46 44 L 54 44" stroke="#262422" stroke-width="3" stroke-linecap="round"/>
  <!-- Patillas de anteojos -->
  <path d="M 24 44 L 19 42" stroke="#262422" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 76 44 L 81 42" stroke="#262422" stroke-width="2.5" stroke-linecap="round"/>
'''

# Favicon standalone SVG (with rounded badge background)
FAVICON_SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="#c2410c"/>
  {LOGO_INNER_SVG}
</svg>'''

# Maskable SVG: has extra padding (safe margin of 20%, so content is within central 80% circle)
# ViewBox 0 0 125 125, content centered at (12.5, 12.5) with scale 1.0 -> spans 12.5 to 112.5 (100/125 = 80%)
MASKABLE_SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 125 125" width="125" height="125">
  <rect width="125" height="125" fill="#c2410c"/>
  <g transform="translate(12.5, 12.5)">
    {LOGO_INNER_SVG}
  </g>
</svg>'''

def main():
    pub = Path("public")
    pub.mkdir(exist_ok=True)

    # 1. Save favicon.svg
    favicon_path = pub / "favicon.svg"
    favicon_path.write_text(FAVICON_SVG, encoding="utf-8")
    print("Saved public/favicon.svg")

    # Helper to render SVG to exact width/height PNG
    def render(svg_str, out_path, size):
        doc = fitz.open(stream=svg_str.encode("utf-8"), filetype="svg")
        page = doc[0]
        rect = page.rect
        scale = size / rect.width
        matrix = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=matrix, alpha=True)
        pix.save(str(out_path))
        print(f"Rendered {out_path} -> {pix.width}x{pix.height}")

    # 2. Standard icons (any)
    render(FAVICON_SVG, pub / "apple-touch-icon.png", 180)
    render(FAVICON_SVG, pub / "pwa-192.png", 192)
    render(FAVICON_SVG, pub / "pwa-512.png", 512)

    # 3. Maskable icons (80% safe zone)
    render(MASKABLE_SVG, pub / "pwa-maskable-192.png", 192)
    render(MASKABLE_SVG, pub / "pwa-maskable-512.png", 512)

    # Check test favicon at 16 and 32
    render(FAVICON_SVG, pub / "favicon-32.png", 32)
    render(FAVICON_SVG, pub / "favicon-16.png", 16)

if __name__ == "__main__":
    main()
