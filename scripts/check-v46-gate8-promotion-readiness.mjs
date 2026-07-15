#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v46-promotion-readiness-report.json';

const V46_GATE_ARTIFACTS = [
  '.bitcode/v46-protocol-comprehension-object-model.json',
  '.bitcode/v46-public-operator-claim-boundaries.json',
  '.bitcode/v46-product-route-comprehension-readback.json',
  '.bitcode/v46-interface-claim-contracts.json',
  '.bitcode/v46-proof-readback-operator-explanation.json',
  '.bitcode/v46-local-interface-comprehension-rehearsal.json',
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
      'Usage: node scripts/check-v46-gate8-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V46 Gate 8 promotion readiness, protocol comprehension artifacts, V46 promotion workflow support, source-safety, generated proof support, and V46 draft posture preparation.',
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
  const promotedPointer = args.promotionMode && pointer === 'V46';

  assertCheck(
    failures,
    args.promotionMode ? ['V45', 'V46'].includes(pointer) : pointer === 'V45',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V45 before V46 promotion or V46 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V45 during V46 Gate 8 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v46' || /^v46\/gate-8-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V46 Gate 8 work must occur on version/v46 or v46/gate-8-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V46.md',
    '.specifications/BITCODE_SPEC_V46_DELTA.md',
    '.specifications/BITCODE_SPEC_V46_NOTES.md',
    '.specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
    '.specifications/BITCODE_SPEC_V46_PROVEN.md',
    ARTIFACT_PATH,
    'scripts/generate-v46-promotion-readiness-report.mjs',
    'scripts/check-v46-gate8-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v46-canon-promotion.yml',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/src/canonical/v46-promotion-readiness-report.js',
    'scripts/specifying/test/v46-promotion-readiness.test.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    ...V46_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V46 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0 && !promotedPointer) {
    try {
      run(root, 'node', ['scripts/generate-v46-promotion-readiness-report.mjs', '--check']);
    } catch (error) {
      failures.push(`V46 Gate 8 artifact freshness check failed: ${error.stderr || error.message}`);
    }
  }

  const artifactText = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !artifactText.includes(marker), `${ARTIFACT_PATH} must not contain secret-shaped value ${marker}.`);
  }
  assertCheck(failures, !artifactText.includes('protectedSourceBody'), `${ARTIFACT_PATH} must not serialize protected source bodies.`);

  const artifact = artifactText ? JSON.parse(artifactText) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v46-promotion-readiness-report', 'Promotion readiness artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v46.promotionReadinessReport.v1', 'Promotion readiness schemaId must match.');
    assertCheck(failures, artifact.version === 'V46' && artifact.currentTarget === 'V45', 'Promotion readiness must bind V46 over active V45.');
    assertCheck(failures, artifact.passed === true, 'Promotion readiness report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-v46-protocol-comprehension-promotion-metadata',
      'Promotion readiness report must be source-safe protocol comprehension promotion metadata.',
    );
    assertCheck(failures, artifact.prePromotionPosture === 'V45 active / V46 draft', 'Promotion readiness pre-promotion posture must match.');
    assertCheck(failures, artifact.postPromotionPosture === 'V46 active / V47 draft', 'Promotion readiness post-promotion posture must match.');
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
    assertCheck(failures, artifact.validationCommands.includes('pnpm run check:v46-gate8'), 'Promotion readiness must list check:v46-gate8.');
    assertCheck(
      failures,
      artifact.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V46 --commit HEAD --dry-run'),
      'Promotion readiness must list V46 promotion dry-run.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V46.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V46_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V46_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const proven = read(root, '.specifications/BITCODE_SPEC_V46_PROVEN.md');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v46-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V46 promotion readiness canon'), 'V46 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH) && spec.includes('V46 active / draft V47'), 'V46 SPEC must include Gate 8 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 8: V46 Promotion Readiness') && delta.includes(ARTIFACT_PATH), 'V46 DELTA must define Gate 8 closure acceptance and artifact.');
  assertCheck(failures, delta.includes('promotion scripts support V46'), 'V46 DELTA must state V46 promotion script support.');
  assertCheck(failures, notes.includes('Gate 8: V46 Promotion Readiness') && notes.includes('active V46 / draft V47'), 'V46 NOTES must carry Gate 8 post-promotion posture notes.');
  assertCheck(
    failures,
    parity.includes('Gate 8 implementation readback') && parity.includes(ARTIFACT_PATH) && parity.includes('closed'),
    'V46 PARITY must close Gate 8 artifact parity.',
  );
  assertCheck(failures, roadmap.includes('V46 Gate 8 closure anchor'), 'Roadmap must include V46 Gate 8 closure anchor.');
  assertCheck(
    failures,
    proven.includes('V46 Promotion Readiness') && proven.includes(ARTIFACT_PATH) && !proven.includes('protectedSourceBody'),
    'V46 PROVEN appendix must include source-safe promotion readiness output.',
  );
  assertCheck(
    failures,
    packageJson.includes('"generate:v46-promotion-readiness"') &&
      packageJson.includes('"check:v46-promotion-readiness"') &&
      packageJson.includes('"check:v46-gate8"'),
    'package.json must expose V46 Gate 8 generator/check scripts.',
  );
  assertCheck(
    failures,
      gateWorkflow.includes('check-v46-gate8-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V46" ]') &&
      gateWorkflow.includes('--active-canon V46 --draft-target V47'),
    'Gate-quality workflow must tolerate both V45-draft and V46-promoted states.',
  );
  assertCheck(
    failures,
      canonWorkflow.includes('check-v46-gate8-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      canonWorkflow.includes('elif [ "$POINTER" = "V46" ]') &&
      canonWorkflow.includes('--active-canon V46 --draft-target V47'),
    'Canon-quality workflow must validate V46 promoted posture.',
  );
  assertCheck(
    failures,
      promotionWorkflow.includes("head.ref == 'version/v46'") &&
      promotionWorkflow.includes('node scripts/prepare-bitcode-spec-family-promotion.mjs --version V46') &&
      promotionWorkflow.includes('node scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V46 --next-draft V47') &&
      promotionWorkflow.includes('node scripts/generate-bitcode-proven.mjs --version V46') &&
      promotionWorkflow.includes('node scripts/check-bitcode-spec-family.mjs --version V46 --mode promoted --current-target V46') &&
      promotionWorkflow.includes('check-v46-gate8-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'V46 promotion workflow must validate Gate 8 and promote V46.',
  );
  assertCheck(
    failures,
      promoteScript.includes("if (version === 'V46')") &&
      promoteScript.includes('const v46Gate8Command') &&
      promoteScript.includes('buildDerivedV46CommitMessageBody') &&
      promoteScript.includes("version === 'V46'"),
    'Promotion script must support V46.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V46')") &&
      prepareSpecScript.includes('V46 canonical system specification for protocol comprehension') &&
      prepareSpecScript.includes(ARTIFACT_PATH),
    'Spec-family promotion preparation must support V46.',
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
    provenGenerator.includes('buildV46ProvenPackage') &&
      provenGenerator.includes('buildV46PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT_PATH),
    'Proven generator must include V46 promotion package support.',
  );
  assertCheck(failures, protocolReadme.includes('V46 Gate 8') && protocolReadme.includes('V46` active, `V47` draft'), 'Protocol README must document V46 Gate 8.');
  assertCheck(failures, rootReadme.includes('check:v46-gate8') && rootReadme.includes('v46-canon-promotion.yml'), 'Root README must document V46 Gate 8 scripts/workflow.');

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v46-promotion-readiness.test.js']);
      run(root, 'node', ['scripts/promote-bitcode-canon.mjs', '--version', 'V46', '--commit', 'HEAD', '--dry-run']);
    } catch (error) {
      failures.push(`V46 Gate 8 package promotion tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`V46 Gate 8 promotion readiness failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V46 Gate 8 promotion readiness ok artifacts=${V46_GATE_ARTIFACTS.length} root=${artifact?.artifactRoot || 'pending'}\n`);
}

main();
