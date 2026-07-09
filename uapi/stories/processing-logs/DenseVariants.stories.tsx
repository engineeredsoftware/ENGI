import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProcessLog } from '@/app/executions/components/ExecutionProcessLog';
import { ProcessLogHeader } from '@/app/executions/components/ExecutionProcessLogHeader';

// ---------------------------------------------------------------------------
//  Densely-populated demo showcases – one click visual sanity checks
// ---------------------------------------------------------------------------

// Helper to generate an output string that contains all canonical line types
// we want to preview (generation, tool-use, thinking) repeated a few
// times so the scrollbar is active even in compact layouts.

type ExecState = {
  phase: string;
  agent: string;
  step: string;
  failsafe?: string;
  generation?: string;
};

const phases = ['Setup', 'Discovery', 'Implementation', 'Validation', 'Finish'];
const steps = ['Plan', 'Generate', 'Refine', 'Intensify'];
const failsafes = ['prepare_concise_context', 'chunk_then_sum', 'stitch_until_complete'];
const generations = ['reason', 'judge', 'structured_output'];

interface SampleLine {
  text: string;
  type: 'generation' | 'tool-use' | 'thinking';
  exec?: ExecState;
}

function buildSamples(repeat = 4): { output: string; details: Record<string, any> } {
  const lines: SampleLine[] = [];

  for (let i = 0; i < repeat; i++) {
    // Generation (LLM call)
    lines.push({
      text: `Generation – Generating weekly digest #${i + 1}`,
      type: 'generation',
      exec: {
        phase: phases[i % phases.length],
        agent: `Agent-${i + 1}`,
        step: steps[i % steps.length],
        failsafe: failsafes[i % failsafes.length],
        generation: generations[i % generations.length],
      },
    });

    // Tool use
    lines.push({
      text: `Tool – GitHub API • Fetching issues batch ${i + 1}`,
      type: 'tool-use',
      exec: {
        phase: phases[i % phases.length],
        agent: `Agent-${i + 1}`,
        step: steps[i % steps.length],
      },
    });

    // Thinking line
    lines.push({
      text: `Thinking – Assessing candidate files #${i + 1}`,
      type: 'thinking',
      exec: {
        phase: phases[i % phases.length],
        agent: `Agent-${i + 1}`,
        step: steps[i % steps.length],
        failsafe: failsafes[(i + 1) % failsafes.length],
        generation: generations[(i + 1) % generations.length],
      },
    });
  }

  const output = lines.map((l) => l.text).join('\n');
  const details: Record<string, any> = {};
  lines.forEach((l) => {
    details[l.text] = {
      type: l.type,
      ...(l.exec && { status: { executionState: l.exec } }),
    };
  });

  return { output, details };
}

const { output: denseOutput, details: denseDetails } = buildSamples(4);

const meta = {
  title: 'Pipeline Logs/Dense Variants',
  component: ProcessLog,
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof ProcessLog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Compact sidebar (≈280 px) – showcases responsiveness at the smallest size
// ---------------------------------------------------------------------------

export const Sidebar: Story = {
  name: '🟢 Compact Sidebar',
  render: () => (
    <div style={{ width: 280, height: 520, border: '1px solid #333' }}>
      <ProcessLogHeader
        isProcessing={false}
        executionState={{ phase: 'complete' }}
        isStreamingComplete={true}
        generationCount={12}
        error={null}
      />
      <ProcessLog
        output={denseOutput}
        isProcessing={false}
        error={null}
        outputDetails={denseDetails}
        onRetry={action('retry')}
        onDismissError={action('dismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
        ref={null as any}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Embedded-in-chat demo (≈450 px) – mid-size container
// ---------------------------------------------------------------------------

export const ChatEmbed: Story = {
  name: '🔵 Chat Footer Embed',
  render: () => (
    <div style={{ width: 450, height: 350, border: '1px solid #333' }}>
      <ProcessLogHeader
        isProcessing={true}
        executionState={{ phase: 'processing' }}
        isStreamingComplete={false}
        generationCount={3}
        error={null}
      />
      <ProcessLog
        output={denseOutput}
        isProcessing={true}
        error={null}
        outputDetails={denseDetails}
        onRetry={action('retry')}
        onDismissError={action('dismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
        ref={null as any}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Full-screen desk-mode showcase (800 px width) – richest view
// ---------------------------------------------------------------------------

export const Fullscreen: Story = {
  name: '🟣 Fullscreen',
  render: () => (
    <div style={{ width: 800, margin: '0 auto', paddingTop: '1rem' }}>
      <ProcessLogHeader
        isProcessing={false}
        executionState={{ phase: 'complete' }}
        isStreamingComplete={true}
        generationCount={24}
        error={null}
      />
      <ProcessLog
        output={denseOutput}
        isProcessing={false}
        error={null}
        outputDetails={denseDetails}
        onRetry={action('retry')}
        onDismissError={action('dismissError')}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}

        ref={null as any}
      />
    </div>
  ),
};
