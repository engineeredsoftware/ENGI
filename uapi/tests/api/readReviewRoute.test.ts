/**
 * @jest-environment node
 */

const mockGetReadReview = jest.fn((body?: Record<string, unknown>) => ({
  ok: true,
  specVersion: 'V26',
  protocolFocus: 'source-to-shares',
  scenario: { scenarioId: body?.scenarioId ?? 'scenario-1' },
  reviewableRead: {
    status: 'ready-for-review',
    fitSearchAdmission: { admitted: false },
  },
  readFittingReview: {
    artifactKind: 'bitcode-read-fitting-review',
    requiredBefore: 'find-fitting-settlement',
    settlementReview: {
      reviewStage: 'present-fit-for-settlement-review',
      quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
    },
  },
}));

const mockReviewNeed = jest.fn((body?: Record<string, unknown>) => ({
  ok: true,
  specVersion: 'V26',
  protocolFocus: 'source-to-shares',
  readReview: {
    status: body?.readReviewAction === 'accept' ? 'accepted' : 'remeasure-requested',
    fitSearchAdmission: { admitted: body?.readReviewAction === 'accept' },
  },
  fitSearchAdmission: { admitted: body?.readReviewAction === 'accept' },
  reviewDecision: {
    action: body?.readReviewAction ?? 'accept',
  },
  readFittingReview: {
    artifactKind: 'bitcode-read-fitting-review',
    status: body?.readReviewAction === 'accept' ? 'accepted' : 'remeasure-requested',
    action: body?.readReviewAction ?? 'accept',
    requiredBefore: 'find-fitting-settlement',
    settlementReview: {
      reviewStage: 'present-fit-for-settlement-review',
      quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
    },
  },
}));

jest.mock('@/lib/bitcode-app-context', () => {
  return {
    getBitcodeAppContext: () => ({
      getReadReview: mockGetReadReview,
      reviewRead: mockReviewNeed,
    }),
    readBitcodeRequestBody: async (request: Request) => {
      const text = await request.text();
      return text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
    },
    toBitcodeErrorResponse: (error: unknown) => {
      const resolvedError = error instanceof Error ? (error as Error & { statusCode?: number }) : new Error('Unknown error.');
      return new Response(
        JSON.stringify({ error: resolvedError.message || 'Unknown error.' }),
        {
          status: resolvedError.statusCode || 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    },
  };
});

import { GET, POST } from '@/app/api/read-review/route';

describe('/api/read-review', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('presents a reviewable Read before Finding Fits', async () => {
    const response = await GET(
      new Request('http://localhost/api/read-review?scenarioId=scenario-auth'),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetReadReview).toHaveBeenCalledWith({ scenarioId: 'scenario-auth' });
    expect(payload.protocolFocus).toBe('source-to-shares');
    expect(payload.reviewableRead.fitSearchAdmission.admitted).toBe(false);
    expect(payload.readFittingReview).toMatchObject({
      artifactKind: 'bitcode-read-fitting-review',
      requiredBefore: 'find-fitting-settlement',
      settlementReview: {
        reviewStage: 'present-fit-for-settlement-review',
        quantizedObjectiveContractId: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
      },
    });
  });

  it('records explicit operator review decisions before Finding Fits admission', async () => {
    const response = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: 'scenario-auth',
          readReviewAction: 'accept',
          readReviewFeedback: ['Read is precise enough for source-to-shares fitting.'],
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockReviewNeed).toHaveBeenCalledWith(
      expect.objectContaining({
        scenarioId: 'scenario-auth',
        readReviewAction: 'accept',
      }),
    );
    expect(payload.fitSearchAdmission.admitted).toBe(true);
    expect(payload.reviewDecision.action).toBe('accept');
    expect(payload.readFittingReview).toMatchObject({
      artifactKind: 'bitcode-read-fitting-review',
      status: 'accepted',
      action: 'accept',
    });
  });

  it('synthesizes a reviewable Read-Need before Finding Fits', async () => {
    const response = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'synthesize_read_need',
          readId: 'read-activity',
          readPrompt: 'Find a source-bound Terminal AssetPack fit.',
          sourceRevision: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            branch: 'main',
            commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
          },
          targetArtifactKinds: ['asset-pack-evidence', 'proof-root'],
          closureCriteria: ['Candidate must be source-bound.'],
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockReviewNeed).not.toHaveBeenCalled();
    expect(payload.pipelineName).toBe('ReadNeedComprehensionSynthesis');
    expect(payload.stage).toBe('review_synthesized_need');
    expect(payload.readRequest).toMatchObject({
      schema: 'bitcode.read.request',
      requestId: 'read-activity',
      prompt: 'Find a source-bound Terminal AssetPack fit.',
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      targetArtifactKinds: ['asset-pack-evidence', 'proof-root'],
    });
    expect(payload.readNeed).toMatchObject({
      schema: 'bitcode.read.need',
      reviewState: 'needs_acceptance',
      read: {
        id: 'read-activity',
        prompt: 'Find a source-bound Terminal AssetPack fit.',
        repositoryFullName: 'engineeredsoftware/ENGI',
        sourceBranch: 'main',
        sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      sourceConstraints: {
        protectedSourceDisclosure: 'forbidden_before_settlement',
      },
    });
    expect(payload.telemetry).toMatchObject({
      schema: 'bitcode.read-need.synthesis-telemetry',
      pipelineName: 'ReadNeedComprehensionSynthesis',
      phaseId: 'ReadNeedComprehensionSynthesis.comprehend',
      agentId: 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer',
      ptrrStepId: 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer.try',
      returnType: 'ReadNeed',
      measurementRoot: payload.readNeed.measurementRoot,
      reviewState: 'needs_acceptance',
      readRequest: payload.readRequest,
    });
    expect(payload.readNeedReviewRuntime).toMatchObject({
      schema: 'bitcode.read-need-review-resynthesis-runtime',
      pipelineName: 'ReadNeedComprehensionSynthesis',
      action: 'synthesize_read_need',
      currentNeedId: payload.readNeed.needId,
      reviewState: 'needs_acceptance',
      findingFitsAdmission: {
        admitted: false,
        blockers: ['accepted_read_need_missing'],
      },
      reviewLoop: {
        readRequestPersisted: true,
        synthesizedNeedPersisted: true,
        feedbackHistoryPersisted: true,
        needMeasurementPersisted: true,
        findingFitsBlockedUntilAcceptedNeed: true,
      },
    });
    expect(payload.storageProjection.map((record: { recordKind: string }) => record.recordKind)).toEqual([
      'read_request',
      'synthesized_need',
      'feedback',
      'need_measurement',
      'telemetry_receipt',
    ]);
    expect(payload.runtimeSummary).toMatchObject({
      storageRecordCount: 5,
      telemetryReceiptCount: 1,
      findingFitsAdmitted: false,
    });
    expect(payload.telemetry.pipelineContract).toMatchObject({
      pipelineName: 'ReadNeedComprehensionSynthesis',
      phaseCount: 4,
      ptrrStepCount: 16,
      thinkingsGenerationCount: 48,
    });
    expect(payload.telemetry.pipelineTrace).toHaveLength(16);
    expect(payload.telemetry.pipelineTrace[0]).toMatchObject({
      pipelineName: 'ReadNeedComprehensionSynthesis',
      thinkingsGenerationIds: expect.any(Array),
    });
    expect(payload.telemetry.pipelineTrace[0].thinkingsGenerationIds).toHaveLength(3);
    expect(payload.telemetry.promptTemplate.templateId).toBe(
      'ReadNeedComprehensionSynthesis.prompt.need-synthesis',
    );
    expect(payload.telemetry.parsedTypedOutput).toMatchObject({ schema: 'bitcode.read.need' });
  });

  it('resynthesizes a Read-Need with feedback while preserving previous Need lineage', async () => {
    const firstResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'synthesize_read_need',
          readId: 'read-activity',
          readPrompt: 'Find a source-bound Terminal AssetPack fit.',
          sourceRevision: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            branch: 'main',
            commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
          },
          feedback: ['Prefer proof-first closure language.'],
        }),
      }),
    );
    const first = await firstResponse.json();
    const secondResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'resynthesize_read_need',
          readPrompt: 'Find a source-bound Terminal AssetPack fit.',
          sourceRevision: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            branch: 'main',
            commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
          },
          readNeed: first.readNeed,
          feedback: ['Exclude settlement finality claims from the Need.'],
        }),
      }),
    );
    const second = await secondResponse.json();

    expect(secondResponse.status).toBe(200);
    expect(second.readNeed.needId).not.toBe(first.readNeed.needId);
    expect(second.readNeed.request.previousNeedId).toBe(first.readNeed.needId);
    expect(second.readNeed.feedbackHistory).toEqual([
      'Prefer proof-first closure language.',
      'Exclude settlement finality claims from the Need.',
    ]);
    expect(second.telemetry).toMatchObject({
      resynthesisAttempt: true,
      previousNeedId: first.readNeed.needId,
      feedbackHistory: second.readNeed.feedbackHistory,
    });
    expect(second.readNeedReviewRuntime).toMatchObject({
      action: 'resynthesize_read_need',
      previousNeedId: first.readNeed.needId,
      reviewLoop: {
        resynthesisAttemptPersisted: true,
      },
    });
    expect(second.storageProjection.map((record: { recordKind: string }) => record.recordKind)).toContain('resynthesis_attempt');
  });

  it('accepts a synthesized Read-Need as the only Finding Fits input', async () => {
    const synthesisResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'synthesize_read_need',
          readPrompt: 'Find a source-bound Terminal AssetPack fit.',
          sourceRevision: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            branch: 'main',
            commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
          },
        }),
      }),
    );
    const synthesis = await synthesisResponse.json();
    const acceptResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'accept_read_need',
          readNeed: synthesis.readNeed,
        }),
      }),
    );
    const payload = await acceptResponse.json();

    expect(acceptResponse.status).toBe(200);
    expect(payload.pipelineName).toBe('ReadNeedComprehensionSynthesis');
    expect(payload.nextPipelineName).toBe('ReadFitsFindingSynthesis');
    expect(payload.stage).toBe('request_fit_ready');
    expect(payload.acceptedReadNeed).toMatchObject({
      schema: 'bitcode.read.need',
      reviewState: 'accepted',
      needId: synthesis.readNeed.needId,
      measurementRoot: synthesis.readNeed.measurementRoot,
      request: synthesis.readRequest,
    });
    expect(payload.readRequest).toMatchObject({
      schema: 'bitcode.read.request',
      requestId: synthesis.readRequest.requestId,
    });
    expect(payload.fitsFindingAdmission).toMatchObject({
      admitted: true,
      blockers: [],
    });
    expect(payload.readNeedReviewRuntime).toMatchObject({
      action: 'accept_read_need',
      reviewState: 'accepted',
      findingFitsAdmission: {
        admitted: true,
      },
      reviewLoop: {
        acceptedNeedAdmissionPersisted: true,
        findingFitsBlockedUntilAcceptedNeed: true,
      },
    });
    expect(payload.storageProjection.map((record: { recordKind: string }) => record.recordKind)).toContain('accepted_need_admission');
    expect(payload.telemetry).toMatchObject({
      schema: 'bitcode.read-need.acceptance-telemetry',
      pipelineName: 'ReadNeedComprehensionSynthesis',
      nextPipelineName: 'ReadFitsFindingSynthesis',
      needId: synthesis.readNeed.needId,
      nextStage: 'finding_fits',
      returnType: 'AcceptedReadNeed',
    });
  });

  it('records rejected Read-Need posture and keeps Finding Fits blocked', async () => {
    const synthesisResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'synthesize_read_need',
          readPrompt: 'Find a source-bound Terminal AssetPack fit.',
          sourceRevision: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            branch: 'main',
            commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
          },
        }),
      }),
    );
    const synthesis = await synthesisResponse.json();
    const rejectResponse = await POST(
      new Request('http://localhost/api/read-review', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reject_read_need',
          readNeed: synthesis.readNeed,
          feedback: ['Need over-claims settlement finality.'],
        }),
      }),
    );
    const payload = await rejectResponse.json();

    expect(rejectResponse.status).toBe(200);
    expect(payload.stage).toBe('review_synthesized_need');
    expect(payload.rejectedReadNeed).toMatchObject({
      schema: 'bitcode.read.need',
      reviewState: 'rejected',
      needId: synthesis.readNeed.needId,
    });
    expect(payload.fitsFindingAdmission).toMatchObject({
      admitted: false,
      blockers: ['read_need_rejected', 'accepted_read_need_missing'],
    });
    expect(payload.readNeedReviewRuntime).toMatchObject({
      action: 'reject_read_need',
      reviewState: 'rejected',
      reviewLoop: {
        rejectedNeedPosturePersisted: true,
        findingFitsBlockedUntilAcceptedNeed: true,
      },
      sourceSafety: {
        protectedSourceVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(payload.storageProjection.map((record: { recordKind: string }) => record.recordKind)).toContain('rejected_need_posture');
    expect(payload.runtimeSummary).toMatchObject({
      findingFitsAdmitted: false,
      storageRecordCount: payload.storageProjection.length,
    });
    expect(payload.telemetry).toMatchObject({
      schema: 'bitcode.read-need.rejection-telemetry',
      returnType: 'RejectedReadNeed',
      blockedStage: 'finding_fits',
    });
  });
});
