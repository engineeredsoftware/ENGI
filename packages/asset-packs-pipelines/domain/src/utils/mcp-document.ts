import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Tool } from '@bitcode/tools-generics';
import { log } from '@bitcode/logger';

const DOC_RELATIVE_PATH = path.join('.ai', 'MCPS.md');

export interface DocumentedMcp {
  name: string;
  slug: string;
  category?: string;
  bullets: string[];
  usage?: string;
  credentials?: string[];
  raw: string;
}

export interface LoadedMcpDocument {
  path: string;
  content: string;
  entries: DocumentedMcp[];
}

export interface RegisteredMcpTool {
  slug: string;
  exportName: string;
  registryKey: string;
}

export interface RegisterMcpToolsResult {
  registered: RegisteredMcpTool[];
  missing: string[];
}

const MCP_MODULE_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {
  aws: () => import('@bitcode/generic-tools-mcps-aws'),
  'aws-location': () => import('@bitcode/generic-tools-mcps-aws-location'),
  'aws-terraform': () => import('@bitcode/generic-tools-mcps-aws-terraform'),
  bitbucket: () => import('@bitcode/generic-tools-mcps-bitbucket'),
  circleci: () => import('@bitcode/generic-tools-mcps-circleci'),
  docker: () => import('@bitcode/generic-tools-mcps-docker'),
  figma: () => import('@bitcode/generic-tools-mcps-figma'),
  'git-repo-research': () => import('@bitcode/generic-tools-mcps-git-repo-research'),
  github: () => import('@bitcode/generic-tools-mcps-github'),
  gitlab: () => import('@bitcode/generic-tools-mcps-gitlab'),
  jira: () => import('@bitcode/generic-tools-mcps-jira'),
  kubernetes: () => import('@bitcode/generic-tools-mcps-kubernetes'),
  notion: () => import('@bitcode/generic-tools-mcps-notion'),
  postgresql: () => import('@bitcode/generic-tools-mcps-postgresql'),
  supabase: () => import('@bitcode/generic-tools-mcps-supabase'),
  vercel: () => import('@bitcode/generic-tools-mcps-vercel')
};

export async function loadMcpDocumentFromWorkspace(workspacePath?: string): Promise<LoadedMcpDocument | null> {
  const candidates = new Set<string>();
  if (workspacePath) {
    candidates.add(path.resolve(workspacePath, DOC_RELATIVE_PATH));
  }
  candidates.add(path.resolve(DOC_RELATIVE_PATH));

  for (const candidate of candidates) {
    try {
      const content = await fs.readFile(candidate, 'utf8');
      return {
        path: candidate,
        content,
        entries: parseMcpDocument(content)
      };
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        safeLog('warn', 'Failed to read MCP document', { candidate, error: error?.message || String(error) });
      }
    }
  }

  return null;
}

export function parseMcpDocument(content: string): DocumentedMcp[] {
  const lines = content.split(/\r?\n/);
  const entries: DocumentedMcp[] = [];
  let currentCategory: string | undefined;
  let current: DocumentedMcp | null = null;

  const finalizeCurrent = () => {
    if (current) {
      current.raw = current.raw.trimEnd();
      entries.push(current);
      current = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      if (current) current.raw += '\n';
      continue;
    }

    if (line.startsWith('### ')) {
      finalizeCurrent();
      currentCategory = line.slice(4).trim();
      continue;
    }

    const entryMatch = line.match(/^\*\*(.+?)\*\*/);
    if (entryMatch && entryMatch[1].trim().length > 0) {
      finalizeCurrent();
      const name = entryMatch[1].trim();
      current = {
        name,
        slug: slugify(name),
        category: currentCategory,
        bullets: [],
        raw: ''
      };
      continue;
    }

    if (!current) {
      continue;
    }

    current.raw += `${line}\n`;

    if (line.trimStart().startsWith('-')) {
      const bullet = line.replace(/^-+\s*/, '').trim();
      if (!bullet) continue;
      current.bullets.push(bullet);

      const usageMatch = bullet.match(/^\*?\*?Usage:?[\s-]*(.+)$/i);
      if (usageMatch && usageMatch[1]) {
        current.usage = usageMatch[1].trim();
      }

      if (/token|secret|key|credential/i.test(bullet)) {
        current.credentials = current.credentials || [];
        current.credentials.push(bullet);
      }
    }
  }

  finalizeCurrent();
  return entries;
}

export async function registerDocumentedMcpTools(execution: any, entries: DocumentedMcp[]): Promise<RegisterMcpToolsResult> {
  if (!execution?.tools?.registerTool) {
    return { registered: [], missing: [] };
  }

  const desiredSlugs = Array.from(new Set(entries.map((entry) => entry.slug).filter(Boolean)));
  const registered: RegisteredMcpTool[] = [];
  const missing: string[] = [];

  for (const slug of desiredSlugs) {
    const loader = MCP_MODULE_LOADERS[slug];
    if (!loader) {
      missing.push(slug);
      continue;
    }

    try {
      const moduleExports = await loader();
      const toolEntries = Object.entries(moduleExports).filter(([, value]) => value instanceof Tool);

      if (!toolEntries.length) {
        missing.push(slug);
        continue;
      }

      for (const [exportName, toolInstance] of toolEntries) {
        const registryKey = `mcp:${slug}:${exportName}`;
        try {
          execution.tools.registerTool(registryKey, toolInstance as Tool);
          registered.push({ slug, exportName, registryKey });
        } catch (error: any) {
          safeLog('warn', 'Failed to register MCP tool', { registryKey, error: error?.message || String(error) });
        }
      }
    } catch (error: any) {
      missing.push(slug);
      safeLog('warn', 'Failed to load MCP tools module', { slug, error: error?.message || String(error) });
    }
  }

  return { registered, missing };
}

export function entriesToEvidenceDocumentList(entries: DocumentedMcp[]): Array<{ title: string; content: string }> {
  return entries.map((entry) => ({
    title: entry.name,
    content: entry.raw.trim()
  }));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function safeLog(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>): void {
  try {
    log(message, level, context);
  } catch {
    // ignore logging failures
  }
}
