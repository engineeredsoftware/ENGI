import {
  BTD_INTERFACE_AUTHORIZATION_POLICY_SURFACES,
  buildBtdInterfaceAuthorizationPolicy,
  buildBtdInterfaceAuthorizationPolicyFixtures,
  buildBtdInterfaceAuthorizationPolicyRegistry,
  getBtdInterfaceAuthorizationPolicyFixture,
  renderBtdInterfaceAuthorizationDeniedState,
} from '../src/interface-authorization-policy';

describe('InterfaceAuthorizationPolicy', () => {
  it('publishes shared policy fixtures for API, MCP, ChatGPT App, and product', () => {
    const registry = buildBtdInterfaceAuthorizationPolicyRegistry();

    expect(registry.kind).toBe('btd.interface_authorization_policy_registry');
    expect(registry.schemaId).toBe('bitcode.interfaceAuthorizationPolicyRegistry.v1');
    expect(registry.missingSurfaces).toEqual([]);
    expect(registry.observedSurfaces).toEqual(
      [...BTD_INTERFACE_AUTHORIZATION_POLICY_SURFACES].sort(),
    );
    expect(registry.policies.map((policy) => policy.interfaceSurface)).toEqual(
      expect.arrayContaining(['api', 'mcp', 'chatgpt_app', 'product']),
    );
    expect(registry.sourceSafety).toMatchObject({
      sourceSafe: true,
      protectedSourceVisible: false,
      containsSecret: false,
      containsProtectedSource: false,
    });
  });

  it('admits source-safe interface actions with issuer, organization, team, role, and policy roots', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('mcp-finding-fits-allowed');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(policy.decision).toBe('allowed');
    expect(policy.actor).toMatchObject({
      actorId: 'mcp-user-1',
      organizationId: 'org-mcp-1',
      teamId: 'team-mcp-reading',
      memberId: 'member-mcp-1',
      organizationRole: 'member',
    });
    expect(policy.authIssuer).toMatchObject({
      issuerKind: 'api_key',
      stale: false,
    });
    expect(policy.proofRoots.policyRoot).toMatch(/^btd-interface-auth:interface-authorization-policy:[a-f0-9]{24}$/);
    expect(policy.organizationAuthority.policyDecision).toBe('allowed');
    expect(policy.sourceVisibility).toBe('source_safe_preview');
  });

  it('admits locked AssetPack delivery only after wallet, license, rights, and settlement evidence pass', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('chatgpt-delivery-allowed');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(policy.decision).toBe('allowed');
    expect(policy.walletCapability).toMatchObject({
      state: 'verified',
      walletId: 'wallet-chatgpt-reader',
      canAuthorizeDelivery: true,
    });
    expect(policy.readLicense.state).toBe('licensed_read');
    expect(policy.assetPackRights.state).toBe('licensed');
    expect(policy.protectedSource).toMatchObject({
      disclosureState: 'requested_locked_source',
      settlementState: 'settled',
    });
    expect(policy.sourceVisibility).toBe('protected_source_allowed');
  });

  it('fails closed with readable repair posture for stale authority', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('product-stale-authority-denied');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(policy.decision).toBe('denied');
    expect(policy.denialCodes).toEqual(expect.arrayContaining(['STALE_AUTHORITY']));
    expect(policy.readableDenial).toMatch(/stale or expired/i);
    expect(policy.repairActions).toEqual(expect.arrayContaining(['refresh-interface-authentication']));
    expect(renderBtdInterfaceAuthorizationDeniedState(policy)).toMatchObject({
      status: 'denied',
      code: 'STALE_AUTHORITY',
      repairActions: expect.arrayContaining(['refresh-interface-authentication']),
    });
  });

  it('fails closed before locked AssetPack delivery when license and rights are unpaid or missing', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('chatgpt-unpaid-delivery-denied');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(policy.decision).toBe('denied');
    expect(policy.denialCodes).toEqual(
      expect.arrayContaining([
        'READ_LICENSE_REQUIRED',
        'ASSET_PACK_RIGHTS_REQUIRED',
        'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
      ]),
    );
    expect(policy.sourceVisibility).toBe('blocked');
    expect(policy.repairActions).toEqual(
      expect.arrayContaining([
        'settle-asset-pack-fee-and-refresh-read-license',
        'settle-asset-pack-fee-and-refresh-rights',
        'review-source-safe-preview-and-settle-before-delivery',
      ]),
    );
  });

  it('fails closed when a required interface surface fixture is missing', () => {
    const fixtures = buildBtdInterfaceAuthorizationPolicyFixtures().filter(
      (fixture) => fixture.interfaceSurface !== 'api',
    );

    expect(() => buildBtdInterfaceAuthorizationPolicyRegistry({ fixtures })).toThrow(
      /missing surfaces: api/,
    );
  });

  it('fails closed on secret-shaped fixture strings', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('api-request-read-allowed');

    expect(() =>
      buildBtdInterfaceAuthorizationPolicyRegistry({
        fixtures: [
          {
            ...fixture,
            fixtureId: 'api-secret-fixture',
            input: {
              ...fixture.input,
              policyId: `${['sb', 'secret'].join('_')}__not-allowed`,
            },
          },
        ],
        requiredSurfaces: ['api'],
      }),
    ).toThrow(/must not contain secrets or locked source material/);
  });
});
