import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import AccountOrbital from '@/components/bitcode/orbitals/OrbitalsAccount/OrbitalsAccount';

const meta = {
  title: 'Bitcode/Auxillaries/Account Orbital',
  component: AccountOrbital,
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
} satisfies Meta<typeof AccountOrbital>;

export default meta;
type Story = StoryObj<typeof meta>;

// Provide initialData so the component renders instantly without fetch.
const init = {
  profile: {
    email: 'engineer@example.com',
    username: 'bitcode-swe',
    display_name: 'Bitcode Engineer',
    bio: 'Dedicated to building autonomous software agents.',
  },
  githubConnection: { username: 'bitcode-swe' },
  btdBalance: 42,
  btcFeeBalance: 0.042,
  modelPreferences: { model: 'gpt-4o' },
};

export const Default: Story = {
  render: () => <AccountOrbital onClose={() => {}} initialData={init} />,
};
