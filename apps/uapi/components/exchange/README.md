# Exchange experience (`Exchange*`)

Network-scope PackActivity master-detail for `/exchange` — aligned with
`/deposits` and `/reads`: compact route header metrics + drill-in main
(table master → select AssetPack → rich detail + Back).

## Master-detail (shared product pattern)

| Route | Master | Detail | Back |
| --- | --- | --- | --- |
| `/exchange` | Activity table + compact portfolio strip | Source-safe AP detail grid | Back to Exchange |
| `/deposits` | Pipelines table | Source + Obfuscations + options | Back to Deposit |
| `/reads` | Pipelines table | Source + Need + options | Back to Read |

## Layout

```
exchange/
  README.md
  models/
    exchange-format.ts                    # pure formatters, sort/type/facet catalogs
    exchange-activity-types.ts            # API payload types
  ExchangePageClient/
    ExchangePageClient.tsx                # thin orchestration (shell + drill-in)
    hooks/
      use-exchange-activity.ts            # network-scope fetch/refresh
      use-exchange-route-params.ts        # URL read/write
  ExchangeActivityMaster/                 # master chrome: Back + table/filters
  ExchangePortfolioStrip/                 # compact positions/signals/filters strip
  ExchangeActivityFilterBar/
  ExchangeActivityTable/
  ExchangeActivityDetail/                 # main + aside layouts for drill-in
  ExchangeActivityDetailPayout/           # seller BTD/ETH slider + buyer patch summary
  ExchangeActivityDetailStates/
  ExchangeActivityDetailAccounting/
  ExchangeActivityDetailGovernance/
  ExchangeActivityDetailProofRoots/
  ExchangeDetailSection/
  ExchangeStatusPill/
```

## Type filters (ownership + payout)

- **My DataExchange** / reads bought / deposits unsettled|settled — ownership lenses
- **Needs payout review** — settled rows with `pendingPayout.status === pending-seller-review`
  (escrow still held; seller finalizes BTD% vs pay-asset% on detail)
- Network depository / settled commodity cuts

Page shell: `apps/uapi/app/exchange/` (metadata + re-export only).

## Import rules

- Import Bitcode only. Scope is always `network` (never personal pipelines —
  that is `/deposits`).
- Source-safe metadata only; no unpaid AssetPack source content.
- Pure logic → `models/` (`.ts`, no React). Stateful IO → `hooks/`. UI units →
  named directories (`ComponentName/ComponentName.tsx`).
- Shared domain projection (`pack-activity-model`) stays under
  `bitcode/activity/` (cross-route activity model; not packs-only).
