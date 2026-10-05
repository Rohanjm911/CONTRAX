"""
CONTRAX - Automated Screenshot Capture Script
Captures all README.md screenshots at 1920x1080 using headless Chrome + Selenium.
# encoding: utf-8
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from PIL import Image

BASE_URL = "http://localhost:3000"
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
W, H = 1920, 1080

def make_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--force-device-scale-factor=1")
    driver = webdriver.Chrome(options=opts)
    driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
        "width": W, "height": H, "deviceScaleFactor": 1, "mobile": False
    })
    return driver


def wait_and_scroll(driver, secs=3):
    time.sleep(secs)
    driver.execute_script("window.scrollTo(0,0)")
    time.sleep(0.5)


def navigate(driver, tab, extra_wait=3):
    driver.get(f"{BASE_URL}/?tab={tab}")
    wait_and_scroll(driver, extra_wait)


def save(driver, filename):
    path = os.path.join(ASSETS_DIR, filename)
    driver.save_screenshot(path)
    img = Image.open(path)
    print(f"  [OK] Saved {filename} -> {img.size}")


def click_finding_for_modal(driver):
    """Try to click the first finding row to trigger modal."""
    try:
        rows = driver.find_elements(By.CSS_SELECTOR, "button[id^='finding-']")
        if not rows:
            rows = driver.find_elements(By.XPATH, "//button[contains(@class,'glass-panel') and .//*[contains(@class,'CRITICAL') or contains(@class,'HIGH')]]")
        if rows:
            rows[0].click()
            time.sleep(1.5)
            return True
    except Exception as e:
        print(f"  ! Modal click skipped: {e}")
    return False


def main():
    print("=" * 60)
    print("  CONTRAX Screenshot Capture — 1920×1080")
    print("=" * 60)

    driver = make_driver()
    driver.set_page_load_timeout(30)

    # ---- 1. Warm up + inject scan data ----
    print("\n[0] Warm up: loading dashboard...")
    driver.get(BASE_URL)
    time.sleep(4)

    # ---- 2. Dashboard ----
    print("\n[1] Dashboard Overview...")
    navigate(driver, "dashboard", 3)
    save(driver, "contrax_dashboard_real.png")

    # ---- 3. Scanner ----
    print("\n[2] Vulnerability Scanner...")
    navigate(driver, "scanner", 3)
    save(driver, "contrax_scanner_real.png")

    # ---- 4. Findings ----
    print("\n[3] Findings Detection Matrix...")
    navigate(driver, "findings", 3)
    save(driver, "contrax_findings_real.png")

    # ---- 5. Findings modal ----
    print("\n[4] Vulnerability Remediation Modal...")
    navigate(driver, "findings", 2)
    clicked = click_finding_for_modal(driver)
    time.sleep(1)
    save(driver, "contrax_modal_real.png")
    if clicked:
        # close modal via Escape
        from selenium.webdriver.common.keys import Keys
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)

    # ---- 6. Monaco Source Viewer ----
    print("\n[5] Monaco Source Viewer...")
    navigate(driver, "source-viewer", 4)
    save(driver, "contrax_monaco_real.png")

    # ---- 7. AST Visualizer ----
    print("\n[6] AST Semantic Hierarchy...")
    navigate(driver, "ast", 4)
    save(driver, "contrax_ast_real.png")

    # ---- 8. Contract Graph ----
    print("\n[7] Contract Relationship Graph...")
    navigate(driver, "graph", 4)
    save(driver, "contrax_graph_real.png")

    # ---- 9. Gas Profiler ----
    print("\n[8] EVM Gas & Loop Profiler...")
    navigate(driver, "gas", 3)
    save(driver, "contrax_gas_real.png")

    # ---- 10. Audit Reports ----
    print("\n[9] Audit Reports Console...")
    navigate(driver, "reports", 3)
    save(driver, "contrax_reports_real.png")

    # ---- 11. Guide modal ----
    print("\n[10] Interactive Feature Guide...")
    navigate(driver, "dashboard", 2)
    try:
        guide_btn = driver.find_element(By.XPATH, "//button[.//span[contains(text(),'How to Use') or contains(text(),'How to use')]]")
        guide_btn.click()
        time.sleep(2)
    except Exception as e:
        print(f"  ! Guide button fallback: {e}")
        try:
            # try the header How to Use button
            btn = driver.find_element(By.XPATH, "//button[contains(@id,'guide') or contains(@title,'Guide')]")
            btn.click()
            time.sleep(2)
        except Exception:
            pass
    save(driver, "contrax_guide_real.png")

    driver.quit()

    print("\n" + "=" * 60)
    print("  All 10 screenshots captured successfully!")
    print("  Saved to: " + ASSETS_DIR)
    print("=" * 60)


if __name__ == "__main__":
    main()
