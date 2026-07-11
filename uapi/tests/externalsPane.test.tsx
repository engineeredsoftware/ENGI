import React from 'react';
import { renderToString } from 'react-dom/server';
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

describe('ExternalsPane (SSR)', () => {
  it('renders summary card with dynamic organization and repositories', () => {
    const initialConnectionData = {
      githubConnected: true,
      selectedOrganizations: ['org1', 'org2'],
      selectedRepositories: ['repo1', 'repo2', 'repo3'],
      figmaConnected: false,
      notionConnected: false,
      gitlabConnected: false,
      googleDriveConnected: false,
      linearConnected: false,
      jiraConnected: false,
      slackConnected: false,
      confluenceConnected: false,
      asanaConnected: false,
      trelloConnected: false,
      sshKey: ''
    };
    const html = renderToString(
      <ExternalsPane
        loading={false}
        initialConnectionData={initialConnectionData}
        isFirstTimeUser={false}
        onCompletionStatusChange={() => {}}
        isDevMode={false}
        onSave={() => {}}
      />
    );
    // Summary heading
    expect(html).toContain('Connected Repositories (3)');
    // First organization
    expect(html).toContain('org1');
    // Repository names
    expect(html).toContain('repo1');
    expect(html).toContain('repo2');
    expect(html).toContain('repo3');
  });
});
