# Marketing experience (`Marketing*`)

Landing and public marketing composition. Imports Bitcode only.
Page shell: `uapi/app/page.tsx` and `uapi/app/(root)/`.

## Layout

Named component directories under `uapi/components/marketing/` follow
`internal-docs/BITCODE_SOURCE_LAYOUT.md` (`ComponentName/ComponentName.tsx`).

Large sections keep **shell + co-located modules**:

| Section | Co-located modules |
| --- | --- |
| `MarketingScreenshotSection` | `marketing-screenshot-data.ts`, `hooks/use-screenshot-arrow.ts`, `MarketingScreenshotMobileGrid` |
| `MarketingCompetitorTableSection` | `marketing-competitor-table-data.ts`, `MarketingCompetitorDocBox`, `MarketingBitcodeAdvantageCard` |
| `MarketingWalkthroughSection` | `marketing-walkthrough-data.ts`, `hooks/use-media-query.ts` |
| `MarketingMarketplaceSection` | `marketing-marketplace-data.ts`, `MarketingMarketplaceTechIcon` |
| `MarketingBtdInvestmentExperience` | `marketing-btd-investment-helpers.ts` |
| `MarketingAccelerationSection` | `MarketingAccelerationThumbnailStrip`, `MarketingAccelerationDocBox` |

Shared primitives: `MarketingSectionWrapper`, `MarketingThumbnailStack`,
`MarketingFullScreenGallery`, `MarketingTypes/marketing-types.ts`.

Landing composition: `MarketingLandingPage` + hero/preview/testnet units.
Public docs hub surface: `PublicDocsPageContent` (content from Docs experience models).
