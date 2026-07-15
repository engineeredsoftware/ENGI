// @ts-check

import crypto from 'node:crypto';
import { buildV24LocalExecutorUrl } from './v24-local-executors.js';

export const V24_EXTERNAL_ENVIRONMENT_MODES = ['production', 'staging', 'development', 'mock'];
export const V24_EXTERNAL_INTERFACE_IDS = [
  'bitcoin-mainchain-execution',
  'repeated-read-payment-execution',
  'sidechain-execution',
  'compute-container-execution',
  'storage-container-execution',
  'github-live-interface'
];
const V24_INTERFACE_ARTIFACT_REFS = {
  'bitcoin-mainchain-execution': [
    '.bitcode/bitcoin-settlement-intent.json',
    '.bitcode/bitcoin-settlement-observation.json',
    '.bitcode/bitcoin-anchor.json',
    '.bitcode/bitcoin-bounded-public-anchor.json'
  ],
  'repeated-read-payment-execution': [
    '.bitcode/repeated-read-payment-intent.json',
    '.bitcode/repeated-read-payment-execution.json',
    '.bitcode/repeated-read-payment-observation.json',
    '.bitcode/bitcoin-settlement-intent.json',
    '.bitcode/bitcoin-settlement-observation.json'
  ],
  'sidechain-execution': [
    '.bitcode/external-boundary-manifest.json',
    '.bitcode/external-execution-policy.json',
    '.bitcode/network-capability-manifest.json'
  ],
  'compute-container-execution': [
    '.bitcode/compute-reality-manifest.json',
    '.bitcode/external-environment-profile.json',
    '.bitcode/external-telemetry-summary.json'
  ],
  'storage-container-execution': [
    '.bitcode/storage-reality-manifest.json',
    '.bitcode/external-environment-profile.json',
    '.bitcode/external-telemetry-summary.json'
  ],
  'github-live-interface': [
    '.bitcode/github-app-binding.json',
    '.bitcode/external-environment-profile.json',
    '.bitcode/external-telemetry-summary.json'
  ]
};

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
 * @param {readonly unknown[]} values
 * @returns {string[]}
 */
function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {string} mode
 * @returns {Record<string, unknown>}
 */
function buildBitcoinMainchainBinding(mode) {
  if (mode === 'production') {
    return {
      interfaceId: 'bitcoin-mainchain-execution',
      environmentMode: mode,
      network: 'bitcoin-mainnet',
      accountRef: 'btc-mainchain-prod-account',
      addressRef: 'bc1qbitcode0prodmain0000000000000000000x9',
      treasuryPolicyRef: 'treasury://bitcode/btc-mainchain-production',
      executionClass: 'real-network-execution',
      mockEquivalent: false
    };
  }
  if (mode === 'staging') {
    return {
      interfaceId: 'bitcoin-mainchain-execution',
      environmentMode: mode,
      network: 'bitcoin-testnet4',
      accountRef: 'btc-mainchain-stage-account',
      addressRef: 'tb1qbitcode0stagemain000000000000000000m7',
      treasuryPolicyRef: 'treasury://bitcode/btc-mainchain-staging',
      executionClass: 'pre-production-network-execution',
      mockEquivalent: false
    };
  }
  if (mode === 'development') {
    return {
      interfaceId: 'bitcoin-mainchain-execution',
      environmentMode: mode,
      network: 'bitcoin-testnet4',
      accountRef: 'btc-mainchain-dev-account',
      addressRef: 'tb1qbitcode0devmain0000000000000000000k4',
      treasuryPolicyRef: 'treasury://bitcode/btc-mainchain-development',
      executionClass: 'developer-network-execution',
      mockEquivalent: false
    };
  }
  return {
    interfaceId: 'bitcoin-mainchain-execution',
    environmentMode: mode,
    network: 'bitcoin-mock',
    accountRef: 'btc-mainchain-mock-account',
    addressRef: 'mock:bitcoin-mainchain:bitcode',
    treasuryPolicyRef: 'treasury://bitcode/btc-mainchain-mock',
    executionClass: 'deterministic-nonbroadcast',
    mockEquivalent: true
  };
}

/**
 * @param {string} mode
 * @returns {Record<string, unknown>}
 */
function buildSidechainBinding(mode) {
  if (mode === 'production') {
    return {
      interfaceId: 'sidechain-execution',
      environmentMode: mode,
      network: 'liquid-mainnet',
      accountRef: 'sidechain-prod-account',
      addressRef: 'ex1qbitcode0prodsidechain00000000000002',
      treasuryPolicyRef: 'treasury://bitcode/sidechain-production',
      executionClass: 'real-sidechain-execution',
      mockEquivalent: false
    };
  }
  if (mode === 'staging') {
    return {
      interfaceId: 'sidechain-execution',
      environmentMode: mode,
      network: 'liquid-testnet',
      accountRef: 'sidechain-stage-account',
      addressRef: 'tex1qbitcode0stagesidechain0000000000007',
      treasuryPolicyRef: 'treasury://bitcode/sidechain-staging',
      executionClass: 'pre-production-sidechain-execution',
      mockEquivalent: false
    };
  }
  if (mode === 'development') {
    return {
      interfaceId: 'sidechain-execution',
      environmentMode: mode,
      network: 'liquid-testnet',
      accountRef: 'sidechain-dev-account',
      addressRef: 'tex1qbitcode0devsidechain0000000000000a',
      treasuryPolicyRef: 'treasury://bitcode/sidechain-development',
      executionClass: 'developer-sidechain-execution',
      mockEquivalent: false
    };
  }
  return {
    interfaceId: 'sidechain-execution',
    environmentMode: mode,
    network: 'sidechain-mock',
    accountRef: 'sidechain-mock-account',
    addressRef: 'mock:sidechain:bitcode',
    treasuryPolicyRef: 'treasury://bitcode/sidechain-mock',
    executionClass: 'deterministic-nonbroadcast',
    mockEquivalent: true
  };
}

/**
 * @param {string} mode
 * @returns {Record<string, unknown>}
 */
function buildRepeatedReadBinding(mode) {
  if (mode === 'production') {
    return {
      interfaceId: 'repeated-read-payment-execution',
      environmentMode: mode,
      network: 'lightning-mainnet',
      accountRef: 'lightning-prod-account',
      nodeRef: 'lightning-node://bitcode/production',
      processorRef: 'lightning-processor://bitcode/production',
      invoiceEndpointRef: 'lightning://bitcode/production/invoices',
      treasuryPolicyRef: 'treasury://bitcode/lightning-production',
      executionClass: 'real-lightning-payment-execution',
      mockEquivalent: false
    };
  }
  if (mode === 'staging') {
    return {
      interfaceId: 'repeated-read-payment-execution',
      environmentMode: mode,
      network: 'lightning-testnet',
      accountRef: 'lightning-stage-account',
      nodeRef: 'lightning-node://bitcode/staging',
      processorRef: 'lightning-processor://bitcode/staging',
      invoiceEndpointRef: 'lightning://bitcode/staging/invoices',
      treasuryPolicyRef: 'treasury://bitcode/lightning-staging',
      executionClass: 'pre-production-lightning-payment-execution',
      mockEquivalent: false
    };
  }
  if (mode === 'development') {
    return {
      interfaceId: 'repeated-read-payment-execution',
      environmentMode: mode,
      network: 'lightning-testnet',
      accountRef: 'lightning-dev-account',
      nodeRef: 'lightning-node://bitcode/development',
      processorRef: 'lightning-processor://bitcode/development',
      invoiceEndpointRef: 'lightning://bitcode/development/invoices',
      treasuryPolicyRef: 'treasury://bitcode/lightning-development',
      executionClass: 'developer-lightning-payment-execution',
      mockEquivalent: false
    };
  }
  return {
    interfaceId: 'repeated-read-payment-execution',
    environmentMode: mode,
    network: 'lightning-mock',
    accountRef: 'lightning-mock-account',
    nodeRef: 'lightning-node://bitcode/mock',
    processorRef: 'lightning-processor://bitcode/mock',
    invoiceEndpointRef: 'lightning://bitcode/mock/invoices',
    treasuryPolicyRef: 'treasury://bitcode/lightning-mock',
    executionClass: 'deterministic-nonbroadcast-lightning',
    mockEquivalent: true
  };
}

/**
 * @param {string} mode
 * @returns {Record<string, unknown>}
 */
function buildComputeBinding(mode) {
  return {
    interfaceId: 'compute-container-execution',
    environmentMode: mode,
    registryRef: `registry://bitcode/${mode}/compute`,
    executionIdentityRef: `compute://${mode}/bitcode-runner`,
    queueRef: `queue://bitcode/${mode}/compute`,
    attestationScopeRef: `attestation://bitcode/${mode}/compute`,
    executionClass: mode === 'mock' ? 'deterministic-emulated-container' : 'containerized-execution'
  };
}

/**
 * @param {string} mode
 * @returns {Record<string, unknown>}
 */
function buildStorageBinding(mode) {
  return {
    interfaceId: 'storage-container-execution',
    environmentMode: mode,
    namespaceRef: `storage://bitcode/${mode}/artifacts`,
    bucketRef: `bucket://bitcode-${mode}-artifacts`,
    publicationEndpointRef: `publish://bitcode/${mode}/artifacts`,
    retentionPolicyRef: `retention://bitcode/${mode}/artifacts`,
    retrievalCredentialRef: `credential://bitcode/${mode}/storage-reader`,
    executionClass: mode === 'mock' ? 'deterministic-emulated-storage' : 'durable-storage-execution'
  };
}

/**
 * @param {string} mode
 * @param {string[]} repos
 * @returns {Record<string, unknown>}
 */
function buildGithubBinding(mode, repos) {
  return {
    interfaceId: 'github-live-interface',
    environmentMode: mode,
    appRef: `github-app://bitcode/${mode}`,
    appId: `bitcode-${mode}-github-app`,
    authMode: mode === 'mock' ? 'deterministic-github-emulation' : 'github-app-installation-token',
    jwtIssuerRef: `github-app-issuer://bitcode/${mode}`,
    privateKeyRef: `secret://bitcode/${mode}/github-app-private-key`,
    installationTargetRef: `github-installation://bitcode/${mode}`,
    webhookRef: `webhook://bitcode/${mode}/github`,
    mutationPolicyRef: `policy://bitcode/${mode}/github-mutations`,
    executionClass: mode === 'mock' ? 'deterministic-nonmutating-github-emulation' : 'github-app-execution',
    targetedRepos: repos.map((repo) => ({
      repo,
      installationId: `inst_${mode}_${shortId(repo, 10)}`,
      repositoryRef: `github://${mode}/${repo}`
    }))
  };
}

/**
 * @param {string[]} repos
 * @returns {Record<string, unknown>[]}
 */
function buildEnvironmentProfiles(repos) {
  return V24_EXTERNAL_ENVIRONMENT_MODES.map((environmentMode) => ({
    environmentMode,
    releaseDisposition: environmentMode === 'production' ? 'customer-facing' : environmentMode === 'mock' ? 'non-broadcasting' : 'pre-production',
    externalBindings: {
      bitcoinMainchain: buildBitcoinMainchainBinding(environmentMode),
      repeatedReadPayment: buildRepeatedReadBinding(environmentMode),
      sidechain: buildSidechainBinding(environmentMode),
      compute: buildComputeBinding(environmentMode),
      storage: buildStorageBinding(environmentMode),
      github: buildGithubBinding(environmentMode, repos)
    }
  }));
}

/**
 * @param {Record<string, unknown>[]} environmentProfiles
 * @returns {Record<string, unknown>}
 */
function buildNetworkCapabilityManifest(environmentProfiles) {
  return {
    manifestId: 'v24_network_capability_manifest_v1',
    supportedEnvironmentModes: [...V24_EXTERNAL_ENVIRONMENT_MODES],
    interfaceIds: [...V24_EXTERNAL_INTERFACE_IDS],
    interfaces: V24_EXTERNAL_INTERFACE_IDS.map((interfaceId) => ({
      interfaceId,
      supportedModes: [...V24_EXTERNAL_ENVIRONMENT_MODES],
      bindingsByMode: environmentProfiles.map((profile) => {
        const record = /** @type {{ environmentMode?: string, externalBindings?: Record<string, unknown> }} */ (profile);
        const bindings = record.externalBindings || {};
        const binding =
          interfaceId === 'bitcoin-mainchain-execution' ? bindings.bitcoinMainchain
            : interfaceId === 'repeated-read-payment-execution' ? bindings.repeatedReadPayment
              : interfaceId === 'sidechain-execution' ? bindings.sidechain
                : interfaceId === 'compute-container-execution' ? bindings.compute
                  : interfaceId === 'storage-container-execution' ? bindings.storage
                    : bindings.github;
        return {
          environmentMode: record.environmentMode,
          binding
        };
      })
    }))
  };
}

/**
 * @returns {Record<string, unknown>}
 */
function buildExternalExecutionPolicy() {
  return {
    policyId: 'v24_external_execution_policy_v1',
    requiredEnvironmentModes: [...V24_EXTERNAL_ENVIRONMENT_MODES],
    isolationDisposition: 'blocking-on-cross-mode-resource-reuse',
    mockParityRule: 'mock-preserves-artifact-and-receipt-shapes-without-live-side-effects',
    interfaceRequirements: [
      {
        interfaceId: 'bitcoin-mainchain-execution',
        requiredBindings: ['network', 'accountRef', 'addressRef', 'treasuryPolicyRef', 'executorUrl'],
        requiredReceiptStages: ['intent', 'execution', 'observation']
      },
      {
        interfaceId: 'repeated-read-payment-execution',
        requiredBindings: ['network', 'accountRef', 'nodeRef', 'processorRef', 'invoiceEndpointRef', 'treasuryPolicyRef', 'executorUrl'],
        requiredReceiptStages: ['intent', 'execution', 'observation']
      },
      {
        interfaceId: 'sidechain-execution',
        requiredBindings: ['network', 'accountRef', 'addressRef', 'treasuryPolicyRef', 'executorUrl'],
        requiredReceiptStages: ['intent', 'execution', 'observation']
      },
      {
        interfaceId: 'compute-container-execution',
        requiredBindings: ['registryRef', 'executionIdentityRef', 'attestationScopeRef', 'executorUrl'],
        requiredReceiptStages: ['intent', 'execution', 'observation']
      },
      {
        interfaceId: 'storage-container-execution',
        requiredBindings: ['namespaceRef', 'bucketRef', 'retentionPolicyRef', 'retrievalCredentialRef', 'executorUrl'],
        requiredReceiptStages: ['intent', 'execution', 'observation']
      },
      {
        interfaceId: 'github-live-interface',
        requiredBindings: ['appRef', 'installationTargetRef', 'webhookRef', 'mutationPolicyRef', 'executorUrl'],
        requiredReceiptStages: ['intent', 'execution', 'observation']
      }
    ]
  };
}

/**
 * @returns {Record<string, unknown>}
 */
function buildExternalTelemetryPolicy() {
  return {
    policyId: 'v24_external_telemetry_policy_v1',
    requiredFields: [
      'environmentMode',
      'interfaceId',
      'environmentIdentityRef',
      'environmentResourceRef',
      'requestId',
      'executionId',
      'observationId',
      'resultClass',
      'reconciliationState',
      'affectedArtifactRefs'
    ],
    coverageExpectation: {
      modes: [...V24_EXTERNAL_ENVIRONMENT_MODES],
      requiredPathClasses: ['positive', 'fail-closed'],
      missingTelemetryDisposition: 'blocking'
    },
    interfaceTelemetry: [
      {
        interfaceId: 'bitcoin-mainchain-execution',
        requiredEventClasses: ['spend-intent', 'signer-coordination', 'broadcast-attempt', 'confirmation-observation', 'publication-reconciliation']
      },
      {
        interfaceId: 'repeated-read-payment-execution',
        requiredEventClasses: ['invoice-intent', 'invoice-issuance', 'payment-observation', 'settlement-reconciliation', 'anchor-reconciliation']
      },
      {
        interfaceId: 'sidechain-execution',
        requiredEventClasses: ['bridge-intent', 'execution-attempt', 'checkpoint-observation', 'publication-reconciliation']
      },
      {
        interfaceId: 'compute-container-execution',
        requiredEventClasses: ['image-selection', 'attestation', 'execution-start', 'execution-finish', 'output-sealing']
      },
      {
        interfaceId: 'storage-container-execution',
        requiredEventClasses: ['publication-targeting', 'retrieval-attempt', 'retention-evaluation', 'deletion-or-expiry']
      },
      {
        interfaceId: 'github-live-interface',
        requiredEventClasses: ['app-authentication', 'installation-binding', 'fetch-attempt', 'mutation-attempt', 'remote-reconciliation']
      }
    ]
  };
}

/**
 * @param {string} key
 * @returns {string | undefined}
 */
function envString(key) {
  const value = process.env[key];
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function envBoolean(key) {
  const value = envString(key);
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function envPresent(key) {
  return envString(key) !== undefined;
}

/**
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
function normalizeEnvironmentMode(value, fallback) {
  const normalized = String(value || '').trim().toLowerCase();
  return V24_EXTERNAL_ENVIRONMENT_MODES.includes(normalized) ? normalized : fallback;
}

/**
 * @param {Record<string, unknown>} record
 * @returns {Record<string, unknown>}
 */
function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

/**
 * @param {Record<string, unknown>} binding
 * @param {Record<string, unknown>} overrides
 * @returns {Record<string, unknown>}
 */
function withBindingOverrides(binding, overrides) {
  return {
    ...binding,
    ...compactRecord(overrides)
  };
}

/**
 * @param {string} interfaceId
 * @param {Record<string, unknown>} binding
 * @param {string} configuredEnvironmentMode
 * @returns {Record<string, unknown>}
 */
function applyLocalExecutorSupport(interfaceId, binding, configuredEnvironmentMode) {
  if (configuredEnvironmentMode === 'mock') return binding;
  if (!envBoolean('BITCODE_V24_ENABLE_LOCAL_EXECUTORS')) return binding;
  if (binding.executorUrl) return binding;
  return {
    ...binding,
    executorUrl: buildV24LocalExecutorUrl(interfaceId),
    executorKind: 'built-in-demonstration-adapter',
    executorRouteRef: `/api/executors/${interfaceId}`
  };
}

/**
 * @param {string} interfaceId
 * @returns {string}
 */
function liveEnableEnvKey(interfaceId) {
  if (interfaceId === 'bitcoin-mainchain-execution') return 'BITCODE_V24_ENABLE_BITCOIN_MAINCHAIN';
  if (interfaceId === 'repeated-read-payment-execution') return 'BITCODE_V24_ENABLE_REPEATED_READ_PAYMENT';
  if (interfaceId === 'sidechain-execution') return 'BITCODE_V24_ENABLE_SIDECHAIN';
  if (interfaceId === 'compute-container-execution') return 'BITCODE_V24_ENABLE_COMPUTE';
  if (interfaceId === 'storage-container-execution') return 'BITCODE_V24_ENABLE_STORAGE';
  return 'BITCODE_V24_ENABLE_GITHUB';
}

/**
 * @param {string} interfaceId
 * @param {Record<string, unknown>} binding
 * @returns {{ binding: Record<string, unknown>, overrideKeys: string[] }}
 */
function applyActiveBindingOverrides(interfaceId, binding) {
  if (interfaceId === 'bitcoin-mainchain-execution') {
    const overrides = compactRecord({
      network: envString('BITCODE_V24_BITCOIN_MAINCHAIN_NETWORK'),
      accountRef: envString('BITCODE_V24_BITCOIN_MAINCHAIN_ACCOUNT_REF'),
      addressRef: envString('BITCODE_V24_BITCOIN_MAINCHAIN_ADDRESS_REF'),
      treasuryPolicyRef: envString('BITCODE_V24_BITCOIN_MAINCHAIN_TREASURY_POLICY_REF'),
      executorUrl: envString('BITCODE_V24_BITCOIN_MAINCHAIN_EXECUTOR_URL'),
      executorKind: envString('BITCODE_V24_BITCOIN_MAINCHAIN_EXECUTOR_KIND')
    });
    return {
      binding: withBindingOverrides(binding, overrides),
      overrideKeys: Object.keys(overrides)
    };
  }
  if (interfaceId === 'sidechain-execution') {
    const overrides = compactRecord({
      network: envString('BITCODE_V24_SIDECHAIN_NETWORK'),
      accountRef: envString('BITCODE_V24_SIDECHAIN_ACCOUNT_REF'),
      addressRef: envString('BITCODE_V24_SIDECHAIN_ADDRESS_REF'),
      treasuryPolicyRef: envString('BITCODE_V24_SIDECHAIN_TREASURY_POLICY_REF'),
      executorUrl: envString('BITCODE_V24_SIDECHAIN_EXECUTOR_URL'),
      executorKind: envString('BITCODE_V24_SIDECHAIN_EXECUTOR_KIND')
    });
    return {
      binding: withBindingOverrides(binding, overrides),
      overrideKeys: Object.keys(overrides)
    };
  }
  if (interfaceId === 'repeated-read-payment-execution') {
    const overrides = compactRecord({
      network: envString('BITCODE_V24_REPEATED_READ_NETWORK'),
      accountRef: envString('BITCODE_V24_REPEATED_READ_ACCOUNT_REF'),
      nodeRef: envString('BITCODE_V24_REPEATED_READ_NODE_REF'),
      processorRef: envString('BITCODE_V24_REPEATED_READ_PROCESSOR_REF'),
      invoiceEndpointRef: envString('BITCODE_V24_REPEATED_READ_INVOICE_ENDPOINT_REF'),
      treasuryPolicyRef: envString('BITCODE_V24_REPEATED_READ_TREASURY_POLICY_REF'),
      executorUrl: envString('BITCODE_V24_REPEATED_READ_EXECUTOR_URL'),
      executorKind: envString('BITCODE_V24_REPEATED_READ_EXECUTOR_KIND')
    });
    return {
      binding: withBindingOverrides(binding, overrides),
      overrideKeys: Object.keys(overrides)
    };
  }
  if (interfaceId === 'compute-container-execution') {
    const overrides = compactRecord({
      registryRef: envString('BITCODE_V24_COMPUTE_REGISTRY_REF'),
      executionIdentityRef: envString('BITCODE_V24_COMPUTE_EXECUTION_IDENTITY_REF'),
      queueRef: envString('BITCODE_V24_COMPUTE_QUEUE_REF'),
      attestationScopeRef: envString('BITCODE_V24_COMPUTE_ATTESTATION_SCOPE_REF'),
      executorUrl: envString('BITCODE_V24_COMPUTE_EXECUTOR_URL'),
      executorKind: envString('BITCODE_V24_COMPUTE_EXECUTOR_KIND')
    });
    return {
      binding: withBindingOverrides(binding, overrides),
      overrideKeys: Object.keys(overrides)
    };
  }
  if (interfaceId === 'storage-container-execution') {
    const overrides = compactRecord({
      namespaceRef: envString('BITCODE_V24_STORAGE_NAMESPACE_REF'),
      bucketRef: envString('BITCODE_V24_STORAGE_BUCKET_REF'),
      publicationEndpointRef: envString('BITCODE_V24_STORAGE_PUBLICATION_ENDPOINT_REF'),
      retentionPolicyRef: envString('BITCODE_V24_STORAGE_RETENTION_POLICY_REF'),
      retrievalCredentialRef: envString('BITCODE_V24_STORAGE_RETRIEVAL_CREDENTIAL_REF'),
      executorUrl: envString('BITCODE_V24_STORAGE_EXECUTOR_URL'),
      executorKind: envString('BITCODE_V24_STORAGE_EXECUTOR_KIND')
    });
    return {
      binding: withBindingOverrides(binding, overrides),
      overrideKeys: Object.keys(overrides)
    };
  }
  const targetedReposOverride = uniqueStrings((envString('BITCODE_V24_GITHUB_TARGET_REPOS') || '').split(','));
  const overrides = compactRecord({
    appRef: envString('BITCODE_V24_GITHUB_APP_REF'),
    appId: envString('BITCODE_V24_GITHUB_APP_ID'),
    authMode: envString('BITCODE_V24_GITHUB_AUTH_MODE'),
    jwtIssuerRef: envString('BITCODE_V24_GITHUB_JWT_ISSUER_REF'),
    privateKeyRef: envString('BITCODE_V24_GITHUB_PRIVATE_KEY_REF'),
    defaultInstallationId: envString('BITCODE_V24_GITHUB_INSTALLATION_ID'),
    installationTargetRef: envString('BITCODE_V24_GITHUB_INSTALLATION_TARGET_REF'),
    webhookRef: envString('BITCODE_V24_GITHUB_WEBHOOK_REF'),
    mutationPolicyRef: envString('BITCODE_V24_GITHUB_MUTATION_POLICY_REF'),
    executorUrl: envString('BITCODE_V24_GITHUB_EXECUTOR_URL'),
    executorKind: envString('BITCODE_V24_GITHUB_EXECUTOR_KIND'),
    targetedRepos: targetedReposOverride.length
      ? targetedReposOverride.map((repo) => ({
          repo,
          installationId: `inst_env_${shortId(repo, 10)}`,
          repositoryRef: `github://env/${repo}`
        }))
      : undefined
  });
  return {
    binding: withBindingOverrides(binding, overrides),
    overrideKeys: Object.keys(overrides)
  };
}

/**
 * @param {Record<string, unknown>} executionPolicy
 * @param {string} interfaceId
 * @returns {string[]}
 */
function requiredBindingKeys(executionPolicy, interfaceId) {
  const requirements = /** @type {Array<Record<string, unknown>>} */ (executionPolicy.interfaceRequirements || []);
  const match = requirements.find((entry) => entry.interfaceId === interfaceId) || {};
  return uniqueStrings(/** @type {string[]} */ (match.requiredBindings || []));
}

/**
 * @param {string} interfaceId
 * @param {Record<string, unknown>} binding
 * @returns {string[]}
 */
function requiredSecretEnvKeys(interfaceId, binding) {
  const executorKind = String(binding.executorKind || 'http-json-patch');
  if (executorKind === 'built-in-demonstration-adapter' || executorKind === 'http-json-patch') {
    return [];
  }
  if (interfaceId === 'bitcoin-mainchain-execution' && executorKind === 'bitcoin-json-rpc-v1') {
    return ['BITCODE_V24_BITCOIN_MAINCHAIN_RPC_USER', 'BITCODE_V24_BITCOIN_MAINCHAIN_RPC_PASSWORD'];
  }
  if (interfaceId === 'repeated-read-payment-execution' && executorKind === 'lightning-http-v1') {
    return ['BITCODE_V24_REPEATED_READ_BEARER_TOKEN'];
  }
  if (interfaceId === 'sidechain-execution' && executorKind === 'sidechain-json-rpc-v1') {
    return ['BITCODE_V24_SIDECHAIN_RPC_USER', 'BITCODE_V24_SIDECHAIN_RPC_PASSWORD'];
  }
  if (interfaceId === 'compute-container-execution' && executorKind === 'compute-http-v1') {
    return ['BITCODE_V24_COMPUTE_BEARER_TOKEN'];
  }
  if (interfaceId === 'storage-container-execution' && executorKind === 'storage-http-v1') {
    return ['BITCODE_V24_STORAGE_BEARER_TOKEN'];
  }
  if (interfaceId === 'github-live-interface' && executorKind === 'github-rest-v3') {
    return ['BITCODE_V24_GITHUB_BEARER_TOKEN'];
  }
  if (interfaceId === 'github-live-interface' && executorKind === 'github-app-rest-v3') {
    return ['BITCODE_V24_GITHUB_APP_PRIVATE_KEY_PEM'];
  }
  return [];
}

/**
 * @param {Record<string, unknown>} executionPolicy
 * @param {string} interfaceId
 * @param {Record<string, unknown>} binding
 * @param {string} configuredEnvironmentMode
 * @param {boolean} defaultStubbed
 * @returns {Record<string, unknown>}
 */
function buildInterfaceRuntimeState(executionPolicy, interfaceId, binding, configuredEnvironmentMode, defaultStubbed) {
  const liveEnabled = envBoolean(liveEnableEnvKey(interfaceId));
  const missingBindingKeys = requiredBindingKeys(executionPolicy, interfaceId).filter((key) => !binding[key]);
  const missingSecretEnvKeys = requiredSecretEnvKeys(interfaceId, binding).filter((key) => !envPresent(key));
  if (configuredEnvironmentMode === 'mock') {
    return {
      interfaceId,
      runtimeState: 'mock',
      liveEnabled,
      missingBindingKeys,
      missingSecretEnvKeys,
      resultClass: 'deterministic-mock-only',
      reconciliationState: 'mock-parity-only',
      telemetryCoverageState: 'shape-complete-implementation-pending'
    };
  }
  if (liveEnabled && missingBindingKeys.length === 0 && missingSecretEnvKeys.length === 0) {
    return {
      interfaceId,
      runtimeState: 'live-configured',
      liveEnabled,
      missingBindingKeys,
      missingSecretEnvKeys,
      resultClass: 'configuration-live-ready',
      reconciliationState: 'configuration-ready-awaiting-observation',
      telemetryCoverageState: 'shape-complete-live-execution-pending'
    };
  }
  if (liveEnabled) {
    return {
      interfaceId,
      runtimeState: 'live-misconfigured',
      liveEnabled,
      missingBindingKeys,
      missingSecretEnvKeys,
      resultClass: 'configuration-invalid',
      reconciliationState: 'misconfigured-blocking',
      telemetryCoverageState: 'shape-complete-blocking'
    };
  }
  return {
      interfaceId,
      runtimeState: defaultStubbed ? 'stubbed-demonstration' : 'nonexecuting-preview',
      liveEnabled,
      missingBindingKeys,
      missingSecretEnvKeys,
      resultClass: defaultStubbed ? 'stubbed-external-demonstration' : 'nonexecuting-preview',
      reconciliationState: defaultStubbed ? 'draft-target-artifact-emission-only' : 'configuration-present-execution-disabled',
      telemetryCoverageState: 'shape-complete-implementation-pending'
    };
}

/**
 * @param {Record<string, unknown>} descriptor
 * @param {{
 *   environmentMode?: string | null | undefined,
 *   paymentMode?: string | null | undefined
 * }} [input]
 * @returns {{
 *   configuredEnvironmentMode: string,
 *   actualityDisposition: string,
 *   activeProfile: Record<string, unknown>,
 *   activeBindings: Record<string, Record<string, unknown>>,
 *   interfaceRuntimeStates: Record<string, unknown>[],
 *   interfaceRuntimeStateById: Record<string, Record<string, unknown>>,
 *   activeBindingOverrideKeysByInterface: Record<string, string[]>
 * }}
 */
export function resolveV24ActiveExternalRuntime(descriptor, input = {}) {
  const fallbackMode = input.paymentMode ? 'development' : 'mock';
  const configuredEnvironmentMode = normalizeEnvironmentMode(
    typeof input.environmentMode === 'string' ? input.environmentMode : envString('BITCODE_V24_ENVIRONMENT_MODE'),
    fallbackMode,
  );
  const activeProfile = /** @type {any[]} */ (descriptor.environmentProfiles || []).find((profile) => profile.environmentMode === configuredEnvironmentMode)
    || /** @type {any[]} */ (descriptor.environmentProfiles || [])[0]
    || {};
  const profileBindings = /** @type {Record<string, Record<string, unknown>>} */ (activeProfile.externalBindings || {});
  const executionPolicy = /** @type {Record<string, unknown>} */ (descriptor.externalExecutionPolicy || {});
  const defaultStubbed = configuredEnvironmentMode !== 'mock';
  const activeBindingOverrideKeysByInterface = {};
  const activeBindings = {
    bitcoinMainchain: (() => {
      const { binding, overrideKeys } = applyActiveBindingOverrides('bitcoin-mainchain-execution', profileBindings.bitcoinMainchain || {});
      activeBindingOverrideKeysByInterface['bitcoin-mainchain-execution'] = overrideKeys;
      return applyLocalExecutorSupport('bitcoin-mainchain-execution', binding, configuredEnvironmentMode);
    })(),
    repeatedReadPayment: (() => {
      const { binding, overrideKeys } = applyActiveBindingOverrides('repeated-read-payment-execution', profileBindings.repeatedReadPayment || {});
      activeBindingOverrideKeysByInterface['repeated-read-payment-execution'] = overrideKeys;
      return applyLocalExecutorSupport('repeated-read-payment-execution', binding, configuredEnvironmentMode);
    })(),
    sidechain: (() => {
      const { binding, overrideKeys } = applyActiveBindingOverrides('sidechain-execution', profileBindings.sidechain || {});
      activeBindingOverrideKeysByInterface['sidechain-execution'] = overrideKeys;
      return applyLocalExecutorSupport('sidechain-execution', binding, configuredEnvironmentMode);
    })(),
    compute: (() => {
      const { binding, overrideKeys } = applyActiveBindingOverrides('compute-container-execution', profileBindings.compute || {});
      activeBindingOverrideKeysByInterface['compute-container-execution'] = overrideKeys;
      return applyLocalExecutorSupport('compute-container-execution', binding, configuredEnvironmentMode);
    })(),
    storage: (() => {
      const { binding, overrideKeys } = applyActiveBindingOverrides('storage-container-execution', profileBindings.storage || {});
      activeBindingOverrideKeysByInterface['storage-container-execution'] = overrideKeys;
      return applyLocalExecutorSupport('storage-container-execution', binding, configuredEnvironmentMode);
    })(),
    github: (() => {
      const { binding, overrideKeys } = applyActiveBindingOverrides('github-live-interface', profileBindings.github || {});
      activeBindingOverrideKeysByInterface['github-live-interface'] = overrideKeys;
      return applyLocalExecutorSupport('github-live-interface', binding, configuredEnvironmentMode);
    })()
  };
  const interfaceRuntimeStates = V24_EXTERNAL_INTERFACE_IDS.map((interfaceId) => {
    const binding =
      interfaceId === 'bitcoin-mainchain-execution' ? activeBindings.bitcoinMainchain
        : interfaceId === 'repeated-read-payment-execution' ? activeBindings.repeatedReadPayment
          : interfaceId === 'sidechain-execution' ? activeBindings.sidechain
            : interfaceId === 'compute-container-execution' ? activeBindings.compute
              : interfaceId === 'storage-container-execution' ? activeBindings.storage
                : activeBindings.github;
    const state = buildInterfaceRuntimeState(executionPolicy, interfaceId, binding, configuredEnvironmentMode, defaultStubbed);
    return {
      ...state,
      environmentIdentityRef: binding.accountRef || binding.executionIdentityRef || binding.appRef || null,
      environmentResourceRef: binding.addressRef || binding.bucketRef || binding.namespaceRef || binding.installationTargetRef || null
    };
  });
  const interfaceRuntimeStateById = Object.fromEntries(
    interfaceRuntimeStates.map((entry) => [String(entry.interfaceId || ''), entry])
  );
  const liveConfiguredCount = interfaceRuntimeStates.filter((entry) => entry.runtimeState === 'live-configured').length;
  const liveMisconfiguredCount = interfaceRuntimeStates.filter((entry) => entry.runtimeState === 'live-misconfigured').length;
  const actualityDisposition =
    configuredEnvironmentMode === 'mock'
      ? 'deterministic-mock-only'
      : liveConfiguredCount === interfaceRuntimeStates.length
        ? 'live-configured-external-realization'
        : liveConfiguredCount > 0 || liveMisconfiguredCount > 0
          ? 'mixed-external-realization'
          : 'stubbed-external-demonstration';
  return {
    configuredEnvironmentMode,
    actualityDisposition,
    activeProfile,
      activeBindings,
    interfaceRuntimeStates,
    interfaceRuntimeStateById,
    activeBindingOverrideKeysByInterface
  };
}

/**
 * @param {string} interfaceId
 * @returns {string[]}
 */
function buildAffectedArtifactRefs(interfaceId) {
  return [...(V24_INTERFACE_ARTIFACT_REFS[/** @type {keyof typeof V24_INTERFACE_ARTIFACT_REFS} */ (interfaceId)] || [])];
}

/**
 * @param {{
 *   githubAppSessions?: Array<{ repo?: string | undefined }> | undefined,
 *   branchName?: string | undefined,
 *   branchMode?: string | undefined,
 *   paymentMode?: string | null | undefined,
 *   scenarioId?: string | undefined,
 *   pipelineTelemetry?: { events?: Array<{ stageId?: string | undefined }> } | undefined
 * }} [input]
 * @returns {{
 *   externalEnvironmentProfile: Record<string, unknown>,
 *   externalExecutionPolicy: Record<string, unknown>,
 *   externalTelemetryPolicy: Record<string, unknown>,
 *   externalTelemetrySummary: Record<string, unknown>,
 *   networkCapabilityManifest: Record<string, unknown>,
 *   githubAppBinding: Record<string, unknown>
 * }}
 */
export function buildV24ExternalRealizationArtifacts(input = {}) {
  const descriptor = buildV24ExternalRealizationDescriptor(input);
  const runtime = resolveV24ActiveExternalRuntime(descriptor, input);
  const configuredEnvironmentMode = runtime.configuredEnvironmentMode;
  const activeBindings = runtime.activeBindings;
  const activeGithubBinding = activeBindings.github || {};
  const branchName = String(input.branchName || '');
  const branchMode = String(input.branchMode || '');
  const scenarioId = String(input.scenarioId || '');
  const pipelineStages = uniqueStrings((input.pipelineTelemetry?.events || []).map((event) => event.stage || event.stageId));
  const actualityDisposition = runtime.actualityDisposition;

  const externalEnvironmentProfile = {
    profileId: `v24_external_environment_profile_${shortId(`${configuredEnvironmentMode}:${branchName || 'default'}`, 16)}`,
    draftTargetVersion: 'V24',
    configuredEnvironmentMode,
    supportedEnvironmentModes: [...V24_EXTERNAL_ENVIRONMENT_MODES],
    actualityDisposition,
    demonstrationToggleState: {
      configuredEnvironmentMode,
      paymentMode: input.paymentMode || null,
      localExecutorsEnabled: envBoolean('BITCODE_V24_ENABLE_LOCAL_EXECUTORS'),
      shapeStableArtifactContract: true,
      allowModeSwitchingWithoutArtifactShapeDrift: true
    },
    activeBindings,
    activeRuntimeStates: runtime.interfaceRuntimeStates,
    interfaceRuntimeStateById: runtime.interfaceRuntimeStateById,
    activeBindingOverrideKeysByInterface: runtime.activeBindingOverrideKeysByInterface,
    environmentProfiles: descriptor.environmentProfiles,
    networkCapabilityManifestRef: /** @type {any} */ (descriptor.networkCapabilityManifest || {}).manifestId || null
  };

  const externalExecutionPolicy = {
    ...(/** @type {any} */ (descriptor.externalExecutionPolicy || {})),
    configuredEnvironmentMode,
    actualityDisposition,
    activeRuntimeStateIds: runtime.interfaceRuntimeStates.map((entry) => `${entry.interfaceId}:${entry.runtimeState}`),
    branchBinding: {
      branchName: branchName || null,
      branchMode: branchMode || null,
      scenarioId: scenarioId || null
    }
  };

  const externalTelemetryPolicy = {
    ...(/** @type {any} */ (descriptor.externalTelemetryPolicy || {})),
    surfacedAcross: ['core', 'demonstration', 'api', 'branch-artifacts']
  };

  const externalTelemetrySummary = {
    summaryId: `v24_external_telemetry_summary_${shortId(`${configuredEnvironmentMode}:${scenarioId || branchName || 'default'}`, 16)}`,
    configuredEnvironmentMode,
    actualityDisposition,
    branchName: branchName || null,
    branchMode: branchMode || null,
    scenarioId: scenarioId || null,
    paymentMode: input.paymentMode || null,
    coreTelemetryRefs: ['.bitcode/pipeline-telemetry.json'],
    surfacedAcross: ['core', 'demonstration', 'api', 'branch-artifacts'],
    pipelineStageIds: pipelineStages,
    interfaceSummaries: V24_EXTERNAL_INTERFACE_IDS.map((interfaceId) => {
      const binding =
        interfaceId === 'bitcoin-mainchain-execution' ? activeBindings.bitcoinMainchain
          : interfaceId === 'repeated-read-payment-execution' ? activeBindings.repeatedReadPayment
            : interfaceId === 'sidechain-execution' ? activeBindings.sidechain
              : interfaceId === 'compute-container-execution' ? activeBindings.compute
                : interfaceId === 'storage-container-execution' ? activeBindings.storage
                  : activeGithubBinding;
      return {
        interfaceId,
        configuredEnvironmentMode,
        requestId: `req_${shortId(`${configuredEnvironmentMode}:${interfaceId}:${branchName || scenarioId || 'default'}`, 16)}`,
        executionId: `exec_${shortId(`${interfaceId}:${branchMode || 'default'}:${input.paymentMode || 'none'}`, 16)}`,
        observationId: `obs_${shortId(`${interfaceId}:${actualityDisposition}:${scenarioId || 'default'}`, 16)}`,
        executionClass: binding?.executionClass || null,
        environmentIdentityRef: binding?.accountRef || binding?.executionIdentityRef || binding?.appRef || null,
        environmentResourceRef: binding?.addressRef || binding?.bucketRef || binding?.namespaceRef || binding?.installationTargetRef || null,
        runtimeState: runtime.interfaceRuntimeStateById[interfaceId]?.runtimeState || null,
        missingBindingKeys: runtime.interfaceRuntimeStateById[interfaceId]?.missingBindingKeys || [],
        missingSecretEnvKeys: runtime.interfaceRuntimeStateById[interfaceId]?.missingSecretEnvKeys || [],
        reconciliationState: runtime.interfaceRuntimeStateById[interfaceId]?.reconciliationState || 'draft-target-artifact-emission-only',
        resultClass: runtime.interfaceRuntimeStateById[interfaceId]?.resultClass || actualityDisposition,
        telemetryCoverageState: runtime.interfaceRuntimeStateById[interfaceId]?.telemetryCoverageState || 'shape-complete-implementation-pending',
        affectedArtifactRefs: buildAffectedArtifactRefs(interfaceId)
      };
    }),
    coverageExpectation: /** @type {any} */ (descriptor.externalTelemetryPolicy || {}).coverageExpectation || null
  };

  const githubAppBinding = {
    bindingId: `v24_github_app_binding_${shortId(`${configuredEnvironmentMode}:${String(activeGithubBinding.appId || 'none')}`, 16)}`,
    configuredEnvironmentMode,
    activeBinding: activeGithubBinding,
    allBindings: descriptor.githubAppBindings,
    targetedRepoCount: Array.isArray(activeGithubBinding.targetedRepos) ? activeGithubBinding.targetedRepos.length : 0,
    runtimeState: runtime.interfaceRuntimeStateById['github-live-interface']?.runtimeState || null
  };

  return {
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest: /** @type {any} */ (descriptor.networkCapabilityManifest || {}),
    githubAppBinding
  };
}

/**
 * @param {{ githubAppSessions?: Array<{ repo?: string | undefined }> | undefined }} [input]
 * @returns {Record<string, unknown>}
 */
export function buildV24ExternalRealizationDescriptor(input = {}) {
  const repos = uniqueStrings((input.githubAppSessions || []).map((session) => session.repo));
  const environmentProfiles = buildEnvironmentProfiles(repos);
  const githubAppBindings = environmentProfiles.map((profile) => /** @type {any} */ (profile).externalBindings.github);
  const executionPolicy = buildExternalExecutionPolicy();
  const telemetryPolicy = buildExternalTelemetryPolicy();
  return {
    descriptorId: `v24_external_realization_${shortId(repos.join(':') || 'default', 16)}`,
    draftTargetVersion: 'V24',
    environmentModes: [...V24_EXTERNAL_ENVIRONMENT_MODES],
    environmentProfiles,
    networkCapabilityManifest: buildNetworkCapabilityManifest(environmentProfiles),
    externalExecutionPolicy: executionPolicy,
    externalTelemetryPolicy: telemetryPolicy,
    githubAppBindings,
    implementationStatus: {
      sourceSlice: 'draft-target descriptor, API exposure, and live executor realization path',
      localExecutorSupport: true,
      realNetworkExecution: false,
      realGitHubMutationExecution: false,
      realContainerExecution: false
    }
  };
}
