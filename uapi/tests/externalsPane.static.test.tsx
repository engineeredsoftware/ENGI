import React from 'react';
import { renderToString } from 'react-dom/server';
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

jest.mock('@/components/bitcode/auth/AuthProvider/AuthProvider', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: () => ({
    data: null,
    hasGitHubConnection: false,
    isLoading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/components/bitcode/vcs/VCSIntegrationPanel/VCSIntegrationPanel', () => ({
  VCSIntegrationPanel: () => <div>GitHub panel</div>,
}));

describe('ExternalsPane SSR Onboarding View', () => {
  it('renders Bitcode connects access posture for signed-out readers', () => {
    const html = renderToString(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={true}
        isDevMode={false}
        initialConnectionData={null}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    expect(html).toContain('Externals Auxillary');
    expect(html).toContain('Auxillary step <!-- -->2');
    expect(html).toContain('Sign in to open Externals');
    expect(html).toContain('read measurement');
    expect(html).toContain('Open Profile auxillary');
  });
});
