// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38PromptBenchmarkReport } from './prompt-benchmark-report.js';
import { buildV40PromptBenchmarkSmokeV41Readiness } from './v40-prompt-benchmark-smoke-v41-readiness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_PROMPTPART_PROMPT_INVENTORY_ARTIFACT_PATH =
  '.bitcode/v41-promptpart-prompt-inventory.json';
export const V41_PROMPTPART_PROMPT_INVENTORY_SCHEMA_ID =
  'bitcode.v41.promptpartPromptInventory.v1';
export const V41_PROMPTPART_PROMPT_INVENTORY_VERSION = 'V41';
export const V41_PROMPTPART_PROMPT_INVENTORY_CURRENT_TARGET = 'V40';
export const V41_PROMPTPART_PROMPT_INVENTORY_SOURCE_SAFETY_VERDICT =
  'source-safe-promptpart-prompt-inventory-metadata';

export const V41_PROMPT_INVENTORY_REQUIRED_SURFACE_IDS = Object.freeze([
  'raw-promptparts-generic',
  'raw-promptparts-specific',
  'reading-pipeline-prompts',
  'conversation-prompts',
  'tool-definition-prompts',
  'interface-prompts',
  'benchmark-prompts',
]);

export const V41_PROMPT_INVENTORY_REQUIRED_FIELD_IDS = Object.freeze([
  'inventoryId',
  'sourcePath',
  'sourceHash',
  'registryOwner',
  'semanticPurposeId',
  'promptFamilyIds',
  'templateVariableNames',
  'benchmarkFixtureIds',
  'disclosureTier',
  'validationCommand',
]);

export const V41_PROMPT_INVENTORY_DISCLOSURE_TIERS = Object.freeze([
  'promptpart_identity_source_safe',
  'prompt_identity_source_safe',
  'registry_path_source_safe',
  'template_variable_name_source_safe',
  'benchmark_fixture_id_source_safe',
  'source_hash_source_safe',
  'raw_prompt_text_private',
  'raw_provider_response_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-provider-responses',
  'private-context',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  promptPartGeneric: 'packages/prompts/src/raw_promptparts/generic',
  promptPartSpecific: 'packages/prompts/src/raw_promptparts/specific',
  promptPrimitive: 'packages/prompts/src/prompt.ts',
  promptPartPrimitive: 'packages/prompts/src/parts/PromptPart.ts',
  templatedPromptPartPrimitive: 'packages/prompts/src/parts/TemplatedPromptPart.ts',
  promptBenchmarking: 'packages/prompts/src/benchmarking',
  readingPipelineAgents: 'packages/asset-packs-pipelines/domain/src/agents',
  readingPipelineContracts: 'packages/asset-packs-pipelines/domain/src',
  conversationGenerics: 'packages/conversations/src',
  toolsGenerics: 'packages/tools-generics/src',
  genericTools: 'packages/generic-tools',
  chatgptAppPrompts: 'apps/chatgpt/src/prompts',
  uapiPromptSurfaces: 'apps/uapi/app',
  v38BenchmarkReport: 'scripts/specifying/src/canonical/prompt-benchmark-report.js',
  v40BenchmarkSmoke: 'scripts/specifying/src/canonical/v40-prompt-benchmark-smoke-v41-readiness.js',
  spec: 'BITCODE_SPEC_V41.md',
  delta: 'BITCODE_SPEC_V41_DELTA.md',
  notes: 'BITCODE_SPEC_V41_NOTES.md',
  parity: 'BITCODE_SPEC_V41_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  packageSource: 'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
  packageTest: 'scripts/specifying/test/v41-promptpart-prompt-inventory.test.js',
  generator: 'scripts/generate-v41-promptpart-prompt-inventory.mjs',
  checker: 'scripts/check-v41-gate2-promptpart-prompt-inventory.mjs',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const PROMPT_SOURCE_ROOTS = Object.freeze([
  SOURCE_ROOTS.readingPipelineAgents,
  SOURCE_ROOTS.conversationGenerics,
  SOURCE_ROOTS.toolsGenerics,
  SOURCE_ROOTS.genericTools,
  SOURCE_ROOTS.chatgptAppPrompts,
  SOURCE_ROOTS.promptBenchmarking,
  SOURCE_ROOTS.uapiPromptSurfaces,
]);

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function artifactRoot(input) {
  return `v41-promptpart-prompt-inventory:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-prompt-inventory-row:${digest(input)}`;
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function read(repoRoot, sourcePath) {
  const absolute = path.join(repoRoot, sourcePath);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

function listFiles(repoRoot, sourcePath, options = {}) {
  const absolute = path.join(repoRoot, sourcePath);
  if (!existsSync(absolute)) return [];
  const stat = statSync(absolute);
  if (stat.isFile()) return [sourcePath];
  if (!stat.isDirectory()) return [];

  const files = [];
  const extensions = options.extensions ?? ['.ts'];
  const include = options.include ?? (() => true);
  const walk = (currentAbsolute, currentRelative) => {
    for (const entry of readdirSync(currentAbsolute, { withFileTypes: true })) {
      if (
        entry.name === 'dist' ||
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'tmp' ||
        entry.name === '_legacy'
      ) {
        continue;
      }
      const nextAbsolute = path.join(currentAbsolute, entry.name);
      const nextRelative = path.join(currentRelative, entry.name);
      if (entry.isDirectory()) {
        walk(nextAbsolute, nextRelative);
        continue;
      }
      const ext = path.extname(entry.name);
      if (!extensions.includes(ext)) continue;
      if (/\.d\.ts$/u.test(entry.name)) continue;
      if (!include(nextRelative, entry.name)) continue;
      files.push(nextRelative);
    }
  };
  walk(absolute, sourcePath);
  return files.sort();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function basenameId(sourcePath) {
  return path.basename(sourcePath).replace(/\.(?:ts|tsx|js|jsx|mjs)$/u, '');
}

function parseExportNames(source) {
  return unique([...source.matchAll(/export\s+(?:declare\s+)?const\s+([A-Z0-9_]+)\b/gu)].map((match) => match[1]));
}

function parseTemplateVariables(source) {
  return unique([...source.matchAll(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/gu)].map((match) => match[1]));
}

function parseRegistryPaths(source) {
  return unique(
    [...source.matchAll(/(?:this|prompt|p)\.set\(\s*['"`]([^'"`]+)['"`]/gu)].map((match) => match[1]),
  );
}

function parsePromptPartReferences(source) {
  return unique([...source.matchAll(/\b(PROMPTPART_[A-Z0-9_]+)\b/gu)].map((match) => match[1]));
}

function inferRegistryOwner(sourcePath) {
  if (sourcePath.includes('/raw_promptparts/generic/')) return 'PromptPartRegistry.generic';
  if (sourcePath.includes('/raw_promptparts/specific/')) return 'PromptPartRegistry.specific';
  if (sourcePath.includes('/pipelines/asset-pack/')) return 'ReadPipelinePromptRegistry';
  if (sourcePath.includes('/conversations-generics/')) return 'ConversationPromptRegistry';
  if (sourcePath.includes('/tools-generics/') || sourcePath.includes('/generic-tools/')) {
    return 'ToolDefinitionPromptRegistry';
  }
  if (sourcePath.includes('/chatgptapp/')) return 'ChatGPTAppPromptRegistry';
  if (sourcePath.includes('/uapi/')) return 'WebsiteInterfacePromptRegistry';
  return 'PromptRegistry';
}

function inferPromptFamilyIds(sourcePath, source) {
  const haystack = `${sourcePath}\n${source}`.toLowerCase();
  const families = [];
  if (/promptpart_generic_(agent|ptrr|formatting|doccode)/u.test(haystack)) {
    families.push('GenericPTRRFailsafeThricifiedPromptParts');
  }
  if (/readneed|read-need|comprehendread|extractreadrequirements|generatereadsatisfactioncriteria|validateread/u.test(haystack)) {
    families.push('ReadNeedComprehensionSynthesis');
  }
  if (/readfits|read-fits|assetpack|asset-pack|depository|finding|search/u.test(haystack)) {
    families.push('ReadFitsFindingSynthesis');
  }
  if (/conversation/u.test(haystack)) families.push('Conversation');
  if (/doccode|tool_|tool-|tools-generics|generic-tools|mcp/u.test(haystack)) families.push('ToolDefinition');
  if (/chatgpt|uapi|terminal|interface|systempromptsection/u.test(haystack)) families.push('Interface');
  if (/benchmark/u.test(haystack)) families.push('PromptBenchmark');
  return unique(families.length > 0 ? families : ['PromptProgramGeneral']);
}

function inferPromptKind(sourcePath, source) {
  if (sourcePath.includes('/raw_promptparts/')) return 'PromptPart';
  if (/AgentPrompt|AgentStepPrompt/u.test(source)) return 'PTRRAgentPrompt';
  if (/DocCodeToolPrompt|attachDocCodeToolPrompt|registerDocCodeToolPrompt/u.test(source)) return 'DocCodeToolPrompt';
  if (/Conversation/u.test(sourcePath) || /Conversation/u.test(source)) return 'ConversationPrompt';
  if (/SystemPromptSection/u.test(sourcePath)) return 'InterfacePrompt';
  if (/PromptBenchmark|benchmarkPrompt|@doc-comment-developing-promptdevelopment/u.test(source)) return 'BenchmarkPrompt';
  return 'ComposedPrompt';
}

function benchmarkFixtureIdsFor(familyIds, kind) {
  const ids = [];
  if (kind === 'PromptPart') ids.push('fixture.promptpart.intent-alignment');
  if (familyIds.includes('GenericPTRRFailsafeThricifiedPromptParts')) {
    ids.push('fixture.generic-ptrr.reason-judge-structured-output');
  }
  if (familyIds.includes('ReadNeedComprehensionSynthesis')) {
    ids.push('fixture.read-need.need-boundary-precision');
  }
  if (familyIds.includes('ReadFitsFindingSynthesis')) {
    ids.push('fixture.read-fits.find-many-candidates-and-preserve-source-safety');
  }
  if (familyIds.includes('Conversation')) ids.push('fixture.conversation.terminal-system-boundary');
  if (familyIds.includes('ToolDefinition')) ids.push('fixture.tool-definition.doc-code-contract');
  if (familyIds.includes('Interface')) ids.push('fixture.interface.source-safe-user-visible-prompting');
  if (familyIds.includes('PromptBenchmark')) ids.push('fixture.prompt.task-success');
  return unique(ids.length > 0 ? ids : ['fixture.prompt.task-success']);
}

function semanticPurposeId(sourcePath) {
  return basenameId(sourcePath)
    .replace(/^promptpart_(?:generic|specific)_/u, '')
    .replace(/doccodetool/u, 'doccode_tool')
    .replace(/_/gu, '-');
}

function validationCommandFor(familyIds, kind) {
  if (familyIds.includes('ReadNeedComprehensionSynthesis')) return 'pnpm run check:v41-gate5';
  if (familyIds.includes('ReadFitsFindingSynthesis')) return 'pnpm run check:v41-gate6';
  if (familyIds.includes('Conversation') || familyIds.includes('ToolDefinition') || familyIds.includes('Interface')) {
    return 'pnpm run check:v41-gate7';
  }
  if (kind === 'PromptPart') return 'pnpm run check:v41-gate2';
  return 'pnpm run check:v41-gate3';
}

function promptPartRow(repoRoot, sourcePath) {
  const source = read(repoRoot, sourcePath);
  const category = sourcePath.includes('/generic/') ? 'generic' : 'specific';
  const exportNames = parseExportNames(source);
  const familyIds = inferPromptFamilyIds(sourcePath, source);
  const templateVariableNames = parseTemplateVariables(source);
  const sourceHash = digest(source);
  const inventoryId = `promptpart:${category}:${basenameId(sourcePath)}`;

  return {
    inventoryId,
    rowRoot: rowRoot(inventoryId),
    kind: 'PromptPart',
    sourcePath,
    sourceHash,
    exportNames,
    registryOwner: inferRegistryOwner(sourcePath),
    semanticPurposeId: semanticPurposeId(sourcePath),
    promptFamilyIds: familyIds,
    composedPromptMemberships: familyIds,
    templateVariableNames,
    benchmarkFixtureIds: benchmarkFixtureIdsFor(familyIds, 'PromptPart'),
    disclosureTier: 'promptpart_identity_source_safe',
    validationCommand: validationCommandFor(familyIds, 'PromptPart'),
    docCommentPresent: source.includes('@doc-comment-developing-promptpartdevelopment'),
    benchmarkDefinitionCount: countMatches(source, /benchmarks?\s*:/giu),
    currentVersionPresent: /current_version\s*:/u.test(source),
    promptPartExportCount: exportNames.length,
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    sourceSafeMetadataOnly: true,
  };
}

function shouldIncludePromptSource(sourcePath, source) {
  if (sourcePath.includes('/raw_promptparts/')) return false;
  if (sourcePath.includes('/__tests__/') || sourcePath.includes('/test/')) return false;
  if (sourcePath.endsWith('.d.ts')) return false;
  return (
    source.includes('@doc-comment-developing-promptdevelopment') ||
    /\bnew\s+(?:Prompt|AgentPrompt|AgentStepPrompt|DocCodeToolPrompt|[A-Za-z0-9_]+Prompt)\s*\(/u.test(source) ||
    /\bextends\s+(?:Prompt|DocCodeToolPrompt)\b/u.test(source) ||
    /attachDocCodeToolPrompt|registerDocCodeToolPrompt|buildPrompt\(/u.test(source)
  );
}

function promptRow(repoRoot, sourcePath) {
  const source = read(repoRoot, sourcePath);
  const kind = inferPromptKind(sourcePath, source);
  const familyIds = inferPromptFamilyIds(sourcePath, source);
  const exportNames = parseExportNames(source);
  const classNames = unique([...source.matchAll(/class\s+([A-Za-z0-9_]+Prompt)\b/gu)].map((match) => match[1]));
  const promptId = exportNames.find((name) => name.includes('PROMPT')) ?? classNames[0] ?? basenameId(sourcePath);
  const inventoryId = `prompt:${promptId}`;
  const registryPathIds = parseRegistryPaths(source);
  const promptPartReferenceIds = parsePromptPartReferences(source);

  return {
    inventoryId,
    rowRoot: rowRoot(`${inventoryId}:${sourcePath}`),
    kind,
    sourcePath,
    sourceHash: digest(source),
    exportNames,
    classNames,
    registryOwner: inferRegistryOwner(sourcePath),
    semanticPurposeId: semanticPurposeId(sourcePath),
    promptFamilyIds: familyIds,
    composedPromptMemberships: promptPartReferenceIds,
    promptPartReferenceIds,
    registryPathIds,
    registryPathCount: registryPathIds.length,
    templateVariableNames: parseTemplateVariables(source),
    benchmarkFixtureIds: benchmarkFixtureIdsFor(familyIds, kind),
    disclosureTier: 'prompt_identity_source_safe',
    validationCommand: validationCommandFor(familyIds, kind),
    docCommentPresent: source.includes('@doc-comment-developing-promptdevelopment'),
    promptConstructionCount: countMatches(
      source,
      /\bnew\s+(?:Prompt|AgentPrompt|AgentStepPrompt|DocCodeToolPrompt|[A-Za-z0-9_]+Prompt)\s*\(/gu,
    ),
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    sourceSafeMetadataOnly: true,
  };
}

function collectPromptPartRows(repoRoot) {
  const files = [
    ...listFiles(repoRoot, SOURCE_ROOTS.promptPartGeneric, {
      include: (_relative, name) => name.startsWith('promptpart_'),
    }),
    ...listFiles(repoRoot, SOURCE_ROOTS.promptPartSpecific, {
      include: (_relative, name) => name.startsWith('promptpart_'),
    }),
  ];
  return files.map((sourcePath) => promptPartRow(repoRoot, sourcePath));
}

function collectPromptRows(repoRoot) {
  const files = unique(
    PROMPT_SOURCE_ROOTS.flatMap((sourceRoot) =>
      listFiles(repoRoot, sourceRoot, {
        extensions: ['.ts', '.tsx'],
      }),
    ),
  );
  return files
    .filter((sourcePath) => shouldIncludePromptSource(sourcePath, read(repoRoot, sourcePath)))
    .map((sourcePath) => promptRow(repoRoot, sourcePath));
}

function countRowsBy(rows, getter) {
  return rows.reduce((acc, row) => {
    const key = getter(row);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function sourceRootRows(repoRoot) {
  return Object.entries(SOURCE_ROOTS).map(([id, sourcePath]) => ({
    id,
    sourcePath,
    present: sourceExists(repoRoot, sourcePath),
  }));
}

function collectFailures({ promptPartRows, promptRows, sourceRoots, coverage }) {
  const failures = [];
  const missingRoots = sourceRoots.filter((row) => !row.present).map((row) => row.sourcePath);
  if (missingRoots.length > 0) failures.push(`Missing source roots: ${missingRoots.join(', ')}`);
  if (promptPartRows.length < 1000) failures.push(`Expected at least 1000 PromptPart rows, observed ${promptPartRows.length}.`);
  if (promptRows.length < 20) failures.push(`Expected at least 20 composed Prompt rows, observed ${promptRows.length}.`);
  if (coverage.genericPromptPartCount < 50) failures.push('Generic PromptPart inventory must cover at least 50 rows.');
  if (coverage.specificPromptPartCount < 1000) failures.push('Specific PromptPart inventory must cover at least 1000 rows.');
  if (coverage.readingPromptRowCount < 5) failures.push('Reading prompt inventory must cover at least 5 rows.');
  if (coverage.conversationPromptRowCount < 1) failures.push('Conversation prompt inventory must cover at least 1 row.');
  if (coverage.toolPromptRowCount < 5) failures.push('Tool-definition prompt inventory must cover at least 5 rows.');
  if (coverage.promptRowsWithRegistryPaths < 10) failures.push('Prompt inventory must capture registry path metadata.');
  if (coverage.promptPartRowsWithDocComments < 50) failures.push('PromptPart inventory must see doc-comment metadata.');
  if (coverage.promptRowsWithDocComments < 5) failures.push('Prompt inventory must see prompt doc-comment metadata.');
  if (coverage.promptPartExportCount < promptPartRows.length) failures.push('Every PromptPart row should expose at least one export.');
  if (coverage.v38BenchmarkReportPassed !== true) failures.push('V38 prompt benchmark report must remain passing.');
  if (coverage.v40BenchmarkSmokePassed !== true) failures.push('V40 prompt benchmark smoke handoff must remain passing.');
  return failures;
}

export function buildV41PromptPartPromptInventory(input = {}) {
  const repoRoot = input.repoRoot ?? DEFAULT_REPO_ROOT;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const promptPartRows = collectPromptPartRows(repoRoot);
  const promptRows = collectPromptRows(repoRoot);
  const sourceRoots = sourceRootRows(repoRoot);
  const v38Benchmark = buildV38PromptBenchmarkReport({ repoRoot, generatedAt });
  const v40BenchmarkSmoke = buildV40PromptBenchmarkSmokeV41Readiness({ repoRoot, generatedAt });

  const allRows = [...promptPartRows, ...promptRows];
  const coverage = {
    requiredSurfaceIds: [...V41_PROMPT_INVENTORY_REQUIRED_SURFACE_IDS],
    requiredFieldIds: [...V41_PROMPT_INVENTORY_REQUIRED_FIELD_IDS],
    disclosureTiers: [...V41_PROMPT_INVENTORY_DISCLOSURE_TIERS],
    promptPartRowCount: promptPartRows.length,
    promptRowCount: promptRows.length,
    totalRowCount: allRows.length,
    genericPromptPartCount: promptPartRows.filter((row) => row.sourcePath.includes('/generic/')).length,
    specificPromptPartCount: promptPartRows.filter((row) => row.sourcePath.includes('/specific/')).length,
    promptRowsByKind: countRowsBy(promptRows, (row) => row.kind),
    promptPartRowsByFamily: countRowsBy(promptPartRows, (row) => row.promptFamilyIds[0] ?? 'unknown'),
    promptRowsByFamily: countRowsBy(promptRows, (row) => row.promptFamilyIds[0] ?? 'unknown'),
    readingPromptRowCount: promptRows.filter((row) =>
      row.promptFamilyIds.some((familyId) =>
        ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'].includes(familyId),
      ),
    ).length,
    conversationPromptRowCount: promptRows.filter((row) => row.promptFamilyIds.includes('Conversation')).length,
    toolPromptRowCount: promptRows.filter((row) => row.promptFamilyIds.includes('ToolDefinition')).length,
    interfacePromptRowCount: promptRows.filter((row) => row.promptFamilyIds.includes('Interface')).length,
    promptPartRowsWithDocComments: promptPartRows.filter((row) => row.docCommentPresent).length,
    promptRowsWithDocComments: promptRows.filter((row) => row.docCommentPresent).length,
    promptPartExportCount: promptPartRows.reduce((sum, row) => sum + row.promptPartExportCount, 0),
    promptConstructionCount: promptRows.reduce((sum, row) => sum + row.promptConstructionCount, 0),
    promptRowsWithRegistryPaths: promptRows.filter((row) => row.registryPathCount > 0).length,
    registryPathCount: promptRows.reduce((sum, row) => sum + row.registryPathCount, 0),
    templateVariableNameCount: unique(allRows.flatMap((row) => row.templateVariableNames)).length,
    benchmarkFixtureCount: unique(allRows.flatMap((row) => row.benchmarkFixtureIds)).length,
    sourceRootCount: sourceRoots.length,
    sourceRootPresentCount: sourceRoots.filter((row) => row.present).length,
    sourceSafeMetadataOnly: true,
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    unpaidAssetPackSourceVisible: false,
    v38BenchmarkReportPassed: v38Benchmark.passed === true,
    v38BenchmarkReportRoot: v38Benchmark.artifactRoot,
    v40BenchmarkSmokePassed: v40BenchmarkSmoke.passed === true,
    v40BenchmarkSmokeRoot: v40BenchmarkSmoke.artifactRoot,
    v42RoadmapPrepared: true,
  };

  const failures = collectFailures({ promptPartRows, promptRows, sourceRoots, coverage });

  return {
    artifactId: 'v41-promptpart-prompt-inventory',
    schemaId: V41_PROMPTPART_PROMPT_INVENTORY_SCHEMA_ID,
    version: V41_PROMPTPART_PROMPT_INVENTORY_VERSION,
    currentTarget: V41_PROMPTPART_PROMPT_INVENTORY_CURRENT_TARGET,
    generatedAt,
    artifactPath: V41_PROMPTPART_PROMPT_INVENTORY_ARTIFACT_PATH,
    artifactRoot: artifactRoot(
      JSON.stringify({
        promptPartRows: promptPartRows.map((row) => row.rowRoot),
        promptRows: promptRows.map((row) => row.rowRoot),
        coverage,
      }),
    ),
    sourceSafetyVerdict: V41_PROMPTPART_PROMPT_INVENTORY_SOURCE_SAFETY_VERDICT,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawPromptTextSerialized: false,
      rawProviderResponseSerialized: false,
      credentialsSerialized: false,
      unpaidAssetPackSourceVisible: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
    sourceRoots,
    coverage,
    promptPartRows,
    promptRows,
    failures,
    passed: failures.length === 0,
  };
}
