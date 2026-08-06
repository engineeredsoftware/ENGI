import { expect, test } from '@playwright/test';

test.describe('Landing page mobile scrolling', () => {
  test('uses natural document scroll instead of an inner mobile scroll root', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'mobile-only landing regression');

    await page.goto('/');

    const container = page.locator('.marketing-landing-shell');
    await expect(container).toBeVisible();

    const beforeScroll = await container.evaluate((element) => {
      const containerElement = element as HTMLElement;

      return {
        htmlOverflowY: window.getComputedStyle(document.documentElement).overflowY,
        bodyOverflowY: window.getComputedStyle(document.body).overflowY,
        containerOverflowX: window.getComputedStyle(containerElement).overflowX,
        containerOverflowY: window.getComputedStyle(containerElement).overflowY,
        windowInnerHeight: window.innerHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
      };
    });

    expect(beforeScroll.htmlOverflowY).not.toBe('hidden');
    expect(beforeScroll.bodyOverflowY).not.toBe('hidden');
    expect(beforeScroll.containerOverflowX).toBe('clip');
    expect(beforeScroll.containerOverflowY).not.toBe('auto');
    expect(beforeScroll.containerOverflowY).not.toBe('scroll');
    expect(beforeScroll.documentScrollHeight).toBeGreaterThan(beforeScroll.windowInnerHeight);

    await page.evaluate(() => {
      window.scrollTo({ top: 480, behavior: 'auto' });
    });

    const afterScroll = await container.evaluate((element) => {
      const containerElement = element as HTMLElement;

      return {
        containerScrollTop: containerElement.scrollTop,
        windowScrollY: window.scrollY,
        documentScrollTop: document.documentElement.scrollTop + document.body.scrollTop,
      };
    });

    expect(afterScroll.containerScrollTop).toBe(0);
    expect(afterScroll.windowScrollY).toBeGreaterThan(0);
    expect(afterScroll.documentScrollTop).toBeGreaterThan(0);
  });
});
