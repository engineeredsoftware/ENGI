// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH =
  '.bitcode/v46-protocol-comprehension-object-model.json';
export const V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SCHEMA_ID =
  'bitcode.v46.protocolComprehensionObjectModel.v1';
export const V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_VERSION = 'V46';
export const V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_CURRENT_TARGET = 'V45';
export const V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SOURCE_SAFETY_VERDICT =
  'source-safe-protocol-comprehension-metadata';

export const V46_PROTOCOL_COMPREHENSION_OBJECT_IDS = Object.freeze([
  'AssetPack',
  'DepositAssetPackOption',
  'DepositoryAssetPack',
  'ReadRequest',
  'ReviewedNeed',
  'FindingFitsReceipt',
  'SelectedFitSet',
  'NeedFitAssetPack',
  'SourceSafePreview',
  'BtdScalarVolumeReceipt',
  'BtcQuote',
  'BtcSettlementReceipt',
  'BtdRightsReceipt',
  'SourceUnlockDeliveryReceipt',
  'SourceToSharesAllocation',
  'ContributorCompensationStatement',
  'ProofRoot',
  'RepairCase',
  'InterfaceClaim',
]);

export const V46_PROTOCOL_CLAIM_CATEGORY_IDS = Object.freeze([
  'protocol-law',
  'product-guidance',
  'operator-evidence',
  'investor-framing',
  'telemetry-observability',
  'preview-claim',
  'quote-claim',
  'settlement-claim',
  'rights-claim',
  'delivery-claim',
  'compensation-claim',
  'repair-claim',
]);

export const V46_PROTOCOL_CLAIM_AUTHORITY_IDS = Object.freeze([
  'canonical-specification',
  'generated-proof',
  'ledger-readback',
  'database-projection',
  'object-storage-root',
  'wallet-provider-receipt',
  'repository-delivery-receipt',
  'telemetry-observability-only',
  'interface-guidance-only',
  'public-education-only',
]);

export const V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS = Object.freeze([
  'before-settlement',
  'after-preview',
  'after-quote',
  'after-payment-observation',
  'after-finality',
  'after-btd-rights-transfer',
  'after-repository-delivery',
]);

export const V46_PROTOCOL_FORBIDDEN_CLAIM_IDS = Object.freeze([
  'assetpack-is-raw-source',
  'btd-is-only-a-read-right',
  'btd-is-money',
  'deposit-option-is-final-btd',
  'preview-discloses-source',
  'quote-is-payment',
  'payment-observed-is-finality',
  'database-is-ledger-truth',
  'telemetry-advances-state',
  'conversation-advances-state',
  'investor-copy-is-protocol-law',
  'mainnet-value-is-admitted',
  'server-custodies-wallet-private-material',
]);

export const V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS = Object.freeze([
  'objectId',
  'claimId',
  'claimCategoryId',
  'authorityId',
  'surfaceId',
  'stateId',
  'measurementRoot',
  'proofRoot',
  'ledgerRoot',
  'databaseProjectionRoot',
  'storageRoot',
  'walletReceiptRoot',
  'repositoryReceiptRoot',
  'telemetryRoot',
  'repairCaseId',
]);

export const V46_PROTOCOL_PRIVATE_PAYLOAD_IDS = Object.freeze([
  'protected-source-payloads',
  'unpaid-assetpack-source',
  'source-snippets',
  'raw-prompts',
  'interpolated-prompts',
  'raw-provider-responses',
  'credentials',
  'wallet-private-material',
  'private-settlement-payloads',
  'private-read-context',
  'value-bearing-mainnet-admission',
]);

const SOURCE_PATHS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V46.md',
  delta: 'BITCODE_SPEC_V46_DELTA.md',
  notes: 'BITCODE_SPEC_V46_NOTES.md',
  parity: 'BITCODE_SPEC_V46_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v46-protocol-comprehension-object-model.js',
  packageTest: 'scripts/specifying/test/v46-protocol-comprehension-object-model.test.js',
  generator: 'scripts/generate-v46-protocol-comprehension-object-model.mjs',
  checker: 'scripts/check-v46-gate2-protocol-comprehension-object-model.mjs',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function sourceRoot(repoRoot, sourcePath) {
  return `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`;
}

function objectRow({
  objectId,
  objectKind,
  sourceSafeMeaning,
  lifecycleStateIds,
  btdPosture,
  btcPosture,
  sourceVisibility,
  authoritativeEvidence,
  allowedClaimCategoryIds,
  forbiddenClaimIds,
}) {
  return {
    objectId,
    objectKind,
    sourceSafeMeaning,
    lifecycleStateIds,
    btdPosture,
    btcPosture,
    sourceVisibility,
    authoritativeEvidence,
    allowedClaimCategoryIds,
    forbiddenClaimIds,
    sourceSafeFieldIds: [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    valueBearingMainnetAdmitted: false,
    rowRoot: `v46-protocol-object-row:${digest(JSON.stringify({ objectId, objectKind, lifecycleStateIds }))}`,
  };
}

function claimRow({
  claimId,
  claimCategoryId,
  authorityId,
  statement,
  allowedSurfaces,
  disclosureBoundaryIds,
  requiredEvidenceIds,
  forbiddenInterpretationIds,
}) {
  return {
    claimId,
    claimCategoryId,
    authorityId,
    statement,
    allowedSurfaces,
    disclosureBoundaryIds,
    requiredEvidenceIds,
    forbiddenInterpretationIds,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    valueBearingMainnetAdmitted: false,
    rowRoot: `v46-protocol-claim-row:${digest(JSON.stringify({ claimId, claimCategoryId, authorityId }))}`,
  };
}

export const V46_PROTOCOL_OBJECT_ROWS = Object.freeze([
  objectRow({
    objectId: 'AssetPack',
    objectKind: 'commodity',
    sourceSafeMeaning:
      'AssetPack is the packaged technical knowledge commodity traded by Bitcode, never raw source or a loose file bundle.',
    lifecycleStateIds: [
      'deposit-option-synthesized',
      'depository-assetpack-admitted',
      'need-fit-assetpack-synthesized',
      'source-unlocked-delivery',
    ],
    btdPosture: 'may carry deposit-time potential before Need selection and final Need-relative BTD after quote/finality gates',
    btcPosture: 'quoteable only after reviewed Need, selected Fit set, and source-safe synthesis evidence',
    sourceVisibility: 'source-safe preview before settlement; entitled source delivery only after BTD rights transfer',
    authoritativeEvidence: ['canonical-specification', 'generated-proof', 'object-storage-root', 'repository-delivery-receipt'],
    allowedClaimCategoryIds: ['protocol-law', 'product-guidance', 'preview-claim', 'delivery-claim'],
    forbiddenClaimIds: ['assetpack-is-raw-source', 'preview-discloses-source'],
  }),
  objectRow({
    objectId: 'DepositAssetPackOption',
    objectKind: 'supply-formation',
    sourceSafeMeaning:
      'Deposit option is a proposed source-safe AssetPack candidate for depositor review, not final BTD or public source disclosure.',
    lifecycleStateIds: ['deposit-option-synthesized', 'deposit-option-reviewed'],
    btdPosture: 'BTD potential only; no final Need-relative scalar volume',
    btcPosture: 'no quote, payment, or compensation claim',
    sourceVisibility: 'depositor-reviewed source-safe measurements and protected-source custody roots',
    authoritativeEvidence: ['generated-proof', 'object-storage-root', 'database-projection'],
    allowedClaimCategoryIds: ['product-guidance', 'operator-evidence'],
    forbiddenClaimIds: ['deposit-option-is-final-btd', 'mainnet-value-is-admitted'],
  }),
  objectRow({
    objectId: 'DepositoryAssetPack',
    objectKind: 'admitted-supply',
    sourceSafeMeaning:
      'Depository AssetPack is approved searchable supply with source-safe measurements, embeddings, provenance, and protected-source roots.',
    lifecycleStateIds: ['depository-assetpack-admitted', 'fit-candidates-recalled', 'fit-set-selected'],
    btdPosture: 'candidate contribution remains provisional until selected against a reviewed Need',
    btcPosture: 'not directly paid; participates in Need-Fit quote and source-to-shares after settlement',
    sourceVisibility: 'candidate identity and provenance may be previewed source-safely; protected source stays withheld',
    authoritativeEvidence: ['database-projection', 'object-storage-root', 'generated-proof'],
    allowedClaimCategoryIds: ['product-guidance', 'operator-evidence', 'preview-claim'],
    forbiddenClaimIds: ['preview-discloses-source', 'database-is-ledger-truth'],
  }),
  objectRow({
    objectId: 'ReadRequest',
    objectKind: 'demand-formation',
    sourceSafeMeaning:
      'Read Request is buyer demand input that may synthesize a reviewed Need but is not itself a Need, Fit, quote, or BTD.',
    lifecycleStateIds: ['read-requested', 'need-synthesizing', 'need-review-required'],
    btdPosture: 'BTD not applicable until Need-Fit measurement exists',
    btcPosture: 'no quoteable state',
    sourceVisibility: 'private read context remains scoped to the Reading boundary',
    authoritativeEvidence: ['execution-receipt', 'telemetry-observability-only'],
    allowedClaimCategoryIds: ['product-guidance', 'telemetry-observability'],
    forbiddenClaimIds: ['telemetry-advances-state', 'conversation-advances-state'],
  }),
  objectRow({
    objectId: 'ReviewedNeed',
    objectKind: 'demand-authority',
    sourceSafeMeaning:
      'Reviewed Need is the accepted buyer objective that authorizes Finding Fits and Need-relative measurement.',
    lifecycleStateIds: ['need-synthesized', 'need-reviewed', 'finding-fits-admitted'],
    btdPosture: 'admits Need-relative measurement but does not by itself compute final BTD',
    btcPosture: 'quote preparation still blocked until Fits and synthesis exist',
    sourceVisibility: 'Need is visible to the Reader and source-safe to operators according to policy',
    authoritativeEvidence: ['generated-proof', 'database-projection', 'telemetry-observability-only'],
    allowedClaimCategoryIds: ['protocol-law', 'product-guidance', 'operator-evidence'],
    forbiddenClaimIds: ['conversation-advances-state', 'telemetry-advances-state'],
  }),
  objectRow({
    objectId: 'FindingFitsReceipt',
    objectKind: 'search-evidence',
    sourceSafeMeaning:
      'Finding Fits receipt proves depository search, ranking, thresholding, and provenance for one or many candidate Fits.',
    lifecycleStateIds: ['fit-candidates-recalled', 'fit-set-selected', 'repair-required'],
    btdPosture: 'candidate BTD contribution remains provisional until the selected Fit set is synthesized into a Need-Fit AssetPack',
    btcPosture: 'no payment claim',
    sourceVisibility: 'candidate source is withheld; ranking and provenance roots are source-safe',
    authoritativeEvidence: ['execution-receipt', 'database-projection', 'generated-proof'],
    allowedClaimCategoryIds: ['operator-evidence', 'preview-claim', 'repair-claim'],
    forbiddenClaimIds: ['preview-discloses-source', 'database-is-ledger-truth'],
  }),
  objectRow({
    objectId: 'SelectedFitSet',
    objectKind: 'fit-selection',
    sourceSafeMeaning:
      'Selected Fit set is the one-or-many admitted Depository AssetPack set accepted for Need-Fit synthesis.',
    lifecycleStateIds: ['fit-set-selected', 'need-fit-assetpack-synthesized'],
    btdPosture: 'required input to final Need-relative BTD calculation',
    btcPosture: 'required input to quote preparation',
    sourceVisibility: 'provenance is source-safe; underlying source remains withheld',
    authoritativeEvidence: ['generated-proof', 'database-projection', 'object-storage-root'],
    allowedClaimCategoryIds: ['protocol-law', 'operator-evidence', 'preview-claim'],
    forbiddenClaimIds: ['preview-discloses-source'],
  }),
  objectRow({
    objectId: 'NeedFitAssetPack',
    objectKind: 'buyer-pack',
    sourceSafeMeaning:
      'Need-Fit AssetPack is a new Need-relative AssetPack synthesized from the reviewed Need and selected Fit set.',
    lifecycleStateIds: [
      'need-fit-assetpack-synthesized',
      'need-fit-assetpack-quoted',
      'source-unlocked-delivery',
    ],
    btdPosture: 'final BTD scalar volume can be computed for quote and becomes rights-bearing only after settlement',
    btcPosture: 'quoteable, payable, and deliverable through BTC finality gates',
    sourceVisibility: 'source-bearing bundle is withheld until rights transfer and repository delivery',
    authoritativeEvidence: ['generated-proof', 'object-storage-root', 'ledger-readback', 'repository-delivery-receipt'],
    allowedClaimCategoryIds: ['protocol-law', 'preview-claim', 'quote-claim', 'rights-claim', 'delivery-claim'],
    forbiddenClaimIds: ['preview-discloses-source', 'payment-observed-is-finality'],
  }),
  objectRow({
    objectId: 'SourceSafePreview',
    objectKind: 'pre-settlement-disclosure',
    sourceSafeMeaning:
      'Preview is a source-safe explanation of measurements, quality, provenance, and quote readiness, not the AssetPack source.',
    lifecycleStateIds: ['after-preview', 'need-fit-assetpack-quoted'],
    btdPosture: 'may show BTD volume/range posture source-safely',
    btcPosture: 'may show quote readiness but not payment finality',
    sourceVisibility: 'never contains protected source, unpaid AssetPack source, or source snippets',
    authoritativeEvidence: ['generated-proof', 'database-projection', 'telemetry-observability-only'],
    allowedClaimCategoryIds: ['preview-claim', 'product-guidance'],
    forbiddenClaimIds: ['preview-discloses-source', 'quote-is-payment'],
  }),
  objectRow({
    objectId: 'BtdScalarVolumeReceipt',
    objectKind: 'measurement-volume',
    sourceSafeMeaning:
      'BTD scalar volume receipt records Need-relative weighted technical knowledge volume with deterministic measurement policy.',
    lifecycleStateIds: ['weighted-scalar-volume-computed', 'btd-quantized', 'btd-quote-bound'],
    btdPosture: 'BTD volume is quote-bound before settlement and rights-bearing only after finality',
    btcPosture: 'binds deterministic share-to-fee quote inputs',
    sourceVisibility: 'measurement roots and formulas are source-safe; protected source is not serialized',
    authoritativeEvidence: ['canonical-specification', 'generated-proof', 'ledger-readback'],
    allowedClaimCategoryIds: ['protocol-law', 'quote-claim', 'operator-evidence'],
    forbiddenClaimIds: ['btd-is-only-a-read-right', 'btd-is-money', 'payment-observed-is-finality'],
  }),
  objectRow({
    objectId: 'BtcQuote',
    objectKind: 'procurement-offer',
    sourceSafeMeaning:
      'BTC quote is a deterministic sats offer bound to BTD volume, policy, expiry, wallet authority, and proof roots.',
    lifecycleStateIds: ['btc-quote-issued', 'btc-quote-accepted', 'btc-quote-inactive'],
    btdPosture: 'quote-bound BTD only; rights are unpaid and untransferred',
    btcPosture: 'quote is not payment or final settlement',
    sourceVisibility: 'quote is source-safe and carries no wallet private material',
    authoritativeEvidence: ['generated-proof', 'wallet-provider-receipt', 'ledger-readback'],
    allowedClaimCategoryIds: ['quote-claim', 'product-guidance', 'operator-evidence'],
    forbiddenClaimIds: ['quote-is-payment', 'server-custodies-wallet-private-material'],
  }),
  objectRow({
    objectId: 'BtcSettlementReceipt',
    objectKind: 'settlement-readback',
    sourceSafeMeaning:
      'BTC settlement receipt distinguishes quote, PSBT, broadcast, observation, finality, mismatch, repair, refund, and finalized settlement.',
    lifecycleStateIds: ['btc-payment-observed', 'btc-finality-confirmed', 'btc-settlement-finalized'],
    btdPosture: 'authorizes BTD rights transfer only after finality and reconciliation',
    btcPosture: 'BTC is settlement truth after finality and conservation readback',
    sourceVisibility: 'private settlement payloads and wallet private material are never serialized',
    authoritativeEvidence: ['ledger-readback', 'wallet-provider-receipt', 'generated-proof'],
    allowedClaimCategoryIds: ['settlement-claim', 'operator-evidence', 'repair-claim'],
    forbiddenClaimIds: ['payment-observed-is-finality', 'server-custodies-wallet-private-material'],
  }),
  objectRow({
    objectId: 'BtdRightsReceipt',
    objectKind: 'rights-transfer',
    sourceSafeMeaning:
      'BTD rights receipt proves settled rights, source unlock authority, and ownership/read/use boundary for the paying Reader.',
    lifecycleStateIds: ['btd-rights-pending', 'btd-rights-transferred'],
    btdPosture: 'rights-bearing BTD after BTC finality and transfer receipt',
    btcPosture: 'depends on finalized settlement',
    sourceVisibility: 'source unlock is authorized only to the entitled Reader boundary',
    authoritativeEvidence: ['ledger-readback', 'generated-proof', 'repository-delivery-receipt'],
    allowedClaimCategoryIds: ['rights-claim', 'delivery-claim', 'protocol-law'],
    forbiddenClaimIds: ['btd-is-only-a-read-right', 'payment-observed-is-finality'],
  }),
  objectRow({
    objectId: 'SourceUnlockDeliveryReceipt',
    objectKind: 'delivery',
    sourceSafeMeaning:
      'Delivery receipt proves repository handoff of the source-bearing AssetPack only after settlement and rights transfer.',
    lifecycleStateIds: ['source-unlocked-delivery', 'compensated-and-reconciled'],
    btdPosture: 'delivery is authorized by rights-bearing BTD',
    btcPosture: 'requires finalized BTC settlement',
    sourceVisibility: 'full source is visible only inside the entitled repository or delivery boundary',
    authoritativeEvidence: ['repository-delivery-receipt', 'object-storage-root', 'ledger-readback'],
    allowedClaimCategoryIds: ['delivery-claim', 'operator-evidence'],
    forbiddenClaimIds: ['preview-discloses-source', 'database-is-ledger-truth'],
  }),
  objectRow({
    objectId: 'SourceToSharesAllocation',
    objectKind: 'contributor-allocation',
    sourceSafeMeaning:
      'Source-to-shares allocation routes post-finality contributor compensation from selected Fits and BTD range slices.',
    lifecycleStateIds: ['btd-source-to-shares-allocated', 'compensated-and-reconciled'],
    btdPosture: 'uses settled BTD range slices as allocation context, not BTD size calculation',
    btcPosture: 'depends on finalized BTC settlement and conservation',
    sourceVisibility: 'allocation statements are source-safe and do not expose underlying source',
    authoritativeEvidence: ['ledger-readback', 'generated-proof', 'database-projection'],
    allowedClaimCategoryIds: ['compensation-claim', 'operator-evidence'],
    forbiddenClaimIds: ['database-is-ledger-truth', 'mainnet-value-is-admitted'],
  }),
  objectRow({
    objectId: 'ContributorCompensationStatement',
    objectKind: 'compensation-readback',
    sourceSafeMeaning:
      'Contributor compensation statement is source-safe post-finality readback of BTC compensation routing and reconciliation posture.',
    lifecycleStateIds: ['btc-contributor-compensation-routable', 'compensated-and-reconciled', 'repair-required'],
    btdPosture: 'references source-to-shares allocation context',
    btcPosture: 'post-finality compensation or repair state only',
    sourceVisibility: 'source-safe accounting only',
    authoritativeEvidence: ['ledger-readback', 'database-projection', 'generated-proof'],
    allowedClaimCategoryIds: ['compensation-claim', 'repair-claim'],
    forbiddenClaimIds: ['database-is-ledger-truth', 'mainnet-value-is-admitted'],
  }),
  objectRow({
    objectId: 'ProofRoot',
    objectKind: 'authority-evidence',
    sourceSafeMeaning:
      'Proof root identifies the evidence required to advance or explain state without serializing hidden payloads.',
    lifecycleStateIds: ['proof-recorded', 'proof-replayed', 'proof-repair-required'],
    btdPosture: 'proof can support BTD measurement, quote, rights, and repair but is not BTD itself',
    btcPosture: 'proof can support quote, observation, finality, and reconciliation but is not payment',
    sourceVisibility: 'root hashes and evidence classes are source-safe unless entitled storage unlock exists',
    authoritativeEvidence: ['canonical-specification', 'generated-proof', 'ledger-readback'],
    allowedClaimCategoryIds: ['operator-evidence', 'repair-claim', 'protocol-law'],
    forbiddenClaimIds: ['telemetry-advances-state', 'database-is-ledger-truth'],
  }),
  objectRow({
    objectId: 'RepairCase',
    objectKind: 'fail-closed-state',
    sourceSafeMeaning:
      'Repair case blocks advancement when evidence is missing, stale, contradictory, or policy-invalid.',
    lifecycleStateIds: ['repair-required', 'repair-replayed', 'repair-closed'],
    btdPosture: 'BTD rights, source unlock, allocation, or quote state remains blocked until repair closes',
    btcPosture: 'payment, refund, escalation, or compensation remains fail-closed until readback agrees',
    sourceVisibility: 'failure class and proof roots only; no protected payload exposure',
    authoritativeEvidence: ['generated-proof', 'ledger-readback', 'database-projection', 'telemetry-observability-only'],
    allowedClaimCategoryIds: ['repair-claim', 'operator-evidence', 'product-guidance'],
    forbiddenClaimIds: ['telemetry-advances-state', 'database-is-ledger-truth'],
  }),
  objectRow({
    objectId: 'InterfaceClaim',
    objectKind: 'surface-statement',
    sourceSafeMeaning:
      'Interface claim is any public, product, API, MCP, ChatGPT App, Bitcode Chat, telemetry, or operator statement about protocol state.',
    lifecycleStateIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    btdPosture: 'must label whether BTD is potential, quote-bound, rights-pending, rights-transferred, allocation context, or repair',
    btcPosture: 'must label whether BTC is quote, accepted quote, observed payment, finality, finalized settlement, compensation, refund, or repair',
    sourceVisibility: 'claim projections must default to the narrowest source-safe disclosure boundary',
    authoritativeEvidence: [...V46_PROTOCOL_CLAIM_AUTHORITY_IDS],
    allowedClaimCategoryIds: [...V46_PROTOCOL_CLAIM_CATEGORY_IDS],
    forbiddenClaimIds: [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS],
  }),
]);

export const V46_PROTOCOL_CLAIM_ROWS = Object.freeze([
  claimRow({
    claimId: 'assetpack-is-commodity',
    claimCategoryId: 'protocol-law',
    authorityId: 'canonical-specification',
    statement: 'AssetPack is the traded commodity and raw source is never the public commodity.',
    allowedSurfaces: ['BITCODE_SPEC_V46.md', '/packs', '/read', '/deposit', 'public-docs', 'api-mcp', 'chatgpt-app', 'bitcode-chat'],
    disclosureBoundaryIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    requiredEvidenceIds: ['canonical-specification', 'generated-proof'],
    forbiddenInterpretationIds: ['assetpack-is-raw-source', 'preview-discloses-source'],
  }),
  claimRow({
    claimId: 'btd-is-weighted-scalar-volume-and-settled-rights',
    claimCategoryId: 'protocol-law',
    authorityId: 'canonical-specification',
    statement:
      'BTD is Need-relative weighted scalar knowledge-volume whose settled form carries rights, source unlock authority, and allocation context.',
    allowedSurfaces: ['BITCODE_SPEC_V46.md', '/packs', '/read', 'api-mcp', 'public-docs'],
    disclosureBoundaryIds: ['after-quote', 'after-finality', 'after-btd-rights-transfer', 'after-repository-delivery'],
    requiredEvidenceIds: ['canonical-specification', 'generated-proof', 'ledger-readback'],
    forbiddenInterpretationIds: ['btd-is-only-a-read-right', 'btd-is-money', 'deposit-option-is-final-btd'],
  }),
  claimRow({
    claimId: 'deposit-option-is-potential-supply',
    claimCategoryId: 'product-guidance',
    authorityId: 'interface-guidance-only',
    statement:
      'Deposit option may describe BTD potential, coverage, utility, criticality, and search posture but cannot claim final BTD or payment.',
    allowedSurfaces: ['/deposit', '/packs', 'bitcode-chat', 'public-docs'],
    disclosureBoundaryIds: ['before-settlement', 'after-preview'],
    requiredEvidenceIds: ['object-storage-root', 'database-projection', 'generated-proof'],
    forbiddenInterpretationIds: ['deposit-option-is-final-btd', 'mainnet-value-is-admitted'],
  }),
  claimRow({
    claimId: 'operator-evidence-is-source-safe-readback',
    claimCategoryId: 'operator-evidence',
    authorityId: 'generated-proof',
    statement:
      'Operator evidence may expose proof roots, state labels, repair blockers, and readback posture, but not hidden source or private payloads.',
    allowedSurfaces: ['operator-runbook', '/packs', '/read', '/deposit', 'api-mcp'],
    disclosureBoundaryIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    requiredEvidenceIds: ['generated-proof', 'ledger-readback', 'database-projection', 'object-storage-root'],
    forbiddenInterpretationIds: ['database-is-ledger-truth', 'telemetry-advances-state'],
  }),
  claimRow({
    claimId: 'preview-is-source-safe-measurement',
    claimCategoryId: 'preview-claim',
    authorityId: 'generated-proof',
    statement:
      'Preview may expose measurements, quality, provenance, BTD posture, quote readiness, and proof roots, but not unpaid AssetPack source.',
    allowedSurfaces: ['/read', '/packs', 'api-mcp', 'chatgpt-app', 'bitcode-chat'],
    disclosureBoundaryIds: ['after-preview', 'after-quote', 'after-payment-observation'],
    requiredEvidenceIds: ['generated-proof', 'database-projection', 'telemetry-observability-only'],
    forbiddenInterpretationIds: ['preview-discloses-source', 'quote-is-payment'],
  }),
  claimRow({
    claimId: 'quote-is-source-safe-offer',
    claimCategoryId: 'quote-claim',
    authorityId: 'generated-proof',
    statement:
      'BTC quote is a deterministic source-safe offer bound to reviewed Need, selected Fits, BTD volume, policy, network, expiry, and authority.',
    allowedSurfaces: ['/read', '/packs', 'api-mcp', 'bitcode-chat'],
    disclosureBoundaryIds: ['after-quote'],
    requiredEvidenceIds: ['generated-proof', 'wallet-provider-receipt', 'database-projection'],
    forbiddenInterpretationIds: ['quote-is-payment', 'payment-observed-is-finality'],
  }),
  claimRow({
    claimId: 'payment-observation-is-not-finality',
    claimCategoryId: 'settlement-claim',
    authorityId: 'ledger-readback',
    statement:
      'Prepared, signed, broadcast, and observed BTC payment states cannot unlock source, transfer BTD rights, deliver, or compensate contributors.',
    allowedSurfaces: ['/read', '/packs', 'api-mcp', 'operator-runbook'],
    disclosureBoundaryIds: ['after-payment-observation', 'after-finality'],
    requiredEvidenceIds: ['ledger-readback', 'wallet-provider-receipt', 'generated-proof'],
    forbiddenInterpretationIds: ['payment-observed-is-finality', 'database-is-ledger-truth'],
  }),
  claimRow({
    claimId: 'finality-authorizes-rights-and-delivery',
    claimCategoryId: 'rights-claim',
    authorityId: 'ledger-readback',
    statement:
      'Confirmed BTC finality plus reconciliation authorizes BTD rights transfer, source unlock, and repository delivery to the entitled Reader.',
    allowedSurfaces: ['/read', '/packs', 'api-mcp', 'operator-runbook'],
    disclosureBoundaryIds: ['after-finality', 'after-btd-rights-transfer', 'after-repository-delivery'],
    requiredEvidenceIds: ['ledger-readback', 'object-storage-root', 'repository-delivery-receipt'],
    forbiddenInterpretationIds: ['payment-observed-is-finality', 'database-is-ledger-truth'],
  }),
  claimRow({
    claimId: 'delivery-is-entitled-source-unlock',
    claimCategoryId: 'delivery-claim',
    authorityId: 'repository-delivery-receipt',
    statement:
      'Repository delivery is the entitled source-unlock boundary after BTC finality and BTD rights transfer, not a preview state.',
    allowedSurfaces: ['/read', '/packs', 'api-mcp', 'operator-runbook'],
    disclosureBoundaryIds: ['after-btd-rights-transfer', 'after-repository-delivery'],
    requiredEvidenceIds: ['repository-delivery-receipt', 'object-storage-root', 'ledger-readback'],
    forbiddenInterpretationIds: ['preview-discloses-source', 'payment-observed-is-finality'],
  }),
  claimRow({
    claimId: 'compensation-follows-source-to-shares',
    claimCategoryId: 'compensation-claim',
    authorityId: 'ledger-readback',
    statement:
      'Contributor compensation follows final settlement, source-to-shares allocation, BTD range slices, and reconciliation readback.',
    allowedSurfaces: ['/packs', '/deposit', 'api-mcp', 'operator-runbook'],
    disclosureBoundaryIds: ['after-finality', 'after-btd-rights-transfer', 'after-repository-delivery'],
    requiredEvidenceIds: ['ledger-readback', 'database-projection', 'generated-proof'],
    forbiddenInterpretationIds: ['database-is-ledger-truth', 'mainnet-value-is-admitted'],
  }),
  claimRow({
    claimId: 'telemetry-is-observability-only',
    claimCategoryId: 'telemetry-observability',
    authorityId: 'telemetry-observability-only',
    statement:
      'Telemetry can explain progress and repair blockers, but cannot alone advance AssetPack lifecycle, BTC settlement, BTD rights, or delivery.',
    allowedSurfaces: ['/packs', '/read', '/deposit', 'bitcode-chat', 'operator-runbook'],
    disclosureBoundaryIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    requiredEvidenceIds: ['telemetry-observability-only', 'generated-proof'],
    forbiddenInterpretationIds: ['telemetry-advances-state', 'conversation-advances-state'],
  }),
  claimRow({
    claimId: 'investor-framing-is-not-protocol-law',
    claimCategoryId: 'investor-framing',
    authorityId: 'public-education-only',
    statement:
      'Investor and landing-page framing may explain Bitcode commercially, but formal protocol law comes only from the canonical specification family and proof readback.',
    allowedSurfaces: ['landing-page', 'public-docs', 'pitch-material'],
    disclosureBoundaryIds: ['before-settlement'],
    requiredEvidenceIds: ['canonical-specification'],
    forbiddenInterpretationIds: ['investor-copy-is-protocol-law', 'mainnet-value-is-admitted'],
  }),
  claimRow({
    claimId: 'repair-fails-closed',
    claimCategoryId: 'repair-claim',
    authorityId: 'generated-proof',
    statement:
      'Missing, stale, contradictory, or policy-invalid evidence returns the object or claim to repair-required and the narrowest source-safe boundary.',
    allowedSurfaces: ['/packs', '/read', '/deposit', 'api-mcp', 'operator-runbook', 'bitcode-chat'],
    disclosureBoundaryIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    requiredEvidenceIds: ['generated-proof', 'ledger-readback', 'database-projection', 'telemetry-observability-only'],
    forbiddenInterpretationIds: ['telemetry-advances-state', 'database-is-ledger-truth'],
  }),
]);

function buildSourceRoots(repoRoot) {
  return Object.fromEntries(Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, sourceRoot(repoRoot, sourcePath)]));
}

function buildSourcePredicates(repoRoot) {
  const sources = Object.fromEntries(Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]));
  return [
    predicateResult('active-canon-pointer-supports-v46-draft-or-later', SOURCE_PATHS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V45')),
    predicateResult(
      'spec-defines-comprehension-object-model',
      SOURCE_PATHS.spec,
      sources.spec.includes('V46 commercial protocol comprehension object model') &&
        sources.spec.includes('InterfaceClaim') &&
        sources.spec.includes('Claim authority is evidence-specific'),
    ),
    predicateResult(
      'spec-defines-claim-taxonomy-law',
      SOURCE_PATHS.spec,
      sources.spec.includes('V46 claim taxonomy law') &&
        sources.spec.includes('investor framing is not protocol law') &&
        sources.spec.includes('telemetry is observability only'),
    ),
    predicateResult(
      'delta-documents-gate2',
      SOURCE_PATHS.delta,
      sources.delta.includes('Gate 2: Protocol Comprehension Object Model And Claim Taxonomy') &&
        sources.delta.includes(V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate2-atom',
      SOURCE_PATHS.notes,
      sources.notes.includes('V46 protocol atom 6: protocol comprehension object model and claim taxonomy') &&
        sources.notes.includes('Claim taxonomy separates protocol law from product guidance, operator evidence, investor framing, telemetry, preview, quote, settlement, rights, delivery, compensation, and repair claims.'),
    ),
    predicateResult(
      'parity-closes-gate2-row',
      SOURCE_PATHS.parity,
      sources.parity.includes('Gate 2') &&
        sources.parity.includes('V46ProtocolComprehensionObjectModel') &&
        sources.parity.includes(V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate2',
      SOURCE_PATHS.roadmap,
      sources.roadmap.includes('V46 Gate 2 closure anchor') &&
        sources.roadmap.includes(V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH),
    ),
    predicateResult(
      'readmes-document-gate2',
      SOURCE_PATHS.readme,
      sources.readme.includes('V46 Gate 2 adds `V46ProtocolComprehensionObjectModel`') &&
        sources.protocolReadme.includes('V46 Gate 2 adds `V46ProtocolComprehensionObjectModel`'),
    ),
    predicateResult(
      'package-exports-wired',
      SOURCE_PATHS.packageIndex,
      sources.packageIndex.includes('buildV46ProtocolComprehensionObjectModel') &&
        sources.packageTypes.includes('buildV46ProtocolComprehensionObjectModel'),
    ),
    predicateResult(
      'generator-and-checker-exist',
      SOURCE_PATHS.generator,
      sourceExists(repoRoot, SOURCE_PATHS.generator) && sourceExists(repoRoot, SOURCE_PATHS.checker),
    ),
    predicateResult(
      'package-script-wired',
      SOURCE_PATHS.packageJson,
      sources.packageJson.includes('"generate:v46-protocol-comprehension-object-model"') &&
        sources.packageJson.includes('"check:v46-protocol-comprehension-object-model"') &&
        sources.packageJson.includes('"check:v46-gate2"'),
    ),
    predicateResult(
      'gate-and-canon-workflows-run-gate2',
      SOURCE_PATHS.gateWorkflow,
      sources.gateWorkflow.includes('check-v46-gate2-protocol-comprehension-object-model.mjs') &&
        sources.canonWorkflow.includes('check-v46-gate2-protocol-comprehension-object-model.mjs'),
    ),
  ];
}

function sourceSafetyCoverage(objectRows, claimRows) {
  const allRows = [...objectRows, ...claimRows];
  return {
    sourceSafeMetadataOnly: allRows.every((row) => row.sourceSafeMetadataOnly === true),
    protectedSourceVisible: allRows.some((row) => row.protectedSourceVisible === true),
    unpaidAssetPackSourceVisible: allRows.some((row) => row.unpaidAssetPackSourceVisible === true),
    rawPromptVisible: allRows.some((row) => row.rawPromptVisible === true),
    rawProviderResponseVisible: allRows.some((row) => row.rawProviderResponseVisible === true),
    credentialsSerialized: allRows.some((row) => row.credentialsSerialized === true),
    walletPrivateMaterialVisible: allRows.some((row) => row.walletPrivateMaterialVisible === true),
    valueBearingMainnetAdmitted: allRows.some((row) => row.valueBearingMainnetAdmitted === true),
  };
}

export function buildV46ProtocolComprehensionObjectModel(input = {}) {
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const objectRows = [...V46_PROTOCOL_OBJECT_ROWS];
  const claimRows = [...V46_PROTOCOL_CLAIM_ROWS];
  const sourcePredicates = buildSourcePredicates(repoRoot);
  const failedPredicateIds = sourcePredicates.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const coverage = {
    objectCount: objectRows.length,
    claimCount: claimRows.length,
    objectIds: [...V46_PROTOCOL_COMPREHENSION_OBJECT_IDS],
    claimCategoryIds: [...V46_PROTOCOL_CLAIM_CATEGORY_IDS],
    claimAuthorityIds: [...V46_PROTOCOL_CLAIM_AUTHORITY_IDS],
    disclosureBoundaryIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    forbiddenClaimIds: [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS],
    sourceSafeFieldIds: [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS],
    privatePayloadIds: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    assetPackCommodityCovered: objectRows.some((row) => row.objectId === 'AssetPack'),
    btdScalarVolumeCovered: objectRows.some((row) => row.objectId === 'BtdScalarVolumeReceipt'),
    btcQuoteSettlementCovered:
      objectRows.some((row) => row.objectId === 'BtcQuote') &&
      objectRows.some((row) => row.objectId === 'BtcSettlementReceipt'),
    sourceUnlockDeliveryCovered: objectRows.some((row) => row.objectId === 'SourceUnlockDeliveryReceipt'),
    contributorCompensationCovered:
      objectRows.some((row) => row.objectId === 'SourceToSharesAllocation') &&
      objectRows.some((row) => row.objectId === 'ContributorCompensationStatement'),
    interfaceClaimsCovered: objectRows.some((row) => row.objectId === 'InterfaceClaim'),
    protocolLawClaimCovered: claimRows.some((row) => row.claimCategoryId === 'protocol-law'),
    productGuidanceClaimCovered: claimRows.some((row) => row.claimCategoryId === 'product-guidance'),
    operatorEvidenceClaimCovered: claimRows.some((row) => row.claimCategoryId === 'operator-evidence'),
    investorFramingClaimCovered: claimRows.some((row) => row.claimCategoryId === 'investor-framing'),
    telemetryObservabilityClaimCovered: claimRows.some((row) => row.claimCategoryId === 'telemetry-observability'),
    previewQuoteSettlementRightsDeliveryCovered: ['preview-claim', 'quote-claim', 'settlement-claim', 'rights-claim', 'delivery-claim'].every((id) =>
      claimRows.some((row) => row.claimCategoryId === id),
    ),
    compensationRepairClaimsCovered: ['compensation-claim', 'repair-claim'].every((id) =>
      objectRows.some((row) => row.allowedClaimCategoryIds.includes(id)) ||
      claimRows.some((row) => row.claimCategoryId === id),
    ),
    noForbiddenClaimCollapsed: [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS].every((id) =>
      objectRows.some((row) => row.forbiddenClaimIds.includes(id)) ||
      claimRows.some((row) => row.forbiddenInterpretationIds.includes(id)),
    ),
    sourcePredicates,
    failedPredicateIds,
    ...sourceSafetyCoverage(objectRows, claimRows),
  };

  return {
    artifactId: 'v46-protocol-comprehension-object-model',
    artifactPath: V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH,
    artifactRoot: `v46-protocol-comprehension-object-model:${digest(JSON.stringify({ objectRows, claimRows, coverage }))}`,
    schemaId: V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SCHEMA_ID,
    version: V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_VERSION,
    currentTarget: V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_CURRENT_TARGET,
    sourceSafetyVerdict: V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SOURCE_SAFETY_VERDICT,
    sourceRoots: buildSourceRoots(repoRoot),
    objectIds: [...V46_PROTOCOL_COMPREHENSION_OBJECT_IDS],
    claimCategoryIds: [...V46_PROTOCOL_CLAIM_CATEGORY_IDS],
    claimAuthorityIds: [...V46_PROTOCOL_CLAIM_AUTHORITY_IDS],
    disclosureBoundaryIds: [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS],
    forbiddenClaimIds: [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS],
    sourceSafeFieldIds: [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    objectRows,
    claimRows,
    coverage,
    passed:
      failedPredicateIds.length === 0 &&
      coverage.sourceSafeMetadataOnly === true &&
      coverage.protectedSourceVisible === false &&
      coverage.unpaidAssetPackSourceVisible === false &&
      coverage.rawPromptVisible === false &&
      coverage.rawProviderResponseVisible === false &&
      coverage.credentialsSerialized === false &&
      coverage.walletPrivateMaterialVisible === false &&
      coverage.valueBearingMainnetAdmitted === false,
    closureReading:
      'V46 Gate 2 closes the source-safe comprehension object model and claim taxonomy; it does not authorize runtime behavior or V46 promotion.',
  };
}

export const V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SOURCE_ROOTS = Object.freeze(
  buildSourceRoots(DEFAULT_REPO_ROOT),
);
