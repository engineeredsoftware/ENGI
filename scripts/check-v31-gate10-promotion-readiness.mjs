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
      'Usage: node scripts/check-v31-gate10-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 10 generated artifacts, promotion workflow, Auxillaries proof posture, and post-promotion V31/V32 readiness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertJsonArtifact(failures, root, relativePath, requiredStrings) {
  assertCheck(failures, fileExists(root, relativePath), `Missing generated V31 artifact: ${relativePath}`);
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    args.promotionMode ? ['V30', 'V31'].includes(pointer) : pointer === 'V30',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V30 before V31 promotion or V31 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V30 during V31 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v31' || /^v31\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 10 work must occur on version/v31 or v31/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC_V31.md',
    'specifications/BITCODE_SPEC_V31_DELTA.md',
    'specifications/BITCODE_SPEC_V31_NOTES.md',
    'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'qa/BITCODE_V31_QA.md',
    'scripts/check-v31-gate10-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v31-canon-promotion.yml',
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

  const spec = read(root, 'specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const qa = read(root, 'qa/BITCODE_V31_QA.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v31-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const v21Specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');
  const packageCanonPosture = read(root, 'scripts/specifying/src/canon-posture.js');
  const packageState = read(root, 'scripts/specifying/data/state.json');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');

  assertCheck(failures, spec.includes('V31 local and staging promotion readiness canon'), 'V31 SPEC must define local/staging promotion readiness canon.');
  assertCheck(failures, delta.includes('Gate 10: V31 Promotion Readiness') && delta.includes('Closure acceptance'), 'V31 DELTA must define Gate 10 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 10 promotion-readiness notes') && notes.includes('staging-testnet readback'), 'V31 NOTES must carry Gate 10 promotion-readiness notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes('Gate 10 completion condition'), 'V31 PARITY must include Gate 10 parity and completion condition.');
  assertCheck(failures, qa.includes('Bitcode V31 QA Ledger') && qa.includes('Gate 10 Promotion Readiness QA'), 'V31 QA ledger must record Gate 10 promotion readiness.');

  assertCheck(
    failures,
    packageJson.includes('"check:v31-gate10"') && gateWorkflow.includes('check-v31-gate10-promotion-readiness.mjs'),
    'package.json and gate-quality workflow must run the Gate 10 checker.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('if [ "$POINTER" = "V30" ]') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V31" ]') &&
      gateWorkflow.includes('--version V31 --mode promoted') &&
      gateWorkflow.includes('check-v31-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'Gate-quality workflow must tolerate both V30-draft and V31-promoted branch states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('elif [ "$POINTER" = "V31" ]') &&
      canonWorkflow.includes('--active-canon V31 --draft-target V32'),
    'Canon-quality workflow must validate V31/V32 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v31'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V31') &&
      promotionWorkflow.includes('specifications/BITCODE_SPEC_V31_PROVEN.md') &&
      promotionWorkflow.includes('.bitcode') &&
      promotionWorkflow.includes('Promote V31 canon files'),
    'V31 promotion workflow must validate version/v31 and commit V31 promotion artifacts.',
  );

  for (const gateCheck of [
    'check-v31-gate1-spec-roadmap-opening.mjs',
    'check-v31-gate2-auxillaries-package-route-contracts.mjs',
    'check-v31-gate3-profile-account-state.mjs',
    'check-v31-gate4-connects-provider-readiness.mjs',
    'check-v31-gate5-wallet-btd-pane-readiness.mjs',
    'check-v31-gate6-organization-team-role-policy-authority.mjs',
    'check-v31-gate7-interfaces-pane-admission-cross-surface-contracts.mjs',
    'check-v31-gate8-auxillaries-ux-accessibility-responsive-proof.mjs',
    'check-v31-gate9-auxillaries-telemetry-proof-recovery-runs.mjs',
    'check-v31-gate10-promotion-readiness.mjs',
  ]) {
    assertCheck(failures, promoteScript.includes(gateCheck), `Promotion script must run ${gateCheck}.`);
    assertCheck(failures, promotionWorkflow.includes(gateCheck), `V31 promotion workflow must run ${gateCheck}.`);
  }

  assertCheck(
    failures,
    promoteScript.includes("const v31DraftSpecCheckCommand") &&
      promoteScript.includes("const v31Gate10Command") &&
      promoteScript.includes("if (version === 'V31')") &&
      promoteScript.includes('buildDerivedV31CommitMessageBody') &&
      promoteScript.includes("scripts/check-v31-gate10-promotion-readiness.mjs"),
    'Canonical promotion script must support V31 command planning and commit body generation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V31')") &&
      prepareSpecScript.includes('V31 canonical system specification for Auxillaries') &&
      prepareSpecScript.includes('specifications/BITCODE_SPEC_V31_PROVEN.md') &&
      prepareSpecScript.includes('v31-auxillaries-telemetry-proof-hooks.json') &&
      prepareSpecScript.includes('rewritePromotedParityJudgments'),
    'Spec-family promotion preparation must rewrite V31 hand-authored status truth and promoted parity judgments.',
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
    provenGenerator.includes('buildV31ProvenPackage') &&
      provenGenerator.includes('v31-auxillaries-telemetry-proof-hooks') &&
      v21Specifying.includes('.bitcode/v31-canon-posture-drift-report.json') &&
      v21Specifying.includes('.bitcode/v31-auxillaries-telemetry-proof-hooks.json'),
    'Generated appendix support must include V31 proof artifacts.',
  );

  const expectedActiveCanon = pointer === 'V31' ? 'V31' : 'V30';
  const expectedDraftTarget = pointer === 'V31' ? 'V32' : 'V31';
  const expectedProtocolReadmePosture =
    pointer === 'V31' ? 'V31` active, `V32` draft after V31 promotion' : 'V30` active, `V31` draft';

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
    rootReadme.includes('check:v31-gate10') && rootReadme.includes('v31-canon-promotion.yml'),
    'README must document the Gate 10 command and V31 promotion workflow.',
  );

  assertJsonArtifact(failures, root, '.bitcode/v31-spec-family-report.json', ['"version": "V31"', '"reportId": "v31-spec-family-report"']);
  assertJsonArtifact(failures, root, '.bitcode/v31-canonical-input-report.json', ['"checkedTargetVersion": "V31"', 'v31-auxillaries-telemetry-proof-hooks.json']);
  assertJsonArtifact(failures, root, '.bitcode/v31-canon-posture-drift-report.json', ['"checkedActiveCanonVersion": "V31"', '"checkedDraftTargetVersion": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v31-auxillaries-telemetry-proof-hooks.json', ['"reportId": "v31-auxillaries-telemetry-proof-hooks"', '"sourceSafe": true']);

  if (fileExists(root, 'specifications/BITCODE_SPEC_V31_PROVEN.md')) {
    const proven = read(root, 'specifications/BITCODE_SPEC_V31_PROVEN.md');
    assertCheck(failures, proven.includes('Bitcode Spec V31') || proven.includes('V31'), 'BITCODE_SPEC_V31_PROVEN.md must render V31 proof content.');
  }

  if (failures.length) {
    process.stderr.write('V31 Gate 10 promotion readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V31 Gate 10 promotion readiness check passed promotionMode=${args.promotionMode ? 'true' : 'false'} pointer=${pointer}\n`,
  );
}

main();
