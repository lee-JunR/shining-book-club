from __future__ import annotations

from datetime import datetime, timezone
from typing import Mapping

from .models import WatchEvent

_STRING_FIELDS = (
    "event_id",
    "user_id",
    "profile_id",
    "content_id",
    "title",
    "maturity_rating",
)


def parse_watch_event(raw: object) -> WatchEvent | None:
    if not isinstance(raw, Mapping):
        return None

    strings: dict[str, str] = {}
    for field in _STRING_FIELDS:
        value = raw.get(field)
        if not isinstance(value, str) or not value.strip():
            return None
        strings[field] = value.strip()

    profile_type = raw.get("profile_type")
    content_type = raw.get("content_type")
    if profile_type not in {"ADULT", "KIDS"}:
        return None
    if content_type not in {"MOVIE", "SERIES"}:
        return None

    watched_seconds = raw.get("watched_seconds")
    duration_seconds = raw.get("duration_seconds")
    if (
        isinstance(watched_seconds, bool)
        or not isinstance(watched_seconds, int)
        or watched_seconds < 0
    ):
        return None
    if (
        isinstance(duration_seconds, bool)
        or not isinstance(duration_seconds, int)
        or duration_seconds <= 0
    ):
        return None

    is_hidden = raw.get("is_hidden")
    if not isinstance(is_hidden, bool):
        return None

    watched_at = _parse_datetime(raw.get("watched_at"))
    if watched_at is None:
        return None

    return WatchEvent(
        event_id=strings["event_id"],
        user_id=strings["user_id"],
        profile_id=strings["profile_id"],
        profile_type=profile_type,
        content_id=strings["content_id"],
        content_type=content_type,
        title=strings["title"],
        watched_seconds=watched_seconds,
        duration_seconds=duration_seconds,
        watched_at=watched_at,
        is_hidden=is_hidden,
        maturity_rating=strings["maturity_rating"],
    )


def _parse_datetime(value: object) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed.astimezone(timezone.utc)
