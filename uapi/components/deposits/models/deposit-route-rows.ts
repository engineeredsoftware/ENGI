/**
 * Pure builders for Deposit route state rows (session + authority).
 */
import { formatSats, shortIdentifier } from "@/components/deposits/models/deposit-format";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";

export type DepositLabelValueRow = {
  label: string;
  value: string;
};

export function buildDepositSessionRows(
  depositRouteSession: DepositRouteSession,
  ids: {
    pipelineId: string;
    policyId: string;
    admissionId: string;
    earningsId: string;
  },
): DepositLabelValueRow[] {
  return [
    {
      label: "Repository",
      value:
        depositRouteSession.routeState.repositoryFullName ||
        "select repository",
    },
    {
      label: "Branch",
      value: depositRouteSession.routeState.sourceBranch || "pending",
    },
    {
      label: "Commit",
      value: shortIdentifier(depositRouteSession.routeState.sourceCommit),
    },
    {
      label: "Transaction",
      value: shortIdentifier(depositRouteSession.routeState.transactionId),
    },
    { label: "Pipeline", value: ids.pipelineId },
    { label: "Policy", value: ids.policyId },
    { label: "Admission", value: ids.admissionId },
    { label: "Earnings", value: ids.earningsId },
    {
      label: "Option roots",
      value: String(depositRouteSession.synthesis.roots.optionRoots.length),
    },
    {
      label: "Positive ROI options",
      value: String(depositRouteSession.policy.reviewablePositiveRoiCount),
    },
    {
      label: "Admitted options",
      value: String(depositRouteSession.admission.admittedCount),
    },
    {
      label: "Expected compensation",
      value: formatSats(
        depositRouteSession.earningSupplyIntelligence.aggregate
          .totalExpectedCompensationSats,
      ),
    },
  ];
}

export function buildDepositAuthorityRows(
  depositRouteSession: DepositRouteSession,
): DepositLabelValueRow[] {
  return [
    {
      label: "Authority",
      value: depositRouteSession.organizationPolicyWalletAuthority.aggregate.state,
    },
    {
      label: "Wallet",
      value: depositRouteSession.organizationPolicyWalletAuthority.walletAuthority.state,
    },
    {
      label: "Deposit policy",
      value: depositRouteSession.organizationPolicyWalletAuthority.depositApproval.state,
    },
    {
      label: "Required denials",
      value: String(
        depositRouteSession.organizationPolicyWalletAuthority.aggregate
          .requiredDeniedActionCount,
      ),
    },
    {
      label: "Authority root",
      value: depositRouteSession.organizationPolicyWalletAuthority.roots.authorityRoot,
    },
  ];
}
