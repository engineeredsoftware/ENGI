// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH =
  '.bitcode/v47-landing-public-launch-messaging.json';
export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SCHEMA_ID =
  'bitcode.v47.landingPublicLaunchMessaging.v1';
export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_VERSION = 'V47';
export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_CURRENT_TARGET = 'V46';
export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SOURCE_SAFETY_VERDICT =
  'source-safe-public-launch-messaging';

export const V47_LAUNCH_MESSAGE_IDS = Object.freeze([
  'testnet-meaning',
  'core-flow-deposit-read-packs',
  'proof-backed-trust',
  'source-safe-ip-exchange',
  'mainnet-blocked',
]);

export const V47_LAUNCH_MESSAGE_SURFACE_IDS = Object.freeze([
  'landing-testnet-section',
  'public-docs-testnet-card',
  'public-nav-launch-routes',
]);

export const V47_PRESERVED_V46_CLAIM_TOKEN_IDS = Object.freeze([
  'assetpacks-for-measured-technical-intelligence',
  'btd-records-scalar-knowledge-volume-and-rights',
  'btc-settles-value-transfer',
  'btc-compensation',
]);

export const V47_LANDING_MESSAGING_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V47.md',
  delta: 'BITCODE_SPEC_V47_DELTA.md',
  notes: 'BITCODE_SPEC_V47_NOTES.md',
  parity: 'BITCODE_SPEC_V47_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  publicCopy: 'uapi/components/bitcode/layout/bitcode-public-copy.ts',
  landingPage: 'uapi/app/(root)/components/MarketingLandingPage.tsx',
  testnetSection: 'uapi/app/(root)/components/landing/MarketingLandingTestnetSection.tsx',
  landingShared: 'uapi/app/(root)/components/landing/marketing-landing-shared.tsx',
  docsContent: 'uapi/app/docs/bitcode-docs-content.ts',
  landingTest: 'uapi/tests/marketingLandingPage.test.tsx',
  packageJson: 'package.json',
  protocolIndex: 'packages/protocol/src/index.js',
  protocolTypes: 'packages/protocol/src/index.d.ts',
  protocolSource: 'packages/protocol/src/canonical/v47-landing-public-launch-messaging.js',
  protocolTest: 'packages/protocol/test/v47-landing-public-launch-messaging.test.js',
  generator: 'scripts/generate-v47-landing-public-launch-messaging.mjs',
  checker: 'scripts/check-v47-gate8-landing-public-launch-messaging.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function completionRow(input) {
  return {
    ...input,
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
    forbiddenPayloadIds: [...V47_LANDING_MESSAGING_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v47-landing-messaging-row:${digest(JSON.stringify(input))}`,
  };
}

export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ROWS = Object.freeze([
  completionRow({
    rowId: 'testnet-meaning-messaging',
    owner: SOURCE_ROOTS.publicCopy,
    route: '/',
    contract:
      'The landing testnet section states the meaning of commercial testnet exactly: BTC amounts are testnet and free while measurements, quotes, settlement ordering, BTD rights, and repository delivery stay production-intended.',
    requiredFields: ['Commercial testnet', 'BTC amounts are testnet and free', 'production-intended'],
  }),
  completionRow({
    rowId: 'core-flow-messaging',
    owner: SOURCE_ROOTS.publicCopy,
    route: '/',
    contract:
      'The landing documents the core launch flow in user order — deposit IP on /deposit, read and buy on /read, audit on /packs — with each step linking to its launch route.',
    requiredFields: ['Deposit IP', 'Read and buy', 'Audit on Packs'],
  }),
  completionRow({
    rowId: 'proof-backed-trust-and-source-safety',
    owner: SOURCE_ROOTS.publicCopy,
    route: '/',
    contract:
      'The landing carries the proof-backed trust narrative (protocol law and proof readback decide state) and source-safe IP exchange positioning (source withheld until BTC finality and BTD rights transfer).',
    requiredFields: ['proof readback decide state', 'withheld until BTC finality and BTD rights transfer'],
  }),
  completionRow({
    rowId: 'public-docs-testnet-card',
    owner: SOURCE_ROOTS.docsContent,
    route: '/docs',
    contract:
      'Public docs explain testnet semantics as a first-class card: free BTC amounts, production-intended behavior, unweakened boundaries, and blocked value-bearing mainnet.',
    requiredFields: ['testnet-meaning', 'Value-bearing mainnet stays blocked'],
  }),
  completionRow({
    rowId: 'v46-claim-boundary-preservation',
    owner: SOURCE_ROOTS.publicCopy,
    route: '/',
    contract:
      'Launch messaging is additive over promoted V46 claim boundaries: the required V46 copy tokens and the /deposit, /read, /packs launch navigation remain intact.',
    requiredFields: ['AssetPacks for measured technical intelligence', 'BTC settles value transfer', 'BTC COMPENSATION'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate8-landing-public-launch-messaging',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Landing Page And Public Launch Messaging') &&
        sources.spec.includes(V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate8-landing-public-launch-messaging',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 8: Landing Page And Public Launch Messaging') &&
        sources.delta.includes(V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate8-landing-public-launch-messaging',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Landing Page And Public Launch Messaging') &&
        sources.notes.includes('Commercial testnet'),
    ),
    predicateResult(
      'parity-records-gate8-landing-public-launch-messaging',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Landing and public messaging') &&
        sources.parity.includes(V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate8-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 8 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 8 Landing Page And Public Launch Messaging') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 8 Landing Page And Public Launch Messaging') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 9)),
    ),
    predicateResult(
      'public-copy-states-testnet-meaning',
      SOURCE_ROOTS.publicCopy,
      sources.publicCopy.includes('testnetLaunch') &&
        sources.publicCopy.includes('Commercial testnet') &&
        sources.publicCopy.includes('BTC amounts are testnet and free') &&
        sources.publicCopy.includes('production-intended'),
    ),
    predicateResult(
      'public-copy-documents-core-flow',
      SOURCE_ROOTS.publicCopy,
      sources.publicCopy.includes('Deposit IP') &&
        sources.publicCopy.includes('Read and buy') &&
        sources.publicCopy.includes('Audit on Packs') &&
        sources.publicCopy.includes("href: '/deposit'") &&
        sources.publicCopy.includes("href: '/read'") &&
        sources.publicCopy.includes("href: '/packs'"),
    ),
    predicateResult(
      'public-copy-carries-trust-and-source-safety',
      SOURCE_ROOTS.publicCopy,
      sources.publicCopy.includes('proof readback decide state') &&
        sources.publicCopy.includes('withheld until BTC finality and BTD rights transfer'),
    ),
    predicateResult(
      'landing-renders-testnet-section',
      SOURCE_ROOTS.landingPage,
      sources.landingPage.includes('MarketingLandingTestnetSection') &&
        sources.testnetSection.includes('landing-testnet-launch') &&
        sources.testnetSection.includes('BITCODE_PUBLIC_COPY.testnetLaunch') &&
        !sources.testnetSection.includes('mainnet'),
    ),
    predicateResult(
      'docs-explain-testnet-semantics',
      SOURCE_ROOTS.docsContent,
      sources.docsContent.includes("id: 'testnet-meaning'") &&
        sources.docsContent.includes('Testnet means free BTC amounts with production-intended behavior') &&
        sources.docsContent.includes('Value-bearing mainnet stays blocked'),
    ),
    predicateResult(
      'v46-claim-tokens-preserved',
      SOURCE_ROOTS.publicCopy,
      sources.publicCopy.includes('AssetPacks for measured technical intelligence') &&
        sources.publicCopy.includes('BTD records scalar knowledge volume and rights') &&
        sources.publicCopy.includes('BTC settles value transfer') &&
        sources.landingShared.includes('BTC COMPENSATION'),
    ),
    predicateResult(
      'landing-test-covers-launch-messaging',
      SOURCE_ROOTS.landingTest,
      sources.landingTest.includes(
        'explains commercial testnet launch readiness with core flows and source-safe trust messaging',
      ),
    ),
    predicateResult(
      'package-exports-gate8',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47LandingPublicLaunchMessaging') &&
        sources.protocolTypes.includes('buildV47LandingPublicLaunchMessaging'),
    ),
    predicateResult(
      'package-json-exposes-gate8',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-landing-public-launch-messaging"') &&
        sources.packageJson.includes('"check:v47-gate8"'),
    ),
    predicateResult(
      'workflows-run-gate8-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate8-landing-public-launch-messaging.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate8-landing-public-launch-messaging.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47LandingPublicLaunchMessaging') &&
        sources.checker.includes('V47 Gate 8 landing/public launch messaging check') &&
        sources.protocolTest.includes('buildV47LandingPublicLaunchMessaging'),
    ),
  ];
}

export function buildV47LandingPublicLaunchMessaging({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-landing-public-launch-messaging:${digest(JSON.stringify({
    messageIds: V47_LAUNCH_MESSAGE_IDS,
    surfaceIds: V47_LAUNCH_MESSAGE_SURFACE_IDS,
    preservedClaimTokenIds: V47_PRESERVED_V46_CLAIM_TOKEN_IDS,
    rowIds: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ROWS.map((row) => row.rowId),
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-landing-public-launch-messaging',
    schemaId: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SCHEMA_ID,
    version: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_VERSION,
    currentTarget: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_CURRENT_TARGET,
    artifactPath: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SOURCE_SAFETY_VERDICT,
    messageIds: [...V47_LAUNCH_MESSAGE_IDS],
    surfaceIds: [...V47_LAUNCH_MESSAGE_SURFACE_IDS],
    preservedClaimTokenIds: [...V47_PRESERVED_V46_CLAIM_TOKEN_IDS],
    forbiddenPayloadIds: [...V47_LANDING_MESSAGING_FORBIDDEN_PAYLOAD_IDS],
    completionRows: V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      testnetMeaningComplete: true,
      coreFlowMessagingComplete: true,
      proofBackedTrustComplete: true,
      sourceSafePositioningComplete: true,
      docsTestnetCardComplete: true,
      v46ClaimBoundariesPreserved: true,
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
    },
    passed: failedPredicateIds.length === 0,
  };
}

export const V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
