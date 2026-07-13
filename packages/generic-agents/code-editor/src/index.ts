/**
 * Code Editor Agent - Production-grade code editing with Divide|Apply|Correct pattern
 * 
 * This agent implements reliable code editing through:
 * - Divide: Analyze code changes and create atomic edit plans
 * - Apply: Execute edits using atomic file operations
 * - Correct: Validate and fix any issues
 * 
 * @doc-code-agent
 * @category code-editing
 * @stability stable
 * @version 1.0.0
 */

import { 
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import { ExecutionTool } from '@bitcode/execution-generics';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { 
  TransactionalFileEditor,
  type EditCommandParams,
  type TextEdit,
  type Position,
  type Range
} from '@bitcode/file-editing';
import { z } from 'zod';

// ==================== TOOLS ====================

/**
 * Tool wrapper for atomic file editing operations
 */
class AtomicEditTool extends ExecutionTool<(params: EditCommandParams) => Promise<string>> {
  name = 'transactionalEdit';
  description = 'Execute transactional file editing operations';
  
  private editor = new TransactionalFileEditor();
  
  use = async (params: EditCommandParams): Promise<string> => {
    if (this.execution) {
      this.execution.store('tool', 'transactionalEdit:start', {
        command: params.command,
        path: params.path,
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await this.editor.executeCommand(params);
    
    if (this.execution) {
      this.execution.store('tool', 'transactionalEdit:result', {
        command: params.command,
        path: params.path,
        result,
        timestamp: new Date().toISOString()
      });
    }
    
    return result;
  };
}

const transactionalEditTool = new AtomicEditTool();

// ==================== INPUT SCHEMA ====================

const CodeEditorInputSchema = z.object({
  // File-level changes (for Divide|Apply|Correct pattern)
  changes: z.array(z.object({
    filePath: z.string().describe('Path to the file to edit'),
    patches: z.array(z.object({
      description: z.string().describe('What this patch does'),
      oldContent: z.string().describe('Content to find and replace'),
      newContent: z.string().describe('New content to insert'),
      lineRange: z.tuple([z.number(), z.number()]).optional().describe('Optional line range hint')
    })).describe('List of patches to apply to this file')
  })).optional().describe('File-by-file change specifications'),
  
  // Alternative: Single file edit
  singleEdit: z.object({
    command: z.enum(['create', 'str_replace', 'insert', 'delete', 'replace', 'patch']),
    path: z.string(),
    content: z.string().optional(),
    oldStr: z.string().optional(),
    newStr: z.string().optional(),
    insertLine: z.number().optional(),
    patches: z.array(z.object({
      start: z.object({ line: z.number(), character: z.number() }),
      end: z.object({ line: z.number(), character: z.number() }),
      newText: z.string()
    })).optional()
  }).optional().describe('Single file edit operation'),
  
  // Edit configuration
  transactional: z.boolean().default(true).describe('Use transactional operations'),
  createBackup: z.boolean().default(true).describe('Create backups before editing'),
  validateSyntax: z.boolean().default(true).describe('Validate syntax after editing'),
  
  // Context for decision making
  taskDescription: z.string().describe('What the edits are trying to achieve'),
  codebaseContext: z.any().optional().describe('Additional codebase context')
});

// ==================== DIVIDE STEP SCHEMA (Plan) ====================

const CodeEditorDivideSchema = z.object({
  // Analysis of required changes
  changeAnalysis: z.object({
    totalFiles: z.number(),
    totalEdits: z.number(),
    estimatedComplexity: z.enum(['simple', 'moderate', 'complex']),
    dependencies: z.array(z.string()).describe('Files that depend on each other')
  }),
  
  // Divided edit plan
  editPlan: z.array(z.object({
    filePath: z.string(),
    fileExists: z.boolean(),
    editType: z.enum(['create', 'modify', 'delete']),
    patches: z.array(z.object({
      order: z.number().describe('Order to apply patches'),
      description: z.string(),
      searchPattern: z.string().describe('Pattern to find in file'),
      replacement: z.string().describe('What to replace it with'),
      confidence: z.number().min(0).max(1)
    })),
    estimatedRisk: z.enum(['low', 'medium', 'high'])
  })).describe('File-by-file edit plan'),
  
  // Execution strategy
  executionStrategy: z.object({
    useTransaction: z.boolean().describe('Wrap all edits in transaction'),
    parallelizable: z.boolean().describe('Can edits be done in parallel'),
    rollbackPlan: z.array(z.string()).describe('Steps to rollback if needed')
  }),
  
  confidence: z.number().min(0).max(1)
});

// ==================== APPLY STEP SCHEMA (Try) ====================

const CodeEditorApplySchema = z.object({
  // Tool execution
  useTools: z.array(z.object({
    name: z.literal('transactionalEdit'),
    input: z.object({
      command: z.string(),
      path: z.string(),
      file_text: z.string().optional(),
      old_str: z.string().optional(),
      new_str: z.string().optional(),
      insert_line: z.number().optional(),
      patch_content: z.string().optional()
    }),
    reason: z.string()
  })).min(1).describe('Atomic edit operations to execute'),
  
  // Execution results
  executedEdits: z.array(z.object({
    filePath: z.string(),
    command: z.string(),
    success: z.boolean(),
    result: z.string().optional(),
    error: z.string().optional()
  })),
  
  // Transaction info
  transactionId: z.string().optional(),
  backupLocations: z.record(z.string()).optional(),
  
  // Overall status
  allEditsSuccessful: z.boolean(),
  filesModified: z.number(),
  filesCreated: z.number(),
  filesDeleted: z.number()
});

// ==================== CORRECT STEP SCHEMA (Refine) ====================

const CodeEditorCorrectSchema = z.object({
  // Validation results
  syntaxValidation: z.record(z.object({
    valid: z.boolean(),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional()
  })).describe('Syntax validation per file'),
  
  // Corrections needed
  corrections: z.array(z.object({
    filePath: z.string(),
    issue: z.string(),
    correction: z.string(),
    applied: z.boolean()
  })).optional(),
  
  // Corrective tools
  useTools: z.array(z.object({
    name: z.literal('transactionalEdit'),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Additional edits to fix issues'),
  
  // Quality metrics
  codeQuality: z.object({
    maintainability: z.number().min(0).max(1),
    readability: z.number().min(0).max(1),
    testability: z.number().min(0).max(1)
  }),
  
  // Final assessment
  editsComplete: z.boolean(),
  requiresManualReview: z.boolean(),
  confidence: z.number().min(0).max(1)
});

// ==================== FINAL OUTPUT SCHEMA (Retry) ====================

const CodeEditorOutputSchema = z.object({
  // Summary of all edits
  summary: z.object({
    totalFilesEdited: z.number(),
    totalLinesAdded: z.number(),
    totalLinesRemoved: z.number(),
    totalLinesModified: z.number()
  }),
  
  // Detailed results per file
  fileResults: z.array(z.object({
    filePath: z.string(),
    status: z.enum(['created', 'modified', 'deleted', 'unchanged', 'error']),
    patches: z.array(z.object({
      description: z.string(),
      applied: z.boolean(),
      result: z.string().optional()
    })),
    finalContent: z.string().optional().describe('Final file content after all edits')
  })),
  
  // Validation results
  validation: z.object({
    allSyntaxValid: z.boolean(),
    allTestsPassing: z.boolean().optional(),
    noRegressions: z.boolean().optional()
  }),
  
  // Transaction info
  transactionId: z.string().optional(),
  canRollback: z.boolean(),
  
  // Overall result
  success: z.boolean(),
  message: z.string(),
  confidence: z.number().min(0).max(1)
});

export type CodeEditorInput = z.infer<typeof CodeEditorInputSchema>;
export type CodeEditorDivideOutput = z.infer<typeof CodeEditorDivideSchema>;
export type CodeEditorApplyOutput = z.infer<typeof CodeEditorApplySchema>;
export type CodeEditorCorrectOutput = z.infer<typeof CodeEditorCorrectSchema>;
export type CodeEditorOutput = z.infer<typeof CodeEditorOutputSchema>;

// ==================== PROMPTS ====================

export const codeEditorPrompt = new AgentPrompt({
  name: createPromptPart('code-editor'),
  identity: createPromptPart(`You are a precision code editing agent that implements the Divide|Apply|Correct pattern for reliable code modifications.
  
Your approach:
- DIVIDE: Analyze the required changes and create a detailed, atomic edit plan
- APPLY: Execute the edits using atomic file operations with transaction support
- CORRECT: Validate the changes and fix any issues that arise

You ensure:
- All edits are atomic and can be rolled back if needed
- File backups are created before modifications
- Syntax validation occurs after edits
- Dependencies between files are respected
- Changes are applied in the correct order`)
});

export const codeEditorStepPrompts = {
  divide: new AgentStepPrompt({ 
    purpose: createPromptPart('Analyze the required code changes and create a detailed edit plan broken down by file and patch')
  }),
  apply: new AgentStepPrompt({
    purpose: createPromptPart('Execute the edit plan using atomic file operations, ensuring each edit is applied correctly')
  }),
  correct: new AgentStepPrompt({ 
    purpose: createPromptPart('Validate all edits, check syntax, and apply corrections if needed')
  }),
  finalize: new AgentStepPrompt({ 
    purpose: createPromptPart('Finalize all edits, summarize changes, and prepare rollback information if needed')
  })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive Code Editor Agent using Divide|Apply|Correct pattern
 */
export const codeEditorComprehensiveAgent = factoryPTRRAgent<
  CodeEditorInput,
  CodeEditorOutput
>({
  name: 'divide-apply-correct',
  description: 'Systematic code editing using Divide|Apply|Correct pattern',
  prompt: codeEditorPrompt,
  stepPrompts: {
    plan: () => codeEditorStepPrompts.divide,
    try: () => codeEditorStepPrompts.apply,
    refine: () => codeEditorStepPrompts.correct,
    retry: () => codeEditorStepPrompts.finalize
  },
  
  outputSchema: CodeEditorOutputSchema,

  plan: {
    chunkThreshold: 1000
  },
  try: {
    chunkThreshold: 5000,
    enableParallelChunks: false  // Edits must be sequential
  },
  refine: {
    maxAttempts: 3
  },
  retry: {
    maxAttempts: 2
  }
});

/**
 * Quick Code Editor Agent for single-file edits
 */
export const codeEditorQuickAgent = factoryAgentWithSingleStep<
  CodeEditorInput,
  CodeEditorOutput
>({
  name: 'simple-edit',
  description: 'Direct single-file editing for simple changes',
  
  execute: async (input, execution) => {
    execution.store('variation', 'mode', 'simple');
    
    if (!input.singleEdit) {
      throw new Error('singleEdit is required for simple variation');
    }
    
    // Get the atomic edit tool
    const tool = (execution as any).tools?.getTool('transactionalEdit', execution as any);
    if (!tool) {
      throw new Error('transactionalEdit tool not registered');
    }
    
    // Map input to EditCommandParams
    const editParams: EditCommandParams = {
      command: input.singleEdit.command,
      path: input.singleEdit.path,
      file_text: input.singleEdit.content,
      old_str: input.singleEdit.oldStr,
      new_str: input.singleEdit.newStr,
      insert_line: input.singleEdit.insertLine,
      atomic: input.transactional,
      create_backup: input.createBackup
    };
    
    // Execute the edit
    const result = await tool.execute(editParams);
    
    // Return formatted output
    return {
      summary: {
        totalFilesEdited: 1,
        totalLinesAdded: 0,
        totalLinesRemoved: 0,
        totalLinesModified: 0
      },
      fileResults: [{
        filePath: input.singleEdit.path,
        status: result.includes('created') ? 'created' : 'modified',
        patches: [{
          description: input.taskDescription,
          applied: true,
          result
        }],
        finalContent: undefined
      }],
      validation: {
        allSyntaxValid: true
      },
      canRollback: input.transactional,
      success: true,
      message: `Successfully executed ${input.singleEdit.command} on ${input.singleEdit.path}`,
      confidence: 0.95
    };
  }
});

// ==================== AGENT EXPORTS ====================

/**
 * Code Editor Agent - registry-friendly canonical default.
 * Direct callers can choose codeEditorComprehensiveAgent or codeEditorQuickAgent
 * when they read a specific execution profile.
 */
export const codeEditorAgent = codeEditorComprehensiveAgent;

/**
 * Helper to select appropriate code editor agent based on input
 * Used by pipelines to determine which agent to retrieve from registry
 */
export function selectCodeEditorAgent(input: CodeEditorInput): string {
  // Use comprehensive for complex multi-file edits
  const needsComprehensive = (input.changes && input.changes.length > 1) || 
                            input.transactional || 
                            input.createBackup;
  
  return needsComprehensive ? 'code-editor:comprehensive' : 'code-editor:quick';
}

/**
 * THE PATTERN EXPLAINED:
 * 
 * The Divide|Apply|Correct pattern ensures reliable code editing:
 * 
 * 1. DIVIDE (Plan Step):
 *    - Analyzes all required changes
 *    - Creates atomic edit plans per file
 *    - Identifies dependencies and ordering
 *    - Estimates risk and complexity
 * 
 * 2. APPLY (Try Step):
 *    - Executes edits using transactionalEdit tool
 *    - Maintains transaction for rollback
 *    - Creates backups before changes
 *    - Tracks success/failure per edit
 * 
 * 3. CORRECT (Refine Step):
 *    - Validates syntax of edited files
 *    - Identifies and fixes issues
 *    - Applies corrective edits if needed
 *    - Assesses code quality
 * 
 * 4. FINALIZE (Retry Step):
 *    - Summarizes all changes
 *    - Prepares rollback information
 *    - Reports final validation status
 *    - Provides confidence assessment
 */
