/**
 * Pure formatters for Externals pane provider readiness and root readouts.
 */

export function formatProviderClass(value: unknown) {
  return typeof value === 'string' && value.trim()
    ? value.replace(/_/g, ' ')
    : 'unknown';
}

export function compactRoot(value: unknown) {
  return typeof value === 'string' && value.length > 12
    ? `${value.slice(0, 8)}...${value.slice(-6)}`
    : typeof value === 'string'
      ? value
      : 'unavailable';
}
