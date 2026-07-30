import { getBitcodeTools, type BitcodeToolExecutionResult } from '../tools';

const listCommitsMock = jest.fn();

jest.mock('@bitcode/generic-vcs-github', () => ({
  GitHubProvider: jest.fn().mockImplementation(() => ({
    listCommits: listCommitsMock,
    createRepository: jest.fn()
  }))
}));

jest.mock('@bitcode/generic-tools-simple-system-text-search', () => ({
  simpleSystemTextSearch: { execute: jest.fn() },
}));

jest.mock('@bitcode/generic-tools-web-search', () => ({
  search: { execute: jest.fn() },
}));

const simpleSystemTextSearchExecute =
  (jest.requireMock('@bitcode/generic-tools-simple-system-text-search').simpleSystemTextSearch.execute as jest.Mock);
const webSearchExecute =
  (jest.requireMock('@bitcode/generic-tools-web-search').search.execute as jest.Mock);
const READ_ACCESS = {
  assetPackId: 'asset-pack-yapper',
  walletId: 'wallet-yapper-reader',
  decision: 'licensed_read',
  accessPolicyHash: 'policy-hash-yapper',
  reason: 'wallet_has_valid_policy_matching_license',
} as const;
const ORGANIZATION_AUTHORITY = {
  organizationId: 'org-yapper',
  organizationRole: 'member',
  organizationPermissionGrants: ['asset_pack:deliver'],
  walletId: 'wallet-yapper-reader',
  settlementState: 'settled',
} as const;

describe('Yapper demo flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listCommitsMock.mockResolvedValue([
      {
        sha: '1111111',
        message: 'Bootstrap Yapper timeline',
        author: { name: 'Bitcode' },
        url: 'https://github.com/engineeredsoftware/yapper/commit/1111111'
      },
      {
        sha: '2222222',
        message: 'Wire optimistic composer',
        author: { name: 'Builder' },
        url: 'https://github.com/engineeredsoftware/yapper/commit/2222222'
      }
    ]);
    simpleSystemTextSearchExecute.mockResolvedValue([
      { file: 'apps/chatgpt/src/tools.ts', line: 10, text: 'const yapper = true;' },
    ]);
    webSearchExecute.mockResolvedValue({
      results: [
        { title: 'Voice-first best practices', url: 'https://example.com/voice', summary: 'Summary of patterns.' },
      ],
    });
  });

  const tools = getBitcodeTools();
  const runTool = async <TResult extends BitcodeToolExecutionResult = BitcodeToolExecutionResult>(
    name: string,
    args: Record<string, unknown>
  ): Promise<TResult> => {
    const tool = tools.find((t) => t.name === name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return (await tool.execute(args as any)) as TResult;
  };

  it('walks through the Yapper demo script end-to-end', async () => {
    // Step 0: Depict the design reference so we can narrate pixels in the video
    const depiction = await runTool<{ depiction: string; metadata: { bytes: number } }>('depict_design_asset', {
      assetData: 'data:image/png;base64,aGVsbG8=',
      focus: 'Timeline layout',
      notes: 'Call out optimistic send button + waveform.'
    });
    expect(depiction.depiction).toContain('Timeline layout');
    expect(depiction.metadata.bytes).toBeGreaterThan(0);

    // Step 1: PRODUCT.md scaffold (template baseline; digester removed)
    const designScaffold = await runTool<{
      latest_design: string;
    }>('design_code', {
      ideas: 'Initial Yapper vision.',
      regenerateFromDigest: true,
    });
    expect(designScaffold.latest_design).toContain("# PRODUCT'S PURPOSE:");
    expect(designScaffold.latest_design).toContain('- Initial Yapper vision.');
    expect((designScaffold.latest_design.match(/### Proposed Updates/g) ?? []).length).toBe(1);

    // Step 2: Capture new idea without regenerating baseline
    const designUpdate = await runTool<{
      latest_design: string;
    }>('design_code', {
      ideas: 'Add optimistic UI for sending yaps.',
      currentProductMd: designScaffold.latest_design,
    });
    expect(designUpdate.latest_design).toContain('Add optimistic UI for sending yaps.');
    expect(designUpdate.latest_design).toContain('- Initial Yapper vision.');
    expect((designUpdate.latest_design.match(/### Proposed Updates/g) ?? []).length).toBe(1);

    // Step 3: Plan implementation steps
    const plan = await runTool<{
      update: string;
      metadata: { fileCount?: number };
    }>('code_design', {
      update: 'Implement optimistic UI for Yapper timeline.',
      latest_design: designUpdate.latest_design,
      files: [
        { path: 'src/components/Timeline.tsx', intent: 'Render provisional yap entries.' },
        { path: 'src/hooks/useOptimisticYaps.ts', intent: 'Maintain optimistic state.' },
      ],
    });
    expect(plan.update).toContain('### Implementation Actions');
    expect(plan.metadata.fileCount).toBe(2);

    // Step 4: Review repository motion directly inside ChatGPT
    const codeChanges = await runTool<{
      changes: string;
      metadata: { commitCount: number; urlSamples: string[] };
    }>('read_code_changes_from_vcs', {
      accessToken: 'ghp_mock',
      owner: 'bitcode-labs',
      repo: 'yapper',
      limit: 2
    });
    expect(codeChanges.metadata.commitCount).toBe(2);
    expect(codeChanges.changes).toContain('Bootstrap Yapper timeline');
    expect(listCommitsMock).toHaveBeenCalledWith(
      expect.any(Object),
      'bitcode-labs',
      'yapper',
      expect.objectContaining({ perPage: 2 })
    );

    // Step 5: Run repository search for context
    const search = await runTool<{ answer: string }>('answer_codebase_query', { query: 'yapper' });
    expect(search.answer).toContain('apps/chatgpt/src/tools.ts:11');

    // Step 6: Run Web search
    const web = await runTool<{ answer: string }>('answer_codeweb_query', { query: 'voice-first optimistic ui' });
    expect(web.answer).toContain('Voice-first best practices');

    // Step 7: Vercel status check
    const vercelStatus = await runTool<{ answer: { deployments: unknown[] } }>('use_vercel_read_external_mcp', {
      request: 'list_deployments',
      payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode' },
    });
    expect((vercelStatus.answer as any).deployments).toBeInstanceOf(Array);

    // Step 8: AWS health check
    const awsHealth = await runTool<{ metadata: { guidance: string } }>('use_aws_read_external_mcp', {
      request: 'lambda.invoke',
      payload: { functionName: 'yap-transcribe-demo' },
    });
    expect(awsHealth.metadata.guidance).toContain('Invoked the Lambda');

    // Step 9: Store configuration in S3
    const awsWrite = await runTool<{ metadata: { guidance: string; writeAdmission: Record<string, unknown> } }>('use_aws_write_external_mcp', {
      request: 's3.putObject',
      confirmed: true,
      readAccess: READ_ACCESS,
      organizationAuthority: ORGANIZATION_AUTHORITY,
      payload: { bucket: 'bitcode-yapper', key: 'config/demo.json', body: '{}' },
    });
    expect(awsWrite.metadata.guidance).toContain('Uploaded to S3');
    expect(awsWrite.metadata.writeAdmission).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      connectedInterface: 'aws',
      operation: 's3.putObject',
    });

    // Step 10: Kick off a preview deploy
    const vercelDeploy = await runTool<{ result: { readyState: string }; metadata: { writeAdmission: Record<string, unknown> } }>('use_vercel_write_external_mcp', {
      request: 'deploy_to_vercel',
      confirmed: true,
      readAccess: READ_ACCESS,
      organizationAuthority: ORGANIZATION_AUTHORITY,
      payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Preview deploy after optimistic UI work.' },
    });
    expect((vercelDeploy.result as any).readyState).toBe('BUILDING');
    expect(vercelDeploy.metadata.writeAdmission).toMatchObject({
      interfaceSurface: 'chatgpt_app',
      connectedInterface: 'vercel',
      operation: 'deploy_to_vercel',
    });

    // Step 11: Capture agent learnings (template baseline; digester removed)
    const agentsUpdate = await runTool<{
      latestBehavior: string;
    }>('improve_developing_behavior', {
      behaviorImprovement: 'Always cite file paths with numbers when summarising code.',
      regenerateFromDigest: true,
    });
    expect(agentsUpdate.latestBehavior).toContain("# AGENTS' INSTRUCTIONS:");
    expect(agentsUpdate.latestBehavior).toContain('Always cite file paths');
  });
});
