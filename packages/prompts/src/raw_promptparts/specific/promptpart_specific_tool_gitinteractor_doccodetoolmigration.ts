/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: tool
 * intent: "Tool-specific semantic unit (PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLMIGRATION)"
 * current_version: "V26.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.50 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.50 }
 * ]
 */

import type { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLMIGRATION: PromptPart = 
  'Use Git interactor tools when the Bitcode operation is concretely Git-shaped; use @bitcode/generic-tools-vcs when the operation should be provider-generic from the start. Keep this package active while it owns current Git-shaped repository semantics.' as PromptPart;
