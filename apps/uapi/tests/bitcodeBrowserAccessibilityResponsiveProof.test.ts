import {
  BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_ASSERTIONS,
  BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_CONTRACT,
  BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES,
  BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VIEWPORTS,
  BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VISUAL_STRATEGY,
  summarizeBitcodeBrowserAccessibilityResponsiveProofContract,
} from '@/app/bitcode-browser-accessibility-responsive-proof';

describe('Bitcode browser accessibility responsive proof contract', () => {
  const sourceSafetyPattern = new RegExp(
    [
      `${['sk', 'proj'].join('-')}-`,
      `${['sb', 'secret'].join('_')}__`,
      ['service', 'role'].join('_'),
      'raw source',
    ].join('|'),
    'i',
  );

  it('covers Marketing, Packs, Deposits, Reads, and Auxillaries across device viewports', () => {
    expect(summarizeBitcodeBrowserAccessibilityResponsiveProofContract()).toEqual({
      surfaceCount: 5,
      routeCount: 12,
      viewportCount: 6,
      assertionCount: 8,
      visualStrategyCount: 4,
      evidenceFileCount: 7,
      sourceSafe: true,
    });
    expect(BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES.map((surface) => surface.id)).toEqual([
      'marketing',
      'packs',
      'deposits',
      'reads',
      'auxillaries',
    ]);
    for (const surface of BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_SURFACES) {
      expect(surface.routes.length).toBeGreaterThanOrEqual(1);
      expect(surface.routes[0]?.state).toBe('default');
      expect(surface.evidenceFiles).toEqual(
        expect.arrayContaining(['apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts']),
      );
    }
    expect(BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VIEWPORTS.map((viewport) => viewport.id)).toEqual([
      'phone',
      'phone-lg',
      'tablet',
      'laptop',
      'desktop',
      'widescreen',
    ]);
  });

  it('requires keyboard, labels, focus, status, contrast, motion, overflow, and deterministic visual assertions', () => {
    expect([...BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_ASSERTIONS]).toEqual([
      'keyboard-path',
      'landmark-labels',
      'focus-state',
      'status-announcements',
      'contrast-sensitive-tokens',
      'reduced-motion',
      'overflow-wrapping',
      'deterministic-visual-semantics',
    ]);
    expect([...BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_VISUAL_STRATEGY]).toEqual([
      'semantic-layout-metrics',
      'stable-route-state-contracts',
      'stateful-accessibility-roles',
      'no-screenshot-only-approval',
    ]);
  });

  it('keeps browser proof metadata source-safe', () => {
    expect(BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_CONTRACT.sourceSafety).toEqual({
      sourceSafe: true,
      protectedSourceVisible: false,
      containsSecret: false,
      containsProtectedSource: false,
    });
    expect(JSON.stringify(BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_CONTRACT)).not.toMatch(sourceSafetyPattern);
  });
});
