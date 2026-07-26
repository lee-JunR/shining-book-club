# Codex Harness Registration Design

## Goal

Translate the repository rules in `CLAUDE.md` into repository-local Codex
configuration without changing the existing Claude configuration.

## Components

- `AGENTS.md` carries durable repository instructions that Codex loads
  automatically.
- `.codex/hooks.json` registers project-local Codex lifecycle hooks.
- `.codex/hooks/run-tests-after-edit.sh` runs the available test suite after
  source or test edits.
- `.codex/hooks/block-stop-without-tests.sh` prevents a turn from stopping when
  relevant files changed but tests have not passed for the current working
  tree state.
- `.agents/skills/codecraft-harness/SKILL.md` defines the task workflow required
  by `CLAUDE.md`.
- `.agents/skills/solid-review/SKILL.md` defines the pre-implementation SOLID
  review.

## Hook behavior

The post-tool hook observes `apply_patch`, `Edit`, and `Write`. It ignores
documentation and configuration-only changes, runs the detected local test
command for source or test changes, and records the tested Git working-tree
fingerprint only after success.

The stop hook compares the current relevant working-tree fingerprint with the
last successful fingerprint. If relevant files are untested, it returns a
Codex `Stop` response that requests continued work and explains what must be
verified. Re-entry is safe because the hook itself does not alter relevant
source files.

## Constraints

- All committed project files stay inside this repository.
- No production APIs or invented production data are used.
- Hook scripts use only local commands and tolerate an initially empty
  teaching sandbox.
- Existing `.claude` files remain untouched.

## Verification

- Parse `.codex/hooks.json`.
- Validate shell syntax with `bash -n`.
- Feed representative Codex hook JSON to both scripts.
- Confirm the stop hook allows a tested state and blocks an untested relevant
  change.
