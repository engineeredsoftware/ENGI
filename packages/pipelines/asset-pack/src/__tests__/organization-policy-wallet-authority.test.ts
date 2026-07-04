import {
  assertOrganizationPolicyWalletAuthoritySourceSafe,
  buildOrganizationPolicyWalletAuthority,
} from '../organization-policy-wallet-authority';

describe('OrganizationPolicyWalletAuthority', () => {
  it('allows budgeted Reading BTC payment with role, grant, wallet authority, and approval', () => {
    const statement = buildOrganizationPolicyWalletAuthority({
      route: '/reads',
      actorId: 'user-1',
      organizationId: 'org-1',
      teamId: 'team-core',
      memberId: 'member-buyer',
      organizationRole: 'admin',
      organizationPermissionGrants: [
        'reading:request',
        'reading:review_need',
        'reading:request_finding_fits',
        'asset_pack:review_preview',
        'settlement:pay_btc_fee',
      ],
      walletId: 'wallet-reader',
      walletAuthorityPresent: true,
      quoteSats: 12_500,
      budgetEnvelopeSats: 50_000,
      approvalThresholdSats: 10_000,
      procurementApproved: true,
      buyerAuthorized: true,
      accountAdmitted: true,
      interfaceAdmitted: true,
      createdAt: '2026-05-29T00:00:00.000Z',
    });

    expect(statement.schema).toBe('bitcode.organization.policy-wallet-authority');
    expect(statement.route).toBe('/reads');
    expect(statement.budgetApproval.state).toBe('within-limit');
    expect(statement.walletAuthority.state).toBe('verified');
    expect(statement.actionStatements.find((entry) => entry.action === 'pay_btc_fee')).toMatchObject({
      requiredForRoute: true,
      allowed: true,
    });
    expect(statement.actionStatements.find((entry) => entry.action === 'deliver_asset_pack')).toMatchObject({
      requiredForRoute: false,
      allowed: false,
    });
    expect(statement.aggregate.state).toBe('allowed');
    expect(assertOrganizationPolicyWalletAuthoritySourceSafe(statement)).toEqual({
      admitted: true,
      reason: 'source_safe_organization_policy_wallet_authority',
    });
  });

  it('fails Reading payment closed when wallet authority is missing', () => {
    const statement = buildOrganizationPolicyWalletAuthority({
      route: '/reads',
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'admin',
      organizationPermissionGrants: ['settlement:pay_btc_fee', 'reading:request'],
      quoteSats: 10_000,
      budgetEnvelopeSats: 50_000,
      approvalThresholdSats: 5_000,
      procurementApproved: true,
      buyerAuthorized: true,
      accountAdmitted: true,
      interfaceAdmitted: true,
    });

    const payment = statement.actionStatements.find((entry) => entry.action === 'pay_btc_fee');

    expect(statement.aggregate.state).toBe('denied');
    expect(payment?.allowed).toBe(false);
    expect(payment?.denialReasons).toEqual(expect.arrayContaining(['wallet_binding_missing']));
    expect(assertOrganizationPolicyWalletAuthoritySourceSafe(statement).admitted).toBe(true);
  });

  it('allows deposit submission only after source criticality, deposit approval, wallet, and policy admit it', () => {
    const statement = buildOrganizationPolicyWalletAuthority({
      route: '/deposits',
      actorId: 'user-1',
      organizationId: 'org-1',
      teamId: 'team-supply',
      memberId: 'member-depositor',
      organizationRole: 'admin',
      organizationPermissionGrants: [
        'deposit:synthesize_options',
        'deposit:approve_option',
        'deposit:submit',
      ],
      walletId: 'wallet-depositor',
      walletAuthorityPresent: true,
      sourceCriticalityState: 'sub-critical',
      sourceCriticalityApproved: true,
      depositApproved: true,
      expectedSettlementSats: 18_000,
      depositLimitSats: 100_000,
      accountAdmitted: true,
      interfaceAdmitted: true,
    });

    expect(statement.depositApproval.state).toBe('sub-critical-approved');
    expect(statement.actionStatements.every((entry) => entry.allowed)).toBe(true);
    expect(statement.aggregate.state).toBe('allowed');
    expect(statement.disclosure.protectedSourceVisible).toBe(false);
  });

  it('blocks critical source deposit approval without exposing source-bearing payloads', () => {
    const statement = buildOrganizationPolicyWalletAuthority({
      route: '/deposits',
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'admin',
      organizationPermissionGrants: [
        'deposit:synthesize_options',
        'deposit:approve_option',
        'deposit:submit',
      ],
      walletId: 'wallet-depositor',
      walletAuthorityPresent: true,
      sourceCriticalityState: 'blocked-critical-source',
      sourceCriticalityApproved: false,
      depositApproved: true,
      expectedSettlementSats: 18_000,
      accountAdmitted: true,
      interfaceAdmitted: true,
    });

    expect(statement.depositApproval.state).toBe('critical-source-blocked');
    expect(statement.aggregate.state).toBe('denied');
    expect(statement.aggregate.blockers).toContain('critical source cannot be deposited without policy repair');
    expect(assertOrganizationPolicyWalletAuthoritySourceSafe(statement).admitted).toBe(true);
  });
});
