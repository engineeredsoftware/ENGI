import { test, expect } from '@playwright/test';
import { setOnboardingState } from './auxillaries.helpers';

test.describe('@profile Auxillaries - Externals Step', () => {
  test('auxillaries-connects-first-load', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Wait for connects step badge to appear
    await page.waitForSelector('[data-testid="externals-step-badge"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-first-load.png');
  });

  test('auxillaries-connects-github-connect-hover', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Hover over GitHub connect button
    await page.waitForSelector('[data-testid="externals-github-button"]');
    await page.hover('[data-testid="externals-github-button"]');
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-github-connect-hover.png');
  });

  test('auxillaries-connects-github-connected', async ({ page }) => {
    await page.goto('/');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Simulate GitHub connect click
    await page.click('[data-testid="externals-github-button"]');
    // Wait for connected status and summary
    await page.waitForSelector('[data-testid="externals-step-badge"]');
    // Wait for repository chips and selection list
    await page.waitForSelector('[data-testid="connections-repo-chip-user/repo-1"]');
    await page.waitForSelector('[data-testid="connections-repo-item-user/repo-1"]');
    // Capture connected UI
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-github-connected.png');
  });
  
  test.skip('auxillaries-connects-figma-connected', async ({ page }) => {
    await page.goto('/?dev=true');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Click Figma connect button
    await page.click('[data-testid="connections-figma-button"]');
    await page.waitForTimeout(1500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-figma-connected.png');
  });
  
  test.skip('auxillaries-connects-notion-connected', async ({ page }) => {
    await page.goto('/?dev=true');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Click Notion connect button
    await page.click('[data-testid="connections-notion-button"]');
    await page.waitForTimeout(1500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-notion-connected.png');
  });
  
  test('auxillaries-connects-api-keys-generate', async ({ page, context }) => {
    // Stub API keys endpoints
    await context.route('**/api/auxillaries/api-keys', route => {
      const method = route.request().method();
      if (method === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else if (method === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ apiKey: 'test-key-123' }),
        });
      }
    });
    await page.goto('/?dev=true');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Generate new API key
    await page.click('[data-testid="connections-generate-apikey-button"]');
    await page.fill('[data-testid="connections-apikey-name-input"]', 'MyKey');
    await page.fill('[data-testid="connections-apikey-expire-input"]', '2030-12-31');
    await page.click('[data-testid="connections-create-apikey-button"]');
    // Wait for key display
    await page.waitForSelector('[data-testid="connections-apikey-output"]');
    await expect(page.locator('[data-testid="connections-apikey-output"]')).toContainText('test-key-123');
  });

  test('auxillaries-connects-github-verify-failure', async ({ page, context }) => {
    // Stub GitHub verify to return error
    await context.route('**/api/auxillaries/connections/github', route =>
      route.fulfill({
        status: 400,
        contentType: 'text/plain',
        body: 'Invalid installation code',
      })
    );
    await page.goto('/');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Enter fake verification code
    await page.fill('[data-testid="connections-verify-input"]', '12345-abcde');
    await page.click('[data-testid="connections-verify-button"]');
    // Expect error displayed and remain on verify input
    const errLocator = page.locator('[data-testid="connections-error"]');
    await expect(errLocator).toHaveText('Invalid installation code');
    await expect(page.locator('[data-testid="connections-verify-input"]')).toBeVisible();
    // Capture visual
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-github-verify-failure.png');
  });

  test('auxillaries-connects-api-keys-delete', async ({ page, context }) => {
    // Initial GET returns two keys
    await context.route('**/api/auxillaries/api-keys', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'key1', name: 'FirstKey', expireAt: '2030-01-01', createdAt: '2025-01-01T00:00:00Z' },
            { id: 'key2', name: 'SecondKey', expireAt: null, createdAt: '2025-02-01T00:00:00Z' }
          ])
        });
      }
    });
    // Stub DELETE to succeed
    await context.route('**/api/auxillaries/api-keys?id=key1', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.goto('/');
    await setOnboardingState(page, 'externals', ['profile']);
    await page.reload();
    // Wait for API key list
    const item1 = page.locator('[data-testid="connections-apikey-item-key1"]');
    const item2 = page.locator('[data-testid="connections-apikey-item-key2"]');
    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();
    // Capture initial state
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-apikey-list.png');
    // Delete first key
    await page.click('[data-testid="connections-delete-apikey-button-key1"]');
    // Wait for removal
    await expect(item1).toBeHidden();
    // Capture after deletion
    await page.waitForTimeout(300);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('auxillaries-connects-apikey-after-delete.png');
  });
});
