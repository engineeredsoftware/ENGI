// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';
import {
  V46_PROTOCOL_CLAIM_AUTHORITY_IDS,
  V46_PROTOCOL_CLAIM_CATEGORY_IDS,
  V46_PROTOCOL_CLAIM_ROWS,
  V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH,
  V46_PROTOCOL_FORBIDDEN_CLAIM_IDS,
  V46_PROTOCOL_PRIVATE_PAYLOAD_IDS,
} from './v46-protocol-comprehension-object-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH =
  '.bitcode/v46-public-operator-claim-boundaries.json';
export const V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SCHEMA_ID =
  'bitcode.v46.publicOperatorClaimBoundaries.v1';
export const V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_VERSION = 'V46';
export const V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_CURRENT_TARGET = 'V45';
export const V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SOURCE_SAFETY_VERDICT =
  'source-safe-public-operator-claim-boundary-metadata';

export const V46_PUBLIC_OPERATOR_SURFACE_IDS = Object.freeze([
  'landing-page',
  'landing-preview',
  'public-docs-home',
  'public-docs-content-model',
  'public-docs-protocol-page',
  'operator-internal-readme',
  'root-readme',
  'protocol-package-readme',
  'v46-spec-family',
]);

export const V46_PUBLIC_OPERATOR_SURFACE_KIND_IDS = Object.freeze([
  'landing',
  'public-docs',
  'operator-docs',
  'package-docs',
  'formal-specification',
]);

const SOURCE_PATHS = Object.freeze({
  activePointer: 'specifications/BITCODE_SPEC.txt',
  spec: 'specifications/BITCODE_SPEC_V46.md',
  delta: 'specifications/BITCODE_SPEC_V46_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V46_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v46-public-operator-claim-boundaries.js',
  packageTest: 'scripts/specifying/test/v46-public-operator-claim-boundaries.test.js',
  generator: 'scripts/generate-v46-public-operator-claim-boundaries.mjs',
  checker: 'scripts/check-v46-gate3-public-operator-claim-boundaries.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  publicCopy: 'apps/uapi/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy.ts',
  publicExplainers: 'apps/uapi/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers.ts',
  landingShared: 'apps/uapi/app/(root)/components/landing/marketing-landing-shared.tsx',
  landingPreview: 'apps/uapi/components/marketing/MarketingLandingProductPreview/MarketingLandingProductPreview.tsx',
  docsPage: 'apps/uapi/app/docs/page.tsx',
  docsHome: 'apps/uapi/components/marketing/PublicDocsPageContent/PublicDocsPageContent.tsx',
  docsContent: 'apps/uapi/app/docs/bitcode-docs-content.ts',
  docsRoute: 'apps/uapi/app/docs/[slug]/page.tsx',
  publicDocsUnitTest: 'apps/uapi/tests/publicDocsPageContent.test.tsx',
  docsContentUnitTest: 'apps/uapi/tests/bitcodeDocsContent.test.tsx',
  operatorReadme: 'internal-docs/README.md',
});

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_PUBLIC_OPERATOR_PHRASES = Object.freeze([
  'Source Shares and the Bitcode Exchange',
  'Learn Bitcode from Source Shares to proof',
  'Map the V26 Protocol canon',
  'V26 coverage',
  'BTD is money',
  'BTD is only a read right',
  'preview discloses source',
  'quote is payment',
  'payment observation is finality',
  'database is ledger truth',
  'telemetry advances state',
  'server custodies wallet private material',
  'value-bearing mainnet operation is live',
]);

export const V46_PUBLIC_OPERATOR_ALLOWED_DATA_CLASSES = Object.freeze([
  'route-links',
  'plain-language-protocol-guidance',
  'source-safe-measurements',
  'state-labels',
  'claim-categories',
  'claim-authority-ids',
  'proof-root-ids',
  'ledger-readback-posture',
  'database-projection-posture',
  'object-storage-root-posture',
  'wallet-provider-receipt-posture',
  'repository-delivery-receipt-posture',
  'repair-state-labels',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function sourceRoot(repoRoot, sourcePath) {
  return `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function claimExists(claimId) {
  return V46_PROTOCOL_CLAIM_ROWS.some((row) => row.claimId === claimId);
}

function categoryExists(categoryId) {
  return V46_PROTOCOL_CLAIM_CATEGORY_IDS.includes(categoryId);
}

function authorityExists(authorityId) {
  return V46_PROTOCOL_CLAIM_AUTHORITY_IDS.includes(authorityId);
}

function scanSourcesForMarkers(repoRoot, sourcePaths, markers) {
  const joined = sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.filter((marker) => marker && joined.includes(marker));
}

function requiredTokensPresent(repoRoot, row) {
  const joined = row.sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return row.requiredCopyTokens.every((token) => joined.includes(token));
}

function surfaceRow({
  surfaceId,
  surfaceKindId,
  audience,
  sourcePaths,
  claimIds,
  claimCategoryIds,
  authorityIds,
  requiredCopyTokens,
  allowedDataClasses,
  blockedDataClasses,
  operatorReading,
}) {
  return {
    surfaceId,
    surfaceKindId,
    audience,
    sourcePaths,
    claimIds,
    claimCategoryIds,
    authorityIds,
    requiredCopyTokens,
    allowedDataClasses,
    blockedDataClasses,
    operatorReading,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    valueBearingMainnetAdmitted: false,
    rowRoot: `v46-public-operator-surface-row:${digest(JSON.stringify({ surfaceId, sourcePaths, claimIds }))}`,
  };
}

export const V46_PUBLIC_OPERATOR_SURFACE_ROWS = Object.freeze([
  surfaceRow({
    surfaceId: 'landing-page',
    surfaceKindId: 'landing',
    audience: ['first-time-reader', 'enterprise-buyer', 'depositor', 'investor'],
    sourcePaths: [SOURCE_PATHS.publicCopy, SOURCE_PATHS.publicExplainers, SOURCE_PATHS.landingShared],
    claimIds: [
      'assetpack-is-commodity',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'finality-authorizes-rights-and-delivery',
      'investor-framing-is-not-protocol-law',
    ],
    claimCategoryIds: ['product-guidance', 'investor-framing', 'protocol-law'],
    authorityIds: ['public-education-only', 'interface-guidance-only', 'canonical-specification'],
    requiredCopyTokens: [
      'AssetPacks for measured technical intelligence',
      'BTD records scalar knowledge volume and rights',
      'BTC settles value transfer',
      'BTC COMPENSATION',
      'Protocol law and proof readback decide state',
    ],
    allowedDataClasses: ['route-links', 'plain-language-protocol-guidance', 'state-labels'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Landing copy may explain Bitcode commercially, but it remains public education and cannot claim protocol-law authority or source visibility.',
  }),
  surfaceRow({
    surfaceId: 'landing-preview',
    surfaceKindId: 'landing',
    audience: ['first-time-reader', 'operator'],
    sourcePaths: [SOURCE_PATHS.landingPreview, SOURCE_PATHS.publicCopy, SOURCE_PATHS.landingShared],
    claimIds: ['preview-is-source-safe-measurement', 'quote-is-source-safe-offer', 'telemetry-is-observability-only'],
    claimCategoryIds: ['preview-claim', 'quote-claim', 'telemetry-observability', 'product-guidance'],
    authorityIds: ['public-education-only', 'interface-guidance-only', 'telemetry-observability-only'],
    requiredCopyTokens: [
      'The preview keeps AssetPacks, source-safe measurements, and settlement posture legible',
      'static preview',
      'Packs',
      'Deposit',
      'Read',
    ],
    allowedDataClasses: ['state-labels', 'source-safe-measurements', 'proof-root-ids'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Landing previews can show representative state labels and measurements, never source-bearing AssetPack contents or payment finality.',
  }),
  surfaceRow({
    surfaceId: 'public-docs-home',
    surfaceKindId: 'public-docs',
    audience: ['operator', 'developer', 'enterprise-buyer', 'depositor'],
    sourcePaths: [SOURCE_PATHS.docsPage, SOURCE_PATHS.docsHome, SOURCE_PATHS.publicDocsUnitTest],
    claimIds: [
      'assetpack-is-commodity',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'finality-authorizes-rights-and-delivery',
      'repair-fails-closed',
    ],
    claimCategoryIds: ['product-guidance', 'protocol-law', 'operator-evidence', 'repair-claim'],
    authorityIds: ['public-education-only', 'canonical-specification', 'generated-proof'],
    requiredCopyTokens: [
      'Learn Bitcode from AssetPacks to proof.',
      'V45 / V46 claim boundary',
      'Protocol docs map back to active law.',
      'Public docs explain; proof readback decides.',
    ],
    allowedDataClasses: ['route-links', 'claim-categories', 'claim-authority-ids', 'proof-root-ids'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Docs home teaches route order and claim authority while reminding users that docs explain rather than advance state.',
  }),
  surfaceRow({
    surfaceId: 'public-docs-content-model',
    surfaceKindId: 'public-docs',
    audience: ['operator', 'developer', 'protocol-reviewer'],
    sourcePaths: [SOURCE_PATHS.docsContent, SOURCE_PATHS.docsContentUnitTest],
    claimIds: [
      'assetpack-is-commodity',
      'preview-is-source-safe-measurement',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'operator-evidence-is-source-safe-readback',
    ],
    claimCategoryIds: ['protocol-law', 'product-guidance', 'preview-claim', 'operator-evidence'],
    authorityIds: ['canonical-specification', 'public-education-only', 'generated-proof'],
    requiredCopyTokens: [
      'Public docs expose guidance and proof posture, not protected source',
      'AssetPacks, BTD, and the Bitcode activity ledger',
      'Map the active Protocol canon',
      'V46 claim boundary',
    ],
    allowedDataClasses: ['plain-language-protocol-guidance', 'source-safe-measurements', 'repair-state-labels'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Docs content can describe objects, routes, and proof semantics while keeping source, prompts, provider responses, and secrets out.',
  }),
  surfaceRow({
    surfaceId: 'public-docs-protocol-page',
    surfaceKindId: 'public-docs',
    audience: ['operator', 'protocol-reviewer', 'implementation-reviewer'],
    sourcePaths: [SOURCE_PATHS.docsContent, SOURCE_PATHS.docsRoute],
    claimIds: ['operator-evidence-is-source-safe-readback', 'repair-fails-closed', 'investor-framing-is-not-protocol-law'],
    claimCategoryIds: ['protocol-law', 'repair-claim', 'product-guidance'],
    authorityIds: ['canonical-specification', 'generated-proof', 'public-education-only'],
    requiredCopyTokens: [
      'active Protocol canon',
      'V45 is active canon while V46 is draft target',
      'Public docs are not protocol law',
      'protocol-v26',
    ],
    allowedDataClasses: ['claim-authority-ids', 'proof-root-ids', 'state-labels'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'The protocol article teaches active-canon posture and supports the legacy protocol-v26 slug only as a compatibility alias.',
  }),
  surfaceRow({
    surfaceId: 'operator-internal-readme',
    surfaceKindId: 'operator-docs',
    audience: ['operator', 'maintainer', 'incident-reviewer'],
    sourcePaths: [SOURCE_PATHS.operatorReadme],
    claimIds: ['telemetry-is-observability-only', 'repair-fails-closed', 'operator-evidence-is-source-safe-readback'],
    claimCategoryIds: ['operator-evidence', 'telemetry-observability', 'repair-claim'],
    authorityIds: ['generated-proof', 'telemetry-observability-only', 'canonical-specification'],
    requiredCopyTokens: [
      'resolves to `V46`',
      'promoted V46 canon',
      'Operator notes may name proof roots',
      'Operator notes must not record secret values',
    ],
    allowedDataClasses: ['proof-root-ids', 'repair-state-labels', 'state-labels', 'claim-authority-ids'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Internal operator docs may guide repair and evidence triage, but they cannot become canonical law or store source-bearing/private payloads.',
  }),
  surfaceRow({
    surfaceId: 'root-readme',
    surfaceKindId: 'package-docs',
    audience: ['contributor', 'operator', 'maintainer'],
    sourcePaths: [SOURCE_PATHS.readme],
    claimIds: ['assetpack-is-commodity', 'btd-is-weighted-scalar-volume-and-settled-rights', 'repair-fails-closed'],
    claimCategoryIds: ['product-guidance', 'operator-evidence', 'protocol-law'],
    authorityIds: ['canonical-specification', 'generated-proof', 'interface-guidance-only'],
    requiredCopyTokens: [
      'V46 Gate 3 adds `V46PublicOperatorClaimBoundaries`',
      V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH,
      'public docs, landing, and operator docs',
    ],
    allowedDataClasses: ['plain-language-protocol-guidance', 'claim-categories', 'proof-root-ids'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Root README records the gate artifact and verification surface without claiming runtime promotion.',
  }),
  surfaceRow({
    surfaceId: 'protocol-package-readme',
    surfaceKindId: 'package-docs',
    audience: ['package-consumer', 'maintainer', 'operator'],
    sourcePaths: [SOURCE_PATHS.protocolReadme],
    claimIds: ['assetpack-is-commodity', 'btd-is-weighted-scalar-volume-and-settled-rights', 'repair-fails-closed'],
    claimCategoryIds: ['product-guidance', 'operator-evidence', 'protocol-law'],
    authorityIds: ['canonical-specification', 'generated-proof', 'interface-guidance-only'],
    requiredCopyTokens: [
      'V46 Gate 3 adds `V46PublicOperatorClaimBoundaries`',
      'source-safe public/operator claim boundary metadata',
      'buildV46PublicOperatorClaimBoundaries',
    ],
    allowedDataClasses: ['plain-language-protocol-guidance', 'claim-categories', 'proof-root-ids'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'Protocol package README documents the exported builder and source-safe artifact for package consumers.',
  }),
  surfaceRow({
    surfaceId: 'v46-spec-family',
    surfaceKindId: 'formal-specification',
    audience: ['protocol-reviewer', 'operator', 'implementation-reviewer'],
    sourcePaths: [SOURCE_PATHS.spec, SOURCE_PATHS.delta, SOURCE_PATHS.notes, SOURCE_PATHS.parity, SOURCE_PATHS.roadmap],
    claimIds: [
      'assetpack-is-commodity',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'finality-authorizes-rights-and-delivery',
      'investor-framing-is-not-protocol-law',
      'repair-fails-closed',
    ],
    claimCategoryIds: ['protocol-law', 'operator-evidence', 'investor-framing', 'repair-claim'],
    authorityIds: ['canonical-specification', 'generated-proof'],
    requiredCopyTokens: [
      'V46 public/operator claim boundary law',
      'Gate 3: Public Docs, Landing, And Operator Claim Boundaries',
      V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH,
      'V46 Gate 3 closure anchor',
    ],
    allowedDataClasses: ['claim-categories', 'claim-authority-ids', 'proof-root-ids', 'state-labels'],
    blockedDataClasses: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    operatorReading:
      'The V46 spec family is the draft authority for Gate 3 and remains subordinate to V45 until promotion.',
  }),
]);

function buildSourceRoots(repoRoot) {
  return Object.fromEntries(Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, sourceRoot(repoRoot, sourcePath)]));
}

function buildSourcePredicates(repoRoot) {
  const sources = Object.fromEntries(Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]));
  return [
    predicateResult('active-canon-pointer-supports-v46-draft-or-later', SOURCE_PATHS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V45')),
    predicateResult(
      'spec-defines-public-operator-claim-boundary-law',
      SOURCE_PATHS.spec,
      sources.spec.includes('V46 public/operator claim boundary law') &&
        sources.spec.includes('Public docs explain; proof readback decides.') &&
        sources.spec.includes(V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-documents-gate3',
      SOURCE_PATHS.delta,
      sources.delta.includes('Gate 3: Public Docs, Landing, And Operator Claim Boundaries') &&
        sources.delta.includes(V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate3-atom',
      SOURCE_PATHS.notes,
      sources.notes.includes('Gate 3: Public Docs, Landing, And Operator Claim Boundaries') &&
        sources.notes.includes('V46 public/operator claim-boundary atom: public/operator claim boundaries'),
    ),
    predicateResult(
      'parity-closes-gate3-row',
      SOURCE_PATHS.parity,
      sources.parity.includes('V46PublicOperatorClaimBoundaries') &&
        sources.parity.includes(V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate3',
      SOURCE_PATHS.roadmap,
      sources.roadmap.includes('V46 Gate 3 closure anchor') &&
        sources.roadmap.includes(V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH),
    ),
    predicateResult(
      'landing-copy-uses-current-claims',
      SOURCE_PATHS.publicCopy,
      sources.publicCopy.includes('BTD records scalar knowledge volume and rights') &&
        sources.landingShared.includes('BTC COMPENSATION') &&
        sources.landingPreview.includes('The preview keeps AssetPacks, source-safe measurements, and settlement posture legible'),
    ),
    predicateResult(
      'public-docs-home-uses-current-claims',
      SOURCE_PATHS.docsHome,
      sources.docsPage.includes('AssetPacks, /packs, /read, /deposit, proofs, settlement') &&
        sources.docsHome.includes('V45 / V46 claim boundary') &&
        sources.docsHome.includes('Public docs explain; proof readback decides.'),
    ),
    predicateResult(
      'public-docs-content-uses-current-protocol-page',
      SOURCE_PATHS.docsContent,
      sources.docsContent.includes("slug: 'protocol'") &&
        sources.docsContent.includes('Map the active Protocol canon') &&
        sources.docsContent.includes('V46 claim boundary') &&
        sources.docsRoute.includes('protocol-v26'),
    ),
    predicateResult(
      'operator-readme-uses-current-claim-boundary',
      SOURCE_PATHS.operatorReadme,
      sources.operatorReadme.includes('resolves to `V46`') &&
        sources.operatorReadme.includes('promoted V46 canon') &&
        sources.operatorReadme.includes('Operator notes must not record secret values'),
    ),
    predicateResult(
      'readmes-document-gate3',
      SOURCE_PATHS.readme,
      sources.readme.includes('V46 Gate 3 adds `V46PublicOperatorClaimBoundaries`') &&
        sources.protocolReadme.includes('V46 Gate 3 adds `V46PublicOperatorClaimBoundaries`'),
    ),
    predicateResult(
      'package-exports-wired',
      SOURCE_PATHS.packageIndex,
      sources.packageIndex.includes('buildV46PublicOperatorClaimBoundaries') &&
        sources.packageTypes.includes('buildV46PublicOperatorClaimBoundaries'),
    ),
    predicateResult(
      'generator-and-checker-exist',
      SOURCE_PATHS.generator,
      sourceExists(repoRoot, SOURCE_PATHS.generator) && sourceExists(repoRoot, SOURCE_PATHS.checker),
    ),
    predicateResult(
      'package-script-wired',
      SOURCE_PATHS.packageJson,
      sources.packageJson.includes('"generate:v46-public-operator-claim-boundaries"') &&
        sources.packageJson.includes('"check:v46-public-operator-claim-boundaries"') &&
        sources.packageJson.includes('"check:v46-gate3"'),
    ),
    predicateResult(
      'gate-and-canon-workflows-run-gate3',
      SOURCE_PATHS.gateWorkflow,
      sources.gateWorkflow.includes('check-v46-gate3-public-operator-claim-boundaries.mjs') &&
        sources.canonWorkflow.includes('check-v46-gate3-public-operator-claim-boundaries.mjs'),
    ),
  ];
}

function sourceSafetyCoverage(repoRoot, rows) {
  const allSourcePaths = [...new Set(rows.flatMap((row) => row.sourcePaths))];
  const forbiddenPhraseHits = scanSourcesForMarkers(repoRoot, allSourcePaths, FORBIDDEN_PUBLIC_OPERATOR_PHRASES);
  const secretMarkerHits = scanSourcesForMarkers(repoRoot, allSourcePaths, SECRET_MARKERS);
  const rowsMissingRequiredCopy = rows.filter((row) => !requiredTokensPresent(repoRoot, row)).map((row) => row.surfaceId);
  return {
    sourceSafeMetadataOnly: rows.every((row) => row.sourceSafeMetadataOnly === true),
    protectedSourceVisible: rows.some((row) => row.protectedSourceVisible === true),
    unpaidAssetPackSourceVisible: rows.some((row) => row.unpaidAssetPackSourceVisible === true),
    rawPromptVisible: rows.some((row) => row.rawPromptVisible === true),
    rawProviderResponseVisible: rows.some((row) => row.rawProviderResponseVisible === true),
    credentialsSerialized: rows.some((row) => row.credentialsSerialized === true),
    walletPrivateMaterialVisible: rows.some((row) => row.walletPrivateMaterialVisible === true),
    valueBearingMainnetAdmitted: rows.some((row) => row.valueBearingMainnetAdmitted === true),
    forbiddenPhraseHits,
    secretMarkerHits,
    rowsMissingRequiredCopy,
  };
}

export function buildV46PublicOperatorClaimBoundaries(input = {}) {
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const surfaceRows = [...V46_PUBLIC_OPERATOR_SURFACE_ROWS];
  const sourcePredicates = buildSourcePredicates(repoRoot);
  const failedPredicateIds = sourcePredicates.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const claimIdsUsed = [...new Set(surfaceRows.flatMap((row) => row.claimIds))];
  const categoryIdsUsed = [...new Set(surfaceRows.flatMap((row) => row.claimCategoryIds))];
  const authorityIdsUsed = [...new Set(surfaceRows.flatMap((row) => row.authorityIds))];
  const coverage = {
    surfaceCount: surfaceRows.length,
    surfaceIds: [...V46_PUBLIC_OPERATOR_SURFACE_IDS],
    surfaceKindIds: [...V46_PUBLIC_OPERATOR_SURFACE_KIND_IDS],
    claimIdsUsed,
    categoryIdsUsed,
    authorityIdsUsed,
    objectModelArtifactPath: V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH,
    forbiddenClaimIds: [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS],
    privatePayloadIds: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    allowedDataClasses: [...V46_PUBLIC_OPERATOR_ALLOWED_DATA_CLASSES],
    landingCovered: surfaceRows.some((row) => row.surfaceId === 'landing-page') &&
      surfaceRows.some((row) => row.surfaceId === 'landing-preview'),
    publicDocsCovered:
      surfaceRows.some((row) => row.surfaceId === 'public-docs-home') &&
      surfaceRows.some((row) => row.surfaceId === 'public-docs-content-model') &&
      surfaceRows.some((row) => row.surfaceId === 'public-docs-protocol-page'),
    operatorDocsCovered: surfaceRows.some((row) => row.surfaceId === 'operator-internal-readme'),
    readmesCovered:
      surfaceRows.some((row) => row.surfaceId === 'root-readme') &&
      surfaceRows.some((row) => row.surfaceId === 'protocol-package-readme'),
    specFamilyCovered: surfaceRows.some((row) => row.surfaceId === 'v46-spec-family'),
    requiredClaimCategoriesCovered: ['protocol-law', 'product-guidance', 'operator-evidence', 'investor-framing', 'telemetry-observability'].every(
      (categoryId) => categoryIdsUsed.includes(categoryId),
    ),
    requiredClaimAuthoritiesCovered: ['canonical-specification', 'generated-proof', 'public-education-only', 'interface-guidance-only'].every(
      (authorityId) => authorityIdsUsed.includes(authorityId),
    ),
    allClaimIdsKnown: claimIdsUsed.every(claimExists),
    allCategoryIdsKnown: categoryIdsUsed.every(categoryExists),
    allAuthorityIdsKnown: authorityIdsUsed.every(authorityExists),
    sourcePredicates,
    failedPredicateIds,
    ...sourceSafetyCoverage(repoRoot, surfaceRows),
  };

  return {
    artifactId: 'v46-public-operator-claim-boundaries',
    artifactPath: V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH,
    artifactRoot: `v46-public-operator-claim-boundaries:${digest(JSON.stringify({ surfaceRows, coverage }))}`,
    schemaId: V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SCHEMA_ID,
    version: V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_VERSION,
    currentTarget: V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_CURRENT_TARGET,
    sourceSafetyVerdict: V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SOURCE_SAFETY_VERDICT,
    sourceRoots: buildSourceRoots(repoRoot),
    surfaceIds: [...V46_PUBLIC_OPERATOR_SURFACE_IDS],
    surfaceKindIds: [...V46_PUBLIC_OPERATOR_SURFACE_KIND_IDS],
    allowedDataClasses: [...V46_PUBLIC_OPERATOR_ALLOWED_DATA_CLASSES],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    forbiddenClaimIds: [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS],
    forbiddenPublicOperatorPhrases: [...FORBIDDEN_PUBLIC_OPERATOR_PHRASES],
    surfaceRows,
    coverage,
    passed:
      failedPredicateIds.length === 0 &&
      coverage.landingCovered === true &&
      coverage.publicDocsCovered === true &&
      coverage.operatorDocsCovered === true &&
      coverage.readmesCovered === true &&
      coverage.specFamilyCovered === true &&
      coverage.requiredClaimCategoriesCovered === true &&
      coverage.requiredClaimAuthoritiesCovered === true &&
      coverage.allClaimIdsKnown === true &&
      coverage.allCategoryIdsKnown === true &&
      coverage.allAuthorityIdsKnown === true &&
      coverage.sourceSafeMetadataOnly === true &&
      coverage.protectedSourceVisible === false &&
      coverage.unpaidAssetPackSourceVisible === false &&
      coverage.rawPromptVisible === false &&
      coverage.rawProviderResponseVisible === false &&
      coverage.credentialsSerialized === false &&
      coverage.walletPrivateMaterialVisible === false &&
      coverage.valueBearingMainnetAdmitted === false &&
      coverage.forbiddenPhraseHits.length === 0 &&
      coverage.secretMarkerHits.length === 0 &&
      coverage.rowsMissingRequiredCopy.length === 0,
    closureReading:
      'V46 Gate 3 closes source-safe public docs, landing, and operator claim boundaries; public/operator surfaces explain Bitcode but proof readback decides protocol state.',
  };
}

export const V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SOURCE_ROOTS = Object.freeze(
  buildSourceRoots(DEFAULT_REPO_ROOT),
);
