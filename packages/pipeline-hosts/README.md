# `@bitcode/pipeline-hosts`

This package owns host-runtime adapters for Bitcode pipeline QA. The first
adapter is the Vercel Sandbox harness used to prove that Read/Fit and
AssetPack pipeline work is running in an isolated host, emitting artifacts, and
leaving enough telemetry for SQL readback.

## Vercel Sandbox Host Capabilities

- Firecracker microVM isolation on Amazon Linux 2023.
- Default working directory: `/vercel/sandbox`.
- Default runtime: `node24`; documented runtime options are `node26`,
  `node24`, `node22`, and `python3.13`.
- The sandbox user is `vercel-sandbox` and can use `sudo`.
- Filesystem state is ephemeral. Evidence must be exported before stop, then
  persisted to Bitcode storage or database projections.
- Command output, file upload/download, exposed ports, network policies, and
  snapshots are part of the host contract.
- Auth is through Vercel OIDC tokens from `vercel link && vercel env pull`, or
  through access-token variables for non-Vercel hosts.

## Harness Modes

`host_smoke` verifies the host lifecycle only. It creates a sandbox, writes a
manifest and runner, executes Node, writes `evidence.json` and
`telemetry.jsonl`, exports them, then stops the sandbox. The result is always
`blocked_readiness` because the AssetPack pipeline was not invoked.

`asset_pack_pipeline` clones or mounts a repository source, installs workspace
dependencies, builds a manifest depository asset from the pinned Deposit and
source revision, and runs the AssetPack pipeline runner in the sandbox. It still
requires SQL readback before any `worthy_fit`, settlement, range, BTC fee, or
ledger finality claim is admissible. If the operator has already
verified proof and measurement posture for the manifest Deposit, set
`BITCODE_SANDBOX_DEPOSIT_HAS_PROOF=1` and
`BITCODE_SANDBOX_DEPOSIT_HAS_MEASUREMENT=1`; otherwise the pipeline should
return `blocked_readiness` rather than a worthy fit.
The exported evidence must include the AssetPack embedding policy
(`text-embedding-3-small`, `1536` dimensions, cosine
`match_deliverable_vectors`) so SQL readback can detect vector-space drift.
The harness prepares the repo-pinned `pnpm` runtime before installing so
Corepack's latest release cannot drift the frozen lockfile contract. Runtime
helpers used only by the harness are installed under `.bitcode/pipeline-harness`
so historical deposited source revisions do not need to carry newer harness
dependencies.

The harness manifest includes the staged Reading boundary. The active stage
sequence begins with Need synthesis, Need review, and Need-Fit search before
candidate ranking and AssetPack synthesis. The live runner synthesizes a
typed `bitcode.read.need` object from the Read request, source revision, and
Deposit context, accepts it for the current harness invocation, and passes it
to the AssetPack pipeline as `acceptedReadNeed` with
`requireAcceptedReadNeed=true`. Product routes that already have a user-reviewed
Need should pass that accepted object directly; if strict Need-Fit execution is
requested without an accepted Need, candidate recall must return
`blocked_readiness` before searching the depository.

Structured database telemetry is part of the harness contract. A real Read/Fit
pipeline run must write the deliverable hierarchy:
`deliverable_pipeline_runs`, `deliverable_pipeline_events`,
`deliverable_pipeline_phase_delegations`,
`deliverable_pipeline_agent_steps`, `deliverable_pipeline_generations`, and
`deliverable_pipeline_tool_executions`. Generation rows should retain the
interpolated model messages when available, raw and parsed output, model
identity, token usage, and phase/agent/step context.
Tool rows are required when PTRR agents request evidence tools. The AssetPack
pipeline registers `bitcode.asset-pack.verification` as an evidence-only
verification readback tool for risk-admission and readiness work; a live
`Tool not found` result for that tool is a registry failure, not acceptable
blocked-readiness evidence. Tool-result events must carry summarized input
and output/error so the database row and Terminal stream can show what the
agent asked and what the tool returned. Stored `tools/*` status results from
finish delivery are tool executions too; branch creation, file writes, and
pull-request creation must land in the same structured table as explicit
`tool-use` events. Artifact telemetry must preserve tool name, ok/error state,
and input/output/error presence so the execution log can identify each
phase-agent-step tool invocation.
Failed runs must still export `evidence.json` with the execution tree and
last-known stream events so staging operators can see which SDIVF phase, PTRR
agent, generation, or tool last produced input/output evidence.
The runner subscribes to stream events for artifact telemetry even when database
streaming is disabled; database streaming adds persistence, not basic event
visibility.
While the pipeline command runs detached, the host polls `telemetry.jsonl` and
emits each new line as a `telemetry-artifact-event` so Terminal can show
sandbox id, run id, phase, agent, generation/tool, parsed-output, and failsafe
context before final artifact readback. Browser Network logs are not the
operator interface for live Read/Fit debugging.
The live runner also enforces `BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS`
(default `240000`) inside the sandbox so a heavyweight pipeline run records a
blocked-readiness artifact before the calling Vercel Function or local harness
process reaches its own timeout.
`BITCODE_PIPELINE_HARNESS_CHECKPOINT_INTERVAL_MS` defaults to `2000` so the
exported telemetry artifact stays close enough to the live runner for SSE
tailing without writing on every internal event.

For live model execution, the sandbox runner also needs `OPENAI_API_KEY` in the
trusted command environment. For local Vercel Sandbox creation, either pull
`VERCEL_OIDC_TOKEN` with `vercel link && vercel env pull`, or provide the access
token tuple `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and `VERCEL_PROJECT_ID`. Deployed
Vercel code should use automatic OIDC rather than storing a Vercel token when
possible.
Pull-request delivery normally uses the authenticated user's stored GitHub App
connection. GitHub installation tokens are short lived; if staging readback
shows the stored token has expired and the local harness is intentionally using
a trusted operator token, set `BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK=1` and pass
`GITHUB_TOKEN` only through `BITCODE_SANDBOX_ENV_KEYS=GITHUB_TOKEN`. The VCS
tools read that token from process environment and do not include it in tool
inputs, artifact telemetry, or database stream rows.
Staging-testnet Read/Fit QA must also set
`BITCODE_ASSET_PACK_REAL_INFERENCE=1`. On the deployed streaming route,
`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded` is the expected profile:
setup, synthesis, validation, and finish stay model-backed, while deterministic
source-bound discovery evidence preserves enough budget to ship and read back
the AssetPack. `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=full` is scoped to a
later async completion gate: the sandbox may run for dozens of minutes, but it
must push final result state and artifacts to a server-side stream/socket
handler or durable queue rather than relying on the starter route to wait
synchronously. That push must be correlated by `BITCODE_PIPELINE_RUN_ID`,
authenticated without leaking secrets in routine telemetry, idempotent across
retries, and durable before sandbox stop. The current deployed Terminal route
rejects `full` preflight.
The deployed route assigns `BITCODE_PIPELINE_RUN_ID` before sandbox creation and
echoes that id through each SSE event so Terminal can display a stable run id
before telemetry artifacts are written.
Local application deployments use the same route, stream, and harness code
without deploying to Vercel. To make local route QA as strict as staging, set
`BITCODE_PIPELINE_HARNESS_REQUIRE_REAL_INFERENCE=1` alongside
`BITCODE_ASSET_PACK_REAL_INFERENCE=1`,
`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`, OpenAI credentials,
aligned staging-testnet Supabase admin credentials, and Vercel Sandbox local
auth.
The UAPI `dev:staging` script now sets those strict route flags and loads
`../.env.local` through `BITCODE_UAPI_ENV_FILE`, so the root staging-testnet env
pulled from the branch-scoped Vercel project can override placeholder
`uapi/.env.local` values without copying secrets.
Without the explicit local strict flag, ordinary `next dev` may inspect UI and
route wiring, but it is not admissible Read/Fit closure evidence.
After a clean deployed run, verify the staging-testnet database and ledger
readback with
`pnpm qa:v28:pipeline-readback -- --env-file .env.local --expected-host tkpyosihuouusyaxtbau.supabase.co`.
The verifier emits sanitized counts and V28 blockers without printing secrets.
DB readback is latest-run coherent: aggregate telemetry counts are not enough
when the newest deliverable run failed or lacks its own tool rows.
The phase-specific
`BITCODE_ASSET_PACK_*_USE_PTRR=1` flags remain available for local bisection,
but they are not sufficient as a staging posture because a missed flag silently
turns part of the run back into deterministic evidence.
`BITCODE_LLM_PROVIDER` and `BITCODE_LLM_MODEL` may pin the generation model.
When they are absent, the runtime chooses OpenAI if `OPENAI_API_KEY`
is the only model credential present. A provider pin is forwarded only when the
matching provider credential is also forwarded; stale pins without credentials
are stripped so staging does not silently require an unavailable model service.
Database streaming requires a real Supabase URL/admin key pair for the same
accepted lane. V28 staging-testnet uses
`https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/` for the Data API and
`db.tkpyosihuouusyaxtbau.supabase.co` for DB readback; production-mainnet uses a
separate Supabase project and is not accepted V28 staging evidence.
Placeholder values, production-mainnet refs in staging mode, or anon keys in
admin slots fail preflight before a sandbox is created.
Vercel preview environment variables should therefore be scoped by branch:
staging-testnet previews carry the `tkpyosihuouusyaxtbau` REST/admin/DB values,
while production-mainnet carries `rinalyjfecxnmyczrpzo`. The harness route
probes admin-shaped Supabase credentials against the active Data API and passes
only an accepted key into the sandbox.
When the recorded Deposit activity has wallet/attestation proof and asset
measurement posture but no explicit proof root fields, the harness materializes
deterministic manifest-bound proof, measurement, and reconciliation roots from
the Deposit id, AssetPack id, Read id, repository, branch, and commit. Those
roots let the Read/Fit pipeline evaluate a proof-bearing deposited candidate,
but they do not by themselves claim BTC fee broadcast, BTD minting, or external
ledger finality.
The deployed streaming route declares an 800 second Vercel Function window; keep
`BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS` at or below `600000` there so the
route still has time to collect and stream the blocked-readiness artifact if the
sandbox budget expires. Local CLI harness runs can use a larger sandbox budget
when the calling process is not the limiting host. On deployed/runtime
production, the route preflight-fails without
`BITCODE_ASSET_PACK_REAL_INFERENCE=1`, without `OPENAI_API_KEY`, or with a
larger harness runtime budget.

## Live QA

### Local application deployment

For the current no-deploy pass, start the Terminal locally and keep the
real-inference route gate enabled:

```bash
pnpm -C uapi dev:staging -- --port 3010
```

The local process must have `OPENAI_API_KEY`, aligned Supabase URL/admin-key
credentials, and either `VERCEL_OIDC_TOKEN` from `vercel link && vercel env pull`
or the access-token tuple used by `@vercel/sandbox`. `SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_DB_URL` / `DATABASE_URL`, when both are
present, must resolve to the same Supabase project; otherwise the route and dev
harness fail before sandbox creation so a run cannot write to one project and
verify another. This command is a local application deployment only; it must not
be counted as clean live settlement evidence until the resulting database and
ledger rows pass SQL readback for the accepted environment.

Link a Vercel project and pull local OIDC credentials:

```bash
vercel link
vercel env pull
```

Run the low-cost host smoke:

```bash
BITCODE_RUN_VERCEL_SANDBOX_HARNESS=1 \
BITCODE_SANDBOX_MODE=host_smoke \
BITCODE_SANDBOX_REPOSITORY=engineeredsoftware/ENGI \
BITCODE_SANDBOX_SOURCE_BRANCH=main \
BITCODE_SANDBOX_SOURCE_COMMIT=31bbc0c5227b6b3aed5d107fd8507d35ec22970a \
pnpm -C packages/pipeline-hosts run qa:asset-pack:sandbox
```

Run the repository pipeline path after source access and credentials are ready:

```bash
BITCODE_RUN_VERCEL_SANDBOX_HARNESS=1 \
BITCODE_SANDBOX_MODE=asset_pack_pipeline \
BITCODE_SANDBOX_SOURCE_GIT_URL=https://github.com/engineeredsoftware/ENGI.git \
BITCODE_SANDBOX_SOURCE_BRANCH=main \
BITCODE_SANDBOX_SOURCE_COMMIT=31bbc0c5227b6b3aed5d107fd8507d35ec22970a \
BITCODE_SANDBOX_SOURCE_REVISION=31bbc0c5227b6b3aed5d107fd8507d35ec22970a \
BITCODE_SANDBOX_DEPOSIT_HAS_PROOF=1 \
BITCODE_SANDBOX_DEPOSIT_HAS_MEASUREMENT=1 \
BITCODE_ASSET_PACK_REAL_INFERENCE=1 \
BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded \
BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK=1 \
BITCODE_SANDBOX_ENV_KEYS=GITHUB_TOKEN \
BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS=600000 \
pnpm -C packages/pipeline-hosts run qa:asset-pack:sandbox
```

When validating local harness changes before the pinned source revision has been
promoted, add `BITCODE_SANDBOX_APPLY_LOCAL_PATCH=1`. The runner uploads
`git diff --binary $BITCODE_SANDBOX_SOURCE_REVISION` as a source overlay and
applies it before dependency installation. Overlay runs are QA-only: evidence records
`sourceOverlay.admissibility=qa-only-not-source-revision-evidence`,
and the harness must not be used as settlement or source-revision finality
evidence until the same changes exist at the deposited revision.

On a deployed Vercel preview/staging runtime, trigger the same harness through
the authenticated streaming route so the server can use Vercel's automatic
Sandbox OIDC. The route also reuses the authenticated user's GitHub installation
token for private repository clone credentials when no explicit source token is
configured:

```bash
curl -N "$BITCODE_UAPI_URL/api/pipeline-harness/asset-pack" \
  -H "Content-Type: application/json" \
  -H "Cookie: $BITCODE_STAGING_SESSION_COOKIE" \
  --data '{
    "repositoryFullName": "engineeredsoftware/ENGI",
    "sourceBranch": "main",
    "sourceCommit": "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
    "sourceGitUrl": "https://github.com/engineeredsoftware/ENGI.git",
    "readId": "1c4f1f50-ac8b-4d83-8d2d-dc9c96d238b0",
    "depositId": "3f68d845-d910-41ef-835a-89cf0103ac0a",
    "depositAssetId": "asset_repository-revision-deposit-engineeredsoftware-engi_aece31322e",
    "depositHasWalletOrAttestationProof": true,
    "depositHasAssetMeasurementEvidence": true
  }'
```

After the run, execute:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 \
  -f supabase/queries/v28_qa_terminal_07_pipeline_harness_after_fit.sql
```

The harness is not reviewable until this query reports pipeline
run/event/phase/agent/generation/tool visibility rather than a blocker state.

Only pass secrets through `BITCODE_SANDBOX_ENV_KEYS` when the sandbox code path
is trusted and its network policy is understood. Prefer credential brokering or
strict allowlists before running untrusted generated code.
