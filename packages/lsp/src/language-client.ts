// @ts-nocheck — monorepo typecheck quarantine (restore when types harden)
/**
 * Real multi-language LSP client: spawn language-server binaries over stdio,
 * JSON-RPC initialize, document sync, and request/response.
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
  type MessageConnection,
} from 'vscode-jsonrpc/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { log } from '@bitcode/logger';
import {
  resolveLanguageServer,
  resolveServersForLanguages,
  getServerIdForLanguage,
  type ResolvedLanguageServer,
} from './language-servers';

export class LspClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'LspClientError';
  }
}

export type ManagedConnection = {
  connection: MessageConnection;
  languageId: string;
  serverId: string;
  workspaceRoot: string;
  serverCommand: string;
  serverArgs: string[];
  capabilities: any;
  openDocuments: Map<string, TextDocument>;
  cleanup: () => void;
  isDisposed: boolean;
  /** Compatibility shim used by older loadDocument call sites */
  documents: {
    get: (uri?: string) => TextDocument | undefined;
  };
  child?: ChildProcessWithoutNullStreams;
};

export type StartSessionOptions = {
  workspaceRoot?: string;
  language?: string;
  timeout?: number;
  commandOverride?: string;
  commandArgsOverride?: string[];
};

function toFileUri(filePath: string): string {
  return pathToFileURL(path.resolve(filePath)).href;
}

function clientCapabilities() {
  return {
    textDocument: {
      synchronization: { dynamicRegistration: false, didSave: true },
      definition: { linkSupport: true },
      references: {},
      hover: { contentFormat: ['markdown', 'plaintext'] },
      completion: {
        completionItem: {
          snippetSupport: true,
          documentationFormat: ['markdown', 'plaintext'],
        },
      },
      signatureHelp: {
        signatureInformation: {
          documentationFormat: ['markdown', 'plaintext'],
          parameterInformation: { labelOffsetSupport: true },
        },
      },
      documentSymbol: {
        hierarchicalDocumentSymbolSupport: true,
      },
      codeAction: {
        codeActionLiteralSupport: {
          codeActionKind: {
            valueSet: [
              'quickfix',
              'refactor',
              'refactor.extract',
              'refactor.inline',
              'refactor.rewrite',
              'source',
              'source.organizeImports',
            ],
          },
        },
      },
      formatting: {},
      rename: { prepareSupport: true },
      publishDiagnostics: { relatedInformation: true },
    },
    workspace: {
      symbol: {},
      workspaceFolders: true,
      configuration: true,
      applyEdit: true,
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new LspClientError(`${label} timed out after ${ms}ms`, 'OPERATION_TIMEOUT')),
        ms,
      );
    }),
  ]);
}

class LanguageClientManager {
  private sessions = new Map<string, ManagedConnection>();
  /** Default idle TTL; Setup keeps sessions warm longer via refresh. */
  private idleMs = 120_000;

  private key(workspaceRoot: string, serverId: string): string {
    return `${path.resolve(workspaceRoot)}::${serverId}`;
  }

  listSessions(workspaceRoot?: string): ManagedConnection[] {
    const root = workspaceRoot ? path.resolve(workspaceRoot) : null;
    return Array.from(this.sessions.values()).filter(
      (s) => !s.isDisposed && (!root || s.workspaceRoot === root),
    );
  }

  async getSession(opts: StartSessionOptions): Promise<ManagedConnection> {
    const workspaceRoot = path.resolve(opts.workspaceRoot || process.cwd());
    const language = opts.language || 'typescript';
    const serverId = getServerIdForLanguage(language);
    if (!serverId) {
      throw new LspClientError(
        `No language server mapping for language id "${language}"`,
        'UNSUPPORTED_LANGUAGE',
      );
    }

    const key = this.key(workspaceRoot, serverId);
    const existing = this.sessions.get(key);
    if (existing && !existing.isDisposed) {
      return existing;
    }

    const resolved = resolveLanguageServer(language, {
      workspaceRoot,
      commandOverride: opts.commandOverride,
      commandArgsOverride: opts.commandArgsOverride,
    });
    if (!resolved) {
      throw new LspClientError(
        `Language server binary not available for "${language}" (server ${serverId}). Install the server or ensure it is on PATH.`,
        'SERVER_BINARY_MISSING',
      );
    }

    const session = await this.spawnAndInitialize(
      workspaceRoot,
      language,
      resolved,
      opts.timeout ?? 15_000,
    );
    this.sessions.set(key, session);

    // Soft idle cleanup (do not kill immediately — Discovery reuses sessions)
    setTimeout(() => {
      const cur = this.sessions.get(key);
      if (cur && cur === session && !cur.isDisposed) {
        // only dispose if still idle map entry; Setup/Discovery may refresh by getSession
      }
    }, this.idleMs);

    return session;
  }

  /**
   * Start every resolvable server for languages detected in a workspace.
   */
  async startForLanguages(
    workspaceRoot: string,
    languageIds: string[],
    timeout = 20_000,
  ): Promise<{
    started: Array<{ serverId: string; languages: string[]; command: string }>;
    failed: Array<{ serverId: string; languageId: string; error: string }>;
    unavailable: Array<{ languageId: string; serverId?: string; reason: string }>;
  }> {
    const root = path.resolve(workspaceRoot);
    const { resolved, unavailable } = resolveServersForLanguages(languageIds, {
      workspaceRoot: root,
    });
    const started: Array<{ serverId: string; languages: string[]; command: string }> = [];
    const failed: Array<{ serverId: string; languageId: string; error: string }> = [];

    // Parallel start with per-server timeout so one slow PATH binary cannot block Setup.
    const perServerTimeout = Math.min(timeout, 12_000);
    await Promise.all(
      resolved.map(async (server) => {
        const primaryLang =
          server.languages[0] ||
          languageIds.find((l) => getServerIdForLanguage(l) === server.id) ||
          'typescript';
        try {
          const key = this.key(root, server.id);
          const existing = this.sessions.get(key);
          if (!existing || existing.isDisposed) {
            const session = await this.spawnAndInitialize(
              root,
              primaryLang,
              server,
              perServerTimeout,
            );
            this.sessions.set(key, session);
          }
          const live = this.sessions.get(key)!;
          started.push({
            serverId: server.id,
            languages: server.languages,
            command: `${live.serverCommand} ${live.serverArgs.join(' ')}`.trim(),
          });
        } catch (err) {
          failed.push({
            serverId: server.id,
            languageId: primaryLang,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }),
    );

    return { started, failed, unavailable };
  }

  private async spawnAndInitialize(
    workspaceRoot: string,
    languageId: string,
    resolved: ResolvedLanguageServer,
    timeout: number,
  ): Promise<ManagedConnection> {
    log('Spawning language server', 'info', {
      workspaceRoot,
      languageId,
      serverId: resolved.id,
      command: resolved.resolvedCommand,
      args: resolved.args,
    });

    const child = spawn(resolved.resolvedCommand, resolved.args, {
      cwd: workspaceRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stderrBuf = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderrBuf += chunk.toString('utf8');
      if (stderrBuf.length > 8000) stderrBuf = stderrBuf.slice(-4000);
    });

    const connection = createMessageConnection(
      new StreamMessageReader(child.stdout),
      new StreamMessageWriter(child.stdin),
    );

    connection.onError((err) => {
      log('LSP connection error', 'warn', {
        serverId: resolved.id,
        error: String(err),
      });
    });

    connection.onClose(() => {
      log('LSP connection closed', 'debug', { serverId: resolved.id, workspaceRoot });
    });

    // Server → client requests we must answer for initialize to proceed
    connection.onRequest('client/registerCapability', async () => null);
    connection.onRequest('client/unregisterCapability', async () => null);
    connection.onRequest('workspace/configuration', async () => [{}]);
    connection.onRequest('workspace/workspaceFolders', async () => [
      {
        uri: toFileUri(workspaceRoot),
        name: path.basename(workspaceRoot),
      },
    ]);
    connection.onNotification('window/logMessage', () => undefined);
    connection.onNotification('window/showMessage', () => undefined);
    connection.onNotification('textDocument/publishDiagnostics', () => undefined);
    connection.onNotification('$/progress', () => undefined);
    connection.onRequest('window/workDoneProgress/create', async () => null);

    connection.listen();

    const rootUri = toFileUri(workspaceRoot);
    const initParams = {
      processId: process.pid,
      clientInfo: { name: 'bitcode-lsp', version: '1.0.0' },
      locale: 'en',
      rootPath: workspaceRoot,
      rootUri,
      capabilities: clientCapabilities(),
      initializationOptions: resolved.initializationOptions || {},
      workspaceFolders: [{ uri: rootUri, name: path.basename(workspaceRoot) }],
      trace: 'off' as const,
    };

    let initResult: any;
    try {
      initResult = await withTimeout(
        connection.sendRequest('initialize', initParams),
        timeout,
        `initialize ${resolved.id}`,
      );
    } catch (err) {
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
      connection.dispose();
      const detail = err instanceof Error ? err.message : String(err);
      throw new LspClientError(
        `Failed to initialize ${resolved.id}: ${detail}${stderrBuf ? ` | stderr: ${stderrBuf.slice(0, 500)}` : ''}`,
        'INITIALIZATION_FAILED',
        err instanceof Error ? err : undefined,
      );
    }

    connection.sendNotification('initialized', {});

    // Some servers need workspace/didChangeConfiguration
    try {
      connection.sendNotification('workspace/didChangeConfiguration', { settings: {} });
    } catch {
      /* optional */
    }

    const openDocuments = new Map<string, TextDocument>();
    let lastDoc: TextDocument | undefined;

    const managed: ManagedConnection = {
      connection,
      languageId,
      serverId: resolved.id,
      workspaceRoot,
      serverCommand: resolved.resolvedCommand,
      serverArgs: resolved.args,
      capabilities: initResult?.capabilities || {},
      openDocuments,
      cleanup: () => undefined,
      isDisposed: false,
      child,
      documents: {
        get: () => lastDoc,
      },
    };

    managed.cleanup = () => {
      if (managed.isDisposed) return;
      managed.isDisposed = true;
      try {
        for (const doc of openDocuments.values()) {
          try {
            connection.sendNotification('textDocument/didClose', {
              textDocument: { uri: doc.uri },
            });
          } catch {
            /* ignore */
          }
        }
        connection.sendRequest('shutdown').then(
          () => {
            try {
              connection.sendNotification('exit');
            } catch {
              /* ignore */
            }
          },
          () => undefined,
        );
      } catch {
        /* ignore */
      }
      try {
        connection.dispose();
      } catch {
        /* ignore */
      }
      try {
        if (!child.killed) child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
      this.sessions.delete(this.key(workspaceRoot, resolved.id));
    };

    // Expose last-doc write for openDocumentOnSession
    (managed as any)._setLastDoc = (doc: TextDocument) => {
      lastDoc = doc;
    };

    child.on('exit', () => {
      managed.isDisposed = true;
      this.sessions.delete(this.key(workspaceRoot, resolved.id));
    });

    log('Language server initialized', 'info', {
      serverId: resolved.id,
      workspaceRoot,
      languageId,
      hasDefinitionProvider: Boolean(initResult?.capabilities?.definitionProvider),
      hasDocumentSymbolProvider: Boolean(initResult?.capabilities?.documentSymbolProvider),
      hasWorkspaceSymbolProvider: Boolean(initResult?.capabilities?.workspaceSymbolProvider),
    });

    return managed;
  }

  disposeAll(): void {
    for (const session of this.sessions.values()) {
      try {
        session.cleanup();
      } catch {
        /* ignore */
      }
    }
    this.sessions.clear();
  }
}

export const languageClientManager = new LanguageClientManager();

// Cleanup on exit only (avoid SIGINT/SIGTERM hooks that hang Jest).
process.on('exit', () => {
  try {
    languageClientManager.disposeAll();
  } catch {
    /* ignore */
  }
});

/**
 * Open (or refresh) a document on the language server so textDocument/* works.
 */
export async function openDocumentOnSession(
  managed: ManagedConnection,
  filePath: string,
  languageId: string,
  content: string,
): Promise<TextDocument> {
  const uri = toFileUri(filePath);
  const existing = managed.openDocuments.get(uri);
  if (existing) {
    const nextVersion = existing.version + 1;
    const doc = TextDocument.create(uri, languageId, nextVersion, content);
    managed.openDocuments.set(uri, doc);
    (managed as any)._setLastDoc?.(doc);
    managed.connection.sendNotification('textDocument/didChange', {
      textDocument: { uri, version: nextVersion },
      contentChanges: [{ text: content }],
    });
    return doc;
  }

  const doc = TextDocument.create(uri, languageId, 1, content);
  managed.openDocuments.set(uri, doc);
  (managed as any)._setLastDoc?.(doc);
  managed.connection.sendNotification('textDocument/didOpen', {
    textDocument: {
      uri,
      languageId,
      version: 1,
      text: content,
    },
  });
  // Brief yield so servers can index (esp. tsserver project load)
  await new Promise((r) => setTimeout(r, 80));
  return doc;
}

export async function sendRequestWithTimeout<T>(
  managed: ManagedConnection,
  method: string,
  params: unknown,
  timeoutMs: number,
): Promise<T> {
  return withTimeout(
    managed.connection.sendRequest(method, params) as Promise<T>,
    timeoutMs,
    method,
  );
}
