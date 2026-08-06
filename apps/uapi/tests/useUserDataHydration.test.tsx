import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

jest.mock('@bitcode/orm', () => ({
  readBitcodeWalletCapabilityFromProfile: () => ({
    hasIdentity: false,
    isVerifiedSigner: false,
    binding: null,
  }),
}));

import { resetUserDataCacheForTests, useUserData } from '@/hooks/useUserData';

function BalanceProbe() {
  const { btdBalance } = useUserData();
  return <span>{btdBalance}</span>;
}

function jsonResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

describe('useUserData hydration posture', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn(() => new Promise<Response>(() => {})) as jest.Mock;
  });

  afterEach(() => {
    localStorage.clear();
    resetUserDataCacheForTests();
    global.fetch = originalFetch;
  });

  it('keeps pre-effect balance markup aligned before reading cached wallet state', () => {
    localStorage.setItem('btd_balance_cached', '1200');

    expect(renderToString(<BalanceProbe />)).toContain('<span>0</span>');
  });

  it('hydrates cached wallet state after mount', async () => {
    localStorage.setItem('btd_balance_cached', '1200');

    const { result } = renderHook(() => useUserData());

    await waitFor(() => {
      expect(result.current.btdBalance).toBe(1200);
    });
  });

  it('revalidates stale module-level user data after a new mount', async () => {
    let resolveSecondResponse: ((response: Response) => void) | null = null;
    const secondResponse = new Promise<Response>((resolve) => {
      resolveSecondResponse = resolve;
    });
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ btdBalance: 0, btcFeeBalance: null, recentBtdAssetPacks: [] }))
      .mockReturnValueOnce(secondResponse);
    global.fetch = fetchMock as jest.Mock;

    const first = renderHook(() => useUserData());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(first.result.current.btdBalance).toBe(0);
    first.unmount();

    const second = renderHook(() => useUserData());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(second.result.current.btdBalance).toBe(0);
    expect(second.result.current.isRevalidating).toBe(true);

    resolveSecondResponse?.(
      jsonResponse({
        btdBalance: 1200,
        btcFeeBalance: 0.042,
        recentBtdAssetPacks: [{ assetPackId: 'asset-pack-qa', label: 'QA AssetPack' }],
      }),
    );
    await waitFor(() => {
      expect(second.result.current.btdBalance).toBe(1200);
      expect(second.result.current.btcFeeBalance).toBe(0.042);
      expect(second.result.current.recentBtdAssetPacks).toHaveLength(1);
      expect(second.result.current.isRevalidating).toBe(false);
    });
  });

  it('keeps the active JavaScript user-data companion resettable in tests', () => {
    const companion = require('../hooks/useUserData.js');

    expect(companion.resetUserDataCacheForTests).toEqual(expect.any(Function));
  });

  it('propagates mutateUserData revalidation to every mounted useUserData instance', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          btdBalance: 0,
          repositories: [],
          githubConnection: null,
          repositoryConnectionStatus: { connected: false, valid: false, provider: 'github' },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          btdBalance: 0,
          repositories: [{ fullName: 'acme/bitcode' }, { fullName: 'acme/engine' }],
          githubConnection: { provider: 'github', username: 'acme' },
          repositoryConnectionStatus: {
            connected: true,
            valid: true,
            provider: 'github',
            username: 'acme',
          },
        }),
      );
    global.fetch = fetchMock as jest.Mock;

    // Surface chrome + Externals pane each call useUserData() independently.
    const chrome = renderHook(() => useUserData());
    const externals = renderHook(() => useUserData());

    await waitFor(() => {
      expect(chrome.result.current.hasGitHubConnection).toBe(false);
      expect(externals.result.current.hasGitHubConnection).toBe(false);
    });

    // GitHub connect path refreshes only via one pane's refresh() today.
    await act(async () => {
      await externals.result.current.refresh();
    });

    await waitFor(() => {
      expect(externals.result.current.hasGitHubConnection).toBe(true);
      expect(externals.result.current.repositories).toHaveLength(2);
      // Chrome must adopt the shared cache without a full page reload.
      expect(chrome.result.current.hasGitHubConnection).toBe(true);
      expect(chrome.result.current.hasValidGitHubConnection).toBe(true);
      expect(chrome.result.current.repositories).toHaveLength(2);
    });
  });
});
