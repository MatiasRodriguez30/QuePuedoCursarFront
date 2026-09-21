import time
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path("screenshots/admin_and_modals")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)

        # ─────────────────────────────────────────────────────────────
        # 1. DESKTOP (1280x850)
        # ─────────────────────────────────────────────────────────────
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()
        page.goto("http://127.0.0.1:5173/")
        page.wait_for_selector("#login-email")
        page.fill("#login-email", "test@ejemplo.com")
        page.fill("#login-password", "test1234")
        page.click("button[type=submit]")

        # Wait for topbar
        page.wait_for_selector("button:has-text('QPC'), button:has-text('Qué Puedo Cursar')")
        time.sleep(1.0)

        # Open user menu
        page.click("button[aria-label='Menú de cuenta de usuario']")
        time.sleep(0.3)
        # Click "Panel de Admin"
        page.click("button:has-text('Panel de Admin')")
        time.sleep(0.8)

        # Capture Admin Tab Desktop
        page.screenshot(path=str(OUT_DIR / "admin_desktop_1280.png"), full_page=True)
        print("Captured admin_desktop_1280.png")

        # Open MateriaModal ("+ Nueva Materia")
        page.click("button:has-text('Nueva Materia')")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "materia_modal_desktop_1280.png"))
        print("Captured materia_modal_desktop_1280.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # Open PrereqsModal (click "Correlatividades" on first subject card)
        first_prereqs_btn = page.locator("button:has-text('Correlatividades')").first
        if first_prereqs_btn.count() > 0:
            first_prereqs_btn.click()
            time.sleep(0.5)
            page.screenshot(path=str(OUT_DIR / "prereqs_modal_desktop_1280.png"))
            print("Captured prereqs_modal_desktop_1280.png")
            page.keyboard.press("Escape")
            time.sleep(0.3)

        # Switch to Carreras subtab
        page.click("button:has-text('Carreras')")
        time.sleep(0.5)
        # Open CarreraModal ("+ Nueva Carrera")
        page.click("button:has-text('Nueva Carrera')")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "carrera_modal_desktop_1280.png"))
        print("Captured carrera_modal_desktop_1280.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # Switch to Agenda surface to open EventoModal
        # First close admin by clicking "Hoy" or navigating
        page.click("button:has-text('Agenda')")
        time.sleep(0.8)
        # Look for "+ Nuevo Evento" or "+ Evento" button
        btn_evento = page.locator("button:has-text('Nuevo Evento'), button:has-text('Evento')").first
        if btn_evento.count() > 0:
            btn_evento.click()
            time.sleep(0.5)
            page.screenshot(path=str(OUT_DIR / "evento_modal_desktop_1280.png"))
            print("Captured evento_modal_desktop_1280.png")
            page.keyboard.press("Escape")
            time.sleep(0.3)

        context.close()

        # ─────────────────────────────────────────────────────────────
        # 2. MOBILE (360x780)
        # ─────────────────────────────────────────────────────────────
        context = browser.new_context(viewport={"width": 360, "height": 780})
        page = context.new_page()
        page.goto("http://127.0.0.1:5173/")
        page.wait_for_selector("#login-email")
        page.fill("#login-email", "test@ejemplo.com")
        page.fill("#login-password", "test1234")
        page.click("button[type=submit]")

        # Wait for topbar
        page.wait_for_selector("button:has-text('QPC'), button:has-text('Qué Cursar')")
        time.sleep(1.0)

        # Open user menu
        page.click("button[aria-label='Menú de cuenta de usuario']")
        time.sleep(0.3)
        page.click("button:has-text('Panel de Admin')")
        time.sleep(0.8)

        # Capture Admin Mobile
        page.screenshot(path=str(OUT_DIR / "admin_mobile_360.png"), full_page=True)
        print("Captured admin_mobile_360.png")

        # Open MateriaModal in Mobile
        page.click("button:has-text('Nueva Materia')")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "materia_modal_mobile_360.png"))
        print("Captured materia_modal_mobile_360.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # Open PrereqsModal in Mobile
        first_prereqs_btn = page.locator("button:has-text('Correlatividades')").first
        if first_prereqs_btn.count() > 0:
            first_prereqs_btn.click()
            time.sleep(0.5)
            page.screenshot(path=str(OUT_DIR / "prereqs_modal_mobile_360.png"))
            print("Captured prereqs_modal_mobile_360.png")
            page.keyboard.press("Escape")
            time.sleep(0.3)

        # Switch to Carreras subtab in Mobile
        page.click("button:has-text('Carreras')")
        time.sleep(0.5)
        page.click("button:has-text('Nueva Carrera')")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "carrera_modal_mobile_360.png"))
        print("Captured carrera_modal_mobile_360.png")
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # Navigate to Agenda in Mobile
        # In mobile bottom nav, click Agenda
        page.click("nav button:has-text('Agenda')")
        time.sleep(0.8)
        btn_evento = page.locator("button:has-text('Nuevo Evento'), button:has-text('Evento')").first
        if btn_evento.count() > 0:
            btn_evento.click()
            time.sleep(0.5)
            page.screenshot(path=str(OUT_DIR / "evento_modal_mobile_360.png"))
            print("Captured evento_modal_mobile_360.png")
            page.keyboard.press("Escape")
            time.sleep(0.3)

        context.close()
        browser.close()
        print("All Admin and Modal screenshots captured successfully!")

if __name__ == "__main__":
    run()
