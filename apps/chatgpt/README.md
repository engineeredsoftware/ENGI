# @bitcode/external-apps-chatgpt

> Path: `apps/chatgpt`

Bitcode’s ChatGPT App MCP package lets product-minded builders participate in the Bitcode source-to-shares loop without touching a code editor. Inside a single ChatGPT thread, Bitcode captures intent, keeps Evidence Documents truthful, narrates repository behaviour in plain language, drafts implementation moves, and coordinates GitHub plus DevOps delivery mechanisms only after explicit confirmation.

> Docs live alongside the package for consistency. Use this README for positioning + tool catalog, skim `TLDR.md` to get oriented in under a minute, check `TODO.md` for the active backlog, and follow `DEMO.md` to rehearse the Yapper launch video.

## Product framing

- **Audience** – Semi-technical builders (founders, product leads, architects) who can articulate intent but prefer AI to execute.
- **Promise** – “Design software conversationally, let Bitcode deliver the connected-interface artifacts.” Every artifact lives in `.docs/PRODUCT.md`, `.docs/AGENTS.md`, committed code, or a write-admission receipt with attribution and history.
- **Relationship to Codex** – Codex remains the editing IDE for expert engineers. Bitcode owns the design-first loop, keeps state synchronised, and triggers write operations with explicit confirmation.
- **Evidence Documents** – Templates for `.docs/PRODUCT.md` and `.docs/AGENTS.md` ship inside `src/tools.ts`; sessions create and evolve them via the `design_code`, `code_design`, and `improve_developing_behavior` tools.

## Why Bitcode (landing narrative)

The pre-launch landing page and demo video revolve around three promises:

1. **Design-first control** – Capture every requirement as you talk. Bitcode turns them into structured updates inside `.docs/PRODUCT.md`, so intent stays visible and portable.
2. **Explain-before-you-edit** – Before any code changes land, Bitcode narrates the relevant files, drafts a plan, and shows diff-ready stubs. You steer scope; Bitcode handles detail.
3. **Deliver with receipts** – GitHub repository/file delivery, Vercel deploys, and AWS tweaks only happen with `confirmed: true`; each write returns a target-bound Bitcode write-admission receipt and every decision is mirrored into `.docs/AGENTS.md` for future sessions.

The headline: *“Design your app in chat. Bitcode keeps the documents honest, drafts the code, and delivers connected-interface artifacts when you say go.”*

## Local dev workflow

```bash
# install dependencies (workspace root)
pnpm install

# start Bitcode MCP server (logs muted for inspector)
BITCODE_LOG_STDOUT=0 pnpm --silent --filter @bitcode/external-apps-chatgpt start

# optional: hot reload during development
pnpm --filter @bitcode/external-apps-chatgpt dev
```

> Environment variables in `.env` / `.env.local` files (repo root or any parent directory) are auto-loaded before tools initialise, so flags like `BITCODE_MOCK_EXA=true` take effect without exporting them manually.

## Using the MCP Inspector

1. **Start the server** in one terminal:
 ```bash
 BITCODE_LOG_STDOUT=0 pnpm --silent --filter @bitcode/external-apps-chatgpt start
 ```
2. **Launch the inspector UI** in another terminal:
 ```bash
 pnpm exec mcp-inspector
 ```
 This prints a session token and opens http://localhost:6274 with the token pre-filled.
3. If the STDIO panel shows an old command (e.g. `--stdio-command`), clear the inspector’s cached config:
 - Browser DevTools → `localStorage.clear()` + reload; or use the gear icon → “Clear STDIO configuration”.
4. Connect via STDIO:
 - Command: `pnpm`
 - Arguments: `--silent`, `--filter=@bitcode/external-apps-chatgpt`, `start`
 - Environment: `BITCODE_LOG_STDOUT=0`
 - Click **Connect** (optionally tick “Remember”).

The `tools/list` call should display the canonical Bitcode identifiers below with no retired product prefix.

## Canonical tools

| Tool | Purpose | Example prompt | Notes |
| --- | --- | --- | --- |
| `answer_codebase_query` | Run high-signal repository searches and answer targeted questions. | “Bitcode, where do we validate Yapper posts before save?” | Returns newline-delimited hits plus structured metadata. |
| `answer_codeweb_query` | Research external references, examples, or docs. | “Bitcode, find guidance on building optimistic UI timelines.” | Defaults to Exa search; honours `BITCODE_MOCK_EXA`. |
| `depict_design_asset` | Describe screenshots/diagrams for later recall. | “Bitcode, narrate this wireframe—focus on onboarding.” | Accepts base64 assets, optional focus and notes. |
| `design_code` | Update `.docs/PRODUCT.md` from conversational ideas. | “Bitcode, add a flow for muting noisy Yapper feeds.” | Creates the doc if missing, appends a `### Proposed Updates` block; digester removed; uses `currentProductMd` or the PRODUCT.md template. |
| `code_design` | Translate design updates into actionable implementation steps. | “Bitcode, draft the edits to implement the mute-feed feature.” | Emits task bullets and patch stubs for targeted files. |
| `read_code_changes_from_vcs` | Summarise recent GitHub activity for a repo/branch. | “Bitcode, what shipped on `main` over the last five commits?” | Requires repo-scoped token; outputs author-tagged lines. |
| `write_code_changes_to_vcs` | Create repositories or push file updates. | “Bitcode, commit the generated Yapper seed data to `main`.” | Requires `confirmed: true`; returns a Bitcode write-admission receipt before GitHub delivery. |
| `improve_developing_behavior` | Capture collaboration learnings in `.docs/AGENTS.md`. | “Bitcode, note that we always reference file paths with line numbers.” | Returns both the delta block and the latest agent doc; digester removed; uses `currentAgentsMd` or the AGENTS.md template. |
| `use_vercel_read_external_mcp` | Narrate Vercel teams, projects, deployments, or docs. | “Bitcode, list deployments for Yapper and flag the prod URL.” | Payload: `request` (e.g. `list_deployments`) + `payload` (tool args). |
| `use_vercel_write_external_mcp` | Demo Vercel mutations (deploy, domains) with believable fixtures. | “Bitcode, kick off a fresh preview deploy—confirm with me first.” | Requires `confirmed: true`; treats Vercel as a connected-interface delivery mechanism, not Exchange state. |
| `use_aws_read_external_mcp` | Run AWS health checks (Lambda invoke, S3/Dynamo reads, CloudWatch logs). | “Bitcode, run the `yap-transcribe` lambda and share the response.” | Payload: `request` (e.g. `lambda.invoke`) + `payload` (CLI-style args). |
| `use_aws_write_external_mcp` | Apply scoped AWS writes with confirmation (S3 uploads, Dynamo inserts). | “Bitcode, upload the Yapper demo config to S3—confirm first.” | Requires `confirmed: true`; emits a write-admission receipt and nudges users to document the impact in PRODUCT.md. |

Refer to `TLDR.md` for a quick-start checklist and `TODO.md` for the active backlog.

## Protocol/BTD interface integration

The ChatGPT App consumes the shared
`@bitcode/btd/interface-integration-contract` surface through
`src/interface-integration.ts`. That record is source-safe and states that
ChatGPT write carriers reuse package-owned read-access, organization-authority,
and Protocol telemetry objects rather than copying BTD policy locally. The
record is regression evidence for the same connected-interface contract the
product and API expose.

V35 additionally binds ChatGPT App tool metadata to
`TelemetryDocumentationInterfaceIntegration` and the source-safe generated
artifact `.proofs/v35/telemetry-documentation-interface-integration.json`.
Tool results may include event ids, proof roots, docs links, runbook links,
redaction posture, correlation ids, and safe state labels so a ChatGPT thread
can hand the operator back to product, docs, or a runbook without leaking
source. Tool results must not include protected source, secret values,
provider tokens, wallet private material, raw protected prompts, raw protected
model responses with source, or unpaid AssetPack source.

## Prompt playbook

**Golden prompts**

1. “Bitcode, I’d like to create a new application repository for [purpose].”
2. “Bitcode, I’d like to update my application’s software to add [feature].”
3. “Bitcode, I read to fix a bug—the errors I’m seeing are […].”
4. “Bitcode, I want my application to do [expected] but I’m seeing [actual]; what might be causing it?”
5. “Bitcode, I read to learn about [component] of the codebase—summarise it for me.”
6. “Bitcode, use [third-party DevOps tool] to [action].”

**Indirect prompts**

1. “How is our base Button React component implemented?”
2. “We’re tracing a regression but can’t find the cause—where should we look?”
3. “I’m unfamiliar with this code…”
4. “Let’s build more of our software!”
5. “I want to build an app.”

**Negative prompts** (decline gracefully)

- “Let’s talk about favorite ice cream flavors.”
- “What is the weather today?”
- “Tell me about history, geography, or art.”
- “I don’t have a codebase and I don’t want to work with software.”

## AI document support

- `design_code` seeds or evolves `.docs/PRODUCT.md` using design-first bullet updates.
- `code_design` converts those updates into numbered tasks plus patch scaffolds ready for review.
- `improve_developing_behavior` keeps `.docs/AGENTS.md` aligned with how we prefer to work.

All templates live in `src/tools.ts` so new sessions can bootstrap immediately.

## Demo and script

- See `DEMO.md` for the full Yapper walkthrough (user turn, Bitcode reasoning summary, tool invocation, and representative output).
- The script exercises each tool exactly once so the recording captures the full capability surface.

## QA checklist

1. **MCP Inspector**
 - Start the server: `BITCODE_LOG_STDOUT=0 pnpm --silent --filter @bitcode/external-apps-chatgpt start`.
 - Launch the inspector: `pnpm exec mcp-inspector`.
 - Clear cached STDIO config if necessary.
 - Call every tool with sample payloads to validate schema + output shapes.
2. **ChatGPT (Apps SDK developer mode)**
 - Install the Bitcode MCP pointing to the local server.
 - Follow the `DEMO.md` script verbatim; confirm each tool responds as expected.
 - Ensure confirmation prompts fire and payloads include `confirmed: true` for `write_code_changes_to_vcs`, `use_vercel_write_external_mcp`, and `use_aws_write_external_mcp`.
3. **App metadata review**
 - Align App Store copy and screenshots with the tool list above.
 - Verify environment variables (`EXA_API_KEY`, AWS creds, GitHub tokens) before filming.
