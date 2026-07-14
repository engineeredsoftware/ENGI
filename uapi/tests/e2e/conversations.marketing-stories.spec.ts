/**
 * Fixture-driven conversation marketing stories.
 * Tests are registered synchronously so Playwright can collect them at load time.
 */
import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync, existsSync } from 'fs';
import path from 'path';

const fixturesDir = path.join(__dirname, 'fixtures', 'stories');

interface RunStep {
  type: 'run';
  kind: 'asset-pack' | 'measure';
  id: string;
  logChunks: string[];
}

interface ChatStep {
  type: 'user' | 'agent';
  text: string;
}

type Step = RunStep | ChatStep;

async function openConversations(page: Page) {
  await page.goto('/');
  await page.click(
    '[data-testid="conversations-orb"], [data-orbital-testid="conversations-orb"]',
  );
  await page.click(
    'button[title="Fullscreen Mode"], button[aria-label="Fullscreen"], button:has-text("Fullscreen")',
  );
}

async function splitPane(page: Page) {
  await page.click('button[title="Add Split"], button:has-text("Split")');
}

async function embedLogs(page: Page) {
  const btn = page.locator('button:has-text("Logs")');
  if (await btn.isDisabled()) return;
  await btn.click();
}

async function mockRun(page: Page, run: RunStep) {
  await page.addInitScript((payload) => {
    // @ts-expect-error mock surface for story fixtures
    window.__MOCK_WS_MESSAGES__ = window.__MOCK_WS_MESSAGES__ || [];
    // @ts-expect-error mock surface for story fixtures
    window.__MOCK_WS_MESSAGES__.push(payload);
  }, run);
}

test.use({
  launchOptions: {
    args: ['--disable-features=IsolateOrigins,site-per-process'],
  },
});

const storyFiles = existsSync(fixturesDir)
  ? readdirSync(fixturesDir).filter((file) => file.endsWith('.json'))
  : [];

for (const file of storyFiles) {
  const story = JSON.parse(
    readFileSync(path.join(fixturesDir, file), 'utf-8'),
  ) as { title: string; steps: Step[] };

  test(story.title || file, async ({ page }) => {
    await openConversations(page);
    await splitPane(page);
    await embedLogs(page);

    for (const step of story.steps) {
      if (step.type === 'user') {
        await page.fill('.chat-input-container textarea', step.text);
        await page.press('.chat-input-container textarea', 'Enter');
        await expect(page.locator('.message-user', { hasText: step.text })).toBeVisible();
      } else if (step.type === 'agent') {
        await expect(page.locator('.message-agent', { hasText: step.text })).toBeVisible();
      } else if (step.type === 'run') {
        await mockRun(page, step);
        for (const chunk of step.logChunks) {
          await expect(page.locator('.embedded-process-log')).toContainText(chunk);
        }
      }
    }
  });
}

// Ensure collection succeeds even when fixtures are absent.
test('marketing story fixture catalog is present or empty', async () => {
  expect(Array.isArray(storyFiles)).toBe(true);
});
