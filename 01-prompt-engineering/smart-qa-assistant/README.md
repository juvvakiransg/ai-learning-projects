# Smart Q&A Assistant — Prompt Engineering Playground

A beginner-friendly project demonstrating **role prompting**, **few-shot prompting**, and **prompt styles** through a small web application and REST API.

## Features

- Role prompting: Helpful Tutor, Technical Expert, Interview Coach
- Styles: Beginner, Concise, Detailed, Step-by-Step
- Optional few-shot examples
- Shows the exact generated prompt
- Comparison mode: Basic vs Role+Style vs Role+Style+Few-Shot
- Demo Mode works without API credits
- Live mode uses the OpenAI Responses API
- FastAPI-generated Swagger, ReDoc, and OpenAPI schema
- Basic automated tests

## Architecture

Browser → FastAPI → Prompt Builder → OpenAI API (or Demo Mode) → Response

## 1. Prerequisites

Install Python 3.10 or newer. Check with:

```bash
python3 --version
```

## 2. Create a virtual environment

From the project folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

A virtual environment keeps this project's Python packages separate from other projects.

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure environment

```bash
cp .env.example .env
```

The default is:

```env
DEMO_MODE=true
```

So the project runs without an API key.

## 5. Run

```bash
uvicorn app.main:app --reload
```

Open:

- App: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- OpenAPI: `http://127.0.0.1:8000/openapi.json`

## 6. Enable the real OpenAI API

After API billing is configured, create an API key and edit your local `.env`:

```env
DEMO_MODE=false
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5-mini
```

**Never commit `.env` or your API key.** `.gitignore` already excludes `.env`.

The application uses the OpenAI Python SDK and Responses API:

```python
client = OpenAI(api_key=api_key)
response = client.responses.create(model=model, input=prompt)
```

## 7. Run tests

```bash
pytest
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/roles` | Available roles |
| GET | `/api/styles` | Available styles |
| POST | `/api/ask` | Build a prompt and answer one question |
| POST | `/api/compare` | Compare three prompting patterns |

Example request:

```json
{
  "question": "What is dependency injection?",
  "role": "helpful_tutor",
  "style": "beginner",
  "use_few_shot": true
}
```

## What the project demonstrates

### Role prompting

Sets context such as: `You are a helpful tutor...`

### Few-shot prompting

Supplies example question/answer pairs before the new question so the model can follow the demonstrated pattern.

### Prompt styles

Changes instructions for beginner-friendly, concise, detailed, or step-by-step responses.

### Prompt comparison

The same question is evaluated with:

1. Basic prompt
2. Role + style
3. Role + style + few-shot examples

This makes the effect of each prompting technique visible during a demo.

## Publish to GitHub

Create an empty repository on GitHub, then from this folder run:

```bash
git init
git add .
git commit -m "Initial commit: Smart Q&A Assistant"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Before `git push`, verify that `.env` is not staged:

```bash
git status
```

## Suggested demo

Ask the same question, such as **"Explain dependency injection"**, and use **Compare Patterns**. Discuss how role instructions control perspective, style instructions control presentation, and few-shot examples demonstrate the desired response pattern.
