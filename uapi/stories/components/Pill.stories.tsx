import type { Meta, StoryObj } from '@storybook/react';
import Pill from '@/components/bitcode/branding/Pill/Pill';

const meta: Meta<typeof Pill> = {
  title: 'Components/Pill',
  component: Pill,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    children: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Pill>;

export const Default: Story = {
  args: {
    children: 'Default Pill',
  },
};

export const Colored: Story = {
  args: {
    children: 'Colored Pill',
    className: 'bg-blue-500 text-white ring-blue-500/50',
  },
};