# CrisisLens — AI-Powered Local Situation Intelligence

## 1. Project Overview

CrisisLens is an AI-powered local situation intelligence and decision-support platform that helps users understand changing local conditions before making travel and safety-related decisions.

It gathers information from web search, weather sources, news reports, maps, directions, and available advisories. It then uses AI to organize the evidence, identify conflicts, assess information freshness, and present practical options with explanations and uncertainty.

CrisisLens is designed to answer questions such as:

- Is there current evidence of flooding or road disruption?
- Are yesterday's weather or event restrictions still relevant today?
- What travel options are available between two locations?
- Are there conflicting reports about a local situation?
- Which option appears to have lower reported disruption based on the currently retrieved evidence?
- What information is confirmed, forecast, historical, or still uncertain?

CrisisLens is a decision-support tool, not an emergency service. Users should verify critical information with official authorities and local emergency services.

## 2. Main Features

### Local Situation Investigation
- Investigates a specified location and situation.
- Retrieves relevant web search evidence.
- Collects weather and forecast information where available.
- Searches for local news, advisories, and disruption reports.
- Uses a destination to investigate relevant travel information.

### Weather and Forecast Analysis
- Retrieves weather-related evidence.
- Separates current observations from forecasts and historical reports.
- Identifies when previous weather events may have continuing consequences.
- Avoids treating yesterday's weather as proof of current flooding.

### Travel and Mobility Intelligence
- Retrieves available map and directions information.
- Investigates traffic and transport disruptions where information is available.
- Compares available travel options using retrieved evidence.
- Highlights uncertainty and missing information.

### Events and Official Advisories
- Searches for relevant events, temporary restrictions, and advisories.
- Evaluates whether information appears current, scheduled, expired, historical, or unknown.
- Avoids automatically assuming that a past event is still happening.

### AI Evidence Reasoning
- Uses Google's Gemini API to analyze retrieved information.
- Organizes evidence into a structured investigation.
- Highlights conflicting reports and source freshness.
- Distinguishes verified information from assumptions and predictions.
- Supports follow-up questions about a previous investigation.

### Frontend and Backend Integration
- React-based frontend.
- Python FastAPI backend.
- SerpApi for web-search-based information retrieval.
- Gemini API for AI reasoning.
- Environment-based configuration to keep API keys on the backend.

## 3. Technology Stack

Frontend:
- React
- TypeScript
- Vite
- TanStack Start
- Tailwind CSS

Backend:
- Python
- FastAPI
- Uvicorn
- Pydantic

AI and information retrieval:
- Google Gemini API
- SerpApi
- Web search
- Weather, maps, directions, news, and advisory evidence where available

Development tools:
- Node.js
- npm
- Python
- pip
- Git and GitHub

## 4. Project Structure

CrisisLens/
|
|-- .env.local
|-- package.json
|-- package-lock.json or bun.lock
|-- vite.config.ts
|-- tsconfig.json
|-- README.md
|
|-- public/
|   |-- favicon.ico
|   |-- robots.txt
|
|-- src/
|   |-- components/
|   |-- routes/
|   |-- lib/
|   |-- styles.css
|   |-- router.tsx
|   |-- start.ts
|
|-- backend/
|   |-- .env
|   |-- .env.example
|   |-- requirements.txt
|   |-- README.md
|   |
|   |-- app/
|       |-- __init__.py
|       |-- main.py
|       |-- config.py
|       |-- models.py
|       |-- serpapi_service.py
|       |-- ai_service.py
|       |-- investigation.py
|
|-- node_modules/
|-- backend/.venv/

Note:
- The frontend source code belongs inside `src/`.
- The Python backend belongs inside `backend/`.
- Do not move Python files into the frontend's `src/` directory.
- `node_modules/` and `backend/.venv/` are generated during installation and do not need to be committed to Git.

## 5. Prerequisites

Install the following before running the application:

1. Node.js and npm.
2. Python 3.10 or a compatible version supported by the backend dependencies.
3. A SerpApi API key.
4. A Google Gemini API key.

Verify the installations:

```bash
node --version
npm --version
python --version
pip --version
```

If the `python` command is unavailable on Windows, try:

```powershell
py --version
```

## 6. Environment Configuration

CrisisLens uses two environment files:

- `backend/.env` for private backend API keys and backend settings.
- `.env.local` in the project root for the frontend's backend URL.

Never put private API keys in the frontend environment file.

### 6.1 Backend `.env`

Create a file named `.env` inside the `backend/` directory.

The complete template is:

```env
SERPAPI_API_KEY=YOUR_SERPAPI_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
FRONTEND_ORIGIN=http://localhost:8080
```

Replace the two placeholder values with your own API keys.

Variable descriptions:

- `SERPAPI_API_KEY`: API key used for SerpApi searches.
- `GEMINI_API_KEY`: API key used to access Google's Gemini models.
- `GEMINI_MODEL`: Gemini model identifier used by the backend.
- `FRONTEND_ORIGIN`: Frontend origin allowed by the backend's CORS configuration.

Keep the variable names exactly as shown.

Important:
- Do not include quotation marks around API keys unless the provider specifically requires them.
- Do not share your real API keys publicly.
- Do not upload `backend/.env` to GitHub.
- Keep `backend/.env` out of screenshots, public repositories, and shared project ZIP files.
- Use `.env.example` as the template for other developers.

### 6.2 Frontend `.env.local`

Create `.env.local` in the main project directory, alongside `package.json`.

Add:

```env
VITE_CRISISLENS_API_URL=http://127.0.0.1:8000
```

This tells the frontend to send API requests to the local FastAPI backend.

Important:
- The filename must be `.env.local`.
- The variable name must be `VITE_CRISISLENS_API_URL`.
- Do not put SerpApi or Gemini API keys in this file.
- Restart the frontend development server after changing this file.

## 7. Backend Installation

Open a terminal in the main CrisisLens project directory.

Move into the backend folder:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can use Command Prompt instead:

```bat
.venv\Scripts\activate.bat
```

Install the backend dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Make sure `backend/.env` exists and contains your own API keys.

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep this terminal open while using CrisisLens.

The backend should be available at:

http://127.0.0.1:8000

Health endpoint:

http://127.0.0.1:8000/api/health

FastAPI interactive documentation:

http://127.0.0.1:8000/docs

## 8. Verify the Backend

Open this URL in your browser:

http://127.0.0.1:8000/api/health

A successful response should contain information similar to:

```json
{
  "status": "ok",
  "service": "crisislens-api",
  "serpapi_configured": true,
  "gemini_configured": true,
  "gemini_model": "gemini-3.1-flash-lite",
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
    "decision_timeline"
  ]
}
```

The exact response can vary depending on the backend version.

The values `serpapi_configured` and `gemini_configured` indicate whether the backend has detected the corresponding API key. They do not guarantee that every external API request will succeed.

## 9. Frontend Installation

Open a second terminal in the main CrisisLens project directory.

Do not run the frontend installation commands from inside `backend/`.

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Vite will display a local development URL, for example:

http://localhost:8080

Open the exact URL printed in the terminal.

If the application displays a different port, ensure that the actual frontend origin is allowed by the backend's CORS configuration. The supplied backend configuration already allows localhost origins on ports 8080 and 5173.

Keep the frontend terminal open.

## 10. Running the Complete Application

Two terminals are required.

### Terminal 1 — Backend

```powershell
cd path\to\CrisisLens\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2 — Frontend

```powershell
cd path\to\CrisisLens
npm run dev
```

Open the frontend URL printed by Vite.

The frontend communicates with the backend through:

```env
VITE_CRISISLENS_API_URL=http://127.0.0.1:8000
```

The backend uses the API keys in `backend/.env` to retrieve external information and generate AI analysis.

## 11. API Endpoints

### GET `/api/health`

Checks backend availability and reports whether the API keys are configured.

Example:

```http
GET http://127.0.0.1:8000/api/health
```

### POST `/api/investigate`

Starts a new local situation investigation.

Example request:

```json
{
  "location": "Aluva, Kerala, India",
  "situation": "Heavy rain was reported yesterday. Investigate current weather, possible flooding, road disruption, official advisories, and whether previous restrictions remain relevant.",
  "destination": "Kochi, Kerala, India",
  "needs": "I am travelling with elderly parents. Compare available travel options and highlight source timestamps, conflicts, and uncertainty."
}
```

Send the request to:

```http
POST http://127.0.0.1:8000/api/investigate
Content-Type: application/json
```

The request fields should match the backend's request model.

### GET `/api/investigation/{investigation_id}`

Retrieves a previously created investigation by its identifier.

Example:

```http
GET http://127.0.0.1:8000/api/investigation/INVESTIGATION_ID
```

Replace `INVESTIGATION_ID` with the actual identifier returned by the investigation endpoint.

### POST `/api/follow-up`

Asks a follow-up question about an existing investigation.

Example request:

```json
{
  "investigation_id": "INVESTIGATION_ID",
  "question": "Which findings are based on current evidence, and which remain uncertain?"
}
```

Send the request to:

```http
POST http://127.0.0.1:8000/api/follow-up
Content-Type: application/json
```

The follow-up endpoint uses the previous investigation. It does not automatically retrieve fresh live information for every follow-up question.

## 12. Recommended Demonstration Scenario

Use this scenario to demonstrate CrisisLens.

Location:
Aluva, Kerala, India

Destination:
Kochi, Kerala, India

Situation:
Heavy rain was reported yesterday. Investigate whether there is current evidence of flooding, road disruption, transport interruptions, or active official advisories. Check whether any temporary event or VIP restrictions from yesterday remain relevant today.

User needs:
I am travelling with elderly parents. Compare available transport options, consider access to nearby services, identify conflicting reports, and explain what is known and uncertain.

Expected analytical behavior:

1. Retrieve relevant current and historical evidence.
2. Separate observations, forecasts, historical reports, and scheduled events.
3. Look for current evidence of continuing consequences from earlier weather.
4. Check source freshness and identify conflicting reports.
5. Explain the reasoning behind the available options.
6. Avoid claiming that a route is guaranteed safe.
7. State when reliable evidence is missing.

CrisisLens should describe an option as having lower reported disruption only when the retrieved evidence supports that assessment. It should not invent live traffic conditions or claim that a road is safe without adequate evidence.

## 13. Troubleshooting

### Problem: Backend connection refused

If the browser or test script reports that `127.0.0.1:8000` is unreachable, start the backend:

```powershell
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep the terminal open and check `/api/health` again.

### Problem: `ModuleNotFoundError`

Activate the backend virtual environment and install dependencies:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Then restart Uvicorn.

### Problem: API keys are not configured

Check that the file is named:

```text
backend/.env
```

Confirm that it contains these exact variable names:

```env
SERPAPI_API_KEY=YOUR_SERPAPI_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite
FRONTEND_ORIGIN=http://localhost:8080
```

Replace placeholders with valid credentials and restart the backend.

Never paste your real API keys into public issues or chat messages.

### Problem: Frontend shows Demo Mode or Backend URL Not Configured

Check that `.env.local` is in the project root, next to `package.json`.

Its contents should be:

```env
VITE_CRISISLENS_API_URL=http://127.0.0.1:8000
```

Stop the frontend server using `Ctrl+C`, then restart:

```powershell
npm run dev
```

### Problem: CORS error

Check the browser's frontend URL and the backend CORS configuration.

The provided backend permits these origins:

```text
http://localhost:8080
http://127.0.0.1:8080
http://localhost:5173
http://127.0.0.1:5173
```

If you use a different port, add the exact origin to the backend configuration and restart the backend.

### Problem: SerpApi works but the investigation fails

Check that:
- The backend is running.
- The SerpApi key is valid and has available usage.
- The Gemini key is valid and the configured model is accessible.
- The request body matches the backend request model.
- The external providers are returning usable information.
- The backend terminal contains no exception trace.

A successful direct API test does not guarantee that every complete investigation will succeed.

### Problem: Frontend dependencies or Vite fail

Run the following from the project root:

```powershell
npm install
npm run dev
```

Do not move backend files into `src/`. Avoid changing Vite configuration or package overrides unless an actual error requires it.

## 14. Security

- Keep all private API keys in `backend/.env`.
- Never expose API keys in React components or client-side environment variables.
- Never commit `.env` files containing secrets to GitHub.
- Use `.env.example` with placeholders for public repositories.
- Restrict production CORS origins to the deployed frontend domain.
- Add appropriate request validation, rate limits, and logging controls before public deployment.
- Do not treat AI-generated output as a substitute for official emergency information.

## 15. Current Limitations

- Search results depend on the availability and quality of external providers.
- Some locations may have limited or stale public information.
- A missing search result does not prove that an incident is not occurring.
- Maps, transport, weather, and advisory details depend on the evidence returned by the providers.
- AI analysis can make mistakes and should communicate uncertainty.
- Follow-up answers are grounded in the stored investigation and may require a fresh investigation for new live facts.
- Investigation data in the current local backend is stored in memory and can be lost when the backend restarts.
- Local development configuration is not a production deployment configuration.

## 16. Future Enhancements

- Persistent investigation storage using a database.
- Automated refresh of relevant evidence.
- Stronger source verification and evidence provenance.
- More official government and emergency data integrations.
- Improved route and transport comparison.
- Notifications for significant changes in a user's selected situation.
- Deployment with secure secrets management.
- Expanded testing, monitoring, and production security.

## 17. Project Summary

CrisisLens combines external information retrieval with AI-based evidence analysis to help people understand local situations and compare available options.

Its main objective is not simply to summarize search results. It is to organize information by time, source, confidence, and relevance so users can make more informed decisions while understanding the limits of the available evidence.

Always verify critical travel and safety decisions through official authorities and current local information.
