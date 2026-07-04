import { expect, test, type Page } from '@playwright/test';

import {
  installCommercialBrowserErrorTrap,
  installCommercialMvpApiMocks,
} from './commercial-mvp.helpers';

/**
 * V47 Gate 7 browser proof: selling IP into Bitcode on /deposits, buying
 * synthesized IP on /reads, and auditing settlement, BTD rights, delivery,
 * compensation, and repair readback on /packs — all in deterministic mock
 * mode with source-safe assertions only.
 */

const E2E_REPOSITORY = 'bitcode/bitcode';
const E2E_BRANCH = 'main';
const E2E_COMMIT = '8d4d0a7b6c5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a';

type SeedExecution = Record<string, unknown>;

type ExecutionHistoryMock = {
  journaledRequests: () => Array<Record<string, unknown>>;
};

function readAdmissionSeed(): SeedExecution {
  return {
    id: 'e2e-read-admission',
    created_at: '2026-06-11T10:00:00.000Z',
    status: 'completed',
    type: 'agentic-execution:read-measurement',
    agentic_execution: {
      canonicalType: 'agentic-execution:read-measurement',
      lens: 'read',
      proofStatus: 'read Need accepted',
      closureFocus: 'read measurement + Finding Fits admission',
    },
    context: {
      source: 'terminal-deposit-read-workbench',
      workbench: 'read-admission',
    },
    repo_snapshot: {
      org: 'bitcode',
      repo: 'bitcode',
      branch: E2E_BRANCH,
      commit: E2E_COMMIT,
    },
    output: {},
    items: [],
  };
}

function settledAssetPackSeed(): SeedExecution {
  return {
    id: 'e2e-read-settled',
    created_at: '2026-06-11T10:05:00.000Z',
    status: 'completed',
    type: 'agentic-execution:asset-pack',
    agentic_execution: {
      canonicalType: 'agentic-execution:asset-pack',
      lens: 'read',
      proofStatus: 'settlement finalized and rights transferred',
      closureFocus: 'settlement finality + wallet authority + delivery',
    },
    processing_stats: { measuredBtd: 120 },
    context: {
      source: 'terminal-deposit-read-workbench',
      workbench: 'read-admission',
    },
    repo_snapshot: {
      org: 'bitcode',
      repo: 'bitcode',
      branch: E2E_BRANCH,
      commit: E2E_COMMIT,
    },
    output: {},
    items: [],
  };
}

async function installExecutionHistoryMock(
  page: Page,
  seeds: SeedExecution[],
): Promise<ExecutionHistoryMock> {
  const rows: SeedExecution[] = [...seeds];
  const journaled: Array<Record<string, unknown>> = [];
  let sequence = 0;

  await page.route('**/api/executions/history**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = (route.request().postDataJSON() || {}) as Record<string, unknown>;
      journaled.push(body);
      sequence += 1;
      const context = (body.context || {}) as Record<string, unknown>;
      const output = (body.output || {}) as Record<string, unknown>;
      const repoSnapshot = (output.repo_snapshot || context.repoSnapshot || {
        org: 'bitcode',
        repo: 'bitcode',
        branch: E2E_BRANCH,
        commit: E2E_COMMIT,
      }) as Record<string, unknown>;
      const execution: SeedExecution = {
        id: `e2e-journal-${sequence}`,
        created_at: new Date(2026, 5, 11, 11, sequence).toISOString(),
        status: body.status || 'completed',
        type: body.pipeline_type || 'agentic-execution:deposit',
        agentic_execution: {
          canonicalType: body.pipeline_type || 'agentic-execution:deposit',
          lens: 'deposit',
          proofStatus: String((output.summary as string) || 'journaled'),
          closureFocus: String(context.closureFocus || 'deposit posture'),
        },
        context,
        repo_snapshot: repoSnapshot,
        output,
        items: body.items || [],
      };
      rows.unshift(execution);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ execution }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(rows),
    });
  });

  return { journaledRequests: () => journaled };
}

test.describe('commercial MVP IP exchange browser proof', () => {
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await installCommercialMvpApiMocks(page);
  });

  test('IP seller deposits an AssetPack: source connection, option synthesis, source-safe review, admission, compensation visibility', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);
    const history = await installExecutionHistoryMock(page, []);

    await page.goto(
      `/deposits?provider=github&repo=${encodeURIComponent(E2E_REPOSITORY)}&sourceBranch=${E2E_BRANCH}`,
    );
    await expect(page.getByTestId('route-shell-deposit')).toBeVisible({ timeout: 90_000 });

    // Source connection precedes synthesis: the synthesize action stays
    // disabled until the route session resolves a repository source.
    const synthesizeButton = page.getByRole('button', { name: 'Synthesize options' });
    await expect(synthesizeButton).toBeEnabled({ timeout: 30_000 });

    await synthesizeButton.click();

    // Source-safe measurement review renders before any approval decision.
    const optionCard = page.locator('[data-testid^="deposit-option-"]').first();
    await expect(optionCard).toBeVisible({ timeout: 30_000 });
    await expect(optionCard.getByText('BTD potential').first()).toBeVisible();
    await expect(optionCard.getByText('BTC source-to-shares preview').first()).toBeVisible();
    await expect(optionCard.getByText('Option roots').first()).toBeVisible();

    // Approve for Depository admission and observe admission readback.
    await optionCard.getByRole('button', { name: 'Approve for Depository' }).click();
    await expect(optionCard.getByRole('button', { name: 'Approved for Depository' })).toBeVisible({
      timeout: 30_000,
    });

    // Compensation visibility and /packs synchronization remain reachable.
    await expect(page.getByText('Deposit pipelines')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open pack activity' })).toHaveAttribute(
      'href',
      '/packs?type=depository-assetpack',
    );

    // The deposit flow journaled source-safe execution rows: synthesis first,
    // then the review/admission decisions.
    expect.poll(() => history.journaledRequests().length).toBeGreaterThanOrEqual(2);
    const journaledTypes = history
      .journaledRequests()
      .map((request) => String(request.pipeline_type || ''));
    expect(journaledTypes.some((type) => type.includes('deposit-option-synthesis'))).toBe(true);

    await trap.assertClean();
  });

  test('IP buyer reads measurements, quote basis, settlement finality, BTD rights, and repository delivery on /reads', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);
    await installExecutionHistoryMock(page, [settledAssetPackSeed(), readAdmissionSeed()]);

    await page.goto(
      `/reads?provider=github&repo=${encodeURIComponent(E2E_REPOSITORY)}&sourceBranch=${E2E_BRANCH}&transactionId=e2e-read-settled`,
    );
    await expect(page.getByTestId('route-shell-read')).toBeVisible({ timeout: 90_000 });

    // Five-step buyer session is route-owned.
    for (const stepId of [
      'request-read',
      'review-synthesized-need',
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ]) {
      await expect(page.getByTestId(`read-route-step-${stepId}`)).toBeVisible();
    }

    // Measurement before price: the fit measurement review renders Need
    // coverage through delivery readiness with the final BTD scalar and the
    // deterministic BTC-testnet quote basis.
    await expect(
      page.getByRole('heading', { name: 'Fit measurement review' }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Need coverage', { exact: true })).toBeVisible();
    await expect(page.getByText('Fit confidence', { exact: true })).toBeVisible();
    await expect(page.getByText('Delivery readiness', { exact: true })).toBeVisible();
    await expect(page.getByText('Final BTD scalar', { exact: true })).toBeVisible();
    await expect(page.getByText(/120\s*BTD knowledge-volume/u)).toBeVisible();
    await expect(page.getByText('Quote basis', { exact: true })).toBeVisible();
    await expect(page.getByText(/on btc-testnet/u)).toBeVisible();
    await expect(page.getByText('Selected Fit provenance', { exact: true })).toBeVisible();

    // Settlement ordering readback: observation, finality, rights, delivery.
    await expect(
      page.getByRole('heading', { name: 'Settlement, rights, and delivery' }),
    ).toBeVisible();
    await expect(page.getByText('btc testnet payment observed')).toBeVisible();
    await expect(page.getByText(/btc testnet finality confirmed/u).first()).toBeVisible();
    await expect(page.getByText(/btd rights transferred/u).first()).toBeVisible();
    await expect(page.getByText(/repository pr delivery materialized/u).first()).toBeVisible();

    // Proof-backed readback: rights and delivery receipt roots are exposed in
    // the expandable source-safe proof detail.
    await page.getByText('Reading proof detail', { exact: true }).click();
    const proofDetail = page.getByTestId('read-expandable-proof-detail');
    await expect(proofDetail).toBeVisible();
    await expect(proofDetail.getByText('BTD rights receipt root')).toBeVisible();
    await expect(proofDetail.getByText('Delivery receipt root')).toBeVisible();

    // Settled AssetPacks remain auditable through /packs.
    await expect(page.getByRole('link', { name: 'Open settled pack activity' })).toHaveAttribute(
      'href',
      '/packs?type=settled-assetpack',
    );

    await trap.assertClean();
  });

  test('Pack activity dashboard reads back settlement, BTD rights, compensation, delivery, and the fail-closed repair surface', async ({
    page,
  }, testInfo) => {
    const trap = installCommercialBrowserErrorTrap(page, testInfo);

    const record = {
      id: 'e2e-pack-settled',
      type: 'settled-assetpack',
      scope: 'network',
      title: 'Auth rollback proof pack',
      description: 'Settled AssetPack with transferred BTD rights.',
      timestamp: '2026-06-11T10:05:00.000Z',
      state: 'btd-settled-rights-transferred',
      repository: E2E_REPOSITORY,
      assetPackTitle: 'Auth rollback proof pack',
      settlementState: 'btc-finality-confirmed',
      rightsState: 'btd-rights-transferred',
      compensationState: 'allocated',
      deliveryState: 'repository-pr-delivery-materialized',
      repairState: 'not_required',
      measurements: [
        { id: 'measured-btd', label: 'Measured btd', value: 120, unit: 'BTD', root: null },
      ],
      values: [{ id: 'btc-fee', label: 'Btc fee', amount: 3200, unit: 'sats' }],
      accounting: null,
      governance: null,
      proofRoots: [
        { id: 'rights-root', label: 'Rights receipt root', root: 'read-btd-rights-receipt-e2e' },
      ],
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        sourceSnippetVisible: false,
      },
      metadata: {},
    };
    const detail = {
      id: record.id,
      type: record.type,
      title: record.title,
      description: record.description,
      timestamp: record.timestamp,
      sourceSafety: record.sourceSafety,
      overview: {
        state: record.state,
        scope: record.scope,
        repository: record.repository,
        assetPackTitle: record.assetPackTitle,
      },
      measurements: record.measurements,
      values: record.values,
      accounting: null,
      governance: null,
      proofRoots: record.proofRoots,
      commodityState: {
        repairRequired: true,
        blockers: ['compensation statement evidence missing'],
      },
      states: {
        settlement: record.settlementState,
        rights: record.rightsState,
        compensation: record.compensationState,
        delivery: record.deliveryState,
        repair: 'repair-required',
      },
      telemetry: {
        sourceEventId: record.id,
        sourceKind: 'execution',
        sourceChannel: 'system-surface',
      },
      metadata: {},
    };

    await page.route('**/api/packs/activity**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          records: [record],
          detail,
          summary: {
            total: 1,
            types: { 'settled-assetpack': 1 },
            states: { 'btd-settled-rights-transferred': 1 },
            repositories: [E2E_REPOSITORY],
            settlementReady: 1,
            compensationReady: 1,
            deliveryReady: 1,
            repairOpen: 1,
          },
        }),
      });
    });

    await page.goto('/packs?type=settled-assetpack');
    await expect(page.getByTestId('route-shell-packs')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText('Auth rollback proof pack').first()).toBeVisible({
      timeout: 30_000,
    });

    // Master-detail state readback tracks the full lifecycle order.
    await expect(page.getByText('State readback')).toBeVisible();
    await expect(page.getByText('btc-finality-confirmed').first()).toBeVisible();
    await expect(page.getByText('btd-rights-transferred').first()).toBeVisible();
    await expect(page.getByText('repository-pr-delivery-materialized').first()).toBeVisible();

    // The fail-closed repair surface lists commodity-state blockers.
    await expect(page.getByText('Repair surface')).toBeVisible();
    await expect(page.getByText('compensation statement evidence missing')).toBeVisible();

    await trap.assertClean();
  });
});
