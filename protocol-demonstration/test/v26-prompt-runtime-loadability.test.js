import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const promptsRequire = createRequire(new URL('../../packages/prompts/package.json', import.meta.url));
const conversationsRequire = createRequire(new URL('../../packages/conversations/package.json', import.meta.url));
const toolsRequire = createRequire(new URL('../../packages/tools-generics/package.json', import.meta.url));

test('V26 prompt and doc-code runtime carriers resolve through public package boundaries without pulling full execution storage runtime', () => {
  const promptPrimitive = promptsRequire('@bitcode/prompts/prompt');
  const promptExecution = promptsRequire('@bitcode/prompts/execution/PromptExecution');
  const executionPrompt = conversationsRequire('@bitcode/execution-generics/prompts/ExecutionPrompt');
  const executionCore = toolsRequire('@bitcode/execution-generics/Execution');
  const registryCore = toolsRequire('@bitcode/registry');
  const docCommentBase = toolsRequire('@bitcode/doc-comment-generics/base-plugin');
  const docCode = toolsRequire('@bitcode/generic-doc-comments-doc-code');
  const docCodeToolPrompt = toolsRequire('@bitcode/tools-generics/doc-code-tool');
  const toolsRoot = toolsRequire('@bitcode/tools-generics');

  assert.equal(typeof promptPrimitive.Prompt, 'function');
  assert.equal(typeof promptExecution.PromptExecution, 'function');
  assert.equal(typeof promptExecution.createPromptExecution, 'function');
  assert.equal(typeof executionPrompt.ExecutionPrompt, 'function');
  assert.equal(typeof executionPrompt.createExecutionPrompt, 'function');
  assert.equal(typeof executionCore.Execution, 'function');
  assert.equal(typeof registryCore.RegistryImpl, 'function');
  assert.equal(typeof docCommentBase.BaseDocCommentPlugin, 'function');
  assert.equal(typeof docCode.createTransform, 'function');
  assert.equal(typeof docCodeToolPrompt.DocCodeToolPrompt, 'function');
  assert.equal(typeof toolsRoot.Tool, 'function');
  assert.equal(typeof toolsRoot.attachDocCodeToolPrompt, 'function');
});
