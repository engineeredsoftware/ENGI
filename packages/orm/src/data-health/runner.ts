import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { Client, type QueryResultRow } from 'pg';

import {
  DATA_HEALTH_CHECKS,
  DataHealthCheckDefinition,
  DataHealthSeverity,
  DataHealthSqlRow,
  DataHealthSuite,
  getDataHealthChecksForSuite,
} from './checks';

export type DataHealthStatus = 'pass' | 'fail' | 'skip' | 'error';

export interface DataHealthRunOptions {
  suite?: DataHealthSuite;
  checks?: DataHealthCheckDefinition[];
  failOn?: DataHealthSeverity;
  includeSkipped?: boolean;
  now?: Date;
}

export interface DataHealthCheckResult {
  id: string;
  title: string;
  category: DataHealthCheckDefinition['category'];
  severity: DataHealthSeverity;
  status: DataHealthStatus;
  ok: boolean;
  observedCount: number | null;
  details: unknown;
  description: string;
  remediation: string;
  durationMs: number;
  skippedReason?: string;
  errorMessage?: string;
}

export interface DataHealthRunSummary {
  suite: DataHealthSuite;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  checked: number;
  passed: number;
  failed: number;
  skipped: number;
  errored: number;
  failOn: DataHealthSeverity;
  exitCode: number;
}

export interface DataHealthRunReport {
  summary: DataHealthRunSummary;
  results: DataHealthCheckResult[];
}

export interface DataHealthConnectionInfo {
  database: string | null;
  user: string | null;
  serverVersion: string | null;
}

interface Queryable {
  query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]): Promise<{
    rows: T[];
  }>;
}

const SEVERITY_RANK: Record<DataHealthSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

export function resolveDataHealthConnectionString(env: NodeJS.ProcessEnv = process.env): string | null {
  return (
    env.SUPABASE_DB_URL ||
    env.SUPABASE_DATABASE_URL ||
    env.DATABASE_URL ||
    env.POSTGRES_URL ||
    null
  );
}

export function loadDataHealthEnvFiles(cwd: string = process.cwd()): void {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const candidates = [
    path.join(repoRoot, '.env.local'),
    path.join(repoRoot, 'apps/uapi/.env.local'),
    path.join(cwd, '.env.local'),
  ];

  for (const filePath of candidates) {
    loadEnvFile(filePath);
  }
}

export function redactConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = 'redacted';
    }
    if (url.username) {
      url.username = url.username ? 'redacted' : '';
    }
    return url.toString();
  } catch {
    return '[unparseable connection string]';
  }
}

export async function createDataHealthClient(connectionString: string): Promise<Client> {
  const normalizedConnectionString = normalizePgConnectionString(connectionString);
  const client = new Client({
    connectionString: normalizedConnectionString,
    ssl: shouldUseSsl(normalizedConnectionString) ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  return client;
}

export async function readDataHealthConnectionInfo(client: Queryable): Promise<DataHealthConnectionInfo> {
  const result = await client.query<{
    database: string | null;
    user_name: string | null;
    server_version: string | null;
  }>(`
    SELECT
      current_database() AS database,
      current_user AS user_name,
      current_setting('server_version', true) AS server_version;
  `);
  const row = result.rows[0];
  return {
    database: row?.database ?? null,
    user: row?.user_name ?? null,
    serverVersion: row?.server_version ?? null,
  };
}

export async function runDataHealthChecks(
  client: Queryable,
  options: DataHealthRunOptions = {},
): Promise<DataHealthRunReport> {
  const suite = options.suite ?? 'daily';
  const failOn = options.failOn ?? 'critical';
  const checks = options.checks ?? getDataHealthChecksForSuite(suite);
  const startedAt = options.now ?? new Date();
  const runStartedMs = Date.now();
  const availableRelations = await inspectAvailableRelations(client);
  const results: DataHealthCheckResult[] = [];

  for (const check of checks) {
    const missingRelations = (check.requires ?? []).filter((relation) => !availableRelations.has(relation));
    if (missingRelations.length > 0) {
      results.push({
        id: check.id,
        title: check.title,
        category: check.category,
        severity: check.severity,
        status: 'skip',
        ok: true,
        observedCount: null,
        details: { missingRelations },
        description: check.description,
        remediation: check.remediation,
        durationMs: 0,
        skippedReason: `Missing required relation(s): ${missingRelations.join(', ')}`,
      });
      continue;
    }

    const checkStartedMs = Date.now();
    try {
      const queryResult = await client.query<DataHealthSqlRow & QueryResultRow>(check.sql);
      const row = queryResult.rows[0];
      if (!row || typeof row.ok !== 'boolean') {
        throw new Error('Health check SQL must return a first row with boolean column "ok".');
      }

      results.push({
        id: check.id,
        title: check.title,
        category: check.category,
        severity: check.severity,
        status: row.ok ? 'pass' : 'fail',
        ok: row.ok,
        observedCount: normalizeObservedCount(row.observed_count),
        details: row.details ?? null,
        description: check.description,
        remediation: check.remediation,
        durationMs: Date.now() - checkStartedMs,
      });
    } catch (error) {
      results.push({
        id: check.id,
        title: check.title,
        category: check.category,
        severity: check.severity,
        status: 'error',
        ok: false,
        observedCount: null,
        details: null,
        description: check.description,
        remediation: check.remediation,
        durationMs: Date.now() - checkStartedMs,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const finishedAt = new Date();
  const actionableResults = results.filter((result) => result.status !== 'skip');
  const failedResults = results.filter((result) => result.status === 'fail' || result.status === 'error');
  const exitCode = failedResults.some((result) => shouldFail(result.severity, failOn)) ? 1 : 0;

  return {
    summary: {
      suite,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: Date.now() - runStartedMs,
      checked: actionableResults.length,
      passed: results.filter((result) => result.status === 'pass').length,
      failed: results.filter((result) => result.status === 'fail').length,
      skipped: results.filter((result) => result.status === 'skip').length,
      errored: results.filter((result) => result.status === 'error').length,
      failOn,
      exitCode,
    },
    results,
  };
}

export function getAllDataHealthChecks(): DataHealthCheckDefinition[] {
  return [...DATA_HEALTH_CHECKS];
}

function shouldUseSsl(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);
    const host = url.hostname.toLowerCase();
    return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
  } catch {
    return true;
  }
}

function normalizePgConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return connectionString;
  }
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const key = match[1];
    if (process.env[key] !== undefined) continue;

    process.env[key] = stripEnvQuotes(match[2]);
  }
}

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

async function inspectAvailableRelations(client: Queryable): Promise<Set<string>> {
  const result = await client.query<{
    relation_name: string;
  }>(`
    SELECT table_schema || '.' || table_name AS relation_name
    FROM information_schema.tables
    WHERE table_type IN ('BASE TABLE', 'VIEW')
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    UNION
    SELECT sequence_schema || '.' || sequence_name AS relation_name
    FROM information_schema.sequences
    WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema');
  `);
  return new Set(result.rows.map((row) => row.relation_name));
}

function normalizeObservedCount(value: DataHealthSqlRow['observed_count']): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function shouldFail(severity: DataHealthSeverity, failOn: DataHealthSeverity): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK[failOn];
}
