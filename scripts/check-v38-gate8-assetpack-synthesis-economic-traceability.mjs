#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v38/assetpack-synthesis-economic-traceability.json';

const REQUIRED_ROW_IDS = [
  'handoff:selected-fits-to-assetpack-synthesis',
  'preview:source-safe-before-settlement',
  'disclosure:protected-source-leak-scan',
  'pricing:share-to-fee-preview',
  'receipts:btd-assetpack-mint-read-rights',
  'compensation:source-to-shares-contributor-allocation',
  'settlement:unlock-and-post-settlement-delivery',
  'reconciliation:ledger-database-object-storage-repair',
  'harness:evidence-and-telemetry-projection',
];

const REQUIRED_RECEIPT_FIELDS = [
  'acceptedNeedRoot',
  'findingFitsResultRoot',
  'selectedFitProvenanceRoot',
  'assetPackId',
  'sourceSafePreviewRoot',
  'feeQuoteRoot',
  'sourceManifestRoot',
  'accessPolicyHash',
  'btdRange',
  'btcFeeReceiptId',
  'assetPackMintReceiptRoot',
  'readReceiptRoot',
  'rightsTransferReceiptRoot',
  'settlementConservationRoot',
  'ledgerProjectionRoot',
  'deliveryAdmissionRoot',
  'repairPlanRoot',
  'telemetryRoot',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1Ni'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
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

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
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
      'Usage: node scripts/check-v38-gate8-assetpack-synthesis-economic-traceability.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V38 Gate 8 AssetPack synthesis handoff, source-safe preview, BTD receipts, contributor compensation, ledger/database reconciliation, repair posture, docs, and workflow wiring.',
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

  assertCheck(
    failures,
    pointer === 'V37',
    `BITCODE_SPEC.txt must remain V37 during V38 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-(?:[8-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 8+ work must occur on version/v38 or v38/gate-8..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.proofs/v38/disclosure-boundary-report.json',
    '.proofs/v38/read-need-comprehension-inference-hardening.json',
    '.proofs/v38/read-fits-finding-search-embeddings.json',
    'scripts/specifying/src/canonical/assetpack-synthesis-economic-traceability.js',
    'scripts/specifying/test/v38-assetpack-synthesis-economic-traceability.test.js',
    'scripts/generate-v38-assetpack-synthesis-economic-traceability.mjs',
    'scripts/check-v38-gate8-assetpack-synthesis-economic-traceability.mjs',
    'packages/asset-packs-pipelines/syntheses/read/src/read-need.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/depository-search.ts',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
    'packages/btd/src/receipts.ts',
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/settlement.ts',
    'packages/btd/src/reconciliation.ts',
    'packages/btd/__tests__/asset-pack-economic-traceability.test.ts',
    'packages/btd/__tests__/source-to-shares.test.ts',
    'packages/btd/__tests__/reconciliation.test.ts',
    'packages/btd/__tests__/btd.test.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/postprocess.test.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/asset-pack-disclosure.test.ts',
    '.specifications/BITCODE_SPEC_V38.md',
    '.specifications/BITCODE_SPEC_V38_DELTA.md',
    '.specifications/BITCODE_SPEC_V38_NOTES.md',
    '.specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-assetpack-synthesis-economic-traceability.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 AssetPack economic traceability artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v38-assetpack-synthesis-economic-traceability.test.js',
      ]);
    } catch (error) {
      failures.push(`V38 AssetPack economic traceability protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/btd',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        '__tests__/asset-pack-economic-traceability.test.ts',
        '__tests__/source-to-shares.test.ts',
        '__tests__/reconciliation.test.ts',
        '__tests__/btd.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/postprocess.test.ts',
        'src/__tests__/asset-pack-disclosure.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/pipeline-hosts',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/asset-pack-host-plan.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`AssetPack economic traceability package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 Gate 8 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-assetpack-synthesis-economic-traceability', 'Gate 8 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.assetPackSynthesisEconomicTraceability.v1', 'Gate 8 schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Gate 8 artifact must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Gate 8 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-assetpack-synthesis-economic-traceability-metadata',
      'Gate 8 artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.rowIds, REQUIRED_ROW_IDS), 'Gate 8 artifact must cover all economic traceability rows.');
    assertCheck(failures, includesAll(artifact.requiredReceiptFields, REQUIRED_RECEIPT_FIELDS), 'Gate 8 artifact must cover all required receipt fields.');
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 8 row count must be 9.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Gate 8 artifact must have no failed predicates.');
    assertCheck(failures, artifact.coverage.selectedFitsToAssetPackSynthesisCovered === true, 'Gate 8 must cover selected fit handoff.');
    assertCheck(failures, artifact.coverage.sourceSafePreviewBeforeSettlementCovered === true, 'Gate 8 must cover source-safe preview.');
    assertCheck(failures, artifact.coverage.protectedSourceLeakScanCovered === true, 'Gate 8 must cover protected source leak scanning.');
    assertCheck(failures, artifact.coverage.deterministicShareToFeeQuoteCovered === true, 'Gate 8 must cover deterministic share-to-fee quote.');
    assertCheck(failures, artifact.coverage.btdMintReadRightsReceiptsCovered === true, 'Gate 8 must cover BTD mint/read/rights receipts.');
    assertCheck(failures, artifact.coverage.contributorCompensationCovered === true, 'Gate 8 must cover contributor compensation.');
    assertCheck(failures, artifact.coverage.settlementUnlockAndDeliveryBoundaryCovered === true, 'Gate 8 must cover post-settlement delivery boundary.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseSynchronizationCovered === true, 'Gate 8 must cover ledger/database synchronization.');
    assertCheck(failures, artifact.coverage.proofReceiptsCovered === true, 'Gate 8 must cover proof receipts.');
    assertCheck(failures, artifact.coverage.repairPathsCovered === true, 'Gate 8 must cover repair paths.');
    assertCheck(failures, artifact.coverage.sourceToSharesConservationCovered === true, 'Gate 8 must cover source-to-shares conservation.');
    assertCheck(failures, artifact.coverage.harnessEvidenceProjectionCovered === true, 'Gate 8 must cover harness evidence projection.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 8 artifact must be metadata-only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Wallet private material must not be visible.');
    assertCheck(failures, artifact.coverage.privateSettlementPayloadVisible === false, 'Private settlement payloads must not be visible.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 8 artifact must not point at _legacy roots.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V38.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');

  assertCheck(failures, spec.includes('V38AssetPackSynthesisEconomicTraceability'), 'V38 spec must name the Gate 8 report.');
  assertCheck(failures, delta.includes('Gate 8: AssetPack Synthesis Handoff And Economic Traceability'), 'V38 delta must include Gate 8.');
  assertCheck(failures, notes.includes('V38AssetPackSynthesisEconomicTraceability'), 'V38 notes must name the Gate 8 report.');
  assertCheck(failures, parity.includes('| AssetPack synthesis handoff and economic traceability | Gate 8 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 8 row.');
  assertCheck(failures, roadmap.includes('V38 Gate 8 closure anchor'), 'Roadmap must include the Gate 8 closure anchor.');
  assertCheck(failures, readme.includes('check:v38-gate8'), 'README must document the Gate 8 check.');
  assertCheck(failures, protocolReadme.includes('v38-assetpack-synthesis-economic-traceability'), 'Protocol README must document the Gate 8 artifact.');
  assertCheck(failures, packageJson.includes('check:v38-gate8') && packageJson.includes('generate:v38-assetpack-synthesis-economic-traceability'), 'package.json must expose Gate 8 scripts.');
  assertCheck(failures, gateWorkflow.includes('check:v38-gate8') && gateWorkflow.includes('v38-assetpack-synthesis-economic-traceability.test.js'), 'Gate workflow must run Gate 8 checks/tests.');
  assertCheck(failures, canonWorkflow.includes('check:v38-gate8'), 'Canon workflow must run Gate 8 check.');
  assertCheck(failures, index.includes('buildV38AssetPackSynthesisEconomicTraceability'), 'Protocol JS index must export Gate 8 builder.');
  assertCheck(failures, typeDefs.includes('buildV38AssetPackSynthesisEconomicTraceability'), 'Protocol type index must export Gate 8 builder.');

  if (failures.length) {
    process.stderr.write('V38 Gate 8 AssetPack synthesis economic traceability check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 8 AssetPack economic traceability ok rows=9 receipts=18\n');
}

main();
