#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v39/promotion-readiness-report.json';

const V39_GATE_ARTIFACTS = [
  '.proofs/v39/depository-supply-indexing.json',
  '.proofs/v39/enterprise-reading-ux-state.json',
  '.proofs/v39/read-need-review-resynthesis.json',
  '.proofs/v39/read-fits-finding-runtime.json',
  '.proofs/v39/assetpack-preview-quote-boundary.json',
  '.proofs/v39/settlement-rights-delivery.json',
  '.proofs/v39/operational-telemetry-repair-readback.json',
  '.proofs/v39/interface-conversation-product-parity.json',
  '.proofs/v39/local-staging-reading-rehearsal.json',
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
      'Usage: node scripts/check-v39-gate11-promotion-readiness.mjs [--promotion-mode] [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 11 promotion readiness, commercial Reading artifacts, V39 promotion workflow support, source-safety, generated proof support, and V40 draft posture preparation.',
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();
  const promotedPointer = args.promotionMode && pointer === 'V39';

  assertCheck(
    failures,
    args.promotionMode ? ['V38', 'V39'].includes(pointer) : pointer === 'V38',
    args.promotionMode
      ? `BITCODE_SPEC.txt must be V38 before V39 promotion or V39 after promotion. Observed ${pointer || 'empty'}.`
      : `BITCODE_SPEC.txt must remain V38 during V39 Gate 11 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-11-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 11 work must occur on version/v39 or v39/gate-11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V39.md',
    '.specifications/BITCODE_SPEC_V39_DELTA.md',
    '.specifications/BITCODE_SPEC_V39_NOTES.md',
    '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
    ARTIFACT_PATH,
    'scripts/generate-v39-promotion-readiness-report.mjs',
    'scripts/check-v39-gate11-promotion-readiness.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'scripts/prepare-bitcode-spec-family-promotion.mjs',
    'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    'scripts/generate-bitcode-proven.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v39-canon-promotion.yml',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/src/canonical/v39-commercial-reading-promotion-readiness-report.js',
    'scripts/specifying/test/v39-promotion-readiness.test.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'package.json',
    'README.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    ...V39_GATE_ARTIFACTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 11 file: ${relativePath}`);
  }

  if (failures.length === 0 && !promotedPointer) {
    try {
      run(root, 'node', ['scripts/generate-v39-depository-supply-indexing.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-enterprise-reading-ux-state.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-read-need-review-resynthesis.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-read-fits-finding-runtime.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-assetpack-preview-quote-boundary.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-settlement-rights-delivery.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-operational-telemetry-repair-readback.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-interface-conversation-product-parity.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v39-local-staging-reading-rehearsal.mjs', '--check']);
      if (!promotedPointer) {
        run(root, 'node', ['scripts/generate-v39-promotion-readiness-report.mjs', '--check']);
      }
    } catch (error) {
      failures.push(`V39 Gate 11 artifact freshness check failed: ${error.stderr || error.message}`);
    }
  }

  const artifactText = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !artifactText.includes(marker), `${ARTIFACT_PATH} must not contain secret-shaped value ${marker}.`);
  }
  assertCheck(failures, !artifactText.includes('protectedSourceBody'), `${ARTIFACT_PATH} must not serialize protected source bodies.`);

  const artifact = artifactText ? JSON.parse(artifactText) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-promotion-readiness-report', 'Promotion readiness artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.commercialReadingPromotionReadinessReport.v1', 'Promotion readiness schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Promotion readiness must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Promotion readiness report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-commercial-reading-promotion-readiness-metadata',
      'Promotion readiness report must be source-safe commercial Reading promotion metadata.',
    );
    assertCheck(failures, artifact.prePromotionPosture === 'V38 active / V39 draft', 'Promotion readiness pre-promotion posture must match.');
    assertCheck(failures, artifact.postPromotionPosture === 'V39 active / V40 draft', 'Promotion readiness post-promotion posture must match.');
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
    assertCheck(failures, artifact.validationCommands.includes('pnpm run check:v39-gate11'), 'Promotion readiness must list check:v39-gate11.');
    assertCheck(
      failures,
      artifact.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V39 --commit HEAD --dry-run'),
      'Promotion readiness must list V39 promotion dry-run.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V39.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V39_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V39_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v39-canon-promotion.yml');
  const promoteScript = read(root, 'scripts/promote-bitcode-canon.mjs');
  const prepareSpecScript = read(root, 'scripts/prepare-bitcode-spec-family-promotion.mjs');
  const prepareRuntimeScript = read(root, 'scripts/prepare-bitcode-runtime-canon-promotion.mjs');
  const provenGenerator = read(root, 'scripts/specifying/src/canonical/proven-generator.js');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V39 promotion readiness canon'), 'V39 SPEC must define promotion readiness canon.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH) && spec.includes('V39 active / draft V40'), 'V39 SPEC must include Gate 11 artifact and post-promotion posture.');
  assertCheck(failures, delta.includes('Gate 11: V39 Promotion Readiness') && delta.includes(ARTIFACT_PATH), 'V39 DELTA must define Gate 11 closure acceptance and artifact.');
  assertCheck(failures, delta.includes('promotion scripts support V39'), 'V39 DELTA must state V39 promotion script support.');
  assertCheck(failures, notes.includes('Gate 11: V39 Promotion Readiness') && notes.includes('active V39 / draft V40'), 'V39 NOTES must carry Gate 11 post-promotion posture notes.');
  assertCheck(failures, parity.includes('## Gate 11 Promotion readiness parity') && parity.includes(ARTIFACT_PATH) && parity.includes('closed'), 'V39 PARITY must close Gate 11 artifact parity.');
  assertCheck(failures, roadmap.includes('V39 Gate 11 closure anchor'), 'Roadmap must include V39 Gate 11 closure anchor.');
  assertCheck(
    failures,
    packageJson.includes('"generate:v39-promotion-readiness"') &&
      packageJson.includes('"check:v39-promotion-readiness"') &&
      packageJson.includes('"check:v39-gate11"'),
    'package.json must expose V39 Gate 11 generator/check scripts.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('check-v39-gate11-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      gateWorkflow.includes('elif [ "$POINTER" = "V39" ]') &&
      gateWorkflow.includes('--active-canon V39 --draft-target V40'),
    'Gate-quality workflow must tolerate both V38-draft and V39-promoted states.',
  );
  assertCheck(
    failures,
    canonWorkflow.includes('check-v39-gate11-promotion-readiness.mjs --promotion-mode --skip-branch-check') &&
      canonWorkflow.includes('elif [ "$POINTER" = "V39" ]') &&
      canonWorkflow.includes('--active-canon V39 --draft-target V40'),
    'Canon-quality workflow must validate V39/V39 promoted posture.',
  );
  assertCheck(
    failures,
    promotionWorkflow.includes("head.ref == 'version/v39'") &&
      promotionWorkflow.includes('npm run promote:canon -- --version V39') &&
      promotionWorkflow.includes('check-v39-gate11-promotion-readiness.mjs --promotion-mode --skip-branch-check'),
    'V39 promotion workflow must validate Gate 11 and promote V39.',
  );
  assertCheck(
    failures,
    promoteScript.includes("if (version === 'V39')") &&
      promoteScript.includes('const v39Gate11Command') &&
      promoteScript.includes('buildDerivedV39CommitMessageBody') &&
      promoteScript.includes("version === 'V39'"),
    'Promotion script must support V39.',
  );
  assertCheck(
    failures,
    prepareSpecScript.includes("if (version === 'V39')") &&
      prepareSpecScript.includes('V39 canonical system specification for commercial Reading readiness') &&
      prepareSpecScript.includes(ARTIFACT_PATH),
    'Spec-family promotion preparation must support V39.',
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
    provenGenerator.includes('buildV39ProvenPackage') &&
      provenGenerator.includes('buildV39PromotionReadinessReport') &&
      provenGenerator.includes(ARTIFACT_PATH),
    'Proven generator must include V39 promotion package support.',
  );
  assertCheck(failures, protocolReadme.includes('V39 Gate 11') && protocolReadme.includes('V39` active, `V40` draft'), 'Protocol README must document V39 Gate 11.');
  assertCheck(failures, rootReadme.includes('check:v39-gate11') && rootReadme.includes('v39-canon-promotion.yml'), 'Root README must document V39 Gate 11 scripts/workflow.');

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v39-promotion-readiness.test.js']);
      run(root, 'node', ['scripts/promote-bitcode-canon.mjs', '--version', 'V39', '--commit', 'HEAD', '--dry-run']);
    } catch (error) {
      failures.push(`V39 Gate 11 package promotion tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 11 promotion readiness failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V39 Gate 11 promotion readiness ok artifacts=${V39_GATE_ARTIFACTS.length} root=${artifact?.artifactRoot || 'pending'}\n`);
}

main();
