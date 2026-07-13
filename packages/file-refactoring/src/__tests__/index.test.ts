/* -------------------------------------------------------------------------------------------------
 * Comprehensive Test Suite for Enhanced Refactoring Package
 * 
 * This test suite covers all critical paths, edge cases, and error conditions for the production-grade
 * refactoring system. Tests include atomic symbol renaming, multi-file transactions, backup creation,
 * rollback capability, and comprehensive error handling.
 * ------------------------------------------------------------------------------------------------- */

import {
  renameSymbol,
  RefactoringError,
  type RenameSymbolParams,
  type RenameSymbolResult,
} from '../index';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { LspClient, LspError } from '@bitcode/lsp';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('fs');
jest.mock('@bitcode/lsp');
jest.mock('@bitcode/logger');
jest.mock('@/lib/files');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockFsSync = fsSync as jest.Mocked<typeof fsSync>;
const MockLspClient = LspClient as jest.MockedClass<typeof LspClient>;

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

describe('Enhanced Refactoring Package', () => {
  let mockLspClient: jest.Mocked<LspClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup LspClient mock
    mockLspClient = new MockLspClient() as jest.Mocked<LspClient>;
    MockLspClient.mockImplementation(() => mockLspClient);
    
    // Setup default fs mocks
    mockFs.stat.mockResolvedValue({
      isFile: () => true,
      size: 1000,
    } as any);
    
    mockFs.access.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('export function oldName() { return "test"; }');
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.copyFile.mockResolvedValue(undefined);
    mockFs.rm.mockResolvedValue(undefined);
    
    Object.defineProperty(mockFsSync, 'constants', {
      value: { R_OK: 4 },
      writable: false,
    });
    
    // Setup LSP client mocks
    mockLspClient.connect.mockResolvedValue(undefined);
    mockLspClient.disconnect.mockResolvedValue(undefined);
    mockLspClient.isConnected.mockReturnValue(true);
    mockLspClient.prepareRename.mockResolvedValue({
      range: {
        start: { line: 0, character: 16 },
        end: { line: 0, character: 23 },
      },
      placeholder: 'oldName',
    });
    mockLspClient.rename.mockResolvedValue({
      changes: {
        '/repo/test.ts': [
          {
            range: {
              start: { line: 0, character: 16 },
              end: { line: 0, character: 23 },
            },
            newText: 'newName',
          },
        ],
      },
    });
  });

  describe('RefactoringError Class', () => {
    test('creates error with all properties', () => {
      const cause = new Error('Original error');
      const error = new RefactoringError(
        'Test error',
        'TEST_CODE',
        'test.ts',
        'rename_symbol',
        'op123',
        cause
      );

      expect(error.name).toBe('RefactoringError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.filePath).toBe('test.ts');
      expect(error.operation).toBe('rename_symbol');
      expect(error.operationId).toBe('op123');
      expect(error.cause).toBe(cause);
    });

    test('creates error with minimal properties', () => {
      const error = new RefactoringError('Simple error', 'SIMPLE_CODE');

      expect(error.name).toBe('RefactoringError');
      expect(error.message).toBe('Simple error');
      expect(error.code).toBe('SIMPLE_CODE');
      expect(error.filePath).toBeUndefined();
      expect(error.operation).toBeUndefined();
      expect(error.operationId).toBeUndefined();
      expect(error.cause).toBeUndefined();
    });
  });

  describe('renameSymbol Function', () => {
    const validParams: RenameSymbolParams = {
      filePath: 'test.ts',
      line: 0,
      character: 16,
      newName: 'newName',
    };

    describe('Basic Operations', () => {
      test('successfully renames symbol', async () => {
        const result = await renameSymbol(validParams);

        expect(result.success).toBe(true);
        expect(result.filesChanged).toBe(1);
        expect(result.totalEdits).toBe(1);
        expect(result.backupPath).toBeDefined();
        expect(mockLspClient.connect).toHaveBeenCalled();
        expect(mockLspClient.prepareRename).toHaveBeenCalledWith(
          '/repo/test.ts',
          { line: 0, character: 16 }
        );
        expect(mockLspClient.rename).toHaveBeenCalledWith(
          '/repo/test.ts',
          { line: 0, character: 16 },
          'newName'
        );
      });

      test('creates backup before renaming', async () => {
        const result = await renameSymbol(validParams);

        expect(result.success).toBe(true);
        expect(result.backupPath).toMatch(/backup_\d+/);
        expect(mockFs.mkdir).toHaveBeenCalled();
        expect(mockFs.copyFile).toHaveBeenCalled();
      });

      test('tracks file operations', async () => {
        await renameSymbol(validParams);

        expect(mockGlobalContext.repository.fileTracker.track).toHaveBeenCalledWith({
          type: 'rename_symbol',
          path: '/repo/test.ts',
          newName: 'newName',
          timestamp: expect.any(Number),
        });
      });

      test('can disable backup creation', async () => {
        const result = await renameSymbol({
          ...validParams,
          createBackup: false,
        });

        expect(result.success).toBe(true);
        expect(result.backupPath).toBeUndefined();
        expect(mockFs.mkdir).not.toHaveBeenCalled();
        expect(mockFs.copyFile).not.toHaveBeenCalled();
      });
    });

    describe('Input Validation', () => {
      test('validates file path format', async () => {
        await expect(renameSymbol({
          ...validParams,
          filePath: '',
        })).rejects.toThrow(RefactoringError);
      });

      test('validates position boundaries', async () => {
        await expect(renameSymbol({
          ...validParams,
          line: -1,
        })).rejects.toThrow(RefactoringError);

        await expect(renameSymbol({
          ...validParams,
          character: -1,
        })).rejects.toThrow(RefactoringError);
      });

      test('validates new name format', async () => {
        const invalidNames = ['123invalid', 'invalid-name', 'invalid name', ''];
        
        for (const invalidName of invalidNames) {
          await expect(renameSymbol({
            ...validParams,
            newName: invalidName,
          })).rejects.toThrow(RefactoringError);
        }
      });

      test('accepts valid identifier names', async () => {
        const validNames = ['validName', 'valid_name', '$validName', '_validName', 'validName123'];
        
        for (const validName of validNames) {
          mockLspClient.rename.mockResolvedValue({
            changes: {
              '/repo/test.ts': [{
                range: {
                  start: { line: 0, character: 16 },
                  end: { line: 0, character: 23 },
                },
                newText: validName,
              }],
            },
          });

          const result = await renameSymbol({
            ...validParams,
            newName: validName,
          });

          expect(result.success).toBe(true);
        }
      });
    });

    describe('File System Operations', () => {
      test('handles file not found error', async () => {
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        mockFs.access.mockRejectedValue(error);

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles permission denied error', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.access.mockRejectedValue(error);

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles backup creation failure', async () => {
        mockFs.mkdir.mockRejectedValue(new Error('Backup creation failed'));

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles file write failure with rollback', async () => {
        mockFs.writeFile.mockRejectedValue(new Error('Write failed'));

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
        
        // Should attempt cleanup
        expect(mockFs.rm).toHaveBeenCalled();
      });
    });

    describe('LSP Integration', () => {
      test('handles LSP connection failure', async () => {
        mockLspClient.connect.mockRejectedValue(new LspError('Connection failed', 'CONNECTION_ERROR'));

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles LSP not connected error', async () => {
        mockLspClient.isConnected.mockReturnValue(false);

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles prepare rename failure', async () => {
        mockLspClient.prepareRename.mockRejectedValue(new LspError('Cannot rename', 'PREPARE_FAILED'));

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles rename operation failure', async () => {
        mockLspClient.rename.mockRejectedValue(new LspError('Rename failed', 'RENAME_FAILED'));

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
      });

      test('handles no changes returned from LSP', async () => {
        mockLspClient.rename.mockResolvedValue({ changes: {} });

        const result = await renameSymbol(validParams);
        expect(result.success).toBe(true);
        expect(result.filesChanged).toBe(0);
        expect(result.totalEdits).toBe(0);
      });

      test('ensures LSP disconnection after operation', async () => {
        await renameSymbol(validParams);
        expect(mockLspClient.disconnect).toHaveBeenCalled();
      });

      test('ensures LSP disconnection even on failure', async () => {
        mockLspClient.rename.mockRejectedValue(new LspError('Rename failed', 'RENAME_FAILED'));

        await expect(renameSymbol(validParams)).rejects.toThrow();
        expect(mockLspClient.disconnect).toHaveBeenCalled();
      });
    });

    describe('Multi-file Operations', () => {
      test('handles multiple file changes', async () => {
        mockLspClient.rename.mockResolvedValue({
          changes: {
            '/repo/test1.ts': [
              {
                range: { start: { line: 0, character: 16 }, end: { line: 0, character: 23 } },
                newText: 'newName',
              },
            ],
            '/repo/test2.ts': [
              {
                range: { start: { line: 5, character: 10 }, end: { line: 5, character: 17 } },
                newText: 'newName',
              },
              {
                range: { start: { line: 10, character: 5 }, end: { line: 10, character: 12 } },
                newText: 'newName',
              },
            ],
          },
        });

        // Mock file content for multiple files
        mockFs.readFile
          .mockResolvedValueOnce('export function oldName() { return "test1"; }')
          .mockResolvedValueOnce('function test() { return oldName(); } function another() { oldName(); }');

        const result = await renameSymbol(validParams);

        expect(result.success).toBe(true);
        expect(result.filesChanged).toBe(2);
        expect(result.totalEdits).toBe(3);
        expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
      });

      test('creates backup for all affected files', async () => {
        mockLspClient.rename.mockResolvedValue({
          changes: {
            '/repo/file1.ts': [{ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } }, newText: 'newName' }],
            '/repo/file2.ts': [{ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } }, newText: 'newName' }],
          },
        });

        const result = await renameSymbol(validParams);

        expect(result.success).toBe(true);
        expect(mockFs.copyFile).toHaveBeenCalledTimes(2);
      });

      test('handles partial failure in multi-file operation', async () => {
        mockLspClient.rename.mockResolvedValue({
          changes: {
            '/repo/file1.ts': [{ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } }, newText: 'newName' }],
            '/repo/file2.ts': [{ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } }, newText: 'newName' }],
          },
        });

        // First file succeeds, second fails
        mockFs.writeFile
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('Write failed'));

        await expect(renameSymbol(validParams)).rejects.toThrow(RefactoringError);
        
        // Should attempt cleanup
        expect(mockFs.rm).toHaveBeenCalled();
      });
    });

    describe('Atomic Operations', () => {
      test('uses atomic writes with temp files', async () => {
        const result = await renameSymbol(validParams);

        expect(result.success).toBe(true);
        
        // Should write to temp file first
        const writeCall = mockFs.writeFile.mock.calls[0];
        expect(writeCall[0]).toMatch(/\.tmp\./);
      });

      test('can disable atomic operations', async () => {
        const result = await renameSymbol({
          ...validParams,
          atomic: false,
        });

        expect(result.success).toBe(true);
        
        // Should write directly to final file
        const writeCall = mockFs.writeFile.mock.calls[0];
        expect(writeCall[0]).toBe('/repo/test.ts');
      });
    });

    describe('Error Recovery', () => {
      test('cleans up temp files on failure', async () => {
        mockFs.writeFile.mockRejectedValue(new Error('Write failed'));

        await expect(renameSymbol(validParams)).rejects.toThrow();
        
        // Should clean up temp files
        expect(mockFs.rm).toHaveBeenCalled();
      });

      test('provides detailed error context', async () => {
        mockLspClient.rename.mockRejectedValue(new LspError('Rename failed', 'RENAME_FAILED'));

        try {
          await renameSymbol(validParams);
          fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(RefactoringError);
          const refError = error as RefactoringError;
          expect(refError.code).toBe('LSP_OPERATION_FAILED');
          expect(refError.filePath).toBe('/repo/test.ts');
          expect(refError.operation).toBe('rename_symbol');
        }
      });
    });

    describe('Performance Tests', () => {
      test('completes operation within time limit', async () => {
        const start = Date.now();
        
        await renameSymbol(validParams);
        
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      });

      test('handles large number of edits efficiently', async () => {
        // Mock many edits across multiple files
        const manyChanges: any = {};
        for (let i = 0; i < 50; i++) {
          manyChanges[`/repo/file${i}.ts`] = [
            {
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } },
              newText: 'newName',
            },
          ];
        }

        mockLspClient.rename.mockResolvedValue({ changes: manyChanges });

        const start = Date.now();
        const result = await renameSymbol(validParams);
        const duration = Date.now() - start;

        expect(result.success).toBe(true);
        expect(result.filesChanged).toBe(50);
        expect(duration).toBeLessThan(10000); // Should handle 50 files within 10 seconds
      });
    });

    describe('Edge Cases', () => {
      test('handles empty file content', async () => {
        mockFs.readFile.mockResolvedValue('');
        mockLspClient.rename.mockResolvedValue({
          changes: {
            '/repo/test.ts': [{
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
              newText: 'newName',
            }],
          },
        });

        const result = await renameSymbol(validParams);
        expect(result.success).toBe(true);
      });

      test('handles special characters in file paths', async () => {
        const specialPath = 'special-file with spaces & symbols.ts';
        const result = await renameSymbol({
          ...validParams,
          filePath: specialPath,
        });

        expect(result.success).toBe(true);
        expect(mockLspClient.prepareRename).toHaveBeenCalledWith(
          `/repo/${specialPath}`,
          { line: 0, character: 16 }
        );
      });

      test('handles very long file paths', async () => {
        const longPath = 'a'.repeat(200) + '.ts';
        const result = await renameSymbol({
          ...validParams,
          filePath: longPath,
        });

        expect(result.success).toBe(true);
      });

      test('handles Unicode characters in content', async () => {
        const unicodeContent = 'export function 测试函数() { return "🚀"; }';
        mockFs.readFile.mockResolvedValue(unicodeContent);

        const result = await renameSymbol(validParams);
        expect(result.success).toBe(true);
      });
    });

    describe('Stress Tests', () => {
      test('handles rapid sequential operations', async () => {
        const operations = Array.from({ length: 10 }, (_, i) => 
          renameSymbol({
            ...validParams,
            filePath: `test${i}.ts`,
            newName: `newName${i}`,
          })
        );

        const results = await Promise.all(operations);
        expect(results).toHaveLength(10);
        expect(results.every(r => r.success)).toBe(true);
      });

      test('handles concurrent operations on different files', async () => {
        const operations = Array.from({ length: 5 }, (_, i) => 
          renameSymbol({
            ...validParams,
            filePath: `concurrent${i}.ts`,
            newName: `concurrentName${i}`,
          })
        );

        const results = await Promise.all(operations);
        expect(results).toHaveLength(5);
        expect(results.every(r => r.success)).toBe(true);
      });
    });
  });

  describe('Integration with File Tracking', () => {
    test('continues operation when FileTracker unavailable', async () => {
      // Remove FileTracker
      delete mockGlobalContext.repository.fileTracker;

      const result = await renameSymbol(validParams);
      expect(result.success).toBe(true);
    });

    test('handles FileTracker errors gracefully', async () => {
      mockGlobalContext.repository.fileTracker.track.mockRejectedValue(new Error('Tracking failed'));

      const result = await renameSymbol(validParams);
      expect(result.success).toBe(true);
    });
  });
});
