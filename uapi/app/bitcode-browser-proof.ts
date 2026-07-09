export const BITCODE_BROWSER_PROOF_VIEWPORTS = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'laptop', width: 1280, height: 900 },
  { id: 'widescreen', width: 1920, height: 1080 },
] as const;

export const BITCODE_BROWSER_PROOF_ASSERTIONS = [
  'keyboard-path',
  'landmark-labels',
  'focus-state',
  'status-announcements',
  'contrast-sensitive-tokens',
  'reduced-motion',
  'overflow-wrapping',
  'deterministic-visual-semantics',
] as const;

export const BITCODE_BROWSER_PROOF_VISUAL_STRATEGY = [
  'semantic-layout-metrics',
  'stable-route-state-contracts',
  'stateful-accessibility-roles',
  'deterministic-screenshot-baselines',
  'no-screenshot-only-approval',
] as const;

export const BITCODE_BROWSER_PROOF_SURFACES = [
  {
    id: 'deposits',
    label: 'Bitcode Deposits',
    routes: [
      {
        id: 'pipelines',
        path: '/deposits',
        state: 'deposit pipelines and option synthesis',
        selector: '[data-testid="deposits-pipelines-table"]',
      },
      {
        id: 'selected-telemetry',
        path: '/deposits?transactionId=mock-run-branch-remediation',
        state: 'selected synthesis telemetry detail',
        selector: '[data-testid="deposit-synthesis-telemetry"]',
      },
    ],
    landmarks: ['main', 'region', 'group', 'status'],
    interactionStates: [
      'connect-source',
      'synthesize-options',
      'review-measurements',
      'admit-to-depository',
    ],
    evidenceFiles: [
      'uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
      'uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'uapi/tests/depositPageClient.test.tsx',
    ],
  },
  {
    id: 'reads',
    label: 'Bitcode Reads',
    routes: [
      {
        id: 'pipelines',
        path: '/reads',
        state: 'five-stage Reading request and pipelines',
        selector: '[data-testid="reads-pipelines-table"]',
      },
      {
        id: 'selected-telemetry',
        path: '/reads?transactionId=mock-run-branch-remediation',
        state: 'selected read telemetry detail',
        selector: '[data-testid="reads-synthesized-packs"]',
      },
    ],
    landmarks: ['main', 'region', 'group', 'status'],
    interactionStates: [
      'request-read',
      'review-synthesized-need',
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ],
    evidenceFiles: [
      'uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
      'uapi/tests/e2e/bitcode-browser-proof.spec.ts',
      'uapi/tests/readPageClient.test.tsx',
    ],
  },
  {
    id: 'conversations',
    label: 'Bitcode Conversations',
    routes: [
      { id: 'fullscreen', path: '/conversations', state: 'fullscreen writing workspace' },
      { id: 'terminal-handoff', path: '/conversations', state: 'Conversation source-safe handoff' },
    ],
    landmarks: ['main', 'button', 'textbox', 'status'],
    interactionStates: ['add-split-pane', 'toggle-pipeline-log-location', 'submit-terminal-bound-message'],
    evidenceFiles: [
      'uapi/tests/e2e/commercial-mvp.conversations-docs.spec.ts',
      'uapi/tests/e2e/conversations.split-logs.spec.ts',
      'uapi/tests/conversationTerminalHandoff.test.tsx',
      'uapi/tests/conversationStreamPipelineLog.test.tsx',
    ],
  },
  {
    id: 'auxillaries',
    label: 'Bitcode Auxillaries',
    routes: [
      { id: 'wallet', path: '/packs?auxillary-open-to=wallet', state: 'wallet support pane' },
      { id: 'profile', path: '/packs?auxillary-open-to=profile', state: 'profile support pane' },
      { id: 'interfaces', path: '/packs?auxillary-open-to=interfaces', state: 'interfaces support pane' },
    ],
    landmarks: ['main', 'navigation', 'region', 'status'],
    interactionStates: ['skip-to-active-pane', 'pane-tabs', 'expandable-audit-detail'],
    evidenceFiles: [
      'uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
      'uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
      'uapi/tests/auxillariesContent.access.test.tsx',
      'uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
    ],
  },
  {
    id: 'exchange',
    label: 'Bitcode Exchange',
    routes: [
      { id: 'market', path: '/exchange', state: 'Exchange rights review' },
      {
        id: 'buy-existing-btd',
        path: '/exchange?assetPack=asset-pack-run-branch-remediation&intent=buy-existing-btd',
        state: 'BTD rights transfer intent',
      },
    ],
    landmarks: ['main', 'table', 'button', 'region'],
    interactionStates: ['filter-market', 'select-activity', 'inspect-proof', 'preserve-source-safe-preview'],
    evidenceFiles: [
      'uapi/tests/e2e/commercial-mvp.btd-exchange.spec.ts',
      'uapi/tests/exchangeTerminalHandoff.test.ts',
      'uapi/tests/e2e/bitcode-browser-proof.spec.ts',
    ],
  },
  {
    id: 'docs',
    label: 'Bitcode Docs',
    routes: [
      { id: 'docs-home', path: '/docs', state: 'source-safe public docs' },
      { id: 'exchange-docs', path: '/docs/exchange', state: 'Exchange learning path' },
      { id: 'terminal-actions-docs', path: '/docs/terminal-actions', state: 'Terminal action manual' },
    ],
    landmarks: ['main', 'navigation', 'link', 'article'],
    interactionStates: ['docs-home-to-terminal-actions', 'docs-exchange-to-terminal', 'docs-route-readability'],
    evidenceFiles: [
      'uapi/tests/e2e/commercial-mvp.conversations-docs.spec.ts',
      'uapi/tests/e2e/commercial-mvp.routes.spec.ts',
      'uapi/tests/publicDocsPageContent.test.tsx',
    ],
  },
] as const;

export const BITCODE_BROWSER_PROOF_CONTRACT = {
  surfaces: BITCODE_BROWSER_PROOF_SURFACES,
  viewports: BITCODE_BROWSER_PROOF_VIEWPORTS,
  assertions: BITCODE_BROWSER_PROOF_ASSERTIONS,
  visualStrategy: BITCODE_BROWSER_PROOF_VISUAL_STRATEGY,
  sourceSafety: {
    sourceSafe: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    containsSecret: false,
    containsProtectedSource: false,
    screenshotOnlyApproval: false,
  },
} as const;

export function summarizeBitcodeBrowserProofContract() {
  const routeCount = BITCODE_BROWSER_PROOF_SURFACES.reduce(
    (total, surface) => total + surface.routes.length,
    0,
  );
  const interactionStateCount = BITCODE_BROWSER_PROOF_SURFACES.reduce(
    (total, surface) => total + surface.interactionStates.length,
    0,
  );
  const evidenceFileCount = new Set(
    BITCODE_BROWSER_PROOF_SURFACES.flatMap((surface) => surface.evidenceFiles),
  ).size;

  return {
    surfaceCount: BITCODE_BROWSER_PROOF_SURFACES.length,
    routeCount,
    viewportCount: BITCODE_BROWSER_PROOF_VIEWPORTS.length,
    assertionCount: BITCODE_BROWSER_PROOF_ASSERTIONS.length,
    visualStrategyCount: BITCODE_BROWSER_PROOF_VISUAL_STRATEGY.length,
    interactionStateCount,
    evidenceFileCount,
    sourceSafe: BITCODE_BROWSER_PROOF_CONTRACT.sourceSafety.sourceSafe,
    screenshotOnlyApproval: BITCODE_BROWSER_PROOF_CONTRACT.sourceSafety.screenshotOnlyApproval,
  };
}
