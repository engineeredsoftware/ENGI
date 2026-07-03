/**
 * normalizeStepName - shared helper for mapping raw step identifiers into the
 * canonical PTRR vocabulary used across Bitcode surfaces (logs, dashboards, tests).
 *
 * Historically this lived inside the uapi execution UI, but multiple packages
 * – including the conversations overlay and jest suites – now depend on a
 * stable export from @bitcode/agent-generics.  This module provides that single
 * source of truth so both runtime code and tests stay aligned.
 */

export function normalizeStepName(step?: string): string {
  if (!step) return '';

  const lower = step.toLowerCase();

  if (lower.includes('plan')) return 'Plan';
  // 'retry' must be tested before 'try': 'retry'.includes('try') is true, so
  // the broader match would relabel every Retry step as Try.
  if (lower.includes('retry')) return 'Retry';
  if (lower.includes('try')) return 'Try';
  if (lower.includes('refine')) return 'Refine';
  if (lower.includes('generate')) return 'Try';
  if (lower.includes('intensify')) return 'Retry';

  if (lower.includes('initialize')) return 'Initialize';
  if (lower.includes('setup')) return 'Setup';
  if (lower.includes('discovery')) return 'Discovery';
  if (lower.includes('implementation')) return 'Implementation';
  if (lower.includes('validation')) return 'Validation';
  if (lower.includes('finish')) return 'Finish';

  return step.charAt(0).toUpperCase() + step.slice(1);
}

export default normalizeStepName;
