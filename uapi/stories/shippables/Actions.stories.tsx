import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ExecutionOptionToggle } from '@/components/bitcode/pipeline/execution-option-toggle';
import ExecuteButton from '@/components/bitcode/pipeline/execute-button';

const meta = {
  title: 'Executions/Actions',
  component: ExecuteButton,
  tags: ['autodocs'],
  argTypes: {
    fitReviewEnabled: { control: 'boolean' },
    computerUseMeasurementEnabled: { control: 'boolean' },
    isProcessing: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ExecuteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: Story = {
  render: ({ fitReviewEnabled, computerUseMeasurementEnabled, ...buttonArgs }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <ExecutionOptionToggle
        enabled={fitReviewEnabled}
        onToggle={action('toggle-fit-review')}
        type="fit-review"
      />
      <ExecuteButton
        isProcessing={buttonArgs.isProcessing}
        onSubmit={action('onSubmit')}
        disabled={buttonArgs.disabled}
      />
      <ExecutionOptionToggle
        enabled={computerUseMeasurementEnabled}
        onToggle={action('toggle-computer-use-measurement')}
        type="computer-use-measurement"
      />
    </div>
  ),
};

export const Default: Story = {
  ...Template,
  args: {
    fitReviewEnabled: false,
    computerUseMeasurementEnabled: false,
    isProcessing: false,
    disabled: false,
  },
};

export const Processing: Story = {
  ...Template,
  args: {
    fitReviewEnabled: false,
    computerUseMeasurementEnabled: false,
    isProcessing: true,
    disabled: false,
  },
};

// All actions enabled (toggles ON, button enabled & idle)
export const AllEnabled: Story = {
  ...Template,
  args: {
    fitReviewEnabled: true,
    computerUseMeasurementEnabled: true,
    isProcessing: false,
    disabled: false,
  },
};

// Button disabled due to external constraint (for example, missing BTC fee liquidity or repository readiness)
export const Disabled: Story = {
  ...Template,
  args: {
    fitReviewEnabled: false,
    computerUseMeasurementEnabled: false,
    isProcessing: false,
    disabled: true,
  },
};
