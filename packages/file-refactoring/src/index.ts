/** @bitcode/file-refactoring — symbol rename and file refactors over @bitcode/files primitives. */
// Lightweight code-refactoring helpers – first feature: renameSymbol().

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

import { renameSymbolLsp, LspError, RenameSymbolParams } from '@bitcode/lsp';
import { log } from '@bitcode/logger';
import { type FilePath, isFilePath, normalizeRepoPath } from '@bitcode/files';

/**
 * Parameters for renameSymbol.
 */
export const renameSymbolParamsSchema = z.object({
  symbolName: z.string().min(1),
  newName: z.string().min(1),
  /** Absolute or relative file path where the symbol appears (provides position hint) */
  filePath: z.string().min(1),
  line: z.number().int().nonnegative(),
  character: z.number().int().nonnegative(),
});

export type RenameSymbolParams = z.infer<typeof renameSymbolParamsSchema>;

/**
 * Production-grade symbol renaming with atomic operations, transaction support,
 * and comprehensive error handling. Creates backups and supports rollback.
 */
export async function renameSymbol(params: RenameSymbolParams): Promise<{ 
  filesChanged: number;
  operationId: string;
  backupCreated: boolean;
  totalEdits: number;
}> {
  const operationId = `refactor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();
  
  log('Starting atomic symbol rename', 'info', {
    operationId,
    params,
  });

  let backupMap = new Map<string, string>();
  let filesChanged = 0;
  let totalEdits = 0;
  
  try {
    // Phase 1: Get LSP workspace edit
    const edit = await renameSymbolLsp(params);

    if (!edit || !edit.changes) {
      log('No changes to apply from LSP', 'info', { operationId });
      return { filesChanged: 0, operationId, backupCreated: false, totalEdits: 0 };
    }

    const filesToModify = Object.keys(edit.changes);
    log('Creating backups for atomic operation', 'info', {
      operationId,
      fileCount: filesToModify.length,
    });

    // Phase 2: Create backups of all files to be modified
    for (const uri of filesToModify) {
      const file = uri.startsWith('file://') ? uri.slice(7) : uri;
      
      if (!fs.existsSync(file)) {
        log('Skipping non-existent file', 'warn', { operationId, file });
        continue;
      }
      
      try {
        const originalContent = fs.readFileSync(file, 'utf8');
        backupMap.set(file, originalContent);
      } catch (error) {
        log('Failed to create backup', 'error', {
          operationId,
          file,
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(`Failed to backup file ${file}: ${error}`);
      }
    }

    // Phase 3: Apply all edits atomically
    for (const [uri, textEdits] of Object.entries(edit.changes)) {
      const file = uri.startsWith('file://') ? uri.slice(7) : uri;
      
      if (!backupMap.has(file)) {
        continue; // Skip files we couldn't backup
      }

      try {
        let content = backupMap.get(file)!; // Use backup as source of truth
        
        // Apply edits in reverse order (end ➜ start) so offsets remain valid
        const sorted = [...textEdits].sort((a, b) => {
          if (a.range.start.line !== b.range.start.line) return b.range.start.line - a.range.start.line;
          return b.range.start.character - a.range.start.character;
        });

        log('Applying edits to file', 'debug', {
          operationId,
          file,
          editCount: sorted.length,
        });

        for (const te of sorted) {
          const startOffset = offsetAt(content, te.range.start);
          const endOffset = offsetAt(content, te.range.end);
          
          if (startOffset < 0 || endOffset < 0 || startOffset > content.length || endOffset > content.length) {
            throw new Error(`Invalid edit range: start=${startOffset}, end=${endOffset}, content.length=${content.length}`);
          }
          
          content = content.slice(0, startOffset) + te.newText + content.slice(endOffset);
          totalEdits++;
        }

        // Atomic write with temp file
        const tempFile = `${file}.tmp.${operationId}`;
        fs.writeFileSync(tempFile, content, 'utf8');
        fs.renameSync(tempFile, file);
        
        filesChanged++;
        
        log('File successfully modified', 'debug', {
          operationId,
          file,
          originalSize: backupMap.get(file)!.length,
          newSize: content.length,
        });
        
      } catch (error) {
        log('Failed to apply edits to file', 'error', {
          operationId,
          file,
          error: error instanceof Error ? error.message : String(error),
        });
        
        // Rollback all changes
        await rollbackChanges(backupMap, operationId);
        throw new Error(`Failed to apply edits to ${file}: ${error}`);
      }
    }

    log('Atomic symbol rename completed successfully', 'info', {
      operationId,
      filesChanged,
      totalEdits,
      duration: Date.now() - startTime,
    });

    return { 
      filesChanged, 
      operationId, 
      backupCreated: backupMap.size > 0,
      totalEdits,
    };

  } catch (error) {
    log('Symbol rename operation failed', 'error', {
      operationId,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });

    // Attempt rollback if we have backups
    if (backupMap.size > 0) {
      await rollbackChanges(backupMap, operationId);
    }

    if (error instanceof LspError) {
      throw error;
    }
    
    throw new Error(`Symbol rename failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Rollback changes to all files using backup content.
 */
async function rollbackChanges(backupMap: Map<string, string>, operationId: string): Promise<void> {
  log('Rolling back changes', 'warn', {
    operationId,
    fileCount: backupMap.size,
  });

  let rollbackErrors: string[] = [];

  for (const [file, originalContent] of backupMap.entries()) {
    try {
      fs.writeFileSync(file, originalContent, 'utf8');
      log('File rolled back successfully', 'debug', {
        operationId,
        file,
      });
    } catch (error) {
      const errorMsg = `Failed to rollback ${file}: ${error}`;
      rollbackErrors.push(errorMsg);
      log('Rollback failed for file', 'error', {
        operationId,
        file,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (rollbackErrors.length > 0) {
    log('Rollback completed with errors', 'error', {
      operationId,
      errors: rollbackErrors,
    });
    throw new Error(`Rollback had errors: ${rollbackErrors.join('; ')}`);
  }

  log('Rollback completed successfully', 'info', { operationId });
}

// Helper – convert Position to string offset.
function offsetAt(text: string, pos: { line: number; character: number }) {
  const lines = text.split(/\r?\n/);
  let offset = 0;
  for (let i = 0; i < pos.line; i++) offset += lines[i].length + 1; // +1 newline
  return offset + pos.character;
}
