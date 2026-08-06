#!/usr/bin/env bash
set -euo pipefail

# Repair malformed prompt imports left by prompt codemods. Valid
# targets are the public @bitcode/prompts carrier and current raw_promptparts
# public subpaths.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pipeline_dir="$repo_root/packages/pipelines/asset-pack"

echo "Fixing corrupted Bitcode prompt imports under $pipeline_dir..."

while IFS= read -r file; do
  perl -0pi -e \
    "s/import \\{ agentprompt';/import { Prompt } from '\\@bitcode\\/prompts';/g; \
     s/import \\{ promptpart_specific_agent.*';/\\/\\/ Fixed: removed malformed PromptPart import/g; \
     s/\\} from '\\@bitcode\\/prompts\\/src\\/raw_promptparts\\/specific\\/.*\\} from '\\@bitcode.*';/} from '\\@bitcode\\/prompts';/g; \
     s/import \\{ Prompt \\} from '\\@bitcode\\/prompts\\/src\\/raw_promptparts\\/specific\\/prompt';/import { Prompt } from '\\@bitcode\\/prompts';/g; \
     s/import \\{ AgentPrompt \\} from '\\@bitcode\\/prompts\\/src\\/raw_promptparts\\/specific\\/factoryagentwithptrr \\} from '\\@bitcode\\/agent-generics';/\\/\\/ Fixed: removed malformed AgentPrompt import/g; \
     s/import \\{ PROMPTPART.*\\} from '\\@bitcode\\/prompts\\/src\\/raw_promptparts\\/specific\\/agentstepprompt \\} from '\\@bitcode\\/agent-generics';/\\/\\/ Fixed: removed malformed PROMPTPART import/g" \
    "$file"

  perl -0pi -e \
    "/import \\{ promptpart \\} from '\\@bitcode\\/prompts';/d; \
     /import \\{ gettoolsforagent \\} from/d" \
    "$file"
done < <(
  find "$pipeline_dir" -type f -name "*.ts"
)

echo "Checking for remaining malformed imports..."
rg "agentprompt'|} from.*} from|promptpart } from" "$pipeline_dir" \
  --glob '*.ts' \
  --glob '!node_modules/**' \
  --max-count 5 || echo "No malformed import patterns found."

echo "Fix script completed."
