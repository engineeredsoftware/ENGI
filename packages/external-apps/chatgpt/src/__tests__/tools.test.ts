import { getBitcodeTools, type BitcodeToolExecutionResult } from '../tools';
import { buildChatGptAppInterfaceIntegrationRecord } from '../interface-integration';
import {
  buildBtdInterfaceAuthorizationPolicy,
  getBtdInterfaceAuthorizationPolicyFixture,
} from '@bitcode/btd/interface-authorization-policy';
import {
  buildBtdAssetPackRightsInterfaceContract,
  buildBtdReadLicenseInterfaceContract,
  getBtdReadLicenseAssetPackRightsInterfaceFixture,
} from '@bitcode/btd/read-license-assetpack-rights-contract';
import {
  buildBtdApiSchemaCompatibilityMatrix,
  getBtdApiSchemaCompatibilityRow,
} from '@bitcode/btd/api-schema-compatibility-matrix';
import {
  buildBtdInterfaceTelemetryProofHookRegistry,
  getBtdInterfaceTelemetryProofHook,
} from '@bitcode/btd/interface-telemetry-proof-hook';
import {
  buildBtdInterfaceConsumerUxRegressionProof,
  getBtdInterfaceConsumerUxRegressionRow,
} from '@bitcode/btd/interface-consumer-ux-regression-proof';

jest.mock('@bitcode/generic-tools-simple-system-text-search', () => ({
  simpleSystemTextSearch: { execute: jest.fn() },
}));

jest.mock('@bitcode/generic-tools-web-search', () => ({
  search: { execute: jest.fn() },
}));

jest.mock('@bitcode/digest/run', () => ({
  generateDigest: jest.fn(),
}));

const simpleSystemTextSearchExecute =
  (jest.requireMock('@bitcode/generic-tools-simple-system-text-search').simpleSystemTextSearch.execute as jest.Mock);
const webSearchExecute =
  (jest.requireMock('@bitcode/generic-tools-web-search').search.execute as jest.Mock);
const generateDigestMock = (jest.requireMock('@bitcode/digest/run').generateDigest as jest.Mock);
const READ_ACCESS = {
  assetPackId: 'asset-pack-1',
  walletId: 'wallet-reader',
  decision: 'licensed_read',
  accessPolicyHash: 'policy-hash',
  reason: 'wallet_has_valid_policy_matching_license',
} as const;
const ORGANIZATION_AUTHORITY = {
  organizationId: 'org-1',
  organizationRole: 'member',
  organizationPermissionGrants: ['asset_pack:deliver'],
  walletId: 'wallet-reader',
  settlementState: 'settled',
} as const;

describe('ChatGPT App tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simpleSystemTextSearchExecute.mockResolvedValue([
      { file: 'src/index.ts', line: 0, text: 'export const handler = () => true;' },
    ]);
    webSearchExecute.mockResolvedValue({
      results: [
        { title: 'Optimistic UI Patterns', url: 'https://example.com/optimistic', summary: 'Summary.' },
      ],
    });
    generateDigestMock.mockResolvedValue({
      productDocument: `###### What is this document?

# PRODUCT'S PURPOSE:
This product delivers voice-first social conversations for builders.

# PRODUCT'S FEATURES:
## New or Planned Work
- Implement live waveform previews linked to \`src/components/Recorder.tsx\`.
## Existing Capabilities
- Users can record 30s clips via \`src/index.ts\`.
## Technical Foundations & Infrastructure
- Next.js frontend backed by Supabase.
## Defensive Programming & Reliability Focus
- Validate audio length and storage quotas.
## Complexity Hotspots / Areas to Watch
- Real-time transcription accuracy tuning.

# SOURCE FILES:
- \`README.md\` — README outlines the voice-first social product purpose and target builders.
- \`src/index.ts\` — Source implements the voice clip handler entry point.
- \`config/audio.json\` — Configuration describing audio ingestion defaults.`,
      agentDocument: `###### What is this document?

# AGENTS' INSTRUCTIONS:
- Confirm Supabase credentials before coding.
- Narrate file references with paths.

# AGENTS' SEEKING QUESTIONS:
- What gaps exist in transcription accuracy?
- Where can we simplify auth flows?`,
    });
  });

  const tools = getBitcodeTools();
  const findTool = (name: string) => {
    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return tool;
  };

  const runTool = async <TResult extends BitcodeToolExecutionResult = BitcodeToolExecutionResult>(
    name: string,
    args: Record<string, unknown>
  ): Promise<TResult> => {
    const tool = findTool(name);
    return (await tool.execute(args as any)) as TResult;
  };

  it('declares confirmation schema on every ChatGPT App connected-interface write carrier', () => {
    for (const name of ['write_code_changes_to_vcs', 'use_vercel_write_external_mcp', 'use_aws_write_external_mcp']) {
      const tool = findTool(name);
      expect(tool.meta?.requiresConfirmation).toBe(true);
      expect((tool.inputSchema as any).required).toContain('confirmed');
      expect((tool.inputSchema as any).required).toContain('readAccess');
      expect((tool.inputSchema as any).required).toContain('organizationAuthority');
      expect((tool.inputSchema as any).properties.confirmed).toMatchObject({
        type: 'boolean',
        const: true,
      });
      expect((tool.inputSchema as any).properties.readAccess).toMatchObject({
        type: 'object',
      });
      expect((tool.inputSchema as any).properties.organizationAuthority).toMatchObject({
        type: 'object',
      });
    }
  });

  it('declares the ChatGPT App interface integration record through the package-owned BTD contract', () => {
    expect(buildChatGptAppInterfaceIntegrationRecord()).toMatchObject({
      surface: 'chatgpt_app',
      packageExport: '@bitcode/btd/interface-integration-contract',
      packageOwned: true,
      routeLocalReimplementation: false,
      sourceSafeLowDetailIntact: true,
      transactionCockpitRegression: false,
      objectFamilies: expect.arrayContaining(['read_access', 'organization_authority']),
    });
  });

  it('shares the package-owned InterfaceAuthorizationPolicy fixture for ChatGPT App delivery', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('chatgpt-delivery-allowed');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(fixture.fixturePath).toBe('packages/chatgptapp/src/__tests__/tools.test.ts');
    expect(policy).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      action: 'deliver_asset_pack',
      decision: 'allowed',
      walletCapability: {
        state: 'verified',
        walletId: 'wallet-chatgpt-reader',
      },
      readLicense: {
        state: 'licensed_read',
      },
      assetPackRights: {
        state: 'licensed',
      },
    });
  });

  it('shares the package-owned ReadLicense and AssetPackRights fixture for unpaid ChatGPT App delivery denial', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture('chatgpt-unpaid-delivery-denied');
    const readLicense = buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
    const rights = buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);

    expect(fixture.fixturePath).toBe('packages/chatgptapp/src/__tests__/tools.test.ts');
    expect(readLicense).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      action: 'deliver_asset_pack',
      decision: 'locked_source_denied',
      protectedSourceVisible: false,
    });
    expect(rights).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      decision: 'rights_delivery_denied',
      denialCodes: expect.arrayContaining([
        'SETTLEMENT_REQUIRED',
        'RIGHTS_TRANSFER_REQUIRED',
        'LOCKED_SOURCE_UNPAID',
      ]),
      protectedSourceVisible: false,
    });
  });

  it('shares the package-owned API schema compatibility matrix for ChatGPT App blocked delivery', () => {
    const matrix = buildBtdApiSchemaCompatibilityMatrix();
    const row = getBtdApiSchemaCompatibilityRow('chatgpt-app-deliver-assetpack-blocked');

    expect(matrix.observedConsumerSurfaces).toContain('chatgpt_app');
    expect(row).toMatchObject({
      consumerSurface: 'chatgpt_app',
      path: 'chatgpt://actions/bitcode_deliver_asset_pack',
      compatibilityStatus: 'blocked_until_rights',
      examplePosture: 'blocked',
      protectedSourceVisible: false,
    });
  });

  it('shares the package-owned InterfaceTelemetryProofHook for ChatGPT App delivery blockers', () => {
    const registry = buildBtdInterfaceTelemetryProofHookRegistry();
    const hook = getBtdInterfaceTelemetryProofHook('interface.telemetry.chatgpt-reading-action');

    expect(registry.observedInterfaceIds).toContain('chatgpt_app');
    expect(hook).toMatchObject({
      interfaceId: 'chatgpt_app',
      actionId: 'chatgpt.reading.action',
      posture: 'blocked',
      denialReason: 'reader-confirmation-or-paid-rights-missing',
    });
    expect(hook.replayCommand).toContain('tools.test.ts');
    expect(hook.sourceSafety.protectedSourceVisible).toBe(false);
  });

  it('shares the package-owned InterfaceConsumerUxRegressionProof for ChatGPT App blocked delivery', () => {
    const proof = buildBtdInterfaceConsumerUxRegressionProof();
    const row = getBtdInterfaceConsumerUxRegressionRow('interface.consumer.chatgpt-delivery-blocked');

    expect(proof.observedSurfaces).toContain('chatgpt_app');
    expect(row).toMatchObject({
      surface: 'chatgpt_app',
      consumerPath: 'chatgpt://actions/bitcode_deliver_asset_pack',
      posture: 'blocked_preview',
      denialCode: 'CONFIRMATION_OR_SETTLEMENT_REQUIRED',
      protectedSourceVisible: false,
      promptBodyVisible: false,
    });
    expect(row.sourceSafeSummary).toMatch(/settlement/i);
    expect(row.repairSteps).toEqual(
      expect.arrayContaining(['confirm-reader-action', 'settle-btc-fee-before-delivery']),
    );
    expect(row.feeRightsPreview).toMatchObject({
      previewState: 'blocked_until_rights',
      rightsPosture: 'settlement_pending',
    });
  });

  it('answer_codebase_query returns annotated matches', async () => {
    const result = await runTool<{ answer: string; metadata: { matchCount: number } }>('answer_codebase_query', {
      query: 'handler',
    });
    expect(result.answer).toContain('• src/index.ts:1');
    expect(result.metadata.matchCount).toBe(1);
  });

  it('answer_codeweb_query lists external references', async () => {
    const result = await runTool<{ answer: string; metadata: { total: number } }>('answer_codeweb_query', {
      query: 'optimistic ui',
    });
    expect(result.answer).toContain('Here’s a focused reading list');
    expect(result.metadata.total).toBe(1);
  });

  it('design_code appends updates without regenerating when baseline provided', async () => {
    const result = await runTool<{
      latest_design: string;
      metadata: { digestUsed?: boolean };
    }>('design_code', {
      ideas: 'Add optimistic UI to post composer.',
      currentProductMd: '# Existing PRODUCT.md',
    });
    expect(generateDigestMock).not.toHaveBeenCalled();
    expect(result.latest_design).toContain('# Existing PRODUCT.md');
    expect(result.latest_design).toContain('- Add optimistic UI to post composer.');
    const headings = result.latest_design.match(/### Proposed Updates/g) ?? [];
    expect(headings.length).toBe(1);
    expect(result.metadata.digestUsed).toBeFalsy();
  });

  it('design_code refreshes baseline via digest when requested', async () => {
    const result = await runTool<{
      latest_design: string;
      metadata: { digestUsed?: boolean };
    }>('design_code', {
      ideas: 'Document optimistic UI workflow.',
      regenerateFromDigest: true,
    });
    expect(generateDigestMock).toHaveBeenCalledTimes(1);
    expect(result.metadata.digestUsed).toBe(true);
    expect(result.latest_design).toContain('This product delivers voice-first social conversations for builders.');
    expect(result.latest_design).toContain('Document optimistic UI workflow.');
    const headings = result.latest_design.match(/### Proposed Updates/g) ?? [];
    expect(headings.length).toBe(1);
  });

  it('improve_developing_behavior refreshes baseline via digest when requested', async () => {
    const result = await runTool<{
      latestBehavior: string;
      metadata: { digestUsed?: boolean };
    }>('improve_developing_behavior', {
      behaviorImprovement: 'Always cite file paths with line numbers.',
      regenerateFromDigest: true,
    });
    expect(generateDigestMock).toHaveBeenCalled();
    expect(result.metadata.digestUsed).toBe(true);
    expect(result.latestBehavior).toContain('Confirm Supabase credentials before coding.');
    expect(result.latestBehavior).toContain('Always cite file paths');
  });

  it('use_vercel_read_external_mcp handles list_deployments', async () => {
    const result = await runTool<{ answer: { deployments: unknown[] }; metadata: { provider: string } }>(
      'use_vercel_read_external_mcp',
      {
        request: 'list_deployments',
        payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', limit: 2 },
      }
    );
    expect(result.metadata.provider).toBe('vercel');
    expect(Array.isArray((result.answer as any).deployments)).toBe(true);
  });

  it('use_vercel_write_external_mcp triggers deploy fixture after explicit write admission', async () => {
    const result = await runTool<{ result: { readyState: string }; metadata: { provider: string; writeAdmission: Record<string, unknown> } }>(
      'use_vercel_write_external_mcp',
      {
        request: 'deploy_to_vercel',
        confirmed: true,
        readAccess: READ_ACCESS,
        organizationAuthority: ORGANIZATION_AUTHORITY,
        payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' },
      }
    );
    expect(result.metadata.provider).toBe('vercel');
    expect(result.metadata.writeAdmission).toMatchObject({
      admitted: true,
      interfaceSurface: 'chatgpt_app',
      permission: 'explicit_user_confirmation',
      connectedInterface: 'vercel',
      operation: 'deploy_to_vercel',
      exchangeStateRole: 'connected_interface_delivery_mechanism',
      outputMeaning: 'asset_pack_delivery_mechanism',
      targetAnchor: 'vercel:team_bitcode/prj_Yapper',
      readAccess: READ_ACCESS,
      organizationAuthority: expect.objectContaining({
        decision: 'allowed',
        interfaceSurface: 'chatgpt_app',
        action: 'deliver_asset_pack',
        sourceVisibility: 'protected_source_allowed',
        interfaceAuthorizationPolicy: expect.objectContaining({
          decision: 'allowed',
          denialCodes: [],
          policyRoot: expect.stringMatching(/^btd-interface-auth:interface-authorization-policy:/),
        }),
      }),
    });
    expect((result.result as any).readyState).toBe('BUILDING');
  });

  it('write_code_changes_to_vcs creates GitHub repository after explicit write admission', async () => {
    const result = await runTool<{ result: { name: string; private: boolean }; metadata: { operation: string; writeAdmission: Record<string, unknown> } }>(
      'write_code_changes_to_vcs',
      {
        operation: 'createRepository',
        confirmed: true,
        readAccess: READ_ACCESS,
        organizationAuthority: ORGANIZATION_AUTHORITY,
        accessToken: 'ghp_mock',
        name: 'bitcode-yapper',
        description: 'Bitcode source-to-shares terminal companion fixture',
        private: true,
      }
    );
    expect(result.result).toMatchObject({
      name: 'bitcode-yapper',
      private: true,
    });
    expect(result.metadata.operation).toBe('createRepository');
    expect(result.metadata.writeAdmission).toMatchObject({
      admitted: true,
      interfaceSurface: 'chatgpt_app',
      permission: 'explicit_user_confirmation',
      connectedInterface: 'github',
      operation: 'createRepository',
      exchangeStateRole: 'connected_interface_delivery_mechanism',
      outputMeaning: 'asset_pack_delivery_mechanism',
      targetAnchor: 'github:bitcode-yapper',
      readAccess: READ_ACCESS,
      organizationAuthority: expect.objectContaining({
        decision: 'allowed',
        interfaceSurface: 'chatgpt_app',
        action: 'deliver_asset_pack',
        interfaceAuthorizationPolicy: expect.objectContaining({
          decision: 'allowed',
          policyRoot: expect.stringMatching(/^btd-interface-auth:interface-authorization-policy:/),
        }),
      }),
    });
  });

  it('write_code_changes_to_vcs rejects GitHub writes without explicit confirmation', async () => {
    await expect(
      runTool('write_code_changes_to_vcs', {
        operation: 'createRepository',
        accessToken: 'ghp_mock',
        name: 'bitcode-yapper',
      })
    ).rejects.toThrow(
      'Bitcode ChatGPT App write admission requires confirmed: true before connected-interface writes can execute.',
    );
  });

  it('rejects ChatGPT App connected-interface writes without explicit confirmation', async () => {
    await expect(
      runTool('use_vercel_write_external_mcp', {
        request: 'deploy_to_vercel',
        readAccess: READ_ACCESS,
        organizationAuthority: ORGANIZATION_AUTHORITY,
        payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' },
      })
    ).rejects.toThrow(
      'Bitcode ChatGPT App write admission requires confirmed: true before connected-interface writes can execute.',
    );
  });

  it('rejects ChatGPT App connected-interface writes without registry read access evidence', async () => {
    await expect(
      runTool('use_vercel_write_external_mcp', {
        request: 'deploy_to_vercel',
        confirmed: true,
        organizationAuthority: ORGANIZATION_AUTHORITY,
        payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' },
      })
    ).rejects.toThrow(/readAccess/);
  });

  it('rejects ChatGPT App connected-interface writes without organization authority evidence', async () => {
    await expect(
      runTool('use_vercel_write_external_mcp', {
        request: 'deploy_to_vercel',
        confirmed: true,
        readAccess: READ_ACCESS,
        payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' },
      })
    ).rejects.toThrow(/organizationAuthority/);
  });

  it('rejects ChatGPT App connected-interface writes when organization authority is unpaid', async () => {
    await expect(
      runTool('use_vercel_write_external_mcp', {
        request: 'deploy_to_vercel',
        confirmed: true,
        readAccess: READ_ACCESS,
        organizationAuthority: {
          ...ORGANIZATION_AUTHORITY,
          settlementState: 'pending',
        },
        payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' },
      })
    ).rejects.toThrow(/PROTECTED_SOURCE_DISCLOSURE_BLOCKED/);
  });

  it('use_aws_read_external_mcp invokes lambda helper', async () => {
    const result = await runTool<{ metadata: { provider: string; guidance: string } }>('use_aws_read_external_mcp', {
      request: 'lambda.invoke',
      payload: { functionName: 'handler' },
    });
    expect(result.metadata.provider).toBe('aws');
    expect(result.metadata.guidance).toContain('Invoked the Lambda');
  });

  it('use_aws_write_external_mcp uploads to S3 after explicit write admission', async () => {
    const result = await runTool<{ metadata: { provider: string; guidance: string; writeAdmission: Record<string, unknown> } }>('use_aws_write_external_mcp', {
      request: 's3.putObject',
      confirmed: true,
      readAccess: READ_ACCESS,
      organizationAuthority: ORGANIZATION_AUTHORITY,
      payload: { bucket: 'demo', key: 'config.json', body: '{}' },
    });
    expect(result.metadata.provider).toBe('aws');
    expect(result.metadata.guidance).toContain('Uploaded to S3');
    expect(result.metadata.writeAdmission).toMatchObject({
      admitted: true,
      interfaceSurface: 'chatgpt_app',
      permission: 'explicit_user_confirmation',
      connectedInterface: 'aws',
      operation: 's3.putObject',
      targetAnchor: 'aws:s3/demo/config.json',
      readAccess: READ_ACCESS,
      organizationAuthority: expect.objectContaining({
        decision: 'allowed',
        interfaceSurface: 'chatgpt_app',
        interfaceAuthorizationPolicy: expect.objectContaining({
          decision: 'allowed',
        }),
      }),
    });
  });

  it('design_code gracefully degrades when digest regeneration fails', async () => {
    generateDigestMock.mockRejectedValueOnce(new Error('digest offline'));
    const result = await runTool<{
      latest_design: string;
      metadata: { digestUsed?: boolean; digestError?: string };
    }>('design_code', {
      ideas: 'Add fallback messaging to onboarding flow.',
      regenerateFromDigest: true,
    });

    expect(result.metadata.digestUsed).toBe(false);
    expect(result.metadata.digestError).toBe('digest offline');
    expect(result.latest_design).toContain('### Proposed Updates');
    expect(result.latest_design).toContain('- Add fallback messaging to onboarding flow.');
    expect(result.latest_design).toContain('# PRODUCT\'S PURPOSE:\n\n[]');
    const headings = result.latest_design.match(/### Proposed Updates/g) ?? [];
    expect(headings.length).toBe(1);
  });

  it('improve_developing_behavior reports digest errors and uses template baseline', async () => {
    generateDigestMock.mockRejectedValueOnce(new Error('agents digest unavailable'));
    const result = await runTool<{
      latestBehavior: string;
      metadata: { digestUsed?: boolean; digestError?: string };
    }>('improve_developing_behavior', {
      behaviorImprovement: 'Record when successors read live narration.',
      regenerateFromDigest: true,
    });

    expect(result.metadata.digestUsed).toBe(false);
    expect(result.metadata.digestError).toBe('agents digest unavailable');
    expect(result.latestBehavior).toContain('### Behavior Improvement');
    expect(result.latestBehavior).toContain('Record when successors read live narration.');
    expect(result.latestBehavior).toContain('# AGENTS\' INSTRUCTIONS:\n\n- []');
  });
});
