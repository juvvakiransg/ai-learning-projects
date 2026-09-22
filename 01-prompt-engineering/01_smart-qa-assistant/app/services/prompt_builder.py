from app.prompts.roles import ROLE_PROMPTS
from app.prompts.styles import STYLE_PROMPTS
from app.prompts.few_shot import FEW_SHOT_EXAMPLES


def build_prompt(question: str, role: str, style: str, use_few_shot: bool) -> str:
    parts = [
        ROLE_PROMPTS[role],
        STYLE_PROMPTS[style],
        "Answer the user's question. Do not invent facts; say when you are uncertain.",
    ]
    if use_few_shot:
        parts.append(FEW_SHOT_EXAMPLES)
    parts.append(f"Question: {question.strip()}")
    return "\n\n".join(parts)
