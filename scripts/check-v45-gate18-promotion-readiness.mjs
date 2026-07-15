#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v45-promotion-readiness-report.json';

const V45_GATE_ARTIFACTS = [
  '.bitcode/v45-inference-synthesis-proof.json',
  '.bitcode/v45-prompt-completeness-proof.json',
  '.bitcode/v45-static-code-analysis-proof.json',
  '.bitcode/v45-verification-decisions-proof.json',
  '.bitcode/v45-selection-materialization-proof.json',
  '.bitcode/v45-authorization-sensitive-flow-proof.json',
  '.bitcode/v45-settlement-source-to-shares-proof.json',
  '.bitcode/v45-disclosure-boundary-proof.json',
  '.bitcode/v45-proof-contract-proof.json',
  '.bitcode/v45-source-safe-e2e-rehearsal.json',
];

const JWT_HEADER_PREFIX = String.fromCharCode(
  101,
  121,
  74,
  104,
  98,
  71,
  99,
  105,
  79,
  105,
  74,
  73,
  85,
  122,
  73,
  49,
  78,
  105,
  73,
  115,
  73,
  110,
  82,
  53,
  99,
  67,
  73,
  54,
  73,
  107,
  112,
  88,
  86,
  67,
  74,
  57,
);

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  JWT_HEADER_PREFIX,
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
      'Usage: node scripts/check-v45-gate18-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V45 Gate 18 promotion readiness, knowledge commoditization artifacts, V45 promotion workflow support, source-safety, generated proof support, and V45 draft posture preparation.',
      'Use --skip-package-tests only in lightweight workflow posture jobs that do not need promotion dry-run coverage.',
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
  const promotedPointer = args.promotionMode && pointer === 'V45';

  assertCheck(
    failures,
    args.promotionMode ? ['V44', 'V45'].includes(pointer) : pointer === 'V44',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V44 before V45 promotion or V45 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V44 during V45 Gate 18 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-18-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 Gate 18 work must occur on version/v45 or v45/gate-18-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V45.md',
    '.specifications/BITCODE_SPEC_V45_DELTA.md',
    '.specifications/BITCODE_SPEC_V45_NOTES.md',
    '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
    '.specifications/BITCODE_SPEC_V45_PROVEN.md',
    ARTIFACT_PATH,
    'scripts/generate-v45-promotion-readiness-report.mjs',
    'scripts/check-v45-gate18-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v45-canon-promotion.yml',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/src/canonical/v45-promotion-readiness-report.js',
    'scripts/specifying/test/v45-promotion-readiness.test.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    ...V45_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V45 Gate 18 file: ${relativePath}`);
  }

  if (failures.length === 0 && !promotedPointer) {
    try {
      run(root, 'node', ['scripts/generate-v45-proof-family-artifacts.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v45-source-safe-e2e-rehearsal.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v45-promotion-readiness-report.mjs', '--check']);
    } catch (error) {
      failures.push(`V45 Gate 18 artifact freshness check failed: ${error.stderr || error.message}`);
    }
  }

  const artifactText = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !artifactText.includes(marker), `${ARTIFACT_PATH} must not contain secret-shaped value ${marker}.`);
  }
  assertCheck(failures, !artifactText.includes('protectedSourceBody'), `${ARTIFACT_PATH} must not serialize protected source bodies.`);

  const artifact = artifactText ? JSON.parse(artifactText) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v45-promotion-readiness-report', 'Promotion readiness artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v45.promotionReadinessReport.v1', 'Promotion readiness schemaId must match.');
    assertCheck(failures, artifact.version === 'V45' && artifact.currentTarget === 'V44', 'Promotion readiness must bind V45 over active V44.');
    assertCheck(failures, artifact.passed === true, 'Promotion readiness report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-v45-knowledge-commoditization-promotion-metadata',
      'Promotion readiness report must be source-safe knowledge commoditization promotion metadata.',
    );
    assertCheck(failures, artifact.prePromotionPosture === 'V44 active / V45 draft', 'Promotion readiness pre-promotion posture must match.');
    assertCheck(failures, artifact.postPromotionPosture === 'V45 active / V46 draft', 'Promotion readiness post-promotion posture must match.');
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
    assertCheck(failures, artifact.validationCommands.includes('pnpm run check:v45-gate18'), 'Promotion readiness must list check:v45-gate18.');
    assertCheck(
      failures,
      artifact.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V45 --commit HEAD --dry-run'),
      'Promotion readiness must list V45 promotion dry-run.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V45.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V45_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V45_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const proven = read(root, '.specifications/BITCODE_SPEC_V45_PROVEN.md');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v45-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V45 promotion readiness canon'), 'V45 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH) && spec.includes('V45 active / draft V46'), 'V45 SPEC must include Gate 18 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 18: V45 Promotion Readiness') && delta.includes(ARTIFACT_PATH), 'V45 DELTA must define Gate 18 closure acceptance and artifact.');
  assertCheck(failures, delta.includes('promotion scripts support V45'), 'V45 DELTA must state V45 promotion script support.');
  assertCheck(failures, notes.includes('Gate 18: V45 Promotion Readiness') && notes.includes('active V45 / draft V46'), 'V45 NOTES must carry Gate 18 post-promotion posture notes.');
  assertCheck(
    failures,
    parity.includes('Gate 18 implementation readback') && parity.includes(ARTIFACT_PATH) && parity.includes('closed'),
    'V45 PARITY must close Gate 18 artifact parity.',
  );
  assertCheck(failures, roadmap.includes('V45 Gate 18 closure anchor'), 'Roadmap must include V45 Gate 18 closure anchor.');
  assertCheck(
    failures,
    proven.includes('V45 Promotion Readiness') && proven.includes(ARTIFACT_PATH) && !proven.includes('protectedSourceBody'),
    'V45 PROVEN appendix must include source-safe promotion readiness output.',
  );
  assertCheck(
    failures,
    packageJson.includes('"generate:v45-promotion-readiness"') &&
      packageJson.includes('"check:v45-promotion-readiness"') &&
      packageJson.includes('"check:v45-gate18"'),
    'package.json must expose V45 Gate 18 generator/check scripts.',
  );
  assertCheck(
    failures,
      gateWorkflow.includes('check-v45-gate18-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V45" ]') &&
      gateWorkflow.includes('--active-canon V45 --draft-target V46'),
    'Gate-quality workflow must tolerate both V44-draft and V45-promoted states.',
  );
  assertCheck(
    failures,
      canonWorkflow.includes('check-v45-gate18-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      canonWorkflow.includes('elif [ "$POINTER" = "V45" ]') &&
      canonWorkflow.includes('--active-canon V45 --draft-target V46'),
    'Canon-quality workflow must validate V45 promoted posture.',
  );
  assertCheck(
    failures,
      promotionWorkflow.includes("head.ref == 'version/v45'") &&
      promotionWorkflow.includes('node scripts/prepare-bitcode-spec-family-promotion.mjs --version V45') &&
      promotionWorkflow.includes('node scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V45 --next-draft V46') &&
      promotionWorkflow.includes('node scripts/generate-bitcode-proven.mjs --version V45') &&
      promotionWorkflow.includes('node scripts/check-bitcode-spec-family.mjs --version V45 --mode promoted --current-target V45') &&
      promotionWorkflow.includes('check-v45-gate18-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'V45 promotion workflow must validate Gate 18 and promote V45.',
  );
  assertCheck(
    failures,
      promoteScript.includes("if (version === 'V45')") &&
      promoteScript.includes('const v45Gate18Command') &&
      promoteScript.includes('buildDerivedV45CommitMessageBody') &&
      promoteScript.includes("version === 'V45'"),
    'Promotion script must support V45.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V45')") &&
      prepareSpecScript.includes('V45 canonical system specification for knowledge commoditization') &&
      prepareSpecScript.includes(ARTIFACT_PATH),
    'Spec-family promotion preparation must support V45.',
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
    provenGenerator.includes('buildV45ProvenPackage') &&
      provenGenerator.includes('buildV45PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT_PATH),
    'Proven generator must include V45 promotion package support.',
  );
  assertCheck(failures, protocolReadme.includes('V45 Gate 18') && protocolReadme.includes('V45` active, `V46` draft'), 'Protocol README must document V45 Gate 18.');
  assertCheck(failures, rootReadme.includes('check:v45-gate18') && rootReadme.includes('v45-canon-promotion.yml'), 'Root README must document V45 Gate 18 scripts/workflow.');

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v45-promotion-readiness.test.js']);
      run(root, 'node', ['scripts/promote-bitcode-canon.mjs', '--version', 'V45', '--commit', 'HEAD', '--dry-run']);
    } catch (error) {
      failures.push(`V45 Gate 18 package promotion tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`V45 Gate 18 promotion readiness failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V45 Gate 18 promotion readiness ok artifacts=${V45_GATE_ARTIFACTS.length} root=${artifact?.artifactRoot || 'pending'}\n`);
}

main();
