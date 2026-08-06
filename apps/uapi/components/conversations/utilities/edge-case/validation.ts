/**
 * Type-specific validation and sanitization for rich response payloads.
 */
import { sanitizeRichResponseContent } from './data-integrity';

export function validatePipelineLogsData(
  data: Record<string, unknown>,
  errors: string[],
) {
  const required = ['runId', 'pipelineType', 'status', 'progress', 'recentLogs', 'metrics'];

  required.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (data.recentLogs && Array.isArray(data.recentLogs)) {
    data.recentLogs = data.recentLogs.map((log: Record<string, unknown>) => ({
      timestamp: log.timestamp || new Date().toISOString(),
      level: ['info', 'warning', 'error', 'success'].includes(log.level as string)
        ? log.level
        : 'info',
      message: sanitizeRichResponseContent((log.message as string) || ''),
      phase: log.phase || '',
      agent: log.agent || '',
    }));
  }

  return {
    isValid: errors.length === 0,
    sanitizedData: data,
    errors,
  };
}

export function validateCodeDiffData(data: Record<string, unknown>, errors: string[]) {
  if (!data.files || !Array.isArray(data.files)) {
    errors.push('CodeDiff data must have files array');
  }

  if (data.files) {
    data.files = (data.files as Array<Record<string, unknown>>).map((file) => ({
      path: file.path || 'unknown',
      language: file.language || 'text',
      oldContent: sanitizeRichResponseContent((file.oldContent as string) || ''),
      newContent: sanitizeRichResponseContent((file.newContent as string) || ''),
      changeType: ['added', 'modified', 'deleted', 'renamed'].includes(
        file.changeType as string,
      )
        ? file.changeType
        : 'modified',
      stats: file.stats || { additions: 0, deletions: 0, changes: 0 },
    }));
  }

  return {
    isValid: errors.length === 0,
    sanitizedData: data,
    errors,
  };
}

export function validateDataTableData(data: Record<string, unknown>, errors: string[]) {
  if (!data.columns || !Array.isArray(data.columns)) {
    errors.push('DataTable must have columns array');
  }

  if (!data.rows || !Array.isArray(data.rows)) {
    errors.push('DataTable must have rows array');
  }

  if (data.rows) {
    data.rows = (data.rows as Array<Record<string, unknown>>).map((row) => {
      const sanitizedRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        if (typeof row[key] === 'string') {
          sanitizedRow[key] = sanitizeRichResponseContent(row[key] as string);
        } else {
          sanitizedRow[key] = row[key];
        }
      });
      return sanitizedRow;
    });
  }

  return {
    isValid: errors.length === 0,
    sanitizedData: data,
    errors,
  };
}
