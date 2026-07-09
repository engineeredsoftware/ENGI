// Migrated from uapi/lib/logger.ts – no code changes.
// The original file now re-exports from this module so existing imports keep working.

import * as fs from 'fs/promises';
import * as os from 'os';
import { supabaseAdmin } from '@bitcode/supabase';
import { putArtifactAtKey } from '@bitcode/artifacts';

const ORIGINAL_CONSOLE_ERROR = console.error.bind(console);
const ORIGINAL_CONSOLE_WARN = console.warn.bind(console);
const ORIGINAL_CONSOLE_LOG = console.log.bind(console);
const ORIGINAL_CONSOLE_DEBUG = console.debug.bind(console);
// Import Sentry (edge runtime gets stub via webpack alias)
// Dynamic Sentry import
let sentryPromise: Promise<any> | null = null;
function getSentry() {
  if (sentryPromise) return sentryPromise;
  if (process.env.NEXT_RUNTIME === 'edge') return Promise.resolve(null);
  sentryPromise = import('@bitcode/sentry').catch(() => null);
  return sentryPromise;
}

const LOG_TO_FILE = process.env.BITCODE_LOG_TO_FILE === '1';
const LOG_TO_STDOUT = process.env.BITCODE_LOG_STDOUT !== '0';

function joinPath(...segments: string[]): string {
  const cleaned = segments
    .filter((segment): segment is string => typeof segment === 'string' && segment.length > 0)
    .map((segment, index) => {
      const trimmed = segment.replace(/\\+/g, '/');
      if (index === 0) return trimmed.replace(/\/+$/g, '');
      return trimmed.replace(/^\/+/, '').replace(/\/+$/g, '');
    });
  if (cleaned.length === 0) return '';
  return cleaned.join('/');
}

const DEFAULT_LOG_DIR = joinPath('/tmp', '.bitcode_logs');
let CURRENT_LOG_FILE = process.env.LOG_FILE_PATH || joinPath(DEFAULT_LOG_DIR, 'bitcode.log');

function dirname(filePath: string): string {
  const normalized = (filePath || '').replace(/[\\]+/g, '/');
  const idx = normalized.lastIndexOf('/');
  if (idx === -1) return '.';
  if (idx === 0) return '/';
  return normalized.slice(0, idx);
}

function basename(filePath: string): string {
  const normalized = (filePath || '').replace(/[\\]+/g, '/');
  const idx = normalized.lastIndexOf('/');
  return idx === -1 ? normalized : normalized.slice(idx + 1);
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-_\.]/g, '-').slice(0, 200);
}

 /**
 * Reinitialize the log file path for subsequent writes.
 * Example: reinitLoggerFile('asset-pack-request-<uuid>') -> /tmp/.bitcode_logs/asset-pack-request-<uuid>.log
 */
export function reinitLoggerFile(identifier: string, opts?: { prefix?: string; dir?: string; ext?: string }) {
  const base = opts?.dir || DEFAULT_LOG_DIR;
  const prefix = opts?.prefix || 'bitcode';
  const ext = opts?.ext || '.log';
  const safe = sanitizeId(identifier || 'run');
  // Nest logs under the run-specific directory for easier browsing
  const dir = joinPath(base, safe);
  CURRENT_LOG_FILE = joinPath(dir, `${prefix}-${safe}${ext}`);
}

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
    if ((data as any).runId && typeof (data as any).runId === 'string') {
      data.correlationId = (data as any).runId;
    } else {
      data.correlationId =
        (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto)
          ? (globalThis.crypto as any).randomUUID()
          : Math.random().toString(36).slice(2, 10);
    }
  }

  let logEntry = `[${timestamp}] [${level.toString().toUpperCase()}] ${executionContext}${message}`;

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
    logEntry += `--\n${dataStr}`;
  }

  logEntry += '--\n';

  if (LOG_TO_FILE) {
    try {
      const dir = dirname(CURRENT_LOG_FILE);
      try { await fs.mkdir(dir, { recursive: true }); } catch {}
      await fs.appendFile(CURRENT_LOG_FILE, `${logEntry}\n`);
    } catch {}
  }

  const emit = () => {
    if (LOG_TO_STDOUT) {
      switch (level) {
        case 'error':
          ORIGINAL_CONSOLE_ERROR(logEntry);
          break;
        case 'warn':
          ORIGINAL_CONSOLE_WARN(logEntry);
          break;
        case 'debug':
          ORIGINAL_CONSOLE_DEBUG(logEntry);
          break;
        default:
          ORIGINAL_CONSOLE_LOG(logEntry);
      }
    } else {
      process.stderr.write(`${logEntry}\n`);
    }
  };

  try {
    emit();
  } catch {
    // swallow logging errors
  }

  if (level === 'error') {
    getSentry().then(s => s?.captureException(new Error(message), { extra: data })).catch(() => {});
  } else if (level === 'warn') {
    getSentry().then(s => s?.captureMessage(message, 'warning')).catch(() => {});
  }

  // Optional: Sync log file to object storage for remote tailing
  try {
    if (LOG_TO_FILE && process.env.BITCODE_LOG_SYNC_S3 === '1') {
      // Throttle uploads per file by simple time window
      const now = Date.now();
      const THROTTLE_MS = 1000;
      (globalThis as any).__bitcodeLogSync = (globalThis as any).__bitcodeLogSync || new Map<string, number>();
      const last = (globalThis as any).__bitcodeLogSync.get(CURRENT_LOG_FILE) || 0;
      if (now - last > THROTTLE_MS) {
        (globalThis as any).__bitcodeLogSync.set(CURRENT_LOG_FILE, now);
        const env = process.env.BITCODE_ENV || process.env.NODE_ENV || 'local';
        const key = `logs/${env}/${basename(CURRENT_LOG_FILE)}`;
        try {
          const buf = await fs.readFile(CURRENT_LOG_FILE);
          await putArtifactAtKey(key, buf, 'text/plain');
        } catch {}
      }
    }
  } catch {}
}

type LoggerMethod = (message: string, data?: Record<string, any>) => Promise<void>;
type LoggerFn = typeof log & {
  debug: LoggerMethod;
  info: LoggerMethod;
  warn: LoggerMethod;
  error: LoggerMethod;
};

function withLevel(level: LogLevel): LoggerMethod {
  return (message, data) => log(message, level, data);
}

// Callable logger with stable level helpers.
export const logger: LoggerFn = Object.assign(log, {
  debug: withLevel('debug'),
  info: withLevel('info'),
  warn: withLevel('warn'),
  error: withLevel('error'),
});

// ------------------------------------------------------------
// Prompt I/O sidecar writer (debug utility)
// ------------------------------------------------------------

export async function writePromptIO(opts: {
  runId?: string;
  phase?: string;
  agent?: string;
  step?: string;
  sequence?: string;
  kind: 'input' | 'output';
  content: string;
  provider?: string;
  model?: string;
}): Promise<string | undefined> {
  try {
    const enabledEnv = String(process?.env?.BITCODE_WRITE_PROMPT_IO ?? '1').toLowerCase();
    const enabled = !(enabledEnv === '0' || enabledEnv === 'false');
    if (!enabled) return undefined;

    const baseDir = DEFAULT_LOG_DIR;
    const runDir = joinPath(baseDir, sanitizeId(opts.runId || 'run'));
    try { await fs.mkdir(runDir, { recursive: true }); } catch {}

    const safe = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 120) || 'na';
    const prefix = safe(opts.runId || 'run');
    const fileBase = `${prefix}.${safe(opts.phase)}-${safe(opts.agent)}-${safe(opts.step)}-${safe(opts.sequence)}-${safe(opts.provider)}-${safe(opts.model)}`;
    const filename = joinPath(runDir, `${fileBase}.prompt.${opts.kind}`);
    await fs.writeFile(filename, opts.content ?? '', 'utf8');
    return filename;
  } catch {
    return undefined;
  }
}

// ------------------------------------------------------------
// Raw LLM wire I/O writer (local debugging utility)
//
// Unlike writePromptIO (a flattened-prompt sidecar under /tmp, success-only,
// intended for quick tailing), this writes the literal request payload and
// the literal response/error for every LLM call — including failures like a
// 413 request_too_large — to a per-run directory under the user's home
// directory, so it survives past /tmp getting cleared and is easy to find.
// ------------------------------------------------------------

const RAW_LLM_LOG_BASE_DIR = joinPath(os.homedir(), '.bitcode', 'logs', 'executions');
let __rawLLMIOSeq = 0;

export async function writeRawLLMIO(opts: {
  executionId?: string;
  pathKey: string;
  kind: 'request' | 'response' | 'error';
  provider?: string;
  model?: string;
  content: unknown;
}): Promise<string | undefined> {
  try {
    const enabledEnv = String(process?.env?.BITCODE_WRITE_RAW_LLM_IO ?? '1').toLowerCase();
    if (enabledEnv === '0' || enabledEnv === 'false') return undefined;
    // Never litter the developer's home directory from a test run — jest
    // exercises this same LLM-substep code path with mocked LLMs.
    if (process?.env?.NODE_ENV === 'test') return undefined;

    // Claim the sequence number before any await: callers fire-and-forget, so
    // an await ahead of the increment lets concurrent writes swap numbers and
    // the on-disk ordering stops reflecting call order.
    const safe = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 160) || 'na';
    const seq = String(++__rawLLMIOSeq).padStart(5, '0');

    const runDir = joinPath(RAW_LLM_LOG_BASE_DIR, sanitizeId(opts.executionId || 'run'));
    try { await fs.mkdir(runDir, { recursive: true }); } catch {}
    const filename = joinPath(runDir, `${seq}-${safe(opts.pathKey)}.${opts.kind}.json`);

    const payload = opts.kind === 'error'
      ? {
          timestamp: new Date().toISOString(),
          provider: opts.provider,
          model: opts.model,
          error: opts.content instanceof Error
            ? { name: opts.content.name, message: opts.content.message, stack: opts.content.stack }
            : opts.content,
        }
      : {
          timestamp: new Date().toISOString(),
          provider: opts.provider,
          model: opts.model,
          content: opts.content,
        };

    await fs.writeFile(filename, JSON.stringify(payload, null, 2), 'utf8');
    return filename;
  } catch {
    return undefined;
  }
}

// ------------------------------------------------------------
// Step Trace sidecar writer (debug utility)
// ------------------------------------------------------------
export async function writeStepTraceJSON(opts: {
  runId?: string;
  phase?: string;
  agent?: string;
  step?: string;
  provider?: string;
  model?: string;
  summary: any;
  trace: any;
}): Promise<string | undefined> {
  try {
    const enabledEnv = String(process?.env?.BITCODE_WRITE_STEP_TRACES || '').toLowerCase();
    const enabled = enabledEnv === '1';
    if (!enabled) return undefined;

    const baseDir = DEFAULT_LOG_DIR;
    const runDir = joinPath(baseDir, sanitizeId(opts.runId || 'run'));
    try { await fs.mkdir(runDir, { recursive: true }); } catch {}

    const safe = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 120) || 'na';
    const prefix = safe(opts.runId || 'run');
    const fileBase = `${prefix}.${safe(opts.phase)}-${safe(opts.agent)}-${safe(opts.step)}-${safe(opts.provider)}-${safe(opts.model)}`;
    const filename = joinPath(runDir, `${fileBase}.trace.json`);
    const payload = { summary: opts.summary, trace: opts.trace };
    await fs.writeFile(filename, JSON.stringify(payload, null, 2), 'utf8');
    return filename;
  } catch {
    return undefined;
  }
}
