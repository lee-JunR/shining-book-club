# Codex Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register repository guidance, skills, and lifecycle validation hooks for Codex.

**Architecture:** `AGENTS.md` provides durable instructions, `.agents/skills` holds judgment-based workflows, and `.codex/hooks.json` invokes deterministic shell guards. A shell integration test drives hook behavior through Codex-compatible JSON.

**Tech Stack:** Markdown, JSON, POSIX shell, Git

## Global Constraints

- Keep all project changes inside this repository.
- Do not change the existing `.claude` configuration.
- Do not call production APIs or use production data.
- Do not create commits.

---

### Task 1: Hook contract test and implementation

**Files:**
- Create: `tests/test_codex_hooks.sh`
- Create: `.codex/hooks.json`
- Create: `.codex/hooks/run-tests-after-edit.sh`
- Create: `.codex/hooks/block-stop-without-tests.sh`

**Interfaces:**
- Consumes: Codex hook JSON on standard input.
- Produces: silent success, or Codex `systemMessage`/`continue` JSON.

- [ ] Write a shell test that checks configuration parsing, shell syntax,
  successful test-state recording, and stop blocking after a relevant change.
- [ ] Run `bash tests/test_codex_hooks.sh` and confirm it fails because the
  Codex files do not exist.
- [ ] Add the minimal hook configuration and scripts.
- [ ] Run `bash tests/test_codex_hooks.sh` and confirm it passes.

### Task 2: Repository instructions and skills

**Files:**
- Create: `AGENTS.md`
- Create: `.agents/skills/codecraft-harness/SKILL.md`
- Create: `.agents/skills/codecraft-harness/agents/openai.yaml`
- Create: `.agents/skills/solid-review/SKILL.md`
- Create: `.agents/skills/solid-review/agents/openai.yaml`

**Interfaces:**
- Consumes: Code Craft implementation and design-review requests.
- Produces: explicit expected outputs, models, constraints, change points,
  responsibility boundaries, tests, and SOLID findings.

- [ ] Add structural validation for `AGENTS.md`, skill frontmatter, and UI
  metadata to `tests/test_codex_hooks.sh`.
- [ ] Run the test and confirm it fails because the guidance files are absent.
- [ ] Add concise Codex instructions and the two project-local skills.
- [ ] Validate both skills with `quick_validate.py`.
- [ ] Run the full shell integration test and confirm it passes.

### Task 3: Final verification

**Files:**
- Verify all files created in Tasks 1 and 2.

- [ ] Run `git diff --check`.
- [ ] Run `bash -n .codex/hooks/*.sh tests/test_codex_hooks.sh`.
- [ ] Run `bash tests/test_codex_hooks.sh`.
- [ ] Inspect `git status --short` and confirm no out-of-scope file was changed.
