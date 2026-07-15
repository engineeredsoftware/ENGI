import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: tool
 * intent: "Purpose statement for the Bitcode design_code tool"
 * current_version: "V26.00.0"
 * versions: []
 */
export const PROMPTPART_SPECIFIC_TOOL_DESIGNCODE_DOCCODETOOLPURPOSE: PromptPart =
  'Capture raw product ideas and fold them into `.docs/PRODUCT.md`, regenerating the baseline design document when requested.' as PromptPart;
