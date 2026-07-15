/**
 * Canonical docs article content for the Bitcode Docs experience.
 * Split into types, helpers, and per-article content modules under ./content/.
 */

export type {
  DocsGuideCard,
  DocsEmbeddedUiSpecimen,
  DocsInterfaceApiFeature,
  DocsInterfaceApiSection,
  BitcodeDocsPageSlug,
  BitcodeDocsPage,
  BitcodeDocsChapter,
  ProductActionGuide,
  ProductReadGuide,
} from './bitcode-docs-types';

export { withPublicDisclosureLimit, docsPage } from './bitcode-docs-helpers';

export { PRODUCT_ACTION_GUIDES } from './content/product-action-guides';
export { PRODUCT_READ_GUIDES } from './content/product-read-guides';
export { BITCODE_DOCS_PAGES } from './content/pages';
export {
  BITCODE_DOCS_CHAPTERS,
  BITCODE_DOCS_PAGE_SLUGS,
  getBitcodeDocsPage,
} from './content/chapters';
