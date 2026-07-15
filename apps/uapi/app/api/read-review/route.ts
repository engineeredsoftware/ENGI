/**
 * Commercial Read-Need review API.
 *
 * Owns product Read-Need synthesis / accept / reject actions used by the Reads
 * experience. Protocol-demo host shims (scenario GET, specifying reviewRead)
 * are intentionally absent — those lived under the specifying machine only.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type StatusError = Error & { statusCode?: number | undefined };

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const action = readNeedAction(body);
    if (action === 'synthesize_read_need' || action === 'resynthesize_read_need') {
      const { synthesizeReadNeedForPipelineInputWithInference } = await import('@bitcode/asset-packs-pipelines-domain/read-need');
      const {
        buildReadNeedReviewResynthesisRuntime,
        persistReadNeedReviewResynthesisRuntime,
        summarizeReadNeedReviewResynthesisRuntime,
      } = await import('@bitcode/asset-packs-pipelines-domain/read-need-review-resynthesis');
      const {
        READ_NEED_COMPREHENSION_SYNTHESIS,
        READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
        listReadingPipelineTelemetryTrace,
        summarizeReadingPipelineContract,
      } = await import('@bitcode/asset-packs-pipelines-domain/reading-pipeline-contract');
      const inferenceCapture = createRouteInferenceCapture();
      const readNeed = await synthesizeReadNeedForPipelineInputWithInference(
        readNeedPipelineInput(body),
        inferenceCapture.execution,
      );
      const reviewRuntime = buildReadNeedReviewResynthesisRuntime({
        action,
        readNeed,
        previousReadNeed: objectValue(body.previousReadNeed || body.readNeed) as Parameters<typeof buildReadNeedReviewResynthesisRuntime>[0]['previousReadNeed'],
        feedback: stringArray(body.feedback || body.readNeedFeedback),
      });
      persistReadNeedReviewResynthesisRuntime(inferenceCapture.execution, reviewRuntime);
      const synthesisStep =
        READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases
          .flatMap((phase) => phase.agents)
          .flatMap((agent) => agent.ptrrSteps)
          .find((step) => step.ptrrStepId === 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer.try');

      return NextResponse.json({
        ok: true,
        pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
        stage: 'review_synthesized_need',
        action,
        readNeed,
        readRequest: readNeed.request,
        readNeedReviewRuntime: reviewRuntime,
        storageProjection: reviewRuntime.storageProjection,
        runtimeSummary: summarizeReadNeedReviewResynthesisRuntime(reviewRuntime),
        fitsFindingAdmission: reviewRuntime.findingFitsAdmission,
        telemetry: {
          schema: 'bitcode.read-need.synthesis-telemetry',
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          pipelineContract: summarizeReadingPipelineContract(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
          pipelineTrace: listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
          phaseId: 'ReadNeedComprehensionSynthesis.comprehend',
          agentId: 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer',
          ptrrStepId: synthesisStep?.ptrrStepId || 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer.try',
          thinkingsGenerationIds: synthesisStep?.thinkingsGenerationIds || [],
          promptTemplate: synthesisStep?.prompt || null,
          promptInput: readNeed.read,
          interpolatedContext: {
            sourceConstraints: readNeed.sourceConstraints,
            targetArtifactKinds: readNeed.targetArtifactKinds,
            closureCriteria: readNeed.closureCriteria,
            feedbackHistory: readNeed.feedbackHistory,
          },
          modelOutput: {
            runtime: 'structured-read-need-synthesis',
            outputKind: 'typed-protocol-synthesis',
            requirements: readNeed.requirements,
            failureModes: readNeed.failureModes,
            proofExpectations: readNeed.proofExpectations,
          },
          rawModelResponse: {
            runtime: 'structured-read-need-synthesis',
            outputKind: 'typed-protocol-synthesis',
            content: readNeed,
          },
          thinkingsGeneration: {
            mode: inferenceCapture.value('bounded-inference', 'mode') || 'deterministic-typed-witness',
            status: inferenceCapture.value('bounded-inference', 'status') || 'deterministic-fallback',
            provider: inferenceCapture.value('bounded-inference', 'provider') || null,
            reasoningOutput: inferenceCapture.value('llm', 'reasoningOutput') || null,
            judgmentOutput: inferenceCapture.value('llm', 'judgmentOutput') || null,
            structuredOutput: inferenceCapture.value('llm', 'parsedOutput') || null,
          },
          parsedTypedOutput: readNeed,
          returnType: 'ReadNeed',
          parsedNeed: readNeed,
          readRequest: readNeed.request,
          previousNeedId: readNeed.request.previousNeedId || null,
          feedbackHistory: readNeed.feedbackHistory,
          measurementRoot: readNeed.measurementRoot,
          reviewState: readNeed.reviewState,
          resynthesisAttempt: action === 'resynthesize_read_need',
          runtimeRoot: reviewRuntime.proofRoots.runtimeRoot,
          storageRoot: reviewRuntime.proofRoots.storageRoot,
          telemetryRoot: reviewRuntime.proofRoots.telemetryRoot,
        },
        nextProtocolAction: reviewRuntime.nextProtocolAction,
      });
    }

    if (action === 'accept_read_need') {
      const { acceptReadNeed, admitReadFitsFinding } = await import('@bitcode/asset-packs-pipelines-domain/read-need');
      const {
        buildReadNeedReviewResynthesisRuntime,
        persistReadNeedReviewResynthesisRuntime,
        summarizeReadNeedReviewResynthesisRuntime,
      } = await import('@bitcode/asset-packs-pipelines-domain/read-need-review-resynthesis');
      const {
        READ_NEED_COMPREHENSION_SYNTHESIS,
        READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
        READ_FITS_FINDING_SYNTHESIS,
        listReadingPipelineTelemetryTrace,
        summarizeReadingPipelineContract,
      } = await import('@bitcode/asset-packs-pipelines-domain/reading-pipeline-contract');
      const readNeed = objectValue(body.readNeed) || objectValue(body.acceptedReadNeed);
      if (!readNeed || readNeed.schema !== 'bitcode.read.need') {
        return NextResponse.json({ error: 'readNeed is required' }, { status: 400 });
      }

      const acceptedReadNeed = acceptReadNeed(readNeed as unknown as Parameters<typeof acceptReadNeed>[0]);
      const fitsFindingAdmission = admitReadFitsFinding({
        acceptedReadNeed,
        requireAcceptedReadNeed: true,
      });
      const inferenceCapture = createRouteInferenceCapture();
      const reviewRuntime = buildReadNeedReviewResynthesisRuntime({
        action,
        readNeed: acceptedReadNeed,
      });
      persistReadNeedReviewResynthesisRuntime(inferenceCapture.execution, reviewRuntime);
      const acceptanceStep =
        READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases
          .flatMap((phase) => phase.agents)
          .flatMap((agent) => agent.ptrrSteps)
          .find((step) => step.ptrrStepId === 'ReadNeedComprehensionSynthesis.review.operator-review.try');
      return NextResponse.json({
        ok: true,
        pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
        nextPipelineName: READ_FITS_FINDING_SYNTHESIS,
        stage: 'request_fit_ready',
        action,
        acceptedReadNeed,
        readNeed: acceptedReadNeed,
        readRequest: acceptedReadNeed.request,
        fitsFindingAdmission,
        readNeedReviewRuntime: reviewRuntime,
        storageProjection: reviewRuntime.storageProjection,
        runtimeSummary: summarizeReadNeedReviewResynthesisRuntime(reviewRuntime),
        telemetry: {
          schema: 'bitcode.read-need.acceptance-telemetry',
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          pipelineContract: summarizeReadingPipelineContract(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
          pipelineTrace: listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
          phaseId: 'ReadNeedComprehensionSynthesis.review',
          agentId: 'ReadNeedComprehensionSynthesis.review.operator-review',
          ptrrStepId: acceptanceStep?.ptrrStepId || 'ReadNeedComprehensionSynthesis.review.operator-review.try',
          thinkingsGenerationIds: acceptanceStep?.thinkingsGenerationIds || [],
          needId: acceptedReadNeed.needId,
          measurementRoot: acceptedReadNeed.measurementRoot,
          reviewState: acceptedReadNeed.reviewState,
          acceptanceRoot: acceptedReadNeed.review?.acceptanceRoot || null,
          readRequest: acceptedReadNeed.request,
          feedbackHistory: acceptedReadNeed.feedbackHistory,
          nextStage: acceptedReadNeed.review?.nextStage || 'finding_fits',
          nextPipelineName: READ_FITS_FINDING_SYNTHESIS,
          returnType: 'AcceptedReadNeed',
          runtimeRoot: reviewRuntime.proofRoots.runtimeRoot,
          storageRoot: reviewRuntime.proofRoots.storageRoot,
          telemetryRoot: reviewRuntime.proofRoots.telemetryRoot,
        },
        nextProtocolAction: reviewRuntime.nextProtocolAction,
      });
    }

    if (action === 'reject_read_need') {
      const { rejectReadNeed, admitReadFitsFinding } = await import('@bitcode/asset-packs-pipelines-domain/read-need');
      const {
        buildReadNeedReviewResynthesisRuntime,
        persistReadNeedReviewResynthesisRuntime,
        summarizeReadNeedReviewResynthesisRuntime,
      } = await import('@bitcode/asset-packs-pipelines-domain/read-need-review-resynthesis');
      const {
        READ_NEED_COMPREHENSION_SYNTHESIS,
        READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
        READ_FITS_FINDING_SYNTHESIS,
        listReadingPipelineTelemetryTrace,
        summarizeReadingPipelineContract,
      } = await import('@bitcode/asset-packs-pipelines-domain/reading-pipeline-contract');
      const readNeed = objectValue(body.readNeed);
      if (!readNeed || readNeed.schema !== 'bitcode.read.need') {
        return NextResponse.json({ error: 'readNeed is required' }, { status: 400 });
      }

      const rejectedReadNeed = rejectReadNeed(
        readNeed as unknown as Parameters<typeof rejectReadNeed>[0],
        stringArray(body.feedback || body.readNeedFeedback),
      );
      const fitsFindingAdmission = admitReadFitsFinding({
        readNeed: rejectedReadNeed,
        requireAcceptedReadNeed: true,
      });
      const inferenceCapture = createRouteInferenceCapture();
      const reviewRuntime = buildReadNeedReviewResynthesisRuntime({
        action,
        readNeed: rejectedReadNeed,
        feedback: stringArray(body.feedback || body.readNeedFeedback),
      });
      persistReadNeedReviewResynthesisRuntime(inferenceCapture.execution, reviewRuntime);
      const reviewStep =
        READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases
          .flatMap((phase) => phase.agents)
          .flatMap((agent) => agent.ptrrSteps)
          .find((step) => step.ptrrStepId === 'ReadNeedComprehensionSynthesis.review.operator-review.try');
      return NextResponse.json({
        ok: true,
        pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
        nextPipelineName: READ_FITS_FINDING_SYNTHESIS,
        stage: 'review_synthesized_need',
        action,
        rejectedReadNeed,
        readNeed: rejectedReadNeed,
        readRequest: rejectedReadNeed.request,
        fitsFindingAdmission,
        readNeedReviewRuntime: reviewRuntime,
        storageProjection: reviewRuntime.storageProjection,
        runtimeSummary: summarizeReadNeedReviewResynthesisRuntime(reviewRuntime),
        telemetry: {
          schema: 'bitcode.read-need.rejection-telemetry',
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          pipelineContract: summarizeReadingPipelineContract(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
          pipelineTrace: listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT),
          phaseId: 'ReadNeedComprehensionSynthesis.review',
          agentId: 'ReadNeedComprehensionSynthesis.review.operator-review',
          ptrrStepId: reviewStep?.ptrrStepId || 'ReadNeedComprehensionSynthesis.review.operator-review.try',
          thinkingsGenerationIds: reviewStep?.thinkingsGenerationIds || [],
          needId: rejectedReadNeed.needId,
          measurementRoot: rejectedReadNeed.measurementRoot,
          reviewState: rejectedReadNeed.reviewState,
          rejectionRoot: rejectedReadNeed.review?.rejectionRoot || null,
          readRequest: rejectedReadNeed.request,
          feedbackHistory: rejectedReadNeed.feedbackHistory,
          blockedStage: 'finding_fits',
          nextPipelineName: READ_FITS_FINDING_SYNTHESIS,
          returnType: 'RejectedReadNeed',
          runtimeRoot: reviewRuntime.proofRoots.runtimeRoot,
          storageRoot: reviewRuntime.proofRoots.storageRoot,
          telemetryRoot: reviewRuntime.proofRoots.telemetryRoot,
        },
        nextProtocolAction: reviewRuntime.nextProtocolAction,
      });
    }

    return NextResponse.json(
      {
        error:
          'Unsupported read-review action. Use synthesize_read_need, resynthesize_read_need, accept_read_need, or reject_read_need.',
      },
      { status: 400 },
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const err = new Error('Invalid JSON body.') as StatusError;
    err.statusCode = 400;
    throw err;
  }
}

function toRouteErrorResponse(error: unknown) {
  const resolved = error instanceof Error ? (error as StatusError) : (new Error('Unknown error.') as StatusError);
  if (!resolved.statusCode && /No candidates survived into the asset pack/i.test(resolved.message || '')) {
    resolved.statusCode = 409;
  }
  if (!resolved.statusCode && /(Finding Fits|fit search) cannot proceed/i.test(resolved.message || '')) {
    resolved.statusCode = 409;
  }
  return NextResponse.json(
    { error: resolved.message || 'Unknown error.' },
    { status: resolved.statusCode || 500 },
  );
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => typeof entry === 'string' ? entry.trim() : '')
    .filter(Boolean);
}

function readNeedAction(body: Record<string, unknown>): string | null {
  return stringValue(body.action) || stringValue(body.readNeedAction);
}

function createRouteInferenceCapture() {
  const values = new Map<string, unknown>();
  type CapturedExecution = {
    child: (name?: string) => CapturedExecution;
    getRoot: () => CapturedExecution;
    store: (namespace: string, key: string, value: unknown) => void;
    get: (namespace: string, key: string) => unknown;
    findUp: (namespace: string, key: string) => unknown;
    llms: { getDefaultLLM: () => undefined };
  };
  const execution: CapturedExecution = {
    child() {
      return execution;
    },
    getRoot() {
      return execution;
    },
    store(namespace: string, key: string, value: unknown) {
      values.set(`${namespace}:${key}`, value);
    },
    get(namespace: string, key: string) {
      return values.get(`${namespace}:${key}`);
    },
    findUp(namespace: string, key: string) {
      return values.get(`${namespace}:${key}`);
    },
    llms: {
      getDefaultLLM() {
        return undefined;
      },
    },
  };

  return {
    execution,
    value(namespace: string, key: string) {
      return values.get(`${namespace}:${key}`);
    },
  };
}

function readNeedPipelineInput(body: Record<string, unknown>) {
  const readRequest = objectValue(body.readRequest);
  const read = objectValue(body.read);
  const sourceRevision = objectValue(body.sourceRevision);
  const prompt =
    stringValue(body.readPrompt) ||
    stringValue(body.prompt) ||
    stringValue(readRequest?.prompt) ||
    stringValue(read?.prompt) ||
    '';

  return {
    read: {
      ...read,
      id: stringValue(body.readId) || stringValue(read?.id) || stringValue(readRequest?.id),
      prompt,
      repositoryFullName:
        stringValue(body.repositoryFullName) ||
        stringValue(sourceRevision?.repositoryFullName) ||
        stringValue(read?.repositoryFullName) ||
        stringValue(readRequest?.repositoryFullName),
      sourceBranch:
        stringValue(body.sourceBranch) ||
        stringValue(sourceRevision?.branch) ||
        stringValue(read?.sourceBranch) ||
        stringValue(readRequest?.sourceBranch),
      sourceCommit:
        stringValue(body.sourceCommit) ||
        stringValue(sourceRevision?.commit) ||
        stringValue(read?.sourceCommit) ||
        stringValue(readRequest?.sourceCommit),
    },
    readRequest,
    sourceRevision,
    previousReadNeed: body.previousReadNeed || body.readNeed,
    readNeed: body.readNeed,
    targetArtifactKinds: body.targetArtifactKinds || body.targetKinds,
    targetKinds: body.targetKinds,
    closureCriteria: body.closureCriteria,
    failureModes: body.failureModes,
    feedback: body.feedback || body.readNeedFeedback,
  };
}
