import {
  BITCODE_BROWSER_PROOF_ASSERTIONS,
  BITCODE_BROWSER_PROOF_CONTRACT,
  BITCODE_BROWSER_PROOF_SURFACES,
  BITCODE_BROWSER_PROOF_VIEWPORTS,
  BITCODE_BROWSER_PROOF_VISUAL_STRATEGY,
  summarizeBitcodeBrowserProofContract,
} from '@/app/bitcode-browser-proof';

describe('Bitcode browser proof contract', () => {
  const sourceSafetyPattern = new RegExp(
    [
      `${['sk', 'proj'].join('-')}-`,
      `${['sb', 'secret'].join('_')}__`,
      ['service', 'role'].join('_'),
      'raw protected source',
      'unpaid assetpack source',
    ].join('|'),
    'i',
  );

  it('covers Deposits, Reads, Conversations, Auxillaries, Exchange, and Docs routes', () => {
    expect(summarizeBitcodeBrowserProofContract()).toEqual({
      surfaceCount: 6,
      routeCount: 14,
      viewportCount: 4,
      assertionCount: 8,
      visualStrategyCount: 5,
      interactionStateCount: 22,
      evidenceFileCount: 16,
      sourceSafe: true,
      screenshotOnlyApproval: false,
    });

    expect(BITCODE_BROWSER_PROOF_SURFACES.map((surface) => surface.id)).toEqual([
      'deposits',
      'reads',
      'conversations',
      'auxillaries',
      'exchange',
      'docs',
    ]);
    expect(
      BITCODE_BROWSER_PROOF_SURFACES.flatMap((surface) =>
        surface.routes.map((route) => `${surface.id}:${route.id}`),
      ),
    ).toEqual(
      expect.arrayContaining([
        'deposits:pipelines',
        'deposits:selected-telemetry',
        'reads:pipelines',
        'reads:selected-telemetry',
        'conversations:terminal-handoff',
        'auxillaries:interfaces',
        'exchange:buy-existing-btd',
        'docs:terminal-actions-docs',
      ]),
    );
  });

  it('pins responsive viewports and keyboard landmarks focus status assertions', () => {
    expect(BITCODE_BROWSER_PROOF_VIEWPORTS.map((viewport) => viewport.id)).toEqual([
      'phone',
      'tablet',
      'laptop',
      'widescreen',
    ]);
    expect([...BITCODE_BROWSER_PROOF_ASSERTIONS]).toEqual([
      'keyboard-path',
      'landmark-labels',
      'focus-state',
      'status-announcements',
      'contrast-sensitive-tokens',
      'reduced-motion',
      'overflow-wrapping',
      'deterministic-visual-semantics',
    ]);
    expect([...BITCODE_BROWSER_PROOF_VISUAL_STRATEGY]).toEqual([
      'semantic-layout-metrics',
      'stable-route-state-contracts',
      'stateful-accessibility-roles',
      'deterministic-screenshot-baselines',
      'no-screenshot-only-approval',
    ]);
  });

  it('keeps five-stage Reading and source-safe preview states visible without source disclosure', () => {
    const deposits = BITCODE_BROWSER_PROOF_SURFACES.find((surface) => surface.id === 'deposits');
    const reads = BITCODE_BROWSER_PROOF_SURFACES.find((surface) => surface.id === 'reads');
    const exchange = BITCODE_BROWSER_PROOF_SURFACES.find((surface) => surface.id === 'exchange');
    const docs = BITCODE_BROWSER_PROOF_SURFACES.find((surface) => surface.id === 'docs');

    expect(reads?.interactionStates).toEqual([
      'request-read',
      'review-synthesized-need',
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ]);
    expect(deposits?.interactionStates).toEqual([
      'connect-source',
      'synthesize-options',
      'review-measurements',
      'admit-to-depository',
    ]);
    expect(exchange?.interactionStates).toContain('preserve-source-safe-preview');
    expect(docs?.routes.map((route) => route.state)).toContain('source-safe public docs');
    expect(BITCODE_BROWSER_PROOF_CONTRACT.sourceSafety).toEqual({
      sourceSafe: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      containsSecret: false,
      containsProtectedSource: false,
      screenshotOnlyApproval: false,
    });
    expect(JSON.stringify(BITCODE_BROWSER_PROOF_CONTRACT)).not.toMatch(sourceSafetyPattern);
  });
});
