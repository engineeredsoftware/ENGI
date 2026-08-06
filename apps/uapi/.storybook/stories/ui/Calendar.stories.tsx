import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Calendar } from '@/components/shadcn/Calendar/Calendar';

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    return <Calendar mode="single" selected={selected} onSelect={setSelected} />;
  },
};
