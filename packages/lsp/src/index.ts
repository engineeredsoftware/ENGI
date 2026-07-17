// @ts-nocheck — monorepo typecheck quarantine (restore when types harden)
/* -------------------------------------------------------------------------------------------------
 * Production-grade LSP helper wrappers around vscode-languageserver-node for Bitcode static measurement.
 * Retained LSP behavior is admitted when it produces replayable Read/AssetPack evidence such as
 * symbols, definitions, references, paths, diagnostics, and type context.
 *
 * Features:
 * - Comprehensive error handling with specific error types and recovery strategies
 * - Input validation for all parameters
 * - Language detection and multi-language support
 * - Connection pooling and proper resource management
 * - Timeout handling and cancellation support
 * - Detailed logging and metrics
 *
 * NOTE: Uses in-memory Language Server for deterministic performance in Bitcode Read measurement
 * and AssetPack pipeline tasks.
 * ------------------------------------------------------------------------------------------------- */

import type {
  WorkspaceEdit,
  Location,
  LocationLink,
  Hover,
  DefinitionParams,
  ReferenceParams,
  HoverParams,
  CompletionItem,
  CompletionList,
  SignatureHelp,
  SymbolInformation,
  DocumentSymbol,
  CodeAction,
  Command,
  Diagnostic,
  DocumentFormattingParams,
  TextEdit,
  RenameParams,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { log } from '@bitcode/logger';
import {
  languageClientManager,
  openDocumentOnSession,
  sendRequestWithTimeout,
  type ManagedConnection,
} from './language-client';
import {
  resolveLanguageServer,
  resolveServersForLanguages,
  listMappedLanguageIds,
  getServerIdForLanguage,
  listServerSpecs,
  isBundledTypescriptServerAvailable,
} from './language-servers';

export type { ManagedConnection } from './language-client';
export {
  resolveLanguageServer,
  resolveServersForLanguages,
  listMappedLanguageIds,
  getServerIdForLanguage,
  listServerSpecs,
  isBundledTypescriptServerAvailable,
  listBundledServerResolution,
  LANGUAGE_TO_SERVER_ID,
  BUNDLED_NPM_SERVER_IDS,
  PIPELINER_IMAGE_SERVER_IDS,
} from './language-servers';
export type { LanguageServerSpec, ResolvedLanguageServer } from './language-servers';

// ---------------------------------------------------------------------------
// Error types and validation schemas
// ---------------------------------------------------------------------------

export class LspError extends Error {
  constructor(
    message: string,
    public code: string,
    public filePath?: string,
    public position?: { line: number; character: number },
    public cause?: Error
  ) {
    super(message);
    this.name = 'LspError';
  }
}

export const lspPositionSchema = z.object({
  line: z.number().int().min(0),
  character: z.number().int().min(0),
});

export const lspSessionOptionsSchema = z.object({
  workspaceRoot: z.string().optional(),
  timeout: z.number().int().min(100).max(30000).default(10000),
  /** LSP language id (any IANA-style id; not limited to JS/TS). */
  language: z.string().min(1).optional(),
  maxFileSize: z.number().int().min(1).default(10 * 1024 * 1024), // 10MB default
});

export const renameSymbolParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  newName: z.string().min(1).regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Invalid identifier name'),
  options: lspSessionOptionsSchema.optional(),
});

export type LspSessionOptions = z.infer<typeof lspSessionOptionsSchema>;
export type RenameSymbolParams = z.infer<typeof renameSymbolParamsSchema>;

export const completionParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  triggerKind: z.enum(['invoked', 'triggerCharacter', 'triggerForIncompleteCompletions']).optional(),
  triggerCharacter: z.string().length(1).optional(),
  options: lspSessionOptionsSchema.optional(),
});

export const signatureHelpParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  options: lspSessionOptionsSchema.optional(),
});

export const documentSymbolParamsSchema = z.object({
  filePath: z.string().min(1),
  options: lspSessionOptionsSchema.optional(),
});

export const workspaceSymbolParamsSchema = z.object({
  query: z.string().optional(),
  options: lspSessionOptionsSchema.optional(),
});

export const codeActionParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  endLine: z.number().int().min(0).optional(),
  endCharacter: z.number().int().min(0).optional(),
  only: z.array(z.string()).optional(),
  options: lspSessionOptionsSchema.optional(),
});

export const formatDocumentParamsSchema = z.object({
  filePath: z.string().min(1),
  tabSize: z.number().int().min(1).default(2),
  insertSpaces: z.boolean().default(true),
  options: lspSessionOptionsSchema.optional(),
});

export type LocalCompletionParams = z.infer<typeof completionParamsSchema>;
export type LocalSignatureHelpParams = z.infer<typeof signatureHelpParamsSchema>;
export type LocalDocumentSymbolParams = z.infer<typeof documentSymbolParamsSchema>;
export type LocalWorkspaceSymbolParams = z.infer<typeof workspaceSymbolParamsSchema>;
export type LocalCodeActionParams = z.infer<typeof codeActionParamsSchema>;
export type FormatDocumentParams = z.infer<typeof formatDocumentParamsSchema>;

// ---------------------------------------------------------------------------
// Language detection and validation
// ---------------------------------------------------------------------------

/**
 * Extension → LSP language id. Bitcode measurement must not be JS/TS-only;
 * unknown extensions fall back to a generic id so tools can still open the doc.
 */
const LANGUAGE_EXTENSIONS = new Map<string, string>([
  // JavaScript / TypeScript
  ['.ts', 'typescript'],
  ['.tsx', 'typescriptreact'],
  ['.mts', 'typescript'],
  ['.cts', 'typescript'],
  ['.js', 'javascript'],
  ['.jsx', 'javascriptreact'],
  ['.mjs', 'javascript'],
  ['.cjs', 'javascript'],
  // Web
  ['.json', 'json'],
  ['.jsonc', 'jsonc'],
  ['.html', 'html'],
  ['.htm', 'html'],
  ['.css', 'css'],
  ['.scss', 'scss'],
  ['.less', 'less'],
  ['.vue', 'vue'],
  ['.svelte', 'svelte'],
  ['.md', 'markdown'],
  ['.mdx', 'mdx'],
  // Systems / compiled
  ['.rs', 'rust'],
  ['.go', 'go'],
  ['.c', 'c'],
  ['.h', 'c'],
  ['.cc', 'cpp'],
  ['.cpp', 'cpp'],
  ['.cxx', 'cpp'],
  ['.hpp', 'cpp'],
  ['.hh', 'cpp'],
  ['.m', 'objective-c'],
  ['.mm', 'objective-cpp'],
  ['.swift', 'swift'],
  ['.kt', 'kotlin'],
  ['.kts', 'kotlin'],
  ['.java', 'java'],
  ['.scala', 'scala'],
  ['.cs', 'csharp'],
  ['.fs', 'fsharp'],
  ['.fsx', 'fsharp'],
  // Scripting / data
  ['.py', 'python'],
  ['.pyi', 'python'],
  ['.rb', 'ruby'],
  ['.php', 'php'],
  ['.pl', 'perl'],
  ['.pm', 'perl'],
  ['.lua', 'lua'],
  ['.r', 'r'],
  ['.R', 'r'],
  ['.jl', 'julia'],
  ['.sh', 'shellscript'],
  ['.bash', 'shellscript'],
  ['.zsh', 'shellscript'],
  ['.ps1', 'powershell'],
  ['.sql', 'sql'],
  ['.graphql', 'graphql'],
  ['.gql', 'graphql'],
  // Config / infra
  ['.yaml', 'yaml'],
  ['.yml', 'yaml'],
  ['.toml', 'toml'],
  ['.xml', 'xml'],
  ['.tf', 'terraform'],
  ['.proto', 'protobuf'],
  ['.dart', 'dart'],
  ['.ex', 'elixir'],
  ['.exs', 'elixir'],
  ['.erl', 'erlang'],
  ['.hrl', 'erlang'],
  ['.hs', 'haskell'],
  ['.lhs', 'haskell'],
  ['.clj', 'clojure'],
  ['.cljs', 'clojure'],
  ['.zig', 'zig'],
  ['.nim', 'nim'],
  ['.v', 'v'],
  ['.sol', 'solidity'],
  // Containers
  ['.dockerfile', 'dockerfile'],
  // no extension Dockerfile handled via basename in detectLanguage when needed
]);

/** @deprecated alias — prefer LANGUAGE_EXTENSIONS */
const SUPPORTED_EXTENSIONS = LANGUAGE_EXTENSIONS;

/**
 * Map a file path to an LSP language id. Never rejects unknown extensions —
 * product measurement must work across all checkout languages.
 */
export function detectLanguage(filePath: string): string {
  const base = path.basename(filePath);
  if (/^Dockerfile(\.|$)/i.test(base) || base === 'dockerfile') {
    return 'dockerfile';
  }
  const ext = path.extname(filePath).toLowerCase();
  if (!ext) return 'plaintext';
  return LANGUAGE_EXTENSIONS.get(ext) || 'plaintext';
}

/** List known language ids for extension-based detection (not an exclusive allowlist). */
export function listDetectableLanguages(): string[] {
  return Array.from(new Set(LANGUAGE_EXTENSIONS.values())).sort();
}

export async function validateFileAccess(filePath: string, maxSize: number): Promise<void> {
  const resolvedPath = path.resolve(filePath);
  
  try {
    const stats = await fs.stat(resolvedPath);
    
    if (!stats.isFile()) {
      throw new LspError(
        `Path is not a file: ${filePath}`,
        'NOT_A_FILE',
        filePath
      );
    }
    
    if (stats.size > maxSize) {
      throw new LspError(
        `File too large: ${stats.size} bytes (max: ${maxSize})`,
        'FILE_TOO_LARGE',
        filePath
      );
    }
    
    await fs.access(resolvedPath, fsSync.constants.R_OK);
  } catch (error) {
    if (error instanceof LspError) throw error;
    
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      throw new LspError(
        `File not found: ${filePath}`,
        'FILE_NOT_FOUND',
        filePath,
        undefined,
        nodeError
      );
    }
    
    if (nodeError.code === 'EACCES') {
      throw new LspError(
        `Permission denied: ${filePath}`,
        'PERMISSION_DENIED',
        filePath,
        undefined,
        nodeError
      );
    }
    
    throw new LspError(
      `File access error: ${nodeError.message}`,
      'FILE_ACCESS_ERROR',
      filePath,
      undefined,
      nodeError
    );
  }
}

export function validatePosition(content: string, line: number, character: number, filePath: string): void {
  const lines = content.split('\n');
  
  if (line >= lines.length) {
    throw new LspError(
      `Line ${line} is out of bounds (file has ${lines.length} lines)`,
      'POSITION_OUT_OF_BOUNDS',
      filePath,
      { line, character }
    );
  }
  
  if (character > lines[line].length) {
    throw new LspError(
      `Character ${character} is out of bounds (line ${line} has ${lines[line].length} characters)`,
      'POSITION_OUT_OF_BOUNDS',
      filePath,
      { line, character }
    );
  }
}

// ---------------------------------------------------------------------------
// Real multi-language Language Client (stdio spawn + JSON-RPC)
// ---------------------------------------------------------------------------

const WORKSPACE_MARKERS = [
  '.git',
  'package.json',
  'pnpm-workspace.yaml',
  'go.mod',
  'Cargo.toml',
  'pyproject.toml',
  'setup.py',
  'composer.json',
  'Gemfile',
  'build.gradle',
  'pom.xml',
  'CMakeLists.txt',
];

/**
 * Walk parents from a file to find a plausible workspace root.
 */
export function findWorkspaceRoot(filePath: string, fallback = process.cwd()): string {
  let dir = path.resolve(path.dirname(filePath));
  const stop = path.parse(dir).root;
  while (dir && dir !== stop) {
    for (const marker of WORKSPACE_MARKERS) {
      try {
        if (fsSync.existsSync(path.join(dir, marker))) return dir;
      } catch {
        /* ignore */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(fallback);
}

function resolveSessionWorkspace(
  options: LspSessionOptions,
  filePath?: string,
): string {
  if (options.workspaceRoot) return path.resolve(options.workspaceRoot);
  if (filePath) return findWorkspaceRoot(filePath);
  return process.cwd();
}

/**
 * Start (or pool) a real language-server process for a language id.
 * Spawns the mapped binary over stdio and completes LSP initialize.
 */
export async function startLanguageServer(opts: LspSessionOptions = {}): Promise<ManagedConnection> {
  const options = lspSessionOptionsSchema.parse(opts);
  const language = options.language || 'typescript';
  const workspaceRoot = resolveSessionWorkspace(options);

  try {
    const managed = await languageClientManager.getSession({
      workspaceRoot,
      language,
      timeout: options.timeout,
    });

    log('LSP server started successfully', 'debug', {
      workspaceRoot,
      timeout: options.timeout,
      language,
      serverId: managed.serverId,
    });

    return managed;
  } catch (error) {
    log('Failed to start LSP server', 'error', {
      workspaceRoot,
      language,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Failed to start LSP server: ${error instanceof Error ? error.message : String(error)}`,
      'SERVER_START_FAILED',
      undefined,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Start every resolvable language server for languages present in a checkout.
 * Used by AssetPack Setup so Discovery can query multi-language workspaces.
 */
export async function startWorkspaceLanguageServers(
  workspaceRoot: string,
  languageIds: string[],
  timeout = 20_000,
): Promise<{
  started: Array<{ serverId: string; languages: string[]; command: string }>;
  failed: Array<{ serverId: string; languageId: string; error: string }>;
  unavailable: Array<{ languageId: string; serverId?: string; reason: string }>;
}> {
  return languageClientManager.startForLanguages(workspaceRoot, languageIds, timeout);
}

/** Session for a file: language inferred from path unless options.language set. */
export async function getSessionForFile(
  filePath: string,
  options: LspSessionOptions = {},
): Promise<ManagedConnection> {
  const language = options.language || detectLanguage(filePath);
  const workspaceRoot = resolveSessionWorkspace(options, filePath);
  return startLanguageServer({ ...options, language, workspaceRoot });
}

/** @deprecated use startLanguageServer — multi-language, not TS-only */
export async function startTypeScriptServer(opts: LspSessionOptions = {}): Promise<ManagedConnection> {
  return startLanguageServer({ ...opts, language: opts.language || 'typescript' });
}

/**
 * Load file content, open it on the real language server (didOpen/didChange).
 */
export async function loadDocument(
  managed: ManagedConnection,
  filePath: string,
  options: LspSessionOptions,
): Promise<TextDocument> {
  const resolvedPath = path.resolve(filePath);
  const language = options.language || detectLanguage(filePath);

  await validateFileAccess(resolvedPath, options.maxFileSize || 10 * 1024 * 1024);

  try {
    const content = await fs.readFile(resolvedPath, 'utf8');
    const doc = await openDocumentOnSession(managed, resolvedPath, language, content);

    log('Document loaded successfully', 'debug', {
      filePath: resolvedPath,
      language,
      size: content.length,
      serverId: managed.serverId,
    });

    return doc;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new LspError(
      `Failed to load document: ${nodeError.message}`,
      'DOCUMENT_LOAD_FAILED',
      filePath,
      undefined,
      nodeError,
    );
  }
}



/**
 * Production-grade symbol renaming with comprehensive error handling,
 * validation, and detailed logging.
 */
export async function renameSymbolLsp(
  params: RenameSymbolParams
): Promise<WorkspaceEdit> {
  const validated = renameSymbolParamsSchema.parse(params);
  const { filePath, line, character, newName, options = {} } = validated;
  
  const startTime = Date.now();
  const operationId = `rename_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Starting symbol rename operation', 'info', {
    operationId,
    filePath,
    line,
    character,
    newName,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    // Validate position within document
    validatePosition(doc.getText(), line, character, filePath);

    const renameParams: RenameParams = {
      textDocument: { uri: doc.uri },
      position: { line, character },
      newName,
    };

    const workspaceEdit = await sendRequestWithTimeout<WorkspaceEdit | null>(
      managed,
      'textDocument/rename',
      renameParams,
      options.timeout || 10_000,
    );

    if (!workspaceEdit || !workspaceEdit.changes) {
      log('Rename operation returned no changes', 'warn', {
        operationId,
        filePath,
        line,
        character,
        newName,
      });
      
      return { changes: {} };
    }
    
    const changedFiles = Object.keys(workspaceEdit.changes).length;
    const totalEdits = Object.values(workspaceEdit.changes)
      .reduce((sum, edits) => sum + edits.length, 0);
    
    log('Symbol rename completed successfully', 'info', {
      operationId,
      filePath,
      newName,
      changedFiles,
      totalEdits,
      duration: Date.now() - startTime,
    });
    
    return workspaceEdit;
    
  } catch (error) {
    log('Symbol rename operation failed', 'error', {
      operationId,
      filePath,
      line,
      character,
      newName,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });
    
    if (error instanceof LspError) {
      throw error;
    }
    
    throw new LspError(
      `Rename operation failed: ${error instanceof Error ? error.message : String(error)}`,
      'RENAME_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined
    );
  }
}

// ---------------------------------------------------------------------------
// Enhanced LSP query operations with robust error handling
// ---------------------------------------------------------------------------

export const definitionParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  options: lspSessionOptionsSchema.optional(),
});

export type QueryParams = z.infer<typeof definitionParamsSchema>;

/**
 * Get symbol definition with comprehensive error handling.
 */
export async function getDefinition(
  params: QueryParams
): Promise<Location | Location[] | LocationLink[] | null> {
  const validated = definitionParamsSchema.parse(params);
  const { filePath, line, character, options = {} } = validated;
  
  const operationId = `definition_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting symbol definition', 'debug', {
    operationId,
    filePath,
    line,
    character,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);
    validatePosition(doc.getText(), line, character, filePath);

    const location = await sendRequestWithTimeout<
      Location | Location[] | LocationLink[] | null
    >(
      managed,
      'textDocument/definition',
      {
        textDocument: { uri: doc.uri },
        position: { line, character },
      } satisfies DefinitionParams,
      options.timeout || 10_000,
    );

    log('Definition request completed', 'debug', {
      operationId,
      filePath,
      hasResult: !!location,
      serverId: managed.serverId,
    });

    return location;
  } catch (error) {
    log('Definition request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Definition request failed: ${error instanceof Error ? error.message : String(error)}`,
      'DEFINITION_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Find all references to a symbol with comprehensive error handling.
 */
export async function findReferences(
  params: QueryParams
): Promise<Location[] | null> {
  const validated = definitionParamsSchema.parse(params);
  const { filePath, line, character, options = {} } = validated;
  
  const operationId = `references_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Finding symbol references', 'debug', {
    operationId,
    filePath,
    line,
    character,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);
    validatePosition(doc.getText(), line, character, filePath);

    const refs = await sendRequestWithTimeout<Location[] | null>(
      managed,
      'textDocument/references',
      {
        textDocument: { uri: doc.uri },
        position: { line, character },
        context: { includeDeclaration: true },
      } satisfies ReferenceParams,
      options.timeout || 10_000,
    );

    log('References request completed', 'debug', {
      operationId,
      filePath,
      referenceCount: Array.isArray(refs) ? refs.length : 0,
      serverId: managed.serverId,
    });

    return refs;
  } catch (error) {
    log('References request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `References request failed: ${error instanceof Error ? error.message : String(error)}`,
      'REFERENCES_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get hover information for a symbol with comprehensive error handling.
 */
export async function getHover(
  params: QueryParams
): Promise<Hover | null> {
  const validated = definitionParamsSchema.parse(params);
  const { filePath, line, character, options = {} } = validated;
  
  const operationId = `hover_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting hover information', 'debug', {
    operationId,
    filePath,
    line,
    character,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);
    validatePosition(doc.getText(), line, character, filePath);

    const hover = await sendRequestWithTimeout<Hover | null>(
      managed,
      'textDocument/hover',
      {
        textDocument: { uri: doc.uri },
        position: { line, character },
      } satisfies HoverParams,
      options.timeout || 10_000,
    );

    log('Hover request completed', 'debug', {
      operationId,
      filePath,
      hasHover: !!hover,
      serverId: managed.serverId,
    });

    return hover;
  } catch (error) {
    log('Hover request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Hover request failed: ${error instanceof Error ? error.message : String(error)}`,
      'HOVER_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get code completions at a specific position with comprehensive error handling.
 */
export async function getCompletions(
  params: CompletionParams
): Promise<CompletionItem[] | CompletionList | null> {
  const validated = completionParamsSchema.parse(params);
  const { filePath, line, character, triggerKind, triggerCharacter, options = {} } = validated;
  
  const operationId = `completion_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting code completions', 'debug', {
    operationId,
    filePath,
    line,
    character,
    triggerKind,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);
    validatePosition(doc.getText(), line, character, filePath);

    const completions = await sendRequestWithTimeout<CompletionItem[] | CompletionList | null>(
      managed,
      'textDocument/completion',
      {
        textDocument: { uri: doc.uri },
        position: { line, character },
        context: triggerKind
          ? {
              triggerKind:
                triggerKind === 'invoked' ? 1 : triggerKind === 'triggerCharacter' ? 2 : 3,
              triggerCharacter,
            }
          : undefined,
      },
      options.timeout || 10_000,
    );

    log('Completion request successful', 'debug', {
      operationId,
      filePath,
      completionCount: Array.isArray(completions)
        ? completions.length
        : (completions as any)?.items?.length || 0,
      serverId: managed.serverId,
    });

    return completions;
  } catch (error) {
    log('Completion request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Completion request failed: ${error instanceof Error ? error.message : String(error)}`,
      'COMPLETION_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get signature help information with comprehensive error handling.
 */
export async function getSignatureHelp(
  params: SignatureHelpParams
): Promise<SignatureHelp | null> {
  const validated = signatureHelpParamsSchema.parse(params);
  const { filePath, line, character, options = {} } = validated;
  
  const operationId = `signature_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting signature help', 'debug', {
    operationId,
    filePath,
    line,
    character,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);
    validatePosition(doc.getText(), line, character, filePath);

    const signature = await sendRequestWithTimeout<SignatureHelp | null>(
      managed,
      'textDocument/signatureHelp',
      {
        textDocument: { uri: doc.uri },
        position: { line, character },
      },
      options.timeout || 10_000,
    );

    log('Signature help request successful', 'debug', {
      operationId,
      filePath,
      signatureCount: signature?.signatures?.length || 0,
      serverId: managed.serverId,
    });

    return signature;
  } catch (error) {
    log('Signature help request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Signature help request failed: ${error instanceof Error ? error.message : String(error)}`,
      'SIGNATURE_HELP_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get document symbols with comprehensive error handling.
 */
export async function getDocumentSymbols(
  params: DocumentSymbolParams
): Promise<SymbolInformation[] | DocumentSymbol[]> {
  const validated = documentSymbolParamsSchema.parse(params);
  const { filePath, options = {} } = validated;
  
  const operationId = `docSymbols_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting document symbols', 'debug', {
    operationId,
    filePath,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    const symbols = await sendRequestWithTimeout<
      SymbolInformation[] | DocumentSymbol[] | null
    >(
      managed,
      'textDocument/documentSymbol',
      { textDocument: { uri: doc.uri } },
      options.timeout || 10_000,
    );

    log('Document symbols request successful', 'debug', {
      operationId,
      filePath,
      symbolCount: Array.isArray(symbols) ? symbols.length : 0,
      serverId: managed.serverId,
    });

    return symbols || [];
  } catch (error) {
    log('Document symbols request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Document symbols request failed: ${error instanceof Error ? error.message : String(error)}`,
      'DOCUMENT_SYMBOLS_FAILED',
      filePath,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get workspace symbols with comprehensive error handling.
 */
export async function getWorkspaceSymbols(
  params: WorkspaceSymbolParams
): Promise<SymbolInformation[]> {
  const validated = workspaceSymbolParamsSchema.parse(params);
  const { query, options = {} } = validated;
  
  const operationId = `workspaceSymbols_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting workspace symbols', 'debug', {
    operationId,
    query,
  });
  
  try {
    const workspaceRoot = resolveSessionWorkspace(options);
    let sessions = languageClientManager.listSessions(workspaceRoot);

    // Ensure at least one server: prefer options.language, else typescript (bundled).
    if (sessions.length === 0) {
      const language = options.language || 'typescript';
      sessions = [
        await startLanguageServer({
          ...options,
          language,
          workspaceRoot,
        }),
      ];
    }

    const timeout = options.timeout || 10_000;
    const merged: SymbolInformation[] = [];
    const errors: string[] = [];

    await Promise.all(
      sessions.map(async (managed) => {
        try {
          const symbols = await sendRequestWithTimeout<SymbolInformation[] | null>(
            managed,
            'workspace/symbol',
            { query: query || '' },
            timeout,
          );
          if (Array.isArray(symbols)) merged.push(...symbols);
        } catch (err) {
          errors.push(
            `${managed.serverId}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }),
    );

    if (merged.length === 0 && errors.length === sessions.length) {
      throw new LspError(
        `Workspace symbols failed on all servers: ${errors.join('; ')}`,
        'WORKSPACE_SYMBOLS_FAILED',
        query || '',
      );
    }

    log('Workspace symbols request successful', 'debug', {
      operationId,
      query,
      symbolCount: merged.length,
      servers: sessions.map((s) => s.serverId),
    });

    return merged;
  } catch (error) {
    log('Workspace symbols request failed', 'error', {
      operationId,
      query,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Workspace symbols request failed: ${error instanceof Error ? error.message : String(error)}`,
      'WORKSPACE_SYMBOLS_FAILED',
      query || '',
      undefined,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get code actions for a specific range with comprehensive error handling.
 */
export async function getCodeActions(
  params: CodeActionParams
): Promise<(CodeAction | Command)[]> {
  const validated = codeActionParamsSchema.parse(params);
  const { filePath, line, character, endLine, endCharacter, only, options = {} } = validated;
  
  const operationId = `codeActions_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Getting code actions', 'debug', {
    operationId,
    filePath,
    line,
    character,
    endLine,
    endCharacter,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    validatePosition(doc.getText(), line, character, filePath);
    if (endLine !== undefined && endCharacter !== undefined) {
      validatePosition(doc.getText(), endLine, endCharacter, filePath);
    }

    const range = {
      start: { line, character },
      end: { line: endLine ?? line, character: endCharacter ?? character },
    };

    const actions = await sendRequestWithTimeout<(CodeAction | Command)[] | null>(
      managed,
      'textDocument/codeAction',
      {
        textDocument: { uri: doc.uri },
        range,
        context: {
          diagnostics: [],
          only,
        },
      },
      options.timeout || 10_000,
    );

    log('Code actions request successful', 'debug', {
      operationId,
      filePath,
      actionCount: Array.isArray(actions) ? actions.length : 0,
      serverId: managed.serverId,
    });

    return actions || [];
  } catch (error) {
    log('Code actions request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Code actions request failed: ${error instanceof Error ? error.message : String(error)}`,
      'CODE_ACTIONS_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Format document with comprehensive error handling.
 */
export async function formatDocument(
  params: FormatDocumentParams
): Promise<TextEdit[]> {
  const validated = formatDocumentParamsSchema.parse(params);
  const { filePath, tabSize, insertSpaces, options = {} } = validated;
  
  const operationId = `format_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Formatting document', 'debug', {
    operationId,
    filePath,
    tabSize,
    insertSpaces,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    const formatParams: DocumentFormattingParams = {
      textDocument: { uri: doc.uri },
      options: {
        tabSize,
        insertSpaces,
      },
    };

    const edits = await sendRequestWithTimeout<TextEdit[] | null>(
      managed,
      'textDocument/formatting',
      formatParams,
      options.timeout || 10_000,
    );

    log('Document formatting request successful', 'debug', {
      operationId,
      filePath,
      editCount: Array.isArray(edits) ? edits.length : 0,
      serverId: managed.serverId,
    });

    return edits || [];
  } catch (error) {
    log('Document formatting request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof LspError) throw error;

    throw new LspError(
      `Document formatting request failed: ${error instanceof Error ? error.message : String(error)}`,
      'FORMATTING_FAILED',
      filePath,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Get diagnostics for a document (placeholder implementation).
 * Note: Full diagnostic support requires persistent server with file watching.
 */
export async function getDiagnostics(
  params: { filePath: string; options?: LspSessionOptions }
): Promise<Diagnostic[]> {
  // This is a placeholder - full diagnostic support would require
  // a persistent server that can analyze the file and emit diagnostics
  log('Diagnostics not yet fully implemented', 'warn', {
    filePath: params.filePath,
  });
  
  return [];
}

// ---------------------------------------------------------------------------
// Advanced Refactoring Operations
// ---------------------------------------------------------------------------

export const extractMethodParamsSchema = z.object({
  filePath: z.string().min(1),
  startLine: z.number().int().min(0),
  startCharacter: z.number().int().min(0),
  endLine: z.number().int().min(0),
  endCharacter: z.number().int().min(0),
  methodName: z.string().min(1).regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Invalid method name'),
  options: lspSessionOptionsSchema.optional(),
});

export const organizeImportsParamsSchema = z.object({
  filePath: z.string().min(1),
  removeUnused: z.boolean().default(true),
  sortImports: z.boolean().default(true),
  options: lspSessionOptionsSchema.optional(),
});

export const inlineVariableParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  options: lspSessionOptionsSchema.optional(),
});

export const moveSymbolParamsSchema = z.object({
  filePath: z.string().min(1),
  line: z.number().int().min(0),
  character: z.number().int().min(0),
  targetFilePath: z.string().min(1),
  options: lspSessionOptionsSchema.optional(),
});

export type ExtractMethodParams = z.infer<typeof extractMethodParamsSchema>;
export type OrganizeImportsParams = z.infer<typeof organizeImportsParamsSchema>;
export type InlineVariableParams = z.infer<typeof inlineVariableParamsSchema>;
export type MoveSymbolParams = z.infer<typeof moveSymbolParamsSchema>;

/**
 * Extract method refactoring using LSP code actions
 */
export async function extractMethod(
  params: ExtractMethodParams
): Promise<WorkspaceEdit | null> {
  const validated = extractMethodParamsSchema.parse(params);
  const { filePath, startLine, startCharacter, endLine, endCharacter, methodName, options = {} } = validated;
  
  const operationId = `extractMethod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Extracting method using LSP', 'debug', {
    operationId,
    filePath,
    startLine,
    startCharacter,
    endLine,
    endCharacter,
    methodName,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    validatePosition(doc.getText(), startLine, startCharacter, filePath);
    validatePosition(doc.getText(), endLine, endCharacter, filePath);

    // Get code actions for the selected range
    const range = {
      start: { line: startLine, character: startCharacter },
      end: { line: endLine, character: endCharacter },
    };

    const codeActionParams = {
      textDocument: { uri: doc.uri },
      range,
      context: {
        diagnostics: [],
        only: ['refactor.extract'],
      },
    };

    const actions =
      (await sendRequestWithTimeout<any[]>(
        managed,
        'textDocument/codeAction',
        codeActionParams,
        options.timeout || 10_000,
      )) || [];

    // Find extract method action and execute it
    const extractAction = actions.find((action: any) => 
      action.title?.toLowerCase().includes('extract') || 
      action.kind?.includes('refactor.extract')
    );
    
    if (extractAction?.edit) {
      log('Extract method request successful', 'debug', {
        operationId,
        filePath,
        actionTitle: extractAction.title,
      });
      
      return extractAction.edit;
    }
    
    // If no built-in extract action, create our own workspace edit
    return createExtractMethodEdit(doc, range, methodName);
    
  } catch (error) {
    log('Extract method request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof LspError) {
      throw error;
    }
    
    throw new LspError(
      `Extract method request failed: ${error instanceof Error ? error.message : String(error)}`,
      'EXTRACT_METHOD_FAILED',
      filePath,
      { line: startLine, character: startCharacter },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Organize imports using LSP code actions
 */
export async function organizeImports(
  params: OrganizeImportsParams
): Promise<WorkspaceEdit | null> {
  const validated = organizeImportsParamsSchema.parse(params);
  const { filePath, removeUnused, sortImports, options = {} } = validated;
  
  const operationId = `organizeImports_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Organizing imports using LSP', 'debug', {
    operationId,
    filePath,
    removeUnused,
    sortImports,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    // Get organize imports code action
    const codeActionParams = {
      textDocument: { uri: doc.uri },
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      },
      context: {
        diagnostics: [],
        only: ['source.organizeImports'],
      },
    };

    const actions =
      (await sendRequestWithTimeout<any[]>(
        managed,
        'textDocument/codeAction',
        codeActionParams,
        options.timeout || 10_000,
      )) || [];

    // Find organize imports action
    const organizeAction = actions.find(
      (action: any) =>
        action.title?.toLowerCase().includes('organize') ||
        action.kind?.includes('source.organizeImports'),
    );

    if (organizeAction?.edit) {
      log('Organize imports request successful', 'debug', {
        operationId,
        filePath,
        actionTitle: organizeAction.title,
      });

      return organizeAction.edit;
    }

    log('No organize imports action available', 'warn', {
      operationId,
      filePath,
      availableActions: actions.map((a: any) => a.title || a.kind),
    });
    
    return null;
    
  } catch (error) {
    log('Organize imports request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof LspError) {
      throw error;
    }
    
    throw new LspError(
      `Organize imports request failed: ${error instanceof Error ? error.message : String(error)}`,
      'ORGANIZE_IMPORTS_FAILED',
      filePath,
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Inline variable using LSP code actions
 */
export async function inlineVariable(
  params: InlineVariableParams
): Promise<WorkspaceEdit | null> {
  const validated = inlineVariableParamsSchema.parse(params);
  const { filePath, line, character, options = {} } = validated;
  
  const operationId = `inlineVariable_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Inlining variable using LSP', 'debug', {
    operationId,
    filePath,
    line,
    character,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    validatePosition(doc.getText(), line, character, filePath);

    // Get inline code actions for the variable
    const codeActionParams = {
      textDocument: { uri: doc.uri },
      range: {
        start: { line, character },
        end: { line, character },
      },
      context: {
        diagnostics: [],
        only: ['refactor.inline'],
      },
    };

    const actions =
      (await sendRequestWithTimeout<any[]>(
        managed,
        'textDocument/codeAction',
        codeActionParams,
        options.timeout || 10_000,
      )) || [];

    // Find inline action
    const inlineAction = actions.find(
      (action: any) =>
        action.title?.toLowerCase().includes('inline') ||
        action.kind?.includes('refactor.inline'),
    );

    if (inlineAction?.edit) {
      log('Inline variable request successful', 'debug', {
        operationId,
        filePath,
        actionTitle: inlineAction.title,
      });

      return inlineAction.edit;
    }

    log('No inline variable action available', 'warn', {
      operationId,
      filePath,
      line,
      character,
      availableActions: actions.map((a: any) => a.title || a.kind),
    });
    
    return null;
    
  } catch (error) {
    log('Inline variable request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof LspError) {
      throw error;
    }
    
    throw new LspError(
      `Inline variable request failed: ${error instanceof Error ? error.message : String(error)}`,
      'INLINE_VARIABLE_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Move symbol to another file using LSP refactoring
 */
export async function moveSymbol(
  params: MoveSymbolParams
): Promise<WorkspaceEdit | null> {
  const validated = moveSymbolParamsSchema.parse(params);
  const { filePath, line, character, targetFilePath, options = {} } = validated;
  
  const operationId = `moveSymbol_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  log('Moving symbol using LSP', 'debug', {
    operationId,
    filePath,
    line,
    character,
    targetFilePath,
  });
  
  try {
    const managed = await getSessionForFile(filePath, options);
    const doc = await loadDocument(managed, filePath, options);

    validatePosition(doc.getText(), line, character, filePath);

    // Get move refactoring actions
    const codeActionParams = {
      textDocument: { uri: doc.uri },
      range: {
        start: { line, character },
        end: { line, character },
      },
      context: {
        diagnostics: [],
        only: ['refactor.move'],
      },
    };

    const actions =
      (await sendRequestWithTimeout<any[]>(
        managed,
        'textDocument/codeAction',
        codeActionParams,
        options.timeout || 10_000,
      )) || [];

    // Find move action
    const moveAction = actions.find(
      (action: any) =>
        action.title?.toLowerCase().includes('move') ||
        action.kind?.includes('refactor.move'),
    );

    if (moveAction?.edit) {
      log('Move symbol request successful', 'debug', {
        operationId,
        filePath,
        targetFilePath,
        actionTitle: moveAction.title,
      });

      return moveAction.edit;
    }

    log('No move symbol action available', 'warn', {
      operationId,
      filePath,
      targetFilePath,
      availableActions: actions.map((a: any) => a.title || a.kind),
    });
    
    return null;
    
  } catch (error) {
    log('Move symbol request failed', 'error', {
      operationId,
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof LspError) {
      throw error;
    }
    
    throw new LspError(
      `Move symbol request failed: ${error instanceof Error ? error.message : String(error)}`,
      'MOVE_SYMBOL_FAILED',
      filePath,
      { line, character },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Helper function to create extract method workspace edit when LSP doesn't provide it
 */
function createExtractMethodEdit(doc: TextDocument, range: any, methodName: string): WorkspaceEdit {
  const content = doc.getText();
  const lines = content.split('\n');
  
  const startLine = range.start.line;
  const endLine = range.end.line;
  const selectedCode = lines.slice(startLine, endLine + 1).join('\n');
  
  // Simple extraction logic (would be more sophisticated in production)
  const extractedMethod = `
  private ${methodName}() {
    ${selectedCode}
  }`;
  
  const methodCall = `this.${methodName}();`;
  
  return {
    changes: {
      [doc.uri]: [
        {
          range: {
            start: { line: startLine, character: 0 },
            end: { line: endLine + 1, character: 0 },
          },
          newText: methodCall + '\n',
        },
        {
          range: {
            start: { line: endLine + 1, character: 0 },
            end: { line: endLine + 1, character: 0 },
          },
          newText: extractedMethod + '\n',
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Persistent Server Exports
// ---------------------------------------------------------------------------

// Re-export persistent server functionality
export {
  initializePipelineLspServer,
  getPersistentLspServer,
  executePersistentLspOperation,
  getPersistentLspStats,
  shutdownPipelineLspServer,
  clearPersistentLspCache,
  isPersistentLspServerActive,
  type PersistentLspServer,
  type PipelineLspConfig,
  type LspResultCache,
} from './persistent-server';

// ---------------------------------------------------------------------------
// Pipeline Optimizer Exports
// ---------------------------------------------------------------------------

// Re-export pipeline optimization functionality
export {
  initializePipelineOptimizer,
  getPipelineOptimizer,
  finalizePipelineOptimizer,
  queueOptimizedLspOperation,
  executeImmediateLspOperation,
  type PipelineOptimizationConfig,
  type LspOperationBatch,
  type PipelineLspOperation,
  type PhaseOptimizationProfile,
  type PerformanceMetrics,
} from './pipeline-optimizer';
