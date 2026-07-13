/**
 * Pure formatters for interface admission catalog display.
 */

export function formatAdmissionValue(value: string | undefined | null) {
  return String(value || 'unknown').replace(/[_.-]+/g, ' ');
}

export function formatAdmissionList(values: string[] | undefined, fallback = 'none') {
  if (!Array.isArray(values) || values.length === 0) return fallback;
  return values.map(formatAdmissionValue).join(', ');
}
