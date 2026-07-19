"use client";

/**
 * Wallet auxillary pane — Bitcoin binding, BTD posture, activity table, and
 * share defaults. Connection UI and BTD grids are extracted modules; state lives
 * in hooks/use-wallet-pane-state.
 */

import React from 'react';

import { MASTER_MOCK_MODE } from '@/config/featureFlags';
import BitcodePipelinesTable from '@/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable';

import AuxillariesWalletPaneHeader from '@/components/auxillaries/headers/AuxillariesWalletPaneHeader/AuxillariesWalletPaneHeader';
import AuxillariesWalletConnectionPanel from '@/components/auxillaries/AuxillariesWalletConnectionPanel/AuxillariesWalletConnectionPanel';
import { auxillaryPaneExplainers } from '@/components/auxillaries/AuxillaryPaneExplainers/AuxillaryPaneExplainers';
import AuxillariesPreferenceCards from '@/components/auxillaries/shared/AuxillariesPreferenceCards/AuxillariesPreferenceCards';
import AuxillariesWorkspaceSection from '@/components/auxillaries/shared/AuxillariesWorkspaceSection/AuxillariesWorkspaceSection';

import { useWalletPaneState } from './hooks/use-wallet-pane-state';
import WalletBtdPostureSection from './WalletBtdPostureSection/WalletBtdPostureSection';

/** Keep share-posture preference cards in code; hide the control set from the pane for now. */
const SHOW_SHARE_POSTURE_SECTION = false;

export interface AuxillariesWalletPaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  isOnboardingComplete?: boolean;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

export default function AuxillariesWalletPane({
  onSave,
  loading: _loading,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: AuxillariesWalletPaneProps) {
  const state = useWalletPaneState({ onSave, onCompletionStatusChange });

  return (
    <div data-testid="wallet-pane-container">
      <div className="orbital-step-content wallet-step">
        <AuxillariesWalletPaneHeader isOnboardingComplete={isOnboardingComplete} />

        <div className="space-y-5">
          {/*
            Entrance stagger targets this wrapper (space-y-5 > *). The connection
            panel owns Connect attention on the same DOM node would share the CSS
            `animation` property with auxillaries-inner-rise — so after the
            highlight settles, entrance re-fired. Keep both animations unchanged;
            only separate the hosts.
          */}
          <div className="min-w-0">
            <AuxillariesWalletConnectionPanel
              initialWalletAddress={state.walletBinding?.address ?? state.profile?.wallet_address ?? null}
              initialWalletProvider={state.walletBinding?.provider ?? state.profile?.wallet_provider ?? null}
              initialWalletBindingStatus={state.walletBinding?.status ?? state.profile?.wallet_binding_status ?? null}
              initialWalletBoundAt={state.walletBinding?.boundAt ?? state.profile?.wallet_bound_at ?? null}
              onWalletIdentityChange={onCompletionStatusChange}
            />
          </div>

          <WalletBtdPostureSection
            displayBtdBalance={state.displayBtdBalance}
            ownedAssetPackSummary={state.ownedAssetPackSummary}
            liveBtcBalance={state.liveBtcBalance}
            supportTreasury={state.supportTreasury}
            btcFeeBalanceSource={state.btcFeeBalanceSource}
            hasReadableBtcFeeBalance={state.hasReadableBtcFeeBalance}
            hasStoredVerifiedWalletConnection={state.hasStoredVerifiedWalletConnection}
            hasVerifiedWalletConnection={state.hasVerifiedWalletConnection}
            walletBinding={state.walletBinding}
            profile={state.profile}
            userId={state.user?.id}
            accessDisclosure={state.accessDisclosure}
            supportSignerPosture={state.supportSignerPosture}
            supportNetworkReadiness={state.supportNetworkReadiness}
            supportReadRights={state.supportReadRights}
            supportSettlementReadiness={state.supportSettlementReadiness}
            walletSupport={state.walletSupport}
            supportWalletCapability={state.supportWalletCapability}
          />

          <AuxillariesWorkspaceSection
            kicker="My activity"
            title="All activity for this account"
            description="Every change that belongs to you: Reads, Deposits, Packs, anchors, ledger writes, and other account-state history — not the public market feed. Paginated 20 rows at a time."
            tone="emerald"
          >
            <BitcodePipelinesTable
              runs={state.btdActivityRuns}
              selectedTransactionId={state.selectedActivityId}
              onSelectTransaction={state.setSelectedActivityId}
              filters={state.activityFilters}
              onFiltersChange={(next) =>
                state.setActivityFilters({
                  ...next,
                  // Wallet surface is always "mine" — no network/market feed.
                  ownership: 'mine',
                })
              }
              onResetFilters={state.resetActivityFilters}
              pagination={state.activityPagination}
              onPaginationChange={state.setActivityPagination}
              isLoadingRuns={state.activityLoading}
              runsError={state.activityError}
              transactionDataMode={MASTER_MOCK_MODE ? 'mock-review' : 'live'}
              surface="wallet"
            />
            {!MASTER_MOCK_MODE && !state.activityLoading && state.btdActivityRuns.length === 0 ? (
              <p className="mt-3 text-xs leading-6 text-white/56">
                No account activity yet. Runs, ledger writes, and state changes for this wallet/user will appear here as rows.
              </p>
            ) : null}
          </AuxillariesWorkspaceSection>

          {/* Preference cards kept in code; UI hidden until product re-enables this control set. */}
          {SHOW_SHARE_POSTURE_SECTION ? (
            <AuxillariesWorkspaceSection
              kicker="Share posture"
              title="Choose how $BTD detail should read back into transactions"
              description="Use the inner auxillary to decide whether account, organization, or network registry posture should dominate when you reopen main operator surfaces."
              explainer={auxillaryPaneExplainers.btdShares}
              tone="violet"
            >
              <AuxillariesPreferenceCards items={state.preferenceCards} />
            </AuxillariesWorkspaceSection>
          ) : null}

          {SHOW_SHARE_POSTURE_SECTION ? (
            <div className="rounded-none border border-white/10 auxillaries-glass-card px-5 py-4">
              <p className="text-sm leading-7 text-white/68">
                Changes save automatically so the BTD posture reopens with the same share and wallet-facing defaults.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
