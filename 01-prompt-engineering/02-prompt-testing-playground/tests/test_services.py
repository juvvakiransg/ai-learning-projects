from app.services import render_prompt

def test_placeholder_is_replaced():
    assert render_prompt("Summarize: {input}", "Hello") == "Summarize: Hello"

def test_input_is_appended_without_placeholder():
    result = render_prompt("Summarize.", "Hello")
    assert "Summarize." in result and "Hello" in result
