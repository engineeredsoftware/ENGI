import { test, expect } from '@playwright/test';

test.describe('Conversations split screen with embedded logs', () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test('shows per-pane logs and hides sidebar', async ({ page }) => {
    await page.goto('/');

    // Open Conversations orb and go fullscreen
    await page.click('[data-testid="conversations-orb"], [data-orbital-testid="conversations-orb"]');
    await page.click('button[title="Fullscreen Mode"]');

    // Create a second split pane
    await page.click('button[title="Add Split"]');

    // Toggle Logs to embed
    await page.click('button[title="Embed Logs"]');

    // Expect right sidebar to be gone
    await expect(page.locator('.fullscreen-sidebar-right')).toHaveCount(0);

    // Expect two conversation cards each with embedded logs column
    const cards = page.locator('.conversation-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('.embedded-process-log')).toBeVisible();
    await expect(cards.nth(1).locator('.embedded-process-log')).toBeVisible();
  });

  test('Logs toggle disabled when only one pane', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="conversations-orb"], [data-orbital-testid="conversations-orb"]');
    await page.click('button[title="Fullscreen Mode"]');

    const logsBtn = page.locator('button:has-text("Logs")');
    await expect(logsBtn).toBeDisabled();
  });
});
