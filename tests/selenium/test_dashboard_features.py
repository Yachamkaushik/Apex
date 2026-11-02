"""
Feature-level tests on the Dashboard: season selector and theme toggle.

These avoid asserting on live F1 API data (standings, schedule, etc.) since
that comes from an external upstream via the /api/f1 proxy and can be slow
or briefly unavailable; instead they check the UI controls that are always
present, deterministic, and don't depend on that data.
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


def wait_for_app(driver, timeout=10):
    WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "header.app-header"))
    )


def test_season_selector_has_options_and_is_changeable(driver, base_url):
    driver.get(base_url)
    wait_for_app(driver)

    select_el = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select.season-select"))
    )
    select = Select(select_el)
    assert len(select.options) > 1, "Season selector should offer more than one season"

    # Pick the last (oldest) option and confirm the selection sticks.
    target = select.options[-1]
    select.select_by_visible_text(target.text)
    assert Select(select_el).first_selected_option.text == target.text


def test_theme_toggle_switches_theme(driver, base_url):
    driver.get(base_url)
    wait_for_app(driver)

    toggle = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.theme-toggle"))
    )
    label_before = toggle.get_attribute("aria-label")

    toggle.click()

    WebDriverWait(driver, 5).until(
        lambda d: d.find_element(By.CSS_SELECTOR, "button.theme-toggle").get_attribute(
            "aria-label"
        )
        != label_before
    )
    label_after = toggle.get_attribute("aria-label")
    assert label_after != label_before, "Theme toggle aria-label did not change after click"


def test_logo_links_back_to_dashboard(driver, base_url):
    driver.get(f"{base_url}/standings")
    wait_for_app(driver)

    logo = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a.logo"))
    )
    logo.click()

    WebDriverWait(driver, 10).until(lambda d: d.current_url.rstrip("/") == base_url.rstrip("/"))
