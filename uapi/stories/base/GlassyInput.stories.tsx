import type { Meta, StoryObj } from '@storybook/react';
import GlassyInput from '@/components/bitcode/inputs/GlassyInput';

const meta: Meta<typeof GlassyInput> = {
  title: 'Base/GlassyInput',
  component: GlassyInput,
};
export default meta;

export const Default: StoryObj<typeof GlassyInput> = {
  render: () => (
    <div style={{ padding: 24, background: '#0a0f1c' }}>
      <GlassyInput style={{ padding: 12 }}>
        <textarea style={{ width: '100%', minHeight: 120, background: 'transparent', color: '#e5e7eb', outline: 'none', border: 0 }} placeholder="Type here..." />
      </GlassyInput>
    </div>
  )
};

