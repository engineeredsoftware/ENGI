'use client';

/**
 * Deposit route state aside — Earnings, Governance, and Session panels.
 * Presentational only; parent owns route session and estimate state.
 * Section bodies live in DepositAsideEarningsPanel / DepositAsideRowsSection.
 */

import React from "react";
import {
  ProductRouteDisclosure,
  ProductRouteProofDetail,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import {
  DEPOSIT_AUTHORITY_BLOCKERS_EXPLAINER,
  DEPOSIT_STAT_TOOLTIP_GENERICS,
  DEPOSIT_STAT_TOOLTIP_SECTIONS,
  DEPOSIT_AUTHORITY_ROW_EXPLAINERS,
  DEPOSIT_DISCLOSURE_BOUNDARY_EXPLAINER,
  DEPOSIT_PROOF_ROOT_EXPLAINERS,
  DEPOSIT_SESSION_ROW_EXPLAINERS,
} from "@/components/deposits/models/deposit-stat-explainers";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";
import type { DepositSettledDemandEstimate } from "@/components/deposits/models/deposit-settled-demand";
import type { DepositLabelValueRow } from "@/components/deposits/models/deposit-route-rows";
import { DepositAsideEarningsPanel } from "@/components/deposits/DepositAsideEarningsPanel/DepositAsideEarningsPanel";
import { DepositAsideRowsSection } from "@/components/deposits/DepositAsideRowsSection/DepositAsideRowsSection";

export type { DepositSettledDemandEstimate, DepositLabelValueRow };

export type DepositRouteStateAsideProps = {
  depositRouteSession: DepositRouteSession;
  settledDemandEstimate: DepositSettledDemandEstimate | null;
  authorityRows: readonly DepositLabelValueRow[];
  sessionRows: readonly DepositLabelValueRow[];
};

export function DepositRouteStateAside({
  depositRouteSession,
  settledDemandEstimate,
  authorityRows,
  sessionRows,
}: DepositRouteStateAsideProps) {
  return (
    <aside
      className="grid h-fit items-start gap-5 tablet:grid-cols-3 xl:grid-cols-1"
      aria-label="Deposit route state"
    >
      <DepositAsideEarningsPanel
        depositRouteSession={depositRouteSession}
        settledDemandEstimate={settledDemandEstimate}
      />

      <DepositAsideRowsSection
        kicker="Governance"
        title="Organization authority"
        sectionExplainer={DEPOSIT_SECTION_EXPLAINERS.governance}
        rows={authorityRows}
        rowExplainerKicker="Governance"
        rowExplainers={DEPOSIT_AUTHORITY_ROW_EXPLAINERS}
        rowFallbackExplainer="Organization authority state for this deposit route."
        genericTooltip={DEPOSIT_STAT_TOOLTIP_GENERICS.governance}
        tooltipPoints={DEPOSIT_STAT_TOOLTIP_SECTIONS.governance.points}
        tooltipSourceRefs={
          DEPOSIT_STAT_TOOLTIP_SECTIONS.governance.references.source
        }
        tooltipCanonRefs={
          DEPOSIT_STAT_TOOLTIP_SECTIONS.governance.references.canon
        }
      >
        {depositRouteSession.organizationPolicyWalletAuthority.aggregate
          .blockers.length ? (
          <div className="mt-3">
            <ProductRouteDisclosure
              title="Authority blockers"
              tone="violet"
              summaryDescription={DEPOSIT_AUTHORITY_BLOCKERS_EXPLAINER}
            >
              {depositRouteSession.organizationPolicyWalletAuthority.aggregate.blockers.join(
                "; ",
              )}
            </ProductRouteDisclosure>
          </div>
        ) : null}
      </DepositAsideRowsSection>

      <DepositAsideRowsSection
        kicker="Session"
        title="Source-safe deposit state"
        sectionExplainer={DEPOSIT_SECTION_EXPLAINERS.session}
        rows={sessionRows}
        rowExplainerKicker="Session state"
        rowExplainers={DEPOSIT_SESSION_ROW_EXPLAINERS}
        rowFallbackExplainer="Source-safe session state for this deposit route."
        genericTooltip={DEPOSIT_STAT_TOOLTIP_GENERICS.sessionState}
        tooltipPoints={DEPOSIT_STAT_TOOLTIP_SECTIONS.sessionState.points}
        tooltipSourceRefs={
          DEPOSIT_STAT_TOOLTIP_SECTIONS.sessionState.references.source
        }
        tooltipCanonRefs={
          DEPOSIT_STAT_TOOLTIP_SECTIONS.sessionState.references.canon
        }
      >
        <div className="mt-3">
          <ProductRouteDisclosure
            title="Disclosure boundary"
            tone="violet"
            summaryDescription={DEPOSIT_DISCLOSURE_BOUNDARY_EXPLAINER}
          >
            Visible: measurements, demand roots, source path roots, policy
            roots, estimated ROI, BTD potential, compensation metadata.
            Withheld: raw source, unpaid AssetPack source, prompts, provider
            responses, settlement private payloads, wallet private material.
          </ProductRouteDisclosure>
        </div>
        <div className="mt-3">
          <ProductRouteProofDetail
            testId="deposit-expandable-proof-detail"
            title="Deposit proof detail"
            tone="violet"
            roots={[
              {
                id: "route-session-root",
                description: DEPOSIT_PROOF_ROOT_EXPLAINERS["route-session-root"],
                label: "Route session root",
                root: depositRouteSession.proofRoot,
              },
              {
                id: "synthesis-root",
                description: DEPOSIT_PROOF_ROOT_EXPLAINERS["synthesis-root"],
                label: "Synthesis root",
                root: depositRouteSession.synthesis.roots.synthesisRoot,
              },
              {
                id: "policy-root",
                description: DEPOSIT_PROOF_ROOT_EXPLAINERS["policy-root"],
                label: "Policy root",
                root: depositRouteSession.policy.roots.policyReportRoot,
              },
              {
                id: "admission-root",
                description: DEPOSIT_PROOF_ROOT_EXPLAINERS["admission-root"],
                label: "Admission root",
                root: depositRouteSession.admission.roots.admissionReportRoot,
              },
              {
                id: "earning-root",
                description: DEPOSIT_PROOF_ROOT_EXPLAINERS["earning-root"],
                label: "Earning intelligence root",
                root:
                  depositRouteSession.earningSupplyIntelligence.roots
                    .intelligenceRoot,
              },
              {
                id: "authority-root",
                description: DEPOSIT_PROOF_ROOT_EXPLAINERS["authority-root"],
                label: "Authority root",
                root:
                  depositRouteSession.organizationPolicyWalletAuthority.roots
                    .authorityRoot,
              },
            ]}
          />
        </div>
      </DepositAsideRowsSection>
    </aside>
  );
}
