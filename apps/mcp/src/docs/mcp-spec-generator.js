"use strict";
/**
 * Bitcode MCP Specification Generator
 *
 * Auto-generates comprehensive MCP documentation from tool definitions,
 * creating both machine-readable specs and human-friendly documentation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPSpecificationGenerator = void 0;
exports.generateMCPDocumentation = generateMCPDocumentation;
const zod_1 = require("zod");
const fs_1 = require("fs");
const path_1 = require("path");
const pipeline_tools_1 = require("../tools/pipeline-tools");
const intelligence_tools_1 = require("../tools/intelligence-tools");
const enterprise_tools_1 = require("../tools/enterprise-tools");
const lsp_tools_1 = require("../tools/lsp-tools");
const observability_tools_1 = require("../tools/observability-tools");
const analysis_tools_1 = require("../tools/analysis-tools");
/**
 * Generate comprehensive MCP specification
 */
class MCPSpecificationGenerator {
    constructor() {
        this.spec = {
            mcpVersion: '2024-11-05',
            serverInfo: {
                name: 'bitcode-market-infrastructure',
                version: '1.0.0',
                description: 'Technical knowledge exchange platform exposing comprehensive capabilities through MCP',
                capabilities: [
                    'Pipeline Management', 'Advanced Intelligence', 'Enterprise Integration',
                    'LSP Integration', 'Observability', 'Cross-Repository Learning'
                ]
            },
            tools: {},
            integrationPatterns: {},
            workflows: {}
        };
    }
    /**
     * Generate complete MCP specification
     */
    generateSpecification() {
        console.log('🔍 Generating MCP specification...');
        // Collect all tools
        const toolCategories = [
            { name: 'Pipeline Management', tools: (0, pipeline_tools_1.registerPipelineTools)() },
            { name: 'Advanced Intelligence', tools: (0, intelligence_tools_1.registerIntelligenceTools)() },
            { name: 'Enterprise Integration', tools: (0, enterprise_tools_1.registerEnterpriseTools)() },
            { name: 'LSP Integration', tools: (0, lsp_tools_1.registerLspTools)() },
            { name: 'Observability', tools: (0, observability_tools_1.registerObservabilityTools)() },
            { name: 'Analysis', tools: (0, analysis_tools_1.registerMeasureTools)() }
        ];
        // Process each category
        for (const category of toolCategories) {
            console.log(`📋 Processing ${category.name}`);
            this.spec.tools[category.name] = {
                description: this.getCategoryDescription(category.name),
                tools: {}
            };
            for (const tool of category.tools) {
                const toolSpec = this.generateToolSpecification(tool, category.name);
                this.spec.tools[category.name].tools[tool.name] = toolSpec;
            }
        }
        // Generate integration patterns
        this.generateIntegrationPatterns();
        // Generate common workflows
        this.generateWorkflows();
        console.log(`✅ Generated specification for ${toolCategories.length} categories`);
        return this.spec;
    }
    /**
     * Generate detailed tool specification
     */
    generateToolSpecification(tool, category) {
        const toolName = tool.name.split('://')[1] || tool.name;
        const subcategory = this.extractSubcategory(tool.name);
        return {
            name: tool.name,
            description: tool.description,
            category,
            subcategory,
            inputSchema: this.zodSchemaToJsonSchema(tool.inputSchema),
            examples: this.generateExamples(tool),
            useCases: this.extractUseCases(tool.description),
            relatedTools: this.findRelatedTools(tool.name),
            complexity: this.assessComplexity(tool),
            measuredBtdEstimate: this.estimateMeasuredBtdAmount(tool, category)
        };
    }
    /**
     * Convert Zod schema to JSON Schema for documentation
     */
    zodSchemaToJsonSchema(zodSchema) {
        try {
            // This is a simplified conversion - in production, use zodToJsonSchema library
            if (zodSchema instanceof zod_1.z.ZodObject) {
                const shape = zodSchema._def.shape();
                const properties = {};
                const required = [];
                for (const [key, value] of Object.entries(shape)) {
                    const fieldSchema = value;
                    properties[key] = this.convertZodTypeToJsonSchema(fieldSchema);
                    if (!this.isOptional(fieldSchema)) {
                        required.push(key);
                    }
                }
                return {
                    type: 'object',
                    properties,
                    required: required.length > 0 ? required : undefined,
                    additionalProperties: false
                };
            }
            return this.convertZodTypeToJsonSchema(zodSchema);
        }
        catch (error) {
            console.warn(`Failed to convert schema for tool: ${error}`);
            return { type: 'object', description: 'Schema conversion failed' };
        }
    }
    /**
     * Convert individual Zod type to JSON Schema
     */
    convertZodTypeToJsonSchema(zodType) {
        if (zodType instanceof zod_1.z.ZodString) {
            return { type: 'string', description: zodType._def.description };
        }
        if (zodType instanceof zod_1.z.ZodNumber) {
            return { type: 'number', description: zodType._def.description };
        }
        if (zodType instanceof zod_1.z.ZodBoolean) {
            return { type: 'boolean', description: zodType._def.description };
        }
        if (zodType instanceof zod_1.z.ZodArray) {
            return {
                type: 'array',
                items: this.convertZodTypeToJsonSchema(zodType._def.type),
                description: zodType._def.description
            };
        }
        if (zodType instanceof zod_1.z.ZodEnum) {
            return {
                type: 'string',
                enum: zodType._def.values,
                description: zodType._def.description
            };
        }
        if (zodType instanceof zod_1.z.ZodOptional) {
            return this.convertZodTypeToJsonSchema(zodType._def.innerType);
        }
        return { type: 'object', description: 'Complex type' };
    }
    /**
     * Check if Zod type is optional
     */
    isOptional(zodType) {
        return zodType instanceof zod_1.z.ZodOptional ||
            zodType._def?.typeName === 'ZodOptional';
    }
    /**
     * Generate realistic examples for each tool
     */
    generateExamples(tool) {
        const examples = [];
        // Generate examples based on tool category
        if (tool.name.includes('asset-pack')) {
            examples.push({
                name: 'React Component Creation',
                description: 'Create a reusable React component with TypeScript',
                input: {
                    task: 'Create a reusable Modal component with animations and accessibility features',
                    repository: { owner: 'acme-corp', name: 'web-app' },
                    subtype: 'full_feature',
                    streaming: true
                }
            });
        }
        return examples;
    }
    /**
     * Extract use cases from tool description
     */
    extractUseCases(description) {
        const useCases = [];
        if (description.includes('feature'))
            useCases.push('Feature Development');
        if (description.includes('ai_document'))
            useCases.push('Code Modernization');
        if (description.includes('security'))
            useCases.push('Security Analysis');
        if (description.includes('performance'))
            useCases.push('Performance Optimization');
        if (description.includes('test'))
            useCases.push('Test Generation');
        if (description.includes('document'))
            useCases.push('Documentation');
        if (description.includes('refactor'))
            useCases.push('Code Refactoring');
        if (description.includes('analytics'))
            useCases.push('Business Intelligence');
        return useCases.length > 0 ? useCases : ['General Technical Work'];
    }
    /**
     * Find related tools based on naming patterns
     */
    findRelatedTools(toolName) {
        const related = [];
        const category = toolName.split('://')[1]?.split('/')[0];
        if (category === 'pipelines') {
            related.push('bitcode://monitoring/pipeline/status', 'bitcode://intelligence/effectiveness/track');
        }
        else if (category === 'enterprise') {
            related.push('bitcode://observability/logs/analytics', 'bitcode://lsp/diagnostic/analyze');
        }
        return related;
    }
    /**
     * Assess tool complexity based on features
     */
    assessComplexity(tool) {
        const desc = tool.description.toLowerCase();
        if (desc.includes('comprehensive') || desc.includes('enterprise') || desc.includes('ml-powered')) {
            return 'expert';
        }
        else if (desc.includes('advanced') || desc.includes('orchestration') || desc.includes('cross-repo')) {
            return 'advanced';
        }
        else if (desc.includes('intelligent') || desc.includes('analysis') || desc.includes('integration')) {
            return 'moderate';
        }
        return 'simple';
    }
    /**
     * Estimate measured BTD amount for tool usage
     */
    estimateMeasuredBtdAmount(tool, category) {
        let baseCost = 50;
        const factors = ['Base tool execution'];
        if (category === 'Pipeline Management') {
            baseCost = 200;
            factors.push('Pipeline execution', 'AI agent coordination');
        }
        else if (category === 'Advanced Intelligence') {
            baseCost = 150;
            factors.push('ML processing', 'Cross-repository analysis');
        }
        else if (category === 'Enterprise Integration') {
            baseCost = 75;
            factors.push('API integrations', 'Data processing');
        }
        if (tool.description.includes('comprehensive') || tool.description.includes('deep')) {
            baseCost *= 1.5;
            factors.push('Comprehensive analysis');
        }
        return {
            estimated: Math.round(baseCost),
            factors
        };
    }
    /**
     * Extract subcategory from tool name
     */
    extractSubcategory(toolName) {
        const parts = toolName.split('://')[1]?.split('/') || [];
        return parts[1] || 'general';
    }
    /**
     * Get category description
     */
    getCategoryDescription(category) {
        const descriptions = {
            'Pipeline Management': 'Core SDIVF pipeline execution with PTRR agent coordination',
            'Advanced Intelligence': 'ML-powered effectiveness tracking and cross-repository learning',
            'Pipeline Orchestration': 'Complex workflow management with chaining and automation',
            'Enterprise Integration': 'Webhook orchestration, API management, and marketplace intelligence',
            'LSP Integration': 'Deep semantic analysis and intelligent code navigation',
            'Observability': 'Real-time metrics, distributed tracing, and business intelligence',
            'Monitoring': 'System health monitoring and pipeline control',
            'Analysis': 'Code analysis and repository intelligence'
        };
        return descriptions[category] || 'Technical knowledge tools';
    }
    /**
     * Generate integration patterns for different platforms
     */
    generateIntegrationPatterns() {
        this.spec.integrationPatterns = {
            'Claude Desktop': {
                setup: `Add to ~/.config/claude/mcp-servers.json:
{
  "mcpServers": {
    "bitcode": {
      "command": "npx",
      "args": ["@bitcode/generic-mcps-bitcode"],
      "env": { "BITCODE_API_KEY": "your-api-key" }
    }
  }
}`,
                example: `"Create a React component for file uploads with drag-and-drop functionality"`,
                features: ['Real-time streaming', 'Rich responses', 'Interactive tables']
            },
            'VS Code': {
                setup: `Install the Bitcode MCP extension and configure with API key`,
                example: `Right-click file → "Analyze with Bitcode MCP"`,
                features: ['IDE integration', 'Code actions', 'Inline suggestions']
            },
            'GitHub Actions': {
                setup: `- uses: bitcode/mcp-action@v1
  with:
    tool: "bitcode://pipelines/asset-pack/execute"
    token: \${{ secrets.BITCODE_API_KEY }}`,
                example: `Automated implementation and validation on every PR`,
                features: ['CI/CD integration', 'Automated workflows', 'Quality gates']
            },
            'Custom API': {
                setup: `const client = new MCPClient({ apiKey: process.env.BITCODE_API_KEY });`,
                example: `await client.callTool("bitcode://pipelines/asset-pack/execute", args);`,
                features: ['REST API', 'WebSocket streaming', 'Custom integrations']
            }
        };
    }
    /**
     * Generate common workflow patterns
     */
    generateWorkflows() {
        this.spec.workflows = {
            'Full-Stack Feature Development': {
                description: 'Complete feature development from design to deployment',
                steps: [
                    {
                        tool: 'bitcode://analysis/repository/analyze',
                        description: 'Analyze existing architecture and patterns'
                    },
                    {
                        tool: 'bitcode://pipelines/asset-pack/execute',
                        description: 'Implement feature with tests and documentation'
                    },
                    {
                        tool: 'bitcode://intelligence/effectiveness/track',
                        description: 'Measure implementation effectiveness'
                    }
                ],
                complexity: 'moderate',
                estimatedTime: '15-45 minutes'
            },
            'Code Quality Improvement': {
                description: 'Systematic code quality improvement across repositories',
                steps: [
                    {
                        tool: 'bitcode://intelligence/cross-repo/learn',
                        description: 'Extract quality patterns from successful repositories'
                    },
                    {
                        tool: 'bitcode://orchestration/pipeline/orchestrate',
                        description: 'Apply improvements across multiple repositories'
                    },
                    {
                        tool: 'bitcode://observability/metrics/realtime',
                        description: 'Monitor quality improvements over time'
                    }
                ],
                complexity: 'advanced',
                estimatedTime: '30-90 minutes'
            },
            'Enterprise Automation Setup': {
                description: 'Set up enterprise-grade automation and observability',
                steps: [
                    {
                        tool: 'bitcode://enterprise/webhook/orchestrate',
                        description: 'Configure intelligent webhook routing'
                    },
                    {
                        tool: 'bitcode://enterprise/api/manage',
                        description: 'Set up API management and governance'
                    },
                    {
                        tool: 'bitcode://observability/intelligence/business',
                        description: 'Configure business intelligence dashboards'
                    }
                ],
                complexity: 'expert',
                estimatedTime: '60-180 minutes'
            }
        };
    }
    /**
     * Export specification to multiple formats
     */
    exportSpecification(outputDir) {
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        // JSON specification
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, 'mcp-specification.json'), JSON.stringify(this.spec, null, 2));
        // Human-readable documentation
        this.generateHumanReadableDocs(outputDir);
        // OpenAPI-style documentation
        this.generateOpenAPIStyle(outputDir);
        // Integration examples
        this.generateIntegrationExamples(outputDir);
        console.log(`📄 Documentation exported to ${outputDir}`);
    }
    /**
     * Generate human-readable documentation
     */
    generateHumanReadableDocs(outputDir) {
        let docs = `# Bitcode MCP API Reference

**${this.spec.serverInfo.description}**

## Overview

  
- **MCP Version**: ${this.spec.mcpVersion}

## Tool Categories

`;
        for (const [categoryName, category] of Object.entries(this.spec.tools)) {
            docs += `### ${categoryName}\n\n${category.description}\n\n`;
            for (const [toolName, tool] of Object.entries(category.tools)) {
                docs += `#### \`${tool.name}\`\n\n`;
                docs += `${tool.description}\n\n`;
                docs += `**Complexity**: ${tool.complexity} | **Measured BTD Estimate**: ${tool.measuredBtdEstimate.estimated} $BTD\n\n`;
                if (tool.examples.length > 0) {
                    docs += `**Example**:\n\`\`\`json\n${JSON.stringify(tool.examples[0].input, null, 2)}\n\`\`\`\n\n`;
                }
                docs += `---\n\n`;
            }
        }
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, 'mcp-api-reference.md'), docs);
    }
    /**
     * Generate OpenAPI-style specification
     */
    generateOpenAPIStyle(outputDir) {
        const openApiSpec = {
            openapi: '3.1.0',
            info: {
                title: this.spec.serverInfo.name,
                version: this.spec.serverInfo.version,
                description: this.spec.serverInfo.description
            },
            'x-mcp-specification': {
                version: this.spec.mcpVersion,
                capabilities: this.spec.serverInfo.capabilities
            },
            paths: {},
            components: {
                schemas: {}
            }
        };
        // Convert MCP tools to OpenAPI-style paths
        for (const [categoryName, category] of Object.entries(this.spec.tools)) {
            for (const [toolName, tool] of Object.entries(category.tools)) {
                const pathKey = `/mcp/tools/${tool.name.replace('://', '/')}`;
                openApiSpec.paths[pathKey] = {
                    post: {
                        summary: tool.description.split('\n')[0],
                        description: tool.description,
                        operationId: tool.name.replace(/[^a-zA-Z0-9]/g, '_'),
                        tags: [categoryName],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: tool.inputSchema
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Tool execution result',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                success: { type: 'boolean' },
                                                result: { type: 'object' },
                                                metadata: { type: 'object' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'x-mcp-tool': {
                            complexity: tool.complexity,
                            measuredBtdEstimate: tool.measuredBtdEstimate,
                            useCases: tool.useCases,
                            relatedTools: tool.relatedTools
                        }
                    }
                };
            }
        }
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, 'mcp-openapi.json'), JSON.stringify(openApiSpec, null, 2));
    }
    /**
     * Generate integration examples
     */
    generateIntegrationExamples(outputDir) {
        let examples = `# MCP Integration Examples

`;
        for (const [platform, pattern] of Object.entries(this.spec.integrationPatterns)) {
            examples += `## ${platform}

### Setup
\`\`\`
${pattern.setup}
\`\`\`

### Example Usage
\`\`\`
${pattern.example}
\`\`\`

### Features
${pattern.features.map(f => `- ${f}`).join('\n')}

---

`;
        }
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, 'mcp-integration-examples.md'), examples);
    }
}
exports.MCPSpecificationGenerator = MCPSpecificationGenerator;
/**
 * Generate and export MCP specification
 */
function generateMCPDocumentation(outputDir = './docs/mcp') {
    const generator = new MCPSpecificationGenerator();
    const specification = generator.generateSpecification();
    generator.exportSpecification(outputDir);
    console.log('✅ MCP documentation generation complete!');
    console.log(`📁 Output directory: ${outputDir}`);
}
// CLI interface
if (require.main === module) {
    const outputDir = process.argv[2] || './docs/mcp';
    generateMCPDocumentation(outputDir);
}
