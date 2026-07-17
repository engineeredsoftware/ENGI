/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: auto
 * intent: "Bitcode PromptPart for asset-pack read LSP measurement: tools available"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode PromptPart for asset-pack read LSP measurement: tools available"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "tools_available_clarity", "test": "Clear tools available?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPINITIALIZELSP_TOOLS_AVAILABLE: PromptPart =
  'Available tools (useTools names): lsp-workspace-symbols (probe multi-language workspace readiness ' +
  'across all started servers), lsp-document-symbols (per-file symbols via the language server for that ' +
  'file extension), lsp-definition, lsp-hover. Host Setup also primes the full suite for Discovery ' +
  'codebase comprehension: lsp-references, lsp-completion, lsp-signature-help, lsp-code-actions, ' +
  'lsp-format-document. Pass workspacePath/filePath from the Host checkout; language and server are ' +
  'inferred from path; use extensively during for-synthesis codebase comprehension; do not invent tools ' +
  'or limit measurement to a single language.' as PromptPart;
