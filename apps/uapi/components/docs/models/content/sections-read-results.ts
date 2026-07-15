/**
 * Docs content module: sections read results.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { TERMINAL_INLINE_EXPLAINERS, TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

export const readResultSections = [
  {
    id: 'closure-map',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.kicker ?? 'Closure',
    title: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.detail ?? '',
    reason:
      'Closure reads let experienced users decide whether a Bitcode activity is ready for deeper proof or settlement trust.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.points,
  },
  {
    id: 'ledger-pulse',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.kicker ?? 'Signals',
    title: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.detail ?? '',
    reason:
      'Pinned signals prevent users from opening dense proof detail just to answer whether work is blocked, proving, or ready.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.points,
  },
  {
    id: 'boundary-runtime',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.kicker ?? 'Readiness',
    title: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.detail ?? '',
    reason:
      'Boundary honesty is what keeps launch-mode mocks, live connections, blocked interfaces, and proof readiness from being conflated.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.points,
  },
  {
    id: 'signed-posture',
    eyebrow: 'Signed transaction posture',
    title: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.title,
    summary: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.summary,
    detail: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.detail ?? '',
    reason:
      'Bitcode can teach and stage work before every production connection is live, but it must fail closed before signed settlement when readiness is incomplete.',
  },
] as const satisfies readonly DocsGuideCard[];
