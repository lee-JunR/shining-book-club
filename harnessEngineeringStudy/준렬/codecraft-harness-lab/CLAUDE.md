# Claude Code Lab Rules

This repository is a teaching sandbox for Code Craft and Harness Engineering.

## Scope

Only work inside this repository.

Do not access:
- parent directories
- home directory
- downloads folder
- desktop folder
- .env files
- SSH keys
- browser data
- personal files
- real customer data
- production APIs

## Required Workflow

For every Code Craft task:

1. Use the codecraft-harness skill first.
2. Define the expected output before implementation.
3. Define input data models.
4. Define constraints and edge cases.
5. Identify change points.
6. Split responsibilities.
7. Use the solid-review skill before implementation.
8. Write or update tests.
9. Implement the minimal version.
10. Run tests.
11. Summarize changed files and verification results.

## Rules

- Do not implement before creating a plan.
- Do not invent production data.
- Do not call external production APIs.
- Do not modify files outside this repository.
- Do not skip tests.
- If tests fail, explain the failing requirement before modifying code again.
