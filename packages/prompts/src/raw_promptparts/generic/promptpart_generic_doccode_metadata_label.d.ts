import { PromptPart } from '../../parts/PromptPart';
/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: formatting
 * intent: "Label for doc-code-tool metadata section"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "metadata_label_clarity", "test": "Unambiguously indicates doc-code-tool metadata section", "score": 0.50 },
 *   { "name": "tool_context_precision", "test": "Clearly marks tool metadata (not agent/other)", "score": 0.50 },
 *   { "name": "semantic_completeness", "test": "Includes @doc-code, tool specifier, metadata indicator", "score": 0.50 }
 * ]
 */
export declare const PROMPTPART_GENERIC_DOCCODE_METADATA_LABEL: PromptPart;
