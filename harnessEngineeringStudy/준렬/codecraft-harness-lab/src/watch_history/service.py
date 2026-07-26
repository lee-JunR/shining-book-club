from __future__ import annotations

from collections.abc import Sequence
from typing import TypeAlias

from .models import WatchEvent
from .policies import (
    DefaultSortPolicy,
    DefaultStatusPolicy,
    DefaultVisibilityPolicy,
    SortPolicy,
    StatusPolicy,
    VisibilityPolicy,
)
from .validation import parse_watch_event

HistoryItem: TypeAlias = dict[str, object]
HistorySummary: TypeAlias = dict[str, object]


class WatchHistoryService:
    def __init__(
        self,
        sort_policy: SortPolicy | None = None,
        visibility_policy: VisibilityPolicy | None = None,
        status_policy: StatusPolicy | None = None,
    ) -> None:
        self._sort_policy = sort_policy or DefaultSortPolicy()
        self._visibility_policy = visibility_policy or DefaultVisibilityPolicy()
        self._status_policy = status_policy or DefaultStatusPolicy()

    def build(
        self,
        user_id: str,
        raw_events: Sequence[object],
    ) -> HistorySummary:
        if not isinstance(user_id, str) or not user_id.strip():
            raise ValueError("user_id must be a non-empty string")
        if not isinstance(raw_events, Sequence) or isinstance(raw_events, (str, bytes)):
            raise TypeError("raw_events must be a sequence")

        latest_by_content: dict[str, WatchEvent] = {}
        for raw_event in raw_events:
            event = parse_watch_event(raw_event)
            if (
                event is None
                or event.user_id != user_id
                or not self._visibility_policy.is_visible(event)
            ):
                continue
            current = latest_by_content.get(event.content_id)
            if current is None or (event.watched_at, event.event_id) > (
                current.watched_at,
                current.event_id,
            ):
                latest_by_content[event.content_id] = event

        items = [self._to_item(event) for event in latest_by_content.values()]
        return {"user_id": user_id, "items": self._sort_policy.sort(items)}

    def _to_item(self, event: WatchEvent) -> HistoryItem:
        progress = self._status_policy.progress_for(
            event.watched_seconds,
            event.duration_seconds,
        )
        return {
            "content_id": event.content_id,
            "title": event.title,
            "progress_percent": progress,
            "watch_status": self._status_policy.status_for(progress).value,
            "last_watched_at": event.watched_at.isoformat().replace("+00:00", "Z"),
        }
