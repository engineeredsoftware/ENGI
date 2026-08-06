type BitcodeQaTelemetryLevel = 'debug' | 'info' | 'log' | 'warn' | 'error' | 'table';

const TELEMETRY_PREFIX = '[Bitcode QA]';

function readBrowserVerboseFlag() {
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('bitcode_verbose') === 'true' || params.get('bitcodeVerbose') === 'true') {
      return true;
    }
  } catch {
    // Ignore URL parsing issues in constrained browser contexts.
  }

  try {
    return (
      window.localStorage.getItem('bitcode.qa.verbose') === 'true' ||
      window.localStorage.getItem('bitcode.verbose') === 'true'
    );
  } catch {
    return false;
  }
}

export function isBitcodeQaTelemetryEnabled() {
  return (
    process.env.NEXT_PUBLIC_BITCODE_QA_VERBOSE === 'true' ||
    process.env.NEXT_PUBLIC_BITCODE_VERBOSE === 'true' ||
    readBrowserVerboseFlag()
  );
}

export function compactBitcodeAddress(address: string | null | undefined, edge = 6) {
  if (!address) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;
  if (trimmed.length <= edge * 2 + 3) return trimmed;
  return `${trimmed.slice(0, edge)}...${trimmed.slice(-edge)}`;
}

export function bitcodeQaTelemetry(
  level: BitcodeQaTelemetryLevel,
  scope: string,
  event: string,
  detail?: unknown,
) {
  if (!isBitcodeQaTelemetryEnabled() || typeof console === 'undefined') return;

  const label = `${TELEMETRY_PREFIX} ${scope}:${event}`;

  if (level === 'table' && typeof console.table === 'function') {
    console.table(detail);
    return;
  }

  const logger =
    level === 'debug'
      ? console.debug
      : level === 'info'
        ? console.info
        : level === 'warn'
          ? console.warn
          : level === 'error'
            ? console.error
            : console.log;

  if (detail === undefined) {
    logger.call(console, label);
    return;
  }

  logger.call(console, label, detail);
}
