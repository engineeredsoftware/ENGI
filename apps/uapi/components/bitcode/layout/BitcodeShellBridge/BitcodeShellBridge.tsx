'use client';

/**
 * Demonstration / operator shell bridge context for product surfaces.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Demonstration witness runtime (shell bridge for product surfaces).
import {
  readBitcodeDemonstrationShellControls,
  readBitcodeDemonstrationShellSnapshot,
} from '@/components/bitcode/layout/DemonstrationWitnessRuntime/demonstration-witness-runtime';

export type BitcodeShellSnapshot = Awaited<ReturnType<typeof readBitcodeDemonstrationShellSnapshot>>;

export type BitcodeShellControls = {
  setScenario?: (value: string) => unknown | Promise<unknown>;
  setProjection?: (value: string) => unknown | Promise<unknown>;
  setBranchMode?: (value: string) => unknown | Promise<unknown>;
  setAuthSession?: (value: string) => unknown | Promise<unknown>;
  setInventoryKind?: (value: string) => unknown | Promise<unknown>;
  setInventorySearch?: (value: string) => unknown | Promise<unknown>;
  toggleInventoryEntry?: (entryId: string) => unknown | Promise<unknown>;
  toggleFlowGuide?: () => unknown | Promise<unknown>;
  toggleTutorial?: () => unknown | Promise<unknown>;
  makeBranch?: () => unknown | Promise<unknown>;
  resetWorkspace?: () => unknown | Promise<unknown>;
  refresh?: () => unknown | Promise<unknown>;
} | null;

type ShellBridgeContextValue = {
  snapshot: BitcodeShellSnapshot;
  controls: BitcodeShellControls;
  lastUpdatedAt: number;
  refresh: () => Promise<BitcodeShellSnapshot>;
  runControl: <T>(callback: (controls: NonNullable<BitcodeShellControls>) => T | Promise<T>) => Promise<T | null>;
};

const POLL_INTERVAL_MS = 800;

const ShellBridgeContext = createContext<ShellBridgeContextValue | null>(null);

export function BitcodeShellBridgeProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<BitcodeShellSnapshot>(null);
  const [controls, setControls] = useState<BitcodeShellControls>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(0);
  const mountedRef = useRef(true);
  const controlsRef = useRef<BitcodeShellControls>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextSnapshot, nextControls] = await Promise.all([
        readBitcodeDemonstrationShellSnapshot(),
        readBitcodeDemonstrationShellControls(),
      ]);

      if (!mountedRef.current) return nextSnapshot;

      controlsRef.current = nextControls as BitcodeShellControls;
      setSnapshot(nextSnapshot);
      setControls(nextControls as BitcodeShellControls);
      setLastUpdatedAt(Date.now());

      return nextSnapshot;
    } catch {
      if (!mountedRef.current) return null;
      controlsRef.current = null;
      setSnapshot(null);
      setControls(null);
      setLastUpdatedAt(Date.now());
      return null;
    }
  }, []);

  const runControl = useCallback<ShellBridgeContextValue['runControl']>(
    async (callback) => {
      const activeControls =
        controlsRef.current ?? ((await readBitcodeDemonstrationShellControls()) as BitcodeShellControls);

      if (!activeControls) return null;

      controlsRef.current = activeControls;
      setControls(activeControls);
      const result = await callback(activeControls);
      await refresh();
      return result;
    },
    [refresh],
  );

  useEffect(() => {
    mountedRef.current = true;
    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const value = useMemo<ShellBridgeContextValue>(
    () => ({
      snapshot,
      controls,
      lastUpdatedAt,
      refresh,
      runControl,
    }),
    [controls, lastUpdatedAt, refresh, runControl, snapshot],
  );

  return <ShellBridgeContext.Provider value={value}>{children}</ShellBridgeContext.Provider>;
}

export function useBitcodeShellBridge() {
  const context = useContext(ShellBridgeContext);
  if (!context) {
    throw new Error('useBitcodeShellBridge must be used within a BitcodeShellBridgeProvider.');
  }
  return context;
}
