#!/usr/bin/env bash
set -euo pipefail

# Repair AssetPack prompt imports that were corrupted during old
# prompt-surface migrations. The target state is the public @bitcode/prompts
# carrier plus current raw_promptparts subpaths, never old import namespaces or
# removed raw prompt filesystem paths.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pipeline_dir="$repo_root/packages/pipelines/asset-pack"

echo "Fixing remaining Bitcode prompt import corruption under $pipeline_dir..."

while IFS= read -r file; do
  perl -0pi -e \
    "s/from '\\@bitcode\\/prompts\\/src\\/raw_promptparts\\/generic\\/createpromptpart } from '\\@bitcode\\/prompts';/from '\\@bitcode\\/prompts';/g; \
     s/from '\\@bitcode\\/prompts\\/src\\/raw_promptparts\\/generic\\/prompt } from '\\@bitcode\\/prompts';/from '\\@bitcode\\/prompts';/g; \
     s/.*createpromptpart } from '\\@bitcode\\/prompts';/\\/\\/ Fixed: removed malformed createPromptPart import/g; \
     s/.*prompt } from '\\@bitcode\\/prompts';/\\/\\/ Fixed: removed malformed Prompt import/g" \
    "$file"
done < <(
  find "$pipeline_dir" -type f -name "*.ts"
)

remaining=$(
  rg "} from.*} from" "$pipeline_dir" \
    --glob '*.ts' \
    --glob '!node_modules/**' \
    --count-matches || true
)

if [ -n "$remaining" ]; then
  echo "Remaining double '} from' patterns:"
  echo "$remaining"
else
  echo "No remaining double '} from' patterns found."
fi

echo "Done."
