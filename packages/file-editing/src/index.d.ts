import { z } from 'zod';
export declare class EditError extends Error {
    code: string;
    filePath?: string;
    operation?: string;
    operationId?: string;
    cause?: Error;
    constructor(message: string, code: string, filePath?: string, operation?: string, operationId?: string, cause?: Error);
}
export declare const editCommandSchema: z.ZodObject<{
    command: z.ZodEnum<["view", "create", "str_replace", "insert", "delete", "replace", "patch"]>;
    path: z.ZodString;
    file_text: z.ZodOptional<z.ZodString>;
    insert_line: z.ZodOptional<z.ZodNumber>;
    new_str: z.ZodOptional<z.ZodString>;
    old_str: z.ZodOptional<z.ZodString>;
    view_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    patch_content: z.ZodOptional<z.ZodString>;
    atomic: z.ZodDefault<z.ZodBoolean>;
    create_backup: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path?: string;
    command?: "replace" | "view" | "create" | "str_replace" | "insert" | "delete" | "patch";
    file_text?: string;
    insert_line?: number;
    new_str?: string;
    old_str?: string;
    view_range?: [number, number, ...unknown[]];
    patch_content?: string;
    atomic?: boolean;
    create_backup?: boolean;
}, {
    path?: string;
    command?: "replace" | "view" | "create" | "str_replace" | "insert" | "delete" | "patch";
    file_text?: string;
    insert_line?: number;
    new_str?: string;
    old_str?: string;
    view_range?: [number, number, ...unknown[]];
    patch_content?: string;
    atomic?: boolean;
    create_backup?: boolean;
}>;
export type EditCommandParams = z.infer<typeof editCommandSchema>;
export interface Position {
    line: number;
    character: number;
}
export interface Range {
    start: Position;
    end: Position;
}
export interface TextEdit {
    range: Range;
    newText: string;
}
/**
 * Convert line/character position to absolute string offset.
 * More robust than the simple version in refactoring package.
 */
export declare function positionToOffset(text: string, position: Position): number;
/**
 * Convert absolute string offset to line/character position.
 */
export declare function offsetToPosition(text: string, offset: number): Position;
/**
 * Apply a text edit to content with precise offset calculation.
 */
export declare function applyTextEdit(content: string, edit: TextEdit): string;
/**
 * Apply multiple text edits to content. Edits are sorted and applied in reverse order
 * to maintain offset validity.
 */
export declare function applyTextEdits(content: string, edits: TextEdit[]): string;
export interface FileOperation {
    id: string;
    command: EditCommandParams['command'];
    path: string;
    originalContent?: string;
    newContent?: string;
    timestamp: number;
    metadata?: Record<string, any>;
    transactionId?: string;
}
export interface FileTransaction {
    id: string;
    operations: FileOperation[];
    backups: Map<string, string>;
    locks: Set<string>;
    status: 'pending' | 'committed' | 'rolled_back' | 'failed';
    startTime: number;
    endTime?: number;
    metadata?: Record<string, any>;
}
declare class FileTransactionManager {
    private transactions;
    private fileLocks;
    private operationHistory;
    createTransaction(metadata?: Record<string, any>): string;
    acquireLock(transactionId: string, filePath: string): Promise<void>;
    releaseLock(transactionId: string, filePath: string): void;
    createBackup(transactionId: string, filePath: string): Promise<void>;
    addOperation(transactionId: string, operation: FileOperation): void;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    getTransaction(transactionId: string): FileTransaction | undefined;
    getOperationHistory(): FileOperation[];
    cleanup(): void;
}
declare const transactionManager: FileTransactionManager;
export declare class TransactionalFileEditor {
    private transactionId?;
    constructor(transactionId?: string);
    beginTransaction(metadata?: Record<string, any>): Promise<string>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    private ensureTransaction;
    executeCommand(params: EditCommandParams): Promise<string>;
    private handleView;
    private handleCreate;
    private handleReplace;
    private handleDelete;
    private handleStringReplace;
    private handleInsert;
    private handlePatch;
    private trackOperation;
}
export declare function runEditCommand(params: EditCommandParams): Promise<string>;
export declare const FILE_EDITOR_HISTORY: () => FileOperation[];
export { transactionManager as FileTransactionManager, };
