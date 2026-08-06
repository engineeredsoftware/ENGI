"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
globals_1.jest.mock('../../pipeline-execution/adapter', () => {
    const asRecord = (value) => value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
    const sameConnection = (left, right) => left.kind === right.kind &&
        left.provider === right.provider &&
        left.connectionId === right.connectionId &&
        left.owner === right.owner &&
        left.name === right.name &&
        left.branch === right.branch &&
        left.path === right.path;
    return {
        buildPipelineInputContext: globals_1.jest.fn((ingress, config) => {
            const repository = asRecord(config.repository);
            const attachments = Array.isArray(config.attachments) ? config.attachments : [];
            const explicitConnections = Array.isArray(config.connections)
                ? config.connections.filter((connection) => {
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
                        path: repository.path
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
                mcpConfig: asRecord(config.mcpConfig) || {}
  };
        }),
        queuePipelineJob: globals_1.jest.fn(),
        monitorPipelineExecution: globals_1.jest.fn(),
        cancelPipelineExecution: globals_1.jest.fn(),
        getPipelineMetrics: globals_1.jest.fn()
  };
});
const pipeline_tools_ts_1 = require("../../tools/pipeline-tools.ts");
const types_1 = require("../../types");
const adapter_1 = require("../../pipeline-execution/adapter");
const mockedQueuePipelineJob = globals_1.jest.mocked(adapter_1.queuePipelineJob);
const mockedMonitorPipelineExecution = globals_1.jest.mocked(adapter_1.monitorPipelineExecution);
const AUTH_CONTEXT = {
    userId: 'user-1',
    organizationId: 'org-1',
    permissions: {
        pipelines: { create: true, read: true, cancel: true, retry: true },
        organization: { manageMembers: true, viewAnalytics: true, manageBtd: true },
        resources: { read: true, export: true }
  },
    btdBalance: 1000,
    mcpCredentials: {}
  };
const AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL = {
    ...AUTH_CONTEXT,
    mcpCredentials: {
        github: { token: 'github-token' }
  }
  };
const AUTH_CONTEXT_WITHOUT_PIPELINE_CREATE = {
    ...AUTH_CONTEXT,
    permissions: {
        ...AUTH_CONTEXT.permissions,
        pipelines: {
            ...AUTH_CONTEXT.permissions.pipelines,
            create: false
  }
  }
  };
(0, globals_1.describe)('Bitcode MCP pipeline ingress contract', () => {
    (0, globals_1.beforeEach)(() => {
        mockedQueuePipelineJob.mockReset();
        mockedMonitorPipelineExecution.mockReset();
    });
    (0, globals_1.it)('admits explicit repository/provider connections as ingress input', () => {
        const parsed = types_1.AssetPackPipelineToolSchema.safeParse({
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github'
  },
            attachments: [
                {
                    type: 'figma',
                    content: 'https://www.figma.com/file/ABC123/Design-System'
  },
            ],
            connections: [
                {
                    kind: 'repository_connection',
                    provider: 'github',
                    connectionId: 42,
                    owner: 'bitcode-labs',
                    name: 'application',
                    branch: 'main'
  },
            ],
            subtype: 'pull_request',
            streaming: true
  });
        (0, globals_1.expect)(parsed.success).toBe(true);
        if (!parsed.success) {
            return;
        }
        (0, globals_1.expect)(parsed.data.connections).toHaveLength(1);
        (0, globals_1.expect)(parsed.data.connections[0]).toMatchObject({
            kind: 'repository_connection',
            provider: 'github',
            connectionId: 42
  });
    });
    (0, globals_1.it)('normalizes third-party MCP repository and attachment ingress as input context only', () => {
        const inputContext = (0, adapter_1.buildPipelineInputContext)('third_party_mcp', {
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github',
                branch: 'main'
  },
            attachments: [
                {
                    type: 'url',
                    content: 'https://linear.example.test/issue/BIT-26'
  },
            ],
            connections: [
                {
                    kind: 'repository_connection',
                    provider: 'github',
                    connectionId: 42,
                    owner: 'bitcode-labs',
                    name: 'application',
                    branch: 'main'
  },
            ]
  });
        (0, globals_1.expect)(inputContext).toMatchObject({
            ingress: 'third_party_mcp',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github'
  },
            attachments: [
                {
                    type: 'url',
                    content: 'https://linear.example.test/issue/BIT-26'
  },
            ]
  });
        (0, globals_1.expect)(inputContext.connections).toEqual(globals_1.expect.arrayContaining([
            globals_1.expect.objectContaining({
                kind: 'repository_connection',
                provider: 'github',
                connectionId: 42
  }),
        ]));
        (0, globals_1.expect)(inputContext).not.toHaveProperty('assetPacks');
        (0, globals_1.expect)(inputContext).not.toHaveProperty('deliverables');
    });
    (0, globals_1.it)('returns normalized ingress and output meaning for queued MCP writes', async () => {
        mockedQueuePipelineJob.mockResolvedValue({
            runId: 'run-1',
            assetPackEvidenceId: 'asset-pack-evidence-1'
  });
        const tool = (0, pipeline_tools_ts_1.registerPipelineTools)().find((candidate) => candidate.name === 'bitcode://pipelines/asset-pack/create');
        (0, globals_1.expect)(tool?.execute).toBeDefined();
        const result = await tool.execute({
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github',
                branch: 'main'
  },
            attachments: [
                {
                    type: 'document',
                    content: 'https://docs.example.test/requirements'
  },
            ],
            connections: [
                {
                    kind: 'repository_connection',
                    provider: 'github',
                    connectionId: 42,
                    owner: 'bitcode-labs',
                    name: 'application',
                    branch: 'main'
  },
            ],
            subtype: 'pull_request',
            streaming: true
  }, AUTH_CONTEXT);
        (0, globals_1.expect)(result).toMatchObject({
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
                repositoryAnchor: 'github:bitcode-labs/application@main',
                attachmentCount: 1,
                connectionCount: 1,
                outputMeaning: 'asset_packs'
  }
  });
        (0, globals_1.expect)(result.inputContext).toMatchObject({
            ingress: 'bitcode_mcp',
            repository: {
                owner: 'bitcode-labs',
                name: 'application'
  }
  });
        (0, globals_1.expect)(result.inputContext.attachments).toHaveLength(1);
        (0, globals_1.expect)(result.inputContext.connections).toEqual(globals_1.expect.arrayContaining([
            globals_1.expect.objectContaining({
                kind: 'repository_connection',
                provider: 'github',
                connectionId: 42
  }),
        ]));
        (0, globals_1.expect)(mockedQueuePipelineJob).toHaveBeenCalledWith(globals_1.expect.objectContaining({
            metadata: globals_1.expect.objectContaining({
                interfaceSurface: 'bitcode_mcp',
                outputMeaning: 'asset_packs',
                writeAdmission: globals_1.expect.objectContaining({
                    admitted: true,
                    ingressBasis: 'matching_repository_connection',
                    repositoryAnchor: 'github:bitcode-labs/application@main'
  })
  })
  }));
    });
    (0, globals_1.it)('rejects MCP pipeline writes without pipelines.create permission', async () => {
        const tool = (0, pipeline_tools_ts_1.registerPipelineTools)().find((candidate) => candidate.name === 'bitcode://pipelines/asset-pack/create');
        await (0, globals_1.expect)(tool.execute({
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github'
  },
            attachments: [],
            connections: [],
            subtype: 'pull_request',
            streaming: true
  }, AUTH_CONTEXT_WITHOUT_PIPELINE_CREATE)).rejects.toThrow('Bitcode MCP write admission requires pipelines.create permission before any pipeline job can be queued.');
        (0, globals_1.expect)(mockedQueuePipelineJob).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('rejects incoherent repository/provider ingress before queueing MCP work', async () => {
        const tool = (0, pipeline_tools_ts_1.registerPipelineTools)().find((candidate) => candidate.name === 'bitcode://pipelines/asset-pack/create');
        await (0, globals_1.expect)(tool.execute({
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github'
  },
            attachments: [],
            connections: [
                {
                    kind: 'repository_connection',
                    provider: 'github',
                    connectionId: 42,
                    owner: 'bitcode-labs',
                    name: 'different-repository',
                    branch: 'main'
  },
            ],
            subtype: 'pull_request',
            streaming: true
  }, AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL)).rejects.toThrow('Bitcode MCP write admission rejected the repository/provider ingress because no supplied repository_connection matches the requested repository anchor.');
        (0, globals_1.expect)(mockedQueuePipelineJob).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('admits provider-authenticated repository ingress without explicit repository_connection', async () => {
        mockedQueuePipelineJob.mockResolvedValue({
            runId: 'run-credential',
            assetPackEvidenceId: 'asset-pack-evidence-credential'
  });
        const tool = (0, pipeline_tools_ts_1.registerPipelineTools)().find((candidate) => candidate.name === 'bitcode://pipelines/asset-pack/create');
        const result = await tool.execute({
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github'
  },
            attachments: [],
            connections: [],
            subtype: 'pull_request',
            streaming: true
  }, AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL);
        (0, globals_1.expect)(result).toMatchObject({
            runId: 'run-credential',
            assetPackEvidenceId: 'asset-pack-evidence-credential',
            status: 'queued',
            interfaceSurface: 'bitcode_mcp',
            outputMeaning: 'asset_packs',
            writeAdmission: {
                admitted: true,
                ingressBasis: 'provider_credential',
                repositoryProvider: 'github',
                repositoryAnchor: 'github:bitcode-labs/application'
  }
  });
    });
    (0, globals_1.it)('returns asset-pack-normalized results for completed MCP writes', async () => {
        mockedQueuePipelineJob.mockResolvedValue({
            runId: 'run-2',
            assetPackEvidenceId: 'asset-pack-evidence-2'
  });
        mockedMonitorPipelineExecution.mockResolvedValue({
            runId: 'run-2',
            status: 'completed',
            result: {
                assetPacks: [
                    {
                        type: 'pull_request',
                        url: 'https://github.com/bitcode-labs/application/pull/1'
  },
                ]
  },
            measuredBtd: 120,
            startedAt: new Date('2026-04-22T00:00:00.000Z'),
            completedAt: new Date('2026-04-22T00:02:00.000Z'),
            events: []
  });
        const tool = (0, pipeline_tools_ts_1.registerPipelineTools)().find((candidate) => candidate.name === 'bitcode://pipelines/asset-pack/create');
        const result = await tool.execute({
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: {
                owner: 'bitcode-labs',
                name: 'application',
                provider: 'github'
  },
            attachments: [],
            connections: [],
            subtype: 'pull_request',
            streaming: false
  }, AUTH_CONTEXT_WITH_GITHUB_CREDENTIAL);
        (0, globals_1.expect)(result).toMatchObject({
            runId: 'run-2',
            status: 'completed',
            interfaceSurface: 'bitcode_mcp',
            outputMeaning: 'asset_packs',
            writeAdmission: {
                admitted: true,
                ingressBasis: 'provider_credential',
                repositoryProvider: 'github',
                repositoryAnchor: 'github:bitcode-labs/application'
  }
  });
        (0, globals_1.expect)(result.assetPacks).toEqual([
            globals_1.expect.objectContaining({
                type: 'pull_request',
                url: 'https://github.com/bitcode-labs/application/pull/1'
  }),
        ]);
        (0, globals_1.expect)(result).not.toHaveProperty('deliverables');
    });
});
