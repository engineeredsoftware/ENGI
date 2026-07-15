// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TELEMETRY_TAXONOMY_ROWS } from './telemetry-taxonomy-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_ARTIFACT_PATH =
  '.bitcode/v35-telemetry-documentation-interface-integration.json';
export const TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_SCHEMA_ID =
  'bitcode.v35.telemetryDocumentationInterfaceIntegration.v1';
export const TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_VERSION = 'V35';
export const TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_CURRENT_TARGET = 'V34';
export const TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_SOURCE_SAFETY_VERDICT =
  'source-safe-interface-integration-metadata';

export const TELEMETRY_DOCUMENTATION_INTERFACE_IDS = Object.freeze([
  'terminal',
  'auxillaries',
  'api',
  'mcp_api',
  'chatgpt_app',
  'package_readmes',
  'internal_docs',
  'public_docs',
]);

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

const FORBIDDEN_INTERFACE_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'buyer_repository_private_data',
]);

const SHARED_ALLOWED_FIELDS = Object.freeze([
  'eventIds',
  'proofRoots',
  'docsLinks',
  'runbookLinks',
  'redactionPosture',
  'sourceSafetyClass',
  'correlationIds',
  'stateLabels',
  'summaryCounts',
]);

const SHARED_CONTRACTS = Object.freeze([
  'DocumentationSurfaceCatalog',
  'TelemetryTaxonomyCatalog',
  'PublicDocsUsageGuideCatalog',
  'OperatorRunbookCatalog',
  'DocsQaAlignmentReport',
  'TestnetRolloutReadinessGuide',
]);

const SHARED_SOURCE_ROOTS = Object.freeze([
  'BITCODE_SPEC_V35.md',
  'BITCODE_SPEC_V35_DELTA.md',
  'BITCODE_SPEC_V35_PARITY_MATRIX.md',
  '.bitcode/v35-documentation-surface-catalog.json',
  '.bitcode/v35-telemetry-taxonomy-catalog.json',
  '.bitcode/v35-public-docs-usage-guides.json',
  '.bitcode/v35-operator-runbook-catalog.json',
  '.bitcode/v35-docs-qa-alignment-report.json',
  '.bitcode/v35-testnet-rollout-readiness-guide.json',
]);

const integrationRows = Object.freeze([
  row({
    integrationId: 'terminal',
    surfaceKind: 'application_surface',
    owner: 'apps/uapi',
    docsLinks: ['/docs/product-workspace', '/docs/product-actions', '/docs/read-results'],
    eventFamilies: ['pipeline', 'execution', 'ptrr_agent', 'thricified_generation', 'tool', 'ledger', 'wallet', 'interface'],
    sourceRoots: [
      'apps/uapi/components/README.md',
      'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
      'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
      'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    ],
    routePayloadSurfaces: ['terminal pipeline log header', 'terminal transaction detail', 'terminal wallet pane'],
    validationCommands: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalPipelineHarnessClient.test.ts tests/pipelineExecutionLogHeader.test.tsx --runInBand',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
    ],
  }),
  row({
    integrationId: 'auxillaries',
    surfaceKind: 'application_surface',
    owner: 'apps/uapi',
    docsLinks: ['/docs/auxillaries', '/docs/configuration', '/docs/commercial-interfaces'],
    eventFamilies: ['interface', 'deployment', 'observer', 'repair'],
    sourceRoots: [
      'apps/uapi/app/auxillaries/README.md',
      'apps/uapi/tests/auxillariesWorkspacePanels.test.tsx',
      'apps/uapi/tests/auxillariesContent.access.test.tsx',
    ],
    routePayloadSurfaces: ['auxillaries wallet panel', 'auxillaries externals panel', 'auxillaries interface settings'],
    validationCommands: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/auxillariesWorkspacePanels.test.tsx tests/auxillariesContent.access.test.tsx --runInBand',
    ],
  }),
  row({
    integrationId: 'api',
    surfaceKind: 'route_surface',
    owner: 'packages/api',
    docsLinks: ['/docs/commercial-interfaces', '/docs/proofs', '/docs/settlement-btd'],
    eventFamilies: ['execution', 'ledger', 'wallet', 'storage', 'interface'],
    sourceRoots: [
      'packages/api/README.md',
      'internal-docs/BITCODE_API.md',
      'packages/api/src/routes/btd-crypto.ts',
      'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    ],
    routePayloadSurfaces: ['public api read/write contracts', 'btd settlement routes', 'source-safe route errors'],
    validationCommands: [
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
    ],
  }),
  row({
    integrationId: 'mcp_api',
    surfaceKind: 'interface_package',
    owner: 'apps/mcp',
    docsLinks: ['/docs/mcp-api', '/docs/commercial-interfaces'],
    eventFamilies: ['tool', 'execution', 'interface', 'docs_qa'],
    sourceRoots: [
      'apps/mcp/README.md',
      'apps/mcp/docs/public/mcp-overview.md',
      'apps/mcp/src/interface-integration.ts',
      'apps/mcp/src/__tests__/unit/mcp-tool-contract.test.ts',
    ],
    routePayloadSurfaces: ['mcp tool list', 'mcp pipeline ingress', 'mcp source-safe result payload'],
    validationCommands: [
      'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/mcp-tool-contract.test.ts src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
    ],
  }),
  row({
    integrationId: 'chatgpt_app',
    surfaceKind: 'interface_package',
    owner: 'packages/chatgptapp',
    docsLinks: ['/docs/chatgpt-app', '/docs/commercial-interfaces'],
    eventFamilies: ['tool', 'execution', 'interface', 'promotion'],
    sourceRoots: [
      'apps/chatgpt/README.md',
      'internal-docs/BITCODE_CHATGPT_APP_INTERFACE.md',
      'apps/chatgpt/src/interface-integration.ts',
      'apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
    ],
    routePayloadSurfaces: ['chatgpt app actions', 'chatgpt app tool results', 'chatgpt app source-safe cards'],
    validationCommands: [
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts src/__tests__/tools.test.ts --runInBand',
    ],
  }),
  row({
    integrationId: 'package_readmes',
    surfaceKind: 'package_docs',
    owner: 'package-maintainers',
    docsLinks: ['/docs/protocol-v26', '/docs/commercial-interfaces', '/docs/proofs'],
    eventFamilies: ['pipeline', 'interface', 'deployment', 'docs_qa'],
    sourceRoots: [
      'scripts/specifying/README.md',
      'packages/btd/README.md',
      'packages/api/README.md',
      'apps/mcp/README.md',
      'apps/chatgpt/README.md',
    ],
    routePayloadSurfaces: ['package exported helper docs', 'package interface payload docs'],
    validationCommands: ['pnpm --filter @bitcode/specifying test', 'pnpm run check:v35-gate8'],
  }),
  row({
    integrationId: 'internal_docs',
    surfaceKind: 'internal_docs',
    owner: 'internal-docs',
    docsLinks: ['/docs/proofs', '/docs/configuration', '/docs/commercial-interfaces'],
    eventFamilies: ['deployment', 'observer', 'repair', 'docs_qa', 'promotion'],
    sourceRoots: [
      'internal-docs/README.md',
      'internal-docs/DEPLOYMENT.md',
      'internal-docs/BITCODE_AGENTIC_EXECUTION.md',
      'internal-docs/BITCODE_VERIFICATION.md',
      'internal-docs/BITCODE_API.md',
    ],
    routePayloadSurfaces: ['internal operator guide', 'internal incident guide', 'internal proof readback guide'],
    validationCommands: ['pnpm run check:v35-gate6', 'pnpm run check:v35-gate8'],
  }),
  row({
    integrationId: 'public_docs',
    surfaceKind: 'public_docs',
    owner: 'apps/uapi',
    docsLinks: ['/docs/what-is-bitcode', '/docs/protocol-v26', '/docs/proofs', '/docs/commercial-interfaces'],
    eventFamilies: ['interface', 'docs_qa', 'promotion'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/app/docs/page.tsx',
      'apps/uapi/app/docs/[slug]/page.tsx',
    ],
    routePayloadSurfaces: ['public docs cards', 'public docs interface api sections', 'public disclosure limit section'],
    validationCommands: ['pnpm --dir apps/uapi exec tsc --noEmit --pretty false', 'pnpm run check:v35-gate8'],
  }),
]);

export const TELEMETRY_DOCUMENTATION_INTERFACE_ROWS = integrationRows;

/**
 * @param {{
 *   integrationId: string,
 *   surfaceKind: string,
 *   owner: string,
 *   docsLinks: readonly string[],
 *   eventFamilies: readonly string[],
 *   sourceRoots: readonly string[],
 *   routePayloadSurfaces: readonly string[],
 *   validationCommands: readonly string[],
 * }} input
 */
function row(input) {
  const telemetryRows = input.eventFamilies.map((family) => {
    const telemetry = TELEMETRY_TAXONOMY_ROWS.find((candidate) => candidate.eventFamily === family);
    if (!telemetry) throw new Error(`Missing telemetry taxonomy row for ${family}.`);
    return telemetry;
  });

  return {
    ...input,
    packageOwnedContracts: SHARED_CONTRACTS,
    sourceRoots: [...SHARED_SOURCE_ROOTS, ...input.sourceRoots],
    eventIds: Array.from(new Set(telemetryRows.flatMap((telemetry) => telemetry.eventIds))).sort(),
    proofRootFields: Array.from(new Set(telemetryRows.flatMap((telemetry) => telemetry.proofRootFields))).sort(),
    runbookLinks: Array.from(new Set(telemetryRows.map((telemetry) => telemetry.runbookLink))).sort(),
    redactionPosture: Array.from(new Set(telemetryRows.map((telemetry) => telemetry.redactionPosture))).sort(),
    correlationIds: Array.from(new Set(telemetryRows.flatMap((telemetry) => telemetry.correlationIds))).sort(),
    allowedPayloadFields: SHARED_ALLOWED_FIELDS,
    forbiddenPayloadFields: FORBIDDEN_INTERFACE_PAYLOAD,
    sourceSafetyClass: TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_SOURCE_SAFETY_VERDICT,
    payloadRule:
      'Interface payloads may expose event ids, proof roots, docs links, runbook links, redaction posture, source-safety class, correlation ids, state labels, and summary counts only.',
    failClosedResult: `${input.integrationId} interface integration blocks when docs, telemetry, runbook, redaction, proof-root, or source-safety bindings are incomplete`,
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildTelemetryDocumentationInterfaceIntegration(input = {}) {
  const version = input.version || TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_VERSION;
  const currentTarget = input.currentTarget || TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = integrationRows.map((sourceRow) => {
    const sourceEvidence = sourceRow.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...sourceRow,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v35-telemetry-documentation-interface-integration',
        failClosedOn: [
          'missing_interface_surface',
          'missing_docs_link',
          'missing_event_ids',
          'missing_proof_roots',
          'missing_runbook_links',
          'missing_redaction_posture',
          'missing_source_root',
          'source_unsafe_interface_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      integrationRoot: `telemetry-docs-interface-row:${sha256(sourceRow.integrationId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedIntegrationIds = rows.map((row) => row.integrationId);
  const missingIntegrationIds = TELEMETRY_DOCUMENTATION_INTERFACE_IDS.filter((id) => !observedIntegrationIds.includes(id));
  const observedDocsLinks = Array.from(new Set(rows.flatMap((row) => row.docsLinks))).sort();
  const observedEventFamilies = Array.from(new Set(rows.flatMap((row) => row.eventFamilies))).sort();
  const observedRunbookLinks = Array.from(new Set(rows.flatMap((row) => row.runbookLinks))).sort();
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.integrationId}:${entry.sourceRoot}`),
  );
  const rowsMissingDocsLinks = rows.filter((row) => row.docsLinks.length === 0).map((row) => row.integrationId);
  const rowsMissingEventIds = rows.filter((row) => row.eventIds.length === 0).map((row) => row.integrationId);
  const rowsMissingProofRoots = rows.filter((row) => row.proofRootFields.length === 0).map((row) => row.integrationId);
  const rowsMissingRunbooks = rows.filter((row) => row.runbookLinks.length === 0).map((row) => row.integrationId);
  const rowsMissingRedactionPosture = rows.filter((row) => row.redactionPosture.length === 0).map((row) => row.integrationId);
  const rowsMissingAllowedPayloadFields = rows.filter((row) => row.allowedPayloadFields.length === 0).map((row) => row.integrationId);
  const rowsMissingForbiddenPayloadFields = rows.filter((row) => row.forbiddenPayloadFields.length === 0).map((row) => row.integrationId);
  const rowsMissingRoutePayloadSurfaces = rows.filter((row) => row.routePayloadSurfaces.length === 0).map((row) => row.integrationId);
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);

  const failures = [
    ...missingIntegrationIds.map((id) => `missing telemetry documentation interface integration ${id}`),
    ...missingSourceRoots.map((sourceRoot) => `missing interface integration source root ${sourceRoot}`),
    ...rowsMissingDocsLinks.map((id) => `missing docs links for ${id}`),
    ...rowsMissingEventIds.map((id) => `missing event ids for ${id}`),
    ...rowsMissingProofRoots.map((id) => `missing proof roots for ${id}`),
    ...rowsMissingRunbooks.map((id) => `missing runbook links for ${id}`),
    ...rowsMissingRedactionPosture.map((id) => `missing redaction posture for ${id}`),
    ...rowsMissingAllowedPayloadFields.map((id) => `missing allowed payload fields for ${id}`),
    ...rowsMissingForbiddenPayloadFields.map((id) => `missing forbidden payload fields for ${id}`),
    ...rowsMissingRoutePayloadSurfaces.map((id) => `missing route payload surfaces for ${id}`),
    ...(forbiddenMarkerDetected ? ['telemetry documentation interface integration contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredIntegrationIds: [...TELEMETRY_DOCUMENTATION_INTERFACE_IDS],
    observedIntegrationIds,
    missingIntegrationIds,
    integrationCount: rows.length,
    docsLinkCount: observedDocsLinks.length,
    eventFamilyCount: observedEventFamilies.length,
    runbookLinkCount: observedRunbookLinks.length,
    observedDocsLinks,
    observedEventFamilies,
    observedRunbookLinks,
    allRequiredInterfacesCovered: includesAll(observedIntegrationIds, TELEMETRY_DOCUMENTATION_INTERFACE_IDS),
    terminalCovered: observedIntegrationIds.includes('terminal'),
    auxillariesCovered: observedIntegrationIds.includes('auxillaries'),
    apiCovered: observedIntegrationIds.includes('api'),
    mcpApiCovered: observedIntegrationIds.includes('mcp_api'),
    chatGptAppCovered: observedIntegrationIds.includes('chatgpt_app'),
    packageReadmesCovered: observedIntegrationIds.includes('package_readmes'),
    internalDocsCovered: observedIntegrationIds.includes('internal_docs'),
    publicDocsCovered: observedIntegrationIds.includes('public_docs'),
    missingSourceRoots,
    rowsMissingDocsLinks,
    rowsMissingEventIds,
    rowsMissingProofRoots,
    rowsMissingRunbooks,
    rowsMissingRedactionPosture,
    rowsMissingAllowedPayloadFields,
    rowsMissingForbiddenPayloadFields,
    rowsMissingRoutePayloadSurfaces,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-telemetry-documentation-interface-integration',
    schemaId: TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedInterfaceFields: [...SHARED_ALLOWED_FIELDS],
      forbiddenInterfacePayload: [...FORBIDDEN_INTERFACE_PAYLOAD],
      interfaceRule:
        'Interface surfaces may expose event ids, proof roots, docs links, runbook links, redaction posture, source-safety class, correlation ids, state labels, and summary counts; they must not expose secrets, provider tokens, wallet private material, protected source, raw protected prompts, buyer repository private data, raw protected model responses, or unpaid AssetPack source.',
    },
    rows,
    coverage,
    sourceEvidence: rows.map((row) => ({
      integrationId: row.integrationId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `telemetry-documentation-interface-integration:${sha256(canonicalJson(artifactSeed)).slice(0, 24)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v35-gate8',
  };
}
