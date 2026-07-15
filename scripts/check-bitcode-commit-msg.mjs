#!/usr/bin/env node
/**
 * commit-msg hook body — Spec/Impl labels + 50/72 commit message law
 * (`.specifications/BITCODE_SPECIFYING.md` §2.8, `.docs/AGENTS.md`).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const defaultQualityScript = path.join(defaultRepoRoot, 'scripts/run-bitcode-spec-quality.mjs');

/** Soft subject limit — compact-log readability (50/72 law). */
export const COMMIT_SUBJECT_SOFT_MAX = 50;
/** Hard wrap for body lines (and absolute subject ceiling). */
export const COMMIT_BODY_LINE_MAX = 72;

/**
 * @param {string[]} argv
 * @returns {{ commitMessagePath: string | null, repoRoot: string, qualityScript: string }}
 */
export function parseArgs(argv) {
  let commitMessagePath = null;
  let repoRoot = defaultRepoRoot;
  let qualityScript = defaultQualityScript;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!commitMessagePath && !arg.startsWith('--')) commitMessagePath = arg;
    else if (arg === '--repo-root') repoRoot = path.resolve(argv[++index]);
    else if (arg === '--quality-script') qualityScript = path.resolve(argv[++index]);
    else throw new Error(`Unknown argument ${arg}`);
  }
  return { commitMessagePath, repoRoot, qualityScript };
}

/**
 * Strip comment lines (`# …`) from a commit-msg file payload.
 * @param {string} raw
 * @returns {string}
 */
export function stripCommitMessageComments(raw) {
  return raw
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .replace(/\s+$/u, '');
}

/**
 * @param {string} commitMessagePath
 * @returns {string}
 */
export function readCommitTitle(commitMessagePath) {
  const text = stripCommitMessageComments(readFileSync(commitMessagePath, 'utf8'));
  return text.split('\n')[0]?.trim() ?? '';
}

/**
 * @param {string} commitMessagePath
 * @returns {{ subject: string, bodyLines: string[] }}
 */
export function readCommitMessageParts(commitMessagePath) {
  const text = stripCommitMessageComments(readFileSync(commitMessagePath, 'utf8'));
  const lines = text.split('\n');
  const subject = (lines[0] ?? '').trimEnd();
  const bodyLines = lines.slice(1);
  return { subject, bodyLines };
}

/** Expanded forms are illegal in subjects; only abbreviated Spec/Impl labels. */
const ILLEGAL_COMMIT_CATEGORY_LABELS = [
  '(specification-only)',
  '(implementation-only)',
  '(specification-implementation)',
];

const LEGAL_COMMIT_CATEGORY_LABELS = ['(spec-only)', '(impl-only)', '(spec-impl)'];

/**
 * Enforce abbreviated Spec/Impl category labels in commit subjects
 * (`BITCODE_SPECIFYING.md` §2.8, `AGENTS.md`).
 *
 * @param {string} commitTitle
 */
export function assertAbbreviatedCommitCategoryLabel(commitTitle) {
  const lower = commitTitle.toLowerCase();
  for (const illegal of ILLEGAL_COMMIT_CATEGORY_LABELS) {
    if (lower.includes(illegal)) {
      throw new Error(
        `Commit subject uses illegal expanded category ${illegal}. ` +
          `Use only abbreviated Spec/Impl labels: ${LEGAL_COMMIT_CATEGORY_LABELS.join(', ')}. ` +
          `Example: V48 (impl-only): …`,
      );
    }
  }

  // When a V-version subject carries a category parenthetical, require a legal short form.
  const versionCategory = commitTitle.match(
    /^\s*V\d+(?:\s+Gate\s+\d+)?\s+(\([^)]+\))\s*:/iu,
  );
  if (versionCategory) {
    const label = versionCategory[1].toLowerCase();
    if (!LEGAL_COMMIT_CATEGORY_LABELS.includes(label)) {
      throw new Error(
        `Commit subject category ${versionCategory[1]} is not a legal Spec/Impl label. ` +
          `Use exactly one of: ${LEGAL_COMMIT_CATEGORY_LABELS.join(', ')}.`,
      );
    }
  }
}

/**
 * Enforce 50/72 commit message law (SPECIFYING §2.8).
 * - Subject ≤ 50 soft (warn); > 72 hard fail
 * - Blank line after subject when body content follows
 * - Each body line ≤ 72 hard fail
 *
 * @param {{ subject: string, bodyLines: string[] }} parts
 * @param {{ warn?: (message: string) => void }} [options]
 */
export function assertCommitMessageFiftySeventyTwo(parts, options = {}) {
  const warn = options.warn ?? ((message) => process.stderr.write(`${message}\n`));
  const subject = parts.subject ?? '';
  const subjectLen = subject.length;

  if (!subject.trim()) {
    throw new Error('Commit subject (first line) must not be empty.');
  }

  if (subjectLen > COMMIT_BODY_LINE_MAX) {
    throw new Error(
      `Commit subject is ${subjectLen} characters (hard max ${COMMIT_BODY_LINE_MAX}). ` +
        `Keep the first line ≤ ${COMMIT_SUBJECT_SOFT_MAX} (soft 50/72 law) and put detail in the body.`,
    );
  }

  if (subjectLen > COMMIT_SUBJECT_SOFT_MAX) {
    warn(
      `Bitcode 50/72: subject is ${subjectLen} characters (soft max ${COMMIT_SUBJECT_SOFT_MAX}). ` +
        `Prefer a shorter first line; put detail in the body (≤ ${COMMIT_BODY_LINE_MAX} per line).`,
    );
  }

  const bodyLines = parts.bodyLines ?? [];
  // Trailing empty lines after a body are fine; detect non-empty body content.
  const firstNonEmptyBodyIndex = bodyLines.findIndex((line) => line.trim().length > 0);
  if (firstNonEmptyBodyIndex === -1) {
    return;
  }

  // When a body follows, line immediately after the subject must be blank.
  if (bodyLines.length === 0 || bodyLines[0].trim().length > 0) {
    throw new Error(
      'Commit message 50/72 law: leave the second line completely empty to separate ' +
        'the subject from the body.',
    );
  }

  for (let index = 0; index < bodyLines.length; index += 1) {
    const line = bodyLines[index];
    if (line.length > COMMIT_BODY_LINE_MAX) {
      throw new Error(
        `Commit body line ${index + 2} is ${line.length} characters ` +
          `(hard max ${COMMIT_BODY_LINE_MAX} under 50/72 law). Wrap the body.`,
      );
    }
  }
}

/**
 * @param {{ commitMessagePath: string | null, repoRoot: string, qualityScript: string }} options
 */
export function runCommitMessageCheck({ commitMessagePath, repoRoot, qualityScript }) {
  if (!commitMessagePath) {
    throw new Error('A commit message file path is required.');
  }

  const parts = readCommitMessageParts(commitMessagePath);
  const commitTitle = parts.subject.trim();
  assertAbbreviatedCommitCategoryLabel(commitTitle);
  assertCommitMessageFiftySeventyTwo(parts);
  execFileSync(
    process.execPath,
    [
      qualityScript,
      '--mode',
      'strict-from-title',
      '--commit-title',
      commitTitle
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit'
    }
  );
}

function main() {
  runCommitMessageCheck(parseArgs(process.argv.slice(2)));
}

try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
  }
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
