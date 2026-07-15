#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ACTIVE_CANON_VERSION, DRAFT_TARGET_VERSION } from '../scripts/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function projectLabel(version) {
  return 'Bitcode';
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{ mode?: string, version?: string, commitTitle?: string, repoRoot?: string, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--mode') args.mode = argv[++index];
    else if (arg === '--version') args.version = argv[++index];
    else if (arg === '--commit-title') args.commitTitle = argv[++index];
    else if (arg === '--repo-root') args.repoRoot = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/run-bitcode-spec-quality.mjs [options]',
      '',
      'Options:',
      '  --mode <basic|strict-version|strict-from-title>   Quality check mode. Defaults to basic.',
      '  --version <VN>                                    Version for strict-version mode.',
      '  --commit-title <title>                            Commit title for strict-from-title mode.',
      '  --repo-root <path>                                Override repo root.',
      '  --help                                            Show this help.'
    ].join('\n')
  );
}

/**
 * @param {string} cwd
 * @param {string} label
 * @param {string[]} args
 */
function runNode(cwd, label, args) {
  process.stdout.write(`${projectLabel(ACTIVE_CANON_VERSION)} spec quality: ${label}\n`);
  execFileSync(process.execPath, args, {
    cwd,
    stdio: 'inherit'
  });
}

/**
 * V27 predates the appendix-grade spec-family checker shape that V28 now uses
 * for draft and promotion validation. Keep V27 guarded by canonical-input and
 * posture checks until V28's promotion workflow advances the active canon.
 *
 * @param {string} version
 */
function requiresPromotedSpecFamilyCheck(version) {
  return version !== 'V27';
}

/**
 * @param {string} cwd
 * @param {string} version
 */
function runStrictVersionChecks(cwd, version) {
  if (version === ACTIVE_CANON_VERSION) {
    if (requiresPromotedSpecFamilyCheck(version)) {
      runNode(cwd, `${version} promoted spec-family`, [
        path.join(cwd, 'scripts/check-bitcode-spec-family.mjs'),
        '--version',
        version,
        '--mode',
        'promoted'
      ]);
    } else {
      runNode(cwd, `${version} active canonical inputs`, [
        path.join(cwd, 'scripts/check-bitcode-canonical-inputs.mjs'),
        '--current-target',
        version
      ]);
    }
    return;
  }

  if (version === DRAFT_TARGET_VERSION) {
    const draftSpecPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${version}.md`);
    const draftDeltaPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${version}_DELTA.md`);
    const draftParityPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${version}_PARITY_MATRIX.md`);
    const draftNotesPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${version}_NOTES.md`);
    const hasFullDraftFamily = existsSync(draftSpecPath) && existsSync(draftDeltaPath) && existsSync(draftParityPath);
    if (hasFullDraftFamily) {
      runNode(cwd, `${version} draft spec-family`, [
        path.join(cwd, 'scripts/check-bitcode-spec-family.mjs'),
        '--version',
        version,
        '--mode',
        'draft',
        '--current-target',
        ACTIVE_CANON_VERSION
      ]);
      return;
    }

    if (existsSync(draftNotesPath)) {
      runNode(cwd, `${version} draft notes`, [
        path.join(cwd, 'scripts/check-bitcode-draft-notes.mjs'),
        '--version',
        version,
        '--current-target',
        ACTIVE_CANON_VERSION
      ]);
      return;
    }

    throw new Error(
      `Current draft target ${version} has neither a full draft family nor a notes-only opening. Expected one of BITCODE_SPEC_${version}.md + companions or BITCODE_SPEC_${version}_NOTES.md.`
    );
  }

  throw new Error(
    `Strict spec-quality mode only supports the active canon (${ACTIVE_CANON_VERSION}) or current draft target (${DRAFT_TARGET_VERSION}). Received ${version}.`
  );
}

/**
 * @param {string} cwd
 */
function runBasicChecks(cwd) {
  runNode(cwd, `${ACTIVE_CANON_VERSION} promoted canonical inputs`, [
    path.join(cwd, 'scripts/check-bitcode-canonical-inputs.mjs'),
    '--current-target',
    ACTIVE_CANON_VERSION
  ]);
  runNode(cwd, `${ACTIVE_CANON_VERSION}/${DRAFT_TARGET_VERSION} canon posture drift`, [
    path.join(cwd, 'scripts/check-bitcode-canon-posture-drift.mjs'),
    '--active-canon',
    ACTIVE_CANON_VERSION,
    '--draft-target',
    DRAFT_TARGET_VERSION
  ]);
  if (requiresPromotedSpecFamilyCheck(ACTIVE_CANON_VERSION)) {
    runNode(cwd, `${ACTIVE_CANON_VERSION} promoted spec-family`, [
      path.join(cwd, 'scripts/check-bitcode-spec-family.mjs'),
      '--version',
      ACTIVE_CANON_VERSION,
      '--mode',
      'promoted'
    ]);
  }
  const draftSpecPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${DRAFT_TARGET_VERSION}.md`);
  const draftDeltaPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${DRAFT_TARGET_VERSION}_DELTA.md`);
  const draftParityPath = path.join(cwd, '.specifications', `BITCODE_SPEC_${DRAFT_TARGET_VERSION}_PARITY_MATRIX.md`);
  if (existsSync(draftSpecPath) && existsSync(draftDeltaPath) && existsSync(draftParityPath)) {
    runNode(cwd, `${DRAFT_TARGET_VERSION} draft spec-family`, [
      path.join(cwd, 'scripts/check-bitcode-spec-family.mjs'),
      '--version',
      DRAFT_TARGET_VERSION,
      '--mode',
      'draft',
      '--current-target',
      ACTIVE_CANON_VERSION
    ]);
  }
  // V48: protocol-demonstration removed. Specifying package owns commercial
  // canon-posture / package-boundary proofs (not a separate demo tree).
  runNode(cwd, 'specifying package boundary and promotion posture tests', [
    '--test',
    path.join(cwd, 'scripts/specifying/test/specifying-package-boundary.test.js'),
    path.join(cwd, 'scripts/specifying/test/spec-family-promotion-posture.test.js')
  ]);
}

/**
 * @param {string} title
 */
function extractSpecVersionFromTitle(title) {
  const firstLine = title.split('\n')[0].trim();
  const match = firstLine.match(/^spec:\s*(V\d+)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const mode = args.mode || 'basic';
  const resolvedRepoRoot = path.resolve(args.repoRoot || repoRoot);

  if (mode === 'basic') {
    runBasicChecks(resolvedRepoRoot);
    process.stdout.write(`${projectLabel(ACTIVE_CANON_VERSION)} spec quality ok (basic)\n`);
    return;
  }

  if (mode === 'strict-version') {
    if (!args.version) throw new Error('strict-version mode requires --version <VN>.');
    runBasicChecks(resolvedRepoRoot);
    runStrictVersionChecks(resolvedRepoRoot, args.version.toUpperCase());
    process.stdout.write(`${projectLabel(args.version)} spec quality ok (strict-version ${args.version.toUpperCase()})\n`);
    return;
  }

  if (mode === 'strict-from-title') {
    const version = extractSpecVersionFromTitle(args.commitTitle || '');
    if (!version) {
      process.stdout.write(`${projectLabel(ACTIVE_CANON_VERSION)} spec quality skipped strict commit-title checks; title is not a \`spec: VN\` commit.\n`);
      return;
    }
    runBasicChecks(resolvedRepoRoot);
    runStrictVersionChecks(resolvedRepoRoot, version);
    process.stdout.write(`${projectLabel(version)} spec quality ok (strict-from-title ${version})\n`);
    return;
  }

  throw new Error(`Unsupported mode ${mode}. Expected basic, strict-version, or strict-from-title.`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
