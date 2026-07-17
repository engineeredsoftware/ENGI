// @ts-nocheck — monorepo typecheck quarantine (restore when types harden)
/**
 * Language id → language-server command map for Bitcode multi-language LSP.
 *
 * Product law: Setup/Discovery must measure any checkout language. Each entry
 * is a real stdio language-server command. Resolution prefers package-local
 * bins (typescript-language-server is a dependency), then PATH.
 */

import { accessSync, constants as fsConstants, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

export type LanguageServerSpec = {
  /** Shared process pool key (one server may cover many language ids). */
  id: string;
  /** Primary executable name or absolute path. */
  command: string;
  args: string[];
  /** Extra candidate commands tried in order if primary is missing. */
  commandCandidates?: string[];
  /** npm package whose bin to prefer when present in node_modules. */
  npmPackage?: string;
  npmBin?: string;
  initializationOptions?: Record<string, unknown>;
};

export type ResolvedLanguageServer = LanguageServerSpec & {
  /** Absolute or PATH-resolved command ready for spawn. */
  resolvedCommand: string;
  languages: string[];
};

/**
 * Language server specs.
 *
 * **Bundled (npm deps of @bitcode/lsp)** — resolved via node_modules; always
 * available after pnpm install (local host + Pipeliner image monorepo install).
 *
 * **Image / PATH (native)** — installed into Pipeliner OCI image under
 * /usr/local/bin (or Go bin); also used when present on developer PATH.
 * See containers/images/pipeliner/scripts/install-language-servers.sh.
 */
const SERVER_SPECS: Record<string, LanguageServerSpec> = {
  // --- npm-bundled (always with @bitcode/lsp) ---
  'typescript-language-server': {
    id: 'typescript-language-server',
    command: 'typescript-language-server',
    args: ['--stdio'],
    npmPackage: 'typescript-language-server',
    npmBin: 'typescript-language-server',
    commandCandidates: ['typescript-language-server'],
  },
  pyright: {
    id: 'pyright',
    command: 'pyright-langserver',
    args: ['--stdio'],
    npmPackage: 'pyright',
    npmBin: 'pyright-langserver',
    commandCandidates: ['pyright-langserver', 'pyright', 'basedpyright-langserver', 'pylsp'],
  },
  'bash-language-server': {
    id: 'bash-language-server',
    command: 'bash-language-server',
    args: ['start'],
    npmPackage: 'bash-language-server',
    npmBin: 'bash-language-server',
    commandCandidates: ['bash-language-server'],
  },
  'yaml-language-server': {
    id: 'yaml-language-server',
    command: 'yaml-language-server',
    args: ['--stdio'],
    npmPackage: 'yaml-language-server',
    npmBin: 'yaml-language-server',
    commandCandidates: ['yaml-language-server'],
  },
  'dockerfile-language-server': {
    id: 'dockerfile-language-server',
    command: 'docker-langserver',
    args: ['--stdio'],
    npmPackage: 'dockerfile-language-server-nodejs',
    npmBin: 'docker-langserver',
    commandCandidates: ['docker-langserver'],
  },
  'vscode-html-language-server': {
    id: 'vscode-html-language-server',
    command: 'vscode-html-language-server',
    args: ['--stdio'],
    npmPackage: 'vscode-langservers-extracted',
    npmBin: 'vscode-html-language-server',
    commandCandidates: ['vscode-html-language-server', 'html-languageserver'],
  },
  'vscode-css-language-server': {
    id: 'vscode-css-language-server',
    command: 'vscode-css-language-server',
    args: ['--stdio'],
    npmPackage: 'vscode-langservers-extracted',
    npmBin: 'vscode-css-language-server',
    commandCandidates: ['vscode-css-language-server', 'css-languageserver'],
  },
  'vscode-json-language-server': {
    id: 'vscode-json-language-server',
    command: 'vscode-json-language-server',
    args: ['--stdio'],
    npmPackage: 'vscode-langservers-extracted',
    npmBin: 'vscode-json-language-server',
    commandCandidates: ['vscode-json-language-server', 'vscode-json-languageserver'],
  },
  'vscode-eslint-language-server': {
    id: 'vscode-eslint-language-server',
    command: 'vscode-eslint-language-server',
    args: ['--stdio'],
    npmPackage: 'vscode-langservers-extracted',
    npmBin: 'vscode-eslint-language-server',
    commandCandidates: ['vscode-eslint-language-server'],
  },
  'vue-language-server': {
    id: 'vue-language-server',
    command: 'vue-language-server',
    args: ['--stdio'],
    npmPackage: '@vue/language-server',
    npmBin: 'vue-language-server',
    commandCandidates: ['vue-language-server', 'vls'],
  },
  svelteserver: {
    id: 'svelteserver',
    command: 'svelteserver',
    args: ['--stdio'],
    npmPackage: 'svelte-language-server',
    npmBin: 'svelteserver',
    commandCandidates: ['svelteserver', 'svelte-language-server'],
  },
  'graphql-lsp': {
    id: 'graphql-lsp',
    command: 'graphql-lsp',
    args: ['server', '-m', 'stream'],
    npmPackage: 'graphql-language-service-cli',
    npmBin: 'graphql-lsp',
    commandCandidates: ['graphql-lsp'],
  },
  intelephense: {
    id: 'intelephense',
    command: 'intelephense',
    args: ['--stdio'],
    npmPackage: 'intelephense',
    npmBin: 'intelephense',
    commandCandidates: ['intelephense', 'phpactor'],
  },
  taplo: {
    id: 'taplo',
    command: 'taplo',
    args: ['lsp', 'stdio'],
    npmPackage: '@taplo/cli',
    npmBin: 'taplo',
    commandCandidates: ['taplo'],
  },

  // --- Pipeliner image / host PATH (native binaries) ---
  gopls: {
    id: 'gopls',
    command: 'gopls',
    args: ['serve'],
    commandCandidates: ['gopls'],
  },
  'rust-analyzer': {
    id: 'rust-analyzer',
    command: 'rust-analyzer',
    args: [],
    commandCandidates: ['rust-analyzer'],
  },
  clangd: {
    id: 'clangd',
    command: 'clangd',
    args: ['--background-index'],
    commandCandidates: ['clangd'],
  },
  marksman: {
    id: 'marksman',
    command: 'marksman',
    args: ['server'],
    commandCandidates: ['marksman'],
  },
  'terraform-ls': {
    id: 'terraform-ls',
    command: 'terraform-ls',
    args: ['serve'],
    commandCandidates: ['terraform-ls'],
  },
  'lua-language-server': {
    id: 'lua-language-server',
    command: 'lua-language-server',
    args: [],
    commandCandidates: ['lua-language-server'],
  },
  sqls: {
    id: 'sqls',
    command: 'sqls',
    args: [],
    commandCandidates: ['sqls'],
  },
  // Optional / heavy — image may omit; PATH when present
  jdtls: {
    id: 'jdtls',
    command: 'jdtls',
    args: [],
    commandCandidates: ['jdtls', 'java-language-server'],
  },
  'kotlin-language-server': {
    id: 'kotlin-language-server',
    command: 'kotlin-language-server',
    args: [],
    commandCandidates: ['kotlin-language-server', 'kotlin-ls'],
  },
  'csharp-ls': {
    id: 'csharp-ls',
    command: 'csharp-ls',
    args: [],
    commandCandidates: ['csharp-ls', 'OmniSharp'],
  },
  'ruby-lsp': {
    id: 'ruby-lsp',
    command: 'ruby-lsp',
    args: [],
    commandCandidates: ['ruby-lsp', 'solargraph'],
  },
  dart: {
    id: 'dart',
    command: 'dart',
    args: ['language-server', '--protocol=lsp'],
    commandCandidates: ['dart'],
  },
  'elixir-ls': {
    id: 'elixir-ls',
    command: 'language_server.sh',
    args: [],
    commandCandidates: ['language_server.sh', 'elixir-ls'],
  },
  'haskell-language-server': {
    id: 'haskell-language-server',
    command: 'haskell-language-server-wrapper',
    args: ['--lsp'],
    commandCandidates: ['haskell-language-server-wrapper', 'haskell-language-server'],
  },
  metals: {
    id: 'metals',
    command: 'metals',
    args: [],
    commandCandidates: ['metals'],
  },
  zls: {
    id: 'zls',
    command: 'zls',
    args: [],
    commandCandidates: ['zls'],
  },
  'sourcekit-lsp': {
    id: 'sourcekit-lsp',
    command: 'sourcekit-lsp',
    args: [],
    commandCandidates: ['sourcekit-lsp'],
  },
  protols: {
    id: 'protols',
    command: 'protols',
    args: [],
    commandCandidates: ['protols', 'bufls'],
  },
  nimlsp: {
    id: 'nimlsp',
    command: 'nimlsp',
    args: [],
    commandCandidates: ['nimlsp'],
  },
  'v-analyzer': {
    id: 'v-analyzer',
    command: 'v-analyzer',
    args: [],
    commandCandidates: ['v-analyzer', 'vls'],
  },
  'solidity-ls': {
    id: 'solidity-ls',
    command: 'nomicfoundation-solidity-language-server',
    args: ['--stdio'],
    commandCandidates: [
      'nomicfoundation-solidity-language-server',
      'solc',
      'solidity-ls',
    ],
  },
  'clojure-lsp': {
    id: 'clojure-lsp',
    command: 'clojure-lsp',
    args: [],
    commandCandidates: ['clojure-lsp'],
  },
  'erlang-ls': {
    id: 'erlang-ls',
    command: 'erlang_ls',
    args: [],
    commandCandidates: ['erlang_ls'],
  },
  'r-languageserver': {
    id: 'r-languageserver',
    command: 'R',
    args: ['--slave', '-e', 'languageserver::run()'],
    commandCandidates: ['R'],
  },
  'julia-ls': {
    id: 'julia-ls',
    command: 'julia',
    args: [
      '--startup-file=no',
      '--history-file=no',
      '-e',
      'using LanguageServer; runserver()',
    ],
    commandCandidates: ['julia'],
  },
  'powershell-es': {
    id: 'powershell-es',
    command: 'pwsh',
    args: [
      '-NoLogo',
      '-NoProfile',
      '-Command',
      "Import-Module PowerShellEditorServices; Start-EditorServices -HostName 'bitcode' -HostProfileId 'bitcode' -HostVersion '1.0.0' -LogLevel 'Normal' -SessionDetailsPath '/tmp/bitcode-pses.json' -BundledModulesPath '' -Stdio",
    ],
    commandCandidates: ['pwsh', 'powershell'],
  },
  fsautocomplete: {
    id: 'fsautocomplete',
    command: 'fsautocomplete',
    args: [],
    commandCandidates: ['fsautocomplete'],
  },
};

/** Server ids expected from npm bundle of @bitcode/lsp (not PATH-only). */
export const BUNDLED_NPM_SERVER_IDS = [
  'typescript-language-server',
  'pyright',
  'bash-language-server',
  'yaml-language-server',
  'dockerfile-language-server',
  'vscode-html-language-server',
  'vscode-css-language-server',
  'vscode-json-language-server',
  'vscode-eslint-language-server',
  'vue-language-server',
  'svelteserver',
  'graphql-lsp',
  'intelephense',
  'taplo',
] as const;

/** Server ids installed into Pipeliner image (native). */
export const PIPELINER_IMAGE_SERVER_IDS = [
  'gopls',
  'rust-analyzer',
  'clangd',
  'marksman',
  'terraform-ls',
  'lua-language-server',
  'sqls',
] as const;

/**
 * LSP language id → server id. Multiple languages share one server process
 * (e.g. TS/JS → typescript-language-server).
 */
export const LANGUAGE_TO_SERVER_ID: Record<string, string> = {
  typescript: 'typescript-language-server',
  typescriptreact: 'typescript-language-server',
  javascript: 'typescript-language-server',
  javascriptreact: 'typescript-language-server',
  // legacy short ids from older detectLanguage
  tsx: 'typescript-language-server',
  jsx: 'typescript-language-server',

  python: 'pyright',
  go: 'gopls',
  rust: 'rust-analyzer',
  c: 'clangd',
  cpp: 'clangd',
  'objective-c': 'clangd',
  'objective-cpp': 'clangd',
  java: 'jdtls',
  kotlin: 'kotlin-language-server',
  csharp: 'csharp-ls',
  fsharp: 'fsautocomplete',
  ruby: 'ruby-lsp',
  php: 'intelephense',
  lua: 'lua-language-server',
  shellscript: 'bash-language-server',
  powershell: 'powershell-es',
  yaml: 'yaml-language-server',
  html: 'vscode-html-language-server',
  css: 'vscode-css-language-server',
  scss: 'vscode-css-language-server',
  less: 'vscode-css-language-server',
  json: 'vscode-json-language-server',
  jsonc: 'vscode-json-language-server',
  vue: 'vue-language-server',
  svelte: 'svelteserver',
  dart: 'dart',
  elixir: 'elixir-ls',
  haskell: 'haskell-language-server',
  scala: 'metals',
  zig: 'zls',
  swift: 'sourcekit-lsp',
  terraform: 'terraform-ls',
  markdown: 'marksman',
  mdx: 'marksman',
  toml: 'taplo',
  sql: 'sqls',
  graphql: 'graphql-lsp',
  dockerfile: 'dockerfile-language-server',
  protobuf: 'protols',
  nim: 'nimlsp',
  v: 'v-analyzer',
  solidity: 'solidity-ls',
  clojure: 'clojure-lsp',
  erlang: 'erlang-ls',
  r: 'r-languageserver',
  julia: 'julia-ls',
};

export function getServerIdForLanguage(languageId: string): string | undefined {
  return LANGUAGE_TO_SERVER_ID[languageId];
}

export function listMappedLanguageIds(): string[] {
  return Object.keys(LANGUAGE_TO_SERVER_ID).sort();
}

export function listServerSpecs(): LanguageServerSpec[] {
  return Object.values(SERVER_SPECS);
}

function isExecutable(filePath: string): boolean {
  try {
    accessSync(filePath, fsConstants.X_OK);
    return true;
  } catch {
    try {
      // Windows / non-exec bit: still try if file exists
      accessSync(filePath, fsConstants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

function resolveNpmPackageBin(
  npmPackage: string,
  npmBin: string,
  fromPaths: string[],
): string | null {
  const roots = [
    ...fromPaths,
    // Prefer package-local then monorepo root (pnpm layout).
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '../../..'),
    process.cwd(),
  ];
  const seen = new Set<string>();
  for (const from of roots) {
    const key = path.resolve(from);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const requireFrom = createRequire(path.join(from, 'package.json'));
      const pkgJsonPath = requireFrom.resolve(`${npmPackage}/package.json`);
      const pkgDir = path.dirname(pkgJsonPath);
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
        bin?: string | Record<string, string>;
      };
      let rel: string | undefined;
      if (typeof pkg.bin === 'string') rel = pkg.bin;
      else if (pkg.bin && typeof pkg.bin === 'object') {
        rel = pkg.bin[npmBin] || Object.values(pkg.bin)[0];
      }
      if (!rel) continue;
      const abs = path.resolve(pkgDir, rel);
      if (existsSync(abs)) return abs;
    } catch {
      /* try next root */
    }
  }
  return null;
}

function whichOnPath(command: string): string | null {
  if (command.includes(path.sep) || command.startsWith('.')) {
    return isExecutable(path.resolve(command)) ? path.resolve(command) : null;
  }
  try {
    const out = execFileSync(
      process.platform === 'win32' ? 'where' : 'which',
      [command],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)[0];
    return out || null;
  } catch {
    return null;
  }
}

/**
 * Resolve a runnable command for a language id.
 * Returns null when no binary is available (caller skips that language).
 */
export function resolveLanguageServer(
  languageId: string,
  options?: {
    workspaceRoot?: string;
    /** Override command for tests / custom installs */
    commandOverride?: string;
    commandArgsOverride?: string[];
  },
): ResolvedLanguageServer | null {
  const serverId = LANGUAGE_TO_SERVER_ID[languageId];
  if (!serverId) return null;
  const spec = SERVER_SPECS[serverId];
  if (!spec) return null;

  if (options?.commandOverride) {
    return {
      ...spec,
      command: options.commandOverride,
      args: options.commandArgsOverride ?? spec.args,
      resolvedCommand: options.commandOverride,
      languages: languagesForServer(serverId),
    };
  }

  const searchRoots = [
    options?.workspaceRoot,
    process.cwd(),
    path.resolve(__dirname, '..'), // packages/lsp
    path.resolve(__dirname, '../../..'), // monorepo root guess
  ].filter(Boolean) as string[];

  if (spec.npmPackage && spec.npmBin) {
    const npmBin = resolveNpmPackageBin(spec.npmPackage, spec.npmBin, searchRoots);
    if (npmBin) {
      // Prefer node + script for cross-platform npm bins without shebang exec
      return {
        ...spec,
        resolvedCommand: process.execPath,
        args: [npmBin, ...spec.args],
        languages: languagesForServer(serverId),
      };
    }
  }

  const candidates = [
    spec.command,
    ...(spec.commandCandidates || []),
  ];
  for (const candidate of candidates) {
    const resolved = whichOnPath(candidate);
    if (resolved) {
      // special-case: pyright without -langserver may need different args
      let args = spec.args;
      if (serverId === 'pyright' && path.basename(resolved) === 'pyright') {
        args = ['--stdio'];
      }
      if (serverId === 'pyright' && path.basename(resolved) === 'pylsp') {
        args = [];
      }
      if (serverId === 'ruby-lsp' && path.basename(resolved) === 'solargraph') {
        args = ['stdio'];
      }
      return {
        ...spec,
        command: candidate,
        args,
        resolvedCommand: resolved,
        languages: languagesForServer(serverId),
      };
    }
  }

  return null;
}

export function languagesForServer(serverId: string): string[] {
  return Object.entries(LANGUAGE_TO_SERVER_ID)
    .filter(([, id]) => id === serverId)
    .map(([lang]) => lang)
    .sort();
}

/**
 * Unique server resolutions for a set of language ids present in a workspace.
 */
export function resolveServersForLanguages(
  languageIds: string[],
  options?: { workspaceRoot?: string },
): {
  resolved: ResolvedLanguageServer[];
  unavailable: Array<{ languageId: string; serverId?: string; reason: string }>;
} {
  const seen = new Set<string>();
  const resolved: ResolvedLanguageServer[] = [];
  const unavailable: Array<{ languageId: string; serverId?: string; reason: string }> = [];

  for (const languageId of languageIds) {
    if (languageId === 'plaintext') continue;
    const serverId = LANGUAGE_TO_SERVER_ID[languageId];
    if (!serverId) {
      unavailable.push({
        languageId,
        reason: 'no language→server mapping',
      });
      continue;
    }
    if (seen.has(serverId)) continue;
    seen.add(serverId);
    const r = resolveLanguageServer(languageId, options);
    if (r) resolved.push(r);
    else {
      unavailable.push({
        languageId,
        serverId,
        reason: `language server binary not found for ${serverId}`,
      });
    }
  }

  return { resolved, unavailable };
}

/** True when at least typescript-language-server (bundled dep) can run. */
export function isBundledTypescriptServerAvailable(workspaceRoot?: string): boolean {
  return Boolean(resolveLanguageServer('typescript', { workspaceRoot }));
}

/**
 * Resolve status of all bundled npm servers (for Setup readiness / diagnostics).
 */
export function listBundledServerResolution(workspaceRoot?: string): Array<{
  serverId: string;
  available: boolean;
  resolvedCommand?: string;
}> {
  return BUNDLED_NPM_SERVER_IDS.map((serverId) => {
    const lang =
      Object.entries(LANGUAGE_TO_SERVER_ID).find(([, id]) => id === serverId)?.[0] ||
      'typescript';
    const r = resolveLanguageServer(lang, { workspaceRoot });
    return {
      serverId,
      available: Boolean(r),
      resolvedCommand: r
        ? `${r.resolvedCommand} ${r.args.join(' ')}`.trim()
        : undefined,
    };
  });
}
