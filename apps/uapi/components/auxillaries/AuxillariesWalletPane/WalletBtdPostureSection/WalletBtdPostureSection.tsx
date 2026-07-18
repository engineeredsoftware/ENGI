/**
 * BTD balance, wallet posture stats, and settlement readiness grid for the wallet pane.
 */

import React from 'react';
import type { AuxillariesWalletBtdPaneState } from '@/app/auxillaries/auxillary-onboarding-contract';
import { auxillaryPaneExplainers } from '@/components/auxillaries/AuxillaryPaneExplainers/AuxillaryPaneExplainers';
import AuxillariesStatGrid from '@/components/auxillaries/shared/AuxillariesStatGrid/AuxillariesStatGrid';
import AuxillariesWorkspaceSection from '@/components/auxillaries/shared/AuxillariesWorkspaceSection/AuxillariesWorkspaceSection';

import {
  formatBtcFeeBalance,
  formatBtdHoldings,
  formatPolicyHash,
  formatReadiness,
  resolveWalletAddress,
} from '../models/wallet-pane-format';

export interface WalletBtdPostureSectionProps {
  displayBtdBalance: number;
  ownedAssetPackSummary: string;
  liveBtcBalance: { confirmedBtc: number; pendingBtc: number; network: string } | null;
  supportTreasury: AuxillariesWalletBtdPaneState['treasurySummary'] | null | undefined;
  btcFeeBalanceSource: unknown;
  hasReadableBtcFeeBalance: boolean;
  hasStoredVerifiedWalletConnection: boolean;
  hasVerifiedWalletConnection: boolean;
  walletBinding: { address?: string | null; status?: string | null } | null | undefined;
  profile: Record<string, any> | null;
  userId: string | undefined;
  accessDisclosure: {
    policyId: string;
    policyHash: string;
    rawPolicyHash: string | null;
    range: string;
    readBranch: string;
  };
  supportSignerPosture: AuxillariesWalletBtdPaneState['signerPosture'] | null | undefined;
  supportNetworkReadiness: AuxillariesWalletBtdPaneState['networkReadiness'] | null | undefined;
  supportReadRights: AuxillariesWalletBtdPaneState['btdReadRightSummary'] | null | undefined;
  supportSettlementReadiness: AuxillariesWalletBtdPaneState['settlementReadiness'] | null | undefined;
  walletSupport: AuxillariesWalletBtdPaneState | null;
  supportWalletCapability: AuxillariesWalletBtdPaneState['walletCapability'] | null | undefined;
}

export default function WalletBtdPostureSection({
  displayBtdBalance,
  ownedAssetPackSummary,
  liveBtcBalance,
  supportTreasury,
  btcFeeBalanceSource,
  hasReadableBtcFeeBalance,
  hasStoredVerifiedWalletConnection,
  hasVerifiedWalletConnection,
  walletBinding,
  profile,
  userId,
  accessDisclosure,
  supportSignerPosture,
  supportNetworkReadiness,
  supportReadRights,
  supportSettlementReadiness,
  walletSupport,
  supportWalletCapability,
}: WalletBtdPostureSectionProps) {
  return (
    <AuxillariesWorkspaceSection
      kicker="Wallet posture"
      title="Keep BTC fees, BTD holdings, and wallet identity readable together"
      description="$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture that should be visible before you return to transactions or closure."
      explainer={auxillaryPaneExplainers.btdWallet}
      tone="amber"
    >
      <div
        className="auxillaries-glass-card rounded-none border border-amber-200/22 p-5"
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
              label: 'Owned AssetPacks',
              value: ownedAssetPackSummary,
              detail: 'Counted from recent BTD AssetPacks currently readable for this account.',
              tone: 'emerald',
            },
            {
              label: 'BTC in wallet',
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
                ? 'Account treasury posture is source-safe and separate from organization treasury controls and Exchange market state.'
                : hasReadableBtcFeeBalance
                ? 'Live BTC fee-liquidity posture supplied by the connected wallet posture.'
                : hasStoredVerifiedWalletConnection && !hasVerifiedWalletConnection
                  ? 'Saved verified wallet-provider signer posture exists, but the live signer session needs reconnect before signed settlement or refreshed BTC posture can resume.'
                : walletBinding?.status === 'verified'
                  ? 'Verified wallet-provider posture is present, but live BTC balance has not populated yet.'
                : walletBinding?.address
                    ? 'Wallet identity is present, but verified wallet-provider signing is still staged before live BTC posture should settle here.'
                    : 'Attach a wallet binding to surface live BTC posture here.',
              tone: 'sky',
            },
          ]}
          columns={2}
        />
      </div>

      <div className="mt-4">
        <AuxillariesStatGrid
          items={[
            {
              label: 'Wallet address',
              value: resolveWalletAddress(profile, userId),
              detail: hasStoredVerifiedWalletConnection && !hasVerifiedWalletConnection
                ? 'Saved verified signer posture is recorded, but the wallet provider must reconnect before Bitcode can rely on live signing again.'
                : walletBinding?.status === 'verified'
                ? 'The verified signer posture Bitcode will use for signed settlement follow-through.'
                : 'The address posture Bitcode will use once wallet identity is bound; verified wallet-provider signing still stages separately.',
              tone: 'violet',
            },
            {
              label: 'Access policy',
              value: accessDisclosure.policyId,
              detail: 'Owner-read and licensed-read branches resolve against this policy id.',
              tone: 'amber',
            },
            {
              label: 'Policy hash',
              value: accessDisclosure.policyHash,
              detail: accessDisclosure.rawPolicyHash
                ? 'Committed mint receipts and read-license checks must match this hash before private source read opens.'
                : 'A committed AssetPack range will surface its immutable policy hash here.',
              tone: 'sky',
            },
            {
              label: 'AssetPack range',
              value: accessDisclosure.range,
              detail: 'The AssetPack source-share object is a contiguous range, not a fungible checkout balance.',
              tone: 'violet',
            },
            {
              label: 'Read branch',
              value: accessDisclosure.readBranch,
              detail: 'Ownership posture and licensed read posture remain separate when access is evaluated.',
              tone: 'emerald',
            },
          ]}
          columns={4}
        />
      </div>

      <div className="mt-4" data-testid="auxillaries-wallet-btd-readiness">
        <AuxillariesStatGrid
          items={[
            {
              label: 'Signer posture',
              value: formatReadiness(supportSignerPosture?.state ?? walletBinding?.status),
              detail: supportSignerPosture?.serverCustody === false
                ? 'No-custody signer posture; Bitcode can request signatures but does not hold wallet private keys.'
                : 'Signer posture is pending wallet capability readback.',
              tone: supportSignerPosture?.ready ? 'emerald' : 'amber',
            },
            {
              label: 'Network readiness',
              value: supportNetworkReadiness?.network || formatReadiness(supportNetworkReadiness?.state),
              detail: supportNetworkReadiness?.blocker
                ? `Blocked by ${supportNetworkReadiness.blocker}.`
                : 'Wallet network posture is readable enough for settlement review.',
              tone: supportNetworkReadiness?.state === 'ready' ? 'emerald' : 'sky',
            },
            {
              label: 'BTD range cells',
              value: (supportReadRights?.totalRangeCells ?? 0).toLocaleString(),
              detail: `${(supportReadRights?.rangeCount ?? 0).toLocaleString()} range-bearing AssetPack projection(s), with protected source visibility fixed false before paid unlock.`,
              tone: 'violet',
            },
            {
              label: 'Read-right mix',
              value: `${(supportReadRights?.ownerReadCount ?? 0).toLocaleString()} owner / ${(supportReadRights?.licensedReadCount ?? 0).toLocaleString()} licensed`,
              detail: `${(supportReadRights?.pendingSettlementCount ?? 0).toLocaleString()} pending settlement and ${(supportReadRights?.deniedCount ?? 0).toLocaleString()} denied read-right posture(s) remain source-safe.`,
              tone: 'emerald',
            },
            {
              label: 'Settlement readiness',
              value: formatReadiness(supportSettlementReadiness),
              detail: walletSupport?.settlementBlockers?.length
                ? `Repair ${walletSupport.settlementBlockers.join(', ')} before signed settlement can continue.`
                : 'Wallet, network, and BTD support posture are aligned for settlement review.',
              tone: supportSettlementReadiness === 'ready' ? 'emerald' : 'amber',
            },
            {
              label: 'Treasury boundary',
              value: supportTreasury?.exchangeMarketState === 'not_exchange_market_state' ? 'Not Exchange' : 'Account',
              detail: 'Wallet/BTD support summarizes account fee posture only; it does not infer Exchange market activity.',
              tone: 'sky',
            },
          ]}
          columns={3}
        />
        <p className="mt-3 break-words text-xs leading-6 text-white/56">
          Support root {walletSupport?.btdSupportRoot ? formatPolicyHash(walletSupport.btdSupportRoot) : 'pending'}.
          Wallet root {supportWalletCapability?.walletCapabilityRoot ? ` ${formatPolicyHash(supportWalletCapability.walletCapabilityRoot)}` : ' pending'}.
        </p>
      </div>
    </AuxillariesWorkspaceSection>
  );
}
