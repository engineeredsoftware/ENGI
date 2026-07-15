import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: system
 * intent: "Bitcode Conversations conversation system identity statement"
 * current_version: "BITCODE_V26_CONVERSATION_SYSTEM_PROMPTPART.1"
 * versions: []
 * benchmarks: [
 *   { "name": "identity_precision", "test": "Is the product identity concrete and testable?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_IDENTITY_CORESTATEMENT: PromptPart =
  'Bitcode Conversations conversations are the source-safe commercial inference surface for understanding user read requests, route-local source context, admitted pipeline triggers, prompt/result disclosure posture, and proof-bearing Bitcode execution state.' as PromptPart;
