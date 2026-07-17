/**
 * Setup must register named LSP tools for Discovery codebase comprehension.
 */
import {
  ALL_LSP_QUERY_TOOLS,
  DISCOVERY_CODEBASE_COMPREHENSION_LSP_TOOLS,
  SETUP_LSP_INITIALIZE_TOOLS,
  LSP_TOOL_NAMES,
  setupLspForWorkspace,
} from '../tools/lsp-setup-tools';
import { getAssetPackPipelineToolsForAgent, SETUP_PHASE_TOOLS } from '../tools';

describe('Setup LSP tools for subsequent phases', () => {
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

  it('binds Discovery codebase comprehension to the full LSP suite', () => {
    const discovery = getAssetPackPipelineToolsForAgent('DepositCodebaseComprehensionAgent');
    expect(discovery.map((t) => (t as any).name)).toEqual(
      DISCOVERY_CODEBASE_COMPREHENSION_LSP_TOOLS.map((t) => (t as any).name),
    );
    expect(discovery.length).toBeGreaterThanOrEqual(5);
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

    const readiness = await setupLspForWorkspace(execution, process.cwd());

    expect(registered.length).toBe(ALL_LSP_QUERY_TOOLS.length);
    expect(readiness.registeredToolNames.length).toBe(ALL_LSP_QUERY_TOOLS.length);
    // Setup complete when tools are registered for the checkout (session may fail).
    expect(readiness.initialized).toBe(true);
    expect(store['setup/lsp/initialized']).toBe(true);
    expect(store['setup/lsp/registeredToolNames']).toEqual(
      expect.arrayContaining([LSP_TOOL_NAMES.workspaceSymbols]),
    );
    expect(Array.isArray(readiness.detectedLanguages)).toBe(true);
    expect(readiness.detectedLanguages.length).toBeGreaterThan(0);
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
