import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ExecutionOptionToggle } from '@/components/bitcode/execution/execution-option-toggle';

const meta = {
  title: 'Kitchen-Sink/ExecutionOptionToggle',
  component: ExecutionOptionToggle,
  tags: ['autodocs'],
  parameters: { backgrounds: { default: 'dark' }, layout: 'centered' },
  argTypes: {
    enabled: { control: 'boolean' },
    type: { control: { type: 'radio' }, options: ['fit-review', 'computer-use-measurement'] },
  },
  args: {
    enabled: false,
    type: 'fit-review',
  },
} satisfies Meta<typeof ExecutionOptionToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
