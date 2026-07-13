
import * as path from 'path';
import * as fs from 'fs/promises';
import { log } from '@bitcode/logger';

// ---------------------------------------------------------------------------
// Optional child_process helper
// ---------------------------------------------------------------------------
// We rely on `child_process.exec` for some git/file-system helpers while
// running on the server.  The module is *not* available in browser builds, so
// we resolve it dynamically and fall back to a stub.  This keeps the shared
// utilities importable from both server- and client-side code without crashing
// the latter at initialisation time.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – dynamic require prevents bundlers from pulling Node core mods
let execAsync: (command: string) => Promise<{ stdout: string; stderr: string }>;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { exec } = require('child_process');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  execAsync = require('util').promisify(exec);
} catch {
  execAsync = async () => {
    throw new Error('child_process.exec is not available in this environment');
  };
}

const getGlobalContext = () => ({ rootDir: process.cwd() });

// FileOperation / DirectoryOperation primitives live in ./types (canonical).
import type { FileOperation, DirectoryOperation } from './types';
export type { FileOperation, DirectoryOperation };

/**
 * Converts any file path format to a complete absolute path
 * @param filePath - Path that could be:
 *   - Relative to repo root (e.g. "src/thing.py")
 *   - Partial absolute with tmp dir (e.g. "tmp/bitcode/repo/src/thing.py")
 * @returns Complete absolute path (e.g. "/home/user/tmp/bitcode/repo/src/thing.py")
 */
export function absolutifyPath(filePath: string): string {
  const repoPath = getGlobalContext().repoPath!;

  // Remove leading slash if present for consistency
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  // Convert Windows-style paths to POSIX
  const posixPath = cleanPath.replace(/\\/g, '/');

  // If path contains tmp, extract everything after that
  const repoRelativeRegex = /(?:tmp\/)?(.+)$/;
  const match = posixPath.match(repoRelativeRegex);
  const repoRelativePath = match ? match[1] : posixPath;

  // Join with the absolute repo path to get complete absolute path
  return path.resolve(repoPath, repoRelativePath);
}

/**
 * "Normalizes" file paths to be relative to repository root
 * @param filePath - The absolute file path to normalize
 * @returns Normalized *relative* path
 */
export function normalizeRepoPath(filePath: string): string {
  // Remove leading slash if present
  let normalized = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  // Convert Windows-style paths to POSIX
  normalized = normalized.replace(/\\/g, '/');

  // Remove any './' prefix
  normalized = normalized.replace(/^\.\//, '');

  // Handle '../' by resolving the path (but keep it relative)
  if (normalized.includes('../')) {
    normalized = path.relative('/', path.resolve('/', normalized));
  }

  return normalized;
}

/**
 * Verifies if a file exists with the correct extension
 * @param basePath Base repository path
 * @param filePathObj File path object or string
 * @returns Verified file path or null if not found
 */
export async function verifyFileWithExtension(
  basePath: string,
  filePathObj: { path: string } | string
): Promise<string | null> {
  try {
    if (!basePath || !filePathObj) {
      throw new Error('Base path and file path are required');
    }

    // Handle both string and object inputs
    const filePath = typeof filePathObj === 'string' ? filePathObj : filePathObj.path;
    if (!filePath) {
      throw new Error('Invalid file path');
    }

    // First try the exact path
    const exactPath = path.join(basePath, filePath);
    try {
      await fs.access(exactPath);
      return filePath;
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Get the base name without extension
    const parsedPath = path.parse(filePath);
    const baseWithoutExt = path.join(parsedPath.dir, parsedPath.name);

    // Common extension variations to check
    const extensionVariants = [
      parsedPath.ext, // Original extension
      '.js',
      '.cjs',
      '.mjs',
      '.ts',
      '.tsx',
      '.jsx',
    ];

    // Add config variants if needed
    if (parsedPath.name.includes('config')) {
      extensionVariants.push(
        '.config.js',
        '.config.cjs',
        '.config.mjs',
        '.config.ts'
      );
    }

    // Try each variant
    for (const ext of extensionVariants) {
      const testPath = baseWithoutExt + ext;
      const fullTestPath = path.join(basePath, testPath);

      try {
        await fs.access(fullTestPath);
        log('Found file variant', 'debug', {
          original: filePath,
          found: testPath
        });
        return testPath;
      } catch (error: any) {
        if (error.code !== 'ENOENT') throw error;
        continue;
      }
    }

    log('No file variant found', 'debug', {
      original: filePath,
      basePath,
      triedExtensions: extensionVariants
    });
    return null;

  } catch (error: any) {
    log('Error in verifyFileWithExtension', 'error', {
      error: error instanceof Error ? error.message : String(error),
      basePath,
      filePath: filePathObj
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lightweight FileTracker adapted from the former uapi implementation.
// ---------------------------------------------------------------------------

/**
 * Minimal in-memory file content cache that supports the operations still
 * required by the refactored pipeline packages.
 */
export class FileTracker {
  private readonly repoRoot: string;
  private readonly cache: Map<string, string> = new Map();

  /**
   * Operation log capturing every mutation requested by editing tools.  While
   * not yet fully utilised by the pipeline, keeping track of the changes is a
   * prerequisite for generating commit / PR diffs and – more importantly –
   * for being able to *rollback* to a previous repository state when a PTRR
   * step fails.
   */
  private readonly operations: FileOperation[] = [];

  constructor(repoPath: string) {
    this.repoRoot = path.resolve(repoPath);
  }

  /** Return UTF-8 content for a repo-relative file, cached after first read. */
  getFileContent(relPath: string): string {
    const normalized = relPath.replace(/^([./\\])+/, '').replace(/\\/g, '/');
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized) as string;
    }

    const abs = path.join(this.repoRoot, normalized);
    try {
      const content = require('fs').readFileSync(abs, 'utf8');
      this.cache.set(normalized, content);
      return content;
    } catch {
      return '';
    }
  }

  // -----------------------------------------------------------------------
  // Change tracking helpers (will be called by editing tools)
  // -----------------------------------------------------------------------

  /**
   * Record a file-level operation (create / modify / delete / rename). The
   * tracker itself does **not** apply the mutation – that is the
   * responsibility of higher-level editing utilities.  The sole purpose of
   * this helper is bookkeeping so that downstream phases (validation and
   * Finish delivery) can inspect the list and to allow snapshot/rollback.
   */
  track(op: FileOperation): void {
    this.operations.push({ ...op });
  }

  /**
   * Return a *copy* of the operation history to avoid accidental mutation by
   * callers.
   */
  getOperations(): FileOperation[] {
    return this.operations.map((o) => ({ ...o }));
  }

  /**
   * Lightweight textual diff – currently just JSON of operations.  This is a
   * placeholder until the real diffing logic is wired in.
   */
  getFileChanges(): string {
    if (!this.operations.length) return '';
    return JSON.stringify(this.operations, null, 2);
  }

  /**
   * Create a **deep** clone so that callers (e.g. the PTRR runner) can build
   * rollback snapshots.  When `deep === false` we keep the shallow-clone behaviour
   * (fresh tracker with empty state) to avoid surprises in existing code that
   * relied on the old semantics.
   */
  clone(deep = false): FileTracker {
    const cloned = new FileTracker(this.repoRoot);

    if (deep) {
      // Copy cached file contents
      for (const [k, v] of this.cache.entries()) {
        (cloned.cache as Map<string, string>).set(k, v);
      }

      // Copy operations log
      (cloned.operations as FileOperation[]).push(...this.operations.map((o) => ({ ...o })));
    }

    return cloned;
  }
}

// ---------------------------------------------------------------------------
// Misc helpers adapted from the former codebase.
// ---------------------------------------------------------------------------

/** Recursively list *relative* file paths for a repository directory. */
export async function getAllFiles(rootDir: string): Promise<string[]> {
  const paths: string[] = [];
  const { readdir, stat } = await import('fs/promises');

  async function walk(current: string) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        paths.push(path.relative(rootDir, full));
      }
    }
  }

  try {
    await walk(rootDir);
  } catch {
    /* ignore IO errors – best-effort list */
  }

  return paths;
}

/** Quick-and-dirty explicit path extractor for agent prompts. */
export function extractExplicitFileReferences(text: string, _cwd = ''): string[] {
  if (!text) return [];
  const pattern = /["'`](.{1,200}?\.[a-zA-Z0-9]{1,8})["'`]/g;
  const results = new Set<string>();
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = pattern.exec(text))) {
    const p = m[1].replace(/^\.\/?/, '').replace(/\\/g, '/');
    results.add(p);
  }
  return Array.from(results);
}

// Stable file-list alias for callers that use list-oriented wording.
export const listAllFiles = getAllFiles;
