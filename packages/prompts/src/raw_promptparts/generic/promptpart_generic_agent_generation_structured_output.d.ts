/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct substep to format reasoning and judgment into required type without additional thinking"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }
 * ]
 */
import { PromptPart } from '../../parts/PromptPart';
export declare const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT: PromptPart;
