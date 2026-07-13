// @ts-check

import { accessSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DEFAULT_V21_SPECIFYING_REPO_ROOT = path.resolve(__dirname, '../../../..');

export const COMMON_REQUIRED_SPEC_SECTIONS = [
  'Status',
  'Version executive summary',
  'Canonical Bitcode executive summary',
  'source-of-truth hierarchy',
  'full-system, re-implementation, and audit rule',
  'totality and precision enforcement rule',
  'system goals, non-goals, and design principles',
  'system architecture and layer boundaries',
  'canonical domain model',
  'whole Bitcode operator chain',
  'canonical subsystem surfaces',
  'proof-family canon',
  'generated canon',
  'validation canon',
  'promotion canon',
  'appendices and canonical supporting material',
  'accepted boundaries and reopen conditions',
  'completion condition'
];

export const COMMON_REQUIRED_STATUS_LABELS = [
  'Prior canonical anchor',
  'Prior generated proof appendix',
  'Generated structured artifact inventory',
  'Source parity state'
];

export const COMMON_REQUIRED_SPEC_APPENDIX_SECTIONS = [
  'Appendix A. Canonical type and surface catalog',
  'Appendix B. Proof family closure catalog',
  'Exact proof-family inventory matrix',
  'Appendix C. Generated artifact contract catalog',
  'Minimum generated appendix rendered contents',
  'Canonical regeneration and fail-closed posture',
  'Appendix D. Validation and checking gate catalog',
  'Appendix E. Current canonical source map',
  'Appendix F. Subsystem totality and derivability matrix',
  'Appendix G. Canonical file-family and promotion contract catalog',
  'Appendix H. Operator surface and quality contract catalog',
  'Appendix I. Scenario, workflow, and cross-product contract catalog',
  'Appendix J. Fail-closed contract and error posture matrix',
  'Appendix K. Source-bearing AssetPack and artifact contract catalog'
];

export const COMMON_REQUIRED_PROOF_FAMILY_SECTIONS = [
  'Inference-synthesis',
  'Prompt-completeness',
  'Static-code-analysis',
  'Verification-decisions',
  'Selection-and-materialization',
  'Authorization-and-sensitive-flow',
  'Settlement-source-to-shares',
  'Disclosure-boundary',
  'Proof-contract'
];

export const COMMON_REQUIRED_PROOF_FAMILY_DETAIL_LABELS = [
  'proofArtifactPath:',
  'members:',
  'theoremIds:',
  'replayStepIds:',
  'witnessArtifactPaths:',
  'current member closure criteria:',
  'current member verdict shape:',
  'current theorem-by-theorem closure reading:',
  'current theorem-to-replay grouping:',
  'minimum artifact/replay binding set:',
  'current proof-object fields:',
  'generated-artifact and test bindings:',
  'fail-closed conditions:'
];

export const COMMON_REQUIRED_PROOF_FAMILY_MATRIX_HEADERS = [
  'proofFamily',
  'proofArtifactPath',
  'memberIds',
  'theoremIds',
  'replayStepIds',
  'witnessArtifactPaths',
  'Current source basis'
];

export const COMMON_REQUIRED_SUBSYSTEM_COVERAGE_PHRASES = [
  'repo supply and depositing',
  'reading and measured demand',
  'prompt/inference/evaluator ownership',
  'deposit-to-read fit',
  'recall and ranking',
  'verification decisions',
  'selection and materialization',
  'branch artifacts and assetPackEvidence',
  'identity, authority, signing, and policy',
  'sensitive data and confidentiality flows',
  'projection, disclosure, and redaction',
  'proof families, members, theorems, witnesses, and replay',
  'settlement, source-to-shares, journals, and exact accounting',
  'telemetry, persistence, state, and failure semantics',
  'host/runtime capability truth',
  'operator experience and pedagogy',
  'validation and test stack',
  'generated artifacts and canonical promotion'
];

export const COMMON_REQUIRED_SUBSYSTEM_SECTION_HEADINGS = [
  'Depositing and asset supply',
  'Reading and prompt/inference ownership',
  'Fit, recall, ranking, and verification',
  'Selection and materialization',
  'Identity, authorization, and sensitive flow',
  'Disclosure and projection',
  'Settlement and exact accounting',
  'Proof contract, witnesses, and replay'
];

export const COMMON_REQUIRED_SUBSYSTEM_DETAIL_LABELS = [
  'Current canonical objects and emitted artifacts',
  'Current algorithms and derivation rules',
  'Current invariants and fail-closed conditions',
  'Current proof obligations',
  'Current source-bearing implementation basis',
  'Current validating commands and parity basis',
  'Current accepted boundaries'
];

export const COMMON_REQUIRED_CROSS_PRODUCT_APPENDIX_PHRASES = [
  'auth-issuer-rollback',
  'privacy-boundary-proof-export',
  'polyglot-gateway-benchmark-remediation',
  'auth-many-asset-normalization',
  'Targeted deposit',
  'Normalization deposit',
  'patch',
  'context',
  'public',
  'buyer',
  'reviewer',
  'internal',
  'Openly writable',
  'Measurably readable',
  'Provable',
  'Valuable'
];

export const COMMON_REQUIRED_FAIL_CLOSED_APPENDIX_PHRASES = [
  'invalid deposit',
  'prompt contract incompleteness',
  'parsed-envelope inadmissibility',
  'no-survivor asset pack',
  'authorization denial',
  'public projection overexposure',
  'settlement conservation drift',
  'stale promoted status truth'
];

export const COMMON_REQUIRED_GENERATED_APPENDIX_CONTRACT_PHRASES = [
  'aggregate proof verdict',
  'exact proof-family inventory',
  'exact per-family member inventory',
  'exact per-family theorem inventory',
  'exact replay-step inventories and theorem bindings',
  'witness artifact inventories',
  'generated artifact inventories',
  'scenario and run coverage matrices',
  'proof-source commit',
  'fail closed when'
];

const COMMON_ALLOWED_PARITY_JUDGMENTS = new Set([
  'drafted',
  'implemented',
  'implemented prerequisite',
  'implemented in docs',
  'implemented in docs / pending in source',
  'substantially advanced',
  'closed',
  'closed in docs',
  'implemented; promotion pending',
  'spec closed; source gap',
  'generated artifact pending',
  'accepted boundary',
  'reopened',
  'blocked',
  'draft-required',
  'not yet implemented',
  'pending',
  'retired',
  'historical only'
]);

/**
 * @param {string} version
 * @returns {number}
 */
function versionNumber(version) {
  return Number(String(version || '').replace(/^V/u, ''));
}

/**
 * @param {string} version
 * @returns {string}
 */
function previousVersion(version) {
  const numeric = versionNumber(version);
  return Number.isInteger(numeric) && numeric > 0 ? `V${numeric - 1}` : '';
}

/**
 * @param {string} version
 * @returns {boolean}
 */
function usesBitcodeSpecFamily(version) {
  return Number.isInteger(versionNumber(version)) && versionNumber(version) >= 26;
}

/**
 * @param {string} version
 * @returns {boolean}
 */
function usesRequiredNotesCompanion(version) {
  return usesBitcodeSpecFamily(version) && versionNumber(version) >= 26;
}

/**
 * @param {string} version
 * @returns {string}
 */
function specPointerFilename(version) {
  return usesBitcodeSpecFamily(version) ? 'BITCODE_SPEC.txt' : 'ENGI_SPEC.txt';
}

/**
 * @param {string} repoRoot
 * @param {string} version
 * @returns {string}
 */
function resolveSpecPointerFilename(repoRoot, version) {
  const preferred = specPointerFilename(version);
  const preferredPath = path.join(repoRoot, preferred);
  if (fileExists(preferredPath)) return preferred;

  const fallback = preferred === 'BITCODE_SPEC.txt' ? 'ENGI_SPEC.txt' : 'BITCODE_SPEC.txt';
  const fallbackPath = path.join(repoRoot, fallback);
  if (fileExists(fallbackPath)) return fallback;

  return preferred;
}

/**
 * @param {string} version
 * @returns {string}
 */
function specSupportPrefix(version) {
  return usesBitcodeSpecFamily(version) ? 'BITCODE_SPEC' : 'ENGI_SPEC';
}

/**
 * @param {string} version
 * @returns {string}
 */
function specFamilyPrefix(version) {
  return usesBitcodeSpecFamily(version) ? 'BITCODE_SPEC' : 'ENGI_SPEC';
}

/**
 * @param {string} version
 * @returns {string}
 */
function specFamilyDirectory(version) {
  return usesBitcodeSpecFamily(version) ? '' : '_legacy';
}

/**
 * @param {string} version
 * @param {string} [suffix='']
 * @returns {string}
 */
function specMarkdownFilename(version, suffix = '') {
  return `${specFamilyPrefix(version)}_${version}${suffix}.md`;
}

/**
 * @param {string} version
 * @param {string} [suffix='']
 * @returns {string}
 */
function specRelativePath(version, suffix = '') {
  const directory = specFamilyDirectory(version);
  const filename = specMarkdownFilename(version, suffix);
  return directory ? `${directory}/${filename}` : filename;
}

/**
 * @param {string} repoRoot
 * @param {string} version
 * @param {string} [suffix='']
 * @returns {string}
 */
function specAbsolutePath(repoRoot, version, suffix = '') {
  return path.join(repoRoot, specFamilyDirectory(version), specMarkdownFilename(version, suffix));
}

/**
 * @param {string} version
 */
function buildV21LikeProfile(version) {
  const versionLower = version.toLowerCase();
  return {
    reportId: `${versionLower}-spec-family-report`,
    defaultTarget: version,
    requiredStatusLabels: COMMON_REQUIRED_STATUS_LABELS,
    requiredPromotedStatusLabels: ['Canonical proof-source commit'],
    requiredSpecSections: COMMON_REQUIRED_SPEC_SECTIONS,
    requiredSpecAppendixSections: COMMON_REQUIRED_SPEC_APPENDIX_SECTIONS,
    requiredProofFamilySections: COMMON_REQUIRED_PROOF_FAMILY_SECTIONS,
    requiredProofFamilyDetailLabels: COMMON_REQUIRED_PROOF_FAMILY_DETAIL_LABELS,
    requiredProofFamilyMatrixHeaders: COMMON_REQUIRED_PROOF_FAMILY_MATRIX_HEADERS,
    requiredGeneratedArtifactCatalogSections: [
      'Inherited V19 reproducible-canon artifacts',
      'Inherited V20 operator-quality artifacts',
      'Exact generated-artifact inventory matrix',
      `${version} specifying generated artifacts`,
      'Shared generated-artifact fields',
      'Artifact-specific generated payload fields',
      'Artifact confidentiality and disclosability taxonomy',
      'Minimum generated appendix rendered contents',
      'Canonical regeneration and fail-closed posture'
    ],
    requiredGeneratedAppendixContractPhrases: COMMON_REQUIRED_GENERATED_APPENDIX_CONTRACT_PHRASES,
    requiredGeneratedArtifactPaths: [
      `.bitcode/${versionLower}-spec-family-report.json`,
      `.bitcode/${versionLower}-canonical-input-report.json`,
      ...(version === 'V30'
        ? [
          '.bitcode/v30-canon-posture-drift-report.json',
          '.bitcode/v30-protocol-telemetry-proof-hooks.json'
        ]
        : []),
      ...(version === 'V31'
        ? [
          '.bitcode/v31-canon-posture-drift-report.json',
          '.bitcode/v31-auxillaries-telemetry-proof-hooks.json'
        ]
        : []),
      ...(version === 'V32'
        ? [
          '.bitcode/v32-canon-posture-drift-report.json',
          '.bitcode/v32-proof-coverage-matrix.json',
          '.bitcode/v32-artifact-volatility-inventory.json',
          '.bitcode/v32-deterministic-replay-report.json',
          '.bitcode/v32-reading-pipeline-proof-coverage.json',
          '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json',
          '.bitcode/v32-interface-contract-regression-suite.json',
          '.bitcode/v32-browser-accessibility-responsive-visual-proof.json',
          '.bitcode/v32-testnet-mainnet-readiness-rehearsal.json',
          '.bitcode/v32-promotion-proof-generation-hardening.json',
          '.bitcode/v32-promotion-readiness-report.json'
        ]
        : []),
      ...(version === 'V33'
        ? [
          '.bitcode/v33-canon-posture-drift-report.json',
          '.bitcode/v33-interface-contract-catalog.json',
          '.bitcode/v33-mcp-api-tool-contracts.json',
          '.bitcode/v33-chatgpt-app-action-contracts.json',
          '.bitcode/v33-interface-authorization-policy.json',
          '.bitcode/v33-read-license-assetpack-rights-contracts.json',
          '.bitcode/v33-api-schema-compatibility-matrix.json',
          '.bitcode/v33-interface-telemetry-proof-hooks.json',
          '.bitcode/v33-interface-consumer-ux-regression-proof.json',
          '.bitcode/v33-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V34'
        ? [
          '.bitcode/v34-deployment-host-capability-catalog.json',
          '.bitcode/v34-environment-lane-contracts.json',
          '.bitcode/v34-distributed-execution-runtime-receipts.json',
          '.bitcode/v34-deployment-storage-posture.json',
          '.bitcode/v34-secret-rotation-boundary-operations.json',
          '.bitcode/v34-migration-cicd-approval-gates.json',
          '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
          '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
          '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
          '.bitcode/v34-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V35'
        ? [
          '.bitcode/v35-documentation-surface-catalog.json',
          '.bitcode/v35-telemetry-taxonomy-catalog.json',
          '.bitcode/v35-public-docs-usage-guides.json',
          '.bitcode/v35-operator-runbook-catalog.json',
          '.bitcode/v35-docs-qa-alignment-report.json',
          '.bitcode/v35-testnet-rollout-readiness-guide.json',
          '.bitcode/v35-telemetry-documentation-interface-integration.json',
          '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
          '.bitcode/v35-documentation-telemetry-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V36'
        ? [
          '.bitcode/v36-exchange-activity-book.json',
          '.bitcode/v36-exchange-intent-order-contracts.json',
          '.bitcode/v36-exchange-rights-transfer-review.json',
          '.bitcode/v36-pricing-liquidity-fee-quote.json',
          '.bitcode/v36-exchange-settlement-reconciliation.json',
          '.bitcode/v36-exchange-dispute-repair-revenue-route.json',
          '.bitcode/v36-exchange-ux-proof.json',
          '.bitcode/v36-exchange-rehearsal.json',
          '.bitcode/v36-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V37'
        ? [
          '.bitcode/v37-conversation-session-route-history.json',
          '.bitcode/v37-conversation-stream-event-contract.json',
          '.bitcode/v37-conversation-writing-workspace.json',
          '.bitcode/v37-conversation-source-selector.json',
          '.bitcode/v37-conversation-terminal-handoff.json',
          '.bitcode/v37-conversation-persistence-privacy-redaction.json',
          '.bitcode/v37-conversation-telemetry-proof-hooks.json',
          '.bitcode/v37-conversation-rehearsal.json',
          '.bitcode/v37-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V38'
        ? [
          '.bitcode/v38-inference-surface-inventory.json',
          '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
          '.bitcode/v38-prompt-benchmark-report.json',
          '.bitcode/v38-disclosure-boundary-report.json',
          '.bitcode/v38-read-need-comprehension-inference-hardening.json',
          '.bitcode/v38-read-fits-finding-search-embeddings.json',
          '.bitcode/v38-assetpack-synthesis-economic-traceability.json',
          '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
          '.bitcode/v38-local-staging-inference-depository-search-rehearsal.json',
          '.bitcode/v38-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V39'
        ? [
          '.bitcode/v39-depository-supply-indexing.json',
          '.bitcode/v39-enterprise-reading-ux-state.json',
          '.bitcode/v39-read-need-review-resynthesis.json',
          '.bitcode/v39-read-fits-finding-runtime.json',
          '.bitcode/v39-assetpack-preview-quote-boundary.json',
          '.bitcode/v39-settlement-rights-delivery.json',
          '.bitcode/v39-operational-telemetry-repair-readback.json',
          '.bitcode/v39-interface-conversation-product-parity.json',
          '.bitcode/v39-local-staging-reading-rehearsal.json',
          '.bitcode/v39-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V40'
        ? [
          '.bitcode/v40-test-inventory-coverage-matrix.json',
          '.bitcode/v40-unit-coverage-inventory.json',
          '.bitcode/v40-api-integration-contracts.json',
          '.bitcode/v40-reading-pipeline-integration-coverage.json',
          '.bitcode/v40-conversation-terminal-integration.json',
          '.bitcode/v40-browser-e2e-visual-proof.json',
          '.bitcode/v40-ledger-storage-sync.json',
          '.bitcode/v40-local-staging-rehearsal-automation.json',
          '.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json',
          '.bitcode/v40-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V41'
        ? [
          '.bitcode/v41-promptpart-prompt-inventory.json',
          '.bitcode/v41-registry-interpolation-contracts.json',
          '.bitcode/v41-reading-prompt-benchmark-baselines.json',
          '.bitcode/v41-readneed-prompt-hardening.json',
          '.bitcode/v41-readfitsfinding-prompt-hardening.json',
          '.bitcode/v41-conversation-tool-interface-prompt-rewrite.json',
          '.bitcode/v41-prompt-program-benchmark-report.json',
          '.bitcode/v41-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V42'
        ? [
          '.bitcode/v42-depositing-shortest-path.json',
          '.bitcode/v42-reading-shortest-path-state-machine.json',
          '.bitcode/v42-readneed-review-resynthesis-product-closure.json',
          '.bitcode/v42-readfitsfinding-preview-quote.json',
          '.bitcode/v42-settlement-rights-delivery.json',
          '.bitcode/v42-ai-reading-demonstration.json',
          '.bitcode/v42-local-staging-mvp-rehearsal.json',
          '.bitcode/v42-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V43'
        ? [
          '.bitcode/v43-route-vocabulary-inventory.json',
          '.bitcode/v43-packs-activity-master-detail.json',
          '.bitcode/v43-read-route-five-step-ux.json',
          '.bitcode/v43-deposit-route-options.json',
          '.bitcode/v43-deposit-policy-compensation.json',
          '.bitcode/v43-deposit-option-admission.json',
          '.bitcode/v43-route-ux-product-excellence.json',
          '.bitcode/v43-cross-route-rehearsal-telemetry-repair.json',
          '.bitcode/v43-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V44'
        ? [
          '.bitcode/v44-economic-domain-model.json',
          '.bitcode/v44-packs-portfolio-market-intelligence.json',
          '.bitcode/v44-reading-budget-quote-policy.json',
          '.bitcode/v44-depositor-earnings-supply-opportunities.json',
          '.bitcode/v44-btd-btc-compensation-statements.json',
          '.bitcode/v44-organization-policy-wallet-authority.json',
          '.bitcode/v44-enterprise-product-ux.json',
          '.bitcode/v44-scaled-network-rehearsal.json',
          '.bitcode/v44-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V45'
        ? [
          '.bitcode/v45-inference-synthesis-proof.json',
          '.bitcode/v45-prompt-completeness-proof.json',
          '.bitcode/v45-static-code-analysis-proof.json',
          '.bitcode/v45-verification-decisions-proof.json',
          '.bitcode/v45-selection-materialization-proof.json',
          '.bitcode/v45-authorization-sensitive-flow-proof.json',
          '.bitcode/v45-settlement-source-to-shares-proof.json',
          '.bitcode/v45-disclosure-boundary-proof.json',
          '.bitcode/v45-proof-contract-proof.json',
          '.bitcode/v45-source-safe-e2e-rehearsal.json',
          '.bitcode/v45-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V46'
        ? [
          '.bitcode/v46-protocol-comprehension-object-model.json',
          '.bitcode/v46-public-operator-claim-boundaries.json',
          '.bitcode/v46-product-route-comprehension-readback.json',
          '.bitcode/v46-interface-claim-contracts.json',
          '.bitcode/v46-proof-readback-operator-explanation.json',
          '.bitcode/v46-local-interface-comprehension-rehearsal.json',
          '.bitcode/v46-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V47'
        ? [
          '.bitcode/v47-feature-excess-alignment-audit.json',
          '.bitcode/v47-seller-buyer-state-machine-law.json',
          '.bitcode/v47-depositor-website-completion.json',
          '.bitcode/v47-reader-website-completion.json',
          '.bitcode/v47-packs-auxillaries-commercial-dashboard.json',
          '.bitcode/v47-e2e-ip-selling-buying-tests.json',
          '.bitcode/v47-landing-public-launch-messaging.json',
          '.bitcode/v47-staging-testnet-deployment-rehearsal.json',
          '.bitcode/v47-promotion-readiness-report.json'
        ]
      : []),
      ...(version === 'V26'
        ? [
          '.bitcode/terminal-composition-proof.json',
          '.bitcode/conversations-continuity-proof.json',
          '.bitcode/environment-mode-coherence-proof.json',
          '.bitcode/v26-gate-checkpoint-report.json',
          '.bitcode/runs-pipelines-totality-proof.json',
          '.bitcode/persistence-schema-totality-proof.json',
          '.bitcode/prompt-system-totality-proof.json',
          '.bitcode/inference-implementation-records-proof.json',
          '.bitcode/fourth-gate-reclosure-review-proof.json',
          '.bitcode/source-to-shares-fifth-gate-proof.json',
          '.bitcode/v26-product-readiness-audit.json',
          '.bitcode/fifth-gate-closure-deepening-proof.json',
          '.bitcode/fifth-gate-closure-proof.json',
          '.bitcode/sixth-gate-mvp-closure-proof.json',
          '.bitcode/seventh-gate-commercial-testnet-launch-proof.json',
          '.bitcode/prompt-space-completeness-proof.json',
          '.bitcode/retained-package-admissibility-proof.json',
          '.bitcode/system-reform-admissibility-proof.json',
          '.bitcode/whole-repository-production-satisfaction-proof.json',
          '.bitcode/v26-total-closure-proof.json'
        ]
        : [])
    ],
    requiredSubsystemCoveragePhrases: COMMON_REQUIRED_SUBSYSTEM_COVERAGE_PHRASES,
    requiredSubsystemSectionHeadings: COMMON_REQUIRED_SUBSYSTEM_SECTION_HEADINGS,
    requiredSubsystemDetailLabels: COMMON_REQUIRED_SUBSYSTEM_DETAIL_LABELS,
    crossProductAppendixHeading: 'Appendix I. Scenario, workflow, and cross-product contract catalog',
    requiredCrossProductAppendixPhrases: COMMON_REQUIRED_CROSS_PRODUCT_APPENDIX_PHRASES,
    failClosedAppendixHeading: 'Appendix J. Fail-closed contract and error posture matrix',
    requiredFailClosedAppendixPhrases: COMMON_REQUIRED_FAIL_CLOSED_APPENDIX_PHRASES,
    assetPackAppendixHeading: 'Appendix K. Source-bearing AssetPack and artifact contract catalog',
    requiredAssetPackAppendixPhrases: [
      '.bitcode/asset-pack.lock.json',
      '.bitcode/selected-source-material.json',
      '.bitcode/verification-report.json',
      '.bitcode/source-to-shares.json',
      '.bitcode/projection-policy.json',
      '.bitcode/system-proof-bundle.json',
      specRelativePath(version, '_PROVEN')
    ],
    requiredDeltaSections: [
      'Status',
      `Why ${version} exists`,
      `Accepted ${version} decisions`,
      'Explicitly deferred',
      'Pre-Implementation Sequence',
      'Commit-Body Direction'
    ],
    requiredNotesSections: usesRequiredNotesCompanion(version)
      ? [
        'Status',
        'Notes companion rule',
        'Concise current-system reading',
        'Simplified-spec reading rule'
      ]
      : [],
    requiredParitySections: [
      'Status',
      'Purpose',
      'Audit basis',
      'implementation matrix',
      'accepted boundaries',
      'completion condition'
    ],
    forbiddenPhrases: []
  };
}

function buildV22Profile() {
  const base = buildV21LikeProfile('V22');
  return {
    ...base,
    requiredGeneratedArtifactCatalogSections: [
      'Inherited V19 reproducible-canon artifacts',
      'Inherited V20 operator-quality artifacts',
      'Exact generated-artifact inventory matrix',
      'V22 specifying generated artifacts',
      'V22 canon-posture drift detection artifact',
      'Shared generated-artifact fields',
      'Artifact-specific generated payload fields',
      'Artifact confidentiality and disclosability taxonomy',
      'Minimum generated appendix rendered contents',
      'Canonical regeneration and fail-closed posture'
    ],
    requiredGeneratedAppendixContractPhrases: [
      ...COMMON_REQUIRED_GENERATED_APPENDIX_CONTRACT_PHRASES,
      'canon posture drift report',
      'runtime/api/browser/readme/test alignment',
      'promotion-time runtime posture rewrite'
    ],
    requiredGeneratedArtifactPaths: [
      ...base.requiredGeneratedArtifactPaths,
      '.bitcode/v22-canon-posture-drift-report.json'
    ],
    requiredAssetPackAppendixPhrases: [
      ...base.requiredAssetPackAppendixPhrases,
      '.bitcode/v22-canon-posture-drift-report.json'
    ]
  };
}

function buildV23Profile() {
  return {
    reportId: 'v23-spec-family-report',
    defaultTarget: 'V23',
    requiredStatusLabels: COMMON_REQUIRED_STATUS_LABELS,
    requiredPromotedStatusLabels: ['Canonical proof-source commit'],
    requiredSpecSections: [
      'Status',
      'Drafting and acceptance state',
      'Version executive summary',
      'Canonical Bitcode executive summary',
      'V23 inheritance rule',
      'V23 audit findings',
      'V23 denomination and naming rule',
      'V23 accepted decisions',
      'V23 source-of-truth hierarchy',
      'V23 system goals, non-goals, and design principles',
      'V23 system architecture and layer boundaries',
      'V23 compute and storage reality rule',
      'V23 artifact family additions',
      'V23 commitment derivation contract',
      'V23 canonical enum set',
      'V23 proof-family additions',
      'V23 principal-scoped anchoring policy',
      'V23 BTC artifact projection matrix',
      'V23 settlement interface modes',
      'V23 confirmation and journal finalization policy',
      'V23 phased deployment rule',
      'Accepted boundaries',
      'V23 completion condition'
    ],
    requiredSpecAppendixSections: [],
    requiredProofFamilySections: [
      'Bitcoin-audit-anchor',
      'Bitcoin-settlement-interface'
    ],
    requiredProofFamilyDetailLabels: [
      'proofArtifactPath:',
      'members:',
      'minimum witnessArtifactPaths:',
      'replayStepIds:',
      'theorem closure reading:'
    ],
    requiredProofFamilyMatrixHeaders: [],
    requiredGeneratedArtifactCatalogSections: [
      'V23 artifact family additions',
      'V23 proof-family additions',
      'V23 BTC artifact projection matrix'
    ],
    requiredGeneratedAppendixContractPhrases: [
      '.bitcode/v23-spec-family-report.json',
      '.bitcode/v23-canonical-input-report.json',
      '.bitcode/v23-canon-posture-drift-report.json',
      'ENGI_SPEC_V23_PROVEN.md',
      'compute-reality-manifest',
      'storage-reality-manifest',
      'bitcoin-commitment-manifest',
      'bitcoin-settlement-intent',
      'bitcoin-settlement-observation'
    ],
    requiredGeneratedArtifactPaths: [
      '.bitcode/v23-spec-family-report.json',
      '.bitcode/v23-canonical-input-report.json',
      '.bitcode/v23-canon-posture-drift-report.json'
    ],
    requiredSubsystemCoveragePhrases: [
      'authenticated repo supply',
      'measured read',
      'deposit-to-read fit',
      'recall, ranking, verification, and use-tiering',
      'exact source-to-shares settlement',
      'bounded-public and private commitment scopes',
      'audited payment intent',
      'audited payment observation',
      'sidechain connection point'
    ],
    requiredSubsystemSectionHeadings: [],
    requiredSubsystemDetailLabels: [],
    crossProductAppendixHeading: 'V23 system architecture and layer boundaries',
    requiredCrossProductAppendixPhrases: [],
    failClosedAppendixHeading: 'V23 inheritance rule',
    requiredFailClosedAppendixPhrases: [
      'public anchors must not leak non-disclosable artifacts',
      'payment receipts must not finalize share- or journal-level consequences without explicit observation closure',
      'future promotion must fail closed if draft Bitcoin claims outrun implementation'
    ],
    assetPackAppendixHeading: 'V23 artifact family additions',
    requiredAssetPackAppendixPhrases: [
      '.bitcode/compute-reality-manifest.json',
      '.bitcode/storage-reality-manifest.json',
      '.bitcode/bitcoin-commitment-manifest.json',
      '.bitcode/bitcoin-treasury-policy.json',
      '.bitcode/bitcoin-anchor.json',
      '.bitcode/bitcoin-bounded-public-anchor.json',
      '.bitcode/bitcoin-settlement-intent.json',
      '.bitcode/bitcoin-settlement-observation.json',
      '.bitcode/bitcoin-audit-anchor-proof.json',
      '.bitcode/bitcoin-settlement-interface-proof.json'
    ],
    requiredDeltaSections: [
      'Status',
      'Why V23 exists',
      'Findings that drive V23',
      'Accepted V23 decisions',
      'Explicitly deferred',
      'Draft implementation sequence',
      'Commit-body direction'
    ],
    requiredParitySections: [
      'Status',
      'Purpose',
      'Audit basis',
      'V23 implementation matrix',
      'V23 implementation checklist',
      'Accepted boundaries',
      'Completion condition'
    ],
    forbiddenPhrases: []
  };
}

function buildV24Profile() {
  const base = buildV21LikeProfile('V24');
  return {
    ...base,
    reportId: 'v24-spec-family-report',
    defaultTarget: 'V24',
    requiredSpecSections: [
      'Status',
      'Drafting and acceptance state',
      'Version executive summary',
      'Canonical Bitcode executive summary',
      'V24 rewrite and no-silent-inheritance rule',
      'Why V24 exists',
      'V24 accepted drafting decisions',
      'V24 source-of-truth hierarchy',
      'V24 system goals, non-goals, and design principles',
      'V24 external environment-mode rule',
      'V24 system architecture and layer boundaries',
      'V24 real network execution rule',
      'V24 compute and storage container rule',
      'V24 GitHub live interfacing rule',
      'V24 telemetry and coverage rule',
      'V24 metaspec and conformance repair rule',
      'V24 artifact family additions',
      'V24 proof-family additions',
      'V24 principal-scoped execution and disclosure policy',
      'V24 acceptance criteria',
      'Accepted boundaries',
      'V24 completion condition',
      ...COMMON_REQUIRED_SPEC_SECTIONS
    ],
    requiredProofFamilySections: [
      ...COMMON_REQUIRED_PROOF_FAMILY_SECTIONS,
      'Bitcoin-audit-anchor',
      'Bitcoin-settlement-interface',
      'External-realization-execution',
      'Containerized-reality',
      'GitHub-live-interface'
    ],
    requiredGeneratedArtifactCatalogSections: [
      ...base.requiredGeneratedArtifactCatalogSections,
      'V24 artifact family additions',
      'V24 proof-family additions',
      'V24 acceptance criteria'
    ],
    requiredGeneratedAppendixContractPhrases: [
      ...COMMON_REQUIRED_GENERATED_APPENDIX_CONTRACT_PHRASES,
      '.bitcode/v24-spec-family-report.json',
      '.bitcode/v24-canonical-input-report.json',
      '.bitcode/v24-canon-posture-drift-report.json',
      'ENGI_SPEC_V24_PROVEN.md',
      'external-environment-profile',
      'external-telemetry-summary',
      'external-execution-ledger',
      'external-reconciliation-log',
      'bitcoin-network-execution',
      'repeated-read-payment-execution',
      'compute-container-execution',
      'storage-publication-receipt',
      'github-live-session'
    ],
    requiredGeneratedArtifactPaths: [
      '.bitcode/v24-spec-family-report.json',
      '.bitcode/v24-canonical-input-report.json',
      '.bitcode/v24-canon-posture-drift-report.json'
    ],
    requiredSubsystemCoveragePhrases: [
      ...COMMON_REQUIRED_SUBSYSTEM_COVERAGE_PHRASES,
      'bitcoin mainchain execution',
      'sidechain execution',
      'compute-container execution',
      'storage-container execution',
      'github live interface',
      'environment-mode completeness and isolation',
      'telemetry and coverage',
      'full-canon specification completeness'
    ],
    requiredFailClosedAppendixPhrases: [
      ...COMMON_REQUIRED_FAIL_CLOSED_APPENDIX_PHRASES,
      'cross-mode isolation drift',
      'missing execution receipt',
      'container attestation drift',
      'github observation drift',
      'spec checker profile omits full-canon carrier requirements'
    ],
    requiredAssetPackAppendixPhrases: [
      ...base.requiredAssetPackAppendixPhrases,
      '.bitcode/external-environment-profile.json',
      '.bitcode/external-execution-policy.json',
      '.bitcode/external-telemetry-policy.json',
      '.bitcode/external-telemetry-summary.json',
      '.bitcode/external-execution-ledger.json',
      '.bitcode/external-reconciliation-log.json',
      '.bitcode/bitcoin-network-intent.json',
      '.bitcode/bitcoin-network-execution.json',
      '.bitcode/bitcoin-network-observation.json',
      '.bitcode/repeated-read-payment-intent.json',
      '.bitcode/repeated-read-payment-execution.json',
      '.bitcode/repeated-read-payment-observation.json',
      '.bitcode/sidechain-execution-receipt.json',
      '.bitcode/compute-container-manifest.json',
      '.bitcode/compute-container-execution.json',
      '.bitcode/storage-container-manifest.json',
      '.bitcode/storage-publication-receipt.json',
      '.bitcode/storage-retrieval-receipt.json',
      '.bitcode/github-app-binding.json',
      '.bitcode/github-live-session.json',
      '.bitcode/github-inventory-fetch-receipt.json',
      '.bitcode/github-artifact-fetch-receipt.json',
      '.bitcode/github-branch-publication-receipt.json',
      '.bitcode/github-pr-update-receipt.json',
      '.bitcode/external-realization-proof.json',
      '.bitcode/container-reality-proof.json',
      '.bitcode/github-live-interface-proof.json',
      '.bitcode/v24-canon-posture-drift-report.json',
      'ENGI_SPEC_V24_PROVEN.md'
    ],
    requiredDeltaSections: [
      'Status',
      'Why V24 exists',
      'Findings that drive V24',
      'Accepted V24 drafting decisions',
      'Explicitly deferred',
      'Draft implementation sequence',
      'Commit-body direction'
    ],
    requiredParitySections: [
      'Status',
      'Purpose',
      'Audit basis',
      'V24 draft implementation matrix',
      'V24 draft implementation checklist',
      'Accepted boundaries',
      'Completion condition'
    ],
    forbiddenPhrases: []
  };
}

function buildV25Profile() {
  return {
    reportId: 'v25-spec-family-report',
    defaultTarget: 'V25',
    requiredStatusLabels: COMMON_REQUIRED_STATUS_LABELS,
    requiredPromotedStatusLabels: ['Canonical proof-source commit'],
    requiredSpecSections: [
      'Status',
      'Drafting and acceptance state',
      'Version executive summary',
      'Canonical Bitcode executive summary',
      'Rename and invariance rule',
      'Why V25 exists',
      'V25 rename surface catalog',
      'V25 accepted drafting decisions',
      'Recommended narrowing defaults for V25',
      'V25 source-of-truth hierarchy',
      'Review acceptance criteria',
      'Promotion acceptance criteria',
      'Explicitly deferred',
      'Commit-body direction'
    ],
    requiredSpecAppendixSections: [],
    requiredProofFamilySections: [],
    requiredProofFamilyDetailLabels: [],
    requiredProofFamilyMatrixHeaders: [],
    requiredGeneratedArtifactCatalogSections: [],
    requiredGeneratedAppendixContractPhrases: [
      '.bitcode/v25-spec-family-report.json',
      '.bitcode/v25-canonical-input-report.json',
      '.bitcode/v25-canon-posture-drift-report.json',
      '_legacy/ENGI_SPEC_V25_PROVEN.md',
      'Bitcode',
      'BTD'
    ],
    requiredGeneratedArtifactPaths: [
      '.bitcode/v25-spec-family-report.json',
      '.bitcode/v25-canonical-input-report.json',
      '.bitcode/v25-canon-posture-drift-report.json'
    ],
    requiredSubsystemCoveragePhrases: [
      'Bitcode',
      'BTD',
      '.bitcode/*',
      'ENGI_SPEC_V25*',
      'runtime',
      'API',
      'UI',
      'generated evidence',
      'build/process'
    ],
    requiredSubsystemSectionHeadings: [],
    requiredSubsystemDetailLabels: [],
    crossProductAppendixHeading: 'Review acceptance criteria',
    requiredCrossProductAppendixPhrases: [],
    failClosedAppendixHeading: 'Rename and invariance rule',
    requiredFailClosedAppendixPhrases: [
      'full rename',
      'semantic invariance',
      'must not silently change',
      'no longer presents itself with pre-Bitcode product naming',
      'no longer presents itself as NGI'
    ],
    assetPackAppendixHeading: 'V25 rename surface catalog',
    requiredAssetPackAppendixPhrases: [
      '.bitcode/*',
      'generated proof/report titles',
      'runtime posture strings',
      'API summary labels',
      'demo shell headings and guidance',
      'spec-quality hook output',
      'promotion script messaging'
    ],
    requiredDeltaSections: [
      'Status',
      'Why V25 exists',
      'Findings that drive V25',
      'Accepted V25 drafting decisions',
      'Recommended default closure for V25',
      'Planned delta surface',
      'Explicitly deferred',
      'Draft implementation sequence'
    ],
    requiredParitySections: [
      'Status',
      'Purpose',
      'V25 draft implementation matrix',
      'V25 draft implementation checklist',
      'Accepted boundaries',
      'Completion condition'
    ],
    forbiddenPhrases: []
  };
}

function buildV20ProperProfile() {
  return {
    reportId: 'v20-proper-spec-family-report',
    defaultTarget: 'V20',
    requiredStatusLabels: COMMON_REQUIRED_STATUS_LABELS,
    requiredPromotedStatusLabels: [],
    requiredSpecSections: COMMON_REQUIRED_SPEC_SECTIONS,
    requiredSpecAppendixSections: COMMON_REQUIRED_SPEC_APPENDIX_SECTIONS,
    requiredProofFamilySections: COMMON_REQUIRED_PROOF_FAMILY_SECTIONS,
    requiredProofFamilyDetailLabels: COMMON_REQUIRED_PROOF_FAMILY_DETAIL_LABELS,
    requiredProofFamilyMatrixHeaders: COMMON_REQUIRED_PROOF_FAMILY_MATRIX_HEADERS,
    requiredGeneratedArtifactCatalogSections: [
      'Inherited V19 reproducible-canon artifacts',
      'V20 operator-quality artifacts',
      'Exact generated-artifact inventory matrix',
      'Shared generated-artifact fields',
      'Artifact-specific generated payload fields',
      'Artifact confidentiality and disclosability taxonomy',
      'V20 generated appendix posture',
      'Minimum generated appendix rendered contents',
      'Canonical regeneration and fail-closed posture'
    ],
    requiredGeneratedAppendixContractPhrases: COMMON_REQUIRED_GENERATED_APPENDIX_CONTRACT_PHRASES,
    requiredGeneratedArtifactPaths: [
      '.bitcode/v19-contract-change-ledger.json',
      '.bitcode/v19-negative-proof-mutation-matrix.json',
      '.bitcode/v19-proof-member-semantic-matrix.json',
      '.bitcode/v19-theorem-evidence-matrix.json',
      '.bitcode/v19-state-machine-matrix.json',
      '.bitcode/v19-deterministic-replay-report.json',
      '.bitcode/v19-volatility-inventory.json',
      '.bitcode/v20-operator-acceptance-transcript.json',
      '.bitcode/v20-visual-regression-report.json',
      '.bitcode/v20-accessibility-report.json',
      '.bitcode/v20-performance-budget-report.json',
      '.bitcode/v20-projection-quality-smoke-matrix.json',
      '.bitcode/v20-quality-summary.json',
      'ENGI_SPEC_V20_PROVEN.md'
    ],
    requiredSubsystemCoveragePhrases: COMMON_REQUIRED_SUBSYSTEM_COVERAGE_PHRASES,
    requiredSubsystemSectionHeadings: COMMON_REQUIRED_SUBSYSTEM_SECTION_HEADINGS,
    requiredSubsystemDetailLabels: COMMON_REQUIRED_SUBSYSTEM_DETAIL_LABELS,
    crossProductAppendixHeading: 'Appendix I. Scenario, workflow, and cross-product contract catalog',
    requiredCrossProductAppendixPhrases: [
      'auth-issuer-rollback',
      'privacy-boundary-proof-export',
      'polyglot-gateway-benchmark-remediation',
      'auth-many-asset-normalization',
      'targeted-branch-run',
      'normalization-branch-run',
      'patch',
      'context',
      'public',
      'buyer',
      'reviewer',
      'internal',
      'seeded-shell-posture',
      'generated-appendix-report-discovery'
    ],
    failClosedAppendixHeading: 'Appendix J. Fail-closed contract and error posture matrix',
    requiredFailClosedAppendixPhrases: [
      'invalid deposit',
      'prompt contract incompleteness',
      'parsed-envelope inadmissibility',
      'no-survivor asset pack',
      'authorization denial',
      'public projection overexposure',
      'settlement conservation drift'
    ],
    assetPackAppendixHeading: 'Appendix K. Source-bearing AssetPack and artifact contract catalog',
    requiredAssetPackAppendixPhrases: [
      '.bitcode/asset-pack.lock.json',
      '.bitcode/selected-source-material.json',
      '.bitcode/verification-report.json',
      '.bitcode/source-to-shares.json',
      '.bitcode/projection-policy.json',
      '.bitcode/system-proof-bundle.json',
      'ENGI_SPEC_V20_PROVEN.md'
    ],
    requiredDeltaSections: [
      'Status',
      'Why V20_PROPER exists',
      'Accepted V20_PROPER decisions',
      'Explicitly excluded future truth',
      'Reconstruction sequence',
      'Validation direction'
    ],
    requiredParitySections: [
      'Status',
      'Purpose',
      'Audit basis',
      'implementation matrix',
      'accepted boundaries',
      'completion condition'
    ],
    forbiddenPhrases: [
      '.bitcode/v21-spec-family-report.json',
      '.bitcode/v21-canonical-input-report.json',
      'ENGI_SPEC_V21_PROVEN.md'
    ]
  };
}

/**
 * @param {string} version
 */
function resolveSpecFamilyProfile(version) {
  if (version === 'V20_PROPER') {
    return buildV20ProperProfile();
  }
  if (version === 'V22') {
    return buildV22Profile();
  }
  if (version === 'V23') {
    return buildV23Profile();
  }
  if (version === 'V24') {
    return buildV24Profile();
  }
  if (version === 'V25') {
    return buildV25Profile();
  }
  if (!/^V\d+$/.test(version)) {
    throw new Error(`Version must look like VN or match a supported reconstruction family. Received ${version || 'none'}.`);
  }
  const numeric = Number(version.slice(1));
  if (!Number.isInteger(numeric) || numeric < 21) {
    throw new Error(`Spec-family checks are implemented for V21+ and V20_PROPER. Received ${version}.`);
  }
  return buildV21LikeProfile(version);
}

/**
 * @param {string} content
 * @param {string} label
 */
function extractStatusValue(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^- ${escaped}: (.+)$`, 'm'));
  const value = match?.[1];
  return typeof value === 'string' ? value.trim() : null;
}

/**
 * @param {string} content
 * @param {string} version
 */
function extractVersionState(content, version) {
  return extractStatusValue(content, `${version} state`);
}

/**
 * @param {string} value
 */
function normalize(value) {
  return value.toLowerCase().replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} content
 * @param {string} phrase
 */
function hasSection(content, phrase) {
  const normalizedPhrase = normalize(phrase);
  return content
    .split('\n')
    .filter((line) => /^#{2,6}\s+/.test(line))
    .some((line) => normalize(line).includes(normalizedPhrase));
}

/**
 * @param {string} content
 * @param {string} phrase
 */
function containsPhrase(content, phrase) {
  return normalize(content).includes(normalize(phrase));
}

/**
 * @param {string} content
 * @param {string} phrase
 */
function extractSection(content, phrase) {
  const normalizedPhrase = normalize(phrase);
  const lines = content.split('\n');
  let start = -1;
  let level = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (typeof line !== 'string') continue;
    const match = line.match(/^(#{2,6})\s+(.+)$/);
    if (!match) continue;
    const heading = match[2];
    const markers = match[1];
    if (typeof heading !== 'string' || typeof markers !== 'string') continue;
    if (normalize(heading).includes(normalizedPhrase)) {
      start = index + 1;
      level = markers.length;
      break;
    }
  }
  if (start < 0) return '';
  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index];
    if (typeof line !== 'string') continue;
    const match = line.match(/^(#{2,6})\s+(.+)$/);
    if (!match) continue;
    const markers = match[1];
    if (typeof markers !== 'string') continue;
    if (markers.length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

/**
 * @param {string} section
 */
function parseMarkdownTable(section) {
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  if (lines.length < 3) return [];
  const headerLine = lines[0];
  if (typeof headerLine !== 'string') return [];
  const headers = headerLine
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
  return lines.slice(2).map((line) => {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
  });
}

/**
 * @param {string} section
 */
function parseMarkdownTableHeaders(section) {
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  if (lines.length < 2) return [];
  const headerLine = lines[0];
  if (typeof headerLine !== 'string') return [];
  return headerLine
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

/**
 * @param {string} filePath
 */
function fileExists(filePath) {
  try {
    accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string[]} failures
 * @param {boolean} condition
 * @param {string} message
 */
function recordFailure(failures, condition, message) {
  if (!condition) failures.push(message);
}

/**
 * @param {string} text
 * @param {string[]} terms
 * @param {number} maxSpan
 * @returns {boolean}
 */
function includesOrderedTermsWithin(text, terms, maxSpan) {
  const normalizedText = String(text).toLowerCase();
  let firstIndex = -1;
  let searchStart = 0;

  for (const term of terms) {
    const normalizedTerm = String(term).toLowerCase();
    const termIndex = normalizedText.indexOf(normalizedTerm, searchStart);
    if (termIndex < 0) return false;
    if (firstIndex < 0) firstIndex = termIndex;
    searchStart = termIndex + normalizedTerm.length;
  }

  return firstIndex >= 0 && searchStart - firstIndex <= maxSpan;
}

/**
 * @param {string} section
 * @param {string} version
 * @returns {boolean}
 */
function containsStalePointerWhileVersionDraft(section, version) {
  const text = String(section);
  const normalizedText = text.toLowerCase();
  const pointerIndex = normalizedText.indexOf('bitcode_spec.txt');
  if (pointerIndex < 0) return false;

  const pointsToIndex = normalizedText.indexOf('points to', pointerIndex);
  if (pointsToIndex < 0) return false;

  const pointedVersionMatch = /\bV\d+\b/iu.exec(text.slice(pointsToIndex));
  if (!pointedVersionMatch) return false;

  const pointedVersionIndex = pointsToIndex + pointedVersionMatch.index;
  const whileIndex = normalizedText.indexOf('while', pointedVersionIndex + pointedVersionMatch[0].length);
  if (whileIndex < 0) return false;

  const versionIndex = normalizedText.indexOf(String(version).toLowerCase(), whileIndex);
  if (versionIndex < 0) return false;

  const draftIndex = normalizedText.indexOf('draft', versionIndex + String(version).length);
  return draftIndex >= 0 && draftIndex - pointerIndex <= 500;
}

/**
 * @param {string[]} failures
 * @param {string} section
 * @param {string} version
 */
function validatePromotedSourceOfTruthHierarchy(failures, section, version) {
  if (versionNumber(version) < 44) return;

  recordFailure(
    failures,
    section.length > 0,
    `spec promoted-mode validation requires a ${version} source-of-truth hierarchy section.`
  );

  recordFailure(
    failures,
    section.includes('BITCODE_SPEC.txt') && section.includes(`points to \`${version}\``),
    `spec promoted source-of-truth hierarchy must state BITCODE_SPEC.txt points to ${version}.`
  );

  recordFailure(
    failures,
    /\bactive\b[\s\S]{0,80}\bcanon\b/i.test(section),
    `spec promoted source-of-truth hierarchy must state ${version} is active canon.`
  );

  const staleDraftPostureFound =
    containsStalePointerWhileVersionDraft(section, version) ||
    includesOrderedTermsWithin(section, [version, 'is', 'draft'], 180) ||
    includesOrderedTermsWithin(section, [version, 'remains', 'draft'], 180) ||
    includesOrderedTermsWithin(section, [version, 'draft target only'], 240) ||
    includesOrderedTermsWithin(section, ['define', 'the draft target only', version], 240);

  recordFailure(
    failures,
    !staleDraftPostureFound,
    `spec promoted source-of-truth hierarchy still contains stale draft posture for ${version}.`
  );
}

/**
 * @param {string[]} failures
 * @param {Record<string, string>} contents
 * @param {string} version
 */
function validatePromotedSpecFamilyHasNoStaleDraftPosture(failures, contents, version) {
  if (versionNumber(version) < 44) return;

  const previous = previousVersion(version);
  const forbiddenPhrases = [
    `${version} does not replace ${previous}`,
    `${previous} remains active canon`,
    `${previous} active / ${version} draft`,
    `${previous} active / draft ${version}`,
    `BITCODE_SPEC.txt remains \`${previous}\``,
    `Canonical pointer: \`BITCODE_SPEC.txt\` -> \`${previous}\``,
    `Active canonical anchor: \`BITCODE_SPEC_${previous}.md\``,
    `${version} draft work`,
    `${version} formal draft`,
    `${version} remains draft`,
    `until ${version} promotion`,
    `before ${version} can be promoted`,
    `does not promote ${version}`,
    `draft \`BITCODE_SPEC_${version}_PROVEN.md\``
  ].filter(Boolean);

  for (const [label, content] of Object.entries(contents)) {
    for (const phrase of forbiddenPhrases) {
      recordFailure(
        failures,
        !content.includes(phrase),
        `${label} promoted spec-family content still contains stale draft posture phrase "${phrase}".`
      );
    }
  }
}

/**
 * @param {{
 *   repoRoot?: string,
 *   version?: string,
 *   mode?: 'draft' | 'promoted',
 *   currentTarget?: string,
 *   skipPointerCheck?: boolean
 * }} [input={}]
 */
export function buildV21SpecFamilyReport({
  repoRoot = DEFAULT_V21_SPECIFYING_REPO_ROOT,
  version = 'V21',
  mode = 'draft',
  currentTarget,
  skipPointerCheck = false
} = {}) {
  const profile = resolveSpecFamilyProfile(version);
  const resolvedRepoRoot = path.resolve(repoRoot);
  const pointerFile = resolveSpecPointerFilename(resolvedRepoRoot, version);
  const pointerPath = path.join(resolvedRepoRoot, pointerFile);
  const pointerVersion = readFileSync(pointerPath, 'utf8').trim();
  const expectedTarget = currentTarget || (mode === 'promoted' ? profile.defaultTarget : pointerVersion);

  /** @type {string[]} */
  const failures = [];

  const requiredFiles = {
    spec: specAbsolutePath(resolvedRepoRoot, version),
    delta: specAbsolutePath(resolvedRepoRoot, version, '_DELTA'),
    ...(usesRequiredNotesCompanion(version) ? { notes: specAbsolutePath(resolvedRepoRoot, version, '_NOTES') } : {}),
    parity: specAbsolutePath(resolvedRepoRoot, version, '_PARITY_MATRIX')
  };
  const supportFiles = {
    specifying: path.join(resolvedRepoRoot, specFamilyDirectory(version), `${specSupportPrefix(version)}IFYING.md`),
    templateguide: path.join(resolvedRepoRoot, specFamilyDirectory(version), `${specSupportPrefix(version)}_TEMPLATEGUIDE.md`)
  };

  for (const [label, filePath] of Object.entries(requiredFiles)) {
    if (!fileExists(filePath)) failures.push(`Missing required ${label} file: ${path.relative(resolvedRepoRoot, filePath)}`);
  }
  for (const [label, filePath] of Object.entries(supportFiles)) {
    if (!fileExists(filePath)) failures.push(`Missing required support file for full-canon spec families: ${label} at ${path.relative(resolvedRepoRoot, filePath)}`);
  }

  if (!skipPointerCheck && pointerVersion !== expectedTarget) {
    failures.push(`${pointerFile} points to ${pointerVersion || 'none'} but expected ${expectedTarget}.`);
  }

  /** @type {Record<string, string>} */
  const contents = {};
  for (const [label, filePath] of Object.entries(requiredFiles)) {
    if (fileExists(filePath)) contents[label] = readFileSync(filePath, 'utf8');
  }

  if (fileExists(supportFiles.specifying)) {
    const specifyingContent = readFileSync(supportFiles.specifying, 'utf8');
    recordFailure(
      failures,
      normalize(specifyingContent).includes('one complete specifying standard'),
      `${path.basename(supportFiles.specifying)} does not state its singular specifying authority clearly enough.`
    );
  }

  if (fileExists(supportFiles.templateguide)) {
    const templateguideContent = readFileSync(supportFiles.templateguide, 'utf8');
    recordFailure(
      failures,
      templateguideContent.includes(path.basename(supportFiles.specifying)),
      `${path.basename(supportFiles.templateguide)} does not point to ${path.basename(supportFiles.specifying)}.`
    );
  }

  for (const [label, content] of Object.entries(contents)) {
    const declaredTarget = extractStatusValue(content, 'Current canonical/latest target');
    recordFailure(
      failures,
      declaredTarget === `\`${expectedTarget}\`` || declaredTarget === expectedTarget,
      `${label} status block must declare Current canonical/latest target as ${expectedTarget}.`
    );
    for (const statusLabel of profile.requiredStatusLabels) {
      recordFailure(
        failures,
        typeof extractStatusValue(content, statusLabel) === 'string',
        `${label} status block is missing a ${statusLabel} line.`
      );
    }
    if (mode === 'promoted') {
      for (const statusLabel of profile.requiredPromotedStatusLabels) {
        recordFailure(
          failures,
          typeof extractStatusValue(content, statusLabel) === 'string',
          `${label} status block is missing a ${statusLabel} line.`
        );
      }
    }
    const stateValue = extractVersionState(content, version);
    recordFailure(
      failures,
      typeof stateValue === 'string' && stateValue.length > 0,
      `${label} status block is missing a ${version} state line.`
    );
    if (mode === 'promoted' && stateValue) {
      const staleTokenPattern = /\bdraft\b|\bpending\b|pre-implementation|in progress|being drafted|not yet|remains unfinished/i;
      recordFailure(
        failures,
        !staleTokenPattern.test(stateValue),
        `${label} ${version} state line still contains draft/pending language: ${stateValue}`
      );
    }
  }

  const specContent = contents['spec'] || '';
  if (mode === 'promoted') {
    validatePromotedSourceOfTruthHierarchy(
      failures,
      extractSection(specContent, 'source-of-truth hierarchy'),
      version
    );
    validatePromotedSpecFamilyHasNoStaleDraftPosture(failures, contents, version);
  }

  for (const phrase of profile.requiredSpecSections) {
    recordFailure(failures, hasSection(specContent, phrase), `spec is missing required section containing "${phrase}".`);
  }
  for (const phrase of profile.requiredSpecAppendixSections) {
    recordFailure(failures, hasSection(specContent, phrase), `spec is missing required appendix-grade section containing "${phrase}".`);
  }
  for (const phrase of profile.requiredProofFamilySections) {
    recordFailure(failures, hasSection(specContent, phrase), `spec proof-family catalog is missing "${phrase}".`);
  }
  const proofFamilyInventorySection = extractSection(specContent, 'Exact proof-family inventory matrix');
  const proofFamilyInventoryHeaders = parseMarkdownTableHeaders(proofFamilyInventorySection);
  for (const header of profile.requiredProofFamilyMatrixHeaders || []) {
    recordFailure(
      failures,
      proofFamilyInventoryHeaders.includes(header),
      `spec proof-family inventory matrix is missing required header "${header}".`
    );
  }
  for (const familyHeading of profile.requiredProofFamilySections) {
    const familySection = extractSection(specContent, familyHeading);
    for (const detailLabel of profile.requiredProofFamilyDetailLabels || []) {
      recordFailure(
        failures,
        containsPhrase(familySection, detailLabel),
        `spec proof-family section "${familyHeading}" is missing "${detailLabel}".`
      );
    }
  }
  for (const phrase of profile.requiredGeneratedArtifactCatalogSections) {
    recordFailure(failures, hasSection(specContent, phrase), `spec generated-artifact catalog is missing "${phrase}".`);
  }
  for (const phrase of profile.requiredGeneratedAppendixContractPhrases || []) {
    recordFailure(
      failures,
      containsPhrase(specContent, phrase),
      `spec generated-appendix contract is missing "${phrase}".`
    );
  }
  for (const phrase of profile.requiredGeneratedArtifactPaths) {
    recordFailure(failures, containsPhrase(specContent, phrase), `spec generated-artifact catalog is missing "${phrase}".`);
  }
  for (const phrase of profile.requiredSubsystemCoveragePhrases) {
    recordFailure(failures, containsPhrase(specContent, phrase), `spec subsystem totality coverage is missing "${phrase}".`);
  }
  for (const heading of profile.requiredSubsystemSectionHeadings) {
    const section = extractSection(specContent, heading);
    recordFailure(failures, section.length > 0, `spec canonical subsystem surfaces is missing subsystem section "${heading}".`);
    for (const label of profile.requiredSubsystemDetailLabels) {
      recordFailure(
        failures,
        containsPhrase(section, label),
        `spec subsystem section "${heading}" is missing "${label}".`
      );
    }
  }
  const crossProductAppendix = extractSection(specContent, profile.crossProductAppendixHeading);
  for (const phrase of profile.requiredCrossProductAppendixPhrases) {
    recordFailure(
      failures,
      containsPhrase(crossProductAppendix, phrase),
      `spec scenario/workflow cross-product appendix is missing "${phrase}".`
    );
  }
  const failClosedAppendix = extractSection(specContent, profile.failClosedAppendixHeading);
  for (const phrase of profile.requiredFailClosedAppendixPhrases) {
    recordFailure(
      failures,
      containsPhrase(failClosedAppendix, phrase),
      `spec fail-closed appendix is missing "${phrase}".`
    );
  }
  const assetPackAppendix = extractSection(specContent, profile.assetPackAppendixHeading);
  for (const phrase of profile.requiredAssetPackAppendixPhrases) {
    recordFailure(
      failures,
      containsPhrase(assetPackAppendix, phrase),
      `spec AssetPack/artifact appendix is missing "${phrase}".`
    );
  }
  for (const phrase of profile.forbiddenPhrases) {
    for (const [label, content] of Object.entries(contents)) {
      recordFailure(
        failures,
        !containsPhrase(content, phrase),
        `${label} must not import future/non-canonical phrase "${phrase}".`
      );
    }
  }

  const deltaContent = contents['delta'] || '';
  for (const phrase of profile.requiredDeltaSections) {
    recordFailure(failures, hasSection(deltaContent, phrase), `delta is missing required section containing "${phrase}".`);
  }

  const notesContent = contents['notes'] || '';
  const requiredNotesSections = 'requiredNotesSections' in profile
    ? profile.requiredNotesSections
    : [];
  for (const phrase of requiredNotesSections) {
    recordFailure(failures, hasSection(notesContent, phrase), `notes is missing required section containing "${phrase}".`);
  }

  const parityContent = contents['parity'] || '';
  for (const phrase of profile.requiredParitySections) {
    recordFailure(failures, hasSection(parityContent, phrase), `parity is missing required section containing "${phrase}".`);
  }
  const implementationMatrixRows = parseMarkdownTable(extractSection(parityContent, `${version} implementation matrix`));
  const implementationChecklistRows = parseMarkdownTable(extractSection(parityContent, `${version} implementation checklist`));
  for (const row of [...implementationMatrixRows, ...implementationChecklistRows]) {
    const rowLabel = row['Area'] || row['area'] || row['Required V21 result'] || row['required v21 result'] || 'unknown row';
    const judgment = row['Judgment'] || row['judgment'] || row['Current judgment'] || row['current judgment'] || '';
    recordFailure(
      failures,
      COMMON_ALLOWED_PARITY_JUDGMENTS.has(judgment),
      `parity row "${rowLabel}" uses unsupported judgment vocabulary: ${judgment || 'none'}`
    );
  }
  if (mode === 'promoted') {
    recordFailure(
      failures,
      implementationMatrixRows.length > 0,
      'parity promoted-mode validation requires a populated implementation matrix table.'
    );
    recordFailure(
      failures,
      implementationChecklistRows.length > 0,
      'parity promoted-mode validation requires a populated implementation checklist table.'
    );
    const forbiddenPromotedJudgment = /\bdrafted\b|\bpromotion pending\b|substantially advanced|source gap|generated artifact pending|blocked|reopened/i;
    for (const row of [...implementationMatrixRows, ...implementationChecklistRows]) {
      const rowLabel = row['Area'] || row['area'] || row['Required V21 result'] || row['required v21 result'] || 'unknown row';
      const judgment = row['Judgment'] || row['judgment'] || row['Current judgment'] || row['current judgment'] || '';
      recordFailure(
        failures,
        !forbiddenPromotedJudgment.test(judgment),
        `parity row "${rowLabel}" still carries non-closed promoted judgment: ${judgment || 'none'}`
      );
    }
  }

  return {
    reportId: profile.reportId,
    checkedVersion: version,
    mode,
    currentTarget: expectedTarget,
    pointerVersion,
    repoRoot: resolvedRepoRoot,
    passed: failures.length === 0,
    failureCount: failures.length,
    failures,
    requiredFiles: Object.values(requiredFiles).map((filePath) => path.relative(resolvedRepoRoot, filePath)),
    supportFiles: Object.values(supportFiles).map((filePath) => path.relative(resolvedRepoRoot, filePath)),
    requiredStatusLabelCount: profile.requiredStatusLabels.length,
    requiredPromotedStatusLabelCount: profile.requiredPromotedStatusLabels.length,
    requiredSpecSectionCount: profile.requiredSpecSections.length,
    requiredAppendixSectionCount: profile.requiredSpecAppendixSections.length,
    requiredProofFamilyCount: profile.requiredProofFamilySections.length,
    requiredProofFamilyDetailLabelCount: (profile.requiredProofFamilyDetailLabels || []).length,
    requiredProofFamilyMatrixHeaderCount: (profile.requiredProofFamilyMatrixHeaders || []).length,
    requiredGeneratedArtifactCatalogSectionCount: profile.requiredGeneratedArtifactCatalogSections.length,
    requiredGeneratedAppendixContractPhraseCount: (profile.requiredGeneratedAppendixContractPhrases || []).length,
    requiredGeneratedArtifactPathCount: profile.requiredGeneratedArtifactPaths.length,
    requiredNotesSectionCount: requiredNotesSections.length,
    requiredSubsystemCoverageCount: profile.requiredSubsystemCoveragePhrases.length,
    requiredSubsystemSectionCount: profile.requiredSubsystemSectionHeadings.length,
    requiredSubsystemDetailLabelCount: profile.requiredSubsystemDetailLabels.length,
    requiredCrossProductAppendixPhraseCount: profile.requiredCrossProductAppendixPhrases.length,
    requiredFailClosedAppendixPhraseCount: profile.requiredFailClosedAppendixPhrases.length,
    requiredAssetPackAppendixPhraseCount: profile.requiredAssetPackAppendixPhrases.length
  };
}

/**
 * @param {string} repoRoot
 * @param {string} currentTarget
 */
function buildRequiredCanonicalArtifacts(repoRoot, currentTarget) {
  /** @type {string[]} */
  const artifacts = [];
  if (currentTarget === 'V19') {
    artifacts.push(
      '.bitcode/v19-contract-change-ledger.json',
      '.bitcode/v19-deterministic-replay-report.json',
      '.bitcode/v19-negative-proof-mutation-matrix.json',
      '.bitcode/v19-proof-member-semantic-matrix.json',
      '.bitcode/v19-state-machine-matrix.json',
      '.bitcode/v19-theorem-evidence-matrix.json',
      '.bitcode/v19-volatility-inventory.json'
    );
  }
  if (currentTarget === 'V20') {
    artifacts.push(
      '.bitcode/v20-operator-acceptance-transcript.json',
      '.bitcode/v20-visual-regression-report.json',
      '.bitcode/v20-accessibility-report.json',
      '.bitcode/v20-performance-budget-report.json',
      '.bitcode/v20-projection-quality-smoke-matrix.json',
      '.bitcode/v20-quality-summary.json'
    );
  }
  if (currentTarget === 'V21') {
    artifacts.push(...buildV21LikeProfile('V21').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V22') {
    artifacts.push(...buildV22Profile().requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V23') {
    artifacts.push(...buildV23Profile().requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V24') {
    artifacts.push(...buildV24Profile().requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V25') {
    artifacts.push(...buildV21LikeProfile('V25').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V26') {
    artifacts.push(...buildV21LikeProfile('V26').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V30') {
    artifacts.push(...buildV21LikeProfile('V30').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V31') {
    artifacts.push(...buildV21LikeProfile('V31').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V32') {
    artifacts.push(...buildV21LikeProfile('V32').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V33') {
    artifacts.push(...buildV21LikeProfile('V33').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V34') {
    artifacts.push(...buildV21LikeProfile('V34').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V35') {
    artifacts.push(...buildV21LikeProfile('V35').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V36') {
    artifacts.push(...buildV21LikeProfile('V36').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V37') {
    artifacts.push(...buildV21LikeProfile('V37').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V38') {
    artifacts.push(...buildV21LikeProfile('V38').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V39') {
    artifacts.push(...buildV21LikeProfile('V39').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V40') {
    artifacts.push(...buildV21LikeProfile('V40').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V41') {
    artifacts.push(...buildV21LikeProfile('V41').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V42') {
    artifacts.push(...buildV21LikeProfile('V42').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V43') {
    artifacts.push(...buildV21LikeProfile('V43').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V44') {
    artifacts.push(...buildV21LikeProfile('V44').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V45') {
    artifacts.push(...buildV21LikeProfile('V45').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V46') {
    artifacts.push(...buildV21LikeProfile('V46').requiredGeneratedArtifactPaths);
  }
  if (currentTarget === 'V47') {
    artifacts.push(...buildV21LikeProfile('V47').requiredGeneratedArtifactPaths);
  }
  return artifacts.map((relativePath) => path.join(repoRoot, relativePath));
}

/**
 * @param {{
 *   repoRoot?: string,
 *   currentTarget?: string,
 *   reportVersion?: string,
 *   assumeExistingRelativePaths?: string[],
 *   skipPointerCheck?: boolean
 * }} [input={}]
 */
export function buildV21CanonicalInputReport({
  repoRoot = DEFAULT_V21_SPECIFYING_REPO_ROOT,
  currentTarget,
  reportVersion,
  assumeExistingRelativePaths = [],
  skipPointerCheck = false
} = {}) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const pointerFile = resolveSpecPointerFilename(resolvedRepoRoot, currentTarget || 'V26');
  const pointerPath = path.join(resolvedRepoRoot, pointerFile);
  const pointerVersion = readFileSync(pointerPath, 'utf8').trim();
  const checkedTarget = currentTarget || pointerVersion;
  const resolvedReportVersion = reportVersion
    || (/^V\d+$/u.test(checkedTarget) && Number(checkedTarget.slice(1)) >= 21 ? checkedTarget : 'V21');
  const assumedExistingPaths = new Set(
    assumeExistingRelativePaths.map((relativePath) => path.resolve(resolvedRepoRoot, relativePath))
  );

  /**
   * @param {string} filePath
   */
  function existsOrAssumed(filePath) {
    return assumedExistingPaths.has(path.resolve(filePath)) || fileExists(filePath);
  }

  /** @type {string[]} */
  const failures = [];
  if (!skipPointerCheck && pointerVersion !== checkedTarget) {
    failures.push(`${pointerFile} points to ${pointerVersion || 'none'} but expected ${checkedTarget}.`);
  }

  const specPath = specAbsolutePath(resolvedRepoRoot, checkedTarget);
  const provenPath = specAbsolutePath(resolvedRepoRoot, checkedTarget, '_PROVEN');
  const notesPath = specAbsolutePath(resolvedRepoRoot, checkedTarget, '_NOTES');
  const parityCandidates = [
    specAbsolutePath(resolvedRepoRoot, checkedTarget, '_PARITY_MATRIX'),
    ...(Number(checkedTarget.slice(1)) < 21
      ? [specAbsolutePath(resolvedRepoRoot, checkedTarget, '_SYSTEM_PARITY_MATRIX')]
      : [])
  ];
  const parityPath = parityCandidates.find((candidate) => existsOrAssumed(candidate)) || null;

  for (const filePath of [
    specPath,
    ...(usesRequiredNotesCompanion(checkedTarget) ? [notesPath] : []),
    provenPath
  ]) {
    if (!existsOrAssumed(filePath)) failures.push(`Missing canonical input file: ${path.relative(resolvedRepoRoot, filePath)}`);
  }
  if (!parityPath) {
    failures.push(`Missing canonical parity input for ${checkedTarget}; expected one of ${parityCandidates.map((candidate) => path.relative(resolvedRepoRoot, candidate)).join(', ')}`);
  }

  const artifactPaths = buildRequiredCanonicalArtifacts(resolvedRepoRoot, checkedTarget);
  for (const artifactPath of artifactPaths) {
    if (!existsOrAssumed(artifactPath)) failures.push(`Missing canonical generated artifact: ${path.relative(resolvedRepoRoot, artifactPath)}`);
  }

  return {
    reportId: `${resolvedReportVersion.toLowerCase()}-canonical-input-report`,
    checkedTargetVersion: checkedTarget,
    pointerVersion,
    repoRoot: resolvedRepoRoot,
    passed: failures.length === 0,
    failureCount: failures.length,
    failures,
    specPath: path.relative(resolvedRepoRoot, specPath),
    notesPath: usesRequiredNotesCompanion(checkedTarget) ? path.relative(resolvedRepoRoot, notesPath) : null,
    provenPath: path.relative(resolvedRepoRoot, provenPath),
    parityPath: parityPath ? path.relative(resolvedRepoRoot, parityPath) : null,
    requiredGeneratedArtifactPaths: artifactPaths.map((artifactPath) => path.relative(resolvedRepoRoot, artifactPath)),
    requiredGeneratedArtifactCount: artifactPaths.length
  };
}

/**
 * @param {{
 *   version: string,
 *   proofSourceCommit: string,
 *   generatedAt: string,
 *   generatorId: string,
 *   worktreeState: string,
 *   specFamilyReport: ReturnType<typeof buildV21SpecFamilyReport>,
 *   canonicalInputReport: ReturnType<typeof buildV21CanonicalInputReport>
 * }} input
 */
export function buildV21GeneratedArtifactContents({
  version,
  proofSourceCommit,
  generatedAt,
  generatorId,
  worktreeState,
  specFamilyReport,
  canonicalInputReport
}) {
  const versionLower = version.toLowerCase();
  const baseMetadata = {
    version,
    proofSourceCommit,
    generatedAt,
    generatorId,
    worktreeState
  };

  const specFamilyArtifact = {
    reportId: specFamilyReport.reportId,
    ...baseMetadata,
    checkedVersion: specFamilyReport.checkedVersion,
    mode: specFamilyReport.mode,
    currentTarget: specFamilyReport.currentTarget,
    pointerVersion: specFamilyReport.pointerVersion,
    passed: specFamilyReport.passed,
    failureCount: specFamilyReport.failureCount,
    failures: specFamilyReport.failures,
    requiredFiles: specFamilyReport.requiredFiles,
    supportFiles: specFamilyReport.supportFiles,
    requiredStatusLabelCount: specFamilyReport.requiredStatusLabelCount,
    requiredPromotedStatusLabelCount: specFamilyReport.requiredPromotedStatusLabelCount,
    requiredSpecSectionCount: specFamilyReport.requiredSpecSectionCount,
    requiredAppendixSectionCount: specFamilyReport.requiredAppendixSectionCount,
    requiredProofFamilyCount: specFamilyReport.requiredProofFamilyCount,
    requiredGeneratedArtifactCatalogSectionCount: specFamilyReport.requiredGeneratedArtifactCatalogSectionCount,
    requiredGeneratedArtifactPathCount: specFamilyReport.requiredGeneratedArtifactPathCount,
    requiredNotesSectionCount: specFamilyReport.requiredNotesSectionCount,
    requiredSubsystemCoverageCount: specFamilyReport.requiredSubsystemCoverageCount
  };

  const canonicalInputArtifact = {
    reportId: canonicalInputReport.reportId,
    ...baseMetadata,
    checkedTargetVersion: canonicalInputReport.checkedTargetVersion,
    pointerVersion: canonicalInputReport.pointerVersion,
    passed: canonicalInputReport.passed,
    failureCount: canonicalInputReport.failureCount,
    failures: canonicalInputReport.failures,
    specPath: canonicalInputReport.specPath,
    notesPath: canonicalInputReport.notesPath,
    provenPath: canonicalInputReport.provenPath,
    parityPath: canonicalInputReport.parityPath,
    requiredGeneratedArtifactPaths: canonicalInputReport.requiredGeneratedArtifactPaths,
    requiredGeneratedArtifactCount: canonicalInputReport.requiredGeneratedArtifactCount
  };

  return {
    [`.bitcode/${versionLower}-spec-family-report.json`]: `${JSON.stringify(specFamilyArtifact, null, 2)}\n`,
    [`.bitcode/${versionLower}-canonical-input-report.json`]: `${JSON.stringify(canonicalInputArtifact, null, 2)}\n`
  };
}
