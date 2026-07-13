// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DOCS_QA_ALIGNMENT_REPORT_ARTIFACT_PATH = '.bitcode/v35-docs-qa-alignment-report.json';
export const DOCS_QA_ALIGNMENT_REPORT_SCHEMA_ID = 'bitcode.v35.docsQaAlignmentReport.v1';
export const DOCS_QA_ALIGNMENT_REPORT_VERSION = 'V35';
export const DOCS_QA_ALIGNMENT_REPORT_CURRENT_TARGET = 'V34';
export const DOCS_QA_ALIGNMENT_SOURCE_SAFETY_VERDICT = 'source-safe-docs-qa-metadata';

export const DOCS_QA_ALIGNMENT_IDS = Object.freeze([
  'spec_family_alignment',
  'roadmap_readme_alignment',
  'generated_artifact_inventory_alignment',
  'catalog_implementation_alignment',
  'public_docs_disclosure_alignment',
  'internal_docs_alignment',
  'route_docs_alignment',
  'interface_docs_alignment',
  'generated_proof_appendix_alignment',
  'workflow_checker_alignment',
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

const FORBIDDEN_DOCS_QA_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'raw_protected_prompts',
  'protected_source_payloads',
  'unpaid_assetpack_source',
]);

const alignmentRows = Object.freeze([
  {
    alignmentId: 'spec_family_alignment',
    alignmentClass: 'spec_family',
    owner: 'packages/protocol',
    checkedSources: [
      'BITCODE_SPEC_V35.md',
      'BITCODE_SPEC_V35_DELTA.md',
      'BITCODE_SPEC_V35_NOTES.md',
      'BITCODE_SPEC_V35_PARITY_MATRIX.md',
    ],
    expectedTokens: [
      'DocsQaAlignmentReport',
      'DocumentationSurfaceCatalog',
      'TelemetryTaxonomyCatalog',
      'PublicDocsUsageGuideCatalog',
      'OperatorRunbookCatalog',
      'TestnetRolloutReadinessGuide',
      'TelemetryDocumentationInterfaceIntegration',
      'LocalStagingTelemetryDocumentationRehearsal',
    ],
    generatedArtifacts: [],
    repairCommand: 'edit V35 SPEC, DELTA, NOTES, and PARITY together, then rerun pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'roadmap_readme_alignment',
    alignmentClass: 'roadmap_and_readme',
    owner: 'root-workspace',
    checkedSources: [
      'SPECIFICATIONS_ROADMAP.md',
      'README.md',
      'packages/protocol/README.md',
    ],
    expectedTokens: [
      'V35 Gate 5 closure anchor',
      'V35 Gate 6 closure anchor',
      'V35 Gate 7 closure anchor',
      'V35 Gate 8 closure anchor',
      'V35 Gate 9 closure anchor',
      'OperatorRunbookCatalog',
      'DocsQaAlignmentReport',
      'TestnetRolloutReadinessGuide',
      'TelemetryDocumentationInterfaceIntegration',
      'LocalStagingTelemetryDocumentationRehearsal',
    ],
    generatedArtifacts: [],
    repairCommand: 'refresh roadmap and README posture after gate closure and rerun pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'generated_artifact_inventory_alignment',
    alignmentClass: 'generated_artifact_inventory',
    owner: 'packages/protocol',
    checkedSources: [
      'BITCODE_SPEC_V35.md',
      'packages/protocol/src/canonical/v21-specifying.js',
      'package.json',
      '.bitcode/v35-documentation-surface-catalog.json',
      '.bitcode/v35-telemetry-taxonomy-catalog.json',
      '.bitcode/v35-public-docs-usage-guides.json',
      '.bitcode/v35-operator-runbook-catalog.json',
      '.bitcode/v35-docs-qa-alignment-report.json',
      '.bitcode/v35-testnet-rollout-readiness-guide.json',
      '.bitcode/v35-telemetry-documentation-interface-integration.json',
      '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
    ],
    expectedTokens: [
      '.bitcode/v35-docs-qa-alignment-report.json',
      '.bitcode/v35-testnet-rollout-readiness-guide.json',
      '.bitcode/v35-documentation-surface-catalog.json',
      '.bitcode/v35-telemetry-taxonomy-catalog.json',
      '.bitcode/v35-public-docs-usage-guides.json',
      '.bitcode/v35-operator-runbook-catalog.json',
      '.bitcode/v35-telemetry-documentation-interface-integration.json',
      '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
      'check:v35-gate7',
      'check:v35-gate8',
      'check:v35-gate9',
      'check:v35-gate6',
    ],
    generatedArtifacts: [
      '.bitcode/v35-documentation-surface-catalog.json',
      '.bitcode/v35-telemetry-taxonomy-catalog.json',
      '.bitcode/v35-public-docs-usage-guides.json',
      '.bitcode/v35-operator-runbook-catalog.json',
      '.bitcode/v35-docs-qa-alignment-report.json',
      '.bitcode/v35-testnet-rollout-readiness-guide.json',
      '.bitcode/v35-telemetry-documentation-interface-integration.json',
      '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
    ],
    repairCommand: 'regenerate stale V35 artifacts and rerun pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'catalog_implementation_alignment',
    alignmentClass: 'package_catalog_implementation',
    owner: 'packages/protocol',
    checkedSources: [
      'packages/protocol/src/canonical/documentation-surface-catalog.js',
      'packages/protocol/src/canonical/telemetry-taxonomy-catalog.js',
      'packages/protocol/src/canonical/public-docs-usage-guide-catalog.js',
      'packages/protocol/src/canonical/operator-runbook-catalog.js',
      'packages/protocol/src/canonical/testnet-rollout-readiness-guide.js',
      'packages/protocol/src/canonical/telemetry-documentation-interface-integration.js',
      'packages/protocol/src/canonical/local-staging-telemetry-documentation-rehearsal.js',
      'packages/protocol/src/index.js',
      'packages/protocol/src/index.d.ts',
    ],
    expectedTokens: [
      'buildDocumentationSurfaceCatalog',
      'buildTelemetryTaxonomyCatalog',
      'buildPublicDocsUsageGuideCatalog',
      'buildOperatorRunbookCatalog',
      'buildTestnetRolloutReadinessGuide',
      'buildTelemetryDocumentationInterfaceIntegration',
      'buildLocalStagingTelemetryDocumentationRehearsal',
      'source-safe',
    ],
    generatedArtifacts: [],
    repairCommand: 'restore package exports and catalog builders, then rerun package tests and pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'public_docs_disclosure_alignment',
    alignmentClass: 'public_docs_disclosure',
    owner: 'uapi',
    checkedSources: [
      'uapi/app/docs/bitcode-docs-content.ts',
      'uapi/app/docs/page.tsx',
      'uapi/app/docs/[slug]/page.tsx',
      '.bitcode/v35-public-docs-usage-guides.json',
    ],
    expectedTokens: [
      'public-disclosure-limits',
      'dashboard/runbook ids',
      'protected source',
      'unpaid AssetPack source',
      'public-docs-usage-guides',
    ],
    generatedArtifacts: ['.bitcode/v35-public-docs-usage-guides.json'],
    repairCommand: 'repair public docs disclosure limits and rerun pnpm run check:v35-gate4 and pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'internal_docs_alignment',
    alignmentClass: 'internal_docs',
    owner: 'internal-docs',
    checkedSources: [
      'internal-docs/README.md',
      'internal-docs/BITCODE_AGENTIC_EXECUTION.md',
      'internal-docs/DEPLOYMENT.md',
      'internal-docs/BITCODE_VERIFICATION.md',
    ],
    expectedTokens: [
      'Bitcode',
      'Terminal',
      'Deployment',
      'proof',
      'DocumentationSurfaceCatalog',
    ],
    generatedArtifacts: ['.bitcode/v35-documentation-surface-catalog.json'],
    repairCommand: 'refresh internal docs source ownership and rerun pnpm run check:v35-gate2 and pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'route_docs_alignment',
    alignmentClass: 'route_docs',
    owner: 'packages/api',
    checkedSources: [
      'packages/api/README.md',
      'internal-docs/BITCODE_API.md',
      'uapi/app/api/read-review/route.ts',
      'uapi/app/api/pipeline-host/asset-pack/route.ts',
    ],
    expectedTokens: [
      'route',
      'source-safe',
      'protected source',
      'read',
      'pipeline',
    ],
    generatedArtifacts: ['.bitcode/v35-documentation-surface-catalog.json'],
    repairCommand: 'repair route documentation and route contract references, then rerun route tests and pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'interface_docs_alignment',
    alignmentClass: 'interface_docs',
    owner: 'interface-packages',
    checkedSources: [
      'packages/generic-mcps/bitcode/README.md',
      'packages/generic-mcps/bitcode/docs/public/mcp-overview.md',
      'packages/chatgptapp/README.md',
      'internal-docs/BITCODE_CHATGPT_APP_INTERFACE.md',
    ],
    expectedTokens: [
      'MCP',
      'ChatGPT',
      'source-safe',
      'tool',
      'interface',
    ],
    generatedArtifacts: ['.bitcode/v35-documentation-surface-catalog.json'],
    repairCommand: 'repair interface package docs and rerun MCP/ChatGPT App contract tests plus pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'generated_proof_appendix_alignment',
    alignmentClass: 'generated_proof_appendix',
    owner: 'packages/protocol',
    checkedSources: [
      'BITCODE_SPEC_V35.md',
      'packages/protocol/src/canonical/proven-generator.js',
      'BITCODE_SPEC_V34_PROVEN.md',
    ],
    expectedTokens: [
      'BITCODE_SPEC_V35_PROVEN.md',
      'Generated proof appendix',
      'generateCanonicalProvenMarkdown',
      'generated artifact',
    ],
    generatedArtifacts: [],
    repairCommand: 'repair generated proof appendix support before promotion and rerun spec family checks plus pnpm run check:v35-gate6',
  },
  {
    alignmentId: 'workflow_checker_alignment',
    alignmentClass: 'workflow_checker',
    owner: 'root-workspace',
    checkedSources: [
      '.github/workflows/bitcode-gate-quality.yml',
      'package.json',
      'scripts/check-v35-gate6-documentation-qa-alignment-proofs.mjs',
      'scripts/check-v35-gate8-telemetry-documentation-interface-integration.mjs',
      'scripts/check-v35-gate9-local-staging-telemetry-documentation-rehearsal.mjs',
      'scripts/generate-v35-docs-qa-alignment-report.mjs',
      'scripts/generate-v35-telemetry-documentation-interface-integration.mjs',
      'scripts/generate-v35-local-staging-telemetry-documentation-rehearsal.mjs',
      'packages/protocol/test/v35-docs-qa-alignment-report.test.js',
      'packages/protocol/test/v35-telemetry-documentation-interface-integration.test.js',
      'packages/protocol/test/v35-local-staging-telemetry-documentation-rehearsal.test.js',
    ],
    expectedTokens: [
      'check-v35-gate6-documentation-qa-alignment-proofs.mjs',
      'check-v35-gate8-telemetry-documentation-interface-integration.mjs',
      'check-v35-gate9-local-staging-telemetry-documentation-rehearsal.mjs',
      'generate:v35-docs-qa-alignment-report',
      'generate:v35-telemetry-documentation-interface-integration',
      'generate:v35-local-staging-telemetry-documentation-rehearsal',
      'check:v35-gate6',
      'check:v35-gate8',
      'check:v35-gate9',
      'test/v35-docs-qa-alignment-report.test.js',
      'test/v35-telemetry-documentation-interface-integration.test.js',
      'test/v35-local-staging-telemetry-documentation-rehearsal.test.js',
    ],
    generatedArtifacts: ['.bitcode/v35-docs-qa-alignment-report.json'],
    repairCommand: 'repair package scripts, workflow wiring, and focused tests, then rerun pnpm run check:v35-gate6',
  },
]);

export const DOCS_QA_ALIGNMENT_ROWS = alignmentRows;

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
 * @param {string} relativePath
 * @returns {string}
 */
function readSource(repoRoot, relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
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
export function buildDocsQaAlignmentReport(input = {}) {
  const version = input.version || DOCS_QA_ALIGNMENT_REPORT_VERSION;
  const currentTarget = input.currentTarget || DOCS_QA_ALIGNMENT_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = alignmentRows.map((row) => {
    const sourceEvidence = row.checkedSources.map((sourceRoot) => {
      const present = sourceRootExists(repoRoot, sourceRoot);
      return {
        sourceRoot,
        present,
      };
    });
    const sourceText = row.checkedSources
      .filter((sourceRoot) => sourceRootExists(repoRoot, sourceRoot))
      .map((sourceRoot) => readSource(repoRoot, sourceRoot))
      .join('\n');
    const missingTokens = row.expectedTokens.filter((token) => !sourceText.includes(token));
    const missingGeneratedArtifacts = row.generatedArtifacts.filter((artifactPath) => !sourceRootExists(repoRoot, artifactPath));
    const secretMarkerDetected = includesSecretMarker(sourceText);
    const rowWithoutRoot = {
      ...row,
      sourceEvidence,
      observedTokens: row.expectedTokens.filter((token) => sourceText.includes(token)),
      missingTokens,
      missingGeneratedArtifacts,
      unsupportedDisclosureClaims: [],
      forbiddenPayload: [...FORBIDDEN_DOCS_QA_PAYLOAD],
      validationCommand: 'pnpm run check:v35-gate6',
      failClosedResult:
        'documentation, route, interface, generated artifact, or promotion use stays blocked until missing sources, stale tokens, or unsupported disclosure claims are repaired',
    };

    return {
      ...rowWithoutRoot,
      alignmentRoot: `docs-qa-alignment-row:${sha256(row.alignmentId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedAlignmentIds = rows.map((row) => row.alignmentId);
  const missingAlignmentIds = DOCS_QA_ALIGNMENT_IDS.filter((alignmentId) => !observedAlignmentIds.includes(alignmentId));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.alignmentId}:${entry.sourceRoot}`),
  );
  const staleTokenBlockers = rows.flatMap((row) =>
    row.missingTokens.map((token) => `${row.alignmentId}:${token}`),
  );
  const missingGeneratedArtifacts = rows.flatMap((row) =>
    row.missingGeneratedArtifacts.map((artifactPath) => `${row.alignmentId}:${artifactPath}`),
  );
  const unsupportedDisclosureClaims = rows.flatMap((row) =>
    row.unsupportedDisclosureClaims.map((claim) => `${row.alignmentId}:${claim}`),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);

  const failures = [
    ...missingAlignmentIds.map((alignmentId) => `missing docs QA alignment ${alignmentId}`),
    ...missingSourceRoots.map((sourceRoot) => `missing docs QA source root ${sourceRoot}`),
    ...staleTokenBlockers.map((token) => `missing expected docs QA token ${token}`),
    ...missingGeneratedArtifacts.map((artifactPath) => `missing generated artifact ${artifactPath}`),
    ...unsupportedDisclosureClaims.map((claim) => `unsupported disclosure claim ${claim}`),
    ...(forbiddenMarkerDetected ? ['docs QA alignment report contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredAlignmentIds: [...DOCS_QA_ALIGNMENT_IDS],
    observedAlignmentIds,
    missingAlignmentIds,
    alignmentCount: rows.length,
    allRequiredAlignmentsCovered: includesAll(observedAlignmentIds, DOCS_QA_ALIGNMENT_IDS),
    specFamilyRepresented: observedAlignmentIds.includes('spec_family_alignment'),
    roadmapReadmeRepresented: observedAlignmentIds.includes('roadmap_readme_alignment'),
    generatedArtifactInventoryRepresented: observedAlignmentIds.includes('generated_artifact_inventory_alignment'),
    catalogImplementationRepresented: observedAlignmentIds.includes('catalog_implementation_alignment'),
    publicDocsRepresented: observedAlignmentIds.includes('public_docs_disclosure_alignment'),
    internalDocsRepresented: observedAlignmentIds.includes('internal_docs_alignment'),
    routeDocsRepresented: observedAlignmentIds.includes('route_docs_alignment'),
    interfaceDocsRepresented: observedAlignmentIds.includes('interface_docs_alignment'),
    generatedProofRepresented: observedAlignmentIds.includes('generated_proof_appendix_alignment'),
    workflowCheckerRepresented: observedAlignmentIds.includes('workflow_checker_alignment'),
    missingSourceRoots,
    staleTokenBlockers,
    missingGeneratedArtifacts,
    unsupportedDisclosureClaims,
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
    sourceSafetyVerdict: DOCS_QA_ALIGNMENT_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-docs-qa-alignment-report',
    schemaId: DOCS_QA_ALIGNMENT_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: DOCS_QA_ALIGNMENT_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedDocsQaData: [
        'file_paths',
        'expected_tokens',
        'observed_token_names',
        'missing_token_names',
        'generated_artifact_paths',
        'proof_roots',
        'failure_codes',
      ],
      forbiddenDocsQaData: [...FORBIDDEN_DOCS_QA_PAYLOAD],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredAlignmentIds: [...DOCS_QA_ALIGNMENT_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      alignmentId: row.alignmentId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `docs-qa-alignment-report:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
