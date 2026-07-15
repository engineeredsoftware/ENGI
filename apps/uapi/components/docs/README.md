# Docs experience (`Docs*`)

Public documentation surfaces. Imports Bitcode only.
Page shell: `apps/uapi/app/docs/`.

**Voice:** customer-facing technical prose aligned to V48 product routes
(`/packs`, `/reads`, `/deposits`), AssetPacks, BTD volume/rights, BTC settlement,
and source safety. Public docs teach; Protocol canon legislates. Prefer Packs /
Deposit / Read language over legacy Terminal product naming in new copy.

## Layout

```
apps/uapi/components/docs/
  models/
    bitcode-docs-types.ts          # page / section / API types
    bitcode-docs-helpers.ts        # docsPage + disclosure limit
    bitcode-docs-content.ts        # stable re-export entry
    docs-signal-tone.ts
    content/                       # article sections, API refs, pages, chapters
      sections-*.ts
      api-reference-*.ts
      terminal-*-guides.ts
      pages.ts
      chapters.ts
  DocsArticlePage/                 # thin article shell
  DocsPageRail/
  DocsGuideCard/
  DocsEmbeddedUiSection/
  DocsInterfaceApiReferenceSection/
  DocsTerminalActionsSection/
  DocsTerminalReadsSection/
  DocsNextReadingCards/
```

Canonical import for app routes and tests:

`@/components/docs/models/bitcode-docs-content` (also re-exported from
`apps/uapi/app/docs/bitcode-docs-content.ts`).
