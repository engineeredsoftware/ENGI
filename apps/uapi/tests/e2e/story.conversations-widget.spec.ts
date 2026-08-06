import { test, expect } from '@playwright/test';

test.describe('User Story: Conversations Chat Widget', () => {
  test('collapsed and expanded widget', async ({ page }) => {
    await page.goto('/');
    // Open Conversations orb and take a snapshot
    await page.click('[data-testid="conversations-orb"], [data-orbital-testid="conversations-orb"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('story-conversations-expanded.png');
  });
});
