import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import FullscreenPortal from '@/components/conversations/ConversationsFullscreenPortal/ConversationsFullscreenPortal';
import ExecutionReadInput from '@/components/bitcode/pipeline/ExecutionReadInput/ExecutionReadInput';
import { ProcessLog } from '@/components/bitcode/pipeline/ExecutionsProcessLog/ExecutionsProcessLog';
import { ProcessLogHeader } from '@/components/bitcode/pipeline/ExecutionsProcessLog/ExecutionsProcessLogHeader';

const meta = {
  title: 'Conversations/Fullscreen',
  component: FullscreenPortal,
  parameters: { backgrounds: { default: 'dark' }, layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof FullscreenPortal>;

export default meta;
type Story = StoryObj<typeof meta>;

const Shell: React.FC<{ isProcessing?: boolean; error?: string | null }> = ({ isProcessing = false, error = null }) => {
  const [read, setNeed] = React.useState('Build a reactive cache layer for the API');
  const output = 'Phase 1: Analysing codebase…\nPhase 2: Generating plan…';

  return (
    <FullscreenPortal isOpen onClose={() => {}}>
      <div className="flex flex-col h-full p-6 gap-6 max-w-3xl mx-auto">
        <ExecutionReadInput
          definitionOfRead={read}
          onChange={setNeed}
          isProcessing={isProcessing}
          placeholder="Definition of Read…"
          attachments={[]}
        />

        <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-white/5 bg-black/30">
          <ProcessLogHeader
            isProcessing={isProcessing}
            isStreamingComplete={!isProcessing}
            executionState={{ phase: isProcessing ? 'processing' : error ? 'error' : 'complete' }}
            generationCount={3}
            error={error}
          />
          <ProcessLog
            output={output}
            isProcessing={isProcessing}
            error={error}
            outputDetails={{}}
            onRetry={() => {}}
            onDismissError={() => {}}
            userHasScrolled={false}
            setUserHasScrolled={() => {}}
            ref={null as any}
          />
        </div>
      </div>
    </FullscreenPortal>
  );
};

export const Idle: Story = {
  render: () => <Shell />,
};

export const Processing: Story = {
  render: () => <Shell isProcessing />,
};

export const Error: Story = {
  render: () => <Shell error="LLM quota exceeded" />,
};
