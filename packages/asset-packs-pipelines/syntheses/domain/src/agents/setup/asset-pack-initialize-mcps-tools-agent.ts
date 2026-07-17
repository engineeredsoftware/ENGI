import { factoryAgentWithSingleStep } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { McpConfigSchema } from '@bitcode/mcp-generics';
import {
  entriesToEvidenceDocumentList,
  loadMcpDocumentFromWorkspace,
  registerDocumentedMcpTools,
  type RegisterMcpToolsResult
} from '../../utils/mcp-document';

/**
 * InitializeMCPsToolsAgent (AssetPack Setup)
 * - Normalizes MCP configuration for this run (if any present)
 * - Stages data for downstream concise-context preparation and potential tool registry usage
 * - Keeps logic minimal; actual tool client registration can be layered via tool registry helpers
 */
export const InitializeMCPsToolsAgent = factoryAgentWithSingleStep<any, {
  active: Record<string, any>;
  initialized: string[];
  documentation?: { path: string; entries: number; credentials?: number };
  toolRegistration?: RegisterMcpToolsResult;
}>({
  name: 'setup:asset-pack-initialize-mcps-tools-agent',
  description: 'Normalize MCP configuration for AssetPack pipeline',
  execute: async (_input, execution) => {
    const safeStore = (ns: string, key: string, value: unknown) => {
      try {
        execution?.store?.(ns as any, key as any, value as any);
      } catch {}
    };

    try {
      const identity = (
        'You are the Initialize MCPs (AssetPack) agent. Normalize MCP configuration for later tools.'
      ) as unknown as PromptPart;
      (execution as any).prompt?.setSpecificExecution('specific_execution:agent:identity', identity);
    } catch {}

    // Prefer route-provided MCP config (if UI supplied), otherwise no-op
    const mcp = (execution as any).get?.('config', 'mcpConfig') || null;
    let active: Record<string, any> = {};
    let initialized: string[] = [];

    if (mcp && typeof mcp === 'object') {
      const parsed = McpConfigSchema.safeParse(mcp);
      if (parsed.success) {
        const { id, type, config } = parsed.data as any;
        if (id && type) {
          active[id] = { type, config: config || {} };
          initialized.push(id);
        }
      }
    }

    safeStore('mcp/init', 'active', active);
    safeStore('mcp/init', 'initialized', initialized);

    let documentation: { path: string; entries: number; credentials?: number } | undefined;
    let toolRegistration: RegisterMcpToolsResult | undefined;

    try {
      const workspacePath = (execution as any).get?.('repository', 'workspacePath');
      const document = await loadMcpDocumentFromWorkspace(workspacePath);

      if (document && document.entries.length) {
        documentation = {
          path: document.path,
          entries: document.entries.length,
          credentials: document.entries.reduce((sum, entry) => sum + (entry.credentials?.length ?? 0), 0)
        };

        safeStore('mcp/doc', 'path', document.path);
        safeStore('mcp/doc', 'entries', document.entries);

        const credentialNotes = document.entries.flatMap((entry) =>
          (entry.credentials || []).map((note) => ({ slug: entry.slug, note }))
        );
        if (credentialNotes.length) {
          safeStore('mcp/doc', 'credentials', credentialNotes);
        }

        const evidenceDocumentEntries = entriesToEvidenceDocumentList(document.entries);
        if (evidenceDocumentEntries.length) {
          safeStore('evidence_documents', 'list', evidenceDocumentEntries);
        }

        toolRegistration = await registerDocumentedMcpTools(execution, document.entries);
        safeStore('mcp/tools', 'registered', toolRegistration.registered);
        if (toolRegistration.missing.length) {
          safeStore('mcp/tools', 'missing', toolRegistration.missing);
        }
      }
    } catch (error) {
      try {
        (execution as any)?.logger?.warn?.('[mcp-doc] Failed to load MCP.md', {
          error: error instanceof Error ? error.message : String(error)
        });
      } catch {}
    }

    return { active, initialized, documentation, toolRegistration };
  }
});

export default InitializeMCPsToolsAgent;
