from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import re
import time
import logging
import os


app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- Config ----------
LEETCODE_USERNAME   = os.environ.get("LEETCODE_USERNAME",   "Nandu_2007_")
CODECHEF_USERNAME   = os.environ.get("CODECHEF_USERNAME",   "nandu_2007")
CODECHEF_PASSWORD   = os.environ.get("CODECHEF_PASSWORD",   "")   # optional: set for full profile data
HACKERRANK_USERNAME = os.environ.get("HACKERRANK_USERNAME", "24p31a1224")
HACKERRANK_PASSWORD = os.environ.get("HACKERRANK_PASSWORD", "")   # optional
GFG_USERNAME        = os.environ.get("GFG_USERNAME",        "24p31ap7i2")
GFG_PASSWORD        = os.environ.get("GFG_PASSWORD",        "")   # optional

# NVIDIA NIM
NIM_API_KEY         = os.environ.get("NIM_API_KEY", "")
NIM_API_URL         = "https://integrate.api.nvidia.com/v1/chat/completions"
NIM_DEFAULT_MODEL   = os.environ.get("NIM_MODEL", "nvidia/llama-3.3-nemotron-super-49b-v1")

# Brevo (Sendinblue) — transactional email
BREVO_API_KEY       = os.environ.get("BREVO_API_KEY", "")
BREVO_SENDER_EMAIL  = os.environ.get("BREVO_SENDER_EMAIL", "nandivardhan2007@gmail.com")
BREVO_SENDER_NAME   = os.environ.get("BREVO_SENDER_NAME", "Nandi Vardhan")
BREVO_NOTIFY_EMAIL  = os.environ.get("BREVO_NOTIFY_EMAIL", "nandivardhan2007@gmail.com")  # your inbox
# ----------------------------

# Load .env file if present (local development)
try:
    from dotenv import load_dotenv
    load_dotenv()
    # Re-read after dotenv loads
    LEETCODE_USERNAME   = os.environ.get("LEETCODE_USERNAME",   LEETCODE_USERNAME)
    CODECHEF_USERNAME   = os.environ.get("CODECHEF_USERNAME",   CODECHEF_USERNAME)
    CODECHEF_PASSWORD   = os.environ.get("CODECHEF_PASSWORD",   CODECHEF_PASSWORD)
    HACKERRANK_USERNAME = os.environ.get("HACKERRANK_USERNAME", HACKERRANK_USERNAME)
    HACKERRANK_PASSWORD = os.environ.get("HACKERRANK_PASSWORD", HACKERRANK_PASSWORD)
    GFG_USERNAME        = os.environ.get("GFG_USERNAME",        GFG_USERNAME)
    GFG_PASSWORD        = os.environ.get("GFG_PASSWORD",        GFG_PASSWORD)
    NIM_API_KEY         = os.environ.get("NIM_API_KEY",         NIM_API_KEY)
    BREVO_API_KEY       = os.environ.get("BREVO_API_KEY",       BREVO_API_KEY)
    BREVO_SENDER_EMAIL  = os.environ.get("BREVO_SENDER_EMAIL",  BREVO_SENDER_EMAIL)
    BREVO_SENDER_NAME   = os.environ.get("BREVO_SENDER_NAME",   BREVO_SENDER_NAME)
    BREVO_NOTIFY_EMAIL  = os.environ.get("BREVO_NOTIFY_EMAIL",  BREVO_NOTIFY_EMAIL)

except ImportError:
    pass  # python-dotenv not installed; use system env vars directly


def get_selenium_driver():
    """Create and return a headless Chrome WebDriver."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver


# ─────────────────────────────────────────────────────
# LeetCode  (GraphQL API — no Selenium needed)
# ─────────────────────────────────────────────────────
def get_leetcode_stats(username):
    """Fetch LeetCode stats via the official GraphQL API."""
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            username
            profile { ranking }
            submitStats {
                acSubmissionNum { difficulty count }
            }
        }
        userContestRanking(username: $username) {
            rating
            globalRanking
            attendedContestsCount
        }
    }
    """
    calendar_query = """
    query userCalendar($username: String!) {
        matchedUser(username: $username) {
            userCalendar { streak totalActiveDays }
        }
    }
    """
    headers = {
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/{username}/",
        "User-Agent": "Mozilla/5.0"
    }
    try:
        resp = requests.post(
            url,
            json={"query": query, "variables": {"username": username}},
            headers=headers, timeout=10
        )
        resp.raise_for_status()
        data = resp.json().get("data", {})

        cal_resp = requests.post(
            url,
            json={"query": calendar_query, "variables": {"username": username}},
            headers=headers, timeout=10
        )
        cal_resp.raise_for_status()
        cal_data = cal_resp.json().get("data", {})

        user = data.get("matchedUser") or {}
        contest = data.get("userContestRanking") or {}
        calendar = (cal_data.get("matchedUser") or {}).get("userCalendar") or {}

        stats = {"Easy": 0, "Medium": 0, "Hard": 0, "All": 0}
        for item in (user.get("submitStats") or {}).get("acSubmissionNum", []):
            diff = item.get("difficulty", "")
            if diff in stats:
                stats[diff] = item.get("count", 0)

        return {
            "username": username,
            "total_solved": stats["All"],
            "easy": stats["Easy"],
            "medium": stats["Medium"],
            "hard": stats["Hard"],
            "ranking": (user.get("profile") or {}).get("ranking", "N/A"),
            "contest_rating": round(contest.get("rating", 0), 2) if contest.get("rating") else "N/A",
            "contests_attended": contest.get("attendedContestsCount", 0),
            "global_ranking": contest.get("globalRanking", "N/A"),
            "streak": calendar.get("streak", 0),
            "total_active_days": calendar.get("totalActiveDays", 0),
        }
    except Exception as e:
        logger.error(f"LeetCode error: {e}")
        return {"error": str(e)}


# ─────────────────────────────────────────────────────
# CodeChef  (authenticated session + public fallback)
# ─────────────────────────────────────────────────────
def _codechef_login(username, password):
    """Log in to CodeChef via Selenium using exact known element IDs.
    Returns a requests.Session with authenticated cookies, or None on failure.
    Credentials are read from env vars only — never hardcoded.
    """
    driver = None
    try:
        driver = get_selenium_driver()
        logger.info("CodeChef: navigating to login page...")
        driver.get("https://www.codechef.com/login")

        wait = WebDriverWait(driver, 20)

        # Wait for the username field to be clickable (not just present)
        user_field = wait.until(EC.element_to_be_clickable((By.ID, "edit-name")))
        user_field.clear()
        user_field.send_keys(username)
        time.sleep(0.5)

        # Password field
        pass_field = wait.until(EC.element_to_be_clickable((By.ID, "edit-pass")))
        pass_field.clear()
        pass_field.send_keys(password)
        time.sleep(0.5)

        # Click the login-specific submit button (not the registration one)
        submit_btn = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "input.cc-login-btn")
        ))
        driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
        time.sleep(0.3)
        submit_btn.click()

        # Wait for redirect away from /login (up to 20 s)
        try:
            WebDriverWait(driver, 20).until(
                lambda d: "/login" not in d.current_url
            )
            logger.info(f"CodeChef: login successful → {driver.current_url} ✅")
        except Exception:
            # Check if we're at least on a different page
            if "/login" in driver.current_url:
                # Try checking for error message on page
                err_el = driver.find_elements(By.CSS_SELECTOR, ".messages--error, .error-msg")
                if err_el:
                    logger.error(f"CodeChef login failed: {err_el[0].text}")
                else:
                    logger.warning("CodeChef: still on login page after submit — possible CAPTCHA or wrong credentials")
                return None

        # Transfer browser cookies → requests.Session
        session = requests.Session()
        for cookie in driver.get_cookies():
            session.cookies.set(cookie["name"], cookie["value"],
                                domain=cookie.get("domain", ".codechef.com"))
        logger.info("CodeChef: session cookies transferred ✅")
        return session

    except Exception as e:
        logger.error(f"CodeChef login error: {e}")
        return None
    finally:
        if driver:
            driver.quit()


def get_codechef_stats(username, password=None):
    """Fetch CodeChef stats.
    - If a password is available (env var), logs in to get the full profile
      (rating, stars, highest rating, global/country rank).
    - Otherwise falls back to the unauthenticated HTML scrape.
    Credentials are NEVER stored in code — read from env vars only.
    """
    _password = password or CODECHEF_PASSWORD

    # ── Authenticated path ─────────────────────────────────────────────────────
    if _password:
        session = _codechef_login(username, _password)
        if session:
            try:
                page_headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html,application/xhtml+xml",
                }
                resp = session.get(f"https://www.codechef.com/users/{username}",
                                   headers=page_headers, timeout=12)
                text = resp.text
                soup = BeautifulSoup(text, "html.parser")

                # Rating
                rating = "N/A"
                rating_el = soup.find("div", class_="rating-number")
                if rating_el:
                    rating = rating_el.text.strip()
                if rating == "N/A":
                    m = re.search(r'Drupal\.settings,\s*({.*?})\);', text, re.DOTALL)
                    if m:
                        s = json.loads(m.group(1))
                        v = s.get("user_initial_ratings", {}).get("all")
                        if v is not None:
                            rating = str(v)

                # Stars
                stars = "N/A"
                stars_el = soup.find("span", class_="rating")
                if stars_el:
                    stars = stars_el.text.strip()

                # Highest rating
                highest = "N/A"
                highest_el = soup.find("small")
                if highest_el and "Highest" in highest_el.text:
                    nums = re.findall(r'\d+', highest_el.text)
                    if nums:
                        highest = nums[0]

                # Ranks
                global_rank = country_rank = "N/A"
                rank_els = soup.select(".rating-ranks strong")
                if len(rank_els) >= 2:
                    global_rank  = rank_els[0].text.strip()
                    country_rank = rank_els[1].text.strip()

                # Problems solved
                total_problems = "N/A"
                m2 = re.search(r'Total Problems Solved:\s*(\d+)', text)
                if m2:
                    total_problems = m2.group(1)

                return {
                    "username": username,
                    "rating": rating,
                    "stars": stars,
                    "highest_rating": highest,
                    "total_problems_solved": total_problems,
                    "global_rank": global_rank,
                    "country_rank": country_rank,
                    "authenticated": True,
                }
            except Exception as e:
                logger.error(f"CodeChef authenticated scrape failed: {e}")
                # fall through to unauthenticated

    # ── Unauthenticated path (public HTML) ────────────────────────────────────
    try:
        page_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        }
        resp = requests.get(f"https://www.codechef.com/users/{username}",
                            headers=page_headers, timeout=12)
        text = resp.text
        soup = BeautifulSoup(text, "html.parser")

        # Rating from Drupal.settings JSON
        rating = "N/A"
        m = re.search(r'Drupal\.settings,\s*({.*?})\);', text, re.DOTALL)
        if m:
            try:
                s = json.loads(m.group(1))
                v = s.get("user_initial_ratings", {}).get("all")
                if v is not None:
                    rating = str(v)
            except Exception:
                pass
        rating_el = soup.find("div", class_="rating-number")
        if rating_el:
            rating = rating_el.text.strip()

        stars_el = soup.find("span", class_="rating")
        stars = stars_el.text.strip() if stars_el else "N/A"

        rank_els = soup.select(".rating-ranks strong")
        global_rank  = rank_els[0].text.strip() if len(rank_els) > 0 else "N/A"
        country_rank = rank_els[1].text.strip() if len(rank_els) > 1 else "N/A"

        total_problems = "N/A"
        m2 = re.search(r'Total Problems Solved:\s*(\d+)', text)
        if m2:
            total_problems = m2.group(1)

        return {
            "username": username,
            "rating": rating,
            "stars": stars,
            "highest_rating": "N/A",
            "total_problems_solved": total_problems,
            "global_rank": global_rank,
            "country_rank": country_rank,
            "authenticated": False,
        }
    except Exception:
        pass  # fall through to Selenium
    driver = None
    try:
        driver = get_selenium_driver()
        url = f"https://www.codechef.com/users/{username}"
        logger.info(f"Fetching CodeChef via Selenium: {url}")
        driver.get(url)

        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(4)

        page_text = driver.page_source
        soup = BeautifulSoup(page_text, "html.parser")

        # ── Parse Drupal.settings JSON block (contains rating data) ──────────
        import json as _json
        rating = highest = global_rank = country_rank = stars = total_problems = "N/A"
        m = re.search(r'Drupal\.settings,\s*({.*?})\);', page_text, re.DOTALL)
        if m:
            try:
                settings = _json.loads(m.group(1))
                all_rating = settings.get("user_initial_ratings", {}).get("all", "N/A")
                rating = str(all_rating)
            except Exception:
                pass

        # ── BS4 fallbacks for remaining fields ───────────────────────────────
        rating_el = soup.find("div", class_="rating-number")
        if rating_el:
            rating = rating_el.text.strip()
        stars_el = soup.find("span", class_="rating")
        if stars_el:
            stars = stars_el.text.strip()
        rank_els = soup.select(".rating-ranks strong")
        if len(rank_els) >= 2:
            global_rank  = rank_els[0].text.strip()
            country_rank = rank_els[1].text.strip()
        solved_sec = soup.find("section", class_="problems-solved")
        if solved_sec:
            h5 = solved_sec.find("h5")
            if h5:
                total_problems = h5.text.split(":")[-1].strip()

        return {
            "username": username,
            "rating": rating,
            "stars": stars,
            "highest_rating": highest,
            "total_problems_solved": total_problems,
            "global_rank": global_rank,
            "country_rank": country_rank,
        }

    except Exception as e:
        logger.error(f"CodeChef Selenium error: {e}")
        return {"error": str(e)}
    finally:
        if driver:
            driver.quit()


# ─────────────────────────────────────────────────────
# HackerRank  (REST API — no Selenium needed)
# ─────────────────────────────────────────────────────
def get_hackerrank_stats(username):
    """Fetch HackerRank profile via their internal REST API."""
    url = f"https://www.hackerrank.com/rest/contests/master/hackers/{username}/profile"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        model = resp.json().get("model", {})

        # Fetch badge/certificate details
        badges = []
        try:
            badge_url = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
            badge_resp = requests.get(badge_url, headers=headers, timeout=10)
            if badge_resp.status_code == 200:
                for badge in badge_resp.json().get("models", [])[:5]:
                    badges.append({
                        "name": badge.get("badge_name"),
                        "stars": badge.get("stars", 0),
                    })
        except Exception:
            pass

        return {
            "username": username,
            "name": model.get("name", "N/A"),
            "country": model.get("country", "N/A"),
            "level": model.get("level", "N/A"),
            "followers": model.get("followers_count", 0),
            "school": model.get("school", "N/A"),
            "badges": badges,
        }
    except Exception as e:
        logger.error(f"HackerRank error: {e}")
        return {"error": str(e)}


# ─────────────────────────────────────────────────────
# GeeksforGeeks  (Selenium — JS-rendered page)
# ─────────────────────────────────────────────────────
def get_gfg_stats(username):
    """Scrape GeeksforGeeks profile using Selenium (JS-rendered). Waits for
    full JS execution then parses page source with BeautifulSoup + regex."""
    driver = None
    try:
        driver = get_selenium_driver()
        url = f"https://www.geeksforgeeks.org/user/{username}/"
        logger.info(f"Fetching GFG: {url}")
        driver.get(url)

        # Wait for JS to finish — then extra buffer for React rendering
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(5)

        soup = BeautifulSoup(driver.page_source, "html.parser")
        text = driver.page_source

        # ── Parse score cards using stable partial class names ───────────────
        # GFG uses hashed CSS modules but class names always START with:
        #   ScoreContainer_label__  → label text
        #   ScoreContainer_value__  → numeric value
        coding_score = "N/A"
        total_solved = "N/A"
        institute_rank = "N/A"
        streak = "N/A"

        label_els = soup.find_all("p", class_=re.compile(r"ScoreContainer_label"))
        for lbl in label_els:
            label_text = lbl.get_text(strip=True)
            # The value lives in a sibling/cousin p with ScoreContainer_value class
            row = lbl.find_parent(class_=re.compile(r"ScoreContainer_header"))
            if not row:
                continue
            val_el = row.find("p", class_=re.compile(r"ScoreContainer_value"))
            if not val_el:
                # value might be one level up
                parent = row.find_parent()
                val_el = parent.find("p", class_=re.compile(r"ScoreContainer_value")) if parent else None
            val = val_el.get_text(strip=True) if val_el else "N/A"

            if "Coding Score" in label_text:
                coding_score = val
            elif "Problems Solved" in label_text or "Problem Solved" in label_text:
                total_solved = val
            elif "Institute Rank" in label_text:
                institute_rank = val

        # ── Streak (look for streak container) ───────────────────────────────
        streak_el = soup.find(attrs={"class": re.compile(r"Streak|streak")})
        if streak_el:
            nums = re.findall(r'\d+', streak_el.get_text())
            streak = nums[0] if nums else "N/A"

        # ── Difficulty breakdown ──────────────────────────────────────────────
        difficulty_data = {}
        # Try new DoughnutChart class first
        diff_labels = soup.find_all("span", class_=re.compile(r"DoughnutChart_legendText", re.I))
        if diff_labels:
            for dl in diff_labels:
                text = dl.get_text(strip=True)
                match = re.search(r'([A-Za-z]+)\s*\((\d+)\)', text)
                if match:
                    difficulty_data[match.group(1)] = match.group(2)
        else:
            diff_labels = soup.find_all("p", class_=re.compile(r"problemDifficulty|difficulty", re.I))
            for dl in diff_labels:
                parent = dl.find_parent()
                if parent:
                    nums = re.findall(r'\d+', parent.get_text())
                    if nums:
                        difficulty_data[dl.get_text(strip=True)] = nums[0]

        return {
            "username": username,
            "coding_score": coding_score,
            "total_solved": total_solved,
            "institute_rank": institute_rank,
            "streak": streak,
            "problems_by_difficulty": difficulty_data,
        }

    except Exception as e:
        logger.error(f"GFG Selenium error: {e}")
        return {"error": str(e)}
    finally:
        if driver:
            driver.quit()


import threading
from apscheduler.schedulers.background import BackgroundScheduler

# ─────────────────────────────────────────────────────
# Cache Setup
# ─────────────────────────────────────────────────────
CACHE_FILE = "stats_cache.json"

def load_cache():
    try:
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_cache(data):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logger.error(f"Error saving cache: {e}")

# Global cache
STATS_CACHE = load_cache()

def update_all_stats():
    """Background task to fetch and cache all stats."""
    logger.info("Starting background scrape of all platforms...")
    new_stats = {
        "leetcode":   get_leetcode_stats(LEETCODE_USERNAME),
        "codechef":   get_codechef_stats(CODECHEF_USERNAME),
        "hackerrank": get_hackerrank_stats(HACKERRANK_USERNAME),
        "gfg":        get_gfg_stats(GFG_USERNAME),
    }
    
    global STATS_CACHE
    STATS_CACHE = new_stats
    save_cache(new_stats)
    logger.info("Background scrape complete. Cache updated.")

# ─────────────────────────────────────────────────────
# APScheduler Initialization
# ─────────────────────────────────────────────────────
scheduler = BackgroundScheduler()
# Run every 6 hours
scheduler.add_job(func=update_all_stats, trigger="interval", hours=6)
scheduler.start()

# Also trigger an initial scrape asynchronously if cache is empty
if not STATS_CACHE:
    threading.Thread(target=update_all_stats).start()


# ─────────────────────────────────────────────────────
# NVIDIA NIM AI Chatbot
# ─────────────────────────────────────────────────────
def call_nim_chat(messages, model=None, temperature=0.7, max_tokens=1024, stream=False):
    """Send a chat completion request to the NVIDIA NIM API.

    Args:
        messages: list of dicts with 'role' and 'content' keys (OpenAI format).
        model: NIM model ID override. Falls back to NIM_DEFAULT_MODEL.
        temperature: sampling temperature (0-2).
        max_tokens: maximum tokens in the response.
        stream: whether to request an SSE stream.

    Returns:
        The full JSON response dict (non-streaming) or a streaming
        requests.Response (streaming).
    """
    headers = {
        "Authorization": f"Bearer {NIM_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream" if stream else "application/json",
    }
    payload = {
        "model": model or NIM_DEFAULT_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "top_p": 1,
        "stream": stream,
    }
    resp = requests.post(NIM_API_URL, headers=headers, json=payload,
                         timeout=60, stream=stream)
    resp.raise_for_status()
    if stream:
        return resp  # caller iterates over lines
    return resp.json()


# ─────────────────────────────────────────────────────
# Flask Routes
# ─────────────────────────────────────────────────────
@app.route("/api/stats", methods=["GET"])
def get_all_stats():
    """
    Return the cached stats for all platforms.
    """
    if not STATS_CACHE:
        return jsonify({"status": "fetching", "message": "Stats are currently being scraped for the first time. Please try again in a minute."}), 202
    return jsonify(STATS_CACHE)


@app.route("/api/leetcode", methods=["GET"])
def api_leetcode():
    return jsonify(STATS_CACHE.get("leetcode", {}))


@app.route("/api/codechef", methods=["GET"])
def api_codechef():
    return jsonify(STATS_CACHE.get("codechef", {}))


@app.route("/api/hackerrank", methods=["GET"])
def api_hackerrank():
    return jsonify(STATS_CACHE.get("hackerrank", {}))


@app.route("/api/gfg", methods=["GET"])
def api_gfg():
    return jsonify(STATS_CACHE.get("gfg", {}))


@app.route("/api/force-update", methods=["POST"])
def force_update():
    """Trigger a manual update of the stats."""
    threading.Thread(target=update_all_stats).start()
    return jsonify({"status": "started", "message": "Background scrape triggered."}), 202


@app.route("/api/nim", methods=["POST"])
def api_nim():
    """AI chatbot endpoint powered by NVIDIA NIM.

    Expects JSON body:
      {
        "messages": [{"role": "user", "content": "Hello!"}],
        "model": "nvidia/llama-3.1-nemotron-70b-instruct",  // optional
        "temperature": 0.7,   // optional (0-2)
        "max_tokens": 1024,   // optional
        "stream": false       // optional – set true for SSE streaming
      }

    Returns:
      - Non-streaming: the full NIM API JSON response.
      - Streaming: Server-Sent Events (text/event-stream).
    """
    if not NIM_API_KEY:
        return jsonify({"error": "NIM_API_KEY is not configured on the server."}), 500

    body = request.get_json(silent=True) or {}
    messages = body.get("messages")
    if not messages or not isinstance(messages, list):
        return jsonify({"error": "A 'messages' array is required."}), 400

    model       = body.get("model")
    temperature = body.get("temperature", 0.7)
    max_tokens  = body.get("max_tokens", 1024)
    stream      = body.get("stream", False)

    try:
        if stream:
            # SSE streaming response
            nim_resp = call_nim_chat(messages, model=model,
                                     temperature=temperature,
                                     max_tokens=max_tokens, stream=True)

            def generate():
                for line in nim_resp.iter_lines(decode_unicode=True):
                    if line:
                        yield f"{line}\n\n"

            return app.response_class(generate(), mimetype="text/event-stream")
        else:
            result = call_nim_chat(messages, model=model,
                                   temperature=temperature,
                                   max_tokens=max_tokens, stream=False)
            return jsonify(result)

    except requests.exceptions.HTTPError as e:
        logger.error(f"NIM API HTTP error: {e} — {e.response.text if e.response else ''}")
        status = e.response.status_code if e.response else 502
        return jsonify({"error": "NIM API request failed.", "details": str(e)}), status
    except Exception as e:
        logger.error(f"NIM chatbot error: {e}")
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────
# Brevo (Sendinblue) Email Sender
# ─────────────────────────────────────────────────────
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_brevo_email(to_email, to_name, subject, html_content, text_content=None):
    """Send a transactional email via Brevo REST API v3.

    Args:
        to_email: recipient email address.
        to_name: recipient display name.
        subject: email subject line.
        html_content: HTML body of the email.
        text_content: optional plain-text fallback.

    Returns:
        dict with 'messageId' on success, or raises on failure.
    """
    headers = {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "sender": {"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content,
    }
    if text_content:
        payload["textContent"] = text_content

    resp = requests.post(BREVO_API_URL, headers=headers, json=payload, timeout=15)
    resp.raise_for_status()
    return resp.json()


def _generate_ai_reply(sender_name, sender_message):
    """Use the NIM chatbot to draft a personalised auto-reply."""
    if not NIM_API_KEY:
        return None

    system_prompt = (
        "You are Nandi Vardhan's portfolio assistant. A visitor just submitted a "
        "contact form on Nandi's personal portfolio website. Draft a warm, "
        "professional, and concise reply (3-5 sentences) acknowledging their "
        "message and letting them know Nandi will get back to them soon. "
        "Sign off as 'Nandi Vardhan'. Do NOT use markdown — write plain text "
        "suitable for an email body."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Sender: {sender_name}\nMessage: {sender_message}"},
    ]
    try:
        result = call_nim_chat(messages, temperature=0.6, max_tokens=300)
        return result["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"AI reply generation failed: {e}")
        return None



# ─────────────────────────────────────────────────────
# Contact Form Endpoint
# ─────────────────────────────────────────────────────
@app.route("/api/contact", methods=["POST"])
def api_contact():
    """Handle contact form submissions.

    Expects JSON body:
      {
        "name":    "Visitor Name",
        "email":   "visitor@example.com",
        "subject": "Inquiry about ...",       // optional
        "message": "Hello, I wanted to ..."
      }

    Actions:
      1. Generates an AI reply via NIM (if configured).
      2. Sends the visitor an auto-reply email via Brevo.
      3. Sends you (the site owner) a notification email via Brevo.
    """
    body = request.get_json(silent=True) or {}

    name    = (body.get("name") or "").strip()
    email   = (body.get("email") or "").strip()
    subject = (body.get("subject") or "Contact Form Submission").strip()
    message = (body.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "'name', 'email', and 'message' are required."}), 400

    errors = []

    # ── 1. Generate AI reply ──────────────────────────────────────────────────
    ai_reply = _generate_ai_reply(name, message)
    fallback_reply = (
        f"Hi {name},\n\n"
        "Thank you for reaching out through my portfolio! "
        "I've received your message and will get back to you as soon as possible.\n\n"
        "Best regards,\nNandi Vardhan"
    )
    reply_text = ai_reply or fallback_reply

    # ── 2. Send auto-reply to the visitor via Brevo ───────────────────────────
    if BREVO_API_KEY:
        try:
            auto_reply_html = f"""\
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;
            padding: 32px; background: #f8f9fa; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px;
              border-radius: 12px 12px 0 0; color: #fff; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Thanks for reaching out!</h1>
  </div>
  <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;
              border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #374151; line-height: 1.6; white-space: pre-line;">{reply_text}</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      This is an automated reply from Nandi Vardhan's portfolio.
    </p>
  </div>
</div>"""
            send_brevo_email(
                to_email=email,
                to_name=name,
                subject=f"Re: {subject}",
                html_content=auto_reply_html,
                text_content=reply_text,
            )
            logger.info(f"Auto-reply email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send auto-reply via Brevo: {e}")
            errors.append(f"auto-reply email: {e}")

        # ── 3. Notify site owner ──────────────────────────────────────────────
        try:
            owner_html = f"""\
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;
            padding: 32px; background: #f8f9fa; border-radius: 12px;">
  <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px;
              border-radius: 12px 12px 0 0; color: #fff; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">📬 New Contact Form Submission</h1>
  </div>
  <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px;
              border: 1px solid #e5e7eb; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;"><strong>Name</strong></td>
          <td style="padding: 8px 0; color: #111827;">{name}</td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Email</strong></td>
          <td style="padding: 8px 0; color: #111827;"><a href="mailto:{email}">{email}</a></td></tr>
      <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Subject</strong></td>
          <td style="padding: 8px 0; color: #111827;">{subject}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
    <p style="color: #374151; line-height: 1.6; white-space: pre-line;">{message}</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
    <p style="color: #9ca3af; font-size: 12px;">AI auto-reply sent: {'✅ Yes' if ai_reply else '⚠️ Fallback used'}</p>
  </div>
</div>"""
            send_brevo_email(
                to_email=BREVO_NOTIFY_EMAIL,
                to_name=BREVO_SENDER_NAME,
                subject=f"[Portfolio Contact] {subject} — from {name}",
                html_content=owner_html,
            )
            logger.info(f"Notification email sent to {BREVO_NOTIFY_EMAIL}")
        except Exception as e:
            logger.error(f"Failed to send notification via Brevo: {e}")
            errors.append(f"notification email: {e}")
    else:
        errors.append("BREVO_API_KEY not configured")


    # ── Response ──────────────────────────────────────────────────────────────
    if errors:
        return jsonify({
            "status": "partial",
            "message": "Contact form processed with some issues.",
            "warnings": errors,
        }), 207

    return jsonify({
        "status": "success",
        "message": "Your message has been received! Check your email for a confirmation.",
    }), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "alive"}), 200


if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
    finally:
        scheduler.shutdown()