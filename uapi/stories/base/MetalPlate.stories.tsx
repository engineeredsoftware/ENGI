import type { Meta, StoryObj } from '@storybook/react';
import MetalPlate from '@/components/bitcode/metal-plate';

const meta: Meta<typeof MetalPlate> = {
  title: 'Base/MetalPlate',
  component: MetalPlate,
};
export default meta;

export const Default: StoryObj<typeof MetalPlate> = {
  args: {
    headline: 'Tokens Improved',
    children: (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'rgb(103,254,183)' }}>12,345</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Total tokens enhanced</div>
      </div>
    )
  }
};

