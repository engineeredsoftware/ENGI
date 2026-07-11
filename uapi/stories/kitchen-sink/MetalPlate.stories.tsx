import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import MetalPlate from '@/components/bitcode/metal-plate';

const meta = {
  title: 'Kitchen-Sink/MetalPlate',
  component: MetalPlate,
  tags: ['autodocs'],
  parameters: { backgrounds: { default: 'dark' }, layout: 'centered' },
  argTypes: {
    headline: { control: 'text' },
    mainColor: { control: 'color' },
    glowColor: { control: 'color' },
    intense: { control: 'boolean' },
  },
  args: {
    headline: 'Metal Plate',
    mainColor: '#67FEB7', // brand emerald
    glowColor: '#67FEB7', // brand emerald
    intense: true,
  },
} satisfies Meta<typeof MetalPlate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <MetalPlate {...args} icon={<svg width={20} height={20}></svg>}>
      <p className="text-gray-200">This is a slot example inside the metal plate.</p>
    </MetalPlate>
  ),
};
