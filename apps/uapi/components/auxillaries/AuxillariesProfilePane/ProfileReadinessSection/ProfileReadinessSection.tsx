/**
 * Account readiness readout for the profile auxillary (wallet, notifications, data sharing).
 */

import React from 'react';
import type { AuxillariesProfileState } from '@/app/auxillaries/auxillary-onboarding-contract';

import { readProfileReadinessLabel } from '../models/profile-pane-format';

export interface ProfileReadinessSectionProps {
  profileState?: AuxillariesProfileState | null;
}

export default function ProfileReadinessSection({ profileState = null }: ProfileReadinessSectionProps) {
  const profileReadinessIssues = profileState?.profileCompleteness?.issues ?? [];
  const notificationPosture = profileState?.notificationPosture;
  const dataSharingPosture = profileState?.dataSharingPosture;

  return (
    <section
      data-testid="auxillaries-profile-readiness"
      className="mb-6 rounded-none border border-emerald-300/16 bg-emerald-300/[0.055] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
            Account readiness
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {readProfileReadinessLabel(profileState)}
          </h3>
        </div>
        <div className="rounded-none border border-white/10 bg-black/24 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
          {profileState?.accountReadiness ?? 'loading'}
        </div>
      </div>
      <div className="mt-4 grid gap-3 tablet:grid-cols-3">
        <div className="rounded-none border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Wallet
          </p>
          <p className="mt-2 text-sm text-white/78">
            {profileState?.walletBinding?.address ? 'Binding present' : 'Binding repairable'}
          </p>
        </div>
        <div className="rounded-none border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Notifications
          </p>
          <p className="mt-2 text-sm text-white/78">
            {notificationPosture
              ? `${notificationPosture.state}${notificationPosture.unreadCount ? ` (${notificationPosture.unreadCount})` : ''}`
              : 'Loading'}
          </p>
        </div>
        <div className="rounded-none border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
            Data sharing
          </p>
          <p className="mt-2 text-sm text-white/78">
            {dataSharingPosture
              ? `${dataSharingPosture.state} (${dataSharingPosture.enabledRepositoryCount}/${dataSharingPosture.repositoryCount})`
              : 'Loading'}
          </p>
        </div>
      </div>
      {profileReadinessIssues.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {profileReadinessIssues.slice(0, 5).map((issue) => (
            <div
              key={issue.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-none border border-white/10 bg-black/18 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-white/84">{issue.summary}</p>
                <p className="mt-1 text-xs text-white/54">{issue.requiredAction}</p>
              </div>
              <a
                href={issue.repairRoute.route}
                className="rounded-none border border-emerald-300/24 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-200/44"
              >
                {issue.repairRoute.label}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-white/64">
          Profile, wallet support, preferences, notifications, and data-sharing posture are complete.
        </p>
      )}
    </section>
  );
}
