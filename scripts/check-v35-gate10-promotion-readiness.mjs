#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v35/documentation-telemetry-promotion-readiness-report.json';

const V35_GATE_ARTIFACTS = [
  '.proofs/v35/documentation-surface-catalog.json',
  '.proofs/v35/telemetry-taxonomy-catalog.json',
  '.proofs/v35/public-docs-usage-guides.json',
  '.proofs/v35/operator-runbook-catalog.json',
  '.proofs/v35/docs-qa-alignment-report.json',
  '.proofs/v35/testnet-rollout-readiness-guide.json',
  '.proofs/v35/telemetry-documentation-interface-integration.json',
  '.proofs/v35/local-staging-telemetry-documentation-rehearsal.json',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
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
      'Usage: node scripts/check-v35-gate10-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 10 promotion readiness, telemetry/documentation artifacts, V35 promotion workflow support, and pre/post-promotion posture handling.',
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    args.promotionMode ? ['V34', 'V35'].includes(pointer) : pointer === 'V34',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V34 before V35 promotion or V35 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V34 during V35 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 10 work must occur on version/v35 or v35/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V35.md',
    '.specifications/BITCODE_SPEC_V35_DELTA.md',
    '.specifications/BITCODE_SPEC_V35_NOTES.md',
    '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md',
    ARTIFACT_PATH,
    'scripts/generate-v35-documentation-telemetry-promotion-readiness-report.mjs',
    'scripts/check-v35-gate10-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v35-canon-promotion.yml',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/src/canonical/documentation-telemetry-promotion-readiness-report.js',
    'scripts/specifying/test/v35-promotion-readiness.test.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    ...V35_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0 && pointer === 'V34') {
    try {
      run(root, 'pnpm', ['run', 'check:v35-documentation-telemetry-promotion-readiness']);
    } catch (error) {
      failures.push(`V35 Gate 10 promotion readiness artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const artifactText = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !artifactText.includes(marker), `${ARTIFACT_PATH} must not contain secret-shaped value ${marker}.`);
  }
  assertCheck(failures, !artifactText.includes('protectedSourceBody'), `${ARTIFACT_PATH} must not serialize protected source bodies.`);
  const artifact = artifactText ? JSON.parse(artifactText) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-documentation-telemetry-promotion-readiness-report', 'Promotion readiness artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.documentationTelemetryPromotionReadinessReport.v1', 'Promotion readiness schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Promotion readiness must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Promotion readiness report must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-promotion-readiness-metadata', 'Promotion readiness report must be source-safe promotion metadata.');
    assertCheck(failures, artifact.prePromotionPosture === 'V34 active / V35 draft', 'Promotion readiness pre-promotion posture must match.');
    assertCheck(failures, artifact.postPromotionPosture === 'V35 active / V36 draft', 'Promotion readiness post-promotion posture must match.');
    assertCheck(failures, artifact.coverage.allGateArtifactsCovered === true, 'Promotion readiness must cover all gate artifacts.');
    assertCheck(failures, artifact.coverage.allGateArtifactsParseable === true, 'Promotion readiness artifacts must be parseable.');
    assertCheck(failures, artifact.coverage.allGateArtifactsSourceSafe === true, 'Promotion readiness artifacts must be source-safe.');
    assertCheck(failures, artifact.coverage.sourceEvidenceComplete === true, 'Promotion readiness source evidence must be complete.');
    assertCheck(failures, artifact.coverage.documentationEvidenceComplete === true, 'Promotion readiness documentation evidence must be complete.');
    assertCheck(failures, artifact.coverage.generatedProofOutputsCovered === true, 'Promotion readiness must cover generated proof outputs.');
    assertCheck(failures, artifact.coverage.promotionWorkflowCovered === true, 'Promotion readiness must cover promotion workflow.');
    assertCheck(failures, artifact.coverage.gateQualityWorkflowCovered === true, 'Promotion readiness must cover gate-quality workflow.');
    assertCheck(failures, artifact.coverage.canonQualityWorkflowCovered === true, 'Promotion readiness must cover canon-quality workflow.');
    assertCheck(failures, artifact.coverage.promotionScriptCovered === true, 'Promotion readiness must cover promotion script.');
    assertCheck(failures, artifact.coverage.specFamilyPromotionScriptCovered === true, 'Promotion readiness must cover spec-family promotion script.');
    assertCheck(failures, artifact.coverage.runtimePromotionScriptCovered === true, 'Promotion readiness must cover runtime promotion script.');
    assertCheck(failures, artifact.coverage.provenGeneratorCovered === true, 'Promotion readiness must cover proven generator.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmission === false, 'Promotion readiness must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Promotion readiness must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Promotion readiness must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Promotion readiness must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Promotion readiness must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Promotion readiness must not expose wallet private material.');
    assertCheck(failures, artifact.validationCommands.includes('pnpm run check:v35-gate10'), 'Promotion readiness must list check:v35-gate10.');
    assertCheck(
      failures,
      artifact.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V35 --commit HEAD --dry-run'),
      'Promotion readiness must list V35 promotion dry-run.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V35.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V35_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V35_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v35-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V35 promotion readiness canon'), 'V35 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH) && spec.includes('V35 active / draft V36'), 'V35 SPEC must include Gate 10 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 10: V35 Promotion Readiness') && delta.includes(ARTIFACT_PATH), 'V35 DELTA must define Gate 10 closure acceptance and artifact.');
  assertCheck(failures, delta.includes('promotion scripts support V35'), 'V35 DELTA must state V35 promotion script support.');
  assertCheck(failures, notes.includes('Gate 10: V35 Promotion Readiness') && notes.includes('active V35 / draft V36'), 'V35 NOTES must carry Gate 10 post-promotion posture notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes(ARTIFACT_PATH) && parity.includes('closed'), 'V35 PARITY must close Gate 10 artifact parity.');
  assertCheck(failures, roadmap.includes('V35 Gate 10 closure anchor'), 'Roadmap must include V35 Gate 10 closure anchor.');
  assertCheck(
    failures,
    packageJson.includes('"generate:v35-documentation-telemetry-promotion-readiness"') &&
      packageJson.includes('"check:v35-documentation-telemetry-promotion-readiness"') &&
      packageJson.includes('"check:v35-gate10"'),
    'package.json must expose V35 Gate 10 generator/check scripts.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('check-v35-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V35" ]') &&
      gateWorkflow.includes('--active-canon V35 --draft-target V36'),
    'Gate-quality workflow must tolerate both V34-draft and V35-promoted states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('elif [ "$POINTER" = "V35" ]') &&
      canonWorkflow.includes('--active-canon V35 --draft-target V36'),
    'Canon-quality workflow must validate V35/V36 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v35'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V35') &&
      promotionWorkflow.includes('.specifications/BITCODE_SPEC_V35_PROVEN.md') &&
      promotionWorkflow.includes('Promote V35 canon files'),
    'V35 promotion workflow must validate version/v35 and commit V35 promotion artifacts.',
  );
  assertCheck(
    failures,
    promoteScript.includes("if (version === 'V35')") &&
      promoteScript.includes('const v35Gate10Command') &&
      promoteScript.includes('buildDerivedV35CommitMessageBody') &&
      promoteScript.includes("scripts/check-v35-gate10-promotion-readiness.mjs"),
    'promote-bitcode-canon must support V35 command planning and commit body derivation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V35')") &&
      prepareSpecScript.includes('.specifications/BITCODE_SPEC_V35_PROVEN.md') &&
      prepareSpecScript.includes(ARTIFACT_PATH),
    'Spec-family promotion script must support V35.',
  );
  assertCheck(
    failures,
    prepareRuntimeScript.includes('--next-draft') && prepareRuntimeScript.includes('rewriteRuntimeDataState'),
    'Runtime promotion script must support next-draft posture rewrites.',
  );
  assertCheck(
    failures,
    provenGenerator.includes('buildV35ProvenPackage') &&
      provenGenerator.includes('buildV35PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT_PATH),
    'Proven generator must support V35 promotion artifacts.',
  );
  assertCheck(failures, protocolReadme.includes('V35 Gate 10') && protocolReadme.includes('V35` active, `V36` draft'), 'Protocol README must document V35 Gate 10 posture.');
  assertCheck(failures, rootReadme.includes('check:v35-gate10') && rootReadme.includes('v35-canon-promotion.yml'), 'Root README must document V35 Gate 10 checks and workflow.');

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/promote-bitcode-canon.mjs', '--version', 'V35', '--commit', 'HEAD', '--dry-run']);
    } catch (error) {
      failures.push(`V35 promotion dry-run failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`V35 Gate 10 promotion readiness check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V35 Gate 10 promotion readiness check passed: ${artifact?.artifactRoot || 'artifact pending'}\n`);
}

main();
