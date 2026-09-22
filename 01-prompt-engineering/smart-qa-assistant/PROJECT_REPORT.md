# Project Report: Smart Q&A Assistant Using Prompt Engineering

## 1. Project Overview

The Smart Q&A Assistant is a web-based learning project that demonstrates how prompt-engineering techniques can influence the structure, audience targeting, and presentation of responses produced by a Large Language Model (LLM).

## 2. Objective

Build a Q&A assistant that dynamically constructs prompts using role prompting, few-shot examples, and multiple prompt styles, while allowing users to inspect and compare the generated prompts and responses.

## 3. Prompt Patterns Demonstrated

### Role Prompting
The model receives an explicit role such as Helpful Tutor, Technical Expert, or Interview Coach. The role supplies context about the expected perspective and audience.

### Few-Shot Prompting
The model receives example question-and-answer pairs before the user's question. These examples demonstrate a desired answer structure.

### Style Prompting
The user can request Beginner, Concise, Detailed, or Step-by-Step presentation styles.

### Combined Prompting
The application can combine role, style, and few-shot instructions into one generated prompt.

## 4. Technology Stack

- Python
- FastAPI
- Pydantic
- OpenAI Python SDK / Responses API
- HTML, CSS, JavaScript
- pytest
- OpenAPI / Swagger UI / ReDoc

## 5. Architecture

User → Browser UI → FastAPI endpoint → Prompt Builder → LLM Service → Response

The LLM Service supports Demo Mode for development without API credits and Live Mode for actual OpenAI API requests.

## 6. API Design

- `GET /health`
- `GET /api/roles`
- `GET /api/styles`
- `POST /api/ask`
- `POST /api/compare`

FastAPI automatically exposes the OpenAPI schema and interactive API documentation.

## 7. Demonstration Scenario

Question: `What is dependency injection?`

Compare:

- Basic: only the question is sent.
- Role + Style: audience and presentation instructions are added.
- Role + Style + Few-Shot: example answers are also supplied.

Observe differences in response structure, terminology, level of detail, and consistency with the examples.

## 8. Security

The OpenAI API key is read from an environment variable and is not stored in source code. `.env` is excluded by `.gitignore`.

## 9. Learning Outcomes

This project demonstrates how to construct reusable prompt templates, expose AI functionality through a REST API, generate OpenAPI documentation, separate secrets from source code, compare prompt patterns, and organize a small Python application into maintainable modules.

## 10. Possible Future Improvements

- Conversation history
- User-created roles and prompt templates
- Saved prompt experiments
- Token/cost tracking
- Structured JSON outputs
- Automated prompt evaluation
- Database persistence
- Authentication
