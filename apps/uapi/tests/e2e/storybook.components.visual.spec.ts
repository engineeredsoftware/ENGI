import { test, expect } from '@playwright/test';

// Visual regression tests for isolated Storybook components
// Port for Storybook server; override via STORYBOOK_PORT env var or default to 6006
const storybookPort = process.env.STORYBOOK_PORT ? parseInt(process.env.STORYBOOK_PORT, 10) : 6006;
const STORYBOOK_URL = `http://localhost:${storybookPort}/iframe.html?viewMode=story&id=`;

test.describe('Storybook component visual snapshots', () => {
  // Button stories
  test('Button Primary', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-button--primary`);
    await expect(page).toHaveScreenshot('button-primary.png', { fullPage: true });
  });

  test('Button Secondary', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-button--secondary`);
    await expect(page).toHaveScreenshot('button-secondary.png', { fullPage: true });
  });

  test('Button Large', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-button--large`);
    await expect(page).toHaveScreenshot('button-large.png', { fullPage: true });
  });

  test('Button Small', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-button--small`);
    await expect(page).toHaveScreenshot('button-small.png', { fullPage: true });
  });

  // Header stories
  test('Header Logged In', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-header--logged-in`);
    await expect(page).toHaveScreenshot('header-logged-in.png', { fullPage: true });
  });

  test('Header Logged Out', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-header--logged-out`);
    await expect(page).toHaveScreenshot('header-logged-out.png', { fullPage: true });
  });

  // Page stories
  test('Page Logged Out', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-page--logged-out`);
    await expect(page).toHaveScreenshot('page-logged-out.png', { fullPage: true });
  });

  test('Page Logged In', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}example-page--logged-in`);
    await expect(page).toHaveScreenshot('page-logged-in.png', { fullPage: true });
  });
});