#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-mcp-api-tool-contracts.json';

const REQUIRED_TOOL_IDS = ['bitcode://pipelines/asset-pack/create'];
const REQUIRED_DENIED_STATES = [
  'MISSING_API_KEY',
  'INSUFFICIENT_PERMISSIONS',
  'PROVIDER_BINDING_REQUIRED',
  'SCHEMA_VALIDATION_FAILED',
  'RATE_LIMITED',
  'UNKNOWN_TOOL',
];
const REQUIRED_PROOF_ROOT_FIELDS = [
  'toolId',
  'inputSchemaId',
  'outputSchemaId',
  'authPolicyId',
  'requestRoot',
  'responseRoot',
  'writeAdmission',
];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
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
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v33-gate3-mcp-api-tool-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 3 MCP API tool contracts, package-derived discovery, schemas, auth/denial posture, proof roots, docs, tests, and workflow wiring.',
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
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-(?:[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 3+ work must occur on version/v33 or v33/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/mcp-tool-contract.ts',
    'packages/btd/__tests__/mcp-tool-contract.test.ts',
    'apps/mcp/src/tools/pipeline-tools.ts',
    'apps/mcp/src/__tests__/unit/mcp-tool-contract.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'scripts/generate-v33-mcp-api-tool-contracts.mjs',
    'scripts/check-v33-gate3-mcp-api-tool-contracts.mjs',
    'BITCODE_SPEC_V33.md',
    'BITCODE_SPEC_V33_DELTA.md',
    'BITCODE_SPEC_V33_NOTES.md',
    'BITCODE_SPEC_V33_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'packages/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-mcp-api-tool-contracts']);
    } catch (error) {
      failures.push(`V33 Gate 3 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 3 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-mcp-api-tool-contracts', 'Gate 3 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.mcpApiToolContracts.v1', 'Gate 3 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 3 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 3 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-mcp-api-tool-contract-metadata',
      'Gate 3 artifact must be source-safe MCP metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredToolIds, REQUIRED_TOOL_IDS), 'Gate 3 artifact must enumerate the required MCP tool id.');
    assertCheck(failures, includesAll(artifact.requiredDeniedStates, REQUIRED_DENIED_STATES), 'Gate 3 artifact must enumerate denied states.');
    assertCheck(failures, includesAll(artifact.requiredProofRootFields, REQUIRED_PROOF_ROOT_FIELDS), 'Gate 3 artifact must enumerate proof-root fields.');
    assertCheck(failures, artifact.coverage.toolDiscoveryPackageDerived === true, 'Gate 3 discovery must be package-derived.');
    assertCheck(failures, artifact.coverage.deniedStateCoverage === true, 'Gate 3 denied-state coverage must pass.');
    assertCheck(failures, artifact.coverage.proofRootCoverage === true, 'Gate 3 proof-root coverage must pass.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 3 must keep protected source invisible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 3 artifact must not serialize credentials.');
    assertCheck(
      failures,
      artifact.contracts.every((contract) =>
        contract.requiredPermissions.includes('pipelines.create') &&
        contract.deniedStates.includes('SCHEMA_VALIDATION_FAILED') &&
        contract.deniedStates.includes('INSUFFICIENT_PERMISSIONS'),
      ),
      'Gate 3 contracts must require pipelines.create and schema/permission denials.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 3 source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 3 test evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V33.md');
  const delta = read(root, 'BITCODE_SPEC_V33_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V33_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V33_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const btdSource = read(root, 'packages/btd/src/mcp-tool-contract.ts');
  const mcpSource = read(root, 'apps/mcp/src/tools/pipeline-tools.ts');
  const btdTest = read(root, 'packages/btd/__tests__/mcp-tool-contract.test.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/mcp-tool-contract.test.ts');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V33 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('McpToolContract'), 'V33 docs must name McpToolContract.');
    assertCheck(failures, doc.includes('bitcode://pipelines/asset-pack/create'), 'V33 docs must name the AssetPack create tool id.');
    assertCheck(failures, doc.includes('SCHEMA_VALIDATION_FAILED'), 'V33 docs must name schema validation denial.');
  }

  assertCheck(
    failures,
    /Current working gate: V33 Gate (?:[3-9]|10)\b/u.test(roadmap),
    'Roadmap must track V33 Gate 3 or later as the current working gate.',
  );
  assertCheck(failures, packageJson.includes('"generate:v33-mcp-api-tool-contracts"'), 'package.json must expose the Gate 3 generator.');
  assertCheck(failures, packageJson.includes('"check:v33-mcp-api-tool-contracts"'), 'package.json must expose the Gate 3 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v33-gate3"'), 'package.json must expose check:v33-gate3.');
  assertCheck(failures, workflow.includes('check-v33-gate3-mcp-api-tool-contracts.mjs'), 'Gate workflow must run the V33 Gate 3 checker.');
  assertCheck(failures, workflow.includes('mcp-tool-contract.test.ts'), 'Gate workflow must run MCP tool contract tests.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Spec-family profile must include the Gate 3 artifact path.');

  for (const phrase of [
    'buildBtdMcpToolContractRegistry',
    'BTD_MCP_TOOL_CONTRACT_IDS',
    'SCHEMA_VALIDATION_FAILED',
    'PROVIDER_BINDING_REQUIRED',
    'source-safe-preview-and-metadata-before-settlement',
  ]) {
    assertCheck(failures, btdSource.includes(phrase), `Gate 3 BTD source must include ${phrase}.`);
  }
  for (const phrase of [
    'getBtdMcpToolContract',
    'assetPackCreateContract.toolId',
    'assetPackCreateContract.description',
  ]) {
    assertCheck(failures, mcpSource.includes(phrase), `Gate 3 MCP source must include ${phrase}.`);
  }
  for (const phrase of [
    'publishes the package-owned AssetPack create tool contract',
    'fails closed when the required MCP tool id is missing',
    'fails closed when proof-root fields omit a required field',
  ]) {
    assertCheck(failures, btdTest.includes(phrase), `Gate 3 BTD test must assert: ${phrase}.`);
  }
  for (const phrase of [
    'discovers the AssetPack create tool from the package-owned BTD contract',
    'rejects invalid MCP tool input before execution',
    'declares source-safe output fields and proof roots for MCP responses',
  ]) {
    assertCheck(failures, mcpTest.includes(phrase), `Gate 3 MCP test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V33 Gate 3 MCP API tool contract check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V33 Gate 3 MCP API tool contracts ok artifact=${ARTIFACT}\n`);
}

main();
