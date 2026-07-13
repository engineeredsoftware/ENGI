# TLDR — Bitcode ChatGPT App

**What**  
- ChatGPT App MCP server that turns product conversations into living design docs, narrated plans, code-ready actions, and DevOps follow-through—no manual coding required.  
- Operates with ten canonical tools: repository search/web research, design/implementation loops, VCS read/write, provider-specific DevOps read/write (`use_vercel_*`, `use_aws_*`), design asset narration, and agent behaviour updates.

**Why it matters**  
- Keeps `.ai/PRODUCT.md` and `.ai/AGENTS.md` as the single source of truth for intent and collaboration.  
- Demonstrates the complete loop for the Yapper social app MVP in a single ChatGPT thread (see `DEMO.md`).  
- Balances read-only intelligence with confirmation-gated write operations for credibility in developer mode.

**How to run**  
1. `pnpm install` at repo root.  
2. `BITCODE_LOG_STDOUT=0 pnpm --silent --filter @bitcode/chatgptapp start` to expose stdio MCP server without polluting STDIO.  
3. Use MCP Inspector or ChatGPT App developer mode; call `tools/list` to verify the ten identifiers.  
4. Follow the Yapper script to exercise every tool once.

**Key guardrails**  
- Never skip updating `.ai/PRODUCT.md` / `.ai/AGENTS.md` when design or behaviour shifts.  
- Ask for confirmation before any `write_code_changes_to_vcs`, `use_vercel_write_external_mcp`, or `use_aws_write_external_mcp` call, then pass `confirmed: true` so the tool emits a target-bound Bitcode write-admission receipt for the GitHub/Vercel/AWS delivery mechanism.
- Remember that DevOps tools expect `request` + `payload` objects so transcripts stay readable and reproducible.  
- Persist golden prompts and canonical tool descriptions across all docs, demos, and scripts.
