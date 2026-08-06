import { Execution } from '@bitcode/execution-generics';
import {
  assertInterfaceDisclosureBoundarySourceSafe,
  buildInterfaceDisclosureBoundary,
  INTERFACE_DISCLOSURE_BOUNDARY_STAGES,
  INTERFACE_DISCLOSURE_BOUNDARY_SURFACES,
  persistInterfaceDisclosureBoundary,
  summarizeInterfaceDisclosureBoundary,
} from '../interface-disclosure-boundary';

describe('Interface disclosure boundary', () => {
  it('covers every product, interface, teaching, and compatibility surface at every disclosure stage', () => {
    const boundary = buildInterfaceDisclosureBoundary();

    expect(boundary).toMatchObject({
      schema: 'bitcode.interface-disclosure-boundary',
      routeVocabulary: {
        currentProductRoutes: ['/deposits', '/reads', '/packs'],
        compatibilityRedirects: {
          '/exchange': '/packs',
        },
        canonicalTerms: {
          assetPackCommodity: 'AssetPack commodity',
          btdScalarVolumeAndRights: 'BTD scalar volume and rights',
          btcSettlementMoney: 'BTC settlement money',
          proofReadbackAuthority: 'proof readback authority',
        },
      },
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(boundary.requiredSurfaces).toEqual([...INTERFACE_DISCLOSURE_BOUNDARY_SURFACES]);
    expect(boundary.requiredStages).toEqual([...INTERFACE_DISCLOSURE_BOUNDARY_STAGES]);
    expect(boundary.rowCount).toBe(
      INTERFACE_DISCLOSURE_BOUNDARY_SURFACES.length *
        INTERFACE_DISCLOSURE_BOUNDARY_STAGES.length,
    );
    expect(
      boundary.rows.map((row) => `${row.surface}:${row.stage}`).sort(),
    ).toEqual(
      INTERFACE_DISCLOSURE_BOUNDARY_SURFACES.flatMap((surface) =>
        INTERFACE_DISCLOSURE_BOUNDARY_STAGES.map((stage) => `${surface}:${stage}`),
      ).sort(),
    );
  });

  it('keeps collapsed and expanded interface states source-safe before repository delivery', () => {
    const boundary = buildInterfaceDisclosureBoundary();

    for (const row of boundary.rows) {
      expect(row.collapsedStateSummary).toContain('source-safe status');
      expect(row.expandedStateSummary).toContain(
        row.stage === 'after-repository-delivery'
          ? 'purchased AssetPack source'
          : 'withholds source-bearing AssetPack contents',
      );
      expect(row.visibleFields.join(' ')).toMatch(/proof roots|repository delivery proof/u);
      expect(row.withheldFields.join(' ')).toMatch(/source|credentials/u);
      expect(row.sourceSafety).toMatchObject({
        protectedSourcePayloadSerialized: false,
        rawProtectedPromptVisible: false,
        rawInterpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      });
      if (row.stage !== 'after-repository-delivery') {
        expect(row.sourceBearingAssetPackVisibleToReader).toBe(false);
      }
    }

    assertInterfaceDisclosureBoundarySourceSafe(boundary);
  });

  it('unlocks source-bearing delivery only after BTC finality, BTD rights transfer, and repository delivery', () => {
    const boundary = buildInterfaceDisclosureBoundary();
    const deliveryRows = boundary.rows.filter(
      (row) => row.stage === 'after-repository-delivery',
    );
    const earlyRows = boundary.rows.filter(
      (row) => row.stage !== 'after-repository-delivery',
    );

    expect(deliveryRows.length).toBe(INTERFACE_DISCLOSURE_BOUNDARY_SURFACES.length);
    expect(earlyRows.every((row) => row.sourceBearingAssetPackVisibleToReader === false)).toBe(true);
    for (const row of deliveryRows) {
      expect(row).toMatchObject({
        sourceBearingAssetPackVisibleToReader: true,
        btdRightsTransferred: true,
        btcFinalityRequired: true,
        repositoryDeliveryRequiredForSource: true,
      });
    }
  });

  it('treats /exchange as a compatibility redirect rather than a current product route', () => {
    const boundary = buildInterfaceDisclosureBoundary();
    const redirectRows = boundary.rows.filter((row) => row.surface === 'exchange_redirect');

    expect(redirectRows.length).toBe(INTERFACE_DISCLOSURE_BOUNDARY_STAGES.length);
    for (const row of redirectRows) {
      expect(row).toMatchObject({
        surfaceKind: 'compatibility_redirect',
        routePath: '/exchange',
        compatibilityRedirectTarget: '/packs',
      });
    }
    expect(boundary.routeVocabulary.currentProductRoutes).not.toContain('/exchange');
  });

  it('persists route vocabulary, rows, source safety, and proof roots on execution storage', () => {
    const execution = new Execution('interface-disclosure-boundary-test');
    const boundary = buildInterfaceDisclosureBoundary();

    persistInterfaceDisclosureBoundary(execution, boundary);

    expect(execution.get('interfaces/disclosure', 'boundary')).toMatchObject({
      schema: 'bitcode.interface-disclosure-boundary',
      rowCount: boundary.rowCount,
    });
    expect(execution.get('interfaces/disclosure', 'routeVocabulary')).toMatchObject({
      currentProductRoutes: ['/deposits', '/reads', '/packs'],
    });
    expect(execution.get('interfaces/disclosure', 'proofRoots')).toMatchObject({
      boundaryRoot: expect.stringMatching(/^sha256:/u),
    });
    expect(summarizeInterfaceDisclosureBoundary(boundary)).toContain('BTD scalar volume and rights');
  });

  it('does not serialize protected source, secrets, or raw provider responses in boundary records', () => {
    const boundary = buildInterfaceDisclosureBoundary();
    const serialized = JSON.stringify(boundary);

    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain(`${['sk', 'proj'].join('-')}-`);
    expect(serialized).not.toContain(`${['sb', 'secret'].join('_')}__`);
    expect(serialized).not.toContain('protected source body');
    expect(serialized).not.toContain('raw provider response body');
  });
});
