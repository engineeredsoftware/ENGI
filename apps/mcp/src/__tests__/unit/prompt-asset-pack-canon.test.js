"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const development_prompts_1 = require("../../prompts/development-prompts");
const workflow_prompts_1 = require("../../prompts/workflow-prompts");
const repository = {
    owner: 'bitcode',
    name: 'terminal',
    branch: 'main'
  };
async function renderPromptContent(prompt, args) {
    const messages = await prompt.getMessages(args);
    return messages.map((message) => message.content ?? '').join('\n');
}
describe('MCP prompt asset-pack canon', () => {
    it('renders workflow prompts as Bitcode asset-pack pipeline guidance', async () => {
        const prompts = (0, workflow_prompts_1.registerWorkflowPrompts)();
        const contents = await Promise.all([
            renderPromptContent(prompts[0], {
                featureName: 'Settlement receipt review',
                requirements: 'Expose fit-quality receipts before settlement.',
                repository,
                complexity: 'medium',
                stakeholders: [],
                constraints: []
  }),
            renderPromptContent(prompts[1], {
                bugDescription: 'Fit-quality hash is missing from the settlement card.',
                repository,
                severity: 'high',
                reproductionSteps: [],
                affectedUsers: '',
                expectedBehavior: 'Settlement card shows the fit-quality hash.',
                environment: 'testnet'
  }),
            renderPromptContent(prompts[2], {
                repository,
                focusAreas: ['security', 'performance', 'maintainability'],
                reviewDepth: 'standard',
                compliance: []
  }),
            renderPromptContent(prompts[3], {
                repository,
                scope: 'full-system',
                concerns: ['scalability', 'security', 'maintainability'],
                constraints: []
  }),
            renderPromptContent(prompts[4], {
                repository,
                performanceIssues: [],
                targetMetrics: {},
                scope: 'full-stack',
                environment: 'testnet',
                constraints: []
  }),
        ]);
        const rendered = contents.join('\n');
        expect(rendered).toContain("Bitcode's asset-pack pipeline");
        expect(rendered).toContain('admitted subtype');
        expect(rendered).toContain('written assets');
        expect(rendered).not.toMatch(/deliverable pipeline/i);
    });
    it('renders development prompts as Bitcode asset-pack pipeline guidance', async () => {
        const prompts = (0, development_prompts_1.registerDevelopmentPrompts)();
        const contents = await Promise.all([
            renderPromptContent(prompts[0], {
                apiName: 'Read Review API',
                description: 'Accept, reject, or remeasure measured Reads before fit search.',
                repository,
                apiType: 'rest',
                authentication: 'jwt',
                endpoints: [],
                requirements: []
  }),
            renderPromptContent(prompts[1], {
                projectName: 'Bitcode Terminal Review Surface',
                description: 'Show reviewable Reads and settlement fit qualities.',
                repository,
                framework: 'react',
                typescript: true,
                styling: 'tailwind',
                testing: 'jest',
                features: []
  }),
            renderPromptContent(prompts[2], {
                databaseType: 'postgresql',
                repository,
                entities: [],
                features: ['migrations', 'seeding'],
                environment: 'all'
  }),
        ]);
        const rendered = contents.join('\n');
        expect(rendered).toContain("Bitcode's asset-pack pipeline");
        expect(rendered).toContain('admitted subtype');
        expect(rendered).not.toMatch(/deliverable pipeline/i);
    });
    it('describes the retained pipeline tool as an asset-pack pipeline', () => {
        const source = (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '../../tools/pipeline-tools.ts'), 'utf8');
        expect(source).toContain("name: 'bitcode://pipelines/asset-pack/create'");
        expect(source).toContain('Bitcode asset-pack pipeline');
        expect(source).toContain('Admitted subtypes');
        expect(source).toContain('connected-interface delivery readiness');
        expect(source).not.toMatch(/deliverable pipeline/i);
    });
});
