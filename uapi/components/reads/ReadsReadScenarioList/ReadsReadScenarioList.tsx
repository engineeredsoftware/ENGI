'use client';

/**
 * Scenario selection cards for demonstration Read measurements.
 */

import React from 'react';
import type { TerminalReadScenariosState } from '@/components/reads/models/read-scenarios';

export type ReadsReadScenarioListProps = {
  scenarios: TerminalReadScenariosState['scenarios'];
  onSelect: (scenarioId: string) => void;
};

export function ReadsReadScenarioList({
  scenarios,
  onSelect,
}: ReadsReadScenarioListProps) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          onClick={() => {
            void onSelect(scenario.id);
          }}
          className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
            scenario.selected
              ? 'border-emerald-400/35 bg-emerald-400/10'
              : 'border-white/8 bg-black/20 hover:border-white/16 hover:bg-white/5'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{scenario.label}</p>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-neutral-500">
                {scenario.profile}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] ${
                scenario.selected
                  ? 'border-emerald-300/35 bg-emerald-300/15 text-emerald-100'
                  : 'border-white/10 bg-white/5 text-neutral-200'
              }`}
            >
              {scenario.selected ? 'active read' : 'available'}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-300">{scenario.repo}</p>
        </button>
      ))}
    </div>
  );
}
