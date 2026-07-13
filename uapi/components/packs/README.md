# Packs experience (`Packs*`)

Network-scope PackActivity master-detail for `/packs`: portfolio positions,
market intelligence, searchable activity grid, and source-safe detail
(settlement, rights, compensation, delivery, repair, proof roots).

## Layout

```
packs/
  README.md
  models/
    packs-format.tsx                 # formatters, sort/type options, status pills
    packs-activity-types.ts          # API payload types
  PacksPageClient/
    PacksPageClient.tsx              # thin orchestration
    hooks/
      use-packs-activity.ts          # network-scope fetch/refresh
  PacksPortfolioOverview/
    PacksPortfolioOverview.tsx       # positions + market signals
  PacksActivityMaster/
    PacksActivityMaster.tsx          # filters + activity table
  PacksActivityDetail/
    PacksActivityDetail.tsx          # detail aside
  PacksDetailSection/
    PacksDetailSection.tsx           # section chrome for detail
```

Page shell: `uapi/app/packs/`.

## Import rules

- Import Bitcode only. Scope is always `network` (never personal pipelines —
  that is `/deposits`).
- Source-safe metadata only; no unpaid AssetPack source content.
