/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Thin VCS agent context — provider APIs, not DevOps soup"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_CONTEXT: PromptPart =
  'Operate via Host-bound VCS provider APIs (GitHub, GitLab, Bitbucket). Prefer API clone/checkout over local shell git. Stay provider-agnostic and non-destructive.' as PromptPart;
