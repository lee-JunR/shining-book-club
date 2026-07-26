---
name: codecraft-harness
description: Use when implementing or changing a Code Craft exercise in this repository.
---

# Code Craft Harness

Turn a task into an explicit, testable contract before implementation.

## Workflow

1. Read the problem statement, nearby code, tests, and `AGENTS.md`.
2. State the expected output with concrete examples or assertions.
3. Define input models, field types, validation, and normalization.
4. List constraints and edge cases, including empty and malformed input.
5. Identify change points: rules likely to vary independently.
6. Split parsing, domain policy, aggregation, and presentation
   responsibilities behind small interfaces.
7. **REQUIRED SUB-SKILL:** Use `solid-review` before implementation.
8. Write or update a focused test and observe the expected failure.
9. Implement only enough behavior to satisfy that test.
10. Run the focused test and then the full available suite.
11. Report changed files, verified behavior, commands, and results.

## Guardrails

- Do not invent production data or call production APIs.
- Do not access files outside this repository.
- Do not implement before the contract and plan are explicit.
- If a test fails, explain which requirement failed before changing code.
- Keep unrelated refactoring outside the task.
