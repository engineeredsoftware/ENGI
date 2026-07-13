import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const reformSource = readFileSync(new URL('../V26_DOC_COMMENT_REFORM.md', import.meta.url), 'utf8');
const promptSurfaceSource = readFileSync(new URL('../V26_PROMPT_SURFACES.md', import.meta.url), 'utf8');
const docCommentReadme = readFileSync(new URL('../../packages/doc-comment-generics/README.md', import.meta.url), 'utf8');
const docCommentImplementation = readFileSync(new URL('../../packages/doc-comment-generics/IMPLEMENTATION.md', import.meta.url), 'utf8');
const docCommentExample = readFileSync(new URL('../../packages/doc-comment-generics/examples/doc-comments-as-prompts.ts', import.meta.url), 'utf8');
const docCodeReadme = readFileSync(new URL('../../packages/generic-doc-comments/doc-code/README.md', import.meta.url), 'utf8');
const docCodePackage = readFileSync(new URL('../../packages/generic-doc-comments/doc-code/package.json', import.meta.url), 'utf8');
const docCodeTypecheckTsconfig = readFileSync(new URL('../../packages/generic-doc-comments/doc-code/tsconfig.typecheck.json', import.meta.url), 'utf8');
const docCodeIndexJs = readFileSync(new URL('../../packages/generic-doc-comments/doc-code/src/index.js', import.meta.url), 'utf8');
const docCodeTransformJs = readFileSync(new URL('../../packages/generic-doc-comments/doc-code/src/transformDocCodeTools.js', import.meta.url), 'utf8');
const docCodeTransformTest = readFileSync(new URL('../../packages/generic-doc-comments/doc-code/src/__tests__/transform.test.ts', import.meta.url), 'utf8');
const toolsDocCodeIndex = readFileSync(new URL('../../packages/tools-generics/src/doc-code-tool/index.ts', import.meta.url), 'utf8');
const toolBaseSource = readFileSync(new URL('../../packages/tools-generics/src/Tool.ts', import.meta.url), 'utf8');
const docDevelopingReadme = readFileSync(
  new URL('../../packages/generic-doc-comments/doc-developing/README.md', import.meta.url),
  'utf8'
);
const docDevelopingTldr = readFileSync(
  new URL('../../packages/generic-doc-comments/doc-developing/TLDR.md', import.meta.url),
  'utf8'
);
const docDevelopingTsconfig = readFileSync(
  new URL('../../packages/generic-doc-comments/doc-developing/tsconfig.json', import.meta.url),
  'utf8'
);

test('V26 doc-comment reform supplement keeps admitted support and reference boundaries explicit', () => {
  assert.match(reformSource, /packages\/doc-comment\/\*` is an admitted `ingress-or-support` primitive/u);
  assert.match(reformSource, /packages\/doc-code\/\*` is an admitted `ingress-or-support` plus `compatibility` corridor/u);
  assert.match(reformSource, /packages\/generic-doc-comment-plugins\/\*` is a `reference-only` plugin corridor/u);
  assert.match(reformSource, /not admissible to use this corridor as silent authority/u);
});

test('V26 package docs classify doc-comment as admitted support and keep examples bounded', () => {
  assert.match(docCommentReadme, /V26 status: admitted `ingress-or-support` primitive/u);
  assert.match(docCommentReadme, /not a direct Bitcode product or inference-runtime authority by itself/u);
  assert.match(docCommentImplementation, /base parsing abstraction remains admitted support/u);
  assert.match(docCommentExample, /reference-only example material/u);
});

test('V26 keeps doc-code tool prompt injection explicit under Bitcode ownership', () => {
  assert.match(docCodeReadme, /V26 status: admitted `ingress-or-support` plus `compatibility` corridor/u);
  assert.match(docCodeReadme, /__docCodePrompt = WEB_SEARCH_DOC_CODE_TOOL_PROMPT;/u);
  assert.match(docCodeReadme, /__promptParts = WEB_SEARCH_DOC_CODE_TOOL_PROMPT;/u);
  assert.match(docCodePackage, /"typecheck": "tsc -p tsconfig\.typecheck\.json --noEmit"/u);
  assert.match(docCodeTypecheckTsconfig, /"src\/__tests__\/\*\*\/\*"/u);
  assert.match(docCodeTransformTest, /__promptParts/u);
  assert.match(docCodeIndexJs, /transformDocCodeTools/u);
  assert.match(docCodeTransformJs, /__promptParts/u);
  assert.match(toolsDocCodeIndex, /attachDocCodeToolPrompt/u);
  assert.match(toolsDocCodeIndex, /DocCodeToolPrompt/u);
  assert.match(toolBaseSource, /__promptParts\?: any/u);
});

test('V26 doc-comment plugin docs stop teaching prompt-package internal paths as public API', () => {
  assert.match(docDevelopingReadme, /V26 status: `reference-only`/u);
  assert.match(docDevelopingReadme, /must not treat `packages\/prompts\/src\/\*` or `@bitcode\/prompts\/src\/\*` locations as public API/u);
  assert.doesNotMatch(docDevelopingReadme, /@bitcode\/prompts\/src\/developing\/doc-comment-developing\.ts/u);
  assert.match(docDevelopingTldr, /Prompt-package developing experiments remain internal\/reference-only/u);
  assert.doesNotMatch(docDevelopingTldr, /@bitcode\/prompts\/src\/developing\/doc-comment-developing\.ts/u);
  assert.match(docDevelopingTsconfig, /"\.\.\/\.\.\/\.\.\/tsconfig\.json"/u);
  assert.doesNotMatch(docDevelopingTsconfig, /"references"\s*:/u);
});

test('V26 prompt surface map points doc-comment readers to the reform supplement', () => {
  assert.match(promptSurfaceSource, /protocol-demonstration\/V26_DOC_COMMENT_REFORM\.md/u);
});
