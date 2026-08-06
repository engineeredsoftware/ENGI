#!/usr/bin/env bash
set -euo pipefail

# Update physical storage table references from deliverable_runs to
# deliverable_pipeline_runs. The table names are storage-bound migration
# identifiers; the active Bitcode corridor is AssetPack execution.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Updating deliverable_runs to deliverable_pipeline_runs under $repo_root..."

while IFS= read -r file; do
  echo "Updating: $file"
  perl -0pi -e 's/'\''deliverable_runs'\''/'\''deliverable_pipeline_runs'\''/g; s/"deliverable_runs"/"deliverable_pipeline_runs"/g; s/`deliverable_runs`/`deliverable_pipeline_runs`/g' "$file"
done < <(
  rg -l "deliverable_runs" "$repo_root" \
    --glob '*.ts' \
    --glob '*.tsx' \
    --glob '!node_modules/**' || true
)

echo "Done. Updated matching active TypeScript references to use deliverable_pipeline_runs."
