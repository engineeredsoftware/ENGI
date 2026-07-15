#!/usr/bin/env bash
set -euo pipefail

# Repair incomplete multiline PromptPart imports in AssetPack
# prompt owners. Repaired imports use current @bitcode/prompts raw_promptparts
# public subpaths, not removed raw prompt paths.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
agents_dir="$repo_root/packages/pipelines/asset-pack/src/agents"

echo "Fixing multiline PromptPart import patterns under $agents_dir..."

while IFS= read -r file; do
  echo "Processing: $file"

  awk '
    /^import \{[[:space:]]*$/ {
      getline
      next
    }
    /^  PROMPTPART_.*\} from/ {
      if (match($0, /PROMPTPART_[A-Z0-9_]+/)) {
        part = substr($0, RSTART, RLENGTH)
        lower_part = tolower(part)
        gsub(/^promptpart_/, "promptpart_", lower_part)
        print "import { " part " } from '\''@bitcode/prompts/src/raw_promptparts/specific/" lower_part "'\'';"
      }
      next
    }
    { print }
  ' "$file" > "$file.tmp"
  mv "$file.tmp" "$file"
done < <(
  find "$agents_dir" -type f -name "*.ts"
)

remaining=$(
  rg "^import \\{[[:space:]]*$" "$agents_dir" \
    --glob '*.ts' \
    --glob '!node_modules/**' \
    --count-matches || true
)

if [ -n "$remaining" ]; then
  echo "Files with incomplete imports:"
  echo "$remaining"
else
  echo "No incomplete multiline imports found."
fi

echo "Done."
