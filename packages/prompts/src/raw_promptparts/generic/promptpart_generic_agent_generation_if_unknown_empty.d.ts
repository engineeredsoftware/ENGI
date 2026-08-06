/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct the model to include empty values of correct type when data is unknown"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }
 * ]
 */
import { PromptPart } from '../../parts/PromptPart';
export declare const PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY: PromptPart;
