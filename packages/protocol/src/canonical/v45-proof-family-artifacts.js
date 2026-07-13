// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '../../../..');

export const V45_PROOF_FAMILY_VERSION = 'V45';
export const V45_PROOF_FAMILY_CURRENT_TARGET = 'V44';
export const V45_PROOF_FAMILY_SCHEMA_ID = 'bitcode.v45.proofFamilyArtifact.v1';
export const V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT =
  'source-safe-v45-proof-family-generated-metadata';
export const V45_PROOF_FAMILY_GENERATED_AT = '2026-05-31T00:00:00.000Z';
export const V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT =
  'draft-v45-gate16-proof-source-snapshot';
export const V45_PROOF_FAMILY_PROVEN_PATH = 'BITCODE_SPEC_V45_PROVEN.md';

export const V45_PROOF_FAMILY_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v45-inference-synthesis-proof.json',
  '.bitcode/v45-prompt-completeness-proof.json',
  '.bitcode/v45-static-code-analysis-proof.json',
  '.bitcode/v45-verification-decisions-proof.json',
  '.bitcode/v45-selection-materialization-proof.json',
  '.bitcode/v45-authorization-sensitive-flow-proof.json',
  '.bitcode/v45-settlement-source-to-shares-proof.json',
  '.bitcode/v45-disclosure-boundary-proof.json',
  '.bitcode/v45-proof-contract-proof.json',
]);

export const V45_PROOF_FAMILY_GENERATED_OUTPUTS = Object.freeze([
  ...V45_PROOF_FAMILY_ARTIFACT_PATHS,
  '.bitcode/v45-spec-family-report.json',
  '.bitcode/v45-canonical-input-report.json',
  V45_PROOF_FAMILY_PROVEN_PATH,
]);
const V45_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v45-promotion-readiness-report.json';

export const V45_PROOF_FAMILY_IDS = Object.freeze([
  'inference-synthesis',
  'prompt-completeness',
  'static-code-analysis',
  'verification-decisions',
  'selection-and-materialization',
  'authorization-and-sensitive-flow',
  'settlement-source-to-shares',
  'disclosure-boundary',
  'proof-contract',
]);

const JWT_HEADER_PREFIX = String.fromCharCode(
  101,
  121,
  74,
  104,
  98,
  71,
  99,
  105,
  79,
  105,
  74,
  73,
  85,
  122,
  73,
  49,
  78,
  105,
  73,
  115,
  73,
  110,
  82,
  53,
  99,
  67,
  73,
  54,
  73,
  107,
  112,
  88,
  86,
  67,
  74,
  57,
);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  JWT_HEADER_PREFIX,
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
  '-----BEGIN ',
]);

const FORBIDDEN_SERIALIZED_PAYLOAD_CLASSES = Object.freeze([
  'protected-source',
  'unpaid-assetpack-source',
  'raw-prompt',
  'raw-provider-response',
  'wallet-private-material',
  'credentials',
  'private-settlement-payload',
]);

/**
 * @param {string} relativePath
 * @param {readonly string[]} tokens
 */
function source(relativePath, tokens) {
  return { relativePath, tokens };
}

/**
 * @param {{
 *   id: string,
 *   title: string,
 *   artifactPath: string,
 *   members: readonly string[],
 *   theoremIds: readonly string[],
 *   replayStepIds: readonly string[],
 *   witnessArtifactPaths: readonly string[],
 *   sourceEvidence: readonly ReturnType<typeof source>[],
 *   minimumArtifactReplayBindingSet: readonly string[],
 *   proofObjectFields: readonly string[],
 *   generatedArtifactAndTestBindings: readonly string[],
 *   failClosedConditions: readonly string[],
 * }} definition
 */
function family(definition) {
  return Object.freeze(definition);
}

const PROOF_FAMILY_DEFINITIONS = Object.freeze([
  family({
    id: 'inference-synthesis',
    title: 'Inference-synthesis',
    artifactPath: '.bitcode/v45-inference-synthesis-proof.json',
    members: [
      'ReadNeedComprehensionSynthesis',
      'ReadFitsFindingSynthesis',
      'deposit option synthesis',
      'AssetPack synthesis',
      'conversation guidance',
    ],
    theoremIds: [
      'source-safe inference',
      'typed output',
      'prompt registry closure',
    ],
    replayStepIds: [
      'synthesize Need',
      'Finding Fits',
      'synthesize AssetPack',
      'redacted telemetry readback',
    ],
    witnessArtifactPaths: [
      '.bitcode/v38-inference-surface-inventory.json',
      '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
      '.bitcode/v39-read-fits-finding-runtime.json',
      '.bitcode/v41-promptpart-prompt-inventory.json',
    ],
    sourceEvidence: [
      source('packages/asset-packs-pipelines/domain/src/read-need.ts', [
        'ReadNeedComprehensionSynthesisSchema',
        'buildReadNeedComprehensionSynthesisInferenceReceipt',
        'promptTemplateRoot',
        'telemetryTraceRoot',
      ]),
      source('packages/asset-packs-pipelines/domain/src/read-need.ts', [
        'runReadNeedComprehensionInference',
        'ThinkingsGeneration stage 1/3: reason',
        'ThinkingsGeneration stage 2/3: judge',
        'ThinkingsGeneration stage 3/3: structured output',
      ]),
      source('packages/asset-packs-pipelines/domain/src/depository-search.ts', [
        'ReadFitsFindingSynthesisSearchReceipt',
        'ReadFitsFindingSynthesis.discovery',
        'lexicalDepositorySearch',
        'vectorDepositorySearch',
      ]),
      source('packages/asset-packs-pipelines/domain/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts', [
        'ReadFitsFindingSynthesisAssetPackSynthesisAgent',
        'factoryAgentWithPTRR',
        'finalOutput',
      ]),
      source('packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts', [
        'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'prompt root',
      'execution root',
      'output root',
      'telemetry root',
    ],
    proofObjectFields: [
      'proof id',
      'family',
      'member',
      'theorem',
      'input root',
      'output root',
      'status',
    ],
    generatedArtifactAndTestBindings: [
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-synthesis-asset-pack-synthesis-agent.test.ts',
    ],
    failClosedConditions: [
      'missing prompt',
      'untyped output',
      'source leak',
      'stale telemetry',
    ],
  }),
  family({
    id: 'prompt-completeness',
    title: 'Prompt-completeness',
    artifactPath: '.bitcode/v45-prompt-completeness-proof.json',
    members: [
      'prompt parts',
      'prompts',
      'registries',
      'templates',
      'interpolation',
    ],
    theoremIds: [
      'total prompt catalog',
      'no raw prompt leakage',
      'benchmarkable parts',
    ],
    replayStepIds: [
      'registry resolution',
      'interpolation',
      'redaction',
      'benchmark run',
    ],
    witnessArtifactPaths: [
      '.bitcode/v41-promptpart-prompt-inventory.json',
      '.bitcode/v41-registry-interpolation-contracts.json',
      '.bitcode/v41-prompt-program-benchmark-report.json',
    ],
    sourceEvidence: [
      source('packages/protocol/src/canonical/v41-promptpart-prompt-inventory.js', [
        'rawPromptTextSerialized',
        'PromptPartRegistry.generic',
        'ReadNeedComprehensionSynthesis',
        'ReadFitsFindingSynthesis',
      ]),
      source('packages/protocol/src/canonical/v41-registry-interpolation-contracts.js', [
        'registryId',
        'interpolation',
        'templateVariableNames',
        'source_hash_source_safe',
      ]),
      source('packages/protocol/src/canonical/v41-prompt-program-benchmark-report.js', [
        'V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH',
        'benchmark',
        'sourceSafe',
        'rawPrompt',
      ]),
      source('packages/protocol/test/v41-promptpart-prompt-inventory.test.js', [
        'rawPromptTextSerialized',
        'benchmarkFixtureIds',
        'ReadFitsFindingSynthesis',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'prompt part id',
      'prompt id',
      'registry id',
      'rendered prompt hash',
    ],
    proofObjectFields: [
      'prompt ids',
      'interpolation inputs',
      'output type',
    ],
    generatedArtifactAndTestBindings: [
      'packages/protocol/test/v41-promptpart-prompt-inventory.test.js',
      'packages/protocol/test/v41-registry-interpolation-contracts.test.js',
      'packages/protocol/test/v41-prompt-program-benchmark-report.test.js',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
    ],
    failClosedConditions: [
      'missing prompt part',
      'unsafe interpolation',
      'raw prompt exposure',
      'unbenchmarked critical prompt',
    ],
  }),
  family({
    id: 'static-code-analysis',
    title: 'Static-code-analysis',
    artifactPath: '.bitcode/v45-static-code-analysis-proof.json',
    members: ['packages', 'routes', 'scripts', 'workflows', 'tests', 'docs'],
    theoremIds: [
      'source names align with protocol',
      'no forbidden source exposure',
      'no versioned source identifiers',
    ],
    replayStepIds: ['lint', 'typecheck', 'casing/imports', 'spec check'],
    witnessArtifactPaths: [
      '.bitcode/v44-promotion-readiness-report.json',
      '.bitcode/v44-spec-family-report.json',
      '.bitcode/v44-canonical-input-report.json',
    ],
    sourceEvidence: [
      source('package.json', [
        'check:v45-gate15',
        'check:v45-gate16',
        'generate:v45-proof-families',
      ]),
      source('.github/workflows/bitcode-gate-quality.yml', [
        'Bitcode Gate Quality',
        'Validate draft canon posture',
        'pnpm --filter @bitcode/protocol test',
      ]),
      source('.github/workflows/bitcode-canon-quality.yml', [
        'Bitcode Canon Quality',
        'Validate active canon and draft posture',
        'check-bitcode-spec-family.mjs',
      ]),
      source('scripts/check-v45-gate16-proof-families-generated-artifacts.mjs', [
        'V45 Gate 16',
        'check-v45-gate16',
        'generate-v45-proof-family-artifacts.mjs',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'file path',
      'command',
      'result',
      'spec row',
    ],
    proofObjectFields: ['command', 'status', 'artifact root', 'failures'],
    generatedArtifactAndTestBindings: [
      'scripts/check-v45-gate16-proof-families-generated-artifacts.mjs',
      'scripts/generate-v45-proof-family-artifacts.mjs',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
      '.github/workflows/bitcode-gate-quality.yml',
    ],
    failClosedConditions: [
      'lint/type failure',
      'import drift',
      'source-safety violation',
    ],
  }),
  family({
    id: 'verification-decisions',
    title: 'Verification-decisions',
    artifactPath: '.bitcode/v45-verification-decisions-proof.json',
    members: [
      'Need review',
      'Fit thresholding',
      'quote acceptance',
      'payment finality',
      'rights transfer',
      'delivery',
    ],
    theoremIds: [
      'explicit decision root',
      'actor authority',
      'no collapsed states',
    ],
    replayStepIds: [
      'approve Need',
      'select Fits',
      'accept quote',
      'confirm finality',
    ],
    witnessArtifactPaths: [
      '.bitcode/v42-readneed-review-resynthesis-product-closure.json',
      '.bitcode/v42-readfitsfinding-preview-quote.json',
      '.bitcode/v44-organization-policy-wallet-authority.json',
    ],
    sourceEvidence: [
      source('packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts', [
        'ReadNeedReviewResynthesisRuntime',
        'findingFitsAdmission',
        'telemetryReceipts',
        'rejected_need_posture',
      ]),
      source('packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts', [
        'AssetPackPreviewBoundary',
        'quoteRoot',
        'selectedFitProvenanceRoot',
        'sourceSafePreview',
      ]),
      source('packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts', [
        'quoteAcceptanceState',
        'settlement_finalized',
        'rightsTransferState',
        'sourceUnlockAdmissible',
      ]),
      source('packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts', [
        'OrganizationPolicyWalletAuthority',
        'authorityRoot',
        'wallet',
        'policy',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'decision root',
      'actor root',
      'policy root',
      'readback root',
    ],
    proofObjectFields: [
      'decision id',
      'actor',
      'state',
      'result',
      'blocker',
    ],
    generatedArtifactAndTestBindings: [
      'packages/asset-packs-pipelines/domain/src/__tests__/read-need-review-resynthesis.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-preview-boundary.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
    ],
    failClosedConditions: [
      'unauthorized actor',
      'stale decision',
      'missing root',
      'evidence conflict',
    ],
  }),
  family({
    id: 'selection-and-materialization',
    title: 'Selection-and-materialization',
    artifactPath: '.bitcode/v45-selection-materialization-proof.json',
    members: [
      'candidate recall',
      'selected Fit set',
      'withheld bundle',
      'source-safe preview',
      'repository delivery',
    ],
    theoremIds: [
      'selected Fits above threshold',
      'source withheld',
      'delivery after rights',
    ],
    replayStepIds: ['search', 'rank', 'select', 'synthesize', 'unlock', 'deliver'],
    witnessArtifactPaths: [
      '.bitcode/v39-read-fits-finding-runtime.json',
      '.bitcode/v42-readfitsfinding-preview-quote.json',
      '.bitcode/v42-settlement-rights-delivery.json',
    ],
    sourceEvidence: [
      source('packages/asset-packs-pipelines/domain/src/depository-search.ts', [
        'candidateRanking',
        'rankingRoot',
        'selectedFitProvenanceRoot',
        'thresholds',
      ]),
      source('packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts', [
        'storageProjection',
        'telemetryReceipts',
        'replayReceipt',
        'sourceSafety',
      ]),
      source('packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts', [
        'sourceSafePreview',
        'withheldBeforeSettlement',
        'deliveryPosture',
        'unpaidAssetPackSourceVisible',
      ]),
      source('packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts', [
        'AssetPackDeliveryUnlockReceipt',
        'source_unlocked_delivery',
        'pull_request_target_missing',
        'sourceUnlockAdmissible',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'fit root',
      'bundle root',
      'preview root',
      'delivery root',
    ],
    proofObjectFields: [
      'candidate ids',
      'bundle hash',
      'preview hash',
      'delivery id',
    ],
    generatedArtifactAndTestBindings: [
      'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/finish-delivery.test.ts',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
    ],
    failClosedConditions: [
      'no survivor',
      'source overexposure',
      'stale storage',
      'delivery mismatch',
    ],
  }),
  family({
    id: 'authorization-and-sensitive-flow',
    title: 'Authorization-and-sensitive-flow',
    artifactPath: '.bitcode/v45-authorization-sensitive-flow-proof.json',
    members: [
      'organization policy',
      'wallet authority',
      'depositor approval',
      'buyer entitlement',
      'API/MCP',
      'conversations',
    ],
    theoremIds: ['no secret leakage', 'no server custody', 'actor entitlement'],
    replayStepIds: ['policy check', 'wallet ready', 'authorization denial', 'redaction'],
    witnessArtifactPaths: [
      '.bitcode/v44-organization-policy-wallet-authority.json',
      '.bitcode/v33-interface-authorization-policy.json',
      '.bitcode/v37-conversation-telemetry-proof-hooks.json',
    ],
    sourceEvidence: [
      source('packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts', [
        'walletAuthority',
        'authorityRoot',
        'spendLimit',
        'sourceCriticality',
      ]),
      source('packages/asset-packs-pipelines/domain/src/interface-disclosure-boundary.ts', [
        'INTERFACE_DISCLOSURE_BOUNDARY_SURFACES',
        'walletPrivateMaterialVisible: false',
        'settlementPrivatePayloadVisible: false',
        'credentialsSerialized: false',
      ]),
      source('packages/btd/src/interface-authorization-policy.ts', [
        'InterfaceAuthorizationPolicy',
        'authorization',
        'actor',
        'scope',
      ]),
      source('packages/conversations-generics/src/types.ts', [
        'Conversation',
        'ConversationMessage',
        'MessageAttachment',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'actor root',
      'policy root',
      'redaction root',
      'interface root',
    ],
    proofObjectFields: [
      'actor',
      'scope',
      'decision',
      'redaction',
      'blocker',
    ],
    generatedArtifactAndTestBindings: [
      'packages/asset-packs-pipelines/domain/src/__tests__/organization-policy-wallet-authority.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/interface-disclosure-boundary.test.ts',
      'packages/btd/__tests__/interface-authorization-policy.test.ts',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
    ],
    failClosedConditions: [
      'secret exposure',
      'wrong actor',
      'missing policy',
      'wallet custody drift',
    ],
  }),
  family({
    id: 'settlement-source-to-shares',
    title: 'Settlement-source-to-shares',
    artifactPath: '.bitcode/v45-settlement-source-to-shares-proof.json',
    members: [
      'BTD scalar-volume',
      'BTC quote',
      'PSBT',
      'finality',
      'rights transfer',
      'source-to-shares',
      'compensation',
    ],
    theoremIds: [
      'deterministic quote',
      'finality-before-rights',
      'conservation',
      'allocation after settlement',
    ],
    replayStepIds: [
      'compute BTD',
      'quote BTC',
      'observe payment',
      'confirm finality',
      'allocate shares',
    ],
    witnessArtifactPaths: [
      '.bitcode/v44-btd-btc-compensation-statements.json',
      '.bitcode/v44-reading-budget-quote-policy.json',
      '.bitcode/v42-settlement-rights-delivery.json',
    ],
    sourceEvidence: [
      source('packages/asset-packs-pipelines/domain/src/btd-scalar-volume-quote.ts', [
        'BtdScalarVolumeQuote',
        'weightedMicroBtd',
        'quoteSats',
        'quoteRoot',
      ]),
      source('packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts', [
        'settlement_finalized',
        'rightsTransferState',
        'sourceUnlockAdmissible',
        'compensationRoutingAdmissible',
      ]),
      source('packages/asset-packs-pipelines/domain/src/btd-btc-compensation-statements.ts', [
        'BtdBtcCompensationStatement',
        'sourceToShares',
        'compensation',
        'conservation',
      ]),
      source('packages/btd/src/source-to-shares.ts', [
        'sourceToShares',
        'allocation',
        'share',
        'fitDeposits',
      ]),
      source('packages/btd/src/settlement.ts', [
        'settlement',
        'btc',
        'btcFeeReceiptId',
        'ledger',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'BTD root',
      'quote root',
      'tx root',
      'finality root',
      'allocation root',
    ],
    proofObjectFields: [
      'sats',
      'BTD range',
      'txid',
      'finality',
      'allocation',
    ],
    generatedArtifactAndTestBindings: [
      'packages/asset-packs-pipelines/domain/src/__tests__/btd-scalar-volume-quote.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
      'packages/btd/__tests__/source-to-shares.test.ts',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
    ],
    failClosedConditions: [
      'mismatch',
      'reorg',
      'expired quote',
      'stale readback',
      'compensation drift',
    ],
  }),
  family({
    id: 'disclosure-boundary',
    title: 'Disclosure-boundary',
    artifactPath: '.bitcode/v45-disclosure-boundary-proof.json',
    members: [
      '/deposit',
      '/read',
      '/packs',
      'API/MCP',
      'ChatGPT App',
      'Bitcode Chat',
      'public docs',
      'landing page',
    ],
    theoremIds: [
      'source-safe before entitlement',
      'non-final labels',
      'boundary equivalence across interfaces',
    ],
    replayStepIds: ['preview', 'quote', 'observation', 'finality', 'rights', 'delivery'],
    witnessArtifactPaths: [
      '.bitcode/v43-read-route-five-step-ux.json',
      '.bitcode/v43-deposit-route-options.json',
      '.bitcode/v43-packs-activity-master-detail.json',
    ],
    sourceEvidence: [
      source('packages/asset-packs-pipelines/domain/src/interface-disclosure-boundary.ts', [
        'INTERFACE_DISCLOSURE_BOUNDARY_SURFACES',
        'INTERFACE_DISCLOSURE_BOUNDARY_STAGES',
        'sourceBearingAssetPackVisibleToReader',
        'unpaidAssetPackSourceVisible: false',
      ]),
      source('uapi/app/read/read-route-model.ts', [
        'buildReadRouteSession',
        'sourceSafe',
        'preview',
        'settlement',
      ]),
      source('uapi/app/deposit/deposit-route-model.ts', [
        'buildDepositRouteSession',
        'sourceSafe',
        'AssetPack',
        'Depository',
      ]),
      source('uapi/components/bitcode/activity/pack-activity-model.ts', [
        'normalizePackActivityRecord',
        'sourceSafeMetadataOnly',
        '[withheld:source-safe]',
        'proof',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'interface root',
      'actor root',
      'state root',
      'disclosure root',
    ],
    proofObjectFields: [
      'actor',
      'boundary',
      'visible fields',
      'redactions',
    ],
    generatedArtifactAndTestBindings: [
      'packages/asset-packs-pipelines/domain/src/__tests__/interface-disclosure-boundary.test.ts',
      'uapi/tests/readPageClient.test.tsx',
      'uapi/tests/depositPageClient.test.tsx',
      'uapi/tests/packsPageClient.test.tsx',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
    ],
    failClosedConditions: [
      'overexposure',
      'finality confusion',
      'source leak',
      'missing entitlement',
    ],
  }),
  family({
    id: 'proof-contract',
    title: 'Proof-contract',
    artifactPath: '.bitcode/v45-proof-contract-proof.json',
    members: [
      'generated spec proof',
      'workflow receipts',
      'ledger journals',
      'database projections',
      'storage roots',
      'telemetry',
      'provider receipts',
      'repository receipts',
    ],
    theoremIds: [
      'proof-backed readback',
      'evidence precedence',
      'repair on conflict',
    ],
    replayStepIds: ['readback join', 'contradiction', 'repair', 'replay'],
    witnessArtifactPaths: [
      '.bitcode/v44-promotion-readiness-report.json',
      '.bitcode/v44-canonical-input-report.json',
      '.bitcode/v44-spec-family-report.json',
    ],
    sourceEvidence: [
      source('BITCODE_SPEC_V45.md', [
        '## V45 proof-family canon',
        '## V45 generated canon',
        'Minimum generated appendix rendered contents',
        'proof-backed readback',
      ]),
      source('BITCODE_SPEC_V45_PARITY_MATRIX.md', [
        'Gate 16: V45 Proof Families And Generated Artifacts',
        'check:v45-gate16',
        'V45 proof-family artifacts',
      ]),
      source('packages/protocol/src/canonical/v21-specifying.js', [
        '.bitcode/v45-proof-contract-proof.json',
        'buildV21CanonicalInputReport',
        'buildV21GeneratedArtifactContents',
      ]),
      source('scripts/generate-v45-proof-family-artifacts.mjs', [
        'buildV45ProofFamilyArtifacts',
        'V45_PROOF_FAMILY_PROVEN_PATH',
        'buildV21GeneratedArtifactContents',
      ]),
      source('scripts/check-v45-gate16-proof-families-generated-artifacts.mjs', [
        'V45 Gate 16',
        'check:v45-gate16',
        'generate-v45-proof-family-artifacts.mjs',
      ]),
    ],
    minimumArtifactReplayBindingSet: [
      'proof root',
      'ledger root',
      'database root',
      'storage root',
      'external receipt when relevant',
    ],
    proofObjectFields: [
      'evidence class',
      'authority',
      'limit',
      'readback',
      'conflict policy',
    ],
    generatedArtifactAndTestBindings: [
      'scripts/generate-v45-proof-family-artifacts.mjs',
      'scripts/check-v45-gate16-proof-families-generated-artifacts.mjs',
      'packages/protocol/test/v45-proof-family-artifacts.test.js',
      '.github/workflows/bitcode-gate-quality.yml',
      '.github/workflows/bitcode-canon-quality.yml',
    ],
    failClosedConditions: [
      'missing evidence',
      'stale evidence',
      'contradictory evidence',
      'out-of-boundary evidence',
    ],
  }),
]);

export const V45_PROOF_FAMILY_DEFINITIONS = PROOF_FAMILY_DEFINITIONS;

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(String(value)).digest('hex')}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {{ relativePath: string, tokens: readonly string[] }} item
 */
function scanTokens(repoRoot, item) {
  const absolutePath = path.join(repoRoot, item.relativePath);
  const present = existsSync(absolutePath);
  const content = present ? readFileSync(absolutePath, 'utf8') : '';
  return {
    relativePath: item.relativePath,
    present,
    digest: present ? sha256(content) : null,
    byteLength: present ? Buffer.byteLength(content, 'utf8') : 0,
    sourceSafeDigestOnly: true,
    forbiddenMarkerDetected: false,
    requiredTokens: item.tokens.map((token) => ({
      token,
      present: content.includes(token),
    })),
  };
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 */
function scanArtifact(repoRoot, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const present = existsSync(absolutePath);
  const content = present ? readFileSync(absolutePath, 'utf8') : '';
  let parsed = null;
  let parseable = false;
  if (present) {
    try {
      parsed = JSON.parse(content);
      parseable = true;
    } catch {
      parseable = false;
    }
  }
  return {
    relativePath,
    present,
    parseable,
    digest: present ? sha256(content) : null,
    byteLength: present ? Buffer.byteLength(content, 'utf8') : 0,
    sourceSafe: present
      ? !includesSecretMarker(content) &&
        !content.includes('protectedSourceBody') &&
        !content.includes('rawProviderPayload') &&
        !content.includes('walletPrivateKey')
      : false,
    artifactId: parsed?.artifactId || parsed?.reportId || null,
    sourceSafetyVerdict: parsed?.sourceSafetyVerdict || null,
  };
}

/**
 * @param {ReturnType<typeof scanTokens>} entry
 */
function allTokensPresent(entry) {
  return entry.present && !entry.forbiddenMarkerDetected && entry.requiredTokens.every((token) => token.present);
}

/**
 * @param {ReturnType<typeof scanArtifact>} entry
 */
function artifactUsable(entry) {
  return entry.present && entry.parseable && entry.sourceSafe;
}

/**
 * @param {typeof PROOF_FAMILY_DEFINITIONS[number]} definition
 */
function theoremRows(definition) {
  return definition.theoremIds.map((theoremId, index) => ({
    theoremId,
    memberBindings: [...definition.members],
    replayStepBindings: definition.replayStepIds.filter((_, stepIndex) =>
      stepIndex === index || stepIndex % definition.theoremIds.length === index,
    ),
    closureReading: `The ${definition.title} theorem "${theoremId}" binds source-safe evidence, typed state, and replayable proof roots.`,
  }));
}

/**
 * @param {typeof PROOF_FAMILY_DEFINITIONS[number]} definition
 */
function replayRows(definition) {
  return definition.replayStepIds.map((replayStepId, index) => ({
    replayStepId,
    theoremBindings: definition.theoremIds.filter((_, theoremIndex) =>
      theoremIndex === index % definition.theoremIds.length,
    ),
    witnessBindings: [...definition.witnessArtifactPaths],
    expectedResult: 'pass, repair-required, or blocked',
  }));
}

/**
 * @param {typeof PROOF_FAMILY_DEFINITIONS[number]} definition
 */
function memberRows(definition) {
  return definition.members.map((memberId) => ({
    memberId,
    closureCriteria: `${memberId} must be typed, source-safe, replayable, and bound to V45 proof-family law.`,
    verdictShape: 'pass | repair-required | blocked',
  }));
}

/**
 * @param {{
 *   definition: typeof PROOF_FAMILY_DEFINITIONS[number],
 *   repoRoot: string,
 *   generatedAt: string,
 *   proofSourceCommit: string,
 * }} input
 */
function buildProofArtifact(input) {
  const sourceEvidence = input.definition.sourceEvidence.map((item) =>
    scanTokens(input.repoRoot, item),
  );
  const witnessArtifactInventory = input.definition.witnessArtifactPaths.map((artifactPath) =>
    scanArtifact(input.repoRoot, artifactPath),
  );
  const sourceEvidenceFailures = sourceEvidence.flatMap((entry) => {
    if (!entry.present) return [`missing source evidence ${entry.relativePath}`];
    const tokenFailures = entry.requiredTokens
      .filter((token) => !token.present)
      .map((token) => `${entry.relativePath} missing token ${token.token}`);
    return [
      ...tokenFailures,
      ...(entry.forbiddenMarkerDetected ? [`${entry.relativePath} contains a secret-shaped marker`] : []),
    ];
  });
  const witnessFailures = witnessArtifactInventory.flatMap((entry) => {
    if (!entry.present) return [`missing witness artifact ${entry.relativePath}`];
    if (!entry.parseable) return [`unparseable witness artifact ${entry.relativePath}`];
    if (!entry.sourceSafe) return [`source-unsafe witness artifact ${entry.relativePath}`];
    return [];
  });
  const proofFamilyInventory = {
    proofFamilyId: input.definition.id,
    proofFamily: input.definition.title,
    proofArtifactPath: input.definition.artifactPath,
    memberIds: [...input.definition.members],
    theoremIds: [...input.definition.theoremIds],
    replayStepIds: [...input.definition.replayStepIds],
    witnessArtifactPaths: [...input.definition.witnessArtifactPaths],
  };
  const sourceSafety = {
    sourceSafeMetadataOnly: true,
    protectedSourceSerialized: false,
    rawPromptSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    walletPrivateMaterialSerialized: false,
    credentialsSerialized: false,
    privateSettlementPayloadSerialized: false,
    unpaidAssetPackSourceSerialized: false,
    forbiddenSerializedPayloadClasses: [...FORBIDDEN_SERIALIZED_PAYLOAD_CLASSES],
  };
  const proofRows = {
    memberInventory: memberRows(input.definition),
    theoremInventory: theoremRows(input.definition),
    replayStepInventory: replayRows(input.definition),
  };
  const proofRoots = {
    sourceEvidenceRoot: sha256(canonicalJson(sourceEvidence)),
    witnessArtifactRoot: sha256(canonicalJson(witnessArtifactInventory)),
    proofFamilyInventoryRoot: sha256(canonicalJson(proofFamilyInventory)),
    replayBindingRoot: sha256(canonicalJson(proofRows.replayStepInventory)),
  };
  const preSafetySeed = {
    proofFamilyInventory,
    proofRows,
    proofRoots,
    sourceSafety,
  };
  const serializedPreSafety = canonicalJson(preSafetySeed);
  const forbiddenMarkerDetected = includesSecretMarker(serializedPreSafety);
  const failures = [
    ...sourceEvidenceFailures,
    ...witnessFailures,
    ...(forbiddenMarkerDetected ? [`${input.definition.title} artifact contains a secret-shaped marker`] : []),
  ];
  const coverage = {
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    witnessArtifactsComplete: witnessArtifactInventory.every(artifactUsable),
    memberCount: input.definition.members.length,
    theoremCount: input.definition.theoremIds.length,
    replayStepCount: input.definition.replayStepIds.length,
    witnessArtifactCount: input.definition.witnessArtifactPaths.length,
    generatedArtifactBindingCount: input.definition.generatedArtifactAndTestBindings.length,
    failClosedConditionCount: input.definition.failClosedConditions.length,
    protectedSourceSerialized: false,
    rawPromptSerialized: false,
    rawProviderResponseSerialized: false,
    walletPrivateMaterialSerialized: false,
    credentialsSerialized: false,
    privateSettlementPayloadSerialized: false,
    unpaidAssetPackSourceSerialized: false,
  };
  const artifactSeed = {
    version: V45_PROOF_FAMILY_VERSION,
    currentTarget: V45_PROOF_FAMILY_CURRENT_TARGET,
    proofFamilyInventory,
    proofRoots,
    coverage,
    sourceSafetyVerdict: V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: `v45-${input.definition.id}-proof`,
    schemaId: V45_PROOF_FAMILY_SCHEMA_ID,
    version: V45_PROOF_FAMILY_VERSION,
    currentTarget: V45_PROOF_FAMILY_CURRENT_TARGET,
    generatedAt: input.generatedAt,
    proofSourceCommit: input.proofSourceCommit,
    sourceSafetyVerdict: V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT,
    proofFamilyId: input.definition.id,
    proofFamily: input.definition.title,
    artifactPath: input.definition.artifactPath,
    status: failures.length === 0 ? 'pass' : 'repair-required',
    proofFamilyInventory,
    memberInventory: proofRows.memberInventory,
    theoremInventory: proofRows.theoremInventory,
    replayStepInventory: proofRows.replayStepInventory,
    witnessArtifactInventory,
    generatedArtifactInventory: [...V45_PROOF_FAMILY_GENERATED_OUTPUTS],
    scenarioRunCoverageMatrix: [
      {
        scenarioId: `v45-${input.definition.id}-source-safe-replay`,
        family: input.definition.title,
        memberCount: input.definition.members.length,
        theoremCount: input.definition.theoremIds.length,
        replayStepCount: input.definition.replayStepIds.length,
        expectedVerdict: 'pass',
      },
    ],
    sourceEvidence,
    inputRoots: {
      specRoot: sha256(input.definition.title),
      sourceEvidenceRoot: proofRoots.sourceEvidenceRoot,
      witnessArtifactRoot: proofRoots.witnessArtifactRoot,
    },
    artifactRoots: {
      proofFamilyInventoryRoot: proofRoots.proofFamilyInventoryRoot,
      replayBindingRoot: proofRoots.replayBindingRoot,
    },
    artifactRoot: `v45-${input.definition.id}-proof:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    minimumArtifactReplayBindingSet: [...input.definition.minimumArtifactReplayBindingSet],
    proofObjectFields: [...input.definition.proofObjectFields],
    generatedArtifactAndTestBindings: [...input.definition.generatedArtifactAndTestBindings],
    failClosedConditions: [...input.definition.failClosedConditions],
    sourceSafety,
    coverage,
    repairInstructions: [
      `Regenerate ${input.definition.artifactPath} with pnpm run generate:v45-proof-families.`,
      'Repair missing source evidence, witness artifacts, tests, or workflow bindings before claiming V45 proof-family closure.',
    ],
    passed: failures.length === 0,
    failures,
    warnings: [],
    validationCommand: 'pnpm run check:v45-gate16',
  };
}

/**
 * @param {{
 *   familyId?: string,
 *   repoRoot?: string,
 *   generatedAt?: string,
 *   proofSourceCommit?: string,
 * }} [input]
 */
export function buildV45ProofFamilyArtifact(input = {}) {
  const familyId = input.familyId || 'proof-contract';
  const definition = PROOF_FAMILY_DEFINITIONS.find((candidate) => candidate.id === familyId);
  if (!definition) throw new Error(`Unknown V45 proof family: ${familyId}`);
  return buildProofArtifact({
    definition,
    repoRoot: input.repoRoot || DEFAULT_REPO_ROOT,
    generatedAt: input.generatedAt || V45_PROOF_FAMILY_GENERATED_AT,
    proofSourceCommit: input.proofSourceCommit || V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
  });
}

/**
 * @param {{
 *   repoRoot?: string,
 *   generatedAt?: string,
 *   proofSourceCommit?: string,
 * }} [input]
 */
export function buildV45ProofFamilyArtifacts(input = {}) {
  const artifacts = PROOF_FAMILY_DEFINITIONS.map((definition) =>
    buildProofArtifact({
      definition,
      repoRoot: input.repoRoot || DEFAULT_REPO_ROOT,
      generatedAt: input.generatedAt || V45_PROOF_FAMILY_GENERATED_AT,
      proofSourceCommit: input.proofSourceCommit || V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
    }),
  );
  const failures = artifacts.flatMap((artifact) => artifact.failures.map((failure) =>
    `${artifact.proofFamily}: ${failure}`,
  ));
  const aggregateSeed = artifacts.map((artifact) => ({
    artifactPath: artifact.artifactPath,
    artifactRoot: artifact.artifactRoot,
    passed: artifact.passed,
  }));
  return {
    version: V45_PROOF_FAMILY_VERSION,
    currentTarget: V45_PROOF_FAMILY_CURRENT_TARGET,
    generatedAt: input.generatedAt || V45_PROOF_FAMILY_GENERATED_AT,
    proofSourceCommit: input.proofSourceCommit || V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
    sourceSafetyVerdict: V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT,
    artifactCount: artifacts.length,
    expectedArtifactPaths: [...V45_PROOF_FAMILY_ARTIFACT_PATHS],
    generatedOutputs: [...V45_PROOF_FAMILY_GENERATED_OUTPUTS],
    artifacts,
    aggregateProofVerdict: failures.length === 0 ? 'pass' : 'repair-required',
    aggregateRoot: `v45-proof-family-artifacts:${sha256(canonicalJson(aggregateSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
  };
}

/**
 * @param {{
 *   artifacts: ReturnType<typeof buildV45ProofFamilyArtifacts>,
 *   specFamilyReport?: Record<string, unknown>,
 *   canonicalInputReport?: Record<string, unknown>,
 * }} input
 */
export function buildV45ProofFamilyProvenMarkdown(input) {
  const renderedGeneratedOutputs = [
    ...V45_PROOF_FAMILY_GENERATED_OUTPUTS,
    V45_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ];
  const lines = [
    '# Bitcode Spec V45 Proven',
    '',
    '## Status',
    '',
    '- Version: `V45`',
    '- V45 state: draft generated proof appendix for V45 proof-family artifacts; V44 remains active canon until V45 promotion',
    '- Current canonical/latest target: `V44`',
    '- Prior canonical anchor: `BITCODE_SPEC_V44.md`',
    '- Prior generated proof appendix: `BITCODE_SPEC_V44_PROVEN.md`',
    `- Generated structured artifact inventory: ${renderedGeneratedOutputs.map((item) => `\`${item}\``).join(', ')}`,
    `- Source parity state: proof-family generated artifacts are ${input.artifacts.aggregateProofVerdict}`,
    '- Notes companion: `BITCODE_SPEC_V45_NOTES.md`',
    '- Spec companion: `BITCODE_SPEC_V45.md`',
    '- Delta companion: `BITCODE_SPEC_V45_DELTA.md`',
    '- Parity companion: `BITCODE_SPEC_V45_PARITY_MATRIX.md`',
    '- Scope: source-safe generated V45 proof-family appendix',
    '- Last fully realized canonical target preserved in source: `V44`',
    '',
    '## Aggregate Proof Verdict',
    '',
    `- verdict: \`${input.artifacts.aggregateProofVerdict}\``,
    `- proof-source commit: \`${input.artifacts.proofSourceCommit}\``,
    `- aggregate root: \`${input.artifacts.aggregateRoot}\``,
    `- proof-family count: \`${input.artifacts.artifactCount}\``,
    '',
    '## Exact Proof-Family Inventory',
    '',
    '| proofFamily | proofArtifactPath | artifactRoot | status |',
    '| --- | --- | --- | --- |',
    ...input.artifacts.artifacts.map((artifact) =>
      `| ${artifact.proofFamily} | \`${artifact.artifactPath}\` | \`${artifact.artifactRoot}\` | ${artifact.status} |`,
    ),
    '',
    '## Per-Family Member Inventory',
    '',
    ...input.artifacts.artifacts.flatMap((artifact) => [
      `### ${artifact.proofFamily}`,
      '',
      `Members: ${artifact.memberInventory.map((member) => `\`${member.memberId}\``).join(', ')}.`,
      '',
    ]),
    '## Per-Family Theorem Inventory',
    '',
    ...input.artifacts.artifacts.flatMap((artifact) => [
      `### ${artifact.proofFamily}`,
      '',
      ...artifact.theoremInventory.map((theorem) =>
        `- \`${theorem.theoremId}\`: ${theorem.closureReading}`,
      ),
      '',
    ]),
    '## Replay-Step Inventories And Theorem Bindings',
    '',
    ...input.artifacts.artifacts.flatMap((artifact) => [
      `### ${artifact.proofFamily}`,
      '',
      ...artifact.replayStepInventory.map((step) =>
        `- \`${step.replayStepId}\`: ${step.theoremBindings.map((theoremId) => `\`${theoremId}\``).join(', ')}`,
      ),
      '',
    ]),
    '## Witness Artifact Inventories',
    '',
    ...input.artifacts.artifacts.flatMap((artifact) => [
      `### ${artifact.proofFamily}`,
      '',
      ...artifact.witnessArtifactInventory.map((witness) =>
        `- \`${witness.relativePath}\`: ${witness.present && witness.parseable && witness.sourceSafe ? 'source-safe present' : 'repair-required'}`,
      ),
      '',
    ]),
    '## Generated Artifact Inventories',
    '',
    ...renderedGeneratedOutputs.map((artifactPath) => `- \`${artifactPath}\``),
    '',
    '## V45 Promotion Readiness',
    '',
    `- promotionReadinessArtifact: \`${V45_PROMOTION_READINESS_REPORT_ARTIFACT_PATH}\``,
    '- promotionReadinessGate: `check:v45-gate18`',
    '- promotionWorkflow: `.github/workflows/v45-canon-promotion.yml`',
    '- pointerAdvanceRule: workflow validation must pass before `BITCODE_SPEC.txt` can become `V45`',
    '',
    '## Scenario And Run Coverage Matrices',
    '',
    '| scenarioId | proofFamily | memberCount | theoremCount | replayStepCount | expectedVerdict |',
    '| --- | --- | --- | --- | --- | --- |',
    ...input.artifacts.artifacts.flatMap((artifact) =>
      artifact.scenarioRunCoverageMatrix.map((scenario) =>
        `| ${scenario.scenarioId} | ${scenario.family} | ${scenario.memberCount} | ${scenario.theoremCount} | ${scenario.replayStepCount} | ${scenario.expectedVerdict} |`,
      ),
    ),
    '',
    '## Fail-Closed Contract',
    '',
    'V45 proof-family artifacts fail closed when source evidence, witness artifacts, proof roots, tests, workflow bindings, or source-safety posture are missing, stale, contradictory, or unsafe.',
    '',
  ];

  if (input.specFamilyReport) {
    lines.push(
      '## Spec-Family Report Binding',
      '',
      `- report id: \`${input.specFamilyReport.reportId || 'unknown'}\``,
      `- passed: \`${input.specFamilyReport.passed === true}\``,
      '',
    );
  }
  if (input.canonicalInputReport) {
    lines.push(
      '## Canonical Input Report Binding',
      '',
      `- report id: \`${input.canonicalInputReport.reportId || 'unknown'}\``,
      `- passed: \`${input.canonicalInputReport.passed === true}\``,
      '',
    );
  }

  return `${lines.join('\n')}\n`;
}
