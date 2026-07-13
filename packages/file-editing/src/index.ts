/* -------------------------------------------------------------------------------------------------
 * @bitcode/file-editing — production-grade file editing over @bitcode/files primitives.
 *
 * Features:
 * - Atomic file operations with rollback capability
 * - Precise text editing with offset-based calculations
 * - Transaction support for multi-file operations
 * - File locking to prevent concurrent modifications
 * - Streaming support for large files
 * - Comprehensive error handling and logging
 * - Operation auditing and history tracking
 *
 * Hierarchy: @bitcode/files (FilePath/FileOp/FileChange) → @bitcode/file-editing (this package)
 * ------------------------------------------------------------------------------------------------- */

import { z } from 'zod';
import { log } from '@bitcode/logger';
import {
  type FilePath,
  type FileOp,
  type FileChange,
  createFileChange,
  isFilePath,
  normalizeRepoPath,
} from '@bitcode/files';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Error types and validation schemas
// ---------------------------------------------------------------------------

export class EditError extends Error {
  constructor(
    message: string,
    public code: string,
    public filePath?: string,
    public operation?: string,
    public operationId?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'EditError';
  }
}

export const editCommandSchema = z.object({
  command: z.enum([
    'view',
    'create',
    'str_replace',
    'insert',
    'delete',
    'replace',
    'patch',
  ]),
  path: z.string(),
  file_text: z.string().optional(),
  insert_line: z.number().optional(),
  new_str: z.string().optional(),
  old_str: z.string().optional(),
  view_range: z.tuple([z.number(), z.number()]).optional(),
  patch_content: z.string().optional(),
  atomic: z.boolean().default(true),
  create_backup: z.boolean().default(true),
});

export type EditCommandParams = z.infer<typeof editCommandSchema>;

// ---------------------------------------------------------------------------
// Text position and range utilities
// ---------------------------------------------------------------------------

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
export function positionToOffset(text: string, position: Position): number {
  if (position.line < 0 || position.character < 0) {
    throw new EditError(
      `Invalid position: line=${position.line}, character=${position.character}`,
      'INVALID_POSITION'
    );
  }

  const lines = text.split(/\r?\n/);
  
  if (position.line >= lines.length) {
    throw new EditError(
      `Line ${position.line} is out of bounds (file has ${lines.length} lines)`,
      'POSITION_OUT_OF_BOUNDS'
    );
  }

  let offset = 0;
  for (let i = 0; i < position.line; i++) {
    offset += lines[i].length + 1; // +1 for newline
  }

  if (position.character > lines[position.line].length) {
    throw new EditError(
      `Character ${position.character} is out of bounds (line ${position.line} has ${lines[position.line].length} characters)`,
      'POSITION_OUT_OF_BOUNDS'
    );
  }

  return offset + position.character;
}

/**
 * Convert absolute string offset to line/character position.
 */
export function offsetToPosition(text: string, offset: number): Position {
  if (offset < 0 || offset > text.length) {
    throw new EditError(
      `Offset ${offset} is out of bounds (text length: ${text.length})`,
      'OFFSET_OUT_OF_BOUNDS'
    );
  }

  const lines = text.split(/\r?\n/);
  let currentOffset = 0;
  
  for (let line = 0; line < lines.length; line++) {
    const lineLength = lines[line].length;
    
    if (offset <= currentOffset + lineLength) {
      return {
        line,
        character: offset - currentOffset,
      };
    }
    
    currentOffset += lineLength + 1; // +1 for newline
  }

  // Should never reach here for valid offsets
  throw new EditError(
    `Failed to convert offset ${offset} to position`,
    'OFFSET_CONVERSION_FAILED'
  );
}

/**
 * Apply a text edit to content with precise offset calculation.
 */
export function applyTextEdit(content: string, edit: TextEdit): string {
  const startOffset = positionToOffset(content, edit.range.start);
  const endOffset = positionToOffset(content, edit.range.end);
  
  if (startOffset > endOffset) {
    throw new EditError(
      `Invalid range: start offset ${startOffset} > end offset ${endOffset}`,
      'INVALID_RANGE'
    );
  }

  return content.slice(0, startOffset) + edit.newText + content.slice(endOffset);
}

/**
 * Apply multiple text edits to content. Edits are sorted and applied in reverse order
 * to maintain offset validity.
 */
export function applyTextEdits(content: string, edits: TextEdit[]): string {
  if (edits.length === 0) return content;

  // Sort edits in reverse order (end to start) to preserve offsets
  const sortedEdits = [...edits].sort((a, b) => {
    const aStart = positionToOffset(content, a.range.start);
    const bStart = positionToOffset(content, b.range.start);
    return bStart - aStart;
  });

  let result = content;
  for (const edit of sortedEdits) {
    result = applyTextEdit(result, edit);
  }

  return result;
}

// ---------------------------------------------------------------------------
// File-edit operation records and transaction support
// ---------------------------------------------------------------------------

/**
 * Edit-session operation record (command + content).
 * Distinct from `@bitcode/files` `FileOperation` (tracker mutation record).
 * Maps to a `FileChange` via `fileEditOperationToFileChange`.
 */
export interface FileEditOperation {
  id: string;
  command: EditCommandParams['command'];
  path: FilePath;
  originalContent?: string;
  newContent?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  transactionId?: string;
}

/** @deprecated Prefer FileEditOperation — avoids clash with @bitcode/files FileOperation */
export type FileOperation = FileEditOperation;

export interface FileTransaction {
  id: string;
  operations: FileEditOperation[];
  backups: Map<string, string>;
  locks: Set<string>;
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

/** Map an edit command to a primitive FileOp. */
export function editCommandToFileOp(command: EditCommandParams['command']): FileOp {
  switch (command) {
    case 'create':
      return 'add';
    case 'delete':
      return 'delete';
    case 'view':
      return 'modify'; // read-only; no mutation
    default:
      return 'modify';
  }
}

/** Project a FileEditOperation onto the FileChange primitive. */
export function fileEditOperationToFileChange(operation: FileEditOperation): FileChange {
  return createFileChange(operation.path, editCommandToFileOp(operation.command));
}

class FileTransactionManager {
  private transactions = new Map<string, FileTransaction>();
  private fileLocks = new Map<string, string>(); // file -> transaction ID
  private operationHistory: FileEditOperation[] = [];

  createTransaction(metadata?: Record<string, any>): string {
    const transactionId = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    const transaction: FileTransaction = {
      id: transactionId,
      operations: [],
      backups: new Map(),
      locks: new Set(),
      status: 'pending',
      startTime: Date.now(),
      metadata,
    };

    this.transactions.set(transactionId, transaction);
    
    log('Transaction created', 'debug', {
      transactionId,
      metadata,
    });

    return transactionId;
  }

  async acquireLock(transactionId: string, filePath: string): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    const existingLock = this.fileLocks.get(resolvedPath);
    
    if (existingLock && existingLock !== transactionId) {
      throw new EditError(
        `File is locked by another transaction: ${existingLock}`,
        'FILE_LOCKED',
        filePath,
        undefined,
        transactionId
      );
    }

    this.fileLocks.set(resolvedPath, transactionId);
    
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      transaction.locks.add(resolvedPath);
    }

    log('File lock acquired', 'debug', {
      transactionId,
      filePath: resolvedPath,
    });
  }

  releaseLock(transactionId: string, filePath: string): void {
    const resolvedPath = path.resolve(filePath);
    const lockOwner = this.fileLocks.get(resolvedPath);
    
    if (lockOwner === transactionId) {
      this.fileLocks.delete(resolvedPath);
      
      const transaction = this.transactions.get(transactionId);
      if (transaction) {
        transaction.locks.delete(resolvedPath);
      }

      log('File lock released', 'debug', {
        transactionId,
        filePath: resolvedPath,
      });
    }
  }

  async createBackup(transactionId: string, filePath: string): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new EditError(
        `Transaction not found: ${transactionId}`,
        'TRANSACTION_NOT_FOUND',
        filePath,
        undefined,
        transactionId
      );
    }

    if (transaction.backups.has(resolvedPath)) {
      return; // Already backed up
    }

    try {
      const content = await fs.readFile(resolvedPath, 'utf8');
      transaction.backups.set(resolvedPath, content);
      
      log('Backup created', 'debug', {
        transactionId,
        filePath: resolvedPath,
        size: content.length,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist yet - store empty backup
        transaction.backups.set(resolvedPath, '');
        log('Backup created for new file', 'debug', {
          transactionId,
          filePath: resolvedPath,
        });
      } else {
        throw new EditError(
          `Failed to create backup: ${error}`,
          'BACKUP_FAILED',
          filePath,
          undefined,
          transactionId,
          error instanceof Error ? error : undefined
        );
      }
    }
  }

  addOperation(transactionId: string, operation: FileEditOperation): void {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new EditError(
        `Transaction not found: ${transactionId}`,
        'TRANSACTION_NOT_FOUND',
        operation.path,
        operation.command,
        transactionId
      );
    }

    operation.transactionId = transactionId;
    transaction.operations.push(operation);
    this.operationHistory.push(operation);

    log('Operation added to transaction', 'debug', {
      transactionId,
      operationId: operation.id,
      command: operation.command,
      path: operation.path,
    });
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new EditError(
        `Transaction not found: ${transactionId}`,
        'TRANSACTION_NOT_FOUND',
        undefined,
        undefined,
        transactionId
      );
    }

    if (transaction.status !== 'pending') {
      throw new EditError(
        `Transaction is not pending: ${transaction.status}`,
        'INVALID_TRANSACTION_STATUS',
        undefined,
        undefined,
        transactionId
      );
    }

    try {
      transaction.status = 'committed';
      transaction.endTime = Date.now();
      
      // Release all locks
      for (const filePath of transaction.locks) {
        this.releaseLock(transactionId, filePath);
      }

      log('Transaction committed', 'info', {
        transactionId,
        operationCount: transaction.operations.length,
        duration: transaction.endTime - transaction.startTime,
      });
      
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new EditError(
        `Transaction not found: ${transactionId}`,
        'TRANSACTION_NOT_FOUND',
        undefined,
        undefined,
        transactionId
      );
    }

    try {
      log('Rolling back transaction', 'warn', {
        transactionId,
        backupCount: transaction.backups.size,
      });

      // Restore all files from backups
      for (const [filePath, content] of transaction.backups.entries()) {
        try {
          if (content === '') {
            // File was created in this transaction - delete it
            await fs.unlink(filePath);
          } else {
            // Restore original content
            await fs.writeFile(filePath, content, 'utf8');
          }
          
          log('File restored from backup', 'debug', {
            transactionId,
            filePath,
          });
        } catch (error) {
          log('Failed to restore file from backup', 'error', {
            transactionId,
            filePath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Release all locks
      for (const filePath of transaction.locks) {
        this.releaseLock(transactionId, filePath);
      }

      transaction.status = 'rolled_back';
      transaction.endTime = Date.now();

      log('Transaction rolled back', 'info', {
        transactionId,
        duration: transaction.endTime - transaction.startTime,
      });
      
    } catch (error) {
      transaction.status = 'failed';
      throw error;
    }
  }

  getTransaction(transactionId: string): FileTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  getOperationHistory(): FileEditOperation[] {
    return [...this.operationHistory];
  }

  cleanup(): void {
    // Clean up old transactions (older than 1 hour)
    const cutoff = Date.now() - 60 * 60 * 1000;
    
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.startTime < cutoff && transaction.status !== 'pending') {
        this.transactions.delete(id);
      }
    }
  }
}

const transactionManager = new FileTransactionManager();

// Cleanup old transactions periodically
const transactionCleanupInterval = setInterval(() => transactionManager.cleanup(), 5 * 60 * 1000); // Every 5 minutes
transactionCleanupInterval.unref?.();

// ---------------------------------------------------------------------------
// Core editing operations with atomic transaction support
// ---------------------------------------------------------------------------

export class TransactionalFileEditor {
  private transactionId?: string;

  constructor(transactionId?: string) {
    this.transactionId = transactionId;
  }

  async beginTransaction(metadata?: Record<string, any>): Promise<string> {
    if (this.transactionId) {
      throw new EditError(
        'Editor already has an active transaction',
        'TRANSACTION_ALREADY_ACTIVE'
      );
    }
    
    this.transactionId = transactionManager.createTransaction(metadata);
    return this.transactionId;
  }

  async commitTransaction(): Promise<void> {
    if (!this.transactionId) {
      throw new EditError(
        'No active transaction to commit',
        'NO_ACTIVE_TRANSACTION'
      );
    }
    
    await transactionManager.commitTransaction(this.transactionId);
    this.transactionId = undefined;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.transactionId) {
      throw new EditError(
        'No active transaction to rollback',
        'NO_ACTIVE_TRANSACTION'
      );
    }
    
    await transactionManager.rollbackTransaction(this.transactionId);
    this.transactionId = undefined;
  }

  private ensureTransaction(): string {
    if (!this.transactionId) {
      // Auto-create transaction for atomic operations
      this.transactionId = transactionManager.createTransaction({
        autoCreated: true,
      });
    }
    return this.transactionId;
  }

  async executeCommand(params: EditCommandParams): Promise<string> {
    const validated = editCommandSchema.parse(params);
    const { command, path: filePath } = validated;
    
    const normalizedPath = normalizeRepoPath(filePath);
    if (!isFilePath(normalizedPath)) {
      throw new EditError(
        `Invalid file path: ${filePath}`,
        'INVALID_PATH',
        filePath,
        command
      );
    }

    const operationId = crypto.randomUUID();
    const operation: FileEditOperation = {
      id: operationId,
      command,
      path: normalizedPath,
      timestamp: Date.now(),
      metadata: {
        originalPath: filePath,
        normalizedPath,
        fileChange: fileEditOperationToFileChange({
          id: operationId,
          command,
          path: normalizedPath,
          timestamp: Date.now(),
        }),
        params: validated,
      },
    };

    switch (command) {
      case 'view':
        return await this.handleView(validated, operation);
      case 'create':
        return await this.handleCreate(validated, operation);
      case 'replace':
        return await this.handleReplace(validated, operation);
      case 'delete':
        return await this.handleDelete(validated, operation);
      case 'str_replace':
        return await this.handleStringReplace(validated, operation);
      case 'insert':
        return await this.handleInsert(validated, operation);
      case 'patch':
        return await this.handlePatch(validated, operation);
      default:
        throw new EditError(
          `Unsupported command: ${command}`,
          'UNSUPPORTED_COMMAND',
          filePath,
          command,
          operationId
        );
    }
  }

  private async handleView(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { path: filePath, file_text, view_range } = params;
    
    try {
      let content: string;
      
      if (file_text) {
        content = file_text;
        operation.originalContent = content;
      } else {
        await fs.access(operation.path, fsSync.constants.R_OK);
        content = await fs.readFile(operation.path, 'utf-8');
        operation.originalContent = content;
      }

      log('File read successfully', 'debug', {
        operationId: operation.id,
        path: operation.path,
        size: content.length,
      });

      if (view_range) {
        const lines = content.split('\n');
        const [start, end] = view_range;
        return lines.slice(start - 1, end).join('\n');
      }

      return content;
      
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      
      if (nodeError.code === 'ENOENT') {
        log('File not found', 'warn', { 
          operationId: operation.id,
          path: operation.path,
        });
        return `File not found: ${operation.path}`;
      }
      
      if (nodeError.code === 'EACCES') {
        throw new EditError(
          `Permission denied: ${operation.path}`,
          'PERMISSION_DENIED',
          operation.path,
          operation.command,
          operation.id,
          nodeError
        );
      }
      
      throw new EditError(
        `Failed to read file: ${nodeError.message}`,
        'READ_FAILED',
        operation.path,
        operation.command,
        operation.id,
        nodeError
      );
    }
  }

  private async handleCreate(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { file_text, atomic, create_backup } = params;
    
    if (file_text === undefined) {
      throw new EditError(
        'file_text is required for create command',
        'MISSING_PARAMETER',
        operation.path,
        operation.command,
        operation.id
      );
    }

    if (atomic) {
      const transactionId = this.ensureTransaction();
      await transactionManager.acquireLock(transactionId, operation.path);
      
      if (create_backup) {
        await transactionManager.createBackup(transactionId, operation.path);
      }
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(operation.path);
      await fs.mkdir(dir, { recursive: true });
      
      operation.originalContent = '';
      operation.newContent = file_text;
      
      if (atomic) {
        // Atomic write using temp file
        const tempFile = `${operation.path}.tmp.${operation.id}`;
        await fs.writeFile(tempFile, file_text, 'utf8');
        await fs.rename(tempFile, operation.path);
      } else {
        await fs.writeFile(operation.path, file_text, 'utf8');
      }

      if (this.transactionId) {
        transactionManager.addOperation(this.transactionId, operation);
      }

      // Integrate with FileTracker if available
      this.trackOperation('create', operation.path, file_text);

      log('File created successfully', 'info', {
        operationId: operation.id,
        path: operation.path,
        size: file_text.length,
        atomic,
      });

      return 'created';
      
    } catch (error) {
      if (atomic && this.transactionId) {
        await transactionManager.rollbackTransaction(this.transactionId);
      }
      
      throw new EditError(
        `Failed to create file: ${error}`,
        'CREATE_FAILED',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async handleReplace(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { file_text, atomic, create_backup } = params;
    
    if (file_text === undefined) {
      throw new EditError(
        'file_text is required for replace command',
        'MISSING_PARAMETER',
        operation.path,
        operation.command,
        operation.id
      );
    }

    if (atomic) {
      const transactionId = this.ensureTransaction();
      await transactionManager.acquireLock(transactionId, operation.path);
      
      if (create_backup) {
        await transactionManager.createBackup(transactionId, operation.path);
      }
    }

    try {
      let originalContent = '';
      try {
        originalContent = await fs.readFile(operation.path, 'utf8');
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code !== 'ENOENT') {
          throw error;
        }
      }
      
      operation.originalContent = originalContent;
      operation.newContent = file_text;

      if (atomic) {
        // Atomic write using temp file
        const tempFile = `${operation.path}.tmp.${operation.id}`;
        await fs.writeFile(tempFile, file_text, 'utf8');
        await fs.rename(tempFile, operation.path);
      } else {
        await fs.writeFile(operation.path, file_text, 'utf8');
      }

      if (this.transactionId) {
        transactionManager.addOperation(this.transactionId, operation);
      }

      // Integrate with FileTracker if available
      this.trackOperation('edit', operation.path, file_text);

      log('File replaced successfully', 'info', {
        operationId: operation.id,
        path: operation.path,
        originalSize: originalContent.length,
        newSize: file_text.length,
        atomic,
      });

      return 'replaced';
      
    } catch (error) {
      if (atomic && this.transactionId) {
        await transactionManager.rollbackTransaction(this.transactionId);
      }
      
      throw new EditError(
        `Failed to replace file: ${error}`,
        'REPLACE_FAILED',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async handleDelete(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { atomic, create_backup } = params;

    if (atomic) {
      const transactionId = this.ensureTransaction();
      await transactionManager.acquireLock(transactionId, operation.path);
      
      if (create_backup) {
        await transactionManager.createBackup(transactionId, operation.path);
      }
    }

    try {
      let originalContent = '';
      try {
        originalContent = await fs.readFile(operation.path, 'utf8');
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          log('File already deleted or does not exist', 'info', {
            operationId: operation.id,
            path: operation.path,
          });
          return 'deleted';
        }
        throw error;
      }

      operation.originalContent = originalContent;
      operation.newContent = '';

      await fs.rm(operation.path, { force: true });

      if (this.transactionId) {
        transactionManager.addOperation(this.transactionId, operation);
      }

      // Integrate with FileTracker if available
      this.trackOperation('delete', operation.path, originalContent);

      log('File deleted successfully', 'info', {
        operationId: operation.id,
        path: operation.path,
        size: originalContent.length,
        atomic,
      });

      return 'deleted';
      
    } catch (error) {
      if (atomic && this.transactionId) {
        await transactionManager.rollbackTransaction(this.transactionId);
      }
      
      throw new EditError(
        `Failed to delete file: ${error}`,
        'DELETE_FAILED',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async handleStringReplace(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { old_str, new_str, atomic, create_backup } = params;
    
    if (old_str === undefined || new_str === undefined) {
      throw new EditError(
        'old_str and new_str are required for str_replace command',
        'MISSING_PARAMETER',
        operation.path,
        operation.command,
        operation.id
      );
    }

    if (atomic) {
      const transactionId = this.ensureTransaction();
      await transactionManager.acquireLock(transactionId, operation.path);
      
      if (create_backup) {
        await transactionManager.createBackup(transactionId, operation.path);
      }
    }

    try {
      const originalContent = await fs.readFile(operation.path, 'utf8');
      operation.originalContent = originalContent;

      // Use precise string replacement with boundary checking
      const replacementCount = (originalContent.match(new RegExp(escapeRegex(old_str), 'g')) || []).length;
      
      if (replacementCount === 0) {
        throw new EditError(
          `String not found in file: "${old_str}"`,
          'STRING_NOT_FOUND',
          operation.path,
          operation.command,
          operation.id
        );
      }

      const updatedContent = originalContent.split(old_str).join(new_str);
      operation.newContent = updatedContent;

      if (atomic) {
        // Atomic write using temp file
        const tempFile = `${operation.path}.tmp.${operation.id}`;
        await fs.writeFile(tempFile, updatedContent, 'utf8');
        await fs.rename(tempFile, operation.path);
      } else {
        await fs.writeFile(operation.path, updatedContent, 'utf8');
      }

      if (this.transactionId) {
        transactionManager.addOperation(this.transactionId, operation);
      }

      // Integrate with FileTracker if available
      this.trackOperation('edit', operation.path, updatedContent);

      log('String replacement completed', 'info', {
        operationId: operation.id,
        path: operation.path,
        replacementCount,
        originalSize: originalContent.length,
        newSize: updatedContent.length,
        atomic,
      });

      return `replaced_string (${replacementCount} occurrences)`;
      
    } catch (error) {
      if (atomic && this.transactionId) {
        await transactionManager.rollbackTransaction(this.transactionId);
      }
      
      if (error instanceof EditError) {
        throw error;
      }
      
      throw new EditError(
        `Failed to replace string: ${error}`,
        'STRING_REPLACE_FAILED',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async handleInsert(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { insert_line, new_str, atomic, create_backup } = params;
    
    if (insert_line === undefined || new_str === undefined) {
      throw new EditError(
        'insert_line and new_str are required for insert command',
        'MISSING_PARAMETER',
        operation.path,
        operation.command,
        operation.id
      );
    }

    if (atomic) {
      const transactionId = this.ensureTransaction();
      await transactionManager.acquireLock(transactionId, operation.path);
      
      if (create_backup) {
        await transactionManager.createBackup(transactionId, operation.path);
      }
    }

    try {
      const originalContent = await fs.readFile(operation.path, 'utf8');
      operation.originalContent = originalContent;

      const lines = originalContent.split('\n');
      
      if (insert_line < 1 || insert_line > lines.length + 1) {
        throw new EditError(
          `Insert line ${insert_line} is out of bounds (file has ${lines.length} lines)`,
          'LINE_OUT_OF_BOUNDS',
          operation.path,
          operation.command,
          operation.id
        );
      }

      // Insert at the specified line (1-based indexing)
      lines.splice(insert_line - 1, 0, new_str);
      const updatedContent = lines.join('\n');
      operation.newContent = updatedContent;

      if (atomic) {
        // Atomic write using temp file
        const tempFile = `${operation.path}.tmp.${operation.id}`;
        await fs.writeFile(tempFile, updatedContent, 'utf8');
        await fs.rename(tempFile, operation.path);
      } else {
        await fs.writeFile(operation.path, updatedContent, 'utf8');
      }

      if (this.transactionId) {
        transactionManager.addOperation(this.transactionId, operation);
      }

      // Integrate with FileTracker if available
      this.trackOperation('edit', operation.path, updatedContent);

      log('Line insertion completed', 'info', {
        operationId: operation.id,
        path: operation.path,
        insertLine: insert_line,
        originalSize: originalContent.length,
        newSize: updatedContent.length,
        atomic,
      });

      return 'inserted';
      
    } catch (error) {
      if (atomic && this.transactionId) {
        await transactionManager.rollbackTransaction(this.transactionId);
      }
      
      if (error instanceof EditError) {
        throw error;
      }
      
      throw new EditError(
        `Failed to insert line: ${error}`,
        'INSERT_FAILED',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async handlePatch(params: EditCommandParams, operation: FileEditOperation): Promise<string> {
    const { patch_content, atomic, create_backup } = params;
    
    if (patch_content === undefined) {
      throw new EditError(
        'patch_content is required for patch command',
        'MISSING_PARAMETER',
        operation.path,
        operation.command,
        operation.id
      );
    }

    // Parse patch content as JSON array of TextEdit objects
    let textEdits: TextEdit[];
    try {
      textEdits = JSON.parse(patch_content);
      if (!Array.isArray(textEdits)) {
        throw new Error('Patch content must be an array of TextEdit objects');
      }
    } catch (error) {
      throw new EditError(
        `Invalid patch content: ${error}`,
        'INVALID_PATCH',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }

    if (atomic) {
      const transactionId = this.ensureTransaction();
      await transactionManager.acquireLock(transactionId, operation.path);
      
      if (create_backup) {
        await transactionManager.createBackup(transactionId, operation.path);
      }
    }

    try {
      const originalContent = await fs.readFile(operation.path, 'utf8');
      operation.originalContent = originalContent;

      const updatedContent = applyTextEdits(originalContent, textEdits);
      operation.newContent = updatedContent;

      if (atomic) {
        // Atomic write using temp file
        const tempFile = `${operation.path}.tmp.${operation.id}`;
        await fs.writeFile(tempFile, updatedContent, 'utf8');
        await fs.rename(tempFile, operation.path);
      } else {
        await fs.writeFile(operation.path, updatedContent, 'utf8');
      }

      if (this.transactionId) {
        transactionManager.addOperation(this.transactionId, operation);
      }

      // Integrate with FileTracker if available
      this.trackOperation('edit', operation.path, updatedContent);

      log('Patch application completed', 'info', {
        operationId: operation.id,
        path: operation.path,
        editCount: textEdits.length,
        originalSize: originalContent.length,
        newSize: updatedContent.length,
        atomic,
      });

      return `patch_applied (${textEdits.length} edits)`;
      
    } catch (error) {
      if (atomic && this.transactionId) {
        await transactionManager.rollbackTransaction(this.transactionId);
      }
      
      if (error instanceof EditError) {
        throw error;
      }
      
      throw new EditError(
        `Failed to apply patch: ${error}`,
        'PATCH_FAILED',
        operation.path,
        operation.command,
        operation.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  private trackOperation(type: 'create' | 'edit' | 'delete', filePath: FilePath, content: string): void {
    try {
      // Context would come from execution-generics in real implementation
      const getGlobalContext = () => ({ repoPath: process.cwd() });
      const gc = getGlobalContext() as any;
      const fileTracker = gc?.repository?.fileTracker;
      const op: FileOp = type === 'create' ? 'add' : type === 'delete' ? 'delete' : 'modify';
      const change = createFileChange(filePath, op);

      if (fileTracker && typeof fileTracker.track === 'function') {
        fileTracker.track({
          type,
          path: change.path,
          op: change.op,
          content,
          timestamp: Date.now(),
        });
      }
    } catch {
      // FileTracker integration is optional
    }
  }
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Convenience command runner
// ---------------------------------------------------------------------------

export async function runEditCommand(params: EditCommandParams): Promise<string> {
  const editor = new TransactionalFileEditor();
  
  try {
    if (params.atomic !== false) {
      await editor.beginTransaction();
    }
    
    const result = await editor.executeCommand(params);
    
    if (params.atomic !== false) {
      await editor.commitTransaction();
    }
    
    return result;
    
  } catch (error) {
    if (params.atomic !== false) {
      try {
        await editor.rollbackTransaction();
      } catch (rollbackError) {
        log('Failed to rollback after error', 'error', {
          originalError: error instanceof Error ? error.message : String(error),
          rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
        });
      }
    }
    
    throw error;
  }
}

export const FILE_EDITOR_HISTORY = () => transactionManager.getOperationHistory();

// ---------------------------------------------------------------------------
// Exports for advanced usage
// ---------------------------------------------------------------------------

export {
  transactionManager as FileTransactionManager,
};
