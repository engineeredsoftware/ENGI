import { test, expect } from '@playwright/test';
import { setOnboardingState } from './auxillaries.helpers';

test.describe('Auxillaries - Interfaces Step', () => {
  test('auxillaries-interfaces-first-load', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'interfaces', ['profile', 'externals']);
    await page.reload();
    await page.waitForSelector('textarea#global-system-prompt');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-interfaces-first-load.png');
  });

  test('auxillaries-interfaces-prompt-edited', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'interfaces', ['profile', 'externals']);
    await page.reload();
    const prompt = page.locator('textarea#global-system-prompt');
    await prompt.fill('Updated system prompt');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-interfaces-prompt-edited.png');
  });

  test('auxillaries-interfaces-model-switch', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'interfaces', ['profile', 'externals']);
    await page.reload();
    const selector = page.locator('select').first();
    await selector.selectOption('gpt-3.5');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-interfaces-model-switch.png');
  });
});
