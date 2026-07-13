/**
 * Bitcode written-asset file mutation support with atomic file management,
 * transaction support, content validation, and proof-facing operation evidence.
 *
 * @purpose Mutate Bitcode written assets with atomic file management, transaction support, content validation, and proof-facing operation evidence
 * @capabilities Written-asset file creation, replacement, deletion, and transaction orchestration with rollback capability, content validation, and file integrity for asset-pack synthesis runs
 * @specificity Generic
 */
import { Tool } from '@bitcode/tools-generics';
import { z } from 'zod';
import { EditCommandParams } from '@bitcode/file-editing';
import type { Execution } from '@bitcode/execution-generics';
declare class ExecutionContextStore {
    private contexts;
    private currentKey;
    run<R>(execution: Execution, fn: () => R | Promise<R>): R | Promise<R>;
    getStore(): Execution | undefined;
}
export declare const executionContext: ExecutionContextStore;
/**
 * Gate-aware wrapper for runEditCommand
 * Checks file gates if execution context is available
 */
declare function runEditCommandWithGates(params: EditCommandParams): Promise<string>;
/**
 * Atomic file editing with comprehensive operation intelligence
 *
 * @doc-code-tool
 * @prompt TEXT_EDITOR_DOC_CODE_TOOL_PROMPT
 */
declare class TextEditorTool extends Tool<typeof runEditCommandWithGates> {
    use: typeof runEditCommandWithGates;
}
export declare const textEditorTool: TextEditorTool;
/**
 * Atomic file deletion with comprehensive safety intelligence
 *
 * @doc-code-tool
 * @prompt DELETE_FILE_DOC_CODE_TOOL_PROMPT
 * @name DeleteFileTool
 * @purpose Atomic file deletion with Bitcode's comprehensive file system safety engine
 * @capabilities Safe file deletion with atomic operations, backup creation, rollback capability, dependency validation, and comprehensive file system safety for reliable file management
 * @parameters EditCommandParams - file path to delete
 * @returns Success status, backup location, transaction ID
 * @category file-system
 * @stability stable
 * @version 1.0.0
 */
declare class DeleteFileTool extends Tool<typeof runEditCommandWithGates> {
    use: typeof runEditCommandWithGates;
}
export declare const deleteFileTool: DeleteFileTool;
/**
 * Atomic file creation with comprehensive validation intelligence
 *
 * @doc-code-tool
 * @prompt CREATE_FILE_DOC_CODE_TOOL_PROMPT
 * @name CreateFileTool
 * @purpose Atomic file creation with Bitcode's comprehensive file system validation engine
 * @capabilities Complete file creation with atomic operations, directory management, content validation, conflict detection, and comprehensive file system integrity for reliable development workflows
 * @parameters EditCommandParams - file path, initial content, permissions
 * @returns Success status, created path, transaction ID
 * @category file-system
 * @stability stable
 * @version 1.0.0
 */
declare class CreateFileTool extends Tool<typeof runEditCommandWithGates> {
    use: typeof runEditCommandWithGates;
}
export declare const createFileTool: CreateFileTool;
/**
 * Atomic file replacement with comprehensive content intelligence
 *
 * @doc-code-tool
 * @prompt REPLACE_FILE_DOC_CODE_TOOL_PROMPT
 */
declare class ReplaceFileTool extends Tool<typeof runEditCommandWithGates> {
    use: typeof runEditCommandWithGates;
}
export declare const replaceFileTool: ReplaceFileTool;
declare const transactionSchema: z.ZodObject<{
    transactionId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, any>;
    transactionId?: string;
}, {
    metadata?: Record<string, any>;
    transactionId?: string;
}>;
export declare const beginTransactionTool: import("@bitcode/tools-generics/factoryTool").FactoryToolResult<(params: z.infer<typeof transactionSchema>) => Promise<{
    success: boolean;
    transactionId: string;
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    message: string;
    transactionId?: undefined;
}>>;
declare const commitTransactionSchema: z.ZodObject<{
    transactionId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, any>;
    transactionId?: string;
}, {
    metadata?: Record<string, any>;
    transactionId?: string;
}>;
export declare const commitTransactionTool: import("@bitcode/tools-generics/factoryTool").FactoryToolResult<(params: z.infer<typeof commitTransactionSchema>) => Promise<{
    success: boolean;
    transactionId: string;
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    transactionId: string;
    message: string;
}>>;
declare const rollbackTransactionSchema: z.ZodObject<{
    transactionId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, any>;
    transactionId?: string;
}, {
    metadata?: Record<string, any>;
    transactionId?: string;
}>;
export declare const rollbackTransactionTool: import("@bitcode/tools-generics/factoryTool").FactoryToolResult<(params: z.infer<typeof rollbackTransactionSchema>) => Promise<{
    success: boolean;
    transactionId: string;
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    transactionId: string;
    message: string;
}>>;
export declare const renameFileTool: typeof textEditorTool;
export declare const directoryTool: typeof textEditorTool;
export type TextEditorToolFn = typeof textEditorTool;
export type DeleteFileToolFn = typeof deleteFileTool;
export type CreateFileToolFn = typeof createFileTool;
export type ReplaceFileToolFn = typeof replaceFileTool;
export type RenameFileToolFn = typeof renameFileTool;
export type DirectoryToolFn = typeof directoryTool;
export type BeginTransactionToolFn = typeof beginTransactionTool;
export type CommitTransactionToolFn = typeof commitTransactionTool;
export type RollbackTransactionToolFn = typeof rollbackTransactionTool;
export {};
