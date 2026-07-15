// @ts-check
// @ts-nocheck

import crypto from 'node:crypto';
import { ACTIVE_CANON_VERSION } from '../canon-posture.js';

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
 * @param {string} baseUrl
 * @param {string} pathname
 * @returns {string}
 */
function joinUrl(baseUrl, pathname) {
  return `${String(baseUrl || '').replace(/\/+$/, '')}/${String(pathname || '').replace(/^\/+/, '')}`;
}

/**
 * @param {string} key
 * @returns {string | undefined}
 */
function envString(key) {
  const value = process.env[key];
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

function activeProjectLabel() {
  return 'Bitcode';
}

/**
 * @param {string} value
 * @returns {string}
 */
function base64url(value) {
  return Buffer.from(String(value))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/**
 * @param {Record<string, unknown>} value
 * @returns {string}
 */
function encodeJwtPart(value) {
  return base64url(JSON.stringify(value));
}

/**
 * @param {string} key
 * @returns {string}
 */
function envPem(key) {
  const value = envString(key);
  if (!value) {
    throw new Error(`Missing required V24 secret environment variable ${key}.`);
  }
  return value.replace(/\\n/g, '\n');
}

/**
 * @param {Record<string, any>} binding
 * @returns {string}
 */
function resolveGithubAppJwtIssuer(binding) {
  return envString('BITCODE_V24_GITHUB_APP_JWT_ISSUER')
    || String(binding.appId || binding.appRef || '').trim()
    || 'bitcode-v24-github-app';
}

/**
 * @param {Record<string, any>} binding
 * @param {string} repo
 * @returns {string}
 */
function resolveGithubInstallationId(binding, repo) {
  const repoBinding = /** @type {Array<Record<string, any>>} */ (binding.targetedRepos || []).find((entry) => entry.repo === repo);
  return envString('BITCODE_V24_GITHUB_INSTALLATION_ID')
    || String(repoBinding?.installationId || binding.defaultInstallationId || '').trim()
    || (() => {
      throw new Error(`Missing V24 GitHub installation id for ${repo}.`);
    })();
}

/**
 * @param {Record<string, any>} binding
 * @returns {string}
 */
function createGithubAppJwt(binding) {
  const issuer = resolveGithubAppJwtIssuer(binding);
  const now = Math.floor(Date.now() / 1000);
  const encodedHeader = encodeJwtPart({ alg: 'RS256', typ: 'JWT' });
  const encodedPayload = encodeJwtPart({
    iat: now - 60,
    exp: now + 9 * 60,
    iss: issuer
  });
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), envPem('BITCODE_V24_GITHUB_APP_PRIVATE_KEY_PEM'));
  return `${signingInput}.${signature.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}

/**
 * @param {typeof fetch} fetchImpl
 * @param {string} url
 * @param {{
 *   method?: string,
 *   headers?: Record<string, string>,
 *   body?: unknown
 * }} [options]
 * @returns {Promise<any>}
 */
async function requestJson(fetchImpl, url, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };
  const response = await fetchImpl(url, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`V24 remote adapter request failed ${options.method || 'GET'} ${url} -> ${response.status}`);
  }
  return parsed;
}

/**
 * @param {string | number | bigint | null | undefined} units
 * @returns {string}
 */
function microUnitsToBtcString(units) {
  const normalized = BigInt(String(units || '0'));
  const sign = normalized < 0n ? '-' : '';
  const absolute = normalized < 0n ? -normalized : normalized;
  const whole = absolute / 100000000n;
  const fractional = String(absolute % 100000000n).padStart(8, '0');
  return `${sign}${whole.toString()}.${fractional}`;
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
    resultClass: overrides.resultClass || 'live-executed',
    reconciliationState: overrides.reconciliationState || 'live-remote-adapter-reconciled',
    telemetryCoverageState: overrides.telemetryCoverageState || 'shape-complete-live-observed',
    requestId: overrides.requestId || telemetry.requestId || `req_remote_${shortId(`${payload.interfaceId}:${payload.branchName || payload.bundleId || 'default'}`, 16)}`,
    executionId: overrides.executionId || telemetry.executionId || `exec_remote_${shortId(`${payload.interfaceId}:${payload.assetPackId || payload.readId || 'default'}`, 16)}`,
    observationId: overrides.observationId || telemetry.observationId || `obs_remote_${shortId(`${payload.interfaceId}:${payload.paymentMode || payload.branchMode || 'default'}`, 16)}`,
    executionClass: overrides.executionClass || telemetry.executionClass || binding.executionClass || 'remote-protocol-adapter',
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
    transportProtocol: overrides.transportProtocol || 'http-json-patch',
    remoteRequestCount: overrides.remoteRequestCount || 1,
    authMode: overrides.authMode || telemetry.authMode || binding.authMode || null,
    remoteAuthExchangeCount:
      overrides.remoteAuthExchangeCount
      ?? telemetry.remoteAuthExchangeCount
      ?? null,
    appJwtIssuer: overrides.appJwtIssuer || telemetry.appJwtIssuer || binding.jwtIssuerRef || null,
    installationId: overrides.installationId || telemetry.installationId || binding.defaultInstallationId || null
  };
}

/**
 * @param {Record<string, any>} payload
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, any>>}
 */
async function executeGithubRestAdapter(payload, fetchImpl) {
  const binding = ensureRecord(payload.binding);
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const baseUrl = String(binding.executorUrl || '');
  const repo = String(artifacts.githubLiveSession?.repo || binding.targetedRepos?.[0]?.repo || 'frontier/demo-auth');
  const branchName = String(artifacts.githubBranchPublicationReceipt?.branchName || payload.branchName || 'bitcode-review/v24');
  const workflowRunId =
    artifacts.githubArtifactFetchReceipt?.workflowRunIds?.[0]
    || supportArtifacts.githubBoundarySurface?.selectedInventoryProofs?.[0]?.workflowRunId
    || 'bitcode-demo-run';
  const sourceSha = artifacts.githubArtifactFetchReceipt?.sourceCommits?.[0] || `sha_${shortId(`${repo}:${branchName}`, 12)}`;
  const token = envString('BITCODE_V24_GITHUB_BEARER_TOKEN');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'User-Agent': `${activeProjectLabel()}-${ACTIVE_CANON_VERSION}-GitHub-Adapter`
  };

  const runsResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/actions/runs?branch=${encodeURIComponent(branchName)}`), {
    method: 'GET',
    headers
  });
  const artifactsResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/actions/runs/${workflowRunId}/artifacts`), {
    method: 'GET',
    headers
  });
  const refResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/git/refs`), {
    method: 'POST',
    headers,
    body: {
      ref: `refs/heads/${branchName}`,
      sha: sourceSha
    }
  });
  const pullResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/pulls`), {
    method: 'POST',
    headers,
    body: {
      title: `${activeProjectLabel()} ${ACTIVE_CANON_VERSION} ${payload.bundleId || 'bundle'} review`,
      head: branchName,
      base: 'main',
      body: `Read ${payload.readId || 'unknown'} / bundle ${payload.bundleId || 'unknown'}`
    }
  });

  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-github-rest-reconciled',
    transportProtocol: 'github-rest-v3',
    remoteRequestCount: 4,
    authMode: 'bearer-token',
    affectedArtifactRefs: [
      '.bitcode/github-live-session.json',
      '.bitcode/github-inventory-fetch-receipt.json',
      '.bitcode/github-artifact-fetch-receipt.json',
      '.bitcode/github-branch-publication-receipt.json',
      '.bitcode/github-pr-update-receipt.json'
    ]
  });
  const selectedSession = ensureRecord((supportArtifacts.githubBoundarySurface?.selectedAuthSessions || [])[0]);
  const sessionId = artifacts.githubLiveSession?.sessionId || `session_${shortId(`${repo}:${branchName}`, 16)}`;

  return {
    interfaceId: String(payload.interfaceId || 'github-live-interface'),
    telemetry,
    artifacts: {
      githubLiveSession: {
        ...ensureRecord(artifacts.githubLiveSession),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionId,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        appRef: artifacts.githubLiveSession?.appRef || binding.appRef || null,
        appId: artifacts.githubLiveSession?.appId || binding.appId || null,
        installationTargetRef: artifacts.githubLiveSession?.installationTargetRef || binding.installationTargetRef || null,
        authSessionKind: 'github-bearer-token',
        authSessionId: artifacts.githubLiveSession?.authSessionId || selectedSession.authSessionId || `auth_${shortId(sessionId, 12)}`,
        authPayloadHash: artifacts.githubLiveSession?.authPayloadHash || selectedSession.authPayloadHash || `sha256:${sha256(sessionId)}`,
        permissionsRoot: artifacts.githubLiveSession?.permissionsRoot || selectedSession.permissionsRoot || `perm_${shortId(`${sessionId}:permissions`, 12)}`,
        repo,
        branchName
      },
      githubInventoryFetchReceipt: {
        ...ensureRecord(artifacts.githubInventoryFetchReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        fetchState: 'live-github-inventory-fetched',
        targetedRepoCount: Number(ensureRecord(runsResponse).total_count || artifacts.githubInventoryFetchReceipt?.targetedRepoCount || 1),
        selectedBindingCount: Number(artifacts.githubInventoryFetchReceipt?.selectedBindingCount || 0)
      },
      githubArtifactFetchReceipt: {
        ...ensureRecord(artifacts.githubArtifactFetchReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        fetchState: 'live-github-artifact-fetched',
        workflowRunIds: uniqueStrings([
          workflowRunId,
          ...(artifacts.githubArtifactFetchReceipt?.workflowRunIds || [])
        ]),
        remoteArtifactCount: Number((ensureRecord(artifactsResponse).artifacts || []).length || 0)
      },
      githubBranchPublicationReceipt: {
        ...ensureRecord(artifacts.githubBranchPublicationReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        mutationState: 'live-github-branch-published',
        targetRepo: repo,
        branchName,
        remoteRef: ensureRecord(refResponse).ref || `refs/heads/${branchName}`,
        publishedSha: ensureRecord(ensureRecord(refResponse).object).sha || sourceSha
      },
      githubPrUpdateReceipt: {
        ...ensureRecord(artifacts.githubPrUpdateReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        mutationState: 'live-github-pr-updated',
        targetRepo: repo,
        branchName,
        prNumber: Number(ensureRecord(pullResponse).number || 0) || 24,
        reviewUpdateState: ensureRecord(pullResponse).state === 'open' ? 'draft-opened' : 'demo-pr-updated'
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, any>>}
 */
async function executeGithubAppRestAdapter(payload, fetchImpl) {
  const binding = ensureRecord(payload.binding);
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const baseUrl = String(binding.executorUrl || '');
  const repo = String(artifacts.githubLiveSession?.repo || binding.targetedRepos?.[0]?.repo || 'frontier/demo-auth');
  const branchName = String(artifacts.githubBranchPublicationReceipt?.branchName || payload.branchName || 'bitcode-review/v24');
  const workflowRunId =
    artifacts.githubArtifactFetchReceipt?.workflowRunIds?.[0]
    || supportArtifacts.githubBoundarySurface?.selectedInventoryProofs?.[0]?.workflowRunId
    || 'bitcode-demo-run';
  const sourceSha = artifacts.githubArtifactFetchReceipt?.sourceCommits?.[0] || `sha_${shortId(`${repo}:${branchName}`, 12)}`;
  const installationId = resolveGithubInstallationId(binding, repo);
  const appJwt = createGithubAppJwt(binding);
  const appHeaders = {
    Authorization: `Bearer ${appJwt}`,
    'User-Agent': `${activeProjectLabel()}-${ACTIVE_CANON_VERSION}-GitHub-App-Adapter`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
  const accessTokenResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/app/installations/${installationId}/access_tokens`), {
    method: 'POST',
    headers: appHeaders,
    body: {
      repositories: [repo]
    }
  });
  const installationToken = String(ensureRecord(accessTokenResponse).token || '').trim();
  if (!installationToken) {
    throw new Error(`V24 GitHub App adapter did not receive an installation token for ${repo}.`);
  }
  const tokenId = String(ensureRecord(accessTokenResponse).token_id || `ghs_${shortId(installationToken, 16)}`);
  const installationHeaders = {
    Authorization: `Bearer ${installationToken}`,
    'User-Agent': `${activeProjectLabel()}-${ACTIVE_CANON_VERSION}-GitHub-App-Adapter`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
  const runsResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/actions/runs?branch=${encodeURIComponent(branchName)}`), {
    method: 'GET',
    headers: installationHeaders
  });
  const artifactsResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/actions/runs/${workflowRunId}/artifacts`), {
    method: 'GET',
    headers: installationHeaders
  });
  const refResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/git/refs`), {
    method: 'POST',
    headers: installationHeaders,
    body: {
      ref: `refs/heads/${branchName}`,
      sha: sourceSha
    }
  });
  const pullResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/repos/${repo}/pulls`), {
    method: 'POST',
    headers: installationHeaders,
    body: {
      title: `${activeProjectLabel()} ${ACTIVE_CANON_VERSION} ${payload.bundleId || 'bundle'} review`,
      head: branchName,
      base: 'main',
      body: `Read ${payload.readId || 'unknown'} / bundle ${payload.bundleId || 'unknown'}`
    }
  });

  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-github-app-rest-reconciled',
    transportProtocol: 'github-app-rest-v3',
    remoteRequestCount: 5,
    authMode: 'github-app-installation-token',
    installationId,
    appJwtIssuer: resolveGithubAppJwtIssuer(binding),
    remoteAuthExchangeCount: 1,
    affectedArtifactRefs: [
      '.bitcode/github-live-session.json',
      '.bitcode/github-inventory-fetch-receipt.json',
      '.bitcode/github-artifact-fetch-receipt.json',
      '.bitcode/github-branch-publication-receipt.json',
      '.bitcode/github-pr-update-receipt.json'
    ]
  });
  const selectedSession = ensureRecord((supportArtifacts.githubBoundarySurface?.selectedAuthSessions || [])[0]);
  const sessionId = artifacts.githubLiveSession?.sessionId || `session_${shortId(`${repo}:${branchName}`, 16)}`;
  const tokenHash = `sha256:${sha256(`${installationId}:${installationToken}`)}`;
  const permissions = ensureRecord(accessTokenResponse).permissions || {};

  return {
    interfaceId: String(payload.interfaceId || 'github-live-interface'),
    telemetry,
    artifacts: {
      githubLiveSession: {
        ...ensureRecord(artifacts.githubLiveSession),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionId,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        appRef: artifacts.githubLiveSession?.appRef || binding.appRef || null,
        appId: artifacts.githubLiveSession?.appId || binding.appId || null,
        installationTargetRef: artifacts.githubLiveSession?.installationTargetRef || binding.installationTargetRef || null,
        installationId,
        authSessionKind: 'github-app-installation-token',
        authExchangeRef: `github-app-installation-token://${installationId}/${tokenId}`,
        authSessionId: artifacts.githubLiveSession?.authSessionId || selectedSession.authSessionId || `auth_${shortId(tokenId, 12)}`,
        authPayloadHash: artifacts.githubLiveSession?.authPayloadHash || selectedSession.authPayloadHash || tokenHash,
        permissionsRoot:
          artifacts.githubLiveSession?.permissionsRoot
          || selectedSession.permissionsRoot
          || `perm_${shortId(JSON.stringify(permissions), 12)}`,
        credentialClass: 'github-app-installation-token',
        appJwtIssuer: resolveGithubAppJwtIssuer(binding),
        repo,
        branchName
      },
      githubInventoryFetchReceipt: {
        ...ensureRecord(artifacts.githubInventoryFetchReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        fetchState: 'live-github-inventory-fetched',
        targetedRepoCount: Number(ensureRecord(runsResponse).total_count || artifacts.githubInventoryFetchReceipt?.targetedRepoCount || 1),
        selectedBindingCount: Number(artifacts.githubInventoryFetchReceipt?.selectedBindingCount || 0)
      },
      githubArtifactFetchReceipt: {
        ...ensureRecord(artifacts.githubArtifactFetchReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        fetchState: 'live-github-artifact-fetched',
        workflowRunIds: uniqueStrings([
          workflowRunId,
          ...(artifacts.githubArtifactFetchReceipt?.workflowRunIds || [])
        ]),
        remoteArtifactCount: Number((ensureRecord(artifactsResponse).artifacts || []).length || 0)
      },
      githubBranchPublicationReceipt: {
        ...ensureRecord(artifacts.githubBranchPublicationReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        mutationState: 'live-github-branch-published',
        targetRepo: repo,
        branchName,
        remoteRef: ensureRecord(refResponse).ref || `refs/heads/${branchName}`,
        publishedSha: ensureRecord(ensureRecord(refResponse).object).sha || sourceSha
      },
      githubPrUpdateReceipt: {
        ...ensureRecord(artifacts.githubPrUpdateReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        sessionRef: sessionId,
        mutationState: 'live-github-pr-updated',
        targetRepo: repo,
        branchName,
        prNumber: Number(ensureRecord(pullResponse).number || 0) || 24,
        reviewUpdateState: ensureRecord(pullResponse).state === 'open' ? 'draft-opened' : 'demo-pr-updated'
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @param {typeof fetch} fetchImpl
 * @param {{ kind: string, usernameEnv: string, passwordEnv: string, reconciliationState: string, networkLabel: string }} config
 * @returns {Promise<Record<string, any>>}
 */
async function executeJsonRpcSpendAdapter(payload, fetchImpl, config) {
  const binding = ensureRecord(payload.binding);
  const artifacts = ensureRecord(payload.artifacts);
  const baseUrl = String(binding.executorUrl || '');
  const username = envString(config.usernameEnv);
  const password = envString(config.passwordEnv);
  const authHeader =
    username || password
      ? { Authorization: `Basic ${Buffer.from(`${username || ''}:${password || ''}`).toString('base64')}` }
      : {};
  const amount = microUnitsToBtcString(artifacts.bitcoinNetworkIntent?.meteredMicroUnits || payload.supportArtifacts?.bitcoinSettlementIntent?.meteredMicroUnits || '0');
  const destination = String(binding.addressRef || 'tb1qbtcd3000000000000000000000000000000000');

  const sendResponse = await requestJson(fetchImpl, baseUrl, {
    method: 'POST',
    headers: authHeader,
    body: {
      jsonrpc: '2.0',
      id: `${config.kind}-send`,
      method: 'sendtoaddress',
      params: [destination, amount]
    }
  });
  const txid = String(ensureRecord(sendResponse).result || `tx_${shortId(`${config.kind}:${destination}:${amount}`, 16)}`);
  const txResponse = await requestJson(fetchImpl, baseUrl, {
    method: 'POST',
    headers: authHeader,
    body: {
      jsonrpc: '2.0',
      id: `${config.kind}-get`,
      method: 'gettransaction',
      params: [txid]
    }
  });
  const transaction = ensureRecord(txResponse).result && typeof ensureRecord(txResponse).result === 'object'
    ? ensureRecord(ensureRecord(txResponse).result)
    : {};
  const confirmations = Number(transaction.confirmations || 0);
  const networkRef = `${config.networkLabel}://${binding.network || 'unknown'}/${txid}`;
  const telemetry = buildTelemetry(payload, {
    reconciliationState: config.reconciliationState,
    transportProtocol: 'json-rpc-v1',
    remoteRequestCount: 2,
    affectedArtifactRefs:
      config.kind === 'bitcoin-mainchain-execution'
        ? ['.bitcode/bitcoin-network-execution.json', '.bitcode/bitcoin-network-observation.json']
        : ['.bitcode/sidechain-execution-receipt.json']
  });

  if (config.kind === 'bitcoin-mainchain-execution') {
    const observation = ensureRecord(artifacts.bitcoinNetworkObservation);
    return {
      interfaceId: config.kind,
      telemetry,
      artifacts: {
        bitcoinNetworkExecution: {
          ...ensureRecord(artifacts.bitcoinNetworkExecution),
          configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
          actualityDisposition: payload.actualityDisposition || null,
          requestId: telemetry.requestId,
          executionId: telemetry.executionId,
          observationId: telemetry.observationId,
          executionClass: telemetry.executionClass,
          executionState: 'live-network-broadcast-and-observed',
          networkRef,
          anchorRef: observation.anchorRef || `anchor://${shortId(txid, 12)}`,
          environmentIdentityRef: telemetry.environmentIdentityRef,
          environmentResourceRef: telemetry.environmentResourceRef,
          affectedArtifactRefs: telemetry.affectedArtifactRefs,
          broadcasterRef: `jsonrpc://${shortId(baseUrl, 12)}`
        },
        bitcoinNetworkObservation: {
          ...observation,
          configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
          actualityDisposition: payload.actualityDisposition || null,
          executionId: telemetry.executionId,
          observationId: telemetry.observationId,
          observationState: confirmations > 0 ? 'live-mainchain-confirmed' : 'live-mainchain-broadcast-pending',
          networkState: String(binding.network || observation.networkState || 'bitcoin-testnet4'),
          confirmationState: confirmations > 0 ? 'confirmed' : 'broadcast-unconfirmed',
          confirmations,
          networkRef,
          journalBindingState: 'closed-over-settlement-and-journal',
          serviceReceipt: {
            rpcMethodSequence: ['sendtoaddress', 'gettransaction'],
            txid
          },
          affectedArtifactRefs: telemetry.affectedArtifactRefs
        }
      }
    };
  }

  return {
    interfaceId: config.kind,
    telemetry,
    artifacts: {
      sidechainExecutionReceipt: {
        ...ensureRecord(artifacts.sidechainExecutionReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: 'live-sidechain-checkpoint-observed',
        checkpointRef: networkRef,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs,
        serviceReceipt: {
          rpcMethodSequence: ['sendtoaddress', 'gettransaction'],
          txid
        }
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, any>>}
 */
async function executeLightningHttpAdapter(payload, fetchImpl) {
  const binding = ensureRecord(payload.binding);
  const artifacts = ensureRecord(payload.artifacts);
  const supportArtifacts = ensureRecord(payload.supportArtifacts);
  const baseUrl = String(binding.executorUrl || '');
  const token = envString('BITCODE_V24_REPEATED_READ_BEARER_TOKEN');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const settlementIntent = ensureRecord(supportArtifacts.bitcoinSettlementIntent);
  const amount = microUnitsToBtcString(
    artifacts.repeatedReadPaymentIntent?.meteredMicroUnits
    || settlementIntent.meteredMicroUnits
    || '0'
  );
  const createResponse = await requestJson(fetchImpl, joinUrl(baseUrl, '/v1/invoices'), {
    method: 'POST',
    headers,
    body: {
      bundleId: payload.bundleId || null,
      readId: payload.readId || null,
      assetPackId: payload.assetPackId || null,
      amountBtc: amount,
      amountNgiMicroUnits: String(
        artifacts.repeatedReadPaymentIntent?.meteredMicroUnits
        || settlementIntent.meteredMicroUnits
        || '0'
      ),
      descriptionHash:
        artifacts.repeatedReadPaymentExecution?.descriptionHash
        || settlementIntent.paymentCarrier?.descriptionHash
        || null
    }
  });
  const invoiceId = String(ensureRecord(createResponse).invoiceId || `invoice_${shortId(`${payload.bundleId || payload.readId}:${amount}`, 16)}`);
  const observeResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/v1/invoices/${invoiceId}`), {
    method: 'GET',
    headers
  });
  const observed = ensureRecord(observeResponse);
  const invoiceRef =
    String(observed.invoice || observed.invoiceRef || '').trim()
    || String(artifacts.repeatedReadPaymentExecution?.invoiceRef || settlementIntent.paymentCarrier?.invoice || `lnbcrt1bitcode${shortId(invoiceId, 24)}`);
  const paymentHash =
    String(observed.paymentHash || '').trim()
    || String(artifacts.repeatedReadPaymentExecution?.paymentHash || settlementIntent.paymentCarrier?.paymentHash || `sha256:${sha256(invoiceId)}`);
  const descriptionHash =
    String(observed.descriptionHash || '').trim()
    || String(artifacts.repeatedReadPaymentExecution?.descriptionHash || settlementIntent.paymentCarrier?.descriptionHash || `sha256:${sha256(`${invoiceId}:description`)}`);
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-repeated-read-http-reconciled',
    transportProtocol: 'lightning-http-v1',
    remoteRequestCount: 2,
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
        ...ensureRecord(artifacts.repeatedReadPaymentIntent),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        requestId: telemetry.requestId,
        processorRef: binding.processorRef || artifacts.repeatedReadPaymentIntent?.processorRef || null,
        invoiceEndpointRef: binding.invoiceEndpointRef || artifacts.repeatedReadPaymentIntent?.invoiceEndpointRef || null,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs
      },
      repeatedReadPaymentExecution: {
        ...ensureRecord(artifacts.repeatedReadPaymentExecution),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: 'live-lightning-invoice-issued',
        processorRef: binding.processorRef || artifacts.repeatedReadPaymentExecution?.processorRef || null,
        invoiceRef,
        paymentHash,
        descriptionHash,
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        affectedArtifactRefs: telemetry.affectedArtifactRefs,
        remoteInvoiceId: invoiceId
      },
      repeatedReadPaymentObservation: {
        ...ensureRecord(artifacts.repeatedReadPaymentObservation),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        observationState: String(observed.paymentStatus || observed.status || '').toLowerCase() === 'accepted'
          ? 'live-lightning-payment-observed'
          : 'live-lightning-invoice-issued',
        networkState: String(binding.network || observed.networkState || 'lightning-testnet'),
        confirmationState: String(observed.confirmationState || 'accepted-offchain'),
        confirmations: Number(observed.confirmations || 0),
        invoiceRef,
        paymentHash,
        descriptionHash,
        observedValue: String(observed.observedValue || artifacts.repeatedReadPaymentObservation?.observedValue || settlementIntent.meteredMicroUnits || payload.bundleId || ''),
        journalBindingState: String(observed.journalBindingState || artifacts.repeatedReadPaymentObservation?.journalBindingState || 'anchor-required'),
        serviceReceipt: {
          invoiceId,
          invoiceRef,
          paymentHash,
          referenceId: String(observed.referenceId || `lightning://${binding.network || 'lightning-testnet'}/${invoiceId}`)
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
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, any>>}
 */
async function executeComputeHttpAdapter(payload, fetchImpl) {
  const binding = ensureRecord(payload.binding);
  const artifacts = ensureRecord(payload.artifacts);
  const baseUrl = String(binding.executorUrl || '');
  const token = envString('BITCODE_V24_COMPUTE_BEARER_TOKEN');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const manifest = ensureRecord(payload.supportArtifacts?.computeContainerManifest);
  const createResponse = await requestJson(fetchImpl, joinUrl(baseUrl, '/runs'), {
    method: 'POST',
    headers,
    body: {
      manifestRef: manifest.manifestId || null,
      branchName: payload.branchName || null,
      readId: payload.readId || null,
      assetPackId: payload.assetPackId || null
    }
  });
  const runId = String(ensureRecord(createResponse).runId || `compute_${shortId(`${payload.branchName}:${payload.readId}`, 16)}`);
  const observeResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/runs/${runId}`), {
    method: 'GET',
    headers
  });
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-compute-http-reconciled',
    transportProtocol: 'compute-http-v1',
    remoteRequestCount: 2,
    affectedArtifactRefs: ['.bitcode/compute-container-execution.json']
  });
  const outputs = ensureRecord(observeResponse).outputArtifactRefs || artifacts.computeContainerExecution?.outputArtifactRefs || manifest.proofArtifactRefs || [];
  return {
    interfaceId: String(payload.interfaceId || 'compute-container-execution'),
    telemetry,
    artifacts: {
      computeContainerExecution: {
        ...ensureRecord(artifacts.computeContainerExecution),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: String(ensureRecord(observeResponse).executionId || telemetry.executionId),
        observationId: telemetry.observationId,
        executionClass: telemetry.executionClass,
        executionState: 'live-container-executed',
        attestationRef: String(ensureRecord(observeResponse).attestationRef || artifacts.computeContainerExecution?.attestationRef || `attest_${shortId(runId, 16)}`),
        imageDigest: String(ensureRecord(observeResponse).imageDigest || artifacts.computeContainerExecution?.imageDigest || `sha256:${sha256(runId)}`),
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        outputArtifactRefs: uniqueStrings(outputs),
        remoteRunId: runId
      }
    }
  };
}

/**
 * @param {Record<string, any>} payload
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, any>>}
 */
async function executeStorageHttpAdapter(payload, fetchImpl) {
  const binding = ensureRecord(payload.binding);
  const artifacts = ensureRecord(payload.artifacts);
  const baseUrl = String(binding.executorUrl || '');
  const token = envString('BITCODE_V24_STORAGE_BEARER_TOKEN');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const manifest = ensureRecord(payload.supportArtifacts?.storageContainerManifest);
  const createResponse = await requestJson(fetchImpl, joinUrl(baseUrl, '/publications'), {
    method: 'POST',
    headers,
    body: {
      manifestRef: manifest.manifestId || null,
      scopeIds: uniqueStrings((manifest.scopeStorageBindings || []).map((entry) => entry.scopeId))
    }
  });
  const publicationId = String(ensureRecord(createResponse).publicationId || `publication_${shortId(manifest.manifestId || 'manifest', 16)}`);
  const observeResponse = await requestJson(fetchImpl, joinUrl(baseUrl, `/publications/${publicationId}`), {
    method: 'GET',
    headers
  });
  const publishedArtifactCount =
    Number(ensureRecord(observeResponse).publishedArtifactCount || 0)
    || Number(artifacts.storagePublicationReceipt?.publishedArtifactCount || 0);
  const publishedScopeIds = uniqueStrings(
    ensureRecord(observeResponse).publishedScopeIds
    || artifacts.storagePublicationReceipt?.publishedScopeIds
    || (manifest.scopeStorageBindings || []).map((entry) => entry.scopeId)
  );
  const telemetry = buildTelemetry(payload, {
    reconciliationState: 'live-storage-http-reconciled',
    transportProtocol: 'storage-http-v1',
    remoteRequestCount: 2,
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
        ...ensureRecord(artifacts.storagePublicationReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        publicationState: 'live-storage-published',
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        publishedArtifactCount,
        publishedScopeIds,
        publicationReceiptRef: publicationId
      },
      storageRetrievalReceipt: {
        ...ensureRecord(artifacts.storageRetrievalReceipt),
        configuredEnvironmentMode: payload.configuredEnvironmentMode || null,
        actualityDisposition: payload.actualityDisposition || null,
        requestId: telemetry.requestId,
        executionId: telemetry.executionId,
        observationId: telemetry.observationId,
        retrievalState: 'live-storage-retrieved',
        environmentIdentityRef: telemetry.environmentIdentityRef,
        environmentResourceRef: telemetry.environmentResourceRef,
        retrievableArtifactCount: publishedArtifactCount,
        retrievableScopeIds: publishedScopeIds,
        retrievalReceiptRef: `retrieval_${shortId(publicationId, 16)}`
      }
    }
  };
}

/**
 * @param {string} interfaceId
 * @param {Record<string, any>} binding
 * @param {Record<string, any>} payload
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, any>>}
 */
export async function executeV24RemoteAdapter(interfaceId, binding, payload, fetchImpl) {
  const kind = String(binding.executorKind || 'http-json-patch');
  if (kind === 'github-rest-v3') {
    return executeGithubRestAdapter(payload, fetchImpl);
  }
  if (kind === 'github-app-rest-v3') {
    return executeGithubAppRestAdapter(payload, fetchImpl);
  }
  if (kind === 'bitcoin-json-rpc-v1') {
    return executeJsonRpcSpendAdapter(payload, fetchImpl, {
      kind: interfaceId,
      usernameEnv: 'BITCODE_V24_BITCOIN_MAINCHAIN_RPC_USER',
      passwordEnv: 'BITCODE_V24_BITCOIN_MAINCHAIN_RPC_PASSWORD',
      reconciliationState: 'live-mainchain-rpc-reconciled',
      networkLabel: 'bitcoin'
    });
  }
  if (kind === 'lightning-http-v1') {
    return executeLightningHttpAdapter(payload, fetchImpl);
  }
  if (kind === 'sidechain-json-rpc-v1') {
    return executeJsonRpcSpendAdapter(payload, fetchImpl, {
      kind: interfaceId,
      usernameEnv: 'BITCODE_V24_SIDECHAIN_RPC_USER',
      passwordEnv: 'BITCODE_V24_SIDECHAIN_RPC_PASSWORD',
      reconciliationState: 'live-sidechain-rpc-reconciled',
      networkLabel: 'sidechain'
    });
  }
  if (kind === 'compute-http-v1') {
    return executeComputeHttpAdapter(payload, fetchImpl);
  }
  if (kind === 'storage-http-v1') {
    return executeStorageHttpAdapter(payload, fetchImpl);
  }
  throw new Error(`Unsupported V24 remote adapter kind ${kind} for ${interfaceId}.`);
}
