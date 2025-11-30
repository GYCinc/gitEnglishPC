from playwright.sync_api import sync_playwright, expect
import time

def verify_live_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a larger screen to test scaling better
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # 1. Navigate to the app
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for app to load
            page.wait_for_selector("text=Welcome to the Practice Genie!", timeout=10000)

            # 2. Add an exercise
            # We need to open the sidebar first if it's closed, but it's closed by default on mobile only usually.
            # On desktop (1920x1080), sidebar might be visible or we use the "Add Exercise" button.
            # Let's use the sidebar "Add Exercise" button if visible, or the Radial Menu one.

            print("Adding exercise...")
            # Try to find "Add Exercise" button in sidebar
            add_button = page.get_by_role("button", name="Add Exercise").first
            if add_button.is_visible():
                add_button.click()
                # Select a type, e.g., "Fill in the Blanks"
                page.get_by_text("Fill in the Blanks").click()
            else:
                 # Fallback: maybe drag and drop? Or use radial menu if visible?
                 print("Sidebar add button not found, trying fallback...")

            # 3. Wait for the block to appear
            # The block header usually contains the exercise type name
            print("Waiting for block...")
            page.wait_for_selector("text=Fill in the Blanks", timeout=5000)

            # 4. Generate content
            # Click "Generate" button
            print("Generating content...")
            page.get_by_role("button", name="Generate").click()

            # Wait for generation (loading spinner to disappear or content to appear)
            # Since we are mocking or using real API? The memory says "The application depends on the Google GenAI SDK...".
            # If I don't have the API key set up in the sandbox, this might fail or error out.
            # However, the `generateExercises` function might handle errors gracefully or I might need to mock it if I can't hit the API.
            # Let's check if the error appears.

            # Wait a bit for generation or error
            time.sleep(5)

            # Check for error or success
            if page.locator("text=Oops!").count() > 0:
                print("Generation failed (expected if no API key). Using what we have to test Live Mode UI anyway.")
                # Even if generation fails, the "Live" button might not appear if `isGenerated` is false.
                # In ExerciseBlock.tsx: `{!isGenerated && ...}` shows Qty input.
                # `isGenerated` is set to true ONLY if no error.
                # If generation fails, we can't test Live Mode easily unless we force state.
                # But wait, I can modify the code to force `isGenerated` for testing? No, that's hacking.
                # I should rely on the fact that `generateExercises` might default to dummy data if API fails?
                # Checking `services/geminiService.ts` isn't possible right now (didn't read it), but usually it fails.

                # Let's assume for this test I might need to simulate success.
                # Or I can manually edit the state in the browser console?
                pass

            # 5. Check for "Live" button
            # It should be a red button with text "LIVE"
            live_button = page.get_by_title("Start Live Mode")

            if live_button.is_visible():
                print("Live button found. Clicking...")
                live_button.click()

                # 6. Verify Live Mode
                time.sleep(2) # Wait for transition

                # Take screenshot
                print("Taking screenshot...")
                page.screenshot(path="/home/jules/verification/live_mode.png")

                # Verify scaling: The content wrapper should have a scale transform
                # We can check the style attribute of the element that has `origin-center`
                wrapper = page.locator(".origin-center")
                style = wrapper.get_attribute("style")
                print(f"Wrapper style: {style}")

                if "scale(" in style:
                    print("Scaling confirmed.")
                else:
                    print("Scaling NOT found in style attribute.")

            else:
                print("Live button NOT found. Generation likely failed.")
                page.screenshot(path="/home/jules/verification/failed_state.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_state.png")

if __name__ == "__main__":
    verify_live_mode()
