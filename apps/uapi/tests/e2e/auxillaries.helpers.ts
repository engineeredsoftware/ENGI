import type { Page } from '@playwright/test';

/**
 * Sets up the localStorage onboarding state for auxillaries tests.
 * @param page Playwright Page object
 * @param step Current onboarding step ('profile'|'externals'|'interfaces'|'wallet')
 * @param completedSteps Array of steps already completed
 */
export async function setOnboardingState(
  page: Page,
  step: string,
  completedSteps: string[] = []
) {
  await page.evaluate(
    ([step, completedSteps]) => {
      localStorage.setItem(
        'onboardingState',
        JSON.stringify({
          isOnboarding: true,
          currentOnboardingStep: step,
          completedSteps,
          isFirstTimeUser: true
        })
      );
    },
    [step, completedSteps]
  );
}
