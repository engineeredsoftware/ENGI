import React from 'react';
import { render, screen } from '@testing-library/react';

import { PipelineExecutionLogHeader } from '@/components/bitcode/pipeline/pipeline-execution-log-header';

describe('PipelineExecutionLogHeader', () => {
  it('renders current tool identity when the stream execution state includes a tool', () => {
    render(
      <PipelineExecutionLogHeader
        isProcessing={true}
        executionState={{
          phase: 'Discovery' as any,
          agent: 'bitcode-read-risk-admission',
          step: 'try' as any,
          generation: 'structured-output' as any,
          tool: 'bitcode.asset-pack.verification',
          pipeline: 'ReadFitsFindingSynthesis',
          phaseId: 'ReadFitsFindingSynthesis.discovery',
          agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
          ptrrStepId: 'ReadFitsFindingSynthesis.discovery.finding-fits.try',
          ptrrStepName: 'try',
          outputSchema: 'DepositoryFitsResult',
        }}
        isStreamingComplete={false}
        generationCount={2}
        error={null}
        runId="run-tool-header"
      />,
    );

    expect(screen.getByText('bitcode.asset-pack.verification')).toBeTruthy();
    expect(screen.getAllByText('ReadFitsFindingSynthesis').length).toBeGreaterThan(0);
    expect(screen.getByText('ReadFitsFindingSynthesis.discovery')).toBeTruthy();
    expect(screen.getByText('discovery.finding-fits.try')).toBeTruthy();
    expect(screen.getByText('DepositoryFitsResult')).toBeTruthy();
  });

  it('renders ConversationStreamEvent telemetry posture in the live stream header', () => {
    render(
      <PipelineExecutionLogHeader
        isProcessing={true}
        executionState={{
          phase: 'stream' as any,
          agent: 'ConversationStreamEvent',
          step: 'try' as any,
          generation: 'structured_output' as any,
          pipeline: 'ConversationStream',
          outputSchema: 'ConversationStreamEvent:model_delta',
          eventId: 'conversation-stream-event:abc123def456abc123def456',
          proofRoot: 'conversation-stream-proof:def456abc123def456abc123',
          redactionPosture: 'source_safe_conversation_stream_event_metadata',
          promptDisclosurePosture: 'prompt_template_id_only',
          resultDisclosurePosture: 'parsed_result_shape_only',
          failClosedState: 'unsafe_delta_payload',
        }}
        isStreamingComplete={false}
        generationCount={1}
        error={null}
        runId="run-conversation-stream"
      />,
    );

    expect(screen.getAllByText('ConversationStream').length).toBeGreaterThan(0);
    expect(screen.getByText('ConversationStreamEvent:model_delta')).toBeTruthy();
    expect(screen.getByText('event')).toBeTruthy();
    expect(screen.getByText('proof')).toBeTruthy();
    expect(screen.getByText('source_safe_conversation_stream_event_metadata')).toBeTruthy();
    expect(screen.getByText('prompt_template_id_only')).toBeTruthy();
    expect(screen.getByText('parsed_result_shape_only')).toBeTruthy();
    expect(screen.getByText('unsafe_delta_payload')).toBeTruthy();
  });

  it('renders Reading operational telemetry proof and disclosure posture in the live stream header', () => {
    render(
      <PipelineExecutionLogHeader
        isProcessing={true}
        executionState={{
          phase: 'Discovery' as any,
          agent: 'candidate-recall',
          step: 'try' as any,
          failsafe: 'prepare-concise-context' as any,
          generation: 'structured-output' as any,
          tool: { name: 'bitcode.depository.vector-search' },
          pipeline: 'ReadFitsFindingSynthesis',
          phaseId: 'ReadFitsFindingSynthesis.discovery',
          agentId: 'ReadFitsFindingSynthesis.discovery.candidate-recall',
          ptrrStepId: 'ReadFitsFindingSynthesis.discovery.candidate-recall.try',
          ptrrStepName: 'try',
          outputSchema: 'DepositorySearchResult',
          eventId: 'reading-telemetry-tool-abc123',
          proofRoot: 'sha256:reading-telemetry-proof-root',
          redactionPosture: 'source_safe_reading_operational_telemetry_repair_readback_metadata',
          promptDisclosurePosture: 'prompt_template_id_only',
          resultDisclosurePosture: 'parsed_result_shape_and_proof_roots_only',
        }}
        isStreamingComplete={false}
        generationCount={4}
        error={null}
        runId="reading-operational-gate8"
      />,
    );

    expect(screen.getAllByText('ReadFitsFindingSynthesis').length).toBeGreaterThan(0);
    expect(screen.getByText('bitcode.depository.vector-search')).toBeTruthy();
    expect(screen.getByText('DepositorySearchResult')).toBeTruthy();
    expect(screen.getByText('source_safe_reading_operational_telemetry_repair_readback_metadata')).toBeTruthy();
    expect(screen.getByText('parsed_result_shape_and_proof_roots_only')).toBeTruthy();
  });
});
