# Language Server Protocol (`@bitcode/lsp`)

Real multi-language LSP **client** for Bitcode measurement and AssetPack Setup/Discovery.

## What is real

- **Language Client**: spawns language-server binaries over **stdio**, JSON-RPC `initialize`, `textDocument/didOpen`, and query requests (`definition`, `references`, `hover`, `documentSymbol`, `workspace/symbol`, …).
- **Language → command map**: rich table (TypeScript/JS, Python, Go, Rust, C/C++, Java, Kotlin, Ruby, PHP, YAML, HTML/CSS/JSON, Vue/Svelte, Dart, …).
- **Resolution**: prefers package-local bins (`typescript-language-server` is a dependency), then `PATH`.
- **Product tools**: `@bitcode/generic-tools-lsp-query` and Setup `lsp-*` tools call these APIs; Discovery codebase comprehension uses them extensively.

## Setup / Discovery

1. Setup scans the checkout for languages, starts every **resolvable** server, registers named tools.
2. Discovery `useTools` (`lsp-document-symbols`, `lsp-definition`, …) open files on the matching server and return real analysis when the binary is available.
3. Missing servers (e.g. `gopls` not installed) are reported as `unavailableServers` — not silent TS-only pretend.

## Bundled vs PATH

| Server | Source |
|--------|--------|
| `typescript-language-server` | npm dependency of `@bitcode/lsp` (always available in monorepo) |
| `pyright` / `gopls` / `rust-analyzer` / `clangd` / … | Host `PATH` when installed |

## API highlights

```ts
import {
  startLanguageServer,
  startWorkspaceLanguageServers,
  getDocumentSymbols,
  getDefinition,
  detectLanguage,
  resolveLanguageServer,
} from '@bitcode/lsp';

await startWorkspaceLanguageServers(workspaceRoot, ['typescript', 'python', 'go']);
const symbols = await getDocumentSymbols({
  filePath: 'src/main.ts',
  options: { workspaceRoot },
});
```

## Modules

- `src/language-servers.ts` — language id → server command map + resolve
- `src/language-client.ts` — stdio MessageConnection client + session pool
- `src/index.ts` — public query/refactor APIs used by tools
