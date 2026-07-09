import { getBitcodeDocsPage } from '@/app/docs/bitcode-docs-content';

describe('Bitcode docs content model', () => {
  it('keeps public docs aligned to current AssetPack, BTD, BTC, and route vocabulary', () => {
    const pages = [
      getBitcodeDocsPage('what-is-bitcode'),
      getBitcodeDocsPage('source-shares'),
      getBitcodeDocsPage('exchange'),
      getBitcodeDocsPage('settlement-btd'),
      getBitcodeDocsPage('commercial-interfaces'),
    ];
    const serialized = JSON.stringify(pages);

    expect(serialized).toContain('AssetPack');
    expect(serialized).toContain('BTD scalar volume and rights');
    expect(serialized).toContain('BTC settlement money');
    expect(serialized).toContain('proof readback authority');
    expect(serialized).toContain('/deposits');
    expect(serialized).toContain('/reads');
    expect(serialized).toContain('/packs');
    expect(serialized).toContain('/exchange is a compatibility redirect to /packs');
    expect(serialized).not.toContain(['Source Shares', 'and the Bitcode Exchange'].join(' '));
    expect(serialized).not.toContain(['Exchange is', 'the durable state'].join(' '));
    expect(serialized).not.toContain(['Map the V26', 'Protocol canon'].join(' '));
    expect(serialized).not.toContain(['V26', 'coverage'].join(' '));
    expect(serialized).not.toContain(['quote is', 'payment'].join(' '));
    expect(serialized).not.toContain(['payment observation is', 'finality'].join(' '));
    expect(serialized).not.toContain(['database is', 'ledger truth'].join(' '));
  });

  it('publishes the active protocol article through current claim-boundary vocabulary', () => {
    const page = getBitcodeDocsPage('protocol');
    const serialized = JSON.stringify(page);

    expect(page?.title).toBe('Map the active Protocol canon');
    expect(serialized).toContain('V45 is active canon while V46 is draft target');
    expect(serialized).toContain('Public docs are not protocol law');
    expect(serialized).toContain('V46 claim boundary');
  });

  it('documents ChatGPT App tools as API-style usage features', () => {
    const page = getBitcodeDocsPage('chatgpt-app');
    const features = page?.apiReference?.flatMap((section) => section.features) ?? [];

    expect(features.map((feature) => feature.name)).toEqual(
      expect.arrayContaining([
        'answer_codebase_query',
        'design_code',
        'write_code_changes_to_vcs',
        'use_vercel_write_external_mcp',
        'use_aws_write_external_mcp',
      ]),
    );
    expect(features.find((feature) => feature.name === 'write_code_changes_to_vcs')?.requiresConfirmation).toBe(true);
    expect(features.find((feature) => feature.name === 'design_code')?.inputs.join(' ')).toContain('ideas');
  });

  it('documents active Bitcode MCP server tools with inputs and expected outputs', () => {
    const page = getBitcodeDocsPage('mcp-api');
    const features = page?.apiReference?.flatMap((section) => section.features) ?? [];

    expect(features.map((feature) => feature.name)).toEqual(
      expect.arrayContaining([
        'tools/list',
        'tools/call',
        'bitcode://pipelines/asset-pack/create',
        'bitcode://analysis/repository/analyze',
        'bitcode://intelligence/multimodal/process',
        'bitcode://enterprise/webhook/orchestrate',
        'bitcode://lsp/workspace/intelligence',
        'bitcode://observability/logs/analytics',
      ]),
    );
    expect(features.find((feature) => feature.name === 'bitcode://pipelines/asset-pack/create')?.outputs.join(' ')).toContain('writeAdmission');
    expect(features.every((feature) => feature.inputs.length > 0 && feature.outputs.length > 0)).toBe(true);
  });
});
