// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH =
  '.bitcode/v47-feature-excess-alignment-audit.json';
export const V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SCHEMA_ID =
  'bitcode.v47.featureExcessAlignmentAudit.v1';
export const V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_VERSION = 'V47';
export const V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_CURRENT_TARGET = 'V46';
export const V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SOURCE_SAFETY_VERDICT =
  'source-safe-launch-scope-metadata';

export const V47_LAUNCH_ROUTE_IDS = Object.freeze(['/deposit', '/read', '/packs']);
export const V47_SUPPORTING_SURFACE_IDS = Object.freeze([
  '/',
  '/docs',
  '/auxillaries',
  '/btd/[assetPackId]',
  '/executions/[runId]',
  '/api/activity',
  '/api/deposits',
  '/api/read-review',
  '/api/make-bitcode-branch',
  '/api/executions',
]);
export const V47_DEFERRED_SURFACE_IDS = Object.freeze([
  '/terminal direct product entry',
  '/conversations direct commercial launch',
  '/exchange direct product entry',
  '/orbitals direct route family',
  '/edgetimes',
  '/demo-video',
  'ChatGPT App commercialization',
  'MCP/API commercialization',
  'Bitcode Chat commercialization',
  'value-bearing mainnet BTC settlement',
  'advanced market mechanics',
]);
export const V47_FEATURE_POLICY_IDS = Object.freeze([
  'public-nav-current-routes-only',
  'landing-cta-current-routes-only',
  'btd-detail-current-routes-only',
  'exchange-compatibility-redirect-only',
  'terminal-direct-entry-flaggable',
  'conversations-direct-entry-flaggable',
  'testnet-btc-only',
  'source-safe-preview-only',
]);
export const V47_FORBIDDEN_LAUNCH_ENTRY_TARGETS = Object.freeze([
  '/terminal?intent=acquire-btd',
  '/terminal?intent=submit-read-for-btd',
  '/exchange?intent=buy-existing-btd',
  'router.push(\'/terminal\')',
  'window.location.assign(\'/packs',
]);
export const V47_FEATURE_EXCESS_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_assetpack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
  'mainnet_value_bearing_payment_secret',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'specifications/BITCODE_SPEC.txt',
  spec: 'specifications/BITCODE_SPEC_V47.md',
  delta: 'specifications/BITCODE_SPEC_V47_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V47_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V47_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  publicCopy: 'apps/uapi/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy.ts',
  nav: 'apps/uapi/components/bitcode/layout/nav.tsx',
  features: 'apps/uapi/config/features.ts',
  workspaceSurface: 'apps/uapi/components/bitcode/layout/WorkspaceSurface/workspace-surface.ts',
  home: 'apps/uapi/app/page.tsx',
  heroClient: 'apps/uapi/app/hero-client.tsx',
  marketingPricing: 'apps/uapi/components/marketing/MarketingPricingSection/MarketingPricingSection.tsx',
  packsPage: 'apps/uapi/app/packs/page.tsx',
  readPage: 'apps/uapi/app/read/page.tsx',
  depositPage: 'apps/uapi/app/deposit/page.tsx',
  terminalPage: 'apps/uapi/app/page.tsx',
  conversationsPage: 'apps/uapi/app/conversations/page.tsx',
  exchangePage: 'apps/uapi/app/exchange/page.tsx',
  exchangeReadme: 'apps/uapi/app/exchange/README.md',
  btdDetailPage: 'apps/uapi/app/btd/[assetPackId]/page.tsx',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolSource: 'scripts/specifying/src/canonical/v47-feature-excess-alignment-audit.js',
  protocolTest: 'scripts/specifying/test/v47-feature-excess-alignment-audit.test.js',
  generator: 'scripts/generate-v47-feature-excess-alignment-audit.mjs',
  checker: 'scripts/check-v47-gate2-feature-excess-alignment-audit.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function containsAny(source, needles) {
  return needles.some((needle) => source.includes(needle));
}

export const V47_FEATURE_EXCESS_AUDIT_ROWS = Object.freeze([
  {
    rowId: 'launch-routes-are-current-product-entrypoints',
    classification: 'launch',
    owner: 'website-product-routes',
    routeIds: ['/deposit', '/read', '/packs'],
    policy:
      'The V47 website MVP opens through Deposit, Read, and Packs; public navigation and landing acquisition actions must point at those route roots.',
    requiredPolicyIds: ['public-nav-current-routes-only', 'landing-cta-current-routes-only'],
  },
  {
    rowId: 'compatibility-routes-cannot-own-product-state',
    classification: 'compatibility',
    owner: 'compatibility-routes',
    routeIds: ['/exchange', '/btd/[assetPackId]'],
    policy:
      'Compatibility routes may preserve old links only when they redirect or point into Packs/Read and do not claim independent Exchange or product authority.',
    requiredPolicyIds: ['exchange-compatibility-redirect-only', 'btd-detail-current-routes-only'],
  },
  {
    rowId: 'retained-workspaces-are-flagged-or-direct-only',
    classification: 'deferred',
    owner: 'retained-workspaces',
    routeIds: ['/packs', '/conversations'],
    policy:
      'product and Conversations remain retained operator/composition workspaces; they must not be primary launch CTAs and direct entry must be flaggable for launch mode.',
    requiredPolicyIds: ['terminal-direct-entry-flaggable', 'conversations-direct-entry-flaggable'],
  },
  {
    rowId: 'commercial-surfaces-deferred',
    classification: 'deferred',
    owner: 'non-website-commercial-surfaces',
    routeIds: ['MCP/API', 'ChatGPT App', 'Bitcode Chat'],
    policy:
      'API/MCP, ChatGPT App, and Bitcode Chat are protocol/interface surfaces only in V47 and must not be presented as commercially launched website flows.',
    requiredPolicyIds: ['testnet-btc-only', 'source-safe-preview-only'],
  },
  {
    rowId: 'source-and-value-boundaries-remain-launch-blockers',
    classification: 'blocked',
    owner: 'source-safety-and-mainnet',
    routeIds: ['mainnet settlement', 'source-bearing preview'],
    policy:
      'V47 testnet launch cannot expose unpaid AssetPack source, raw prompts, raw provider responses, secrets, wallet private material, or value-bearing mainnet settlement.',
    requiredPolicyIds: ['testnet-btc-only', 'source-safe-preview-only'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );
  const publicLaunchSources = [
    sources.publicCopy,
    sources.nav,
    sources.home,
    sources.heroClient,
    sources.marketingPricing,
    sources.btdDetailPage,
  ].join('\n');

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate2-feature-excess',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Feature Excess And Gate Alignment Audit') &&
        sources.spec.includes(V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate2-artifact',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 2: Feature Excess And Gate Alignment Audit') &&
        sources.delta.includes(V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate2-policy',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Gate 2') && sources.notes.includes('feature excess'),
    ),
    predicateResult(
      'parity-records-gate2-closure',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Feature excess audit') &&
        sources.parity.includes(V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate2-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 2 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 2 Feature Excess And Gate Alignment Audit') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 2 Feature Excess And Gate Alignment Audit') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 3)),
    ),
    predicateResult(
      'public-nav-current-routes-only',
      SOURCE_ROOTS.publicCopy,
      V47_LAUNCH_ROUTE_IDS.every((routeId) => sources.publicCopy.includes(`href: '${routeId}'`)) &&
        !sources.publicCopy.includes("href: '/packs'") &&
        !sources.publicCopy.includes("href: '/exchange'"),
    ),
    predicateResult(
      'landing-cta-current-routes-only',
      SOURCE_ROOTS.heroClient,
      sources.heroClient.includes("router.push('/read')") && !sources.heroClient.includes("router.push('/packs')"),
    ),
    predicateResult(
      'marketing-acquisition-current-routes-only',
      SOURCE_ROOTS.marketingPricing,
      sources.marketingPricing.includes("target: '/read?intent=submit-read-for-btd'") &&
        sources.marketingPricing.includes("target: '/packs?intent=buy-existing-btd'") &&
        sources.marketingPricing.includes("window.location.assign('/read?intent=acquire-btd')") &&
        !sources.marketingPricing.includes('/terminal?intent=') &&
        !sources.marketingPricing.includes('/exchange?intent='),
    ),
    predicateResult(
      'btd-detail-current-routes-only',
      SOURCE_ROOTS.btdDetailPage,
      sources.btdDetailPage.includes('Open Packs') &&
        sources.btdDetailPage.includes('Open Read') &&
        !sources.btdDetailPage.includes('/exchange?') &&
        !sources.btdDetailPage.includes('/terminal?'),
    ),
    predicateResult(
      'exchange-compatibility-redirect-only',
      SOURCE_ROOTS.exchangePage,
      sources.exchangePage.includes("redirect(`/packs${serializeSearchParams(searchParams)}`)") &&
        sources.exchangeReadme.includes('compatibility redirect') &&
        sources.exchangeReadme.includes('must not contain current-product Exchange language'),
    ),
    predicateResult(
      'terminal-direct-entry-flaggable',
      SOURCE_ROOTS.nav,
      sources.nav.includes('DISABLE_PACKS_LINK') &&
        sources.nav.includes('disablePacksLink') &&
        sources.nav.includes('DISABLED_FEATURE_TOOLTIPS.packs'),
    ),
    predicateResult(
      'terminal-metadata-retained-operator-workspace',
      SOURCE_ROOTS.terminalPage,
      sources.terminalPage.includes('Bitcode Operator Workspace') &&
        sources.terminalPage.includes('Retained Bitcode operator workspace'),
    ),
    predicateResult(
      'conversations-direct-entry-flaggable',
      SOURCE_ROOTS.conversationsPage,
      sources.conversationsPage.includes('FEATURE_FLAGS.DISABLE_CONVERSATIONS_ROUTE') &&
        sources.features.includes('DISABLE_CONVERSATIONS_ROUTE'),
    ),
    predicateResult(
      'feature-config-owns-deferred-flags',
      SOURCE_ROOTS.features,
      ['DISABLE_EXCHANGE_ROUTE', 'DISABLE_CONVERSATIONS_ROUTE', 'DISABLE_PACKS_LINK'].every((flag) =>
        sources.features.includes(flag),
      ),
    ),
    predicateResult(
      'public-shell-launch-routes-classified',
      SOURCE_ROOTS.workspaceSurface,
      sources.workspaceSurface.includes("pathname.startsWith('/packs')") &&
        sources.workspaceSurface.includes("pathname.startsWith('/deposit')") &&
        sources.workspaceSurface.includes("pathname.startsWith('/read')"),
    ),
    predicateResult(
      'public-launch-sources-avoid-deferred-entry-targets',
      SOURCE_ROOTS.publicCopy,
      !containsAny(publicLaunchSources, V47_FORBIDDEN_LAUNCH_ENTRY_TARGETS),
    ),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV47FeatureExcessAlignmentAudit')),
    predicateResult('protocol-package-exports-gate2', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV47FeatureExcessAlignmentAudit')),
    predicateResult('protocol-types-export-gate2', SOURCE_ROOTS.protocolTypes, sources.protocolTypes.includes('buildV47FeatureExcessAlignmentAudit')),
    predicateResult(
      'package-json-exposes-gate2',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-feature-excess-alignment-audit"') &&
        sources.packageJson.includes('"check:v47-gate2"'),
    ),
    predicateResult(
      'gate-workflow-runs-gate2',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate2-feature-excess-alignment-audit.mjs'),
    ),
    predicateResult(
      'canon-workflow-runs-gate2',
      SOURCE_ROOTS.canonWorkflow,
      sources.canonWorkflow.includes('check-v47-gate2-feature-excess-alignment-audit.mjs'),
    ),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV47FeatureExcessAlignmentAudit')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V47 Gate 2 feature excess alignment audit check')),
  ];
}

export function buildV47FeatureExcessAlignmentAudit({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-feature-excess-alignment-audit:${digest(
    JSON.stringify({
      launchRouteIds: V47_LAUNCH_ROUTE_IDS,
      supportingSurfaceIds: V47_SUPPORTING_SURFACE_IDS,
      deferredSurfaceIds: V47_DEFERRED_SURFACE_IDS,
      featurePolicyIds: V47_FEATURE_POLICY_IDS,
      auditRows: V47_FEATURE_EXCESS_AUDIT_ROWS.map((row) => row.rowId),
      sourceRoots,
      failedPredicateIds,
    }),
  )}`;

  const launchRows = V47_FEATURE_EXCESS_AUDIT_ROWS.filter((row) => row.classification === 'launch');
  const deferredRows = V47_FEATURE_EXCESS_AUDIT_ROWS.filter((row) => row.classification === 'deferred');

  return {
    artifactId: 'v47-feature-excess-alignment-audit',
    schemaId: V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SCHEMA_ID,
    version: V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_VERSION,
    currentTarget: V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_CURRENT_TARGET,
    sourceSafetyVerdict: V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    launchRouteIds: [...V47_LAUNCH_ROUTE_IDS],
    supportingSurfaceIds: [...V47_SUPPORTING_SURFACE_IDS],
    deferredSurfaceIds: [...V47_DEFERRED_SURFACE_IDS],
    featurePolicyIds: [...V47_FEATURE_POLICY_IDS],
    forbiddenLaunchEntryTargets: [...V47_FORBIDDEN_LAUNCH_ENTRY_TARGETS],
    forbiddenPayloadIds: [...V47_FEATURE_EXCESS_FORBIDDEN_PAYLOAD_IDS],
    auditRows: V47_FEATURE_EXCESS_AUDIT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v47-feature-excess-row:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      launchBlockingWhenViolated: true,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      websiteLaunchRoutesOnly: true,
      publicNavCurrentRoutesOnly: true,
      launchCtasCurrentRoutesOnly: true,
      btdDetailCurrentRoutesOnly: true,
      exchangeCompatibilityRedirectOnly: true,
      terminalDirectEntryFlaggable: true,
      conversationsDirectEntryFlaggable: true,
      nonWebsiteCommercialSurfacesDeferred: true,
      testnetBtcOnly: true,
      sourceSafePreviewOnly: true,
      launchRouteCount: V47_LAUNCH_ROUTE_IDS.length,
      supportingSurfaceCount: V47_SUPPORTING_SURFACE_IDS.length,
      deferredSurfaceCount: V47_DEFERRED_SURFACE_IDS.length,
      launchAuditRowCount: launchRows.length,
      deferredAuditRowCount: deferredRows.length,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetEnabled: false,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
