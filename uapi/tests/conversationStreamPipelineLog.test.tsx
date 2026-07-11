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

describe('ConversationStreamEvent pipeline log rendering', () => {
  it('shows collapsed source-safe status and expands event metadata without source payloads', () => {
    const line = 'Assistant model delta streamed';
    const outputDetails = {
      [line]: {
        type: 'generation',
        message: line,
        status: {
          progress: 'in-progress',
          detail: line,
          timestamp: '2026-05-24T00:00:00.000Z',
          executionState: {
            pipeline: 'ConversationStream',
            phase: 'stream',
            agent: 'ConversationStreamEvent',
            step: 'try',
            generation: 'structured_output',
            outputSchema: 'ConversationStreamEvent:model_delta',
            eventId: 'conversation-stream-event:abc123def456abc123def456',
            proofRoot: 'conversation-stream-proof:def456abc123def456abc123',
            redactionPosture: 'source_safe_conversation_stream_event_metadata',
            promptDisclosurePosture: 'prompt_template_id_only',
            resultDisclosurePosture: 'parsed_result_shape_only',
            failClosedState: 'unsafe_delta_payload',
          },
          metadata: {
            eventId: 'conversation-stream-event:abc123def456abc123def456',
            eventKind: 'model_delta',
            proofRoots: {
              eventRoot: 'conversation-stream-proof:def456abc123def456abc123',
            },
            redactionPosture: {
              protectedSourceVisible: false,
              unpaidAssetPackSourceVisible: false,
              rawModelResponseVisible: false,
              globalLedgerAuthorityClaimed: false,
            },
            promptDisclosurePosture: 'prompt_template_id_only',
            resultDisclosurePosture: 'parsed_result_shape_only',
            failClosedStates: ['unsafe_delta_payload'],
            expandedMetadata: {
              chunkLength: 20,
            },
          },
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
    expect(document.body.textContent).toContain('ConversationStream');
    expect(document.body.textContent).toContain('ConversationStreamEvent:model_delta');
    expect(document.body.textContent).toContain('prompt_template_id_only');
    expect(screen.queryByText(/raw protected source/i)).toBeNull();
  });
});
