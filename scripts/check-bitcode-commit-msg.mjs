#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const defaultQualityScript = path.join(defaultRepoRoot, 'scripts/run-bitcode-spec-quality.mjs');

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
 * @param {string} commitMessagePath
 * @returns {string}
 */
export function readCommitTitle(commitMessagePath) {
  return readFileSync(commitMessagePath, 'utf8').split('\n')[0].trim();
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
 * @param {{ commitMessagePath: string | null, repoRoot: string, qualityScript: string }} options
 */
export function runCommitMessageCheck({ commitMessagePath, repoRoot, qualityScript }) {
  if (!commitMessagePath) {
    throw new Error('A commit message file path is required.');
  }

  const commitTitle = readCommitTitle(commitMessagePath);
  assertAbbreviatedCommitCategoryLabel(commitTitle);
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
