/**
 * Bitcode MCP product tools — the only default tools/list surface.
 *
 * Eight tools:
 *   measure
 *   synthesize-asset-packs-for-deposit
 *   synthesize-asset-packs-for-reads
 *   packs
 *   auxiliary-profile | wallet | interfaces | externals
 */

import { z } from 'zod';
import { getBtdMcpToolContract } from '@bitcode/btd';
import type { MCPAuthContext } from '../types';
import { executePipelineWithMonitoring } from './pipeline-tools';
import { executeRepositoryMeasure } from './measure-tools';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  execute?: (args: any, context: MCPAuthContext) => Promise<any>;
}

const RepositoryAnchorSchema = z
  .object({
    provider: z.string().optional(),
    owner: z.string().optional(),
    name: z.string().optional(),
    branch: z.string().optional(),
    path: z.string().optional(),
    connectionId: z.number().optional(),
  })
  .passthrough()
  .describe('Repository coordinates (provider/owner/name/branch or local path)');

const DepositSynthesizeSchema = z.object({
  repository: RepositoryAnchorSchema,
  obfuscations: z
    .string()
    .default('')
    .describe(
      'Obfuscations policy text. Empty string skips Setup obfuscation LLM (same as website Deposit).',
    ),
  forcedInclusions: z.array(z.string()).optional(),
  forcedExclusions: z.array(z.string()).optional(),
  streaming: z.boolean().optional().default(true),
  organizationId: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  modelPreferences: z.record(z.any()).optional(),
});

const ReadSynthesizeSchema = z.object({
  repository: RepositoryAnchorSchema,
  need: z
    .object({
      prompt: z.string().min(10).describe('Need prompt / Read instruction'),
      accepted: z.boolean().optional(),
      needId: z.string().optional(),
    })
    .describe('Need configuration (required; same gate as website Read)'),
  streaming: z.boolean().optional().default(true),
  organizationId: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  modelPreferences: z.record(z.any()).optional(),
});

const MeasureSchema = z.object({
  repository: z
    .object({
      owner: z.string(),
      name: z.string(),
      branch: z.string().optional().default('main'),
    })
    .describe('Repository to measure'),
  measureType: z
    .enum([
      'architecture',
      'dependencies',
      'security',
      'performance',
      'quality',
      'complexity',
      'patterns',
      'technical_debt',
    ])
    .describe('Measure dimension'),
  depth: z.enum(['surface', 'medium', 'deep']).optional().default('medium'),
  includeMetrics: z.boolean().optional().default(true),
  outputFormat: z.enum(['json', 'markdown', 'summary']).optional().default('json'),
});

const PacksSchema = z.object({
  activityId: z.string().optional().describe('Optional pack/activity id to reread'),
  limit: z.number().int().min(1).max(50).optional().default(20),
  organizationId: z.string().optional(),
});

const AuxiliaryPaneSchema = z.object({
  organizationId: z.string().optional(),
  /** When true, returns write-admission posture for opening the pane (confirmation gate). */
  confirmOpen: z.boolean().optional().default(false),
});

const AUXILIARY_PANES = ['profile', 'wallet', 'interfaces', 'externals'] as const;

function auxiliaryTool(pane: (typeof AUXILIARY_PANES)[number]): MCPTool {
  const toolId = `bitcode://auxiliary-${pane}` as const;
  const contract = getBtdMcpToolContract(toolId);
  return {
    name: contract.toolId,
    description: contract.description,
    inputSchema: AuxiliaryPaneSchema,
    execute: async (args: z.infer<typeof AuxiliaryPaneSchema>, context: MCPAuthContext) => {
      return {
        toolId: contract.toolId,
        pane,
        productRoute: `/packs?auxillary-open-to=${pane}`,
        status: args.confirmOpen ? 'admitted_open' : 'source_safe_preview',
        interfaceSurface: 'mcp',
        organizationId: args.organizationId ?? context.organizationId ?? null,
        actorId: context.userId,
        writeAdmission: {
          admitted: Boolean(args.confirmOpen),
          requiresConfirmation: !args.confirmOpen,
          permission: 'product.read',
          outputMeaning: `auxiliary_${pane}`,
        },
        outputMeaning: `Open Auxillaries ${pane} over product routes; source-safe posture only.`,
        sourceSafety: {
          sourceSafe: true,
          protectedSourceVisible: false,
          containsProtectedSource: false,
          containsSecret: false,
        },
      };
    },
  };
}

/**
 * Register the eight product MCP tools (sole default tools/list surface).
 */
export function registerProductTools(): MCPTool[] {
  const measureContract = getBtdMcpToolContract('bitcode://measure');
  const depositContract = getBtdMcpToolContract(
    'bitcode://synthesize-asset-packs-for-deposit',
  );
  const readContract = getBtdMcpToolContract('bitcode://synthesize-asset-packs-for-reads');
  const packsContract = getBtdMcpToolContract('bitcode://packs');

  return [
    {
      name: measureContract.toolId,
      description: measureContract.description,
      inputSchema: MeasureSchema,
      execute: async (args: z.infer<typeof MeasureSchema>, context: MCPAuthContext) => {
        return executeRepositoryMeasure(
          args.repository,
          args.measureType,
          {
            depth: args.depth,
            includeMetrics: args.includeMetrics,
            outputFormat: args.outputFormat,
          },
          context,
        );
      },
    },
    {
      name: depositContract.toolId,
      description: depositContract.description,
      inputSchema: DepositSynthesizeSchema,
      execute: async (args: z.infer<typeof DepositSynthesizeSchema>, context: MCPAuthContext) => {
        return executePipelineWithMonitoring(
          {
            task: `Deposit synthesize: obfuscations=${args.obfuscations?.length ?? 0} chars`,
            repository: args.repository,
            subtype: 'implementation_plan',
            streaming: args.streaming,
            organizationId: args.organizationId,
            attachments: args.attachments,
            connections: args.connections,
            modelPreferences: args.modelPreferences,
            options: {
              productSurface: 'deposit',
              obfuscations: args.obfuscations ?? '',
              forcedInclusions: args.forcedInclusions ?? [],
              forcedExclusions: args.forcedExclusions ?? [],
            },
          },
          context,
          'asset-pack',
        );
      },
    },
    {
      name: readContract.toolId,
      description: readContract.description,
      inputSchema: ReadSynthesizeSchema,
      execute: async (args: z.infer<typeof ReadSynthesizeSchema>, context: MCPAuthContext) => {
        return executePipelineWithMonitoring(
          {
            task: args.need.prompt,
            repository: args.repository,
            subtype: 'implementation_plan',
            streaming: args.streaming,
            organizationId: args.organizationId,
            attachments: args.attachments,
            connections: args.connections,
            modelPreferences: args.modelPreferences,
            options: {
              productSurface: 'read',
              need: args.need,
            },
          },
          context,
          'asset-pack',
        );
      },
    },
    {
      name: packsContract.toolId,
      description: packsContract.description,
      inputSchema: PacksSchema,
      execute: async (args: z.infer<typeof PacksSchema>, context: MCPAuthContext) => {
        return {
          toolId: packsContract.toolId,
          productRoute: '/packs',
          activityId: args.activityId ?? null,
          limit: args.limit,
          organizationId: args.organizationId ?? context.organizationId ?? null,
          actorId: context.userId,
          status: 'source_safe_preview',
          interfaceSurface: 'mcp',
          writeAdmission: {
            admitted: true,
            permission: 'product.read',
            outputMeaning: 'packs_activity',
          },
          outputMeaning:
            'Reread Packs activity (source-safe options, measurements, settlement posture).',
          packs: [],
          sourceSafety: {
            sourceSafe: true,
            protectedSourceVisible: false,
            containsProtectedSource: false,
            containsSecret: false,
          },
        };
      },
    },
    ...AUXILIARY_PANES.map(auxiliaryTool),
  ];
}

/** All product tool ids for rate-limit and dispatch membership. */
export function listProductToolIds(): string[] {
  return registerProductTools().map((tool) => tool.name);
}
