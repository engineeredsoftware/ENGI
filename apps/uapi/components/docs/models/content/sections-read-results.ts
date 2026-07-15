/**
 * Docs content module: sections read results.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { PRODUCT_INLINE_EXPLAINERS, PRODUCT_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

export const readResultSections = [
  {
    id: 'closure-map',
    eyebrow: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.kicker ?? 'Closure',
    title: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.title,
    summary: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.summary,
    detail: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.detail ?? '',
    reason:
      'Closure reads let experienced users decide whether a Bitcode activity is ready for deeper proof or settlement trust.',
    points: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.points,
  },
  {
    id: 'ledger-pulse',
    eyebrow: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.kicker ?? 'Signals',
    title: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.title,
    summary: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.summary,
    detail: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.detail ?? '',
    reason:
      'Pinned signals prevent users from opening dense proof detail just to answer whether work is blocked, proving, or ready.',
    points: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.points,
  },
  {
    id: 'boundary-runtime',
    eyebrow: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.kicker ?? 'Readiness',
    title: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.title,
    summary: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
    detail: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.detail ?? '',
    reason:
      'Boundary honesty is what keeps launch-mode mocks, live connections, blocked interfaces, and proof readiness from being conflated.',
    points: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.points,
  },
  {
    id: 'signed-posture',
    eyebrow: 'Signed transaction posture',
    title: PRODUCT_INLINE_EXPLAINERS.transactionReadiness.title,
    summary: PRODUCT_INLINE_EXPLAINERS.transactionReadiness.summary,
    detail: PRODUCT_INLINE_EXPLAINERS.transactionReadiness.detail ?? '',
    reason:
      'Bitcode can teach and stage work before every production connection is live, but it must fail closed before signed settlement when readiness is incomplete.',
  },
] as const satisfies readonly DocsGuideCard[];
