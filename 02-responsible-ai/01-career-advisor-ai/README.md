# Career Advisor AI — Responsible AI Basics & AI Tool Familiarity

An **offline-first**, runnable TypeScript/Node.js career-advice assistant with optional OpenAI Responses API integration. This is a learning project, **not** a hiring or job-listings service.

## Requirements

- Node.js **22.10+** (uses Node's built-in experimental TypeScript type stripping)
- No npm dependencies required for offline mode or tests

## Quick start

```bash
cd 02-responsible-ai/01-career-advisor-ai
npm start
npm start -- sample-profile.json
npm test
npm run test:coverage
```

You can customize `sample-profile.json`. Input fields: `currentRole`, `experienceYears`, `skills`, `interests`, `careerGoal`, `learningHoursPerWeek`.

## Optional OpenAI mode

OpenAI API billing is **separate** from ChatGPT subscriptions. To enable API generation:

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY='your-secret-key'
export OPENAI_MODEL='gpt-5'
npm start -- sample-profile.json
```

OpenAI mode uses the Responses API via Node's native `fetch` (no SDK dependency). It requests JSON and validates returned shape, catalog roles and basic unsafe phrases. **This is illustrative, not a comprehensive content moderation system.** If you receive `429 insufficient_quota`, use `AI_PROVIDER=offline`.

## Features

- Role, instruction, and few-shot prompting (`src/prompts/templates.ts`)
- Skill- and goal-based ranking of **career roles**, not live job vacancies
- Three-phase 12-week roadmap with personalized weekly study hours
- Profile schema checks and deterministic offline mode
- Data minimization helper, transparency disclaimer, basic unsafe-language checks
- Mocked API success, invalid output, quota and server error tests
- No hardcoded API keys or secrets committed to Git

## Architecture

```text
src/index.ts
  -> models/profile.ts        (input validation)
  -> services/recommend.ts    (offline recommendation + roadmap)
  -> services/openai.ts       (optional API integration)
  -> prompts/templates.ts     (role/few-shot/instruction prompts)
  -> safety/responsible.ts    (privacy and basic safety checks)
  -> services/catalog.ts     (sample career-role skill catalog)
tests/career.test.mjs         (automated tests)
```

## Responsible AI principles and limitations

- **Fairness:** scoring uses only supplied skills, goals and interests; protected traits are not ranking inputs. This does not establish that outcomes are bias-free. Audit diverse hypothetical profiles before real use.
- **Privacy:** profile data is processed locally in offline mode. API mode sends profile fields to OpenAI. Avoid entering names, contact details or sensitive personal information.
- **Transparency:** the score is a simple educational heuristic, **not** a calibrated probability of being hired.
- **Accuracy:** catalog is small and illustrative, not a live labor-market source. Confirm real role requirements and vacancies independently.
- **Safety:** regex checks and JSON validation are examples, not complete safeguards. AI-generated text and advice need human review.
- **API usage:** requests may incur costs. Never place your API key in mobile/web client bundles or commit it to Git.

## Test coverage

Run `npm test` to exercise validation, matching, roadmap, privacy, prompts, safety, and mocked OpenAI success/error paths. `npm run test:coverage` prints line coverage (coverage percentage depends on Node version).

## Submission summary

**Project:** Career Advisor AI — Build End-to-End AI Assistant combining prompt engineering and responsible AI.

**Outcome:** A reproducible TypeScript project with offline recommendations, learning roadmap, role and few-shot prompts, optional OpenAI integration, input validation, basic fairness/privacy safeguards, and automated tests.

## React web interface (new)

This version includes a responsive **React + TypeScript + Vite** frontend and a Node HTTP backend that reuses the existing profile validation, offline recommendation engine, roadmap generator and optional OpenAI integration.

**Prerequisites:** Node.js 22.10+ and npm. Open two terminal windows in this folder:

**Terminal 1 — API server:**

```bash
npm run api
```

**Terminal 2 — frontend:**

```bash
npm run web:install
npm run web:dev
```

Open **http://localhost:5173** in your browser. The Vite development server proxies `/api` requests to `http://127.0.0.1:3001`, keeping API keys server-side.

To run all backend tests, including API endpoint tests: `npm test`. To build the web frontend for deployment: `npm run web:build`. The build requires installing frontend dependencies first.

The UI supports profile editing, offline/OpenAI selection, top career matches, matching skills, skill gaps, a 12-week roadmap and responsible-AI explanations. OpenAI mode requires setting `OPENAI_API_KEY` in the **API server terminal**; API credits are billed separately. No API key is ever embedded in frontend code.

**Security note:** This is a local learning application. The API binds to `127.0.0.1`; authentication, rate limiting, persistent storage, abuse monitoring and production deployment hardening are out of scope.
