# Netflix Watch History API

## Problem

Build an API that returns a user's watch history summary.

## Expected Output

```json
{
  "user_id": "user_123",
  "items": [
    {
      "content_id": "movie_1",
      "title": "The Matrix",
      "progress_percent": 72,
      "watch_status": "IN_PROGRESS",
      "last_watched_at": "2026-05-12T20:10:00Z"
    }
  ]
}
```

## Input Event Example

```json
{
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
  "is_hidden": false,
  "maturity_rating": "PG_13"
}
```

## Required Rules

- Exclude invalid events.
- Exclude hidden content.
- For KIDS profiles, exclude mature content.
- Clamp progress_percent between 0 and 100.
- Mark content as COMPLETED when progress_percent >= 90.
- Sort by last_watched_at descending by default.
