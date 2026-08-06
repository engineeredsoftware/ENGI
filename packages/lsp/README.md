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

## Bundled vs Pipeliner / PATH

### Always bundled (npm deps of `@bitcode/lsp`)

| Server | Languages |
|--------|-----------|
| `typescript-language-server` | TypeScript, JavaScript, TSX/JSX |
| `pyright` | Python |
| `bash-language-server` | shell |
| `yaml-language-server` | YAML |
| `dockerfile-language-server-nodejs` | Dockerfile |
| `vscode-langservers-extracted` | HTML, CSS, JSON, ESLint |
| `@vue/language-server` | Vue |
| `svelte-language-server` | Svelte |
| `graphql-language-service-cli` | GraphQL |
| `intelephense` | PHP |
| `@taplo/cli` | TOML |

### Pipeliner image (`containers/images/pipeliner`)

Native binaries from `scripts/install-language-servers.sh`.  
Profile: `BITCODE_PIPELINE_LSP_PROFILE` (`full` default, or `default`).

| Binary | Languages | Profile |
|--------|-----------|---------|
| `gopls` (+ Go) | Go | default/full |
| `rust-analyzer` | Rust | default/full |
| `clangd` | C / C++ / ObjC | default/full |
| `marksman` | Markdown | default/full |
| `terraform-ls` | Terraform | default/full |
| `lua-language-server` | Lua | default/full |
| `sqls` | SQL | default/full |
| `jdtls` (+ JVM) | Java | full |
| `kotlin-language-server` | Kotlin | full |
| `OmniSharp` (+ .NET) | C# | full |

### Optional PATH only (last resort)

Ruby, Dart, Haskell, Metals, SourceKit, Elixir, etc. — still mapped; resolve when present on PATH.

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
