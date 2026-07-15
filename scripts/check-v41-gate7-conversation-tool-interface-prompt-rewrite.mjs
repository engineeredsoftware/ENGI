#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v41-conversation-tool-interface-prompt-rewrite.json';

const REQUIRED_REWRITE_IDS = [
  'conversation-ptrr-promptpart-rewrite-boundary',
  'conversation-terminal-system-prompt-boundary',
  'conversation-stream-log-disclosure-boundary',
  'doccode-tool-prompt-program-boundary',
  'tool-prompt-registry-hierarchy-boundary',
  'mcp-api-public-contract-prompt-boundary',
  'chatgpt-app-tool-prompt-boundary',
  'terminal-public-api-interface-summary-boundary',
  'conversation-tool-interface-tests-docs-workflows',
];

const REQUIRED_METRIC_IDS = [
  'conversation_ptrr_prompt_program_integrity',
  'route_authority_source_selection_policy',
  'stream_log_disclosure_metadata',
  'doccode_tool_schema_prompt_integrity',
  'tool_prompt_registry_hierarchy',
  'mcp_api_action_contract_prompt_integrity',
  'chatgpt_app_tool_prompt_boundary',
  'public_api_terminal_summary_source_safety',
  'interface_parsed_return_type_conformance',
  'source_safe_prompt_telemetry_redaction',
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

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
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
      'Usage: node scripts/check-v41-gate7-conversation-tool-interface-prompt-rewrite.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 7 source-safe Conversation, tool-definition, MCP API, ChatGPT App, public API, product, and interface prompt rewrite parity.',
    ].join('\n'),
  );
  process.stdout.write('\n');
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

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
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
    pointer === 'V40',
    `BITCODE_SPEC.txt must remain V40 during V41 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v41' || /^v41\/gate-(?:[7-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 7+ work must occur on version/v41 or v41/gate-7..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v41-promptpart-prompt-inventory.json',
    '.bitcode/v41-registry-interpolation-contracts.json',
    '.bitcode/v41-reading-prompt-benchmark-baselines.json',
    '.bitcode/v41-readneed-prompt-hardening.json',
    '.bitcode/v41-readfitsfinding-prompt-hardening.json',
    '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
    'scripts/specifying/src/canonical/v41-conversation-tool-interface-prompt-rewrite.js',
    'scripts/specifying/test/v41-conversation-tool-interface-prompt-rewrite.test.js',
    'scripts/generate-v41-conversation-tool-interface-prompt-rewrite.mjs',
    'scripts/check-v41-gate7-conversation-tool-interface-prompt-rewrite.mjs',
    'packages/conversations/src/agent/ConversationAgent.ts',
    'packages/conversations/src/prompts/BitcodeConversationSystemPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
    'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
    'packages/btd/src/mcp-tool-contract.ts',
    'packages/btd/src/chatgpt-app-action-contract.ts',
    'apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
    'apps/chatgpt/src/tools.ts',
    'packages/conversations/src/prompts/BitcodeConversationSystemPrompt.ts',
    'apps/uapi/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog.tsx',
    'specifications/BITCODE_SPEC_V41.md',
    'specifications/BITCODE_SPEC_V41_DELTA.md',
    'specifications/BITCODE_SPEC_V41_NOTES.md',
    'specifications/BITCODE_SPEC_V41_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-conversation-tool-interface-prompt-rewrite.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 Conversation/tool/interface prompt rewrite artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v41-conversation-tool-interface-prompt-rewrite.test.js',
      ]);
    } catch (error) {
      failures.push(`V41 Conversation/tool/interface prompt rewrite protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 Conversation/tool/interface prompt rewrite artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-conversation-tool-interface-prompt-rewrite', 'Conversation/tool/interface rewrite artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.conversationToolInterfacePromptRewrite.v1', 'Conversation/tool/interface rewrite schemaId must match.');
    assertCheck(
      failures,
      artifact.version === 'V41' && artifact.currentTarget === 'V40',
      'Conversation/tool/interface rewrite must bind V41 over active V40.',
    );
    assertCheck(failures, artifact.passed === true, 'Conversation/tool/interface rewrite artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-tool-interface-prompt-rewrite-metadata',
      'Conversation/tool/interface rewrite artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.metricIds, REQUIRED_METRIC_IDS), 'Conversation/tool/interface rewrite must expose every required metric id.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.rewriteId), REQUIRED_REWRITE_IDS), 'Conversation/tool/interface rewrite must cover every row.');
    assertCheck(failures, artifact.coverage.rowCount === REQUIRED_REWRITE_IDS.length, 'Conversation/tool/interface rewrite row count must match required rows.');
    assertCheck(failures, artifact.coverage.promptSurfaceCount >= 20, 'Conversation/tool/interface rewrite must cover prompt surfaces.');
    assertCheck(failures, artifact.coverage.parserTargetCount >= 18, 'Conversation/tool/interface rewrite must bind parser targets.');
    assertCheck(failures, artifact.coverage.benchmarkFixtureCount >= 9, 'Conversation/tool/interface rewrite must bind benchmark fixtures.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All Conversation/tool/interface source roots must exist.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount >= 55, 'Conversation/tool/interface rewrite must require at least 55 predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === artifact.coverage.requiredPredicateCount, 'Conversation/tool/interface rewrite predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Conversation/tool/interface rewrite must have no failed predicates.');
    assertCheck(failures, artifact.coverage.failingRowIds.length === 0, 'Conversation/tool/interface rewrite must have no failing rows.');
    assertCheck(failures, artifact.coverage.hardeningScoreMinimum >= 1, 'Conversation/tool/interface rewrite rows must be fully hardened.');
    assertCheck(failures, artifact.coverage.conversationPromptPartRowCount === 14, 'Conversation PromptPart inventory count must remain bound.');
    assertCheck(failures, artifact.coverage.conversationPromptRowCount === 2, 'Conversation Prompt inventory count must remain bound.');
    assertCheck(failures, artifact.coverage.toolPromptRowCount >= 74, 'Tool prompt inventory count must remain bound.');
    assertCheck(failures, artifact.coverage.interfacePromptRowCount >= 10, 'Interface prompt inventory count must remain bound.');
    assertCheck(failures, artifact.coverage.v38ConversationToolParityPassed === true, 'V38 Conversation/tool parity dependency must pass.');
    assertCheck(failures, artifact.coverage.gate2InventoryPassed === true, 'Gate 2 inventory dependency must pass.');
    assertCheck(failures, artifact.coverage.gate3RegistryInterpolationPassed === true, 'Gate 3 registry/interpolation dependency must pass.');
    assertCheck(failures, artifact.coverage.gate4ReadingBenchmarkPassed === true, 'Gate 4 Reading benchmark dependency must pass.');
    assertCheck(failures, artifact.coverage.gate5ReadNeedHardeningPassed === true, 'Gate 5 ReadNeed dependency must pass.');
    assertCheck(failures, artifact.coverage.gate6ReadFitsFindingHardeningPassed === true, 'Gate 6 ReadFitsFinding dependency must pass.');
    assertCheck(
      failures,
      /^v38-conversation-tool-prompt-inference-parity:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v38ConversationToolPromptInferenceParityRoot),
      'V38 Conversation/tool parity dependency root must be present.',
    );
    assertCheck(failures, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate2InventoryRoot), 'Gate 2 dependency root must be present.');
    assertCheck(failures, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate3RegistryInterpolationRoot), 'Gate 3 dependency root must be present.');
    assertCheck(failures, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot), 'Gate 4 dependency root must be present.');
    assertCheck(failures, /^v41-readneed-prompt-hardening:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate5ReadNeedPromptHardeningRoot), 'Gate 5 dependency root must be present.');
    assertCheck(failures, /^v41-readfitsfinding-prompt-hardening:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate6ReadFitsFindingPromptHardeningRoot), 'Gate 6 dependency root must be present.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'Conversation/tool/interface rewrite must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'Conversation/tool/interface rewrite must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawInterpolatedPromptSerialized === false, 'Conversation/tool/interface rewrite must not serialize interpolated prompts.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'Conversation/tool/interface rewrite must not serialize provider responses.');
    assertCheck(failures, artifact.sourceSafety.protectedSourceVisible === false, 'Conversation/tool/interface rewrite must not expose protected source.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'Conversation/tool/interface rewrite must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'Conversation/tool/interface rewrite must not serialize credentials.');
    assertCheck(failures, artifact.sourceSafety.walletPrivateMaterialVisible === false, 'Conversation/tool/interface rewrite must not expose wallet private material.');
    assertCheck(failures, artifact.sourceSafety.settlementPrivatePayloadVisible === false, 'Conversation/tool/interface rewrite must not expose settlement private payloads.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v41-conversation-tool-interface-prompt-rewrite-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation/tool/interface rewrite rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceSafeMetadataOnly === true && row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'Conversation/tool/interface rewrite rows must remain source-safe metadata only.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-conversation-tool-interface-prompt-rewrite'), 'package.json must expose generate:v41-conversation-tool-interface-prompt-rewrite.');
  assertCheck(failures, packageJson.includes('check:v41-gate7'), 'package.json must expose check:v41-gate7.');

  const roadmap = fileExists(root, 'specifications/SPECIFICATIONS_ROADMAP.md') ? read(root, 'specifications/SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(
    failures,
    roadmap.includes('Current working gate: V41 Gate 7') ||
      roadmap.includes('Current working gate: V41 Gate 8') ||
      roadmap.includes('Current working gate: V41 Gate 9'),
    'Roadmap must name V41 Gate 7 or later as current working gate.',
  );
  assertCheck(
    failures,
    roadmap.includes('Next queued gate after V41 Gate 7: V41 Prompt Benchmark Report And Telemetry Integration.') ||
      roadmap.includes('Next queued gate after V41 Gate 8: V41 Promotion Readiness.') ||
      roadmap.includes('V41 Gate 9 closure anchor'),
    'Roadmap must name V41 Gate 8 or Gate 9 as next.',
  );
  assertCheck(failures, roadmap.includes('V41 Gate 7 closure anchor'), 'Roadmap must preserve V41 Gate 7 closure anchor.');
  assertCheck(failures, roadmap.includes('V43+ agentic depositing'), 'Roadmap must preserve V43+ agentic depositing note.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 7 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 7 check passed: rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
