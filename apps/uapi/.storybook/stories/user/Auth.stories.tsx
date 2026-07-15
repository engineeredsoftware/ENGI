import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import AuxillariesLoginPane from '@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane';

// NOTE: LoginPane already embeds the animated headline, quantum bg and the
// LoginForm with its multi-stage flow.  For Storybook we simply mount it – the
// internal state machine can be exercised manually by typing an email, hitting
// the “DO” button, etc.

const meta = {
  title: 'Bitcode/Auxillaries/Auth/Login',
  component: AuxillariesLoginPane,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
} satisfies Meta<typeof AuxillariesLoginPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Auxillaries Login Pane',
  render: () => <AuxillariesLoginPane onToggle={() => {}} />,
};
