import type { Generation, GenerationPrompt } from './generation';

export type ThinkingsGeneration<TOut = any> = Generation<TOut>;

export function createThinkingsGeneration<TReason, TJudgment, TOut>(
  reason: Generation<TReason>,
  judge: Generation<TJudgment>,
  structured: Generation<TOut>,
  composers: {
    composeJudgePrompt: (base: GenerationPrompt, reason: TReason) => GenerationPrompt;
    composeStructuredPrompt: (base: GenerationPrompt, reason: TReason, judgment: TJudgment) => GenerationPrompt;
  }
): ThinkingsGeneration<TOut> {
  return async (prompt: GenerationPrompt): Promise<TOut> => {
    const r = await reason(prompt);
    const judgePrompt = composers.composeJudgePrompt(prompt, r);
    const j = await judge(judgePrompt);
    const structuredPrompt = composers.composeStructuredPrompt(prompt, r, j);
    const o = await structured(structuredPrompt);
    return o;
  };
}
