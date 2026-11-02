"""
Shared pytest fixtures for Selenium tests against the Apex app.

By default the tests target http://localhost:8081 (the port exposed by
docker-compose.yml). Override with:

    APEX_BASE_URL=http://localhost:8081 pytest tests/selenium
"""
import os

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

BASE_URL = os.environ.get("APEX_BASE_URL", "http://localhost:8081")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def driver():
    options = Options()
    # Run headless by default so this works in CI / containers too.
    # Set APEX_HEADFUL=1 to watch the browser while debugging locally.
    if not os.environ.get("APEX_HEADFUL"):
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1400,1000")

    drv = webdriver.Chrome(options=options)
    drv.implicitly_wait(5)
    yield drv
    drv.quit()
