export const BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VIEWPORTS = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'laptop', width: 1280, height: 900 },
  { id: 'widescreen', width: 1920, height: 1080 },
] as const;

export const BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_ASSERTIONS = [
  'keyboard-path',
  'landmark-labels',
  'focus-state',
  'status-announcements',
  'contrast-sensitive-tokens',
  'reduced-motion',
  'overflow-wrapping',
  'deterministic-visual-semantics',
] as const;

export const BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES = [
  {
    id: 'deposits',
    label: 'Bitcode Deposits',
    routes: [
      { id: 'default', path: '/deposits', state: 'default' },
      {
        id: 'guided',
        path: '/deposits',
        state: 'guided',
        selector: '[data-testid="deposits-pipelines-table"]',
      },
      {
        id: 'detail',
        path: '/deposits?transactionId=mock-run-branch-remediation',
        state: 'detail',
        selector: '[data-testid="deposit-synthesis-telemetry"]',
      },
    ],
    landmarks: ['main', 'region', 'group'],
    evidenceFiles: [
      'uapi/tests/depositPageClient.test.tsx',
      'uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
      'uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    ],
  },
  {
    id: 'reads',
    label: 'Bitcode Reads',
    routes: [
      { id: 'default', path: '/reads', state: 'default' },
      {
        id: 'guided',
        path: '/reads',
        state: 'guided',
        selector: '[data-testid="reads-pipelines-table"]',
      },
      {
        id: 'detail',
        path: '/reads?transactionId=mock-run-branch-remediation',
        state: 'detail',
        selector: '[data-testid="reads-synthesized-packs"]',
      },
    ],
    landmarks: ['main', 'region', 'group'],
    evidenceFiles: [
      'uapi/tests/readPageClient.test.tsx',
      'uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
      'uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    ],
  },
  {
    id: 'auxillaries',
    label: 'Bitcode Auxillaries',
    routes: [
      { id: 'default', path: '/packs?auxillary-open-to=wallet', state: 'default' },
      {
        id: 'guided',
        path: '/packs?auxillary-open-to=profile',
        state: 'guided',
        selector: '[data-testid="auxillaries-pane-navigation"]',
      },
      {
        id: 'detail',
        path: '/packs?auxillary-open-to=interfaces',
        state: 'detail',
        selector: '[data-testid="auxillaries-active-pane-region"]',
      },
    ],
    landmarks: ['main', 'navigation', 'region'],
    evidenceFiles: [
      'uapi/tests/auxillariesContent.access.test.tsx',
      'uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
      'uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    ],
  },
] as const;

export const BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VISUAL_STRATEGY = [
  'semantic-layout-metrics',
  'stable-route-state-contracts',
  'stateful-accessibility-roles',
  'no-screenshot-only-approval',
] as const;

export const BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_CONTRACT = {
  surfaces: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES,
  viewports: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VIEWPORTS,
  assertions: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_ASSERTIONS,
  visualStrategy: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VISUAL_STRATEGY,
  sourceSafety: {
    sourceSafe: true,
    protectedSourceVisible: false,
    containsSecret: false,
    containsProtectedSource: false,
  },
} as const;

export function summarizeBitcodeBrowserAccessibilityResponsiveProofContract() {
  const routeCount = BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES.reduce(
    (total, surface) => total + surface.routes.length,
    0,
  );
  const evidenceFileCount = new Set(
    BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES.flatMap(
      (surface) => surface.evidenceFiles,
    ),
  ).size;

  return {
    surfaceCount: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES.length,
    routeCount,
    viewportCount: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VIEWPORTS.length,
    assertionCount: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_ASSERTIONS.length,
    visualStrategyCount: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VISUAL_STRATEGY.length,
    evidenceFileCount,
    sourceSafe: BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_CONTRACT.sourceSafety.sourceSafe,
  };
}
