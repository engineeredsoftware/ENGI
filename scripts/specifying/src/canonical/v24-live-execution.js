// @ts-check

import {
  buildV24ExternalRealizationProof,
  buildV24ContainerRealityProof,
  buildV24GithubLiveInterfaceProof
} from './v24-external-execution.js';
import { buildSystemProofBundle } from './run-artifacts.js';
import { getV24LocalExecutorInterfaceId } from './v24-local-executors.js';
import { executeV24RemoteAdapter } from './v24-remote-adapters.js';
import { buildProofWitnessManifest } from './proof-materialization.js';
import { buildProofContract } from '../bitcode-demo.js';

const V24_INTERFACE_ORDER = [
  'bitcoin-mainchain-execution',
  'repeated-read-payment-execution',
  'sidechain-execution',
  'compute-container-execution',
  'storage-container-execution',
  'github-live-interface'
];

const V24_ACTIVE_BINDING_KEY_BY_INTERFACE = {
  'bitcoin-mainchain-execution': 'bitcoinMainchain',
  'repeated-read-payment-execution': 'repeatedReadPayment',
  'sidechain-execution': 'sidechain',
  'compute-container-execution': 'compute',
  'storage-container-execution': 'storage',
  'github-live-interface': 'github'
};

const V24_BRANCH_ARTIFACT_PATH_BY_KEY = {
  externalEnvironmentProfile: '.bitcode/external-environment-profile.json',
  externalTelemetrySummary: '.bitcode/external-telemetry-summary.json',
  externalExecutionLedger: '.bitcode/external-execution-ledger.json',
  externalReconciliationLog: '.bitcode/external-reconciliation-log.json',
  bitcoinNetworkIntent: '.bitcode/bitcoin-network-intent.json',
  bitcoinNetworkExecution: '.bitcode/bitcoin-network-execution.json',
  bitcoinNetworkObservation: '.bitcode/bitcoin-network-observation.json',
  repeatedReadPaymentIntent: '.bitcode/repeated-read-payment-intent.json',
  repeatedReadPaymentExecution: '.bitcode/repeated-read-payment-execution.json',
  repeatedReadPaymentObservation: '.bitcode/repeated-read-payment-observation.json',
  sidechainExecutionReceipt: '.bitcode/sidechain-execution-receipt.json',
  computeContainerManifest: '.bitcode/compute-container-manifest.json',
  computeContainerExecution: '.bitcode/compute-container-execution.json',
  storageContainerManifest: '.bitcode/storage-container-manifest.json',
  storagePublicationReceipt: '.bitcode/storage-publication-receipt.json',
  storageRetrievalReceipt: '.bitcode/storage-retrieval-receipt.json',
  githubAppBinding: '.bitcode/github-app-binding.json',
  githubLiveSession: '.bitcode/github-live-session.json',
  githubInventoryFetchReceipt: '.bitcode/github-inventory-fetch-receipt.json',
  githubArtifactFetchReceipt: '.bitcode/github-artifact-fetch-receipt.json',
  githubBranchPublicationReceipt: '.bitcode/github-branch-publication-receipt.json',
  githubPrUpdateReceipt: '.bitcode/github-pr-update-receipt.json',
  externalBoundaryManifest: '.bitcode/external-boundary-manifest.json',
  assetPackEvidenceManifest: '.bitcode/asset-pack-evidence.json',
  systemProofBundle: '.bitcode/system-proof-bundle.json',
  proofWitnessManifest: '.bitcode/proof-witness-manifest.json',
  proofContract: '.bitcode/proof-contract.json',
  externalRealizationProof: '.bitcode/external-realization-proof.json',
  containerRealityProof: '.bitcode/container-reality-proof.json',
  githubLiveInterfaceProof: '.bitcode/github-live-interface-proof.json'
};

const V24_RECONCILIATION_ARTIFACT_PATHS = [
  '.bitcode/external-execution-ledger.json',
  '.bitcode/external-reconciliation-log.json'
];

const V24_SUPPORT_ARTIFACT_KEYS_BY_INTERFACE = {
  'bitcoin-mainchain-execution': [
    'bitcoinNetworkIntent',
    'bitcoinSettlementIntent',
    'bitcoinSettlementObservation',
    'bitcoinAnchor',
    'bitcoinTreasuryPolicy'
  ],
  'repeated-read-payment-execution': [
    'repeatedReadPaymentIntent',
    'bitcoinSettlementIntent',
    'bitcoinSettlementObservation',
    'bitcoinTreasuryPolicy'
  ],
  'sidechain-execution': [
    'sidechainExecutionReceipt',
    'bitcoinSettlementIntent',
    'bitcoinSettlementObservation',
    'bitcoinTreasuryPolicy'
  ],
  'compute-container-execution': [
    'computeContainerManifest',
    'computeRealityManifest'
  ],
  'storage-container-execution': [
    'storageContainerManifest',
    'storageRealityManifest'
  ],
  'github-live-interface': [
    'githubAppBinding',
    'githubBoundarySurface'
  ]
};

const V24_ALLOWED_ARTIFACT_KEYS_BY_INTERFACE = {
  'bitcoin-mainchain-execution': [
    'bitcoinNetworkExecution',
    'bitcoinNetworkObservation'
  ],
  'repeated-read-payment-execution': [
    'repeatedReadPaymentIntent',
    'repeatedReadPaymentExecution',
    'repeatedReadPaymentObservation'
  ],
  'sidechain-execution': [
    'sidechainExecutionReceipt'
  ],
  'compute-container-execution': [
    'computeContainerExecution'
  ],
  'storage-container-execution': [
    'storagePublicationReceipt',
    'storageRetrievalReceipt'
  ],
  'github-live-interface': [
    'githubLiveSession',
    'githubInventoryFetchReceipt',
    'githubArtifactFetchReceipt',
    'githubBranchPublicationReceipt',
    'githubPrUpdateReceipt'
  ]
};

/**
 * @param {unknown} value
 * @returns {any}
 */
function cloneValue(value) {
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
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
 * @param {Record<string, any>} latestRun
 * @param {string} interfaceId
 * @returns {Record<string, any>}
 */
function activeBinding(latestRun, interfaceId) {
  const activeBindings = ensureRecord(latestRun.externalEnvironmentProfile?.activeBindings);
  return ensureRecord(activeBindings[V24_ACTIVE_BINDING_KEY_BY_INTERFACE[interfaceId]]);
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} interfaceId
 * @returns {Record<string, any>}
 */
function interfaceSummary(latestRun, interfaceId) {
  const summaries = /** @type {Array<Record<string, any>>} */ (latestRun.externalTelemetrySummary?.interfaceSummaries || []);
  return summaries.find((entry) => entry.interfaceId === interfaceId) || {};
}

/**
 * @param {Record<string, any> | null | undefined} latestRun
 * @returns {string | null}
 */
function buildRunRef(latestRun) {
  if (!latestRun) return null;
  const createdAt = String(latestRun.createdAt || '').trim();
  const scenarioId = String(latestRun.scenarioId || '').trim();
  const branchName = String(latestRun.branchArtifacts?.branchName || '').trim();
  if (!createdAt && !scenarioId && !branchName) return null;
  const refSource = [createdAt, scenarioId, branchName].filter(Boolean).join(':') || 'run';
  return `v24_run_${refSource}`;
}

/**
 * @param {Record<string, any> | null | undefined} latestRun
 * @param {string} interfaceId
 * @returns {string | null}
 */
function continuityRef(latestRun, interfaceId) {
  if (!latestRun) return null;
  if (interfaceId === 'bitcoin-mainchain-execution') {
    return String(
      latestRun.bitcoinNetworkObservation?.serviceReceipt?.txid
      || latestRun.bitcoinNetworkObservation?.anchorRef
      || latestRun.bitcoinNetworkExecution?.networkRef
      || ''
    ).trim() || null;
  }
  if (interfaceId === 'sidechain-execution') {
    return String(
      latestRun.sidechainExecutionReceipt?.checkpointObservationRef
      || latestRun.sidechainExecutionReceipt?.checkpointRef
      || ''
    ).trim() || null;
  }
  if (interfaceId === 'repeated-read-payment-execution') {
    return String(
      latestRun.repeatedReadPaymentObservation?.serviceReceipt?.referenceId
      || latestRun.repeatedReadPaymentObservation?.invoiceRef
      || latestRun.repeatedReadPaymentExecution?.paymentHash
      || ''
    ).trim() || null;
  }
  if (interfaceId === 'compute-container-execution') {
    return String(
      latestRun.computeContainerExecution?.remoteRunId
      || latestRun.computeContainerExecution?.attestationRef
      || latestRun.computeContainerExecution?.imageDigest
      || ''
    ).trim() || null;
  }
  if (interfaceId === 'storage-container-execution') {
    return String(
      latestRun.storagePublicationReceipt?.publicationReceiptRef
      || latestRun.storageRetrievalReceipt?.retrievalReceiptRef
      || ''
    ).trim() || null;
  }
  if (interfaceId === 'github-live-interface') {
    const targetRepo = String(
      latestRun.githubPrUpdateReceipt?.targetRepo
      || latestRun.githubBranchPublicationReceipt?.targetRepo
      || ''
    ).trim();
    const prNumber = Number(latestRun.githubPrUpdateReceipt?.prNumber || 0);
    if (targetRepo && prNumber > 0) return `${targetRepo}#${prNumber}`;
    const branchName = String(latestRun.githubBranchPublicationReceipt?.branchName || '').trim();
    if (targetRepo && branchName) return `${targetRepo}:${branchName}`;
    return String(latestRun.githubLiveSession?.sessionId || '').trim() || null;
  }
  return null;
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} interfaceId
 * @returns {boolean}
 */
function interfaceApplicable(latestRun, interfaceId) {
  if (interfaceId === 'bitcoin-mainchain-execution') {
    return String(latestRun.bitcoinNetworkIntent?.modeApplicability || '') === 'active';
  }
  if (interfaceId === 'repeated-read-payment-execution') {
    return String(latestRun.repeatedReadPaymentIntent?.modeApplicability || '') === 'active';
  }
  if (interfaceId === 'sidechain-execution') {
    return String(latestRun.sidechainExecutionReceipt?.modeApplicability || '') === 'active';
  }
  return true;
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} interfaceId
 * @returns {Record<string, any>}
 */
function buildExecutionRequestPayload(latestRun, interfaceId) {
  const binding = activeBinding(latestRun, interfaceId);
  const telemetry = interfaceSummary(latestRun, interfaceId);
  const artifactKeys = V24_ALLOWED_ARTIFACT_KEYS_BY_INTERFACE[interfaceId] || [];
  const artifacts = Object.fromEntries(
    artifactKeys
      .filter((key) => latestRun[key])
      .map((key) => [key, cloneValue(latestRun[key])])
  );
  const supportArtifactKeys = V24_SUPPORT_ARTIFACT_KEYS_BY_INTERFACE[interfaceId] || [];
  const supportArtifacts = Object.fromEntries(
    supportArtifactKeys
      .filter((key) => latestRun[key])
      .map((key) => [key, cloneValue(latestRun[key])])
  );
  return {
    interfaceId,
    configuredEnvironmentMode: latestRun.externalEnvironmentProfile?.configuredEnvironmentMode || null,
    actualityDisposition: latestRun.externalEnvironmentProfile?.actualityDisposition || null,
    scenarioId: latestRun.scenarioId || null,
    branchName: latestRun.branchArtifacts?.branchName || null,
    branchMode: latestRun.branchMode || null,
    paymentMode: latestRun.paymentMode || null,
    readId: latestRun.read?.readId || latestRun.readMeasurement?.readId || null,
    bundleId: latestRun.settlementPreview?.bundleId || null,
    assetPackId: latestRun.assetPack?.assetPackId || null,
    runtimeState: telemetry.runtimeState || null,
    binding,
    telemetry,
    artifacts,
    supportArtifacts
  };
}

/**
 * @param {string} executorUrl
 * @param {Record<string, any>} payload
 * @param {Record<string, any>} binding
 * @param {typeof fetch} fetchImpl
 * @param {Record<string, (payload: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>>} executorHandlers
 * @returns {Promise<Record<string, any>>}
 */
async function callExecutor(executorUrl, payload, binding, fetchImpl, executorHandlers) {
  const localExecutorInterfaceId = getV24LocalExecutorInterfaceId(executorUrl);
  if (localExecutorInterfaceId) {
    const handler =
      executorHandlers[localExecutorInterfaceId]
      || executorHandlers[payload.interfaceId]
      || executorHandlers[executorUrl];
    if (typeof handler !== 'function') {
      throw new Error(`V24 local executor handler missing for ${payload.interfaceId}.`);
    }
    return ensureRecord(await handler(payload));
  }
  if (binding?.executorKind && binding.executorKind !== 'http-json-patch') {
    return ensureRecord(await executeV24RemoteAdapter(payload.interfaceId, binding, payload, fetchImpl));
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetchImpl(executorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`V24 external executor ${payload.interfaceId} failed with ${response.status}.`);
    }
    return ensureRecord(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * @param {string} interfaceId
 * @param {Record<string, any>} response
 * @returns {{ artifacts: Record<string, any>, telemetry: Record<string, any> }}
 */
function validateExecutorResponse(interfaceId, response) {
  const responseInterfaceId = String(response.interfaceId || interfaceId);
  if (responseInterfaceId !== interfaceId) {
    throw new Error(`V24 external executor returned interface drift for ${interfaceId}.`);
  }
  const artifacts = ensureRecord(response.artifacts);
  const telemetry = ensureRecord(response.telemetry);
  const allowedArtifactKeys = new Set(V24_ALLOWED_ARTIFACT_KEYS_BY_INTERFACE[interfaceId] || []);
  const artifactKeys = Object.keys(artifacts);
  if (!artifactKeys.length) {
    throw new Error(`V24 external executor returned no artifact patches for ${interfaceId}.`);
  }
  for (const key of artifactKeys) {
    if (!allowedArtifactKeys.has(key)) {
      throw new Error(`V24 external executor returned unsupported artifact patch ${key} for ${interfaceId}.`);
    }
  }
  if (!Object.keys(telemetry).length) {
    throw new Error(`V24 external executor returned no telemetry patch for ${interfaceId}.`);
  }
  return { artifacts, telemetry };
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} key
 * @param {unknown} value
 * @returns {void}
 */
function patchArtifact(latestRun, key, value) {
  latestRun[key] = cloneValue(value);
  const artifactPath = V24_BRANCH_ARTIFACT_PATH_BY_KEY[key];
  if (artifactPath && latestRun.branchArtifacts?.files) {
    latestRun.branchArtifacts.files[artifactPath] = JSON.stringify(latestRun[key], null, 2);
  }
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} interfaceId
 * @param {Record<string, any>} telemetryPatch
 * @param {string[]} patchedArtifactPaths
 * @returns {void}
 */
function patchInterfaceTelemetry(latestRun, interfaceId, telemetryPatch, patchedArtifactPaths) {
  const summaries = /** @type {Array<Record<string, any>>} */ (latestRun.externalTelemetrySummary?.interfaceSummaries || []);
  const index = summaries.findIndex((entry) => entry.interfaceId === interfaceId);
  if (index < 0) {
    throw new Error(`V24 external telemetry summary missing interface ${interfaceId}.`);
  }
  const prior = summaries[index];
  const binding = activeBinding(latestRun, interfaceId);
  const merged = {
    ...prior,
    ...telemetryPatch,
    interfaceId,
    runtimeState: telemetryPatch.runtimeState || 'live-observed',
    resultClass: telemetryPatch.resultClass || prior.resultClass || 'live-executed',
    reconciliationState: telemetryPatch.reconciliationState || prior.reconciliationState || 'live-remote-reconciled',
    telemetryCoverageState: telemetryPatch.telemetryCoverageState || prior.telemetryCoverageState || 'shape-complete-live-observed',
    executionClass: telemetryPatch.executionClass || prior.executionClass || binding.executionClass || null,
    requestId: telemetryPatch.requestId || prior.requestId || null,
    executionId: telemetryPatch.executionId || prior.executionId || null,
    observationId: telemetryPatch.observationId || prior.observationId || null,
    environmentIdentityRef:
      telemetryPatch.environmentIdentityRef
      || prior.environmentIdentityRef
      || binding.accountRef
      || binding.executionIdentityRef
      || binding.appRef
      || null,
    environmentResourceRef:
      telemetryPatch.environmentResourceRef
      || prior.environmentResourceRef
      || binding.addressRef
      || binding.bucketRef
      || binding.namespaceRef
      || binding.installationTargetRef
      || null,
    affectedArtifactRefs: uniqueStrings([
      ...(prior.affectedArtifactRefs || []),
      ...(telemetryPatch.affectedArtifactRefs || []),
      ...patchedArtifactPaths
    ])
  };
  summaries[index] = merged;
  latestRun.externalTelemetrySummary.interfaceSummaries = summaries;
  patchArtifact(latestRun, 'externalTelemetrySummary', latestRun.externalTelemetrySummary);
  if (interfaceId === 'github-live-interface' && latestRun.githubAppBinding) {
    latestRun.githubAppBinding.runtimeState = merged.runtimeState;
    patchArtifact(latestRun, 'githubAppBinding', latestRun.githubAppBinding);
  }
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} interfaceId
 * @param {Record<string, any>} telemetryPatch
 * @returns {void}
 */
function patchEnvironmentRuntimeState(latestRun, interfaceId, telemetryPatch) {
  if (!latestRun.externalEnvironmentProfile) return;
  const activeRuntimeStates = /** @type {Array<Record<string, any>>} */ (latestRun.externalEnvironmentProfile.activeRuntimeStates || []);
  const runtimeState = telemetryPatch.runtimeState || 'live-observed';
  const missingBindingKeys = uniqueStrings(telemetryPatch.missingBindingKeys || []);
  const nextEntry = {
    ...ensureRecord(latestRun.externalEnvironmentProfile.interfaceRuntimeStateById?.[interfaceId]),
    ...ensureRecord(telemetryPatch),
    interfaceId,
    runtimeState,
    liveEnabled: true,
    missingBindingKeys,
    resultClass:
      telemetryPatch.resultClass
      || ensureRecord(latestRun.externalEnvironmentProfile.interfaceRuntimeStateById?.[interfaceId]).resultClass
      || 'live-executed',
    reconciliationState:
      telemetryPatch.reconciliationState
      || ensureRecord(latestRun.externalEnvironmentProfile.interfaceRuntimeStateById?.[interfaceId]).reconciliationState
      || 'live-remote-reconciled',
    telemetryCoverageState:
      telemetryPatch.telemetryCoverageState
      || ensureRecord(latestRun.externalEnvironmentProfile.interfaceRuntimeStateById?.[interfaceId]).telemetryCoverageState
      || 'shape-complete-live-observed'
  };
  const entryIndex = activeRuntimeStates.findIndex((entry) => entry.interfaceId === interfaceId);
  if (entryIndex >= 0) {
    activeRuntimeStates[entryIndex] = nextEntry;
  } else {
    activeRuntimeStates.push(nextEntry);
  }
  latestRun.externalEnvironmentProfile.activeRuntimeStates = activeRuntimeStates;
  latestRun.externalEnvironmentProfile.interfaceRuntimeStateById = {
    ...ensureRecord(latestRun.externalEnvironmentProfile.interfaceRuntimeStateById),
    [interfaceId]: nextEntry
  };
  patchArtifact(latestRun, 'externalEnvironmentProfile', latestRun.externalEnvironmentProfile);
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {void}
 */
function rebuildV24Proofs(latestRun) {
  latestRun.externalRealizationProof = buildV24ExternalRealizationProof({
    externalEnvironmentProfile: latestRun.externalEnvironmentProfile,
    externalExecutionPolicy: latestRun.externalExecutionPolicy,
    externalTelemetrySummary: latestRun.externalTelemetrySummary,
    bitcoinNetworkIntent: latestRun.bitcoinNetworkIntent,
    bitcoinNetworkExecution: latestRun.bitcoinNetworkExecution,
    bitcoinNetworkObservation: latestRun.bitcoinNetworkObservation,
    repeatedReadPaymentIntent: latestRun.repeatedReadPaymentIntent,
    repeatedReadPaymentExecution: latestRun.repeatedReadPaymentExecution,
    repeatedReadPaymentObservation: latestRun.repeatedReadPaymentObservation,
    sidechainExecutionReceipt: latestRun.sidechainExecutionReceipt
  });
  latestRun.containerRealityProof = buildV24ContainerRealityProof({
    externalEnvironmentProfile: latestRun.externalEnvironmentProfile,
    computeContainerManifest: latestRun.computeContainerManifest,
    computeContainerExecution: latestRun.computeContainerExecution,
    storageContainerManifest: latestRun.storageContainerManifest,
    storagePublicationReceipt: latestRun.storagePublicationReceipt,
    storageRetrievalReceipt: latestRun.storageRetrievalReceipt
  });
  latestRun.githubLiveInterfaceProof = buildV24GithubLiveInterfaceProof({
    externalEnvironmentProfile: latestRun.externalEnvironmentProfile,
    githubAppBinding: latestRun.githubAppBinding,
    githubLiveSession: latestRun.githubLiveSession,
    githubInventoryFetchReceipt: latestRun.githubInventoryFetchReceipt,
    githubArtifactFetchReceipt: latestRun.githubArtifactFetchReceipt,
    githubBranchPublicationReceipt: latestRun.githubBranchPublicationReceipt,
    githubPrUpdateReceipt: latestRun.githubPrUpdateReceipt
  });
  patchArtifact(latestRun, 'externalRealizationProof', latestRun.externalRealizationProof);
  patchArtifact(latestRun, 'containerRealityProof', latestRun.containerRealityProof);
  patchArtifact(latestRun, 'githubLiveInterfaceProof', latestRun.githubLiveInterfaceProof);
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {void}
 */
function refreshExternalBoundaryManifest(latestRun) {
  if (!latestRun.externalBoundaryManifest || !Array.isArray(latestRun.externalBoundaryManifest.interfaces)) return;
  const configuredEnvironmentMode = latestRun.externalEnvironmentProfile?.configuredEnvironmentMode || null;
  const actualityDisposition = latestRun.externalEnvironmentProfile?.actualityDisposition || null;
  latestRun.externalBoundaryManifest.configuredEnvironmentMode = configuredEnvironmentMode;
  latestRun.externalBoundaryManifest.actualityDisposition = actualityDisposition;
  latestRun.externalBoundaryManifest.interfaces = latestRun.externalBoundaryManifest.interfaces.map((entry) => {
    const interfaceId = String(entry.interfaceId || '');
    if (!V24_INTERFACE_ORDER.includes(interfaceId)) return entry;
    const summary = interfaceSummary(latestRun, interfaceId);
    const binding = activeBinding(latestRun, interfaceId);
    const runtimeState = summary.runtimeState || latestRun.externalEnvironmentProfile?.interfaceRuntimeStateById?.[interfaceId]?.runtimeState || null;
    return {
      ...entry,
      status:
        runtimeState === 'live-observed'
          ? 'implemented-as-live-observed-surface'
          : runtimeState === 'live-configured'
            ? 'implemented-as-live-configured-surface'
            : entry.status,
      localPrototype: {
        ...ensureRecord(entry.localPrototype),
        configuredEnvironmentMode,
        actualityDisposition,
        runtimeState,
        executorKind: binding.executorKind || ensureRecord(entry.localPrototype).executorKind || null,
        transportProtocol: summary.transportProtocol || binding.transportProtocol || ensureRecord(entry.localPrototype).transportProtocol || null,
        executionClass: summary.executionClass || ensureRecord(entry.localPrototype).executionClass || null,
        reconciliationState: summary.reconciliationState || ensureRecord(entry.localPrototype).reconciliationState || null,
        telemetryCoverageState: summary.telemetryCoverageState || ensureRecord(entry.localPrototype).telemetryCoverageState || null,
        continuityState: summary.continuityState || ensureRecord(entry.localPrototype).continuityState || null,
        observationSequence: summary.observationSequence || ensureRecord(entry.localPrototype).observationSequence || null
      }
    };
  });
  patchArtifact(latestRun, 'externalBoundaryManifest', latestRun.externalBoundaryManifest);
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {void}
 */
function augmentV24DeliverablesManifest(latestRun) {
  if (!latestRun.assetPackEvidenceManifest || !Array.isArray(latestRun.assetPackEvidenceManifest.assetPackEvidence)) return;
  const assetPackEvidence = latestRun.assetPackEvidenceManifest.assetPackEvidence;
  const byPath = new Map(assetPackEvidence.map((entry) => [String(entry.path || ''), entry]));
  const requiredEntries = [
    latestRun.externalExecutionLedger
      ? {
          path: '.bitcode/external-execution-ledger.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-environment-profile', 'external-telemetry-summary', 'external-realization-proof']
        }
      : null,
    latestRun.externalReconciliationLog
      ? {
          path: '.bitcode/external-reconciliation-log.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-execution-ledger', 'external-telemetry-summary', 'proof-contract']
        }
      : null
  ].filter(Boolean);

  for (const entry of requiredEntries) {
    if (!byPath.has(entry.path)) {
      assetPackEvidence.push(entry);
      byPath.set(entry.path, entry);
      continue;
    }
    const current = byPath.get(entry.path);
    current.useTiersContributed = uniqueStrings([
      ...(current.useTiersContributed || []),
      ...(entry.useTiersContributed || [])
    ]);
    current.confidentialityClass = entry.confidentialityClass;
    current.potentiallyDisclosable = entry.potentiallyDisclosable;
    current.dependsOn = uniqueStrings([
      ...(current.dependsOn || []),
      ...(entry.dependsOn || [])
    ]);
  }

  latestRun.assetPackEvidenceManifest.assetPackEvidence = assetPackEvidence.slice().sort((left, right) =>
    String(left.path || '').localeCompare(String(right.path || ''))
  );
  patchArtifact(latestRun, 'assetPackEvidenceManifest', latestRun.assetPackEvidenceManifest);
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {Array<Record<string, any>>}
 */
function selectedCandidatesForProofContract(latestRun) {
  const selectedAssetIds = uniqueStrings(
    latestRun.assetPack?.selectedAssets
    || (latestRun.selectedSourceMaterialManifest?.selectedSourceMaterial || []).map((entry) => entry.assetId)
  );
  return selectedAssetIds.map((assetId) => ({
    assetId,
    asset: {
      contentRoot: null,
      attestations: [{}]
    }
  }));
}

/**
 * @param {Record<string, any>} latestRun
 * @param {string} artifactPath
 * @returns {Record<string, any>}
 */
function parsedBranchArtifact(latestRun, artifactPath) {
  const payload = String(latestRun.branchArtifacts?.files?.[artifactPath] || '').trim();
  if (!payload) return {};
  try {
    return ensureRecord(JSON.parse(payload));
  } catch {
    return {};
  }
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {Record<string, any>}
 */
function buildProofWitnessManifestForLatestRun(latestRun) {
  const settlementProof = latestRun.settlementProof || parsedBranchArtifact(latestRun, '.bitcode/settlement-proof.json');
  return buildProofWitnessManifest({
    inferenceProofs: latestRun.inferenceProofs,
    inferenceSynthesisProof: latestRun.inferenceSynthesisProof,
    promptFamilyRegistry: latestRun.promptFamilyRegistry,
    inferenceMomentContracts: latestRun.inferenceMomentContracts,
    promptSurfaces: latestRun.promptSurfaces,
    promptContracts: latestRun.promptContracts,
    promptImplementationSurface: latestRun.promptImplementationSurface,
    promptCompletenessProof: latestRun.promptCompletenessProof,
    parsedCompletionEnvelopes: latestRun.parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact: latestRun.parsedCompletionEnvelopeArtifact,
    evalManifest: latestRun.evalManifest,
    assetPackLock: latestRun.assetPackLock,
    selectedSourceMaterialManifest: latestRun.selectedSourceMaterialManifest,
    codeAnalysisFactRegistry: latestRun.codeAnalysisFactRegistry,
    staticHeuristicsRegistry: latestRun.staticHeuristicsRegistry,
    measurementReceipts: latestRun.measurementReceipts,
    staticMeasurementReport: latestRun.staticMeasurementReport,
    staticMeasurementProof: latestRun.staticMeasurementProof,
    verificationReport: latestRun.verificationReport,
    verificationReceiptsArtifact: latestRun.verificationReceipts,
    verificationDecisionsProof: latestRun.verificationDecisionsProof,
    identityBindings: latestRun.identityBindings,
    authorizationDecisions: latestRun.authorizationDecisions || [],
    sensitiveDataFlowRecords: latestRun.sensitiveDataFlowRecords || [],
    selectionConsistencyProof: latestRun.selectionConsistencyProof,
    selectionAndMaterializationProof: latestRun.selectionAndMaterializationProof,
    journalCompletenessProof: latestRun.journalCompletenessProof,
    identityAuthorizationProof: latestRun.identityAuthorizationProof,
    sensitiveDataFlowProof: latestRun.sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof: latestRun.authorizationAndSensitiveFlowProof,
    materializationProof: latestRun.materializationProof,
    materializationExclusions: latestRun.materializationExclusions,
    materializationVisibilityProof: latestRun.materializationVisibilityProof,
    settlementPreview: latestRun.settlementPreview,
    sourceToSharesArtifact: latestRun.sourceToSharesArtifact,
    settlementParticipationArtifact: latestRun.settlementParticipationArtifact,
    accountingPrecisionReport: latestRun.accountingPrecisionReport,
    settlementSourceToSharesProof: latestRun.settlementSourceToSharesProof,
    settlementProof,
    journalDiff: latestRun.journalDiff,
    externalBoundaryManifest: latestRun.externalBoundaryManifest,
    projectionPolicy: latestRun.projectionPolicy,
    boundedPublicProof: latestRun.boundedPublicProof,
    redactionProof: latestRun.redactionProof,
    disclosureProof: latestRun.disclosureProof,
    disclosureBoundaryProof: latestRun.disclosureBoundaryProof,
    proofContract: latestRun.proofContract,
    externalEnvironmentProfile: latestRun.externalEnvironmentProfile,
    externalTelemetrySummary: latestRun.externalTelemetrySummary,
    externalExecutionLedger: latestRun.externalExecutionLedger,
    externalReconciliationLog: latestRun.externalReconciliationLog,
    externalRealizationProof: latestRun.externalRealizationProof,
    containerRealityProof: latestRun.containerRealityProof,
    githubLiveInterfaceProof: latestRun.githubLiveInterfaceProof,
    computeRealityManifest: latestRun.computeRealityManifest,
    storageRealityManifest: latestRun.storageRealityManifest,
    bitcoinCommitmentManifest: latestRun.bitcoinCommitmentManifest,
    bitcoinTreasuryPolicy: latestRun.bitcoinTreasuryPolicy,
    bitcoinAnchor: latestRun.bitcoinAnchor,
    bitcoinBoundedPublicAnchor: latestRun.bitcoinBoundedPublicAnchor,
    bitcoinSettlementIntent: latestRun.bitcoinSettlementIntent,
    bitcoinSettlementObservation: latestRun.bitcoinSettlementObservation,
    bitcoinAuditAnchorProof: latestRun.bitcoinAuditAnchorProof,
    bitcoinSettlementInterfaceProof: latestRun.bitcoinSettlementInterfaceProof
  });
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {Record<string, any>}
 */
function buildSystemProofBundleForLatestRun(latestRun) {
  const settlementProof = latestRun.settlementProof || parsedBranchArtifact(latestRun, '.bitcode/settlement-proof.json');
  return buildSystemProofBundle(
    latestRun.read?.readId,
    latestRun.assetPack?.assetPackId,
    latestRun.inferenceProofs,
    latestRun.promptFamilyRegistry,
    latestRun.inferenceMomentContracts,
    latestRun.inferenceSynthesisProof,
    latestRun.parsedCompletionEnvelopes,
    latestRun.parsedCompletionEnvelopeArtifact,
    latestRun.assetMeasurementProofs,
    latestRun.selectionConsistencyProof,
    latestRun.selectionAndMaterializationProof,
    latestRun.journalCompletenessProof,
    latestRun.identityAuthorizationProof,
    latestRun.sensitiveDataFlowProof,
    latestRun.authorizationAndSensitiveFlowProof,
    settlementProof,
    latestRun.settlementSourceToSharesProof,
    latestRun.promptImplementationSurface,
    latestRun.promptCompletenessProof,
    latestRun.staticMeasurementProof,
    latestRun.materializationProof,
    latestRun.materializationExclusions,
    latestRun.materializationVisibilityProof,
    latestRun.verificationReceipts,
    latestRun.verificationDecisionsProof,
    latestRun.sourceToSharesArtifact,
    latestRun.settlementParticipationArtifact,
    latestRun.accountingPrecisionReport,
    latestRun.redactionProof,
    latestRun.disclosureProof,
    latestRun.disclosureBoundaryProof,
    latestRun.proofWitnessManifest,
    latestRun.proofContract,
    latestRun.computeRealityManifest,
    latestRun.storageRealityManifest,
    latestRun.bitcoinCommitmentManifest,
    latestRun.bitcoinTreasuryPolicy,
    latestRun.bitcoinAnchor,
    latestRun.bitcoinBoundedPublicAnchor,
    latestRun.bitcoinSettlementIntent,
    latestRun.bitcoinSettlementObservation,
    latestRun.bitcoinAuditAnchorProof,
    latestRun.bitcoinSettlementInterfaceProof
  );
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {void}
 */
function rebuildV24ProofClosure(latestRun) {
  refreshExternalBoundaryManifest(latestRun);
  augmentV24DeliverablesManifest(latestRun);

  latestRun.proofWitnessManifest = buildProofWitnessManifestForLatestRun(latestRun);
  patchArtifact(latestRun, 'proofWitnessManifest', latestRun.proofWitnessManifest);

  latestRun.systemProofBundle = buildSystemProofBundleForLatestRun(latestRun);
  patchArtifact(latestRun, 'systemProofBundle', latestRun.systemProofBundle);

  latestRun.proofContract = buildProofContract({
    readId: latestRun.read?.readId,
    assetPackId: latestRun.assetPack?.assetPackId,
    branchName: latestRun.branchArtifacts?.branchName,
    selectedCandidates: selectedCandidatesForProofContract(latestRun),
    authorizationDecisions: latestRun.authorizationDecisions || [],
    sensitiveDataFlowRecords: latestRun.sensitiveDataFlowRecords || [],
    systemProofBundleSummary: {
      proofFamilies: (latestRun.systemProofBundle?.proofFamilies || []).map((entry) => entry.proofFamily),
      replayArtifactCount: (latestRun.systemProofBundle?.verifierEntrypoint?.replayArtifacts || []).length,
      requiredArtifactCount: (latestRun.systemProofBundle?.verifierEntrypoint?.requiredArtifactPaths || []).length
    },
    proofWitnessManifestSummary: {
      proofFamilies: (latestRun.proofWitnessManifest?.proofFamilies || []).map((entry) => entry.proofFamily),
      digestedArtifactCount: (latestRun.proofWitnessManifest?.artifactDigests || []).length,
      allProofRelevantArtifactsDigested: latestRun.proofWitnessManifest?.allProofRelevantArtifactsDigested === true
    },
    v23BitcoinEnabled: Boolean(latestRun.bitcoinSettlementIntent),
    v24ExternalEnabled: Boolean(latestRun.externalEnvironmentProfile),
    externalExecutionLedger: latestRun.externalExecutionLedger || null,
    externalReconciliationLog: latestRun.externalReconciliationLog || null
  });
  patchArtifact(latestRun, 'proofContract', latestRun.proofContract);

  latestRun.proofWitnessManifest = buildProofWitnessManifestForLatestRun(latestRun);
  patchArtifact(latestRun, 'proofWitnessManifest', latestRun.proofWitnessManifest);

  latestRun.systemProofBundle = buildSystemProofBundleForLatestRun(latestRun);
  patchArtifact(latestRun, 'systemProofBundle', latestRun.systemProofBundle);
}

/**
 * @param {Record<string, any>} latestRun
 * @param {Record<string, any> | null | undefined} priorLatestRun
 * @param {Record<string, any> | null | undefined} priorExternalExecutionLedger
 * @returns {{ externalExecutionLedger: Record<string, any>, externalReconciliationLog: Record<string, any> }}
 */
function buildExternalContinuityArtifacts(latestRun, priorLatestRun, priorExternalExecutionLedger) {
  const configuredEnvironmentMode = String(latestRun.externalEnvironmentProfile?.configuredEnvironmentMode || '');
  const actualityDisposition = String(latestRun.externalEnvironmentProfile?.actualityDisposition || '');
  const currentRunRef = buildRunRef(latestRun);
  const priorRunRef = buildRunRef(priorLatestRun);
  const sameEnvironmentMode =
    !!priorLatestRun
    && String(priorLatestRun.externalEnvironmentProfile?.configuredEnvironmentMode || '') === configuredEnvironmentMode;
  const priorLedgerById = ensureRecord(priorExternalExecutionLedger?.interfaceLedgerById);
  const interfaceLedgerById = {};
  const entries = [];

  for (const interfaceId of V24_INTERFACE_ORDER) {
    const summary = interfaceSummary(latestRun, interfaceId);
    if (String(summary.runtimeState || '') !== 'live-observed') continue;
    const currentContinuityRef = continuityRef(latestRun, interfaceId);
    const priorSummary = sameEnvironmentMode ? interfaceSummary(priorLatestRun || {}, interfaceId) : {};
    const priorEntry = sameEnvironmentMode ? ensureRecord(priorLedgerById[interfaceId]) : {};
    const priorWasObserved =
      String(priorSummary.runtimeState || priorEntry.runtimeState || '') === 'live-observed';
    const priorEnvironmentIdentityRef = String(
      priorSummary.environmentIdentityRef
      || priorEntry.environmentIdentityRef
      || ''
    ).trim() || null;
    const priorEnvironmentResourceRef = String(
      priorSummary.environmentResourceRef
      || priorEntry.environmentResourceRef
      || ''
    ).trim() || null;
    const currentEnvironmentIdentityRef = String(summary.environmentIdentityRef || '').trim() || null;
    const currentEnvironmentResourceRef = String(summary.environmentResourceRef || '').trim() || null;

    let continuityState = 'first-observation';
    if (!sameEnvironmentMode && priorLatestRun) {
      continuityState = 'environment-mode-rollover';
    } else if (priorWasObserved) {
      if (
        priorEnvironmentIdentityRef !== currentEnvironmentIdentityRef
        || priorEnvironmentResourceRef !== currentEnvironmentResourceRef
      ) {
        throw new Error(
          `V24 external interface ${interfaceId} binding drift detected between consecutive ${configuredEnvironmentMode} runs.`
        );
      }
      continuityState = 'binding-stable';
    }

    const entry = {
      interfaceId,
      configuredEnvironmentMode,
      actualityDisposition,
      continuityState,
      runtimeState: summary.runtimeState || null,
      executionClass: summary.executionClass || null,
      transportProtocol: summary.transportProtocol || null,
      reconciliationState: summary.reconciliationState || null,
      environmentIdentityRef: currentEnvironmentIdentityRef,
      environmentResourceRef: currentEnvironmentResourceRef,
      currentRunRef,
      priorRunRef: priorWasObserved ? (priorEntry.currentRunRef || priorRunRef || null) : null,
      currentObservationId: summary.observationId || null,
      priorObservationId: priorWasObserved
        ? (priorEntry.currentObservationId || priorSummary.observationId || null)
        : null,
      currentContinuityRef,
      priorContinuityRef: priorWasObserved
        ? (priorEntry.currentContinuityRef || continuityRef(priorLatestRun, interfaceId))
        : null,
      observationSequence: priorWasObserved ? Number(priorEntry.observationSequence || 0) + 1 : 1
    };
    interfaceLedgerById[interfaceId] = entry;
    entries.push(entry);
  }

  return {
    externalExecutionLedger: {
      ledgerId: `v24_external_execution_ledger_${configuredEnvironmentMode || 'unknown'}`,
      configuredEnvironmentMode,
      actualityDisposition,
      currentRunRef,
      priorRunRef: sameEnvironmentMode ? priorRunRef : null,
      liveObservedInterfaceCount: entries.length,
      interfaceLedgerById
    },
    externalReconciliationLog: {
      logId: `v24_external_reconciliation_log_${currentRunRef || configuredEnvironmentMode || 'unknown'}`,
      configuredEnvironmentMode,
      actualityDisposition,
      currentRunRef,
      priorRunRef: sameEnvironmentMode ? priorRunRef : null,
      entryCount: entries.length,
      entries
    }
  };
}

/**
 * @param {Record<string, any>} latestRun
 * @returns {void}
 */
function assertRequiredRealizedArtifacts(latestRun) {
  if (!latestRun.branchArtifacts?.files) return;
  if (!latestRun.externalExecutionLedger) return;
  for (const artifactPath of V24_RECONCILIATION_ARTIFACT_PATHS) {
    if (!latestRun.branchArtifacts.files[artifactPath]) {
      throw new Error(`V24 external realization artifact contract failed: missing ${artifactPath}.`);
    }
  }
}

/**
 * @param {Record<string, any>} latestRun
 * @param {{
 *   fetchImpl?: typeof fetch | undefined,
 *   executorHandlers?: Record<string, (payload: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>> | undefined,
 *   priorLatestRun?: Record<string, any> | null | undefined,
 *   priorExternalExecutionLedger?: Record<string, any> | null | undefined
 * }} [options]
 * @returns {Promise<Record<string, any>>}
 */
export async function realizeV24LiveExternalExecution(latestRun, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const executorHandlers = options.executorHandlers || {};
  const priorLatestRun = ensureRecord(options.priorLatestRun);
  const priorExternalExecutionLedger = ensureRecord(options.priorExternalExecutionLedger);
  if (typeof fetchImpl !== 'function') {
    throw new Error('V24 live external execution requires fetch support.');
  }
  if (!latestRun?.externalEnvironmentProfile || !latestRun?.externalTelemetrySummary) {
    return latestRun;
  }

  const realizedRun = cloneValue(latestRun);
  let realizedAnyInterface = false;

  for (const interfaceId of V24_INTERFACE_ORDER) {
    const summary = interfaceSummary(realizedRun, interfaceId);
    const binding = activeBinding(realizedRun, interfaceId);
    if (String(summary.runtimeState || '') !== 'live-configured') continue;
    if (!interfaceApplicable(realizedRun, interfaceId)) continue;
    if (!binding.executorUrl) {
      throw new Error(`V24 external interface ${interfaceId} is live-configured without an executorUrl.`);
    }

    const requestPayload = buildExecutionRequestPayload(realizedRun, interfaceId);
    const response = await callExecutor(String(binding.executorUrl), requestPayload, binding, fetchImpl, executorHandlers);
    const { artifacts, telemetry } = validateExecutorResponse(interfaceId, response);

    for (const [key, value] of Object.entries(artifacts)) {
      patchArtifact(realizedRun, key, value);
    }

    const patchedArtifactPaths = Object.keys(artifacts)
      .map((key) => V24_BRANCH_ARTIFACT_PATH_BY_KEY[key])
      .filter(Boolean);
    patchInterfaceTelemetry(realizedRun, interfaceId, telemetry, patchedArtifactPaths);
    patchEnvironmentRuntimeState(realizedRun, interfaceId, telemetry);
    realizedAnyInterface = true;
  }

  if (!realizedAnyInterface) {
    return latestRun;
  }

  const continuityArtifacts = buildExternalContinuityArtifacts(
    realizedRun,
    Object.keys(priorLatestRun).length ? priorLatestRun : null,
    Object.keys(priorExternalExecutionLedger).length ? priorExternalExecutionLedger : null
  );
  patchArtifact(realizedRun, 'externalExecutionLedger', continuityArtifacts.externalExecutionLedger);
  patchArtifact(realizedRun, 'externalReconciliationLog', continuityArtifacts.externalReconciliationLog);
  for (const entry of continuityArtifacts.externalReconciliationLog.entries || []) {
    patchInterfaceTelemetry(realizedRun, entry.interfaceId, {
      continuityState: entry.continuityState,
      priorObservationId: entry.priorObservationId,
      priorContinuityRef: entry.priorContinuityRef,
      currentContinuityRef: entry.currentContinuityRef,
      observationSequence: entry.observationSequence
    }, V24_RECONCILIATION_ARTIFACT_PATHS);
    patchEnvironmentRuntimeState(realizedRun, entry.interfaceId, {
      continuityState: entry.continuityState,
      priorObservationId: entry.priorObservationId,
      priorContinuityRef: entry.priorContinuityRef,
      currentContinuityRef: entry.currentContinuityRef,
      observationSequence: entry.observationSequence
    });
  }
  rebuildV24Proofs(realizedRun);
  rebuildV24ProofClosure(realizedRun);
  assertRequiredRealizedArtifacts(realizedRun);
  return realizedRun;
}
