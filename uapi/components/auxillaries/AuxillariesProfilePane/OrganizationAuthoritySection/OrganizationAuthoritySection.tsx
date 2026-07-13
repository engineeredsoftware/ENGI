/**
 * Organization policy authority projection for the profile auxillary.
 */

import React from 'react';
import type { OrganizationPolicyAuthority } from '@/app/auxillaries/auxillary-onboarding-contract';

import {
  formatAuthorityList,
  formatAuthorityValue,
  readPolicyDecisionLabel,
} from '../models/profile-pane-format';

export interface OrganizationAuthoritySectionProps {
  organizationAuthority?: OrganizationPolicyAuthority | null;
}

export default function OrganizationAuthoritySection({
  organizationAuthority = null,
}: OrganizationAuthoritySectionProps) {
  return (
    <section
      data-testid="auxillaries-organization-authority"
      className="mb-6 rounded-[20px] border border-sky-300/16 bg-sky-300/[0.052] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/72">
            Organization authority
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {readPolicyDecisionLabel(organizationAuthority)}
          </h3>
        </div>
        <div className="rounded-full border border-white/10 bg-black/24 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
          {organizationAuthority?.policyDecision ?? 'not_projected'}
        </div>
      </div>

      <div className="mt-4 grid gap-3 tablet:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Organization
          </p>
          <p className="mt-2 text-sm text-white/78">
            {formatAuthorityValue(organizationAuthority?.organizationId)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Team/member
          </p>
          <p className="mt-2 text-sm text-white/78">
            {formatAuthorityValue(organizationAuthority?.teamId)} / {formatAuthorityValue(organizationAuthority?.memberId)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Wallet binding
          </p>
          <p className="mt-2 text-sm text-white/78">
            {organizationAuthority?.walletBindingState ?? 'not_projected'}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Multi-sig
          </p>
          <p className="mt-2 text-sm text-white/78">
            {organizationAuthority?.multiSigPosture.state ?? 'not_projected'}
            {organizationAuthority?.multiSigPosture.required
              ? ` (${organizationAuthority.multiSigPosture.presentSignatures}/${organizationAuthority.multiSigPosture.requiredSignatures})`
              : ''}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 tablet:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Policy action
          </p>
          <p className="mt-2 text-sm text-white/78">
            {formatAuthorityValue(organizationAuthority?.policy.action)}
            {' '}
            via
            {' '}
            {formatAuthorityValue(organizationAuthority?.policy.interfaceSurface)}
          </p>
          <p className="mt-2 break-all text-xs text-white/48">
            {formatAuthorityValue(organizationAuthority?.policy.policyHash)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Explicit grants
          </p>
          <p className="mt-2 text-sm text-white/78">
            {formatAuthorityList(organizationAuthority?.explicitGrantSet)}
          </p>
          <p className="mt-2 text-xs text-white/48">
            Role: {formatAuthorityValue(organizationAuthority?.role)}
          </p>
        </div>
      </div>

      {organizationAuthority?.denialReasons?.length ? (
        <div className="mt-4 grid gap-2">
          {organizationAuthority.denialReasons.slice(0, 6).map((reason) => (
            <div
              key={reason}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-300/18 bg-amber-300/[0.07] px-3 py-2"
            >
              <span className="text-sm font-semibold text-amber-50">{reason}</span>
              <a
                href={organizationAuthority.recoveryRoute}
                className="rounded-full border border-amber-200/24 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:border-amber-100/44"
              >
                Repair
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-white/64">
          Organization role, explicit grants, wallet binding, policy, and multi-sig posture admit the projected action.
        </p>
      )}

      <p className="mt-3 break-all text-xs leading-6 text-white/42">
        {organizationAuthority?.authorityRoot ?? 'authority root not projected'}
      </p>
    </section>
  );
}
