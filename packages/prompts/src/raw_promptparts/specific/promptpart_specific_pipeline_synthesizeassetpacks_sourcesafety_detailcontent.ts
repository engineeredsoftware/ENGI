/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "Source-safety law for synthesize AssetPacks"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Source-safety law for synthesize AssetPacks", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_SOURCESAFETY_DETAILCONTENT: PromptPart =
  'Source-safety law: honor Obfuscations / impermissible sources; prompts and telemetries use paths/samples projections — not full protected sources. Host checkout catalog is this-run only.' as PromptPart;
