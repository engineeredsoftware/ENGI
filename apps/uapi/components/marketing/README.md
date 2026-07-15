# Marketing experience (`Marketing*`)

Landing and public marketing composition. Imports Bitcode only.
Page shell: `apps/uapi/app/page.tsx` and `apps/uapi/app/(root)/`.

## Layout

Named component directories under `apps/uapi/components/marketing/` follow
`.docs/BITCODE_SOURCE_LAYOUT.md` (`ComponentName/ComponentName.tsx`).

Large sections keep **shell + co-located modules**:

| Section | Co-located modules |
| --- | --- |
| `MarketingScreenshotSection` | `marketing-screenshot-data.ts`, `hooks/use-screenshot-arrow.ts`, `hooks/use-screenshot-entrance.ts`, `MarketingScreenshotHeroGallery`, `MarketingScreenshotFloatingTrio`, `MarketingScreenshotHowItWorks`, `MarketingScreenshotMobileGrid` |
| `MarketingCompetitorTableSection` | `marketing-competitor-table-data.ts`, `MarketingCompetitorDocBox`, `MarketingBitcodeAdvantageCard` |
| `MarketingWalkthroughSection` | `marketing-walkthrough-data.ts`, `hooks/use-media-query.ts` |
| `MarketingMarketplaceSection` | `marketing-marketplace-data.ts`, `MarketingMarketplaceTechIcon`, `MarketingMarketplaceCandles`, `MarketingMarketplaceTicker`, `MarketingMarketplaceOrderBook`, `MarketingMarketplaceDetailCard`, `MarketingMarketplaceNarrativeGrid`, `MarketingMarketplaceActionPad` |
| `MarketingBtdInvestmentExperience` | `marketing-btd-investment-helpers.ts`, `MarketingBtdValuePanel`, `MarketingBtdCoachingPanel`, `MarketingBtdProjectionPanel` |
| `MarketingCompletionCelebration` | `marketing-completion-celebration-data.ts` |
| `MarketingPipelinePhasePoetry` | `marketing-pipeline-phase-poetry-data.ts` |
| `MarketingAccelerationSection` | `MarketingAccelerationThumbnailStrip`, `MarketingAccelerationDocBox` |

Shared primitives: `MarketingSectionWrapper`, `MarketingThumbnailStack`,
`MarketingFullScreenGallery`, `MarketingTypes/marketing-types`.

Landing composition: `MarketingLandingPage` + hero/preview/testnet units.
Public docs hub surface: `PublicDocsPageContent` (content from Docs experience models).
