import {
  BTD_MCP_TOOL_CONTRACT_IDS,
  BTD_MCP_TOOL_CONTRACT_REQUIRED_PROOF_ROOT_FIELDS,
  buildBtdMcpToolContract,
  buildBtdMcpToolContractInputs,
  buildBtdMcpToolContractRegistry,
  getBtdMcpToolContract,
} from '../src/mcp-tool-contract';

describe('MCP tool contract registry', () => {
  it('publishes exactly eight product MCP tool contracts', () => {
    const registry = buildBtdMcpToolContractRegistry();

    expect(registry.kind).toBe('btd.mcp_tool_contract_registry');
    expect(registry.schemaId).toBe('bitcode.mcpToolContractRegistry.v1');
    expect(registry.toolCount).toBe(8);
    expect(registry.missingToolIds).toEqual([]);
    expect(registry.observedToolIds).toHaveLength(8);
    expect(registry.observedToolIds).toEqual(
      expect.arrayContaining([...BTD_MCP_TOOL_CONTRACT_IDS]),
    );
    expect(registry.sourceSafety).toMatchObject({
      sourceSafe: true,
      protectedSourceVisible: false,
      containsSecret: false,
      containsProtectedSource: false,
    });

    expect(getBtdMcpToolContract('bitcode://measure').requiredPermissions).toEqual([
      'measure.read',
    ]);
    expect(
      getBtdMcpToolContract('bitcode://synthesize-asset-packs-for-deposit').requiredPermissions,
    ).toEqual(['pipelines.create']);
    expect(
      getBtdMcpToolContract('bitcode://synthesize-asset-packs-for-reads').requiredPermissions,
    ).toEqual(['pipelines.create']);
    expect(getBtdMcpToolContract('bitcode://packs').requiredPermissions).toEqual([
      'product.read',
    ]);
    expect(getBtdMcpToolContract('bitcode://auxiliary-profile').category).toBe('auxiliary');
    expect(getBtdMcpToolContract('bitcode://auxiliary-wallet').toolId).toBe(
      'bitcode://auxiliary-wallet',
    );
    expect(getBtdMcpToolContract('bitcode://auxiliary-interfaces').toolId).toBe(
      'bitcode://auxiliary-interfaces',
    );
    expect(getBtdMcpToolContract('bitcode://auxiliary-externals').toolId).toBe(
      'bitcode://auxiliary-externals',
    );
  });

  it('carries proof-root fields, request roots, response roots, denied states, and examples', () => {
    const contract = getBtdMcpToolContract('bitcode://synthesize-asset-packs-for-deposit');

    expect(contract.contractRoot).toMatch(/^btd-mcp-tool-contract:[a-f0-9]{24}$/);
    expect(contract.proofRootFields).toEqual(
      expect.arrayContaining([...BTD_MCP_TOOL_CONTRACT_REQUIRED_PROOF_ROOT_FIELDS]),
    );
    expect(contract.requestRootFields).toEqual(
      expect.arrayContaining(['repository', 'obfuscations']),
    );
    expect(contract.responseRootFields).toEqual(
      expect.arrayContaining(['runId', 'assetPackEvidenceId', 'writeAdmission', 'outputMeaning']),
    );
    expect(contract.deniedStates.map((state) => state.code)).toEqual(
      expect.arrayContaining([
        'MISSING_API_KEY',
        'INSUFFICIENT_PERMISSIONS',
        'SCHEMA_VALIDATION_FAILED',
        'RATE_LIMITED',
        'UNKNOWN_TOOL',
      ]),
    );
    expect(contract.examples.map((example) => example.posture)).toEqual(
      expect.arrayContaining(['success_queued', 'denied_auth', 'denied_permission']),
    );
  });

  it('fails closed when a required MCP tool id is missing', () => {
    expect(() => buildBtdMcpToolContractRegistry({ tools: [] })).toThrow(
      /missing tool ids: bitcode:\/\/measure/,
    );
  });

  it('fails closed when proof-root fields omit a required field', () => {
    const [input] = buildBtdMcpToolContractInputs();

    expect(() =>
      buildBtdMcpToolContract({
        ...input,
        proofRootFields: ['toolId'],
      }),
    ).toThrow(/missing proof-root fields/);
  });

  it('fails closed when pipelines.create is not required on write synthesize tools', () => {
    const input = buildBtdMcpToolContractInputs().find(
      (row) => row.toolId === 'bitcode://synthesize-asset-packs-for-deposit',
    )!;

    expect(() =>
      buildBtdMcpToolContract({
        ...input,
        requiredPermissions: ['pipelines.read'],
      }),
    ).toThrow(/must require pipelines\.create permission/);
  });

  it('fails closed when measure.read is not required on measure', () => {
    const input = buildBtdMcpToolContractInputs().find(
      (row) => row.toolId === 'bitcode://measure',
    )!;

    expect(() =>
      buildBtdMcpToolContract({
        ...input,
        requiredPermissions: ['pipelines.create'],
      }),
    ).toThrow(/must require measure\.read permission/);
  });

  it('fails closed on secret-shaped or protected-source contract text', () => {
    const [input] = buildBtdMcpToolContractInputs();

    expect(() =>
      buildBtdMcpToolContract({
        ...input,
        description: `${input.description} protected source dump`,
      }),
    ).toThrow(/source-safe|secret|protected/i);
  });
});
