// Retained grep-backed primitive for Bitcode repository-evidence search support.

// Server-side only helper – ensure this file never ends up in the browser
import 'server-only';

import { exec } from 'child_process';
import * as path from 'path';

/**
 * Line-level repository evidence returned by a grep search.
 */
export interface GrepMatch {
  file: string;
  line: number;
  text: string;
}

/**
 * Executes bounded recursive grep search starting from `cwd` (defaults to the process root).
 * Callers use this as evidence collection for read measurement and asset-pack context,
 * not as an independent product or inference owner.
 */
export async function simpleSystemTextSearch(params: {
  pattern: string | string[];
  cwd?: string;
  maxResults?: number;
  ignoreCase?: boolean;
}): Promise<GrepMatch[]> {
  const { pattern, cwd = process.cwd(), maxResults = 100, ignoreCase = false } = params;

  const absCwd = path.resolve(cwd);

  const patterns: string = Array.isArray(pattern) ? pattern.join('|') : pattern;
  const escapedPattern = patterns.replace(/'/g, "'\\''");

  const grepArgs = [
    'grep',
    '-R',
    '-n',
    '-I',
    '--no-color',
    '--exclude-dir=.git',
    ignoreCase ? '-i' : undefined,
    '-E',
    `'${escapedPattern}'`,
    '.'
  ]
    .filter(Boolean)
    .join(' ');

  const cmd = grepArgs;

  return new Promise<GrepMatch[]>((resolve) => {
    exec(cmd, { cwd: absCwd, maxBuffer: 10 * 1024 * 1024 }, (error, stdout) => {
      if (error && (error as any).code !== 1) {
        resolve([]);
        return;
      }

      const lines = stdout.split('\n').filter(Boolean);
      const matches: GrepMatch[] = [];
      for (const line of lines) {
        const firstColon = line.indexOf(':');
        const secondColon = line.indexOf(':', firstColon + 1);
        if (firstColon === -1 || secondColon === -1) continue;
        const file = line.slice(0, firstColon);
        const lineNumberRaw = line.slice(firstColon + 1, secondColon);
        const lineNumber = parseInt(lineNumberRaw, 10) - 1;
        const text = line.slice(secondColon + 1).trimEnd();
        matches.push({ file: path.relative(absCwd, path.resolve(absCwd, file)), line: lineNumber, text });
        if (matches.length >= maxResults) break;
      }
      resolve(matches);
    });
  });
}
