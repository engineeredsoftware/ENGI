import React, { type ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  TerminalShellBridgeProvider,
  useTerminalShellBridge,
} from '@/app/terminal/terminal-shell-bridge';

jest.mock('@/components/bitcode/layout/demonstration-witness-runtime', () => ({
  readBitcodeDemonstrationShellSnapshot: jest.fn(),
  readBitcodeDemonstrationShellControls: jest.fn(),
}));

const {
  readBitcodeDemonstrationShellSnapshot,
  readBitcodeDemonstrationShellControls,
} = jest.requireMock('@/components/bitcode/layout/demonstration-witness-runtime') as {
  readBitcodeDemonstrationShellSnapshot: jest.Mock;
  readBitcodeDemonstrationShellControls: jest.Mock;
};

describe('TerminalShellBridgeProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TerminalShellBridgeProvider>{children}</TerminalShellBridgeProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hydrates snapshot and controls into one shared bridge', async () => {
    readBitcodeDemonstrationShellSnapshot.mockResolvedValue({
      commandSurface: { status: 'ready' },
    });
    readBitcodeDemonstrationShellControls.mockResolvedValue({
      refresh: jest.fn(),
    });

    const { result } = renderHook(() => useTerminalShellBridge(), { wrapper });

    await waitFor(() => {
      expect(result.current.snapshot).toEqual({ commandSurface: { status: 'ready' } });
      expect(result.current.controls).toBeTruthy();
    });
  });

  it('runs control actions and refreshes the shared snapshot', async () => {
    const makeBranch = jest.fn();
    readBitcodeDemonstrationShellSnapshot
      .mockResolvedValueOnce({ commandSurface: { status: 'before' } })
      .mockResolvedValueOnce({ commandSurface: { status: 'after' } });
    readBitcodeDemonstrationShellControls.mockResolvedValue({
      makeBranch,
    });

    const { result } = renderHook(() => useTerminalShellBridge(), { wrapper });

    await waitFor(() => {
      expect(result.current.snapshot).toEqual({ commandSurface: { status: 'before' } });
    });

    await act(async () => {
      await result.current.runControl(async (controls) => controls.makeBranch?.());
    });

    expect(makeBranch).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.snapshot).toEqual({ commandSurface: { status: 'after' } });
    });
  });

  it('fails closed to an empty bridge when snapshot refresh throws', async () => {
    readBitcodeDemonstrationShellSnapshot.mockRejectedValue(new Error('snapshot unavailable'));
    readBitcodeDemonstrationShellControls.mockResolvedValue({
      refresh: jest.fn(),
    });

    const { result } = renderHook(() => useTerminalShellBridge(), { wrapper });

    await waitFor(() => {
      expect(result.current.snapshot).toBeNull();
      expect(result.current.controls).toBeNull();
      expect(result.current.lastUpdatedAt).toBeGreaterThan(0);
    });
  });
});
