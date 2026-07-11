# Bitcode pipeline shared UI and models

Shared pipeline master-detail machinery used by Deposits, Reads, Packs, and
Auxillaries.

| Path | Role |
| --- | --- |
| `BitcodePipelinesTable.tsx` | Filtered/paginated run table wrapper |
| `models/pipeline-run-data.ts` | `WorkspaceRun` + mock fixtures |
| `models/pipeline-run-activity.ts` | Stream/mock activity snapshots |
| `models/pipeline-transactions.ts` | Normalize/filter transaction records |
| `models/transaction-readiness.ts` | Wallet/repo readiness gates |
| `models/repository-context.ts` | Repository inventory/selection |

Product experiences import from here — not from `app/terminal/`. Terminal paths
remain temporary shims until eradication completes.
