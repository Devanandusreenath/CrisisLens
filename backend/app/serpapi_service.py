from typing import Any
from serpapi import GoogleSearch
from .config import settings


def _search(params: dict[str, Any]) -> dict[str, Any]:
    if not settings.serpapi_api_key:
        raise RuntimeError("SERPAPI_API_KEY is missing.")
    payload = {
        **params,
        "api_key": settings.serpapi_api_key,
        "hl": "en",
        "gl": "in",
    }
    return GoogleSearch(payload).get_dict()


def search_google(query: str, location: str | None = None) -> dict[str, Any]:
    params: dict[str, Any] = {"engine": "google", "q": query}
    if location:
        params["location"] = location
    return _search(params)


def search_google_light(query: str, location: str | None = None) -> dict[str, Any]:
    params: dict[str, Any] = {"engine": "google_light", "q": query}
    if location:
        params["location"] = location
    return _search(params)


def search_news(query: str, location: str | None = None) -> dict[str, Any]:
    params: dict[str, Any] = {"engine": "google_news", "q": query}
    if location:
        params["location"] = location
    return _search(params)


def search_maps(query: str, location: str) -> dict[str, Any]:
    params = {"engine": "google_maps", "q": f"{query} near {location}", "type": "search"}
    return _search(params)


def search_directions(start: str, end: str) -> dict[str, Any]:
    return _search({
        "engine": "google_maps_directions",
        "start_addr": start,
        "end_addr": end,
    })


def compact_google_results(data: dict[str, Any], category: str = "web") -> list[dict[str, Any]]:
    results = []
    for x in data.get("organic_results", [])[:8]:
        results.append({
            "title": x.get("title"),
            "snippet": x.get("snippet"),
            "link": x.get("link"),
            "source": x.get("source"),
            "date": x.get("date"),
            "category": category,
            "position": x.get("position"),
        })
    # Google can return structured event results inside a normal search.
    for x in data.get("events_results", [])[:8]:
        results.append({
            "title": x.get("title"),
            "snippet": x.get("description"),
            "link": x.get("link"),
            "source": x.get("venue", {}).get("name") if isinstance(x.get("venue"), dict) else None,
            "date": x.get("date"),
            "address": x.get("address"),
            "category": "event",
            "position": x.get("position"),
        })
    return results


def compact_news_results(data: dict[str, Any]) -> list[dict[str, Any]]:
    results = []
    for x in data.get("news_results", [])[:8]:
        results.append({
            "title": x.get("title"),
            "snippet": x.get("snippet"),
            "link": x.get("link"),
            "source": x.get("source"),
            "date": x.get("date"),
            "category": "news",
            "position": x.get("position"),
        })
    return results


def compact_weather(data: dict[str, Any]) -> dict[str, Any]:
    """Extract structured Google weather answer-box data when available."""
    answer = data.get("answer_box") or {}
    if answer.get("type") != "weather_result":
        return {}
    return {
        "type": answer.get("type"),
        "location": answer.get("location"),
        "date": answer.get("date"),
        "weather": answer.get("weather"),
        "temperature": answer.get("temperature"),
        "unit": answer.get("unit"),
        "precipitation": answer.get("precipitation"),
        "humidity": answer.get("humidity"),
        "wind": answer.get("wind"),
        "alert": answer.get("alert"),
        "forecast": answer.get("forecast"),
        "source": answer.get("source"),
        "source_link": answer.get("source_link"),
    }


def compact_maps_results(data: dict[str, Any]) -> list[dict[str, Any]]:
    results = []
    for x in data.get("local_results", [])[:10]:
        results.append({
            "title": x.get("title"),
            "type": x.get("type"),
            "types": x.get("types"),
            "address": x.get("address"),
            "phone": x.get("phone"),
            "rating": x.get("rating"),
            "reviews": x.get("reviews"),
            "website": x.get("website"),
            "gps_coordinates": x.get("gps_coordinates"),
            "hours": x.get("hours"),
            "open_state": x.get("open_state"),
            "data_id": x.get("data_id"),
            "category": "maps",
        })
    return results


def compact_directions(data: dict[str, Any]) -> list[dict[str, Any]]:
    directions = []
    for x in data.get("directions", [])[:5]:
        directions.append({
            "travel_mode": x.get("travel_mode"),
            "via": x.get("via"),
            "distance": x.get("formatted_distance"),
            "duration": x.get("formatted_duration"),
            "typical_duration": x.get("typical_duration_range"),
            "extensions": x.get("extensions", []),
            "arrive_around": x.get("formatted_arrive_around"),
        })
    return directions
