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

    expect(serialized).toContain('DataPack');
    expect(serialized).toMatch(/BTD.*(volume|rights)/i);
    expect(serialized).toMatch(/BTC settlement/i);
    expect(serialized).toMatch(/proof readback/i);
    expect(serialized).toContain('/deposits');
    expect(serialized).toContain('/reads');
    expect(serialized).toContain('/exchange');
    expect(serialized).toMatch(/exchange.*compatibility|\/exchange.*\/exchange/i);
    expect(serialized).not.toContain(['Source Shares', 'and the Bitcode Exchange'].join(' '));
    expect(serialized).not.toContain(['Map the V26', 'Protocol canon'].join(' '));
    expect(serialized).not.toContain(['V26', 'coverage'].join(' '));
  });

  it('publishes the active protocol article through current claim-boundary vocabulary', () => {
    const page = getBitcodeDocsPage('protocol');
    const serialized = JSON.stringify(page);

    expect(page?.title).toBe('Map the active Protocol canon');
    expect(serialized).toMatch(/V48/);
    expect(serialized).toMatch(/draft-target|public docs teach|do not legislate/i);
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
        'bitcode://measure',
        'bitcode://synthesize-asset-packs-for-deposit',
        'bitcode://synthesize-asset-packs-for-reads',
        'bitcode://exchange',
        'bitcode://auxiliary-profile',
        'bitcode://auxiliary-wallet',
        'bitcode://auxiliary-interfaces',
        'bitcode://auxiliary-externals',
      ]),
    );
    expect(
      features.find((feature) => feature.name === 'bitcode://synthesize-asset-packs-for-deposit')
        ?.outputs.join(' '),
    ).toContain('writeAdmission');
    expect(
      features.find((feature) => feature.name === 'bitcode://synthesize-asset-packs-for-reads')
        ?.outputs.join(' '),
    ).toContain('writeAdmission');
    expect(features.every((feature) => feature.inputs.length > 0 && feature.outputs.length > 0)).toBe(true);
  });
});
