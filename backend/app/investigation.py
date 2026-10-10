import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from .ai_service import analyze_crisis
from .serpapi_service import (
    compact_directions,
    compact_google_results,
    compact_maps_results,
    compact_news_results,
    compact_weather,
    search_directions,
    search_google,
    search_google_light,
    search_maps,
    search_news,
)

INVESTIGATIONS: dict[str, dict] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def unique(items: list[dict], key: str = "link") -> list[dict]:
    seen = set()
    out = []
    for item in items:
        value = item.get(key)
        if value and value in seen:
            continue
        if value:
            seen.add(value)
        out.append(item)
    return out


def _safe_call(fn, *args):
    try:
        return fn(*args)
    except Exception as exc:
        print(f"Search failed [{fn.__name__}]: {exc}")
        return None


def build_queries(request: dict):
    location = request["location"]
    situation = request["situation"]
    destination = request.get("destination") or ""
    needs = request.get("needs") or ""

    web_queries = [
        (f"{location} current weather today", "weather"),
        (f"{location} current road traffic disruption closure today", "traffic"),
        (f"{location} current flooding waterlogging road conditions", "traffic"),
        (f"{location} official weather warning disaster advisory", "official"),
        (f"{location} public transport disruption today bus train metro", "transport"),
        (f"{location} VIP visit rally procession event traffic restriction", "event"),
        (f"{situation} {location} latest current", "search"),
    ]
    if destination:
        web_queries += [
            (f"{location} to {destination} traffic disruption today", "traffic"),
            (f"{location} to {destination} weather forecast today", "forecast"),
        ]
    if needs:
        web_queries.append((f"{needs} services {location} current", "official"))

    news_queries = [
        f"{situation} {location} latest",
        f"{location} flooding rain roads traffic latest",
        f"{location} transport disruption event latest",
    ]

    map_queries = [
        "hospitals",
        "police stations",
        "fire stations",
        "pharmacies",
        "shelters",
        "public transport stations",
    ]
    return web_queries, news_queries, map_queries


def run_investigation(request: dict) -> dict:
    current_time = now_iso()
    location = request["location"]
    destination = request.get("destination")
    web_queries, news_queries, map_queries = build_queries(request)

    print("\n>>> WEATHER + FORECAST AGENT")
    weather_data = _safe_call(search_google_light, f"weather in {location}", location)
    weather = compact_weather(weather_data or {})

    print(">>> SITUATION + OFFICIAL + MOBILITY AGENTS")
    web: list[dict] = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {
            pool.submit(search_google, q, location): category
            for q, category in web_queries
        }
        for future in as_completed(futures):
            category = futures[future]
            data = future.result() if not future.exception() else None
            if data:
                web += compact_google_results(data, category)

    print(">>> NEWS + LOCAL REPORT AGENT")
    news: list[dict] = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(search_news, q, location): q for q in news_queries}
        for future in as_completed(futures):
            if not future.exception():
                data = future.result()
                if data:
                    news += compact_news_results(data)

    print(">>> MAPS + SERVICES AGENT")
    maps: list[dict] = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(search_maps, q, location): q for q in map_queries}
        for future in as_completed(futures):
            if not future.exception():
                data = future.result()
                if data:
                    maps += compact_maps_results(data)

    directions = []
    if destination:
        print(">>> LIVE DIRECTIONS AGENT")
        direction_data = _safe_call(search_directions, location, destination)
        directions = compact_directions(direction_data or {})

    web = unique(web)[:50]
    news = unique(news)[:24]
    maps = unique(maps, "title")[:40]

    if not web and not news and not maps and not weather and not directions:
        raise RuntimeError("SerpApi returned no usable evidence.")

    evidence_bundle = {
        "current_time": current_time,
        "evidence": {
            "weather": weather,
            "directions": directions,
            "web": web,
            "news": news,
            "maps": maps,
        },
    }

    print(">>> TEMPORAL + VERIFICATION + CONSEQUENCE + GEMINI REASONING")
    result = analyze_crisis(request, evidence_bundle)

    investigation_id = str(uuid.uuid4())
    result.update({
        "investigation_id": investigation_id,
        "demo": False,
        "request": request,
        "location": location,
        "current_time": current_time,
        "last_verified": result.get("last_verified") or current_time,
        "raw_evidence_counts": {
            "weather": 1 if weather else 0,
            "directions": len(directions),
            "web": len(web),
            "news": len(news),
            "maps": len(maps),
        },
    })
    INVESTIGATIONS[investigation_id] = result
    print(">>> INVESTIGATION COMPLETE")
    return result


def get_investigation(iid: str):
    return INVESTIGATIONS.get(iid)
