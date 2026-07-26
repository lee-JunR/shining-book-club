#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
cwd="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("cwd", "."))' <<<"$input")"
repo_root="$(git -C "$cwd" rev-parse --show-toplevel)"
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"

if ! git -C "$repo_root" status --porcelain -- "$project_root/src" "$project_root/tests" |
    grep -q .; then
    exit 0
fi

if [[ -n "${CODECRAFT_TEST_COMMAND:-}" ]]; then
    test_command="$CODECRAFT_TEST_COMMAND"
elif [[ -f "$project_root/pyproject.toml" || -f "$project_root/pytest.ini" ]]; then
    test_command="python3 -m pytest"
elif [[ -f "$project_root/package.json" ]]; then
    test_command="npm test"
elif [[ -x "$project_root/tests/run.sh" ]]; then
    test_command="bash tests/run.sh"
elif [[ -f "$project_root/tests/test_codex_hooks.sh" ]]; then
    test_command="bash tests/test_codex_hooks.sh"
else
    printf '{"systemMessage":"Source or tests changed, but no supported test command was found."}\n'
    exit 0
fi

(cd "$project_root" && bash -lc "$test_command")

state_dir="$project_root/.codex/state"
mkdir -p "$state_dir"
"$project_root/.codex/hooks/block-stop-without-tests.sh" --fingerprint > "$state_dir/last-tested"
