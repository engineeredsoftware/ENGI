/**
 * @jest-environment node
 */

type BitcodeAppContext = {
  getState(principal?: string): Record<string, any>;
  getReadReview(input?: Record<string, unknown>): Record<string, any>;
  reviewRead(input?: Record<string, unknown>): Record<string, any>;
  makeBitcodeBranch(input?: Record<string, unknown>): Promise<Record<string, any>>;
};

type BitcodeProtocolRuntime = {
  buildInitialState(): Record<string, any>;
  publicState(state: Record<string, any>, principal?: string): Record<string, any>;
  measureReadFromScenario(scenario: Record<string, any>): Record<string, any>;
  reviewReadForFitSearch(reviewableRead: Record<string, any>, input?: Record<string, unknown>): Record<string, any>;
  runMakeBitcodeBranch(state: Record<string, any>, input?: Record<string, unknown>): Record<string, any>;
};

async function readRequestBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  return text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
}

function mapBitcodeError(error: unknown) {
  const resolvedError =
    error instanceof Error ? (error as Error & { statusCode?: number }) : new Error('Unknown error.');
  const message = resolvedError.message || 'Unknown error.';
  const status =
    resolvedError.statusCode || (/Finding Fits cannot proceed/i.test(message) ? 409 : 500);

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBranchArtifact(latestRun: Record<string, any>, artifactPath: string) {
  const artifact = latestRun.branchArtifacts?.files?.[artifactPath];
  if (typeof artifact !== 'string') {
    throw new Error(`Missing branch artifact ${artifactPath}.`);
  }
  return JSON.parse(artifact) as Record<string, any>;
}

function buildCommercialRouteContext(protocol: BitcodeProtocolRuntime): BitcodeAppContext {
  let state = protocol.buildInitialState();

  const resolveScenario = (input?: Record<string, unknown>) => {
    const scenarioId = String(input?.scenarioId || '').trim();
    const scenario = state.readScenarios.find((entry: Record<string, any>) =>
      String(entry.scenarioId) === (scenarioId || String(state.readScenarios[0]?.scenarioId || '')),
    );
    if (!scenario) throw new Error('Read scenario not found.');
    return scenario;
  };

  const getReadReview = (input?: Record<string, unknown>) => {
    const scenario = resolveScenario(input);
    const measurement = protocol.measureReadFromScenario(scenario);
    const fitSearchAdmission = measurement.reviewableRead.fitSearchAdmission;
    const readFittingReview = {
      artifactKind: 'bitcode-read-fitting-review',
      protocolFocus: 'source-to-shares',
      scenarioId: scenario.scenarioId,
      scenarioFamily: scenario.scenarioFamily,
      readId: measurement.reviewableRead.readId,
      task: measurement.reviewableRead.measuredReadSnapshot?.task,
      reviewStage: measurement.reviewableRead.reviewStage,
      status: measurement.reviewableRead.status,
      action: null,
      requiredAfter: measurement.reviewableRead.requiredAfter,
      requiredBefore: measurement.reviewableRead.requiredBefore,
      allowedActions: measurement.reviewableRead.allowedActions,
      reviewQuestions: measurement.reviewableRead.reviewQuestions,
      measurementHash: measurement.reviewableRead.measurementRefs?.measurementHash,
      reviewableReadRef: measurement.reviewableRead.reviewableReadHash,
      fitSearchAdmission,
      settlementReview: {
        reviewStage: 'present-fit-for-settlement-review',
        quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
        requiredAfter: 'find-fitting-settlement-admitted',
        receiptCarryThrough: [
          'objectiveContractId',
          'sourceToSharesRef',
          'fitQualityHash',
          'receiptRefs',
          'qualityRows',
        ],
      },
      candidateFitRequirements: {
        requiredStages: [
          'candidate-recall',
          'find-fitting-settlement',
          'asset-pack-assembly',
          'present-fit-for-settlement-review',
        ],
        blockedStages: fitSearchAdmission?.blockedStages || [],
        admittedStages: fitSearchAdmission?.admittedStages || [],
        blockedUntil: 'Read review action=accept',
      },
    };

    return {
      ok: true,
      specVersion: 'V26',
      protocolFocus: 'source-to-shares',
      reviewStage: 'post-measurement-pre-fit',
      scenario: {
        scenarioId: scenario.scenarioId,
        scenarioFamily: scenario.scenarioFamily,
        repo: scenario.repo,
        baseRef: scenario.baseRef,
      },
      measurement: {
        readId: measurement.readDescriptor.readId,
        measurementHash: measurement.readDescriptor.measurementHash,
        reviewableReadRef: measurement.readDescriptor.reviewableReadRef,
      },
      reviewableRead: measurement.reviewableRead,
      allowedActions: measurement.reviewableRead.allowedActions,
      fitSearchAdmission,
      readFittingReview,
      nextProtocolAction: 'POST /api/read-review with action=accept|reject|remeasure-with-feedback',
    };
  };

  return {
    getState(principal?: string) {
      return protocol.publicState(state, principal || 'public');
    },
    getReadReview,
    reviewRead(input?: Record<string, unknown>) {
      const payload = getReadReview(input);
      const readReview = protocol.reviewReadForFitSearch(payload.reviewableRead, {
        action: input?.readReviewAction || input?.reviewAction || 'accept',
        feedback: input?.readReviewFeedback || input?.reviewFeedback || [],
        actorId: input?.readReviewActorId || input?.actorId || 'bitcode-terminal:read-review',
        decisionMode: input?.readReviewDecisionMode || input?.decisionMode || 'operator-review-api',
      });
      return {
        ...payload,
        readReview,
        reviewDecision: readReview.reviewDecision,
        fitSearchAdmission: readReview.fitSearchAdmission,
        readFittingReview: {
          ...payload.readFittingReview,
          status: readReview.status,
          action: readReview.reviewDecision?.action,
          fitSearchAdmission: readReview.fitSearchAdmission,
          candidateFitRequirements: {
            ...(payload.readFittingReview?.candidateFitRequirements || {}),
            blockedStages: readReview.fitSearchAdmission?.blockedStages || [],
            admittedStages: readReview.fitSearchAdmission?.admittedStages || [],
            blockedUntil:
              readReview.fitSearchAdmission?.admitted === true ? null : 'Read review action=accept',
          },
        },
        nextProtocolAction: readReview.fitSearchAdmission?.admitted
          ? 'POST /api/make-bitcode-branch'
          : 'GET /api/read-review after revising the Read measurement input',
      };
    },
    async makeBitcodeBranch(input?: Record<string, unknown>) {
      const result = protocol.runMakeBitcodeBranch(state, input);
      state = { ...result.nextState, latestRun: result.latestRun };
      return {
        ok: true,
        specVersion: 'V26',
        latestRun: result.latestRun,
        ledger: state.ledger,
        runHistory: state.runHistory,
      };
    },
  };
}

describe('V26 Read-review SPEC-IMPL parity across protocol and commercial API', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('presents the protocol reviewable Read through the commercial /api/read-review route', async () => {
    const protocol = (await import(
      '@bitcode/specifying/src/bitcode-demo.js'
    )) as BitcodeProtocolRuntime;
    const app = buildCommercialRouteContext(protocol);
    const directProtocolPayload = app.getReadReview({ scenarioId: 'auth-issuer-rollback' });

    jest.doMock('@/lib/bitcode-app-context', () => ({
      getBitcodeAppContext: () => app,
      readBitcodeRequestBody: readRequestBody,
      toBitcodeErrorResponse: mapBitcodeError,
    }));

    const { GET, POST } = await import('@/app/api/read-review/route');

    const getResponse = await GET(
      new Request('http://localhost/api/read-review?scenarioId=auth-issuer-rollback'),
    );
    const routePayload = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(routePayload.protocolFocus).toBe('source-to-shares');
    expect(routePayload.reviewableRead).toMatchObject({
      artifactKind: 'bitcode-reviewable-read',
      protocolFocus: 'source-to-shares',
      reviewStage: 'post-measurement-pre-fit',
      status: 'ready-for-review',
      requiredAfter: 'read-measurement-synthesized',
      requiredBefore: 'find-fitting-settlement',
    });
    expect(routePayload.reviewableRead.readId).toBe(directProtocolPayload.reviewableRead.readId);
    expect(routePayload.measurement.measurementHash).toBe(directProtocolPayload.measurement.measurementHash);
    expect(routePayload.fitSearchAdmission.admitted).toBe(false);
    expect(routePayload.readFittingReview).toMatchObject({
      artifactKind: 'bitcode-read-fitting-review',
      protocolFocus: 'source-to-shares',
      requiredBefore: 'find-fitting-settlement',
      settlementReview: {
        reviewStage: 'present-fit-for-settlement-review',
        quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
      },
      candidateFitRequirements: {
        blockedUntil: 'Read review action=accept',
      },
    });

    const postResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: 'auth-issuer-rollback',
          readReviewAction: 'remeasure-with-feedback',
          readReviewFeedback: ['Clarify rollback ordering before Finding Fits.'],
        }),
      }),
    );
    const reviewPayload = await postResponse.json();

    expect(postResponse.status).toBe(200);
    expect(reviewPayload.reviewDecision.action).toBe('remeasure-with-feedback');
    expect(reviewPayload.fitSearchAdmission.admitted).toBe(false);
    expect(reviewPayload.readFittingReview).toMatchObject({
      artifactKind: 'bitcode-read-fitting-review',
      status: 'remeasure-requested',
      action: 'remeasure-with-feedback',
      fitSearchAdmission: {
        admitted: false,
      },
    });
    expect(reviewPayload.nextProtocolAction).toContain('/api/read-review');
  });

  it('blocks commercial branch materialization when the protocol Read review rejects Finding Fits', async () => {
    const protocol = (await import(
      '@bitcode/specifying/src/bitcode-demo.js'
    )) as BitcodeProtocolRuntime;
    const app = buildCommercialRouteContext(protocol);

    jest.doMock('@/lib/bitcode-app-context', () => ({
      getBitcodeAppContext: () => app,
      readBitcodeRequestBody: readRequestBody,
      toBitcodeErrorResponse: mapBitcodeError,
    }));
    jest.doMock('@/components/bitcode/pipeline/models/transaction-route-readiness', () => ({
      requireBitcodeSignedTransactionReadiness: jest.fn(async () => ({ repositoryProvider: 'mock-github' })),
    }));

    const { POST } = await import('@/app/api/make-bitcode-branch/route');

    const response = await POST(
      new Request('http://localhost/api/make-bitcode-branch', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: 'auth-issuer-rollback',
          repositoryAnchor: 'frontier/demo-auth',
          readReviewAction: 'reject',
          readReviewFeedback: ['Measured Read is too broad for this settlement review.'],
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toMatch(/Finding Fits cannot proceed/i);
  });

  it('carries accepted source-to-shares settlement artifacts through the commercial branch route', async () => {
    const protocol = (await import(
      '@bitcode/specifying/src/bitcode-demo.js'
    )) as BitcodeProtocolRuntime;
    const directProtocolRun = protocol.runMakeBitcodeBranch(protocol.buildInitialState(), {
      scenarioId: 'auth-issuer-rollback',
      readReviewAction: 'accept',
    }).latestRun;
    const app = buildCommercialRouteContext(protocol);

    jest.doMock('@/lib/bitcode-app-context', () => ({
      getBitcodeAppContext: () => app,
      readBitcodeRequestBody: readRequestBody,
      toBitcodeErrorResponse: mapBitcodeError,
    }));
    jest.doMock('@/components/bitcode/pipeline/models/transaction-route-readiness', () => ({
      requireBitcodeSignedTransactionReadiness: jest.fn(async () => ({ repositoryProvider: 'mock-github' })),
    }));

    const { POST } = await import('@/app/api/make-bitcode-branch/route');

    const response = await POST(
      new Request('http://localhost/api/make-bitcode-branch', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: 'auth-issuer-rollback',
          repositoryAnchor: 'frontier/demo-auth',
          readReviewAction: 'accept',
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.latestRun.readReview).toMatchObject({
      protocolFocus: 'source-to-shares',
      reviewStage: 'post-measurement-pre-fit',
      status: 'accepted',
    });

    const routeReadReview = parseBranchArtifact(payload.latestRun, '.proofs/_shared/read-review.json');
    const routeSourceToShares = parseBranchArtifact(payload.latestRun, '.proofs/_shared/source-to-shares.json');
    const routeSettlementPreview = parseBranchArtifact(payload.latestRun, '.proofs/_shared/settlement-preview.json');
    const routeSettlementProof = parseBranchArtifact(payload.latestRun, '.proofs/_shared/settlement-source-to-shares-proof.json');
    const directSourceToShares = parseBranchArtifact(directProtocolRun, '.proofs/_shared/source-to-shares.json');
    const directSettlementPreview = parseBranchArtifact(directProtocolRun, '.proofs/_shared/settlement-preview.json');

    expect(routeReadReview).toMatchObject({
      artifactKind: 'bitcode-reviewable-read',
      protocolFocus: 'source-to-shares',
      reviewStage: 'post-measurement-pre-fit',
      status: 'accepted',
    });
    expect(routeSourceToShares.protocolFocus).toBe('source-to-shares');
    expect(routeSourceToShares.quantizedObjectiveContractId).toBe(
      'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
    );
    expect(routeSourceToShares.quantizedFitQualities.fitQualityHash).toBe(
      directSourceToShares.quantizedFitQualities.fitQualityHash,
    );
    expect(routeSettlementPreview.reviewStage).toBe('present-fit-for-settlement-review');
    expect(routeSettlementPreview.quantizedFitQualities.fitQualityHash).toBe(
      directSettlementPreview.quantizedFitQualities.fitQualityHash,
    );
    expect(routeSettlementPreview.sourceToSharesRef).toBe(directSettlementPreview.sourceToSharesRef);
    expect(routeSettlementPreview.sourceToSharesRef).toMatch(/^sha256:/);
    expect(routeSettlementPreview.receipts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          receiptKind: 'issuance',
          quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
          sourceToSharesRef: routeSettlementPreview.sourceToSharesRef,
          quantizedFitQualities: expect.objectContaining({
            fitQualityHash: routeSourceToShares.quantizedFitQualities.fitQualityHash,
          }),
        }),
      ]),
    );
    expect(routeSettlementProof.memberVerdicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memberId: 'quantized-fit-quality-receipting',
          passed: true,
        }),
      ]),
    );
  });

  it('rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route', async () => {
    const protocol = (await import(
      '@bitcode/specifying/src/bitcode-demo.js'
    )) as BitcodeProtocolRuntime;
    const app = buildCommercialRouteContext(protocol);

    jest.doMock('@/lib/bitcode-app-context', () => ({
      getBitcodeAppContext: () => app,
      readBitcodeRequestBody: readRequestBody,
      toBitcodeErrorResponse: mapBitcodeError,
    }));
    jest.doMock('@/components/bitcode/pipeline/models/transaction-route-readiness', () => ({
      requireBitcodeSignedTransactionReadiness: jest.fn(async () => ({ repositoryProvider: 'mock-github' })),
    }));

    const { POST } = await import('@/app/api/make-bitcode-branch/route');
    const { GET: getState } = await import('@/app/api/state/route');

    const branchResponse = await POST(
      new Request('http://localhost/api/make-bitcode-branch', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: 'auth-issuer-rollback',
          repositoryAnchor: 'frontier/demo-auth',
          principal: 'buyer',
          readReviewAction: 'accept',
        }),
      }),
    );
    const branchPayload = await branchResponse.json();
    const branchSourceToShares = parseBranchArtifact(branchPayload.latestRun, '.proofs/_shared/source-to-shares.json');
    const branchSettlementPreview = parseBranchArtifact(branchPayload.latestRun, '.proofs/_shared/settlement-preview.json');

    expect(branchResponse.status).toBe(200);

    const stateResponse = await getState(new Request('http://localhost/api/state?principal=buyer'));
    const statePayload = await stateResponse.json();

    expect(stateResponse.status).toBe(200);
    expect(statePayload.projectionPrincipal).toBe('buyer');
    expect(statePayload.latestRun.readReview).toMatchObject({
      protocolFocus: 'source-to-shares',
      reviewStage: 'post-measurement-pre-fit',
      status: 'accepted',
    });
    expect(statePayload.latestRun.sourceToSharesArtifact).toMatchObject({
      protocolFocus: 'source-to-shares',
      quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
    });
    expect(statePayload.latestRun.sourceToSharesArtifact.quantizedFitQualities.fitQualityHash).toBe(
      branchSourceToShares.quantizedFitQualities.fitQualityHash,
    );
    expect(statePayload.latestRun.settlementPreview).toMatchObject({
      reviewStage: 'present-fit-for-settlement-review',
      sourceToSharesRef: branchSettlementPreview.sourceToSharesRef,
    });
    expect(statePayload.latestRun.settlementPreview.quantizedFitQualities.fitQualityHash).toBe(
      branchSourceToShares.quantizedFitQualities.fitQualityHash,
    );
    expect(statePayload.latestRun.branchArtifacts.visibleFileInventory).toEqual(
      expect.arrayContaining([
        '.proofs/_shared/read-review.json',
        '.proofs/_shared/source-to-shares.json',
        '.proofs/_shared/settlement-preview.json',
        '.proofs/_shared/settlement-source-to-shares-proof.json',
      ]),
    );
    expect(statePayload.latestRun.branchArtifacts.files).toBeUndefined();
    expect(statePayload.latestRun.settlementSourceToSharesProof.memberVerdicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          memberId: 'quantized-fit-quality-receipting',
          passed: true,
        }),
      ]),
    );
  });
});
