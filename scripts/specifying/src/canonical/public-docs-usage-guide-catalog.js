// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PUBLIC_DOCS_USAGE_GUIDE_CATALOG_ARTIFACT_PATH = '.bitcode/v35-public-docs-usage-guides.json';
export const PUBLIC_DOCS_USAGE_GUIDE_CATALOG_SCHEMA_ID = 'bitcode.v35.publicDocsUsageGuideCatalog.v1';
export const PUBLIC_DOCS_USAGE_GUIDE_CATALOG_VERSION = 'V35';
export const PUBLIC_DOCS_USAGE_GUIDE_CATALOG_CURRENT_TARGET = 'V34';
export const PUBLIC_DOCS_USAGE_GUIDE_SOURCE_SAFETY_VERDICT = 'source-safe-public-docs-metadata';

export const PUBLIC_DOCS_USAGE_GUIDE_IDS = Object.freeze([
  'terminal_usage',
  'protocol_usage',
  'auxillaries_usage',
  'mcp_api_usage',
  'chatgpt_app_usage',
  'btd_usage',
  'assetpack_ranges_usage',
  'reads_usage',
  'fees_usage',
  'proof_posture_usage',
  'exchange_deferred_boundary',
  'conversations_deferred_boundary',
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

const FORBIDDEN_PUBLIC_DOCS_CONTENT = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'raw_protected_prompts',
  'protected_source_payloads',
  'unpaid_assetpack_source',
]);

const SHARED_ALLOWED_CONTENT = Object.freeze([
  'usage_guidance',
  'source_safe_measurements',
  'proof_roots',
  'policy_state',
  'fee_and_rights_boundaries',
  'readiness_states',
  'public_route_links',
]);

const SHARED_FRESHNESS_FAILURES = Object.freeze([
  'missing_public_docs_route',
  'missing_source_root',
  'stale_spec_binding',
  'missing_disclosure_limit',
  'source_unsafe_public_payload',
]);

const guideRows = Object.freeze([
  {
    guideId: 'terminal_usage',
    publicRoute: '/docs/product-workspace',
    title: 'Terminal usage guide',
    audience: ['enterprise_readers', 'depositors', 'operators'],
    guideIntent: 'Orient users inside the Deposit/Read operator surface before they write or trust a result.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'DocumentationSurfaceCatalog', 'TelemetryTaxonomyCatalog'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/components/README.md',
      'internal-docs/BITCODE_TERMINAL_OPERATOR_EXPERIENCE.md',
    ],
    packageSurfaces: ['apps/uapi/app/terminal', 'packages/pipelines/asset-pack'],
    docsSections: ['terminal', 'terminal-actions', 'read-results'],
    proofSignals: ['terminal activity detail', 'execution stream metadata', 'ledger reread posture'],
    disclosureNotes: [
      'Terminal docs may describe source-safe status and proof posture.',
      'Terminal docs must not reveal unpaid AssetPack source or raw protected prompts.',
    ],
  },
  {
    guideId: 'protocol_usage',
    publicRoute: '/docs/protocol',
    title: 'Protocol usage guide',
    audience: ['protocol_reviewers', 'contributors', 'enterprise_reviewers'],
    guideIntent: 'Connect public users to the active Protocol model without treating generated proof or source artifacts as public payloads.',
    canonicalTruth: ['BITCODE_SPEC.txt', 'BITCODE_SPEC_V35.md', 'scripts/specifying'],
    sourceRoots: [
      'BITCODE_SPEC.txt',
      'BITCODE_SPEC_V35.md',
      'scripts/specifying/README.md',
      'apps/uapi/app/docs/bitcode-docs-content.ts',
    ],
    packageSurfaces: ['scripts/specifying/src/index.js', 'scripts/specifying/src/canonical/v21-specifying.js'],
    docsSections: ['protocol', 'proofs', 'settlement-btd'],
    proofSignals: ['active canon pointer', 'draft family status', 'generated artifact inventory'],
    disclosureNotes: [
      'Protocol docs may expose rule names, proof families, and source-safe generated artifact names.',
      'Protocol docs must not expose secrets, wallet private material, or source-bearing AssetPack payloads.',
    ],
  },
  {
    guideId: 'auxillaries_usage',
    publicRoute: '/docs/auxillaries',
    title: 'Auxillaries usage guide',
    audience: ['enterprise_readers', 'operators', 'interface_consumers'],
    guideIntent: 'Explain wallet, externals, profile, and interface readiness as operational configuration, not detached settings.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'packages/api', 'packages/btd'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/app/auxillaries/README.md',
      'packages/api/README.md',
      'packages/btd/README.md',
    ],
    packageSurfaces: ['apps/uapi/app/auxillaries', 'packages/api/src/routes/auxillaries-contract.ts'],
    docsSections: ['auxillaries', 'configuration'],
    proofSignals: ['wallet readiness state', 'external provider readiness', 'interface defaults'],
    disclosureNotes: [
      'Auxillaries docs may expose readiness state, required confirmations, and disabled-control explanations.',
      'Auxillaries docs must not expose private wallet data, provider tokens, or secret values.',
    ],
  },
  {
    guideId: 'mcp_api_usage',
    publicRoute: '/docs/mcp-api',
    title: 'MCP and API usage guide',
    audience: ['mcp_consumers', 'api_consumers', 'agent_builders'],
    guideIntent: 'Teach programmable clients to write bounded intent and reread Exchange state through source-safe tool results.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'apps/mcp', 'packages/api'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'packages/mcp-generics/README.md',
      'apps/mcp/docs/public/mcp-overview.md',
      'apps/mcp/docs/public/mcp-api-reference.md',
      'docs/api/conversations-openapi.yaml',
    ],
    packageSurfaces: ['apps/mcp', 'packages/api/src'],
    docsSections: ['mcp-api', 'commercial-interfaces'],
    proofSignals: ['tool result id', 'activity id', 'proof posture'],
    disclosureNotes: [
      'MCP/API docs may show public schemas, tool categories, and source-safe result envelopes.',
      'MCP/API docs must not expose raw protected prompts, provider tokens, or protected source payloads.',
    ],
  },
  {
    guideId: 'chatgpt_app_usage',
    publicRoute: '/docs/chatgpt-app',
    title: 'ChatGPT App usage guide',
    audience: ['chatgpt_app_consumers', 'enterprise_readers', 'operators'],
    guideIntent: 'Explain conversational Bitcode operation while preserving confirmation, write admission, and Terminal reread boundaries.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'packages/chatgptapp', 'TelemetryTaxonomyCatalog'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/chatgpt/README.md',
      'internal-docs/BITCODE_CHATGPT_APP_INTERFACE.md',
    ],
    packageSurfaces: ['apps/chatgpt/src', 'apps/uapi/app/docs'],
    docsSections: ['chatgpt-app', 'commercial-interfaces'],
    proofSignals: ['confirmation prompt', 'write admission', 'Terminal verification link'],
    disclosureNotes: [
      'ChatGPT App docs may describe confirmation, action names, and source-safe response shapes.',
      'ChatGPT App docs must not expose raw model responses containing protected source.',
    ],
  },
  {
    guideId: 'btd_usage',
    publicRoute: '/docs/settlement-btd',
    title: '$BTD usage guide',
    audience: ['enterprise_readers', 'depositors', 'operators'],
    guideIntent: 'Explain settlement, rights transfer posture, and BTD accounting without exposing private wallet or unpaid source material.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'packages/btd'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'packages/btd/README.md',
      'apps/uapi/app/api/btd/btc-fee-transaction/route.ts',
    ],
    packageSurfaces: ['packages/btd/src', 'apps/uapi/app/api/btd'],
    docsSections: ['settlement-btd', 'source-shares'],
    proofSignals: ['BTD accounting row', 'fee transaction posture', 'ledger receipt state'],
    disclosureNotes: [
      '$BTD docs may explain accounting state, fee calculation posture, and rights boundaries.',
      '$BTD docs must not expose private wallet material, signatures, or unpaid AssetPack source.',
    ],
  },
  {
    guideId: 'assetpack_ranges_usage',
    publicRoute: '/docs/read-results',
    title: 'AssetPack range usage guide',
    audience: ['enterprise_readers', 'operators', 'protocol_reviewers'],
    guideIntent: 'Describe range and quality measurements that can be previewed before settlement without showing the source-bearing pack.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'packages/pipelines/asset-pack', 'packages/btd'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'internal-docs/ASSETPACK_EXECUTION.md',
      'packages/asset-packs-pipelines/domain/README.md',
      'packages/btd/README.md',
    ],
    packageSurfaces: ['packages/asset-packs-pipelines/domain/src', 'packages/btd/src'],
    docsSections: ['read-results', 'settlement-btd', 'proofs'],
    proofSignals: ['fit quality measurement', 'preview metadata', 'disclosure boundary state'],
    disclosureNotes: [
      'AssetPack docs may expose measurements, preview metadata, and proof posture before payment.',
      'AssetPack docs must not expose the synthesized AssetPack source before settlement.',
    ],
  },
  {
    guideId: 'reads_usage',
    publicRoute: '/docs/read-results',
    title: 'Reads usage guide',
    audience: ['enterprise_readers', 'operators'],
    guideIntent: 'Teach users how to interpret Read measurement, fit admission, readiness, proof, and settlement state.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'packages/pipelines/asset-pack'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'packages/asset-packs-pipelines/domain/README.md',
      'internal-docs/BITCODE_TERMINAL_OPERATOR_EXPERIENCE.md',
    ],
    packageSurfaces: ['packages/asset-packs-pipelines/domain/src', 'apps/uapi/app/api/read-review/route.ts'],
    docsSections: ['read-results', 'terminal-actions'],
    proofSignals: ['read measurement', 'fit search admission', 'blocked readiness evidence'],
    disclosureNotes: [
      'Read docs may expose measurement outcomes, admission state, and high-level fit evidence.',
      'Read docs must not expose raw protected prompts or source-bearing fit synthesis payloads.',
    ],
  },
  {
    guideId: 'fees_usage',
    publicRoute: '/docs/settlement-btd',
    title: 'Fees usage guide',
    audience: ['enterprise_readers', 'operators', 'depositors'],
    guideIntent: 'Explain BTC fee posture and deterministic price-read boundaries in public terms while keeping signing material private.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'packages/btd'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'packages/btd/README.md',
      'apps/uapi/app/api/btd/btc-fee-transaction/route.ts',
      'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
    ],
    packageSurfaces: ['packages/btd/src', 'apps/uapi/app/api/btd/btc-fee-transaction/route.ts'],
    docsSections: ['settlement-btd', 'configuration'],
    proofSignals: ['btc fee finality state', 'payment mode', 'wallet readiness'],
    disclosureNotes: [
      'Fees docs may expose fee state, calculation posture, and settlement-readiness categories.',
      'Fees docs must not expose private keys, raw signatures, or wallet private material.',
    ],
  },
  {
    guideId: 'proof_posture_usage',
    publicRoute: '/docs/proofs',
    title: 'Proof posture usage guide',
    audience: ['enterprise_reviewers', 'operators', 'protocol_reviewers'],
    guideIntent: 'Explain how public users read proof, witness, replay, redaction, and fail-closed posture.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'scripts/specifying', 'TelemetryTaxonomyCatalog'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'BITCODE_SPEC_V35.md',
      'scripts/specifying/README.md',
    ],
    packageSurfaces: ['scripts/specifying/src', 'scripts/generate-bitcode-proven.mjs'],
    docsSections: ['proofs', 'protocol'],
    proofSignals: ['witness artifact', 'replay command', 'redaction state'],
    disclosureNotes: [
      'Proof docs may expose proof roots, replay commands, generated artifact names, and fail-closed causes.',
      'Proof docs must not expose protected source payloads or raw protected prompts.',
    ],
  },
  {
    guideId: 'exchange_deferred_boundary',
    publicRoute: '/docs/exchange',
    title: 'Exchange deferred boundary guide',
    audience: ['enterprise_readers', 'operators', 'product_reviewers'],
    guideIntent: 'Document the Exchange as durable state while keeping deeper Exchange product work deferred outside V35.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'SPECIFICATIONS_ROADMAP.md', 'apps/uapi/app/exchange'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/app/exchange/README.md',
      'SPECIFICATIONS_ROADMAP.md',
    ],
    packageSurfaces: ['apps/uapi/app/exchange', 'packages/api/src'],
    docsSections: ['exchange', 'source-shares'],
    proofSignals: ['activity ledger', 'selected detail', 'durable state reread'],
    disclosureNotes: [
      'Exchange docs may describe durable state and planned product boundaries.',
      'Exchange docs must not imply V35 delivers full Exchange depth or expose source-bearing detail pre-settlement.',
    ],
  },
  {
    guideId: 'conversations_deferred_boundary',
    publicRoute: '/docs/conversations',
    title: 'Conversations deferred boundary guide',
    audience: ['enterprise_readers', 'operators', 'product_reviewers'],
    guideIntent: 'Document Conversations as a compatible write surface while keeping website Conversations depth deferred outside V35.',
    canonicalTruth: ['BITCODE_SPEC_V35.md', 'SPECIFICATIONS_ROADMAP.md', 'apps/uapi/app/conversations'],
    sourceRoots: [
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/app/conversations/README.md',
      'internal-docs/BITCODE_CONVERSATIONS.md',
      'SPECIFICATIONS_ROADMAP.md',
    ],
    packageSurfaces: ['apps/uapi/app/conversations', 'docs/api/conversations-openapi.yaml'],
    docsSections: ['conversations', 'chatgpt-app'],
    proofSignals: ['attachment token', 'write confirmation', 'Terminal reread link'],
    disclosureNotes: [
      'Conversations docs may describe source-safe attachments, write intent, and reread links.',
      'Conversations docs must not imply V35 completes the full website conversation interface or expose protected source.',
    ],
  },
]);

export const PUBLIC_DOCS_USAGE_GUIDE_ROWS = guideRows;

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
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
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
 * @param {string} repoRoot
 * @param {string} publicRoute
 * @returns {boolean}
 */
function publicDocsRouteExists(repoRoot, publicRoute) {
  if (!publicRoute.startsWith('/docs/')) return false;
  const slug = publicRoute.slice('/docs/'.length);
  const docsContentPath = path.join(repoRoot, 'apps/uapi/app/docs/bitcode-docs-content.ts');
  if (!existsSync(docsContentPath)) return false;
  const docsContent = readFileSync(docsContentPath, 'utf8');
  return docsContent.includes(`slug: '${slug}'`) || docsContent.includes(`slug: "${slug}"`);
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
export function buildPublicDocsUsageGuideCatalog(input = {}) {
  const version = input.version || PUBLIC_DOCS_USAGE_GUIDE_CATALOG_VERSION;
  const currentTarget = input.currentTarget || PUBLIC_DOCS_USAGE_GUIDE_CATALOG_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = guideRows.map((row) => {
    const sourceEvidence = row.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const routePresent = publicDocsRouteExists(repoRoot, row.publicRoute);
    const rowWithoutRoot = {
      ...row,
      sourceSafetyClass: 'source_safe_public_docs_metadata',
      allowedPublicContent: [...SHARED_ALLOWED_CONTENT],
      forbiddenPublicContent: [...FORBIDDEN_PUBLIC_DOCS_CONTENT],
      routePresent,
      freshnessChecks: [
        {
          checkId: `${row.guideId}.public-route-and-source-roots-present`,
          command: 'pnpm run check:v35-public-docs-usage-guides',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FRESHNESS_FAILURES],
        },
      ],
      sourceEvidence,
    };

    return {
      ...rowWithoutRoot,
      guideRoot: `public-docs-guide-row:${sha256(row.guideId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedGuideIds = rows.map((row) => row.guideId);
  const missingRequiredGuideIds = PUBLIC_DOCS_USAGE_GUIDE_IDS.filter((guideId) => !observedGuideIds.includes(guideId));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.guideId}:${entry.sourceRoot}`),
  );
  const missingPublicRoutes = rows.filter((row) => !row.routePresent).map((row) => `${row.guideId}:${row.publicRoute}`);
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const legacySourceRoots = rows.some((row) => row.sourceRoots.some((sourceRoot) => sourceRoot.startsWith('_legacy/')));
  const publicRowsWithoutDisclosureBoundary = rows.some(
    (row) =>
      row.forbiddenPublicContent.length === 0 ||
      !row.forbiddenPublicContent.includes('unpaid_assetpack_source') ||
      !row.forbiddenPublicContent.includes('raw_protected_prompts') ||
      !row.forbiddenPublicContent.includes('wallet_private_material'),
  );

  const guideById = new Map(rows.map((row) => [row.guideId, row]));
  const coverage = {
    requiredGuideIds: [...PUBLIC_DOCS_USAGE_GUIDE_IDS],
    observedGuideIds,
    missingRequiredGuideIds,
    guideCount: rows.length,
    allRequiredGuidesCovered: includesAll(observedGuideIds, PUBLIC_DOCS_USAGE_GUIDE_IDS),
    terminalRepresented: guideById.has('terminal_usage'),
    protocolRepresented: guideById.has('protocol_usage'),
    auxillariesRepresented: guideById.has('auxillaries_usage'),
    mcpApiRepresented: guideById.has('mcp_api_usage'),
    chatgptAppRepresented: guideById.has('chatgpt_app_usage'),
    btdRepresented: guideById.has('btd_usage'),
    assetPackRangesRepresented: guideById.has('assetpack_ranges_usage'),
    readsRepresented: guideById.has('reads_usage'),
    feesRepresented: guideById.has('fees_usage'),
    proofPostureRepresented: guideById.has('proof_posture_usage'),
    exchangeDeferredBoundaryRepresented: guideById.has('exchange_deferred_boundary'),
    conversationsDeferredBoundaryRepresented: guideById.has('conversations_deferred_boundary'),
    freshnessCheckCount: rows.reduce((count, row) => count + row.freshnessChecks.length, 0),
    missingSourceRoots,
    missingPublicRoutes,
    legacySourceRoots,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: publicRowsWithoutDisclosureBoundary,
    rawProtectedPromptVisible: publicRowsWithoutDisclosureBoundary,
    unpaidAssetPackSourceVisible: publicRowsWithoutDisclosureBoundary,
    walletPrivateMaterialVisible: publicRowsWithoutDisclosureBoundary,
  };

  const failures = [
    ...missingRequiredGuideIds.map((guideId) => `missing required public docs guide ${guideId}`),
    ...missingSourceRoots.map((sourceRoot) => `missing public docs source root ${sourceRoot}`),
    ...missingPublicRoutes.map((route) => `missing public docs route ${route}`),
    ...(forbiddenMarkerDetected ? ['public docs usage guide catalog contains a secret-shaped marker'] : []),
    ...(legacySourceRoots ? ['public docs usage guide catalog points at _legacy source roots'] : []),
    ...(publicRowsWithoutDisclosureBoundary ? ['public docs usage guide row lacks full disclosure boundary'] : []),
  ];

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: PUBLIC_DOCS_USAGE_GUIDE_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-public-docs-usage-guides',
    schemaId: PUBLIC_DOCS_USAGE_GUIDE_CATALOG_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: PUBLIC_DOCS_USAGE_GUIDE_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      publicDocsMayExpose: [...SHARED_ALLOWED_CONTENT],
      publicDocsMustNotExpose: [...FORBIDDEN_PUBLIC_DOCS_CONTENT],
      settlementBoundary:
        'Public docs may preview measurements and proof posture, but source-bearing AssetPack contents cross to the reader only after settlement and rights transfer.',
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredGuideIds: [...PUBLIC_DOCS_USAGE_GUIDE_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      guideId: row.guideId,
      publicRoute: row.publicRoute,
      routePresent: row.routePresent,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `public-docs-usage-guides:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
