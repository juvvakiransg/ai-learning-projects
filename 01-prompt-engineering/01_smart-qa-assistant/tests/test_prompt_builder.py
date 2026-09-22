from app.services.prompt_builder import build_prompt


def test_prompt_contains_role_style_question_and_examples():
    prompt = build_prompt("What is an API?", "helpful_tutor", "beginner", True)
    assert "helpful tutor" in prompt.lower()
    assert "simple language" in prompt.lower()
    assert "Example 1" in prompt
    assert "Question: What is an API?" in prompt


def test_few_shot_can_be_disabled():
    prompt = build_prompt("What is REST?", "technical_expert", "concise", False)
    assert "Example 1" not in prompt
