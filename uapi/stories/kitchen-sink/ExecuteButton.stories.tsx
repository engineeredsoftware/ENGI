import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ExecuteButton from '@/components/bitcode/execution/execute-button';

const meta = {
  title: 'Executions/ExecuteButton',
  component: ExecuteButton,
  tags: ['autodocs'],
  parameters: { backgrounds: { default: 'dark' }, layout: 'centered' },
  argTypes: {
    isProcessing: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    isProcessing: false,
    disabled: false,
  },
} satisfies Meta<typeof ExecuteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ExecuteButton {...args} onSubmit={() => {}} />,
};
