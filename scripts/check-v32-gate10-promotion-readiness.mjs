#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v32-promotion-readiness-report.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    promotionMode: false,
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot,
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
      'Usage: node scripts/check-v32-gate10-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 10 promotion readiness, V32 promotion workflow support, source-safe QA evidence, and pre/post-promotion posture handling.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertJsonArtifact(failures, root, relativePath, requiredStrings) {
  assertCheck(failures, fileExists(root, relativePath), `Missing generated V32 artifact: ${relativePath}`);
  if (!fileExists(root, relativePath)) return null;

  const content = read(root, relativePath);
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }

  for (const requiredString of requiredStrings) {
    assertCheck(failures, content.includes(requiredString), `${relativePath} must include ${requiredString}.`);
  }

  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !content.includes(marker), `${relativePath} must not contain secret-shaped value ${marker}.`);
  }
  return parsed;
}

function everyTokenPresent(entries) {
  return entries.every((entry) => entry.present === true && entry.requiredTokens.every((token) => token.present === true));
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
    args.promotionMode ? ['V31', 'V32'].includes(pointer) : pointer === 'V31',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V31 before V32 promotion or V32 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V31 during V32 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 Gate 10 work must occur on version/v32 or v32/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V32.md',
    'BITCODE_SPEC_V32_DELTA.md',
    'BITCODE_SPEC_V32_NOTES.md',
    'BITCODE_SPEC_V32_PARITY_MATRIX.md',
    'BITCODE_V32_QA.md',
    ARTIFACT,
    'scripts/generate-v32-promotion-readiness-report.mjs',
    'scripts/check-v32-gate10-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v32-canon-promotion.yml',
    'packages/specifying/src/canon-posture.js',
    'packages/specifying/data/state.json',
    'packages/specifying/README.md',
    'packages/specifying/src/canonical/proven-generator.js',
    'packages/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    'SPECIFICATIONS_ROADMAP.md',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0 && pointer === 'V31') {
    try {
      run(root, 'pnpm', ['run', 'check:v32-promotion-readiness']);
    } catch (error) {
      failures.push(`V32 Gate 10 promotion readiness artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const spec = read(root, 'BITCODE_SPEC_V32.md');
  const delta = read(root, 'BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const qa = read(root, 'BITCODE_V32_QA.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v32-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'packages/specifying/src/canonical/proven-generator.js');
  const v21Specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');
  const packageCanonPosture = read(root, 'packages/specifying/src/canon-posture.js');
  const packageState = read(root, 'packages/specifying/data/state.json');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V32 local and staging promotion readiness canon'), 'V32 SPEC must define local/staging promotion readiness canon.');
  assertCheck(failures, delta.includes('Gate 10: V32 Promotion Readiness') && delta.includes(ARTIFACT), 'V32 DELTA must define Gate 10 closure acceptance and artifact.');
  assertCheck(failures, notes.includes('Gate 10: V32 Promotion Readiness') && notes.includes('active V32 / draft V33'), 'V32 NOTES must carry Gate 10 post-promotion posture notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes(ARTIFACT), 'V32 PARITY must include Gate 10 artifact parity.');
  assertCheck(failures, qa.includes('Bitcode V32 QA Ledger') && qa.includes('Gate 10 Promotion Readiness QA'), 'V32 QA ledger must record Gate 10 promotion readiness.');
  assertCheck(
    failures,
    pointer === 'V32'
      ? /Current working gate: V33 Gate (?:[1-9]|10)\b/u.test(roadmap)
      : roadmap.includes('Current working gate: V32 Gate 10 Promotion Readiness'),
    pointer === 'V32'
      ? 'Roadmap must track a current V33 gate after V32 promotion.'
      : 'Roadmap must track V32 Gate 10 as current before V32 promotion.',
  );

  assertCheck(
    failures,
    packageJson.includes('"generate:v32-promotion-readiness"') &&
      packageJson.includes('"check:v32-promotion-readiness"') &&
      packageJson.includes('"check:v32-gate10"'),
    'package.json must expose V32 Gate 10 generator/check scripts.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('if [ "$POINTER" = "V31" ]') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V32" ]') &&
      gateWorkflow.includes('check-v32-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('--active-canon V32 --draft-target V33'),
    'Gate-quality workflow must tolerate both V31-draft and V32-promoted branch states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('elif [ "$POINTER" = "V32" ]') &&
      canonWorkflow.includes('--active-canon V32 --draft-target V33'),
    'Canon-quality workflow must validate V32/V33 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v32'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V32') &&
      promotionWorkflow.includes('BITCODE_SPEC_V32_PROVEN.md') &&
      promotionWorkflow.includes('.bitcode') &&
      promotionWorkflow.includes('Promote V32 canon files'),
    'V32 promotion workflow must validate version/v32 and commit V32 promotion artifacts.',
  );

  for (const gateCheck of [
    'check-v32-gate1-provation-roadmap-opening.mjs',
    'check-v32-gate2-proof-matrix-inventory.mjs',
    'check-v32-gate3-deterministic-replay-artifact-stability.mjs',
    'check-v32-gate4-reading-pipeline-proof-coverage.mjs',
    'check-v32-gate5-ledger-btd-settlement-failure-states.mjs',
    'check-v32-gate6-interface-contract-regression-suites.mjs',
    'check-v32-gate7-browser-accessibility-responsive-visual-proof.mjs',
    'check-v32-gate8-testnet-mainnet-readiness-rehearsal.mjs',
    'check-v32-gate9-promotion-proof-generation-hardening.mjs',
    'check-v32-gate10-promotion-readiness.mjs',
  ]) {
    assertCheck(failures, promoteScript.includes(gateCheck), `Promotion script must run ${gateCheck}.`);
    assertCheck(failures, promotionWorkflow.includes(gateCheck), `V32 promotion workflow must run ${gateCheck}.`);
  }

  assertCheck(
    failures,
    promoteScript.includes("const v32DraftSpecCheckCommand") &&
      promoteScript.includes("const v32Gate10Command") &&
      promoteScript.includes("if (version === 'V32')") &&
      promoteScript.includes('buildDerivedV32CommitMessageBody') &&
      promoteScript.includes("scripts/check-v32-gate10-promotion-readiness.mjs"),
    'Canonical promotion script must support V32 command planning and commit body generation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V32')") &&
      prepareSpecScript.includes('V32 canonical system specification for provation/testing') &&
      prepareSpecScript.includes('BITCODE_SPEC_V32_PROVEN.md') &&
      prepareSpecScript.includes('.bitcode/v32-promotion-readiness-report.json') &&
      prepareSpecScript.includes('rewritePromotedParityJudgments'),
    'Spec-family promotion preparation must rewrite V32 hand-authored status truth and promoted parity judgments.',
  );
  assertCheck(
    failures,
    prepareRuntimeScript.includes("'packages', 'protocol', 'src', 'canon-posture.js'") &&
      prepareRuntimeScript.includes("'packages', 'protocol', 'data', 'state.json'") &&
      prepareRuntimeScript.includes('rewriteRuntimeDataState') &&
      prepareRuntimeScript.includes('rewritePackageReadme'),
    'Runtime promotion preparation must update commercial package posture, package README, and package data.',
  );
  assertCheck(
    failures,
    provenGenerator.includes('buildV32ProvenPackage') &&
      provenGenerator.includes('buildV32PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT) &&
      v21Specifying.includes(ARTIFACT),
    'Generated appendix support must include the V32 promotion readiness artifact.',
  );

  const expectedActiveCanon = pointer === 'V32' ? 'V32' : 'V31';
  const expectedDraftTarget = pointer === 'V32' ? 'V33' : 'V32';

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
    protocolReadme.includes('V32 Gate 10') &&
      protocolReadme.includes(`${expectedActiveCanon}\` active, \`${expectedDraftTarget}\` draft`),
    `Protocol package README must name the ${expectedActiveCanon}/${expectedDraftTarget} posture and Gate 10 promotion boundary.`,
  );
  assertCheck(
    failures,
    rootReadme.includes('check:v32-gate10') && rootReadme.includes('v32-canon-promotion.yml'),
    'README must document the Gate 10 command and V32 promotion workflow.',
  );

  assertJsonArtifact(failures, root, '.bitcode/v32-proof-coverage-matrix.json', ['"artifactId": "v32-proof-coverage-matrix"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-deterministic-replay-report.json', ['"artifactId": "v32-deterministic-replay-report"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-reading-pipeline-proof-coverage.json', ['"artifactId": "v32-reading-pipeline-proof-coverage"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json', ['"artifactId": "v32-ledger-btd-settlement-failure-state-coverage"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-interface-contract-regression-suite.json', ['"artifactId": "v32-interface-contract-regression-suite"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-browser-accessibility-responsive-visual-proof.json', ['"artifactId": "v32-browser-accessibility-responsive-visual-proof"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-testnet-mainnet-readiness-rehearsal.json', ['"artifactId": "v32-testnet-mainnet-readiness-rehearsal"', '"version": "V32"']);
  assertJsonArtifact(failures, root, '.bitcode/v32-promotion-proof-generation-hardening.json', ['"artifactId": "v32-promotion-proof-generation-hardening"', '"version": "V32"']);
  const readinessArtifact = assertJsonArtifact(failures, root, ARTIFACT, ['v32-promotion-readiness-report', '"version": "V32"']);

  if (readinessArtifact) {
    const readinessId = readinessArtifact.artifactId || readinessArtifact.reportId;
    assertCheck(failures, readinessId === 'v32-promotion-readiness-report', 'Gate 10 promotion readiness artifact id must match.');
    assertCheck(failures, readinessArtifact.version === 'V32', 'Gate 10 promotion readiness artifact must bind V32.');
    assertCheck(failures, readinessArtifact.passed === true, 'Gate 10 promotion readiness artifact must pass.');
    assertCheck(failures, readinessArtifact.branchProtection?.directMainPushAdmitted === false, 'Gate 10 must not admit direct main pushes.');
    assertCheck(failures, readinessArtifact.branchProtection?.promotionPrRequired === true, 'Gate 10 must require promotion pull requests.');
    assertCheck(failures, readinessArtifact.generatedArtifactPolicy?.secretValuesSerialized === false, 'Gate 10 artifact must not serialize secret values.');
    assertCheck(failures, readinessArtifact.generatedArtifactPolicy?.protectedSourceSerialized === false, 'Gate 10 artifact must not serialize protected source.');
    if (readinessArtifact.sourceEvidence && readinessArtifact.documentationEvidence) {
      assertCheck(failures, everyTokenPresent(readinessArtifact.sourceEvidence), 'Gate 10 source evidence tokens must all be present.');
      assertCheck(failures, everyTokenPresent(readinessArtifact.documentationEvidence), 'Gate 10 documentation evidence tokens must all be present.');
    }
  }

  if (fileExists(root, 'BITCODE_SPEC_V32_PROVEN.md')) {
    const proven = read(root, 'BITCODE_SPEC_V32_PROVEN.md');
    assertCheck(failures, proven.includes('Bitcode Spec V32') || proven.includes('V32'), 'BITCODE_SPEC_V32_PROVEN.md must render V32 proof content.');
  }

  if (failures.length) {
    process.stderr.write('V32 Gate 10 promotion readiness check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(
    `V32 Gate 10 promotion readiness check passed promotionMode=${args.promotionMode ? 'true' : 'false'} pointer=${pointer}\n`,
  );
}

main();
