import { test, expect } from '@playwright/test';

test.describe('User Story: Marketing Homepage Scrolling', () => {
  test('snapshots key sections', async ({ page }) => {
    await page.goto('/');
    const sections = [
      { name: 'header', selector: 'h1' },
      { name: 'features', selector: 'text=Features Grid' },
      { name: 'pricing', selector: 'text=Pricing' },
      { name: 'testimonials', selector: 'text=Trusted by' },
      { name: 'footer', selector: 'footer' }
    ];
    for (const sec of sections) {
      await page.waitForSelector(sec.selector);
      await page.locator(sec.selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      expect(await page.screenshot({ fullPage: true }))
        .toMatchSnapshot(`story-marketing-${sec.name}.png`);
    }
  });
});