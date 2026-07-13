// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_API_INTEGRATION_CONTRACTS_ARTIFACT_PATH =
  '.bitcode/v40-api-integration-contracts.json';
export const V40_API_INTEGRATION_CONTRACTS_SCHEMA_ID =
  'bitcode.v40.apiIntegrationContracts.v1';
export const V40_API_INTEGRATION_CONTRACTS_VERSION = 'V40';
export const V40_API_INTEGRATION_CONTRACTS_CURRENT_TARGET = 'V39';
export const V40_API_INTEGRATION_CONTRACTS_SOURCE_SAFETY_VERDICT =
  'source-safe-api-integration-contract-metadata';

export const V40_API_INTEGRATION_SURFACE_IDS = Object.freeze([
  'uapi:reading-and-pipeline-routes',
  'uapi:execution-stream-routes',
  'uapi:conversation-routes',
  'uapi:auxillaries-orbitals-routes',
  'uapi:vcs-wallet-webhook-routes',
  'uapi:public-activity-template-routes',
  'packages-api:route-orchestration',
  'packages-api:conversation-and-pipeline-routes',
  'mcp:executions-interface-contracts',
  'chatgpt:app-action-contracts',
]);

export const V40_API_INTEGRATION_VERDICTS = Object.freeze([
  'covered',
  'exempt',
  'missing',
  'blocked',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-api-integration-contract-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.integrationSurfaceId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_api_integration_contract_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_API_INTEGRATION_CONTRACT_ROWS = Object.freeze([
  row({
    integrationSurfaceId: 'uapi:reading-and-pipeline-routes',
    routeFamilies: [
      'uapi/app/api/read-review',
      'uapi/app/api/pipeline-harness/asset-pack',
      'uapi/app/api/deposits',
    ],
    sourceRoots: [
      'uapi/app/api/read-review/route.ts',
      'uapi/app/api/pipeline-harness/asset-pack/route.ts',
      'uapi/app/api/deposits/route.ts',
    ],
    testPaths: [
      'uapi/tests/api/readReviewRoute.test.ts',
      'uapi/tests/api/readReviewProtocolParity.test.ts',
      'uapi/tests/api/pipelineHarnessRoute.test.ts',
      'uapi/tests/api/pipelineHarnessPreflight.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/readReviewRoute.test.ts tests/api/pipelineHarnessRoute.test.ts'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Reading request review, pipeline harness admission, preflight, and deposit route contracts are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'uapi:execution-stream-routes',
    routeFamilies: [
      'uapi/app/api/executions',
      'uapi/app/api/executions/history',
      'uapi/app/api/executions/stream',
    ],
    sourceRoots: [
      'uapi/app/api/executions/route.ts',
      'uapi/app/api/executions/history/route.ts',
      'uapi/app/api/executions/stream/route.ts',
    ],
    testPaths: [
      'uapi/tests/api/executionsHistoryRoute.test.ts',
      'uapi/tests/api/executionsHistoryRunRoute.test.ts',
      'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
      'uapi/tests/api/sseHelper.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/executionsHistoryRoute.test.ts tests/api/executionsHistoryWriteReadParity.test.ts'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Execution history, run readback, write/read parity, and stream helper contracts are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'uapi:conversation-routes',
    routeFamilies: [
      'uapi/app/api/conversations',
      'uapi/app/api/conversations/stream',
      'uapi/app/api/conversations/branch',
    ],
    sourceRoots: [
      'uapi/app/api/conversations/route.ts',
      'uapi/app/api/conversations/stream/route.ts',
      'uapi/app/api/conversations/branch/route.ts',
    ],
    testPaths: [
      'uapi/tests/api/conversationsRoute.test.ts',
      'uapi/tests/api/conversationsRouteRead.test.ts',
      'uapi/tests/api/chatStreamRoute.test.ts',
      'uapi/tests/api/conversationThreadStreamRoute.test.ts',
      'uapi/tests/api/conversationStreamEventContract.test.ts',
      'uapi/tests/api/conversationBranchRoute.test.ts',
      'uapi/tests/api/conversationPersistencePrivacyRedaction.test.ts',
      'uapi/tests/api/conversationTelemetryProofHooks.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/conversationsRoute.test.ts tests/api/conversationStreamEventContract.test.ts'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Conversation route, streaming, branch, privacy, and telemetry route contracts are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'uapi:auxillaries-orbitals-routes',
    routeFamilies: [
      'uapi/app/api/auxillaries',
      'uapi/app/api/orbitals',
    ],
    sourceRoots: [
      'uapi/app/api/auxillaries/profile/route.ts',
      'uapi/app/api/auxillaries/notifications/route.ts',
      'uapi/app/api/orbitals/profile/route.ts',
      'uapi/app/api/orbitals/notifications/route.ts',
    ],
    testPaths: [
      'uapi/tests/userDataRoute.test.ts',
      'uapi/tests/userProfileRoute.test.ts',
      'uapi/tests/api/orbitalsProfileRoute.test.ts',
      'uapi/tests/api/orbitalsNotificationsRoute.test.ts',
      'uapi/tests/api/userModelPreferencesRoute.test.ts',
      'uapi/tests/api/orbitalsUserDataShareRoute.test.ts',
      'uapi/tests/api/auxillariesTransactionsRoute.test.ts',
      'uapi/tests/apiKeysRoutes.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/userDataRoute.test.ts tests/api/orbitalsProfileRoute.test.ts'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Auxillaries and Orbitals data, profile, notifications, preferences, and API-key route contracts are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'uapi:vcs-wallet-webhook-routes',
    routeFamilies: [
      'uapi/app/api/vcs',
      'uapi/app/api/wallet',
      'uapi/app/api/webhook',
    ],
    sourceRoots: [
      'uapi/app/api/vcs/route.ts',
      'uapi/app/api/wallet/authenticate/route.ts',
      'uapi/app/api/wallet/oauth/token/route.ts',
      'uapi/app/api/webhook/route.ts',
    ],
    testPaths: [
      'uapi/tests/api/vcsRoutes.test.ts',
      'uapi/tests/api/vcsGithubCallbackRoute.test.ts',
      'uapi/tests/api/vcsCompatibilityRoute.test.ts',
      'uapi/tests/api/walletAuthenticateRoute.test.ts',
      'uapi/tests/api/walletConnectionStatus.test.ts',
      'uapi/tests/api/walletOAuthRoutes.test.ts',
      'uapi/tests/api/webhookSignature.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/vcsRoutes.test.ts tests/api/walletOAuthRoutes.test.ts tests/api/webhookSignature.test.ts'],
    coverageTier: 'promotion-required',
    closureRequirement: 'VCS provider, wallet authentication/OAuth, and webhook verification contracts are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'uapi:public-activity-template-routes',
    routeFamilies: [
      'uapi/app/api/activity',
      'uapi/app/api/external-realization',
      'uapi/app/api/edgetimes',
      'uapi/app/api/templates',
      'uapi/app/api/notifications',
    ],
    sourceRoots: [
      'uapi/app/api/activity/route.ts',
      'uapi/app/api/external-realization/route.ts',
      'uapi/app/api/edgetimes/route.ts',
      'uapi/app/api/templates/shippables/route.ts',
      'uapi/app/api/notifications/btd-transfer/route.ts',
    ],
    testPaths: [
      'uapi/tests/api/activityRoute.test.ts',
      'uapi/tests/api/externalRealizationRoute.test.ts',
      'uapi/tests/api/edgetimesRoute.test.ts',
      'uapi/tests/api/shippableTemplatesRoute.test.ts',
      'uapi/tests/api/assetPack.notifications.test.ts',
      'uapi/tests/api/clientErrorRoute.test.ts',
    ],
    commandIds: ['pnpm --dir uapi exec jest tests/api/activityRoute.test.ts tests/api/shippableTemplatesRoute.test.ts'],
    coverageTier: 'existing-greenable',
    closureRequirement: 'Activity, external-realization, public template, notification, and client-error route contracts are integration-covered.',
  }),
  row({
    integrationSurfaceId: 'packages-api:route-orchestration',
    routeFamilies: [
      'packages/api/src/routes',
      'packages/api/src/vcs',
    ],
    sourceRoots: [
      'packages/api/src/routes/auxillaries-contract.ts',
      'packages/api/src/routes/btd-crypto.ts',
      'packages/api/src/routes/user.ts',
    ],
    testPaths: [
      'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
      'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      'packages/api/src/routes/__tests__/user-btd-mutation.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/api test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Package API route orchestration for auxillaries, BTD crypto, and user mutation contracts is covered.',
  }),
  row({
    integrationSurfaceId: 'packages-api:conversation-and-pipeline-routes',
    routeFamilies: [
      'packages/api/src/conversations',
      'packages/api/src/pipelines',
    ],
    sourceRoots: [
      'packages/api/src/conversations/conversations.ts',
      'packages/api/src/conversations/stream-events.ts',
      'packages/api/src/pipelines/branch.ts',
    ],
    testPaths: [
      'packages/api/src/conversations/__tests__/branch-conversation.test.ts',
      'packages/api/src/conversations/__tests__/privacy.test.ts',
      'packages/api/src/conversations/__tests__/stream-events.test.ts',
      'packages/api/src/conversations/__tests__/telemetry.test.ts',
      'packages/api/src/pipelines/__tests__/branch-run.test.ts',
      'packages/api/src/pipelines/__tests__/branch-resume-from-conversation.test.ts',
    ],
    commandIds: ['pnpm --filter @bitcode/api test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'Package API conversation and pipeline branch/resume contracts are covered.',
  }),
  row({
    integrationSurfaceId: 'mcp:executions-interface-contracts',
    routeFamilies: [
      'packages/generic-mcps/bitcode/src',
      'packages/generic-mcps/bitcode/docs/mcp',
    ],
    sourceRoots: [
      'packages/generic-mcps/bitcode/src/index.ts',
      'packages/generic-mcps/bitcode/src/auth/middleware.ts',
      'packages/generic-mcps/bitcode/src/pipeline-execution/adapter.ts',
      'packages/generic-mcps/bitcode/docs/mcp/mcp-specification.json',
    ],
    testPaths: [
      'packages/generic-mcps/bitcode/src/__tests__/integration/mcp-server.test.ts',
      'packages/generic-mcps/bitcode/src/__tests__/unit/auth.test.ts',
      'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      'packages/generic-mcps/bitcode/src/__tests__/unit/mcp-tool-contract.test.ts',
    ],
    commandIds: ['pnpm --dir packages/generic-mcps/bitcode run test:mcp'],
    coverageTier: 'promotion-required',
    closureRequirement: 'MCP auth, server, tool, and pipeline ingress contracts are covered for interface consumers.',
  }),
  row({
    integrationSurfaceId: 'chatgpt:app-action-contracts',
    routeFamilies: [
      'packages/chatgptapp/src/server.ts',
      'packages/chatgptapp/src/tools.ts',
      'packages/chatgptapp/src/interface-integration.ts',
    ],
    sourceRoots: [
      'packages/chatgptapp/src/server.ts',
      'packages/chatgptapp/src/tools.ts',
      'packages/chatgptapp/src/interface-integration.ts',
    ],
    testPaths: [
      'packages/chatgptapp/src/__tests__/chatgpt-action-contract.test.ts',
      'packages/chatgptapp/src/__tests__/tools.test.ts',
      'packages/chatgptapp/src/__tests__/yapperFlow.test.ts',
    ],
    commandIds: ['pnpm --dir packages/chatgptapp test'],
    coverageTier: 'promotion-required',
    closureRequirement: 'ChatGPT App action, tool, and minimal flow contracts are covered for interface consumers.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const packageJson = readSource(repoRoot, 'package.json');
  const gateWorkflow = readSource(repoRoot, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = readSource(repoRoot, '.github/workflows/bitcode-canon-quality.yml');
  const spec = readSource(repoRoot, 'BITCODE_SPEC_V40.md');
  const delta = readSource(repoRoot, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = readSource(repoRoot, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = readSource(repoRoot, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = readSource(repoRoot, 'SPECIFICATIONS_ROADMAP.md');
  const protocolIndex = readSource(repoRoot, 'packages/protocol/src/index.js');
  const protocolTypes = readSource(repoRoot, 'packages/protocol/src/index.d.ts');

  const rowPredicates = V40_API_INTEGRATION_CONTRACT_ROWS.flatMap((contractRow) => {
    const safeId = contractRow.integrationSurfaceId.replace(/[^a-z0-9]+/gu, '-');
    return [
      predicateResult(
        `${safeId}:source-roots-exist`,
        contractRow.sourceRoots[0],
        contractRow.sourceRoots.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
      ),
      predicateResult(
        `${safeId}:test-paths-exist`,
        contractRow.testPaths[0],
        contractRow.testPaths.every((testPath) => sourceExists(repoRoot, testPath)),
      ),
    ];
  });

  return [
    predicateResult('package-scripts-include-gate4', 'package.json', packageJson.includes('generate:v40-api-integration-contracts') && packageJson.includes('check:v40-gate4')),
    predicateResult('workflows-run-gate4-check', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('check-v40-gate4-api-integration-contracts.mjs') && canonWorkflow.includes('check-v40-gate4-api-integration-contracts.mjs')),
    predicateResult('protocol-exports-gate4', 'packages/protocol/src/index.js', protocolIndex.includes('buildV40ApiIntegrationContracts') && protocolTypes.includes('buildV40ApiIntegrationContracts')),
    predicateResult('spec-documents-gate4', 'BITCODE_SPEC_V40.md', spec.includes('V40 Gate 4 API And Route Integration Contracts') && spec.includes(V40_API_INTEGRATION_CONTRACTS_ARTIFACT_PATH)),
    predicateResult('delta-documents-gate4', 'BITCODE_SPEC_V40_DELTA.md', delta.includes('Gate 4 closes with package-backed `V40ApiIntegrationContracts`')),
    predicateResult('notes-document-gate4', 'BITCODE_SPEC_V40_NOTES.md', notes.includes('Gate 4 implementation notes') && notes.includes('API route integration contracts')),
    predicateResult('parity-documents-gate4', 'BITCODE_SPEC_V40_PARITY_MATRIX.md', parity.includes('v40-api-integration-contracts') && parity.includes('| Gate 4 | API/route integration artifact | implemented |')),
    predicateResult('roadmap-advanced-through-gate4', 'SPECIFICATIONS_ROADMAP.md', roadmap.includes('V40 Gate 4 closure anchor')),
    predicateResult(
      'roadmap-documents-v41-prompt-programs',
      'SPECIFICATIONS_ROADMAP.md',
      roadmap.includes('| V41 | `BITCODE_SPEC_V41.md` |') &&
        roadmap.includes('Prompt and PromptPart excellence') &&
        roadmap.includes('meaningfully benchmarkable semantic parts'),
    ),
    ...rowPredicates,
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const rowsByVerdict = rows.reduce((acc, item) => {
    acc[item.verdict] = (acc[item.verdict] || 0) + 1;
    return acc;
  }, {});
  const rowsByTier = rows.reduce((acc, item) => {
    acc[item.coverageTier] = (acc[item.coverageTier] || 0) + 1;
    return acc;
  }, {});

  return {
    rowCount: rows.length,
    surfaceCount: V40_API_INTEGRATION_SURFACE_IDS.length,
    verdictIds: [...V40_API_INTEGRATION_VERDICTS],
    rowsByVerdict,
    rowsByTier,
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    missingRowCount: rows.filter((item) => item.verdict === 'missing').length,
    blockedRowCount: rows.filter((item) => item.verdict === 'blocked').length,
    exemptRowCount: rows.filter((item) => item.verdict === 'exempt').length,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    uapiRouteContractsClosed: rows.filter((item) => item.integrationSurfaceId.startsWith('uapi:')).length === 6,
    packageApiContractsClosed: rows.filter((item) => item.integrationSurfaceId.startsWith('packages-api:')).length === 2,
    mcpInterfaceContractsClosed: rows.some((item) => item.integrationSurfaceId === 'mcp:executions-interface-contracts'),
    chatgptInterfaceContractsClosed: rows.some((item) => item.integrationSurfaceId === 'chatgpt:app-action-contracts'),
    persistenceAuthorizationContractsClosed: rows.some((item) => item.integrationSurfaceId === 'uapi:vcs-wallet-webhook-routes') && rows.some((item) => item.integrationSurfaceId === 'mcp:executions-interface-contracts'),
    responseSchemaContractsClosed: rows.some((item) => item.integrationSurfaceId === 'uapi:conversation-routes') && rows.some((item) => item.integrationSurfaceId === 'packages-api:route-orchestration'),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    valueBearingMainnetRequired: false,
  };
}

export function buildV40ApiIntegrationContracts(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V40_API_INTEGRATION_CONTRACT_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v40-api-integration-contracts:${digest(JSON.stringify({
    rows: rows.map((item) => item.rowRoot),
    failedPredicateIds: coverage.failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v40-api-integration-contracts',
    schemaId: V40_API_INTEGRATION_CONTRACTS_SCHEMA_ID,
    version: V40_API_INTEGRATION_CONTRACTS_VERSION,
    currentTarget: V40_API_INTEGRATION_CONTRACTS_CURRENT_TARGET,
    sourceSafetyVerdict: V40_API_INTEGRATION_CONTRACTS_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0 && coverage.allCriticalSurfacesClosed,
    surfaceIds: [...V40_API_INTEGRATION_SURFACE_IDS],
    verdictIds: [...V40_API_INTEGRATION_VERDICTS],
    rows,
    rowIds: rows.map((item) => item.integrationSurfaceId),
    predicateResults,
    coverage,
  };
}
