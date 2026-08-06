'use client';

import React from 'react';

import {
  getOrbitalsTabsDescription,
  labelForOrbitalPane,
  ORBITALS_ACCESS_LABEL,
  ORBITALS_LABEL,
  type OrbitalPane,
} from '@/components/bitcode/orbitals/OrbitalPaneMeta/OrbitalPaneMeta';

interface OrbitalsPaneTabsProps {
  mode?: 'onboarding' | 'auxillaries';
  steps: OrbitalPane[];
  currentStep: OrbitalPane;
  completedSteps: OrbitalPane[];
  availableSteps: OrbitalPane[];
  onStepClick: (step: OrbitalPane) => void;
}

export default function OrbitalsPaneTabs({
  mode = 'onboarding',
  steps,
  currentStep,
  completedSteps,
  availableSteps,
  onStepClick,
}: OrbitalsPaneTabsProps) {
  const completedCount = completedSteps.length;
  const totalCount = steps.filter(Boolean).length;
  const isAuxillariesMode = mode === 'auxillaries';

  return (
    <div className="orbital-pane-tabs mb-6 rounded-[1.35rem] border border-white/8 bg-black/20 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.66rem] uppercase tracking-[0.22em] text-emerald-300/80">
            {isAuxillariesMode ? ORBITALS_LABEL : ORBITALS_ACCESS_LABEL}
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-300">
            {getOrbitalsTabsDescription(mode)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em]">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-200">
            {isAuxillariesMode ? 'auxillaries' : 'auxillaries access'}
          </span>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-100">
            {completedCount}/{totalCount} complete
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3 text-xs uppercase tracking-[0.18em] text-neutral-300">
        Active auxillary: <span className="text-white">{labelForOrbitalPane(currentStep)}</span>
      </div>

      <div className="orbital-pane-tab-grid mt-4 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          if (!step) return null;

          const isCurrent = step === currentStep;
          const isCompleted = completedSteps.includes(step);
          const isAvailable = availableSteps.includes(step);

          return (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (isAvailable) {
                  onStepClick(step);
                }
              }}
              disabled={!isAvailable}
              aria-label={`${index + 1} ${labelForOrbitalPane(step)}`}
              className={`orbital-pane-tab ${
                isCurrent
                  ? 'orbital-pane-tab-current'
                  : isAvailable
                    ? 'orbital-pane-tab-available'
                    : 'orbital-pane-tab-locked'
              }`}
            >
              <span className="orbital-pane-tab-index">{index + 1}</span>
              <span className="orbital-pane-tab-label">{labelForOrbitalPane(step)}</span>
              <span className="orbital-pane-tab-status">
                {isCurrent ? 'active' : isCompleted ? 'ready' : isAvailable ? 'open' : 'locked'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
