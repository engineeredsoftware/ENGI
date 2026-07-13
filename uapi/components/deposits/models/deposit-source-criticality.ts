/**
 * Deposit source-criticality signals for option policy ranking.
 *
 * Source-safe only: labels and severities, never raw path content beyond the
 * depositor-supplied Forced Inclusion list used for pattern warnings.
 */

import type { DepositOptionCriticalitySignal } from "@bitcode/pipeline-asset-pack/deposit-asset-pack-option-policy";

const SENSITIVE_PATH_PATTERN =
  /secret|credential|wallet|auth|key|payment|settlement/iu;

/**
 * Build the default criticality signal set for the deposit route session.
 * Includes a sub-critical depositor intent signal plus an optional warning when
 * Forced Inclusion paths look operationally sensitive.
 */
export function buildDepositSourceCriticalitySignals(
  forcedInclusions: readonly string[],
): DepositOptionCriticalitySignal[] {
  const signals: DepositOptionCriticalitySignal[] = [
    {
      id: "depositor-sub-critical-intent",
      label:
        "Depositor intends this option set to avoid critical source exposure.",
      severity: "sub-critical",
      weight: 0.74,
    },
  ];
  if (forcedInclusions.some((path) => SENSITIVE_PATH_PATTERN.test(path))) {
    signals.push({
      id: "source-path-sensitive-scope-warning",
      label:
        "Forced Inclusion paths include sensitive operational terms requiring review.",
      severity: "warning",
      weight: 0.64,
    });
  }
  return signals;
}
