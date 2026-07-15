/** Portable source of truth also at @bitcode/observability/product-analytics. */
/*
 * Bitcode product analytics — the ONE audited path for custom analytics
 * events. Every event fans out to Vercel Web Analytics (`track`) and GA4
 * (`trackEvent`), so both dashboards carry the same funnel under the same
 * event names.
 *
 * Source-safety law (V48 Gate 3, 2026-07-05): analytics events leave Bitcode
 * for third-party dashboards, so payloads are FLAT source-safe scalars —
 * counts, booleans, enum states, and durations ONLY. Never repository
 * names/paths, obfuscation or prompt text, option contents or measurements,
 * wallet material, or user/run identifiers. The typed union below is the
 * enforcement surface: add new events here, never call `track` directly.
 */

import { track } from "@vercel/analytics";
import { trackEvent } from "@bitcode/external-telemetry-google";

/** Where a dispatched synthesis run failed. */
export type DepositSynthesisFailureStage =
  /** The dispatch request itself was rejected. */
  | "dispatch"
  /** The run streamed/settled a terminal failure while executing. */
  | "run"
  /** The run completed but its persisted synthesis could not be resumed. */
  | "resume";

export type ProductEvent =
  /** Landing CTA — the baseline acquisition event (no identifiers). */
  | {
      name: "landing_use_bitcode_click";
      data: { signedIn: boolean; onboarded: boolean };
    }
  /** A repository source is selected on /deposits (provider + pin shape only). */
  | {
      name: "deposit_source_selected";
      data: { provider: string; pinnedBranch: boolean; pinnedCommit: boolean };
    }
  /** A synthesis run was dispatched (input shape only — never input text). */
  | {
      name: "deposit_synthesis_dispatched";
      data: {
        hasObfuscations: boolean;
        /** Forced Inclusion path count (scope shape only). */
        forcedInclusionCount: number;
        forcedExclusionCount: number;
        demandSignalCount: number;
      };
    }
  /** A run dispatched in this session resumed its synthesized options. */
  | {
      name: "deposit_synthesis_completed";
      data: { optionCount: number; durationMs: number };
    }
  /** A run dispatched in this session failed. */
  | {
      name: "deposit_synthesis_failed";
      data: { stage: DepositSynthesisFailureStage; durationMs: number | null };
    }
  /** A running synthesis was cancelled by the depositor (no identifiers). */
  | {
      name: "deposit_synthesis_cancelled";
      data: { durationMs: number | null };
    }
  /** A per-option review decision (enum state only — never option contents). */
  | {
      name: "deposit_option_review";
      data: { decision: string; admitted: boolean };
    }
  /** The batch deposit action — selected vs actually admitted counts. */
  | {
      name: "deposit_admission";
      data: { selectedCount: number; admittedCount: number };
    };

/**
 * Fire a product event to both analytics stacks. Analytics must never break
 * the product surface: every tracker call is swallowed on failure, and the
 * whole function no-ops outside the browser.
 */
export function trackProductEvent(event: ProductEvent): void {
  if (typeof window === "undefined") return;
  try {
    track(event.name, event.data);
  } catch {
    // Vercel Analytics unavailable (blocked script, test env) — ignore.
  }
  try {
    trackEvent(event.name, { event_category: "product", ...event.data });
  } catch {
    // GA wrapper already swallows internally; guard against surprises.
  }
}
