import React from 'react';
import { renderToString } from 'react-dom/server';
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

describe('ExternalsPane Integration (SSR)', () => {
  it('renders Figma and Notion sections when configured', () => {
    const initialConnectionData = {
      githubConnected: false,
      selectedRepositories: [],
      selectedOrganizations: [],
      figmaConnected: true,
      selectedFigmaProjects: ['Proj1', 'Proj2'],
      notionConnected: true,
      selectedNotionWorkspaces: ['WS1'],
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
        isFirstTimeUser={false}
        isDevMode={false}
        onCompletionStatusChange={() => {}}
        initialConnectionData={initialConnectionData}
        onSave={() => {}}
      />
    );
    // Figma section
    expect(html).toContain('Select Figma Projects');
    expect(html).toContain('Proj1');
    expect(html).toContain('Proj2');
    // Notion section
    expect(html).toContain('Select Notion Workspaces');
    expect(html).toContain('WS1');
  });
});
