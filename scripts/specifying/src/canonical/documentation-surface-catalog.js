// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH = '.bitcode/v35-documentation-surface-catalog.json';
export const DOCUMENTATION_SURFACE_CATALOG_SCHEMA_ID = 'bitcode.v35.documentationSurfaceCatalog.v1';
export const DOCUMENTATION_SURFACE_CATALOG_VERSION = 'V35';
export const DOCUMENTATION_SURFACE_CATALOG_CURRENT_TARGET = 'V34';
export const DOCUMENTATION_SURFACE_SOURCE_SAFETY_VERDICT = 'source-safe-documentation-surface-metadata';

export const DOCUMENTATION_SURFACE_IDS = Object.freeze([
  'canonical_spec_family',
  'roadmap_contributor_governance',
  'internal_codebase_docs',
  'public_docs_surface',
  'package_readmes',
  'route_api_docs',
  'api_interface_docs',
  'generated_artifact_docs',
  'deployment_operations_docs',
  'telemetry_observability_docs',
  'demonstration_docs',
  'security_boundary_docs',
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

const FORBIDDEN_DOCUMENTATION_CONTENT = Object.freeze([
  'secret_values',
  'wallet_private_material',
  'provider_tokens',
  'protected_source_payloads',
  'raw_protected_prompts',
  'unpaid_assetpack_source',
]);

const SHARED_FRESHNESS_FAILURES = Object.freeze([
  'missing_source_root',
  'stale_spec_token',
  'missing_generated_artifact_binding',
  'unsupported_disclosure_claim',
  'source_unsafe_payload',
]);

const catalogRows = Object.freeze([
  {
    surfaceId: 'canonical_spec_family',
    surfaceKind: 'spec_family',
    audience: ['contributors', 'operators', 'protocol_reviewers'],
    owner: 'scripts/specifying',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'BITCODE_SPEC.txt',
      'BITCODE_SPEC_V35.md',
      'BITCODE_SPEC_V35_DELTA.md',
      'BITCODE_SPEC_V35_NOTES.md',
      'BITCODE_SPEC_V35_PARITY_MATRIX.md',
      'BITCODE_SPECIFYING.md',
      'BITCODE_SPEC_TEMPLATEGUIDE.md',
    ],
    linkedSpecSections: ['V35 source-of-truth hierarchy', 'V35 generated canon', 'V35 validation canon'],
    linkedGeneratedArtifacts: [
      '.bitcode/v35-spec-family-report.json',
      '.bitcode/v35-canonical-input-report.json',
      DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
    ],
    routePackageBindings: ['scripts/specifying/src/canonical/v21-specifying.js'],
    proofCoverage: ['spec-family-check', 'canonical-input-check', 'canon-posture-drift-check'],
  },
  {
    surfaceId: 'roadmap_contributor_governance',
    surfaceKind: 'governance_docs',
    audience: ['contributors', 'reviewers'],
    owner: 'repository-governance',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'SPECIFICATIONS_ROADMAP.md',
      'AGENTS.md',
      'README.md',
      '.github/pull_request_template.md',
      '.github/workflows/bitcode-gate-quality.yml',
      '.github/workflows/bitcode-canon-quality.yml',
    ],
    linkedSpecSections: ['V35 gate plan', 'V35 promotion canon'],
    linkedGeneratedArtifacts: [DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH],
    routePackageBindings: ['package.json', 'scripts/check-v35-gate2-documentation-surface-catalog.mjs'],
    proofCoverage: ['gate-title-check', 'branch-posture-check', 'workflow-posture-check'],
  },
  {
    surfaceId: 'internal_codebase_docs',
    surfaceKind: 'internal_docs',
    audience: ['contributors', 'operators', 'incident_responders'],
    owner: 'internal-docs',
    disclosureClass: 'internal_source_safe',
    sourceRoots: [
      'internal-docs/README.md',
      'internal-docs/BITCODE_ARCHITECTURE_PATTERNS.md',
      'internal-docs/BITCODE_AGENTIC_EXECUTION.md',
      'internal-docs/BITCODE_TERMINAL_OPERATOR_EXPERIENCE.md',
      'internal-docs/DEPLOYMENT.md',
    ],
    linkedSpecSections: ['V35 system architecture and layer boundaries', 'V35 whole Bitcode operator chain'],
    linkedGeneratedArtifacts: [DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH],
    routePackageBindings: ['packages/agent-generics/README.md', 'packages/pipelines-generics/README.md'],
    proofCoverage: ['internal-docs-source-root-check', 'operator-docs-freshness-check'],
  },
  {
    surfaceId: 'public_docs_surface',
    surfaceKind: 'public_docs',
    audience: ['enterprise_readers', 'depositors', 'interface_consumers'],
    owner: 'apps/uapi',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'apps/uapi/app/docs/page.tsx',
      'apps/uapi/app/docs/[slug]/page.tsx',
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/app/docs/DocsArticlePage.tsx',
      'apps/uapi/components/marketing/PublicDocsPageContent/PublicDocsPageContent.tsx',
    ],
    linkedSpecSections: ['V35 accepted boundaries and reopen conditions', 'Appendix A. Canonical type and surface catalog'],
    linkedGeneratedArtifacts: [DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH],
    routePackageBindings: ['apps/uapi/app/docs/[slug]/page.tsx', 'docs/api/conversations-openapi.yaml'],
    proofCoverage: ['public-docs-disclosure-check', 'route-rendering-check'],
  },
  {
    surfaceId: 'package_readmes',
    surfaceKind: 'package_docs',
    audience: ['contributors', 'package_owners'],
    owner: 'package-workspaces',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'scripts/specifying/README.md',
      'packages/btd/README.md',
      'packages/api/README.md',
      'packages/asset-packs-pipelines/domain/README.md',
      'packages/pipeline-hosts/README.md',
    ],
    linkedSpecSections: ['V35 proof/test package API and inherited support canon'],
    linkedGeneratedArtifacts: [DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH],
    routePackageBindings: [
      'scripts/specifying/src/index.js',
      'packages/btd/src/index.ts',
      'packages/api/src',
      'packages/asset-packs-pipelines/domain/src',
    ],
    proofCoverage: ['package-boundary-test', 'workspace-typecheck'],
  },
  {
    surfaceId: 'route_api_docs',
    surfaceKind: 'route_docs',
    audience: ['interface_consumers', 'operators'],
    owner: 'apps/uapi',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'apps/uapi/app/api/read-review/route.ts',
      'apps/uapi/app/api/pipeline-host/asset-pack/route.ts',
      'apps/uapi/app/api/pipeline-host/asset-pack/preflight.ts',
      'apps/uapi/app/api/executions/stream/route.ts',
      'docs/api/conversations-openapi.yaml',
    ],
    linkedSpecSections: ['V35 system architecture and layer boundaries', 'V35 whole Bitcode operator chain'],
    linkedGeneratedArtifacts: [DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH],
    routePackageBindings: ['apps/uapi/tests/api/pipelineHostRoute.test.ts', 'apps/uapi/tests/api/readReviewRoute.test.ts'],
    proofCoverage: ['route-contract-test', 'terminal-harness-test'],
  },
  {
    surfaceId: 'api_interface_docs',
    surfaceKind: 'interface_docs',
    audience: ['api_consumers', 'mcp_consumers', 'chatgpt_app_consumers'],
    owner: 'interface-packages',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'packages/api/README.md',
      'packages/mcp-generics/README.md',
      'apps/chatgpt/README.md',
      'apps/uapi/README.md',
      'docs/api/conversations-openapi.yaml',
    ],
    linkedSpecSections: ['V35 system architecture and layer boundaries', 'V35 proof/test package API and inherited support canon'],
    linkedGeneratedArtifacts: [
      '.bitcode/v33-interface-contract-catalog.json',
      '.bitcode/v33-mcp-api-tool-contracts.json',
      '.bitcode/v33-chatgpt-app-action-contracts.json',
      DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
    ],
    routePackageBindings: ['apps/mcp', 'apps/chatgpt/src'],
    proofCoverage: ['interface-contract-test', 'schema-compatibility-check'],
  },
  {
    surfaceId: 'generated_artifact_docs',
    surfaceKind: 'generated_artifact_docs',
    audience: ['protocol_reviewers', 'operators'],
    owner: 'scripts/specifying',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      '.bitcode/v34-deployment-host-capability-catalog.json',
      '.bitcode/v34-distributed-execution-runtime-receipts.json',
      '.bitcode/v34-deployment-storage-posture.json',
      'scripts/specifying/src/canonical/v21-specifying.js',
      'scripts/generate-bitcode-proven.mjs',
    ],
    linkedSpecSections: ['Appendix C. Generated artifact contract catalog', 'V35 generated canon'],
    linkedGeneratedArtifacts: [
      '.bitcode/v35-spec-family-report.json',
      '.bitcode/v35-canonical-input-report.json',
      DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
    ],
    routePackageBindings: ['scripts/check-bitcode-spec-family.mjs', 'scripts/check-bitcode-canonical-inputs.mjs'],
    proofCoverage: ['generated-artifact-stability-check', 'diff-hygiene-check'],
  },
  {
    surfaceId: 'deployment_operations_docs',
    surfaceKind: 'operator_docs',
    audience: ['operators', 'incident_responders'],
    owner: 'deployment-operations',
    disclosureClass: 'internal_source_safe',
    sourceRoots: [
      'infra/README.md',
      'internal-docs/DEPLOYMENT.md',
      'packages/externals/vercel/README.md',
      'packages/supabase/README.md',
      'packages/pipeline-hosts/README.md',
    ],
    linkedSpecSections: ['V35 whole Bitcode operator chain', 'V35 inherited deployment-depth notes'],
    linkedGeneratedArtifacts: [
      '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
      '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
      DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
    ],
    routePackageBindings: ['.github/workflows/bitcode-gate-quality.yml', '.github/workflows/bitcode-canon-quality.yml'],
    proofCoverage: ['deployment-rehearsal-check', 'rollback-playbook-check'],
  },
  {
    surfaceId: 'telemetry_observability_docs',
    surfaceKind: 'telemetry_docs',
    audience: ['operators', 'pipeline_owners', 'incident_responders'],
    owner: 'observability-packages',
    disclosureClass: 'internal_source_safe',
    sourceRoots: [
      'scripts/specifying/src/telemetry.js',
      'internal-docs/BITCODE_EXECUTIONS.md',
      'internal-docs/BITCODE_PROMPT_TRACE.md',
      'packages/observability/README.md',
      'packages/api/src/streams/README.md',
    ],
    linkedSpecSections: ['V35 proof-family canon', 'V35 validation canon'],
    linkedGeneratedArtifacts: [
      '.bitcode/v30-protocol-telemetry-proof-hooks.json',
      '.bitcode/v31-auxillaries-telemetry-proof-hooks.json',
      '.bitcode/v33-interface-telemetry-proof-hooks.json',
      DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
    ],
    routePackageBindings: ['apps/uapi/app/api/executions/stream/route.ts', 'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx'],
    proofCoverage: ['telemetry-proof-hook-check', 'stream-contract-test'],
  },
  {
    surfaceId: 'demonstration_docs',
    surfaceKind: 'demonstration_docs',
    audience: ['protocol_reviewers', 'contributors'],
    owner: 'protocol-demonstration',
    disclosureClass: 'public_source_safe',
    sourceRoots: [
      'protocol-demonstration/README.md',
      'protocol-demonstration/src/canon-posture.js',
      'protocol-demonstration/test/v21-specifying.test.js',
      'protocol-demonstration/test/v28-mvp-qa.test.js',
    ],
    linkedSpecSections: ['V35 accepted boundaries and reopen conditions'],
    linkedGeneratedArtifacts: [DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH],
    routePackageBindings: ['scripts/specifying/test/protocol-package-boundary.test.js'],
    proofCoverage: ['demonstration-boundary-test', 'standalone-mvp-test'],
  },
  {
    surfaceId: 'security_boundary_docs',
    surfaceKind: 'security_docs',
    audience: ['operators', 'security_reviewers', 'contributors'],
    owner: 'security-boundary',
    disclosureClass: 'internal_source_safe',
    sourceRoots: [
      'internal-docs/SECURITY.md',
      'packages/security/README.md',
      'packages/auth/README.md',
      'packages/btd/README.md',
      'apps/uapi/.ai/AGENTS.md',
    ],
    linkedSpecSections: ['Identity, authorization, and sensitive flow', 'Disclosure and projection'],
    linkedGeneratedArtifacts: [
      '.bitcode/v34-secret-rotation-boundary-operations.json',
      '.bitcode/v33-interface-authorization-policy.json',
      DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
    ],
    routePackageBindings: ['apps/uapi/tests/protocolCommercialBoundary.test.ts', 'packages/btd/__tests__/interface-authorization-policy.test.ts'],
    proofCoverage: ['secret-boundary-check', 'authorization-policy-test'],
  },
]);

export const DOCUMENTATION_SURFACE_ROWS = catalogRows;

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
export function buildDocumentationSurfaceCatalog(input = {}) {
  const version = input.version || DOCUMENTATION_SURFACE_CATALOG_VERSION;
  const currentTarget = input.currentTarget || DOCUMENTATION_SURFACE_CATALOG_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = catalogRows.map((row) => {
    const sourceEvidence = row.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sourceSafetyClass: 'source_safe_documentation_metadata',
      forbiddenContent: [...FORBIDDEN_DOCUMENTATION_CONTENT],
      freshnessChecks: [
        {
          checkId: `${row.surfaceId}.source-roots-present`,
          command: 'pnpm run check:v35-documentation-surface-catalog',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FRESHNESS_FAILURES],
        },
      ],
      sourceEvidence,
    };

    return {
      ...rowWithoutRoot,
      rowRoot: `documentation-surface-row:${sha256(row.surfaceId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedSurfaceIds = rows.map((row) => row.surfaceId);
  const missingRequiredSurfaceIds = DOCUMENTATION_SURFACE_IDS.filter((surfaceId) => !observedSurfaceIds.includes(surfaceId));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.surfaceId}:${entry.sourceRoot}`),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const publicDocsRepresented = rows.some((row) => row.surfaceId === 'public_docs_surface');
  const internalDocsRepresented = rows.some((row) => row.surfaceId === 'internal_codebase_docs');
  const routeDocsRepresented = rows.some((row) => row.surfaceId === 'route_api_docs');
  const packageDocsRepresented = rows.some((row) => row.surfaceId === 'package_readmes');
  const generatedArtifactsRepresented = rows.some((row) => row.surfaceId === 'generated_artifact_docs');
  const apiInterfaceDocsRepresented = rows.some((row) => row.surfaceId === 'api_interface_docs');
  const legacySourceRoots = rows.some((row) => row.sourceRoots.some((sourceRoot) => sourceRoot.startsWith('_legacy/')));
  const protectedSourceVisible = rows.some((row) => row.disclosureClass === 'public_source_safe' && row.forbiddenContent.length === 0);

  const failures = [
    ...missingRequiredSurfaceIds.map((surfaceId) => `missing required documentation surface ${surfaceId}`),
    ...missingSourceRoots.map((sourceRoot) => `missing documentation source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['documentation catalog contains a secret-shaped marker'] : []),
    ...(legacySourceRoots ? ['documentation catalog points at _legacy source roots'] : []),
    ...(protectedSourceVisible ? ['public documentation row lacks forbidden-content boundary'] : []),
  ];

  const coverage = {
    requiredSurfaceIds: [...DOCUMENTATION_SURFACE_IDS],
    observedSurfaceIds,
    missingRequiredSurfaceIds,
    surfaceCount: rows.length,
    allRequiredSurfacesCovered: includesAll(observedSurfaceIds, DOCUMENTATION_SURFACE_IDS),
    publicDocsRepresented,
    internalDocsRepresented,
    routeDocsRepresented,
    packageDocsRepresented,
    generatedArtifactsRepresented,
    apiInterfaceDocsRepresented,
    freshnessCheckCount: rows.reduce((count, row) => count + row.freshnessChecks.length, 0),
    missingSourceRoots,
    legacySourceRoots,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: DOCUMENTATION_SURFACE_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-documentation-surface-catalog',
    schemaId: DOCUMENTATION_SURFACE_CATALOG_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: DOCUMENTATION_SURFACE_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      publicDocsMayExpose: ['guidance', 'measurements', 'proof_roots', 'fee_right_boundaries', 'source_safe_previews'],
      publicDocsMustNotExpose: [...FORBIDDEN_DOCUMENTATION_CONTENT],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredSurfaceIds: [...DOCUMENTATION_SURFACE_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      surfaceId: row.surfaceId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `documentation-surface-catalog:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
