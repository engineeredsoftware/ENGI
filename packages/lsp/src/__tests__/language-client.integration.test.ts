/**
 * Integration: real stdio Language Client + typescript-language-server (bundled).
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  detectLanguage,
  getDocumentSymbols,
  getDefinition,
  startLanguageServer,
  startWorkspaceLanguageServers,
  resolveLanguageServer,
  listMappedLanguageIds,
} from '../index';
import { languageClientManager as clientMgr } from '../language-client';

describe('multi-language Language Client', () => {
  afterAll(() => {
    try {
      clientMgr.disposeAll();
    } catch {
      /* ignore */
    }
  });

  it('maps a rich set of languages to server ids', () => {
    const langs = listMappedLanguageIds();
    expect(langs).toEqual(
      expect.arrayContaining([
        'typescript',
        'python',
        'go',
        'rust',
        'java',
        'kotlin',
        'ruby',
        'cpp',
        'yaml',
      ]),
    );
    expect(langs.length).toBeGreaterThan(30);
  });

  it('resolves bundled typescript-language-server', () => {
    const resolved = resolveLanguageServer('typescript');
    expect(resolved).not.toBeNull();
    expect(resolved!.id).toBe('typescript-language-server');
    expect(resolved!.resolvedCommand).toBeTruthy();
  });

  it('detectLanguage is multi-language', () => {
    expect(detectLanguage('a.py')).toBe('python');
    expect(detectLanguage('a.go')).toBe('go');
    expect(detectLanguage('a.rs')).toBe('rust');
    expect(detectLanguage('a.tsx')).toBe('typescriptreact');
  });

  it('starts typescript-language-server and returns document symbols', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitcode-lsp-'));
    const filePath = path.join(dir, 'sample.ts');
    fs.writeFileSync(
      filePath,
      [
        'export function greet(name: string): string {',
        '  return `hello ${name}`;',
        '}',
        '',
        'export const answer = 42;',
        '',
      ].join('\n'),
      'utf8',
    );

    const session = await startLanguageServer({
      workspaceRoot: dir,
      language: 'typescript',
      timeout: 20_000,
    });
    expect(session.serverId).toBe('typescript-language-server');
    expect(session.isDisposed).toBe(false);

    const symbols = await getDocumentSymbols({
      filePath,
      options: { workspaceRoot: dir, language: 'typescript', timeout: 20_000 },
    });

    expect(Array.isArray(symbols)).toBe(true);
    expect(symbols.length).toBeGreaterThan(0);
    const names = symbols.map((s: any) => s.name || s?.children?.[0]?.name).filter(Boolean);
    // Hierarchical DocumentSymbol or SymbolInformation
    const flatNames: string[] = [];
    const walk = (items: any[]) => {
      for (const it of items || []) {
        if (it?.name) flatNames.push(it.name);
        if (it?.children) walk(it.children);
      }
    };
    walk(symbols as any[]);
    expect(flatNames.join(' ')).toMatch(/greet|answer/);

    // Definition on greet identifier
    const def = await getDefinition({
      filePath,
      line: 0,
      character: 16, // inside "greet"
      options: { workspaceRoot: dir, language: 'typescript', timeout: 20_000 },
    });
    expect(def).toBeTruthy();
  }, 45_000);

  it('startWorkspaceLanguageServers starts TS and reports unavailable for missing bins', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bitcode-lsp-ws-'));
    // Prefer languages whose servers are often missing on CI PATH (except bundled TS).
    const result = await startWorkspaceLanguageServers(
      dir,
      ['typescript', 'python', 'nim'],
      15_000,
    );
    expect(result.started.some((s) => s.serverId === 'typescript-language-server')).toBe(true);
    const known = new Set([
      ...result.started.map((s) => s.serverId),
      ...result.unavailable.map((u) => u.serverId).filter(Boolean),
      ...result.failed.map((f) => f.serverId),
    ]);
    expect(known.has('typescript-language-server')).toBe(true);
  }, 30_000);
});
