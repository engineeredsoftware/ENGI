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
  BTD_MCP_TOOL_CONTRACT_IDS,
} from '@bitcode/btd';
import { registerProductTools } from '../../tools/product-tools.ts';

describe('MCP API tool registry contracts', () => {
  it('registers exactly the eight product tools from package-owned BTD contracts', () => {
    const tools = registerProductTools();
    expect(tools).toHaveLength(8);
    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [...BTD_MCP_TOOL_CONTRACT_IDS].sort(),
    );

    for (const toolId of BTD_MCP_TOOL_CONTRACT_IDS) {
      const contract = getBtdMcpToolContract(toolId);
      const tool = tools.find((candidate) => candidate.name === contract.toolId);
      expect(tool).toBeDefined();
      expect(tool?.description).toBe(contract.description);
    }
  });

  it('keeps deposit synthesize schemas aligned to contract fields', () => {
    const contract = getBtdMcpToolContract('bitcode://synthesize-asset-packs-for-deposit');
    const tool = registerProductTools().find(
      (candidate) => candidate.name === contract.toolId,
    );
    const parsed = tool!.inputSchema.safeParse({
      repository: {
        owner: 'bitcode-labs',
        name: 'bitcode',
        provider: 'github',
      },
      obfuscations: '',
      streaming: true,
    });

    expect(parsed.success).toBe(true);
    expect(contract.inputSchemaId).toBe('bitcode.mcp.synthesizeAssetPacksForDeposit.input.v1');
    expect(contract.requestRootFields).toEqual(
      expect.arrayContaining(['repository', 'obfuscations']),
    );
  });

  it('rejects invalid read synthesize input before execution', () => {
    const contract = getBtdMcpToolContract('bitcode://synthesize-asset-packs-for-reads');
    const tool = registerProductTools().find(
      (candidate) => candidate.name === contract.toolId,
    );
    const parsed = tool!.inputSchema.safeParse({
      repository: {
        owner: 'bitcode-labs',
        name: 'bitcode',
        provider: 'github',
      },
      need: { prompt: 'too short' },
    });

    expect(parsed.success).toBe(false);
    expect(contract.deniedStates.map((state) => state.code)).toContain('SCHEMA_VALIDATION_FAILED');
  });

  it('declares source-safe output fields and proof roots for product MCP responses', () => {
    const registry = buildBtdMcpToolContractRegistry();
    const deposit = registry.tools.find(
      (tool) => tool.toolId === 'bitcode://synthesize-asset-packs-for-deposit',
    );
    const measure = registry.tools.find((tool) => tool.toolId === 'bitcode://measure');

    expect(registry.toolCount).toBe(8);
    expect(registry.sourceSafety.protectedSourceVisible).toBe(false);
    expect(deposit?.sourceSafetyClass).toBe('protected-source-locked');
    expect(deposit?.responseRootFields).toEqual(
      expect.arrayContaining(['runId', 'assetPackEvidenceId', 'writeAdmission', 'outputMeaning']),
    );
    expect(measure?.requiredPermissions).toEqual(['measure.read']);
    expect(measure?.sourceSafetyClass).toBe('source-safe-public');
  });
});
