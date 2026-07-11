import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import PipelineExecutionLogHeader from '@/components/bitcode/execution/pipeline-execution-log-header';
import PipelineExecutionLog from '@/components/bitcode/execution/pipeline-execution-log';

const sampleOutput = `Setup: Initializing AssetPack pipeline...\nSetup: Loading Read context and templates...\nDiscovery: Fetching GitHub repository state...\nDiscovery: Found 12 relevant issues and pull requests\nImplementation: Generating Definition of Read evidence based on template...\nImplementation: Creating pull request draft and code snippets...\nValidation: Running unit tests (25 tests)...\nValidation: All tests passed successfully\nFinish: Saving AssetPack evidence to branch 'feature/asset-pack-templates'\nFinish: Delivering written assets to GitHub pull request\nCompleted: AssetPack run complete`;

const meta = {
  title: 'Executions/PipelineExecutionLog',
  component: PipelineExecutionLog,
  tags: ['autodocs'],
  argTypes: {
    output: { control: 'text' },
    isProcessing: { control: 'boolean' },
    error: { control: 'text' },
    outputDetails: { control: 'object' },
    executionState: { control: 'object' },
    isStreamingComplete: { control: 'boolean' },
    generationCount: { control: 'number' },
  },
} satisfies Meta<typeof PipelineExecutionLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  render: (args) => (
    <div style={{ width: 600, margin: '1rem auto' }}>
      <PipelineExecutionLogHeader
        isProcessing={true}
        executionState={{ phase: 'processing' }}
        isStreamingComplete={false}
        generationCount={1}
        error={null}
      />
      <PipelineExecutionLog
        output={args.output}
        isProcessing={true}
        error={null}
        outputDetails={{}}
        onRetry={action('onRetry')}
        onDismissError={action('onDismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        ref={null as any}
      />
    </div>
  ),
  args: {
    output: sampleOutput,
  },
};

export const Complete: Story = {
  render: (args) => (
    <div style={{ width: 600, margin: '1rem auto' }}>
      <PipelineExecutionLogHeader
        isProcessing={false}
        executionState={{ phase: 'complete' }}
        isStreamingComplete={true}
        generationCount={2}
        error={null}
      />
      <PipelineExecutionLog
        output={args.output}
        isProcessing={false}
        error={null}
        outputDetails={{}}
        onRetry={action('onRetry')}
        onDismissError={action('onDismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        ref={null as any}
      />
    </div>
  ),
  args: {
    output: sampleOutput + '\nFinal line of log',
  },
};
// A fully configurable story with knobs for header + log
export const Configurable: Story = {
  name: 'Configurable',
  args: {
    isProcessing: false,
    output: sampleOutput,
    error: null,
    outputDetails: null,
    executionState: { phase: 'processing' },
    isStreamingComplete: false,
    generationCount: 1,
  },
  render: (args) => (
    <div style={{ width: 600, margin: '1rem auto' }}>
      <PipelineExecutionLogHeader
        isProcessing={args.isProcessing}
        executionState={args.executionState}
        isStreamingComplete={args.isStreamingComplete}
        generationCount={args.generationCount}
        error={args.error}
      />
      <PipelineExecutionLog
        output={args.output}
        isProcessing={args.isProcessing}
        error={args.error}
        outputDetails={args.outputDetails}
        onRetry={action('onRetry')}
        onDismissError={action('onDismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        ref={null as any}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
//  Error state – log halted with an error message
// ---------------------------------------------------------------------------

export const Error: Story = {
  name: 'Error',
  render: (args) => (
    <div style={{ width: 600, margin: '1rem auto' }}>
      <PipelineExecutionLogHeader
        isProcessing={false}
        executionState={{ phase: 'error' }}
        isStreamingComplete={false}
        generationCount={args.generationCount}
        error={args.error}
      />
      <PipelineExecutionLog
        output={args.output}
        isProcessing={false}
        error={args.error}
        outputDetails={{}}
        onRetry={action('onRetry')}
        onDismissError={action('onDismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        ref={null as any}
      />
    </div>
  ),
  args: {
    output: sampleOutput,
    error: 'Pipeline crashed while running unit tests',
    generationCount: 1,
  },
};

// Massive output (10× lines) to exercise virtualised scroll & auto-scroll logic
export const LargeOutput: Story = {
  name: 'Large Output',
  render: () => {
    const giant = Array.from({ length: 100 }, (_, i) => `Step ${i + 1}: doing things...`).join('\n');
    return (
      <div style={{ width: 600, margin: '1rem auto' }}>
        <PipelineExecutionLogHeader
          isProcessing={false}
          executionState={{ phase: 'complete' }}
          isStreamingComplete={true}
          generationCount={50}
          error={null}
        />
        <PipelineExecutionLog
          output={giant}
          isProcessing={false}
          error={null}
          outputDetails={{}}
          onRetry={action('onRetry')}
          onDismissError={action('onDismissError')}
          userHasScrolled={false}
          setUserHasScrolled={() => {}}
          ref={null as any}
        />
      </div>
    );
  },
};
