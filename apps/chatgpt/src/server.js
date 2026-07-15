"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitcodeMCPServer = void 0;
exports.createBitcodeServer = createBitcodeServer;
exports.runBitcodeServer = runBitcodeServer;
require("./env");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const tools_1 = require("./tools");
function formatValidationErrors(errors) {
    return errors
        .map((error) => {
        const path = Array.isArray(error.path) && error.path.length > 0 ? error.path.join('.') : '(root)';
        return `${path}: ${error.message}`;
    })
        .join('; ');
}
class BitcodeMCPServer {
    constructor(tools = (0, tools_1.getBitcodeTools)()) {
        this.server = new index_js_1.Server({
            name: 'bitcode-chatgpt-app',
            version: '0.0.1'
        }, {
            capabilities: {
                tools: {}
            },
            instructions: [
                'Bitcode is the source-to-shares protocol surfaced through ChatGPT as a connected-interface Bitcode product companion.',
                'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state.',
                'Write tools (GitHub, AWS, Vercel) require confirmed: true and return write-admission receipts before connected-interface delivery mechanisms execute.',
                'Always ensure `.ai/PRODUCT.md`, `.ai/AGENTS.md`, and `.ai/MCPS.md` stay in sync with Bitcode Exchange and product decisions.'
            ].join(' ')
        });
        this.tools = tools;
        this.registerHandlers();
    }
    registerHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            const tools = this.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                _meta: tool.meta ?? {}
            }));
            return { tools };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: rawArguments = {} } = request.params;
            const tool = this.tools.find((candidate) => candidate.name === name);
            if (!tool) {
                throw new Error(`Unknown bitcode tool: ${name}`);
            }
            const validation = tool.validator.safeParse(rawArguments);
            if (!validation.success) {
                throw new Error(`Invalid arguments for ${name}: ${formatValidationErrors(validation.error.errors)}`);
            }
            const result = await tool.execute(validation.data);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        });
    }
    async connect(transport) {
        await this.server.connect(transport);
    }
    async start() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.connect(transport);
    }
}
exports.BitcodeMCPServer = BitcodeMCPServer;
function createBitcodeServer(tools = (0, tools_1.getBitcodeTools)()) {
    return new BitcodeMCPServer(tools);
}
async function runBitcodeServer() {
    const server = new BitcodeMCPServer();
    await server.start();
}
// eslint-disable-next-line @typescript-eslint/no-implied-eval -- runtime entry guard
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    runBitcodeServer().catch((error) => {
        console.error('[bitcode] MCP server failed to start', error);
        process.exit(1);
    });
}
