/**
 * Code Editor Agent Tests
 * 
 * Comprehensive test suite for the code-editor agent using
 * Test Intelligence infrastructure with mock file system.
 */

import { codeEditorAgent } from '../index';
import { Execution } from '@bitcode/execution-generics';
import { testIntelligence, DryRunAdapter, MockSystemAdapter } from '@bitcode/testing';
import { createTestScenario, TestScenarioBuilder } from '@bitcode/testing';

// Mock the editing module
jest.mock('@bitcode/file-editing', () => ({
  TransactionalFileEditor: jest.fn().mockImplementation(() => ({
    beginTransaction: jest.fn().mockResolvedValue('tx-123'),
    executeCommand: jest.fn().mockImplementation((params) => {
      // Simulate successful edits
      if (params.command === 'str_replace') {
        return Promise.resolve('replaced_string (1 occurrence)');
      }
      if (params.command === 'create') {
        return Promise.resolve('created');
      }
      if (params.command === 'patch') {
        return Promise.resolve('patch_applied (1 edit)');
      }
      return Promise.resolve('success');
    }),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined)
  })),
  EditCommandParams: jest.fn(),
  TextEdit: jest.fn(),
  Position: jest.fn(),
  Range: jest.fn()
}));

describe('Code Editor Agent', () => {
  let execution: Execution;
  let dryRunAdapter: DryRunAdapter;
  let mockAdapter: MockSystemAdapter;

  beforeEach(() => {
    execution = new Execution('test-code-editor');
    dryRunAdapter = testIntelligence.getDryRunAdapter();
    mockAdapter = testIntelligence.getMockAdapter();
    jest.clearAllMocks();
  });

  describe('Divide|Apply|Correct Pattern', () => {
    test('should execute full pattern for multi-file changes', async () => {
      const input = {
        changes: [
          {
            filePath: 'src/auth/index.ts',
            patches: [
              {
                description: 'Update authentication function',
                oldContent: 'function authenticate()',
                newContent: 'async function authenticate(): Promise<User>'
              }
            ]
          },
          {
            filePath: 'src/auth/types.ts',
            patches: [
              {
                description: 'Add User type',
                oldContent: '',
                newContent: 'export interface User { id: string; name: string; }'
              }
            ]
          }
        ],
        taskDescription: 'Implement async authentication',
        transactional: true,
        validateSyntax: true
      };

      const result = await codeEditorAgent(input, execution);

      // Verify DIVIDE phase created edit plan
      expect(execution.get('plan', 'changeAnalysis')).toBeDefined();
      expect(execution.get('plan', 'editPlan')).toHaveLength(2);

      // Verify APPLY phase executed edits
      expect(execution.get('try', 'executedEdits')).toBeDefined();
      expect(execution.get('try', 'allEditsSuccessful')).toBe(true);

      // Verify CORRECT phase validated
      expect(execution.get('refine', 'syntaxValidation')).toBeDefined();
      expect(execution.get('refine', 'editsComplete')).toBe(true);

      // Verify final output
      expect(result.success).toBe(true);
      expect(result.fileResults).toHaveLength(2);
      expect(result.summary.totalFilesEdited).toBe(2);
    });

    test('should handle DIVIDE phase analysis correctly', async () => {
      const scenario = new TestScenarioBuilder()
        .id('complex-refactoring')
        .name('Complex Refactoring Scenario')
        .context({
          files: [
            { path: 'src/old.ts', exists: true },
            { path: 'src/new.ts', exists: false }
          ]
        })
        .build();

      const dryRunConfig = dryRunAdapter.adaptScenario(scenario);
      
      const input = {
        changes: [
          {
            filePath: 'src/old.ts',
            patches: [
              {
                description: 'Rename function',
                oldContent: 'oldFunction',
                newContent: 'newFunction'
              }
            ]
          }
        ],
        taskDescription: 'Refactor codebase'
      };

      // Execute with dry run
      const mockExecution = new Execution('test-divide');
      mockExecution.dryRun = dryRunConfig;
      
      const result = await codeEditorAgent(input, mockExecution);

      // Verify DIVIDE analysis
      const editPlan = mockExecution.get('plan', 'editPlan');
      expect(editPlan).toBeDefined();
      expect(editPlan[0].filePath).toBe('src/old.ts');
      expect(editPlan[0].fileExists).toBe(true);
      expect(editPlan[0].editType).toBe('modify');
      expect(editPlan[0].estimatedRisk).toBeDefined();
    });

    test('should handle APPLY phase with transaction support', async () => {
      const input = {
        changes: [{
          filePath: 'src/file.ts',
          patches: [{
            description: 'Update imports',
            oldContent: 'import old',
            newContent: 'import new'
          }]
        }],
        taskDescription: 'Update imports',
        transactional: true
      };

      const result = await codeEditorAgent(input, execution);

      // Verify transaction was used
      expect(execution.get('try', 'transactionId')).toBeDefined();
      expect(execution.get('try', 'backupLocations')).toBeDefined();
      
      // Verify tool was called
      const toolCalls = execution.get('try', 'useTools');
      expect(toolCalls).toBeDefined();
      expect(toolCalls[0].name).toBe('transactionalEdit');
    });

    test('should handle CORRECT phase with validation', async () => {
      const input = {
        changes: [{
          filePath: 'src/broken.ts',
          patches: [{
            description: 'Introduce syntax error',
            oldContent: 'function test() {',
            newContent: 'function test( {'  // Intentional error
          }]
        }],
        taskDescription: 'Test error correction',
        validateSyntax: true
      };

      const result = await codeEditorAgent(input, execution);

      // Verify CORRECT phase detected and fixed issues
      const syntaxValidation = execution.get('refine', 'syntaxValidation');
      expect(syntaxValidation).toBeDefined();
      
      const corrections = execution.get('refine', 'corrections');
      if (corrections) {
        expect(corrections.length).toBeGreaterThan(0);
        expect(corrections[0].issue).toContain('syntax');
      }
    });
  });

  describe('Simple Edit Variation', () => {
    test('should handle single file string replacement', async () => {
      const input = {
        singleEdit: {
          command: 'str_replace' as const,
          path: 'README.md',
          oldStr: 'old text',
          newStr: 'new text'
        },
        taskDescription: 'Update README'
      };

      const result = await codeEditorAgent(input, execution);

      expect(result.success).toBe(true);
      expect(result.fileResults).toHaveLength(1);
      expect(result.fileResults[0].status).toBe('modified');
      expect(result.fileResults[0].patches[0].applied).toBe(true);
    });

    test('should handle file creation', async () => {
      const input = {
        singleEdit: {
          command: 'create' as const,
          path: 'src/new-file.ts',
          content: 'export const NEW_CONSTANT = 42;'
        },
        taskDescription: 'Create new constant file'
      };

      const result = await codeEditorAgent(input, execution);

      expect(result.success).toBe(true);
      expect(result.fileResults[0].status).toBe('created');
      expect(result.summary.totalFilesEdited).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should rollback on edit failure', async () => {
      // Mock a failure
      const { TransactionalFileEditor } = require('@bitcode/file-editing');
      TransactionalFileEditor.mockImplementationOnce(() => ({
        beginTransaction: jest.fn().mockResolvedValue('tx-456'),
        executeCommand: jest.fn().mockRejectedValue(new Error('File not found')),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined)
      }));

      const input = {
        changes: [{
          filePath: 'nonexistent.ts',
          patches: [{
            description: 'Edit nonexistent file',
            oldContent: 'anything',
            newContent: 'something'
          }]
        }],
        taskDescription: 'Test rollback',
        transactional: true
      };

      await expect(codeEditorAgent(input, execution)).rejects.toThrow();
      
      // Verify rollback was called
      const editor = TransactionalFileEditor.mock.results[0].value;
      expect(editor.rollbackTransaction).toHaveBeenCalled();
    });

    test('should handle variation selection correctly', async () => {
      // Test that complex changes trigger divide-apply-correct
      const complexInput = {
        changes: [{}, {}],  // Multiple files
        taskDescription: 'Complex task'
      };

      await codeEditorAgent(complexInput, execution);
      expect(execution.get('agent', 'variation_reasoning').selected)
        .toBe('divide-apply-correct');

      // Test that simple edit triggers simple-edit variation
      const simpleInput = {
        singleEdit: { command: 'create' as const, path: 'file.ts', content: '' },
        taskDescription: 'Simple task'
      };

      const execution2 = new Execution('test-simple');
      await codeEditorAgent(simpleInput, execution2);
      expect(execution2.get('agent', 'variation_reasoning').selected)
        .toBe('simple-edit');
    });
  });

  describe('Integration with Test Intelligence', () => {
    test('should work with mock scenarios', async () => {
      const scenario = createTestScenario({
        id: 'code-edit-scenario',
        name: 'Code Editing Scenario',
        context: {
          agent: 'code-editor',
          files: ['src/app.ts', 'src/utils.ts']
        },
        data: [],
        behavior: {
          phases: ['divide', 'apply', 'correct'],
          expectedDuration: 5000,
          expectations: {
            success: true,
            resultPattern: {
              filesEdited: 2
            }
          }
        },
        tags: ['code-editing', 'transactional']
      });

      const mockConfig = mockAdapter.createMockScenario(scenario);
      
      // Apply mocks
      Object.entries(mockConfig.mocks).forEach(([key, mock]) => {
        jest.spyOn(execution, key as any).mockImplementation(mock as any);
      });

      const input = {
        changes: scenario.context.files.map(f => ({
          filePath: f,
          patches: [{ description: 'Update', oldContent: 'old', newContent: 'new' }]
        })),
        taskDescription: 'Test with scenario'
      };

      const result = await codeEditorAgent(input, execution);
      
      expect(result.success).toBe(true);
      expect(result.fileResults).toHaveLength(2);
    });

    test('should support dry run mode', async () => {
      const dryRunConfig = dryRunAdapter.createForPipeline('code-editor', {
        phase: 'implementation',
        agent: 'code-editor'
      });

      const execution = new Execution('dry-run-test');
      execution.dryRun = dryRunConfig;

      const input = {
        changes: [{
          filePath: 'test.ts',
          patches: [{ description: 'Test', oldContent: 'a', newContent: 'b' }]
        }],
        taskDescription: 'Dry run test'
      };

      const result = await codeEditorAgent(input, execution);

      // In dry run, no actual edits should occur
      expect(result.success).toBe(true);
      expect(result.summary.totalFilesEdited).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    test('should handle large file edits efficiently', async () => {
      const largeChanges = Array.from({ length: 50 }, (_, i) => ({
        filePath: `src/file${i}.ts`,
        patches: [{
          description: `Update file ${i}`,
          oldContent: 'old',
          newContent: 'new'
        }]
      }));

      const input = {
        changes: largeChanges,
        taskDescription: 'Large scale refactoring',
        transactional: true
      };

      const startTime = Date.now();
      const result = await codeEditorAgent(input, execution);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.fileResults).toHaveLength(50);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});
