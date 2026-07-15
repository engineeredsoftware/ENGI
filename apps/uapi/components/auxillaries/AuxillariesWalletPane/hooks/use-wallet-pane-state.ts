/**
 * Wallet pane state: BTD defaults, live BTC balance, activity table, and autosave.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { readBitcodeWalletBindingFromProfile } from '@bitcode/orm';

import { MASTER_MOCK_MODE } from '@/config/featureFlags';
import { MOCK_RUNS, type WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { useUserData } from '@/hooks/useUserData';
import type { AuxillariesPreferenceCardItem } from '@/components/auxillaries/shared/AuxillariesPreferenceCards/AuxillariesPreferenceCards';
import type { AuxillariesWalletBtdPaneState } from '@/app/auxillaries/auxillary-onboarding-contract';

import {
  DEFAULT_BTD_DEFAULTS,
  type AutomationBias,
  type BtdDefaults,
  type BtdDetailView,
  type SettlementView,
  type ShareLens,
  type WalletSync,
} from '../models/wallet-pane-defaults';
import { resolveBtdAccessDisclosure } from '../models/wallet-pane-format';

export interface UseWalletPaneStateArgs {
  onSave: (data: any) => void;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

export function useWalletPaneState({ onSave, onCompletionStatusChange }: UseWalletPaneStateArgs) {
  const { user } = useAuth();
  const {
    data,
    btdBalance = 0,
    btcFeeBalance = null,
    recentBtdAssetPacks = [],
    walletBtdPaneState,
    hasWalletConnection,
    hasStoredVerifiedWalletConnection = false,
    hasVerifiedWalletConnection,
  } = useUserData();
  const hasCalledCompletionRef = useRef(false);
  const lastBtdAutosaveSignatureRef = useRef<string | null>(null);
  const savedPreferences = (data?.modelPreferences as Record<string, any> | null) || null;
  const profile = (data?.profile as Record<string, any> | null) || null;
  const walletBinding = readBitcodeWalletBindingFromProfile(profile);
  const btcFeeBalanceSource = btcFeeBalance ?? profile?.btc_balance;
  const accessDisclosure = resolveBtdAccessDisclosure(profile);
  const walletSupport = (walletBtdPaneState || null) as AuxillariesWalletBtdPaneState | null;
  const supportWalletCapability = walletSupport?.walletCapability ?? null;
  const supportSignerPosture = walletSupport?.signerPosture ?? null;
  const supportNetworkReadiness = walletSupport?.networkReadiness ?? null;
  const supportReadRights = walletSupport?.btdReadRightSummary ?? null;
  const supportTreasury = walletSupport?.treasurySummary ?? null;
  const supportSettlementReadiness = walletSupport?.settlementReadiness ?? null;
  const displayBtdBalance = supportReadRights?.aggregateBtd ?? btdBalance;
  const hasReadableBtcFeeBalance =
    typeof btcFeeBalanceSource === 'number' ||
    (typeof btcFeeBalanceSource === 'string' && Number.isFinite(Number(btcFeeBalanceSource)));
  const [defaults, setDefaults] = useState<BtdDefaults>(() => ({
    ...DEFAULT_BTD_DEFAULTS,
    ...(savedPreferences?.btdDefaults || {}),
  }));
  const [activityFilters, setActivityFilters] = useState<TransactionFilters>({
    ...DEFAULT_TRANSACTION_FILTERS,
  });
  const [activityPagination, setActivityPagination] = useState<TransactionPagination>({
    ...DEFAULT_TRANSACTION_PAGINATION,
  });
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    MASTER_MOCK_MODE ? MOCK_RUNS[0]?.id ?? null : null,
  );
  const [liveBtcBalance, setLiveBtcBalance] = useState<{
    confirmedBtc: number;
    pendingBtc: number;
    network: string;
  } | null>(null);

  useEffect(() => {
    if (!walletBinding?.address) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/wallet/btc-balance');
        const payload = await response.json().catch(() => null);
        if (cancelled || !response.ok || !payload?.ok) return;
        setLiveBtcBalance({
          confirmedBtc: typeof payload.confirmedBtc === 'number' ? payload.confirmedBtc : 0,
          pendingBtc: typeof payload.pendingBtc === 'number' ? payload.pendingBtc : 0,
          network: typeof payload.network === 'string' ? payload.network : 'testnet4',
        });
      } catch {
        // Balance source unavailable: the card keeps its posture fallback.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [walletBinding?.address]);

  useEffect(() => {
    if (onCompletionStatusChange && !hasCalledCompletionRef.current) {
      hasCalledCompletionRef.current = true;
      onCompletionStatusChange(Boolean(hasWalletConnection || walletBinding?.address));
    }
  }, [hasWalletConnection, onCompletionStatusChange, walletBinding?.address]);

  useEffect(() => {
    if (!savedPreferences?.btdDefaults) {
      return;
    }

    setDefaults((current) => ({
      ...current,
      ...savedPreferences.btdDefaults,
    }));
  }, [savedPreferences]);

  const ownedAssetPackCount = supportReadRights?.assetPackCount ?? recentBtdAssetPacks.length;
  const ownedAssetPackSummary =
    ownedAssetPackCount === 1
      ? '1 AssetPack'
      : `${ownedAssetPackCount.toLocaleString()} AssetPacks`;

  const preferenceCards = useMemo<AuxillariesPreferenceCardItem[]>(
    () => [
      {
        id: 'share-lens',
        title: 'Share lens',
        description: 'Choose how $BTD ownership and participation should read when you reopen transactions.',
        value: defaults.shareLens,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            shareLens: value as ShareLens,
          })),
        options: [
          {
            value: 'account',
            label: 'Account',
            hint: 'Keep the innermost auxillary biased toward the active account.',
          },
          {
            value: 'organization',
            label: 'Organization',
            hint: 'Bias toward shared organization and role posture.',
          },
          {
            value: 'network',
            label: 'Network',
            hint: 'Read $BTD posture through broader registry participation first.',
          },
        ],
      },
      {
        id: 'settlement-view',
        title: 'Settlement view',
        description: 'Set the closure-reading stance you want when BTD-specific settlement re-enters detail.',
        value: defaults.settlementView,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            settlementView: value as SettlementView,
          })),
        options: [
          {
            value: 'review',
            label: 'Review',
            hint: 'Bias toward slower, explicit settlement inspection first.',
          },
          {
            value: 'bounded',
            label: 'Bounded',
            hint: 'Keep closure exact and auditable without opening every replay view.',
          },
          {
            value: 'replay',
            label: 'Replay',
            hint: 'Bias toward replayable accounting and witness detail.',
          },
        ],
      },
      {
        id: 'btd-detail-view',
        title: 'BTD detail return',
        description: 'Choose which surface should reopen when you jump back from the inner auxillary.',
        value: defaults.btdDetailView,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            btdDetailView: value as BtdDetailView,
          })),
        options: [
          {
            value: 'transactions',
            label: 'Transactions',
            hint: 'Return to the shared activity table first.',
          },
          {
            value: 'proofs',
            label: 'Proofs',
            hint: 'Return directly to evidence-bearing proof detail.',
          },
          {
            value: 'history',
            label: 'History',
            hint: 'Reopen the latest BTD-relevant history read first.',
          },
        ],
      },
      {
        id: 'automation-bias',
        title: 'Automation bias',
        description: 'Shape how decisive the inner auxillary should feel when it reintroduces BTD-side follow-through.',
        value: defaults.automationBias,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            automationBias: value as AutomationBias,
          })),
        options: [
          {
            value: 'review-first',
            label: 'Review-first',
            hint: 'Require explicit operator review before decisive follow-through.',
          },
          {
            value: 'guided',
            label: 'Guided',
            hint: 'Keep suggestions strong while preserving visible checkpoints.',
          },
          {
            value: 'decisive',
            label: 'Decisive',
            hint: 'Bias toward shorter, stronger default follow-through.',
          },
        ],
      },
      {
        id: 'wallet-sync',
        title: 'Wallet sync posture',
        description: 'Set how aggressively the auxillary should expect wallet-facing information to refresh.',
        value: defaults.walletSync,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            walletSync: value as WalletSync,
          })),
        options: [
          {
            value: 'manual',
            label: 'Manual',
            hint: 'Refresh wallet-facing posture only when you ask for it.',
          },
          {
            value: 'daily',
            label: 'Daily',
            hint: 'Expect slower, deliberate balance posture updates.',
          },
          {
            value: 'live',
            label: 'Live',
            hint: 'Bias toward quicker reflected posture as bindings mature.',
          },
        ],
      },
    ],
    [defaults],
  );

  const btdAutosavePayload = useMemo(
    () => ({
      ...(savedPreferences || {}),
      btdDefaults: defaults,
      btdSummary: {
        shareLens: defaults.shareLens,
        settlementView: defaults.settlementView,
      },
    }),
    [defaults, savedPreferences],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const signature = JSON.stringify(btdAutosavePayload);
    if (lastBtdAutosaveSignatureRef.current === null) {
      lastBtdAutosaveSignatureRef.current = signature;
      return;
    }
    if (lastBtdAutosaveSignatureRef.current === signature) {
      return;
    }

    const timer = window.setTimeout(() => {
      lastBtdAutosaveSignatureRef.current = signature;
      onSave(btdAutosavePayload);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [btdAutosavePayload, onSave, user]);

  const btdActivityRuns = useMemo<WorkspaceRun[]>(
    () => (MASTER_MOCK_MODE ? MOCK_RUNS : []),
    [],
  );
  const resetActivityFilters = () => setActivityFilters({ ...DEFAULT_TRANSACTION_FILTERS });

  return {
    user,
    profile,
    walletBinding,
    btcFeeBalanceSource,
    accessDisclosure,
    walletSupport,
    supportWalletCapability,
    supportSignerPosture,
    supportNetworkReadiness,
    supportReadRights,
    supportTreasury,
    supportSettlementReadiness,
    displayBtdBalance,
    hasReadableBtcFeeBalance,
    hasStoredVerifiedWalletConnection,
    hasVerifiedWalletConnection,
    ownedAssetPackSummary,
    preferenceCards,
    activityFilters,
    setActivityFilters,
    activityPagination,
    setActivityPagination,
    selectedActivityId,
    setSelectedActivityId,
    liveBtcBalance,
    btdActivityRuns,
    resetActivityFilters,
    onCompletionStatusChange,
  };
}
