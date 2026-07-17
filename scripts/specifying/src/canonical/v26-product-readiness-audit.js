// @ts-check

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '../../../..');

const PRODUCT_READINESS_AUDIT_ROWS = [
  {
    productId: 'bitcode-protocol',
    productName: 'Bitcode Protocol',
    baselineReadiness: 'deterministic-protocol-witness-backed',
    parityMatrixAnchor: 'Source-to-shares fifth-gate proof',
    requiredEvidence: [
      ['protocol-demonstration/src/bitcode-demo.js', 'runMakeBitcodeBranch'],
      ['protocol-demonstration/src/canonical/read-measurement.js', 'reviewReadForFitSearch'],
      ['protocol-demonstration/src/canonical/settlement.js', 'quantizedFitQualities'],
      ['protocol-demonstration/test/v26-read-review-source-to-shares.test.js', 'V26 settlement review and receipts show quantized source-to-shares fit qualities'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Source-to-shares fifth-gate proof']
    ],
    closureNotes: [
      'eighth-gate whole-repository provation is closed by the generated V26 total-closure proof'
    ]
  },
  {
    productId: 'bitcode-exchange',
    productName: 'Bitcode Exchange',
    baselineReadiness: 'exchange-lite-route-and-state-backed',
    parityMatrixAnchor: 'App-owned protocol/API ownership',
    requiredEvidence: [
      ['protocol-demonstration/server.js', 'createAppContext'],
      ['protocol-demonstration/server.js', 'readFittingReview'],
      ['apps/uapi/app/api/state/route.ts', 'getBitcodeAppContext().getState(principal)'],
      ['apps/uapi/app/api/read-review/route.ts', 'getBitcodeAppContext().getReadReview'],
      ['apps/uapi/app/api/make-bitcode-branch/route.ts', 'makeBitcodeBranch'],
      ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'App-owned protocol/API ownership']
    ],
    closureNotes: [
      'broader Exchange marketplace breadth remains V28-style expansion work',
      'eighth-gate whole-repository provation is closed for the V26 minimum commercial implementation'
    ]
  },
  {
    productId: 'bitcode-terminal',
    productName: 'Bitcode',
    baselineReadiness: 'terminal-lite-and-demonstration-read-backed',
    parityMatrixAnchor: 'Bitcode read/write loop',
    requiredEvidence: [
      ['protocol-demonstration/public/app.js', '__BITCODE_DEMONSTRATION_SHELL_SNAPSHOT__'],
      ['protocol-demonstration/test/v26-uapi-app-router-entrypoints.test.js', 'TypeScript-only'],
      ['apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx', 'TerminalReadScenarioPanel'],
      ['apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx', 'TerminalLiveSummaryStrip'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts', 'route_repository_context'],
      ['apps/uapi/components/reads/ReadsRepositoryContextPanel/ReadsRepositoryContextPanel.tsx', 'Inventory source'],
      ['apps/uapi/components/reads/ReadsRepositoryContextPanel/ReadsRepositoryContextPanel.tsx', 'Reconnect Connects to restore live write admission'],
      ['apps/uapi/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow.tsx', 'Settlement posture'],
      ['apps/uapi/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow.tsx', 'Repository posture'],
      ['apps/uapi/components/bitcode/routes/ProductRouteShell/ProductRouteShell.tsx', 'repository-reconnect-required'],
      ['apps/uapi/components/bitcode/routes/ProductRouteShell/ProductRouteShell.tsx', 'wallet-reconnect-required'],
      ['apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts', "status: draft.status || 'completed'"],
      ['apps/uapi/components/reads/ReadsReadScenarioPanel/ReadsReadScenarioPanel.tsx', 'Read-fitting Exchange review'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-readiness.ts', 'Read closure as one sequence from reviewable Read admission'],
      ['apps/uapi/components/bitcode/pipeline/models/pipeline-run-data.ts', 'fitQualities: coerceFitQualities'],
      ['apps/uapi/tests/api/vcsRepositoriesInventoryParity.test.ts', 'stored repository inventory and skips live provider reads'],
      ['apps/uapi/tests/api/executionsHistoryWriteReadParity.test.ts', 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger'],
      ['apps/uapi/tests/terminalLiveSummaryStrip.test.tsx', 'GitHub reconnect required · stored Exchange inventory'],
      ['apps/uapi/tests/terminalFlowGuideCard.test.tsx', 'repository-reconnect-required'],
      ['apps/uapi/tests/terminalTransactionReadinessSource.test.ts', 'route_repository_context'],
      ['apps/uapi/tests/terminalRepositoryContextPanel.test.tsx', 'Saved GitHub attachment found, but the live provider session must reconnect'],
      ['apps/uapi/tests/terminalReadScenarios.test.ts', 'normalizes Exchange Read-fitting review state for product review controls'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', '`Bitcode` read/write loop']
    ],
    closureNotes: [
      'clean promotion and whole-flow browser provation are represented by the Gate 8 proof family',
      'eighth-gate whole-repository provation is closed for the V26 product baseline'
    ]
  },
  {
    productId: 'source-to-shares-read-fitting',
    productName: 'Read-fitting and settlement review',
    baselineReadiness: 'implemented-fifth-gate-slice',
    parityMatrixAnchor: 'Read review before fit search',
    requiredEvidence: [
      ['protocol-demonstration/server.js', 'bitcode-read-fitting-review'],
      ['apps/uapi/components/reads/ReadsReadScenarioPanel/ReadsReadScenarioPanel.tsx', 'normalizeTerminalReadFittingReview'],
      ['apps/uapi/tests/api/readReviewRoute.test.ts', 'presents a reviewable Read before fit search'],
      ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'readFittingReview'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Read review before fit search']
    ],
    closureNotes: [
      'fit-candidate marketplace UX remains V28-style Exchange expansion work',
      'eighth-gate total provation is closed for the V26 Read-fitting and settlement baseline'
    ]
  },
  {
    productId: 'assetpack-execution',
    productName: 'AssetPack execution and Finish/Delivering',
    baselineReadiness: 'materially-implemented-open',
    parityMatrixAnchor: 'AssetPack pipeline corridor',
    requiredEvidence: [
      ['packages/asset-packs-pipelines/syntheses/domain/src/postprocess.ts', 'assetPackSynthesisArtifacts'],
      ['packages/asset-packs-pipelines/syntheses/domain/src/agents/finish-delivery-agents.ts', 'finish:asset-pack'],
      ['packages/pipelines-generics/src/phases/sdivf-factory.ts', 'SDIVF'],
      ['protocol-demonstration/test/v26-pipeline-finish-reform.test.js', 'SDIVF'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'retained execution/AssetPack readers no longer teach generic developer-platform meaning']
    ],
    closureNotes: [
      'broader asset-pack marketplace delivery breadth remains later-gate expansion work',
      'eighth-gate total provation closes the V26 AssetPack execution and PR Finish baseline'
    ]
  },
  {
    productId: 'conversations-rich-input',
    productName: 'Conversations rich-input write surface',
    baselineReadiness: 'implemented-active-slices-open',
    parityMatrixAnchor: 'Conversations as Bitcode rich input',
    requiredEvidence: [
      ['packages/api/src/routes/conversations.ts', 'rich_input'],
      ['packages/api/src/conversations/conversations.ts', 'copiedAttachmentCount'],
      ['packages/api/src/conversations/__tests__/branch-conversation.test.ts', 'copiedAttachmentCount'],
      ['apps/uapi/tests/api/conversationBranchRoute.test.ts', 'copiedAttachmentCount'],
      ['.proofs/_shared/conversations-continuity-proof.json', 'rich_input'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Conversations and rich-input continuity']
    ],
    closureNotes: [
      'whole-repository interface provation is closed by the Gate 8 prompt and repository proof family'
    ]
  },
  {
    productId: 'auxillaries-readiness',
    productName: 'Auxillaries readiness and transactional admission',
    baselineReadiness: 'materially-implemented-open',
    parityMatrixAnchor: 'Transactional readiness and signed-settlement admission',
    requiredEvidence: [
      ['apps/uapi/components/bitcode/pipeline/models/transaction-readiness.ts', 'canSettle'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-readiness.ts', 'repository reconnect required'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-readiness.ts', 'wallet reconnect required'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts', 'requireBitcodeSignedTransactionReadiness'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts', 'repository inventory'],
      ['apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts', 'readBitcodeWalletConnectionStatus'],
      ['apps/uapi/app/api/auxillaries/data/route.ts', 'repositoryConnectionStatus'],
      ['apps/uapi/app/api/auxillaries/data/route.ts', 'repositoryInventorySource'],
      ['apps/uapi/app/api/auxillaries/data/route.ts', 'resolveWalletConnectionStatus'],
      ['apps/uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', 'Connects'],
      ['apps/uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', 'Reconnect required'],
      ['apps/uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', 'stored-first or live-fallback inventory contract'],
      ['apps/uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', 'Saved verified wallet-provider signer posture exists, but the live signer session needs reconnect'],
      ['apps/uapi/components/auxillaries/AuxillariesProfilePane/AuxillariesProfilePane.tsx', 'Profile'],
      ['apps/uapi/tests/bitcodeTransactionReadiness.test.ts', 'signed settlement remains staged'],
      ['apps/uapi/tests/bitcodeTransactionReadiness.test.ts', 'wallet reconnect required'],
      ['apps/uapi/tests/userDataRoute.test.ts', 'repositoryConnectionStatus'],
      ['apps/uapi/tests/userDataRoute.test.ts', 'repositoryInventorySource'],
      ['apps/uapi/tests/userDataRoute.test.ts', 'walletConnectionStatus'],
      ['apps/uapi/tests/auxillariesConnectsPane.test.tsx', 'stored Exchange inventory'],
      ['apps/uapi/tests/auxillariesConnectsPane.test.tsx', 'Reconnect required'],
      ['apps/uapi/tests/terminalCommandDeck.test.tsx', 'repository reconnect required'],
      ['apps/uapi/tests/terminalClosureControlDeck.test.tsx', 'repository reconnect required'],
      ['apps/uapi/tests/terminalDepositComposerCard.test.tsx', 'repository reconnect required'],
      ['apps/uapi/tests/orbitalsBTDPane.test.tsx', 'wallet provider must reconnect before Bitcode can rely on live signing again'],
      ['apps/uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'Reconnect GitHub'],
      ['apps/uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'live wallet-provider signing session is no longer available'],
      ['apps/uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'outside the connected provider inventory'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Transactional readiness and signed-settlement admission']
    ],
    closureNotes: [
      'provider-backed wallet signing breadth remains V27+ Packs/Exchange expansion work',
      'manual wallet identity is not equivalent to signed settlement',
      'stored repository inventory does not by itself prove a still-valid live provider session',
      'saved verified wallet signer posture does not by itself prove a still-live wallet-provider signing session'
    ]
  },
  {
    productId: 'connected-interfaces',
    productName: 'Connected interfaces: MCP and ChatGPT App',
    baselineReadiness: 'materially-implemented-open',
    parityMatrixAnchor: 'API / MCP / third-party parity',
    requiredEvidence: [
      ['apps/mcp/src/tools/pipeline-tools.ts', 'writeAdmission'],
      ['apps/mcp/src/types/index.ts', 'RepositoryContextSchema'],
      ['apps/chatgpt/src/tools.ts', 'confirmed'],
      ['apps/chatgpt/src/__tests__/tools.test.ts', 'rejects ChatGPT App connected-interface writes without explicit confirmation'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'API / MCP / third-party parity']
    ],
    closureNotes: [
      'broader third-party ingress breadth remains later-gate expansion work',
      'eighth-gate whole-interface provation is closed for the admitted V26 connected interfaces'
    ]
  },
  {
    productId: 'proof-and-promotion',
    productName: 'Proof and promotion controls',
    baselineReadiness: 'proof-backed-open',
    parityMatrixAnchor: 'Proof and generated-evidence parity matrix',
    requiredEvidence: [
      ['scripts/generate-bitcode-proven.mjs', 'generateCanonicalProvenMarkdown'],
      ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26FifthGateClosureDeepeningProof'],
      ['.proofs/_shared/source-to-shares-fifth-gate-proof.json', 'v26-source-to-shares-fifth-gate-proof'],
      ['.proofs/_shared/fifth-gate-closure-deepening-proof.json', 'v26-fifth-gate-closure-deepening-proof'],
      ['.specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Proof and generated-evidence parity matrix']
    ],
    closureNotes: [
      'clean canonical regeneration is represented by the generated V26 total-closure artifact and promoted spec-family report'
    ]
  }
];

const PRODUCT_MVP_EVIDENCE_BY_ID = {
  'bitcode-protocol': [
    ['.specifications/BITCODE_SPEC_V26.md', 'Sixth-gate is closed only when:'],
    ['protocol-demonstration/V26_PROOF_SURFACES.md', 'Gate 6: minimal viable product elevation'],
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SixthGateMvpClosureProof']
  ],
  'bitcode-exchange': [
    ['apps/uapi/tests/api/executionsHistoryWriteReadParity.test.ts', 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger'],
    ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route'],
    ['apps/uapi/tests/api/activityRoute.test.ts', 'returns live activity with persisted execution reread and notification aggregation']
  ],
  'bitcode-terminal': [
    ['apps/uapi/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge.tsx', 'TERMINAL_MVP_SURFACE_MAP'],
    ['apps/uapi/tests/terminalExperienceArchitecture.test.ts', 'locks the product map to activity, transactions, conversations, and auxillaries'],
    ['apps/uapi/tests/e2e/terminal.flow.spec.ts', 'product route keeps read, selection, and repository-anchor write-through in one product surface']
  ],
  'source-to-shares-read-fitting': [
    ['apps/uapi/tests/api/readReviewRoute.test.ts', 'presents a reviewable Read before fit search'],
    ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'readFittingReview'],
    ['protocol-demonstration/test/v26-read-review-source-to-shares.test.js', 'V26 settlement review and receipts show quantized source-to-shares fit qualities']
  ],
  'assetpack-execution': [
    ['packages/asset-packs-pipelines/syntheses/domain/src/postprocess.ts', 'assetPackSynthesisArtifacts'],
    ['packages/asset-packs-pipelines/syntheses/domain/src/agents/finish-delivery-agents.ts', 'finish:asset-pack'],
    ['protocol-demonstration/test/v26-shippable-reform.test.js', 'implementation, validation, and Finish carriers separate AssetPack kind from delivery templates']
  ],
  'conversations-rich-input': [
    ['apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx', 'Multiple view modes (floating, sidebar, fullscreen, split-screen)'],
    ['apps/uapi/tests/conversationsRouteClient.test.tsx', 'forceFullscreen=true'],
    ['apps/chatgpt/src/server.ts', 'connected-interface Bitcode product companion']
  ],
  'auxillaries-readiness': [
    ['apps/uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', '$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture'],
    ['apps/uapi/tests/orbitalsBTDPane.test.tsx', 'wallet provider must reconnect before Bitcode can rely on live signing again'],
    ['apps/uapi/tests/userDataRoute.test.ts', 'walletConnectionStatus']
  ],
  'connected-interfaces': [
    ['apps/mcp/src/tools/pipeline-tools.ts', 'writeAdmission'],
    ['apps/chatgpt/src/__tests__/tools.test.ts', 'declares confirmation schema on every ChatGPT App connected-interface write carrier'],
    ['apps/chatgpt/src/server.ts', 'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state']
  ],
  'proof-and-promotion': [
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SixthGateMvpClosureProof'],
    ['protocol-demonstration/test/proven-generator.test.js', 'sixthGateClosurePassed, true'],
    ['protocol-demonstration/test/v26-gate-acceptance-criteria.test.js', 'V26 generated proofs close fifth, sixth, seventh, and eighth gates']
  ]
};

const PRODUCT_LAUNCH_EVIDENCE_BY_ID = {
  'bitcode-protocol': [
    ['.specifications/BITCODE_SPEC_V26.md', 'Seventh-gate is closed only when:'],
    ['protocol-demonstration/V26_PROOF_SURFACES.md', 'Gate 7: initial commercially-viable testnet live-launch refinement'],
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SeventhGateCommercialTestnetLaunchProof']
  ],
  'bitcode-exchange': [
    ['apps/uapi/tests/api/executionsHistoryWriteReadParity.test.ts', 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger'],
    ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route'],
    ['apps/uapi/tests/api/activityRoute.test.ts', 'returns live activity with persisted execution reread and notification aggregation']
  ],
  'bitcode-terminal': [
    ['apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts', 'TERMINAL_COMMERCIAL_TESTNET_LAUNCH_MAP'],
    ['apps/uapi/tests/terminalCommercialLaunchReadiness.test.ts', 'locks the launch-readiness rows required after MVP closure'],
    ['apps/uapi/tests/e2e/terminal.flow.spec.ts', 'product route keeps read, selection, and repository-anchor write-through in one product surface']
  ],
  'source-to-shares-read-fitting': [
    ['protocol-demonstration/test/v26-read-review-source-to-shares.test.js', 'V26 settlement review and receipts show quantized source-to-shares fit qualities'],
    ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'readFittingReview'],
    ['apps/uapi/tests/api/readReviewProtocolParity.test.ts', 'source-to-shares settlement artifacts']
  ],
  'assetpack-execution': [
    ['protocol-demonstration/test/v26-shippable-reform.test.js', 'implementation, validation, and Finish carriers separate AssetPack kind from delivery templates'],
    ['packages/asset-packs-pipelines/syntheses/domain/src/postprocess.ts', 'assetPackSynthesisArtifacts'],
    ['packages/asset-packs-pipelines/syntheses/domain/src/agents/finish-delivery-agents.ts', 'finish:asset-pack-create-pull-request-delivery-agent']
  ],
  'conversations-rich-input': [
    ['apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx', 'Multiple view modes (floating, sidebar, fullscreen, split-screen)'],
    ['apps/uapi/tests/conversationsRouteClient.test.tsx', 'forceFullscreen=true'],
    ['apps/chatgpt/src/server.ts', 'connected-interface Bitcode product companion']
  ],
  'auxillaries-readiness': [
    ['apps/uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', '$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture'],
    ['apps/uapi/tests/orbitalsBTDPane.test.tsx', 'wallet provider must reconnect before Bitcode can rely on live signing again'],
    ['apps/uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'live wallet-provider signing session is no longer available']
  ],
  'connected-interfaces': [
    ['apps/mcp/src/tools/pipeline-tools.ts', 'writeAdmission'],
    ['apps/chatgpt/src/__tests__/tools.test.ts', 'declares confirmation schema on every ChatGPT App connected-interface write carrier'],
    ['apps/chatgpt/src/server.ts', 'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state']
  ],
  'proof-and-promotion': [
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SeventhGateCommercialTestnetLaunchProof'],
    ['protocol-demonstration/test/proven-generator.test.js', 'seventhGateClosurePassed, true'],
    ['protocol-demonstration/test/v26-gate-acceptance-criteria.test.js', 'V26 generated proofs close fifth, sixth, seventh, and eighth gates']
  ]
};

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 */
function readSource(repoRoot, relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

/**
 * @param {string} repoRoot
 * @param {[string, string]} evidence
 */
function checkEvidence(repoRoot, evidence) {
  const [file, requiredText] = evidence;
  const absolutePath = path.join(repoRoot, file);
  const filePresent = existsSync(absolutePath);
  const evidencePresent = filePresent && readSource(repoRoot, file).includes(requiredText);

  return {
    file,
    requiredText,
    filePresent,
    evidencePresent,
    passed: filePresent && evidencePresent
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: {
 *     canonicalCommit?: string,
 *     generatorId?: string,
 *     worktreeState?: string
 *   },
 *   repoRoot?: string
 * }} input
 */
export function buildV26ProductReadinessAudit({
  generatedAt,
  baseData,
  repoRoot = DEFAULT_REPO_ROOT
}) {
  const products = PRODUCT_READINESS_AUDIT_ROWS.map((row) => {
    const evidenceChecks = row.requiredEvidence.map((entry) => checkEvidence(repoRoot, entry));
    const baselineEvidencePassed = evidenceChecks.every((entry) => entry.passed === true);
    const mvpEvidence = PRODUCT_MVP_EVIDENCE_BY_ID[row.productId] || [];
    const mvpEvidenceChecks = mvpEvidence.map((entry) => checkEvidence(repoRoot, entry));
    const mvpEvidencePassed = baselineEvidencePassed
      && mvpEvidenceChecks.length > 0
      && mvpEvidenceChecks.every((entry) => entry.passed === true);
    const launchEvidence = PRODUCT_LAUNCH_EVIDENCE_BY_ID[row.productId] || [];
    const launchEvidenceChecks = launchEvidence.map((entry) => checkEvidence(repoRoot, entry));
    const launchEvidencePassed = mvpEvidencePassed
      && launchEvidenceChecks.length > 0
      && launchEvidenceChecks.every((entry) => entry.passed === true);

    return {
      productId: row.productId,
      productName: row.productName,
      baselineReadiness: row.baselineReadiness,
      parityMatrixAnchor: row.parityMatrixAnchor,
      baselineEvidencePassed,
      mvpEvidencePassed,
      readyForFifthGateBaseline: baselineEvidencePassed,
      readyForFifthGateClosure: baselineEvidencePassed,
      readyForSixthGateMvp: mvpEvidencePassed,
      readyForSeventhGateCommercialTestnetLaunch: launchEvidencePassed,
      closureClaim: baselineEvidencePassed,
      sixthGateMvpClaim: mvpEvidencePassed,
      seventhGateCommercialTestnetLaunchClaim: launchEvidencePassed,
      openReadiness: [],
      closureNotes: row.closureNotes,
      evidenceChecks,
      mvpEvidenceChecks,
      launchEvidenceChecks,
      launchEvidencePassed
    };
  });
  const baselinePassed = products.every((product) => product.baselineEvidencePassed === true);
  const mvpPassed = products.every((product) => product.mvpEvidencePassed === true);
  const launchPassed = products.every((product) => product.launchEvidencePassed === true);
  const closureReadyProducts = products.filter((product) => product.readyForFifthGateClosure === true);
  const openProducts = products.filter((product) => product.readyForFifthGateClosure !== true);
  const mvpReadyProducts = products.filter((product) => product.readyForSixthGateMvp === true);
  const mvpOpenProducts = products.filter((product) => product.readyForSixthGateMvp !== true);
  const launchReadyProducts = products.filter((product) => product.readyForSeventhGateCommercialTestnetLaunch === true);
  const launchOpenProducts = products.filter((product) => product.readyForSeventhGateCommercialTestnetLaunch !== true);

  return {
    reportId: 'v26-product-readiness-audit',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit || null,
    generatedAt,
    generatorId: baseData.generatorId || 'bitcode.product-readiness-audit.v1',
    worktreeState: baseData.worktreeState || 'unknown',
    gate: 'gate-5',
    promotedThroughGate: launchPassed ? 'gate-7' : (mvpPassed ? 'gate-6' : 'gate-5'),
    auditBasis: [
      'protocol-demonstration Exchange-lite implementation',
      'protocol-demonstration product-lite shell UI',
      'uapi commercial Exchange and product surfaces',
      'BITCODE_SPEC_V26_PARITY_MATRIX.md acceptance rows'
    ],
    baselinePassed,
    mvpPassed,
    launchPassed,
    closureClaim: baselinePassed && openProducts.length === 0,
    sixthGateMvpClaim: mvpPassed && mvpOpenProducts.length === 0,
    seventhGateCommercialTestnetLaunchClaim: launchPassed && launchOpenProducts.length === 0,
    productCount: products.length,
    baselineReadyProductCount: products.filter((product) => product.readyForFifthGateBaseline === true).length,
    closureReadyProductCount: closureReadyProducts.length,
    openProductCount: openProducts.length,
    mvpReadyProductCount: mvpReadyProducts.length,
    mvpOpenProductCount: mvpOpenProducts.length,
    launchReadyProductCount: launchReadyProducts.length,
    launchOpenProductCount: launchOpenProducts.length,
    notReadyFor: [],
    products
  };
}
