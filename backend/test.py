"""
CrisisLens local API tester
Tests:
  1. SerpApi direct search
  2. Gemini direct generation
  3. Optional local FastAPI health + investigation endpoint

Run from your backend folder:
    python test_crisislens_apis.py

Required backend/.env values:
    SERPAPI_API_KEY=...
    GEMINI_API_KEY=...
    GEMINI_MODEL=gemini-3.1-flash-lite
"""

from pathlib import Path
import json
import os
import sys
import traceback

# Load .env from likely locations without printing secret values.
try:
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependency python-dotenv. Install with: pip install python-dotenv")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).resolve().parent
ENV_CANDIDATES = [
    SCRIPT_DIR / ".env",
    SCRIPT_DIR / "backend" / ".env",
    Path.cwd() / ".env",
    Path.cwd() / "backend" / ".env",
]
env_loaded = None
for env_path in ENV_CANDIDATES:
    if env_path.exists():
        load_dotenv(env_path, override=False)
        env_loaded = env_path
        break

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "2275f25550744ef82976d9d833e5da1d3198768d46816dab48283d8efbc3b249").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6JahWJzpRPTrnyXMCxP_oDZWiADPZ5hWmZwPoPBiv37jQ").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite").strip()
BACKEND_URL = os.getenv("CRISISLENS_API_URL", "http://127.0.0.1:8000").rstrip("/")

print("=" * 68)
print("CRISISLENS API CONNECTION TEST")
print("=" * 68)
print(f".env file: {env_loaded if env_loaded else 'NOT FOUND (will check current process environment)'}")
print(f"Gemini model: {GEMINI_MODEL}")
print(f"Backend URL: {BACKEND_URL}")
print("API keys are not displayed for security.")
print()

results = {}

# -------------------------------------------------------------------
# 1. SerpApi
# -------------------------------------------------------------------
print("[1/3] Testing SerpApi...")
if not SERPAPI_API_KEY:
    results["SerpApi"] = False
    print("FAIL: SERPAPI_API_KEY is missing.")
    print("Add SERPAPI_API_KEY=your_key to backend/.env.")
else:
    try:
        from serpapi import GoogleSearch

        params = {
            "engine": "google",
            "q": "Aluva Kerala current weather forecast official",
            "api_key": SERPAPI_API_KEY,
            "num": 5,
        }
        response = GoogleSearch(params).get_dict()

        if response.get("error"):
            raise RuntimeError(response["error"])

        organic = response.get("organic_results", []) or []
        answer_box = response.get("answer_box") or {}
        weather_box = response.get("weather") or {}
        news = response.get("news_results", []) or []

        if not organic and not answer_box and not weather_box and not news:
            print("WARNING: API responded, but no expected search result sections were returned.")
            print("Top-level response keys:", ", ".join(response.keys()))
            results["SerpApi"] = False
        else:
            print("PASS: SerpApi returned a response.")
            print(f"Organic results: {len(organic)} | News results: {len(news)}")
            if answer_box:
                print("Answer box: available")
            if weather_box:
                print("Weather section: available")
            print("Sample results:")
            for item in organic[:3]:
                print(" -", item.get("title", "(untitled)"))
                print("   ", item.get("link", ""))
            results["SerpApi"] = True
    except ImportError:
        results["SerpApi"] = False
        print("FAIL: SerpApi Python package is missing.")
        print("Install it with: pip install google-search-results")
    except Exception as exc:
        results["SerpApi"] = False
        print(f"FAIL: {type(exc).__name__}: {exc}")
print()

# -------------------------------------------------------------------
# 2. Gemini
# -------------------------------------------------------------------
print("[2/3] Testing Gemini...")
if not GEMINI_API_KEY:
    results["Gemini"] = False
    print("FAIL: GEMINI_API_KEY is missing.")
    print("Add GEMINI_API_KEY=your_key to backend/.env.")
else:
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        test_evidence = {
            "location": "Aluva, Kerala, India",
            "scenario": "Test only: heavy rain was reported yesterday; investigate current risk today.",
            "sample_sources": [
                {
                    "title": "Example historical rain report",
                    "snippet": "Heavy rain affected parts of Ernakulam yesterday.",
                    "published_at": "yesterday (sample placeholder, not live evidence)",
                    "url": "https://example.com/historical-rain"
                },
                {
                    "title": "Example forecast placeholder",
                    "snippet": "Forecast information must be retrieved from a current weather source.",
                    "published_at": "not provided",
                    "url": None
                }
            ]
        }
        prompt = (
            "You are testing a local crisis decision-support application. "
            "Return a short JSON object with keys: api_test, location, "
            "historical_vs_current, forecast_requirement, safety_note. "
            "Treat all supplied evidence as test placeholders, not real-world facts. "
            "Do not claim there is current flooding. Explain that current conditions "
            "require live evidence. Input: " + json.dumps(test_evidence)
        )
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=700,
            ),
        )
        text = response.text or ""
        if not text.strip():
            raise RuntimeError("Gemini returned an empty response.")
        # Validate JSON where possible.
        try:
            parsed = json.loads(text)
            print("PASS: Gemini generated a response.")
            print(json.dumps(parsed, indent=2, ensure_ascii=False))
        except json.JSONDecodeError:
            print("WARNING: Gemini responded, but not as valid JSON:")
            print(text[:1200])
        results["Gemini"] = True
    except ImportError:
        results["Gemini"] = False
        print("FAIL: google-genai package is missing.")
        print("Install it with: pip install google-genai")
    except Exception as exc:
        results["Gemini"] = False
        print(f"FAIL: {type(exc).__name__}: {exc}")
        print("Check GEMINI_API_KEY and GEMINI_MODEL in backend/.env.")
print()

# -------------------------------------------------------------------
# 3. Optional local FastAPI health and investigation
# -------------------------------------------------------------------
print("[3/3] Testing local CrisisLens backend...")
try:
    import requests
except ImportError:
    requests = None

if requests is None:
    results["Backend health"] = False
    print("SKIP/FAIL: requests package missing. Install with: pip install requests")
else:
    try:
        health_response = requests.get(f"{BACKEND_URL}/api/health", timeout=8)
        if health_response.ok:
            health = health_response.json()
            print("PASS: Backend health endpoint responded.")
            print(json.dumps(health, indent=2, ensure_ascii=False))
            results["Backend health"] = True
        else:
            print(f"FAIL: Health endpoint returned HTTP {health_response.status_code}")
            print(health_response.text[:1000])
            results["Backend health"] = False
    except requests.RequestException as exc:
        print(f"Backend is not reachable at {BACKEND_URL}: {exc}")
        print("Start it in another terminal with:")
        print("  python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
        results["Backend health"] = False

    # Optional full endpoint test. Set RUN_INVESTIGATION_TEST=1 to avoid
    # accidentally triggering a potentially slower/live search on every run.
    if os.getenv("RUN_INVESTIGATION_TEST", "0").strip() == "1":
        print("\nRunning a LIVE investigation endpoint test...")
        test_payload = {
            "location": "Aluva, Kerala, India",
            "situation": (
                "Test scenario: heavy rain was reported yesterday. Check current "
                "weather and forecasts, current flooding or road disruption reports, "
                "official advisories, and whether yesterday's temporary restrictions "
                "remain relevant. Do not assume these events are currently happening."
            ),
            "destination": "Kochi, Kerala, India",
            "needs": (
                "Travelling with elderly parents. Compare transport options, nearby "
                "hospitals, source timestamps, conflicting evidence, and uncertainty."
            )
        }
        try:
            r = requests.post(
                f"{BACKEND_URL}/api/investigate",
                json=test_payload,
                timeout=180,
            )
            print(f"Investigation HTTP status: {r.status_code}")
            print(r.text[:8000])
            results["Investigation endpoint"] = r.ok
        except requests.RequestException as exc:
            results["Investigation endpoint"] = False
            print("Investigation request failed:", exc)
    else:
        print("Full investigation test skipped by default.")
        print("To run it after the API checks pass, set RUN_INVESTIGATION_TEST=1 and rerun.")
        results["Investigation endpoint"] = None

print("\n" + "=" * 68)
print("SUMMARY")
print("=" * 68)
for name, passed in results.items():
    label = "PASS" if passed is True else "SKIPPED" if passed is None else "FAIL"
    print(f"{label:7} {name}")

direct_ok = results.get("SerpApi") is True and results.get("Gemini") is True
print()
if direct_ok:
    print("Both external APIs passed their direct tests.")
else:
    print("At least one external API test failed. Use the error above to diagnose it.")
if results.get("Backend health") is True:
    print("The local CrisisLens backend is reachable.")
else:
    print("The local backend health check did not pass.")
print("=" * 68)
