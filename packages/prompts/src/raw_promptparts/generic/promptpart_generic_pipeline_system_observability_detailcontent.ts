/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "Primitive Pipeline observability law"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "observability_clarity", "test": "States auditability expectations", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PIPELINE_SYSTEM_OBSERVABILITY_DETAILCONTENT: PromptPart =
  'Every agent step and generation is auditable. Prefer precise, minimal context selection and schema-valid JSON when required.' as PromptPart;
