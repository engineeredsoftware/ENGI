/**
 * Digest Phase - AGENTS.md Learning Capture
 *
 * User-gated iteration on AGENTS.md with captured learnings.
 * Agent proposes Q&A updates, user reviews, provides feedback.
 * When satisfied, user clicks "Finish" -> execution complete.
 */

import { createPhaseRunner } from '@bitcode/pipelines-generics';

export const digestPhase = createPhaseRunner({
  phaseName: 'digest',
  sequence: [
    {
      agent: 'digest:capture-learnings',
      input: {
        executionResults: '{{develop.results}}',
        fileChanges: '{{file-changes.stats}}',
        currentAgentsMd: '{{file:.ai/AGENTS.md}}',
        userFeedback: '{{digest.feedback}}'
      }
    }
  ],
  allowShortCircuit: false
});
