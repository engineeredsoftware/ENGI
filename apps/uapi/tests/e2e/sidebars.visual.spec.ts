import { test, expect } from '@playwright/test';

// Visual regression tests for sidebar toggles
test.describe('UI Visual - Sidebars', () => {
  test('Left Sidebar toggle animation', async ({ page }) => {
    await page.goto('/');
    // Wait for left sidebar toggle button
    const leftToggle = page.locator('div.fixed.top-4.left-0');
    await expect(leftToggle).toBeVisible();
    // Closed state snapshot
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('sidebar-left-closed.png');
    // Open sidebar
    await leftToggle.click();
    await page.waitForTimeout(500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('sidebar-left-open.png');
  });

  test('Right Sidebar toggle animation', async ({ page }) => {
    await page.goto('/');
    // Wait for right sidebar toggle button
    const rightToggle = page.locator('div.fixed.top-4.right-0');
    await expect(rightToggle).toBeVisible();
    // Closed state snapshot
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('sidebar-right-closed.png');
    // Open sidebar
    await rightToggle.click();
    await page.waitForTimeout(500);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('sidebar-right-open.png');
  });
});