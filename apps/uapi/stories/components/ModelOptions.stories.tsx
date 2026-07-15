import type { Meta, StoryObj } from '@storybook/react';
import ModelOptions from '@/components/bitcode/pipeline/ModelOptions/ModelOptions';

const meta: Meta<typeof ModelOptions> = {
  title: 'Components/ModelOptions',
  component: ModelOptions,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof ModelOptions>;

export const Default: Story = {};