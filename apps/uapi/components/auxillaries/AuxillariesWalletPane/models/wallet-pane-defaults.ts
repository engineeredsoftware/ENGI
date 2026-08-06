/**
 * BTD preference defaults for the wallet auxillary pane.
 */

export type ShareLens = 'account' | 'organization' | 'network';
export type SettlementView = 'review' | 'bounded' | 'replay';
export type BtdDetailView = 'transactions' | 'proofs' | 'history';
export type AutomationBias = 'review-first' | 'guided' | 'decisive';
export type WalletSync = 'manual' | 'daily' | 'live';

export interface BtdDefaults {
  shareLens: ShareLens;
  settlementView: SettlementView;
  btdDetailView: BtdDetailView;
  automationBias: AutomationBias;
  walletSync: WalletSync;
}

export const DEFAULT_BTD_DEFAULTS: BtdDefaults = {
  shareLens: 'account',
  settlementView: 'bounded',
  btdDetailView: 'transactions',
  automationBias: 'review-first',
  walletSync: 'manual',
};
