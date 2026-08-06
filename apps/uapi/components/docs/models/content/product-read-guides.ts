/**
 * Docs content module: product read guides.
 */
import type { ProductReadGuide } from '../bitcode-docs-types';
import { PRODUCT_INLINE_EXPLAINERS, PRODUCT_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

export const PRODUCT_READ_GUIDES = [
  {
    id: 'activity-ledger',
    read: 'product activity results',
    location: 'Bitcode',
    tellsYou:
      'Which Bitcode activity is selected, how it is typed, and whether it reads as deposit, Read, closure, proof, or history posture.',
    expectedResult:
      'You can search, filter, page, and reopen activity without losing the selected detail read.',
  },
  {
    id: 'selected-detail',
    read: 'Selected activity detail',
    location: 'Bitcode',
    tellsYou:
      'The selected activity identity, source posture, DataPacks, proof rows, closure state, and related history.',
    expectedResult:
      'You can decide whether to stay at summary level or open exact proof, branch, settlement, or ledger detail.',
  },
  {
    id: 'read-window',
    read: PRODUCT_INLINE_EXPLAINERS.readWindow.title,
    location: 'Experience frame',
    tellsYou: PRODUCT_INLINE_EXPLAINERS.readWindow.summary,
    expectedResult:
      'The central ledger remains primary while deeper modes and proof views are deliberate follow-through.',
  },
  {
    id: 'transaction-readiness',
    read: PRODUCT_INLINE_EXPLAINERS.transactionReadiness.title,
    location: 'Command deck, deposit, and closure controls',
    tellsYou: PRODUCT_INLINE_EXPLAINERS.transactionReadiness.summary,
    expectedResult:
      'If readiness is incomplete, branch, deposit, signed settlement, and closure stay fail-closed while review can continue.',
  },
  {
    id: 'boundary-runtime',
    read: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.title,
    location: 'External interface readiness',
    tellsYou: PRODUCT_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
    expectedResult:
      'Live, modeled, boundary-only, and blocked states are visible before downstream proof or settlement work is trusted.',
  },
  {
    id: 'supply-fit',
    read: PRODUCT_WORKSPACE_EXPLAINERS.supplyFit.title,
    location: 'Deposit and read overview',
    tellsYou: PRODUCT_WORKSPACE_EXPLAINERS.supplyFit.summary,
    expectedResult:
      'Repository supply, measured Read, and fit posture can be read together before exact proof inspection.',
  },
  {
    id: 'closure-map',
    read: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.title,
    location: 'Closure and provenance',
    tellsYou: PRODUCT_WORKSPACE_EXPLAINERS.closureMap.summary,
    expectedResult:
      'Read review, verification, branch artifacts, DataPack settlement, and ledger continuity read as one sequence.',
  },
  {
    id: 'proof-runtime',
    read: PRODUCT_WORKSPACE_EXPLAINERS.sourcePath.title,
    location: 'Demonstration witness detail',
    tellsYou: PRODUCT_WORKSPACE_EXPLAINERS.sourcePath.summary,
    expectedResult:
      'Dense replay, proof, and settlement detail stays available without making the main product feel like plumbing.',
  },
  {
    id: 'ledger-pulse',
    read: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.title,
    location: 'Pinned operating signals',
    tellsYou: PRODUCT_WORKSPACE_EXPLAINERS.ledgerPulse.summary,
    expectedResult:
      'You can judge whether activity is moving, blocked, proving, or ready for closure before opening exact detail.',
  },
] as const satisfies readonly ProductReadGuide[];
