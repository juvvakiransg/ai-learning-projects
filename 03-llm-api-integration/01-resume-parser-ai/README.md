# ResumeIQ AI — Intelligent Resume Parser

Learning project for **LLM API Usage, Structured Outputs, and Function Calling**.

## Features
- Responsive React/Vite UI for resume text and file uploads
- Node.js API with no mandatory backend dependencies
- Offline heuristic demo (no API key; limited extraction)
- OpenAI Chat Completions API with strict JSON Schema structured outputs
- Schema validation, JSON export, and explicit missing values
- Demonstration of actual OpenAI function/tool calling at `/api/function-demo`
- Built-in Node automated backend tests

## Quick start

Requirements: Node.js 20+.

### Backend (no npm install required)
```bash
node src/server.js
```
API: http://127.0.0.1:3003/api/health

### React web UI
```bash
cd web
npm install
npm run dev
```
Open http://127.0.0.1:5173. Vite proxies `/api` to port 3003.

### Automated tests
```bash
npm test
```
The backend tests use Node's built-in test runner and do not require installing npm packages.

## If npm is broken: dependency-free demo via curl
```bash
curl -s http://127.0.0.1:3003/api/parse -H 'Content-Type: application/json' -d '{"mode":"mock","text":"Alex Morgan\nEmail: alex@example.com\n5 years experience\nSkills: Swift, React, AWS"}'
```

## PDF and DOCX support
The API supports TXT immediately. For PDF and DOCX install optional backend parsers:
```bash
npm install pdf-parse@1.1.1 mammoth
```
Text extraction may fail for scanned/image-only PDFs; OCR is not included. The file upload is sent as base64 JSON and limited to 5 MB by the UI.

## OpenAI structured outputs
Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in your shell, then select **OpenAI structured output** in the UI. The API sends a strict JSON Schema using Chat Completions `response_format.json_schema`. Use a model that supports this feature. The model returns structured data; backend schema validation rejects malformed results. The resume is treated as untrusted data and must not be considered an instruction source.

## Function calling demo
With `OPENAI_API_KEY` set, send `POST /api/function-demo`. This endpoint supplies `normalize_skills` and `calculate_experience_months` as function definitions, asks the LLM to call a tool, and executes the requested function locally. This is a **separate demonstration** of function calling, not a claim that resume extraction automatically uses tools.

## JSON fields
`name`, `email`, `phone`, `location`, `skills`, `totalExperienceYears`, `experience[]` (jobTitle/company/startDate/endDate/isCurrent), and `education[]` (degree/institution/year). Missing scalar fields are `null`, missing collections are empty.

## Limitations and privacy
- Offline mock mode uses simple patterns and does **not** reliably extract full employment history or education.
- LLM extraction can hallucinate; review the output against the source resume.
- A resume contains personal data. Get permission before uploading to external APIs; avoid storing raw resumes or secrets in logs.
- This is a learning project, not an applicant tracking system or hiring decision tool.
- Backend and UI are separate processes. If npm is unavailable, use the backend API and automated tests directly.
