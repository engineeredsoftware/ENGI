export const AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT = {
  surface: 'Auxillaries support plane',
  landmarks: [
    { id: 'auxillariesMain', role: 'main', label: 'Bitcode Auxillaries support plane' },
    { id: 'auxillariesPaneNavigation', role: 'navigation', label: 'Auxillaries pane navigation' },
    { id: 'auxillariesActivePane', role: 'region', label: 'active support pane' },
  ],
  states: [
    { id: 'loading', semantic: 'status', sourceSafety: 'source-safe summary only' },
    { id: 'ready', semantic: 'status', sourceSafety: 'source-safe summary only' },
    { id: 'blocked', semantic: 'disabled control', sourceSafety: 'source-safe summary only' },
    { id: 'audit-expanded', semantic: 'native details', sourceSafety: 'source-safe summary only' },
  ],
  viewports: [
    { id: 'phone', width: 390 },
    { id: 'tablet', width: 768 },
    { id: 'laptop', width: 1366 },
    { id: 'widescreen', width: 1920 },
  ],
  evidenceFiles: [
    'apps/uapi/tests/auxillariesContent.access.test.tsx',
    'apps/uapi/tests/auxillariesWorkspacePanels.access.test.tsx',
    'apps/uapi/styles/auxillaries-bitcode.css',
  ],
} as const;

export function summarizeAuxillariesUxAccessibilityProofContract() {
  return {
    surface: AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.surface,
    landmarkCount: AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.landmarks.length,
    stateCount: AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.states.length,
    viewportCount: AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.viewports.length,
    evidenceFileCount: AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.evidenceFiles.length,
  };
}
