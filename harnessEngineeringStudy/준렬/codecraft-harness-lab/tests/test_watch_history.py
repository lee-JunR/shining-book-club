from __future__ import annotations

import unittest

from watch_history.service import WatchHistoryService


def event(**overrides: object) -> dict[str, object]:
    value: dict[str, object] = {
        "event_id": "event_1",
        "user_id": "user_123",
        "profile_id": "profile_1",
        "profile_type": "ADULT",
        "content_id": "movie_1",
        "content_type": "MOVIE",
        "title": "The Matrix",
        "watched_seconds": 1200,
        "duration_seconds": 7200,
        "watched_at": "2026-05-12T20:10:00Z",
        "is_hidden": False,
        "maturity_rating": "PG_13",
    }
    value.update(overrides)
    return value


class WatchHistoryTest(unittest.TestCase):
    def setUp(self) -> None:
        self.service = WatchHistoryService()

    def test_returns_watch_history_summary_for_valid_events(self) -> None:
        summary = self.service.build("user_123", [event()])

        self.assertEqual(
            summary,
            {
                "user_id": "user_123",
                "items": [
                    {
                        "content_id": "movie_1",
                        "title": "The Matrix",
                        "progress_percent": 16,
                        "watch_status": "IN_PROGRESS",
                        "last_watched_at": "2026-05-12T20:10:00Z",
                    }
                ],
            },
        )

    def test_returns_empty_items_for_empty_input(self) -> None:
        summary = self.service.build("user_123", [])

        self.assertEqual(summary, {"user_id": "user_123", "items": []})

    def test_excludes_events_with_missing_id_or_invalid_duration(self) -> None:
        missing_event_id = event()
        missing_event_id.pop("event_id")
        invalid_events = [
            missing_event_id,
            event(event_id="zero-duration", duration_seconds=0),
            event(event_id="negative-duration", duration_seconds=-1),
        ]

        summary = self.service.build("user_123", invalid_events)

        self.assertEqual(summary["items"], [])

    def test_excludes_hidden_content(self) -> None:
        summary = self.service.build("user_123", [event(is_hidden=True)])

        self.assertEqual(summary["items"], [])

    def test_excludes_mature_content_for_kids_profile(self) -> None:
        summary = self.service.build(
            "user_123",
            [event(profile_type="KIDS", maturity_rating="TV_MA")],
        )

        self.assertEqual(summary["items"], [])

    def test_clamps_progress_percent_between_zero_and_one_hundred(self) -> None:
        summary = self.service.build(
            "user_123",
            [
                event(event_id="zero", content_id="zero", watched_seconds=0),
                event(
                    event_id="over",
                    content_id="over",
                    watched_seconds=8000,
                    duration_seconds=100,
                    watched_at="2026-05-13T20:10:00Z",
                ),
            ],
        )

        progress_by_content = {
            item["content_id"]: item["progress_percent"] for item in summary["items"]
        }
        self.assertEqual(progress_by_content, {"zero": 0, "over": 100})

    def test_marks_content_completed_at_ninety_percent(self) -> None:
        summary = self.service.build(
            "user_123",
            [event(watched_seconds=900, duration_seconds=1000)],
        )

        self.assertEqual(summary["items"][0]["progress_percent"], 90)
        self.assertEqual(summary["items"][0]["watch_status"], "COMPLETED")

    def test_combines_same_content_by_selecting_latest_event(self) -> None:
        summary = self.service.build(
            "user_123",
            [
                event(
                    event_id="older",
                    watched_seconds=6000,
                    watched_at="2026-05-10T20:10:00Z",
                ),
                event(
                    event_id="latest",
                    watched_seconds=1200,
                    watched_at="2026-05-12T20:10:00Z",
                ),
            ],
        )

        self.assertEqual(len(summary["items"]), 1)
        self.assertEqual(summary["items"][0]["progress_percent"], 16)
        self.assertEqual(
            summary["items"][0]["last_watched_at"],
            "2026-05-12T20:10:00Z",
        )

    def test_sorts_items_by_last_watched_at_descending(self) -> None:
        summary = self.service.build(
            "user_123",
            [
                event(
                    event_id="old",
                    content_id="old",
                    watched_at="2026-05-10T20:10:00Z",
                ),
                event(
                    event_id="new",
                    content_id="new",
                    watched_at="2026-05-13T20:10:00Z",
                ),
                event(
                    event_id="middle",
                    content_id="middle",
                    watched_at="2026-05-12T20:10:00Z",
                ),
            ],
        )

        self.assertEqual(
            [item["content_id"] for item in summary["items"]],
            ["new", "middle", "old"],
        )


if __name__ == "__main__":
    unittest.main()
