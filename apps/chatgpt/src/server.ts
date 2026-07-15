import './env';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getBitcodeTools, type BitcodeTool, type BitcodeToolExecutionResult } from './tools';

function formatValidationErrors(errors: any[]): string {
  return errors
    .map((error) => {
      const path = Array.isArray(error.path) && error.path.length > 0 ? error.path.join('.') : '(root)';
      return `${path}: ${error.message}`;
    })
    .join('; ');
}

export class BitcodeMCPServer {
  private readonly server: Server;
  private readonly tools: BitcodeTool[];

  constructor(tools: BitcodeTool[] = getBitcodeTools()) {
    this.server = new Server(
      {
        name: 'bitcode-chatgpt-app',
        version: '0.0.1'
      },
      {
        capabilities: {
          tools: {}
        },
        instructions: [
          'Bitcode is the source-to-shares protocol surfaced through ChatGPT as a connected-interface Bitcode Terminal companion.',
          'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state.',
          'Write tools (GitHub, AWS, Vercel) require confirmed: true and return write-admission receipts before connected-interface delivery mechanisms execute.',
          'Always ensure `.ai/PRODUCT.md`, `.ai/AGENTS.md`, and `.ai/MCPS.md` stay in sync with Bitcode Exchange and Terminal decisions.'
        ].join(' ')
      }
    );

    this.tools = tools;
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        _meta: tool.meta ?? {}
      }));

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: rawArguments = {} } = request.params;
      const tool = this.tools.find((candidate) => candidate.name === name);

      if (!tool) {
        throw new Error(`Unknown bitcode tool: ${name}`);
      }

      const validation = tool.validator.safeParse(rawArguments);

      if (!validation.success) {
        throw new Error(`Invalid arguments for ${name}: ${formatValidationErrors(validation.error.errors)}`);
      }

        const result: BitcodeToolExecutionResult = await tool.execute(validation.data);

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

  async connect(transport: StdioServerTransport): Promise<void> {
    await this.server.connect(transport);
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.connect(transport);
  }
}

export function createBitcodeServer(tools: BitcodeTool[] = getBitcodeTools()): BitcodeMCPServer {
  return new BitcodeMCPServer(tools);
}

export async function runBitcodeServer(): Promise<void> {
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
