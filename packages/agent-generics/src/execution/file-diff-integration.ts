/**
 * File Diff Integration for PTRR Agents
 *
 * Automatically streams file diffs when tools execute during PTRR steps.
 * Integrates file change tracker with streaming system.
 *
 * @package @bitcode/agent-generics
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import { extractFileChangesFromToolResults, getFileChangeStats } from '@bitcode/execution-generics';

/**
 * Post-step hook for streaming file diffs
 *
 * Call this after each PTRR step (Plan/Try/Refine/Retry) completes.
 * Extracts file changes from usedTools and streams them.
 */
export async function streamFileChangesAfterStep(
  execution: Execution,
  stepResult: any,
  context: {
    agent: string;
    step: 'Plan' | 'Try' | 'Refine' | 'Retry';
  }
): Promise<void> {
  // Extract file changes from usedTools
  const usedTools = stepResult?.usedTools || stepResult?.tools || [];

  if (usedTools.length === 0) {
    return; // No tools executed
  }

  // Record file changes in execution state
  extractFileChangesFromToolResults(execution, usedTools, context);

  // Get updated stats
  const stats = getFileChangeStats(execution);

  // Stream file tree changes if any files were modified
  if (stats.files.length > 0) {
    try {
      // Dynamic import to avoid circular dependency
      const { writeFileTreeChanges } = await import('@bitcode/api/streams');

      // Get data stream from execution
      const dataStream = execution.get('execution', 'dataStream');

      if (dataStream) {
        const metaPhase = execution.get('meta', 'phase');
        const phase = execution.get('phase', 'current');

        await writeFileTreeChanges(
          dataStream,
          {
            filesCreated: stats.totalFilesCreated,
            filesModified: stats.totalFilesModified,
            filesDeleted: stats.totalFilesDeleted,
            totalLinesAdded: stats.totalLinesAdded,
            totalLinesRemoved: stats.totalLinesRemoved,
            files: stats.files.map(f => ({
              path: f.path,
              action: f.action,
              linesAdded: f.linesAdded,
              linesRemoved: f.linesRemoved,
              oldContent: f.oldContent,
              newContent: f.newContent,
              language: f.language,
            })),
          },
          {
            metaPhase,
            phase,
            agent: context.agent,
            step: context.step,
            message: `${context.step} completed - ${stats.files.length} file(s) changed`,
          } as any
        );
      }
    } catch (error) {
      // Graceful degradation - don't fail execution if streaming fails
      console.warn('[File Diff] Failed to stream file changes:', error);
    }
  }
}

/**
 * Hook into agent step execution
 *
 * Wraps a step executor to automatically stream file diffs after execution.
 */
export function withFileDiffStreaming<TInput, TOutput>(
  stepExecutor: (input: TInput, execution: Execution) => Promise<TOutput>,
  stepName: 'Plan' | 'Try' | 'Refine' | 'Retry'
): (input: TInput, execution: Execution) => Promise<TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Execute step
    const result = await stepExecutor(input, execution);

    // Extract agent name from execution
    const agentName = String(execution.get('agent', 'name') || 'unknown');

    // Stream file changes
    await streamFileChangesAfterStep(execution, result, {
      agent: agentName,
      step: stepName,
    });

    return result;
  };
}
