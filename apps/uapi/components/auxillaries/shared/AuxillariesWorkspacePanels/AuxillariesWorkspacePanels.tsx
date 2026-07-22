/**
 * Auxillaries pane selector.
 * Desktop: left-rail cards (state square, title, description, feature pills).
 * Stacked ≤1023px: title-only horizontal tab strip (copy/pills/state hidden via CSS).
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';

import {
  getAuxillaryDescriptor,
  type AuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

const PANEL_EASE = [0.16, 1, 0.3, 1] as const;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

interface AuxillariesWorkspacePanelsProps {
  steps: AuxillaryPane[];
  currentStep: AuxillaryPane;
  availableSteps: AuxillaryPane[];
  onStepClick: (step: AuxillaryPane) => void;
}

export default function AuxillariesWorkspacePanels({
  steps,
  currentStep,
  availableSteps,
  onStepClick,
}: AuxillariesWorkspacePanelsProps) {
  const reduceMotion = prefersReducedMotion();

  return (
    <div
      className="orbital-workspace-panel-list auxillaries-bitcode-selector-list"
      role="list"
      aria-label="Auxillaries workspace panels"
    >
      {steps.map((step, index) => {
        if (!step) return null;

        const descriptor = getAuxillaryDescriptor(step);
        const isActive = currentStep === step;
        const isAvailable = availableSteps.includes(step);
        const state = isActive ? 'active' : isAvailable ? 'ready' : 'locked';
        const stateLabel =
          state === 'active'
            ? 'Active auxillary'
            : state === 'ready'
              ? 'Ready auxillary'
              : 'Locked auxillary';
        const descriptionId = `auxillaries-panel-${step}-state`;
        const pillsId = `auxillaries-panel-${step}-pills`;

        return (
          <motion.div
            key={step}
            role="listitem"
            className="h-full min-h-0 w-full"
            /* Opacity-only enter — y translate inflated scrollHeight and
               flashed a left-rail scrollbar even when 4 cards fit. */
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              delay: reduceMotion ? 0 : 0.08 + index * 0.05,
              ease: PANEL_EASE,
            }}
          >
            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  onStepClick(step);
                }
              }}
              className={`orbital-workspace-panel auxillaries-bitcode-selector-card ${
                isActive
                  ? 'orbital-workspace-panel-current auxillaries-bitcode-selector-card-current'
                  : isAvailable
                    ? 'orbital-workspace-panel-available auxillaries-bitcode-selector-card-available'
                    : 'orbital-workspace-panel-locked auxillaries-bitcode-selector-card-locked'
              }`}
              aria-label={`${descriptor.label} auxillary`}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={!isAvailable}
              aria-describedby={`${descriptionId} ${pillsId}`}
            >
              <span id={descriptionId} className="sr-only">
                {stateLabel}. {descriptor.routeDescription}
              </span>
              <div className="orbital-workspace-panel-topline auxillaries-bitcode-selector-card-topline">
                <span
                  className={`orbital-workspace-panel-state auxillaries-bitcode-selector-card-state auxillaries-bitcode-selector-card-state-${state}`}
                  aria-label={stateLabel}
                  title={stateLabel}
                  data-state={state}
                  data-testid={isActive ? `auxillaries-pane-selected-${step}` : undefined}
                />
              </div>
              <p className="orbital-workspace-panel-label auxillaries-bitcode-selector-card-label">
                {descriptor.label}
              </p>
              <p className="orbital-workspace-panel-copy auxillaries-bitcode-selector-card-copy">
                {descriptor.routeDescription}
              </p>
              <ul
                id={pillsId}
                className="auxillaries-bitcode-selector-card-pills"
                aria-label={`${descriptor.label} key features`}
              >
                {descriptor.featurePills.map((pill) => (
                  <li
                    key={pill}
                    className="auxillaries-bitcode-selector-card-pill"
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
