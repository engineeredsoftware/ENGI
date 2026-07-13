#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-promotion-readiness-report.json';

const V38_GATE_ARTIFACTS = [
  '.bitcode/v38-inference-surface-inventory.json',
  '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
  '.bitcode/v38-prompt-benchmark-report.json',
  '.bitcode/v38-disclosure-boundary-report.json',
  '.bitcode/v38-read-need-comprehension-inference-hardening.json',
  '.bitcode/v38-read-fits-finding-search-embeddings.json',
  '.bitcode/v38-assetpack-synthesis-economic-traceability.json',
  '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
  '.bitcode/v38-local-staging-inference-depository-search-rehearsal.json',
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
  ['PRIVATE', 'KEY'].join('_'),
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
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    promotionMode: false,
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    else if (arg === '--promotion-mode') args.promotionMode = true;
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v38-gate11-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V38 Gate 11 promotion readiness, inference artifacts, V38 promotion workflow support, source-safety, generated proof support, and V39 draft posture preparation.',
      'Use --skip-package-tests only in lightweight workflow posture jobs that do not install pnpm dependencies.',
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
  const promotedPointer = args.promotionMode && pointer === 'V38';

  assertCheck(
    failures,
    args.promotionMode ? ['V37', 'V38'].includes(pointer) : pointer === 'V37',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V37 before V38 promotion or V38 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V37 during V38 Gate 11 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-11-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 11 work must occur on version/v38 or v38/gate-11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V38.md',
    'BITCODE_SPEC_V38_DELTA.md',
    'BITCODE_SPEC_V38_NOTES.md',
    'BITCODE_SPEC_V38_PARITY_MATRIX.md',
    ARTIFACT_PATH,
    'scripts/generate-v38-promotion-readiness-report.mjs',
    'scripts/check-v38-gate11-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v38-canon-promotion.yml',
    'packages/specifying/src/canon-posture.js',
    'packages/specifying/data/state.json',
    'packages/specifying/README.md',
    'packages/specifying/src/canonical/proven-generator.js',
    'packages/specifying/src/canonical/inference-promotion-readiness-report.js',
    'packages/specifying/test/v38-promotion-readiness.test.js',
    'packages/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    'SPECIFICATIONS_ROADMAP.md',
    ...V38_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 11 file: ${relativePath}`);
  }

  if (failures.length === 0 && !promotedPointer) {
    try {
      run(root, 'node', ['scripts/generate-v38-inference-surface-inventory.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-ptrr-failsafe-thricified-stack.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-prompt-benchmark-report.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-inference-telemetry-disclosure-report.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-read-need-comprehension-inference-hardening.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-read-fits-finding-search-embeddings.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-assetpack-synthesis-economic-traceability.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-conversation-tool-prompt-inference-parity.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-local-staging-inference-depository-search-rehearsal.mjs', '--check']);
      if (!promotedPointer) {
        run(root, 'node', ['scripts/generate-v38-promotion-readiness-report.mjs', '--check']);
      }
    } catch (error) {
      failures.push(`V38 Gate 11 artifact freshness check failed: ${error.stderr || error.message}`);
    }
  }

  const artifactText = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !artifactText.includes(marker), `${ARTIFACT_PATH} must not contain secret-shaped value ${marker}.`);
  }
  assertCheck(failures, !artifactText.includes('protectedSourceBody'), `${ARTIFACT_PATH} must not serialize protected source bodies.`);

  const artifact = artifactText ? JSON.parse(artifactText) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-promotion-readiness-report', 'Promotion readiness artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.inferencePromotionReadinessReport.v1', 'Promotion readiness schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Promotion readiness must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Promotion readiness report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-inference-promotion-readiness-metadata',
      'Promotion readiness report must be source-safe inference promotion metadata.',
    );
    assertCheck(failures, artifact.prePromotionPosture === 'V37 active / V38 draft', 'Promotion readiness pre-promotion posture must match.');
    assertCheck(failures, artifact.postPromotionPosture === 'V38 active / V39 draft', 'Promotion readiness post-promotion posture must match.');
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
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Promotion readiness must not expose raw provider responses.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Promotion readiness must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Promotion readiness must not expose wallet private material.');
    assertCheck(failures, artifact.validationCommands.includes('pnpm run check:v38-gate11'), 'Promotion readiness must list check:v38-gate11.');
    assertCheck(
      failures,
      artifact.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V38 --commit HEAD --dry-run'),
      'Promotion readiness must list V38 promotion dry-run.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V38.md');
  const delta = read(root, 'BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v38-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'packages/specifying/src/canonical/proven-generator.js');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V38 promotion readiness canon'), 'V38 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH) && spec.includes('V38 active / draft V39'), 'V38 SPEC must include Gate 11 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 11: V38 Promotion Readiness') && delta.includes(ARTIFACT_PATH), 'V38 DELTA must define Gate 11 closure acceptance and artifact.');
  assertCheck(failures, delta.includes('promotion scripts support V38'), 'V38 DELTA must state V38 promotion script support.');
  assertCheck(failures, notes.includes('Gate 11: V38 Promotion Readiness') && notes.includes('active V38 / draft V39'), 'V38 NOTES must carry Gate 11 post-promotion posture notes.');
  assertCheck(failures, parity.includes('## Gate 11 Promotion readiness parity') && parity.includes(ARTIFACT_PATH) && parity.includes('closed'), 'V38 PARITY must close Gate 11 artifact parity.');
  assertCheck(failures, roadmap.includes('V38 Gate 11 closure anchor'), 'Roadmap must include V38 Gate 11 closure anchor.');
  assertCheck(
    failures,
    packageJson.includes('"generate:v38-promotion-readiness"') &&
      packageJson.includes('"check:v38-promotion-readiness"') &&
      packageJson.includes('"check:v38-gate11"'),
    'package.json must expose V38 Gate 11 generator/check scripts.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('check-v38-gate11-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V38" ]') &&
      gateWorkflow.includes('--active-canon V38 --draft-target V39'),
    'Gate-quality workflow must tolerate both V37-draft and V38-promoted states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('check-v38-gate11-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      canonWorkflow.includes('elif [ "$POINTER" = "V38" ]') &&
      canonWorkflow.includes('--active-canon V38 --draft-target V39'),
    'Canon-quality workflow must validate V38/V39 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v38'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V38') &&
      promotionWorkflow.includes('check-v38-gate11-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'V38 promotion workflow must validate Gate 11 and promote V38.',
  );
  assertCheck(
    failures,
    promoteScript.includes("if (version === 'V38')") &&
      promoteScript.includes('const v38Gate11Command') &&
      promoteScript.includes('buildDerivedV38CommitMessageBody') &&
      promoteScript.includes("version === 'V38'"),
    'Promotion script must support V38.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V38')") &&
      prepareSpecScript.includes('V38 canonical system specification for inference correctness') &&
      prepareSpecScript.includes(ARTIFACT_PATH),
    'Spec-family promotion preparation must support V38.',
  );
  assertCheck(
    failures,
    prepareRuntimeScript.includes('--next-draft') &&
      prepareRuntimeScript.includes('rewritePackageReadme') &&
      prepareRuntimeScript.includes('rewriteRuntimeDataState'),
    'Runtime promotion preparation must preserve next-draft posture support.',
  );
  assertCheck(
    failures,
    provenGenerator.includes('buildV38ProvenPackage') &&
      provenGenerator.includes('buildV38PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT_PATH),
    'Proven generator must include V38 promotion package support.',
  );
  assertCheck(failures, protocolReadme.includes('V38 Gate 11') && protocolReadme.includes('V38` active, `V39` draft'), 'Protocol README must document V38 Gate 11.');
  assertCheck(failures, rootReadme.includes('check:v38-gate11') && rootReadme.includes('v38-canon-promotion.yml'), 'Root README must document V38 Gate 11 scripts/workflow.');

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v38-promotion-readiness.test.js']);
      run(root, 'node', ['scripts/promote-bitcode-canon.mjs', '--version', 'V38', '--commit', 'HEAD', '--dry-run']);
    } catch (error) {
      failures.push(`V38 Gate 11 package promotion tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`V38 Gate 11 promotion readiness failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V38 Gate 11 promotion readiness ok artifacts=${V38_GATE_ARTIFACTS.length} root=${artifact?.artifactRoot || 'pending'}\n`);
}

main();
