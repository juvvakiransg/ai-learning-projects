from fastapi import APIRouter, HTTPException
from app.models.schemas import AnswerResponse, ComparisonItem, ComparisonResponse, QuestionRequest
from app.prompts.roles import ROLE_PROMPTS
from app.prompts.styles import STYLE_PROMPTS
from app.services.llm_service import generate_answer
from app.services.prompt_builder import build_prompt

router = APIRouter(prefix="/api", tags=["Q&A"])


@router.get("/roles")
def get_roles():
    return [{"id": key, "label": key.replace("_", " ").title()} for key in ROLE_PROMPTS]


@router.get("/styles")
def get_styles():
    return [{"id": key, "label": key.replace("_", " ").title()} for key in STYLE_PROMPTS]


@router.post("/ask", response_model=AnswerResponse)
def ask(request: QuestionRequest):
    try:
        prompt = build_prompt(request.question, request.role, request.style, request.use_few_shot)
        mode, model, answer = generate_answer(prompt)
        return AnswerResponse(mode=mode, model=model, generated_prompt=prompt, answer=answer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/compare", response_model=ComparisonResponse)
def compare(request: QuestionRequest):
    configurations = [
        ("Basic prompt", request.question),
        ("Role + style", build_prompt(request.question, request.role, request.style, False)),
        ("Role + style + few-shot", build_prompt(request.question, request.role, request.style, True)),
    ]
    results = []
    mode = "demo"
    try:
        for pattern, prompt in configurations:
            mode, _, answer = generate_answer(prompt)
            results.append(ComparisonItem(pattern=pattern, generated_prompt=prompt, answer=answer))
        return ComparisonResponse(mode=mode, results=results)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
