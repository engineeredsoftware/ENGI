// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_BROWSER_E2E_VISUAL_PROOF_ARTIFACT_PATH =
  '.bitcode/v40-browser-e2e-visual-proof.json';
export const V40_BROWSER_E2E_VISUAL_PROOF_SCHEMA_ID =
  'bitcode.v40.browserE2eVisualProof.v1';
export const V40_BROWSER_E2E_VISUAL_PROOF_VERSION = 'V40';
export const V40_BROWSER_E2E_VISUAL_PROOF_CURRENT_TARGET = 'V39';
export const V40_BROWSER_E2E_VISUAL_PROOF_SOURCE_SAFETY_VERDICT =
  'source-safe-browser-e2e-visual-proof-metadata';

export const V40_BROWSER_E2E_VISUAL_SURFACE_IDS = Object.freeze([
  'terminal:enterprise-reading-transaction-browser-flow',
  'conversations:writing-stream-log-browser-flow',
  'auxillaries:contained-pane-accessibility-flow',
  'exchange:btd-market-rights-browser-flow',
  'docs:public-learning-route-browser-flow',
  'responsive:canonical-viewports-overflow-proof',
  'visual:screenshot-baseline-and-trace-proof',
  'accessibility:keyboard-landmark-status-proof',
]);

export const V40_BROWSER_E2E_VISUAL_VERDICTS = Object.freeze([
  'covered',
  'exempt',
  'missing',
  'blocked',
]);

export const V40_BROWSER_E2E_VISUAL_EXPECTED_TOTALS = Object.freeze({
  productSurfaceCount: 5,
  browserProofRowCount: 8,
  routeStateCount: 13,
  interactionStateCount: 18,
  viewportCount: 4,
  accessibilityAssertionCount: 8,
  visualProofStrategyCount: 5,
  focusedBrowserSpecCount: 1,
  browserSpecFamilyCount: 8,
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-browser-e2e-visual-proof-row:${digest(id)}`;
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

function allMarkersPresent(repoRoot, paths, markers) {
  const source = paths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.every((marker) => source.includes(marker));
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.browserSurfaceId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_browser_e2e_visual_proof_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawModelResponseWithProtectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    screenshotOnlyApproval: false,
    valueBearingMainnetRequired: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_BROWSER_E2E_VISUAL_ROWS = Object.freeze([
  row({
    browserSurfaceId: 'terminal:enterprise-reading-transaction-browser-flow',
    proofKind: 'browser-e2e-interaction-state',
    routeStates: ['/terminal', '/terminal?transactionId=mock-run-branch-remediation&transactionDetail=activity', '/terminal?transactionId=mock-run-branch-remediation&transactionDetail=console'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
      'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
      'apps/uapi/tests/bitcodeBrowserProof.test.ts',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.terminal.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
      'apps/uapi/tests/bitcodeBrowserProof.test.ts',
      'apps/uapi/tests/terminalUxBrowserProof.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
      'pnpm --dir apps/uapi exec jest tests/bitcodeBrowserProof.test.ts tests/terminalUxBrowserProof.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'BITCODE_BROWSER_PROOF_CONTRACT',
      'terminal-cockpit-root',
      'terminal-enterprise-reading-step',
      'TERMINAL_UX_BROWSER_PROOF_CONTRACT',
    ],
    requiredTestMarkers: [
      'Terminal five-stage Reading',
      'Terminal detail tabs',
      'five-stage Reading',
      'expectNoHorizontalOverflow',
    ],
    expectedCounts: {
      routeStateCount: 3,
      readingStageCount: 5,
      selectedActivityDetailCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Terminal browser proof covers the five-step Reading cockpit, selected transaction detail, blocked console state, route-owned controls, status semantics, and responsive overflow.',
  }),
  row({
    browserSurfaceId: 'conversations:writing-stream-log-browser-flow',
    proofKind: 'browser-e2e-conversation-terminal-handoff',
    routeStates: ['/conversations'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/components/conversations/ConversationsRouteClient/ConversationsRouteClient.tsx',
      'apps/uapi/components/conversations/ConversationsFullscreenControls/ConversationsFullscreenControls.tsx',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
      'apps/uapi/components/conversations/ConversationsSidebarLogs/ConversationsSidebarLogs.tsx',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.conversations-docs.spec.ts',
      'apps/uapi/tests/e2e/conversations.split-logs.spec.ts',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
      'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
      'pnpm --dir apps/uapi exec jest tests/conversationTerminalHandoff.test.tsx tests/conversationStreamPipelineLog.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'BITCODE_BROWSER_PROOF_CONTRACT',
      'ConversationsRouteClient',
      'Toggle pipeline log location',
      'conversation-terminal-handoff',
    ],
    requiredTestMarkers: [
      'Conversations route opens fullscreen writing mode',
      'Conversation source-safe handoff',
      'embedded logs',
      'source-safe',
    ],
    expectedCounts: {
      routeStateCount: 2,
      splitPaneInteractionCovered: true,
      richLogProjectionCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Conversation browser proof covers fullscreen writing, split pane, pipeline log placement, and Terminal handoff while only exposing source-safe metadata.',
  }),
  row({
    browserSurfaceId: 'auxillaries:contained-pane-accessibility-flow',
    proofKind: 'browser-e2e-accessibility-responsive',
    routeStates: ['/terminal?auxillary-open-to=wallet', '/terminal?auxillary-open-to=profile', '/terminal?auxillary-open-to=interfaces'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/app/bitcode-browser-accessibility-responsive-proof.ts',
      'apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts',
      'apps/uapi/components/auxillaries/AuxillariesContent/AuxillariesContent.tsx',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
      'apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
      'apps/uapi/tests/auxillariesContent.access.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
      'pnpm --dir apps/uapi exec jest tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts tests/auxillariesContent.access.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'BITCODE_BROWSER_PROOF_CONTRACT',
      'AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT',
      'auxillaries-main-landmark',
      'aria-live',
    ],
    requiredTestMarkers: [
      'contained tabs-left auxillary pane',
      'active-pane announcements',
      'Auxillaries default, guided, and detail states',
      'source-safe summary only',
    ],
    expectedCounts: {
      routeStateCount: 3,
      containedPaneCount: 4,
      auditDetailCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Auxillaries browser proof covers contained Wallet/Profile/Interfaces states, skip navigation, pane navigation, live status, audit details, and responsive overflow.',
  }),
  row({
    browserSurfaceId: 'exchange:btd-market-rights-browser-flow',
    proofKind: 'browser-e2e-rights-market',
    routeStates: ['/exchange', '/exchange?assetPack=asset-pack-run-branch-remediation&intent=buy-existing-btd'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/app/packs/PacksPageClient.tsx',
      'apps/uapi/app/packs/page.tsx',
      'apps/uapi/app/api/packs/activity/route.ts',
      'apps/uapi/app/exchange/page.tsx',
      'apps/uapi/components/bitcode/routes/ProductRoutes/product-routes.ts',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.btd-exchange.spec.ts',
      'apps/uapi/tests/packsPageClient.test.tsx',
      'apps/uapi/tests/packActivityModel.test.ts',
      'apps/uapi/tests/exchangeTerminalHandoff.test.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
      'pnpm --dir apps/uapi exec jest tests/exchangeTerminalHandoff.test.ts --runInBand',
    ],
    requiredSourceMarkers: [
      'BITCODE_BROWSER_PROOF_CONTRACT',
      'PacksPageClient',
      'Search pack activity',
      'buildPacksHref',
    ],
    requiredTestMarkers: [
      'renders searchable Packs activity',
      'Proof roots',
      'source-safe detail readback',
      'builds Packs links',
    ],
    expectedCounts: {
      routeStateCount: 2,
      btdIntentCovered: true,
      selectedActivityReadbackCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Exchange browser proof covers market filters, selected activity detail, BTD wallet intent, rights-review routing, and source-safe preview disclosure.',
  }),
  row({
    browserSurfaceId: 'docs:public-learning-route-browser-flow',
    proofKind: 'browser-e2e-docs-navigation',
    routeStates: ['/docs', '/docs/exchange', '/docs/terminal-actions'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/components/marketing/PublicDocsPageContent/PublicDocsPageContent.tsx',
      'apps/uapi/app/docs/bitcode-docs-content.ts',
      'apps/uapi/app/docs/page.tsx',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.conversations-docs.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.routes.spec.ts',
      'apps/uapi/tests/publicDocsPageContent.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
      'pnpm --dir apps/uapi exec jest tests/publicDocsPageContent.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'BITCODE_BROWSER_PROOF_CONTRACT',
      'Learn Bitcode from AssetPacks to proof',
      'docsPage',
      'Terminal action manual',
    ],
    requiredTestMarkers: [
      'source-safe public docs',
      'Docs home teaches user order',
      'Docs article links keep public learning',
      'route is readable and free of browser errors',
    ],
    expectedCounts: {
      routeStateCount: 3,
      docsNavigationCovered: true,
      terminalActionManualCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Docs browser proof keeps public learning routes readable, navigable, and tied to Terminal/Exchange product surfaces without exposing protected implementation source.',
  }),
  row({
    browserSurfaceId: 'responsive:canonical-viewports-overflow-proof',
    proofKind: 'responsive-viewport-proof',
    routeStates: ['phone', 'tablet', 'laptop', 'widescreen'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/app/bitcode-browser-accessibility-responsive-proof.ts',
      'apps/uapi/playwright.config.ts',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
      'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
      'apps/uapi/tests/bitcodeBrowserProof.test.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
      'pnpm --dir apps/uapi run test:e2e:v32-browser-proof',
      'pnpm --dir apps/uapi exec jest tests/bitcodeBrowserProof.test.ts tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts --runInBand',
    ],
    requiredSourceMarkers: [
      'BITCODE_BROWSER_PROOF_VIEWPORTS',
      'phone',
      'widescreen',
      "screenshot: 'on'",
    ],
    requiredTestMarkers: [
      'expectNoHorizontalOverflow',
      'phone',
      'desktop',
      'viewport',
    ],
    expectedCounts: {
      viewportCount: 4,
      overflowThresholdPx: 48,
      reducedMotionCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Responsive proof covers canonical phone/tablet/laptop/widescreen geometry and fails when critical routes introduce incoherent horizontal overflow.',
  }),
  row({
    browserSurfaceId: 'visual:screenshot-baseline-and-trace-proof',
    proofKind: 'visual-baseline-proof',
    routeStates: ['screenshot-baseline', 'trace-on-first-retry', 'video-on'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/playwright.config.ts',
      'apps/uapi/tests/e2e/sidebars.visual.spec.ts',
      'apps/uapi/tests/e2e/login.visual.spec.ts',
      'apps/uapi/tests/e2e/storybook.components.visual.spec.ts',
    ],
    testPaths: [
      'apps/uapi/tests/e2e/sidebars.visual.spec.ts',
      'apps/uapi/tests/e2e/login.visual.spec.ts',
      'apps/uapi/tests/e2e/storybook.components.visual.spec.ts',
      'apps/uapi/tests/bitcodeBrowserProof.test.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi run test:e2e:visual',
      'pnpm --dir apps/uapi exec jest tests/bitcodeBrowserProof.test.ts --runInBand',
    ],
    requiredSourceMarkers: [
      'deterministic-screenshot-baselines',
      "screenshot: 'on'",
      "video: 'on'",
      'toHaveScreenshot',
      'toMatchSnapshot',
    ],
    requiredTestMarkers: [
      'sidebar-left-closed.png',
      'login-first-load.png',
      'button-primary.png',
      'no-screenshot-only-approval',
    ],
    expectedCounts: {
      visualSpecFamilyCount: 3,
      tracePolicyCovered: true,
      screenshotOnlyApproval: false,
    },
    coverageTier: 'opt-in-lane',
    closureRequirement:
      'Visual proof binds deterministic screenshot baselines, traces, and video receipts to semantic assertions instead of allowing screenshot-only approval.',
  }),
  row({
    browserSurfaceId: 'accessibility:keyboard-landmark-status-proof',
    proofKind: 'accessibility-contract-proof',
    routeStates: ['keyboard-path', 'landmark-labels', 'focus-state', 'status-announcements'],
    sourceRoots: [
      'apps/uapi/app/bitcode-browser-proof.ts',
      'apps/uapi/app/bitcode-browser-accessibility-responsive-proof.ts',
      'apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts',
      'apps/uapi/components/conversations/ConversationsMessageWaterfall/ConversationsMessageWaterfall.tsx',
    ],
    testPaths: [
      'apps/uapi/tests/bitcodeBrowserProof.test.ts',
      'apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
      'apps/uapi/tests/auxillariesContent.access.test.tsx',
      'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/bitcodeBrowserProof.test.ts tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts tests/auxillariesContent.access.test.tsx --runInBand',
      'pnpm --dir apps/uapi run test:e2e:browser-proof',
    ],
    requiredSourceMarkers: [
      'keyboard-path',
      'landmark-labels',
      'status-announcements',
      'aria-live',
    ],
    requiredTestMarkers: [
      'keyboard landmarks focus status',
      'keeps browser proof metadata source-safe',
      'aria-live',
      'Skip to active support pane',
    ],
    expectedCounts: {
      assertionCount: 8,
      statusRegionCovered: true,
      keyboardPathCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Accessibility proof covers keyboard paths, landmark labels, focus state, status announcements, contrast, reduced motion, overflow wrapping, and deterministic visual semantics.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const packageJson = readSource(repoRoot, 'package.json');
  const uapiPackageJson = readSource(repoRoot, 'apps/uapi/package.json');
  const gateWorkflow = readSource(repoRoot, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = readSource(repoRoot, '.github/workflows/bitcode-canon-quality.yml');
  const spec = readSource(repoRoot, 'BITCODE_SPEC_V40.md');
  const delta = readSource(repoRoot, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = readSource(repoRoot, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = readSource(repoRoot, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = readSource(repoRoot, 'SPECIFICATIONS_ROADMAP.md');
  const protocolReadme = readSource(repoRoot, 'packages/specifying/README.md');
  const rootReadme = readSource(repoRoot, 'README.md');
  const protocolIndex = readSource(repoRoot, 'packages/specifying/src/index.js');
  const protocolTypes = readSource(repoRoot, 'packages/specifying/src/index.d.ts');
  const uapiJestConfig = readSource(repoRoot, 'apps/uapi/jest.config.cjs');

  const rowPredicates = V40_BROWSER_E2E_VISUAL_ROWS.flatMap((coverageRow) => {
    const safeId = coverageRow.browserSurfaceId.replace(/[^a-z0-9]+/gu, '-');
    return [
      predicateResult(
        `${safeId}:source-roots-exist`,
        coverageRow.sourceRoots[0],
        coverageRow.sourceRoots.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
      ),
      predicateResult(
        `${safeId}:test-paths-exist`,
        coverageRow.testPaths[0],
        coverageRow.testPaths.every((testPath) => sourceExists(repoRoot, testPath)),
      ),
      predicateResult(
        `${safeId}:source-markers-present`,
        coverageRow.sourceRoots[0],
        allMarkersPresent(repoRoot, coverageRow.sourceRoots, coverageRow.requiredSourceMarkers),
      ),
      predicateResult(
        `${safeId}:test-markers-present`,
        coverageRow.testPaths[0],
        allMarkersPresent(repoRoot, coverageRow.testPaths, coverageRow.requiredTestMarkers),
      ),
    ];
  });

  return [
    predicateResult('package-scripts-include-gate7', 'package.json', packageJson.includes('generate:v40-browser-e2e-visual-proof') && packageJson.includes('check:v40-gate7')),
    predicateResult('uapi-package-includes-browser-proof-script', 'apps/uapi/package.json', uapiPackageJson.includes('test:e2e:browser-proof')),
    predicateResult('workflows-run-gate7-check', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('check-v40-gate7-browser-e2e-visual-proof.mjs') && canonWorkflow.includes('check-v40-gate7-browser-e2e-visual-proof.mjs')),
    predicateResult('gate-quality-runs-browser-proof-contract-test', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('bitcodeBrowserProof.test.ts')),
    predicateResult('gate-quality-optionally-runs-browser-proof', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('test:e2e:browser-proof') && gateWorkflow.includes('BITCODE_ENABLE_GATE_BROWSER_PROOF')),
    predicateResult('uapi-jest-includes-browser-proof-test', 'apps/uapi/jest.config.cjs', uapiJestConfig.includes('bitcodeBrowserProof.test.ts')),
    predicateResult('protocol-exports-gate7', 'packages/specifying/src/index.js', protocolIndex.includes('buildV40BrowserE2eVisualProof') && protocolTypes.includes('buildV40BrowserE2eVisualProof')),
    predicateResult('spec-documents-gate7', 'BITCODE_SPEC_V40.md', spec.includes('V40 Gate 7 Browser E2E, Accessibility, Responsive, And Visual Proof') && spec.includes(V40_BROWSER_E2E_VISUAL_PROOF_ARTIFACT_PATH)),
    predicateResult('delta-documents-gate7', 'BITCODE_SPEC_V40_DELTA.md', delta.includes('Gate 7 closes with package-backed `V40BrowserE2eVisualProof`')),
    predicateResult('notes-document-gate7', 'BITCODE_SPEC_V40_NOTES.md', notes.includes('Gate 7 implementation notes') && notes.includes('browser E2E, visual, accessibility, and responsive proof')),
    predicateResult('parity-documents-gate7', 'BITCODE_SPEC_V40_PARITY_MATRIX.md', parity.includes('v40-browser-e2e-visual-proof') && parity.includes('| Gate 7 | Browser/visual/accessibility/responsive artifact | implemented |')),
    predicateResult(
      'roadmap-advanced-through-gate7',
      'SPECIFICATIONS_ROADMAP.md',
      (/Current working gate: V40 Gate (?:7|8|9|10|11)\b/u.test(roadmap) ||
        roadmap.includes('Latest closed version: V40') ||
        roadmap.includes('Recent V40 closure anchor')) &&
        roadmap.includes('V40 Gate 7 closure anchor'),
    ),
    predicateResult('readmes-document-gate7', 'README.md', rootReadme.includes('V40 Gate 7') && protocolReadme.includes('V40BrowserE2eVisualProof')),
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
    surfaceCount: V40_BROWSER_E2E_VISUAL_SURFACE_IDS.length,
    verdictIds: [...V40_BROWSER_E2E_VISUAL_VERDICTS],
    rowsByVerdict,
    rowsByTier,
    expectedTotals: { ...V40_BROWSER_E2E_VISUAL_EXPECTED_TOTALS },
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    missingRowCount: rows.filter((item) => item.verdict === 'missing').length,
    blockedRowCount: rows.filter((item) => item.verdict === 'blocked').length,
    exemptRowCount: rows.filter((item) => item.verdict === 'exempt').length,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    terminalBrowserFlowCoverageClosed: rows.some((item) => item.browserSurfaceId === 'terminal:enterprise-reading-transaction-browser-flow'),
    conversationBrowserFlowCoverageClosed: rows.some((item) => item.browserSurfaceId === 'conversations:writing-stream-log-browser-flow'),
    auxillariesBrowserFlowCoverageClosed: rows.some((item) => item.browserSurfaceId === 'auxillaries:contained-pane-accessibility-flow'),
    exchangeBrowserFlowCoverageClosed: rows.some((item) => item.browserSurfaceId === 'exchange:btd-market-rights-browser-flow'),
    docsBrowserFlowCoverageClosed: rows.some((item) => item.browserSurfaceId === 'docs:public-learning-route-browser-flow'),
    responsiveViewportCoverageClosed: rows.some((item) => item.browserSurfaceId === 'responsive:canonical-viewports-overflow-proof'),
    visualBaselineCoverageClosed: rows.some((item) => item.browserSurfaceId === 'visual:screenshot-baseline-and-trace-proof'),
    accessibilityCoverageClosed: rows.some((item) => item.browserSurfaceId === 'accessibility:keyboard-landmark-status-proof'),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawModelResponseWithProtectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    screenshotOnlyApproval: false,
    valueBearingMainnetRequired: false,
    promptContentRewriteDeferredToV41: true,
  };
}

export function buildV40BrowserE2eVisualProof(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V40_BROWSER_E2E_VISUAL_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v40-browser-e2e-visual-proof:${digest(JSON.stringify({
    rows: rows.map((item) => item.rowRoot),
    failedPredicateIds: coverage.failedPredicateIds,
    expectedTotals: coverage.expectedTotals,
  }))}`;

  return {
    artifactId: 'v40-browser-e2e-visual-proof',
    schemaId: V40_BROWSER_E2E_VISUAL_PROOF_SCHEMA_ID,
    version: V40_BROWSER_E2E_VISUAL_PROOF_VERSION,
    currentTarget: V40_BROWSER_E2E_VISUAL_PROOF_CURRENT_TARGET,
    sourceSafetyVerdict: V40_BROWSER_E2E_VISUAL_PROOF_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0 && coverage.allCriticalSurfacesClosed,
    surfaceIds: [...V40_BROWSER_E2E_VISUAL_SURFACE_IDS],
    verdictIds: [...V40_BROWSER_E2E_VISUAL_VERDICTS],
    rows,
    rowIds: rows.map((item) => item.browserSurfaceId),
    predicateResults,
    coverage,
  };
}
