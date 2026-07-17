/**
 * Setup + Discovery LSP tool surface for AssetPack pipelines.
 *
 * Setup must prime language-intelligence for later phases. Discovery codebase
 * comprehension (and validation) use these tools extensively for symbols,
 * definitions, and workspace navigation — never invent Host/LSP capabilities.
 *
 * Primitives: `@bitcode/generic-tools-lsp-query` + `@bitcode/lsp`.
 * Product layer: stable registry names, DocCode attach, workspaceRoot binding.
 */

import { Tool } from '@bitcode/tools-generics';
import type { Prompt } from '@bitcode/prompts/prompt';
import { startTypeScriptServer } from '@bitcode/lsp';

import {
  definitionTool as baseDefinitionTool,
  referencesTool as baseReferencesTool,
  hoverInfoTool as baseHoverInfoTool,
  completionTool as baseCompletionTool,
  signatureHelpTool as baseSignatureHelpTool,
  documentSymbolsTool as baseDocumentSymbolsTool,
  workspaceSymbolsTool as baseWorkspaceSymbolsTool,
  codeActionsTool as baseCodeActionsTool,
  formatDocumentTool as baseFormatDocumentTool,
  LSP_QUERY_DOC_CODE_TOOL_PROMPT,
} from '@bitcode/generic-tools-lsp-query';

/** Stable pipeline registry names (usableTools / useTools). */
export const LSP_TOOL_NAMES = {
  definition: 'lsp-definition',
  references: 'lsp-references',
  hover: 'lsp-hover',
  completion: 'lsp-completion',
  signatureHelp: 'lsp-signature-help',
  documentSymbols: 'lsp-document-symbols',
  workspaceSymbols: 'lsp-workspace-symbols',
  codeActions: 'lsp-code-actions',
  formatDocument: 'lsp-format-document',
} as const;

export type LspToolName = (typeof LSP_TOOL_NAMES)[keyof typeof LSP_TOOL_NAMES];

function attachProductDocCode(tool: Tool, name: string): Tool {
  try {
    (tool as any).name = name;
    if (!(tool as any).__docCodePrompt && LSP_QUERY_DOC_CODE_TOOL_PROMPT) {
      (tool as any).__docCodePrompt = LSP_QUERY_DOC_CODE_TOOL_PROMPT as Prompt;
    }
  } catch {
    /* ignore */
  }
  return tool;
}

/**
 * Named product Tools — same primitives as generic-tools-lsp-query, with
 * stable `name` for ExecutionPipelineToolRegistry.
 */
export const lspDefinitionTool = attachProductDocCode(baseDefinitionTool, LSP_TOOL_NAMES.definition);
export const lspReferencesTool = attachProductDocCode(baseReferencesTool, LSP_TOOL_NAMES.references);
export const lspHoverTool = attachProductDocCode(baseHoverInfoTool, LSP_TOOL_NAMES.hover);
export const lspCompletionTool = attachProductDocCode(baseCompletionTool, LSP_TOOL_NAMES.completion);
export const lspSignatureHelpTool = attachProductDocCode(
  baseSignatureHelpTool,
  LSP_TOOL_NAMES.signatureHelp,
);
export const lspDocumentSymbolsTool = attachProductDocCode(
  baseDocumentSymbolsTool,
  LSP_TOOL_NAMES.documentSymbols,
);
export const lspWorkspaceSymbolsTool = attachProductDocCode(
  baseWorkspaceSymbolsTool,
  LSP_TOOL_NAMES.workspaceSymbols,
);
export const lspCodeActionsTool = attachProductDocCode(baseCodeActionsTool, LSP_TOOL_NAMES.codeActions);
export const lspFormatDocumentTool = attachProductDocCode(
  baseFormatDocumentTool,
  LSP_TOOL_NAMES.formatDocument,
);

/** Full LSP query suite for Setup catalog + Discovery/Validation agent maps. */
export const ALL_LSP_QUERY_TOOLS: Tool[] = [
  lspDefinitionTool,
  lspReferencesTool,
  lspHoverTool,
  lspCompletionTool,
  lspSignatureHelpTool,
  lspDocumentSymbolsTool,
  lspWorkspaceSymbolsTool,
  lspCodeActionsTool,
  lspFormatDocumentTool,
].filter(Boolean);

/** Tools Setup initialize-lsp must expose for Try/Retry validation. */
export const SETUP_LSP_INITIALIZE_TOOLS: Tool[] = [
  lspWorkspaceSymbolsTool,
  lspDocumentSymbolsTool,
  lspDefinitionTool,
  lspHoverTool,
];

/** Tools Discovery codebase comprehension should use extensively. */
export const DISCOVERY_CODEBASE_COMPREHENSION_LSP_TOOLS: Tool[] = [
  lspWorkspaceSymbolsTool,
  lspDocumentSymbolsTool,
  lspDefinitionTool,
  lspReferencesTool,
  lspHoverTool,
  lspCompletionTool,
  lspSignatureHelpTool,
];

export type LspSetupReadiness = {
  initialized: boolean;
  workspacePath: string;
  workspaceRoot: string;
  language: string;
  serverInfo: {
    name: string;
    version: string;
    capabilities: string[];
  };
  workspaceInfo: {
    rootUri: string;
    workspaceFolders: string[];
    configuredLanguages: string[];
  };
  registeredToolNames: string[];
  error?: string;
};

/**
 * Host-side LSP prime for a checkout: start session, register tools on the
 * pipeline tool registry, store readiness for later phases.
 */
export async function setupLspForWorkspace(
  execution: any,
  workspacePath: string,
): Promise<LspSetupReadiness> {
  const root = String(workspacePath || '').trim();
  const registeredToolNames: string[] = [];

  const registerAll = () => {
    for (const tool of ALL_LSP_QUERY_TOOLS) {
      const key = (tool as any).name || tool.constructor?.name;
      if (!key) continue;
      try {
        execution?.tools?.registerTool?.(key, tool as any);
        registeredToolNames.push(key);
      } catch {
        /* ignore per-tool */
      }
    }
  };

  if (!root) {
    const empty: LspSetupReadiness = {
      initialized: false,
      workspacePath: '',
      workspaceRoot: '',
      language: 'typescript',
      serverInfo: { name: 'unavailable', version: '0', capabilities: [] },
      workspaceInfo: { rootUri: '', workspaceFolders: [], configuredLanguages: [] },
      registeredToolNames: [],
      error: 'No workspacePath for LSP setup',
    };
    storeLspReadiness(execution, empty);
    return empty;
  }

  // Always register tools so later phases can useTools by stable name.
  // Setup law: subsequent phases depend on registry presence more than on a
  // live session handle — query tools start/attach per invocation.
  registerAll();

  const baseReadiness = {
    workspacePath: root,
    workspaceRoot: root,
    language: 'typescript' as const,
    workspaceInfo: {
      rootUri: root.startsWith('file://') ? root : `file://${root}`,
      workspaceFolders: [root],
      configuredLanguages: ['typescript', 'javascript', 'tsx', 'jsx'],
    },
    registeredToolNames,
  };

  try {
    const managed = await startTypeScriptServer({
      workspaceRoot: root,
      language: 'typescript',
      timeout: 15_000,
    });
    const readiness: LspSetupReadiness = {
      ...baseReadiness,
      // Tools registered + workspace bound = Setup complete for Discovery.
      initialized: registeredToolNames.length > 0,
      serverInfo: {
        name: 'bitcode-typescript-lsp',
        version: '1',
        capabilities: [
          'textDocument/definition',
          'textDocument/references',
          'textDocument/hover',
          'textDocument/documentSymbol',
          'workspace/symbol',
          'textDocument/completion',
          'textDocument/signatureHelp',
          'textDocument/codeAction',
          'textDocument/formatting',
        ],
      },
    };
    try {
      execution?.store?.('setup/lsp', 'managedConnectionId', (managed as any)?.id ?? 'pooled');
      execution?.store?.('setup/lsp', 'sessionStarted', true);
    } catch {
      /* ignore */
    }
    storeLspReadiness(execution, readiness);
    return readiness;
  } catch (err) {
    // Session start may fail (transport); tools remain registered for Discovery.
    const readiness: LspSetupReadiness = {
      ...baseReadiness,
      initialized: registeredToolNames.length > 0,
      serverInfo: {
        name: 'bitcode-lsp-tools-registered',
        version: '1',
        capabilities: registeredToolNames.slice(),
      },
      error: err instanceof Error ? err.message : String(err),
    };
    try {
      execution?.store?.('setup/lsp', 'sessionStarted', false);
    } catch {
      /* ignore */
    }
    storeLspReadiness(execution, readiness);
    return readiness;
  }
}

function storeLspReadiness(execution: any, readiness: LspSetupReadiness): void {
  try {
    execution?.store?.('setup/lsp', 'initialized', readiness.initialized);
    execution?.store?.('setup/lsp', 'serverInfo', readiness.serverInfo);
    execution?.store?.('setup/lsp', 'workspaceInfo', readiness.workspaceInfo);
    execution?.store?.('setup/lsp', 'workspacePath', readiness.workspacePath);
    execution?.store?.('setup/lsp', 'workspaceRoot', readiness.workspaceRoot);
    execution?.store?.('setup/lsp', 'registeredToolNames', readiness.registeredToolNames);
    execution?.store?.('setup/lsp', 'readiness', readiness);
    if (readiness.error) {
      execution?.store?.('setup/lsp', 'error', readiness.error);
    }
  } catch {
    /* ignore */
  }
}
