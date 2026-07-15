#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV33InterfaceAuthorizationPolicyArtifact } from './generate-v33-interface-authorization-policy.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-interface-authorization-policy.json';

const REQUIRED_SURFACES = ['api', 'mcp', 'chatgpt_app', 'terminal'];
const REQUIRED_DENIAL_CODES = [
  'MISSING_AUTH_ISSUER',
  'STALE_AUTHORITY',
  'MISSING_ACTOR',
  'MISSING_ORGANIZATION',
  'MISSING_TEAM',
  'MISSING_ROLE',
  'ORGANIZATION_AUTHORITY_DENIED',
  'WALLET_CAPABILITY_REQUIRED',
  'READ_LICENSE_REQUIRED',
  'ASSET_PACK_RIGHTS_REQUIRED',
  'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
  'REPAIR_APPROVAL_REQUIRED',
];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
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
      'Usage: node scripts/check-v33-gate5-interface-authorization-policy.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 5 InterfaceAuthorizationPolicy source, tests, docs, generated artifact, and workflow wiring.',
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
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-(?:[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 5+ work must occur on version/v33 or v33/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/interface-authorization-policy.ts',
    'packages/btd/__tests__/interface-authorization-policy.test.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/mcp/src/tools/pipeline-tools.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/tools.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'scripts/generate-v33-interface-authorization-policy.mjs',
    'scripts/check-v33-gate5-interface-authorization-policy.mjs',
    'specifications/BITCODE_SPEC_V33.md',
    'specifications/BITCODE_SPEC_V33_DELTA.md',
    'specifications/BITCODE_SPEC_V33_NOTES.md',
    'specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-interface-authorization-policy']);
      const artifact = JSON.parse(read(root, ARTIFACT));
      const expected = buildV33InterfaceAuthorizationPolicyArtifact();
      assertCheck(
        failures,
        stableStringify(artifact) === stableStringify(expected),
        'V33 Gate 5 artifact must be generated from the current generator.',
      );
    } catch (error) {
      failures.push(`V33 Gate 5 artifact generation failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 5 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-interface-authorization-policy', 'Gate 5 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.interfaceAuthorizationPolicy.v1', 'Gate 5 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 5 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 5 artifact must pass.');
    assertCheck(failures, includesAll(artifact.requiredSurfaces, REQUIRED_SURFACES), 'Gate 5 artifact must enumerate required surfaces.');
    assertCheck(failures, artifact.missingSurfaces.length === 0, 'Gate 5 artifact must not miss required surfaces.');
    assertCheck(failures, includesAll(artifact.requiredDenialCodes, REQUIRED_DENIAL_CODES), 'Gate 5 artifact must enumerate denial codes.');
    assertCheck(failures, artifact.coverage.authIssuer === true, 'Gate 5 must cover auth issuer.');
    assertCheck(failures, artifact.coverage.organizationTeamRole === true, 'Gate 5 must cover organization/team/role.');
    assertCheck(failures, artifact.coverage.walletCapability === true, 'Gate 5 must cover wallet capability.');
    assertCheck(failures, artifact.coverage.readLicensePosture === true, 'Gate 5 must cover read-license posture.');
    assertCheck(failures, artifact.coverage.assetPackRights === true, 'Gate 5 must cover AssetPack rights.');
    assertCheck(failures, artifact.coverage.protectedSourceDisclosure === true, 'Gate 5 must cover locked disclosure.');
    assertCheck(failures, artifact.coverage.repairPosture === true, 'Gate 5 must cover repair posture.');
    assertCheck(failures, artifact.coverage.missingOrStaleAuthorityFailsClosed === true, 'Gate 5 must fail closed on missing/stale authority.');
    assertCheck(failures, artifact.coverage.sharedFixturesAcrossApiMcpChatGptAndTerminal === true, 'Gate 5 must share fixtures across surfaces.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 5 must not expose locked source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 5 artifact must not serialize credentials.');
  }

  const btdSource = read(root, 'packages/btd/src/interface-authorization-policy.ts');
  const chatgptSource = read(root, 'apps/chatgpt/src/tools.ts');
  const mcpSource = read(root, 'apps/mcp/src/tools/pipeline-tools.ts');
  const btdTest = read(root, 'packages/btd/__tests__/interface-authorization-policy.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const specs = [
    read(root, 'specifications/BITCODE_SPEC_V33.md'),
    read(root, 'specifications/BITCODE_SPEC_V33_DELTA.md'),
    read(root, 'specifications/BITCODE_SPEC_V33_NOTES.md'),
    read(root, 'specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md'),
    read(root, 'specifications/SPECIFICATIONS_ROADMAP.md'),
  ].join('\n');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const packageJson = read(root, 'package.json');
  const protocolSpecifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  assertCheck(failures, btdSource.includes('buildBtdInterfaceAuthorizationPolicy'), 'BTD source must build InterfaceAuthorizationPolicy.');
  assertCheck(failures, btdSource.includes('renderBtdInterfaceAuthorizationDeniedState'), 'BTD source must render readable denied states.');
  assertCheck(failures, chatgptSource.includes('interfaceAuthorizationPolicy'), 'ChatGPT App writes must carry InterfaceAuthorizationPolicy metadata.');
  assertCheck(failures, mcpSource.includes('mcp-pipeline-create-request-finding-fits'), 'MCP pipeline writes must use InterfaceAuthorizationPolicy admission.');
  assertCheck(failures, btdTest.includes('fails closed with readable repair posture for stale authority'), 'BTD tests must cover stale authority fail-closed posture.');
  assertCheck(failures, apiTest.includes('api-request-read-allowed'), 'API tests must share Gate 5 fixture.');
  assertCheck(failures, mcpTest.includes('mcp-finding-fits-allowed'), 'MCP tests must share Gate 5 fixture.');
  assertCheck(failures, chatgptTest.includes('chatgpt-delivery-allowed'), 'ChatGPT tests must share Gate 5 fixture.');
  assertCheck(failures, terminalTest.includes('terminal-stale-authority-denied'), 'Terminal tests must share stale authority denial fixture.');
  assertCheck(failures, specs.includes('V33 Gate 5 Interface Authorization Policy Fail-Closed'), 'Spec/roadmap must describe Gate 5 as current work.');
  assertCheck(failures, packageJson.includes('check:v33-gate5'), 'package.json must expose check:v33-gate5.');
  assertCheck(failures, workflow.includes('check-v33-gate5-interface-authorization-policy.mjs'), 'Gate workflow must run Gate 5 checker.');
  assertCheck(failures, workflow.includes('__tests__/interface-authorization-policy.test.ts'), 'Gate workflow must run Gate 5 BTD test.');
  assertCheck(failures, protocolSpecifying.includes(ARTIFACT), 'Protocol specifying must include Gate 5 generated artifact.');

  if (failures.length) {
    process.stderr.write(`V33 Gate 5 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write('V33 Gate 5 InterfaceAuthorizationPolicy check passed.\n');
}

main();
