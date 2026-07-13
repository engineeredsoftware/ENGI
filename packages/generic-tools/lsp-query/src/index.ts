// @ts-nocheck — monorepo typecheck quarantine (restore when types harden)
/**
 * LSP QUERY TOOLS - Bitcode static measurement carrier
 * 
 * Retained Language Server Protocol operations provide replayable symbols,
 * definitions, references, locations, and diagnostics for Read measurement,
 * AssetPack fit, and proof evidence.
 */

import { Tool } from '@bitcode/tools-generics';
import { z } from 'zod';

// Import composed prompts from local prompts directory
import { PROMPTPART_COMPOSED_LSP_CONTEXT_AWARENESS } from './prompts/lsp-context-awareness-composition';
import { PROMPTPART_COMPOSED_LSP_NAVIGATION_CAPABILITIES } from './prompts/lsp-navigation-capabilities-composition';
import { PROMPTPART_COMPOSED_LSP_POSITION_PARAMETERS } from './prompts/lsp-position-parameters-composition';
import { PROMPTPART_COMPOSED_LSP_LOCATION_OUTPUT } from './prompts/lsp-location-output-composition';
import { PROMPTPART_COMPOSED_LSP_PURPOSE } from './prompts/lsp-purpose-composition';






import {
  getDefinition,
  findReferences,
  getHover,
  getCompletions,
  getSignatureHelp,
  getDocumentSymbols,
  getWorkspaceSymbols,
  getCodeActions,
  formatDocument,
  definitionParamsSchema,
  completionParamsSchema,
  signatureHelpParamsSchema,
  documentSymbolParamsSchema,
  workspaceSymbolParamsSchema,
  codeActionParamsSchema,
  formatDocumentParamsSchema,
  QueryParams,
  CompletionParams,
  SignatureHelpParams,
  DocumentSymbolParams,
  WorkspaceSymbolParams,
  CodeActionParams,
  FormatDocumentParams,
  LspError,
} from '@bitcode/lsp';
import { LSP_QUERY_DOC_CODE_TOOL_PROMPT } from './prompts/LspQueryDocCodeToolPrompt';

// ---------------------- Schemas ---------------------------
// Use the enhanced schema from the LSP package
export type PositionParams = QueryParams;

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class DefinitionTool extends Tool<typeof getDefinition> {
  use = getDefinition;
}

export const definitionTool = new DefinitionTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class ReferencesTool extends Tool<typeof findReferences> {
  use = findReferences;
}

export const referencesTool = new ReferencesTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class HoverInfoTool extends Tool<typeof getHover> {
  use = getHover;
}

export const hoverInfoTool = new HoverInfoTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class CompletionTool extends Tool<typeof getCompletions> {
  use = getCompletions;
}

export const completionTool = new CompletionTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class SignatureHelpTool extends Tool<typeof getSignatureHelp> {
  use = getSignatureHelp;
}

export const signatureHelpTool = new SignatureHelpTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class DocumentSymbolsTool extends Tool<typeof getDocumentSymbols> {
  use = getDocumentSymbols;
}

export const documentSymbolsTool = new DocumentSymbolsTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class WorkspaceSymbolsTool extends Tool<typeof getWorkspaceSymbols> {
  use = getWorkspaceSymbols;
}

export const workspaceSymbolsTool = new WorkspaceSymbolsTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class CodeActionsTool extends Tool<typeof getCodeActions> {
  use = getCodeActions;
}

export const codeActionsTool = new CodeActionsTool();

/**
 * @doc-code-tool
 * @prompt LSP_QUERY_DOC_CODE_TOOL_PROMPT
 */
class FormatDocumentTool extends Tool<typeof formatDocument> {
  use = formatDocument;
}

export const formatDocumentTool = new FormatDocumentTool();

export type DefinitionToolFn = typeof definitionTool;
export type ReferencesToolFn = typeof referencesTool;
export type HoverToolFn = typeof hoverInfoTool;
export type CompletionToolFn = typeof completionTool;
export type SignatureHelpToolFn = typeof signatureHelpTool;
export type DocumentSymbolsToolFn = typeof documentSymbolsTool;
export type WorkspaceSymbolsToolFn = typeof workspaceSymbolsTool;
export type CodeActionsToolFn = typeof codeActionsTool;
export type FormatDocumentToolFn = typeof formatDocumentTool;
