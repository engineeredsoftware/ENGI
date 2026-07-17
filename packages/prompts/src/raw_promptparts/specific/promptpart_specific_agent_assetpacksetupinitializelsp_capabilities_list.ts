/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: auto
 * intent: "Bitcode PromptPart for asset-pack read LSP measurement: capabilities list"
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
 * intent: "Bitcode PromptPart for asset-pack read LSP measurement: capabilities list"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "capabilities_list_clarity", "test": "Clear capabilities list?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPINITIALIZELSP_CAPABILITIES_LIST: PromptPart =
  'Capabilities: prime real multi-language Language Clients for ALL languages present in the checkout ' +
  'workspacePath (spawn mapped servers over stdio — typescript-language-server, pyright, gopls, ' +
  'rust-analyzer, clangd, and peers when installed); register named LSP query tools on the pipeline ' +
  'tool registry for Discovery codebase comprehension and Validation; detect languages from the tree; ' +
  'validate readiness via workspace/document symbol tools against live sessions; store setup/lsp ' +
  'readiness (detectedLanguages, startedServers, registered tools) for later phases; never invent ' +
  'Host capabilities or skip source-safety.' as PromptPart;
