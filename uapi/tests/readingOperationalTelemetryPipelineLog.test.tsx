import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@/components/bitcode/pipeline/FileDiffViewer/FileDiffViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-file-diff-viewer" />,
}));

import { PipelineExecutionLog } from '@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
});

describe('Reading operational telemetry pipeline log rendering', () => {
  it('renders source-safe Reading telemetry events with direct executionState payloads', () => {
    const line = 'ReadFitsFindingSynthesis discovery tool execution observed';
    const outputDetails = {
      [line]: {
        schema: 'bitcode.reading.operational-telemetry-event',
        eventKind: 'tool',
        progress: 'completed',
        message: line,
        timestamp: '2026-05-23T00:00:00.000Z',
        executionState: {
          pipeline: 'ReadFitsFindingSynthesis',
          phase: 'Discovery',
          phaseId: 'ReadFitsFindingSynthesis.discovery',
          agent: 'candidate-recall',
          agentId: 'ReadFitsFindingSynthesis.discovery.candidate-recall',
          step: 'try',
          ptrrStepId: 'ReadFitsFindingSynthesis.discovery.candidate-recall.try',
          ptrrStepName: 'try',
          failsafe: 'prepare-concise-context',
          generation: 'structured-output',
          tool: { name: 'bitcode.depository.vector-search', toolId: 'bitcode.depository.vector-search' },
          promptTemplateId: 'ReadFitsFindingSynthesis.prompt.discovery.candidate-recall.try.prepare-concise-context.structured-output',
          outputSchema: 'DepositorySearchResult',
          returnType: 'DepositorySearchResult',
          eventId: 'reading-telemetry-tool-abc123',
          proofRoot: 'sha256:reading-telemetry-proof',
          redactionPosture: 'source_safe_reading_operational_telemetry_repair_readback_metadata',
          promptDisclosurePosture: 'prompt_template_id_only',
          resultDisclosurePosture: 'parsed_result_shape_and_proof_roots_only',
        },
        metadata: {
          toolId: 'bitcode.depository.vector-search',
          rawProviderResponse: 'withheld',
        },
      },
    };

    render(
      <PipelineExecutionLog
        output={`${line}\n`}
        isProcessing={false}
        error={null}
        outputDetails={outputDetails}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
      />,
    );

    expect(screen.getByText(line)).toBeTruthy();

    fireEvent.click(screen.getByText(line));

    expect(screen.getByText('Details')).toBeTruthy();
    expect(document.body.textContent).toContain('ReadFitsFindingSynthesis');
    expect(document.body.textContent).toContain('candidate-recall');
    expect(document.body.textContent).toContain('bitcode.depository.vector-search');
    expect(document.body.textContent).toContain('reading-telemetry-tool-abc123');
    expect(document.body.textContent).toContain('source_safe_reading_operational_telemetry_repair_readback_metadata');
    expect(document.body.textContent).toContain('prompt_template_id_only');
    expect(document.body.textContent).toContain('parsed_result_shape_and_proof_roots_only');
    expect(screen.queryByText(/diff --git/i)).toBeNull();
    expect(screen.queryByText(new RegExp(`${['sk', 'proj'].join('-')}-`, 'i'))).toBeNull();
  });
});
