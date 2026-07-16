#!/usr/bin/env bash
set -u

# Generate a comprehensive Prompts → PromptParts report.
# Output: reports/prompts-by-prompt.md

outdir="reports"
outfile="$outdir/prompts-by-prompt.md"
csvfile="$outdir/prompts-by-prompt.csv"
jsonfile="$outdir/prompts-by-prompt.json"
mkdir -p "$outdir"

echo "# Prompts → PromptParts (Complete Report)" > "$outfile"
echo >> "$outfile"
echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$outfile"
echo >> "$outfile"

# Collect prompt entries (symbol, file, class, origin)
tmp_csv=$(mktemp)
echo "category,file,symbol,class,origin" > "$tmp_csv"

# Pattern A: export const NAME = new Class(
rg -nP "export\\s+const\\s+([A-Za-z0-9_]+)\\s*=\\s*new\\s+([A-Za-z0-9_]+)\\s*\\(" packages \
  -g '!**/node_modules/**' -g '!**/README.md' | \
  sed -E "s#^([^:]+):[0-9]+:.*export const ([A-Za-z0-9_]+) *= *new ([A-Za-z0-9_]+).*#\1,\2,\3,export_const_new#g" | \
  awk -F, '($3 ~ /Prompt$/ || $3 == "Prompt" || $3 ~ /(AgentPrompt|AgentStepPrompt|ToolPrompt|ExecutionPipelinePrompt|ExecutionPrompt|DocCodeToolPrompt)$/) {print $0}' |
  while IFS=, read -r file sym cls origin; do
    category="Unknown"
    case "$file" in
      *generic-tools* ) category="DocCodeTool";;
      *pipelines/asset-pack* ) category="Pipeline";;
      *generic-agents* ) category="GenericAgent";;
      *conversations-generics* ) category="Conversation";;
      *agent-generics* ) category="AgentGenerics";;
      *pipelines-generics* ) category="PipelinesGenerics";;
      *execution-generics* ) category="ExecutionGenerics";;
      *prompts/* ) category="PromptsLib";;
    esac
    echo "$category,$file,$sym,$cls,$origin" >> "$tmp_csv"
  done || true

# Pattern B: export const NAME: Prompt =
rg -nP "export\\s+const\\s+([A-Za-z0-9_]+)\\s*:\\s*Prompt\\s*=" packages \
  -g '!**/node_modules/**' -g '!**/README.md' | \
  sed -E "s#^([^:]+):[0-9]+:.*export const ([A-Za-z0-9_]+).*#\1,\2#g" |
  while IFS=, read -r file sym; do
    # Find first class used in file
    cls=$(rg -oP "new\\s+([A-Za-z0-9_]+)\\s*\\(" -r '$1' "$file" | head -n1 | sed 's/[[:space:]]//g' || true)
    if [[ -z "${cls:-}" ]]; then cls="Prompt"; fi
    category="Unknown"
    case "$file" in
      *generic-tools* ) category="DocCodeTool";;
      *pipelines/asset-pack* ) category="Pipeline";;
      *generic-agents* ) category="GenericAgent";;
      *conversations-generics* ) category="Conversation";;
      *agent-generics* ) category="AgentGenerics";;
      *pipelines-generics* ) category="PipelinesGenerics";;
      *execution-generics* ) category="ExecutionGenerics";;
      *prompts/* ) category="PromptsLib";;
    esac
    echo "$category,$file,$sym,$cls,export_const_typed" >> "$tmp_csv"
  done || true

# Pattern C: export function NAME(...): Prompt
rg -nP "export\\s+function\\s+([A-Za-z0-9_]+)\\([^)]*\\)\\s*:\\s*Prompt\\b" packages \
  -g '!**/node_modules/**' -g '!**/README.md' | \
  sed -E "s#^([^:]+):[0-9]+:.*export function ([A-Za-z0-9_]+)\(.*#\1,\2#g" |
  while IFS=, read -r file sym; do
    cls=$(rg -oP "new\\s+([A-Za-z0-9_]+)\\s*\\(" -r '$1' "$file" | head -n1 | sed 's/[[:space:]]//g' || true)
    if [[ -z "${cls:-}" ]]; then cls="Prompt"; fi
    category="Unknown"
    case "$file" in
      *generic-tools* ) category="DocCodeTool";;
      *pipelines/asset-pack* ) category="Pipeline";;
      *generic-agents* ) category="GenericAgent";;
      *conversations-generics* ) category="Conversation";;
      *agent-generics* ) category="AgentGenerics";;
      *pipelines-generics* ) category="PipelinesGenerics";;
      *execution-generics* ) category="ExecutionGenerics";;
      *prompts/* ) category="PromptsLib";;
    esac
    echo "$category,$file,$sym,$cls,export_function" >> "$tmp_csv"
  done || true

# NOTE: Nested property prompts (e.g., object properties with new AgentStepPrompt)
# Add lightweight entries keyed by class@L<line>. Parts/keys are computed at file-level.
rg -nPo "^[[:space:]]*[A-Za-z0-9_]+[[:space:]]*:[[:space:]]*new[[:space:]]+(AgentStepPrompt|AgentPrompt|ToolPrompt|ExecutionPipelinePrompt|ExecutionPrompt|Prompt)[[:space:]]*\(" packages \
  -g '!**/node_modules/**' -g '!**/README.md' -r '$1' |
  while IFS=: read -r file lineno cls; do
    category="Unknown"
    case "$file" in
      *generic-tools* ) category="DocCodeTool";;
      *pipelines/asset-pack* ) category="Pipeline";;
      *generic-agents* ) category="GenericAgent";;
      *conversations-generics* ) category="Conversation";;
      *agent-generics* ) category="AgentGenerics";;
      *pipelines-generics* ) category="PipelinesGenerics";;
      *execution-generics* ) category="ExecutionGenerics";;
      *prompts/* ) category="PromptsLib";;
    esac
    sym="${cls}@L${lineno}"
    echo "$category,$file,$sym,$cls,nested" >> "$tmp_csv"
  done || true

# Deduplicate by (file,symbol)
entries_file=$(mktemp)
tail -n +2 "$tmp_csv" | awk -F, '!seen[$2 FS $3]++' > "$entries_file"

# Summary Table header
echo "## Summary Table" >> "$outfile"
echo >> "$outfile"
echo "| Prompt | File | Class | Category | #Generic | #Specific | Inline |" >> "$outfile"
echo "|---|---|---|---:|---:|---:|---:|" >> "$outfile"

# CSV header (counts summary)
echo "prompt,file,class,category,generic_count,specific_count,inline_count" > "$csvfile"

# Build details per prompt
while IFS= read -r line; do
  IFS=, read -r category file sym cls origin <<<"$line"

  # Parts
  gparts=$(rg -no "PROMPTPART_GENERIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
  sparts=$(rg -no "PROMPTPART_SPECIFIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
  gcount=$(echo "$gparts" | sed '/^$/d' | wc -l | tr -d ' ')
  scount=$(echo "$sparts" | sed '/^$/d' | wc -l | tr -d ' ')
  # Inline promptparts via literal cast or createPromptPart
  icount=$(( $(rg -n "'[^']+'\\s+as\\s+PromptPart" "$file" | wc -l | tr -d ' ') + $(rg -n "createPromptPart\\(" "$file" | wc -l | tr -d ' ') ))

  # Add summary row
  echo "| \`$sym\` | \`$file\` | \`$cls\` | $category | $gcount | $scount | $icount |" >> "$outfile"
  echo "$sym,$file,$cls,$category,$gcount,$scount,$icount" >> "$csvfile"
done < "$entries_file"

echo >> "$outfile"
echo "## Details By Prompt" >> "$outfile"
echo >> "$outfile"

while IFS= read -r line; do
  IFS=, read -r category file sym cls origin <<<"$line"
  echo "### \`$sym\`" >> "$outfile"
  echo "- File: \`$file\`" >> "$outfile"
  echo "- Class: \`$cls\`" >> "$outfile"
  echo "- Category: $category" >> "$outfile"
  # Keys
  keys=$(rg -noP "\\.set\\('([^']+)'" -r '$1' "$file" | awk -F: '{print $2}' | sort -u || true)
  if [[ -n "${keys// /}" ]]; then
    echo "- Keys: $(echo "$keys" | tr '\n' ',' | sed 's/,$//')" >> "$outfile"
  else
    echo "- Keys: (none)" >> "$outfile"
  fi
  # Generic parts list
  gparts=$(rg -no "PROMPTPART_GENERIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
  if [[ -n "${gparts// /}" ]]; then
    echo "- Generic PromptParts:" >> "$outfile"
    echo "$gparts" | sed 's/^/  - /' >> "$outfile"
  else
    echo "- Generic PromptParts: (none)" >> "$outfile"
  fi
  # Specific parts list
  sparts=$(rg -no "PROMPTPART_SPECIFIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
  if [[ -n "${sparts// /}" ]]; then
    echo "- Specific PromptParts:" >> "$outfile"
    echo "$sparts" | sed 's/^/  - /' >> "$outfile"
  else
    echo "- Specific PromptParts: (none)" >> "$outfile"
  fi
  # Inline prompt parts samples (limit to 3)
  inlines=$(rg -noP "'([^']+)'\\s+as\\s+PromptPart" -r '$1' "$file" | awk -F: '{print $2}' | sed -n '1,3p' || true)
  cparts=$(rg -noP "createPromptPart\\('([^']+)'" -r '$1' "$file" | awk -F: '{print $2}' | sed -n '1,3p' || true)
  if [[ -n "${inlines// /}" || -n "${cparts// /}" ]]; then
    echo "- Inline PromptParts (samples):" >> "$outfile"
    if [[ -n "${inlines// /}" ]]; then echo "$inlines" | sed 's/^/  - /' >> "$outfile"; fi
    if [[ -n "${cparts// /}" ]]; then echo "$cparts" | sed 's/^/  - /' >> "$outfile"; fi
  fi
  echo >> "$outfile"
done < "$entries_file"

echo "Wrote $outfile" >&2

# JSON export from CSV (counts only)
awk -F, 'NR==2{printf "["} NR>1{if (NR>2) printf ","; printf "{\"prompt\":\"%s\",\"file\":\"%s\",\"class\":\"%s\",\"category\":\"%s\",\"generic\":%s,\"specific\":%s,\"inline\":%s}", $1,$2,$3,$4,$5,$6,$7} END{if (NR>1) print "]"; else print "[]"}' "$csvfile" > "$jsonfile"
echo "Wrote $csvfile" >&2
echo "Wrote $jsonfile" >&2

# Category-filtered reports
for cat in DocCodeTool Pipeline GenericAgent; do
  catfile="$outdir/prompts-by-prompt.$cat.md"
  echo "# Prompts → PromptParts ($cat)" > "$catfile"
  echo >> "$catfile"
  echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$catfile"
  echo >> "$catfile"
  echo "## Summary Table ($cat)" >> "$catfile"
  echo >> "$catfile"
  echo "| Prompt | File | Class | Category | #Generic | #Specific | Inline |" >> "$catfile"
  echo "|---|---|---|---:|---:|---:|---:|" >> "$catfile"
  while IFS=, read -r category file sym cls origin; do
    [ "$category" != "$cat" ] && continue
    gparts=$(rg -no "PROMPTPART_GENERIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
    sparts=$(rg -no "PROMPTPART_SPECIFIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
    gcount=$(echo "$gparts" | sed '/^$/d' | wc -l | tr -d ' ')
    scount=$(echo "$sparts" | sed '/^$/d' | wc -l | tr -d ' ')
    icount=$(( $(rg -n "'[^']+'\\s+as\\s+PromptPart" "$file" | wc -l | tr -d ' ') + $(rg -n "createPromptPart\\(" "$file" | wc -l | tr -d ' ') ))
    echo "| \`$sym\` | \`$file\` | \`$cls\` | $category | $gcount | $scount | $icount |" >> "$catfile"
  done < "$entries_file"
  echo >> "$catfile"
  echo "## Details By Prompt ($cat)" >> "$catfile"
  echo >> "$catfile"
  while IFS=, read -r category file sym cls origin; do
    [ "$category" != "$cat" ] && continue
    echo "### \`$sym\`" >> "$catfile"
    echo "- File: \`$file\`" >> "$catfile"
    echo "- Class: \`$cls\`" >> "$catfile"
    echo "- Category: $category" >> "$catfile"
    keys=$(rg -noP "\\.set\\('([^']+)'" -r '$1' "$file" | awk -F: '{print $2}' | sort -u || true)
    if [[ -n "${keys// /}" ]]; then
      echo "- Keys: $(echo "$keys" | tr '\n' ',' | sed 's/,$//')" >> "$catfile"
    else
      echo "- Keys: (none)" >> "$catfile"
    fi
    gparts=$(rg -no "PROMPTPART_GENERIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
    if [[ -n "${gparts// /}" ]]; then
      echo "- Generic PromptParts:" >> "$catfile"
      echo "$gparts" | sed 's/^/  - /' >> "$catfile"
    else
      echo "- Generic PromptParts: (none)" >> "$catfile"
    fi
    sparts=$(rg -no "PROMPTPART_SPECIFIC_[A-Z0-9_]+" "$file" | awk -F: '{print $2}' | sort -u || true)
    if [[ -n "${sparts// /}" ]]; then
      echo "- Specific PromptParts:" >> "$catfile"
      echo "$sparts" | sed 's/^/  - /' >> "$catfile"
    else
      echo "- Specific PromptParts: (none)" >> "$catfile"
    fi
    inlines=$(rg -noP "'([^']+)'\\s+as\\s+PromptPart" -r '$1' "$file" | awk -F: '{print $2}' | sed -n '1,3p' || true)
    cparts=$(rg -noP "createPromptPart\\('([^']+)'" -r '$1' "$file" | awk -F: '{print $2}' | sed -n '1,3p' || true)
    if [[ -n "${inlines// /}" || -n "${cparts// /}" ]]; then
      echo "- Inline PromptParts (samples):" >> "$catfile"
      if [[ -n "${inlines// /}" ]]; then echo "$inlines" | sed 's/^/  - /' >> "$catfile"; fi
      if [[ -n "${cparts// /}" ]]; then echo "$cparts" | sed 's/^/  - /' >> "$catfile"; fi
    fi
    echo >> "$catfile"
  done < "$entries_file"
  echo "Wrote $catfile" >&2
done
