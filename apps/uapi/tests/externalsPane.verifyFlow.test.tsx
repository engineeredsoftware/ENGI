import React from 'react';
import '@testing-library/jest-dom';
// Use the actual Testing Library implementation, not the virtual mock from setupTests
const { render, screen, fireEvent, waitFor } = jest.requireActual('@testing-library/react');
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

// Skipping interactive verify flow tests due to lack of full DOM in SSR test environment
describe.skip('ExternalsPane Verify Flow (interactive)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles verify, loads repos/orgs, and submits selected data', async () => {
    // Mock POST for verification
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      // Mock GET for fetching repos/orgs
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        success: true,
        connectionData: { installationId: '123', code: 'abc' },
        repositories: [
          { full_name: 'orgA/repo1', owner: { type: 'Organization', login: 'orgA' } },
          { full_name: 'userB/repo2', owner: { type: 'User', login: 'userB' } }
        ],
        organizations: ['orgA'],
      }) });

    const onSave = jest.fn();
    render(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={true}
        isDevMode={false}
        initialConnectionData={null}
        onCompletionStatusChange={() => {}}
        onSave={onSave}
      />
    );

    // Enter combined code
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123-abc' } });
    // Click Verify
    fireEvent.click(screen.getByText('Verify'));
    // Wait for fetch calls
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    // Repos summary appears
    expect(screen.getByText(/Connected Repositories \(2\)/)).toBeInTheDocument();
    // Organization summary
    expect(screen.getByText('orgA')).toBeInTheDocument();
    // Select a repo
    fireEvent.click(screen.getByText('orgA/repo1'));

    // Trigger form submit via hidden button
    const submitBtn = document.getElementById('connections-submit-button');
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn!);

    // onSave should be called with selected data
    expect(onSave).toHaveBeenCalledWith({
      githubConnected: true,
      selectedRepositories: ['orgA/repo1'],
      selectedOrganizations: [],
      figmaConnected: false,
      selectedFigmaProjects: [],
      notionConnected: false,
      selectedNotionWorkspaces: [],
      gitlabConnected: false,
      googleDriveConnected: false,
      linearConnected: false,
      jiraConnected: false,
      slackConnected: false,
      confluenceConnected: false,
      asanaConnected: false,
      trelloConnected: false,
      sshKey: '',
    });
  });
});
