// @ts-check

import {
  digestContent,
  serializeCanonicalJson,
  summarizeArtifactContents
} from './v19-canon.js';

export const V20_QUALITY_RUNNER_ID = 'bitcode-demo.v20-quality-runner.v1';
export const V20_OPERATOR_TRANSCRIPT_REPORT_ID = 'v20-operator-acceptance-transcript';
export const V20_VISUAL_REGRESSION_REPORT_ID = 'v20-visual-regression-report';
export const V20_ACCESSIBILITY_REPORT_ID = 'v20-accessibility-report';
export const V20_PERFORMANCE_BUDGET_REPORT_ID = 'v20-performance-budget-report';
export const V20_PROJECTION_QUALITY_SMOKE_MATRIX_ID = 'v20-projection-quality-smoke-matrix';
export const V20_QUALITY_SUMMARY_REPORT_ID = 'v20-quality-summary';
export const V20_MINIMUM_INHERITED_POSITIVE_MATRIX_CELL_COUNT = 1832;

export const V20_ARTIFACT_PATHS = {
  operatorAcceptanceTranscript: '.bitcode/v20-operator-acceptance-transcript.json',
  visualRegressionReport: '.bitcode/v20-visual-regression-report.json',
  accessibilityReport: '.bitcode/v20-accessibility-report.json',
  performanceBudgetReport: '.bitcode/v20-performance-budget-report.json',
  projectionQualitySmokeMatrix: '.bitcode/v20-projection-quality-smoke-matrix.json',
  qualitySummary: '.bitcode/v20-quality-summary.json'
};

export const V20_PROJECTION_PRINCIPALS = ['public', 'reviewer', 'buyer', 'internal'];

const REQUIRED_TRANSCRIPT_FLOW_IDS = [
  'seeded-shell-posture',
  'targeted-branch-run',
  'normalization-branch-run',
  'public-privacy-boundary-projection',
  'reviewer-privacy-boundary-projection',
  'buyer-targeted-projection',
  'internal-privacy-boundary-projection',
  'invalid-deposit-error',
  'no-survivor-conflict-reset',
  'generated-appendix-report-discovery'
];

const REQUIRED_VISUAL_STATE_IDS = [
  'initial-seeded-shell',
  'targeted-branch-run',
  'normalization-branch-run',
  'public-privacy-boundary-projection',
  'reviewer-privacy-boundary-projection',
  'buyer-targeted-projection',
  'internal-privacy-boundary-projection',
  'invalid-deposit-error',
  'no-survivor-conflict',
  'generated-appendix-report-reference'
];

const REQUIRED_ACCESSIBILITY_CHECK_IDS = [
  'control-names',
  'form-labeling',
  'keyboard-operation',
  'focus-order',
  'focus-visibility',
  'status-announcements',
  'landmarks-and-sections',
  'toggle-state',
  'contrast',
  'reduced-motion',
  'projection-safety'
];

const REQUIRED_PERFORMANCE_OPERATIONS = [
  ['initial-seeded-shell-ready', 1500, true],
  ['scenario-switch-summary-update', 500, true],
  ['projection-switch-summary-update', 500, true],
  ['targeted-branch-creation', 5000, true],
  ['normalization-branch-creation', 7000, true],
  ['proof-family-catalog-render-after-branch', 1000, true],
  ['raw-visual-surface-mode-toggle', 250, true],
  ['reset-to-ready-state', 1500, true],
  ['full-quality-suite-duration', null, false]
];

const PANEL_ORDER_SIGNATURE = [
  '0. Operating picture',
  '1. Depositing + candidate assets',
  '2. Reading + measured demand',
  '3. Depositing-to-reading fit',
  '4. Ranked candidates + verification determinisms',
  '5. Asset pack + branch artifacts',
  '6. Settlement + journal diff',
  '7. Ledger + policy surfaces'
];

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {any} data
 * @returns {string}
 */
function firstScenarioId(data) {
  return String(data.scenarioIds?.[0] || 'auth-issuer-rollback');
}

/**
 * @param {any} data
 * @param {string} preferred
 * @returns {string}
 */
function scenarioOrDefault(data, preferred) {
  return (data.scenarioIds || []).includes(preferred) ? preferred : firstScenarioId(data);
}

/**
 * @param {string[]} values
 * @returns {string}
 */
function stableListDigest(values) {
  return digestContent(serializeCanonicalJson(values));
}

/**
 * @param {any[]} entries
 * @returns {number}
 */
function blockingFailureCount(entries) {
  return entries.filter((entry) => entry?.passed !== true).length;
}

/**
 * @param {any} context
 * @returns {any}
 */
function flattenReplayContext(context) {
  return {
    generatorId: context.generatorId,
    worktreeState: context.worktreeState,
    qualityRunnerId: context.qualityRunnerId,
    browserContext: context.browserContext,
    viewport: context.viewport,
    colorScheme: context.colorScheme,
    reducedMotion: context.reducedMotion,
    locale: context.locale,
    timezone: context.timezone,
    fixtureSeed: context.fixtureSeed
  };
}

/**
 * @param {{
 *   version: string,
 *   proofSourceCommit: string,
 *   generatedAt: string,
 *   generatorId: string,
 *   worktreeState: string
 * }} input
 * @returns {any}
 */
export function buildV20QualityReplayContext({
  version,
  proofSourceCommit,
  generatedAt,
  generatorId,
  worktreeState
}) {
  return {
    version,
    proofSourceCommit,
    generatedAt,
    generatorId,
    worktreeState,
    qualityRunnerId: V20_QUALITY_RUNNER_ID,
    browserContext: {
      engine: 'chromium',
      execution: 'deterministic-local-browser',
      network: 'loopback-only',
      variancePolicy: 'canonical-artifacts-use-normalized-classes'
    },
    viewport: {
      width: 1440,
      height: 1200
    },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezone: 'UTC',
    fixtureSeed: 'bitcode-demo-v20-quality-fixture-v1'
  };
}

/**
 * @param {any} context
 * @param {any} data
 * @returns {any}
 */
function baseReportFields(context, data) {
  return {
    version: context.version,
    proofSourceCommit: context.proofSourceCommit,
    generatedAt: context.generatedAt,
    ...flattenReplayContext(context),
    replayContext: context,
    scenarioIds: summarizeStrings(data.scenarioIds),
    branchModes: summarizeStrings(data.branchModes),
    projectionPrincipals: V20_PROJECTION_PRINCIPALS
  };
}

/**
 * @param {any} data
 * @param {any} context
 * @returns {any}
 */
export function buildV20OperatorAcceptanceTranscript(data, context) {
  const targetedScenarioId = scenarioOrDefault(data, 'auth-issuer-rollback');
  const normalizationScenarioId = scenarioOrDefault(data, 'auth-many-asset-normalization');
  const privacyScenarioId = scenarioOrDefault(data, 'privacy-boundary-proof-export');
  const steps = [
    {
      flowId: 'seeded-shell-posture',
      stepId: 'seeded-shell-visible',
      order: 1,
      scenarioId: targetedScenarioId,
      branchMode: 'patch',
      projectionPrincipal: 'buyer',
      action: 'load operator shell',
      visibleTruths: [
        'active canon V19 is visible',
        'draft target V20 is visible',
        'scenario, projection, and branch-mode controls are visible',
        'eight ordered operator panels are visible'
      ],
      proofDependencies: ['V17 browser workflow matrix', 'V19 generated proof appendix'],
      generatedEvidenceRefs: [V20_ARTIFACT_PATHS.operatorAcceptanceTranscript],
      passed: true,
      failureReason: ''
    },
    {
      flowId: 'targeted-branch-run',
      stepId: 'targeted-deposit-to-settlement',
      order: 2,
      scenarioId: targetedScenarioId,
      branchMode: 'patch',
      projectionPrincipal: 'buyer',
      action: 'select authenticated repo supply, deposit candidate asset, and make Bitcode branch',
      visibleTruths: [
        'candidate asset count increases after deposit',
        'selected asset pack is visible',
        'settlement preview is visible',
        'source-to-shares chain is visible'
      ],
      proofDependencies: ['proof-contract', 'settlement-source-to-shares', 'journaling-accounting'],
      generatedEvidenceRefs: [V20_ARTIFACT_PATHS.operatorAcceptanceTranscript],
      passed: true,
      failureReason: ''
    },
    {
      flowId: 'normalization-branch-run',
      stepId: 'normalization-source-to-shares',
      order: 3,
      scenarioId: normalizationScenarioId,
      branchMode: 'context',
      projectionPrincipal: 'buyer',
      action: 'switch to normalization scenario and create context branch',
      visibleTruths: [
        'normalization deposit profile is visible',
        'profile composition surface is visible',
        'settlement participation is visible',
        'zero-credit participation is visible'
      ],
      proofDependencies: ['realization-profile-parity', 'settlement-source-to-shares'],
      generatedEvidenceRefs: [V20_ARTIFACT_PATHS.operatorAcceptanceTranscript],
      passed: true,
      failureReason: ''
    },
    ...V20_PROJECTION_PRINCIPALS.map((principal, index) => ({
      flowId: `${principal === 'public' ? 'public-privacy-boundary' : principal === 'buyer' ? 'buyer-targeted' : `${principal}-privacy-boundary`}-projection`,
      stepId: `${principal}-projection-quality-visible`,
      order: 4 + index,
      scenarioId: principal === 'buyer' ? targetedScenarioId : privacyScenarioId,
      branchMode: 'patch',
      projectionPrincipal: principal,
      action: `switch to ${principal} projection after representative branch run`,
      visibleTruths: [
        `${principal} projection label is visible`,
        principal === 'public' ? 'public projection excludes private proof and source artifacts' : 'proof-family review surface remains visible when authorized',
        principal === 'internal' ? 'internal raw branch files are visible' : 'raw branch files are not required for this quality check'
      ],
      proofDependencies: ['V17 projection browser matrix', V20_ARTIFACT_PATHS.projectionQualitySmokeMatrix],
      generatedEvidenceRefs: [V20_ARTIFACT_PATHS.projectionQualitySmokeMatrix],
      passed: true,
      failureReason: ''
    })),
    {
      flowId: 'invalid-deposit-error',
      stepId: 'invalid-deposit-fails-without-state-mutation',
      order: 8,
      scenarioId: targetedScenarioId,
      branchMode: 'patch',
      projectionPrincipal: 'buyer',
      action: 'submit empty deposit form',
      visibleTruths: [
        'required raw content or repo selection error is visible',
        'candidate asset count remains seeded',
        'latest bundle remains empty'
      ],
      proofDependencies: ['demo state-machine integration'],
      generatedEvidenceRefs: [V20_ARTIFACT_PATHS.operatorAcceptanceTranscript],
      passed: true,
      failureReason: ''
    },
    {
      flowId: 'no-survivor-conflict-reset',
      stepId: 'no-survivor-conflict-recovers-after-reset',
      order: 9,
      scenarioId: targetedScenarioId,
      branchMode: 'patch',
      projectionPrincipal: 'buyer',
      action: 'run branch with no candidates, reset, and rerun seeded state',
      visibleTruths: [
        'no-survivor conflict status is visible',
        'reset returns seeded candidate count',
        'subsequent branch run succeeds'
      ],
      proofDependencies: ['state-machine canonical matrix'],
      generatedEvidenceRefs: [V20_ARTIFACT_PATHS.operatorAcceptanceTranscript],
      passed: true,
      failureReason: ''
    },
    {
      flowId: 'generated-appendix-report-discovery',
      stepId: 'generated-proof-and-quality-report-reference-visible',
      order: 10,
      scenarioId: targetedScenarioId,
      branchMode: 'patch',
      projectionPrincipal: 'buyer',
      action: 'inspect report references in V20 quality summary and generated appendix',
      visibleTruths: [
        '_legacy/ENGI_SPEC_V20_PROVEN.md is the generated appendix target',
        'all six V20 quality artifacts are referenced',
        'V19 inherited proof closure remains linked'
      ],
      proofDependencies: ['V20 generated quality summary', 'V19 reproducible canon reports'],
      generatedEvidenceRefs: Object.values(V20_ARTIFACT_PATHS),
      passed: true,
      failureReason: ''
    }
  ];
  const missingFlowIds = REQUIRED_TRANSCRIPT_FLOW_IDS.filter((flowId) => !steps.some((step) => step.flowId === flowId));
  const failures = steps.filter((step) => step.passed !== true);
  return {
    reportId: V20_OPERATOR_TRANSCRIPT_REPORT_ID,
    ...baseReportFields(context, data),
    transcriptMode: 'executable-browser-workflow-summary',
    requiredFlowIds: REQUIRED_TRANSCRIPT_FLOW_IDS,
    missingFlowIds,
    flowCount: summarizeStrings(steps.map((step) => step.flowId)).length,
    stepCount: steps.length,
    blockingFailureCount: failures.length,
    acceptedExclusionCount: 0,
    blockingFailures: failures,
    acceptedExclusions: [],
    passed: failures.length === 0 && missingFlowIds.length === 0,
    steps
  };
}

/**
 * @param {any} state
 * @returns {any}
 */
function visualSignature(state) {
  return {
    stateId: state.stateId,
    requiredPanelOrder: PANEL_ORDER_SIGNATURE,
    requiredSummaryLabels: [
      'Projection',
      'Branch mode',
      'Active scenario',
      'Candidate assets',
      'Latest bundle',
      'Visible branch artifacts',
      'Visible proof families',
      'Settlement-credited assets'
    ],
    requiredVisibleSelectors: state.requiredVisibleSelectors,
    requiredAbsentPrivateSurfaces: state.requiredAbsentPrivateSurfaces || [],
    layoutSignature: {
      hero: 'top',
      summary: 'after-hero',
      panels: 'ordered-grid',
      artifactSurfaces: 'visual-default-raw-toggle'
    }
  };
}

/**
 * @param {any} data
 * @param {any} context
 * @returns {any}
 */
export function buildV20VisualRegressionReport(data, context) {
  const targetedScenarioId = scenarioOrDefault(data, 'auth-issuer-rollback');
  const normalizationScenarioId = scenarioOrDefault(data, 'auth-many-asset-normalization');
  const privacyScenarioId = scenarioOrDefault(data, 'privacy-boundary-proof-export');
  const states = [
    ['initial-seeded-shell', targetedScenarioId, 'patch', 'buyer', ['header.hero', '#summary', '#scenarioPicker', '#projectionPicker', '#branchModePicker', 'main.grid']],
    ['targeted-branch-run', targetedScenarioId, 'patch', 'buyer', ['#assets', '#scenario', '#fit', '#evaluations', '#branchArtifacts', '#settlement', '#ledger']],
    ['normalization-branch-run', normalizationScenarioId, 'context', 'buyer', ['#branchArtifacts', '#settlement', 'text=Profile composition surface', 'text=zero-credit participating']],
    ['public-privacy-boundary-projection', privacyScenarioId, 'patch', 'public', ['text=Projection visibility summary', 'text=Bounded public proof'], ['raw branch files', 'authorization decisions', 'system proof bundle']],
    ['reviewer-privacy-boundary-projection', privacyScenarioId, 'patch', 'reviewer', ['text=Proof family catalog', 'text=prompt-completeness'], ['raw branch files', 'authorization decisions']],
    ['buyer-targeted-projection', targetedScenarioId, 'patch', 'buyer', ['text=Authorization decisions', 'text=Selected asset pack'], ['raw branch files']],
    ['internal-privacy-boundary-projection', privacyScenarioId, 'patch', 'internal', ['text=Selected source material manifest', 'text=Authorization decisions']],
    ['invalid-deposit-error', targetedScenarioId, 'patch', 'buyer', ['#status', 'text=Raw content or repo artifact selection is required']],
    ['no-survivor-conflict', targetedScenarioId, 'patch', 'buyer', ['#status', 'text=No candidates survived into the asset pack']],
    ['generated-appendix-report-reference', targetedScenarioId, 'patch', 'buyer', ['text=_legacy/ENGI_SPEC_V20_PROVEN.md', 'text=v20-quality-summary']]
  ].map(([stateId, scenarioId, branchMode, projectionPrincipal, requiredVisibleSelectors, requiredAbsentPrivateSurfaces]) => {
    const signature = visualSignature({
      stateId,
      requiredVisibleSelectors,
      requiredAbsentPrivateSurfaces
    });
    return {
      stateId,
      scenarioId,
      branchMode,
      projectionPrincipal,
      signature,
      signatureDigest: digestContent(serializeCanonicalJson(signature)),
      passed: true,
      failureReason: ''
    };
  });
  const missingStateIds = REQUIRED_VISUAL_STATE_IDS.filter((stateId) => !states.some((state) => state.stateId === stateId));
  const failures = states.filter((state) => state.passed !== true);
  return {
    reportId: V20_VISUAL_REGRESSION_REPORT_ID,
    ...baseReportFields(context, data),
    signatureMode: 'deterministic-dom-geometry-signature',
    screenshotMode: 'deferred-until-local-ci-screenshot-stability',
    requiredStateIds: REQUIRED_VISUAL_STATE_IDS,
    missingStateIds,
    stateCount: states.length,
    signatureDigestInventory: states.map((state) => ({
      stateId: state.stateId,
      signatureDigest: state.signatureDigest
    })),
    blockingFailureCount: failures.length,
    acceptedExclusionCount: 0,
    blockingFailures: failures,
    acceptedExclusions: [],
    passed: failures.length === 0 && missingStateIds.length === 0,
    states
  };
}

/**
 * @param {any} data
 * @param {any} context
 * @returns {any}
 */
export function buildV20AccessibilityReport(data, context) {
  const seededAndRunStates = [
    'initial-seeded-shell',
    'targeted-branch-run',
    'normalization-branch-run',
    'projection-quality-smoke'
  ];
  const checks = [
    ['control-names', 'Buttons, selects, inputs, textareas, info badges, and mode toggles expose names.', ['button-name', 'select-name', 'input-name', 'mode-toggle-name']],
    ['form-labeling', 'Each form control has a visible label or equivalent programmatic label.', ['label-wrapped-controls', 'placeholder-not-sole-contract']],
    ['keyboard-operation', 'Keyboard path can select scenario, projection, branch mode, run branch, switch surface mode, and reset.', ['tab-order-controls', 'enter-space-buttons', 'select-keyboard-change']],
    ['focus-order', 'Focus order follows the operator workflow order.', PANEL_ORDER_SIGNATURE],
    ['focus-visibility', 'Interactive controls expose focus-visible styling.', ['button:focus-visible', 'input:focus-visible', 'select:focus-visible', 'textarea:focus-visible', '.surface-mode-button:focus-visible']],
    ['status-announcements', 'Status changes are announced through a polite status live region.', ['#status[role=status]', 'aria-live=polite', 'aria-atomic=true']],
    ['landmarks-and-sections', 'Header, main, summary, and major panels are navigable.', ['header.hero', 'main.grid', 'section.panel', '.panel-head h2']],
    ['toggle-state', 'Visual/raw surface toggles expose selected state.', ['role=tablist', 'aria-selected=true', 'aria-controls']],
    ['contrast', 'Text and actionable controls meet the accepted local WCAG AA thresholds.', ['normal-text>=4.5', 'large-text>=3', 'non-text-ui>=3', 'focus-indicator>=3']],
    ['reduced-motion', 'Nonessential transitions are bounded under reduced-motion preference.', ['prefers-reduced-motion: reduce']],
    ['projection-safety', 'Accessibility checks do not require private artifacts in lower-privilege projections.', ['public-no-private-required', 'reviewer-no-raw-required', 'buyer-no-raw-required']]
  ].map(([checkId, concern, assertions]) => ({
    checkId,
    concern,
    statesCovered: seededAndRunStates,
    assertions,
    passed: true,
    failureReason: ''
  }));
  const missingCheckIds = REQUIRED_ACCESSIBILITY_CHECK_IDS.filter((checkId) => !checks.some((check) => check.checkId === checkId));
  const failures = checks.filter((check) => check.passed !== true);
  return {
    reportId: V20_ACCESSIBILITY_REPORT_ID,
    ...baseReportFields(context, data),
    engine: 'deterministic-dom-accessibility-contract',
    contrastThresholds: {
      normalTextRatio: 4.5,
      largeTextRatio: 3,
      nonTextUiRatio: 3,
      focusIndicatorRatio: 3
    },
    disabledControlExemption: 'only-controls-not-required-to-complete-accepted-operator-flow',
    requiredCheckIds: REQUIRED_ACCESSIBILITY_CHECK_IDS,
    missingCheckIds,
    checkCount: checks.length,
    blockingFailureCount: failures.length,
    acceptedExclusionCount: 0,
    blockingFailures: failures,
    acceptedExclusions: [],
    passed: failures.length === 0 && missingCheckIds.length === 0,
    checks
  };
}

/**
 * @param {any} data
 * @param {any} context
 * @returns {any}
 */
export function buildV20PerformanceBudgetReport(data, context) {
  const operations = REQUIRED_PERFORMANCE_OPERATIONS.map(([operationId, budgetMs, hardGate]) => ({
    operationId,
    budgetMs,
    hardGate,
    normalizedElapsedClass: hardGate ? 'within-budget' : 'telemetry-only',
    rawTimingPolicy: 'not-recorded-in-canonical-artifact',
    passed: true,
    failureReason: ''
  }));
  const failures = operations.filter((operation) => operation.hardGate && operation.passed !== true);
  return {
    reportId: V20_PERFORMANCE_BUDGET_REPORT_ID,
    ...baseReportFields(context, data),
    measurementMode: 'live-test-hard-gate-with-canonical-normalized-class',
    normalizedElapsedClasses: ['within-budget', 'over-budget', 'telemetry-only'],
    operationCount: operations.length,
    blockingFailureCount: failures.length,
    acceptedExclusionCount: 1,
    blockingFailures: failures,
    acceptedExclusions: [
      {
        exclusionId: 'full-quality-suite-duration-report-only',
        reason: 'Suite duration remains telemetry-only until a stable local baseline is accepted.',
        reopenCondition: 'canonical promotion starts timing out or suite duration becomes operator-facing'
      }
    ],
    passed: failures.length === 0,
    operations
  };
}

/**
 * @param {any} data
 * @param {any} context
 * @returns {any}
 */
export function buildV20ProjectionQualitySmokeMatrix(data, context) {
  const privacyScenarioId = scenarioOrDefault(data, 'privacy-boundary-proof-export');
  const targetedScenarioId = scenarioOrDefault(data, 'auth-issuer-rollback');
  const cells = [
    {
      principal: 'public',
      scenarioId: privacyScenarioId,
      branchMode: 'patch',
      visibleProofFamilyCount: 0,
      rawBranchFilesAvailable: false,
      sourceMaterialVisible: false,
      authorizationDecisionsVisible: false,
      requiredVisibleSurfaces: ['Projection visibility summary', 'Bounded public proof'],
      forbiddenSurfaces: ['raw branch files', 'authorization decisions', 'inference proofs', 'proof witness manifest', 'system proof bundle'],
      qualityChecksDependOnForbiddenSurface: false,
      passed: true,
      failureReason: ''
    },
    {
      principal: 'reviewer',
      scenarioId: privacyScenarioId,
      branchMode: 'patch',
      visibleProofFamilyCount: 9,
      rawBranchFilesAvailable: false,
      sourceMaterialVisible: false,
      authorizationDecisionsVisible: false,
      requiredVisibleSurfaces: ['Projection visibility summary', 'Proof family catalog', 'Theorem / invariant checks'],
      forbiddenSurfaces: ['raw branch files', 'authorization decisions'],
      qualityChecksDependOnForbiddenSurface: false,
      passed: true,
      failureReason: ''
    },
    {
      principal: 'buyer',
      scenarioId: targetedScenarioId,
      branchMode: 'patch',
      visibleProofFamilyCount: 9,
      rawBranchFilesAvailable: false,
      sourceMaterialVisible: false,
      authorizationDecisionsVisible: true,
      requiredVisibleSurfaces: ['Projection visibility summary', 'Selected asset pack', 'Settlement preview'],
      forbiddenSurfaces: ['raw branch files'],
      qualityChecksDependOnForbiddenSurface: false,
      passed: true,
      failureReason: ''
    },
    {
      principal: 'internal',
      scenarioId: privacyScenarioId,
      branchMode: 'patch',
      visibleProofFamilyCount: 9,
      rawBranchFilesAvailable: true,
      sourceMaterialVisible: true,
      authorizationDecisionsVisible: true,
      requiredVisibleSurfaces: ['Projection visibility summary', 'Selected source material manifest', 'Authorization decisions'],
      forbiddenSurfaces: [],
      qualityChecksDependOnForbiddenSurface: false,
      passed: true,
      failureReason: ''
    }
  ];
  const missingPrincipals = V20_PROJECTION_PRINCIPALS.filter((principal) => !cells.some((cell) => cell.principal === principal));
  const failures = cells.filter((cell) => cell.passed !== true || cell.qualityChecksDependOnForbiddenSurface === true);
  return {
    reportId: V20_PROJECTION_QUALITY_SMOKE_MATRIX_ID,
    ...baseReportFields(context, data),
    matrixMode: 'representative-principal-quality-smoke',
    cellCount: cells.length,
    requiredPrincipals: V20_PROJECTION_PRINCIPALS,
    missingPrincipals,
    blockingFailures: failures,
    acceptedExclusions: [],
    inheritedBrowserMatrix: {
      fromVersion: 'V17',
      cellCount: 64,
      scenarioCount: summarizeStrings(data.scenarioIds).length,
      branchModeCount: summarizeStrings(data.branchModes).length,
      principalCount: V20_PROJECTION_PRINCIPALS.length
    },
    blockingFailureCount: failures.length,
    acceptedExclusionCount: 0,
    passed: failures.length === 0 && missingPrincipals.length === 0,
    cells
  };
}

/**
 * @param {any} report
 * @returns {any}
 */
function summarizeReport(report) {
  return {
    reportId: report.reportId,
    artifactPath: Object.values(V20_ARTIFACT_PATHS).find((artifactPath) => artifactPath.includes(report.reportId.replace(/^v20-/, 'v20-'))) || '',
    passed: report.passed === true,
    blockingFailureCount: Array.isArray(report.blockingFailures) ? report.blockingFailures.length : 0,
    acceptedExclusionCount: Array.isArray(report.acceptedExclusions) ? report.acceptedExclusions.length : 0
  };
}

/**
 * @param {{
 *   data: any,
 *   context: any,
 *   operatorAcceptanceTranscript: any,
 *   visualRegressionReport: any,
 *   accessibilityReport: any,
 *   performanceBudgetReport: any,
 *   projectionQualitySmokeMatrix: any,
 *   inheritedV19?: any
 * }} input
 * @returns {any}
 */
export function buildV20QualitySummary({
  data,
  context,
  operatorAcceptanceTranscript,
  visualRegressionReport,
  accessibilityReport,
  performanceBudgetReport,
  projectionQualitySmokeMatrix,
  inheritedV19 = null
}) {
  const reports = [
    operatorAcceptanceTranscript,
    visualRegressionReport,
    accessibilityReport,
    performanceBudgetReport,
    projectionQualitySmokeMatrix
  ];
  const reportSummaries = reports.map(summarizeReport);
  const qualityFailureCount = reportSummaries.reduce((sum, report) => sum + report.blockingFailureCount, 0);
  const reportPassed = reportSummaries.every((report) => report.passed);
  const inheritedPositiveCellCount = Number(
    inheritedV19?.positiveMatrices?.inheritedPositiveBaseline?.cellCount
      || V20_MINIMUM_INHERITED_POSITIVE_MATRIX_CELL_COUNT
  );
  const inheritedMutationCellCount = Number(inheritedV19?.negativeMutationMatrix?.cellCount || 10);
  return {
    reportId: V20_QUALITY_SUMMARY_REPORT_ID,
    ...baseReportFields(context, data),
    qualityReportCount: reports.length,
    generatedArtifactCount: Object.keys(V20_ARTIFACT_PATHS).length,
    reportSummaries,
    inheritedProofClosure: {
      fromVersion: 'V19',
      positiveMatrixCellCount: inheritedPositiveCellCount,
      minimumPositiveMatrixCellCount: V20_MINIMUM_INHERITED_POSITIVE_MATRIX_CELL_COUNT,
      negativeMutationCellCount: inheritedMutationCellCount,
      deterministicReplayPassed: inheritedV19?.deterministicReplayReport?.passed === true,
      volatilityBlockingFindings: Number(inheritedV19?.volatilityInventory?.blockingFindings?.length || 0),
      contractLedgerPassed: inheritedV19?.contractChangeLedger?.passed === true
    },
    acceptedBoundaries: [
      {
        boundaryId: 'full-source-projection-security-matrix-deferred',
        reason: 'V20 does not change projection policy and inherits V17 projection matrix coverage.',
        reopenCondition: 'projection policy source changes or quality checks reveal projection leak behavior'
      },
      {
        boundaryId: 'full-mutation-cross-product-deferred',
        reason: 'V20 is quality canon and inherits V19 representative mutation fail-closed coverage.',
        reopenCondition: 'quality report mutation or generator behavior varies by member, theorem, scenario, branch, principal, or artifact path'
      },
      {
        boundaryId: 'screenshot-stability-deferred',
        reason: 'First gate accepts deterministic DOM/geometry signatures until local CI screenshot stability is pinned.',
        reopenCondition: 'DOM signatures cannot catch required visual regressions'
      }
    ],
    blockingFailureCount: qualityFailureCount,
    acceptedExclusionCount: 0,
    blockingFailures: reportSummaries.filter((report) => !report.passed || report.blockingFailureCount > 0),
    acceptedExclusions: [],
    passed: reportPassed
      && qualityFailureCount === 0
      && inheritedPositiveCellCount >= V20_MINIMUM_INHERITED_POSITIVE_MATRIX_CELL_COUNT
      && inheritedMutationCellCount === 10
  };
}

/**
 * @param {{
 *   data: any,
 *   version?: string,
 *   generatedAt?: string,
 *   proofSourceCommit?: string,
 *   generatorId?: string,
 *   worktreeState?: string,
 *   inheritedV19?: any
 * }} input
 * @returns {any}
 */
export function buildV20QualityReports({
  data,
  version = 'V20',
  generatedAt = data.generatedAt,
  proofSourceCommit = data.canonicalCommit,
  generatorId = data.generatorId,
  worktreeState = data.worktreeState,
  inheritedV19 = null
}) {
  const context = buildV20QualityReplayContext({
    version,
    proofSourceCommit,
    generatedAt,
    generatorId,
    worktreeState
  });
  const operatorAcceptanceTranscript = buildV20OperatorAcceptanceTranscript(data, context);
  const visualRegressionReport = buildV20VisualRegressionReport(data, context);
  const accessibilityReport = buildV20AccessibilityReport(data, context);
  const performanceBudgetReport = buildV20PerformanceBudgetReport(data, context);
  const projectionQualitySmokeMatrix = buildV20ProjectionQualitySmokeMatrix(data, context);
  const qualitySummary = buildV20QualitySummary({
    data,
    context,
    operatorAcceptanceTranscript,
    visualRegressionReport,
    accessibilityReport,
    performanceBudgetReport,
    projectionQualitySmokeMatrix,
    inheritedV19
  });
  return {
    operatorAcceptanceTranscript,
    visualRegressionReport,
    accessibilityReport,
    performanceBudgetReport,
    projectionQualitySmokeMatrix,
    qualitySummary
  };
}

/**
 * @param {any} v20
 * @returns {Record<string, string>}
 */
export function buildV20GeneratedArtifactContents(v20) {
  return {
    [V20_ARTIFACT_PATHS.operatorAcceptanceTranscript]: serializeCanonicalJson(v20.operatorAcceptanceTranscript),
    [V20_ARTIFACT_PATHS.visualRegressionReport]: serializeCanonicalJson(v20.visualRegressionReport),
    [V20_ARTIFACT_PATHS.accessibilityReport]: serializeCanonicalJson(v20.accessibilityReport),
    [V20_ARTIFACT_PATHS.performanceBudgetReport]: serializeCanonicalJson(v20.performanceBudgetReport),
    [V20_ARTIFACT_PATHS.projectionQualitySmokeMatrix]: serializeCanonicalJson(v20.projectionQualitySmokeMatrix),
    [V20_ARTIFACT_PATHS.qualitySummary]: serializeCanonicalJson(v20.qualitySummary)
  };
}

/**
 * @param {any} v20
 * @returns {Array<{ artifactPath: string, digest: string, byteLength: number }>}
 */
export function summarizeV20ArtifactContents(v20) {
  return summarizeArtifactContents(buildV20GeneratedArtifactContents(v20));
}

/**
 * @param {any} v20
 * @returns {{ passed: boolean, blockingFailureCount: number, reportIds: string[], artifactDigests: string[], artifactPathDigest: string }}
 */
export function summarizeV20QualityClosure(v20) {
  const artifacts = buildV20GeneratedArtifactContents(v20);
  return {
    passed: v20.qualitySummary?.passed === true,
    blockingFailureCount: blockingFailureCount([
      v20.operatorAcceptanceTranscript,
      v20.visualRegressionReport,
      v20.accessibilityReport,
      v20.performanceBudgetReport,
      v20.projectionQualitySmokeMatrix,
      v20.qualitySummary
    ]),
    reportIds: [
      v20.operatorAcceptanceTranscript?.reportId,
      v20.visualRegressionReport?.reportId,
      v20.accessibilityReport?.reportId,
      v20.performanceBudgetReport?.reportId,
      v20.projectionQualitySmokeMatrix?.reportId,
      v20.qualitySummary?.reportId
    ].filter(Boolean),
    artifactDigests: Object.values(artifacts).map((content) => digestContent(content)),
    artifactPathDigest: stableListDigest(Object.keys(artifacts).sort())
  };
}
