import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import ExecutionReadInput from '@/components/bitcode/execution/ExecutionReadInput';

const meta = {
  title: 'Kitchen-Sink/ExecutionReadInput',
  component: ExecutionReadInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    isProcessing: { control: 'boolean' },
    read: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    isProcessing: false,
    read: '',
    placeholder: 'Definition of Read…',
  },
} satisfies Meta<typeof ExecutionReadInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.read);
    return (
      <ExecutionReadInput
        {...args}
        definitionOfRead={value}
        onChange={setValue}
        attachments={[]}
      />
    );
  },
};
