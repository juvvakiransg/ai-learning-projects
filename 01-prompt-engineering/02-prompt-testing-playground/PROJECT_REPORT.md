# Project Report — Prompt Testing Playground

## Assignment
Prompt Debugging & Prompt Versioning

## Objective
Build a playground that preserves prompt versions, executes the same input against multiple versions, compares outputs, and records evidence about improvements.

## Workflow
Baseline prompt → Test → Observe problem → Create new version → Re-test same input → Compare → Rate and record observations.

## Version example
- **v1:** task only.
- **v2:** adds a role and clarity instructions.
- **v3:** adds target audience, formatting, and grounding constraints.

## Improvement tracking
The project stores response time, output word count, a manual 1–5 rating, and debugging notes. The newest version is not automatically treated as the best; the user evaluates whether each change produces the desired behavior.

## Architecture
Browser → FastAPI → SQLite/SQLAlchemy → Prompt Renderer → Demo/OpenAI LLM → Stored Test Results

## Conclusion
The project demonstrates a repeatable, evidence-based prompt debugging and versioning process instead of overwriting prompts informally.
