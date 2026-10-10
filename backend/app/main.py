from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from .config import settings
from .models import InvestigationRequest, FollowUpRequest
from .investigation import run_investigation, get_investigation

app = FastAPI(title="CrisisLens API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "crisislens-api",
        "serpapi_configured": bool(settings.serpapi_api_key),
        "gemini_configured": bool(settings.gemini_api_key),
        "gemini_model": settings.gemini_model,
        "capabilities": [
            "structured_weather",
            "weather_forecast",
            "news",
            "maps",
            "directions",
            "traffic",
            "transport",
            "official_advisories",
            "events",
            "temporal_reasoning",
            "claim_verification",
            "conflict_detection",
            "consequence_reasoning",
            "decision_timeline",
        ],
    }


@app.post("/api/investigate")
async def investigate(request: InvestigationRequest):
    try:
        return run_investigation(request.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Investigation failed: {exc}")


@app.get("/api/investigation/{investigation_id}")
async def investigation(investigation_id: str):
    result = get_investigation(investigation_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return result


@app.post("/api/follow-up")
async def follow_up(request: FollowUpRequest):
    previous = get_investigation(request.investigation_id)
    if previous is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing.")

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = f"""
You are the CrisisLens follow-up analyst.
Use ONLY the previous investigation below. Do not invent current facts.
Respect evidence dates, temporal_status, confidence and conflicts.
If the question requires fresh live information, say that a fresh investigation is needed.

PREVIOUS INVESTIGATION:
{previous}

USER QUESTION:
{request.question}
"""
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=1800),
    )
    return {"answer": (response.text or "").strip(), "evidence_ids": []}
