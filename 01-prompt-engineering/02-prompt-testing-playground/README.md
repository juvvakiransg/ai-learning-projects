# Prompt Testing Playground

A GitHub-ready project for the **Prompt Debugging & Prompt Versioning** assignment.

## Features

- Compare 2–3 prompt versions using the same test input
- Store v1, v2, v3 and future versions in SQLite
- Create a new version without overwriting history
- Track output word count and response time
- Save a 1–5 rating and debugging observations
- Review test history
- Demo mode works without API credits
- Optional OpenAI Responses API integration
- FastAPI Swagger/OpenAPI documentation

## Tech stack

Python, FastAPI, SQLite, SQLAlchemy, Pydantic, HTML/CSS/JavaScript, OpenAI API, pytest.

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000`.

Swagger: `http://127.0.0.1:8000/docs`

The default `.env.example` uses `DEMO_MODE=true`, so no API key is needed.

## Real LLM mode

Edit `.env`:

```env
DEMO_MODE=false
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6-luna
```

Never commit `.env`.

## Suggested GitHub location

```text
ai-learning-projects/
└── 01-prompt-engineering/
    ├── 01-smart-qa-assistant/
    └── 02-prompt-testing-playground/
```
