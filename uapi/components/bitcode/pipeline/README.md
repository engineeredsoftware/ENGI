# Bitcode pipeline layer

Shared pipeline master-detail UI and models for Deposits, Reads, Packs.

| Area | Contents |
| --- | --- |
| `models/` | run data, activity history, selection query, readiness, transactions |
| `cards/` | Workspace / action workbench cards |
| `*.tsx` / log / tables | Former `execution/` UI carriers (Phase 2 rename) |
| `BitcodePipelinesTable.tsx` | Product master table wrapper |
| `pipeline-harness-client.ts` | Asset-pack harness client |
| `shell-reading.ts` | Section jump helpers |

Import from `@/components/bitcode/pipeline/...` — not `execution/`.
