/**
 * Relocated from app/terminal/terminal-workspace-explainers.ts.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */

import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

const TERMINAL_CANON_REFS = [
  'BITCODE_SPEC_V26.md § Terminal acceptance matrix',
  'BITCODE_SPEC_V26.md § Closure work packages',
  'BITCODE_SPEC_V26_PARITY_MATRIX.md § Terminal acceptance parity matrix',
] as const;

const TERMINAL_SOURCE_REFS = [
  'apps/uapi/components/bitcode/pipeline/',
  'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
  'apps/uapi/components/bitcode/pipeline/BitcodeInlineExplainer.tsx',
  'scripts/specifying/public/app.js',
] as const;

export const TERMINAL_SURFACE_EXPLAINERS = {
  experienceMap: buildExplainer({
    kicker: 'Bitcode Terminal operator model',
    title: 'Bitcode Terminal experience map',
    summary:
      'The Bitcode Terminal is the primary operator surface for Deposit, Read, closure, and recent activity results, while Exchange owns the market-wide master-detail view.',
    detail:
      'Use this map to keep the main Bitcode Terminal working surface stable: Deposit, Read, recent activity, and selected results stay primary, while conversations and Auxillaries remain deliberate mode changes instead of parallel destinations, and every one of those reads stays grounded in Bitcode Exchange state and Bitcode Protocol canon.',
    points: [
      'Keeps the ledger and selected activity central',
      'Treats conversations and Auxillaries as deliberate follow-through modes',
      'Keeps Deposit and Read legible as the two primary actions',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: [
        ...TERMINAL_CANON_REFS,
        'BITCODE_SPEC_V26.md § Minimum-functional north star',
      ],
    },
  }),
  controls: buildExplainer({
    kicker: 'Flow control posture',
    title: 'Controls, flow guide, and working posture',
    summary:
      'Scenario, projection, branch mode, guide progress, and closure controls stay in one shared control surface.',
    detail:
      'This card is where the working flow becomes resumable. You should be able to see the current posture, reopen the guide, and continue without reconstructing context.',
    points: [
      'Guide progress is resumable instead of one-shot',
      'Scenario, projection, and branch mode remain explicit',
      'Closure control stays adjacent to the active working posture',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  readScenarios: buildExplainer({
    kicker: 'Read measurement',
    title: 'Read measurement selection',
    summary:
      'The active reader demand frame should be explicit and switchable before you judge fit, proof, or settlement posture.',
    detail:
      'This surface keeps the currently measured demand visible as a first-class Bitcode choice. You should be able to change the scenario, review parser and target posture, and keep moving without dropping into execution plumbing.',
    points: [
      'Keeps the active demand frame explicit',
      'Makes scenario switching part of the Bitcode Terminal',
      'Preserves continuity into fit and closure reading',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/reads/ReadsNeedComposePanel/ReadsNeedComposePanel.tsx',
        'apps/uapi/components/reads/models/read-scenarios.ts',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  supplyInventory: buildExplainer({
    kicker: 'Deposit-side inventory',
    title: 'Search and select supply',
    summary:
      'Deposit-side supply should be searchable, reviewable, and selectable without turning transactions into an infrastructure note.',
    detail:
      'Use this surface to bind the current auth session, narrow the inventory, and keep only the supply you want in the active deposit draft before moving into Depositing, fit, and closure.',
    points: [
      'Keeps searchable supply inside the Bitcode Terminal',
      'Makes selected inventory explicit before Depositing drafting',
      'Preserves continuity into the deposit draft instead of forcing context rebuilds',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  depositComposer: buildExplainer({
    kicker: 'Deposit-side intake',
    title: 'Depositing flow and submission',
    summary:
      'Depositing should read like a resumable working draft built from selected supply, not like infrastructure plumbing.',
    detail:
      'Use this surface to bind selected supply, add issuer and provenance overrides where needed, and submit Depositing while keeping the rest of the working chain coherent.',
    points: [
      'Treats Depositing as a resumable working draft',
      'Keeps selected supply and issuer continuity visible',
      'Feeds directly into fit, proof, and settlement follow-through',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/app/api/deposits/route.ts',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  depositReadChain: buildExplainer({
    kicker: 'Operating chain',
    title: 'Deposit, read, and fit in one read',
    summary:
      'Supply, read measurement, and fit should read as one operating chain so you can judge why the current Bitcode activity is or is not moving forward.',
    detail:
      'The Bitcode Terminal is the short path for understanding what is being offered, what is being measured, and what still blocks a strong fit before closure work begins.',
    points: [
      'Keeps Deposit and Read in one Bitcode Terminal read',
      'Makes asset-pack fit legible before proof and settlement',
      'Supports quick orientation before opening the exact proof view',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
        'apps/uapi/components/bitcode/pipeline/BitcodeActionWorkbenchCard/BitcodeActionWorkbenchCard.tsx',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  closureControls: buildExplainer({
    kicker: 'Closure operation',
    title: 'Run and review closure follow-through',
    summary:
      'Closure work should stay adjacent to the active Bitcode activity detail so verification, branch execution, settlement, and ledger follow-through are one continuous operation.',
    detail:
      'This surface is where you run closure, refresh the current state, and reopen the exact follow-through path without rebuilding context.',
    points: [
      'Keeps closure controls near the active activity',
      'Makes refresh and reset explicit instead of hidden',
      'Preserves continuity into Read review, verification, branch, settlement, and ledger reads',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  closureMap: buildExplainer({
    kicker: 'Closure reading',
    title: 'Read review, branch, settlement, and ledger map',
    summary:
      'Closure should read as one sequence from reviewable Read admission through source-to-shares settlement and ledger continuity rather than as isolated panels.',
    detail:
      'Use this map to preview the review-to-settlement sequence, inspect the strongest metrics and rows for each stage, and open the exact proof view only when you read deeper proof.',
    points: [
      'Keeps Read review and closure stages in one readable sequence',
      'Brings proof and history closer to the Bitcode Terminal',
      'Makes fit-quality and exact-detail reads deliberate instead of mandatory',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  ledgerPulse: buildExplainer({
    kicker: 'At-a-glance read',
    title: 'Pinned operating signals',
    summary:
      'Keep the few live signals that most quickly change your judgment visible without reopening the exact proof view.',
    detail:
      'These signals should help answer whether the current Bitcode activity chain is moving, blocked, proving, or ready for closure before you open proofs, history, or source-path detail.',
    points: [
      'Keeps high-signal posture close to the ledger',
      'Separates quick reading from deep inspection',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  boundaryRuntime: buildExplainer({
    kicker: 'Boundary honesty',
    title: 'External interface readiness',
    summary:
      'Bitcode should show what is live, modeled, boundary-only, or blocked without making you infer that state from failures later in the flow.',
    detail:
      'Use this read before trusting downstream asset packs or settlement. A healthy Bitcode Terminal keeps Bitcode Exchange boundary truth visible, makes third-party connections and attachments legible as ingress/input context, and stays aligned with Bitcode Protocol fail-closed rules.',
    points: [
      'Shows blocked interfaces early',
      'Keeps modeled and live states separate',
      'Supports trust before deeper review',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx',
      ],
      canon: [
        ...TERMINAL_CANON_REFS,
        'BITCODE_SPEC_V26.md § Auxillaries transactional readiness',
      ],
    },
  }),
  activityMap: buildExplainer({
    kicker: 'Section navigation',
    title: 'Bitcode Terminal activity map',
    summary:
      'Preview the deeper deposit, read, fit, verification, artifact, settlement, and ledger sections before opening them in the exact proof view.',
    detail:
      'The map should act like a readable table of contents for the lower Bitcode Terminal flow so you can move from recent activity results into Bitcode Protocol proof without losing context, not like an internal engineering note.',
    points: [
      'Supports quick section discovery',
      'Keeps exact-detail navigation legible',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  repositorySupply: buildExplainer({
    kicker: 'Deposit-side source',
    title: 'Repository supply connection',
    summary:
      'Repository connection and selection make searchable supply explicit before Depositing, fit, and closure read the rest of the chain.',
    detail:
      'This is where you set the boundary for deposit-side supply. It should read as a clean source selection surface, not as infrastructure plumbing.',
    points: [
      'Anchors deposit-side supply to one repository boundary',
      'Keeps provider posture visible',
      'Supports continuing straight into Deposit and Read',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
        'apps/uapi/components/bitcode/pipeline/models/repository-context.ts',
      ],
      canon: [
        ...TERMINAL_CANON_REFS,
        'BITCODE_SPEC_V26.md § Repository and VCS boundary',
      ],
    },
  }),
  supplyFit: buildExplainer({
    kicker: 'Deposit and read map',
    title: 'Supply, read, and fit overview',
    summary:
      'You should be able to read the live deposit-side source, measured read, and fit posture without dropping immediately into the exact proof view.',
    detail:
      'This is the high-level map of why a repository, demand frame, and fit posture belong together in the active Bitcode Terminal.',
    points: [
      'Deposit stays tied to searchable supply',
      'Read stays tied to measured demand',
      'Fit stays explicit before proof and settlement',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  sourcePath: buildExplainer({
    kicker: 'Demonstration witness',
    title: 'Proof and settlement witness',
    summary:
      'Open the demonstration witness when you read the dense deposit-to-settlement follow-through, proofs, or replay detail.',
    detail:
      'This demonstration witness remains available for inspection, but it should feel like a deliberate follow-through surface rather than the main product experience.',
    points: [
      'Supports deep proof and flow inspection',
      'Keeps the Bitcode Terminal uncluttered',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  railModes: buildExplainer({
    kicker: 'Reading modes',
    title: 'Read here, open deeper modes when needed',
    summary:
      'The right rail should keep mode changes obvious without competing with the recent activity result window.',
    detail:
      'Use the rail to open conversations or Auxillaries deliberately, while recent activity and the selected result remain the primary Terminal read surface.',
    points: [
      'Keeps deeper drafting deliberate',
      'Avoids splitting attention away from recent activity results',
      'Preserves orientation when switching modes',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  railSupport: buildExplainer({
    kicker: 'Support context',
    title: 'Keep key activity context close',
    summary:
      'Mode, count, timing, and selected-activity support should stay nearby without replacing the central reading work.',
    detail:
      'The support rail is for quick orientation only. It should keep you anchored while deeper proof, asset-pack, and history reading stays in the main detail surface.',
    points: [
      'Supports quick orientation without duplication',
      'Keeps the main reading surface primary',
      'Makes selected activity context easy to recover',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  railFocus: buildExplainer({
    kicker: 'Selected detail anchor',
    title: 'Reconfirm the active activity',
    summary:
      'The rail should make it easy to confirm which activity is active before you continue reading or switch into a dedicated mode.',
    detail:
      'This card keeps the activity id and short summary close at hand so you can safely resume work after changing filters, modes, or detail tabs.',
    points: [
      'Prevents context loss while moving around the Bitcode Terminal',
      'Keeps the active activity obvious',
      'Supports resumable work',
    ],
    references: {
      source: [
        ...TERMINAL_SOURCE_REFS,
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
} as const;

export const PRODUCT_WORKSPACE_EXPLAINERS = TERMINAL_SURFACE_EXPLAINERS;

export const PRODUCT_INLINE_EXPLAINERS = {
  readWindow: buildExplainer({
    kicker: 'Reading surface',
    title: 'Read window',
    summary:
      'The main Bitcode Terminal read window is recent activity plus the selected Terminal result, not the Exchange master-detail table.',
    detail:
      'Exchange owns the market-wide master-detail loop. Terminal keeps a focused read/write loop for recent Deposit, Read, proof, and closure results; deeper proof, conversation, and auxillary surfaces should remain deliberate follow-through rather than parallel primaries.',
    points: [
      'Read recent Deposit, Read, proof, and closure results without leaving the Terminal',
      'Keep the selected Terminal result primary instead of the Exchange master-detail table',
      'Open deeper proof, conversation, and auxillary surfaces as deliberate follow-through',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        ...TERMINAL_SOURCE_REFS,
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  writePosture: buildExplainer({
    kicker: 'Ledger writes',
    title: 'Write posture',
    summary:
      'Deposit, read, and transactional follow-through are the active write posture of the Bitcode Terminal.',
    detail:
      'This is where click-based and chat-based write paths meet. Conversations can draft, but the ledger-facing write posture still belongs to deposit, read, deposit, branch, and closure so writes land in Bitcode Exchange and remain auditable against Bitcode Protocol canon.',
    points: [
      'Land ledger-facing writes through deposit, read, branch, and closure',
      'Draft in conversations while keeping the auditable write path explicit',
      'Keep every write auditable against Bitcode Protocol canon',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/app/conversations/components/ConversationsOverlay.tsx',
        ...TERMINAL_SOURCE_REFS,
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  scenario: buildExplainer({
    kicker: 'Flow control',
    title: 'Scenario',
    summary:
      'Scenario chooses the currently measured read or operating frame that the rest of the Bitcode flow should honor.',
    detail:
      'Changing the scenario should immediately change what deposit, fit, branch, and closure are reasoning against. It is not a cosmetic filter.',
    points: [
      'Switch the measured read or operating frame the rest of the flow honors',
      'Change what deposit, fit, branch, and closure reason against in one move',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/reads/ReadsNeedComposePanel/ReadsNeedComposePanel.tsx',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  projection: buildExplainer({
    kicker: 'Flow control',
    title: 'Projection',
    summary:
      'Projection determines how the current Bitcode flow is read and staged before materialization.',
    detail:
      'It keeps the operator honest about whether the terminal is previewing, staging, or readying a stronger materialized posture.',
    points: [
      'Check whether the terminal is previewing, staging, or readying materialization',
      'Stage the current flow deliberately before committing a materialized posture',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  branchMode: buildExplainer({
    kicker: 'Execution posture',
    title: 'Branch mode',
    summary:
      'Branch mode sets the exact AssetPack execution posture that the terminal will materialize when you commit the flow.',
    detail:
      'This keeps branch creation as a visible Bitcode decision with direct settlement and proof consequences instead of a hidden platform default.',
    points: [
      'Set the exact AssetPack execution posture the terminal will materialize',
      'Keep branch creation a visible decision with settlement and proof consequences',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  transactionReadiness: buildExplainer({
    kicker: 'Readiness gate',
    title: 'Transaction readiness',
    summary:
      'Transaction readiness is the shared operator contract for wallet identity, verified signing access, repository scope, and anchor posture.',
    detail:
      'When readiness is incomplete, review continuity can stay open but branch, Depositing, and closure should fail closed. Manual wallet identity can still support drafting, but signed settlement stays staged until verified wallet-provider access is present. This explainer should always describe the exact blocker set because signed-transaction posture is a Bitcode Exchange precondition taught by Bitcode Protocol canon.',
    points: [
      'Read the exact blocker set before branch, Depositing, or closure writes',
      'Confirm verified wallet-provider access before signed settlement leaves staging',
      'Keep review continuity open while incomplete readiness fails closed',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx',
      ],
      canon: [
        ...TERMINAL_CANON_REFS,
        'BITCODE_SPEC_V26.md § Wallet and signed transaction posture',
      ],
    },
  }),
  providerRepository: buildExplainer({
    kicker: 'Repository context',
    title: 'Provider and repository',
    summary:
      'This is the deposit-side boundary selector for the repository supply that Bitcode can actually work against.',
    detail:
      'Provider and repository are not incidental settings. They determine the source perimeter for searchable supply, Depositing provenance, and later signed transaction follow-through, while third-party connections and attachments enter here as ingress/input context rather than redefining Bitcode outputs.',
    points: [
      'Set the source perimeter for searchable supply and Depositing provenance',
      'Keep third-party connections and attachments as ingress/input context only',
    ],
    references: {
      source: [
        'apps/uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
        'apps/uapi/components/bitcode/pipeline/models/repository-context.ts',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  repositoryAnchor: buildExplainer({
    kicker: 'Repository context',
    title: 'Record repository anchor',
    summary:
      'Recording the repository anchor writes the selected source perimeter into recent Bitcode Terminal activity.',
    detail:
      'This keeps source posture rereadable in recent Terminal activity alongside deposit, read, proof, and settlement instead of leaving the repository choice as ephemeral UI state.',
    points: [
      'Write the selected source perimeter into recent Bitcode Terminal activity',
      'Reread source posture later alongside deposit, read, proof, and settlement',
    ],
    references: {
      source: [
        'apps/uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
        'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  authSession: buildExplainer({
    kicker: 'Execution identity',
    title: 'Auth session',
    summary:
      'The auth session is the current repo-bound execution identity for deposit-side supply selection.',
    detail:
      'Changing the session changes which authenticated inventory Bitcode can read and later cite in Depositing and branch records.',
    points: [
      'Bind supply selection to the current repo-bound execution identity',
      'Control which authenticated inventory Bitcode reads and later cites',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  artifactKind: buildExplainer({
    kicker: 'Supply filter',
    title: 'Artifact kind',
    summary:
      'Artifact kind narrows the deposit-side inventory to the kinds of share candidates you actually want to work with.',
    detail:
      'It should help the operator shape the selected supply set before Depositing, not act as hidden backend filtering.',
    points: [
      'Narrow deposit-side inventory to the share-candidate kinds you want',
      'Shape the selected supply set before Depositing instead of relying on hidden filtering',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  inventorySearch: buildExplainer({
    kicker: 'Supply search',
    title: 'Inventory search',
    summary:
      'Inventory search is the fast path for narrowing repository supply inside the Bitcode Terminal.',
    detail:
      'It should preserve continuity with repository anchor and selected supply so the operator can move from search straight into Deposit without rebuilding context.',
    points: [
      'Narrow repository supply quickly inside the Bitcode Terminal',
      'Move from search straight into Deposit without rebuilding context',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  activeNeed: buildExplainer({
    kicker: 'Read measurement',
    title: 'Record active read',
    summary:
      'Recording the active read writes the currently measured demand frame into recent Bitcode Terminal activity.',
    detail:
      'This makes the selected read rereadable from the same Terminal activity result path that later shows fit, proof, and settlement.',
    points: [
      'Write the currently measured demand frame into recent Terminal activity',
      'Reread the selected read from the same result path that shows fit, proof, and settlement',
    ],
    references: {
      source: [
        'apps/uapi/components/reads/ReadsNeedComposePanel/ReadsNeedComposePanel.tsx',
        'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  sourceRepo: buildExplainer({
    kicker: 'Source package',
    title: 'Source repo',
    summary:
      'Source repo keeps deposit provenance and repository anchor aligned when a draft needs an explicit repo override.',
    detail:
      'Use it only when the deposit must name a more exact repo boundary than the current selection already provides.',
    points: [
      'Name a more exact repo boundary when a draft needs an explicit override',
      'Keep deposit provenance aligned with the current repository anchor',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  sourceCommit: buildExplainer({
    kicker: 'Source package',
    title: 'Source commit / ref',
    summary:
      'Source commit or ref pins the deposit to a concrete revision when provenance must be exact.',
    detail:
      'This is one of the operator-visible bridges between repository posture, source materialization, and later proof or settlement follow-through.',
    points: [
      'Pin the deposit to a concrete revision when provenance must be exact',
      'Bridge repository posture into later proof and settlement follow-through',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  sourceBranch: buildExplainer({
    kicker: 'Source package',
    title: 'Source branch',
    summary:
      'Source branch scopes the commit list and keeps repository materialization tied to the branch the operator selected.',
    detail:
      'Terminal source selection is repository, branch, and commit together. Changing repository re-reads branches; changing branch re-reads commits so downstream materialization can fetch the exact source snapshot.',
    points: [
      'Scope the commit list to the branch the operator selected',
      'Re-read commits after a branch change so materialization fetches the exact snapshot',
    ],
    references: {
      source: [
        'apps/uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  signerAddress: buildExplainer({
    kicker: 'Signing identity',
    title: 'Signer address',
    summary:
      'Signer address ties deposit posture to the wallet-connected identity expected for signed Bitcode transactions.',
    detail:
      'It is a readiness-bearing field, not free metadata. Once signed transaction closure lands fully, this field remains part of the operator-visible provenance chain.',
    points: [
      'Tie deposit posture to the wallet-connected identity for signed transactions',
      'Treat the field as readiness-bearing provenance, not free metadata',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: [
        ...TERMINAL_CANON_REFS,
        'BITCODE_SPEC_V26.md § Wallet and signed transaction posture',
      ],
    },
  }),
  depositSubmission: buildExplainer({
    kicker: 'Deposit submission',
    title: 'Submit deposit to Bitcode',
    summary:
      'Deposit submission should bind selected supply, provenance, and optional raw content into the same Bitcode activity chain.',
    detail:
      'The operator should be able to submit, reread the ledger row, and continue into fit and closure without leaving the Bitcode Terminal model.',
    points: [
      'Bind selected supply, provenance, and optional raw content into one activity chain',
      'Submit, reread the ledger row, and continue into fit and closure in place',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/app/api/deposits/route.ts',
        'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  assetTitleOverride: buildExplainer({
    kicker: 'Optional metadata',
    title: 'Asset title override',
    summary:
      'Optional. Leave blank to use the selected repository and source revision as the deposit title.',
    detail:
      'Use this only when the visible title should be more specific than the selected repository, branch, and commit already make it.',
    points: [
      'Leave blank to title the deposit from the selected repository and revision',
      'Override only when the visible title must be more specific than the selection makes it',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  authorOverride: buildExplainer({
    kicker: 'Optional metadata',
    title: 'Author override',
    summary:
      'Optional. Leave blank to use the authenticated repository session and connected operator identity.',
    detail:
      'This field is for a human-readable issuer label when the default GitHub/account context is not enough.',
    points: [
      'Leave blank to use the authenticated session and connected operator identity',
      'Add a human-readable issuer label when the default account context is not enough',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  artifactType: buildExplainer({
    kicker: 'Optional metadata',
    title: 'Artifact type',
    summary:
      'Optional. Leave blank unless the selected source needs a format label such as markdown, yaml, ts, or bundle.',
    detail:
      'Artifact type helps later reads understand the shape of the provided source material without changing the selected repository snapshot.',
    points: [
      'Label the provided source format (markdown, yaml, ts, bundle) for later reads',
      'Leave the selected repository snapshot unchanged either way',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  workflowRunId: buildExplainer({
    kicker: 'Optional provenance',
    title: 'Workflow run override',
    summary:
      'Optional. Leave blank unless the deposit should cite a specific CI or workflow run id.',
    detail:
      'This is supporting provenance only; repository, branch, and commit remain the required source selector for materialization.',
    points: [
      'Cite a specific CI or workflow run id when the deposit should carry it',
      'Keep repository, branch, and commit as the required source selector',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  visualPreview: buildExplainer({
    kicker: 'Optional metadata',
    title: 'Visual preview',
    summary:
      'Optional. Leave blank unless this deposit needs a short operator-facing preview summary.',
    detail:
      'The preview should help a reviewer scan the deposit record. It is not a replacement for the selected source revision.',
    points: [
      'Give reviewers a short operator-facing summary to scan the deposit record',
      'Keep the selected source revision as the substance the preview never replaces',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  workingNote: buildExplainer({
    kicker: 'Optional metadata',
    title: 'Working note',
    summary:
      'Optional. Leave blank unless the active deposit draft needs an internal note for review continuity.',
    detail:
      'Working notes should explain operator intent or unusual context without weakening source, wallet, or repository requirements.',
    points: [
      'Record operator intent or unusual context for review continuity',
      'Annotate without weakening source, wallet, or repository requirements',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  tags: buildExplainer({
    kicker: 'Optional metadata',
    title: 'Tags',
    summary:
      'Optional. Leave blank or provide comma-separated labels for later filtering.',
    detail:
      'Tags are metadata for search and review. They do not change source selection or signing posture.',
    points: [
      'Add comma-separated labels for later filtering and review',
      'Tag freely without changing source selection or signing posture',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  rawFallbackContent: buildExplainer({
    kicker: 'Fallback input',
    title: 'Raw fallback content',
    summary:
      'Optional when repository source is selected. Use only when manual content is needed in addition to or instead of inventory.',
    detail:
      'In the normal staging-testnet flow, repository, branch, and commit are the source of truth. Raw fallback content keeps the draft usable when repository inventory is unavailable.',
    points: [
      'Keep the draft usable when repository inventory is unavailable',
      'Add manual content alongside or instead of selected inventory',
      'Prefer repository, branch, and commit as source of truth in the normal flow',
    ],
    references: {
      source: ['apps/uapi/components/bitcode/pipeline/'],
      canon: TERMINAL_CANON_REFS,
    },
  }),
  closureAction: buildExplainer({
    kicker: 'Closure',
    title: 'Closure action',
    summary:
      'Closure action is the visible bridge from Read-review posture into verification, branch, settlement, and ledger follow-through.',
    detail:
      'It should remain adjacent to status, readiness, and closure follow-through links so the operator always understands what the next write will do.',
    points: [
      'Bridge Read-review posture into verification, branch, settlement, and ledger follow-through',
      'Read status, readiness, and follow-through links before committing the next write',
    ],
    references: {
      source: [
        'apps/uapi/components/bitcode/pipeline/',
        'apps/uapi/components/bitcode/pipeline/',
      ],
      canon: TERMINAL_CANON_REFS,
    },
  }),
} as const;
