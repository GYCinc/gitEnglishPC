from playwright.sync_api import sync_playwright

def verify_gamification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Go to app
            page.goto("http://localhost:3000")

            # Wait for HUD to appear (check for XP text which is in the HUD)
            # The HUD has "XP" and "0 / 1000" usually
            page.wait_for_selector("text=XP", timeout=10000)

            # Screenshot the whole page to see the HUD overlaid
            page.screenshot(path="verification/gamification_hud.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_gamification()
