#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v35-telemetry-documentation-interface-integration.json';

const REQUIRED_INTEGRATION_IDS = [
  'terminal',
  'auxillaries',
  'api',
  'mcp_api',
  'chatgpt_app',
  'package_readmes',
  'internal_docs',
  'public_docs',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
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
      'Usage: node scripts/check-v35-gate8-telemetry-documentation-interface-integration.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 8 TelemetryDocumentationInterfaceIntegration source, generated artifact, tests, specs, docs, and workflow wiring.',
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
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-(?:[8-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 8+ work must occur on version/v35 or v35/gate-8..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/telemetry-documentation-interface-integration.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v35-telemetry-documentation-interface-integration.test.js',
    'scripts/generate-v35-telemetry-documentation-interface-integration.mjs',
    'scripts/check-v35-gate8-telemetry-documentation-interface-integration.mjs',
    'packages/specifying/src/canonical/v21-specifying.js',
    'BITCODE_SPEC_V35.md',
    'BITCODE_SPEC_V35_DELTA.md',
    'BITCODE_SPEC_V35_NOTES.md',
    'BITCODE_SPEC_V35_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'apps/uapi/app/terminal/README.md',
    'apps/uapi/app/auxillaries/README.md',
    'packages/api/README.md',
    'apps/mcp/README.md',
    'apps/chatgpt/README.md',
    'internal-docs/README.md',
    'apps/uapi/app/docs/bitcode-docs-content.ts',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-telemetry-documentation-interface-integration']);
    } catch (error) {
      failures.push(`V35 telemetry documentation interface integration artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'packages/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v35-telemetry-documentation-interface-integration.test.js',
      ]);
    } catch (error) {
      failures.push(`V35 telemetry documentation interface integration package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 telemetry documentation interface integration must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-telemetry-documentation-interface-integration', 'Interface integration artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.telemetryDocumentationInterfaceIntegration.v1', 'Interface integration schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Interface integration must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Interface integration report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-interface-integration-metadata',
      'Interface integration report must be source-safe interface integration metadata.',
    );
    assertCheck(failures, includesAll(artifact.coverage.observedIntegrationIds, REQUIRED_INTEGRATION_IDS), 'Interface integration must cover every required surface.');
    assertCheck(failures, artifact.coverage.integrationCount === REQUIRED_INTEGRATION_IDS.length, 'Interface integration must prove eight rows.');
    assertCheck(failures, artifact.coverage.terminalCovered === true, 'Interface integration must cover Terminal.');
    assertCheck(failures, artifact.coverage.auxillariesCovered === true, 'Interface integration must cover Auxillaries.');
    assertCheck(failures, artifact.coverage.apiCovered === true, 'Interface integration must cover API.');
    assertCheck(failures, artifact.coverage.mcpApiCovered === true, 'Interface integration must cover MCP API.');
    assertCheck(failures, artifact.coverage.chatGptAppCovered === true, 'Interface integration must cover ChatGPT App.');
    assertCheck(failures, artifact.coverage.packageReadmesCovered === true, 'Interface integration must cover package READMEs.');
    assertCheck(failures, artifact.coverage.internalDocsCovered === true, 'Interface integration must cover internal docs.');
    assertCheck(failures, artifact.coverage.publicDocsCovered === true, 'Interface integration must cover public docs.');
    assertCheck(failures, artifact.coverage.missingSourceRoots.length === 0, 'Interface integration must have no missing source roots.');
    assertCheck(failures, artifact.coverage.rowsMissingDocsLinks.length === 0, 'Interface integration rows must have docs links.');
    assertCheck(failures, artifact.coverage.rowsMissingEventIds.length === 0, 'Interface integration rows must have event ids.');
    assertCheck(failures, artifact.coverage.rowsMissingProofRoots.length === 0, 'Interface integration rows must have proof roots.');
    assertCheck(failures, artifact.coverage.rowsMissingRunbooks.length === 0, 'Interface integration rows must have runbook links.');
    assertCheck(failures, artifact.coverage.rowsMissingRedactionPosture.length === 0, 'Interface integration rows must have redaction posture.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Interface integration must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Interface integration must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Interface integration must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Interface integration must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Interface integration must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^telemetry-docs-interface-row:[a-f0-9]{24}$/u.test(row.integrationRoot)),
      'Interface integration rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.allowedPayloadFields.includes('eventIds') && row.allowedPayloadFields.includes('proofRoots') && row.allowedPayloadFields.includes('docsLinks') && row.allowedPayloadFields.includes('runbookLinks') && row.allowedPayloadFields.includes('redactionPosture')),
      'Interface integration rows must expose event ids, proof roots, docs links, runbook links, and redaction posture as allowed fields.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Interface integration source evidence roots must exist.',
    );
  }

  const protocolIndex = read(root, 'packages/specifying/src/index.js');
  assertCheck(failures, protocolIndex.includes('buildTelemetryDocumentationInterfaceIntegration'), 'Protocol index must export buildTelemetryDocumentationInterfaceIntegration.');

  const packageTypes = read(root, 'packages/specifying/src/index.d.ts');
  assertCheck(failures, packageTypes.includes('buildTelemetryDocumentationInterfaceIntegration'), 'Protocol type surface must export buildTelemetryDocumentationInterfaceIntegration.');

  const packageJson = read(root, 'package.json');
  assertCheck(failures, packageJson.includes('check:v35-gate8'), 'package.json must expose check:v35-gate8.');
  assertCheck(failures, packageJson.includes('generate:v35-telemetry-documentation-interface-integration'), 'package.json must expose interface integration generator.');

  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  assertCheck(failures, workflow.includes('check-v35-gate8-telemetry-documentation-interface-integration.mjs'), 'Gate workflow must run V35 Gate 8 checker when present.');
  assertCheck(failures, workflow.includes('test/v35-telemetry-documentation-interface-integration.test.js'), 'Gate workflow must run V35 interface integration package test.');

  const spec = read(root, 'BITCODE_SPEC_V35.md');
  assertCheck(failures, spec.includes('V35 TelemetryDocumentationInterfaceIntegration canon'), 'V35 spec must include TelemetryDocumentationInterfaceIntegration canon section.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH), 'V35 spec must name interface integration artifact.');

  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  assertCheck(failures, roadmap.includes('V35 Gate 8 closure anchor'), 'Roadmap must include V35 Gate 8 closure anchor.');

  const activeSurfaceText = [
    'apps/uapi/app/terminal/README.md',
    'apps/uapi/app/auxillaries/README.md',
    'packages/api/README.md',
    'apps/mcp/README.md',
    'apps/chatgpt/README.md',
    'internal-docs/README.md',
    'apps/uapi/app/docs/bitcode-docs-content.ts',
  ].map((relativePath) => read(root, relativePath)).join('\n');
  for (const token of ['event ids', 'proof roots', 'docs links', 'runbook links', 'redaction posture']) {
    assertCheck(failures, activeSurfaceText.includes(token), `Active interface docs must mention ${token}.`);
  }

  if (failures.length > 0) {
    process.stderr.write(`V35 Gate 8 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V35 Gate 8 telemetry documentation interface integration check passed for ${root}\n`);
}

main();
