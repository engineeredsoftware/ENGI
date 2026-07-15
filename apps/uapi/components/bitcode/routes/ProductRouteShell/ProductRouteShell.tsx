"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import {
  ProductEntranceItem,
  ProductRouteEntrance,
} from "@/components/bitcode/routes/ProductRouteEntrance/ProductRouteEntrance";
import {
  AlertCircle,
  CircleDashed,
  Command,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

/**
 * Product surface tints (secondary page wash). Brand primary remains Bitcode
 * emerald green everywhere else (nav, CTAs, logo).
 * - emerald → Packs (primary green secondary wash)
 * - violet → Deposits (purple)
 * - orange → Reads
 * - sky → retained for non-product panels
 */
type ProductRouteTone = "emerald" | "sky" | "violet" | "orange";

// Section (b) generic copy for the shell's rich tooltips.
const ROUTE_METRIC_TOOLTIP_GENERIC =
  "Route metrics are the compact live posture of this page's session, rendered as chips in the route header.";
const ROUTE_PANEL_TOOLTIP_GENERIC =
  "Panels group related source-safe state; expanding the disclosure shows the full detail.";
const PROOF_ROOT_TOOLTIP_GENERIC =
  "Proof roots are source-safe hashes anchoring measurements into proof readback — auditable without revealing withheld content.";
const SHELL_TOOLTIP_CANON = [
  "BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws",
];
const ROUTE_METRIC_TOOLTIP_SECTIONS = {
  points: [
    "Read the session's posture without leaving the header",
    "Spot a blocked stage (authority, options, admissions) at a glance",
  ],
  references: {
    source: ["apps/uapi/components/bitcode/routes/product-route-shell.tsx"],
    canon: SHELL_TOOLTIP_CANON,
  },
};
const ROUTE_PANEL_TOOLTIP_SECTIONS = {
  points: [
    "Expand the disclosure to read the full source-safe detail",
    "Hover the rows inside for their own explanations",
  ],
  references: {
    source: ["apps/uapi/components/bitcode/routes/product-route-shell.tsx"],
    canon: SHELL_TOOLTIP_CANON,
  },
};
const PROOF_ROOT_TOOLTIP_SECTIONS = {
  points: [
    "Verify a measurement against proof readback by its root",
    "Cite the root in reviews without exposing withheld content",
  ],
  references: {
    source: ["apps/uapi/components/bitcode/routes/product-route-shell.tsx"],
    canon: SHELL_TOOLTIP_CANON,
  },
};

type ToneClasses = {
  page: string;
  headerBorder: string;
  eyebrow: string;
  activeStep: string;
  inactiveStep: string;
  focusRing: string;
  panelAccent: string;
};

const TONE_CLASSES: Record<ProductRouteTone, ToneClasses> = {
  emerald: {
    page: "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#050915_0%,#02050d_100%)]",
    headerBorder: "border-emerald-300/15",
    eyebrow: "text-emerald-200/80",
    activeStep:
      "border-emerald-300/38 bg-emerald-300/12 shadow-[0_0_24px_rgba(16,185,129,0.12)]",
    inactiveStep:
      "border-white/10 bg-white/[0.035] hover:border-emerald-300/24 hover:bg-emerald-300/[0.06]",
    focusRing: "focus-visible:ring-emerald-300/55",
    panelAccent:
      "border-emerald-300/15 bg-emerald-300/[0.04] text-emerald-100/85",
  },
  sky: {
    page: "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),linear-gradient(180deg,#050915_0%,#02050d_100%)]",
    headerBorder: "border-sky-300/15",
    eyebrow: "text-sky-200/80",
    activeStep:
      "border-sky-300/38 bg-sky-300/12 shadow-[0_0_24px_rgba(56,189,248,0.12)]",
    inactiveStep:
      "border-white/10 bg-white/[0.035] hover:border-sky-300/24 hover:bg-sky-300/[0.06]",
    focusRing: "focus-visible:ring-sky-300/55",
    panelAccent: "border-sky-300/15 bg-sky-300/[0.04] text-sky-100/85",
  },
  violet: {
    page: "bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.16),transparent_30%),linear-gradient(180deg,#050915_0%,#02050d_100%)]",
    headerBorder: "border-violet-300/18",
    eyebrow: "text-violet-200/85",
    activeStep:
      "border-violet-300/38 bg-violet-300/12 shadow-[0_0_24px_rgba(167,139,250,0.14)]",
    inactiveStep:
      "border-white/10 bg-white/[0.035] hover:border-violet-300/24 hover:bg-violet-300/[0.06]",
    focusRing: "focus-visible:ring-violet-300/55",
    panelAccent: "border-violet-300/15 bg-violet-300/[0.04] text-violet-100/85",
  },
  orange: {
    page: "bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_30%),linear-gradient(180deg,#050915_0%,#02050d_100%)]",
    headerBorder: "border-orange-300/18",
    eyebrow: "text-orange-200/85",
    activeStep:
      "border-orange-300/40 bg-orange-300/12 shadow-[0_0_24px_rgba(251,146,60,0.14)]",
    inactiveStep:
      "border-white/10 bg-white/[0.035] hover:border-orange-300/26 hover:bg-orange-300/[0.06]",
    focusRing: "focus-visible:ring-orange-300/55",
    panelAccent: "border-orange-300/16 bg-orange-300/[0.05] text-orange-50/90",
  },
};

export type ProductRouteMetric = {
  label: string;
  value: React.ReactNode;
  /** Rich-tooltip body shown on hover over the header chip. */
  description?: string;
};

export type ProductRouteStep<StepId extends string = string> = {
  id: StepId;
  label: string;
  state: string;
  lowDetailGuidance?: string;
};

type ProductRouteShellProps = {
  testId: string;
  tone: ProductRouteTone;
  label: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  metrics: ProductRouteMetric[];
  children: React.ReactNode;
};

export function ProductRouteShell({
  testId,
  tone,
  label,
  title,
  summary,
  icon: Icon,
  metrics,
  children,
}: ProductRouteShellProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <main
      data-testid={testId}
      className={`min-h-screen overflow-x-clip ${toneClasses.page} px-3 pb-20 pt-28 text-neutral-100 phone:px-4 phone:pb-24 phone:pt-32 tablet:px-6 laptop:px-8 desktop:px-8`}
    >
      <ProductRouteEntrance className="mx-auto grid w-full min-w-0 max-w-[1800px] gap-4 phone:gap-5">
        {/* Compact route header — title + wrapping metric chips (phone stacks;
            tablet+ title left / chips right). Shared by Packs / Reads / Deposits. */}
        <ProductEntranceItem
          as="header"
          className={`grid min-w-0 items-center gap-x-4 gap-y-3 border ${toneClasses.headerBorder} bg-[linear-gradient(135deg,rgba(7,14,26,0.96),rgba(4,9,18,0.92))] px-3 py-3 shadow-[0_30px_100px_rgba(0,0,0,0.34)] phone:px-5 phone:py-3.5 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:min-h-[5.75rem] tablet:gap-x-6`}
        >
          <div className="min-w-0">
            <p
              className={`flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.3em] ${toneClasses.eyebrow}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {label}
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-white phone:text-xl tablet:text-2xl">
              {title}
            </h1>
            <p className="mt-1 line-clamp-3 max-w-3xl text-xs leading-5 text-neutral-400 phone:line-clamp-2 tablet:text-sm">
              {summary}
            </p>
          </div>
          <dl className="flex max-w-full flex-wrap items-center justify-start gap-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-neutral-300 tablet:max-w-[min(42rem,52vw)] tablet:justify-end">
            {metrics.map((metric) => {
              const chipBody = (
                <>
                  <dt className="text-neutral-500">{metric.label}</dt>
                  <dd className="max-w-[9rem] truncate text-[0.7rem] font-semibold text-white phone:max-w-none">
                    {metric.value}
                  </dd>
                </>
              );
              const chipClass =
                "flex min-w-0 shrink-0 items-baseline gap-1.5 border border-white/10 bg-white/[0.045] px-2 py-1";
              return metric.description ? (
                <TelemetryExplainerTrigger
                  key={metric.label}
                  as="div"
                  className={chipClass}
                  explainer={{
                    kicker: "Route metric",
                    title: metric.label,
                    specific: metric.description,
                    generic: ROUTE_METRIC_TOOLTIP_GENERIC,
                    ...ROUTE_METRIC_TOOLTIP_SECTIONS,
                  }}
                >
                  {chipBody}
                </TelemetryExplainerTrigger>
              ) : (
                <div key={metric.label} className={chipClass}>
                  {chipBody}
                </div>
              );
            })}
          </dl>
        </ProductEntranceItem>
        <ProductEntranceItem className="grid min-w-0 gap-5">
          {children}
        </ProductEntranceItem>
      </ProductRouteEntrance>
    </main>
  );
}

type ProductRouteStepGridProps<StepId extends string> = {
  ariaLabel: string;
  activeStepId: StepId;
  steps: ProductRouteStep<StepId>[];
  tone: ProductRouteTone;
  testIdPrefix: string;
  stateDataAttribute: string;
  onSelect: (stepId: StepId) => void;
  /** Denser cards: smaller height/padding and no guidance text. */
  compact?: boolean;
};

export function ProductRouteStepGrid<StepId extends string>({
  ariaLabel,
  activeStepId,
  steps,
  tone,
  testIdPrefix,
  stateDataAttribute,
  onSelect,
  compact = false,
}: ProductRouteStepGridProps<StepId>) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <section
      className="grid grid-cols-1 gap-3 phone:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-5"
      aria-label={ariaLabel}
    >
      {steps.map((step) => {
        const active = step.id === activeStepId;
        const stateAttribute = { [stateDataAttribute]: step.state };
        return (
          <button
            type="button"
            key={step.id}
            data-testid={`${testIdPrefix}-${step.id}`}
            aria-current={active ? "step" : undefined}
            onClick={() => onSelect(step.id)}
            className={`min-w-0 border text-left outline-none transition focus-visible:ring-2 ${
              compact ? "px-3 py-2.5" : "min-h-[7.5rem] px-3 py-3 phone:min-h-[9rem] phone:px-4 phone:py-4"
            } ${toneClasses.focusRing} ${
              active ? toneClasses.activeStep : toneClasses.inactiveStep
            }`}
            {...stateAttribute}
          >
            <span className="text-[0.6rem] uppercase tracking-[0.18em] text-neutral-500">
              {step.state}
            </span>
            <span
              className={`block font-semibold text-neutral-100 ${
                compact ? "mt-1 text-xs" : "mt-2 text-sm"
              }`}
            >
              {step.label}
            </span>
            {!compact && step.lowDetailGuidance ? (
              <span className="mt-2 block text-xs leading-5 text-neutral-400">
                {step.lowDetailGuidance}
              </span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}

type ProductRouteStatePanelProps = {
  variant: "loading" | "empty" | "error";
  title: string;
  message: string;
  compact?: boolean;
};

export function ProductRouteStatePanel({
  variant,
  title,
  message,
  compact = false,
}: ProductRouteStatePanelProps) {
  const Icon =
    variant === "error"
      ? AlertCircle
      : variant === "loading"
        ? CircleDashed
        : ShieldCheck;
  const colorClass =
    variant === "error"
      ? "border-red-300/20 bg-red-300/10 text-red-100"
      : "border-white/10 bg-black/20 text-neutral-300";

  return (
    <div
      className={`border ${colorClass} ${compact ? "px-3 py-3" : "px-4 py-5"}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-4 w-4 ${variant === "loading" ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-current">{title}</p>
          <p className="mt-1 text-xs leading-5 text-current/80">{message}</p>
        </div>
      </div>
    </div>
  );
}

type ProductRouteDisclosureProps = {
  title: string;
  tone: ProductRouteTone;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  /**
   * Empty / non-interactive bar (no expand). Used for Opportunity roots,
   * blockers, and proof detail when there is nothing to show.
   */
  empty?: boolean;
  /** Rich-tooltip body shown on hover over the summary line (ignored when empty). */
  summaryDescription?: string;
};

export function ProductRouteDisclosure({
  title,
  tone,
  children,
  defaultOpen = false,
  empty = false,
  summaryDescription,
}: ProductRouteDisclosureProps) {
  const toneClasses = TONE_CLASSES[tone];

  if (empty) {
    return (
      <div
        className={`border px-3 py-3 opacity-45 ${toneClasses.panelAccent}`}
        aria-disabled="true"
        data-disclosure-state="empty"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.16em] text-current/80">
          {title}
        </p>
      </div>
    );
  }

  return (
    <details
      className={`border px-3 py-3 ${toneClasses.panelAccent}`}
      open={defaultOpen}
    >
      <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em]">
        {summaryDescription ? (
          <TelemetryExplainerTrigger
            explainer={{
              kicker: "Panel",
              title,
              specific: summaryDescription,
              generic: ROUTE_PANEL_TOOLTIP_GENERIC,
              ...ROUTE_PANEL_TOOLTIP_SECTIONS,
            }}
          >
            {title}
          </TelemetryExplainerTrigger>
        ) : (
          title
        )}
      </summary>
      <div className="mt-2 text-xs leading-5 text-neutral-300">{children}</div>
    </details>
  );
}

export type ProductRouteEnterpriseMetric = {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  state?: string;
};

type ProductRouteEnterpriseSummaryProps = {
  title: string;
  eyebrow?: string;
  tone: ProductRouteTone;
  metrics: ProductRouteEnterpriseMetric[];
  testId?: string;
};

export function ProductRouteEnterpriseSummary({
  title,
  eyebrow = "Enterprise operation",
  tone,
  metrics,
  testId,
}: ProductRouteEnterpriseSummaryProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <section
      data-testid={testId}
      data-enterprise-ux="economic-summary"
      className={`border ${toneClasses.headerBorder} bg-white/[0.035] px-4 py-4`}
      aria-label={title}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-[0.64rem] uppercase tracking-[0.22em] ${toneClasses.eyebrow}`}>
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 phone:grid-cols-2 laptop:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-h-[6.5rem] min-w-0 border border-white/10 bg-black/20 px-3 py-3"
          >
            <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-neutral-500">
              {metric.label}
            </dt>
            <dd className="mt-2 break-words text-sm font-semibold text-neutral-100">
              {metric.value}
            </dd>
            {metric.state ? (
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
                {metric.state}
              </p>
            ) : null}
            {metric.description ? (
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                {metric.description}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

export type ProductRouteKeyboardShortcut = {
  keys: string;
  label: string;
};

type ProductRouteKeyboardHintProps = {
  shortcuts: ProductRouteKeyboardShortcut[];
  tone: ProductRouteTone;
  testId?: string;
};

export function ProductRouteKeyboardHint({
  shortcuts,
  tone,
  testId,
}: ProductRouteKeyboardHintProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <aside
      data-testid={testId}
      data-enterprise-ux="keyboard-navigation"
      className={`border px-3 py-3 ${toneClasses.panelAccent}`}
      aria-label="Keyboard navigation"
    >
      <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em]">
        <KeyboardIcon />
        Keyboard
      </div>
      <ul className="mt-2 grid gap-2 text-xs leading-5 text-neutral-300">
        {shortcuts.map((shortcut) => (
          <li
            key={`${shortcut.keys}:${shortcut.label}`}
            className="flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <kbd className="border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[0.65rem] text-neutral-100">
              {shortcut.keys}
            </kbd>
            <span>{shortcut.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function KeyboardIcon() {
  return (
    <span className="relative inline-flex h-4 w-4 items-center justify-center">
      <KeyRound className="absolute h-4 w-4 opacity-80" aria-hidden="true" />
      <Command className="h-2.5 w-2.5 opacity-70" aria-hidden="true" />
    </span>
  );
}

export type ProductRouteProofRoot = {
  id: string;
  label: string;
  root: string | null | undefined;
  /** Rich-tooltip body shown on hover over the root row. */
  description?: string;
};

type ProductRouteProofDetailProps = {
  title: string;
  tone: ProductRouteTone;
  roots: ProductRouteProofRoot[];
  emptyMessage?: string;
  defaultOpen?: boolean;
  testId?: string;
};

export function ProductRouteProofDetail({
  title,
  tone,
  roots,
  emptyMessage = "No source-safe proof roots recorded.",
  defaultOpen = false,
  testId,
}: ProductRouteProofDetailProps) {
  const visibleRoots = roots.filter((root) => Boolean(root.root));
  const isEmpty = visibleRoots.length === 0;

  if (isEmpty) {
    return (
      <div data-testid={testId} data-enterprise-ux="expandable-proof-detail">
        <ProductRouteDisclosure title={title} tone={tone} empty />
        <span className="sr-only">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <ProductRouteDisclosure title={title} tone={tone} defaultOpen={defaultOpen}>
      <div
        data-testid={testId}
        data-enterprise-ux="expandable-proof-detail"
        className="grid gap-2"
      >
        {visibleRoots.map((proofRoot) => {
          const rowBody = (
            <>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
                {proofRoot.label}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-neutral-100">
                {proofRoot.root}
              </p>
            </>
          );
          const rowClass = "border-b border-white/10 px-0 py-2 last:border-b-0";
          return proofRoot.description ? (
            <TelemetryExplainerTrigger
              key={`${proofRoot.id}:${proofRoot.root}`}
              as="div"
              className={rowClass}
              explainer={{
                kicker: "Proof root",
                title: proofRoot.label,
                specific: proofRoot.description,
                generic: PROOF_ROOT_TOOLTIP_GENERIC,
                ...PROOF_ROOT_TOOLTIP_SECTIONS,
              }}
            >
              {rowBody}
            </TelemetryExplainerTrigger>
          ) : (
            <div key={`${proofRoot.id}:${proofRoot.root}`} className={rowClass}>
              {rowBody}
            </div>
          );
        })}
      </div>
    </ProductRouteDisclosure>
  );
}
