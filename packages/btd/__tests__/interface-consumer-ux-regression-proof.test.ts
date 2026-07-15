import {
  BTD_INTERFACE_CONSUMER_UX_REGRESSION_POSTURES,
  BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES,
  BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES,
  buildBtdInterfaceConsumerUxRegressionInputs,
  buildBtdInterfaceConsumerUxRegressionProof,
  buildBtdInterfaceConsumerUxRegressionRow,
  getBtdInterfaceConsumerUxRegressionRow,
} from '../src/interface-consumer-ux-regression-proof';

describe('Interface consumer UX regression proof', () => {
  it('publishes source-safe consumer rows for every required surface, posture, and capability', () => {
    const proof = buildBtdInterfaceConsumerUxRegressionProof();

    expect(proof.observedSurfaces).toEqual([...BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES].sort());
    expect(proof.observedPostures).toEqual([...BTD_INTERFACE_CONSUMER_UX_REGRESSION_POSTURES].sort());
    expect(proof.observedCapabilities).toEqual(
      [...BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES].sort(),
    );
    expect(proof.missingSurfaces).toEqual([]);
    expect(proof.missingPostures).toEqual([]);
    expect(proof.missingCapabilities).toEqual([]);
    expect(proof.protectedSourceVisible).toBe(false);
    expect(proof.promptBodyVisible).toBe(false);
    expect(proof.brittleDemonstrationFixture).toBe(false);
    expect(proof.sourceSafety).toEqual({
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
    });
  });

  it('records readable summaries, proof roots, repair steps, and fee or rights previews', () => {
    const publicApi = getBtdInterfaceConsumerUxRegressionRow(
      'interface.consumer.public-api-read-access-denied',
    );
    const mcp = getBtdInterfaceConsumerUxRegressionRow('interface.consumer.mcp-finding-fits-readable');
    const chatgpt = getBtdInterfaceConsumerUxRegressionRow(
      'interface.consumer.chatgpt-delivery-blocked',
    );
    const terminal = getBtdInterfaceConsumerUxRegressionRow(
      'interface.consumer.terminal-preview-blocked',
    );
    const packageConsumer = getBtdInterfaceConsumerUxRegressionRow(
      'interface.consumer.package-contract-readback',
    );

    expect(publicApi).toMatchObject({
      surface: 'public_api',
      posture: 'denied_readable',
      denialCode: 'READ_LICENSE_OR_AUTHORITY_MISSING',
      protectedSourceVisible: false,
    });
    expect(mcp).toMatchObject({
      surface: 'mcp_api',
      posture: 'success_readable',
      successSummary: 'Finding Fits request is queued with source-safe proof roots and rights preview.',
    });
    expect(chatgpt).toMatchObject({
      surface: 'chatgpt_app',
      posture: 'blocked_preview',
      denialCode: 'CONFIRMATION_OR_SETTLEMENT_REQUIRED',
    });
    expect(terminal).toMatchObject({
      surface: 'product_handoff',
      visibilityBoundary: 'blocked_until_settlement',
      denialCode: 'ASSETPACK_SOURCE_LOCKED_UNTIL_SETTLEMENT',
    });
    expect(packageConsumer).toMatchObject({
      surface: 'package_consumer',
      visibilityBoundary: 'package_contract_readback',
    });

    for (const row of [publicApi, mcp, chatgpt, terminal, packageConsumer]) {
      expect(row.actionLabel.length).toBeGreaterThan(0);
      expect(row.sourceSafeSummary.length).toBeGreaterThan(0);
      expect(row.proofRoots.length).toBeGreaterThan(0);
      expect(row.repairSteps.length).toBeGreaterThan(0);
      expect(row.feeRightsPreview.feeQuoteRoot).toMatch(/^fee-quote-root:/);
      expect(row.feeRightsPreview.previewRoot).toMatch(/^btd-interface-consumer-ux-fee-rights-preview:/);
      expect(row.feeRightsPreview.protectedSourceVisible).toBe(false);
      expect(row.replayCommand).toMatch(/^(pnpm|npm|node)\b/);
      expect(row.fixturePath).not.toMatch(/protocol-demonstration|demo-only|mock-only/);
      expect(row.promptBodyVisible).toBe(false);
    }
  });

  it('fails closed when surface coverage is missing', () => {
    const rows = buildBtdInterfaceConsumerUxRegressionInputs().filter(
      (row) => row.surface !== 'chatgpt_app',
    );

    expect(() => buildBtdInterfaceConsumerUxRegressionProof({ rows })).toThrow(
      /missing surfaces: chatgpt_app/,
    );
  });

  it('fails closed when readable denial or success summary is malformed', () => {
    const deniedRow = buildBtdInterfaceConsumerUxRegressionInputs().find(
      (row) => row.posture === 'denied_readable',
    );
    const successRow = buildBtdInterfaceConsumerUxRegressionInputs().find(
      (row) => row.posture === 'success_readable',
    );

    expect(deniedRow).toBeDefined();
    expect(successRow).toBeDefined();

    expect(() =>
      buildBtdInterfaceConsumerUxRegressionRow({
        ...deniedRow!,
        readableDenial: undefined,
      }),
    ).toThrow(/readableDenial/);

    expect(() =>
      buildBtdInterfaceConsumerUxRegressionRow({
        ...successRow!,
        successSummary: undefined,
      }),
    ).toThrow(/successSummary/);
  });

  it('rejects secrets, prompt bodies, protected payloads, and demonstration-only fixtures', () => {
    const row = buildBtdInterfaceConsumerUxRegressionInputs()[0];

    expect(() =>
      buildBtdInterfaceConsumerUxRegressionRow({
        ...row,
        proofRoots: [['sk', 'proj', 'thisShouldNeverBeSerialized123456'].join('-')],
      }),
    ).toThrow(/must not contain secrets/);

    expect(() =>
      buildBtdInterfaceConsumerUxRegressionRow({
        ...row,
        sourceSafeSummary: 'prompt body must never be visible in a consumer row',
      }),
    ).toThrow(/prompt bodies/);

    expect(() =>
      buildBtdInterfaceConsumerUxRegressionRow({
        ...row,
        readableDenial: 'protected source payload must never be visible in a consumer row',
      }),
    ).toThrow(/protected source payloads/);

    expect(() =>
      buildBtdInterfaceConsumerUxRegressionRow({
        ...row,
        fixturePath: 'protocol-demonstration/src/consumer-fixture.test.ts',
      }),
    ).toThrow(/demonstration-only/);
  });
});
