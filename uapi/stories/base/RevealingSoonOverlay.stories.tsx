import type { Meta, StoryObj } from '@storybook/react';
import RevealingSoonOverlay from '@/components/bitcode/overlays/RevealingSoonOverlay';

const meta: Meta<typeof RevealingSoonOverlay> = {
  title: 'Base/RevealingSoonOverlay',
  component: RevealingSoonOverlay,
};
export default meta;

export const Default: StoryObj<typeof RevealingSoonOverlay> = {
  args: {
    stretch: false,
    subtle: false,
    rightAlign: false,
    fadeLeft: false,
    dotOnly: false,
  },
  render: (args) => (
    <div style={{ position: 'relative', width: 420, height: 180, border: '1px solid #333' }}>
      <RevealingSoonOverlay {...args} />
    </div>
  )
};

