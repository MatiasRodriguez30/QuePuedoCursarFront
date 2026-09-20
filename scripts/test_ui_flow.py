import time
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path("screenshots")
OUT_DIR.mkdir(exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        
        # 1. Desktop 1280x800
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Reset password screen
        page.goto("http://127.0.0.1:5173/?reset=test-token-1234")
        page.wait_for_selector("text=Elegí tu contraseña nueva")
        page.screenshot(path=str(OUT_DIR / "01_reset_password_1280.png"))
        print("Captured reset password screen")

        # Login screen
        page.goto("http://127.0.0.1:5173/")
        page.wait_for_selector("text=Iniciá sesión para ver tu avance")
        page.screenshot(path=str(OUT_DIR / "02_login_1280.png"))
        print("Captured login screen")

        # Perform login as admin
        page.fill("#login-email", "test@ejemplo.com")
        page.fill("#login-password", "test1234")
        page.click("button[type=submit]")
        
        # Wait for main view
        page.wait_for_selector("text=Qué Puedo Cursar")
        time.sleep(1.5) # allow WS and initial fetch to settle
        page.screenshot(path=str(OUT_DIR / "03_consultas_1280.png"))
        print("Captured Consultas tab 1280px")

        # Tab: Mis Estados
        page.click("text=Mis Estados")
        page.wait_for_selector("text=Mis Estados Académicos")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "04_estados_1280.png"))
        print("Captured Estados tab 1280px")

        # Click "Aprobada" on the first subject to test state update and celebration
        primera_aprobada = page.locator("button:has-text('Aprobada')").first
        primera_aprobada.click()
        time.sleep(0.6)
        page.screenshot(path=str(OUT_DIR / "05_estados_aprobada_1280.png"))
        print("Captured Estados after approving subject")

        # Tab: Plan
        page.click("text=Plan de Estudios")
        page.wait_for_selector("text=Estructura Curricular")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "06_plan_1280.png"))
        print("Captured Plan tab 1280px")

        # Tab: Recomendaciones
        page.click("text=Recomendaciones")
        page.wait_for_selector("text=Recomendaciones y Excepciones de Correlatividad")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "07_recomendaciones_1280.png"))
        print("Captured Recomendaciones tab 1280px")

        # Tab: Ruta (Camino Óptimo)
        page.click("text=Camino Óptimo")
        page.wait_for_selector("text=Camino Óptimo de Cursada")
        page.wait_for_selector("text=Créditos de Electivas")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "08_ruta_1280.png"))
        print("Captured Ruta tab with Créditos de Electivas 1280px")

        # Tab: Agenda
        page.click("text=Agenda")
        page.wait_for_selector("text=Agenda Universitaria")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "09_agenda_1280.png"))
        print("Captured Agenda tab 1280px")

        # Tab: Admin
        page.click("text=Administración")
        page.wait_for_selector("text=Administración")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "10_admin_1280.png"))
        print("Captured Admin tab 1280px")

        # 2. Tablet 768x1024
        page.set_viewport_size({"width": 768, "height": 1024})
        page.click("text=¿Qué Puedo Cursar?")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "11_consultas_tablet_768.png"))
        print("Captured Tablet 768px")

        # 3. Mobile 360x740 (standard smartphone)
        page.set_viewport_size({"width": 360, "height": 740})
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "12_consultas_mobile_360.png"))
        print("Captured Mobile 360px")

        # Mobile Agenda tab via bottom navigation
        # The bottom nav has buttons with text "¿Qué Cursar?", "Mis Estados", "Agenda", "Plan", "Más"
        page.locator("nav button:has-text('Agenda')").click()
        page.wait_for_selector("text=Agenda Universitaria")
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "13_agenda_mobile_360.png"))
        print("Captured Mobile Agenda 360px")

        # Mobile "Más" menu popover
        page.locator("nav button:has-text('Más')").click()
        time.sleep(0.5)
        page.screenshot(path=str(OUT_DIR / "14_mobile_more_menu_360.png"))
        print("Captured Mobile 'Más' popover 360px")

        browser.close()
        print("ALL PLAYWRIGHT TESTS PASSED!")

if __name__ == "__main__":
    run()
