import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import OrbitalsInterfacesPane from '@/components/auxillaries/AuxillariesInterfacesPane/AuxillariesInterfacesPane';
import { useUserData } from '@/hooks/useUserData';

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('AuxillariesInterfacesPane', () => {
  beforeEach(() => {
    mockUseUserData.mockReturnValue({
      data: {
        modelPreferences: {
          existingSetting: 'keep-me',
          review_profile: 'bitcode-review-lab',
        },
        interfaceAdmissions: [
          {
            kind: 'AuxillariesInterfaceAdmission',
            interfaceId: 'product',
            surface: 'product',
            authMode: 'session',
            readiness: 'ready',
            policyRequirements: ['session_required', 'organization_policy_required_for_protected_actions'],
            policyConstraints: ['session_required', 'organization_policy_required_for_protected_actions'],
            supportedActions: ['request_read', 'review_need', 'request_finding_fits'],
            allowedActions: ['request_read', 'review_need'],
            blockers: [],
            sourceSafetyClass: 'source_safe',
            deferredProductDepth: 'none',
            interfaceAdmissionRoot: 'terminal-root',
          },
          {
            kind: 'AuxillariesInterfaceAdmission',
            interfaceId: 'mcp',
            surface: 'mcp',
            authMode: 'provider_oauth',
            readiness: 'degraded',
            policyRequirements: ['provider_oauth_required', 'wallet_binding_required_for_delivery'],
            policyConstraints: ['provider_oauth_required', 'wallet_binding_required_for_delivery'],
            supportedActions: ['read_repository_context', 'deliver_asset_pack'],
            allowedActions: ['read_repository_context'],
            blockers: ['wallet.binding_required_for_delivery'],
            sourceSafetyClass: 'secret_free_summary',
            deferredProductDepth: 'none',
            interfaceAdmissionRoot: 'mcp-root',
          },
          {
            kind: 'AuxillariesInterfaceAdmission',
            interfaceId: 'exchange-hook',
            surface: 'exchange',
            authMode: 'wallet_signature',
            readiness: 'blocked',
            policyRequirements: ['future_exchange_law_deferred', 'wallet_signature_required'],
            policyConstraints: ['future_exchange_law_deferred', 'wallet_signature_required'],
            supportedActions: ['pay_btc_fee', 'unlock_asset_pack_source'],
            allowedActions: [],
            blockers: ['exchange.market_depth_deferred_to_future_version'],
            sourceSafetyClass: 'protected_source_redacted',
            deferredProductDepth: 'exchange_market_law',
            interfaceAdmissionRoot: 'exchange-root',
          },
        ],
      },
      hasGitHubConnection: true,
      btdBalance: 1200,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: true,
      onboardedSteps: ['profile', 'externals', 'interfaces', 'wallet'],
    } as any);
  });

  it('renders production interfaces sections and autosaves merged defaults', async () => {
    const onSave = jest.fn();

    render(
      <OrbitalsInterfacesPane
        onSave={onSave}
        loading={false}
        isOnboardingComplete={false}
      />,
    );

    expect(screen.getAllByText('Auxillary step 4')).toHaveLength(2);
    expect(screen.getByText(/Pack detail and interface defaults/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Interface instruction baseline/i })).toBeTruthy();
    expect(screen.getByText(/Registry fixed/i)).toBeInTheDocument();
    expect(screen.getByTestId('auxillaries-interface-admission-catalog')).toBeInTheDocument();
    expect(screen.getAllByText(/packs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/mcp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/exchange hook/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wallet binding required for delivery/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/exchange market depth deferred to future version/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/1\/3 ready/i)).toBeInTheDocument();
    expect(screen.queryByText(/Apply review model/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /signal/i }));
    fireEvent.click(screen.getByRole('button', { name: /chatgpt app/i }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /raw bias toward exact payload reading first\./i,
      }),
    );
    fireEvent.change(screen.getByLabelText(/Global System Prompt/i), {
      target: { value: 'Keep closure exact and user-facing.' },
    });

    expect(screen.getByText(/Changes save automatically so product transactions, proofs, MCP API calls, and ChatGPT App work/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            existingSetting: 'keep-me',
            globalSystemPrompt: 'Keep closure exact and user-facing.',
            ledgerizedPipelineModels: 'registry_deterministic',
            modelSelectionScope: 'non_ledgerized_conversation_only',
            interfacesDefaults: expect.objectContaining({
              productDetailDensity: 'signal',
              externalInterfaceEntry: 'chatgpt',
              proofMode: 'raw',
            }),
            workspaceDefaults: expect.objectContaining({
              productDetailDensity: 'signal',
              externalInterfaceEntry: 'chatgpt',
              proofMode: 'raw',
            }),
          }),
        );
        const payload = onSave.mock.calls.at(-1)?.[0] as Record<string, unknown>;
        expect(payload.defaultModel).toBeUndefined();
        expect(payload.defaultProvider).toBeUndefined();
        expect(payload.preferred_model).toBeUndefined();
      },
      { timeout: 2000 },
    );
  });
});
