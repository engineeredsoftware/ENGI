import {
  acceptReadNeed,
  rejectReadNeed,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';
import {
  buildReadNeedReviewResynthesisRuntime,
  persistReadNeedReviewResynthesisRuntime,
  summarizeReadNeedReviewResynthesisRuntime,
} from '../read-need-review-resynthesis';

const input = {
  read: {
    id: 'read-1',
    prompt: 'Find Reading proof evidence without leaking protected source.',
  },
  sourceRevision: {
    repositoryFullName: 'octocat/Spoon-Knife',
    branch: 'main',
    commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  },
};

describe('ReadNeed review, resynthesis, and admission runtime', () => {
  it('persists a source-safe synthesized Need review loop before Finding Fits admission', () => {
    const readNeed = synthesizeReadNeedForPipelineInput(input);
    const runtime = buildReadNeedReviewResynthesisRuntime({
      action: 'synthesize_read_need',
      readNeed,
    });

    expect(runtime).toMatchObject({
      schema: 'bitcode.read-need-review-resynthesis-runtime',
      pipelineName: 'ReadNeedComprehensionSynthesis',
      nextPipelineName: 'ReadFitsFindingSynthesis',
      action: 'synthesize_read_need',
      requestId: 'read-1',
      currentNeedId: readNeed.needId,
      reviewState: 'needs_acceptance',
      findingFitsAdmission: {
        admitted: false,
        blockers: ['accepted_read_need_missing'],
      },
      reviewLoop: {
        readRequestPersisted: true,
        synthesizedNeedPersisted: true,
        feedbackHistoryPersisted: true,
        resynthesisAttemptPersisted: false,
        needMeasurementPersisted: true,
        acceptedNeedAdmissionPersisted: false,
        rejectedNeedPosturePersisted: false,
        findingFitsBlockedUntilAcceptedNeed: true,
      },
      sourceSafety: {
        sourceSafetyClass: 'source_safe_read_need_review_resynthesis_metadata',
        protectedSourceVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(runtime.storageProjection.map((record) => record.recordKind)).toEqual([
      'read_request',
      'synthesized_need',
      'feedback',
      'need_measurement',
      'telemetry_receipt',
    ]);
    expect(runtime.storageProjection.every((record) => record.sourceSafety.protectedSourceVisible === false)).toBe(true);
    expect(runtime.storageProjection.every((record) => record.sourceSafety.rawProviderResponseVisible === false)).toBe(true);
    expect(runtime.storageProjection.every((record) => record.sourceSafety.unpaidAssetPackSourceVisible === false)).toBe(true);
    expect(runtime.telemetryReceipts[0]).toMatchObject({
      pipelineName: 'ReadNeedComprehensionSynthesis',
      needId: readNeed.needId,
      reviewState: 'needs_acceptance',
    });
    expect(runtime.telemetryReceipts[0].ptrrStepIds).toHaveLength(16);
    expect(runtime.telemetryReceipts[0].thinkingsGenerationIds).toHaveLength(48);
    expect(runtime.proofRoots.runtimeRoot).toMatch(/^sha256:/);
    expect(runtime.nextProtocolAction).toMatch(/accept the synthesized Read-Need/i);
  });

  it('records feedback and previous Need lineage for resynthesis attempts', () => {
    const first = synthesizeReadNeedForPipelineInput({
      ...input,
      feedback: ['Prefer source-safe proof language.'],
    });
    const second = synthesizeReadNeedForPipelineInput({
      ...input,
      previousReadNeed: first,
      feedback: ['Narrow to product proof readback.'],
    });
    const runtime = buildReadNeedReviewResynthesisRuntime({
      action: 'resynthesize_read_need',
      readNeed: second,
      previousReadNeed: first,
    });

    expect(runtime.previousNeedId).toBe(first.needId);
    expect(runtime.reviewLoop.resynthesisAttemptPersisted).toBe(true);
    expect(runtime.storageProjection.map((record) => record.recordKind)).toContain('resynthesis_attempt');
    expect(
      runtime.storageProjection.find((record) => record.recordKind === 'feedback')?.payload,
    ).toMatchObject({
      feedbackHistory: [
        'Prefer source-safe proof language.',
        'Narrow to product proof readback.',
      ],
      feedbackCount: 2,
    });
  });

  it('admits Finding Fits only after Need acceptance and stores admission posture', () => {
    const accepted = acceptReadNeed(
      synthesizeReadNeedForPipelineInput(input),
      '2026-05-25T00:00:00.000Z',
    );
    const runtime = buildReadNeedReviewResynthesisRuntime({
      action: 'accept_read_need',
      readNeed: accepted,
    });

    expect(runtime.findingFitsAdmission).toMatchObject({
      admitted: true,
      blockers: [],
    });
    expect(runtime.reviewLoop.acceptedNeedAdmissionPersisted).toBe(true);
    expect(runtime.storageProjection.map((record) => record.recordKind)).toContain('accepted_need_admission');
    expect(runtime.nextProtocolAction).toBe('Run Finding Fits with the accepted Read-Need.');
  });

  it('stores rejected Need posture and keeps Finding Fits blocked', () => {
    const rejected = rejectReadNeed(
      synthesizeReadNeedForPipelineInput(input),
      ['Need over-claims settlement finality.'],
      '2026-05-25T00:00:00.000Z',
    );
    const runtime = buildReadNeedReviewResynthesisRuntime({
      action: 'reject_read_need',
      readNeed: rejected,
    });

    expect(runtime.reviewState).toBe('rejected');
    expect(runtime.findingFitsAdmission).toMatchObject({
      admitted: false,
      blockers: ['read_need_rejected', 'accepted_read_need_missing'],
    });
    expect(runtime.reviewLoop.rejectedNeedPosturePersisted).toBe(true);
    expect(runtime.storageProjection.map((record) => record.recordKind)).toContain('rejected_need_posture');
    expect(runtime.nextProtocolAction).toMatch(/resynthesize/i);
  });

  it('persists runtime projections into ExecutionPipeline-compatible storage', () => {
    const runtime = buildReadNeedReviewResynthesisRuntime({
      action: 'synthesize_read_need',
      readNeed: synthesizeReadNeedForPipelineInput(input),
    });
    const store = jest.fn();

    persistReadNeedReviewResynthesisRuntime({ store }, runtime);

    expect(store).toHaveBeenCalledWith('read-need-review', 'runtime', runtime);
    expect(store).toHaveBeenCalledWith('read-need-review', 'runtimeRoot', runtime.proofRoots.runtimeRoot);
    expect(store).toHaveBeenCalledWith('read-need-review', 'findingFitsAdmission', runtime.findingFitsAdmission);
    expect(store).toHaveBeenCalledWith('read/need', 'request', expect.any(Object));
    expect(store).toHaveBeenCalledWith('read/need', 'current', expect.any(Object));
  });

  it('summarizes runtime for source-safe route and telemetry payloads', () => {
    const runtime = buildReadNeedReviewResynthesisRuntime({
      action: 'synthesize_read_need',
      readNeed: synthesizeReadNeedForPipelineInput(input),
    });

    expect(summarizeReadNeedReviewResynthesisRuntime(runtime)).toMatchObject({
      schema: 'bitcode.read-need-review-resynthesis-runtime',
      pipelineName: 'ReadNeedComprehensionSynthesis',
      nextPipelineName: 'ReadFitsFindingSynthesis',
      storageRecordCount: 5,
      telemetryReceiptCount: 1,
      findingFitsAdmitted: false,
      pipelineContract: {
        pipelineName: 'ReadNeedComprehensionSynthesis',
        phaseCount: 4,
        ptrrStepCount: 16,
        thinkingsGenerationCount: 48,
      },
    });
  });
});
