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
      'Usage: node scripts/check-v30-gate10-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 10 generated artifacts, promotion workflow, local/staging proof posture, and post-promotion V30/V31 readiness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertJsonArtifact(failures, root, relativePath, requiredStrings) {
  assertCheck(failures, fileExists(root, relativePath), `Missing generated V30 artifact: ${relativePath}`);
  if (!fileExists(root, relativePath)) return;

  const content = read(root, relativePath);
  try {
    JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  for (const requiredString of requiredStrings) {
    assertCheck(failures, content.includes(requiredString), `${relativePath} must include ${requiredString}.`);
  }

  const forbiddenSecretShapes = [
    ['sb', 'secret__'].join('_'),
    ['sk', 'proj'].join('-'),
    ['bitcode', 'database', 'password'].join(''),
  ];
  for (const forbidden of forbiddenSecretShapes) {
    assertCheck(failures, !content.includes(forbidden), `${relativePath} must not contain secret-shaped value ${forbidden}.`);
  }
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
    args.promotionMode ? ['V29', 'V30'].includes(pointer) : pointer === 'V29',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V29 before V30 promotion or V30 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V29 during V30 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v30' || /^v30\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 10 work must occur on version/v30 or v30/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V30.md',
    'BITCODE_SPEC_V30_DELTA.md',
    'BITCODE_SPEC_V30_NOTES.md',
    'BITCODE_SPEC_V30_PARITY_MATRIX.md',
    'BITCODE_V30_QA.md',
    'scripts/check-v30-gate10-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v30-canon-promotion.yml',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/README.md',
    'package.json',
    'README.md',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 10 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V30.md');
  const delta = read(root, 'BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const qa = read(root, 'BITCODE_V30_QA.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v30-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const v21Specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');
  const packageCanonPosture = read(root, 'scripts/specifying/src/canon-posture.js');
  const packageState = read(root, 'scripts/specifying/data/state.json');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');

  assertCheck(failures, spec.includes('V30 local and staging promotion readiness canon'), 'V30 SPEC must define local/staging promotion readiness canon.');
  assertCheck(failures, delta.includes('Gate 10: V30 Promotion Readiness') && delta.includes('Closure acceptance'), 'V30 DELTA must define Gate 10 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 10 promotion-readiness notes') && notes.includes('staging-testnet readback'), 'V30 NOTES must carry Gate 10 promotion-readiness notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes('Gate 10 completion condition'), 'V30 PARITY must include Gate 10 parity and completion condition.');
  assertCheck(failures, qa.includes('Bitcode V30 QA Ledger') && qa.includes('Gate 10 Promotion Readiness QA'), 'V30 QA ledger must record Gate 10 promotion readiness.');

  assertCheck(
    failures,
    packageJson.includes('"check:v30-gate10"') && gateWorkflow.includes('check-v30-gate10-promotion-readiness.mjs'),
    'package.json and gate-quality workflow must run the Gate 10 checker.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('if [ "$POINTER" = "V29" ]') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V30" ]') &&
      gateWorkflow.includes('--version V30 --mode promoted') &&
      gateWorkflow.includes('check-v30-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'Gate-quality workflow must tolerate both V29-draft and V30-promoted branch states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('elif [ "$POINTER" = "V30" ]') &&
      canonWorkflow.includes('--active-canon V30 --draft-target V31'),
    'Canon-quality workflow must validate V30/V31 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v30'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V30') &&
      promotionWorkflow.includes('BITCODE_SPEC_V30_PROVEN.md') &&
      promotionWorkflow.includes('.bitcode') &&
      promotionWorkflow.includes('Promote V30 canon files'),
    'V30 promotion workflow must validate version/v30 and commit V30 promotion artifacts.',
  );

  for (const gateCheck of [
    'check-v30-gate1-roadmap-and-gating.mjs',
    'check-v30-gate2-protocol-package-api-boundaries.mjs',
    'check-v30-gate3-bitcoin-taproot-psbt-fee-rigor.mjs',
    'check-v30-gate4-btd-assetpack-mint-read-receipts.mjs',
    'check-v30-gate5-testnet-ledger-projection-hardening.mjs',
    'check-v30-gate6-source-to-shares-proof-cleanup.mjs',
    'check-v30-gate7-bridge-readiness-research-boundaries.mjs',
    'check-v30-gate8-protocol-telemetry-proof-hooks.mjs',
    'check-v30-gate9-interface-integration-regression-proof.mjs',
    'check-v30-gate10-promotion-readiness.mjs',
  ]) {
    assertCheck(failures, promoteScript.includes(gateCheck), `Promotion script must run ${gateCheck}.`);
    assertCheck(failures, promotionWorkflow.includes(gateCheck), `V30 promotion workflow must run ${gateCheck}.`);
  }

  assertCheck(
    failures,
    promoteScript.includes("const v30DraftSpecCheckCommand") &&
      promoteScript.includes("const v30Gate10Command") &&
      promoteScript.includes("if (version === 'V30')") &&
      promoteScript.includes('buildDerivedV30CommitMessageBody') &&
      promoteScript.includes("scripts/check-v30-gate10-promotion-readiness.mjs"),
    'Canonical promotion script must support V30 command planning and commit body generation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V30')") &&
      prepareSpecScript.includes('V30 canonical system specification for Protocol/BTD') &&
      prepareSpecScript.includes('BITCODE_SPEC_V30_PROVEN.md') &&
      prepareSpecScript.includes('v30-protocol-telemetry-proof-hooks.json') &&
      prepareSpecScript.includes('rewritePromotedParityJudgments'),
    'Spec-family promotion preparation must rewrite V30 hand-authored status truth and promoted parity judgments.',
  );
  assertCheck(
    failures,
    prepareRuntimeScript.includes("'packages', 'protocol', 'src', 'canon-posture.js'") &&
      prepareRuntimeScript.includes("'packages', 'protocol', 'data', 'state.json'") &&
      prepareRuntimeScript.includes('rewriteRuntimeDataState'),
    'Runtime promotion preparation must update commercial package posture and package data.',
  );
  assertCheck(
    failures,
    provenGenerator.includes('buildV30ProvenPackage') &&
      provenGenerator.includes('v30-protocol-telemetry-proof-hooks') &&
      v21Specifying.includes('.bitcode/v30-canon-posture-drift-report.json') &&
      v21Specifying.includes('.bitcode/v30-protocol-telemetry-proof-hooks.json'),
    'Generated appendix support must include V30 proof artifacts.',
  );

  const expectedActiveCanon = pointer === 'V30' ? 'V30' : 'V29';
  const expectedDraftTarget = pointer === 'V30' ? 'V31' : 'V30';
  const expectedProtocolReadmePosture =
    pointer === 'V30' ? 'V30` active, `V31` draft after V30 promotion' : 'V29` active, `V30` draft';

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
    rootReadme.includes('check:v30-gate10') && rootReadme.includes('v30-canon-promotion.yml'),
    'README must document the Gate 10 command and V30 promotion workflow.',
  );

  assertJsonArtifact(failures, root, '.bitcode/v30-spec-family-report.json', ['"version": "V30"', '"reportId": "v30-spec-family-report"']);
  assertJsonArtifact(failures, root, '.bitcode/v30-canonical-input-report.json', ['"checkedTargetVersion": "V30"', 'v30-protocol-telemetry-proof-hooks.json']);
  assertJsonArtifact(failures, root, '.bitcode/v30-canon-posture-drift-report.json', ['"checkedActiveCanonVersion": "V30"', '"checkedDraftTargetVersion": "V31"']);
  assertJsonArtifact(failures, root, '.bitcode/v30-protocol-telemetry-proof-hooks.json', ['"reportId": "v30-protocol-telemetry-proof-hooks"', '"sourceSafe": true']);

  if (fileExists(root, 'BITCODE_SPEC_V30_PROVEN.md')) {
    const proven = read(root, 'BITCODE_SPEC_V30_PROVEN.md');
    assertCheck(failures, proven.includes('Bitcode Spec V30') || proven.includes('V30'), 'BITCODE_SPEC_V30_PROVEN.md must render V30 proof content.');
  }

  if (failures.length) {
    process.stderr.write('V30 Gate 10 promotion readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V30 Gate 10 promotion readiness check passed promotionMode=${args.promotionMode ? 'true' : 'false'} pointer=${pointer}\n`,
  );
}

main();
