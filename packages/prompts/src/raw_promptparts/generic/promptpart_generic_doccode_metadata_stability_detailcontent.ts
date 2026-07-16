/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: tool
 * intent: "Doc-code metadata stability marker"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Doc-code metadata stability marker", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_DOCCODE_METADATA_STABILITY_DETAILCONTENT: PromptPart = createPromptPart(
  'stable',
);
