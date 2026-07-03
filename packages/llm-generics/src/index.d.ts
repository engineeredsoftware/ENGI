/**
 * llm-generics - Pure LLM primitives with zero framework awareness
 *
 * LLMs are simple async functions that transform input to output.
 * Configuration cascades through registries.
 */
export interface LLMInput {
    messages: LLMMessage[];
    config?: Partial<LLMConfig>;
}
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    [key: string]: any;
}
export interface LLMOutputMetadata {
    /**
     * Provider-agnostic stop reason for the completion.
     * Examples: 'stop', 'length', 'content_filter', 'unknown'.
     */
    stopReason?: string;
    [key: string]: any;
}
export interface LLMOutput {
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    metadata?: LLMOutputMetadata;
}
export interface LLMConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    responseFormat?: 'text' | 'json';
    seed?: number;
    [key: string]: any;
}
export type LLM = (input: LLMInput) => Promise<LLMOutput>;
export interface LLMProvider {
    name: string;
    createLLM(config: LLMConfig): LLM;
    validateConfig?(config: LLMConfig): boolean;
    getDefaultConfig?(): Partial<LLMConfig>;
}
export declare class LLMRegistry {
    private configRegistry;
    private providers;
    private defaultProvider;
    constructor();
    registerProvider(provider: LLMProvider): void;
    configure(path: string, config: Partial<LLMConfig>, priority?: number): void;
    getLLM(hierarchy: string[], provider?: string): LLM;
    getSequenceLLM(pipeline: string, phase: string, agent: string, sequence: string, provider?: string): LLM;
    setDefaultProvider(provider: string): void;
}
export declare function factoryLLMRegistry(): LLMRegistry;
export type { Generation, GenerationPrompt } from './generation';
export { createGeneration } from './generation';
export type { ThinkingsGeneration } from './thinkings-generation';
export { createThinkingsGeneration } from './thinkings-generation';
