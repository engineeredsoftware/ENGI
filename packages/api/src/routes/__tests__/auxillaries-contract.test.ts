import {
  AUXILLARIES_CONTRACT_VERSION,
  assertAuxillariesJsonSafe,
  buildAuxillaryDataPayload,
  buildAuxillariesRecoveryRun,
  normalizeAuxillaryPane,
  parseAuxillariesContractSnapshot,
  toAuxillariesJsonSafe,
  validateAuxillariesContractSnapshot,
} from '../auxillaries-contract';

describe('Auxillaries package route contracts', () => {
  it('builds package-owned Auxillaries state with source-safe route payload compatibility', () => {
    const payload = buildAuxillaryDataPayload({
      profile: {
        id: 'user-1',
        username: 'operator',
        display_name: 'Operator',
        email: 'operator@bitcode.exchange',
        is_verified: true,
        company_name: 'Bitcode',
        role: 'admin',
        organization_id: 'org-bitcode',
        team_id: 'team-core',
        member_id: 'member-operator',
        organization_permission_grants: ['settlement:pay_btc_fee'],
        organization_policy_confirmed: true,
        multi_sig_required: true,
        multi_sig_required_signatures: 2,
        multi_sig_present_signatures: 2,
        multi_sig_approver_ids: ['member-operator', 'member-reviewer'],
        wallet_binding: {
          address: 'tb1pauxcontract',
          provider: 'leather',
          status: 'verified',
          boundAt: '2026-05-21T00:00:00.000Z',
        },
        protectedSource: 'never visible to support UI',
        settings: {
          service_role_key: 'service-role-secret',
        },
      },
      githubConnection: {
        provider: 'github',
        login: 'bitcode',
        installationId: 123,
        access_token: 'ghp_secret',
        rawPrompt: 'private prompt body',
      },
      walletConnectionStatus: {
        connected: true,
        valid: true,
        provider: 'leather',
        address: 'tb1pauxcontract',
        verificationState: 'verified',
        metadata: {
          network: 'testnet',
          private_key: 'wallet-secret',
          connectedAt: '2026-05-21T00:00:00.000Z',
        },
      },
      repositoryConnectionStatus: {
        connected: true,
        valid: true,
        provider: 'github',
        username: 'bitcode',
        scopes: ['repo', 'contents:write'],
        tokenPresenceClass: 'present_source_safe',
        lastReadbackStatus: 'succeeded',
        lastReadbackAt: '2026-05-21T02:00:00.000Z',
        metadata: {
          token: 'provider-token',
        },
      },
      repositories: [
        {
          fullName: 'bitcode/core',
          owner: {
            username: 'bitcode',
            type: 'organization',
          },
          protected_source: 'repository source',
        },
      ],
      repositoryInventorySource: 'stored_repository_inventory',
      btdBalance: 128,
      btcFeeBalance: 0.04,
      recentBtdAssetPacks: [
        {
          assetPackId: 'asset-pack-1',
          rangeStart: 1,
          rangeEndExclusive: 3,
          readRightState: 'owner_read',
          sourceSafePreviewRoot: 'source-safe-preview-root',
        },
      ],
      modelPreferences: {
        preferred_model: 'gpt-4.1',
        preferred_provider: 'openai',
      },
      templatePreferences: {
        delivery_templates: {
          asset_pack_pr: { label: 'AssetPack PR' },
        },
        evidence_document_templates: {
          witness_summary: { label: 'Witness summary' },
        },
        auto_save_templates: true,
      },
      notificationRows: [
        {
          id: 'notification-1',
          is_read: false,
          created_at: '2026-05-21T01:00:00.000Z',
        },
      ],
      onboardedSteps: ['btd', 'connects', 'profile', 'interfaces'],
    });

    expect(payload.isOnboardingComplete).toBe(true);
    expect(payload.onboardedPanes).toEqual(['wallet', 'externals', 'profile', 'interfaces']);
    expect(payload.organizations).toEqual(['bitcode']);
    expect(payload.profileState.kind).toBe('AuxillariesProfileState');
    expect(payload.profileState.accountIdentity).toMatchObject({
      userId: 'user-1',
      emailVerified: true,
    });
    expect(payload.profileState.preferences.model).toMatchObject({
      configured: true,
      provider: 'openai',
      model: 'gpt-4.1',
    });
    expect(payload.profileState.preferences.templates).toMatchObject({
      configured: true,
      deliveryTemplateCount: 1,
      evidenceDocumentTemplateCount: 1,
      autoSaveTemplates: true,
    });
    expect(payload.profileState.notificationPosture).toMatchObject({
      state: 'attention_needed',
      unreadCount: 1,
    });
    expect(payload.profileState.dataSharingPosture).toMatchObject({
      state: 'configured',
      repositoryCount: 1,
      enabledRepositoryCount: 1,
    });
    expect(payload.connectionReadiness[0]).toMatchObject({
      providerId: 'github',
      providerName: 'GitHub',
      provider: 'github',
      connected: true,
      valid: true,
      credentialPosture: 'present_source_safe',
      tokenPresenceClass: 'present_source_safe',
      scopesClass: 'repo_read_write',
      lastReadbackStatus: 'succeeded',
      blocker: null,
      repairAction: 'none',
    });
    expect(payload.walletBtdPaneState.signerPosture).toMatchObject({
      ready: true,
      state: 'verified',
      canSignPsbt: true,
      serverCustody: false,
    });
    expect(payload.walletBtdPaneState.walletCapability).toMatchObject({
      network: 'testnet',
      noCustody: true,
      serverCustody: false,
      capabilities: expect.arrayContaining(['message_sign', 'psbt_sign', 'rights_transfer']),
    });
    expect(payload.walletBtdPaneState.networkReadiness).toMatchObject({
      state: 'ready',
      network: 'testnet',
      blocker: null,
    });
    expect(payload.walletBtdPaneState.btdReadRightSummary).toMatchObject({
      aggregateBtd: 128,
      assetPackCount: 1,
      rangeCount: 1,
      totalRangeCells: 2,
      ownerReadCount: 1,
      protectedSourceVisible: false,
      sourceSafePreviewRoots: ['source-safe-preview-root'],
    });
    expect(payload.walletBtdPaneState.treasurySummary).toMatchObject({
      feeAsset: 'BTC',
      noCustody: true,
      treasuryScope: 'account',
      organizationTreasurySeparated: true,
      exchangeMarketState: 'not_exchange_market_state',
    });
    expect(payload.walletBtdPaneState).toMatchObject({
      settlementReadiness: 'ready',
      settlementBlockers: [],
    });
    expect(payload.organizationAuthority).toMatchObject({
      kind: 'btd_organization_policy_authority',
      organizationId: 'org-bitcode',
      teamId: 'team-core',
      memberId: 'member-operator',
      role: 'admin',
      explicitGrantSet: ['settlement:pay_btc_fee'],
      walletBindingRequired: true,
      walletBindingState: 'bound',
      policyDecision: 'allowed',
      denialReason: null,
      sourceSafetyClass: 'source_safe',
      policy: {
        policyId: 'org-bitcode:auxillaries-policy',
        action: 'pay_btc_fee',
        interfaceSurface: 'product',
      },
      multiSigPosture: {
        state: 'ready',
        required: true,
        requiredSignatures: 2,
        presentSignatures: 2,
        requiredAction: 'none',
      },
    });
    expect(payload.organizationAuthority.policy.policyHash).toMatch(/^[0-9a-f]{64}$/);
    expect(payload.organizationAuthority.actionDecision?.decision).toBe('allowed');
    expect(payload.organizationAuthority.authorityRoot).toMatch(/^btd-proof-root:organization-policy-authority:/);
    expect(payload.interfaceAdmissions.map((admission) => admission.interfaceId)).toEqual([
      'product',
      'api',
      'mcp',
      'chatgpt-app',
      'exchange-hook',
      'conversations-hook',
      'future-interface-hooks',
    ]);
    expect(payload.interfaceAdmissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          interfaceId: 'product',
          surface: 'product',
          authMode: 'session',
          readiness: 'ready',
          policyRequirements: expect.arrayContaining([
            'session_required',
            'organization_policy_required_for_protected_actions',
          ]),
          supportedActions: expect.arrayContaining([
            'request_read',
            'review_need',
            'request_finding_fits',
            'pay_btc_fee',
            'deliver_asset_pack',
          ]),
          allowedActions: expect.arrayContaining([
            'request_read',
            'review_need',
            'request_finding_fits',
          ]),
          sourceSafetyClass: 'source_safe',
          deferredProductDepth: 'none',
        }),
        expect.objectContaining({
          interfaceId: 'api',
          surface: 'api',
          authMode: 'api_key',
          readiness: 'ready',
          sourceSafetyClass: 'secret_free_summary',
          policyRequirements: expect.arrayContaining(['api_key_required', 'provider_scope_required']),
          supportedActions: expect.arrayContaining(['read_support_state', 'deliver_asset_pack']),
        }),
        expect.objectContaining({
          interfaceId: 'mcp',
          surface: 'mcp',
          authMode: 'provider_oauth',
          readiness: 'ready',
          sourceSafetyClass: 'secret_free_summary',
          policyRequirements: expect.arrayContaining([
            'provider_oauth_required',
            'wallet_binding_required_for_delivery',
            'organization_policy_required_for_protected_actions',
          ]),
        }),
        expect.objectContaining({
          interfaceId: 'chatgpt-app',
          surface: 'chatgpt_app',
          authMode: 'session',
          readiness: 'ready',
          sourceSafetyClass: 'protected_source_redacted',
          policyRequirements: expect.arrayContaining([
            'protected_source_never_embedded_before_paid_unlock',
          ]),
        }),
        expect.objectContaining({
          interfaceId: 'exchange-hook',
          surface: 'exchange',
          authMode: 'wallet_signature',
          readiness: 'blocked',
          allowedActions: [],
          blockers: ['exchange.market_depth_deferred_to_future_version'],
          deferredProductDepth: 'exchange_market_law',
        }),
        expect.objectContaining({
          interfaceId: 'conversations-hook',
          surface: 'future_hook',
          authMode: 'not_admitted',
          readiness: 'blocked',
          allowedActions: [],
          blockers: ['conversations.product_depth_deferred_to_future_version'],
          deferredProductDepth: 'conversations_product_depth',
        }),
        expect.objectContaining({
          interfaceId: 'future-interface-hooks',
          surface: 'future_hook',
          authMode: 'not_admitted',
          readiness: 'blocked',
          allowedActions: [],
          blockers: ['future_hooks.interface_contract_unregistered'],
          deferredProductDepth: 'future_interface_contract',
        }),
      ]),
    );
    for (const admission of payload.interfaceAdmissions) {
      expect(admission.interfaceAdmissionRoot).toMatch(/^[0-9a-f]{64}$/);
      expect(admission.policyConstraints).toEqual(admission.policyRequirements);
    }
    const telemetrySubjects = payload.telemetryProofHooks.map((hook) => hook.subject);
    expect(telemetrySubjects).toEqual(expect.arrayContaining([
      'profile',
      'account',
      'provider_connection',
      'interface_admission',
      'wallet',
      'btd_pane',
      'organization_authority',
      'policy_decision',
      'readiness_diagnostic',
    ]));
    for (const hook of payload.telemetryProofHooks) {
      expect(hook).toMatchObject({
        kind: 'AuxillariesTelemetryProofHook',
        sourceSafetyClass: 'source_safe',
      });
      expect(hook.theoremId).toMatch(/^auxillaries\./);
      expect(hook.replayStepId.length).toBeGreaterThan(0);
      expect(hook.evidenceRoot.length).toBeGreaterThan(0);
      expect(hook.telemetryRoot).toMatch(/^[0-9a-f]{64}$/);
      expect(hook.proofRoot).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(payload.auxillariesContract.telemetryProofHooks)
      .toEqual(payload.telemetryProofHooks);
    expect(payload.auxillariesContract.contractVersion).toBe(AUXILLARIES_CONTRACT_VERSION);
    expect(validateAuxillariesContractSnapshot(payload.auxillariesContract)).toEqual({
      valid: true,
      errors: [],
    });
    expect(parseAuxillariesContractSnapshot(payload.auxillariesContract).contractRoot)
      .toBe(payload.auxillariesContract.contractRoot);
    expect(JSON.stringify(payload)).not.toContain('ghp_secret');
    expect(JSON.stringify(payload)).not.toContain('service-role-secret');
    expect(JSON.stringify(payload)).not.toContain('wallet-secret');
    expect(JSON.stringify(payload)).not.toContain('repository source');
    expect(JSON.stringify(payload)).not.toContain('private prompt body');
    expect(JSON.stringify(payload.telemetryProofHooks)).not.toContain('provider-token');
    expect(JSON.stringify(payload.walletBtdPaneState)).not.toContain('asset pack source');
    expect(JSON.stringify(payload.connectionReadiness[0].metadata)).not.toContain('provider-token');
    expect(assertAuxillariesJsonSafe(payload)).toBeUndefined();
  });

  it('emits pane diagnostics for incomplete profile, missing provider, and missing wallet state', () => {
    const payload = buildAuxillaryDataPayload({
      profile: null,
      githubConnection: null,
      walletConnectionStatus: null,
      repositoryConnectionStatus: null,
      repositories: [],
      repositoryInventorySource: null,
      btdBalance: 0,
      btcFeeBalance: null,
      recentBtdAssetPacks: [],
      modelPreferences: null,
      templatePreferences: null,
      notificationRows: [],
      onboardedSteps: [],
    });

    const blockerIds = payload.readinessDiagnostics.map((diagnostic) => diagnostic.blockerId);
    expect(payload.profileState.accountReadiness).toBe('blocked');
    expect(payload.connectionReadiness[0].requiredRepairAction).toBe('connect_provider');
    expect(payload.connectionReadiness[0]).toMatchObject({
      tokenPresenceClass: 'missing',
      scopesClass: 'missing',
      lastReadbackStatus: 'not_attempted',
      blocker: 'connects.github.connect_provider',
    });
    expect(payload.walletBtdPaneState.signerPosture.requiredAction).toBe('connect_wallet');
    expect(blockerIds).toEqual(expect.arrayContaining([
      'profile.missing',
      'profile.identity_missing',
      'connects.github.connect_provider',
      'wallet.binding_missing',
    ]));
    expect(blockerIds).not.toEqual(expect.arrayContaining([
      'preferences.model_missing',
      'preferences.templates_missing',
    ]));
    expect(payload.auxillariesContract.contractRoot).toMatch(/^[0-9a-f]{64}$/);
  });

  it('normalizes pane aliases and redacts known secret or protected-source keys', () => {
    const safe = toAuxillariesJsonSafe({
      access_token: 'secret-token',
      privatePrompt: 'reasoning prompt',
      protectedSource: 'asset pack source',
      repositoryInventorySource: 'stored_repository_inventory',
    }) as Record<string, unknown>;

    expect(normalizeAuxillaryPane('connects')).toBe('externals');
    expect(normalizeAuxillaryPane('btd')).toBe('wallet');
    expect(safe.access_token).toBe('[redacted]');
    expect(safe.privatePrompt).toBe('[protected-source-redacted]');
    expect(safe.protectedSource).toBe('[protected-source-redacted]');
    expect(safe.repositoryInventorySource).toBe('stored_repository_inventory');
    expect(() => assertAuxillariesJsonSafe(safe)).not.toThrow();
  });

  it('parses contract snapshots and rejects malformed route contract objects', () => {
    const recoveryRun = buildAuxillariesRecoveryRun({
      targetPane: 'externals',
      repairAction: 'reauthorize_provider',
      blockerId: 'connects.github.reauthorize_provider',
      beforeReadinessRoot: 'before-root',
      afterReadinessRoot: 'after-root',
      executionId: 'execution-1',
      outcome: 'succeeded',
      retryPolicy: 'after_repair',
      startedAt: '2026-05-21T00:00:00.000Z',
      completedAt: '2026-05-21T00:01:00.000Z',
    });
    const payload = buildAuxillaryDataPayload({
      profile: { id: 'user-2', username: 'reviewer' },
      githubConnection: { provider: 'github' },
      walletConnectionStatus: null,
      repositoryConnectionStatus: { connected: false, valid: false, provider: 'github' },
      repositories: [],
      repositoryInventorySource: null,
      btdBalance: 0,
      btcFeeBalance: null,
      recentBtdAssetPacks: [],
      modelPreferences: null,
      recoveryRuns: [recoveryRun],
      onboardedSteps: ['profile'],
    });
    const snapshot = payload.auxillariesContract;

    expect(parseAuxillariesContractSnapshot(snapshot).recoveryRuns[0].recoveryRoot)
      .toMatch(/^[0-9a-f]{64}$/);
    expect(snapshot.recoveryRuns[0]).toMatchObject({
      blockerId: 'connects.github.reauthorize_provider',
      retryPolicy: 'after_repair',
      sourceSafetyClass: 'source_safe',
    });
    expect(snapshot.recoveryRuns[0].evidenceRoot).toMatch(/^[0-9a-f]{64}$/);
    expect(snapshot.recoveryRuns[0].telemetryRoot).toMatch(/^[0-9a-f]{64}$/);
    expect(snapshot.telemetryProofHooks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: 'recovery_run',
          subjectId: 'execution-1',
          pane: 'externals',
          theoremId: 'auxillaries.recovery_run.execution_evidence',
          evidenceRoot: recoveryRun.evidenceRoot,
          telemetryRoot: recoveryRun.telemetryRoot,
          blockerId: 'connects.github.reauthorize_provider',
          repairOutcome: 'succeeded',
          sourceSafetyClass: 'source_safe',
        }),
      ]),
    );
    expect(validateAuxillariesContractSnapshot({
      ...snapshot,
      telemetryProofHooks: [
        {
          ...snapshot.telemetryProofHooks[0],
          subject: 'unknown_subject',
        },
      ],
    })).toMatchObject({
      valid: false,
      errors: expect.arrayContaining(['telemetryProofHooks[0].subject is invalid']),
    });
    expect(validateAuxillariesContractSnapshot({
      ...snapshot,
      recoveryRuns: [
        {
          ...snapshot.recoveryRuns[0],
          outcome: 'unknown_outcome',
        },
      ],
    })).toMatchObject({
      valid: false,
      errors: expect.arrayContaining(['recoveryRuns[0].outcome is invalid']),
    });
    expect(JSON.stringify(snapshot.recoveryRuns)).not.toContain('access_token');
    expect(JSON.stringify(snapshot.recoveryRuns)).not.toContain('oauth_token');
    expect(validateAuxillariesContractSnapshot({ kind: 'wrong' })).toMatchObject({
      valid: false,
    });
    expect(() => parseAuxillariesContractSnapshot({ kind: 'wrong' })).toThrow(
      /Invalid Auxillaries contract snapshot/,
    );
  });
});
