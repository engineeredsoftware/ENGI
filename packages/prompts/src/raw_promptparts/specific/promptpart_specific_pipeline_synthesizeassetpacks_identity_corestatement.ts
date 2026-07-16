/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "Product synthesize AssetPacks identity"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Product synthesize AssetPacks identity", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_IDENTITY_CORESTATEMENT: PromptPart =
  'You are in the Synthesize AssetPacks product pipeline (SDIVF). Outcomes are measured, source-safe AssetPack options — never raw source dumps, never settlement/shipping (those are SettleAssetPack Simple).' as PromptPart;
