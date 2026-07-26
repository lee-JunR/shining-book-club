from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Protocol, TypeVar

from .models import WatchEvent, WatchStatus

T = TypeVar("T", bound=Mapping[str, object])


class SortPolicy(Protocol):
    def sort(self, items: Sequence[T]) -> list[T]: ...


class VisibilityPolicy(Protocol):
    def is_visible(self, event: WatchEvent) -> bool: ...


class StatusPolicy(Protocol):
    def progress_for(self, watched_seconds: int, duration_seconds: int) -> int: ...

    def status_for(self, progress_percent: int) -> WatchStatus: ...


class DefaultSortPolicy:
    def sort(self, items: Sequence[T]) -> list[T]:
        return sorted(items, key=lambda item: str(item["last_watched_at"]), reverse=True)


class DefaultVisibilityPolicy:
    _MATURE_RATINGS = frozenset({"R", "NC_17", "TV_MA"})

    def is_visible(self, event: WatchEvent) -> bool:
        if event.is_hidden:
            return False
        return not (
            event.profile_type == "KIDS"
            and event.maturity_rating in self._MATURE_RATINGS
        )


class DefaultStatusPolicy:
    def progress_for(self, watched_seconds: int, duration_seconds: int) -> int:
        progress = watched_seconds * 100 // duration_seconds
        return min(100, max(0, progress))

    def status_for(self, progress_percent: int) -> WatchStatus:
        if progress_percent >= 90:
            return WatchStatus.COMPLETED
        return WatchStatus.IN_PROGRESS
