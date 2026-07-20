# Packs experience (`Packs*`)

Network-scope PackActivity master-detail for `/packs` — aligned with
`/deposits` and `/reads`: compact route header metrics + drill-in main
(table master → select AssetPack → rich detail + Back).

## Master-detail (shared product pattern)

| Route | Master | Detail | Back |
| --- | --- | --- | --- |
| `/packs` | Activity table + compact portfolio strip | Source-safe AP detail grid | Back to Packs |
| `/deposits` | Pipelines table | Source + Obfuscations + options | Back to Deposit |
| `/reads` | Pipelines table | Source + Need + options | Back to Read |

## Layout

```
packs/
  README.md
  models/
    packs-format.ts                    # pure formatters, sort/type/facet catalogs
    packs-activity-types.ts            # API payload types
  PacksPageClient/
    PacksPageClient.tsx                # thin orchestration (shell + drill-in)
    hooks/
      use-packs-activity.ts            # network-scope fetch/refresh
      use-packs-route-params.ts        # URL read/write
  PacksActivityMaster/                 # master chrome: Back + table/filters
  PacksPortfolioStrip/                 # compact positions/signals/filters strip
  PacksActivityFilterBar/
  PacksActivityTable/
  PacksActivityDetail/                 # main + aside layouts for drill-in
  PacksActivityDetailPayout/           # seller BTD/ETH slider + buyer patch summary
  PacksActivityDetailStates/
  PacksActivityDetailAccounting/
  PacksActivityDetailGovernance/
  PacksActivityDetailProofRoots/
  PacksDetailSection/
  PacksStatusPill/
```

## Type filters (ownership + payout)

- **My AssetPacks** / reads bought / deposits unsettled|settled — ownership lenses
- **Needs payout review** — settled rows with `pendingPayout.status === pending-seller-review`
  (escrow still held; seller finalizes BTD% vs pay-asset% on detail)
- Network depository / settled commodity cuts

Page shell: `apps/uapi/app/packs/` (metadata + re-export only).

## Import rules

- Import Bitcode only. Scope is always `network` (never personal pipelines —
  that is `/deposits`).
- Source-safe metadata only; no unpaid AssetPack source content.
- Pure logic → `models/` (`.ts`, no React). Stateful IO → `hooks/`. UI units →
  named directories (`ComponentName/ComponentName.tsx`).
- Shared domain projection (`pack-activity-model`) stays under
  `bitcode/activity/` (cross-route activity model; not packs-only).
