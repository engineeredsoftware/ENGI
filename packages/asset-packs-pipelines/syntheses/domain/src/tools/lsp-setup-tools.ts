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

import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { Tool } from '@bitcode/tools-generics';
import type { Prompt } from '@bitcode/prompts/prompt';
import {
  detectLanguage,
  listDetectableLanguages,
  startWorkspaceLanguageServers,
  resolveServersForLanguages,
} from '@bitcode/lsp';

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
  /** Primary language hint (first detected); not an exclusive allowlist. */
  language: string;
  /** All languages detected under the checkout (Setup must support all of them). */
  detectedLanguages: string[];
  /** Language servers that successfully completed LSP initialize. */
  startedServers?: Array<{ serverId: string; languages: string[]; command: string }>;
  /** Detected languages whose server binary was missing. */
  unavailableServers?: Array<{ languageId: string; serverId?: string; reason: string }>;
  /** Server start attempts that failed after binary resolve. */
  failedServers?: Array<{ serverId: string; languageId: string; error: string }>;
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
  /** True when at least one real language-server session started. */
  sessionStarted?: boolean;
  error?: string;
};

/**
 * Scan checkout for language ids (extension map). Caps depth for large monorepos.
 */
export function detectWorkspaceLanguages(
  workspaceRoot: string,
  options?: { maxFiles?: number; maxDepth?: number },
): string[] {
  const maxFiles = options?.maxFiles ?? 4000;
  const maxDepth = options?.maxDepth ?? 8;
  const found = new Set<string>();
  let seen = 0;

  const walk = (dir: string, depth: number) => {
    if (seen >= maxFiles || depth > maxDepth) return;
    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (seen >= maxFiles) return;
      if (
        name === 'node_modules' ||
        name === '.git' ||
        name === 'dist' ||
        name === 'build' ||
        name === 'target' ||
        name === 'vendor' ||
        name === '.next' ||
        name === 'coverage'
      ) {
        continue;
      }
      const full = path.join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        walk(full, depth + 1);
      } else if (st.isFile()) {
        seen += 1;
        const lang = detectLanguage(full);
        if (lang && lang !== 'plaintext') found.add(lang);
      }
    }
  };

  try {
    walk(workspaceRoot, 0);
  } catch {
    /* ignore */
  }
  if (found.size === 0) {
    // Still advertise the detectable universe for multi-language Setup.
    return listDetectableLanguages();
  }
  return Array.from(found).sort();
}

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
      language: 'plaintext',
      detectedLanguages: listDetectableLanguages(),
      serverInfo: { name: 'unavailable', version: '0', capabilities: [] },
      workspaceInfo: { rootUri: '', workspaceFolders: [], configuredLanguages: [] },
      registeredToolNames: [],
      sessionStarted: false,
      error: 'No workspacePath for LSP setup',
    };
    storeLspReadiness(execution, empty);
    return empty;
  }

  // Always register tools so later phases can useTools by stable name.
  // Setup law: subsequent phases depend on registry presence more than on a
  // live session handle — query tools start/attach per invocation.
  registerAll();

  const detectedLanguages = detectWorkspaceLanguages(root);
  const primaryLanguage = detectedLanguages[0] || 'plaintext';

  const baseReadiness = {
    workspacePath: root,
    workspaceRoot: root,
    language: primaryLanguage,
    detectedLanguages,
    workspaceInfo: {
      rootUri: root.startsWith('file://') ? root : `file://${root}`,
      workspaceFolders: [root],
      // All languages present in checkout (and detectable universe if empty tree).
      configuredLanguages: detectedLanguages,
    },
    registeredToolNames,
  };

  try {
    // Prefer languages actually present; always attempt TS/JS server (bundled dep)
    // so Discovery has at least one live session on typical checkouts.
    const languagesToStart = Array.from(
      new Set([
        ...detectedLanguages,
        'typescript',
        'javascript',
        primaryLanguage,
      ].filter((l) => l && l !== 'plaintext')),
    );

    const multi = await startWorkspaceLanguageServers(root, languagesToStart, 20_000);
    const sessionStarted = multi.started.length > 0;
    const capabilityList = [
      'textDocument/definition',
      'textDocument/references',
      'textDocument/hover',
      'textDocument/documentSymbol',
      'workspace/symbol',
      'textDocument/completion',
      'textDocument/signatureHelp',
      'textDocument/codeAction',
      'textDocument/formatting',
      `languages:${detectedLanguages.join(',')}`,
      `servers:${multi.started.map((s) => s.serverId).join(',') || 'none'}`,
    ];

    const readiness: LspSetupReadiness = {
      ...baseReadiness,
      // Tools registered for Discovery; sessionStarted reflects real stdio clients.
      initialized: registeredToolNames.length > 0,
      sessionStarted,
      startedServers: multi.started,
      unavailableServers: multi.unavailable,
      failedServers: multi.failed,
      serverInfo: {
        name: sessionStarted
          ? `bitcode-multi-language-lsp(${multi.started.map((s) => s.serverId).join('+')})`
          : 'bitcode-lsp-tools-registered',
        version: '1',
        capabilities: capabilityList,
      },
      error:
        !sessionStarted && (multi.failed.length || multi.unavailable.length)
          ? [
              ...multi.failed.map((f) => `${f.serverId}: ${f.error}`),
              ...multi.unavailable.map((u) => `${u.languageId}: ${u.reason}`),
            ]
              .slice(0, 8)
              .join('; ')
          : undefined,
    };

    try {
      execution?.store?.('setup/lsp', 'startedServers', multi.started);
      execution?.store?.('setup/lsp', 'unavailableServers', multi.unavailable);
      execution?.store?.('setup/lsp', 'failedServers', multi.failed);
      execution?.store?.('setup/lsp', 'sessionStarted', sessionStarted);
      execution?.store?.('setup/lsp', 'detectedLanguages', detectedLanguages);
      // Resolution preview helps Discovery know which languages have live servers.
      execution?.store?.(
        'setup/lsp',
        'serverResolution',
        resolveServersForLanguages(languagesToStart, { workspaceRoot: root }),
      );
    } catch {
      /* ignore */
    }
    storeLspReadiness(execution, readiness);
    return readiness;
  } catch (err) {
    // Unexpected failure: tools remain registered; Discovery can still try per-file spawn.
    const readiness: LspSetupReadiness = {
      ...baseReadiness,
      initialized: registeredToolNames.length > 0,
      sessionStarted: false,
      serverInfo: {
        name: 'bitcode-lsp-tools-registered',
        version: '1',
        capabilities: [
          ...registeredToolNames.slice(),
          `languages:${detectedLanguages.join(',')}`,
        ],
      },
      error: err instanceof Error ? err.message : String(err),
    };
    try {
      execution?.store?.('setup/lsp', 'sessionStarted', false);
      execution?.store?.('setup/lsp', 'detectedLanguages', detectedLanguages);
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
    execution?.store?.('setup/lsp', 'detectedLanguages', readiness.detectedLanguages);
    execution?.store?.('setup/lsp', 'language', readiness.language);
    execution?.store?.('setup/lsp', 'sessionStarted', readiness.sessionStarted ?? false);
    execution?.store?.('setup/lsp', 'startedServers', readiness.startedServers ?? []);
    execution?.store?.('setup/lsp', 'readiness', readiness);
    if (readiness.error) {
      execution?.store?.('setup/lsp', 'error', readiness.error);
    }
  } catch {
    /* ignore */
  }
}
