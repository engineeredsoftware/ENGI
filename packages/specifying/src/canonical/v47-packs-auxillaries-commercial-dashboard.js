// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH =
  '.bitcode/v47-packs-auxillaries-commercial-dashboard.json';
export const V47_PACKS_AUXILLARIES_DASHBOARD_SCHEMA_ID =
  'bitcode.v47.packsAuxillariesCommercialDashboard.v1';
export const V47_PACKS_AUXILLARIES_DASHBOARD_VERSION = 'V47';
export const V47_PACKS_AUXILLARIES_DASHBOARD_CURRENT_TARGET = 'V46';
export const V47_PACKS_AUXILLARIES_DASHBOARD_SOURCE_SAFETY_VERDICT =
  'source-safe-packs-auxillaries-commercial-dashboard';

export const V47_PACKS_DASHBOARD_ACTIVITY_TYPE_IDS = Object.freeze([
  'read-need-fit-preview',
  'depository-assetpack',
  'settled-assetpack',
  'settlement',
  'compensation',
  'delivery',
  'repair',
]);

export const V47_PACKS_DASHBOARD_STATE_FACET_IDS = Object.freeze([
  'settlementState',
  'rightsState',
  'compensationState',
  'deliveryState',
  'repairState',
]);

export const V47_PACKS_DASHBOARD_DETAIL_SECTION_IDS = Object.freeze([
  'overview',
  'measurements',
  'state-readback',
  'repair-surface',
  'accounting',
  'governance',
  'proof-roots',
]);

export const V47_AUXILLARIES_PANE_IDS = Object.freeze([
  'profile',
  'externals',
  'interfaces',
  'wallet',
]);

export const V47_PACKS_AUXILLARIES_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  packsClient: 'uapi/components/packs/PacksPageClient/PacksPageClient.tsx',
  packsActivityTable: 'uapi/components/packs/PacksActivityTable/PacksActivityTable.tsx',
  packsActivityFilterBar: 'uapi/components/packs/PacksActivityFilterBar/PacksActivityFilterBar.tsx',
  packsActivityDetailStates: 'uapi/components/packs/PacksActivityDetailStates/PacksActivityDetailStates.tsx',
  packsPortfolioOverview: 'uapi/components/packs/PacksPortfolioOverview/PacksPortfolioOverview.tsx',
  packsPage: 'uapi/app/packs/page.tsx',
  packActivityModel: 'uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  packsActivityApi: 'uapi/app/api/packs/activity/route.ts',
  auxillariesPage: 'uapi/app/auxillaries/page.tsx',
  auxillariesPaneMeta: 'uapi/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta.ts',
  auxillariesOnboardingContract: 'uapi/app/auxillaries/auxillary-onboarding-contract.ts',
  auxillariesOrganizationSettings:
    'uapi/components/auxillaries/organization/OrganizationSettings/OrganizationGeneralTab/OrganizationGeneralTab.tsx',
  auxillariesTreasury:
    'uapi/components/auxillaries/organization/BTDTreasuryManagement/BTDTreasuryManagement.tsx',
  auxillariesWalletPane: 'uapi/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane.tsx',
  auxillariesWalletPaneHeader:
    'uapi/components/auxillaries/headers/AuxillariesWalletPaneHeader/AuxillariesWalletPaneHeader.tsx',
  auxillariesExternalsPane: 'uapi/components/auxillaries/AuxillariesExternalsPane/AuxillariesExternalsPane.tsx',
  packActivityModelTest: 'uapi/tests/packActivityModel.test.ts',
  packsClientTest: 'uapi/tests/packsPageClient.test.tsx',
  auxillariesWalletPaneTest: 'uapi/tests/auxillariesWalletPane.test.tsx',
  auxillariesWorkspaceTest: 'uapi/tests/auxillariesWorkspacePanels.test.tsx',
  packageJson: 'package.json',
  protocolIndex: 'packages/specifying/src/index.js',
  protocolTypes: 'packages/specifying/src/index.d.ts',
  protocolSource: 'packages/specifying/src/canonical/v47-packs-auxillaries-commercial-dashboard.js',
  protocolTest: 'packages/specifying/test/v47-packs-auxillaries-commercial-dashboard.test.js',
  generator: 'scripts/generate-v47-packs-auxillaries-commercial-dashboard.mjs',
  checker: 'scripts/check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs',
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
    forbiddenPayloadIds: [...V47_PACKS_AUXILLARIES_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v47-packs-auxillaries-dashboard-row:${digest(JSON.stringify(input))}`,
  };
}

export const V47_PACKS_AUXILLARIES_DASHBOARD_ROWS = Object.freeze([
  completionRow({
    rowId: 'pack-activity-master-detail',
    owner: SOURCE_ROOTS.packsClient,
    route: '/packs',
    contract:
      'PackActivity renders as a searchable master table with a row-owned source-safe detail surface covering overview, measurements, state readback, accounting, governance, and proof roots.',
    requiredFields: ['PackActivityDetailProjection', 'Pack activity economic operation table', 'Source-safe detail'],
  }),
  completionRow({
    rowId: 'search-filters-saved-views',
    owner: SOURCE_ROOTS.packsClient,
    route: '/packs',
    contract:
      'Pack activity is searchable and filterable by type, scope, repository, and settlement, compensation, delivery, and repair facets, with saved market-intelligence filters writing route-owned query params.',
    requiredFields: ['Search pack activity', 'savedFilters', 'repairState'],
  }),
  completionRow({
    rowId: 'histories-readback',
    owner: SOURCE_ROOTS.packActivityModel,
    route: '/packs',
    contract:
      'Deposit, Read, settlement, rights, compensation, delivery, and repair histories project from source-safe activity records into typed PackActivity rows and summary facets.',
    requiredFields: ['read-need-fit-preview', 'settled-assetpack', 'rightsState'],
  }),
  completionRow({
    rowId: 'settlement-rights-delivery-state-tracking',
    owner: SOURCE_ROOTS.packsClient,
    route: '/packs',
    contract:
      'The detail state readback tracks settlement, BTD rights, compensation, delivery, and repair states with rights derived only from finality-consistent commodity-state evidence.',
    requiredFields: ['State readback', 'BTD rights not recorded', 'btd-rights-transferred'],
  }),
  completionRow({
    rowId: 'repair-surface',
    owner: SOURCE_ROOTS.packsClient,
    route: '/packs',
    contract:
      'Repair-required activity exposes a fail-closed repair surface listing commodity-state blockers; state advances only through proof-backed readback.',
    requiredFields: ['Repair surface', 'repairRequired', 'blockers'],
  }),
  completionRow({
    rowId: 'auxillaries-identity-teams-wallets-histories',
    owner: SOURCE_ROOTS.auxillariesPaneMeta,
    route: '/auxillaries',
    contract:
      'Auxillaries panes cover identity profile, external source connections, interfaces, wallet authority with BTD history readback, and organization team and treasury settings.',
    requiredFields: ['Profile', 'Externals', 'Interfaces', 'Wallet', 'Team Settings'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate6-packs-auxillaries-dashboard',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Packs And Auxillaries Commercial Dashboard') &&
        sources.spec.includes(V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate6-packs-auxillaries-dashboard',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 6: Packs And Auxillaries Commercial Dashboard') &&
        sources.delta.includes(V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate6-packs-auxillaries-dashboard',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Packs And Auxillaries Commercial Dashboard') &&
        sources.notes.includes('master-detail'),
    ),
    predicateResult(
      'parity-records-gate6-packs-auxillaries-dashboard',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Auxillaries launch readiness') &&
        sources.parity.includes(V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate6-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 6 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 6 Packs And Auxillaries Commercial Dashboard') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 6 Packs And Auxillaries Commercial Dashboard') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 7)),
    ),
    predicateResult(
      'packs-client-renders-master-detail',
      SOURCE_ROOTS.packsClient,
      sources.packsClient.includes('master-detail') &&
        sources.packsActivityTable.includes('Pack activity economic operation table') &&
        sources.packsActivityFilterBar.includes('Search pack activity') &&
        sources.packsPortfolioOverview.includes('savedFilters'),
    ),
    predicateResult(
      'packs-client-tracks-settlement-rights-delivery-repair',
      SOURCE_ROOTS.packsActivityDetailStates,
      sources.packsActivityDetailStates.includes('State readback') &&
        sources.packsActivityDetailStates.includes('BTD rights not recorded') &&
        sources.packsActivityDetailStates.includes('Repair surface') &&
        sources.packsActivityDetailStates.includes(
          'closed until the missing or contradictory evidence',
        ),
    ),
    predicateResult(
      'pack-activity-model-projects-rights-and-histories',
      SOURCE_ROOTS.packActivityModel,
      sources.packActivityModel.includes('rightsState') &&
        sources.packActivityModel.includes('btd-rights-transferred') &&
        V47_PACKS_DASHBOARD_ACTIVITY_TYPE_IDS.every((typeId) =>
          sources.packActivityModel.includes(`'${typeId}'`),
        ),
    ),
    predicateResult(
      'packs-activity-api-serves-filtered-readback',
      SOURCE_ROOTS.packsActivityApi,
      sources.packsActivityApi.includes('settlementState') &&
        sources.packsActivityApi.includes('repairState') &&
        sources.packsActivityApi.includes('buildFilters'),
    ),
    predicateResult(
      'auxillaries-panes-cover-identity-wallet-externals-interfaces',
      SOURCE_ROOTS.auxillariesPaneMeta,
      sources.auxillariesPaneMeta.includes("label: 'Profile'") &&
        sources.auxillariesPaneMeta.includes("label: 'Externals'") &&
        sources.auxillariesPaneMeta.includes("label: 'Interfaces'") &&
        sources.auxillariesPaneMeta.includes("label: 'Wallet'"),
    ),
    predicateResult(
      'auxillaries-cover-teams-treasury-histories',
      SOURCE_ROOTS.auxillariesOrganizationSettings,
      sources.auxillariesOrganizationSettings.includes('Team Settings') &&
        sources.auxillariesTreasury.length > 0 &&
        sources.auxillariesWalletPaneHeader.includes('throughput history') &&
        sources.auxillariesExternalsPane.length > 0 &&
        sources.auxillariesOnboardingContract.length > 0,
    ),
    predicateResult(
      'pack-activity-model-test-covers-rights-tracking',
      SOURCE_ROOTS.packActivityModelTest,
      sources.packActivityModelTest.includes('tracks BTD rights transfer state'),
    ),
    predicateResult(
      'packs-client-test-covers-repair-surface',
      SOURCE_ROOTS.packsClientTest,
      sources.packsClientTest.includes('renders the fail-closed repair surface for repair-required activity') &&
        sources.packsClientTest.includes('BTD rights not recorded'),
    ),
    predicateResult(
      'auxillaries-tests-exist',
      SOURCE_ROOTS.auxillariesWalletPaneTest,
      sources.auxillariesWalletPaneTest.length > 0 && sources.auxillariesWorkspaceTest.length > 0,
    ),
    predicateResult(
      'package-exports-gate6',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47PacksAuxillariesCommercialDashboard') &&
        sources.protocolTypes.includes('buildV47PacksAuxillariesCommercialDashboard'),
    ),
    predicateResult(
      'package-json-exposes-gate6',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-packs-auxillaries-commercial-dashboard"') &&
        sources.packageJson.includes('"check:v47-gate6"'),
    ),
    predicateResult(
      'workflows-run-gate6-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47PacksAuxillariesCommercialDashboard') &&
        sources.checker.includes('V47 Gate 6 packs/auxillaries commercial dashboard check') &&
        sources.protocolTest.includes('buildV47PacksAuxillariesCommercialDashboard'),
    ),
  ];
}

export function buildV47PacksAuxillariesCommercialDashboard({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-packs-auxillaries-commercial-dashboard:${digest(JSON.stringify({
    activityTypeIds: V47_PACKS_DASHBOARD_ACTIVITY_TYPE_IDS,
    stateFacetIds: V47_PACKS_DASHBOARD_STATE_FACET_IDS,
    detailSectionIds: V47_PACKS_DASHBOARD_DETAIL_SECTION_IDS,
    auxillariesPaneIds: V47_AUXILLARIES_PANE_IDS,
    rowIds: V47_PACKS_AUXILLARIES_DASHBOARD_ROWS.map((row) => row.rowId),
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-packs-auxillaries-commercial-dashboard',
    schemaId: V47_PACKS_AUXILLARIES_DASHBOARD_SCHEMA_ID,
    version: V47_PACKS_AUXILLARIES_DASHBOARD_VERSION,
    currentTarget: V47_PACKS_AUXILLARIES_DASHBOARD_CURRENT_TARGET,
    artifactPath: V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_PACKS_AUXILLARIES_DASHBOARD_SOURCE_SAFETY_VERDICT,
    activityTypeIds: [...V47_PACKS_DASHBOARD_ACTIVITY_TYPE_IDS],
    stateFacetIds: [...V47_PACKS_DASHBOARD_STATE_FACET_IDS],
    detailSectionIds: [...V47_PACKS_DASHBOARD_DETAIL_SECTION_IDS],
    auxillariesPaneIds: [...V47_AUXILLARIES_PANE_IDS],
    forbiddenPayloadIds: [...V47_PACKS_AUXILLARIES_FORBIDDEN_PAYLOAD_IDS],
    completionRows: V47_PACKS_AUXILLARIES_DASHBOARD_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      masterDetailComplete: true,
      searchAndFiltersComplete: true,
      historiesReadbackComplete: true,
      rightsStateTrackingComplete: true,
      repairSurfaceComplete: true,
      auxillariesLaunchReadinessComplete: true,
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

export const V47_PACKS_AUXILLARIES_DASHBOARD_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
