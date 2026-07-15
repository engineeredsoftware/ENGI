#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-conversation-tool-prompt-inference-parity.json';

const REQUIRED_ROW_IDS = [
  'conversation:ptrr-variations',
  'conversation:prompt-registry-step-prompts',
  'conversation:typed-output-stream-entrypoints',
  'conversation:source-safe-telemetry-disclosure',
  'tool:doc-code-prompt-formatting',
  'tool:prompt-registry-hierarchy',
  'tool:chatgpt-doc-code-prompt-carriers',
  'interface:entrypoints-no-stack-bypass',
];

const REQUIRED_DISCLOSURE_POSTURES = [
  'prompt_template_id_only',
  'parsed_result_shape_only',
  'source_safe_conversation_stream_event_metadata',
  'source_safe_conversation_telemetry_metadata',
  'doc_code_tool_prompt_source_safe',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  [['eyJ', 'hbGciOi'].join(''), ['JIUz', 'I1Ni'].join('')].join(''),
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
      'Usage: node scripts/check-v38-gate9-conversation-tool-prompt-inference-parity.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V38 Gate 9 Conversation and tool-prompt inference parity across PTRR Conversation variations, source-safe telemetry, DocCodeToolPrompt formatting, ChatGPT App tool carriers, docs, and workflow wiring.',
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
      branch === 'version/v38' || /^v38\/gate-(?:9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 9+ work must occur on version/v38 or v38/gate-9..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v38-inference-surface-inventory.json',
    '.bitcode/v38-prompt-benchmark-report.json',
    '.bitcode/v38-disclosure-boundary-report.json',
    'scripts/specifying/src/canonical/conversation-tool-prompt-inference-parity.js',
    'scripts/specifying/test/v38-conversation-tool-prompt-inference-parity.test.js',
    'scripts/generate-v38-conversation-tool-prompt-inference-parity.mjs',
    'scripts/check-v38-gate9-conversation-tool-prompt-inference-parity.mjs',
    'packages/conversations/src/agent/ConversationAgent.ts',
    'packages/api/src/conversations/stream-events.ts',
    'packages/api/src/conversations/telemetry.ts',
    'packages/api/src/conversations/__tests__/stream-events.test.ts',
    'packages/api/src/conversations/__tests__/telemetry.test.ts',
    'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
    'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
    'apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
    'apps/chatgpt/src/tools.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-inference-surface-inventory.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-prompt-benchmark-report.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-conversation-tool-prompt-inference-parity.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 Gate 9 artifact freshness check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v38-conversation-tool-prompt-inference-parity.test.js',
      ]);
    } catch (error) {
      failures.push(`V38 Conversation/tool prompt parity protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/api',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/conversations/__tests__/stream-events.test.ts',
        'src/conversations/__tests__/telemetry.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/conversationStreamPipelineLog.test.tsx',
        '--runInBand',
      ]);
      run(root, 'pnpm', [
        '--dir',
        'packages/chatgptapp',
        'exec',
        'jest',
        '--runTestsByPath',
        'src/__tests__/tools.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', ['--filter', '@bitcode/api', 'build']);
    } catch (error) {
      failures.push(`Conversation/tool prompt parity package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 Gate 9 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-conversation-tool-prompt-inference-parity', 'Gate 9 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.conversationToolPromptInferenceParity.v1', 'Gate 9 schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Gate 9 artifact must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Gate 9 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-tool-prompt-inference-parity-metadata',
      'Gate 9 artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.rowIds, REQUIRED_ROW_IDS), 'Gate 9 artifact must cover all parity rows.');
    assertCheck(failures, includesAll(artifact.requiredDisclosurePostures, REQUIRED_DISCLOSURE_POSTURES), 'Gate 9 artifact must cover all disclosure postures.');
    assertCheck(failures, artifact.coverage.rowCount === 8, 'Gate 9 row count must be 8.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Gate 9 artifact must have no failed predicates.');
    assertCheck(failures, artifact.coverage.conversationPtrrVariationsCovered === true, 'Gate 9 must cover Conversation PTRR variations.');
    assertCheck(failures, artifact.coverage.quickResponseSingleStepBypassRemoved === true, 'Gate 9 must remove quick-response single-step bypass.');
    assertCheck(failures, artifact.coverage.promptRegistryStepPromptsCovered === true, 'Gate 9 must cover prompt registries and step prompts.');
    assertCheck(failures, artifact.coverage.typedOutputSchemasCovered === true, 'Gate 9 must cover typed output schemas.');
    assertCheck(failures, artifact.coverage.sourceSafeConversationTelemetryCovered === true, 'Gate 9 must cover source-safe telemetry.');
    assertCheck(failures, artifact.coverage.richExecutionLogUiCovered === true, 'Gate 9 must cover rich execution-log UI.');
    assertCheck(failures, artifact.coverage.docCodeToolPromptFormattingCovered === true, 'Gate 9 must cover DocCodeToolPrompt formatting.');
    assertCheck(failures, artifact.coverage.toolPromptRegistryHierarchyCovered === true, 'Gate 9 must cover tool prompt registry hierarchy.');
    assertCheck(failures, artifact.coverage.chatGptToolPromptCarriersCovered === true, 'Gate 9 must cover ChatGPT tool prompt carriers.');
    assertCheck(failures, artifact.coverage.interfaceEntrypointsDoNotBypassStack === true, 'Gate 9 must block interface stack bypasses.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 9 artifact must be metadata-only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.rawPromptTextSerialized === false, 'Raw prompt text must not be serialized.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Wallet private material must not be visible.');
    assertCheck(failures, artifact.coverage.privateSettlementPayloadVisible === false, 'Private settlement payloads must not be visible.');
    assertCheck(failures, artifact.coverage.globalLedgerAuthorityClaimed === false, 'Gate 9 must not claim global ledger authority.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 9 artifact must not point at _legacy roots.');
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

  assertCheck(failures, spec.includes('V38ConversationToolPromptInferenceParity'), 'V38 spec must name the Gate 9 report.');
  assertCheck(failures, delta.includes('source-safe-conversation-tool-prompt-inference-parity-metadata'), 'V38 delta must include Gate 9 source-safety verdict.');
  assertCheck(failures, notes.includes('V38ConversationToolPromptInferenceParity'), 'V38 notes must name the Gate 9 report.');
  assertCheck(failures, parity.includes('| Conversation and tool-prompt inference parity | Gate 9 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 9 row.');
  assertCheck(failures, roadmap.includes('V38 Gate 9 closure anchor'), 'Roadmap must include the Gate 9 closure anchor.');
  assertCheck(failures, readme.includes('check:v38-gate9'), 'README must document the Gate 9 check.');
  assertCheck(failures, protocolReadme.includes('v38-conversation-tool-prompt-inference-parity'), 'Protocol README must document the Gate 9 artifact.');
  assertCheck(failures, packageJson.includes('check:v38-gate9') && packageJson.includes('generate:v38-conversation-tool-prompt-inference-parity'), 'package.json must expose Gate 9 scripts.');
  assertCheck(failures, gateWorkflow.includes('check:v38-gate9') && gateWorkflow.includes('v38-conversation-tool-prompt-inference-parity.test.js'), 'Gate workflow must run Gate 9 checks/tests.');
  assertCheck(failures, canonWorkflow.includes('check:v38-gate9'), 'Canon workflow must run Gate 9 check.');
  assertCheck(failures, index.includes('buildV38ConversationToolPromptInferenceParity'), 'Protocol JS index must export Gate 9 builder.');
  assertCheck(failures, typeDefs.includes('buildV38ConversationToolPromptInferenceParity'), 'Protocol type index must export Gate 9 builder.');

  if (failures.length) {
    process.stderr.write('V38 Gate 9 Conversation/tool prompt inference parity check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 9 Conversation/tool prompt inference parity ok rows=8 predicates=34\n');
}

main();
