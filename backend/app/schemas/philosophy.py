from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ManifestoBlock(BaseModel):
    title: str
    body: str

    model_config = ConfigDict(from_attributes=True)


class PhilosophyRead(BaseModel):
    id: int
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    manifesto_blocks: list[ManifestoBlock] = []
    updated_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PhilosophyUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    manifesto_blocks: Optional[list[ManifestoBlock]] = None
