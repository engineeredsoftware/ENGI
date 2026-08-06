#!/usr/bin/env bash
set -euo pipefail

# Normalize retained PromptPart imports after prompt-surface migrations. This
# script only scans active source and rewrites toward Bitcode-owned prompt
# carriers; it does not target old import namespaces or removed raw prompt trees.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Scanning active packages for retained @bitcode/prompts barrel import repair..."

while IFS= read -r file; do
  echo "Processing: $file"

  # Collapse accidental raw_promptparts barrel reach-throughs back to the public
  # @bitcode/prompts boundary. Narrow raw_promptparts subpaths are kept where
  # files already import individual PromptPart assets directly.
  perl -0pi -e \
    "s/from '\\@bitcode\\/prompts\\/raw_promptparts\\/(generic|specific)'/from '\\@bitcode\\/prompts'/g; \
     s/from \"\\@bitcode\\/prompts\\/raw_promptparts\\/(generic|specific)\"/from \"\\@bitcode\\/prompts\"/g" \
    "$file"
done < <(
  rg -l "@bitcode/prompts/raw_promptparts/(generic|specific)" "$repo_root/packages" \
    --glob '*.ts' \
    --glob '*.tsx' \
    --glob '!node_modules/**' || true
)

echo "Done fixing retained prompt barrel imports."
