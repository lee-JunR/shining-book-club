from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class WatchStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


@dataclass(frozen=True)
class WatchEvent:
    event_id: str
    user_id: str
    profile_id: str
    profile_type: str
    content_id: str
    content_type: str
    title: str
    watched_seconds: int
    duration_seconds: int
    watched_at: datetime
    is_hidden: bool
    maturity_rating: str
