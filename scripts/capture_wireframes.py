import time
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil

OUT_DIR = Path("screenshots/wireframes")
OUT_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR = Path("docs/wireframes-camino-agenda").resolve()
ARTIFACT_DIR = Path(r"C:\Users\user\.gemini\antigravity\brain\b4f5128c-1393-4a11-a566-f28ee2aefedf")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)

        # 1. Camino Desktop
        ctx_desktop = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx_desktop.new_page()
        page.goto(f"file:///{DOCS_DIR / 'camino_desktop_1280.html'}")
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        path = OUT_DIR / "camino_desktop_1280.png"
        page.screenshot(path=str(path), full_page=True)
        print(f"Captured {path.name}")
        ctx_desktop.close()

        # 2. Camino Mobile
        ctx_mobile = browser.new_context(viewport={"width": 360, "height": 780})
        page = ctx_mobile.new_page()
        page.goto(f"file:///{DOCS_DIR / 'camino_mobile_360.html'}")
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        path = OUT_DIR / "camino_mobile_360.png"
        page.screenshot(path=str(path), full_page=True)
        print(f"Captured {path.name}")
        ctx_mobile.close()

        # 3. Camino Empty / Loading / Error
        ctx_states = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx_states.new_page()
        page.goto(f"file:///{DOCS_DIR / 'camino_empty_loading_error.html'}")
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        path = OUT_DIR / "camino_empty_loading_error.png"
        page.screenshot(path=str(path), full_page=True)
        print(f"Captured {path.name}")
        ctx_states.close()

        # 4. Agenda Desktop
        ctx_desktop = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx_desktop.new_page()
        page.goto(f"file:///{DOCS_DIR / 'agenda_desktop_1280.html'}")
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        path = OUT_DIR / "agenda_desktop_1280.png"
        page.screenshot(path=str(path), full_page=True)
        print(f"Captured {path.name}")
        ctx_desktop.close()

        # 5. Agenda Mobile
        ctx_mobile = browser.new_context(viewport={"width": 360, "height": 780})
        page = ctx_mobile.new_page()
        page.goto(f"file:///{DOCS_DIR / 'agenda_mobile_360.html'}")
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        path = OUT_DIR / "agenda_mobile_360.png"
        page.screenshot(path=str(path), full_page=True)
        print(f"Captured {path.name}")
        ctx_mobile.close()

        # 6. Agenda Empty / Loading / Error
        ctx_states = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx_states.new_page()
        page.goto(f"file:///{DOCS_DIR / 'agenda_empty_loading_error.html'}")
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        path = OUT_DIR / "agenda_empty_loading_error.png"
        page.screenshot(path=str(path), full_page=True)
        print(f"Captured {path.name}")
        ctx_states.close()

        browser.close()

    # Copy to ARTIFACT_DIR if exists
    if ARTIFACT_DIR.exists():
        for png in OUT_DIR.glob("*.png"):
            shutil.copy2(png, ARTIFACT_DIR / png.name)
            print(f"Copied {png.name} to artifact directory")

if __name__ == "__main__":
    run()
