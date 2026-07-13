# Docs experience (`Docs*`)

Public documentation surfaces. Imports Bitcode only.
Page shell: `uapi/app/docs/`.

## Layout

```
uapi/components/docs/
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
`uapi/app/docs/bitcode-docs-content.ts`).
