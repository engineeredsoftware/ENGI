#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    promotionMode: false,
    skipBranchCheck: false,
    repoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--promotion-mode') args.promotionMode = true;
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v29-gate10-local-staging-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 10 local/staging validation and canonical promotion readiness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    args.promotionMode ? ['V28', 'V29'].includes(pointer) : pointer === 'V28',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V28 before V29 promotion or V29 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V28 during V29 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 10 work must occur on version/v29 or v29/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V29.md',
    'BITCODE_SPEC_V29_DELTA.md',
    'BITCODE_SPEC_V29_NOTES.md',
    'BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'BITCODE_V29_QA.md',
    'scripts/check-v29-gate10-local-staging-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v29-canon-promotion.yml',
    'packages/specifying/src/canon-posture.js',
    'packages/specifying/data/state.json',
    'packages/specifying/README.md',
    'protocol-demonstration/src/canon-posture.js',
    'protocol-demonstration/README.md',
    'package.json',
    'README.md',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 10 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V29.md');
  const delta = read(root, 'BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const qa = read(root, 'BITCODE_V29_QA.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v29-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const packageCanonPosture = read(root, 'packages/specifying/src/canon-posture.js');
  const packageState = read(root, 'packages/specifying/data/state.json');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const rootReadme = read(root, 'README.md');

  assertCheck(failures, spec.includes('V29 local and staging promotion readiness canon'), 'V29 SPEC must define local/staging promotion readiness canon.');
  assertCheck(failures, delta.includes('Gate 10: Local And Staging Promotion Readiness') && delta.includes('Closure acceptance'), 'V29 DELTA must define Gate 10 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 10 working notes') && notes.includes('staging-testnet readback'), 'V29 NOTES must carry Gate 10 working notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes('Gate 10 completion condition'), 'V29 PARITY must include Gate 10 parity and completion condition.');
  assertCheck(failures, qa.includes('Bitcode V29 QA Ledger') && qa.includes('Gate 10 Local And Staging Promotion Readiness QA'), 'V29 QA ledger must record Gate 10 local/staging promotion readiness.');

  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate10"') && gateWorkflow.includes('check-v29-gate10-local-staging-promotion-readiness.mjs'),
    'package.json and gate-quality workflow must run the Gate 10 checker.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('if [ "$POINTER" = "V28" ]') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V29" ]') &&
      gateWorkflow.includes('--version V29 --mode promoted') &&
      gateWorkflow.includes('check-v29-gate10-local-staging-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'Gate-quality workflow must tolerate both V28-draft and V29-promoted branch states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('if [ "$POINTER" = "V28" ]') &&
      canonWorkflow.includes('elif [ "$POINTER" = "V29" ]') &&
      canonWorkflow.includes('--active-canon V29 --draft-target V30'),
    'Canon-quality workflow must validate both V28/V29 draft posture and V29/V30 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes('head.ref == \'version/v29\'') &&
      promotionWorkflow.includes('npm run promote:canon -- --version V29') &&
      promotionWorkflow.includes('BITCODE_SPEC_V29_PROVEN.md') &&
      promotionWorkflow.includes('packages/specifying/src/canon-posture.js') &&
      promotionWorkflow.includes('packages/specifying/data/state.json') &&
      promotionWorkflow.includes('packages/specifying/README.md') &&
      promotionWorkflow.includes('Promote V29 canon files'),
    'V29 promotion workflow must validate version/v29 and commit V29 promotion artifacts.',
  );

  assertCheck(
    failures,
    promoteScript.includes("const v29DraftSpecCheckCommand") &&
      promoteScript.includes("const v29Gate10Command") &&
      promoteScript.includes("if (version === 'V29')") &&
      promoteScript.includes("buildDerivedV29CommitMessageBody") &&
      promoteScript.includes("'V29'") &&
      promoteScript.includes("scripts/check-v29-gate10-local-staging-promotion-readiness.mjs"),
    'Canonical promotion script must support V29 command planning and commit body generation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V29')") &&
      prepareSpecScript.includes('V29 canonical system specification for Terminal transaction depth') &&
      prepareSpecScript.includes('BITCODE_SPEC_V29_PROVEN.md') &&
      prepareSpecScript.includes('rewritePromotedParityJudgments') &&
      prepareSpecScript.includes('implementation matrix') &&
      prepareSpecScript.includes('implementation checklist'),
    'Spec-family promotion preparation must rewrite V29 hand-authored status truth and promoted parity judgments.',
  );
  assertCheck(
    failures,
    prepareRuntimeScript.includes("'packages', 'protocol', 'src', 'canon-posture.js'") &&
      prepareRuntimeScript.includes("'packages', 'protocol', 'data', 'state.json'") &&
      prepareRuntimeScript.includes("'packages', 'protocol', 'README.md'") &&
      prepareRuntimeScript.includes('rewriteRuntimeDataState'),
    'Runtime promotion preparation must update commercial package posture, package data, and package README.',
  );

  const expectedActiveCanon = pointer === 'V29' ? 'V29' : 'V28';
  const expectedDraftTarget = pointer === 'V29' ? 'V30' : 'V29';
  const expectedProtocolReadmePosture =
    pointer === 'V29' ? 'V29` active, `V30` draft after V29 promotion' : 'V28` active, `V29` draft';

  assertCheck(
    failures,
    packageCanonPosture.includes(`ACTIVE_CANON_VERSION = '${expectedActiveCanon}'`) &&
      packageCanonPosture.includes(`DRAFT_TARGET_VERSION = '${expectedDraftTarget}'`) &&
      packageState.includes(`"activeCanonVersion": "${expectedActiveCanon}"`) &&
      packageState.includes(`"draftTargetVersion": "${expectedDraftTarget}"`) &&
      packageState.includes(`"activeProvenAppendixPath": "BITCODE_SPEC_${expectedActiveCanon}_PROVEN.md"`) &&
      packageState.includes(`"draftSpecPath": "BITCODE_SPEC_${expectedDraftTarget}.md"`),
    `Protocol package posture and seed state must be aligned to ${expectedActiveCanon} active / ${expectedDraftTarget} draft.`,
  );
  assertCheck(
    failures,
    protocolReadme.includes(expectedProtocolReadmePosture) && protocolReadme.includes('Gate 10'),
    `Protocol package README must name the ${expectedActiveCanon}/${expectedDraftTarget} posture and Gate 10 promotion boundary.`,
  );
  assertCheck(
    failures,
    rootReadme.includes('check:v29-gate10') && rootReadme.includes('v29-canon-promotion.yml'),
    'README must document the Gate 10 command and V29 promotion workflow.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 10 local/staging promotion readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V29 Gate 10 local/staging promotion readiness check passed promotionMode=${args.promotionMode ? 'true' : 'false'} pointer=${pointer}\n`,
  );
}

main();
