# CrisisLens — Backend Judge Version

This backend is designed to work with the existing CrisisLens frontend without requiring frontend changes.

## Capabilities

- Structured current weather evidence from SerpApi Google Light Search
- Weather forecast evidence and alerts when returned by the provider
- Current web/search evidence
- News/local reports
- Maps and nearby services
- Live directions when a destination is supplied
- Traffic and transport disruption evidence
- Events/VIP/procession evidence from Google Search event results
- Temporal reasoning: current / forecast / historical / scheduled / expired / unknown
- Claim-level verification
- Source/freshness/conflict reasoning
- Persistent-consequence reasoning
- Decision options and route comparison
- Decision timeline and what-changed fields

## Setup

Create `.env` in this backend directory:

```env
SERPAPI_API_KEY=your_key
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.1-flash-lite
FRONTEND_ORIGIN=http://localhost:8080
```

Install:

```powershell
pip install -r requirements.txt
```

Run:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The existing frontend can continue using:

`http://127.0.0.1:8000`

## Recommended demo request

Location: `Aluva, Kerala`

Situation: `Heavy rain yesterday, possible flooding and road disruption today`

Destination: `Kochi`

Needs: `I have elderly parents and need the lowest-disruption travel option`

The backend is explicitly instructed to distinguish yesterday's temporary events from today's conditions, separate weather forecasts from current observations, and look for current evidence of persistent consequences.
