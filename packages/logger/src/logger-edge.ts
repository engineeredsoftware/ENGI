/**
 * Logger - Edge Runtime Safe
 *
 * Subset of logger functionality for Edge Runtime.
 * No Sentry, no file I/O, just console output with formatting.
 */

type LogLevel = 'debug' | 'info' | 'error' | 'warn';

export async function log(message: string, level: LogLevel = 'info', data?: Record<string, any>) {
  const timestamp = new Date().toISOString();

  let executionContext = '';
  if (data) {
    const phase = data.phase || data.executionState?.phase;
    const agent = data.agent || data.executionState?.agent;
    const step = data.step || data.executionState?.step;
    const failsafe = data.failsafe || data.executionState?.failsafe;
    const generation = data.generation || data.executionState?.generation;

    const contextParts = [phase, agent, step, failsafe, generation].filter(Boolean);
    if (contextParts.length > 0) {
      executionContext = `[${contextParts.join(' → ')}] `;
    }
  }

  if (data && !data.correlationId) {
    if (data.runId && typeof data.runId === 'string') {
      data.correlationId = data.runId;
    } else {
      data.correlationId = Math.random().toString(36).slice(2, 10);
    }
  }

  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${executionContext}${message}`;

  if (data) {
    if (data.correlationId) {
      logEntry = logEntry.replace(`] ${executionContext}`, `] [${data.correlationId.slice(0, 8)}] ${executionContext}`);
    }

    const dataStr = JSON.stringify(data, (key, value) => {
      if (value instanceof Error) {
        return { message: value.message, name: value.name, stack: value.stack };
      }
      if (typeof value === 'string' && value.length > 1000) {
        return value.slice(0, 1000) + '... [truncated]';
      }
      return value;
    }, 2);
    logEntry += `\n${dataStr}`;
  }

  // Console output only (no file I/O in edge)
  switch (level) {
    case 'error':
      console.error(logEntry);
      break;
    case 'warn':
      console.warn(logEntry);
      break;
    case 'debug':
      console.debug(logEntry);
      break;
    default:
      console.log(logEntry);
  }
}

// No-op for edge (no file I/O)
export function reinitLoggerFile(_identifier: string, _opts?: any) {}
