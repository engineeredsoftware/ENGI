"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { readBitcodeWalletBindingFromProfile } from '@bitcode/orm';

import { MASTER_MOCK_MODE } from '@/config/featureFlags';
import BitcodePipelinesTable from '@/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable';
import { MOCK_RUNS, type WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from '@/components/bitcode/pipeline/bitcode-transaction-types';
import { useAuth } from "@/components/bitcode/auth/AuthProvider";
import { useUserData } from "@/hooks/useUserData";

import AuxillariesWalletPaneHeader from "@/app/auxillaries/components/headers/AuxillariesWalletPaneHeader";
import AuxillariesWalletConnectionPanel from "@/app/auxillaries/components/AuxillariesWalletConnectionPanel";
import { auxillaryPaneExplainers } from "@/app/auxillaries/components/auxillary-pane-explainers";
import AuxillariesPreferenceCards, {
  type AuxillariesPreferenceCardItem,
} from "@/app/auxillaries/components/shared/AuxillariesPreferenceCards";
import AuxillariesStatGrid from "@/app/auxillaries/components/shared/AuxillariesStatGrid";
import AuxillariesWorkspaceSection from "@/app/auxillaries/components/shared/AuxillariesWorkspaceSection";
import type { AuxillariesWalletBtdPaneState } from "@/app/auxillaries/auxillary-onboarding-contract";

export interface AuxillariesWalletPaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  isOnboardingComplete?: boolean;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

type ShareLens = "account" | "organization" | "network";
type SettlementView = "review" | "bounded" | "replay";
type BtdDetailView = "transactions" | "proofs" | "history";
type AutomationBias = "review-first" | "guided" | "decisive";
type WalletSync = "manual" | "daily" | "live";

interface BtdDefaults {
  shareLens: ShareLens;
  settlementView: SettlementView;
  btdDetailView: BtdDetailView;
  automationBias: AutomationBias;
  walletSync: WalletSync;
}

const DEFAULT_BTD_DEFAULTS: BtdDefaults = {
  shareLens: "account",
  settlementView: "bounded",
  btdDetailView: "transactions",
  automationBias: "review-first",
  walletSync: "manual",
};

function formatBtdHoldings(btdBalance: number) {
  return `${btdBalance.toLocaleString()} BTD`;
}

function formatBtcFeeBalance(balance: unknown) {
  const numericBalance =
    typeof balance === "number"
      ? balance
      : typeof balance === "string" && balance.trim()
        ? Number(balance)
        : null;

  if (typeof numericBalance !== "number" || !Number.isFinite(numericBalance)) {
    return "Binding pending";
  }

  return `${numericBalance.toLocaleString(undefined, {
    maximumFractionDigits: numericBalance >= 1 ? 4 : 8,
  })} BTC`;
}

function resolveWalletAddress(profile: Record<string, any> | null, userId: string | undefined) {
  const walletBinding = readBitcodeWalletBindingFromProfile(profile);
  if (walletBinding?.address) {
    return formatCompactIdentifier(String(walletBinding.address));
  }

  if (!userId) {
    return "Wallet binding pending";
  }

  return `Binding pending for ${userId.slice(0, 8)}...`;
}

function formatCompactIdentifier(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 22) {
    return normalized;
  }

  return `${normalized.slice(0, 10)}...${normalized.slice(-8)}`;
}

function readProfileString(profile: Record<string, any> | null, ...keys: string[]) {
  if (!profile) {
    return null;
  }

  for (const key of keys) {
    const value = profile[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readProfileNumber(profile: Record<string, any> | null, ...keys: string[]) {
  if (!profile) {
    return null;
  }

  for (const key of keys) {
    const value = profile[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function formatPolicyHash(hash: string | null) {
  if (!hash) {
    return "Policy hash pending";
  }

  return hash.length > 18 ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : hash;
}

function formatReadiness(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveBtdAccessDisclosure(profile: Record<string, any> | null) {
  const policyId = readProfileString(
    profile,
    "btdAccessPolicyId",
    "btd_access_policy_id",
    "accessPolicyId",
    "access_policy_id",
  );
  const policyHash = readProfileString(
    profile,
    "btdAccessPolicyHash",
    "btd_access_policy_hash",
    "accessPolicyHash",
    "access_policy_hash",
  );
  const rangeStart = readProfileNumber(
    profile,
    "btdRangeStart",
    "btd_range_start",
    "rangeStart",
    "range_start",
  );
  const rangeEndExclusive = readProfileNumber(
    profile,
    "btdRangeEndExclusive",
    "btd_range_end_exclusive",
    "rangeEndExclusive",
    "range_end_exclusive",
  );
  const readBranch =
    readProfileString(profile, "btdReadBranch", "btd_read_branch", "readBranch", "read_branch") ||
    "Owner-read / licensed-read";

  return {
    policyId: policyId || "Policy id pending",
    policyHash: formatPolicyHash(policyHash),
    rawPolicyHash: policyHash,
    range:
      typeof rangeStart === "number" &&
      typeof rangeEndExclusive === "number" &&
      rangeEndExclusive > rangeStart
        ? `${rangeStart.toLocaleString()}-${(rangeEndExclusive - 1).toLocaleString()}`
        : "AssetPack range pending",
    readBranch,
  };
}

export default function AuxillariesWalletPane({
  onSave,
  loading,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: AuxillariesWalletPaneProps) {
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
    typeof btcFeeBalanceSource === "number" ||
    (typeof btcFeeBalanceSource === "string" && Number.isFinite(Number(btcFeeBalanceSource)));
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
      ? "1 AssetPack"
      : `${ownedAssetPackCount.toLocaleString()} AssetPacks`;

  const preferenceCards = useMemo<AuxillariesPreferenceCardItem[]>(
    () => [
      {
        id: "share-lens",
        title: "Share lens",
        description: "Choose how $BTD ownership and participation should read when you reopen transactions.",
        value: defaults.shareLens,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            shareLens: value as ShareLens,
          })),
        options: [
          {
            value: "account",
            label: "Account",
            hint: "Keep the innermost auxillary biased toward the active account.",
          },
          {
            value: "organization",
            label: "Organization",
            hint: "Bias toward shared organization and role posture.",
          },
          {
            value: "network",
            label: "Network",
            hint: "Read $BTD posture through broader registry participation first.",
          },
        ],
      },
      {
        id: "settlement-view",
        title: "Settlement view",
        description: "Set the closure-reading stance you want when BTD-specific settlement re-enters detail.",
        value: defaults.settlementView,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            settlementView: value as SettlementView,
          })),
        options: [
          {
            value: "review",
            label: "Review",
            hint: "Bias toward slower, explicit settlement inspection first.",
          },
          {
            value: "bounded",
            label: "Bounded",
            hint: "Keep closure exact and auditable without opening every replay view.",
          },
          {
            value: "replay",
            label: "Replay",
            hint: "Bias toward replayable accounting and witness detail.",
          },
        ],
      },
      {
        id: "btd-detail-view",
        title: "BTD detail return",
        description: "Choose which surface should reopen when you jump back from the inner auxillary.",
        value: defaults.btdDetailView,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            btdDetailView: value as BtdDetailView,
          })),
        options: [
          {
            value: "transactions",
            label: "Transactions",
            hint: "Return to the Bitcode Terminal first.",
          },
          {
            value: "proofs",
            label: "Proofs",
            hint: "Return directly to evidence-bearing proof detail.",
          },
          {
            value: "history",
            label: "History",
            hint: "Reopen the latest BTD-relevant history read first.",
          },
        ],
      },
      {
        id: "automation-bias",
        title: "Automation bias",
        description: "Shape how decisive the inner auxillary should feel when it reintroduces BTD-side follow-through.",
        value: defaults.automationBias,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            automationBias: value as AutomationBias,
          })),
        options: [
          {
            value: "review-first",
            label: "Review-first",
            hint: "Require explicit operator review before decisive follow-through.",
          },
          {
            value: "guided",
            label: "Guided",
            hint: "Keep suggestions strong while preserving visible checkpoints.",
          },
          {
            value: "decisive",
            label: "Decisive",
            hint: "Bias toward shorter, stronger default follow-through.",
          },
        ],
      },
      {
        id: "wallet-sync",
        title: "Wallet sync posture",
        description: "Set how aggressively the auxillary should expect wallet-facing information to refresh.",
        value: defaults.walletSync,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            walletSync: value as WalletSync,
          })),
        options: [
          {
            value: "manual",
            label: "Manual",
            hint: "Refresh wallet-facing posture only when you ask for it.",
          },
          {
            value: "daily",
            label: "Daily",
            hint: "Expect slower, deliberate balance posture updates.",
          },
          {
            value: "live",
            label: "Live",
            hint: "Bias toward quicker reflected posture as bindings mature.",
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

  return (
    <div data-testid="wallet-pane-container">
      <div className="orbital-step-content wallet-step">
        <AuxillariesWalletPaneHeader isOnboardingComplete={isOnboardingComplete} />

        <div className="space-y-5">
            <AuxillariesWalletConnectionPanel
              initialWalletAddress={walletBinding?.address ?? profile?.wallet_address ?? null}
              initialWalletProvider={walletBinding?.provider ?? profile?.wallet_provider ?? null}
              initialWalletBindingStatus={walletBinding?.status ?? profile?.wallet_binding_status ?? null}
              initialWalletBoundAt={walletBinding?.boundAt ?? profile?.wallet_bound_at ?? null}
              onWalletIdentityChange={onCompletionStatusChange}
            />

            <AuxillariesWorkspaceSection
              kicker="Wallet posture"
              title="Keep BTC fees, BTD holdings, and wallet identity readable together"
              description="$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture that should be visible before you return to transactions or closure."
              explainer={auxillaryPaneExplainers.btdWallet}
              tone="amber"
            >
              <div
                className="rounded-[26px] border border-amber-200/16 bg-[linear-gradient(180deg,rgba(251,191,36,0.11),rgba(8,16,30,0.62))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2),0_0_34px_rgba(251,191,36,0.08)_inset]"
                title="BTD is the non-fungible source-share/read-right balance currently visible to this account."
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/76">
                  BTD balance
                </p>
                <p className="mt-3 break-words text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-none tracking-normal text-amber-50 drop-shadow-[0_0_26px_rgba(251,191,36,0.24)]">
                  {formatBtdHoldings(displayBtdBalance)}
                </p>
              </div>

              <div className="mt-3">
                <AuxillariesStatGrid
                  items={[
                    {
                      label: "Owned AssetPacks",
                      value: ownedAssetPackSummary,
                      detail: "Counted from recent BTD AssetPacks currently readable for this account.",
                      tone: "emerald",
                    },
                    {
                      label: "BTC in wallet",
                      value: formatBtcFeeBalance(
                        liveBtcBalance?.confirmedBtc ??
                          supportTreasury?.btcFeeBalance ??
                          btcFeeBalanceSource,
                      ),
                      detail: liveBtcBalance
                        ? `Live on-chain ${liveBtcBalance.network} balance for the bound wallet address${
                            liveBtcBalance.pendingBtc > 0
                              ? `; ${liveBtcBalance.pendingBtc.toLocaleString(undefined, { maximumFractionDigits: 8 })} BTC pending confirmation`
                              : ''
                          }.`
                        : supportTreasury?.organizationTreasurySeparated
                        ? "Account treasury posture is source-safe and separate from organization treasury controls and Exchange market state."
                        : hasReadableBtcFeeBalance
                        ? "Live BTC fee-liquidity posture supplied by the connected wallet posture."
                        : hasStoredVerifiedWalletConnection && !hasVerifiedWalletConnection
                          ? "Saved verified wallet-provider signer posture exists, but the live signer session needs reconnect before signed settlement or refreshed BTC posture can resume."
                        : walletBinding?.status === 'verified'
                          ? "Verified wallet-provider posture is present, but live BTC balance has not populated yet."
                        : walletBinding?.address
                            ? "Wallet identity is present, but verified wallet-provider signing is still staged before live BTC posture should settle here."
                            : "Attach a wallet binding to surface live BTC posture here.",
                      tone: "sky",
                    },
                  ]}
                  columns={2}
                />
              </div>

              <div className="mt-4">
                <AuxillariesStatGrid
                  items={[
                    {
                      label: "Wallet address",
                      value: resolveWalletAddress(profile, user?.id),
                      detail: hasStoredVerifiedWalletConnection && !hasVerifiedWalletConnection
                        ? "Saved verified signer posture is recorded, but the wallet provider must reconnect before Bitcode can rely on live signing again."
                        : walletBinding?.status === 'verified'
                        ? "The verified signer posture Bitcode will use for signed settlement follow-through."
                        : "The address posture Bitcode will use once wallet identity is bound; verified wallet-provider signing still stages separately.",
                      tone: "violet",
                    },
                    {
                      label: "Access policy",
                      value: accessDisclosure.policyId,
                      detail: "Owner-read and licensed-read branches resolve against this policy id.",
                      tone: "amber",
                    },
                    {
                      label: "Policy hash",
                      value: accessDisclosure.policyHash,
                      detail: accessDisclosure.rawPolicyHash
                        ? "Committed mint receipts and read-license checks must match this hash before private source read opens."
                        : "A committed AssetPack range will surface its immutable policy hash here.",
                      tone: "sky",
                    },
                    {
                      label: "AssetPack range",
                      value: accessDisclosure.range,
                      detail: "The AssetPack source-share object is a contiguous range, not a fungible checkout balance.",
                      tone: "violet",
                    },
                    {
                      label: "Read branch",
                      value: accessDisclosure.readBranch,
                      detail: "Ownership posture and licensed read posture remain separate when access is evaluated.",
                      tone: "emerald",
                    },
                  ]}
                  columns={4}
                />
              </div>

              <div className="mt-4" data-testid="auxillaries-wallet-btd-readiness">
                <AuxillariesStatGrid
                  items={[
                    {
                      label: "Signer posture",
                      value: formatReadiness(supportSignerPosture?.state ?? walletBinding?.status),
                      detail: supportSignerPosture?.serverCustody === false
                        ? "No-custody signer posture; Bitcode can request signatures but does not hold wallet private keys."
                        : "Signer posture is pending wallet capability readback.",
                      tone: supportSignerPosture?.ready ? "emerald" : "amber",
                    },
                    {
                      label: "Network readiness",
                      value: supportNetworkReadiness?.network || formatReadiness(supportNetworkReadiness?.state),
                      detail: supportNetworkReadiness?.blocker
                        ? `Blocked by ${supportNetworkReadiness.blocker}.`
                        : "Wallet network posture is readable enough for settlement review.",
                      tone: supportNetworkReadiness?.state === "ready" ? "emerald" : "sky",
                    },
                    {
                      label: "BTD range cells",
                      value: (supportReadRights?.totalRangeCells ?? 0).toLocaleString(),
                      detail: `${(supportReadRights?.rangeCount ?? 0).toLocaleString()} range-bearing AssetPack projection(s), with protected source visibility fixed false before paid unlock.`,
                      tone: "violet",
                    },
                    {
                      label: "Read-right mix",
                      value: `${(supportReadRights?.ownerReadCount ?? 0).toLocaleString()} owner / ${(supportReadRights?.licensedReadCount ?? 0).toLocaleString()} licensed`,
                      detail: `${(supportReadRights?.pendingSettlementCount ?? 0).toLocaleString()} pending settlement and ${(supportReadRights?.deniedCount ?? 0).toLocaleString()} denied read-right posture(s) remain source-safe.`,
                      tone: "emerald",
                    },
                    {
                      label: "Settlement readiness",
                      value: formatReadiness(supportSettlementReadiness),
                      detail: walletSupport?.settlementBlockers?.length
                        ? `Repair ${walletSupport.settlementBlockers.join(", ")} before signed settlement can continue.`
                        : "Wallet, network, and BTD support posture are aligned for settlement review.",
                      tone: supportSettlementReadiness === "ready" ? "emerald" : "amber",
                    },
                    {
                      label: "Treasury boundary",
                      value: supportTreasury?.exchangeMarketState === "not_exchange_market_state" ? "Not Exchange" : "Account",
                      detail: "Wallet/BTD support summarizes account fee posture only; it does not infer Exchange market activity.",
                      tone: "sky",
                    },
                  ]}
                  columns={3}
                />
                <p className="mt-3 break-words text-xs leading-6 text-white/56">
                  Support root {walletSupport?.btdSupportRoot ? formatPolicyHash(walletSupport.btdSupportRoot) : "pending"}.
                  Wallet root {supportWalletCapability?.walletCapabilityRoot ? ` ${formatPolicyHash(supportWalletCapability.walletCapabilityRoot)}` : " pending"}.
                </p>
              </div>
            </AuxillariesWorkspaceSection>

            <AuxillariesWorkspaceSection
              kicker="BTD activity"
              title="Read your BTD-relevant activity from the shared activity table"
              description="Owned AssetPacks, Deposits, Reads, proof closures, and range-bearing activity should be inspected through the same table grammar used by Terminal."
              tone="emerald"
            >
              <BitcodePipelinesTable
                runs={btdActivityRuns}
                selectedTransactionId={selectedActivityId}
                onSelectTransaction={setSelectedActivityId}
                filters={activityFilters}
                onFiltersChange={setActivityFilters}
                onResetFilters={resetActivityFilters}
                pagination={activityPagination}
                onPaginationChange={setActivityPagination}
                isLoadingRuns={false}
                runsError={null}
                transactionDataMode={MASTER_MOCK_MODE ? 'mock-review' : 'live'}
                surface="exchange"
              />
              {!MASTER_MOCK_MODE ? (
                <p className="mt-3 text-xs leading-6 text-white/56">
                  Testnet-readiness shows an empty live activity table until ledger-derived BTD events are present.
                </p>
              ) : null}
            </AuxillariesWorkspaceSection>

            <AuxillariesWorkspaceSection
              kicker="Share posture"
              title="Choose how $BTD detail should read back into transactions"
              description="Use the inner auxillary to decide whether account, organization, or network registry posture should dominate when you reopen main operator surfaces."
              explainer={auxillaryPaneExplainers.btdShares}
              tone="violet"
            >
              <AuxillariesPreferenceCards items={preferenceCards.slice(0, 3)} />
            </AuxillariesWorkspaceSection>

            <AuxillariesWorkspaceSection
              kicker="Advanced defaults"
              title="Set the BTD follow-through posture"
              description="These controls shape how review, replay, and wallet refresh should behave when BTD-specific detail re-enters the main operator surfaces."
              explainer={auxillaryPaneExplainers.btdAdvanced}
              tone="sky"
            >
              <AuxillariesPreferenceCards items={preferenceCards.slice(3)} />
            </AuxillariesWorkspaceSection>

            <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
              <p className="text-sm leading-7 text-white/68">
                Changes save automatically so the BTD posture reopens with the same share, replay, and wallet-facing defaults.
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
