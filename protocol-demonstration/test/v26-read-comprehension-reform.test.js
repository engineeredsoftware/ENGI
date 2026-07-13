import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname, '..');

function readRepoFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function listFilesRecursively(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return readdirSync(absolutePath).flatMap((entry) => {
    const absoluteEntry = path.join(absolutePath, entry);
    const relativeEntry = path.join(relativePath, entry);
    if (entry === 'node_modules') return [];
    return statSync(absoluteEntry).isDirectory()
      ? listFilesRecursively(relativeEntry)
      : [relativeEntry];
  });
}

test('V26 read-comprehension keeps canonical owners and removes noncanonical wrappers', () => {
  const canonicalToolTs = readRepoFile('packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts');
  const toolsetTs = readRepoFile('packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts');
  const extractToolTs = readRepoFile('packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts');
  const identifyToolTs = readRepoFile('packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts');
  const satisfactionToolTs = readRepoFile('packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts');
  const validateToolTs = readRepoFile('packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts');
  const complexityToolTs = readRepoFile('packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts');
  const canonicalPrimitivesTs = readRepoFile('packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts');
  const canonicalSchemasTs = readRepoFile('packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts');
  const indexTs = readRepoFile('packages/generic-tools/read-comprehension/src/index.ts');
  const promptsIndexTs = readRepoFile('packages/generic-tools/read-comprehension/src/prompts/index.ts');
  const agentPackageJson = JSON.parse(readRepoFile('packages/generic-agents/read-comprehension/package.json'));
  const agentReadme = readRepoFile('packages/generic-agents/read-comprehension/README.md');
  const agentSource = readRepoFile('packages/generic-agents/read-comprehension/src/index.ts');
  const pipelineAdapter = readRepoFile('packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts');
  const dangerWallAdapter = readRepoFile('packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-danger-wall-agent.ts');
  const setupPhase = readRepoFile('packages/asset-packs-pipelines/domain/src/phases/setup.ts');

  assert.match(canonicalToolTs, /Canonical Bitcode read-semantics tool owner/u);
  assert.match(canonicalToolTs, /export class AnalyzeReadSemanticsTool/u);
  assert.match(canonicalToolTs, /use = analyzeReadSemantics/u);
  assert.match(extractToolTs, /export class ExtractReadRequirementsTool/u);
  assert.match(extractToolTs, /use = extractReadRequirements/u);
  assert.match(identifyToolTs, /export class IdentifyReadConstraintsTool/u);
  assert.match(identifyToolTs, /use = identifyReadConstraints/u);
  assert.match(satisfactionToolTs, /export class GenerateReadSatisfactionCriteriaTool/u);
  assert.match(satisfactionToolTs, /use = generateReadSatisfactionCriteria/u);
  assert.match(validateToolTs, /export class ValidateReadComprehensionTool/u);
  assert.match(validateToolTs, /use = validateReadComprehension/u);
  assert.match(complexityToolTs, /export class AnalyzeReadSatisfactionImplementationComplexityTool/u);
  assert.match(complexityToolTs, /use = analyzeReadSatisfactionImplementationComplexity/u);
  assert.match(toolsetTs, /Canonical Bitcode read-comprehension tool collection/u);
  assert.match(toolsetTs, /individually defined tools are intentionally not agents/u);
  assert.match(toolsetTs, /analyzeReadSemanticsTool/u);
  assert.match(toolsetTs, /extractReadRequirementsTool/u);
  assert.match(toolsetTs, /identifyReadConstraintsTool/u);
  assert.match(toolsetTs, /generateReadSatisfactionCriteriaTool/u);
  assert.match(toolsetTs, /validateReadComprehensionTool/u);
  assert.match(toolsetTs, /analyzeReadSatisfactionImplementationComplexityTool/u);
  assert.match(toolsetTs, /BITCODE_NEED_COMPREHENSION_TOOLSET/u);

  assert.match(canonicalPrimitivesTs, /export async function analyzeReadSemantics/u);
  assert.match(canonicalPrimitivesTs, /export async function extractReadRequirements/u);
  assert.match(canonicalPrimitivesTs, /export async function identifyReadConstraints/u);
  assert.match(canonicalPrimitivesTs, /export async function generateReadSatisfactionCriteria/u);
  assert.match(canonicalPrimitivesTs, /export async function validateReadComprehension/u);
  assert.match(canonicalPrimitivesTs, /export async function analyzeReadSatisfactionImplementationComplexity/u);
  assert.match(canonicalPrimitivesTs, /source_to_shares_service_questions/u);
  assert.match(canonicalPrimitivesTs, /commercial_accountability/u);

  assert.doesNotMatch(canonicalSchemasTs, /ReadComprehensionCompatibilityPrimaryTypeSchema/u);
  assert.match(canonicalSchemasTs, /ReadRequirementSchema/u);
  assert.match(canonicalSchemasTs, /ReadConstraintSchema/u);
  assert.match(canonicalSchemasTs, /ReadSatisfactionCriterionSchema/u);

  assert.match(indexTs, /AnalyzeReadSemanticsTool/u);
  assert.match(indexTs, /ReadComprehensionToolset/u);
  assert.match(indexTs, /read-comprehension-primitives/u);
  assert.match(indexTs, /read-comprehension-schemas/u);
  assert.match(promptsIndexTs, /read_owner_only/u);
  assert.doesNotMatch(indexTs, /AnalyzeTaskSemanticsTool|from '\.\/primitives'|from '\.\/schemas'/u);
  assert.doesNotMatch(
    `${indexTs}\n${promptsIndexTs}\n${toolsetTs}`,
    /analyzeTaskSemantics|extractRequirementsTool|identifyConstraintsTool|generateSuccessCriteriaTool|validateTaskComprehensionTool|analyzeImplementationComplexityTool|TaskComprehension|GenerateSuccessCriteriaTool|AnalyzeImplementationComplexityTool/u
  );
  for (const removedNoncanonicalFile of [
    'packages/generic-tools/read-comprehension/src/AnalyzeTaskSemanticsTool.ts',
    'packages/generic-tools/read-comprehension/src/primitives.ts',
    'packages/generic-tools/read-comprehension/src/schemas.ts',
    'packages/generic-tools/read-comprehension/src/prompts/AnalyzeTaskSemanticsDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/ExtractRequirementsDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/IdentifyConstraintsDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/GenerateSuccessCriteriaDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/ValidateTaskComprehensionDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/AnalyzeImplementationComplexityDocCodeToolPrompt.ts'
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, removedNoncanonicalFile)),
      false,
      `${removedNoncanonicalFile} must stay removed after read-first owners exist`
    );
  }
  for (const removedRawPromptPartFamily of [
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzetasksemantics_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_extractrequirements_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_identifyconstraints_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_generatesuccesscriteria_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_validatetaskcomprehension_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeimplementationcomplexity_doccodetoolpurpose.ts'
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, removedRawPromptPartFamily)),
      false,
      `${removedRawPromptPartFamily} must stay removed after read-first raw PromptPart recut`
    );
  }
  assert.deepEqual(
    listFilesRecursively('packages/generic-tools/read-comprehension/src')
      .filter((filePath) => filePath.endsWith('.js')),
    [],
    'read-comprehension source must stay TypeScript-only; generated JavaScript belongs outside src'
  );
  assert.deepEqual(
    listFilesRecursively('packages/generic-agents/read-comprehension/src')
      .filter((filePath) => filePath.endsWith('.js')),
    [],
    'read-comprehension agent source must stay TypeScript-only; stale generated JavaScript must not carry old fields'
  );

  assert.equal(agentPackageJson.name, '@bitcode/generic-agents-read-comprehension');
  assert.equal(agentPackageJson.dependencies['@bitcode/generic-tools-read-comprehension'], 'workspace:*');
  assert.match(agentReadme, /PTRR agent owner for Bitcode setup-phase Read comprehension/u);
  assert.match(agentReadme, /setup` \/ `pre-danger-wall/u);
  assert.match(agentSource, /factoryAgentWithPTRR/u);
  assert.match(agentSource, /bitcodeSetupReadComprehensionAgent/u);
  assert.match(agentSource, /phase: z\.literal\('setup'\)/u);
  assert.match(agentSource, /beforeAgent: z\.literal\('danger-wall'\)/u);
  assert.match(agentSource, /PROMPTPART_SPECIFIC_AGENT_COMPREHENDNEED_SYSTEM_IDENTITY/u);
  assert.match(agentSource, /PROMPTPART_SPECIFIC_AGENT_COMPREHENDNEED_TRY_DIRECTIVES/u);
  assert.match(agentSource, /analyzeReadSemanticsTool/u);
  assert.match(agentSource, /extractReadRequirementsTool/u);
  assert.match(agentSource, /validateReadComprehensionTool/u);
  assert.match(agentSource, /analyzeReadSatisfactionImplementationComplexityTool/u);
  assert.match(agentSource, /source_to_shares_service_questions/u);
  assert.match(agentReadme, /source-to-shares service questions/u);
  assert.match(pipelineAdapter, /bitcodeSetupReadComprehensionAgent/u);
  assert.match(pipelineAdapter, /phase: 'setup'/u);
  assert.match(pipelineAdapter, /beforeAgent: 'danger-wall'/u);
  assert.match(pipelineAdapter, /setup\/read-comprehension/u);
  assert.match(dangerWallAdapter, /setup\/read-comprehension/u);
  assert.match(dangerWallAdapter, /riskAdmissionInput/u);
  assert.match(setupPhase, /setup:asset-pack-comprehend-read-agent/u);
  assert.match(setupPhase, /setup:asset-pack-danger-wall-agent/u);
});
