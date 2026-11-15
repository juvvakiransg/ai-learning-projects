# SafeGuard AI — Safe Chatbot with Guardrails

A complete educational **Responsible AI** project with a React/Vite web UI, a dependency-free Node.js API, layered input/output guardrails, optional OpenAI generation/moderation, and automated tests.

> **Important:** This is a learning demonstration, not a production-grade safety system. Regex rules are easy to evade; model-based moderation can also make mistakes. Production use requires threat modeling, policy evaluation, rate limits, abuse monitoring, authentication, retention controls, and adversarial testing.

## Features

- Input validation (type, empty message, max length, control characters, history validation)
- Heuristic harmful-instruction detection (illustrative examples)
- Prompt injection pattern detection (educational, not a security boundary)
- Output screening and redaction of some recognizable secret formats
- Safe fallback responses and fail-closed moderation when enabled
- React chat interface with safety status, suggested prompts, and responsive layout
- **Mock mode** (no credentials, network calls, or npm packages needed for backend)
- Optional OpenAI Chat Completions + Moderations API (server-side only)
- Backend and frontend automated tests

## Requirements

- Node.js 20 or newer
- npm (only needed to install and run the React web UI)

## Run locally

Open two terminals:

**Terminal 1 — API:**

```bash
cd 02-responsible-ai/02-safe-chatbot-guardrails
npm run dev
# Or: node src/server.js
```

**Terminal 2 — React UI:**

```bash
cd 02-responsible-ai/02-safe-chatbot-guardrails/web
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` to **http://127.0.0.1:3001**.

To run the API with no npm at all: `node src/server.js`.

## Run automated tests

```bash
# From project root: backend tests, no install required
node --test tests/*.test.js
# or npm test

# Frontend tests, after installing web dependencies
cd web
npm test
npm run build
```

## Optional OpenAI provider

Create a `.env` file using `.env.example` as a template. **Node.js does not automatically load `.env`**. With Node 20.6+ start the backend using:

```bash
node --env-file=.env src/server.js
```

Example `.env`:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
USE_OPENAI_MODERATION=true
```

Never put API keys in the React frontend. Moderation is applied to both user input and model output when `AI_PROVIDER=openai` and `USE_OPENAI_MODERATION` is not `false`. If moderation fails, the API returns a 503 rather than bypassing safety checks. The local heuristic layer remains active in all modes.

## API

`GET /api/health` → `{ "status": "ok", "provider": "mock" }`

`POST /api/chat` with JSON:

```json
{ "message": "What are AI guardrails?", "history": [] }
```

Response:

```json
{ "status": "allowed", "reply": "AI guardrails are layered controls...", "redactions": [] }
```

Other `status` values: `blocked`, `invalid`, `unavailable`. Safety decisions return machine-readable `code` values; no raw secrets or prompt contents are logged.

## Project layout

```text
src/
  app.js                  # guardrail orchestration
  server.js               # HTTP server
  guardrails/             # validation, moderation, injection, output filtering
  services/               # mock/OpenAI generation and optional moderation
web/src/
  App.tsx                 # React chat UI
  api.ts                  # typed API client
  components/             # message display
  styles.css              # responsive styling
tests/                    # Node built-in test runner
```

## Safety limitations and next steps

- Pattern matching is illustrative and will miss paraphrases, multilingual requests, and indirect attacks.
- Blocking text such as "ignore previous instructions" can produce false positives in legitimate educational discussions.
- Secret detection is partial. Never assume all PII or credentials are removed.
- Client-supplied chat history is untrusted and is validated for shape, but a production service should associate history with authenticated sessions.
- The mock provider has a small deterministic response catalog, not an LLM.
- The demo has no authentication, persistent chat storage, rate limiting, or distributed abuse prevention. Do not deploy publicly without these controls.
- The UI's "Active" indicators describe the local heuristic pipeline; they do not imply comprehensive protection.
- For a real deployment, add a structured policy engine, comprehensive moderation, evaluation datasets, red-team testing, observability with data minimization, and privacy/security review.

## GitHub path

Place this folder at `ai-learning-projects/02-responsible-ai/02-safe-chatbot-guardrails/`.
