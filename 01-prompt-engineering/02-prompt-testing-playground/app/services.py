import time
from openai import OpenAI
from app.config import settings

def render_prompt(template: str, test_input: str) -> str:
    return template.replace("{input}", test_input) if "{input}" in template else f"{template}\n\nInput:\n{test_input}"

def generate_output(prompt: str, version: int):
    start = time.perf_counter()
    if settings.demo_mode:
        outputs = {
            1: "Demo output: A general answer with few constraints.",
            2: "Demo output: A clearer answer because role and quality instructions were added.",
            3: "Demo output:\n- Clear structure\n- Audience-aware wording\n- Important facts prioritized\n- Constraints followed"
        }
        output = outputs.get(version, "Demo output: This response reflects the latest prompt instructions.")
    else:
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required when DEMO_MODE=false.")
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.responses.create(model=settings.openai_model, input=prompt)
        output = response.output_text
    return output, round((time.perf_counter() - start) * 1000, 2)
