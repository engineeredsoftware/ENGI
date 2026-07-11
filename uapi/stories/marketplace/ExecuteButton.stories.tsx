import type { Meta, StoryObj } from '@storybook/react';
import ExecuteButton from '@/components/bitcode/pipeline/ExecuteButton/ExecuteButton';
import { useState } from 'react';

const meta = {
  title: 'Executions/ExecuteButton',
  component: ExecuteButton,
  tags: ['autodocs'],
  argTypes: {
    colorScheme: { control: 'select', options: ['emerald', 'purple', 'orange'] },
    isProcessing: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ExecuteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Execute Button in idle state.
 */
export const Default: Story = {
  args: {
    isProcessing: false,
    disabled: false,
    label: 'Execute Action',
    colorScheme: 'emerald',
    onSubmit: () => alert('Execute button clicked'),
  },
};

/**
 * Buy variant (purple) when idle and hoverable.
 */
export const Buy: Story = {
  args: {
    ...Default.args,
    colorScheme: 'purple',
  },
};

/**
 * Sell variant (orange) when idle and hoverable.
 */
export const Sell: Story = {
  args: {
    ...Default.args,
    colorScheme: 'orange',
  },
};

/**
 * Processing state with cancel label.
 */
export const Processing: Story = {
  args: {
    isProcessing: true,
    disabled: false,
    label: 'Action',
    processingLabel: 'Processing...',
    cancelLabel: 'Cancel',
    colorScheme: 'emerald',
    onSubmit: () => {},
  },
};

/**
 * Disabled state.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
