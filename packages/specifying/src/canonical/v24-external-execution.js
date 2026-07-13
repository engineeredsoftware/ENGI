// @ts-check
// @ts-nocheck

import crypto from 'node:crypto';
import {
  buildArtifactBinding,
  buildReplayStep,
  buildTheoremVerdict,
  allTheoremsPassed as aggregateTheoremVerdicts,
  summarizeStrings
} from './proof-annotations.js';

const BITCOIN_INTERFACE_ID = 'bitcoin-mainchain-execution';
const REPEATED_READ_INTERFACE_ID = 'repeated-read-payment-execution';
const SIDECHAIN_INTERFACE_ID = 'sidechain-execution';
const COMPUTE_INTERFACE_ID = 'compute-container-execution';
const STORAGE_INTERFACE_ID = 'storage-container-execution';
const GITHUB_INTERFACE_ID = 'github-live-interface';

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {string} value
 * @param {number} [size=12]
 * @returns {string}
 */
function shortId(value, size = 12) {
  return sha256(value).slice(0, size);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {Record<string, unknown> | null | undefined} summary
 * @returns {Record<string, unknown>}
 */
function ensureSummary(summary) {
  return /** @type {Record<string, unknown>} */ (summary || {});
}

/**
 * @param {Record<string, unknown> | null | undefined} profile
 * @param {string} key
 * @returns {Record<string, unknown>}
 */
function activeBinding(profile, key) {
  return ensureSummary(ensureSummary(profile).activeBindings)[key] && typeof ensureSummary(profile).activeBindings === 'object'
    ? /** @type {Record<string, unknown>} */ (ensureSummary(ensureSummary(profile).activeBindings)[key])
    : {};
}

/**
 * @param {Record<string, unknown> | null | undefined} telemetrySummary
 * @param {string} interfaceId
 * @returns {Record<string, unknown>}
 */
function interfaceSummary(telemetrySummary, interfaceId) {
  const summaries = /** @type {Array<Record<string, unknown>>} */ (ensureSummary(telemetrySummary).interfaceSummaries || []);
  return summaries.find((entry) => entry.interfaceId === interfaceId) || {};
}

/**
 * @param {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   externalTelemetrySummary: Record<string, unknown>,
 *   bitcoinTreasuryPolicy?: Record<string, unknown> | null,
 *   bitcoinSettlementIntent?: Record<string, unknown> | null,
 *   bitcoinSettlementObservation?: Record<string, unknown> | null,
 *   bitcoinAnchor?: Record<string, unknown> | null,
 *   settlementPreview: Record<string, unknown>,
 *   assetPack: { assetPackId: string },
 *   branchName: string,
 *   paymentMode?: string | null | undefined
 * }} input
 */
export function buildV24BitcoinNetworkArtifacts({
  externalEnvironmentProfile,
  externalTelemetrySummary,
  bitcoinTreasuryPolicy = null,
  bitcoinSettlementIntent = null,
  bitcoinSettlementObservation = null,
  bitcoinAnchor = null,
  settlementPreview,
  assetPack,
  branchName,
  paymentMode
}) {
  const configuredEnvironmentMode = String(externalEnvironmentProfile.configuredEnvironmentMode || 'mock');
  const actualityDisposition = String(externalEnvironmentProfile.actualityDisposition || 'deterministic-mock-only');
  const mainchainBinding = activeBinding(externalEnvironmentProfile, 'bitcoinMainchain');
  const repeatedReadBinding = activeBinding(externalEnvironmentProfile, 'repeatedReadPayment');
  const sidechainBinding = activeBinding(externalEnvironmentProfile, 'sidechain');
  const mainchainSummary = interfaceSummary(externalTelemetrySummary, BITCOIN_INTERFACE_ID);
  const repeatedReadSummary = interfaceSummary(externalTelemetrySummary, REPEATED_READ_INTERFACE_ID);
  const sidechainSummary = interfaceSummary(externalTelemetrySummary, SIDECHAIN_INTERFACE_ID);
  const mainchainRuntimeState = String(mainchainSummary.runtimeState || '');
  const repeatedReadRuntimeState = String(repeatedReadSummary.runtimeState || '');
  const sidechainRuntimeState = String(sidechainSummary.runtimeState || '');
  const activePaymentMode = String(paymentMode || '');
  const mainchainActive = !!bitcoinSettlementIntent && !!bitcoinSettlementObservation;
  const repeatedReadActive = activePaymentMode === 'repeated-read-payment';
  const sidechainActive = activePaymentMode === 'checkpointed-sidechain-bridge';

  const bitcoinNetworkIntent = {
    artifactId: `v24_bitcoin_network_intent_${shortId(`${branchName}:${activePaymentMode || 'none'}`, 16)}`,
    interfaceId: BITCOIN_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    paymentMode: activePaymentMode || null,
    modeApplicability: mainchainActive ? 'active' : 'inactive-no-payment-mode',
    bundleId: settlementPreview.bundleId || null,
    readId: settlementPreview.readId || null,
    assetPackId: assetPack.assetPackId,
    unitDenomination: bitcoinSettlementIntent?.unitDenomination || 'BTD',
    meteredMicroUnits: bitcoinSettlementIntent?.meteredMicroUnits || settlementPreview.meteredMicroUnits || null,
    treasuryPolicyRef: bitcoinTreasuryPolicy?.policyId || null,
    requestId: mainchainSummary.requestId || null,
    intentRef: bitcoinSettlementIntent?.intentId || null,
    carrierType: bitcoinSettlementIntent?.carrierType || null,
    transportNetwork: bitcoinSettlementIntent?.transportNetwork || mainchainBinding.network || null,
    environmentIdentityRef: mainchainSummary.environmentIdentityRef || mainchainBinding.accountRef || null,
    environmentResourceRef: mainchainSummary.environmentResourceRef || mainchainBinding.addressRef || null,
    affectedArtifactRefs: summarizeStrings(mainchainSummary.affectedArtifactRefs || [])
  };

  const bitcoinNetworkExecution = {
    artifactId: `v24_bitcoin_network_execution_${shortId(`${branchName}:${configuredEnvironmentMode}`, 16)}`,
    interfaceId: BITCOIN_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    executionId: mainchainSummary.executionId || null,
    requestId: mainchainSummary.requestId || null,
    observationId: bitcoinSettlementObservation?.observationId || mainchainSummary.observationId || null,
    executionClass: mainchainSummary.executionClass || mainchainBinding.executionClass || null,
    executionState: !mainchainActive
      ? 'inactive-no-payment-mode'
      : mainchainRuntimeState === 'live-configured'
        ? 'live-network-configured-awaiting-broadcast'
        : mainchainRuntimeState === 'live-misconfigured'
          ? 'live-network-misconfigured'
          : 'stubbed-network-carrier-assembled',
    settlementIntentRef: bitcoinSettlementIntent?.intentId || null,
    networkRef: bitcoinSettlementObservation?.networkRef || null,
    anchorRef: bitcoinAnchor?.anchorRef || null,
    environmentIdentityRef: mainchainSummary.environmentIdentityRef || mainchainBinding.accountRef || null,
    environmentResourceRef: mainchainSummary.environmentResourceRef || mainchainBinding.addressRef || null,
    affectedArtifactRefs: summarizeStrings(mainchainSummary.affectedArtifactRefs || []),
    serviceMode: bitcoinSettlementIntent?.serviceMode || null
  };

  const bitcoinNetworkObservation = {
    artifactId: `v24_bitcoin_network_observation_${shortId(`${branchName}:${activePaymentMode || 'none'}`, 16)}`,
    interfaceId: BITCOIN_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    bundleId: settlementPreview.bundleId || null,
    readId: settlementPreview.readId || null,
    observationId: bitcoinSettlementObservation?.observationId || mainchainSummary.observationId || null,
    executionId: mainchainSummary.executionId || null,
    observationState: !mainchainActive
      ? 'not-requested'
      : mainchainRuntimeState === 'live-configured'
        ? 'configuration-ready-no-live-observation'
        : mainchainRuntimeState === 'live-misconfigured'
          ? 'live-configuration-blocked'
          : 'observed-from-demonstration-service',
    networkState: bitcoinSettlementObservation?.networkState || 'not-requested',
    confirmationState: bitcoinSettlementObservation?.confirmationState || 'not-requested',
    confirmations: bitcoinSettlementObservation?.confirmations ?? 0,
    networkRef: bitcoinSettlementObservation?.networkRef || null,
    anchorRef: bitcoinAnchor?.anchorRef || null,
    observedValue: bitcoinSettlementObservation?.observedValue || settlementPreview.meteredMicroUnits || null,
    journalBindingState: bitcoinSettlementObservation?.journalBindingState || 'not-applicable',
    serviceReceipt: bitcoinSettlementObservation?.serviceReceipt || null,
    affectedArtifactRefs: summarizeStrings(mainchainSummary.affectedArtifactRefs || [])
  };

  const repeatedReadPaymentIntent = {
    artifactId: `v24_repeated_read_intent_${shortId(`${branchName}:${activePaymentMode || 'none'}`, 16)}`,
    interfaceId: REPEATED_READ_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    paymentMode: activePaymentMode || null,
    modeApplicability: repeatedReadActive ? 'active' : 'inactive-for-mode',
    bundleId: settlementPreview.bundleId || null,
    readId: settlementPreview.readId || null,
    assetPackId: assetPack.assetPackId,
    unitDenomination: bitcoinSettlementIntent?.unitDenomination || 'BTD',
    meteredMicroUnits: bitcoinSettlementIntent?.meteredMicroUnits || settlementPreview.meteredMicroUnits || null,
    treasuryPolicyRef: bitcoinTreasuryPolicy?.policyId || null,
    requestId: repeatedReadSummary.requestId || null,
    intentRef: repeatedReadActive ? bitcoinSettlementIntent?.intentId || null : null,
    carrierType: repeatedReadActive ? bitcoinSettlementIntent?.carrierType || null : null,
    transportNetwork: repeatedReadActive ? bitcoinSettlementIntent?.transportNetwork || repeatedReadBinding.network || null : null,
    processorRef: repeatedReadBinding.processorRef || null,
    invoiceEndpointRef: repeatedReadBinding.invoiceEndpointRef || null,
    environmentIdentityRef: repeatedReadSummary.environmentIdentityRef || repeatedReadBinding.accountRef || null,
    environmentResourceRef: repeatedReadSummary.environmentResourceRef || repeatedReadBinding.invoiceEndpointRef || null,
    affectedArtifactRefs: summarizeStrings(repeatedReadSummary.affectedArtifactRefs || [])
  };

  const repeatedReadPaymentExecution = {
    artifactId: `v24_repeated_read_execution_${shortId(`${branchName}:${configuredEnvironmentMode}`, 16)}`,
    interfaceId: REPEATED_READ_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    executionId: repeatedReadSummary.executionId || null,
    requestId: repeatedReadSummary.requestId || null,
    observationId: repeatedReadSummary.observationId || null,
    executionClass: repeatedReadSummary.executionClass || repeatedReadBinding.executionClass || null,
    executionState: !repeatedReadActive
      ? 'inactive-for-mode'
      : repeatedReadRuntimeState === 'live-configured'
        ? 'live-lightning-configured-awaiting-invoice'
        : repeatedReadRuntimeState === 'live-misconfigured'
          ? 'live-lightning-misconfigured'
          : 'stubbed-lightning-invoice-assembled',
    settlementIntentRef: repeatedReadActive ? bitcoinSettlementIntent?.intentId || null : null,
    processorRef: repeatedReadBinding.processorRef || null,
    invoiceRef: repeatedReadActive ? bitcoinSettlementIntent?.paymentCarrier?.invoice || null : null,
    paymentHash: repeatedReadActive ? bitcoinSettlementIntent?.paymentCarrier?.paymentHash || null : null,
    descriptionHash: repeatedReadActive ? bitcoinSettlementIntent?.paymentCarrier?.descriptionHash || null : null,
    environmentIdentityRef: repeatedReadSummary.environmentIdentityRef || repeatedReadBinding.accountRef || null,
    environmentResourceRef: repeatedReadSummary.environmentResourceRef || repeatedReadBinding.invoiceEndpointRef || null,
    affectedArtifactRefs: summarizeStrings(repeatedReadSummary.affectedArtifactRefs || []),
    serviceMode: repeatedReadActive ? bitcoinSettlementIntent?.serviceMode || null : null
  };

  const repeatedReadPaymentObservation = {
    artifactId: `v24_repeated_read_observation_${shortId(`${branchName}:${activePaymentMode || 'none'}`, 16)}`,
    interfaceId: REPEATED_READ_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    bundleId: settlementPreview.bundleId || null,
    readId: settlementPreview.readId || null,
    observationId: repeatedReadSummary.observationId || null,
    executionId: repeatedReadSummary.executionId || null,
    observationState: !repeatedReadActive
      ? 'inactive-for-mode'
      : repeatedReadRuntimeState === 'live-configured'
        ? 'configuration-ready-no-live-payment-observation'
        : repeatedReadRuntimeState === 'live-misconfigured'
          ? 'live-configuration-blocked'
          : 'observed-from-demonstration-service',
    networkState: repeatedReadActive ? bitcoinSettlementObservation?.networkState || 'not-requested' : 'inactive-for-mode',
    confirmationState: repeatedReadActive ? bitcoinSettlementObservation?.confirmationState || 'not-requested' : 'inactive-for-mode',
    confirmations: repeatedReadActive ? bitcoinSettlementObservation?.confirmations ?? 0 : 0,
    invoiceRef: repeatedReadActive ? bitcoinSettlementIntent?.paymentCarrier?.invoice || bitcoinSettlementObservation?.networkRef || null : null,
    paymentHash: repeatedReadActive ? bitcoinSettlementIntent?.paymentCarrier?.paymentHash || null : null,
    descriptionHash: repeatedReadActive ? bitcoinSettlementIntent?.paymentCarrier?.descriptionHash || null : null,
    observedValue: repeatedReadActive ? bitcoinSettlementObservation?.observedValue || settlementPreview.meteredMicroUnits || null : null,
    journalBindingState: repeatedReadActive ? bitcoinSettlementObservation?.journalBindingState || 'anchor-required' : 'inactive-for-mode',
    serviceReceipt: repeatedReadActive ? bitcoinSettlementObservation?.serviceReceipt || null : null,
    environmentIdentityRef: repeatedReadSummary.environmentIdentityRef || repeatedReadBinding.accountRef || null,
    environmentResourceRef: repeatedReadSummary.environmentResourceRef || repeatedReadBinding.invoiceEndpointRef || null,
    affectedArtifactRefs: summarizeStrings(repeatedReadSummary.affectedArtifactRefs || [])
  };

  const sidechainExecutionReceipt = {
    artifactId: `v24_sidechain_execution_receipt_${shortId(`${branchName}:${activePaymentMode || 'none'}`, 16)}`,
    interfaceId: SIDECHAIN_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    paymentMode: activePaymentMode || null,
    modeApplicability: sidechainActive ? 'active' : 'inactive-for-mode',
    executionId: sidechainSummary.executionId || null,
    requestId: sidechainSummary.requestId || null,
    observationId: sidechainSummary.observationId || null,
    executionClass: sidechainSummary.executionClass || sidechainBinding.executionClass || null,
    executionState: !sidechainActive
      ? 'inactive-for-mode'
      : sidechainRuntimeState === 'live-configured'
        ? 'live-sidechain-configured-awaiting-checkpoint'
        : sidechainRuntimeState === 'live-misconfigured'
          ? 'live-sidechain-misconfigured'
          : 'stubbed-sidechain-checkpoint-observed',
    sidechainNetwork: sidechainBinding.network || null,
    checkpointRef: sidechainActive ? bitcoinSettlementObservation?.networkRef || null : null,
    environmentIdentityRef: sidechainSummary.environmentIdentityRef || sidechainBinding.accountRef || null,
    environmentResourceRef: sidechainSummary.environmentResourceRef || sidechainBinding.addressRef || null,
    treasuryPolicyRef: bitcoinTreasuryPolicy?.policyId || null,
    affectedArtifactRefs: summarizeStrings(sidechainSummary.affectedArtifactRefs || [])
  };

  return {
    bitcoinNetworkIntent,
    bitcoinNetworkExecution,
    bitcoinNetworkObservation,
    repeatedReadPaymentIntent,
    repeatedReadPaymentExecution,
    repeatedReadPaymentObservation,
    sidechainExecutionReceipt
  };
}

/**
 * @param {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   externalTelemetrySummary: Record<string, unknown>,
 *   computeRealityManifest?: Record<string, unknown> | null,
 *   storageRealityManifest?: Record<string, unknown> | null,
 *   branchName: string,
 *   read: { readId: string },
 *   assetPack: { assetPackId: string }
 * }} input
 */
export function buildV24ContainerArtifacts({
  externalEnvironmentProfile,
  externalTelemetrySummary,
  computeRealityManifest = null,
  storageRealityManifest = null,
  branchName,
  read,
  assetPack
}) {
  const configuredEnvironmentMode = String(externalEnvironmentProfile.configuredEnvironmentMode || 'mock');
  const actualityDisposition = String(externalEnvironmentProfile.actualityDisposition || 'deterministic-mock-only');
  const computeBinding = activeBinding(externalEnvironmentProfile, 'compute');
  const storageBinding = activeBinding(externalEnvironmentProfile, 'storage');
  const computeSummary = interfaceSummary(externalTelemetrySummary, COMPUTE_INTERFACE_ID);
  const storageSummary = interfaceSummary(externalTelemetrySummary, STORAGE_INTERFACE_ID);
  const computeRuntimeState = String(computeSummary.runtimeState || '');
  const storageRuntimeState = String(storageSummary.runtimeState || '');

  const computeContainerManifest = {
    manifestId: `v24_compute_container_manifest_${shortId(`${branchName}:${read.readId}`, 16)}`,
    interfaceId: COMPUTE_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    branchName,
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    registryRef: computeBinding.registryRef || null,
    executionIdentityRef: computeBinding.executionIdentityRef || null,
    attestationScopeRef: computeBinding.attestationScopeRef || null,
    queueRef: computeBinding.queueRef || null,
    sourceRealityRef: computeRealityManifest?.realityId || null,
    proofArtifactRefs: summarizeStrings(computeRealityManifest?.proofArtifactRefs || []),
    settlementArtifactRefs: summarizeStrings(computeRealityManifest?.settlementArtifactRefs || computeRealityManifest?.replayBasis?.settlementArtifactRefs || [])
  };

  const computeContainerExecution = {
    executionId: computeSummary.executionId || `exec_${shortId(computeContainerManifest.manifestId, 16)}`,
    interfaceId: COMPUTE_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    requestId: computeSummary.requestId || null,
    observationId: computeSummary.observationId || null,
    manifestRef: computeContainerManifest.manifestId,
    executionClass: computeSummary.executionClass || computeBinding.executionClass || null,
    executionState: configuredEnvironmentMode === 'mock'
      ? 'mock-container-emulation'
      : computeRuntimeState === 'live-configured'
        ? 'live-container-configured-awaiting-execution'
        : computeRuntimeState === 'live-misconfigured'
          ? 'live-container-misconfigured'
          : 'deterministic-container-standin',
    attestationRef: `attest_${shortId(`${computeContainerManifest.manifestId}:${configuredEnvironmentMode}`, 16)}`,
    imageDigest: stableHashObject({
      registryRef: computeBinding.registryRef || null,
      executionIdentityRef: computeBinding.executionIdentityRef || null,
      branchName,
      readId: read.readId
    }),
    environmentIdentityRef: computeSummary.environmentIdentityRef || computeBinding.executionIdentityRef || null,
    environmentResourceRef: computeSummary.environmentResourceRef || computeBinding.registryRef || null,
    outputArtifactRefs: summarizeStrings([
      ...computeContainerManifest.proofArtifactRefs,
      ...computeContainerManifest.settlementArtifactRefs
    ])
  };

  const storageContainerManifest = {
    manifestId: `v24_storage_container_manifest_${shortId(`${branchName}:${assetPack.assetPackId}`, 16)}`,
    interfaceId: STORAGE_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    branchName,
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    namespaceRef: storageBinding.namespaceRef || null,
    bucketRef: storageBinding.bucketRef || null,
    publicationEndpointRef: storageBinding.publicationEndpointRef || null,
    retentionPolicyRef: storageBinding.retentionPolicyRef || null,
    retrievalCredentialRef: storageBinding.retrievalCredentialRef || null,
    sourceRealityRef: storageRealityManifest?.realityId || null,
    scopeStorageBindings: storageRealityManifest?.scopeStorageBindings || []
  };

  const publishedArtifactCount = (storageContainerManifest.scopeStorageBindings || [])
    .reduce((sum, entry) => sum + summarizeStrings(entry?.artifactPaths || []).length, 0);

  const storagePublicationReceipt = {
    receiptId: `storage_pub_${shortId(storageContainerManifest.manifestId, 16)}`,
    interfaceId: STORAGE_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    requestId: storageSummary.requestId || null,
    executionId: storageSummary.executionId || null,
    observationId: storageSummary.observationId || null,
    manifestRef: storageContainerManifest.manifestId,
    publicationState: configuredEnvironmentMode === 'mock'
      ? 'mock-storage-publication'
      : storageRuntimeState === 'live-configured'
        ? 'live-storage-configured-awaiting-publication'
        : storageRuntimeState === 'live-misconfigured'
          ? 'live-storage-misconfigured'
          : 'deterministic-storage-publication',
    environmentIdentityRef: storageSummary.environmentIdentityRef || storageBinding.namespaceRef || null,
    environmentResourceRef: storageSummary.environmentResourceRef || storageBinding.bucketRef || null,
    publishedArtifactCount,
    publishedScopeIds: summarizeStrings((storageContainerManifest.scopeStorageBindings || []).map((entry) => entry.scopeId))
  };

  const storageRetrievalReceipt = {
    receiptId: `storage_get_${shortId(storageContainerManifest.manifestId, 16)}`,
    interfaceId: STORAGE_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    requestId: storageSummary.requestId || null,
    executionId: storageSummary.executionId || null,
    observationId: storageSummary.observationId || null,
    manifestRef: storageContainerManifest.manifestId,
    retrievalState: configuredEnvironmentMode === 'mock'
      ? 'mock-storage-retrieval'
      : storageRuntimeState === 'live-configured'
        ? 'live-storage-configured-awaiting-retrieval'
        : storageRuntimeState === 'live-misconfigured'
          ? 'live-storage-misconfigured'
          : 'deterministic-storage-retrieval',
    environmentIdentityRef: storageSummary.environmentIdentityRef || storageBinding.retrievalCredentialRef || null,
    environmentResourceRef: storageSummary.environmentResourceRef || storageBinding.bucketRef || null,
    retrievableArtifactCount: publishedArtifactCount,
    retrievalScopeIds: storagePublicationReceipt.publishedScopeIds
  };

  return {
    computeContainerManifest,
    computeContainerExecution,
    storageContainerManifest,
    storagePublicationReceipt,
    storageRetrievalReceipt
  };
}

/**
 * @param {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   externalTelemetrySummary: Record<string, unknown>,
 *   githubAppBinding: Record<string, unknown>,
 *   githubBoundarySurface: Record<string, unknown>,
 *   selectedCandidates: Array<{ assetId: string, asset?: { githubBoundary?: Record<string, unknown> } | undefined }>,
 *   buyer: { repo: string },
 *   branchName: string,
 *   assetPack: { assetPackId: string }
 * }} input
 */
export function buildV24GithubArtifacts({
  externalEnvironmentProfile,
  externalTelemetrySummary,
  githubAppBinding,
  githubBoundarySurface,
  selectedCandidates,
  buyer,
  branchName,
  assetPack
}) {
  const configuredEnvironmentMode = String(externalEnvironmentProfile.configuredEnvironmentMode || 'mock');
  const actualityDisposition = String(externalEnvironmentProfile.actualityDisposition || 'deterministic-mock-only');
  const githubBinding = activeBinding(externalEnvironmentProfile, 'github');
  const githubSummary = interfaceSummary(externalTelemetrySummary, GITHUB_INTERFACE_ID);
  const githubRuntimeState = String(githubSummary.runtimeState || '');
  const selectedSession = /** @type {Array<Record<string, unknown>>} */ (githubBoundarySurface.selectedAuthSessions || [])[0] || {};
  const workflowRunIds = summarizeStrings(selectedCandidates.map((candidate) => candidate.asset?.githubBoundary?.workflowRunId));
  const sourceCommits = summarizeStrings(selectedCandidates.map((candidate) => candidate.asset?.githubBoundary?.sourceCommit));

  const githubLiveSession = {
    sessionId: `v24_github_live_session_${shortId(`${branchName}:${buyer.repo}`, 16)}`,
    interfaceId: GITHUB_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    repo: buyer.repo,
    branchName,
    appRef: githubBinding.appRef || githubAppBinding.activeBinding?.appRef || null,
    appId: githubBinding.appId || githubAppBinding.activeBinding?.appId || null,
    installationTargetRef: githubBinding.installationTargetRef || githubAppBinding.activeBinding?.installationTargetRef || null,
    authSessionId: selectedSession.authSessionId || null,
    authPayloadHash: selectedSession.authPayloadHash || null,
    permissionsRoot: selectedSession.permissionsRoot || null,
    requestId: githubSummary.requestId || null,
    executionId: githubSummary.executionId || null,
    observationId: githubSummary.observationId || null
  };

  const githubInventoryFetchReceipt = {
    receiptId: `v24_github_inventory_fetch_${shortId(`${buyer.repo}:${assetPack.assetPackId}`, 16)}`,
    interfaceId: GITHUB_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    sessionRef: githubLiveSession.sessionId,
    fetchState: configuredEnvironmentMode === 'mock'
      ? 'mock-seeded-inventory'
      : githubRuntimeState === 'live-configured'
        ? 'live-github-configured-awaiting-fetch'
        : githubRuntimeState === 'live-misconfigured'
          ? 'live-github-misconfigured'
          : 'deterministic-repo-inventory-fetch',
    targetedRepoCount: Number(githubAppBinding.targetedRepoCount || 0),
    selectedBindingCount: Number((githubBoundarySurface.selectedInventoryProofs || []).length || 0)
  };

  const githubArtifactFetchReceipt = {
    receiptId: `v24_github_artifact_fetch_${shortId(`${branchName}:${workflowRunIds.join(':') || 'none'}`, 16)}`,
    interfaceId: GITHUB_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    sessionRef: githubLiveSession.sessionId,
    fetchState: configuredEnvironmentMode === 'mock'
      ? 'mock-seeded-artifact-fetch'
      : githubRuntimeState === 'live-configured'
        ? 'live-github-configured-awaiting-artifact-fetch'
        : githubRuntimeState === 'live-misconfigured'
          ? 'live-github-misconfigured'
          : 'deterministic-artifact-fetch',
    workflowRunIds,
    sourceCommits,
    selectedAssetIds: summarizeStrings(selectedCandidates.map((candidate) => candidate.assetId))
  };

  const githubBranchPublicationReceipt = {
    receiptId: `v24_github_branch_publication_${shortId(`${buyer.repo}:${branchName}`, 16)}`,
    interfaceId: GITHUB_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    sessionRef: githubLiveSession.sessionId,
    mutationState: configuredEnvironmentMode === 'mock'
      ? 'mock-nonmutating'
      : githubRuntimeState === 'live-configured'
        ? 'live-github-configured-awaiting-branch-publication'
        : githubRuntimeState === 'live-misconfigured'
          ? 'live-github-misconfigured'
          : 'stubbed-nonmutating-branch-publication',
    targetRepo: buyer.repo,
    branchName,
    assetPackId: assetPack.assetPackId
  };

  const githubPrUpdateReceipt = {
    receiptId: `v24_github_pr_update_${shortId(`${branchName}:${assetPack.assetPackId}`, 16)}`,
    interfaceId: GITHUB_INTERFACE_ID,
    configuredEnvironmentMode,
    actualityDisposition,
    sessionRef: githubLiveSession.sessionId,
    mutationState: configuredEnvironmentMode === 'mock'
      ? 'mock-nonmutating'
      : githubRuntimeState === 'live-configured'
        ? 'live-github-configured-awaiting-pr-update'
        : githubRuntimeState === 'live-misconfigured'
          ? 'live-github-misconfigured'
          : 'stubbed-nonmutating-pr-update',
    targetRepo: buyer.repo,
    branchName,
    prNumber: null,
    reviewUpdateState: 'not-opened-in-draft-target'
  };

  return {
    githubLiveSession,
    githubInventoryFetchReceipt,
    githubArtifactFetchReceipt,
    githubBranchPublicationReceipt,
    githubPrUpdateReceipt
  };
}

/**
 * @param {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   externalExecutionPolicy: Record<string, unknown>,
 *   externalTelemetrySummary: Record<string, unknown>,
 *   bitcoinNetworkIntent: Record<string, unknown>,
 *   bitcoinNetworkExecution: Record<string, unknown>,
 *   bitcoinNetworkObservation: Record<string, unknown>,
 *   repeatedReadPaymentIntent: Record<string, unknown>,
 *   repeatedReadPaymentExecution: Record<string, unknown>,
 *   repeatedReadPaymentObservation: Record<string, unknown>,
 *   sidechainExecutionReceipt: Record<string, unknown>
 * }} input
 */
export function buildV24ExternalRealizationProof({
  externalEnvironmentProfile,
  externalExecutionPolicy,
  externalTelemetrySummary,
  bitcoinNetworkIntent,
  bitcoinNetworkExecution,
  bitcoinNetworkObservation,
  repeatedReadPaymentIntent,
  repeatedReadPaymentExecution,
  repeatedReadPaymentObservation,
  sidechainExecutionReceipt
}) {
  const witnessArtifactPaths = [
    '.bitcode/external-environment-profile.json',
    '.bitcode/external-execution-policy.json',
    '.bitcode/external-telemetry-summary.json',
    '.bitcode/bitcoin-network-intent.json',
    '.bitcode/bitcoin-network-execution.json',
    '.bitcode/bitcoin-network-observation.json',
    '.bitcode/repeated-read-payment-intent.json',
    '.bitcode/repeated-read-payment-execution.json',
    '.bitcode/repeated-read-payment-observation.json',
    '.bitcode/sidechain-execution-receipt.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'external-realization-execution.intent',
      theoremIds: ['external_realization_execution.intent_binding', 'external_realization_execution.mode_isolation_closure'],
      requiredArtifactPaths: ['.bitcode/external-environment-profile.json', '.bitcode/bitcoin-network-intent.json', '.bitcode/external-telemetry-summary.json'],
      instruction: 'Replay the external environment and mainchain intent against mode and identity bindings.'
    }),
    buildReplayStep({
      stepId: 'external-realization-execution.execution',
      theoremIds: ['external_realization_execution.execution_closure'],
      requiredArtifactPaths: ['.bitcode/bitcoin-network-intent.json', '.bitcode/bitcoin-network-execution.json', '.bitcode/external-execution-policy.json'],
      instruction: 'Replay execution closure between declared intent, execution carrier, and execution policy.'
    }),
    buildReplayStep({
      stepId: 'external-realization-execution.observation',
      theoremIds: ['external_realization_execution.observation_closure'],
      requiredArtifactPaths: ['.bitcode/bitcoin-network-observation.json', '.bitcode/sidechain-execution-receipt.json', '.bitcode/external-telemetry-summary.json'],
      instruction: 'Replay observation closure across mainchain observation, sidechain receipt, and telemetry summaries.'
    }),
    buildReplayStep({
      stepId: 'external-realization-execution.repeated-read',
      theoremIds: ['external_realization_execution.repeated_read_closure'],
      requiredArtifactPaths: ['.bitcode/repeated-read-payment-intent.json', '.bitcode/repeated-read-payment-execution.json', '.bitcode/repeated-read-payment-observation.json'],
      instruction: 'Replay repeated-read payment closure across invoice intent, processor execution, and payment observation.'
    })
  ];

  const configuredEnvironmentMode = externalEnvironmentProfile.configuredEnvironmentMode;
  const sameMode =
    bitcoinNetworkIntent.configuredEnvironmentMode === configuredEnvironmentMode
    && bitcoinNetworkExecution.configuredEnvironmentMode === configuredEnvironmentMode
    && bitcoinNetworkObservation.configuredEnvironmentMode === configuredEnvironmentMode
    && repeatedReadPaymentIntent.configuredEnvironmentMode === configuredEnvironmentMode
    && repeatedReadPaymentExecution.configuredEnvironmentMode === configuredEnvironmentMode
    && repeatedReadPaymentObservation.configuredEnvironmentMode === configuredEnvironmentMode
    && sidechainExecutionReceipt.configuredEnvironmentMode === configuredEnvironmentMode;
  const intentBindingClosed = bitcoinNetworkIntent.interfaceId === BITCOIN_INTERFACE_ID
    && bitcoinNetworkIntent.bundleId === bitcoinNetworkObservation.bundleId
    && bitcoinNetworkIntent.requestId === bitcoinNetworkExecution.requestId;
  const executionClosed = bitcoinNetworkExecution.interfaceId === BITCOIN_INTERFACE_ID
    && bitcoinNetworkExecution.observationId === bitcoinNetworkObservation.observationId
    && bitcoinNetworkExecution.executionState !== null;
  const observationClosed = bitcoinNetworkObservation.interfaceId === BITCOIN_INTERFACE_ID
    && bitcoinNetworkObservation.affectedArtifactRefs.length >= 1
    && String(externalTelemetrySummary.configuredEnvironmentMode || '') === String(configuredEnvironmentMode || '');
  const repeatedReadClosed =
    repeatedReadPaymentIntent.modeApplicability !== 'active'
    || (
      repeatedReadPaymentIntent.interfaceId === REPEATED_READ_INTERFACE_ID
      && repeatedReadPaymentExecution.interfaceId === REPEATED_READ_INTERFACE_ID
      && repeatedReadPaymentObservation.interfaceId === REPEATED_READ_INTERFACE_ID
      && repeatedReadPaymentExecution.executionState !== null
      && repeatedReadPaymentExecution.observationId === repeatedReadPaymentObservation.observationId
      && repeatedReadPaymentIntent.intentRef === bitcoinNetworkIntent.intentRef
      && !!(repeatedReadPaymentObservation.invoiceRef || repeatedReadPaymentObservation.serviceReceipt?.referenceId)
    );
  const sidechainClosed = sidechainExecutionReceipt.interfaceId === SIDECHAIN_INTERFACE_ID
    && (sidechainExecutionReceipt.modeApplicability === 'inactive-for-mode'
      || sidechainExecutionReceipt.executionState === 'stubbed-sidechain-checkpoint-observed'
      || sidechainExecutionReceipt.executionState === 'live-sidechain-checkpoint-observed');

  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'external_realization_execution.intent_binding',
      passed: intentBindingClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['external-realization-execution.intent'],
      failureReasons: intentBindingClosed ? [] : ['bitcoin network intent does not bind to the same bundle and request surface']
    }),
    buildTheoremVerdict({
      theoremId: 'external_realization_execution.execution_closure',
      passed: executionClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['external-realization-execution.execution'],
      failureReasons: executionClosed ? [] : ['bitcoin network execution does not close over the declared intent and observation ids']
    }),
    buildTheoremVerdict({
      theoremId: 'external_realization_execution.observation_closure',
      passed: observationClosed && sidechainClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['external-realization-execution.observation'],
      failureReasons: observationClosed && sidechainClosed ? [] : ['network observation or sidechain receipt closure drifted from telemetry and mode policy']
    }),
    buildTheoremVerdict({
      theoremId: 'external_realization_execution.repeated_read_closure',
      passed: repeatedReadClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['external-realization-execution.repeated-read'],
      failureReasons: repeatedReadClosed ? [] : ['repeated-read invoice intent, processor execution, and payment observation failed to reconcile']
    }),
    buildTheoremVerdict({
      theoremId: 'external_realization_execution.mode_isolation_closure',
      passed: sameMode && externalExecutionPolicy.isolationDisposition === 'blocking-on-cross-mode-resource-reuse',
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['external-realization-execution.intent'],
      failureReasons: sameMode ? [] : ['external execution artifacts do not reconcile to one configured environment mode']
    })
  ];

  return {
    proofFamily: 'external-realization-execution',
    memberVerdicts: [
      { memberId: 'mainchain-intent-binding', passed: intentBindingClosed },
      { memberId: 'network-execution-binding', passed: executionClosed },
      { memberId: 'network-observation-binding', passed: observationClosed },
      { memberId: 'repeated-read-binding', passed: repeatedReadClosed },
      { memberId: 'sidechain-observation-binding', passed: sidechainClosed },
      { memberId: 'mode-isolation-closure', passed: sameMode }
    ],
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/external-environment-profile.json', role: 'environment-profile', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/external-execution-policy.json', role: 'execution-policy', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/external-telemetry-summary.json', role: 'telemetry-summary', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-network-intent.json', role: 'mainchain-intent', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-network-execution.json', role: 'mainchain-execution', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-network-observation.json', role: 'mainchain-observation', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/repeated-read-payment-intent.json', role: 'repeated-read-intent', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/repeated-read-payment-execution.json', role: 'repeated-read-execution', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/repeated-read-payment-observation.json', role: 'repeated-read-observation', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/sidechain-execution-receipt.json', role: 'sidechain-receipt', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allCasesPassed: intentBindingClosed && executionClosed && observationClosed && repeatedReadClosed && sidechainClosed && sameMode,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      configuredEnvironmentMode,
      intentRef: bitcoinNetworkIntent.intentRef,
      executionId: bitcoinNetworkExecution.executionId,
      observationId: bitcoinNetworkObservation.observationId,
      repeatedReadObservationId: repeatedReadPaymentObservation.observationId,
      sidechainModeApplicability: sidechainExecutionReceipt.modeApplicability
    })
  };
}

/**
 * @param {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   computeContainerManifest: Record<string, unknown>,
 *   computeContainerExecution: Record<string, unknown>,
 *   storageContainerManifest: Record<string, unknown>,
 *   storagePublicationReceipt: Record<string, unknown>,
 *   storageRetrievalReceipt: Record<string, unknown>
 * }} input
 */
export function buildV24ContainerRealityProof({
  externalEnvironmentProfile,
  computeContainerManifest,
  computeContainerExecution,
  storageContainerManifest,
  storagePublicationReceipt,
  storageRetrievalReceipt
}) {
  const witnessArtifactPaths = [
    '.bitcode/external-environment-profile.json',
    '.bitcode/compute-container-manifest.json',
    '.bitcode/compute-container-execution.json',
    '.bitcode/storage-container-manifest.json',
    '.bitcode/storage-publication-receipt.json',
    '.bitcode/storage-retrieval-receipt.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'containerized-reality.compute-execution',
      theoremIds: ['containerized_reality.compute_manifest_closure', 'containerized_reality.compute_attestation_closure'],
      requiredArtifactPaths: ['.bitcode/external-environment-profile.json', '.bitcode/compute-container-manifest.json', '.bitcode/compute-container-execution.json'],
      instruction: 'Replay compute container manifest closure and attestation binding.'
    }),
    buildReplayStep({
      stepId: 'containerized-reality.storage-publication',
      theoremIds: ['containerized_reality.storage_publication_closure'],
      requiredArtifactPaths: ['.bitcode/storage-container-manifest.json', '.bitcode/storage-publication-receipt.json'],
      instruction: 'Replay storage publication closure against the declared storage manifest.'
    }),
    buildReplayStep({
      stepId: 'containerized-reality.storage-retrieval',
      theoremIds: ['containerized_reality.storage_policy_closure'],
      requiredArtifactPaths: ['.bitcode/storage-container-manifest.json', '.bitcode/storage-retrieval-receipt.json'],
      instruction: 'Replay storage retrieval closure against the declared storage manifest.'
    })
  ];

  const configuredEnvironmentMode = externalEnvironmentProfile.configuredEnvironmentMode;
  const computeClosed = computeContainerManifest.configuredEnvironmentMode === configuredEnvironmentMode
    && computeContainerExecution.manifestRef === computeContainerManifest.manifestId
    && summarizeStrings(computeContainerExecution.outputArtifactRefs || []).length >= 1;
  const storagePublicationClosed = storageContainerManifest.configuredEnvironmentMode === configuredEnvironmentMode
    && storagePublicationReceipt.manifestRef === storageContainerManifest.manifestId
    && Number(storagePublicationReceipt.publishedArtifactCount || 0) >= 1;
  const storageRetrievalClosed = storageRetrievalReceipt.manifestRef === storageContainerManifest.manifestId
    && Number(storageRetrievalReceipt.retrievableArtifactCount || 0) === Number(storagePublicationReceipt.publishedArtifactCount || 0);

  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'containerized_reality.compute_manifest_closure',
      passed: computeClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['containerized-reality.compute-execution'],
      failureReasons: computeClosed ? [] : ['compute container manifest and execution do not reconcile']
    }),
    buildTheoremVerdict({
      theoremId: 'containerized_reality.compute_attestation_closure',
      passed: !!computeContainerExecution.attestationRef && !!computeContainerExecution.imageDigest,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['containerized-reality.compute-execution'],
      failureReasons: computeContainerExecution.attestationRef && computeContainerExecution.imageDigest ? [] : ['compute container execution is missing attestation or image digest']
    }),
    buildTheoremVerdict({
      theoremId: 'containerized_reality.storage_publication_closure',
      passed: storagePublicationClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['containerized-reality.storage-publication'],
      failureReasons: storagePublicationClosed ? [] : ['storage publication receipt does not reconcile to the storage manifest']
    }),
    buildTheoremVerdict({
      theoremId: 'containerized_reality.storage_policy_closure',
      passed: storageRetrievalClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['containerized-reality.storage-retrieval'],
      failureReasons: storageRetrievalClosed ? [] : ['storage retrieval receipt diverges from the publication contract']
    })
  ];

  return {
    proofFamily: 'containerized-reality',
    memberVerdicts: [
      { memberId: 'compute-manifest-binding', passed: computeClosed },
      { memberId: 'compute-attestation-binding', passed: !!computeContainerExecution.attestationRef && !!computeContainerExecution.imageDigest },
      { memberId: 'storage-manifest-binding', passed: storageContainerManifest.configuredEnvironmentMode === configuredEnvironmentMode },
      { memberId: 'storage-publication-binding', passed: storagePublicationClosed },
      { memberId: 'storage-retrieval-binding', passed: storageRetrievalClosed }
    ],
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/external-environment-profile.json', role: 'environment-profile', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/compute-container-manifest.json', role: 'compute-manifest', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/compute-container-execution.json', role: 'compute-execution', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/storage-container-manifest.json', role: 'storage-manifest', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/storage-publication-receipt.json', role: 'storage-publication', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/storage-retrieval-receipt.json', role: 'storage-retrieval', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allCasesPassed: computeClosed && storagePublicationClosed && storageRetrievalClosed,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      configuredEnvironmentMode,
      computeManifestRef: computeContainerManifest.manifestId,
      storageManifestRef: storageContainerManifest.manifestId,
      publicationReceiptId: storagePublicationReceipt.receiptId,
      retrievalReceiptId: storageRetrievalReceipt.receiptId
    })
  };
}

/**
 * @param {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   githubAppBinding: Record<string, unknown>,
 *   githubLiveSession: Record<string, unknown>,
 *   githubInventoryFetchReceipt: Record<string, unknown>,
 *   githubArtifactFetchReceipt: Record<string, unknown>,
 *   githubBranchPublicationReceipt: Record<string, unknown>,
 *   githubPrUpdateReceipt: Record<string, unknown>
 * }} input
 */
export function buildV24GithubLiveInterfaceProof({
  externalEnvironmentProfile,
  githubAppBinding,
  githubLiveSession,
  githubInventoryFetchReceipt,
  githubArtifactFetchReceipt,
  githubBranchPublicationReceipt,
  githubPrUpdateReceipt
}) {
  const witnessArtifactPaths = [
    '.bitcode/external-environment-profile.json',
    '.bitcode/github-app-binding.json',
    '.bitcode/github-live-session.json',
    '.bitcode/github-inventory-fetch-receipt.json',
    '.bitcode/github-artifact-fetch-receipt.json',
    '.bitcode/github-branch-publication-receipt.json',
    '.bitcode/github-pr-update-receipt.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'github-live-interface.session',
      theoremIds: ['github_live_interface.app_binding_closure', 'github_live_interface.session_closure', 'github_live_interface.mode_isolation_closure'],
      requiredArtifactPaths: ['.bitcode/external-environment-profile.json', '.bitcode/github-app-binding.json', '.bitcode/github-live-session.json'],
      instruction: 'Replay GitHub app binding and live session closure against the environment profile.'
    }),
    buildReplayStep({
      stepId: 'github-live-interface.fetch',
      theoremIds: ['github_live_interface.fetch_closure'],
      requiredArtifactPaths: ['.bitcode/github-live-session.json', '.bitcode/github-inventory-fetch-receipt.json', '.bitcode/github-artifact-fetch-receipt.json'],
      instruction: 'Replay GitHub inventory and artifact fetch closure against the live session.'
    }),
    buildReplayStep({
      stepId: 'github-live-interface.branch-publication',
      theoremIds: ['github_live_interface.mutation_closure'],
      requiredArtifactPaths: ['.bitcode/github-branch-publication-receipt.json', '.bitcode/github-pr-update-receipt.json'],
      instruction: 'Replay branch publication and PR update closure against the live session and bound repo.'
    })
  ];

  const configuredEnvironmentMode = externalEnvironmentProfile.configuredEnvironmentMode;
  const appBindingClosed = githubLiveSession.configuredEnvironmentMode === configuredEnvironmentMode
    && githubLiveSession.appRef === githubAppBinding.activeBinding?.appRef;
  const sessionClosed = !!githubLiveSession.authSessionId && !!githubLiveSession.authPayloadHash;
  const fetchClosed = githubInventoryFetchReceipt.sessionRef === githubLiveSession.sessionId
    && githubArtifactFetchReceipt.sessionRef === githubLiveSession.sessionId;
  const mutationClosed = githubBranchPublicationReceipt.sessionRef === githubLiveSession.sessionId
    && githubPrUpdateReceipt.sessionRef === githubLiveSession.sessionId
    && githubBranchPublicationReceipt.branchName === githubPrUpdateReceipt.branchName;

  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'github_live_interface.app_binding_closure',
      passed: appBindingClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['github-live-interface.session'],
      failureReasons: appBindingClosed ? [] : ['github app binding does not reconcile to the emitted live session']
    }),
    buildTheoremVerdict({
      theoremId: 'github_live_interface.session_closure',
      passed: sessionClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['github-live-interface.session'],
      failureReasons: sessionClosed ? [] : ['github live session is missing auth roots']
    }),
    buildTheoremVerdict({
      theoremId: 'github_live_interface.fetch_closure',
      passed: fetchClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['github-live-interface.fetch'],
      failureReasons: fetchClosed ? [] : ['github inventory or artifact fetch receipt diverges from the live session']
    }),
    buildTheoremVerdict({
      theoremId: 'github_live_interface.mutation_closure',
      passed: mutationClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['github-live-interface.branch-publication'],
      failureReasons: mutationClosed ? [] : ['GitHub mutation receipts do not reconcile to one session and branch']
    }),
    buildTheoremVerdict({
      theoremId: 'github_live_interface.mode_isolation_closure',
      passed: githubLiveSession.configuredEnvironmentMode === configuredEnvironmentMode,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['github-live-interface.session'],
      failureReasons: githubLiveSession.configuredEnvironmentMode === configuredEnvironmentMode ? [] : ['GitHub live interface drifted across environment modes']
    })
  ];

  return {
    proofFamily: 'github-live-interface',
    memberVerdicts: [
      { memberId: 'app-binding-closure', passed: appBindingClosed },
      { memberId: 'live-session-closure', passed: sessionClosed },
      { memberId: 'inventory-fetch-closure', passed: fetchClosed },
      { memberId: 'artifact-fetch-closure', passed: fetchClosed },
      { memberId: 'branch-publication-closure', passed: mutationClosed },
      { memberId: 'pr-mutation-closure', passed: mutationClosed }
    ],
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/external-environment-profile.json', role: 'environment-profile', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/github-app-binding.json', role: 'github-app-binding', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/github-live-session.json', role: 'github-live-session', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/github-inventory-fetch-receipt.json', role: 'github-inventory-fetch', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/github-artifact-fetch-receipt.json', role: 'github-artifact-fetch', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/github-branch-publication-receipt.json', role: 'github-branch-publication', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/github-pr-update-receipt.json', role: 'github-pr-update', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allCasesPassed: appBindingClosed && sessionClosed && fetchClosed && mutationClosed,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      configuredEnvironmentMode,
      sessionRef: githubLiveSession.sessionId,
      inventoryFetchRef: githubInventoryFetchReceipt.receiptId,
      artifactFetchRef: githubArtifactFetchReceipt.receiptId,
      branchPublicationRef: githubBranchPublicationReceipt.receiptId,
      prUpdateRef: githubPrUpdateReceipt.receiptId
    })
  };
}
