import os
from openai import OpenAI


def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "true").lower() in {"1", "true", "yes", "on"}


def generate_answer(prompt: str) -> tuple[str, str, str]:
    model = os.getenv("OPENAI_MODEL", "gpt-5-mini")
    if is_demo_mode():
        return (
            "demo",
            "demo-model",
            "Demo response: The prompt was built successfully. Set DEMO_MODE=false and add "
            "OPENAI_API_KEY to .env to receive a live LLM response.\n\n"
            "Prompt preview:\n" + prompt[:700],
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to .env or enable DEMO_MODE=true.")

    client = OpenAI(api_key=api_key)
    response = client.responses.create(model=model, input=prompt)
    return "live", model, response.output_text
