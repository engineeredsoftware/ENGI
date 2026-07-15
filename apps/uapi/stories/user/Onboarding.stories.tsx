import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import AuxillariesContent from '@/components/auxillaries/AuxillariesContent/AuxillariesContent';

type OnboardingStep = 'profile' | 'github' | 'payment' | 'completed';

const steps: OnboardingStep[] = ['profile', 'github', 'payment', 'completed'];

const meta = {
  title: 'Bitcode/Auxillaries/Onboarding',
  component: AuxillariesContent,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
} satisfies Meta<typeof AuxillariesContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function StepContent({ step }: { step: OnboardingStep }) {
  return (
    <div className="p-6 text-gray-200 max-w-sm">
      <h3 className="text-emerald-300 font-semibold capitalize mb-2">{step}</h3>
      <p>This is placeholder content for the <strong>{step}</strong> step.</p>
    </div>
  );
}

export const ProfileStep: Story = {
  name: 'Step – Profile',
  render: () => (
    <div style={{ width: 500, height: 500 }}>
      <AuxillariesContent
        steps={steps}
        currentStep="profile"
        completedSteps={[]}
        availableSteps={['profile']}
        showContent
        showSuccessAnimation={false}
        onStepClick={() => {}}
        renderStepContent={(s) => <StepContent step={s as OnboardingStep} />}
      />
    </div>
  ),
};

export const GithubStepCompleted: Story = {
  name: 'Step – GitHub (completed)',
  render: () => (
    <div style={{ width: 500, height: 500 }}>
      <AuxillariesContent
        steps={steps}
        currentStep="github"
        completedSteps={['profile']}
        availableSteps={['github']}
        showContent
        showSuccessAnimation={false}
        onStepClick={() => {}}
        renderStepContent={(s) => <StepContent step={s as OnboardingStep} />}
      />
    </div>
  ),
};

export const PaymentSuccess: Story = {
  name: 'Step – Payment success',
  render: () => (
    <div style={{ width: 500, height: 500 }}>
      <AuxillariesContent
        steps={steps}
        currentStep="payment"
        completedSteps={['profile', 'github']}
        availableSteps={['payment']}
        showContent
        showSuccessAnimation
        onStepClick={() => {}}
        renderStepContent={(s) => <StepContent step={s as OnboardingStep} />}
      />
    </div>
  ),
};
