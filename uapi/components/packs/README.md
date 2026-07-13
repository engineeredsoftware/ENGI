# Packs experience (`Packs*`)

Network-scope PackActivity master-detail for `/packs`: portfolio positions,
market intelligence, searchable activity grid, and source-safe detail
(settlement, rights, compensation, delivery, repair, proof roots).

## Layout

```
packs/
  README.md
  models/
    packs-format.ts                    # pure formatters, sort/type/facet catalogs
    packs-activity-types.ts            # API payload types
  PacksPageClient/
    PacksPageClient.tsx                # thin orchestration (shell + sections)
    hooks/
      use-packs-activity.ts            # network-scope fetch/refresh
      use-packs-route-params.ts        # URL read/write
  PacksPortfolioOverview/
    PacksPortfolioOverview.tsx         # positions + market signals
  PacksActivityMaster/
    PacksActivityMaster.tsx            # master shell: filters + table + totals
  PacksActivityFilterBar/
    PacksActivityFilterBar.tsx         # keyboard hint, search/sort, facets
  PacksActivityTable/
    PacksActivityTable.tsx             # activity data grid + row states
  PacksActivityDetail/
    PacksActivityDetail.tsx            # detail aside shell (overview/measurements)
  PacksActivityDetailStates/
    PacksActivityDetailStates.tsx      # state readback + repair surface
  PacksActivityDetailAccounting/
    PacksActivityDetailAccounting.tsx  # BTD/BTC accounting readback
  PacksActivityDetailGovernance/
    PacksActivityDetailGovernance.tsx  # authority / governance readback
  PacksActivityDetailProofRoots/
    PacksActivityDetailProofRoots.tsx  # expandable proof roots
  PacksDetailSection/
    PacksDetailSection.tsx             # titled section chrome for detail
  PacksStatusPill/
    PacksStatusPill.tsx                # status chip (React; not in models/)
```

Page shell: `uapi/app/packs/` (metadata + re-export only).

## Import rules

- Import Bitcode only. Scope is always `network` (never personal pipelines —
  that is `/deposits`).
- Source-safe metadata only; no unpaid AssetPack source content.
- Pure logic → `models/` (`.ts`, no React). Stateful IO → `hooks/`. UI units →
  named directories (`ComponentName/ComponentName.tsx`).
- Shared domain projection (`pack-activity-model`) stays under
  `bitcode/activity/` (cross-route activity model; not packs-only).
