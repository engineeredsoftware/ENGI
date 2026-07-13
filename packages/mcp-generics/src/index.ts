/**
 * @bitcode/mcp-generics — MCP primitive contracts (product-neutral).
 *
 * Hierarchy:
 *   McpConfig / McpConfigSchema / validateMcpConfig   # this package
 *     → @bitcode/generic-mcps-bitcode                 # Bitcode Exchange-facing MCP server
 *
 * Full MCP tool definitions and the Exchange server live in generic-mcps/bitcode.
 * This package stays below that surface as reusable config + validation primitives.
 */

export interface McpConfig {
  id: string;
  type: string;
  config?: Record<string, unknown>;
}

interface McpConfigIssue {
  path: string[];
  message: string;
}

type McpConfigSafeParseResult =
  | { success: true; data: McpConfig }
  | { success: false; error: { issues: McpConfigIssue[] } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectMcpConfigIssues(input: unknown): McpConfigIssue[] {
  if (!isRecord(input)) {
    return [{ path: [], message: 'MCP config must be an object.' }];
  }

  const issues: McpConfigIssue[] = [];

  if (typeof input.id !== 'string' || input.id.trim().length === 0) {
    issues.push({ path: ['id'], message: 'id must be a non-empty string.' });
  }

  if (typeof input.type !== 'string' || input.type.trim().length === 0) {
    issues.push({ path: ['type'], message: 'type must be a non-empty string.' });
  }

  if (input.config !== undefined && !isRecord(input.config)) {
    issues.push({ path: ['config'], message: 'config must be a plain object when present.' });
  }

  return issues;
}

function normalizeMcpConfig(input: Record<string, unknown>): McpConfig {
  return {
    id: String(input.id),
    type: String(input.type),
    config: isRecord(input.config) ? input.config : undefined,
  };
}

export const McpConfigSchema = {
  parse(input: unknown): McpConfig {
    const result = this.safeParse(input);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(' ');
      throw new Error(message || 'Invalid MCP config.');
    }

    return result.data;
  },

  safeParse(input: unknown): McpConfigSafeParseResult {
    const issues = collectMcpConfigIssues(input);

    if (issues.length > 0) {
      return { success: false, error: { issues } };
    }

    return { success: true, data: normalizeMcpConfig(input as Record<string, unknown>) };
  },
} as const;

export function validateMcpConfig(config: unknown) {
  const result = McpConfigSchema.safeParse(config);

  if (result.success) {
    return { success: true, reasons: [] as string[] };
  }

  const { error } = result as Extract<McpConfigSafeParseResult, { success: false }>;
  return {
    success: false,
    reasons: error.issues.map((issue) =>
      issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
    ),
  };
}

export default McpConfigSchema;
