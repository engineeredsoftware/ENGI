import { describe, expect, it, jest } from '@jest/globals';

jest.mock('../../pipeline-execution/adapter', () => ({
  buildPipelineInputContext: jest.fn(),
  queuePipelineJob: jest.fn(),
  monitorPipelineExecution: jest.fn(),
  cancelPipelineExecution: jest.fn(),
  getPipelineMetrics: jest.fn(),
}));

import {
  getBtdMcpToolContract,
  buildBtdMcpToolContractRegistry,
} from '@bitcode/btd';
import { registerPipelineTools } from '../../tools/pipeline-tools.ts';
import { AssetPackPipelineToolSchema } from '../../types';

describe('MCP API tool registry contracts', () => {
  it('discovers the AssetPack create tool from the package-owned BTD contract', () => {
    const contract = getBtdMcpToolContract('bitcode://pipelines/asset-pack/create');
    const tool = registerPipelineTools().find((candidate) => candidate.name === contract.toolId);

    expect(tool).toBeDefined();
    expect(tool?.name).toBe(contract.toolId);
    expect(tool?.description).toBe(contract.description);
    expect(contract.authPolicyId).toBe('interface.authorization.pipeline-permission');
    expect(contract.requiredPermissions).toEqual(['pipelines.create']);
  });

  it('keeps MCP tool input schemas aligned to the package-owned contract fields', () => {
    const contract = getBtdMcpToolContract('bitcode://pipelines/asset-pack/create');
    const parsed = AssetPackPipelineToolSchema.safeParse({
      task: 'Create a settlement-ready AssetPack preview and delivery plan',
      repository: {
        owner: 'bitcode-labs',
        name: 'terminal',
        provider: 'github',
      },
      connections: [
        {
          kind: 'repository_connection',
          provider: 'github',
          owner: 'bitcode-labs',
          name: 'terminal',
        },
      ],
      subtype: 'pull_request',
      streaming: true,
    });

    expect(parsed.success).toBe(true);
    expect(contract.inputSchemaId).toBe('bitcode.mcp.assetPackCreate.input.v1');
    expect(contract.requestRootFields).toEqual(
      expect.arrayContaining(['task', 'repository', 'connections', 'subtype', 'streaming']),
    );
  });

  it('rejects invalid MCP tool input before execution and maps that to schema-validation denial posture', () => {
    const contract = getBtdMcpToolContract('bitcode://pipelines/asset-pack/create');
    const parsed = AssetPackPipelineToolSchema.safeParse({
      task: 'too short',
      repository: {
        owner: 'bitcode-labs',
        name: 'terminal',
        provider: 'github',
      },
      subtype: 'pull_request',
    });

    expect(parsed.success).toBe(false);
    expect(contract.deniedStates.map((state) => state.code)).toContain('SCHEMA_VALIDATION_FAILED');
  });

  it('declares source-safe output fields and proof roots for MCP responses', () => {
    const registry = buildBtdMcpToolContractRegistry();
    const [contract] = registry.tools;

    expect(registry.sourceSafety.protectedSourceVisible).toBe(false);
    expect(contract.sourceSafetyClass).toBe('protected-source-locked');
    expect(contract.protectedSourcePolicy).toBe('source-safe-preview-and-metadata-before-settlement');
    expect(contract.responseRootFields).toEqual(
      expect.arrayContaining(['runId', 'assetPackEvidenceId', 'writeAdmission', 'outputMeaning']),
    );
    expect(contract.proofRootFields).toEqual(
      expect.arrayContaining(['toolId', 'inputSchemaId', 'outputSchemaId', 'requestRoot', 'responseRoot']),
    );
  });
});
