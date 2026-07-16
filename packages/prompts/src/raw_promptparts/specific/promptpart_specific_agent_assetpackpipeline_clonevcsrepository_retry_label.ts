import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository retry label"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "label_clarity", "test": "Label communicates step purpose", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL: PromptPart =
  'RETRY: Re-try clone using prior Try errors' as PromptPart;
