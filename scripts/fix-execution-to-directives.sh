#!/usr/bin/env bash
set -euo pipefail

# Fix retained try_execution naming to Bitcode try_directives naming.
# Operates only on the active repository tree and current raw PromptPart layout.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
promptparts_dir="$repo_root/packages/prompts/src/raw_promptparts/specific"

echo "Renaming try_execution PromptParts to try_directives under $promptparts_dir..."

find "$promptparts_dir" -name "*_try_execution.ts" | while IFS= read -r file; do
  newname="${file/_try_execution.ts/_try_directives.ts}"
  echo "Renaming: $(basename "$file") -> $(basename "$newname")"
  mv "$file" "$newname"
done

RENAMED_COUNT=$(find "$promptparts_dir" -name "*_try_directives.ts" | wc -l | tr -d ' ')
echo "Renamed $RENAMED_COUNT files"

echo "Updating references in code..."
while IFS= read -r file; do
  echo "Updating: $file"
  perl -0pi -e 's/_TRY_EXECUTION/_TRY_DIRECTIVES/g' "$file"
done < <(
  rg -l "_TRY_EXECUTION" "$repo_root/packages" \
    --glob '*.ts' \
    --glob '*.tsx' \
    --glob '!node_modules/**' || true
)

while IFS= read -r file; do
  echo "Updating lowercase: $file"
  perl -0pi -e 's/_try_execution/_try_directives/g' "$file"
done < <(
  rg -l "_try_execution" "$repo_root/packages" \
    --glob '*.ts' \
    --glob '*.tsx' \
    --glob '!node_modules/**' || true
)

echo "try_execution to try_directives repair complete."
