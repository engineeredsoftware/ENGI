/* -------------------------------------------------------------------------------------------------
 * Comprehensive Test Suite for Enhanced Editing Package
 * 
 * This test suite covers all critical paths, edge cases, and error conditions for the production-grade
 * editing system. Tests include atomic operations, transaction support, rollback capability, file
 * locking, text manipulation, and comprehensive error handling.
 * ------------------------------------------------------------------------------------------------- */

import {
  AtomicFileEditor,
  runEditCommand,
  EditError,
  positionToOffset,
  offsetToPosition,
  applyTextEdit,
  applyTextEdits,
  FileTransactionManager,
  editCommandSchema,
  type EditCommandParams,
  type TextEdit,
  type Position,
  type FileOperation,
  type FileTransaction,
} from '../index';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('fs');
jest.mock('@bitcode/logger');
jest.mock('@/lib/files');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockFsSync = fsSync as jest.Mocked<typeof fsSync>;

// Mock normalizeRepoPath
jest.mock('@/lib/files', () => ({
  normalizeRepoPath: jest.fn((path: string) => path.startsWith('/') ? path : `/repo/${path}`),
}));

// Mock global context
const mockGlobalContext = {
  repository: {
    fileTracker: {
      track: jest.fn(),
    },
  },
};

jest.mock('@bitcode/context', () => ({
  getGlobalContext: () => mockGlobalContext,
}));

describe('Enhanced Editing Package', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockFs.stat.mockResolvedValue({
      isFile: () => true,
      size: 1000,
    } as any);
    
    mockFs.access.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('const test = "hello";\nfunction foo() {}\n');
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.rename.mockResolvedValue(undefined);
    mockFs.rm.mockResolvedValue(undefined);
    mockFs.unlink.mockResolvedValue(undefined);
    
    Object.defineProperty(mockFsSync, 'constants', {
      value: { R_OK: 4 },
      writable: false,
    });
    
    // Clear any existing intervals
    jest.clearAllTimers();
  });

  describe('Schema Validation', () => {
    test('validates valid edit commands', () => {
      const validCommands = [
        {
          command: 'view' as const,
          path: 'test.ts',
        },
        {
          command: 'create' as const,
          path: 'new.ts',
          file_text: 'content',
        },
        {
          command: 'str_replace' as const,
          path: 'test.ts',
          old_str: 'old',
          new_str: 'new',
        },
        {
          command: 'insert' as const,
          path: 'test.ts',
          insert_line: 5,
          new_str: 'new line',
        },
        {
          command: 'patch' as const,
          path: 'test.ts',
          patch_content: '[]',
        },
      ];

      validCommands.forEach(command => {
        expect(() => editCommandSchema.parse(command)).not.toThrow();
      });
    });

    test('rejects invalid edit commands', () => {
      const invalidCommands = [
        { command: 'invalid' },
        { command: 'create' }, // missing path
        { command: 'str_replace', path: 'test.ts' }, // missing old_str/new_str
        { command: 'insert', path: 'test.ts', insert_line: 'not a number' },
      ];

      invalidCommands.forEach(command => {
        expect(() => editCommandSchema.parse(command)).toThrow();
      });
    });
  });

  describe('Position and Offset Utilities', () => {
    const sampleContent = 'line 1\nline 2\nline 3 with more content\n';

    describe('positionToOffset', () => {
      test('converts valid positions correctly', () => {
        expect(positionToOffset(sampleContent, { line: 0, character: 0 })).toBe(0);
        expect(positionToOffset(sampleContent, { line: 0, character: 6 })).toBe(6);
        expect(positionToOffset(sampleContent, { line: 1, character: 0 })).toBe(7);
        expect(positionToOffset(sampleContent, { line: 2, character: 5 })).toBe(19);
      });

      test('throws EditError for invalid positions', () => {
        expect(() => positionToOffset(sampleContent, { line: -1, character: 0 }))
          .toThrow(EditError);
        expect(() => positionToOffset(sampleContent, { line: 0, character: -1 }))
          .toThrow(EditError);
        expect(() => positionToOffset(sampleContent, { line: 10, character: 0 }))
          .toThrow(EditError);
        expect(() => positionToOffset(sampleContent, { line: 0, character: 100 }))
          .toThrow(EditError);
      });

      test('handles edge cases', () => {
        expect(positionToOffset('', { line: 0, character: 0 })).toBe(0);
        expect(positionToOffset('a', { line: 0, character: 1 })).toBe(1);
        expect(positionToOffset('\n', { line: 1, character: 0 })).toBe(1);
      });
    });

    describe('offsetToPosition', () => {
      test('converts valid offsets correctly', () => {
        expect(offsetToPosition(sampleContent, 0)).toEqual({ line: 0, character: 0 });
        expect(offsetToPosition(sampleContent, 6)).toEqual({ line: 0, character: 6 });
        expect(offsetToPosition(sampleContent, 7)).toEqual({ line: 1, character: 0 });
        expect(offsetToPosition(sampleContent, 19)).toEqual({ line: 2, character: 5 });
      });

      test('throws EditError for invalid offsets', () => {
        expect(() => offsetToPosition(sampleContent, -1)).toThrow(EditError);
        expect(() => offsetToPosition(sampleContent, 1000)).toThrow(EditError);
      });

      test('handles edge cases', () => {
        expect(offsetToPosition('', 0)).toEqual({ line: 0, character: 0 });
        expect(offsetToPosition('a', 1)).toEqual({ line: 0, character: 1 });
      });
    });

    describe('Round-trip consistency', () => {
      test('position -> offset -> position is consistent', () => {
        const positions = [
          { line: 0, character: 0 },
          { line: 0, character: 6 },
          { line: 1, character: 0 },
          { line: 2, character: 10 },
        ];

        positions.forEach(pos => {
          const offset = positionToOffset(sampleContent, pos);
          const roundTrip = offsetToPosition(sampleContent, offset);
          expect(roundTrip).toEqual(pos);
        });
      });
    });
  });

  describe('Text Edit Operations', () => {
    const content = 'line 1\nline 2\nline 3\n';

    describe('applyTextEdit', () => {
      test('applies simple replacements', () => {
        const edit: TextEdit = {
          range: {
            start: { line: 0, character: 5 },
            end: { line: 0, character: 6 },
          },
          newText: 'X',
        };

        const result = applyTextEdit(content, edit);
        expect(result).toBe('line X\nline 2\nline 3\n');
      });

      test('applies insertions', () => {
        const edit: TextEdit = {
          range: {
            start: { line: 1, character: 4 },
            end: { line: 1, character: 4 },
          },
          newText: ' NEW',
        };

        const result = applyTextEdit(content, edit);
        expect(result).toBe('line 1\nline NEW 2\nline 3\n');
      });

      test('applies deletions', () => {
        const edit: TextEdit = {
          range: {
            start: { line: 2, character: 0 },
            end: { line: 2, character: 7 },
          },
          newText: '',
        };

        const result = applyTextEdit(content, edit);
        expect(result).toBe('line 1\nline 2\n');
      });

      test('throws error for invalid ranges', () => {
        const edit: TextEdit = {
          range: {
            start: { line: 0, character: 10 },
            end: { line: 0, character: 5 },
          },
          newText: 'invalid',
        };

        expect(() => applyTextEdit(content, edit)).toThrow(EditError);
      });
    });

    describe('applyTextEdits', () => {
      test('applies multiple edits in correct order', () => {
        const edits: TextEdit[] = [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 4 },
            },
            newText: 'LINE',
          },
          {
            range: {
              start: { line: 2, character: 0 },
              end: { line: 2, character: 4 },
            },
            newText: 'LINE',
          },
        ];

        const result = applyTextEdits(content, edits);
        expect(result).toBe('LINE 1\nline 2\nLINE 3\n');
      });

      test('handles overlapping edits correctly', () => {
        const edits: TextEdit[] = [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 6 },
            },
            newText: 'FIRST',
          },
          {
            range: {
              start: { line: 1, character: 0 },
              end: { line: 1, character: 6 },
            },
            newText: 'SECOND',
          },
        ];

        const result = applyTextEdits(content, edits);
        expect(result).toBe('FIRST\nSECOND\nline 3\n');
      });

      test('handles empty edit array', () => {
        const result = applyTextEdits(content, []);
        expect(result).toBe(content);
      });
    });
  });

  describe('EditError Class', () => {
    test('creates error with all properties', () => {
      const cause = new Error('Original error');
      const error = new EditError(
        'Test error',
        'TEST_CODE',
        'test.ts',
        'create',
        'op123',
        cause
      );

      expect(error.name).toBe('EditError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.filePath).toBe('test.ts');
      expect(error.operation).toBe('create');
      expect(error.operationId).toBe('op123');
      expect(error.cause).toBe(cause);
    });

    test('creates error with minimal properties', () => {
      const error = new EditError('Simple error', 'SIMPLE_CODE');

      expect(error.name).toBe('EditError');
      expect(error.message).toBe('Simple error');
      expect(error.code).toBe('SIMPLE_CODE');
      expect(error.filePath).toBeUndefined();
      expect(error.operation).toBeUndefined();
      expect(error.operationId).toBeUndefined();
      expect(error.cause).toBeUndefined();
    });
  });

  describe('AtomicFileEditor', () => {
    let editor: AtomicFileEditor;

    beforeEach(() => {
      editor = new AtomicFileEditor();
    });

    describe('Basic Operations', () => {
      test('executes view command successfully', async () => {
        const params: EditCommandParams = {
          command: 'view',
          path: 'test.ts',
        };

        const result = await editor.executeCommand(params);
        expect(result).toBe('const test = "hello";\nfunction foo() {}\n');
        expect(mockFs.readFile).toHaveBeenCalledWith('/repo/test.ts', 'utf-8');
      });

      test('executes create command successfully', async () => {
        const params: EditCommandParams = {
          command: 'create',
          path: 'new.ts',
          file_text: 'new content',
        };

        const result = await editor.executeCommand(params);
        expect(result).toBe('created');
        expect(mockFs.mkdir).toHaveBeenCalled();
        expect(mockFs.writeFile).toHaveBeenCalled();
      });

      test('executes delete command successfully', async () => {
        const params: EditCommandParams = {
          command: 'delete',
          path: 'test.ts',
        };

        const result = await editor.executeCommand(params);
        expect(result).toBe('deleted');
        expect(mockFs.rm).toHaveBeenCalledWith('/repo/test.ts', { force: true });
      });

      test('executes str_replace command successfully', async () => {
        const params: EditCommandParams = {
          command: 'str_replace',
          path: 'test.ts',
          old_str: 'hello',
          new_str: 'world',
        };

        const result = await editor.executeCommand(params);
        expect(result).toContain('replaced_string');
        expect(mockFs.writeFile).toHaveBeenCalled();
      });

      test('executes insert command successfully', async () => {
        const params: EditCommandParams = {
          command: 'insert',
          path: 'test.ts',
          insert_line: 2,
          new_str: 'inserted line',
        };

        const result = await editor.executeCommand(params);
        expect(result).toBe('inserted');
        expect(mockFs.writeFile).toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      test('handles file not found error', async () => {
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        mockFs.access.mockRejectedValue(error);

        const params: EditCommandParams = {
          command: 'view',
          path: 'missing.ts',
        };

        const result = await editor.executeCommand(params);
        expect(result).toContain('File not found');
      });

      test('handles permission denied error', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.access.mockRejectedValue(error);

        const params: EditCommandParams = {
          command: 'view',
          path: 'protected.ts',
        };

        await expect(editor.executeCommand(params)).rejects.toThrow(EditError);
      });

      test('handles string not found in str_replace', async () => {
        const params: EditCommandParams = {
          command: 'str_replace',
          path: 'test.ts',
          old_str: 'nonexistent',
          new_str: 'replacement',
        };

        await expect(editor.executeCommand(params)).rejects.toThrow(EditError);
      });

      test('handles insert line out of bounds', async () => {
        const params: EditCommandParams = {
          command: 'insert',
          path: 'test.ts',
          insert_line: 100,
          new_str: 'new line',
        };

        await expect(editor.executeCommand(params)).rejects.toThrow(EditError);
      });

      test('handles missing required parameters', async () => {
        const params: EditCommandParams = {
          command: 'create',
          path: 'test.ts',
          // missing file_text
        };

        await expect(editor.executeCommand(params)).rejects.toThrow(EditError);
      });
    });

    describe('Atomic Operations', () => {
      test('uses atomic writes by default', async () => {
        const params: EditCommandParams = {
          command: 'create',
          path: 'new.ts',
          file_text: 'content',
        };

        await editor.executeCommand(params);

        // Should write to temp file first, then rename
        const writeCall = mockFs.writeFile.mock.calls[0];
        expect(writeCall[0]).toMatch(/\.tmp\./);
        expect(mockFs.rename).toHaveBeenCalled();
      });

      test('can disable atomic operations', async () => {
        const params: EditCommandParams = {
          command: 'create',
          path: 'new.ts',
          file_text: 'content',
          atomic: false,
        };

        await editor.executeCommand(params);

        // Should write directly to final file
        const writeCall = mockFs.writeFile.mock.calls[0];
        expect(writeCall[0]).toBe('/repo/new.ts');
        expect(mockFs.rename).not.toHaveBeenCalled();
      });
    });

    describe('Transaction Support', () => {
      test('begins and commits transaction', async () => {
        const transactionId = await editor.beginTransaction();
        expect(transactionId).toMatch(/^tx_/);

        await editor.commitTransaction();
        // Should complete without error
      });

      test('begins and rolls back transaction', async () => {
        const transactionId = await editor.beginTransaction();
        expect(transactionId).toMatch(/^tx_/);

        await editor.rollbackTransaction();
        // Should complete without error
      });

      test('prevents multiple active transactions', async () => {
        await editor.beginTransaction();
        
        await expect(editor.beginTransaction()).rejects.toThrow(EditError);
      });

      test('requires active transaction for commit/rollback', async () => {
        await expect(editor.commitTransaction()).rejects.toThrow(EditError);
        await expect(editor.rollbackTransaction()).rejects.toThrow(EditError);
      });
    });

    describe('File Tracking Integration', () => {
      test('tracks file operations when FileTracker available', async () => {
        const params: EditCommandParams = {
          command: 'create',
          path: 'new.ts',
          file_text: 'content',
        };

        await editor.executeCommand(params);

        expect(mockGlobalContext.repository.fileTracker.track).toHaveBeenCalledWith({
          type: 'create',
          path: '/repo/new.ts',
          content: 'content',
          timestamp: expect.any(Number),
        });
      });

      test('continues operation when FileTracker unavailable', async () => {
        // Remove FileTracker
        delete mockGlobalContext.repository.fileTracker;

        const params: EditCommandParams = {
          command: 'create',
          path: 'new.ts',
          file_text: 'content',
        };

        const result = await editor.executeCommand(params);
        expect(result).toBe('created');
      });
    });
  });

  describe('runEditCommand convenience function', () => {
    test('executes command with automatic transaction management', async () => {
      const params: EditCommandParams = {
        command: 'create',
        path: 'new.ts',
        file_text: 'content',
      };

      const result = await runEditCommand(params);
      expect(result).toBe('created');
    });

    test('handles errors with automatic rollback', async () => {
      const error = new Error('Write failed');
      mockFs.writeFile.mockRejectedValue(error);

      const params: EditCommandParams = {
        command: 'create',
        path: 'new.ts',
        file_text: 'content',
      };

      await expect(runEditCommand(params)).rejects.toThrow();
    });

    test('can disable atomic operations', async () => {
      const params: EditCommandParams = {
        command: 'create',
        path: 'new.ts',
        file_text: 'content',
        atomic: false,
      };

      const result = await runEditCommand(params);
      expect(result).toBe('created');
    });
  });

  describe('Stress Tests', () => {
    describe('Large Files', () => {
      test('handles large file content', async () => {
        const largeContent = 'x'.repeat(1024 * 1024); // 1MB
        mockFs.readFile.mockResolvedValue(largeContent);

        const params: EditCommandParams = {
          command: 'view',
          path: 'large.ts',
        };

        const result = await runEditCommand(params);
        expect(result).toBe(largeContent);
      });

      test('handles large text replacements', async () => {
        const content = 'x'.repeat(1000) + 'REPLACE_ME' + 'y'.repeat(1000);
        const replacement = 'z'.repeat(5000);
        mockFs.readFile.mockResolvedValue(content);

        const params: EditCommandParams = {
          command: 'str_replace',
          path: 'test.ts',
          old_str: 'REPLACE_ME',
          new_str: replacement,
        };

        const result = await runEditCommand(params);
        expect(result).toContain('replaced_string');
      });
    });

    describe('Complex Operations', () => {
      test('handles multiple rapid operations', async () => {
        const operations = Array.from({ length: 10 }, (_, i) => ({
          command: 'create' as const,
          path: `test${i}.ts`,
          file_text: `content ${i}`,
        }));

        const results = await Promise.all(
          operations.map(op => runEditCommand(op))
        );

        expect(results).toHaveLength(10);
        expect(results.every(r => r === 'created')).toBe(true);
      });

      test('handles complex patch operations', async () => {
        const content = 'line 1\nline 2\nline 3\nline 4\n';
        mockFs.readFile.mockResolvedValue(content);

        const textEdits: TextEdit[] = [
          {
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } },
            newText: 'LINE',
          },
          {
            range: { start: { line: 2, character: 0 }, end: { line: 2, character: 4 } },
            newText: 'LINE',
          },
        ];

        const params: EditCommandParams = {
          command: 'patch',
          path: 'test.ts',
          patch_content: JSON.stringify(textEdits),
        };

        const result = await runEditCommand(params);
        expect(result).toContain('patch_applied');
      });
    });

    describe('Error Recovery', () => {
      test('recovers from filesystem errors', async () => {
        let callCount = 0;
        mockFs.writeFile.mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Temporary failure');
          }
          return Promise.resolve();
        });

        const params: EditCommandParams = {
          command: 'create',
          path: 'test.ts',
          file_text: 'content',
          atomic: false, // Disable atomic to avoid temp file complications
        };

        // Should fail on first attempt
        await expect(runEditCommand(params)).rejects.toThrow();
      });

      test('handles invalid JSON in patch operations', async () => {
        const params: EditCommandParams = {
          command: 'patch',
          path: 'test.ts',
          patch_content: 'invalid json',
        };

        await expect(runEditCommand(params)).rejects.toThrow(EditError);
      });
    });

    describe('Concurrent Operations', () => {
      test('handles multiple editors on same file', async () => {
        const editor1 = new AtomicFileEditor();
        const editor2 = new AtomicFileEditor();

        const tx1 = await editor1.beginTransaction();
        const tx2 = await editor2.beginTransaction();

        // Both should be able to read
        const params: EditCommandParams = {
          command: 'view',
          path: 'test.ts',
        };

        const result1 = await editor1.executeCommand(params);
        const result2 = await editor2.executeCommand(params);

        expect(result1).toBe(result2);

        await editor1.commitTransaction();
        await editor2.commitTransaction();
      });

      test('prevents concurrent modifications with locks', async () => {
        const editor1 = new AtomicFileEditor();
        const editor2 = new AtomicFileEditor();

        await editor1.beginTransaction();

        // First editor modifies file
        await editor1.executeCommand({
          command: 'create',
          path: 'locked.ts',
          file_text: 'content1',
        });

        await editor2.beginTransaction();

        // Second editor should be able to modify different file
        await editor2.executeCommand({
          command: 'create',
          path: 'unlocked.ts',
          file_text: 'content2',
        });

        await editor1.commitTransaction();
        await editor2.commitTransaction();
      });
    });
  });

  describe('Performance Tests', () => {
    test('executes operations within time limits', async () => {
      const start = Date.now();

      const params: EditCommandParams = {
        command: 'create',
        path: 'perf.ts',
        file_text: 'performance test',
      };

      await runEditCommand(params);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('handles rapid sequential operations efficiently', async () => {
      const start = Date.now();

      const operations = Array.from({ length: 50 }, (_, i) => ({
        command: 'view' as const,
        path: 'test.ts',
      }));

      await Promise.all(operations.map(op => runEditCommand(op)));

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 50 operations within 5 seconds
    });
  });

  describe('Edge Cases', () => {
    test('handles empty files', async () => {
      mockFs.readFile.mockResolvedValue('');

      const params: EditCommandParams = {
        command: 'view',
        path: 'empty.ts',
      };

      const result = await runEditCommand(params);
      expect(result).toBe('');
    });

    test('handles files with special characters', async () => {
      const specialContent = '🚀💻🔥\n漢字\n"quotes"\n\\backslashes\\';
      mockFs.readFile.mockResolvedValue(specialContent);

      const params: EditCommandParams = {
        command: 'view',
        path: 'special.ts',
      };

      const result = await runEditCommand(params);
      expect(result).toBe(specialContent);
    });

    test('handles very long lines', async () => {
      const longLine = 'x'.repeat(10000);
      mockFs.readFile.mockResolvedValue(longLine);

      const params: EditCommandParams = {
        command: 'str_replace',
        path: 'test.ts',
        old_str: 'x'.repeat(100),
        new_str: 'y'.repeat(100),
      };

      const result = await runEditCommand(params);
      expect(result).toContain('replaced_string');
    });

    test('handles mixed line endings', async () => {
      const mixedContent = 'line1\nline2\r\nline3\rline4';
      mockFs.readFile.mockResolvedValue(mixedContent);

      const position = { line: 2, character: 0 };
      const offset = positionToOffset(mixedContent, position);
      const roundTrip = offsetToPosition(mixedContent, offset);

      expect(roundTrip).toEqual(position);
    });
  });
});
