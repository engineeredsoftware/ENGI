#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-interface-conversation-product-parity.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'Oi', 'JIUzI1Ni'].join(''),
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

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    skipInterfaceTests: false,
    repoRoot: defaultRepoRoot,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-interface-tests') args.skipInterfaceTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v39-gate9-interface-conversation-product-parity.mjs [--skip-branch-check] [--skip-package-tests] [--skip-interface-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 9 interface and Conversation product parity, no-bypass posture, generated artifact freshness, docs, workflows, and focused tests.',
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
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-(?:9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 9+ work must occur on version/v39 or v39/gate-9..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/reading-interface-product-parity.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-interface-product-parity.test.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'apps/uapi/tests/api/conversationReadingInterfaceParity.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
    'scripts/specifying/src/canonical/v39-interface-conversation-product-parity.js',
    'scripts/specifying/test/v39-interface-conversation-product-parity.test.js',
    'scripts/generate-v39-interface-conversation-product-parity.mjs',
    'scripts/check-v39-gate9-interface-conversation-product-parity.mjs',
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-interface-conversation-product-parity.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 interface and Conversation product parity artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v39-interface-conversation-product-parity.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 interface and Conversation product parity protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/reading-interface-product-parity.test.ts',
        'src/__tests__/postprocess.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 interface and Conversation product parity package tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipInterfaceTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/api/conversationReadingInterfaceParity.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--dir',
        'apps/mcp',
        'run',
        'test:mcp',
        '--',
        '--runTestsByPath',
        'src/__tests__/unit/pipeline-ingress-contract.test.ts',
        '--runInBand',
      ]);
      run(root, 'pnpm', [
        '--dir',
        'packages/chatgptapp',
        'exec',
        'jest',
        '--runTestsByPath',
        'src/__tests__/chatgpt-action-contract.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 interface and Conversation product parity interface tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 9 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-interface-conversation-product-parity', 'Gate 9 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.interfaceConversationProductParity.v1', 'Gate 9 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 9 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 9 artifact must pass.');
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 9 must cover nine interface parity rows.');
    assertCheck(failures, artifact.coverage.runtimeType === 'ReadingInterfaceProductParity', 'Gate 9 must cover ReadingInterfaceProductParity.');
    assertCheck(failures, artifact.coverage.surfaces.includes('conversation'), 'Gate 9 must cover Conversation.');
    assertCheck(failures, artifact.coverage.surfaces.includes('mcp_api'), 'Gate 9 must cover MCP.');
    assertCheck(failures, artifact.coverage.surfaces.includes('chatgpt_app'), 'Gate 9 must cover ChatGPT App.');
    assertCheck(failures, artifact.coverage.surfaces.includes('package_consumer'), 'Gate 9 must cover package consumers.');
    assertCheck(failures, artifact.coverage.stageIds.includes('accepted-need-gate'), 'Gate 9 must cover accepted Need gating.');
    assertCheck(failures, artifact.coverage.stageIds.includes('btd-rights-delivery'), 'Gate 9 must cover BTD rights delivery.');
    assertCheck(failures, artifact.coverage.noBypassCovered === true, 'Gate 9 must cover no-bypass posture.');
    assertCheck(failures, artifact.coverage.conversationCovered === true, 'Gate 9 must cover Conversation parity tests.');
    assertCheck(failures, artifact.coverage.mcpCovered === true, 'Gate 9 must cover MCP parity tests.');
    assertCheck(failures, artifact.coverage.chatgptCovered === true, 'Gate 9 must cover ChatGPT parity tests.');
    assertCheck(failures, artifact.coverage.packageConsumerCovered === true, 'Gate 9 must cover package consumer parity.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 9 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourcePayloadSerialized === false, 'Gate 9 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.rawInterpolatedPromptVisible === false, 'Gate 9 artifact must not expose interpolated prompts.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 9 artifact must not expose raw provider responses.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 9 artifact must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 9 artifact must not serialize credentials.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 9 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('ReadingInterfaceProductParity'), 'V39 spec must name ReadingInterfaceProductParity.');
  assertCheck(failures, spec.includes('v39-interface-conversation-product-parity'), 'V39 spec must name the Gate 9 artifact.');
  assertCheck(failures, parity.includes('Gate 9 Parity'), 'V39 parity matrix must include Gate 9 parity.');
  assertCheck(failures, readme.includes('Interface Product Parity'), 'AssetPack README must document Interface Product Parity.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 9 interface and Conversation product parity check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 9 interface and Conversation product parity ok artifact=${artifact.artifactRoot}\n`);
}

main();
