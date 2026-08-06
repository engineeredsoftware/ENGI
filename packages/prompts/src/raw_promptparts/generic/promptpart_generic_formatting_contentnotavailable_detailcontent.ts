/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: formatting
 * intent: "Placeholder when required hierarchical path has no content"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Missing content marker", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_FORMATTING_CONTENTNOTAVAILABLE_DETAILCONTENT: PromptPart =
  createPromptPart('THIS CONTENT NOT AVAILABLE');
