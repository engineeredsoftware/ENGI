import { createTransform } from '../index';
import docCodeToolLoader from '../loaders/doc-code-tool-loader';

const TOOL_SOURCE = `import { Tool } from '@bitcode/tools-generics';
import { SOME_PROMPT } from './prompts';

/**
 * @doc-code-tool
 * @prompt SOME_PROMPT
 */
class ExampleTool extends Tool<void> {}

export const exampleTool = new ExampleTool();`;

const TOOL_SOURCE_WITHOUT_PROMPT = `import { Tool } from '@bitcode/tools-generics';

/**
 * @doc-code-tool
 */
class MissingPromptTool extends Tool<void> {}

export const missingPromptTool = new MissingPromptTool();`;

const TOOL_SOURCE_WITHOUT_SEMICOLON = TOOL_SOURCE.replace(
  'export const exampleTool = new ExampleTool();',
  'export const exampleTool = new ExampleTool()',
);

describe('createTransform', () => {
  it('attaches doc code prompt exactly once for generic-tools files', async () => {
    const transform = createTransform();
    const filePath = '/workspace/packages/generic-tools/example/src/tool.ts';

    const firstPass = await transform.transform(TOOL_SOURCE, filePath);
    expect(firstPass).toContain('__docCodePrompt');
    expect(firstPass).toContain('__promptParts');
    expect(firstPass).toContain('export const exampleTool = new ExampleTool();');
    expect(firstPass).toContain(';(exampleTool as any).__docCodePrompt = SOME_PROMPT;');
    expect(firstPass.match(/__docCodePrompt/g)).toHaveLength(1);
    expect(firstPass.match(/__promptParts/g)).toHaveLength(1);

    const secondPass = await transform.transform(firstPass, filePath);
    expect(secondPass.match(/__docCodePrompt/g)).toHaveLength(1);
    expect(secondPass.match(/__promptParts/g)).toHaveLength(1);
  });

  it('skips files outside generic-tools or tools-generics', async () => {
    const transform = createTransform();
    const filePath = '/workspace/packages/some-other-package/tool.ts';

    const result = await transform.transform(TOOL_SOURCE, filePath);
    expect(result).toBe(TOOL_SOURCE);
  });

  it('normalizes semicolonless tool instantiations before prompt attachment', async () => {
    const transform = createTransform();
    const filePath = '/workspace/packages/generic-tools/example/src/tool.ts';

    const result = await transform.transform(TOOL_SOURCE_WITHOUT_SEMICOLON, filePath);
    expect(result).toContain('export const exampleTool = new ExampleTool();');
    expect(result).toContain(';(exampleTool as any).__docCodePrompt = SOME_PROMPT;');
    expect(result.match(/__docCodePrompt/g)).toHaveLength(1);
  });
});

describe('docCodeToolLoader', () => {
  const runLoader = (
    source: string,
    resourcePath: string,
    options = {},
  ): string => {
    const context = {
      resourcePath,
      getOptions: () => options,
      emitError: jest.fn(),
    } as unknown as import('webpack').LoaderContext<any>;

    return docCodeToolLoader.call(context, source);
  };

  it('respects loader options and attaches prompt exactly once', () => {
    const path = '/workspace/packages/generic-tools/example/src/tool.ts';
    const transformed = runLoader(TOOL_SOURCE, path, { test: /\.ts$/ });
    expect(transformed.match(/__docCodePrompt/g)).toHaveLength(1);
    expect(transformed.match(/__promptParts/g)).toHaveLength(1);

    const secondPass = runLoader(transformed, path, { test: /\.ts$/ });
    expect(secondPass.match(/__docCodePrompt/g)).toHaveLength(1);
    expect(secondPass.match(/__promptParts/g)).toHaveLength(1);
  });

  it('skips transformation when test pattern does not match', () => {
    const path = '/workspace/packages/generic-tools/example/src/tool.ts';
    const transformed = runLoader(TOOL_SOURCE, path, { test: /\.tsx$/ });
    expect(transformed).toBe(TOOL_SOURCE);
  });

  it('warns and skips when @prompt is missing', () => {
    const path = '/workspace/packages/generic-tools/example/src/tool.ts';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });

    const result = runLoader(TOOL_SOURCE_WITHOUT_PROMPT, path, { test: /\.ts$/ });
    expect(result).toBe(TOOL_SOURCE_WITHOUT_PROMPT);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[doc-code-tool-loader] No @prompt found'));

    warnSpy.mockRestore();
  });
});
