import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readRepoFile(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

const packageReadme = readRepoFile('packages/generic-tools/simple-system-text-search/README.md');
const packageManifest = JSON.parse(readRepoFile('packages/generic-tools/simple-system-text-search/package.json'));
const wrapperSource = readRepoFile('packages/generic-tools/simple-system-text-search/src/index.ts');
const canonicalPromptSource = readRepoFile(
  'packages/generic-tools/simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts'
);
const compatibilityPromptSource = readRepoFile(
  'packages/generic-tools/simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt.ts'
);
const systemGrepReadme = readRepoFile('packages/host-commands/grep/README.md');
const systemGrepSource = readRepoFile('packages/host-commands/grep/src/index.ts');

const rawPromptPartPaths = [
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolname.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolpurpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolcapabilities.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolparameters.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetooloutput.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample1.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample2.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample3.ts'
];

const rawPromptPartRuntimePaths = rawPromptPartPaths.map((filePath) => filePath.replace(/\.ts$/u, '.js'));

test('V26 simple-system-text-search has a canonical Bitcode repository-evidence prompt owner', () => {
  assert.equal(packageManifest.dependencies['@bitcode/prompts'], 'workspace:*');
  assert.match(wrapperSource, /BITCODE_REPOSITORY_EVIDENCE_SEARCH_DOC_CODE_TOOL_PROMPT/u);
  assert.match(wrapperSource, /Read-directed repository evidence search/u);
  assert.match(canonicalPromptSource, /class BitcodeRepositoryEvidenceSearchDocCodeToolPrompt/u);
  assert.match(canonicalPromptSource, /metadata:category', 'repository-evidence-search'/u);
  assert.match(canonicalPromptSource, /metadata:version', 'V26'/u);
  assert.match(canonicalPromptSource, /admitted-support/u);
  assert.match(compatibilityPromptSource, /Compatibility export/u);
  assert.match(compatibilityPromptSource, /SIMPLE_SYSTEM_TEXT_SEARCH_DOC_CODE_TOOL_PROMPT/u);
});

test('V26 simple-system-text-search docs state bounded support semantics', () => {
  assert.match(packageReadme, /Bitcode repository-evidence search support/u);
  assert.match(packageReadme, /read measurement/u);
  assert.match(packageReadme, /AssetPack synthesis/u);
  assert.match(packageReadme, /not generic codebase intelligence/u);
  assert.match(packageReadme, /compatibility filenames/u);
  assert.doesNotMatch(packageReadme, /enterprise-grade/u);
  assert.doesNotMatch(packageReadme, /comprehensive codebase analysis/u);
});

test('V26 system-grep primitive is documented as repository evidence support only', () => {
  assert.match(systemGrepReadme, /server-only grep primitive/u);
  assert.match(systemGrepReadme, /line-level source evidence/u);
  assert.match(systemGrepReadme, /does not own product semantics/u);
  assert.match(systemGrepSource, /Retained grep-backed primitive for Bitcode repository-evidence search support/u);
  assert.match(systemGrepSource, /not as an independent product or inference owner/u);
});

test('V26 system-text-search raw PromptParts carry Bitcode repository-evidence semantics in TS and JS', () => {
  for (const filePath of [...rawPromptPartPaths, ...rawPromptPartRuntimePaths]) {
    const source = readRepoFile(filePath);

    assert.match(source, /current_version: "V26"/u, filePath);
    assert.match(source, /repository[- ]evidence|Read|AssetPack|written-asset|proof/u, filePath);
    assert.doesNotMatch(source, /G[A]1/u, filePath);
    assert.doesNotMatch(source, /TODO comments|class definitions|dependency analysis|codebase analysis/u, filePath);
  }
});
