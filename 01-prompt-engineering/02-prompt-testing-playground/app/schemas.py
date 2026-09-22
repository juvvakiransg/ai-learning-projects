from pydantic import BaseModel, Field

class VersionCreate(BaseModel):
    template: str = Field(min_length=3)
    change_notes: str = ""

class CompareRequest(BaseModel):
    prompt_id: int
    version_ids: list[int] = Field(min_length=2, max_length=3)
    test_input: str = Field(min_length=1)

class RatingUpdate(BaseModel):
    rating: int = Field(ge=1, le=5)
    notes: str = ""
