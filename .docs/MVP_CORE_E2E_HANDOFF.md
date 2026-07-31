# MVP core E2E — handoff checklist (crypto / UX agents)

**Owner (core):** APIs, pipelines, DB/depository, host orchestration, settle
**contracts** (receipts, honesty, source-safety).  
**Not owner:** browser chrome, wallet connect UI, BTC rail UX, marketing copy.

## Frozen payload contracts for consumers

| Surface | Core assertion | UX/crypto may rely on |
| --- | --- | --- |
| Deposit options / admit | Source-safe admission report; no protected bodies unpaid | Option cards show measurements honesty + commercial NL |
| `POST /api/depository/index` | Session + assetId; commercial NL + fixtures on document | Index status toast only |
| Read synthesize | Session + Need + repository; Need length only in journal input | Need form + path pickers |
| `POST /api/read/settle/quote` | Needinesses `*-fit` → mock multi-rail quote; no mainnet finality | Quote rail picker UI |
| Packs activity | Source-safe records only (`assertPackActivitySourceSafe`) | Master-detail chrome |
| Spine `runMvpCoreE2eSpine` | CI-fast loop + fail modes | Not for UI |

## Honesty classes (display law)

Absolute rows carry `status`: `measured` | `estimated` | `insufficient_evidence` |
`expanded-fill`. `measureReport.mode`: `deep` | `thin` | `path-only`.  
Path-only must never present as full measured quality.

## Fail-closed modes (core spine)

| `failMode` | Expected |
| --- | --- |
| `none` | Happy path `ok: true` |
| `reject-admission` | `admittedCount=0`, error `no_admitted_options` |
| `empty-needinesses-quote` | Quote fails, error `quote_failed_empty_needinesses` |
| `empty-search-corpus` | `hitCount=0`, error `empty_search_corpus` |

## Test entrypoints

```bash
# L1–L4 + L5 fail matrix (uapi)
pnpm -C apps/uapi exec jest --testPathPattern='mvp-core-e2e|depositoryIndex|readSynthesize|readSettleQuote'

# L2 SDIVF (packages)
pnpm -C packages/asset-packs-pipelines/syntheses/deposit exec jest --testPathPattern=deposit-sdivf
pnpm -C packages/asset-packs-pipelines/syntheses/read exec jest --testPathPattern=read-sdivf
```

## Deposit Discovery budget (STAB-C2)

| Env | Effect |
| --- | --- |
| *(unset)* / `bounded` | Product default: codebase Discovery only; search/regurgitation stubs |
| `BITCODE_DEPOSIT_DISCOVERY_PROFILE=full` | Full three-agent Discovery |
| `BITCODE_DEBUG_FAST_DISCOVERY=0` | Forces full Discovery |

Host seeds `bounded` when unset. Tradeoff: full search costs host budget vs better depository anchors.

## Crypto agent handoff

- Quote `options[]` shape: `payAsset`, `payAmount`, `payAmountDisplay`, advisory only.  
- Settlement finality / wallet observation UI is **out of core spine**.  
- Core guarantees ordered contract fields exist when mock quote succeeds.

## UX agent handoff

- Do not re-fetch full patch bodies for unpaid views; use source-safe projections.  
- Gate 7 mock browser E2E remains UI contract; keep API mock shapes aligned with L1.
