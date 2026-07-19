/**
 * Setup must register named LSP tools for Discovery codebase comprehension.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const mockStartWorkspaceLanguageServers = jest.fn(async () => ({
  started: [],
  failed: [],
  unavailable: [{ languageId: 'typescript', reason: 'test-mock-no-server' }],
}));

jest.mock('@bitcode/lsp', () => {
  const actual = jest.requireActual('@bitcode/lsp');
  return {
    ...actual,
    startWorkspaceLanguageServers: (...args: unknown[]) =>
      mockStartWorkspaceLanguageServers(...args),
  };
});

import {
  ALL_LSP_QUERY_TOOLS,
  SETUP_LSP_INITIALIZE_TOOLS,
  LSP_TOOL_NAMES,
  estimateWorkspaceSourceScale,
  setupLspForWorkspace,
} from '../tools/lsp-setup-tools';
import { getAssetPackPipelineToolsForAgent, SETUP_PHASE_TOOLS } from '../tools';

/** Walk up from this package to the Bitcode monorepo root (pnpm-workspace.yaml). */
function resolveMonorepoRoot(): string {
  let dir = path.resolve(__dirname, '../../..');
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(dir, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(dir, 'pnpm-workspace.yml'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(__dirname, '../../../../../../');
}

describe('Setup LSP tools for subsequent phases', () => {
  beforeEach(() => {
    mockStartWorkspaceLanguageServers.mockClear();
  });

  it('exports stable registry names on every product LSP tool', () => {
    const names = ALL_LSP_QUERY_TOOLS.map((t) => (t as any).name);
    expect(names).toEqual(
      expect.arrayContaining([
        LSP_TOOL_NAMES.definition,
        LSP_TOOL_NAMES.workspaceSymbols,
        LSP_TOOL_NAMES.documentSymbols,
      ]),
    );
    expect(new Set(names).size).toBe(names.length);
  });

  it('includes LSP tools in Setup phase catalog and initialize-lsp agent map', () => {
    const setupNames = SETUP_PHASE_TOOLS.map((t) => (t as any).name).filter(Boolean);
    expect(setupNames).toEqual(
      expect.arrayContaining([
        LSP_TOOL_NAMES.workspaceSymbols,
        LSP_TOOL_NAMES.documentSymbols,
        'asset-pack-clone-vcs-repository-tool',
      ]),
    );

    const initTools = getAssetPackPipelineToolsForAgent('initialize-lsp');
    expect(initTools.map((t) => (t as any).name)).toEqual(
      SETUP_LSP_INITIALIZE_TOOLS.map((t) => (t as any).name),
    );
    expect(initTools.length).toBeGreaterThan(0);
  });

  it('binds Discovery codebase comprehension to LSP suite + host workspace tools', () => {
    const discovery = getAssetPackPipelineToolsForAgent('DepositCodebaseComprehensionAgent');
    const names = discovery.map((t) => (t as any).name);
    expect(names).toEqual(
      expect.arrayContaining([
        LSP_TOOL_NAMES.workspaceSymbols,
        LSP_TOOL_NAMES.documentSymbols,
        LSP_TOOL_NAMES.definition,
        LSP_TOOL_NAMES.references,
        'host-workspace-read-file',
        'host-workspace-list-dir',
        'host-workspace-run-command',
      ]),
    );
    // Full LSP suite + 3 host tools
    expect(discovery.length).toBeGreaterThanOrEqual(ALL_LSP_QUERY_TOOLS.length + 3);
  });

  it('setupLspForWorkspace registers tools and marks readiness for later phases', async () => {
    const registered: string[] = [];
    const store: Record<string, any> = {};
    const execution = {
      store: (ns: string, key: string, value: unknown) => {
        store[`${ns}/${key}`] = value;
      },
      tools: {
        registerTool: (key: string) => {
          registered.push(key);
        },
      },
    };

    // Small synthetic checkout: tools register; session start may still fail
    // without a real server binary — never require live tsserver for this unit.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bitcode-lsp-small-'));
    try {
      fs.writeFileSync(path.join(tmp, 'package.json'), '{"name":"small"}');
      fs.writeFileSync(path.join(tmp, 'index.ts'), 'export const x = 1\n');
      const readiness = await setupLspForWorkspace(execution, tmp);

      expect(registered.length).toBe(ALL_LSP_QUERY_TOOLS.length);
      expect(readiness.registeredToolNames.length).toBe(ALL_LSP_QUERY_TOOLS.length);
      expect(readiness.initialized).toBe(true);
      expect(store['setup/lsp/initialized']).toBe(true);
      expect(store['setup/lsp/registeredToolNames']).toEqual(
        expect.arrayContaining([LSP_TOOL_NAMES.workspaceSymbols]),
      );
      expect(Array.isArray(readiness.detectedLanguages)).toBe(true);
      expect(readiness.workspaceScale?.isLarge).toBe(false);
      // Small trees may attempt a live session start (mocked — no real tsserver).
      expect(mockStartWorkspaceLanguageServers).toHaveBeenCalled();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('estimateWorkspaceSourceScale marks the Bitcode monorepo large enough to defer tsserver', () => {
    const scale = estimateWorkspaceSourceScale(resolveMonorepoRoot());
    // Full monorepo checkout (deposit of Bitcode itself) must defer full-workspace
    // tsserver prime — package count / monorepo marker / source volume.
    expect(scale.isLarge).toBe(true);
    expect(scale.reason).toMatch(/packageJsonCount|sourceFiles|monorepo/);
    expect(scale.packageJsonCount).toBeGreaterThan(10);
  });

  it('estimateWorkspaceSourceScale treats synthetic multi-package trees as large', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bitcode-lsp-scale-'));
    try {
      fs.writeFileSync(path.join(tmp, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
      fs.writeFileSync(path.join(tmp, 'package.json'), '{"name":"root"}');
      fs.mkdirSync(path.join(tmp, 'packages', 'a'), { recursive: true });
      fs.mkdirSync(path.join(tmp, 'packages', 'b'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'packages', 'a', 'package.json'), '{"name":"a"}');
      fs.writeFileSync(path.join(tmp, 'packages', 'b', 'package.json'), '{"name":"b"}');
      for (let i = 0; i < 30; i++) {
        fs.writeFileSync(path.join(tmp, 'packages', 'a', `f${i}.ts`), `export const n${i}=${i}\n`);
      }
      const scale = estimateWorkspaceSourceScale(tmp);
      expect(scale.isLarge).toBe(true);
      expect(scale.packageJsonCount).toBeGreaterThanOrEqual(3);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('setupLspForWorkspace defers long-lived sessions on large workspaces', async () => {
    const registered: string[] = [];
    const store: Record<string, any> = {};
    const execution = {
      store: (ns: string, key: string, value: unknown) => {
        store[`${ns}/${key}`] = value;
      },
      tools: {
        registerTool: (key: string) => {
          registered.push(key);
        },
      },
    };

    const readiness = await setupLspForWorkspace(execution, resolveMonorepoRoot());
    expect(readiness.initialized).toBe(true);
    expect(registered.length).toBe(ALL_LSP_QUERY_TOOLS.length);
    // Full monorepo → no live tsserver prime during Setup (prevents exit 137).
    expect(readiness.deferredSession).toBe(true);
    expect(readiness.sessionStarted).toBe(false);
    expect(store['setup/lsp/deferredSession']).toBe(true);
    expect(String(readiness.error || '')).toMatch(/deferred/i);
    // Must not spawn language servers when deferred.
    expect(mockStartWorkspaceLanguageServers).not.toHaveBeenCalled();
  });

  it('detectLanguage covers non-JS languages (product must not be TS-only)', async () => {
    const { detectLanguage } = await import('@bitcode/lsp');
    expect(detectLanguage('src/main.py')).toBe('python');
    expect(detectLanguage('cmd/app.go')).toBe('go');
    expect(detectLanguage('lib/mod.rs')).toBe('rust');
    expect(detectLanguage('App.kt')).toBe('kotlin');
    expect(detectLanguage('unknown.xyz')).toBe('plaintext');
  });
});
