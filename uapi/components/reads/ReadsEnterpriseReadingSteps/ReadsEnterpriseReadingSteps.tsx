/**
 * Enterprise reading step cards for the deposit/read workbench.
 */
"use client";

import React from "react";

export type ReadsEnterpriseReadingStep = {
  id: string;
  state: string;
  label: string;
  lowDetailGuidance?: string;
  expandableDetail?: string;
  sourceSafeVisibleFields: string[];
  blockers: string[];
};

export type ReadsEnterpriseReadingStepsProps = {
  stages: ReadsEnterpriseReadingStep[];
  activeStageId: string;
};

export function ReadsEnterpriseReadingSteps({
  stages,
  activeStageId,
}: ReadsEnterpriseReadingStepsProps) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {stages.map((stage) => {
        const active = stage.id === activeStageId;
        return (
          <div
            key={stage.id}
            data-testid={`terminal-enterprise-reading-step-${stage.id}`}
            data-reading-step-state={stage.state}
            className={`rounded-[1.05rem] border px-3 py-4 text-sm ${
              active
                ? "border-sky-300/35 bg-sky-300/10"
                : "border-white/8 bg-black/20"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-neutral-100">{stage.label}</p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.56rem] uppercase tracking-[0.12em] text-neutral-400">
                {stage.state}
              </span>
            </div>
            <p className="mt-2 leading-5 text-neutral-400">
              {stage.lowDetailGuidance}
            </p>
            <details className="mt-3 rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-2">
              <summary className="cursor-pointer text-[0.6rem] uppercase tracking-[0.14em] text-sky-200/80">
                Source-safe detail
              </summary>
              <p className="mt-2 text-xs leading-5 text-neutral-300">
                {stage.expandableDetail}
              </p>
              <dl className="mt-2 grid gap-1.5">
                <div>
                  <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-neutral-500">
                    visible
                  </dt>
                  <dd className="mt-0.5 break-words font-mono text-[0.62rem] text-neutral-300">
                    {stage.sourceSafeVisibleFields.join(", ")}
                  </dd>
                </div>
                {stage.blockers.length ? (
                  <div>
                    <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-neutral-500">
                      blocked by
                    </dt>
                    <dd className="mt-0.5 break-words font-mono text-[0.62rem] text-neutral-300">
                      {stage.blockers.join(", ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </details>
          </div>
        );
      })}
    </div>
  );
}
