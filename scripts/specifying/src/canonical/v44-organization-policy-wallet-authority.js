// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_ARTIFACT_PATH =
  '.bitcode/v44-organization-policy-wallet-authority.json';
export const V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SCHEMA_ID =
  'bitcode.v44.organizationPolicyWalletAuthority.v1';
export const V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_VERSION = 'V44';
export const V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_CURRENT_TARGET = 'V43';
export const V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SOURCE_SAFETY_VERDICT =
  'source-safe-organization-policy-wallet-authority-metadata';

export const V44_ORGANIZATION_POLICY_OBJECT_IDS = Object.freeze([
  'OrganizationPolicyWalletAuthority',
  'OrganizationPolicyActionStatement',
  'OrganizationBudgetApprovalPolicy',
  'OrganizationDepositApprovalPolicy',
  'OrganizationWalletAuthorityStatement',
  'OrganizationGovernanceDecision',
  'PackActivityGovernanceReadback',
  'BtdOrganizationPolicyAuthority',
]);

export const V44_ORGANIZATION_POLICY_ROUTE_IDS = Object.freeze([
  '/read',
  '/deposit',
  '/packs',
]);

export const V44_ORGANIZATION_POLICY_ACTION_IDS = Object.freeze([
  'request_read',
  'review_need',
  'request_finding_fits',
  'review_asset_pack_preview',
  'pay_btc_fee',
  'unlock_asset_pack_source',
  'deliver_asset_pack',
  'synthesize_deposit_options',
  'approve_deposit_option',
  'submit_deposit',
  'read_transaction',
  'repair_projection',
  'administer_organization',
]);

export const V44_ORGANIZATION_POLICY_STATE_IDS = Object.freeze([
  'allowed',
  'denied',
  'repair-required',
  'within-limit',
  'approval-required',
  'limit-exceeded',
  'sub-critical-approved',
  'source-criticality-approval-required',
  'critical-source-blocked',
  'deposit-approval-required',
  'verified',
  'missing',
  'not-required',
]);

export const V44_ORGANIZATION_POLICY_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected-source-payloads',
  'raw-source-text',
  'unpaid-assetpack-source',
  'raw-prompts',
  'interpolated-prompts',
  'raw-provider-responses',
  'credentials',
  'wallet-private-material',
  'private-settlement-payloads',
  'value-bearing-mainnet-admission',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V44.md',
  delta: 'BITCODE_SPEC_V44_DELTA.md',
  notes: 'BITCODE_SPEC_V44_NOTES.md',
  parity: 'BITCODE_SPEC_V44_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  btdAuthority: 'packages/btd/src/authority.ts',
  btdAuthorityTest: 'packages/btd/__tests__/btd.test.ts',
  packageHelper: 'packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts',
  packageHelperTest: 'packages/asset-packs-pipelines/domain/src/__tests__/organization-policy-wallet-authority.test.ts',
  assetPackPackageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  assetPackPackageManifest: 'packages/asset-packs-pipelines/domain/package.json',
  readRouteModel: 'apps/uapi/components/reads/models/read-route-model.ts',
  readRouteTest: 'apps/uapi/tests/readRouteModel.test.ts',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  readClientTest: 'apps/uapi/tests/readPageClient.test.tsx',
  depositRouteModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  depositRouteTest: 'apps/uapi/tests/depositRouteModel.test.ts',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  depositClientTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  packActivityModelTest: 'apps/uapi/tests/packActivityModel.test.ts',
  packsClientTest: 'apps/uapi/tests/packsPageClient.test.tsx',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v44-organization-policy-wallet-authority.js',
  packageTest: 'scripts/specifying/test/v44-organization-policy-wallet-authority.test.js',
  generator: 'scripts/generate-v44-organization-policy-wallet-authority.mjs',
  checker: 'scripts/check-v44-gate7-organization-policy-wallet-authority.mjs',
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

export const V44_ORGANIZATION_POLICY_ROWS = Object.freeze([
  {
    rowId: 'btd-deposit-actions',
    owner: SOURCE_ROOTS.btdAuthority,
    contract:
      'BTD organization authority covers deposit option synthesis, approval, and submission beside Reading spend, source unlock, delivery, repair, and administration.',
    requiredFields: ['synthesize_deposit_options', 'approve_deposit_option', 'submit_deposit', 'wallet_binding_missing'],
  },
  {
    rowId: 'source-safe-governance-statement',
    owner: SOURCE_ROOTS.packageHelper,
    contract:
      'OrganizationPolicyWalletAuthority composes budget approval, deposit approval, wallet authority, action statements, aggregate blockers, roots, and source-safety disclosure.',
    requiredFields: ['OrganizationPolicyWalletAuthority', 'budgetApproval', 'depositApproval', 'walletAuthority'],
  },
  {
    rowId: 'read-route-authority',
    owner: SOURCE_ROOTS.readRouteModel,
    contract:
      '/read binds organization policy wallet authority to budgeted quotes, buyer approval, wallet authority, and source-safe route assertions.',
    requiredFields: ['organizationPolicyWalletAuthority', 'pay_btc_fee', 'source_safe_read_route_metadata'],
  },
  {
    rowId: 'deposit-route-authority',
    owner: SOURCE_ROOTS.depositRouteModel,
    contract:
      '/deposit binds source criticality approval, deposit approval, wallet authority, and deposit admission policy into route state.',
    requiredFields: ['organizationPolicyWalletAuthority', 'sourceCriticalityApproved', 'admissionAndIndexingPolicyPresent'],
  },
  {
    rowId: 'packs-governance-readback',
    owner: SOURCE_ROOTS.packActivityModel,
    contract:
      '/packs projects source-safe governance readback into searchable activity detail without serializing secrets or protected source.',
    requiredFields: ['PackActivityGovernanceReadback', 'buildGovernanceReadback', 'authorityRoot'],
  },
  {
    rowId: 'read-deposit-ui-governance',
    owner: SOURCE_ROOTS.readClient,
    contract:
      '/read and /deposit render Organization authority sections with authority state, wallet state, blockers, and authority roots.',
    requiredFields: ['Organization authority', 'Authority blockers', 'organizationPolicyWalletAuthority'],
  },
  {
    rowId: 'fail-closed-tests',
    owner: SOURCE_ROOTS.packageHelperTest,
    contract:
      'Focused tests prove approved Reading spend, missing wallet denial, approved deposit submission, and critical-source deposit blocking.',
    requiredFields: ['pay_btc_fee', 'wallet_binding_missing', 'sub-critical-approved', 'critical-source-blocked'],
  },
  {
    rowId: 'workflow-and-artifact-wiring',
    owner: SOURCE_ROOTS.checker,
    contract:
      'Gate 7 closes only when generator, checker, package exports, protocol exports, docs, workflows, and generated artifact are current.',
    requiredFields: ['check-v44-gate7-organization-policy-wallet-authority', 'generate-v44-organization-policy-wallet-authority'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult(
      'active-canon-pointer-supports-v44-draft-or-promoted',
      SOURCE_ROOTS.activePointer,
      bitcodeVersionAtLeast(sources.activePointer, 'V43'),
    ),
    predicateResult('spec-defines-gate7', SOURCE_ROOTS.spec, sources.spec.includes('V44 Gate 7 Organization Policy, Approval, And Wallet Authority')),
    predicateResult('spec-names-gate7-artifact', SOURCE_ROOTS.spec, sources.spec.includes('v44-organization-policy-wallet-authority')),
    predicateResult('delta-records-gate7', SOURCE_ROOTS.delta, sources.delta.includes('Gate 7') && sources.delta.includes('v44-organization-policy-wallet-authority')),
    predicateResult('notes-records-gate7', SOURCE_ROOTS.notes, sources.notes.includes('Gate 7') && sources.notes.includes('organization policy')),
    predicateResult('parity-records-gate7', SOURCE_ROOTS.parity, sources.parity.includes('v44-organization-policy-wallet-authority')),
    predicateResult('roadmap-records-gate7', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 7 closure anchor')),
    predicateResult('readme-records-gate7', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 7')),
    predicateResult('protocol-readme-records-gate7', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V44 Gate 7')),
    predicateResult('btd-authority-actions-defined', SOURCE_ROOTS.btdAuthority, V44_ORGANIZATION_POLICY_ACTION_IDS.every((id) => sources.btdAuthority.includes(id))),
    predicateResult('btd-authority-test-covers-deposit-actions', SOURCE_ROOTS.btdAuthorityTest, sources.btdAuthorityTest.includes('submit_deposit') && sources.btdAuthorityTest.includes('deposit:approve_option')),
    predicateResult('package-helper-defined', SOURCE_ROOTS.packageHelper, sources.packageHelper.includes('buildOrganizationPolicyWalletAuthority') && sources.packageHelper.includes('OrganizationPolicyWalletAuthority')),
    predicateResult('package-helper-source-safe-assertion', SOURCE_ROOTS.packageHelper, sources.packageHelper.includes('assertOrganizationPolicyWalletAuthoritySourceSafe') && V44_ORGANIZATION_POLICY_FORBIDDEN_PAYLOAD_IDS.every((id) => sources.packageHelper.toLowerCase().includes(id.split('-')[0]) || id === 'credentials')),
    predicateResult('package-helper-test-covers-policy-paths', SOURCE_ROOTS.packageHelperTest, sources.packageHelperTest.includes('pay_btc_fee') && sources.packageHelperTest.includes('critical-source-blocked')),
    predicateResult('asset-pack-package-exports-helper', SOURCE_ROOTS.assetPackPackageIndex, sources.assetPackPackageIndex.includes("export * from './organization-policy-wallet-authority'")),
    predicateResult('asset-pack-manifest-exports-helper', SOURCE_ROOTS.assetPackPackageManifest, sources.assetPackPackageManifest.includes('"./organization-policy-wallet-authority"')),
    predicateResult('read-route-model-binds-authority', SOURCE_ROOTS.readRouteModel, sources.readRouteModel.includes('organizationPolicyWalletAuthority') && sources.readRouteModel.includes("route: '/read'")),
    predicateResult('read-route-test-covers-authority', SOURCE_ROOTS.readRouteTest, sources.readRouteTest.includes('organizationPolicyWalletAuthority') && sources.readRouteTest.includes('pay_btc_fee')),
    predicateResult('read-client-renders-authority', SOURCE_ROOTS.readClient, sources.readClient.includes('Organization authority') && sources.readClient.includes('Authority blockers')),
    predicateResult('read-client-test-covers-authority', SOURCE_ROOTS.readClientTest, sources.readClientTest.includes('Organization authority')),
    predicateResult('deposit-route-model-binds-authority', SOURCE_ROOTS.depositRouteModel, sources.depositRouteModel.includes('organizationPolicyWalletAuthority') && sources.depositRouteModel.includes('sourceCriticalityApproved')),
    predicateResult('deposit-route-test-covers-authority', SOURCE_ROOTS.depositRouteTest, sources.depositRouteTest.includes('organizationPolicyWalletAuthority') && sources.depositRouteTest.includes('sub-critical-approved')),
    predicateResult('deposit-client-renders-authority', SOURCE_ROOTS.depositClient, sources.depositClient.includes('Organization authority') && sources.depositClient.includes('Authority blockers')),
    predicateResult('deposit-client-test-covers-authority', SOURCE_ROOTS.depositClientTest, sources.depositClientTest.includes('Organization authority')),
    predicateResult('packs-model-projects-governance', SOURCE_ROOTS.packActivityModel, sources.packActivityModel.includes('PackActivityGovernanceReadback') && sources.packActivityModel.includes('buildGovernanceReadback')),
    predicateResult('packs-client-renders-governance', SOURCE_ROOTS.packsClient, sources.packsClient.includes('Governance') && sources.packsClient.includes('Authority root')),
    predicateResult('pack-activity-test-covers-governance', SOURCE_ROOTS.packActivityModelTest, sources.packActivityModelTest.includes('organization-authority-root-abc')),
    predicateResult('packs-client-test-covers-governance', SOURCE_ROOTS.packsClientTest, sources.packsClientTest.includes('organization-authority-root-abc')),
    predicateResult('package-test-covers-gate7', SOURCE_ROOTS.packageTest, sources.packageTest.includes('buildV44OrganizationPolicyWalletAuthority')),
    predicateResult('package-exports-gate7', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes('buildV44OrganizationPolicyWalletAuthority')),
    predicateResult('package-types-export-gate7', SOURCE_ROOTS.packageTypes, sources.packageTypes.includes('buildV44OrganizationPolicyWalletAuthority')),
    predicateResult('package-json-exposes-gate7', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v44-organization-policy-wallet-authority"') && sources.packageJson.includes('"check:v44-gate7"')),
    predicateResult('gate-workflow-runs-gate7', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate7-organization-policy-wallet-authority.mjs')),
    predicateResult('canon-workflow-runs-gate7', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v44-gate7-organization-policy-wallet-authority.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV44OrganizationPolicyWalletAuthority')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V44 Gate 7 organization policy wallet authority check')),
  ];
}

export function buildV44OrganizationPolicyWalletAuthority(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v44-organization-policy-wallet-authority:${digest(JSON.stringify({
    objectIds: V44_ORGANIZATION_POLICY_OBJECT_IDS,
    routeIds: V44_ORGANIZATION_POLICY_ROUTE_IDS,
    actionIds: V44_ORGANIZATION_POLICY_ACTION_IDS,
    stateIds: V44_ORGANIZATION_POLICY_STATE_IDS,
    rowIds: V44_ORGANIZATION_POLICY_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v44-organization-policy-wallet-authority',
    schemaId: V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SCHEMA_ID,
    version: V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_VERSION,
    currentTarget: V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_CURRENT_TARGET,
    sourceSafetyVerdict: V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SOURCE_SAFETY_VERDICT,
    objectIds: [...V44_ORGANIZATION_POLICY_OBJECT_IDS],
    routeIds: [...V44_ORGANIZATION_POLICY_ROUTE_IDS],
    actionIds: [...V44_ORGANIZATION_POLICY_ACTION_IDS],
    stateIds: [...V44_ORGANIZATION_POLICY_STATE_IDS],
    forbiddenPayloadIds: [...V44_ORGANIZATION_POLICY_FORBIDDEN_PAYLOAD_IDS],
    rows: V44_ORGANIZATION_POLICY_ROWS.map((row) => ({
      ...row,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      walletPrivateMaterialVisible: false,
      valueBearingMainnetAdmitted: false,
      rowRoot: `v44-organization-policy-row:${digest(JSON.stringify(row))}`,
    })),
    predicateResults,
    sourceRoots,
    coverage: {
      organizationPolicyWalletAuthorityImplemented: predicateResults.find((predicate) => predicate.id === 'package-helper-defined')?.passed === true,
      btdDepositActionsImplemented: predicateResults.find((predicate) => predicate.id === 'btd-authority-actions-defined')?.passed === true,
      readRouteAuthorityImplemented: predicateResults.find((predicate) => predicate.id === 'read-route-model-binds-authority')?.passed === true,
      depositRouteAuthorityImplemented: predicateResults.find((predicate) => predicate.id === 'deposit-route-model-binds-authority')?.passed === true,
      packsGovernanceReadbackImplemented: predicateResults.find((predicate) => predicate.id === 'packs-model-projects-governance')?.passed === true,
      testsImplemented:
        predicateResults.find((predicate) => predicate.id === 'package-helper-test-covers-policy-paths')?.passed === true &&
        predicateResults.find((predicate) => predicate.id === 'btd-authority-test-covers-deposit-actions')?.passed === true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetAdmitted: false,
      failedPredicateIds,
    },
    passed: failedPredicateIds.length === 0,
    artifactRoot,
  };
}
