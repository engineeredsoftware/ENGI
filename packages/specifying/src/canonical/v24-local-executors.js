// @ts-check

import crypto from 'node:crypto';

export const V24_LOCAL_EXECUTOR_SCHEME = 'bitcode-local://';
export const V24_LOCAL_EXECUTOR_ROUTE_PREFIX = '/api/executors/';

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
 * @returns {Record<string, any>}
 */
function ensureRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? /** @type {Record<string, any>} */ (value) : {};
}

/**
 * @param {readonly unknown[]} values
 * @returns {string[]}
 */
function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {string} interfaceId
 * @returns {string}
 */
export function buildV24LocalExecutorUrl(interfaceId) {
  return `${V24_LOCAL_EXECUTOR_SCHEME}${interfaceId}`;
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function getV24LocalExecutorInterfaceId(value) {
  const normalized = String(value || '').trim();
  if (!normalized.startsWith(V24_LOCAL_EXECUTOR_SCHEME)) return null;
  const interfaceId = normalized.slice(V24_LOCAL_EXECUTOR_SCHEME.length).trim();
  return interfaceId || null;
}

/**
 * @param {unknown} pathname
 * @returns {string | null}
 */
export function getV24LocalExecutorInterfaceIdFromPath(pathname) {
  const normalized = String(pathname || '').trim();
  if (!normalized.startsWith(V24_LOCAL_EXECUTOR_ROUTE_PREFIX)) return null;
  const interfaceId = decodeURIComponent(normalized.slice(V24_LOCAL_EXECUTOR_ROUTE_PREFIX.length));
  return interfaceId || null;
}

/**
 * @param {Record<string, any>} payload
 * @param {Record<string, any>} overrides
 * @returns {Record<string, any>}
 */
function buildTelemetry(payload, overrides) {
  const binding = ensureRecord(payload.binding);
  const telemetry = ensureRecord(payload.telemetry);
  return {
    interfaceId: String(payload.interfaceId || ''),
    runtimeState: overrides.runtimeState || 'live-observed',
    resultClass: overrides.resultClass || 'live-demonstration-executed',
    reconciliationState: overrides.reconciliationState || 'live-demonstration-reconciled',
    telemetryCoverageState: overrides.telemetryCoverageState || 'shape-complete-live-observed',
    requestId: overrides.requestId || telemetry.requestId || `req_local_${shortId(`${payload.interfaceId}:${payload.branchName || payload.bundleId || 'default'}`, 16)}`,
    executionId: overrides.executionId || telemetry.executionId || `exec_local_${shortId(`${payload.interfaceId}:${payload.assetPackId || payload.readId || 'default'}`, 16)}`,
    observationId: overrides.observationId || telemetry.observationId || `obs_local_${shortId(`${payload.interfaceId}:${payload.paymentMode || payload.branchMode || 'default'}`, 16)}`,
    executionClass: overrides.executionClass || telemetry.executionClass || binding.executionClass || 'built-in-demonstration-adapter',
    environmentIdentityRef:
      overrides.environmentIdentityRef
      || telemetry.environmentIdentityRef
      || binding.accountRef
      || binding.executionIdentityRef
      || binding.appRef
      || null,
    environmentResourceRef:
      overrides.environmentResourceRef
      || telemetry.environmentResourceRef
      || binding.addressRef
      || binding.bucketRef
      || binding.namespaceRef
      || binding.installationTargetRef
      || null,
    affectedArtifactRefs: uniqueStrings([
      ...(telemetry.affectedArtifactRefs || []),
      ...(overrides.affectedArtifactRefs || [])
    ]),
    authMode: overrides.authMode || telemetry.authMode || binding.authMode || null,
    executorDisposition: 'built-in-demonstration-adapter',
    observationReality: 'deterministic-local-executor'
  };
}

/**
 * @param {Record<string, any>} payload
 * @returns {Record<string, any>}
 */
function bitcoinMainchainExecutor(payload) {
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const execution = ensureRecord(artifacts.bitcoinNetworkExecution);
  const observation = ensureRecord(artifacts.bitcoinNetworkObservation);
  const settlementObservation = ensureRecord(supportArtifacts.bitcoinSettlementObservation);
  const anchor = ensureRecord(supportArtifacts.bitcoinAnchor);
  const binding = ensureRecord(payload.binding);
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-mainchain-reconciled',
    affectedArtifactRefs: [
      '.bitcode/bitcoin-network-execution.json',
      '.bitcode/bitcoin-network-observation.json'
    ]
  });
  const networkRef = settlementObservation.networkRef || execution.networkRef || `btc://${binding.network || 'bitcoin-testnet4'}/${shortId(payload.bundleId || payload.readId || 'default', 16)}`;
  const anchorRef = anchor.anchorRef || observation.anchorRef || `anchor://${shortId(payload.bundleId || payload.branchName || 'default', 16)}`;
  return {
    interfaceId: String(payload.interfaceId || 'bitcoin-mainchain-execution'),
    telemetry,
    artifacts: {
      bitcoinNetworkExecution: {
        ...execution,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || execution.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || execution.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: 'live-network-broadcast-and-observed',
        networkRef,
        anchorRef,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs,
        broadcasterRef: `broadcaster://${binding.network || 'bitcoin-testnet4'}/${shortId(telemetry.executionId, 12)}`
      },
      bitcoinNetworkObservation: {
        ...observation,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || observation.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || observation.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        observationState: 'live-mainchain-confirmed',
        networkState: binding.network || settlementObservation.networkState || 'bitcoin-testnet4',
        confirmationState: 'confirmed',
        confirmations: payload.configuredEnvironmentMode === 'production' ? 6 : 2,
        networkRef,
        anchorRef,
        observedValue: observation.observedValue || settlementObservation.observedValue || payload.bundleId || null,
        journalBindingState: 'closed-over-settlement-and-journal',
        serviceReceipt: {
          serviceMode: 'v24-local-demonstration-executor',
          txid: `tx_${shortId(`${networkRef}:${telemetry.executionId}`, 16)}`,
          observedAtState: 'confirmed'
        },
        affectedArtifactRefs: telemetry.affectedArtifactRefs
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @returns {Record<string, any>}
 */
function repeatedReadPaymentExecutor(payload) {
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const priorIntent = ensureRecord(artifacts.repeatedReadPaymentIntent);
  const priorExecution = ensureRecord(artifacts.repeatedReadPaymentExecution);
  const priorObservation = ensureRecord(artifacts.repeatedReadPaymentObservation);
  const settlementIntent = ensureRecord(supportArtifacts.bitcoinSettlementIntent);
  const settlementObservation = ensureRecord(supportArtifacts.bitcoinSettlementObservation);
  const binding = ensureRecord(payload.binding);
  const invoiceRef =
    priorObservation.invoiceRef
    || priorExecution.invoiceRef
    || settlementIntent.paymentCarrier?.invoice
    || `ln-invoice://${shortId(`${payload.bundleId || payload.readId || 'default'}:${payload.branchName || 'branch'}`, 16)}`;
  const paymentHash =
    priorObservation.paymentHash
    || priorExecution.paymentHash
    || settlementIntent.paymentCarrier?.paymentHash
    || `sha256:${sha256(invoiceRef)}`;
  const descriptionHash =
    priorObservation.descriptionHash
    || priorExecution.descriptionHash
    || settlementIntent.paymentCarrier?.descriptionHash
    || `sha256:${sha256(`${invoiceRef}:description`)}`;
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-repeated-read-reconciled',
    affectedArtifactRefs: [
      '.bitcode/repeated-read-payment-intent.json',
      '.bitcode/repeated-read-payment-execution.json',
      '.bitcode/repeated-read-payment-observation.json'
    ]
  });
  return {
    interfaceId: String(payload.interfaceId || 'repeated-read-payment-execution'),
    telemetry,
    artifacts: {
      repeatedReadPaymentIntent: {
        ...priorIntent,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorIntent.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorIntent.actualityDisposition || null,
        requestId: telemetry.requestId,
        intentRef: priorIntent.intentRef || settlementIntent.intentId || null,
        processorRef: priorIntent.processorRef || binding.processorRef || null,
        invoiceEndpointRef: priorIntent.invoiceEndpointRef || binding.invoiceEndpointRef || null,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs
      },
      repeatedReadPaymentExecution: {
        ...priorExecution,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorExecution.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorExecution.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: priorIntent.modeApplicability === 'inactive-for-mode'
          ? 'inactive-for-mode'
          : 'live-lightning-invoice-issued',
        processorRef: priorExecution.processorRef || binding.processorRef || null,
        invoiceRef,
        paymentHash,
        descriptionHash,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs,
        serviceMode: 'v24-local-demonstration-executor'
      },
      repeatedReadPaymentObservation: {
        ...priorObservation,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorObservation.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorObservation.actualityDisposition || null,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        observationState: priorIntent.modeApplicability === 'inactive-for-mode'
          ? 'inactive-for-mode'
          : 'live-lightning-payment-observed',
        networkState: binding.network || settlementObservation.networkState || 'lightning-testnet',
        confirmationState: 'accepted-offchain',
        confirmations: 0,
        invoiceRef,
        paymentHash,
        descriptionHash,
        observedValue: priorObservation.observedValue || settlementObservation.observedValue || payload.bundleId || null,
        journalBindingState: 'anchor-required',
        serviceReceipt: {
          serviceMode: 'v24-local-demonstration-executor',
          referenceId: `lightning://${shortId(`${invoiceRef}:${telemetry.observationId}`, 20)}`,
          invoiceRef,
          paymentHash
        },
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @returns {Record<string, any>}
 */
function sidechainExecutor(payload) {
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const prior = ensureRecord(artifacts.sidechainExecutionReceipt);
  const settlementObservation = ensureRecord(supportArtifacts.bitcoinSettlementObservation);
  const binding = ensureRecord(payload.binding);
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-sidechain-reconciled',
    affectedArtifactRefs: ['.bitcode/sidechain-execution-receipt.json']
  });
  return {
    interfaceId: String(payload.interfaceId || 'sidechain-execution'),
    telemetry,
    artifacts: {
      sidechainExecutionReceipt: {
        ...prior,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || prior.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || prior.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: prior.modeApplicability === 'inactive-for-mode'
          ? 'inactive-for-mode'
          : 'live-sidechain-checkpoint-observed',
        checkpointRef: settlementObservation.networkRef || prior.checkpointRef || `sidechain-checkpoint://${shortId(payload.bundleId || payload.branchName || 'default', 16)}`,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs,
        checkpointObservationRef: `checkpoint-observation://${shortId(telemetry.observationId, 12)}`
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @returns {Record<string, any>}
 */
function computeExecutor(payload) {
  const artifacts = ensureRecord(payload.artifacts);
  const prior = ensureRecord(artifacts.computeContainerExecution);
  const manifest = ensureRecord(ensureRecord(payload.supportArtifacts).computeContainerManifest);
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-container-reconciled',
    affectedArtifactRefs: ['.bitcode/compute-container-execution.json']
  });
  return {
    interfaceId: String(payload.interfaceId || 'compute-container-execution'),
    telemetry,
    artifacts: {
      computeContainerExecution: {
        ...prior,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || prior.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || prior.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: 'live-container-executed',
        attestationRef: prior.attestationRef || `attest://${shortId(`${telemetry.executionId}:${manifest.manifestId || 'manifest'}`, 16)}`,
        imageDigest: prior.imageDigest || `sha256:${sha256(`${manifest.manifestId || 'manifest'}:${telemetry.executionId}`)}`,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        outputArtifactRefs: uniqueStrings(prior.outputArtifactRefs || manifest.proofArtifactRefs || []),
        affectedArtifactRefs: telemetry.affectedArtifactRefs
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @returns {Record<string, any>}
 */
function storageExecutor(payload) {
  const artifacts = ensureRecord(payload.artifacts);
  const priorPublication = ensureRecord(artifacts.storagePublicationReceipt);
  const priorRetrieval = ensureRecord(artifacts.storageRetrievalReceipt);
  const manifest = ensureRecord(ensureRecord(payload.supportArtifacts).storageContainerManifest);
  const publishedArtifactCount = Number(priorPublication.publishedArtifactCount || 0);
  const publishedScopeIds = uniqueStrings(priorPublication.publishedScopeIds || (manifest.scopeStorageBindings || []).map((entry) => entry.scopeId));
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-storage-reconciled',
    affectedArtifactRefs: [
      '.bitcode/storage-publication-receipt.json',
      '.bitcode/storage-retrieval-receipt.json'
    ]
  });
  return {
    interfaceId: String(payload.interfaceId || 'storage-container-execution'),
    telemetry,
    artifacts: {
      storagePublicationReceipt: {
        ...priorPublication,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorPublication.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorPublication.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        publicationState: 'live-storage-published',
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        publishedArtifactCount,
        publishedScopeIds,
        publicationReceiptRef: `storage-publication://${shortId(telemetry.executionId, 16)}`
      },
      storageRetrievalReceipt: {
        ...priorRetrieval,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorRetrieval.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorRetrieval.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        retrievalState: 'live-storage-retrieved',
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        retrievableArtifactCount: publishedArtifactCount,
        retrievableScopeIds: publishedScopeIds,
        retrievalReceiptRef: `storage-retrieval://${shortId(telemetry.observationId, 16)}`
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @returns {Record<string, any>}
 */
function githubExecutor(payload) {
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const priorSession = ensureRecord(artifacts.githubLiveSession);
  const priorInventory = ensureRecord(artifacts.githubInventoryFetchReceipt);
  const priorArtifact = ensureRecord(artifacts.githubArtifactFetchReceipt);
  const priorBranch = ensureRecord(artifacts.githubBranchPublicationReceipt);
  const priorPr = ensureRecord(artifacts.githubPrUpdateReceipt);
  const githubBinding = ensureRecord(supportArtifacts.githubAppBinding);
  const githubBoundary = ensureRecord(supportArtifacts.githubBoundarySurface);
  const selectedSession = ensureRecord((githubBoundary.selectedAuthSessions || [])[0]);
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-github-reconciled',
    affectedArtifactRefs: [
      '.bitcode/github-live-session.json',
      '.bitcode/github-inventory-fetch-receipt.json',
      '.bitcode/github-artifact-fetch-receipt.json',
      '.bitcode/github-branch-publication-receipt.json',
      '.bitcode/github-pr-update-receipt.json'
    ]
  });
  const sessionId = priorSession.sessionId || `session_${shortId(`${payload.branchName || 'branch'}:${payload.bundleId || 'bundle'}`, 16)}`;
  const branchName = priorBranch.branchName || String(payload.branchName || 'bitcode-v24-demo');
  return {
    interfaceId: String(payload.interfaceId || 'github-live-interface'),
    telemetry,
    artifacts: {
      githubLiveSession: {
        ...priorSession,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorSession.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorSession.actualityDisposition || null,
        sessionId,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        appRef: priorSession.appRef || githubBinding.activeBinding?.appRef || githubBinding.appRef || null,
        appId: priorSession.appId || githubBinding.activeBinding?.appId || githubBinding.appId || null,
        installationTargetRef:
          priorSession.installationTargetRef
          || githubBinding.activeBinding?.installationTargetRef
          || githubBinding.installationTargetRef
          || null,
        authSessionId: priorSession.authSessionId || selectedSession.authSessionId || `auth_${shortId(sessionId, 12)}`,
        authPayloadHash: priorSession.authPayloadHash || selectedSession.authPayloadHash || `sha256:${sha256(sessionId)}`,
        permissionsRoot: priorSession.permissionsRoot || selectedSession.permissionsRoot || `perm_${shortId(`${sessionId}:permissions`, 12)}`
      },
      githubInventoryFetchReceipt: {
        ...priorInventory,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorInventory.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorInventory.actualityDisposition || null,
        sessionRef: sessionId,
        fetchState: 'live-github-inventory-fetched',
        targetedRepoCount: Number(priorInventory.targetedRepoCount || githubBinding.targetedRepoCount || 0),
        selectedBindingCount: Number(priorInventory.selectedBindingCount || (githubBoundary.selectedInventoryProofs || []).length || 0)
      },
      githubArtifactFetchReceipt: {
        ...priorArtifact,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorArtifact.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorArtifact.actualityDisposition || null,
        sessionRef: sessionId,
        fetchState: 'live-github-artifact-fetched'
      },
      githubBranchPublicationReceipt: {
        ...priorBranch,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorBranch.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorBranch.actualityDisposition || null,
        sessionRef: sessionId,
        mutationState: 'live-github-branch-published',
        branchName,
        targetRepo: priorBranch.targetRepo || priorSession.repo || String(payload.binding?.targetedRepos?.[0]?.repo || 'frontier/demo-auth')
      },
      githubPrUpdateReceipt: {
        ...priorPr,
        configuredEnvironmentMode: payload.configuredEnvironmentMode || priorPr.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || priorPr.actualityDisposition || null,
        sessionRef: sessionId,
        mutationState: 'live-github-pr-updated',
        branchName,
        targetRepo: priorPr.targetRepo || priorBranch.targetRepo || priorSession.repo || String(payload.binding?.targetedRepos?.[0]?.repo || 'frontier/demo-auth'),
        prNumber: priorPr.prNumber || 24,
        reviewUpdateState: 'demo-pr-updated'
      }
    }
  };
}

export const V24_LOCAL_EXECUTOR_HANDLERS = {
  'bitcoin-mainchain-execution': bitcoinMainchainExecutor,
  'repeated-read-payment-execution': repeatedReadPaymentExecutor,
  'sidechain-execution': sidechainExecutor,
  'compute-container-execution': computeExecutor,
  'storage-container-execution': storageExecutor,
  'github-live-interface': githubExecutor
};

/**
 * @returns {Record<string, (payload: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>>}
 */
export function buildV24LocalExecutorHandlers() {
  return { ...V24_LOCAL_EXECUTOR_HANDLERS };
}

/**
 * @param {string} interfaceId
 * @param {Record<string, any>} payload
 * @returns {Promise<Record<string, any>>}
 */
export async function executeV24LocalExecutor(interfaceId, payload) {
  const handler = V24_LOCAL_EXECUTOR_HANDLERS[interfaceId];
  if (typeof handler !== 'function') {
    throw new Error(`Unsupported V24 local executor interface: ${interfaceId}`);
  }
  return ensureRecord(await handler(payload));
}
