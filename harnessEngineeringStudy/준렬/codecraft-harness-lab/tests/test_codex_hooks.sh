#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
hooks_file="$repo_root/.codex/hooks.json"
post_hook="$repo_root/.codex/hooks/run-tests-after-edit.sh"
stop_hook="$repo_root/.codex/hooks/block-stop-without-tests.sh"

test -f "$hooks_file"
test -x "$post_hook"
test -x "$stop_hook"

python3 - "$hooks_file" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as file:
    config = json.load(file)

hooks = config["hooks"]
assert hooks["PostToolUse"][0]["matcher"] == "^(apply_patch|Edit|Write)$"
assert "Stop" in hooks
PY

bash -n "$post_hook" "$stop_hook"

fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/.codex/hooks" "$fixture/src" "$fixture/tests"
cp "$post_hook" "$stop_hook" "$fixture/.codex/hooks/"
git -C "$fixture" init -q
git -C "$fixture" config user.email "hooks@example.invalid"
git -C "$fixture" config user.name "Hook Test"
printf 'initial\n' > "$fixture/src/example.txt"
printf '#!/usr/bin/env bash\nexit 0\n' > "$fixture/tests/run.sh"
chmod +x "$fixture/tests/run.sh"
git -C "$fixture" add .
git -C "$fixture" commit -qm "fixture"

post_input="$(printf '{"cwd":"%s","hook_event_name":"PostToolUse","tool_name":"apply_patch"}' "$fixture")"
stop_input="$(printf '{"cwd":"%s","hook_event_name":"Stop"}' "$fixture")"

printf 'changed\n' >> "$fixture/src/example.txt"
printf 'unicode\n' > "$fixture/src/한글.txt"
printf '%s' "$post_input" |
    CODECRAFT_TEST_COMMAND="bash tests/run.sh" "$fixture/.codex/hooks/run-tests-after-edit.sh"

allowed_output="$(
    printf '%s' "$stop_input" |
        "$fixture/.codex/hooks/block-stop-without-tests.sh"
)"
test -z "$allowed_output"

printf 'untested\n' >> "$fixture/src/example.txt"
blocked_output="$(
    printf '%s' "$stop_input" |
        "$fixture/.codex/hooks/block-stop-without-tests.sh"
)"
python3 - "$blocked_output" <<'PY'
import json
import sys

result = json.loads(sys.argv[1])
assert result["continue"] is False
assert "tests" in result["stopReason"].lower()
PY

for skill in codecraft-harness solid-review; do
    skill_file="$repo_root/.agents/skills/$skill/SKILL.md"
    metadata_file="$repo_root/.agents/skills/$skill/agents/openai.yaml"
    test -s "$skill_file"
    test -s "$metadata_file"
    grep -q '^name: ' "$skill_file"
    grep -q '^description: Use when' "$skill_file"
    grep -Fq '$'"$skill" "$metadata_file"
done

grep -q '^# GPT/Codex Lab Rules' "$repo_root/AGENTS.md"
grep -q 'codecraft-harness' "$repo_root/AGENTS.md"
grep -q 'solid-review' "$repo_root/AGENTS.md"

echo "Codex harness checks passed"
