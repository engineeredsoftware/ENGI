"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getAuxillaryDescriptor,
  labelForAuxillaryPane,
  AUXILLARIES_ACCESS_LABEL,
  type AuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import AuxillariesPaneTabs from '@/components/auxillaries/shared/AuxillariesPaneTabs/AuxillariesPaneTabs';
import AuxillariesWorkspacePanels from '@/components/auxillaries/shared/AuxillariesWorkspacePanels/AuxillariesWorkspacePanels';

/** Matches marketing landing entranceEase. */
const AUX_PANE_EASE = [0.16, 1, 0.3, 1] as const;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export interface AuxillariesContentProps {
  mode?: 'onboarding' | 'auxillaries';
  steps: AuxillaryPane[];
  currentStep: AuxillaryPane;
  completedSteps: AuxillaryPane[];
  availableSteps: AuxillaryPane[];
  showContent: boolean;
  showSuccessAnimation: boolean;
  navigationMode?: 'orbital' | 'tabs';
  surfaceVariant?: 'default' | 'contained';
  /** Close / disconnect (and similar) rendered above the left selector column. */
  chromeActions?: React.ReactNode;
  onStepClick: (step: AuxillaryPane) => void;
  renderStepContent: (step: AuxillaryPane) => React.ReactNode;
  isOnboardingComplete?: boolean;
}

function AuxillariesContent(props: AuxillariesContentProps) {
  const {
    steps = [],
    currentStep = null,
    completedSteps = [],
    availableSteps = [],
    showContent = false,
    showSuccessAnimation = false,
    navigationMode = 'orbital',
    surfaceVariant = 'default',
    mode = 'onboarding',
    chromeActions = null,
    onStepClick = (_: AuxillaryPane) => {},
    renderStepContent = (_: AuxillaryPane) => null,
    isOnboardingComplete = false,
  } = props;
  const isAuxillariesMode = mode === 'auxillaries';
  const usesTabNavigation = navigationMode === 'tabs';
  const usesContainedLayout = surfaceVariant === 'contained';
  const reduceMotion = prefersReducedMotion();
  const activePaneLabel = currentStep ? labelForAuxillaryPane(currentStep) : 'Auxillaries';
  const availableStepLabels = availableSteps.filter(Boolean).map((step) => labelForAuxillaryPane(step));
  const blockedStepLabels = steps
    .filter((step) => step && !availableSteps.includes(step))
    .map((step) => labelForAuxillaryPane(step));

  const stepMeta = useMemo(() => {
    const pos = new Map<AuxillaryPane, number>();
    steps.forEach((step, index) => pos.set(step, index));

    const currentIdx = currentStep ? pos.get(currentStep) ?? -1 : -1;
    const lastCompletedIdx = completedSteps.length
      ? Math.max(...completedSteps.map((step) => pos.get(step) ?? -1))
      : -1;

    return { pos, currentIdx, lastCompletedIdx };
  }, [steps, currentStep, completedSteps]);

  // Snappy shell motion — no enter delay; exit faster than enter so the next
  // pane feels immediate after a tab click.
  const paneMotion = reduceMotion
    ? {
        initial: false as const,
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.26, ease: AUX_PANE_EASE },
      };

  /**
   * Inner CSS stagger (auxillaries-pane-enter) only for the brief entrance window.
   * Leave it mounted and Connect attention will toggle other classes on the same
   * nodes — which restarts the CSS entrance after the highlight. Strip the class
   * once the cascade finishes so attention never re-fires entrance.
   */
  const [innerEnterActive, setInnerEnterActive] = useState(!reduceMotion);

  useEffect(() => {
    if (reduceMotion || !currentStep || !showContent) {
      setInnerEnterActive(false);
      return;
    }
    setInnerEnterActive(true);
    // Last stagger delay ~0.17s + 0.28s duration ≈ 0.45s; small buffer.
    const timer = window.setTimeout(() => setInnerEnterActive(false), 520);
    return () => window.clearTimeout(timer);
  }, [currentStep, showContent, reduceMotion]);

  const ringElements = useMemo(() => {
    if (usesContainedLayout) return null;

    return steps.map((step) => {
      if (!step) return null;

      const stepPosition = stepMeta.pos.get(step)!;
      const ringIndex = getAuxillaryDescriptor(step).ringIndex;
      const isAvailable = availableSteps.includes(step);
      const highest = Math.max(stepMeta.currentIdx, stepMeta.lastCompletedIdx);
      const isNext = !isAuxillariesMode && stepPosition === highest + 1;
      const descriptor = getAuxillaryDescriptor(step);
      const size = 30 + ringIndex * 15;
      const style: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${size}%`,
        height: `${size}%`,
        borderRadius: '50%',
        border: isAvailable ? '2px solid rgba(103,254,183,0.05)' : 'none',
        boxSizing: 'border-box',
        cursor: isAvailable ? 'pointer' : 'default',
        pointerEvents: isAvailable ? 'auto' : 'none',
        zIndex: steps.length - ringIndex,
      };

      return (
        <div
          key={step}
          className={`clickable-ring ${isAvailable ? 'available' : ''} ${isNext ? 'next-available' : ''}`}
          style={style}
          onClick={() => isAvailable && onStepClick(step)}
        >
          <div
            className={`auxillaries-label position-${descriptor.labelPosition} ${
              currentStep === step ? 'auxillaries-label-active' : ''
            }`}
            style={{ '--index': ringIndex } as React.CSSProperties}
          >
            {descriptor.label}
          </div>
        </div>
      );
    });
  }, [
    availableSteps,
    currentStep,
    isAuxillariesMode,
    onStepClick,
    stepMeta.currentIdx,
    stepMeta.lastCompletedIdx,
    stepMeta.pos,
    steps,
    usesContainedLayout,
  ]);

  const contentPanel =
    showContent && currentStep ? (
      <AnimatePresence mode="wait" initial={!reduceMotion}>
        <motion.div
          key={currentStep}
          className={`orbital-content-container${innerEnterActive ? ' auxillaries-pane-enter' : ''}`}
          initial={paneMotion.initial}
          animate={paneMotion.animate}
          exit={{
            ...paneMotion.exit,
            transition: reduceMotion
              ? { duration: 0 }
              : { duration: 0.16, ease: AUX_PANE_EASE },
          }}
          transition={paneMotion.transition}
          style={
            reduceMotion
              ? undefined
              : {
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }
          }
        >
          {renderStepContent(currentStep)}
        </motion.div>
      </AnimatePresence>
    ) : null;

  return (
    <>
      {showSuccessAnimation && !isAuxillariesMode && currentStep && !completedSteps.includes(currentStep) && (
        <div className="step-completion-success">
          <div className="success-icon">✓</div>
          <div className="success-ring-outer" />
          <div className="success-ring-middle" />
          <div className="success-ring-inner" />
          <div className="success-glow" />
        </div>
      )}

      {usesTabNavigation && !usesContainedLayout ? (
        <AuxillariesPaneTabs
          mode={mode}
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          availableSteps={availableSteps}
          onStepClick={onStepClick}
        />
      ) : null}

      {currentStep && (isAuxillariesMode || !isOnboardingComplete) && !usesTabNavigation && !usesContainedLayout && (
        <motion.div
          className="orbital-step-indicator"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            x: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 },
          }}
        >
          <div className="step-indicator-content">
            <h3 className="step-indicator-title">
              {isAuxillariesMode ? 'Auxillary rings' : AUXILLARIES_ACCESS_LABEL}
            </h3>
            <div className="step-indicator-steps">
              {steps.map((step) => {
                const index = stepMeta.pos.get(step)!;
                const isActive = step === currentStep;
                const isCompleted = completedSteps.includes(step);
                const isAvailable = availableSteps.includes(step);
                const highest = Math.max(stepMeta.currentIdx, stepMeta.lastCompletedIdx);
                const isNext = !isAuxillariesMode && index === highest + 1;
                const classes = ['step-indicator-item'];
                if (isActive) classes.push('active');
                if (isCompleted) classes.push('completed');
                if (isNext) classes.push('next-available');

                return (
                  <div
                    key={step}
                    className={classes.join(' ')}
                    onClick={() => {
                      if (isAvailable) {
                        try {
                          const { trackEvent } = require('@bitcode/external-telemetry-google');
                          trackEvent(isAuxillariesMode ? 'auxillaries_step_click' : 'onboarding_step_click', { step });
                        } catch {}
                        onStepClick(step);
                      }
                    }}
                  >
                    <div className="step-indicator-circle">
                      {isCompleted ? (
                        <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="step-indicator-label">{labelForAuxillaryPane(step)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {usesContainedLayout ? (
        <main
          className="orbital-workspace-shell auxillaries-bitcode-shell"
          aria-label="Bitcode Auxillaries support plane"
          data-auxillaries-testid="auxillaries-main-landmark"
          data-testid="auxillaries-main-landmark"
        >
          <a className="auxillaries-skip-link" href="#auxillaries-active-pane">
            Skip to active support pane
          </a>
          {chromeActions ? (
            <div
              className="auxillaries-left-chrome-actions"
              role="toolbar"
              aria-label="Auxillaries session actions"
              data-auxillaries-testid="auxillaries-left-chrome-actions"
              data-testid="auxillaries-left-chrome-actions"
            >
              {chromeActions}
            </div>
          ) : null}
          <aside
            className={`orbital-workspace-nav auxillaries-bitcode-selector${chromeActions ? ' auxillaries-bitcode-selector-with-chrome' : ''}`}
            role="navigation"
            aria-label="Auxillaries pane navigation"
            data-auxillaries-testid="auxillaries-pane-navigation"
            data-testid="auxillaries-pane-navigation"
          >
            <AuxillariesWorkspacePanels
              steps={steps}
              currentStep={currentStep}
              availableSteps={availableSteps}
              onStepClick={onStepClick}
            />
          </aside>
          <section
            id="auxillaries-active-pane"
            className={`orbital-workspace-stage auxillaries-bitcode-pane auxillaries-active-pane-region${chromeActions ? ' auxillaries-bitcode-pane-with-chrome' : ''}`}
            role="region"
            aria-label={`${activePaneLabel} active support pane`}
            aria-live="polite"
            aria-busy={!showContent}
            tabIndex={-1}
            data-auxillaries-testid="auxillaries-active-pane-region"
            data-testid="auxillaries-active-pane-region"
            data-auxillaries-pane-state={showContent ? 'ready' : 'loading'}
          >
            {/*
              No redundant "Active support pane" banner — readiness lives in the
              left selector + audit detail; content starts at the same top edge
              as the selector column.
            */}
            {contentPanel ?? (
              <div className="auxillaries-active-pane-loading" role="status" aria-live="polite">
                Loading active pane.
              </div>
            )}

            <details
              className="auxillaries-audit-detail"
              data-auxillaries-testid="auxillaries-audit-detail"
              data-testid="auxillaries-audit-detail"
            >
              <summary>Audit detail</summary>
              <dl className="auxillaries-audit-detail-grid">
                <div>
                  <dt>Active pane</dt>
                  <dd>{activePaneLabel}</dd>
                </div>
                <div>
                  <dt>Available panes</dt>
                  <dd>{availableStepLabels.length ? availableStepLabels.join(', ') : 'none'}</dd>
                </div>
                <div>
                  <dt>Blocked panes</dt>
                  <dd>{blockedStepLabels.length ? blockedStepLabels.join(', ') : 'none'}</dd>
                </div>
                <div>
                  <dt>Completed panes</dt>
                  <dd>
                    {completedSteps.length
                      ? completedSteps.map((step) => labelForAuxillaryPane(step)).join(', ')
                      : 'none'}
                  </dd>
                </div>
                <div>
                  <dt>Surface</dt>
                  <dd>{mode === 'auxillaries' ? 'Auxillaries support plane' : 'onboarding support plane'}</dd>
                </div>
                <div>
                  <dt>State</dt>
                  <dd>{showContent ? 'ready' : 'loading'}</dd>
                </div>
                <div>
                  <dt>Source safety</dt>
                  <dd>source-safe summary only</dd>
                </div>
              </dl>
            </details>
          </section>
        </main>
      ) : (
        <>
          {!usesTabNavigation ? <div className="orbital-rings-container">{ringElements}</div> : null}
          {contentPanel}
        </>
      )}
    </>
  );
}

export default React.memo(AuxillariesContent);
