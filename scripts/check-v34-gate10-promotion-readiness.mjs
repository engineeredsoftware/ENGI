#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.proofs/v34/promotion-readiness-report.json';

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

const V34_GATE_ARTIFACTS = [
  '.proofs/v34/deployment-host-capability-catalog.json',
  '.proofs/v34/environment-lane-contracts.json',
  '.proofs/v34/distributed-execution-runtime-receipts.json',
  '.proofs/v34/deployment-storage-posture.json',
  '.proofs/v34/secret-rotation-boundary-operations.json',
  '.proofs/v34/migration-cicd-approval-gates.json',
  '.proofs/v34/runtime-observers-broadcasters-repair-jobs.json',
  '.proofs/v34/rollback-upgrade-data-repair-playbooks.json',
  '.proofs/v34/local-staging-testnet-deployment-rehearsal.json',
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
      'Usage: node scripts/check-v34-gate10-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 10 promotion readiness, V34 deployment artifacts, V34 promotion workflow support, and pre/post-promotion posture handling.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertJsonArtifact(failures, root, relativePath, requiredStrings) {
  assertCheck(failures, fileExists(root, relativePath), `Missing generated V34 artifact: ${relativePath}`);
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
  assertCheck(failures, !content.includes('protectedSourceBody'), `${relativePath} must not serialize protected source bodies.`);
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    args.promotionMode ? ['V33', 'V34'].includes(pointer) : pointer === 'V33',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V33 before V34 promotion or V34 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V33 during V34 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 10 work must occur on version/v34 or v34/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V34.md',
    '.specifications/BITCODE_SPEC_V34_DELTA.md',
    '.specifications/BITCODE_SPEC_V34_NOTES.md',
    '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
    ARTIFACT,
    'scripts/generate-v34-promotion-readiness-report.mjs',
    'scripts/check-v34-gate10-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v34-canon-promotion.yml',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/test/v34-promotion-readiness.test.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'packages/btd/src/deployment-promotion-readiness-report.ts',
    'packages/btd/__tests__/deployment-promotion-readiness-report.test.ts',
    'package.json',
    'README.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    ...V34_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0 && pointer === 'V33') {
    try {
      run(root, 'pnpm', ['run', 'check:v34-promotion-readiness']);
    } catch (error) {
      failures.push(`V34 Gate 10 promotion readiness artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v34-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const v21Specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');
  const packageCanonPosture = read(root, 'scripts/specifying/src/canon-posture.js');
  const packageState = read(root, 'scripts/specifying/data/state.json');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V34 promotion readiness canon'), 'V34 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT) && spec.includes('V34 active / V35 draft'), 'V34 SPEC must include Gate 10 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 10: V34 Promotion Readiness') && delta.includes(ARTIFACT), 'V34 DELTA must define Gate 10 closure acceptance and artifact.');
  assertCheck(failures, notes.includes('Gate 10: V34 Promotion Readiness') && notes.includes('active V34 / draft V35'), 'V34 NOTES must carry Gate 10 post-promotion posture notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes(ARTIFACT), 'V34 PARITY must include Gate 10 artifact parity.');
  assertCheck(
    failures,
    pointer === 'V34'
      ? /Current working gate: V34 Gate (?:[1-9]|10)\b/u.test(roadmap) ||
          /Current working gate: V35 Gate (?:[1-9]|10)\b/u.test(roadmap) ||
          roadmap.includes('Current draft target: `BITCODE_SPEC_V35') ||
          roadmap.includes('Current draft target: `BITCODE_SPEC_V34') ||
          roadmap.includes('Current working gate: V34 Gate 10 Promotion Readiness')
      : roadmap.includes('Current working gate: V34 Gate 10 Promotion Readiness'),
    pointer === 'V34'
      ? 'Roadmap must track V35 draft work after V34 promotion or retain just-promoted V34 Gate 10 closure until V34 opens.'
      : 'Roadmap must track V34 Gate 10 as current before V34 promotion.',
  );

  assertCheck(
    failures,
    packageJson.includes('"generate:v34-promotion-readiness"') &&
      packageJson.includes('"check:v34-promotion-readiness"') &&
      packageJson.includes('"check:v34-gate10"'),
    'package.json must expose V34 Gate 10 generator/check scripts.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('if [ "$POINTER" = "V33" ]') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V34" ]') &&
      gateWorkflow.includes('check-v34-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('--active-canon V34 --draft-target V35'),
    'Gate-quality workflow must tolerate both V33-draft and V34-promoted branch states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('elif [ "$POINTER" = "V34" ]') &&
      canonWorkflow.includes('--active-canon V34 --draft-target V35'),
    'Canon-quality workflow must validate V34/V35 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v34'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V34') &&
      promotionWorkflow.includes('.specifications/BITCODE_SPEC_V34_PROVEN.md') &&
      promotionWorkflow.includes('.proofs') &&
      promotionWorkflow.includes('Promote V34 canon files'),
    'V34 promotion workflow must validate version/v34 and commit V34 promotion artifacts.',
  );

  for (const gateCheck of [
    'check-v34-gate1-deployment-roadmap-opening.mjs',
    'check-v34-gate2-host-capability-environment-lanes.mjs',
    'check-v34-gate3-distributed-execution-runtime-contracts.mjs',
    'check-v34-gate4-deployment-storage-posture.mjs',
    'check-v34-gate5-secret-rotation-boundary-operations.mjs',
    'check-v34-gate6-migration-cicd-approval-gates.mjs',
    'check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs',
    'check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs',
    'check-v34-gate9-local-staging-testnet-deployment-rehearsal.mjs',
    'check-v34-gate10-promotion-readiness.mjs',
  ]) {
    assertCheck(failures, promoteScript.includes(gateCheck), `Promotion script must run ${gateCheck}.`);
    assertCheck(failures, promotionWorkflow.includes(gateCheck), `V34 promotion workflow must run ${gateCheck}.`);
  }

  assertCheck(
    failures,
    promoteScript.includes("const v34DraftSpecCheckCommand") &&
      promoteScript.includes("const v34Gate10Command") &&
      promoteScript.includes("if (version === 'V34')") &&
      promoteScript.includes('buildDerivedV34CommitMessageBody') &&
      promoteScript.includes("scripts/check-v34-gate10-promotion-readiness.mjs"),
    'Canonical promotion script must support V34 command planning and commit body generation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V34')") &&
      prepareSpecScript.includes('V34 canonical system specification for deployment depth') &&
      prepareSpecScript.includes('.specifications/BITCODE_SPEC_V34_PROVEN.md') &&
      prepareSpecScript.includes('.proofs/v34/promotion-readiness-report.json') &&
      prepareSpecScript.includes('rewritePromotedParityJudgments'),
    'Spec-family promotion preparation must rewrite V34 hand-authored status truth and promoted parity judgments.',
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
    provenGenerator.includes('buildV34ProvenPackage') &&
      provenGenerator.includes('buildV34PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT) &&
      v21Specifying.includes(ARTIFACT) &&
      read(root, 'packages/btd/src/deployment-promotion-readiness-report.ts').includes('DeploymentPromotionReadinessReport'),
    'Generated appendix support must include the V34 promotion readiness artifact and package-owned report object.',
  );

  const expectedActiveCanon = pointer === 'V34' ? 'V34' : 'V33';
  const expectedDraftTarget = pointer === 'V34' ? 'V35' : 'V34';

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
    protocolReadme.includes('V34 Gate 10') &&
      protocolReadme.includes(`${expectedActiveCanon}\` active, \`${expectedDraftTarget}\` draft`),
    `Protocol package README must name the ${expectedActiveCanon}/${expectedDraftTarget} posture and Gate 10 promotion boundary.`,
  );
  assertCheck(
    failures,
    rootReadme.includes('check:v34-gate10') && rootReadme.includes('v34-canon-promotion.yml'),
    'README must document the Gate 10 command and V34 promotion workflow.',
  );

  assertJsonArtifact(failures, root, '.proofs/v34/deployment-host-capability-catalog.json', ['"artifactId": "v34-deployment-host-capability-catalog"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/environment-lane-contracts.json', ['"artifactId": "v34-environment-lane-contracts"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/distributed-execution-runtime-receipts.json', ['"artifactId": "v34-distributed-execution-runtime-receipts"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/deployment-storage-posture.json', ['"artifactId": "v34-deployment-storage-posture"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/secret-rotation-boundary-operations.json', ['"artifactId": "v34-secret-rotation-boundary-operations"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/migration-cicd-approval-gates.json', ['"artifactId": "v34-migration-cicd-approval-gates"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/runtime-observers-broadcasters-repair-jobs.json', ['"artifactId": "v34-runtime-observers-broadcasters-repair-jobs"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/rollback-upgrade-data-repair-playbooks.json', ['"artifactId": "v34-rollback-upgrade-data-repair-playbooks"', '"version": "V34"']);
  assertJsonArtifact(failures, root, '.proofs/v34/local-staging-testnet-deployment-rehearsal.json', ['"artifactId": "v34-local-staging-testnet-deployment-rehearsal"', '"version": "V34"']);
  const readinessArtifact = assertJsonArtifact(failures, root, ARTIFACT, ['v34-promotion-readiness-report', '"version": "V34"']);

  if (readinessArtifact) {
    const readinessId = readinessArtifact.artifactId || readinessArtifact.reportId;
    assertCheck(failures, readinessId === 'v34-promotion-readiness-report', 'Gate 10 promotion readiness artifact id must match.');
    assertCheck(failures, readinessArtifact.version === 'V34', 'Gate 10 promotion readiness artifact must bind V34.');
    assertCheck(failures, readinessArtifact.passed === true, 'Gate 10 promotion readiness artifact must pass.');
    assertCheck(failures, readinessArtifact.branchProtection?.directMainPushAdmitted === false, 'Gate 10 must not admit direct main pushes.');
    assertCheck(failures, readinessArtifact.branchProtection?.promotionPrRequired === true, 'Gate 10 must require promotion pull requests.');
    assertCheck(failures, readinessArtifact.generatedArtifactPolicy?.secretValuesSerialized === false, 'Gate 10 artifact must not serialize secret values.');
    assertCheck(failures, readinessArtifact.generatedArtifactPolicy?.protectedSourceSerialized === false, 'Gate 10 artifact must not serialize protected source.');
    if (Array.isArray(readinessArtifact.gateArtifactEvidence)) {
      assertCheck(failures, readinessArtifact.gateArtifactEvidence.length === V34_GATE_ARTIFACTS.length, 'Gate 10 artifact must cover every V34 gate artifact.');
    } else {
      assertCheck(
        failures,
        args.promotionMode && pointer === 'V34',
        'Gate 10 artifact must cover every V34 gate artifact.',
      );
    }
    if (readinessArtifact.sourceEvidence && readinessArtifact.documentationEvidence) {
      assertCheck(failures, everyTokenPresent(readinessArtifact.sourceEvidence), 'Gate 10 source evidence tokens must all be present.');
      assertCheck(failures, everyTokenPresent(readinessArtifact.documentationEvidence), 'Gate 10 documentation evidence tokens must all be present.');
    }
  }

  if (fileExists(root, '.specifications/BITCODE_SPEC_V34_PROVEN.md')) {
    const proven = read(root, '.specifications/BITCODE_SPEC_V34_PROVEN.md');
    assertCheck(failures, proven.includes('Bitcode Spec V34') || proven.includes('V34'), 'BITCODE_SPEC_V34_PROVEN.md must render V34 proof content.');
  }

  if (failures.length) {
    process.stderr.write('V34 Gate 10 promotion readiness check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(
    `V34 Gate 10 promotion readiness check passed promotionMode=${args.promotionMode ? 'true' : 'false'} pointer=${pointer}\n`,
  );
}

main();
