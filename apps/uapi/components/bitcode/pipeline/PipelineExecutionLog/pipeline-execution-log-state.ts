/**
 * Pure execution-state extraction helpers for pipeline log lines.
 */

import {
  normalizePhaseName,
  normalizeStepName,
} from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';

// LogLine shape is owned by PipelineExecutionLog; keep structural typing here.
type LogLine = Record<string, any>;

export function extractExecutionState(storedChunk: any) {
  return storedChunk?.status?.executionState ||
    storedChunk?.status?.metadata?.executionState ||
    storedChunk?.executionState ||
    storedChunk?.telemetry?.executionState ||
    storedChunk?.status?.telemetry?.executionState ||
    storedChunk?.operatorReadback?.executionState ||
    null;
}

export function applyExecutionStateToLogLine(logLine: LogLine, executionState: any, storedChunk: any) {
  const {
    phase,
    agent,
    step,
    tool,
    failsafe,
    generation,
    pipeline,
    phaseId,
    agentId,
    ptrrStepId,
    ptrrStepName,
    promptTemplateId,
    outputSchema,
    returnType,
    eventId,
    proofRoot,
    redactionPosture,
    promptDisclosurePosture,
    resultDisclosurePosture,
    failClosedState,
  } = executionState || {};
  logLine.phase = normalizePhaseName(phase);
  logLine.pipeline = pipeline;
  if (typeof (executionState || {}).pipelineMode === 'string') logLine.pipelineMode = executionState.pipelineMode;
  logLine.phaseId = phaseId;
  logLine.agent = agent;
  logLine.agentId = agentId;
  logLine.step = normalizeStepName(step);
  logLine.ptrrStepId = ptrrStepId;
  logLine.ptrrStepName = ptrrStepName;
  logLine.failsafe = failsafe;
  logLine.generation = generation;
  if (typeof (executionState || {}).stitchIteration === 'number') logLine.stitchIteration = executionState.stitchIteration;
  if (typeof (executionState || {}).chunkIndex === 'number') logLine.chunkIndex = executionState.chunkIndex;
  if ((executionState || {}).chunkSum === true) logLine.chunkSum = true;
  // DIV-loop iteration (1-based, latched from pipeline/currentIteration by the
  // activity builder) — rendered as the row's 'iter N' marker.
  if (typeof (executionState || {}).iteration === 'number') logLine.iteration = executionState.iteration;
  logLine.tool = tool;
  logLine.promptTemplateId = promptTemplateId;
  logLine.outputSchema = outputSchema;
  logLine.returnType = returnType;
  logLine.eventId = eventId;
  logLine.proofRoot = proofRoot;
  logLine.redactionPosture = redactionPosture;
  logLine.promptDisclosurePosture = promptDisclosurePosture;
  logLine.resultDisclosurePosture = resultDisclosurePosture;
  logLine.failClosedState = failClosedState;

  logLine.details = {
    ...storedChunk,
    status: {
      ...(storedChunk?.status || {}),
      executionState,
      metadata: {
        ...(storedChunk?.metadata || {}),
        ...(storedChunk?.status?.metadata || {}),
      },
    },
    pipeline,
    phaseId,
    agentId,
    step: normalizeStepName(step),
    ptrrStepId,
    ptrrStepName,
    failsafe,
    generation,
    tool,
    promptTemplateId,
    outputSchema,
    returnType,
    eventId,
    proofRoot,
    redactionPosture,
    promptDisclosurePosture,
    resultDisclosurePosture,
    failClosedState,
  };
}

