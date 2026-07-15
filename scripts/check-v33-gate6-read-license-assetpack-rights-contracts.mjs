#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV33ReadLicenseAssetPackRightsContractsArtifact } from './generate-v33-read-license-assetpack-rights-contracts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-read-license-assetpack-rights-contracts.json';

const REQUIRED_SURFACES = ['api', 'mcp', 'chatgpt_app', 'terminal'];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
];

function parseArgs(argv) {
  const args = { skipBranchCheck: false, repoRoot: defaultRepoRoot, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

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

function includesAll(values, required) {
  return required.every((value) => values.includes(value));
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v33-gate6-read-license-assetpack-rights-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 6 ReadLicense and AssetPackRights source, tests, docs, generated artifact, and workflow wiring.',
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
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-(?:[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 6+ work must occur on version/v33 or v33/gate-6..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/read-license-assetpack-rights-contract.ts',
    'packages/btd/__tests__/read-license-assetpack-rights-contract.test.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'scripts/generate-v33-read-license-assetpack-rights-contracts.mjs',
    'scripts/check-v33-gate6-read-license-assetpack-rights-contracts.mjs',
    '.specifications/BITCODE_SPEC_V33.md',
    '.specifications/BITCODE_SPEC_V33_DELTA.md',
    '.specifications/BITCODE_SPEC_V33_NOTES.md',
    '.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-read-license-assetpack-rights-contracts']);
      const artifact = JSON.parse(read(root, ARTIFACT));
      const expected = buildV33ReadLicenseAssetPackRightsContractsArtifact();
      assertCheck(
        failures,
        stableStringify(artifact) === stableStringify(expected),
        'V33 Gate 6 artifact must be generated from the current generator.',
      );
    } catch (error) {
      failures.push(`V33 Gate 6 artifact generation failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 6 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-read-license-assetpack-rights-contracts', 'Gate 6 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.readLicenseAssetPackRightsContracts.v1', 'Gate 6 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 6 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 6 artifact must pass.');
    assertCheck(failures, includesAll(artifact.requiredSurfaces, REQUIRED_SURFACES), 'Gate 6 artifact must enumerate required surfaces.');
    assertCheck(failures, artifact.missingSurfaces.length === 0, 'Gate 6 artifact must not miss required surfaces.');
    assertCheck(failures, artifact.coverage.readRequest === true, 'Gate 6 must cover Read request roots.');
    assertCheck(failures, artifact.coverage.reviewedNeed === true, 'Gate 6 must cover reviewed Need roots.');
    assertCheck(failures, artifact.coverage.findingFitsAdmission === true, 'Gate 6 must cover Finding Fits admission.');
    assertCheck(failures, artifact.coverage.sourceSafePreview === true, 'Gate 6 must cover source-safe previews.');
    assertCheck(failures, artifact.coverage.feeQuote === true, 'Gate 6 must cover fee quotes.');
    assertCheck(failures, artifact.coverage.readLicensePosture === true, 'Gate 6 must cover read license posture.');
    assertCheck(failures, artifact.coverage.paidUnpaidDenial === true, 'Gate 6 must cover paid/unpaid denial.');
    assertCheck(failures, artifact.coverage.btdRange === true, 'Gate 6 must cover BTD ranges.');
    assertCheck(failures, artifact.coverage.btcSettlement === true, 'Gate 6 must cover BTC settlement posture.');
    assertCheck(failures, artifact.coverage.deliveryAdmission === true, 'Gate 6 must cover delivery admission.');
    assertCheck(failures, artifact.coverage.rightsTransferProjection === true, 'Gate 6 must cover rights transfer projection.');
    assertCheck(failures, artifact.coverage.preSettlementProtectedSourceLocked === true, 'Gate 6 must lock source before settlement.');
    assertCheck(failures, artifact.coverage.paidDeliveryAdmittedAfterFinality === true, 'Gate 6 must admit delivery after BTC finality.');
    assertCheck(failures, artifact.coverage.sharedFixturesAcrossApiMcpChatGptAndTerminal === true, 'Gate 6 must share fixtures across surfaces.');
    assertCheck(failures, artifact.coverage.protectedSourceSerialized === false, 'Gate 6 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 6 artifact must not serialize credentials.');
  }

  const btdSource = read(root, 'packages/btd/src/read-license-assetpack-rights-contract.ts');
  const btdTest = read(root, 'packages/btd/__tests__/read-license-assetpack-rights-contract.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const specs = [
    read(root, '.specifications/BITCODE_SPEC_V33.md'),
    read(root, '.specifications/BITCODE_SPEC_V33_DELTA.md'),
    read(root, '.specifications/BITCODE_SPEC_V33_NOTES.md'),
    read(root, '.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md'),
    read(root, '.specifications/SPECIFICATIONS_ROADMAP.md'),
  ].join('\n');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const packageJson = read(root, 'package.json');
  const protocolSpecifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  assertCheck(failures, btdSource.includes('buildBtdReadLicenseInterfaceContract'), 'BTD source must build ReadLicenseInterfaceContract.');
  assertCheck(failures, btdSource.includes('buildBtdAssetPackRightsInterfaceContract'), 'BTD source must build AssetPackRightsInterfaceContract.');
  assertCheck(failures, btdSource.includes('buildBtdReadLicenseAssetPackRightsInterfaceRegistry'), 'BTD source must build the shared registry.');
  assertCheck(failures, btdSource.includes('LOCKED_SOURCE_UNPAID'), 'BTD source must fail closed on unpaid locked source.');
  assertCheck(failures, btdTest.includes('admits paid delivery only after confirmed BTC finality and rights transfer'), 'BTD tests must cover paid finality delivery.');
  assertCheck(failures, btdTest.includes('rejects secret-shaped fixture strings'), 'BTD tests must reject secret-shaped strings.');
  assertCheck(failures, apiTest.includes('api-read-license-source-safe-preview'), 'API tests must share Gate 6 fixture.');
  assertCheck(failures, mcpTest.includes('mcp-finding-fits-source-safe-preview'), 'MCP tests must share Gate 6 fixture.');
  assertCheck(failures, chatgptTest.includes('chatgpt-unpaid-delivery-denied'), 'ChatGPT tests must share Gate 6 fixture.');
  assertCheck(failures, terminalTest.includes('terminal-paid-rights-delivery'), 'product tests must share Gate 6 fixture.');
  assertCheck(failures, specs.includes('V33 Gate 6 Read License And AssetPack Rights Interface Contracts'), 'Spec/roadmap must describe Gate 6 as current work.');
  assertCheck(failures, packageJson.includes('check:v33-gate6'), 'package.json must expose check:v33-gate6.');
  assertCheck(failures, workflow.includes('check-v33-gate6-read-license-assetpack-rights-contracts.mjs'), 'Gate workflow must run Gate 6 checker.');
  assertCheck(failures, workflow.includes('__tests__/read-license-assetpack-rights-contract.test.ts'), 'Gate workflow must run Gate 6 BTD test.');
  assertCheck(failures, protocolSpecifying.includes(ARTIFACT), 'Protocol specifying must include Gate 6 generated artifact.');

  if (failures.length) {
    process.stderr.write(`V33 Gate 6 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write('V33 Gate 6 ReadLicense/AssetPackRights contracts check passed.\n');
}

main();
