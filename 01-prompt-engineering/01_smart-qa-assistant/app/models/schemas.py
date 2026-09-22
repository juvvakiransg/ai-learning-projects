from typing import Literal
from pydantic import BaseModel, Field

Role = Literal["helpful_tutor", "technical_expert", "interview_coach"]
Style = Literal["beginner", "concise", "detailed", "step_by_step"]


class QuestionRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000, examples=["What is dependency injection?"])
    role: Role = "helpful_tutor"
    style: Style = "beginner"
    use_few_shot: bool = True


class AnswerResponse(BaseModel):
    mode: str
    model: str
    generated_prompt: str
    answer: str


class ComparisonItem(BaseModel):
    pattern: str
    generated_prompt: str
    answer: str


class ComparisonResponse(BaseModel):
    mode: str
    results: list[ComparisonItem]
