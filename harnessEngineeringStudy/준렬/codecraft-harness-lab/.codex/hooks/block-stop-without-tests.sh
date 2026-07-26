#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
repo_root="$(git -C "$project_root" rev-parse --show-toplevel)"

fingerprint() {
    {
        git -C "$repo_root" diff --binary HEAD -- "$project_root/src" "$project_root/tests"
        git -C "$repo_root" -c core.quotePath=false \
            ls-files --others --exclude-standard -- \
            "$project_root/src" "$project_root/tests" |
            LC_ALL=C sort |
            while IFS= read -r path; do
                test -n "$path" || continue
                shasum -a 256 "$repo_root/$path"
            done
    } | shasum -a 256 | awk '{print $1}'
}

if [[ "${1:-}" == "--fingerprint" ]]; then
    fingerprint
    exit 0
fi

cat >/dev/null
state_file="$project_root/.codex/state/last-tested"
current="$(fingerprint)"
tested=""
if [[ -f "$state_file" ]]; then
    tested="$(cat "$state_file")"
fi

if [[ "$current" != "$tested" ]]; then
    printf '%s\n' \
        '{"continue":false,"stopReason":"Relevant source or test files changed after the last successful tests. Run the tests and verify the result before stopping.","systemMessage":"Tests are required before this turn can finish."}'
fi
