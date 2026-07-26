---
name: solid-review
description: Use when reviewing a Code Craft design or implementation plan before code is written.
---

# SOLID Review

Check whether the proposed boundaries can absorb likely changes without
spreading edits across unrelated components.

## Review

For each proposed unit, record `pass`, `risk`, or `not applicable`:

- **Single responsibility:** Does the unit have one reason to change?
- **Open/closed:** Can a likely new rule be added without editing stable
  orchestration?
- **Liskov substitution:** Can implementations honor the same inputs, outputs,
  errors, and invariants?
- **Interface segregation:** Does each consumer depend only on operations it
  uses?
- **Dependency inversion:** Do policies depend on narrow abstractions rather
  than storage, framework, or formatting details?

Also check:

- Input parsing is separate from domain decisions.
- Aggregation is separate from output formatting.
- Edge cases have an explicit owner.
- Tests can exercise policies without production services.

## Output

Return:

1. The responsibility map.
2. Findings ordered by implementation risk.
3. The smallest boundary changes needed before coding.
4. Any accepted trade-off and why it is reasonable for this exercise.

Do not add abstractions for hypothetical changes that the problem does not
suggest.
