import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TerminalExternalInterfacingPanel from '@/app/terminal/TerminalExternalInterfacingPanel';

jest.mock('@/components/bitcode/pipeline/cards/BitcodeWorkspaceCard', () => ({
  __esModule: true,
  default: function MockTerminalWorkspaceCard({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
  },
}));

jest.mock('@/components/bitcode/pipeline/models/workspace-explainers', () => ({
  TERMINAL_WORKSPACE_EXPLAINERS: {
    boundaryRuntime: [],
  },
}));

jest.mock('@/app/terminal/terminal-shell-reading', () => ({
  jumpToShellSection: jest.fn(),
}));

const externalRealizationPayload = {
  activeRuntime: {
    configuredEnvironmentMode: 'staging',
    actualityDisposition: 'mixed-external-realization',
    interfaceRuntimeStates: [
      {
        interfaceId: 'github-live-interface',
        runtimeState: 'live-configured',
        resultClass: 'configuration-live-ready',
        reconciliationState: 'configuration-ready-awaiting-observation',
        telemetryCoverageState: 'shape-complete-live-execution-pending',
        liveEnabled: true,
        missingBindingKeys: [],
        missingSecretEnvKeys: [],
        environmentIdentityRef: 'github-app://bitcode/staging',
        environmentResourceRef: 'github-installation://bitcode/staging',
      },
    ],
  },
};

describe('TerminalExternalInterfacingPanel', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => externalRealizationPayload,
    } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests and rereads external runtime posture using the route environment override', async () => {
    render(<TerminalExternalInterfacingPanel environmentMode="staging" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/external-realization?environmentMode=staging');
    });

    expect(await screen.findByText('staging')).toBeInTheDocument();
    expect(screen.getByText('Route override active')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls).toHaveLength(2);
    });
    expect((global.fetch as jest.Mock).mock.calls[1]?.[0]).toBe(
      '/api/external-realization?environmentMode=staging',
    );
  });
});
