import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: tool
 * intent: "Output contract for improve_developing_behavior"
 * current_version: "V26.00.0"
 * versions: []
 */
export const PROMPTPART_SPECIFIC_TOOL_IMPROVEDEVELOPINGBEHAVIOR_DOCCODETOOLOUTPUT: PromptPart =
  `Output:
- updates (string): Markdown snippet ready to append to .docs/AGENTS.md
- metadata: evidenceDocument reference, instruction/seeking counts, digest usage flags` as PromptPart;