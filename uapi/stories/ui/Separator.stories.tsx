import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/components/shadcn/separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    className: 'my-4',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    className: 'mx-4 h-20',
  },
};
