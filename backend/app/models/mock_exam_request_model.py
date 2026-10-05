from typing import List

from pydantic import BaseModel


class MockExamRequest(BaseModel):
    note_ids: List[str]
