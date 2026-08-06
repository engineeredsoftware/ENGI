/**
 * Bitcode code-refactor tool adapters.
 *
 * These retained support tools bind refactoring primitives to doc-code prompt
 * descriptions. They are support infrastructure for agentic Bitcode runs, not
 * standalone product owners.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  renameSymbol,
  extractMethod,
  organizeImports,
  inlineVariable,
  moveSymbol,
  type RenameSymbolParams,
  type ExtractMethodParams,
  type OrganizeImportsParams,
  type InlineVariableParams,
  type MoveSymbolParams,
} from '@bitcode/file-refactoring';
import {
  RENAME_SYMBOL_DOC_CODE_TOOL_PROMPT,
  EXTRACT_METHOD_DOC_CODE_TOOL_PROMPT,
  ORGANIZE_IMPORTS_DOC_CODE_TOOL_PROMPT,
  INLINE_VARIABLE_DOC_CODE_TOOL_PROMPT,
  MOVE_SYMBOL_DOC_CODE_TOOL_PROMPT
} from './prompts';

// =============================================================================
// RENAME SYMBOL TOOL
// =============================================================================

/**
 * RENAME SYMBOL TOOL - Repository-wide symbol renaming with LSP semantic analysis
 * 
 * @doc-code-tool
 * @prompt RENAME_SYMBOL_DOC_CODE_TOOL_PROMPT
 * @purpose Repository-wide symbol renaming with LSP semantic analysis, atomic operations, and comprehensive dependency tracking for safe refactoring
 * @capabilities Symbol identification, dependency tracking, cross-file renaming, rollback support, semantic validation, and conflict detection
 * @keyParameters filePath (target file), position (symbol position), newName (replacement name), atomic (safety mode), validateReferences (dependency check)
 * @output Detailed rename report with affected files, change counts, dependency analysis, and success confirmation with rollback information
 * @bestFor Large-scale refactoring, symbol standardization, repository-wide consistency improvements, and Bitcode support-code reform
 * @strategicUsage Critical for maintaining code quality during refactoring operations, enabling safe large-scale changes without breaking dependencies
 * @integrationPattern Works with LSP servers, TypeScript compiler, and version control systems for comprehensive rename safety and validation
 * @contextAwareness Uses semantic analysis to understand symbol usage, import relationships, and cross-file dependencies for complete rename safety
 * @specificity Generic
 */
class RenameSymbolTool extends Tool<typeof renameSymbol> {
  use = renameSymbol;
}

// =============================================================================
// EXTRACT METHOD TOOL
// =============================================================================

/**
 * EXTRACT METHOD TOOL - Code extraction with LSP semantic analysis
 * 
 * @doc-code-tool
 * @prompt EXTRACT_METHOD_DOC_CODE_TOOL_PROMPT
 * @purpose Code extraction using LSP semantic analysis to create new methods from selected code blocks with automatic parameter detection
 * @capabilities Code block analysis, parameter extraction, scope analysis, method generation, import handling, and semantic validation
 * @keyParameters filePath (source file), startPosition (selection start), endPosition (selection end), methodName (new method name), insertionPoint (method placement)
 * @output Method extraction report with generated method signature, parameter list, affected code blocks, and integration status
 * @bestFor Code organization, reducing method complexity, improving readability, and creating reusable code components
 * @strategicUsage Essential for refactoring large methods, improving code maintainability, and following single responsibility principle
 * @integrationPattern Integrates with LSP servers for semantic analysis and code generation with proper scope and import handling
 * @contextAwareness Understands variable scope, dependencies, and code flow to generate semantically correct extracted methods
 * @specificity Generic
 */
class ExtractMethodTool extends Tool<typeof extractMethod> {
  use = extractMethod;
}

// =============================================================================
// ORGANIZE IMPORTS TOOL
// =============================================================================

/**
 * ORGANIZE IMPORTS TOOL - Import statement optimization and organization
 * 
 * @doc-code-tool
 * @prompt ORGANIZE_IMPORTS_DOC_CODE_TOOL_PROMPT
 * @purpose Import statement optimization, sorting, and cleanup with unused import removal and formatting standardization
 * @capabilities Import sorting, unused import detection, duplicate removal, formatting standardization, and dependency optimization
 * @keyParameters filePath (target file), sortStyle (import ordering), removeUnused (cleanup unused), groupByType (grouping strategy)
 * @output Import organization report with removed imports, reordered statements, and optimization statistics
 * @bestFor Code cleanup, import standardization, bundle optimization, and maintaining clean dependency structures
 * @strategicUsage Critical for maintaining clean codebases, reducing bundle size, and improving build performance
 * @integrationPattern Works with TypeScript compiler and bundlers to optimize import statements and dependency graphs
 * @contextAwareness Analyzes import usage patterns and dependency relationships to safely optimize import statements
 * @specificity Generic
 */
class OrganizeImportsTool extends Tool<typeof organizeImports> {
  use = organizeImports;
}

// =============================================================================
// INLINE VARIABLE TOOL
// =============================================================================

/**
 * INLINE VARIABLE TOOL - Variable inlining with semantic analysis
 * 
 * @doc-code-tool
 * @prompt INLINE_VARIABLE_DOC_CODE_TOOL_PROMPT
 * @purpose Variable inlining by replacing all usages with variable definition using LSP semantic analysis for safe code simplification
 * @capabilities Variable usage analysis, definition extraction, scope validation, inline replacement, and semantic safety checks
 * @keyParameters filePath (target file), position (variable position), validateReferences (safety check), preserveComments (comment handling)
 * @output Inline operation report with replacement count, affected locations, and validation results
 * @bestFor Code simplification, removing unnecessary variables, improving readability, and reducing cognitive complexity
 * @strategicUsage Essential for simplifying code and removing intermediate variables that don't add value
 * @integrationPattern Uses LSP semantic analysis to ensure safe inlining without changing code behavior
 * @contextAwareness Understands variable scope, usage patterns, and side effects to perform safe inline operations
 * @specificity Generic
 */
class InlineVariableTool extends Tool<typeof inlineVariable> {
  use = inlineVariable;
}

// =============================================================================
// MOVE SYMBOL TOOL
// =============================================================================

/**
 * MOVE SYMBOL TOOL - Symbol relocation with dependency tracking
 * 
 * @doc-code-tool
 * @prompt MOVE_SYMBOL_DOC_CODE_TOOL_PROMPT
 * @purpose Symbol relocation between files with comprehensive dependency tracking and import statement updates
 * @capabilities Symbol analysis, dependency tracking, cross-file movement, import updates, and reference resolution
 * @keyParameters sourceFile (current location), targetFile (destination), symbolName (symbol to move), updateImports (automatic import fixes)
 * @output Move operation report with updated files, import changes, and dependency resolution status
 * @bestFor Code organization, module restructuring, separating concerns, and improving architectural boundaries
 * @strategicUsage Critical for maintaining clean architecture and proper separation of concerns in large codebases
 * @integrationPattern Integrates with module systems and import resolvers to maintain code integrity during moves
 * @contextAwareness Tracks symbol dependencies and import relationships to ensure safe relocation without breaking references
 * @specificity Generic
 */
class MoveSymbolTool extends Tool<typeof moveSymbol> {
  use = moveSymbol;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const renameSymbolTool = new RenameSymbolTool();
export const extractMethodTool = new ExtractMethodTool();
export const organizeImportsTool = new OrganizeImportsTool();
export const inlineVariableTool = new InlineVariableTool();
export const moveSymbolTool = new MoveSymbolTool();

// Type exports for enhanced type safety
export type RenameSymbolToolFn = Tool<typeof renameSymbolTool.use>;
export type ExtractMethodToolFn = Tool<typeof extractMethodTool.use>;
export type OrganizeImportsToolFn = Tool<typeof organizeImportsTool.use>;
export type InlineVariableToolFn = Tool<typeof inlineVariableTool.use>;
export type MoveSymbolToolFn = Tool<typeof moveSymbolTool.use>;

/**
 * Bitcode V26 support boundary:
 *
 * - Refactoring behavior stays in primitive packages.
 * - Tool classes expose those primitives through a stable `.use` carrier.
 * - Doc-code prompts describe tool capability for agentic runs.
 * - Execution records and asset-pack outputs remain the canonical product
 *   objects; these adapters only provide bounded support actions.
 */
