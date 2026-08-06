import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import ModelsPane from '@/components/auxillaries/AuxillariesInterfacesPane/AuxillariesInterfacesPane';
import { useUserData } from '@/hooks/useUserData';
import { SUPPORTED_LLM_MODELS } from '@/utils/model-pricing';

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('Models Pane uses centralized model catalog', () => {
  beforeEach(() => {
    mockUseUserData.mockReturnValue({
      data: {
        modelPreferences: {},
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

  test('renders entries for each provider first model', () => {
    const initialModelPreferences = {};
    render(
      <ModelsPane
        onSave={jest.fn()}
        loading={false}
        isOnboardingComplete={true}
        initialModelPreferences={initialModelPreferences}
      />
    );

    // For robustness, assert at least one entry per provider is rendered
    SUPPORTED_LLM_MODELS.forEach((prov) => {
      const first = prov.models[0];
      if (!first) return;
      const expected = `${prov.provider.toUpperCase()} · ${first.id}`;
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
