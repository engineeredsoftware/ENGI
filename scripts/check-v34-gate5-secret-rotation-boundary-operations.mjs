#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v34-secret-rotation-boundary-operations.json';

const REQUIRED_FAMILY_IDS = [
  'model_provider_openai',
  'database_supabase_project',
  'deployment_vercel_project',
  'vcs_github_app',
  'wallet_signer_material',
  'object_storage_encryption',
  'webhook_signing',
  'mcp_server_auth',
  'chatgpt_app_auth',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  '-----BEGIN PRIVATE KEY-----',
  'wallet seed',
  'mnemonic',
  'raw source',
  'source contents',
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
      'Usage: node scripts/check-v34-gate5-secret-rotation-boundary-operations.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 5 Secret Rotation And Credential Boundary Operations source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V33',
    `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 5+ work must occur on version/v34 or v34/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/secret-rotation-plan.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/btd/__tests__/secret-rotation-plan.test.ts',
    'scripts/generate-v34-secret-rotation-boundary-operations.mjs',
    'scripts/check-v34-gate5-secret-rotation-boundary-operations.mjs',
    'specifications/BITCODE_SPEC_V34.md',
    'specifications/BITCODE_SPEC_V34_DELTA.md',
    'specifications/BITCODE_SPEC_V34_NOTES.md',
    'specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-secret-rotation-boundary-operations']);
    } catch (error) {
      failures.push(`V34 Gate 5 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 secret rotation artifact must not contain secret/source marker ${marker}.`);
  }
  assertCheck(
    failures,
    !/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serializedArtifact),
    'V34 secret rotation artifact must not contain env-assignment-shaped values.',
  );

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-secret-rotation-boundary-operations', 'Artifact id must match Gate 5 secret rotation.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.secretRotationBoundaryOperations.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-secret-rotation-boundary-metadata',
      'Artifact must be source-safe secret rotation metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredFamilyIds, REQUIRED_FAMILY_IDS), 'Artifact must enumerate every required secret family.');
    assertCheck(failures, includesAll(artifact.coverage.observedFamilyIds, REQUIRED_FAMILY_IDS), 'Artifact coverage must observe every family.');
    assertCheck(failures, artifact.coverage.familyCount === 9, 'Artifact must prove nine secret family rows.');
    assertCheck(failures, artifact.coverage.modelProviderCovered === true, 'OpenAI provider family must be covered.');
    assertCheck(failures, artifact.coverage.databaseCovered === true, 'Supabase database family must be covered.');
    assertCheck(failures, artifact.coverage.deploymentPlatformCovered === true, 'Vercel deployment family must be covered.');
    assertCheck(failures, artifact.coverage.repositoryProviderCovered === true, 'GitHub App family must be covered.');
    assertCheck(failures, artifact.coverage.walletSignerCovered === true, 'Wallet signer family must be covered.');
    assertCheck(failures, artifact.coverage.objectStorageCovered === true, 'Object storage family must be covered.');
    assertCheck(failures, artifact.coverage.webhookCovered === true, 'Webhook family must be covered.');
    assertCheck(failures, artifact.coverage.mcpCovered === true, 'MCP family must be covered.');
    assertCheck(failures, artifact.coverage.chatgptAppCovered === true, 'ChatGPT App family must be covered.');
    assertCheck(failures, artifact.coverage.rotationCommandsCovered === true, 'Rotation commands must be covered.');
    assertCheck(failures, artifact.coverage.ciMaskingCovered === true, 'CI masking must be covered.');
    assertCheck(failures, artifact.coverage.leakResponseCovered === true, 'Leak response must be covered.');
    assertCheck(failures, artifact.coverage.blastRadiusCovered === true, 'Blast-radius notes must be covered.');
    assertCheck(failures, artifact.coverage.runtimeAvailabilityCovered === true, 'Runtime availability checks must be covered.');
    assertCheck(failures, artifact.coverage.auditEventsCovered === true, 'Audit events must be covered.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Secret plan must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(
      failures,
      artifact.families.every((family) => /^v34-secret-rotation-family:[a-f0-9]{24}$/u.test(family.familyRoot)),
      'Secret family rows must have deterministic family roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Test evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const btdPackageJson = read(root, 'packages/btd/package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/btd/src/secret-rotation-plan.ts');
  const test = read(root, 'packages/btd/__tests__/secret-rotation-plan.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V34 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('SecretRotationPlan'), 'V34 docs must name SecretRotationPlan.');
    assertCheck(failures, doc.includes('OpenAI'), 'V34 docs must name OpenAI provider coverage.');
    assertCheck(failures, doc.includes('Supabase'), 'V34 docs must name Supabase coverage.');
    assertCheck(failures, doc.includes('Vercel'), 'V34 docs must name Vercel coverage.');
    assertCheck(failures, doc.includes('GitHub'), 'V34 docs must name GitHub coverage.');
    assertCheck(failures, doc.includes('wallet'), 'V34 docs must name wallet coverage.');
    assertCheck(failures, doc.includes('object storage'), 'V34 docs must name object storage coverage.');
    assertCheck(failures, doc.includes('webhook'), 'V34 docs must name webhook coverage.');
    assertCheck(failures, doc.includes('MCP'), 'V34 docs must name MCP coverage.');
    assertCheck(failures, doc.includes('ChatGPT App'), 'V34 docs must name ChatGPT App coverage.');
    assertCheck(failures, doc.includes('no secret values'), 'V34 docs must state no secret values are serialized.');
  }

  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:[6-9]|10)\b/u.test(roadmap),
    'Roadmap must track V34 Gate 6 or later after Gate 5 closure.',
  );
  assertCheck(
    failures,
    roadmap.includes('V34 Gate 5 closure anchor') || roadmap.includes('closed Gate 5 secret rotation'),
    'Roadmap must mark Gate 5 as closed.',
  );
  assertCheck(failures, packageJson.includes('generate:v34-secret-rotation-boundary-operations'), 'Root package scripts must include Gate 5 generator.');
  assertCheck(failures, packageJson.includes('check:v34-secret-rotation-boundary-operations'), 'Root package scripts must include Gate 5 artifact check.');
  assertCheck(failures, packageJson.includes('check:v34-gate5'), 'Root package scripts must include Gate 5 checker.');
  assertCheck(failures, btdPackageJson.includes('./secret-rotation-plan'), 'BTD package exports must expose secret-rotation-plan.');
  assertCheck(failures, workflow.includes('check-v34-gate5-secret-rotation-boundary-operations.mjs'), 'Gate quality workflow must run Gate 5 checker.');
  assertCheck(failures, workflow.includes('secret-rotation-plan.test.ts'), 'Gate quality workflow must run Gate 5 focused test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Canonical generated-artifact allowlist must include Gate 5 artifact.');
  assertCheck(failures, source.includes('SECRET_ROTATION_FAMILY_IDS'), 'Source must own required secret family ids.');
  assertCheck(failures, source.includes('buildSecretRotationPlan'), 'Source must expose buildSecretRotationPlan.');
  assertCheck(failures, source.includes('noSerializedSecretValues'), 'Source must prove noSerializedSecretValues.');
  assertCheck(failures, source.includes('valueBearingMainnetBlocked'), 'Source must prove valueBearingMainnetBlocked.');
  assertCheck(failures, test.includes('fails closed on serialized secret-shaped values'), 'Tests must prove secret-shaped values fail closed.');
  assertCheck(failures, test.includes('fails closed when CI masking posture is missing'), 'Tests must prove CI masking fail-closed posture.');

  if (failures.length > 0) {
    process.stderr.write('V34 Gate 5 Secret Rotation And Credential Boundary Operations check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V34 Gate 5 Secret Rotation And Credential Boundary Operations check passed.\n');
}

main();
