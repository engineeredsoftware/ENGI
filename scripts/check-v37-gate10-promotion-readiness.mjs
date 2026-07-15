#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-promotion-readiness-report.json';

const V37_GATE_ARTIFACTS = [
  '.bitcode/v37-conversation-session-route-history.json',
  '.bitcode/v37-conversation-stream-event-contract.json',
  '.bitcode/v37-conversation-writing-workspace.json',
  '.bitcode/v37-conversation-source-selector.json',
  '.bitcode/v37-conversation-product-handoff.json',
  '.bitcode/v37-conversation-persistence-privacy-redaction.json',
  '.bitcode/v37-conversation-telemetry-proof-hooks.json',
  '.bitcode/v37-conversation-rehearsal.json',
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

function run(root, command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: options.env ?? process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function envWithGitSafeDirectory(root) {
  const count = Number.parseInt(process.env.GIT_CONFIG_COUNT || '0', 10);
  const safeDirectoryIndex = Number.isFinite(count) && count >= 0 ? count : 0;
  return {
    ...process.env,
    GIT_CONFIG_COUNT: String(safeDirectoryIndex + 1),
    [`GIT_CONFIG_KEY_${safeDirectoryIndex}`]: 'safe.directory',
    [`GIT_CONFIG_VALUE_${safeDirectoryIndex}`]: root,
  };
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
      'Usage: node scripts/check-v37-gate10-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 10 promotion readiness, Conversations artifacts, V37 promotion workflow support, and pre/post-promotion posture handling.',
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
    args.promotionMode ? ['V36', 'V37'].includes(pointer) : pointer === 'V36',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V36 before V37 promotion or V37 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V36 during V37 Gate 10 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v37' || /^v37\/gate-10-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 10 work must occur on version/v37 or v37/gate-10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    ARTIFACT_PATH,
    'scripts/generate-v37-promotion-readiness-report.mjs',
    'scripts/check-v37-gate10-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v37-canon-promotion.yml',
    'packages/specifying/src/canon-posture.js',
    'packages/specifying/data/state.json',
    'packages/specifying/README.md',
    'packages/specifying/src/canonical/proven-generator.js',
    'packages/specifying/src/canonical/conversation-promotion-readiness-report.js',
    'packages/specifying/test/v37-promotion-readiness.test.js',
    'packages/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    'SPECIFICATIONS_ROADMAP.md',
    ...V37_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0 && pointer === 'V36') {
    try {
      run(root, 'node', ['scripts/generate-v37-promotion-readiness-report.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Gate 10 promotion readiness artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const artifactText = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !artifactText.includes(marker), `${ARTIFACT_PATH} must not contain secret-shaped value ${marker}.`);
  }
  assertCheck(failures, !artifactText.includes('protectedSourceBody'), `${ARTIFACT_PATH} must not serialize protected source bodies.`);
  const artifact = artifactText ? JSON.parse(artifactText) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-promotion-readiness-report', 'Promotion readiness artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationPromotionReadinessReport.v1', 'Promotion readiness schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Promotion readiness must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Promotion readiness report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-promotion-readiness-metadata',
      'Promotion readiness report must be source-safe Conversations promotion metadata.',
    );
    assertCheck(failures, artifact.prePromotionPosture === 'V36 active / V37 draft', 'Promotion readiness pre-promotion posture must match.');
    assertCheck(failures, artifact.postPromotionPosture === 'V37 active / V38 draft', 'Promotion readiness post-promotion posture must match.');
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
    assertCheck(failures, artifact.validationCommands.includes('pnpm run check:v37-gate10'), 'Promotion readiness must list check:v37-gate10.');
    assertCheck(
      failures,
      artifact.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V37 --commit HEAD --dry-run'),
      'Promotion readiness must list V37 promotion dry-run.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V37.md');
  const delta = read(root, 'BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v37-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'packages/specifying/src/canonical/proven-generator.js');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V37 promotion readiness canon'), 'V37 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH) && spec.includes('V37 active / draft V38'), 'V37 SPEC must include Gate 10 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 10: V37 Promotion Readiness') && delta.includes(ARTIFACT_PATH), 'V37 DELTA must define Gate 10 closure acceptance and artifact.');
  assertCheck(failures, delta.includes('promotion scripts support V37'), 'V37 DELTA must state V37 promotion script support.');
  assertCheck(failures, notes.includes('Gate 10: V37 Promotion Readiness') && notes.includes('active V37 / draft V38'), 'V37 NOTES must carry Gate 10 post-promotion posture notes.');
  assertCheck(failures, parity.includes('## Gate 10 Parity') && parity.includes(ARTIFACT_PATH) && parity.includes('closed'), 'V37 PARITY must close Gate 10 artifact parity.');
  assertCheck(failures, roadmap.includes('V37 Gate 10 closure anchor'), 'Roadmap must include V37 Gate 10 closure anchor.');
  assertCheck(
    failures,
    packageJson.includes('"generate:v37-promotion-readiness"') &&
      packageJson.includes('"check:v37-promotion-readiness"') &&
      packageJson.includes('"check:v37-gate10"'),
    'package.json must expose V37 Gate 10 generator/check scripts.',
  );
  assertCheck(
    failures,
      gateWorkflow.includes('check-v37-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V37" ]') &&
      gateWorkflow.includes('--active-canon V37 --draft-target V38'),
    'Gate-quality workflow must tolerate both V36-draft and V37-promoted states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('elif [ "$POINTER" = "V37" ]') &&
      canonWorkflow.includes('--active-canon V37 --draft-target V38'),
    'Canon-quality workflow must validate V37/V37 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v37'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V37') &&
      promotionWorkflow.includes('BITCODE_SPEC_V37_PROVEN.md') &&
      promotionWorkflow.includes('Promote V37 canon files'),
    'V37 promotion workflow must validate version/v37 and commit V37 promotion artifacts.',
  );
  assertCheck(
    failures,
    promoteScript.includes("if (version === 'V37')") &&
      promoteScript.includes('const v37Gate10Command') &&
      promoteScript.includes('buildDerivedV37CommitMessageBody') &&
      promoteScript.includes("scripts/check-v37-gate10-promotion-readiness.mjs"),
    'promote-bitcode-canon must support V37 command planning and commit body derivation.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V37')") &&
      prepareSpecScript.includes('BITCODE_SPEC_V37_PROVEN.md') &&
      prepareSpecScript.includes(ARTIFACT_PATH),
    'Spec-family promotion script must support V37.',
  );
  assertCheck(
    failures,
    prepareRuntimeScript.includes('--next-draft') && prepareRuntimeScript.includes('rewriteRuntimeDataState'),
    'Runtime promotion script must support next-draft posture rewrites.',
  );
  assertCheck(
    failures,
    provenGenerator.includes('buildV37ProvenPackage') &&
      provenGenerator.includes('buildV37PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT_PATH),
    'Proven generator must support V37 promotion artifacts.',
  );
  assertCheck(failures, protocolReadme.includes('V37 Gate 10') && protocolReadme.includes('V37` active, `V38` draft'), 'Protocol README must document V37 Gate 10 posture.');
  assertCheck(failures, rootReadme.includes('check:v37-gate10') && rootReadme.includes('v37-canon-promotion.yml'), 'Root README must document V37 Gate 10 checks and workflow.');

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/promote-bitcode-canon.mjs', '--version', 'V37', '--commit', 'HEAD', '--dry-run'], {
        env: envWithGitSafeDirectory(root),
      });
    } catch (error) {
      failures.push(`V37 promotion dry-run failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`V37 Gate 10 promotion readiness check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V37 Gate 10 promotion readiness check passed: ${artifact?.artifactRoot || 'artifact pending'}\n`);
}

main();
