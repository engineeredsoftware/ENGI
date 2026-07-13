/**
 * Props for the AssetPack options review panel (list shell + batch deposit).
 */

import type { DepositOptionReviewDecisionState } from "@bitcode/asset-packs-pipelines-domain/deposit-asset-pack-option-admission";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";
import type { DepositSettledDemandEstimate } from "@/components/deposits/models/deposit-settled-demand";
import type {
  DepositRealSynthesis,
  DepositRealSynthesisOption,
} from "@/components/deposits/models/deposit-real-synthesis";

export type { DepositRealSynthesis, DepositRealSynthesisOption };

export type DepositAssetPackOptionsProps = {
  realSynthesis: DepositRealSynthesis;
  depositRouteSession: DepositRouteSession;
  optionReviewDecisions: Record<string, DepositOptionReviewDecisionState>;
  selectedPackIds: string[];
  confirmingBatchDeposit: boolean;
  resynthesisForOptionId: string | null;
  resynthesisInstructions: string;
  settledDemandEstimate: DepositSettledDemandEstimate | null;
  onOptionReviewDecision: (
    optionId: string,
    decision: DepositOptionReviewDecisionState,
  ) => void | Promise<void>;
  onToggleSelect: (optionId: string) => void;
  onDepositSelected: () => void | Promise<void>;
  onResynthesisForOptionIdChange: (optionId: string | null) => void;
  onResynthesisInstructionsChange: (value: string) => void;
  onResynthesize: (optionId: string, instructions: string) => void | Promise<void>;
  onAnchorOption: (option: DepositRealSynthesisOption) => void | Promise<void>;
  // Activity draft shape is owned by the pipeline activity history model;
  // keep this open so the page client can pass TerminalActivityRecordDraft.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRecordActivity: (draft: any) => void | Promise<unknown>;
};
