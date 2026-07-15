/**
 * Docs content module: terminal action guides.
 */
import type { ProductActionGuide } from '../bitcode-docs-types';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from '@/components/bitcode/pipeline/models/workspace-explainers';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers';

export const PRODUCT_ACTION_GUIDES = [
  {
    id: 'scenario',
    action: 'Choose the active scenario',
    location: 'Command deck',
    write:
      'Select the measured Read or operating frame the Terminal should honor before fit, branch, and closure work continues.',
    expectedRead:
      'Route readback rereads deposit, read, fit, and closure against the selected scenario rather than treating it as a cosmetic filter.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.scenario.summary,
  },
  {
    id: 'projection',
    action: 'Set projection',
    location: 'Command deck',
    write:
      'Choose whether the current flow is previewing, staging, or readying a stronger materialized posture.',
    expectedRead:
      'The rest of the Terminal should make clear which posture is being read before any state-changing work is trusted.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.projection.summary,
  },
  {
    id: 'branch-mode',
    action: 'Set branch mode',
    location: 'Command deck and closure controls',
    write:
      'Select the AssetPack execution posture that branch materialization should use when closure runs.',
    expectedRead:
      'Branch, settlement, and proof panels should reflect the selected mode as an operator-visible Bitcode decision.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.branchMode.summary,
  },
  {
    id: 'provider-repository',
    action: 'Select provider and repository',
    location: 'Repository context',
    write:
      'Bind the deposit-side boundary to the provider and repository whose source supply the Terminal may search and cite.',
    expectedRead:
      'Repository supply, deposit provenance, and later closure reads should all stay attached to that selected source perimeter.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.providerRepository.summary,
  },
  {
    id: 'repository-anchor',
    action: 'Record repository anchor',
    location: 'Repository context',
    write:
      'Write the selected source perimeter into Bitcode activity so it survives navigation and later rereads.',
    expectedRead:
      'Recent Terminal activity shows repository posture beside deposit, read, proof, and settlement records.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.repositoryAnchor.summary,
  },
  {
    id: 'supply-selection',
    action: 'Search, filter, and select supply',
    location: 'Deposit-side supply',
    write:
      'Use auth session, artifact kind, and inventory search to narrow the supply set before drafting a deposit.',
    expectedRead:
      'Selected inventory remains explicit and can be carried directly into deposit, deposit, fit, and closure.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.summary,
  },
  {
    id: 'deposit-posture',
    action: 'Record deposit-side posture',
    location: 'Deposit + read workbench',
    write:
      'Record the current deposit-side summary into the Bitcode activity ledger when supply posture is ready to be reread.',
    expectedRead:
      'The selected activity can show what was offered, where it came from, and how it relates to later fit.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.depositReadChain.summary,
  },
  {
    id: 'active-read',
    action: 'Record active Read',
    location: 'Read measurement',
    write:
      'Write the currently measured demand frame into the Bitcode activity ledger before fit and closure read against it.',
    expectedRead:
      'The Terminal activity result can reopen the exact Read frame with parser posture, scenario, and review state intact.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.activeNeed.summary,
  },
  {
    id: 'read-review',
    action: 'Accept, reject, or remeasure Read',
    location: 'Read measurement',
    write:
      'Choose whether the measured Read is admitted for Finding Fits, rejected, or sent back for remeasurement with feedback.',
    expectedRead:
      'Finding Fits stays blocked until Read review is accepted, and the closure map shows the current review posture.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.readScenarios.summary,
  },
  {
    id: 'deposit-draft',
    action: 'Complete deposit provenance',
    location: 'Deposit intake',
    write:
      'Set source repo, source commit or ref, signer address, selected supply, and optional raw content where exact provenance is required.',
    expectedRead:
      'The deposit draft reads as source-backed supply rather than loose metadata, with readiness blockers visible before submit.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.summary,
  },
  {
    id: 'deposit-submit',
    action: 'Deposit into Bitcode',
    location: 'Deposit intake',
    write:
      'Submit selected supply, provenance, and content into the Bitcode activity chain.',
    expectedRead:
      'A ledger row should be rereadable immediately and should carry forward into fit, proof, settlement, and history.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.depositSubmission.summary,
  },
  {
    id: 'external-readiness',
    action: 'Record external interface readiness',
    location: 'External interface readiness',
    write:
      'Record whether connections, attachments, repository scope, and boundary services are live, modeled, blocked, or review-only.',
    expectedRead:
      'The Terminal shows boundary truth before downstream AssetPacks or settlement are trusted.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
  },
  {
    id: 'closure-run',
    action: 'Run closure and branch follow-through',
    location: 'Closure controls',
    write:
      'Run the closure path from Read review through verification, branch materialization, settlement, and proof.',
    expectedRead:
      'Verification, branch artifacts, AssetPack settlement, ledger continuity, and history should read as one consequence chain.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.closureAction.summary,
  },
  {
    id: 'closure-refresh-reset',
    action: 'Refresh or reset closure state',
    location: 'Closure controls',
    write:
      'Refresh the current closure read or reset closure state when the operator needs to rebuild the exact follow-through path.',
    expectedRead:
      'The Terminal should make runtime status, visible artifacts, proof families, credited assets, and flow continuity explicit.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.summary,
  },
  {
    id: 'conversations-mode',
    action: 'Open Conversations',
    location: 'Support rail and experience map',
    write:
      'Open natural-language drafting and coordination without losing the current Bitcode activity context.',
    expectedRead:
      'The Terminal remains the primary ledger, while conversation output can assist drafting and follow-through.',
    proofSignal: 'Conversations are a deliberate mode change, not a competing destination.',
  },
  {
    id: 'auxillaries-mode',
    action: 'Open Auxillaries',
    location: 'Support rail and navigation',
    write:
      'Open profile, connects, interface defaults, wallet posture, and $BTD state when identity or interface posture must change.',
    expectedRead:
      'The Terminal keeps its selected activity context while Auxillaries changes readiness and account posture.',
    proofSignal: BITCODE_PUBLIC_EXPLAINERS.openOrbitals.summary,
  },
] as const satisfies readonly ProductActionGuide[];
