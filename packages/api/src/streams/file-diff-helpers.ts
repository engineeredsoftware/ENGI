/**
 * File Diff Streaming Helpers
 *
 * Utilities for streaming file changes through the execution pipeline.
 * Integrates with the core streaming system to show code diffs in real-time.
 *
 * @package @bitcode/api/streams
 */

import type { StreamMessage, FileDiff, FileTreeChange } from './streams';
import { writeStreamMessage } from './streams';

/**
 * Write a single file diff to the stream
 *
 * Use this when a file is created, modified, or deleted during execution.
 * The UI will render an expandable diff viewer inline with the log.
 */
export async function writeFileDiff(
  dataStream: any,
  fileDiff: FileDiff,
  options?: {
    phase?: string;
    agent?: string;
    step?: string;
    message?: string;
  }
): Promise<void> {
  const message: StreamMessage = {
    type: 'file-diff',
    message: options?.message || `File ${fileDiff.action}: ${fileDiff.path}`,
    fileDiff,
    executionState: options ? {
      phase: options.phase as any,
      agent: options.agent,
      step: options.step as any,
    } : undefined,
    progress: fileDiff.action === 'created' ? 'success' : fileDiff.action === 'deleted' ? 'warning' : 'in-progress',
  };

  await writeStreamMessage(dataStream, message);
}

/**
 * Write complete file tree changes to the stream
 *
 * Use this at the end of implementation phase to show all file changes
 * in a single, comprehensive view with statistics.
 */
export async function writeFileTreeChanges(
  dataStream: any,
  fileTree: FileTreeChange,
  options?: {
    phase?: string;
    agent?: string;
    step?: string;
    message?: string;
  }
): Promise<void> {
  const message: StreamMessage = {
    type: 'file-diff',
    message: options?.message || 'File tree changes completed',
    fileTree,
    executionState: options ? {
      phase: options.phase as any,
      agent: options.agent,
      step: options.step as any,
    } : undefined,
    progress: 'success',
  };

  await writeStreamMessage(dataStream, message);
}

/**
 * Calculate file tree statistics from an array of file diffs
 */
export function calculateFileTreeStats(files: FileDiff[]): FileTreeChange {
  const stats = files.reduce((acc, file) => {
    if (file.action === 'created') acc.filesCreated++;
    if (file.action === 'modified') acc.filesModified++;
    if (file.action === 'deleted') acc.filesDeleted++;
    acc.totalLinesAdded += file.linesAdded || 0;
    acc.totalLinesRemoved += file.linesRemoved || 0;
    return acc;
  }, {
    filesCreated: 0,
    filesModified: 0,
    filesDeleted: 0,
    totalLinesAdded: 0,
    totalLinesRemoved: 0,
    files: files,
  });

  return stats;
}

/**
 * Extract file diffs from tool results
 *
 * Parse tool execution results (Write, Edit, Delete tools) and convert
 * to FileDiff objects for streaming.
 */
export function extractFileDiffsFromToolResults(toolResults: any[]): FileDiff[] {
  const diffs: FileDiff[] = [];

  for (const result of toolResults) {
    if (result.toolName === 'Write' && result.result) {
      // File created or overwritten
      diffs.push({
        path: result.args?.file_path || result.args?.path,
        action: 'created',
        newContent: result.args?.content,
        linesAdded: result.args?.content?.split('\n').length || 0,
        linesRemoved: 0,
      });
    }

    if (result.toolName === 'Edit' && result.result) {
      // File modified
      diffs.push({
        path: result.args?.file_path || result.args?.path,
        action: 'modified',
        oldContent: result.metadata?.originalContent,
        newContent: result.metadata?.newContent,
        linesAdded: result.metadata?.linesAdded || 0,
        linesRemoved: result.metadata?.linesRemoved || 0,
      });
    }

    if (result.toolName === 'Bash' && result.args?.command?.includes('rm ')) {
      // File deleted (simple detection)
      const match = result.args.command.match(/rm\s+([^\s]+)/);
      if (match) {
        diffs.push({
          path: match[1],
          action: 'deleted',
          linesAdded: 0,
          linesRemoved: result.metadata?.linesRemoved || 0,
        });
      }
    }
  }

  return diffs;
}
