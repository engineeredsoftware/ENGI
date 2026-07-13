// @ts-check

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '../../..');

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
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Source-to-shares fifth-gate proof']
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
      ['uapi/app/api/state/route.ts', 'getBitcodeAppContext().getState(principal)'],
      ['uapi/app/api/read-review/route.ts', 'getBitcodeAppContext().getReadReview'],
      ['uapi/app/api/make-bitcode-branch/route.ts', 'makeBitcodeBranch'],
      ['uapi/tests/api/readReviewProtocolParity.test.ts', 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'App-owned protocol/API ownership']
    ],
    closureNotes: [
      'broader Exchange marketplace breadth remains V28-style expansion work',
      'eighth-gate whole-repository provation is closed for the V26 minimum commercial implementation'
    ]
  },
  {
    productId: 'bitcode-terminal',
    productName: 'Bitcode Terminal',
    baselineReadiness: 'terminal-lite-and-demonstration-read-backed',
    parityMatrixAnchor: 'Bitcode Terminal read/write loop',
    requiredEvidence: [
      ['protocol-demonstration/public/app.js', '__BITCODE_DEMONSTRATION_SHELL_SNAPSHOT__'],
      ['protocol-demonstration/test/v26-uapi-app-router-entrypoints.test.js', 'TypeScript-only'],
      ['uapi/app/terminal/TerminalPageClient.tsx', 'TerminalReadScenarioPanel'],
      ['uapi/app/terminal/TerminalPageClient.tsx', 'TerminalLiveSummaryStrip'],
      ['uapi/app/terminal/terminal-transaction-readiness-source.ts', 'route_repository_context'],
      ['uapi/app/terminal/TerminalRepositoryContextPanel.tsx', 'Inventory source'],
      ['uapi/app/terminal/TerminalRepositoryContextPanel.tsx', 'Reconnect Connects to restore live write admission'],
      ['uapi/app/terminal/TerminalLiveSummaryStrip.tsx', 'Settlement posture'],
      ['uapi/app/terminal/TerminalLiveSummaryStrip.tsx', 'Repository posture'],
      ['uapi/app/terminal/TerminalFlowGuideCard.tsx', 'repository-reconnect-required'],
      ['uapi/app/terminal/TerminalFlowGuideCard.tsx', 'wallet-reconnect-required'],
      ['uapi/app/terminal/terminal-activity-history.ts', "status: draft.status || 'completed'"],
      ['uapi/app/terminal/TerminalReadScenarioPanel.tsx', 'Read-fitting Exchange review'],
      ['uapi/app/terminal/TerminalClosureNativeSections.tsx', 'Read closure as one sequence from reviewable Read admission'],
      ['uapi/app/terminal/terminal-transaction-detail-snapshot.ts', 'fitQualities: coerceFitQualities'],
      ['uapi/tests/api/vcsRepositoriesInventoryParity.test.ts', 'stored repository inventory and skips live provider reads'],
      ['uapi/tests/api/executionsHistoryWriteReadParity.test.ts', 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger'],
      ['uapi/tests/terminalLiveSummaryStrip.test.tsx', 'GitHub reconnect required · stored Exchange inventory'],
      ['uapi/tests/terminalFlowGuideCard.test.tsx', 'repository-reconnect-required'],
      ['uapi/tests/terminalTransactionReadinessSource.test.ts', 'route_repository_context'],
      ['uapi/tests/terminalRepositoryContextPanel.test.tsx', 'Saved GitHub attachment found, but the live provider session must reconnect'],
      ['uapi/tests/terminalReadScenarios.test.ts', 'normalizes Exchange Read-fitting review state for Terminal review controls'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', '`Bitcode Terminal` read/write loop']
    ],
    closureNotes: [
      'clean promotion and whole-flow browser provation are represented by the Gate 8 proof family',
      'eighth-gate whole-repository provation is closed for the V26 Terminal baseline'
    ]
  },
  {
    productId: 'source-to-shares-read-fitting',
    productName: 'Read-fitting and settlement review',
    baselineReadiness: 'implemented-fifth-gate-slice',
    parityMatrixAnchor: 'Read review before fit search',
    requiredEvidence: [
      ['protocol-demonstration/server.js', 'bitcode-read-fitting-review'],
      ['uapi/app/terminal/terminal-read-scenarios.ts', 'normalizeTerminalReadFittingReview'],
      ['uapi/tests/api/readReviewRoute.test.ts', 'presents a reviewable Read before fit search'],
      ['uapi/tests/api/readReviewProtocolParity.test.ts', 'readFittingReview'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Read review before fit search']
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
      ['packages/pipelines/asset-pack/src/postprocess.ts', 'assetPackSynthesisArtifacts'],
      ['packages/pipelines/asset-pack/src/agents/finish-delivery-agents.ts', 'finish:asset-pack'],
      ['packages/pipelines-generics/src/phases/sdivf-factory.ts', 'SDIVF'],
      ['protocol-demonstration/test/v26-pipeline-finish-reform.test.js', 'SDIVF'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'retained execution/AssetPack readers no longer teach generic developer-platform meaning']
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
      ['uapi/tests/api/conversationBranchRoute.test.ts', 'copiedAttachmentCount'],
      ['.bitcode/conversations-continuity-proof.json', 'rich_input'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Conversations and rich-input continuity']
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
      ['uapi/app/terminal/bitcode-transaction-readiness.ts', 'canSettle'],
      ['uapi/app/terminal/bitcode-transaction-readiness.ts', 'repository reconnect required'],
      ['uapi/app/terminal/bitcode-transaction-readiness.ts', 'wallet reconnect required'],
      ['uapi/app/terminal/bitcode-transaction-route-readiness.ts', 'requireBitcodeSignedTransactionReadiness'],
      ['uapi/app/terminal/bitcode-transaction-route-readiness.ts', 'repository inventory'],
      ['uapi/app/terminal/bitcode-transaction-route-readiness.ts', 'readBitcodeWalletConnectionStatus'],
      ['uapi/app/api/auxillaries/data/route.ts', 'repositoryConnectionStatus'],
      ['uapi/app/api/auxillaries/data/route.ts', 'repositoryInventorySource'],
      ['uapi/app/api/auxillaries/data/route.ts', 'resolveWalletConnectionStatus'],
      ['uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', 'Connects'],
      ['uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', 'Reconnect required'],
      ['uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', 'stored-first or live-fallback inventory contract'],
      ['uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', 'Saved verified wallet-provider signer posture exists, but the live signer session needs reconnect'],
      ['uapi/app/auxillaries/components/AuxillariesProfilePane.tsx', 'Profile'],
      ['uapi/tests/bitcodeTransactionReadiness.test.ts', 'signed settlement remains staged'],
      ['uapi/tests/bitcodeTransactionReadiness.test.ts', 'wallet reconnect required'],
      ['uapi/tests/userDataRoute.test.ts', 'repositoryConnectionStatus'],
      ['uapi/tests/userDataRoute.test.ts', 'repositoryInventorySource'],
      ['uapi/tests/userDataRoute.test.ts', 'walletConnectionStatus'],
      ['uapi/tests/auxillariesConnectsPane.test.tsx', 'stored Exchange inventory'],
      ['uapi/tests/auxillariesConnectsPane.test.tsx', 'Reconnect required'],
      ['uapi/tests/terminalCommandDeck.test.tsx', 'repository reconnect required'],
      ['uapi/tests/terminalClosureControlDeck.test.tsx', 'repository reconnect required'],
      ['uapi/tests/terminalDepositComposerCard.test.tsx', 'repository reconnect required'],
      ['uapi/tests/orbitalsBTDPane.test.tsx', 'wallet provider must reconnect before Bitcode can rely on live signing again'],
      ['uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'Reconnect GitHub'],
      ['uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'live wallet-provider signing session is no longer available'],
      ['uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'outside the connected provider inventory'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Transactional readiness and signed-settlement admission']
    ],
    closureNotes: [
      'provider-backed wallet signing breadth remains V27+ Terminal/Exchange expansion work',
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
      ['packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts', 'writeAdmission'],
      ['packages/executions-mcp/src/mcp-server/src/types/index.ts', 'RepositoryContextSchema'],
      ['packages/external-apps/chatgpt/src/tools.ts', 'confirmed'],
      ['packages/external-apps/chatgpt/src/__tests__/tools.test.ts', 'rejects ChatGPT App connected-interface writes without explicit confirmation'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'API / MCP / third-party parity']
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
      ['.bitcode/source-to-shares-fifth-gate-proof.json', 'v26-source-to-shares-fifth-gate-proof'],
      ['.bitcode/fifth-gate-closure-deepening-proof.json', 'v26-fifth-gate-closure-deepening-proof'],
      ['BITCODE_SPEC_V26_PARITY_MATRIX.md', 'Proof and generated-evidence parity matrix']
    ],
    closureNotes: [
      'clean canonical regeneration is represented by the generated V26 total-closure artifact and promoted spec-family report'
    ]
  }
];

const PRODUCT_MVP_EVIDENCE_BY_ID = {
  'bitcode-protocol': [
    ['BITCODE_SPEC_V26.md', 'Sixth-gate is closed only when:'],
    ['protocol-demonstration/V26_PROOF_SURFACES.md', 'Gate 6: minimal viable product elevation'],
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SixthGateMvpClosureProof']
  ],
  'bitcode-exchange': [
    ['uapi/tests/api/executionsHistoryWriteReadParity.test.ts', 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger'],
    ['uapi/tests/api/readReviewProtocolParity.test.ts', 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route'],
    ['uapi/tests/api/activityRoute.test.ts', 'returns live activity with persisted execution reread and notification aggregation']
  ],
  'bitcode-terminal': [
    ['uapi/app/terminal/terminal-experience-architecture.ts', 'TERMINAL_MVP_SURFACE_MAP'],
    ['uapi/tests/terminalExperienceArchitecture.test.ts', 'locks the Terminal map to activity, transactions, conversations, and auxillaries'],
    ['uapi/tests/e2e/terminal.flow.spec.ts', 'Terminal route keeps read, selection, and repository-anchor write-through in one Terminal surface']
  ],
  'source-to-shares-read-fitting': [
    ['uapi/tests/api/readReviewRoute.test.ts', 'presents a reviewable Read before fit search'],
    ['uapi/tests/api/readReviewProtocolParity.test.ts', 'readFittingReview'],
    ['protocol-demonstration/test/v26-read-review-source-to-shares.test.js', 'V26 settlement review and receipts show quantized source-to-shares fit qualities']
  ],
  'assetpack-execution': [
    ['packages/pipelines/asset-pack/src/postprocess.ts', 'assetPackSynthesisArtifacts'],
    ['packages/pipelines/asset-pack/src/agents/finish-delivery-agents.ts', 'finish:asset-pack'],
    ['protocol-demonstration/test/v26-shippable-reform.test.js', 'implementation, validation, and Finish carriers separate AssetPack kind from delivery templates']
  ],
  'conversations-rich-input': [
    ['uapi/app/conversations/components/ConversationsOverlay.tsx', 'Multiple view modes (floating, sidebar, fullscreen, split-screen)'],
    ['uapi/tests/conversationsRouteClient.test.tsx', 'forceFullscreen=true'],
    ['packages/external-apps/chatgpt/src/server.ts', 'connected-interface Bitcode Terminal companion']
  ],
  'auxillaries-readiness': [
    ['uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', '$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture'],
    ['uapi/tests/orbitalsBTDPane.test.tsx', 'wallet provider must reconnect before Bitcode can rely on live signing again'],
    ['uapi/tests/userDataRoute.test.ts', 'walletConnectionStatus']
  ],
  'connected-interfaces': [
    ['packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts', 'writeAdmission'],
    ['packages/external-apps/chatgpt/src/__tests__/tools.test.ts', 'declares confirmation schema on every ChatGPT App connected-interface write carrier'],
    ['packages/external-apps/chatgpt/src/server.ts', 'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state']
  ],
  'proof-and-promotion': [
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SixthGateMvpClosureProof'],
    ['protocol-demonstration/test/proven-generator.test.js', 'sixthGateClosurePassed, true'],
    ['protocol-demonstration/test/v26-gate-acceptance-criteria.test.js', 'V26 generated proofs close fifth, sixth, seventh, and eighth gates']
  ]
};

const PRODUCT_LAUNCH_EVIDENCE_BY_ID = {
  'bitcode-protocol': [
    ['BITCODE_SPEC_V26.md', 'Seventh-gate is closed only when:'],
    ['protocol-demonstration/V26_PROOF_SURFACES.md', 'Gate 7: initial commercially-viable testnet live-launch refinement'],
    ['protocol-demonstration/src/canonical/proven-generator.js', 'buildV26SeventhGateCommercialTestnetLaunchProof']
  ],
  'bitcode-exchange': [
    ['uapi/tests/api/executionsHistoryWriteReadParity.test.ts', 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger'],
    ['uapi/tests/api/readReviewProtocolParity.test.ts', 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route'],
    ['uapi/tests/api/activityRoute.test.ts', 'returns live activity with persisted execution reread and notification aggregation']
  ],
  'bitcode-terminal': [
    ['uapi/app/terminal/terminal-commercial-launch-readiness.ts', 'TERMINAL_COMMERCIAL_TESTNET_LAUNCH_MAP'],
    ['uapi/tests/terminalCommercialLaunchReadiness.test.ts', 'locks the launch-readiness rows required after MVP closure'],
    ['uapi/tests/e2e/terminal.flow.spec.ts', 'Terminal route keeps read, selection, and repository-anchor write-through in one Terminal surface']
  ],
  'source-to-shares-read-fitting': [
    ['protocol-demonstration/test/v26-read-review-source-to-shares.test.js', 'V26 settlement review and receipts show quantized source-to-shares fit qualities'],
    ['uapi/tests/api/readReviewProtocolParity.test.ts', 'readFittingReview'],
    ['uapi/tests/api/readReviewProtocolParity.test.ts', 'source-to-shares settlement artifacts']
  ],
  'assetpack-execution': [
    ['protocol-demonstration/test/v26-shippable-reform.test.js', 'implementation, validation, and Finish carriers separate AssetPack kind from delivery templates'],
    ['packages/pipelines/asset-pack/src/postprocess.ts', 'assetPackSynthesisArtifacts'],
    ['packages/pipelines/asset-pack/src/agents/finish-delivery-agents.ts', 'finish:asset-pack-create-pull-request-delivery-agent']
  ],
  'conversations-rich-input': [
    ['uapi/app/conversations/components/ConversationsOverlay.tsx', 'Multiple view modes (floating, sidebar, fullscreen, split-screen)'],
    ['uapi/tests/conversationsRouteClient.test.tsx', 'forceFullscreen=true'],
    ['packages/external-apps/chatgpt/src/server.ts', 'connected-interface Bitcode Terminal companion']
  ],
  'auxillaries-readiness': [
    ['uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', '$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture'],
    ['uapi/tests/orbitalsBTDPane.test.tsx', 'wallet provider must reconnect before Bitcode can rely on live signing again'],
    ['uapi/tests/api/transactionWriteReadinessRoutes.test.ts', 'live wallet-provider signing session is no longer available']
  ],
  'connected-interfaces': [
    ['packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts', 'writeAdmission'],
    ['packages/external-apps/chatgpt/src/__tests__/tools.test.ts', 'declares confirmation schema on every ChatGPT App connected-interface write carrier'],
    ['packages/external-apps/chatgpt/src/server.ts', 'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state']
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
      'protocol-demonstration Terminal-lite shell UI',
      'uapi commercial Exchange and Terminal product surfaces',
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
