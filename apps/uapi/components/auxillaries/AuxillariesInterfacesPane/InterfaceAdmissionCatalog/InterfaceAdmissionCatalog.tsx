/**
 * Interface admission catalog cards for admitted surfaces and source boundaries.
 */

import React from 'react';
import type { InterfaceAdmissionRecord } from '../models/interfaces-pane-defaults';
import { formatAdmissionList, formatAdmissionValue } from '../models/interfaces-pane-format';

export interface InterfaceAdmissionCatalogProps {
  admissionRecords: InterfaceAdmissionRecord[];
}

export default function InterfaceAdmissionCatalog({ admissionRecords }: InterfaceAdmissionCatalogProps) {
  return (
    <div className="grid min-w-0 gap-3 laptop:grid-cols-2" data-testid="auxillaries-interface-admission-catalog">
      {admissionRecords.length > 0 ? (
        admissionRecords.map((admission) => {
          const admissionRoot =
            typeof admission.interfaceAdmissionRoot === 'string'
              ? admission.interfaceAdmissionRoot
              : 'missing-root';
          const blockers = Array.isArray(admission.blockers) ? admission.blockers : [];
          const supportedActions = Array.isArray(admission.supportedActions)
            ? admission.supportedActions
            : [];
          const allowedActions = Array.isArray(admission.allowedActions)
            ? admission.allowedActions
            : [];
          const policyRequirements = Array.isArray(admission.policyRequirements)
            ? admission.policyRequirements
            : Array.isArray(admission.policyConstraints)
              ? admission.policyConstraints
              : [];

          return (
            <article
              key={`${admission.interfaceId || admission.surface}-${admissionRoot}`}
              className="rounded-none border border-white/10 bg-white/[0.035] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                    {formatAdmissionValue(admission.surface)}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-white">
                    {formatAdmissionValue(admission.interfaceId)}
                  </h3>
                </div>
                <span
                  className={[
                    'rounded-none border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                    admission.readiness === 'ready'
                      ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                      : admission.readiness === 'blocked'
                        ? 'border-amber-300/40 bg-amber-400/10 text-amber-100'
                        : 'border-sky-300/40 bg-sky-400/10 text-sky-100',
                  ].join(' ')}
                >
                  {formatAdmissionValue(admission.readiness)}
                </span>
              </div>

              <dl className="mt-4 grid min-w-0 gap-3 text-sm text-white/72 phone:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Auth</dt>
                  <dd className="mt-1 font-medium text-white/86">
                    {formatAdmissionValue(admission.authMode)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Source</dt>
                  <dd className="mt-1 font-medium text-white/86">
                    {formatAdmissionValue(admission.sourceSafetyClass)}
                  </dd>
                </div>
                <div className="phone:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Supported</dt>
                  <dd className="mt-1">{formatAdmissionList(supportedActions)}</dd>
                </div>
                <div className="phone:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Admitted now</dt>
                  <dd className="mt-1">{formatAdmissionList(allowedActions)}</dd>
                </div>
                <div className="phone:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Policy</dt>
                  <dd className="mt-1">{formatAdmissionList(policyRequirements)}</dd>
                </div>
                <div className="phone:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Blockers</dt>
                  <dd className="mt-1">{formatAdmissionList(blockers)}</dd>
                </div>
                <div className="phone:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Root</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-white/60">{admissionRoot}</dd>
                </div>
              </dl>
            </article>
          );
        })
      ) : (
        <div className="rounded-none border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-100">
          Interface admission records are not loaded yet.
        </div>
      )}
    </div>
  );
}
