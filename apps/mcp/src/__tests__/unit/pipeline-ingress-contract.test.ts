import { describe, expect, it, jest, beforeEach } from '@jest/globals';

jest.mock('../../pipeline-execution/adapter', () => {
  const asRecord = (value: unknown): Record<string, any> | null =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, any>)
      : null;

  const sameConnection = (left: Record<string, any>, right: Record<string, any>) =>
    left.kind === right.kind &&
    left.provider === right.provider &&
    left.connectionId === right.connectionId &&
    left.owner === right.owner &&
    left.name === right.name &&
    left.branch === right.branch &&
    left.path === right.path;

  return {
    buildPipelineInputContext: jest.fn((ingress: string, config: Record<string, any>) => {
      const repository = asRecord(config.repository);
      const attachments = Array.isArray(config.attachments) ? config.attachments : [];
      const explicitConnections = Array.isArray(config.connections)
        ? config.connections.filter((connection: unknown) => {
            const record = asRecord(connection);
            return record?.kind === 'repository_connection' && typeof record?.provider === 'string';
          })
        : [];
      const repositoryConnection = repository
        ? [{
            kind: 'repository_connection',
            provider: repository.provider || 'github',
            connectionId: repository.connectionId,
            owner: repository.owner,
            name: repository.name,
            branch: repository.branch,
            path: repository.path,
          }]
        : [];
      const connections = [...explicitConnections];

      for (const connection of repositoryConnection) {
        if (!connections.some((existing) => sameConnection(existing, connection))) {
          connections.push(connection);
        }
      }

      return {
        ingress,
        repository: repository || undefined,
        attachments,
        connections,
        mcpConfig: asRecord(config.mcpConfig) || {},
      };
    }),
    queuePipelineJob: jest.fn(),
    monitorPipelineExecution: jest.fn(),
    cancelPipelineExecution: jest.fn(),
    getPipelineMetrics: jest.fn(),
  };
});

import { registerPipelineTools } from '../../tools/pipeline-tools.ts';
import {
  AssetPackPipelineToolSchema,
  type MCPAuthContext,
} from '../../types';
import {
  buildBtdAssetPackRightsInterfaceContract,
  buildBtdApiSchemaCompatibilityMatrix,
  buildBtdInterfaceAuthorizationPolicy,
  buildBtdInterfaceConsumerUxRegressionProof,
  buildBtdInterfaceTelemetryProofHookRegistry,
  buildBtdReadLicenseInterfaceContract,
  getBtdApiSchemaCompatibilityRow,
  getBtdInterfaceConsumerUxRegressionRow,
  getBtdInterfaceAuthorizationPolicyFixture,
  getBtdInterfaceTelemetryProofHook,
  getBtdReadLicenseAssetPackRightsInterfaceFixture,
} from '@bitcode/btd';
import {
  buildPipelineInputContext,
  queuePipelineJob,
  monitorPipelineExecution,
} from '../../pipeline-execution/adapter';
import { buildReadingInterfaceProductParity } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/reading-interface-product-parity';

const mockedQueuePipelineJob = jest.mocked(queuePipelineJob);
const mockedMonitorPipelineExecution = jest.mocked(monitorPipelineExecution);

const AUTH_CONTEXT: MCPAuthContext = {
  userId: 'user-1',
  organizationId: 'org-1',
  organizationRole: 'member',
  apiKeyId: 'api-key-1',
  scopes: ['reading:request_finding_fits'],
  permissions: {
    pipelines: { create: true, read: true, cancel: true, retry: true },
    organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
    resources: { read: true, export: true },
  },
  btdBalance: 1000,
  mcpCredentials: {},
};

const AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL: MCPAuthContext = {
  ...AUTH_CONTEXT,
  mcpCredentials: {
    github: { token: 'github-token' },
  },
};

const AUTH_CONTEXT_WITHOUT_PIPELINE_CREATE: MCPAuthContext = {
  ...AUTH_CONTEXT,
  permissions: {
    ...AUTH_CONTEXT.permissions,
    pipelines: {
      ...AUTH_CONTEXT.permissions.pipelines,
      create: false,
    },
  },
};

describe('Bitcode MCP pipeline ingress contract', () => {
  beforeEach(() => {
    mockedQueuePipelineJob.mockReset();
    mockedMonitorPipelineExecution.mockReset();
  });

  it('admits explicit repository/provider connections as ingress input', () => {
    const parsed = AssetPackPipelineToolSchema.safeParse({
      task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
      repository: {
        owner: 'bitcode-labs',
        name: 'product',
        provider: 'github',
      },
      attachments: [
        {
          type: 'figma',
          content: 'https://www.figma.com/file/ABC123/Design-System',
        },
      ],
      connections: [
        {
          kind: 'repository_connection',
          provider: 'github',
          connectionId: 42,
          owner: 'bitcode-labs',
          name: 'product',
          branch: 'main',
        },
      ],
      subtype: 'pull_request',
      streaming: true,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    expect(parsed.data.connections).toHaveLength(1);
    expect(parsed.data.connections[0]).toMatchObject({
      kind: 'repository_connection',
      provider: 'github',
      connectionId: 42,
    });
  });

  it('shares the package-owned InterfaceAuthorizationPolicy fixture for MCP Finding Fits admission', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('mcp-finding-fits-allowed');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(fixture.fixturePath).toBe(
      'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    );
    expect(policy).toMatchObject({
      interfaceSurface: 'mcp',
      action: 'request_finding_fits',
      decision: 'allowed',
      actor: {
        organizationId: 'org-mcp-1',
        teamId: 'team-mcp-reading',
        organizationRole: 'member',
      },
      sourceVisibility: 'source_safe_preview',
    });
  });

  it('shares the package-owned ReadLicense and AssetPackRights fixture for MCP Finding Fits preview', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture('mcp-finding-fits-source-safe-preview');
    const readLicense = buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
    const rights = buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);

    expect(fixture.fixturePath).toBe(
      'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    );
    expect(readLicense).toMatchObject({
      interfaceSurface: 'mcp',
      action: 'request_finding_fits',
      decision: 'source_safe_preview_admitted',
      protectedSourceVisible: false,
    });
    expect(rights).toMatchObject({
      interfaceSurface: 'mcp',
      decision: 'preview_admitted',
      rightsPosture: 'preview_only_locked',
      protectedSourceVisible: false,
    });
  });

  it('shares the package-owned API schema compatibility matrix for MCP tool calls', () => {
    const matrix = buildBtdApiSchemaCompatibilityMatrix();
    const row = getBtdApiSchemaCompatibilityRow('mcp-api-asset-pack-create-success');

    expect(matrix.observedConsumerSurfaces).toContain('mcp_api');
    expect(row).toMatchObject({
      consumerSurface: 'mcp_api',
      path: 'bitcode://synthesize-asset-packs-for-deposit',
      requestSchemaId: 'bitcode.mcp.assetPackCreate.input.v1',
      responseSchemaId: 'bitcode.mcp.assetPackCreate.output.v1',
      examplePosture: 'success',
      protectedSourceVisible: false,
    });
  });

  it('shares the package-owned InterfaceTelemetryProofHook for MCP pipeline replay', () => {
    const registry = buildBtdInterfaceTelemetryProofHookRegistry();
    const hook = getBtdInterfaceTelemetryProofHook('interface.telemetry.mcp-reading-tool');

    expect(registry.observedInterfaceIds).toContain('mcp_api');
    expect(hook).toMatchObject({
      interfaceId: 'mcp_api',
      actionId: 'mcp.reading.pipeline',
      posture: 'success',
      successSummary: 'mcp-reading-pipeline-queued-with-source-safe-roots',
    });
    expect(hook.roots.generatedProofRoot).toMatch(/^generated-proof-root:/);
    expect(hook.replayCommand).toContain('pipeline-ingress-contract.test.ts');
  });

  it('shares the package-owned InterfaceConsumerUxRegressionProof for MCP Finding Fits readability', () => {
    const proof = buildBtdInterfaceConsumerUxRegressionProof();
    const row = getBtdInterfaceConsumerUxRegressionRow('interface.consumer.mcp-finding-fits-readable');

    expect(proof.observedSurfaces).toContain('mcp_api');
    expect(row).toMatchObject({
      surface: 'mcp_api',
      consumerPath: 'bitcode://synthesize-asset-packs-for-deposit',
      posture: 'success_readable',
      visibilityBoundary: 'source_safe_preview',
      protectedSourceVisible: false,
      promptBodyVisible: false,
    });
    expect(row.actionLabel).toBe('Request Finding Fits');
    expect(row.proofRoots).toEqual(
      expect.arrayContaining(['execution-root:mcp-reading-pipeline']),
    );
    expect(row.repairSteps).toEqual(
      expect.arrayContaining(['replay-mcp-pipeline-ingress']),
    );
    expect(row.feeRightsPreview).toMatchObject({
      previewState: 'preview_admitted',
      rightsPosture: 'preview_only_locked',
    });
  });

  it('normalizes third-party MCP repository and attachment ingress as input context only', () => {
    const inputContext = buildPipelineInputContext('third_party_mcp', {
      repository: {
        owner: 'bitcode-labs',
        name: 'product',
        provider: 'github',
        branch: 'main',
      },
      attachments: [
        {
          type: 'url',
          content: 'https://linear.example.test/issue/BIT-26',
        },
      ],
      connections: [
        {
          kind: 'repository_connection',
          provider: 'github',
          connectionId: 42,
          owner: 'bitcode-labs',
          name: 'product',
          branch: 'main',
        },
      ],
    });

    expect(inputContext).toMatchObject({
      ingress: 'third_party_mcp',
      repository: {
        owner: 'bitcode-labs',
        name: 'product',
        provider: 'github',
      },
      attachments: [
        {
          type: 'url',
          content: 'https://linear.example.test/issue/BIT-26',
        },
      ],
    });
    expect(inputContext.connections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'repository_connection',
          provider: 'github',
          connectionId: 42,
        }),
      ]),
    );
    expect(inputContext).not.toHaveProperty('assetPacks');
    expect(inputContext).not.toHaveProperty('deliverables');
  });

  it('returns normalized ingress and output meaning for queued MCP writes', async () => {
    mockedQueuePipelineJob.mockResolvedValue({
      runId: 'run-1',
      assetPackEvidenceId: 'asset-pack-evidence-1',
    });

    const tool = registerPipelineTools().find(
      (candidate) => candidate.name === 'bitcode://synthesize-asset-packs-for-deposit',
    );

    expect(tool?.execute).toBeDefined();

    const result = await tool!.execute!(
      {
        task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
        repository: {
          owner: 'bitcode-labs',
          name: 'product',
          provider: 'github',
          branch: 'main',
        },
        attachments: [
          {
            type: 'document',
            content: 'https://docs.example.test/requirements',
          },
        ],
        connections: [
          {
            kind: 'repository_connection',
            provider: 'github',
            connectionId: 42,
            owner: 'bitcode-labs',
            name: 'product',
            branch: 'main',
          },
        ],
        subtype: 'pull_request',
        streaming: true,
      },
      AUTH_CONTEXT,
    );

    expect(result).toMatchObject({
      runId: 'run-1',
      assetPackEvidenceId: 'asset-pack-evidence-1',
      status: 'queued',
      interfaceSurface: 'bitcode_mcp',
      outputMeaning: 'asset_packs',
      writeAdmission: {
        admitted: true,
        interfaceSurface: 'bitcode_mcp',
        permission: 'pipelines.create',
        ingressBasis: 'matching_repository_connection',
        repositoryProvider: 'github',
        repositoryAnchor: 'github:bitcode-labs/product@main',
        attachmentCount: 1,
        connectionCount: 1,
        outputMeaning: 'asset_packs',
        interfaceAuthorizationPolicy: expect.objectContaining({
          decision: 'allowed',
          denialCodes: [],
          policyRoot: expect.stringMatching(/^btd-interface-auth:interface-authorization-policy:/),
        }),
      },
    });
    expect(result.inputContext).toMatchObject({
      ingress: 'bitcode_mcp',
      repository: {
        owner: 'bitcode-labs',
        name: 'product',
      },
    });
    expect(result.inputContext.attachments).toHaveLength(1);
    expect(result.inputContext.connections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'repository_connection',
          provider: 'github',
          connectionId: 42,
        }),
      ]),
    );
    expect(mockedQueuePipelineJob).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          interfaceSurface: 'bitcode_mcp',
          outputMeaning: 'asset_packs',
          writeAdmission: expect.objectContaining({
            admitted: true,
            ingressBasis: 'matching_repository_connection',
            repositoryAnchor: 'github:bitcode-labs/product@main',
          }),
        }),
      }),
    );
  });

  it('rejects MCP pipeline writes without pipelines.create permission', async () => {
    const tool = registerPipelineTools().find(
      (candidate) => candidate.name === 'bitcode://synthesize-asset-packs-for-deposit',
    );

    await expect(
      tool!.execute!(
        {
          task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
          repository: {
            owner: 'bitcode-labs',
            name: 'product',
            provider: 'github',
          },
          attachments: [],
          connections: [],
          subtype: 'pull_request',
          streaming: true,
        },
        AUTH_CONTEXT_WITHOUT_PIPELINE_CREATE,
      ),
    ).rejects.toThrow(
      'Bitcode MCP write admission requires pipelines.create permission before any pipeline job can be queued.',
    );
    expect(mockedQueuePipelineJob).not.toHaveBeenCalled();
  });

  it('rejects incoherent repository/provider ingress before queueing MCP work', async () => {
    const tool = registerPipelineTools().find(
      (candidate) => candidate.name === 'bitcode://synthesize-asset-packs-for-deposit',
    );

    await expect(
      tool!.execute!(
        {
          task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
          repository: {
            owner: 'bitcode-labs',
            name: 'product',
            provider: 'github',
          },
          attachments: [],
          connections: [
            {
              kind: 'repository_connection',
              provider: 'github',
              connectionId: 42,
              owner: 'bitcode-labs',
              name: 'different-repository',
              branch: 'main',
            },
          ],
          subtype: 'pull_request',
          streaming: true,
        },
        AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL,
      ),
    ).rejects.toThrow(
      'Bitcode MCP write admission rejected the repository/provider ingress because no supplied repository_connection matches the requested repository anchor.',
    );
    expect(mockedQueuePipelineJob).not.toHaveBeenCalled();
  });

  it('admits provider-authenticated repository ingress without explicit repository_connection', async () => {
    mockedQueuePipelineJob.mockResolvedValue({
      runId: 'run-credential',
      assetPackEvidenceId: 'asset-pack-evidence-credential',
    });

    const tool = registerPipelineTools().find(
      (candidate) => candidate.name === 'bitcode://synthesize-asset-packs-for-deposit',
    );

    const result = await tool!.execute!(
      {
        task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
        repository: {
          owner: 'bitcode-labs',
          name: 'product',
          provider: 'github',
        },
        attachments: [],
        connections: [],
        subtype: 'pull_request',
        streaming: true,
      },
      AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL,
    );

    expect(result).toMatchObject({
      runId: 'run-credential',
      assetPackEvidenceId: 'asset-pack-evidence-credential',
      status: 'queued',
      interfaceSurface: 'bitcode_mcp',
      outputMeaning: 'asset_packs',
      writeAdmission: {
        admitted: true,
        ingressBasis: 'provider_credential',
        repositoryProvider: 'github',
        repositoryAnchor: 'github:bitcode-labs/product',
        interfaceAuthorizationPolicy: expect.objectContaining({
          decision: 'allowed',
        }),
      },
    });
  });

  it('returns asset-pack-normalized results for completed MCP writes', async () => {
    mockedQueuePipelineJob.mockResolvedValue({
      runId: 'run-2',
      assetPackEvidenceId: 'asset-pack-evidence-2',
    });
    mockedMonitorPipelineExecution.mockResolvedValue({
      runId: 'run-2',
      status: 'completed',
      result: {
        assetPacks: [
          {
            type: 'pull_request',
            url: 'https://github.com/bitcode-labs/product/pull/1',
          },
        ],
      },
      measuredBtd: 120,
      startedAt: new Date('2026-04-22T00:00:00.000Z'),
      completedAt: new Date('2026-04-22T00:02:00.000Z'),
      events: [],
    });

    const tool = registerPipelineTools().find(
      (candidate) => candidate.name === 'bitcode://synthesize-asset-packs-for-deposit',
    );

    const result = await tool!.execute!(
      {
        task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
        repository: {
          owner: 'bitcode-labs',
          name: 'product',
          provider: 'github',
        },
        attachments: [],
        connections: [],
        subtype: 'pull_request',
        streaming: false,
      },
      AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL,
    );

    expect(result).toMatchObject({
      runId: 'run-2',
      status: 'completed',
      interfaceSurface: 'bitcode_mcp',
      outputMeaning: 'asset_packs',
      writeAdmission: {
        admitted: true,
        ingressBasis: 'provider_credential',
        repositoryProvider: 'github',
        repositoryAnchor: 'github:bitcode-labs/product',
        interfaceAuthorizationPolicy: expect.objectContaining({
          decision: 'allowed',
        }),
      },
    });
    expect(result.assetPacks).toEqual([
      expect.objectContaining({
        type: 'pull_request',
        url: 'https://github.com/bitcode-labs/product/pull/1',
      }),
    ]);
    expect(result).not.toHaveProperty('deliverables');
  });

  it('binds MCP Reading pipeline ingress to ReadingInterfaceProductParity no-bypass rules', () => {
    const parity = buildReadingInterfaceProductParity();
    const mcp = parity.rows.find((row) => row.surface === 'mcp_api');

    expect(mcp).toMatchObject({
      surface: 'mcp_api',
      authorityMode: 'product-delegated-handoff',
      entrypoint: 'mcp.reading.pipeline',
      sameAuthorityAsProduct: true,
      parallelAuthorityCreated: false,
      stageContract: {
        acceptedNeedRequired: true,
        findingFitsRequiresAcceptedNeed: true,
        sourceSafePreviewOnlyBeforeSettlement: true,
        settlementUnlockRequiredForSource: true,
        btdRightsRequiredForDelivery: true,
        sourceBearingDeliveryAllowedBeforeSettlement: false,
      },
      noBypassReadback: {
        findingFitsRequest: 'denied_without_accepted_need',
        deliveryBoundary: 'source_bearing_delivery_locked_until_settlement_and_rights',
      },
    });
    expect(mcp?.contractRoots.assetPackRightsContractRoot).toMatch(/^assetpack-rights-interface-contract:/);
    expect(parity.noBypassReadback.allSurfacesUseProductAuthority).toBe(true);
  });
});
