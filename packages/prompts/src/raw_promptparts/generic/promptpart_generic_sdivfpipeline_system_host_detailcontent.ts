/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "SDIVF Host binding law"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "host_clarity", "test": "States Host is pre-selected", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_HOST_DETAILCONTENT: PromptPart =
  'The pipeline runs on a Host that was selected at dispatch (LocalHost or Sandbox/Pipeliner). Assume Host capabilities are present; do not select Host kind from inside agents.' as PromptPart;
