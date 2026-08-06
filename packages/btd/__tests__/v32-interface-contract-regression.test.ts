import {
  BTD_INTERFACE_CONTRACT_REGRESSION_DEFERRED_SURFACES,
  BTD_INTERFACE_CONTRACT_REGRESSION_REQUIRED_ASSERTIONS,
  buildBtdInterfaceContractRegressionFixture,
  buildBtdInterfaceContractRegressionFixtures,
  buildBtdInterfaceContractRegressionProof,
} from '../src/interface-contract-regression';

describe('V32 interface contract regression suites', () => {
  it('covers API, MCP, ChatGPT App, product, Auxillaries, and deferred interface hooks with shared source-safe fixtures', () => {
    const proof = buildBtdInterfaceContractRegressionProof();

    expect(proof.kind).toBe('btd.interface_contract_regression_proof');
    expect(proof.fixtureCount).toBe(7);
    expect(proof.activeContractCount).toBe(5);
    expect(proof.deferredBlockedCount).toBe(2);
    expect(proof.missingSurfaces).toEqual([]);
    expect(proof.missingObjectFamilies).toEqual([]);
    expect(proof.observedSurfaces).toEqual([
      'api',
      'auxillaries_hook',
      'chatgpt_app',
      'conversations_hook',
      'exchange_hook',
      'mcp',
      'product',
    ]);
    expect(proof.fixtures.map((fixture) => fixture.surface)).toEqual([
      'product',
      'api',
      'mcp',
      'chatgpt_app',
      'auxillaries_hook',
      'exchange_hook',
      'conversations_hook',
    ]);
    expect(proof.fixtures.every((fixture) => fixture.sourceSafety.sourceSafe)).toBe(true);
    expect(proof.fixtures.every((fixture) => !fixture.sourceSafety.containsSecret)).toBe(true);
    expect(proof.fixtures.every((fixture) => !fixture.sourceSafety.containsProtectedSource)).toBe(true);
  });

  it('keeps Exchange and Conversations represented only as blocked deferred contract rows', () => {
    const proof = buildBtdInterfaceContractRegressionProof();
    const deferredSurfaces = proof.fixtures
      .filter((fixture) => fixture.status === 'deferred_blocked')
      .map((fixture) => fixture.surface);

    expect(deferredSurfaces).toEqual([...BTD_INTERFACE_CONTRACT_REGRESSION_DEFERRED_SURFACES]);
    for (const fixture of proof.fixtures.filter((entry) => entry.status === 'deferred_blocked')) {
      expect(fixture.boundaryKind).toBe('deferred_interface_hook');
      expect(fixture.authBoundary).toBe('deferred_not_admitted');
      expect(fixture.sourceSafetyClass).toBe('deferred-blocker');
      expect(fixture.deferredReason).toMatch(/outside V32 Gate 6/);
    }
  });

  it('asserts authentication, policy denial, source-safety class, and protected-source nondisclosure at each boundary', () => {
    const proof = buildBtdInterfaceContractRegressionProof();

    for (const fixture of proof.fixtures) {
      expect(fixture.authBoundary).toMatch(
        /authenticated_route|confirmed_connected_write|pipeline_permission|support_plane_policy|deferred_not_admitted/,
      );
      expect(fixture.policyDenial).toBeTruthy();
      expect(fixture.sourceSafetyClass).toMatch(
        /source-safe-internal|protected-source-locked|deferred-blocker/,
      );
      expect(fixture.assertions).toEqual(
        expect.arrayContaining([...BTD_INTERFACE_CONTRACT_REGRESSION_REQUIRED_ASSERTIONS]),
      );
    }
  });

  it('fails closed when a required interface fixture is missing', () => {
    const fixtures = buildBtdInterfaceContractRegressionFixtures().filter(
      (fixture) => fixture.surface !== 'conversations_hook',
    );

    expect(() => buildBtdInterfaceContractRegressionProof({ fixtures })).toThrow(
      /missing surfaces: conversations_hook/,
    );
  });

  it('fails closed when deferred hooks are accidentally admitted as active contracts', () => {
    const fixtures = buildBtdInterfaceContractRegressionFixtures().map((fixture) =>
      fixture.surface === 'exchange_hook'
        ? {
            ...fixture,
            status: 'active_contract' as const,
            authBoundary: 'authenticated_route' as const,
            sourceSafetyClass: 'source-safe-internal' as const,
          }
        : fixture,
    );

    expect(() => buildBtdInterfaceContractRegressionProof({ fixtures })).toThrow(
      /exchange_hook must remain a deferred blocked interface contract row/,
    );
  });

  it('fails closed when any boundary omits required source-safety assertions', () => {
    const [firstFixture] = buildBtdInterfaceContractRegressionFixtures();

    expect(() =>
      buildBtdInterfaceContractRegressionFixture({
        ...firstFixture,
        assertions: ['auth-boundary-asserted'],
      }),
    ).toThrow(/missing assertions/);
  });

  it('fails closed on secret-shaped or protected-source fixture text', () => {
    const [firstFixture] = buildBtdInterfaceContractRegressionFixtures();

    expect(() =>
      buildBtdInterfaceContractRegressionFixture({
        ...firstFixture,
        policyDenial: 'raw source can be read before settlement',
      }),
    ).toThrow(/must not contain secrets or protected source/);
  });
});
