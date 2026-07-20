/**
 * Wallet pane state: BTD defaults, live BTC balance, activity table, and autosave.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { readBitcodeWalletBindingFromProfile } from '@bitcode/orm';

import { MASTER_MOCK_MODE } from '@/config/featureFlags';
import { MOCK_RUNS, type WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';
import { mapExecutionHistoryRunToWorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
  type TransactionPagination,
} from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { useUserData } from '@/hooks/useUserData';
import { fetchPipelineExecutionHistory } from '@/networking/api-client';
import type { AuxillariesPreferenceCardItem } from '@/components/auxillaries/shared/AuxillariesPreferenceCards/AuxillariesPreferenceCards';
import type { AuxillariesWalletBtdPaneState } from '@/app/auxillaries/auxillary-onboarding-contract';

/** Wallet activity default: all *my* rows, 20 per page. */
const WALLET_ACTIVITY_PAGINATION: TransactionPagination = {
  page: 1,
  pageSize: 20,
};

const WALLET_ACTIVITY_FILTERS: TransactionFilters = {
  ...DEFAULT_TRANSACTION_FILTERS,
  ownership: 'mine',
};

function mapCreditLedgerRowToWorkspaceRun(row: {
  id?: string;
  created_at?: string;
  description?: string;
  change?: number;
  balance?: number;
}): WorkspaceRun {
  const change = typeof row.change === 'number' ? row.change : 0;
  const description =
    typeof row.description === 'string' && row.description.trim()
      ? row.description.trim()
      : 'Ledger activity';
  return {
    id: row.id || `ledger-${row.created_at || Date.now()}`,
    created_at: row.created_at || new Date().toISOString(),
    type: 'agentic-execution:ledger',
    status: 'completed',
    summary: description,
    participant: 'you',
    sourceModel: 'execution-history',
    isOwnTransaction: true,
    transactionLens: change < 0 ? 'read' : 'deposit',
    measuredBtd: Math.abs(change) || null,
    tokenTotal: null,
    proofStatus: 'ledger write',
    closureFocus: 'Account ledger / state change',
  };
}

function mergeOwnActivityRuns(
  executionRuns: WorkspaceRun[],
  ledgerRuns: WorkspaceRun[],
): WorkspaceRun[] {
  const byId = new Map<string, WorkspaceRun>();
  for (const run of [...executionRuns, ...ledgerRuns]) {
    if (!run?.id) continue;
    byId.set(run.id, {
      ...run,
      isOwnTransaction: true,
    });
  }
  return Array.from(byId.values()).sort((a, b) => {
    const aTime = Date.parse(String(a.created_at || 0)) || 0;
    const bTime = Date.parse(String(b.created_at || 0)) || 0;
    return bTime - aTime;
  });
}

import {
  DEFAULT_BTD_DEFAULTS,
  type BtdDefaults,
  type BtdDetailView,
  type SettlementView,
  type ShareLens,
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
  const hasReadableBtcFeeBalance =
    typeof btcFeeBalanceSource === 'number' ||
    (typeof btcFeeBalanceSource === 'string' && Number.isFinite(Number(btcFeeBalanceSource)));
  const [defaults, setDefaults] = useState<BtdDefaults>(() => ({
    ...DEFAULT_BTD_DEFAULTS,
    ...(savedPreferences?.btdDefaults || {}),
  }));
  const [activityFilters, setActivityFilters] = useState<TransactionFilters>({
    ...WALLET_ACTIVITY_FILTERS,
  });
  const [activityPagination, setActivityPagination] = useState<TransactionPagination>({
    ...WALLET_ACTIVITY_PAGINATION,
  });
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    MASTER_MOCK_MODE ? MOCK_RUNS[0]?.id ?? null : null,
  );
  const [liveActivityRuns, setLiveActivityRuns] = useState<WorkspaceRun[]>([]);
  const [activityLoading, setActivityLoading] = useState(!MASTER_MOCK_MODE);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [liveBtcBalance, setLiveBtcBalance] = useState<{
    confirmedBtc: number;
    pendingBtc: number;
    network: string;
  } | null>(null);
  const [liveBtdBalance, setLiveBtdBalance] = useState<{
    balanceBtd: number | null;
    balanceBaseUnits: string | null;
    source: string;
    settleReady: boolean;
    configured: boolean;
    contract: string | null;
    chainId: number | null;
    note: string | null;
    address: string | null;
  } | null>(null);
  // Prefer on-chain ERC1155 BTD when the Sepolia contract is configured and readable.
  const displayBtdBalance =
    typeof liveBtdBalance?.balanceBtd === 'number'
      ? liveBtdBalance.balanceBtd
      : (supportReadRights?.aggregateBtd ?? btdBalance);

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

  // On-chain fungible BTD (ERC1155 id 0) when RPC + contract env are set.
  useEffect(() => {
    const address =
      walletBinding?.address ||
      (typeof profile?.wallet_address === 'string' ? profile.wallet_address : null);
    if (!address) {
      setLiveBtdBalance(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({ address });
        const response = await fetch(`/api/wallet/btd-balance?${qs.toString()}`);
        const payload = await response.json().catch(() => null);
        if (cancelled || !response.ok || !payload?.ok) return;
        setLiveBtdBalance({
          balanceBtd: typeof payload.balanceBtd === 'number' ? payload.balanceBtd : null,
          balanceBaseUnits:
            typeof payload.balanceBaseUnits === 'string' ? payload.balanceBaseUnits : null,
          source: typeof payload.source === 'string' ? payload.source : 'unknown',
          settleReady: Boolean(payload.settleReady),
          configured: Boolean(payload.configured),
          contract: typeof payload.contract === 'string' ? payload.contract : null,
          chainId: typeof payload.chainId === 'number' ? payload.chainId : null,
          note: typeof payload.note === 'string' ? payload.note : null,
          address: typeof payload.address === 'string' ? payload.address : address,
        });
      } catch {
        // Keep ledger/credits fallback on the posture card.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.wallet_address, walletBinding?.address]);

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

  useEffect(() => {
    if (MASTER_MOCK_MODE) {
      setLiveActivityRuns(MOCK_RUNS.map((run) => ({ ...run, isOwnTransaction: true })));
      setActivityLoading(false);
      setActivityError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const [history, ledgerResponse] = await Promise.all([
          fetchPipelineExecutionHistory().catch(() => []),
          fetch('/api/auxillaries/transactions?page=1&pageSize=100', {
            credentials: 'same-origin',
          })
            .then(async (response) => {
              if (!response.ok) return { transactions: [] as any[] };
              return response.json().catch(() => ({ transactions: [] as any[] }));
            })
            .catch(() => ({ transactions: [] as any[] })),
        ]);

        if (cancelled) return;

        const executionRuns = (Array.isArray(history) ? history : []).map((run) => ({
          ...mapExecutionHistoryRunToWorkspaceRun(run),
          isOwnTransaction: true,
        }));
        const ledgerRuns = (
          Array.isArray(ledgerResponse?.transactions) ? ledgerResponse.transactions : []
        ).map(mapCreditLedgerRowToWorkspaceRun);

        const merged = mergeOwnActivityRuns(executionRuns, ledgerRuns);
        setLiveActivityRuns(merged);
        if (merged.length > 0) {
          setSelectedActivityId((current) => current ?? merged[0]?.id ?? null);
        }
      } catch (error) {
        if (cancelled) return;
        setLiveActivityRuns([]);
        setActivityError(
          error instanceof Error
            ? error.message
            : 'Unable to load your activity history.',
        );
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const btdActivityRuns = liveActivityRuns;
  const resetActivityFilters = () => setActivityFilters({ ...WALLET_ACTIVITY_FILTERS });

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
    liveBtdBalance,
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
    activityLoading,
    activityError,
    resetActivityFilters,
    onCompletionStatusChange,
  };
}
