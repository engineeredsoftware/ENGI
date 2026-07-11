import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { UserMenu } from '@/components/bitcode/layout/user-menu';

// ---------------------------------------------------------------------------
// Mock Supabase user object – only fields accessed by UserMenu are email and
// user_metadata.avatar_url (optional).  We stub the minimal shape to keep the
// component happy without pulling supabase runtime deps.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const mockUser = {
  id: '00000000-0000-4000-8000-000000000000',
  aud: 'authenticated',
  email: 'engiswe@example.com',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    avatar_url: 'https://placehold.co/64x64.png',
  },
} as unknown as import('@supabase/supabase-js').User;

const meta = {
  title: 'User/Nav/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Dropdown (closed)',
  render: () => (
    <div style={{ minHeight: 200 }}>
      <UserMenu user={mockUser} onSignOut={() => {}} onManageAccount={() => {}} />
    </div>
  ),
};
