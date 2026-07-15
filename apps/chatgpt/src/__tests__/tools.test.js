"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("../tools");
jest.mock('@bitcode/generic-tools-simple-system-text-search', () => ({
    simpleSystemTextSearch: { execute: jest.fn() }
  }));
jest.mock('@bitcode/generic-tools-web-search', () => ({
    search: { execute: jest.fn() }
  }));
jest.mock('@bitcode/digest/run', () => ({
    generateDigest: jest.fn()
  }));
const simpleSystemTextSearchExecute = jest.requireMock('@bitcode/generic-tools-simple-system-text-search').simpleSystemTextSearch.execute;
const webSearchExecute = jest.requireMock('@bitcode/generic-tools-web-search').search.execute;
const generateDigestMock = jest.requireMock('@bitcode/digest/run').generateDigest;
describe('ChatGPT App tools', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        simpleSystemTextSearchExecute.mockResolvedValue([
            { file: 'src/index.ts', line: 0, text: 'export const handler = () => true;' },
        ]);
        webSearchExecute.mockResolvedValue({
            results: [
                { title: 'Optimistic UI Patterns', url: 'https://example.com/optimistic', summary: 'Summary.' },
            ]
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
- Where can we simplify auth flows?`
  });
    });
    const tools = (0, tools_1.getBitcodeTools)();
    const findTool = (name) => {
        const tool = tools.find((t) => t.name === name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        return tool;
    };
    const runTool = async (name, args) => {
        const tool = findTool(name);
        return (await tool.execute(args));
    };
    it('declares confirmation schema on every ChatGPT App connected-interface write carrier', () => {
        for (const name of ['write_code_changes_to_vcs', 'use_vercel_write_external_mcp', 'use_aws_write_external_mcp']) {
            const tool = findTool(name);
            expect(tool.meta?.requiresConfirmation).toBe(true);
            expect(tool.inputSchema.required).toContain('confirmed');
            expect(tool.inputSchema.properties.confirmed).toMatchObject({
                type: 'boolean',
                const: true
  });
        }
    });
    it('answer_codebase_query returns annotated matches', async () => {
        const result = await runTool('answer_codebase_query', {
            query: 'handler'
  });
        expect(result.answer).toContain('• src/index.ts:1');
        expect(result.metadata.matchCount).toBe(1);
    });
    it('answer_codeweb_query lists external references', async () => {
        const result = await runTool('answer_codeweb_query', {
            query: 'optimistic ui'
  });
        expect(result.answer).toContain('Here’s a focused reading list');
        expect(result.metadata.total).toBe(1);
    });
    it('design_code appends updates without regenerating when baseline provided', async () => {
        const result = await runTool('design_code', {
            ideas: 'Add optimistic UI to post composer.',
            currentProductMd: '# Existing PRODUCT.md'
  });
        expect(generateDigestMock).not.toHaveBeenCalled();
        expect(result.latest_design).toContain('# Existing PRODUCT.md');
        expect(result.latest_design).toContain('- Add optimistic UI to post composer.');
        const headings = result.latest_design.match(/### Proposed Updates/g) ?? [];
        expect(headings.length).toBe(1);
        expect(result.metadata.digestUsed).toBeFalsy();
    });
    it('design_code refreshes baseline via digest when requested', async () => {
        const result = await runTool('design_code', {
            ideas: 'Document optimistic UI workflow.',
            regenerateFromDigest: true
  });
        expect(generateDigestMock).toHaveBeenCalledTimes(1);
        expect(result.metadata.digestUsed).toBe(true);
        expect(result.latest_design).toContain('This product delivers voice-first social conversations for builders.');
        expect(result.latest_design).toContain('Document optimistic UI workflow.');
        const headings = result.latest_design.match(/### Proposed Updates/g) ?? [];
        expect(headings.length).toBe(1);
    });
    it('improve_developing_behavior refreshes baseline via digest when requested', async () => {
        const result = await runTool('improve_developing_behavior', {
            behaviorImprovement: 'Always cite file paths with line numbers.',
            regenerateFromDigest: true
  });
        expect(generateDigestMock).toHaveBeenCalled();
        expect(result.metadata.digestUsed).toBe(true);
        expect(result.latestBehavior).toContain('Confirm Supabase credentials before coding.');
        expect(result.latestBehavior).toContain('Always cite file paths');
    });
    it('use_vercel_read_external_mcp handles list_deployments', async () => {
        const result = await runTool('use_vercel_read_external_mcp', {
            request: 'list_deployments',
            payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', limit: 2 }
  });
        expect(result.metadata.provider).toBe('vercel');
        expect(Array.isArray(result.answer.deployments)).toBe(true);
    });
    it('use_vercel_write_external_mcp triggers deploy fixture after explicit write admission', async () => {
        const result = await runTool('use_vercel_write_external_mcp', {
            request: 'deploy_to_vercel',
            confirmed: true,
            payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' }
  });
        expect(result.metadata.provider).toBe('vercel');
        expect(result.metadata.writeAdmission).toMatchObject({
            admitted: true,
            interfaceSurface: 'chatgpt_app',
            permission: 'explicit_user_confirmation',
            connectedInterface: 'vercel',
            operation: 'deploy_to_vercel',
            exchangeStateRole: 'connected_interface_delivery_mechanism',
            outputMeaning: 'asset_pack_delivery_mechanism',
            targetAnchor: 'vercel:team_bitcode/prj_Yapper'
  });
        expect(result.result.readyState).toBe('BUILDING');
    });
    it('write_code_changes_to_vcs creates GitHub repository after explicit write admission', async () => {
        const result = await runTool('write_code_changes_to_vcs', {
            operation: 'createRepository',
            confirmed: true,
            accessToken: 'ghp_mock',
            name: 'bitcode-yapper',
            description: 'Bitcode source-to-shares terminal companion fixture',
            private: true
  });
        expect(result.result).toMatchObject({
            name: 'bitcode-yapper',
            private: true
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
            targetAnchor: 'github:bitcode-yapper'
  });
    });
    it('write_code_changes_to_vcs rejects GitHub writes without explicit confirmation', async () => {
        await expect(runTool('write_code_changes_to_vcs', {
            operation: 'createRepository',
            accessToken: 'ghp_mock',
            name: 'bitcode-yapper'
  })).rejects.toThrow('Bitcode ChatGPT App write admission requires confirmed: true before connected-interface writes can execute.');
    });
    it('rejects ChatGPT App connected-interface writes without explicit confirmation', async () => {
        await expect(runTool('use_vercel_write_external_mcp', {
            request: 'deploy_to_vercel',
            payload: { projectId: 'prj_Yapper', teamId: 'team_bitcode', message: 'Demo deploy' }
  })).rejects.toThrow('Bitcode ChatGPT App write admission requires confirmed: true before connected-interface writes can execute.');
    });
    it('use_aws_read_external_mcp invokes lambda helper', async () => {
        const result = await runTool('use_aws_read_external_mcp', {
            request: 'lambda.invoke',
            payload: { functionName: 'handler' }
  });
        expect(result.metadata.provider).toBe('aws');
        expect(result.metadata.guidance).toContain('Invoked the Lambda');
    });
    it('use_aws_write_external_mcp uploads to S3 after explicit write admission', async () => {
        const result = await runTool('use_aws_write_external_mcp', {
            request: 's3.putObject',
            confirmed: true,
            payload: { bucket: 'demo', key: 'config.json', body: '{}' }
  });
        expect(result.metadata.provider).toBe('aws');
        expect(result.metadata.guidance).toContain('Uploaded to S3');
        expect(result.metadata.writeAdmission).toMatchObject({
            admitted: true,
            interfaceSurface: 'chatgpt_app',
            permission: 'explicit_user_confirmation',
            connectedInterface: 'aws',
            operation: 's3.putObject',
            targetAnchor: 'aws:s3/demo/config.json'
  });
    });
    it('design_code gracefully degrades when digest regeneration fails', async () => {
        generateDigestMock.mockRejectedValueOnce(new Error('digest offline'));
        const result = await runTool('design_code', {
            ideas: 'Add fallback messaging to onboarding flow.',
            regenerateFromDigest: true
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
        const result = await runTool('improve_developing_behavior', {
            behaviorImprovement: 'Record when successors read live narration.',
            regenerateFromDigest: true
  });
        expect(result.metadata.digestUsed).toBe(false);
        expect(result.metadata.digestError).toBe('agents digest unavailable');
        expect(result.latestBehavior).toContain('### Behavior Improvement');
        expect(result.latestBehavior).toContain('Record when successors read live narration.');
        expect(result.latestBehavior).toContain('# AGENTS\' INSTRUCTIONS:\n\n- []');
    });
});
