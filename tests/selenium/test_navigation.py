"""
Navigation smoke tests: every nav link loads its page without error.
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

NAV_PAGES = [
    ("Dashboard", "/"),
    ("Standings", "/standings"),
    ("Races", "/races"),
    ("Circuits", "/circuits"),
    ("Drivers", "/drivers"),
    ("Cars", "/cars"),
    ("Compare", "/compare"),
    ("Insights", "/insights"),
]


def wait_for_app(driver, timeout=10):
    """Wait for the app shell (header/nav) to be present."""
    WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "header.app-header"))
    )


@pytest.mark.parametrize("name,path", NAV_PAGES)
def test_page_loads_directly(driver, base_url, name, path):
    """Each route loads directly (deep link) without a blank page or JS error."""
    driver.get(f"{base_url}{path}")
    wait_for_app(driver)

    main = driver.find_element(By.CSS_SELECTOR, "main.app-main")
    assert main.text.strip() != "", f"{name} page ({path}) rendered no content"


def test_nav_links_navigate_to_each_page(driver, base_url):
    """Clicking each nav link (from the Dashboard) routes to the right page."""
    driver.get(base_url)
    wait_for_app(driver)

    for name, path in NAV_PAGES:
        link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.LINK_TEXT, name))
        )
        link.click()

        WebDriverWait(driver, 10).until(
            lambda d: d.current_url.rstrip("/").endswith(path.rstrip("/")) or path == "/"
        )
        if path != "/":
            assert path in driver.current_url, (
                f"Clicking '{name}' did not navigate to {path} "
                f"(ended up at {driver.current_url})"
            )


def test_footer_present_on_every_page(driver, base_url):
    for name, path in NAV_PAGES:
        driver.get(f"{base_url}{path}")
        wait_for_app(driver)
        footer = driver.find_element(By.CSS_SELECTOR, "footer.app-footer")
        assert "Apex" in footer.text
