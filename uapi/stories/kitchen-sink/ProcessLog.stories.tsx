import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProcessLog } from '@/components/bitcode/pipeline/ExecutionsProcessLog/ExecutionsProcessLog';
import { ProcessLogHeader } from '@/components/bitcode/pipeline/ExecutionsProcessLog/ExecutionsProcessLogHeader';

const meta = {
  title: 'Kitchen-Sink/ProcessLog',
  component: ProcessLog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  argTypes: {
    output: { control: 'text' },
    isProcessing: { control: 'boolean' },
    isStreamingComplete: { control: 'boolean' },
    error: { control: 'text' },
    generationCount: { control: 'number' },
  },
  args: {
    output: 'Phase 1: Initialising…',
    isProcessing: false,
    isStreamingComplete: true,
    error: null,
    generationCount: 1,
  },
} satisfies Meta<typeof ProcessLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 600, margin: '1rem auto' }}>
      <ProcessLogHeader
        isProcessing={args.isProcessing}
        isStreamingComplete={args.isStreamingComplete}
        executionState={{ phase: args.isProcessing ? 'processing' : 'complete' }}
        generationCount={args.generationCount}
        error={args.error}
      />
      <ProcessLog
        {...args}
        outputDetails={{}}
        onRetry={action('onRetry')}
        onDismissError={action('onDismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        ref={null as any}
      />
    </div>
  ),
};
