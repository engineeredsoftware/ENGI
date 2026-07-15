import type { Meta, StoryObj } from '@storybook/react';
import { Dock, DockIcon } from '@/components/bitcode/Dock/Dock';
import { Sun, Moon } from 'lucide-react';

const meta = {
  title: 'UI/Dock',
  component: Dock,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Dock>
      <DockIcon>
        <Sun />
      </DockIcon>
      <DockIcon>
        <Moon />
      </DockIcon>
    </Dock>
  ),
};

export const Custom: Story = {
  render: () => (
    <Dock magnification={80} distance={150} direction="top">
      <DockIcon>
        <Sun />
      </DockIcon>
      <DockIcon>
        <Moon />
      </DockIcon>
    </Dock>
  ),
};
