#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{ promotionMode?: boolean, skipBranchCheck?: boolean, repoRoot?: string, help?: boolean }} */
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--promotion-mode') args.promotionMode = true;
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = argv[++index];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v28-metadevelopment-readiness.mjs [--promotion-mode] [--skip-branch-check]',
      '',
      'Checks V28 branch, commit, workflow, promotion, and carryforward-audit standards.'
    ].join('\n')
  );
}

/**
 * @param {string} root
 * @param {string} relativePath
 */
function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

/**
 * @param {string} root
 * @param {string} relativePath
 */
function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

/**
 * @param {string} root
 * @param {string[]} args
 */
function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

/**
 * @param {string[]} failures
 * @param {boolean} condition
 * @param {string} message
 */
function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

/**
 * @param {string} content
 * @param {string} sectionHeading
 */
function hasSection(content, sectionHeading) {
  const escaped = sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^#{2,6}\\s+${escaped}\\s*$`, 'm').test(content);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = path.resolve(args.repoRoot || repoRoot);
  /** @type {string[]} */
  const failures = [];
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();
  assertCheck(
    failures,
    args.promotionMode ? ['V27', 'V28'].includes(pointer) : pointer === 'V27',
    args.promotionMode
      ? `BITCODE_SPEC.txt must point to V27 before promotion or V28 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V27 during V28 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v28' || /^v28\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V28 work must occur on version/v28 or gate-prefixed branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const workflows = [
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/v28-canon-promotion.yml',
    '.github/workflows/ci.yml'
  ];
  for (const workflowPath of workflows) {
    assertCheck(failures, fileExists(root, workflowPath), `Missing workflow ${workflowPath}.`);
  }
  assertCheck(failures, !fileExists(root, '.github/workflows/ga1.yml'), 'Legacy .github/workflows/ga1.yml must stay removed.');

  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  assertCheck(failures, gateWorkflow.includes('"v*/gate-*"'), 'Gate workflow must run on v*/gate-* branches.');
  assertCheck(failures, gateWorkflow.includes('"version/**"'), 'Gate workflow must run for version branch pull requests.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v28-metadevelopment-readiness.mjs'),
    'Gate workflow must run the V28 metadevelopment readiness check.',
  );

  const promotionWorkflow = read(root, '.github/workflows/v28-canon-promotion.yml');
  assertCheck(failures, promotionWorkflow.includes('head.ref == \'version/v28\''), 'V28 promotion workflow must only promote version/v28 PRs into main.');
  assertCheck(failures, promotionWorkflow.includes('npm run promote:canon -- --version V28'), 'V28 promotion workflow must use the canonical promotion script.');
  assertCheck(failures, promotionWorkflow.includes('specifications/BITCODE_SPEC_V28_PROVEN.md'), 'V28 promotion workflow must commit the generated PROVEN appendix.');
  assertCheck(failures, promotionWorkflow.includes('check-v28-metadevelopment-readiness.mjs --promotion-mode'), 'V28 promotion workflow must run metadevelopment readiness in promotion mode.');

  const readme = read(root, 'README.md');
  assertCheck(failures, readme.includes('version/v28'), 'README must document version/v28 branch workflow.');
  assertCheck(failures, readme.includes('v28/gate-8-promotion-proof'), 'README must document gate-numbered branch examples.');
  assertCheck(failures, /quality commit messages/i.test(readme), 'README must document quality commit-message expectations.');

  const agents = read(root, 'AGENTS.md');
  assertCheck(failures, agents.includes('version/v28'), 'AGENTS.md must document version base branches.');
  assertCheck(failures, /gate branches (?:are|must be) prefixed with the gate number/i.test(agents), 'AGENTS.md must document gate-number-prefixed branches.');
  assertCheck(failures, /promotion workflow health/i.test(agents), 'AGENTS.md must treat promotion workflow health as gate closure work.');

  const spec = read(root, 'specifications/BITCODE_SPEC_V28.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V28_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V28_PARITY_MATRIX.md');
  assertCheck(failures, hasSection(spec, 'Gate 8: V28 Metadevelopment And Promotion Proof'), 'V28 SPEC must define Gate 8 as metadevelopment and promotion proof.');
  assertCheck(failures, hasSection(notes, 'Gate 8 metadevelopment closure notes'), 'V28 NOTES must carry Gate 8 metadevelopment closure notes.');
  assertCheck(failures, hasSection(parity, 'V28 Metadevelopment Parity Matrix'), 'V28 PARITY must carry the metadevelopment parity matrix.');
  assertCheck(failures, hasSection(parity, 'V28 Product-Gate Carryforward Audit'), 'V28 PARITY must carry the product-gate carryforward audit.');

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  const interfacePane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx');
  assertCheck(failures, !interfacePane.includes('GlobalModelSelection'), 'Active Interfaces pane must not expose broad global model selection.');
  assertCheck(failures, interfacePane.includes('ledgerizedPipelineModels'), 'Active Interfaces pane must persist deterministic ledgerized model posture.');

  if (failures.length > 0) {
    process.stderr.write('V28 metadevelopment readiness failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    [
      'V28 metadevelopment readiness ok',
      `pointer=${pointer}`,
      `promotionMode=${args.promotionMode ? 'true' : 'false'}`
    ].join(' ')
  );
  process.stdout.write('\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
