# Bitcode API Notes

Status: non-canonical internal note. API requirements are canonical only when promoted into the active SPEC/proof family or the explicitly opened draft-target family.

## API Role

The Bitcode API is the server-owned admission layer for Bitcode Exchange state. It must not be a collection of route-local product interpretations.

API surfaces must:
- bind identity, wallet/readiness, and repository scope,
- accept source and attachment evidence,
- expose measured Read review,
- fail closed before fit search when Read review rejects or requests remeasurement,
- write DataPack, proof, and settlement outputs,
- stream execution state to product and admitted interfaces,
- support MCP and ChatGPT-style connected interfaces without letting those interfaces own Exchange state.

## Active commercial interface families (`apps/uapi`)

Current product Next API families (not exhaustive):
- `/api/deposit/*` — deposit synthesis and demand estimate (product Deposits)
- `/api/read-review` — Read-Need synthesis / accept / reject (product Reads)
- `/api/read/*` — read settlement and option synthesis
- `/api/packs/*` — pack activity
- `/api/btd/*` — BTD journal, registry, settlement-adjacent handlers (`@bitcode/api/btd`)
- `/api/conversations/*`
- `/api/executions/*`
- `/api/vcs/*`
- `/api/auxillaries/*`
- `/api/wallet/*`
- package API route owners under `packages/api/src/routes/*`

## Removed protocol-demo host residue

The following commercial Next shims that once mirrored the specifying standalone
host are **deleted** and must not be reintroduced on `apps/uapi`:

- `/api/state`
- `/api/reset`
- `/api/deposits` (plural host create — product uses `/api/deposit/*`)
- `/api/make-bitcode-branch`
- `/api/external-realization`
- `/api/executors/*`
- `lib/bitcode-app-context*` (createAppContext bridge)

Those surfaces, if needed at all, belong only under `scripts/specifying` (repo
metadevelopment), never in the Vercel product graph.

## Execution and DataPack Routes

The current execution route corridor uses `agentic-execution:asset-pack` for DataPack execution.

Route behavior must preserve:
- typed input normalization,
- source/repository binding,
- execution id and correlation id storage,
- SSE events for product reread,
- Read-measurement evidence admission,
- DataPack written-asset snapshots,
- Finish result summaries and delivery evidence.

## Read Review Boundary

`/api/read-review` is the commercial pre-fit Read-Need admission boundary:
- `POST` with `action=synthesize_read_need` | `resynthesize_read_need` | `accept_read_need` | `reject_read_need`.
- Legacy protocol-demo GET/scenario review and specifying `reviewRead` fallbacks are removed.
