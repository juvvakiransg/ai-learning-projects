# PromptScore AI — Prompt Evaluation System

A complete reference-based prompt evaluation application with a dependency-free Node.js backend, a React/Vite dashboard, sample datasets, scoring metrics, JSON/CSV report export, and automated tests.

## Repository placement

`ai-learning-projects/04-evaluation-basics/01-prompt-evaluation-system/`

## Features

- Upload JSON datasets containing `id`, `question`, `expectedOutput`, optional `keywords`, and optional `actualOutput`.
- Run three response modes: **mock fixtures**, **provided responses**, or **OpenAI API**.
- Compute normalized exact-match accuracy, token-level F1, keyword phrase coverage, and composite pass/fail using a configurable threshold, with a conservative contradiction guard.
- Inspect question-level results and export reports as JSON or CSV.
- Run the backend and automated tests without installing npm packages.

## Quick start

Requires Node.js 20+.

### Backend (no npm install)

```bash
node src/server.js
```

API: `http://127.0.0.1:3004/api/health`

If port 3004 is occupied, run `PORT=3005 node src/server.js` and change the Vite proxy target in `web/vite.config.js` accordingly.

### Web UI

```bash
cd web
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

### Automated backend tests (no npm install)

```bash
node --test tests/*.test.js
```

## Sample API

```bash
curl -X POST http://127.0.0.1:3004/api/evaluate \
  -H 'Content-Type: application/json' \
  -d '{"mode":"provided","threshold":0.75,"dataset":[{"id":"Q1","question":"Capital of France?","expectedOutput":"Paris","keywords":["Paris"],"actualOutput":"Paris"}]}'
```

`GET /api/sample` loads the bundled dataset; `POST /api/evaluate` evaluates it.

## Dataset schema

```json
[
  {
    "id": "Q001",
    "question": "What is the capital of France?",
    "expectedOutput": "Paris",
    "keywords": ["Paris"],
    "actualOutput": "Paris"
  }
]
```

`actualOutput` is required only for **provided** mode. The bundled sample omits it. The JSON uploader supports datasets up to 1 MB; the backend limits requests to 1 MB and 200 rows.

## Scoring

- **Exact match:** 1 if punctuation/case/whitespace-normalized strings match; otherwise 0.
- **Token F1:** multiset token overlap; `2 * overlap / (expected token count + actual token count)`.
- **Keyword coverage:** proportion of required keyword phrases present in the normalized response; returns 1 if no keywords are specified.
- **Composite:** unweighted mean of the three metrics. A row passes when its composite meets the threshold **and** the contradiction guard does not flag the answer.
- **Contradiction guard:** detects common explicit negation, rejection, and uncertainty around the reference answer. For example, `It is not Paris, it is Lyon.` fails even though the keyword `Paris` is present. The JSON report includes `contradictionDetected` and `gradingReason`; the summary includes `contradictionsDetected`.
- **Accuracy:** average exact match across the dataset.

**Important:** Mock mode deliberately returns each expected answer, so it normally scores 100%. This is a *pipeline fixture*, not evidence that an LLM is accurate. Token overlap and keyword checks do not measure factual correctness or semantic equivalence. Reference answers should be reviewed for ambiguity and multiple valid phrasings.

## OpenAI mode (optional)

Set `OPENAI_API_KEY` in your shell before starting the backend (do not commit keys). Optionally set `OPENAI_MODEL` (defaults to `gpt-4.1-mini`). OpenAI mode sends only questions, never expected answers, to the model. Calls are sequential and may incur API charges. Errors fail the evaluation rather than fabricating scores. API access, model availability, and quotas are required.

```bash
export OPENAI_API_KEY='your-key'
node src/server.js
```

## Privacy and limitations

Do not upload confidential prompts or personal information to a third-party API without appropriate authorization. This educational demo has no authentication, persistent storage, rate limiting, or production-grade dataset controls. CORS is restricted to the default Vite origin; do not expose the service publicly as-is. The CSV sample is a simple example; the UI imports JSON datasets. To evaluate a real model, choose OpenAI mode, or supply actual outputs produced independently of reference answers.

## Project submission

**Category:** Evaluation Basics  
**Project:** PromptScore AI — Prompt Evaluation & Scoring System  
**Objective:** Evaluate model answers against expected outputs using exact match, token F1, keyword coverage, configurable thresholds, and reproducible datasets.

**Validation:** Run the tests in your own environment and document the output. Frontend requires npm installation and should not be marked verified until it runs successfully.

## Reviewer feedback addressed (2026-11)

The original implementation used lexical metrics (exact match, token F1, keyword coverage). The keyword `Paris` could be counted in a contradictory answer such as `It is not Paris, it is Lyon.`. The revised implementation preserves the metrics for diagnostic purposes but blocks a passing grade when a **recognizable explicit contradiction or uncertainty** is present. Regression tests cover these cases and ensure a valid `Paris` answer still passes.

**Scope:** This is a lightweight, dependency-free heuristic for an educational POC, **not** a semantic or factual correctness evaluator. It cannot reliably identify every paraphrase, subtle contradiction, multilingual negation, or factually wrong answer that contains the right keyword. For production-grade grading, add a structured semantic/LLM judge with independent validation and human review for uncertain or high-stakes cases.
