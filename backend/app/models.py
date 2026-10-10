from pydantic import BaseModel, Field


class InvestigationRequest(BaseModel):
    location: str = Field(min_length=2, max_length=120)
    situation: str = Field(min_length=5, max_length=600)
    destination: str | None = Field(default=None, max_length=120)
    needs: str | None = Field(default=None, max_length=300)


class FollowUpRequest(BaseModel):
    investigation_id: str
    question: str = Field(min_length=2, max_length=500)
