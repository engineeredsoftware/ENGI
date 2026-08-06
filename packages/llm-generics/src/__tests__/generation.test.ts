import { createGeneration } from '../generation';
import { createThinkingsGeneration } from '../thinkings-generation';
import type { LLM, LLMInput, LLMOutput } from '../index';

describe('generation primitives', () => {
  const mockLLM = (response: LLMOutput): LLM => jest.fn(async (_input: LLMInput) => response);

  it('createGeneration formats input, calls llm, then parses output', async () => {
    const llmResponse: LLMOutput = { content: 'raw-json', usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 } };
    const llm = mockLLM(llmResponse);
    const format = jest.fn((): LLMInput => ({ messages: [{ role: 'user', content: 'hello' as const }] }));
    const parse = jest.fn(() => ({ parsed: true }));

    const generation = createGeneration({ llm, format, parse });
    const prompt = { kind: 'test-prompt' } as any;
    const result = await generation(prompt);

    expect(format).toHaveBeenCalledWith(prompt);
    expect(llm).toHaveBeenCalledWith({ messages: [{ role: 'user', content: 'hello' }] });
    expect(parse).toHaveBeenCalledWith(llmResponse);
    expect(result).toEqual({ parsed: true });
  });

  it('createThinkingsGeneration sequences reason, judge, and structured generations', async () => {
    const reason = jest.fn(async () => 'reasoning');
    const judge = jest.fn(async () => 'judgment');
    const structured = jest.fn(async () => ({ output: 'final' }));

    const composeJudgePrompt = jest.fn((base, reasonResult) => ({ ...base, reasonResult }));
    const composeStructuredPrompt = jest.fn((base, reasonResult, judgment) => ({ ...base, reasonResult, judgment }));

    const thinkings = createThinkingsGeneration(reason, judge, structured, {
      composeJudgePrompt,
      composeStructuredPrompt,
    });

    const basePrompt = { kind: 'analysis' } as any;
    const result = await thinkings(basePrompt);

    expect(reason).toHaveBeenCalledWith(basePrompt);
    expect(composeJudgePrompt).toHaveBeenCalledWith(basePrompt, 'reasoning');
    expect(judge).toHaveBeenCalledWith({ kind: 'analysis', reasonResult: 'reasoning' });
    expect(composeStructuredPrompt).toHaveBeenCalledWith(basePrompt, 'reasoning', 'judgment');
    expect(structured).toHaveBeenCalledWith({ kind: 'analysis', reasonResult: 'reasoning', judgment: 'judgment' });
    expect(result).toEqual({ output: 'final' });
  });
});
