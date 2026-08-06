/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "SDIVF DIV iteration law"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "iteration_clarity", "test": "States DIV iteration bounds", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_ITERATION_DETAILCONTENT: PromptPart =
  'DIV may iterate within maxIterations when validation is not ready. Do not skip Setup. Host clone/adopt is Setup\'s responsibility, not pre-pipeline git source.' as PromptPart;
