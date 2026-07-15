/**
 * Pure builders for Reading route state rows (session, procurement, authority).
 */

import { formatSats, shortIdentifier } from '@/components/reads/models/read-format';
import type { ReadRouteSession } from '@/components/reads/models/read-route-model';

export type ReadLabelValueRow = {
  label: string;
  value: string;
};

export function buildReadSessionRows(session: ReadRouteSession): ReadLabelValueRow[] {
  return [
    {
      label: 'Repository',
      value: session.routeState.repositoryFullName || 'select repository',
    },
    {
      label: 'Branch',
      value: session.routeState.sourceBranch || 'pending',
    },
    {
      label: 'Commit',
      value: shortIdentifier(session.routeState.sourceCommit),
    },
    {
      label: 'Transaction',
      value: shortIdentifier(session.routeState.transactionId),
    },
    {
      label: 'Need pipeline',
      value: session.pipelineOwnership.readNeedPipeline,
    },
    {
      label: 'Fits pipeline',
      value: session.pipelineOwnership.findingFitsPipeline,
    },
  ];
}

export function buildReadProcurementRows(session: ReadRouteSession): ReadLabelValueRow[] {
  return [
    {
      label: 'Budget',
      value: formatSats(session.procurementGovernance.budgetPolicy.budgetEnvelopeSats),
    },
    {
      label: 'Quote',
      value: formatSats(session.procurementGovernance.quotePolicy.shareToFee.grossSats),
    },
    {
      label: 'Approval',
      value: session.procurementGovernance.budgetPolicy.approvalRequired
        ? session.procurementGovernance.approval.procurementApproved
          ? 'approved'
          : 'required'
        : 'not required',
    },
    {
      label: 'Settlement',
      value: session.procurementGovernance.settlement.readiness.replace(/-/g, ' '),
    },
  ];
}

export function buildReadAuthorityRows(session: ReadRouteSession): ReadLabelValueRow[] {
  return [
    {
      label: 'Authority',
      value: session.organizationPolicyWalletAuthority.aggregate.state,
    },
    {
      label: 'Wallet',
      value: session.organizationPolicyWalletAuthority.walletAuthority.state,
    },
    {
      label: 'Spend',
      value: session.organizationPolicyWalletAuthority.budgetApproval.state,
    },
    {
      label: 'Required denials',
      value: String(
        session.organizationPolicyWalletAuthority.aggregate.requiredDeniedActionCount,
      ),
    },
    {
      label: 'Authority root',
      value: session.organizationPolicyWalletAuthority.roots.authorityRoot,
    },
  ];
}
