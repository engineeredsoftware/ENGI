// @ts-check

/**
 * @typedef {import('node:http').IncomingMessage} IncomingMessage
 * @typedef {import('node:http').ServerResponse<IncomingMessage>} ServerResponse
 * @typedef {import('node:http').Server} HttpServer
 * @typedef {import('node:net').AddressInfo} AddressInfo
 *
 * @typedef {Error & { statusCode?: number | undefined }} StatusError
 *
 * @typedef {{
 *   authSessionId: string,
 *   repo?: string | undefined,
 *   operatorLogin?: string | undefined,
 *   installationAccountLogin?: string | undefined,
 *   defaultRef?: string | undefined,
 *   defaultSignerAddress?: string | undefined,
 *   signingAlgorithm?: string | undefined,
 *   keySource?: string | undefined,
 *   installationId?: string | number | undefined
 * }} SessionShape
 *
 * @typedef {{
 *   inventoryEntryId: string,
 *   title: string | null,
 *   repo: string | null,
  *   content: string,
 *   originKind: string | null,
  *   sourcePath?: string | null | undefined,
 *   artifactName?: string | null | undefined,
  *   workflowRunId?: string | null | undefined,
  *   sourceCommit?: string | null | undefined,
  *   ref?: string | null | undefined,
  *   artifactKind?: string | null | undefined,
  *   artifactType?: string | null | undefined,
 *   tags?: string[] | null | undefined,
 *   sourcePaths?: string[] | null | undefined,
 *   declaredStacks?: string[] | null | undefined,
 *   declaredConstraints?: string[] | null | undefined,
  *   previewSurface?: string | null | undefined,
  *   workflowPath?: string | null | undefined,
  *   workflowJobName?: string | null | undefined,
 *   signerAddress?: string | null | undefined,
 *   summary?: string | null | undefined,
 *   owner?: string | null | undefined,
 *   repoName?: string | null | undefined,
 *   repositoryId?: string | number | null | undefined,
 *   repositoryNodeId?: string | null | undefined,
 *   authSessionId?: string | null | undefined,
 *   installationId?: string | number | null | undefined,
 *   installationAccountLogin?: string | null | undefined,
 *   installationAccountId?: string | number | null | undefined,
 *   installationAccountNodeId?: string | null | undefined,
 *   contentRoot?: string | null | undefined
 * }} RepoArtifactInventoryEntryShape
 *
 * @typedef {{
 *   assets: unknown[],
 *   buyers: unknown[],
 *   githubAppSessions: SessionShape[],
 *   repoArtifactInventory: RepoArtifactInventoryEntryShape[],
 *   ledger: { accounts: Record<string, string> },
 *   latestRun?: unknown,
 *   runHistory?: unknown[],
 *   specVersion?: string,
 *   readScenarios?: unknown[],
 *   policyState?: unknown,
 *   conformanceProfiles?: unknown
 * }} AppState
 *
 * @typedef {{
 *   inventoryEntryIds?: string[] | undefined,
 *   selectedInventoryEntryIds?: string[] | undefined,
 *   authSessionId?: string | undefined,
 *   content?: string | undefined,
 *   operatorNote?: string | undefined,
 *   title?: string | undefined,
 *   author?: string | undefined,
 *   visualPreview?: string | undefined,
 *   artifactKind?: string | undefined,
 *   artifactType?: string | undefined,
 *   organization?: string | undefined,
 *   sourceProvider?: string | undefined,
 *   sourceRepo?: string | undefined,
 *   sourceCommit?: string | undefined,
 *   sourceRef?: string | undefined,
 *   sourceBranch?: string | undefined,
 *   workflowRunId?: string | undefined,
 *   workflowPath?: string | undefined,
 *   workflowJobName?: string | undefined,
 *   signerAddress?: string | undefined,
 *   signingAlgorithm?: string | undefined,
 *   keySource?: string | undefined,
 *   installationId?: string | number | undefined,
 *   tags?: string[] | undefined,
 *   sourcePaths?: string[] | undefined,
 *   declaredStacks?: string[] | undefined,
 *   declaredConstraints?: string[] | undefined,
 *   testsPassed?: boolean | undefined,
 *   typecheckPassed?: boolean | undefined,
 *   staticAnalysisPassed?: boolean | undefined,
 *   benchmarkRan?: boolean | undefined,
 *   issuerPolicyStatus?: string | undefined,
 *   buyerId?: string | undefined,
 *   scenarioId?: string | undefined,
 *   branchMode?: string | undefined,
 *   paymentMode?: string | undefined,
 *   readReviewAction?: string | undefined,
 *   readReviewFeedback?: string[] | string | undefined,
 *   readReviewActorId?: string | undefined,
 *   readReviewDecisionMode?: string | undefined,
 *   reviewAction?: string | undefined,
 *   reviewFeedback?: string[] | string | undefined,
 *   actorId?: string | undefined,
 *   decisionMode?: string | undefined,
 *   principal?: string | undefined
 * }} RequestBodyShape
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildInitialState,
  makeCandidateAsset,
  measureReadFromScenario,
  publicState as buildPublicState,
  reviewReadForFitSearch,
  runMakeBitcodeBranch,
  SPEC_VERSION
} from './src/bitcode-runtime.js';
import { CURRENT_CANON_POSTURE } from './src/canon-posture.js';
import { buildBitcoinDemonstrationServiceDescriptor } from './src/canonical/v23-bitcoin-demonstration-service.js';
import {
  buildV24ExternalRealizationDescriptor,
  resolveV24ActiveExternalRuntime
} from './src/canonical/v24-external-realization.js';
import { realizeV24LiveExternalExecution } from './src/canonical/v24-live-execution.js';
import {
  buildV24LocalExecutorHandlers,
  executeV24LocalExecutor,
  getV24LocalExecutorInterfaceIdFromPath
} from './src/canonical/v24-local-executors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_PATH = path.join(__dirname, 'data', 'state.json');
const DEFAULT_PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_PORT = Number(process.env['PORT'] || 4318);
export const DEFAULT_BITCODE_DATA_PATH = DEFAULT_DATA_PATH;
export const DEFAULT_BITCODE_PUBLIC_DIR = DEFAULT_PUBLIC_DIR;
const ALLOWED_PROJECTION_PRINCIPALS = new Set(['public', 'buyer', 'reviewer', 'internal']);
const SOURCE_TO_SHARES_FIT_QUALITY_OC_ID = 'bitcode.source-to-shares.quantized-fit-quality-oc.v26';
const ALLOWED_BRANCH_MODES = new Set(['patch', 'context']);
const ALLOWED_PAYMENT_MODES = new Set([
  'audited-base-layer-purchase',
  'repeated-read-payment',
  'checkpointed-sidechain-bridge'
]);

/**
 * @param {string} targetPath
 * @param {unknown} value
 * @returns {void}
 */
function writeJsonAtomically(targetPath, value) {
  const directory = path.dirname(targetPath);
  const tempPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  const payload = JSON.stringify(value, null, 2);

  fs.mkdirSync(directory, { recursive: true });
  try {
    fs.writeFileSync(tempPath, payload);
    fs.renameSync(tempPath, targetPath);
  } catch (error) {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // Cleanup is best-effort; surface original write error.
    }
    throw error;
  }
}

/**
 * @param {AppState} state
 * @returns {{ nextState: AppState, changed: boolean }}
 */
function normalizeStateForCurrentCanon(state) {
  const nextState = {
    ...state,
    specVersion: SPEC_VERSION,
    canonPosture: CURRENT_CANON_POSTURE
  };
  const changed = state.specVersion !== SPEC_VERSION
    || JSON.stringify(state.canonPosture || null) !== JSON.stringify(CURRENT_CANON_POSTURE);
  return { nextState, changed };
}

export function createAppContext({
  dataPath = process.env['BITCODE_DATA_PATH'] || DEFAULT_DATA_PATH,
  publicDir = process.env['BITCODE_PUBLIC_DIR'] || DEFAULT_PUBLIC_DIR
} = {}) {
  const v24LocalExecutorHandlers = buildV24LocalExecutorHandlers();

  /**
   * @param {string} message
   * @returns {StatusError}
   */
  function badRequest(message) {
    /** @type {StatusError} */
    const error = new Error(message);
    error.statusCode = 400;
    return error;
  }

  /**
   * @param {readonly unknown[]} [values=[]]
   * @returns {string[]}
   */
  function uniqueStrings(values = []) {
    return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
  }

  /**
   * @param {RequestBodyShape} body
   * @param {{ sourceProvider: string, sourceRepo: string, sourceRef?: string | undefined, sourceCommit?: string | undefined, signerAddress?: string | undefined, operatorNote?: string | undefined }} input
   * @returns {string}
   */
  function buildRepositoryRevisionDepositContent(body, input) {
    const title = String(body.title || '').trim() || `Repository revision deposit: ${input.sourceRepo}`;
    return [
      'Bitcode repository revision deposit',
      `Title: ${title}`,
      `Provider: ${input.sourceProvider}`,
      `Repository: ${input.sourceRepo}`,
      `Branch: ${input.sourceRef || 'unspecified'}`,
      `Commit: ${input.sourceCommit || 'unspecified'}`,
      `Signer: ${input.signerAddress || 'unspecified'}`,
      input.operatorNote ? `Operator note: ${input.operatorNote}` : null,
      'Materialization: live VCS repository selection anchored by repository, branch, and commit.'
    ].filter(Boolean).join('\n');
  }

  /**
   * @param {string | null | undefined} repo
   * @returns {string}
   */
  function readRepositoryOwner(repo) {
    const owner = String(repo || '').split('/')[0]?.trim();
    return owner && owner !== String(repo || '').trim() ? owner : '';
  }

  /**
   * @param {unknown} principal
   * @returns {string | undefined}
   */
  function normalizePrincipal(principal) {
    const normalized = String(principal || '').trim().toLowerCase();
    if (!normalized) return undefined;
    if (!ALLOWED_PROJECTION_PRINCIPALS.has(normalized)) {
      throw badRequest(`Unsupported projection principal: ${principal}`);
    }
    return normalized;
  }

  /**
   * @param {unknown} branchMode
   * @returns {string | undefined}
   */
  function normalizeBranchMode(branchMode) {
    const normalized = String(branchMode || '').trim().toLowerCase();
    if (!normalized) return undefined;
    if (!ALLOWED_BRANCH_MODES.has(normalized)) {
      throw badRequest(`Unsupported branch mode: ${branchMode}`);
    }
    return normalized;
  }

  /**
   * @param {unknown} paymentMode
   * @returns {string | undefined}
   */
  function normalizePaymentMode(paymentMode) {
    const normalized = String(paymentMode || '').trim().toLowerCase();
    if (!normalized) return undefined;
    if (!ALLOWED_PAYMENT_MODES.has(normalized)) {
      throw badRequest(`Unsupported payment mode: ${paymentMode}`);
    }
    return normalized;
  }

  /**
   * @param {unknown} feedback
   * @returns {string[]}
   */
  function normalizeReviewFeedback(feedback) {
    if (Array.isArray(feedback)) return uniqueStrings(feedback);
    const normalized = String(feedback || '').trim();
    return normalized ? [normalized] : [];
  }

  /**
   * @param {AppState} state
   * @param {unknown} scenarioId
   * @returns {any}
   */
  function resolveReadReviewScenario(state, scenarioId) {
    const normalizedScenarioId = String(scenarioId || '').trim();
    const scenario = state.readScenarios?.find((entry) => String(/** @type {any} */ (entry)?.scenarioId || '') === normalizedScenarioId)
      || (!normalizedScenarioId ? state.readScenarios?.[0] : null);
    if (!scenario) throw badRequest('Read scenario not found.');
    return scenario;
  }

  /**
   * @param {AppState} state
   * @param {RequestBodyShape} body
   * @returns {Record<string, unknown>}
   */
  function buildReadReviewPayload(state, body = {}) {
    const scenario = resolveReadReviewScenario(state, body.scenarioId);
    const measurement = measureReadFromScenario(scenario);
    const reviewableRead = measurement.reviewableRead;
    const fitSearchAdmission = reviewableRead.fitSearchAdmission;
    return {
      ok: true,
      specVersion: SPEC_VERSION,
      protocolFocus: 'source-to-shares',
      reviewStage: reviewableRead.reviewStage,
      scenario: {
        scenarioId: scenario.scenarioId,
        scenarioFamily: scenario.scenarioFamily,
        repo: scenario.repo,
        baseRef: scenario.baseRef
      },
      measurement: {
        readId: measurement.readDescriptor.readId,
        task: measurement.readDescriptor.task,
        failureModes: measurement.readDescriptor.failureModes,
        constraints: measurement.readDescriptor.constraints,
        targetArtifactKinds: measurement.readDescriptor.targetArtifactKinds,
        closureCriteria: measurement.readDescriptor.closureCriteria,
        measurementHash: reviewableRead.measurementRefs?.measurementHash || null,
        reviewableReadRef: reviewableRead.reviewableReadHash || null
      },
      reviewableRead,
      allowedActions: reviewableRead.allowedActions,
      fitSearchAdmission,
      readFittingReview: buildReadFittingReviewPayload({
        scenario,
        measurement,
        reviewableRead,
        fitSearchAdmission
      }),
      nextProtocolAction: 'POST /api/read-review with action=accept|reject|remeasure-with-feedback'
    };
  }

  /**
   * @param {{
   *   scenario: unknown,
   *   measurement: Record<string, any>,
   *   reviewableRead: Record<string, any>,
   *   fitSearchAdmission?: Record<string, any> | undefined,
   *   reviewDecision?: Record<string, any> | null | undefined
   * }} input
   * @returns {Record<string, unknown>}
   */
  function buildReadFittingReviewPayload({
    scenario,
    measurement,
    reviewableRead,
    fitSearchAdmission = reviewableRead.fitSearchAdmission,
    reviewDecision = null
  }) {
    const scenarioRecord = /** @type {any} */ (scenario || {});
    const readDescriptor = /** @type {any} */ (measurement.readDescriptor || {});
    const measuredReadSnapshot = /** @type {any} */ (reviewableRead.measuredReadSnapshot || {});
    const blockedStages = fitSearchAdmission?.blockedStages || reviewableRead.fitSearchAdmission?.blockedStages || [];
    const admittedStages = fitSearchAdmission?.admittedStages || [];
    return {
      artifactKind: 'bitcode-read-fitting-review',
      protocolFocus: 'source-to-shares',
      scenarioId: scenarioRecord.scenarioId || null,
      scenarioFamily: scenarioRecord.scenarioFamily || null,
      readId: reviewableRead.readId || readDescriptor.readId || null,
      task: measuredReadSnapshot.task || readDescriptor.task || null,
      reviewStage: reviewableRead.reviewStage || 'post-measurement-pre-fit',
      status: reviewDecision?.status || reviewableRead.status || null,
      action: reviewDecision?.action || null,
      requiredAfter: reviewableRead.requiredAfter || 'read-measurement-synthesized',
      requiredBefore: reviewableRead.requiredBefore || 'find-fitting-settlement',
      allowedActions: reviewableRead.allowedActions || [],
      actionContracts: reviewableRead.actionContracts || {},
      reviewQuestions: reviewableRead.reviewQuestions || [],
      measurementHash: reviewableRead.measurementRefs?.measurementHash || null,
      reviewableReadRef: reviewableRead.reviewableReadHash || null,
      fitSearchAdmission: {
        admitted: fitSearchAdmission?.admitted === true,
        admissionReason: fitSearchAdmission?.admissionReason || null,
        untilAction: fitSearchAdmission?.untilAction || (fitSearchAdmission?.admitted ? null : 'accept'),
        admittedStages,
        blockedStages
      },
      settlementReview: {
        reviewStage: 'present-fit-for-settlement-review',
        quantizedObjectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
        requiredAfter: 'find-fitting-settlement-admitted',
        receiptCarryThrough: [
          'objectiveContractId',
          'sourceToSharesRef',
          'fitQualityHash',
          'receiptRefs',
          'qualityRows'
        ]
      },
      candidateFitRequirements: {
        requiredStages: [
          'candidate-recall',
          'find-fitting-settlement',
          'asset-pack-assembly',
          'present-fit-for-settlement-review'
        ],
        blockedStages,
        admittedStages,
        blockedUntil: fitSearchAdmission?.admitted === true ? null : 'Read review action=accept'
      },
      measuredReadSnapshot: {
        failureModes: measuredReadSnapshot.failureModes || readDescriptor.failureModes || [],
        constraints: measuredReadSnapshot.constraints || readDescriptor.constraints || [],
        targetArtifactKinds: measuredReadSnapshot.targetArtifactKinds || readDescriptor.targetArtifactKinds || [],
        closureCriteria: measuredReadSnapshot.closureCriteria || readDescriptor.closureCriteria || []
      }
    };
  }

  /**
   * @returns {{ bootstrapped: boolean, reason?: string, assetCount?: number, buyerCount?: number }}
   */
  function ensureState() {
    if (!fs.existsSync(dataPath)) {
      writeJsonAtomically(dataPath, buildInitialState());
      return { bootstrapped: true, reason: 'missing-file' };
    }
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (!Array.isArray(raw.assets) || !Array.isArray(raw.buyers) || !Array.isArray(raw.githubAppSessions) || !Array.isArray(raw.repoArtifactInventory) || !raw.ledger?.accounts) {
      writeJsonAtomically(dataPath, buildInitialState());
      return { bootstrapped: true, reason: 'incomplete-state' };
    }
    const { nextState, changed } = normalizeStateForCurrentCanon(raw);
    if (changed) {
      writeJsonAtomically(dataPath, nextState);
      return {
        bootstrapped: false,
        reason: 'canon-posture-sync',
        assetCount: nextState.assets.length,
        buyerCount: nextState.buyers.length
      };
    }
    return { bootstrapped: false, assetCount: raw.assets.length, buyerCount: raw.buyers.length };
  }

  /**
   * @returns {AppState}
   */
  function readState() {
    ensureState();
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  /**
   * @param {AppState} state
   * @returns {{ ok: true }}
   */
  function writeState(state) {
    writeJsonAtomically(dataPath, state);
    return { ok: true };
  }

  /**
   * @param {ServerResponse} res
   * @param {number} status
   * @param {unknown} payload
   * @returns {void}
   */
  function sendJson(res, status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload, null, 2));
  }

  /**
   * @param {IncomingMessage} req
   * @returns {Promise<RequestBodyShape>}
   */
  function readBody(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
        if (data.length > 1_000_000) {
          /** @type {StatusError} */
          const error = new Error('Body too large.');
          error.statusCode = 413;
          reject(error);
          req.destroy();
        }
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          /** @type {StatusError} */
          const error = new Error('Invalid JSON body.');
          error.statusCode = 400;
          reject(error);
        }
      });
      req.on('error', reject);
    });
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns {void}
   */
  function serveStatic(req, res) {
    const pathname = req.url === '/' ? '/index.html' : (req.url || '/index.html');
    const safePath = path.normalize(path.join(publicDir, pathname));
    if (!safePath.startsWith(publicDir) || !fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(safePath);
    const contentType = ext === '.html'
      ? 'text/html'
      : ext === '.css'
        ? 'text/css'
        : ext === '.svg'
          ? 'image/svg+xml'
          : 'application/javascript';
    const shouldAppendCharset = contentType.startsWith('text/') || contentType === 'application/javascript';
    res.writeHead(200, { 'Content-Type': shouldAppendCharset ? `${contentType}; charset=utf-8` : contentType });
    res.end(fs.readFileSync(safePath));
  }

  /**
   * @param {AppState} state
   * @param {RequestBodyShape} body
   * @returns {Record<string, unknown>}
   */
  function buildDepositInput(state, body) {
    const inventoryEntryIds = uniqueStrings(body.inventoryEntryIds || body.selectedInventoryEntryIds || []);
    /** @type {RepoArtifactInventoryEntryShape[]} */
    const selectedInventoryEntries = inventoryEntryIds
      .map((entryId) => state.repoArtifactInventory.find((entry) => entry.inventoryEntryId === entryId))
      .filter((entry) => !!entry);
    if (inventoryEntryIds.length && selectedInventoryEntries.length !== inventoryEntryIds.length) {
      /** @type {StatusError} */
      const error = new Error('One or more selected repo artifacts could not be resolved.');
      error.statusCode = 400;
      throw error;
    }

    const authSessionId = String(body.authSessionId || '').trim();
    const authSession = authSessionId
      ? state.githubAppSessions.find((session) => session.authSessionId === authSessionId)
      : null;
    if (inventoryEntryIds.length && !authSession) {
      /** @type {StatusError} */
      const error = new Error('Authenticated repo session is required for repo artifact selection.');
      error.statusCode = 400;
      throw error;
    }

    const selectedRepos = uniqueStrings(selectedInventoryEntries.map((entry) => entry.repo));
    if (selectedRepos.length > 1) {
      /** @type {StatusError} */
      const error = new Error('The initial V11 intake flow only supports selecting repo artifacts from one repository at a time.');
      error.statusCode = 400;
      throw error;
    }
    if (authSession && selectedRepos.length === 1 && authSession.repo !== selectedRepos[0]) {
      /** @type {StatusError} */
      const error = new Error('Selected repo artifacts must match the authenticated repo session.');
      error.statusCode = 400;
      throw error;
    }

    const operatorNote = String(body.operatorNote || '').trim();
    const sourceProvider = String(body.sourceProvider || 'github').trim() || 'github';
    const sourceRepo = String(body.sourceRepo || body.repo || '').trim() || authSession?.repo || selectedInventoryEntries[0]?.repo || '';
    const sourceRef = String(body.sourceRef || body.sourceBranch || '').trim()
      || authSession?.defaultRef
      || selectedInventoryEntries.find((entry) => entry.ref)?.ref
      || undefined;
    const sourceCommit = String(body.sourceCommit || '').trim()
      || selectedInventoryEntries.find((entry) => entry.sourceCommit)?.sourceCommit
      || undefined;
    const signerAddress = String(body.signerAddress || '').trim()
      || authSession?.defaultSignerAddress
      || selectedInventoryEntries.find((entry) => entry.signerAddress)?.signerAddress
      || undefined;
    const hasRepositoryRevisionSelection = Boolean(
      !selectedInventoryEntries.length &&
        sourceRepo &&
        sourceRef &&
        sourceCommit,
    );
    const rawContent = String(body.content || '').trim();
    let content = rawContent;
    if (selectedInventoryEntries.length) {
      const sections = selectedInventoryEntries.map((entry) => {
        const addressRef = entry.sourcePath || entry.artifactName || entry.workflowRunId || entry.sourceCommit || 'repo artifact';
        return `[${entry.originKind}] ${entry.title}\nRepo: ${entry.repo}\nAddress: ${addressRef}\n${entry.content}`;
      });
      if (operatorNote) sections.push(`Operator note\n${operatorNote}`);
      else if (rawContent) sections.push(`Raw fallback supplement\n${rawContent}`);
      content = sections.join('\n\n---\n\n');
    } else if (!content && hasRepositoryRevisionSelection) {
      content = buildRepositoryRevisionDepositContent(body, {
        sourceProvider,
        sourceRepo,
        sourceRef,
        sourceCommit,
        signerAddress,
        operatorNote
      });
    }
    if (!String(content || '').trim()) {
      /** @type {StatusError} */
      const error = new Error('Raw content or repo artifact selection is required.');
      error.statusCode = 400;
      throw error;
    }

    const inferredKinds = uniqueStrings(selectedInventoryEntries.map((entry) => entry.artifactKind));
    const inferredTypes = uniqueStrings(selectedInventoryEntries.map((entry) => entry.artifactType));
    const title = String(body.title || '').trim()
      || (selectedInventoryEntries.length === 1
        ? (selectedInventoryEntries[0]?.title || '')
        : selectedInventoryEntries.length
          ? `Repo artifact bundle · ${sourceRepo}`
          : hasRepositoryRevisionSelection
            ? `Repository revision deposit · ${sourceRepo}`
          : '');
    if (!title) {
      /** @type {StatusError} */
      const error = new Error('Title is required.');
      error.statusCode = 400;
      throw error;
    }
    const author = String(body.author || '').trim()
      || authSession?.operatorLogin
      || authSession?.installationAccountLogin
      || (hasRepositoryRevisionSelection ? readRepositoryOwner(sourceRepo) : '')
      || signerAddress
      || '';
    if (!author) {
      /** @type {StatusError} */
      const error = new Error('Author is required.');
      error.statusCode = 400;
      throw error;
    }

    const visualPreview = String(body.visualPreview || '').trim()
      || selectedInventoryEntries.map((entry) => entry.previewSurface).filter(Boolean).join('\n');

    return {
      title,
      author,
      organization: body.organization || '$BTD',
      artifactKind: String(body.artifactKind || '').trim()
        || (inferredKinds.length === 1
          ? inferredKinds[0]
          : inferredKinds.length
            ? 'mixed'
            : hasRepositoryRevisionSelection
              ? 'repository-revision'
              : 'mixed'),
      artifactType: String(body.artifactType || '').trim()
        || (inferredTypes.length === 1
          ? inferredTypes[0]
          : hasRepositoryRevisionSelection
            ? 'vcs-source-anchor'
            : undefined),
      visualPreview,
      operatorNote,
      sourceProvider,
      sourceRepo,
      sourceCommit,
      sourceRef,
      workflowRunId: String(body.workflowRunId || '').trim() || selectedInventoryEntries.find((entry) => entry.workflowRunId)?.workflowRunId || undefined,
      workflowPath: String(body.workflowPath || '').trim() || selectedInventoryEntries.find((entry) => entry.workflowPath)?.workflowPath || undefined,
      workflowJobName: String(body.workflowJobName || '').trim() || selectedInventoryEntries.find((entry) => entry.workflowJobName)?.workflowJobName || undefined,
      signerAddress,
      signingAlgorithm: body.signingAlgorithm || authSession?.signingAlgorithm,
      keySource: body.keySource || authSession?.keySource,
      installationId: body.installationId || authSession?.installationId,
      tags: uniqueStrings([...(body.tags || []), ...selectedInventoryEntries.flatMap((entry) => entry.tags || [])]),
      sourcePaths: uniqueStrings([...(body.sourcePaths || []), ...selectedInventoryEntries.flatMap((entry) => entry.sourcePaths || [])]),
      declaredStacks: uniqueStrings([...(body.declaredStacks || []), ...selectedInventoryEntries.flatMap((entry) => entry.declaredStacks || [])]),
      declaredConstraints: uniqueStrings([...(body.declaredConstraints || []), ...selectedInventoryEntries.flatMap((entry) => entry.declaredConstraints || [])]),
      inventoryEntries: selectedInventoryEntries,
      authSession,
      rawFallbackContent: rawContent,
      repositoryRevisionManifestUsed: hasRepositoryRevisionSelection && !rawContent,
      contentDerivedFromSelection: selectedInventoryEntries.length > 0,
      content,
      testsPassed: body.testsPassed !== false,
      typecheckPassed: body.typecheckPassed !== false,
      staticAnalysisPassed: body.staticAnalysisPassed !== false,
      benchmarkRan: body.benchmarkRan !== false,
      issuerPolicyStatus: body.issuerPolicyStatus || 'allowed'
    };
  }

  /**
   * @param {string | undefined} principal
   * @returns {AppState}
   */
  function getState(principal) {
    return buildPublicState(readState(), normalizePrincipal(principal));
  }

  /**
   * @param {RequestBodyShape} body
   * @returns {Record<string, unknown>}
   */
  function getReadReview(body = {}) {
    return buildReadReviewPayload(readState(), body);
  }

  /**
   * @param {RequestBodyShape} body
   * @returns {Record<string, unknown>}
   */
  function reviewRead(body = {}) {
    const state = readState();
    const payload = buildReadReviewPayload(state, body);
    const action = String(body.readReviewAction || body.reviewAction || 'accept').trim() || 'accept';
    const feedback = normalizeReviewFeedback(body.readReviewFeedback || body.reviewFeedback || []);
    const readReview = reviewReadForFitSearch(/** @type {any} */ (payload.reviewableRead), {
      action,
      feedback,
      actorId: body.readReviewActorId || body.actorId || 'bitcode-terminal:read-review',
      decisionMode: body.readReviewDecisionMode || body.decisionMode || 'operator-review-api'
    });
    const reviewDecision = /** @type {any} */ (readReview).reviewDecision || {};
    const historyEntry = {
      reviewId: `read_review_${Date.now().toString(36)}`,
      protocolFocus: 'source-to-shares',
      scenario: payload.scenario,
      measurement: payload.measurement,
      action: reviewDecision.action,
      status: readReview.status,
      fitSearchAdmission: readReview.fitSearchAdmission,
      actorId: reviewDecision.actorId,
      decisionMode: reviewDecision.decisionMode,
      feedback,
      readReview,
      createdAt: new Date().toISOString()
    };
    const stateRecord = /** @type {any} */ (state);
    writeState({
      ...state,
      latestReadReview: historyEntry,
      readReviewHistory: [...(Array.isArray(stateRecord.readReviewHistory) ? stateRecord.readReviewHistory : []), historyEntry].slice(-20)
    });

    return {
      ...payload,
      ok: true,
      readReview,
      reviewDecision,
      fitSearchAdmission: readReview.fitSearchAdmission,
      readFittingReview: buildReadFittingReviewPayload({
        scenario: payload.scenario,
        measurement: { readDescriptor: payload.measurement },
        reviewableRead: /** @type {any} */ (payload.reviewableRead),
        fitSearchAdmission: readReview.fitSearchAdmission,
        reviewDecision
      }),
      stateWrite: {
        latestReadReviewRef: historyEntry.reviewId,
        fitSearchAdmitted: readReview.fitSearchAdmission?.admitted === true
      },
      nextProtocolAction: readReview.fitSearchAdmission?.admitted
        ? 'POST /api/make-bitcode-branch'
        : action === 'remeasure-with-feedback'
          ? 'GET /api/read-review after revising the Read measurement input'
          : 'Select a different Read or reject this source-to-shares fit search'
    };
  }

  /**
   * @param {RequestBodyShape} body
   * @returns {{ ok: true, asset: unknown }}
   */
  function createDeposit(body) {
    const state = readState();
    const asset = makeCandidateAsset(buildDepositInput(state, body));

    state.assets.unshift(asset);
    state.ledger.accounts[`supplier:${asset.assetId}:pending_claims`] = '0';
    if (asset.depositoryEvidence?.depositorBoundary?.walletId) {
      const depositorAssetsKey = `depositor:${asset.depositoryEvidence.depositorBoundary.walletId}:deposited_assets`;
      const priorDepositorAssetCount = Number(state.ledger.accounts[depositorAssetsKey] || '0');
      state.ledger.accounts[depositorAssetsKey] = String(
        Number.isFinite(priorDepositorAssetCount) ? priorDepositorAssetCount + 1 : 1
      );
      if (asset.depositoryEvidence?.compensationPreview?.state === 'eligible-if-selected-for-assetpack') {
        const compensationRoutesKey = `depositor:${asset.depositoryEvidence.depositorBoundary.walletId}:eligible_compensation_routes`;
        const priorRouteCount = Number(state.ledger.accounts[compensationRoutesKey] || '0');
        state.ledger.accounts[compensationRoutesKey] = String(
          Number.isFinite(priorRouteCount) ? priorRouteCount + 1 : 1
        );
      }
    }
    writeState(state);
    return { ok: true, asset, depositoryEvidence: asset.depositoryEvidence || null };
  }

  /**
   * @param {RequestBodyShape} body
   * @returns {Promise<{ ok: true, specVersion: string, latestRun: unknown, ledger: AppState['ledger'], runHistory: unknown[] | undefined }>}
   */
  async function makeBitcodeBranch(body) {
    const state = readState();
    const principal = normalizePrincipal(body.principal || undefined);
    const branchMode = normalizeBranchMode(body.branchMode);
    const paymentMode = normalizePaymentMode(body.paymentMode);
    const scenarioId = String(body.scenarioId || '').trim() || undefined;
    const buyerId = String(body.buyerId || '').trim() || undefined;
    if (buyerId && !state.buyers.some((buyer) => String(/** @type {any} */ (buyer)?.buyerId || '') === buyerId)) {
      throw badRequest('Buyer not found.');
    }
    if (scenarioId && !state.readScenarios?.some((scenario) => String(/** @type {any} */ (scenario)?.scenarioId || '') === scenarioId)) {
      throw badRequest('Read scenario not found.');
    }
    const branchRequest = {
      buyerId,
      scenarioId,
      branchMode,
      paymentMode,
      readReviewAction: body.readReviewAction || body.reviewAction,
      readReviewFeedback: body.readReviewFeedback || body.reviewFeedback,
      readReviewActorId: body.readReviewActorId || body.actorId,
      readReviewDecisionMode: body.readReviewDecisionMode || body.decisionMode
    };
    const { nextState, latestRun } = runMakeBitcodeBranch(state, branchRequest);
    const stateRecord = /** @type {any} */ (state);
    const realizedLatestRun = await realizeV24LiveExternalExecution(latestRun, {
      executorHandlers: v24LocalExecutorHandlers,
      priorLatestRun: stateRecord.latestRun || null,
      priorExternalExecutionLedger: stateRecord.externalExecutionLedger || null
    });
    const realizedRunRecord = /** @type {any} */ (realizedLatestRun);
    const priorReconciliationLog = Array.isArray(stateRecord.externalReconciliationLog) ? stateRecord.externalReconciliationLog : [];
    const persistedState = {
      ...nextState,
      latestRun: realizedLatestRun,
      externalExecutionLedger: realizedRunRecord.externalExecutionLedger || stateRecord.externalExecutionLedger || null,
      externalReconciliationLog: realizedRunRecord.externalReconciliationLog
        ? [...priorReconciliationLog.slice(-31), realizedRunRecord.externalReconciliationLog]
        : priorReconciliationLog
    };
    writeState(persistedState);
    const projectedState = buildPublicState(persistedState, principal);
    return {
      ok: true,
      specVersion: SPEC_VERSION,
      latestRun: projectedState['latestRun'],
      ledger: persistedState.ledger,
      runHistory: persistedState.runHistory
    };
  }

  /**
   * @returns {{ ok: true, state: AppState }}
   */
  function resetState() {
    const state = buildInitialState();
    writeState(state);
    return { ok: true, state: buildPublicState(state) };
  }

  /**
   * @param {ServerResponse} res
   * @returns {void}
   */
  function sendDefaultState(res) {
    const state = readState();
    return sendJson(res, 200, { ok: true, state: buildPublicState(state) });
  }

  /**
   * @returns {{ ok: true, specVersion: string, service: unknown }}
   */
  function getBitcoinDemonstrationService() {
    return {
      ok: true,
      specVersion: SPEC_VERSION,
      service: buildBitcoinDemonstrationServiceDescriptor()
    };
  }

  /**
   * @param {{ environmentMode?: string | null | undefined }} [input]
   * @returns {{ ok: true, specVersion: string, externalRealization: unknown, activeRuntime: unknown }}
   */
  function getExternalRealization(input = {}) {
    const state = readState();
    const externalRealization = buildV24ExternalRealizationDescriptor({
      githubAppSessions: state.githubAppSessions
    });
    return {
      ok: true,
      specVersion: SPEC_VERSION,
      externalRealization,
      activeRuntime: resolveV24ActiveExternalRuntime(externalRealization, input)
    };
  }

  /**
   * @param {string} interfaceId
   * @param {RequestBodyShape} body
   * @returns {Promise<{ ok: true, interfaceId: string } & Record<string, unknown>>}
   */
  async function executeLocalExecutorById(interfaceId, body) {
    if (typeof v24LocalExecutorHandlers[interfaceId] !== 'function') {
      /** @type {StatusError} */
      const error = new Error('Unknown V24 executor interface.');
      error.statusCode = 404;
      throw error;
    }
    const execution = await executeV24LocalExecutor(interfaceId, body);
    return {
      ok: true,
      interfaceId,
      ...execution
    };
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns {Promise<void>}
   */
  async function handle(req, res) {
    try {
      if (req.method === 'GET' && req.url?.startsWith('/api/state')) {
        const url = new URL(req.url, 'http://127.0.0.1');
        const principal = normalizePrincipal(url.searchParams.get('principal') || undefined);
        if (!principal) return sendDefaultState(res);
        return sendJson(res, 200, getState(principal));
      }

      if (req.method === 'POST' && req.url === '/api/deposits') {
        const body = await readBody(req);
        return sendJson(res, 200, createDeposit(body));
      }

      if (req.method === 'POST' && req.url === '/api/make-bitcode-branch') {
        const body = await readBody(req);
        return sendJson(res, 200, await makeBitcodeBranch(body));
      }

      if (req.method === 'GET' && req.url?.startsWith('/api/read-review')) {
        const url = new URL(req.url, 'http://127.0.0.1');
        return sendJson(res, 200, getReadReview({
          scenarioId: url.searchParams.get('scenarioId') || undefined
        }));
      }

      if (req.method === 'POST' && req.url === '/api/read-review') {
        const body = await readBody(req);
        return sendJson(res, 200, reviewRead(body));
      }

      if (req.method === 'POST' && req.url === '/api/reset') {
        return sendJson(res, 200, resetState());
      }

      if (req.method === 'GET' && req.url === '/api/bitcoin-demonstration-service') {
        return sendJson(res, 200, getBitcoinDemonstrationService());
      }

      if (req.method === 'GET' && req.url?.startsWith('/api/external-realization')) {
        const url = new URL(req.url, 'http://127.0.0.1');
        return sendJson(
          res,
          200,
          getExternalRealization({
            environmentMode: url.searchParams.get('environmentMode'),
          }),
        );
      }

      if (req.method === 'POST' && req.url?.startsWith('/api/executors/')) {
        const url = new URL(req.url, 'http://127.0.0.1');
        const interfaceId = getV24LocalExecutorInterfaceIdFromPath(url.pathname);
        if (!interfaceId) {
          return sendJson(res, 404, { error: 'Unknown V24 executor interface.' });
        }
        const body = await readBody(req);
        return sendJson(res, 200, await executeLocalExecutorById(interfaceId, body));
      }

      if (req.method === 'GET' && req.url?.startsWith('/api/')) {
        return sendJson(res, 404, { error: 'Not found.' });
      }

      if (req.method === 'GET') {
        return serveStatic(req, res);
      }

      return sendJson(res, 404, { error: 'Not found.' });
    } catch (error) {
      const resolvedError = /** @type {StatusError} */ (error instanceof Error ? error : new Error('Unknown error.'));
      if (!resolvedError.statusCode && /No candidates survived into the asset pack/i.test(resolvedError.message || '')) {
        resolvedError.statusCode = 409;
      }
      if (!resolvedError.statusCode && /fit search cannot proceed/i.test(resolvedError.message || '')) {
        resolvedError.statusCode = 409;
      }
      return sendJson(res, resolvedError.statusCode || 500, { error: resolvedError.message || 'Unknown error.' });
    }
  }

  return {
    dataPath,
    publicDir,
    ensureState,
    readState,
    writeState,
    publicState: buildPublicState,
    getState,
    getReadReview,
    reviewRead,
    createDeposit,
    makeBitcodeBranch,
    resetState,
    getBitcoinDemonstrationService,
    getExternalRealization,
    executeLocalExecutorById,
    handle
  };
}

export async function createServer(options = {}) {
  const http = await import('node:http');
  const app = createAppContext(options);
  const server = http.createServer((req, res) => app.handle(req, res));
  return { app, server };
}

export async function startServer({ port = DEFAULT_PORT, host = '127.0.0.1', ...options } = {}) {
  const { app, server } = await createServer(options);
  app.ensureState();
  return new Promise((resolve) => {
    server.listen(port, host, () => {
      const address = server.address();
      const resolvedPort = typeof address === 'object' && address ? /** @type {AddressInfo} */ (address).port : port;
      resolve({ app, server, port: resolvedPort });
    });
  });
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const host = process.env['HOST'] || '127.0.0.1';
  startServer({ port: DEFAULT_PORT, host }).then(({ port }) => {
    console.log(`Bitcode demo listening on http://${host}:${port}`);
  });
}
