# Selenium tests for Apex

These tests drive a real browser against a **running instance** of Apex
(e.g. the Docker container from `docker compose up`). They don't start the
app themselves — start it first, then point the tests at it.

## Setup

```bash
cd tests/selenium
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
```

You also need Chrome and a matching chromedriver on PATH. If you have Chrome
installed, the simplest way is:

```bash
pip install webdriver-manager
```

and swap `webdriver.Chrome(options=options)` in `conftest.py` for:

```python
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
drv = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
```

(Recent Selenium versions often auto-manage the driver without this, so try
running the tests first — if `webdriver.Chrome()` fails to find a driver,
add the two lines above.)

## Run

1. Make sure Apex is up, e.g.:
   ```bash
   docker compose up -d
   ```
   (serves on http://localhost:8081 per `docker-compose.yml`)

2. Run the tests:
   ```bash
   pytest tests/selenium -v
   ```

   Point at a different URL if needed:
   ```bash
   APEX_BASE_URL=http://localhost:8081 pytest tests/selenium -v
   ```

   Watch the browser instead of running headless:
   ```bash
   APEX_HEADFUL=1 pytest tests/selenium -v
   ```

## What's covered

- `test_navigation.py` — every route (`/`, `/standings`, `/races`, `/circuits`,
  `/drivers`, `/cars`, `/compare`, `/insights`) loads directly and via clicking
  the nav links, and the footer renders on each page.
- `test_dashboard_features.py` — the season `<select>` has multiple options
  and is changeable, the theme toggle switches state, and the logo links
  back to the dashboard.

These intentionally avoid asserting on live F1 standings/schedule data
(fetched via `/api/f1` from an external upstream), since that can be slow
or briefly unavailable and isn't something the app controls.
