/* -------------------------------------------------------------------------------------------------
 * Comprehensive Test Suite for Enhanced Generic Tools Files Maintaining Package
 * 
 * This test suite covers all tool wrappers with transaction support, structured error responses,
 * and comprehensive error handling. Tests ensure proper integration with the enhanced editing system.
 * ------------------------------------------------------------------------------------------------- */

import {
  textEditorTool,
  deleteFileTool,
  createFileTool,
  replaceFileTool,
  beginTransactionTool,
  commitTransactionTool,
  rollbackTransactionTool,
} from '../index';
import { TransactionalFileEditor, EditError } from '@bitcode/file-editing';

// Mock dependencies
jest.mock('@bitcode/file-editing');
jest.mock('@bitcode/logger');

const MockTransactionalFileEditor = TransactionalFileEditor as jest.MockedClass<typeof TransactionalFileEditor>;

describe('Enhanced Generic Tools Files Maintaining Package', () => {
  let mockEditor: jest.Mocked<TransactionalFileEditor>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup AtomicFileEditor mock
    mockEditor = new MockAtomicFileEditor() as jest.Mocked<AtomicFileEditor>;
    MockAtomicFileEditor.mockImplementation(() => mockEditor);
    
    // Default successful responses
    mockEditor.executeCommand.mockResolvedValue('success');
    mockEditor.beginTransaction.mockResolvedValue('tx_123');
    mockEditor.commitTransaction.mockResolvedValue(undefined);
    mockEditor.rollbackTransaction.mockResolvedValue(undefined);
  });

  describe('textEditorTool', () => {
    const validParams = {
      command: 'create' as const,
      path: 'test.ts',
      file_text: 'test content',
    };

    test('executes successful operations', async () => {
      const result = await textEditorTool.execute(validParams);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.error).toBeUndefined();
      expect(mockEditor.executeCommand).toHaveBeenCalledWith(validParams);
    });

    test('handles EditError with structured response', async () => {
      const editError = new EditError('File not found', 'FILE_NOT_FOUND', 'test.ts', 'create');
      mockEditor.executeCommand.mockRejectedValue(editError);

      const result = await textEditorTool.execute(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
      expect(result.errorCode).toBe('FILE_NOT_FOUND');
      expect(result.errorContext).toEqual({
        filePath: 'test.ts',
        operation: 'create',
      });
    });

    test('handles generic errors', async () => {
      const genericError = new Error('Generic error');
      mockEditor.executeCommand.mockRejectedValue(genericError);

      const result = await textEditorTool.execute(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generic error');
      expect(result.errorCode).toBe('UNKNOWN_ERROR');
    });

    test('validates required parameters', async () => {
      const invalidParams = {
        command: 'create' as const,
        // missing path and file_text
      };

      const result = await textEditorTool.execute(invalidParams as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });

    test('supports all command types', async () => {
      const commands = [
        { command: 'view' as const, path: 'test.ts' },
        { command: 'create' as const, path: 'test.ts', file_text: 'content' },
        { command: 'str_replace' as const, path: 'test.ts', old_str: 'old', new_str: 'new' },
        { command: 'insert' as const, path: 'test.ts', insert_line: 1, new_str: 'line' },
        { command: 'delete' as const, path: 'test.ts' },
        { command: 'patch' as const, path: 'test.ts', patch_content: '[]' },
      ];

      for (const cmd of commands) {
        const result = await textEditorTool.execute(cmd);
        expect(result.success).toBe(true);
      }
    });

    test('preserves atomic and backup options', async () => {
      const paramsWithOptions = {
        ...validParams,
        atomic: false,
        create_backup: false,
      };

      await textEditorTool.execute(paramsWithOptions);

      expect(mockEditor.executeCommand).toHaveBeenCalledWith(paramsWithOptions);
    });
  });

  describe('deleteFileTool', () => {
    test('executes successful deletion', async () => {
      const result = await deleteFileTool.execute({ path: 'test.ts' });

      expect(result.success).toBe(true);
      expect(mockEditor.executeCommand).toHaveBeenCalledWith({
        command: 'delete',
        path: 'test.ts',
      });
    });

    test('handles deletion errors', async () => {
      const editError = new EditError('Permission denied', 'PERMISSION_DENIED', 'test.ts', 'delete');
      mockEditor.executeCommand.mockRejectedValue(editError);

      const result = await deleteFileTool.execute({ path: 'test.ts' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
      expect(result.errorCode).toBe('PERMISSION_DENIED');
    });

    test('validates path parameter', async () => {
      const result = await deleteFileTool.execute({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });

  describe('createFileTool', () => {
    test('executes successful creation', async () => {
      const params = { path: 'new.ts', content: 'new content' };
      const result = await createFileTool.execute(params);

      expect(result.success).toBe(true);
      expect(mockEditor.executeCommand).toHaveBeenCalledWith({
        command: 'create',
        path: 'new.ts',
        file_text: 'new content',
      });
    });

    test('handles creation errors', async () => {
      const editError = new EditError('File already exists', 'FILE_EXISTS', 'new.ts', 'create');
      mockEditor.executeCommand.mockRejectedValue(editError);

      const result = await createFileTool.execute({ path: 'new.ts', content: 'content' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('File already exists');
      expect(result.errorCode).toBe('FILE_EXISTS');
    });

    test('validates required parameters', async () => {
      const result = await createFileTool.execute({ path: 'test.ts' } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });

  describe('replaceFileTool', () => {
    test('executes successful replacement', async () => {
      const params = { path: 'test.ts', content: 'replacement content' };
      const result = await replaceFileTool.execute(params);

      expect(result.success).toBe(true);
      expect(mockEditor.executeCommand).toHaveBeenCalledWith({
        command: 'replace',
        path: 'test.ts',
        file_text: 'replacement content',
      });
    });

    test('handles replacement errors', async () => {
      const editError = new EditError('File not found', 'FILE_NOT_FOUND', 'test.ts', 'replace');
      mockEditor.executeCommand.mockRejectedValue(editError);

      const result = await replaceFileTool.execute({ path: 'test.ts', content: 'content' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
      expect(result.errorCode).toBe('FILE_NOT_FOUND');
    });
  });

  describe('Transaction Management Tools', () => {
    describe('beginTransactionTool', () => {
      test('starts transaction successfully', async () => {
        const result = await beginTransactionTool.execute({
          metadata: {
            description: 'Test transaction',
            operationType: 'multi_file',
          },
        });

        expect(result.success).toBe(true);
        expect(result.transactionId).toBe('tx_123');
        expect(mockEditor.beginTransaction).toHaveBeenCalled();
      });

      test('handles transaction start failure', async () => {
        const editError = new EditError('Transaction limit reached', 'TRANSACTION_LIMIT', undefined, 'begin_transaction');
        mockEditor.beginTransaction.mockRejectedValue(editError);

        const result = await beginTransactionTool.execute({
          metadata: {
            description: 'Test transaction',
            operationType: 'single_file',
          },
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Transaction limit reached');
        expect(result.errorCode).toBe('TRANSACTION_LIMIT');
      });

      test('validates metadata parameter', async () => {
        const result = await beginTransactionTool.execute({} as any);

        expect(result.success).toBe(false);
        expect(result.error).toContain('validation');
      });
    });

    describe('commitTransactionTool', () => {
      test('commits transaction successfully', async () => {
        const result = await commitTransactionTool.execute({
          transactionId: 'tx_123',
        });

        expect(result.success).toBe(true);
        expect(mockEditor.commitTransaction).toHaveBeenCalled();
      });

      test('handles commit failure', async () => {
        const editError = new EditError('No active transaction', 'NO_TRANSACTION', undefined, 'commit_transaction');
        mockEditor.commitTransaction.mockRejectedValue(editError);

        const result = await commitTransactionTool.execute({
          transactionId: 'tx_123',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('No active transaction');
        expect(result.errorCode).toBe('NO_TRANSACTION');
      });

      test('validates transactionId parameter', async () => {
        const result = await commitTransactionTool.execute({} as any);

        expect(result.success).toBe(false);
        expect(result.error).toContain('validation');
      });
    });

    describe('rollbackTransactionTool', () => {
      test('rolls back transaction successfully', async () => {
        const result = await rollbackTransactionTool.execute({
          transactionId: 'tx_123',
        });

        expect(result.success).toBe(true);
        expect(mockEditor.rollbackTransaction).toHaveBeenCalled();
      });

      test('handles rollback failure', async () => {
        const editError = new EditError('Rollback failed', 'ROLLBACK_FAILED', undefined, 'rollback_transaction');
        mockEditor.rollbackTransaction.mockRejectedValue(editError);

        const result = await rollbackTransactionTool.execute({
          transactionId: 'tx_123',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Rollback failed');
        expect(result.errorCode).toBe('ROLLBACK_FAILED');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('handles timeout errors', async () => {
      const timeoutError = new Error('Operation timed out');
      timeoutError.name = 'TimeoutError';
      mockEditor.executeCommand.mockRejectedValue(timeoutError);

      const result = await textEditorTool.execute({
        command: 'create',
        path: 'test.ts',
        file_text: 'content',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation timed out');
      expect(result.errorCode).toBe('TIMEOUT_ERROR');
    });

    test('handles memory errors', async () => {
      const memoryError = new Error('Out of memory');
      memoryError.name = 'RangeError';
      mockEditor.executeCommand.mockRejectedValue(memoryError);

      const result = await textEditorTool.execute({
        command: 'create',
        path: 'test.ts',
        file_text: 'x'.repeat(1000000), // Large content
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Out of memory');
      expect(result.errorCode).toBe('MEMORY_ERROR');
    });

    test('provides detailed error context for debugging', async () => {
      const editError = new EditError(
        'Complex operation failed',
        'COMPLEX_ERROR',
        '/path/to/file.ts',
        'str_replace',
        'op_456'
      );
      mockEditor.executeCommand.mockRejectedValue(editError);

      const result = await textEditorTool.execute({
        command: 'str_replace',
        path: '/path/to/file.ts',
        old_str: 'old',
        new_str: 'new',
      });

      expect(result.success).toBe(false);
      expect(result.errorContext).toEqual({
        filePath: '/path/to/file.ts',
        operation: 'str_replace',
        operationId: 'op_456',
      });
    });
  });

  describe('Performance and Stress Tests', () => {
    test('handles rapid tool calls efficiently', async () => {
      const operations = Array.from({ length: 20 }, (_, i) => 
        textEditorTool.execute({
          command: 'view',
          path: `file${i}.ts`,
        })
      );

      const start = Date.now();
      const results = await Promise.all(operations);
      const duration = Date.now() - start;

      expect(results).toHaveLength(20);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('handles large file content efficiently', async () => {
      const largeContent = 'x'.repeat(100000); // 100KB
      
      const start = Date.now();
      const result = await createFileTool.execute({
        path: 'large.ts',
        content: largeContent,
      });
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(2000); // Should handle large content within 2 seconds
    });

    test('maintains performance under concurrent load', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => [
        textEditorTool.execute({ command: 'view', path: `file${i}.ts` }),
        createFileTool.execute({ path: `new${i}.ts`, content: `content${i}` }),
        deleteFileTool.execute({ path: `old${i}.ts` }),
      ]).flat();

      const start = Date.now();
      const results = await Promise.all(operations);
      const duration = Date.now() - start;

      expect(results).toHaveLength(30);
      expect(duration).toBeLessThan(10000); // 30 concurrent operations within 10 seconds
    });
  });

  describe('Tool Metadata and Documentation', () => {
    test('provides accurate tool descriptions', () => {
      expect(textEditorTool.tool.function.name).toBe('textEditor');
      expect(textEditorTool.tool.function.description).toContain('Enhanced file editing');
      
      expect(beginTransactionTool.tool.function.name).toBe('beginTransaction');
      expect(beginTransactionTool.tool.function.description).toContain('transaction');
      
      expect(commitTransactionTool.tool.function.name).toBe('commitTransaction');
      expect(rollbackTransactionTool.tool.function.name).toBe('rollbackTransaction');
    });

    test('includes proper parameter schemas', () => {
      const textEditorSchema = textEditorTool.tool.function.parameters;
      expect(textEditorSchema.properties.command).toBeDefined();
      expect(textEditorSchema.properties.path).toBeDefined();
      expect(textEditorSchema.required).toContain('command');
      expect(textEditorSchema.required).toContain('path');

      const transactionSchema = beginTransactionTool.tool.function.parameters;
      expect(transactionSchema.properties.metadata).toBeDefined();
      expect(transactionSchema.required).toContain('metadata');
    });
  });

  describe('Integration with External Systems', () => {
    test('handles editor unavailable gracefully', async () => {
      MockAtomicFileEditor.mockImplementation(() => {
        throw new Error('Editor not available');
      });

      const result = await textEditorTool.execute({
        command: 'view',
        path: 'test.ts',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Editor not available');
    });

    test('validates tool input thoroughly', async () => {
      const invalidInputs = [
        null,
        undefined,
        {},
        { command: 'invalid' },
        { command: 'create', path: '' },
        { command: 'str_replace', path: 'test.ts' }, // missing old_str/new_str
      ];

      for (const input of invalidInputs) {
        const result = await textEditorTool.execute(input as any);
        expect(result.success).toBe(false);
        expect(result.error).toContain('validation');
      }
    });
  });
});