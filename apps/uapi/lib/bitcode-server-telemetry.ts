type BitcodeServerTelemetryLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

const TELEMETRY_PREFIX = '[Bitcode QA Server]';
/** Always-on lifecycle logs (install claim, auth critical paths) — not gated on QA verbose. */
const LIFECYCLE_PREFIX = '[Bitcode Server]';

export function isBitcodeServerTelemetryEnabled() {
  return (
    process.env.BITCODE_QA_VERBOSE === 'true' ||
    process.env.BITCODE_VERBOSE === 'true' ||
    process.env.NEXT_PUBLIC_BITCODE_QA_VERBOSE === 'true' ||
    process.env.NEXT_PUBLIC_BITCODE_VERBOSE === 'true'
  );
}

export function compactBitcodeServerId(value: string | null | undefined, edge = 6) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length <= edge * 2 + 3) return trimmed;
  return `${trimmed.slice(0, edge)}...${trimmed.slice(-edge)}`;
}

function resolveLogger(level: BitcodeServerTelemetryLevel) {
  return level === 'debug'
    ? console.debug
    : level === 'info'
      ? console.info
      : level === 'warn'
        ? console.warn
        : level === 'error'
          ? console.error
          : console.log;
}

export function bitcodeServerTelemetry(
  level: BitcodeServerTelemetryLevel,
  scope: string,
  event: string,
  detail?: unknown,
) {
  if (!isBitcodeServerTelemetryEnabled()) return;

  const label = `${TELEMETRY_PREFIX} ${scope}:${event}`;
  const logger = resolveLogger(level);

  if (detail === undefined) {
    logger.call(console, label);
    return;
  }

  logger.call(console, label, detail);
}

/**
 * Always-on server lifecycle telemetry for production triage.
 * Use for GitHub install/claim and similar fail-closed identity paths.
 * Still source-safe: callers must not pass secrets/tokens/PEMs.
 * `debug` remains gated so noisy success traces stay optional.
 */
export function bitcodeServerLifecycleTelemetry(
  level: Exclude<BitcodeServerTelemetryLevel, 'debug' | 'log'>,
  scope: string,
  event: string,
  detail?: unknown,
) {
  const label = `${LIFECYCLE_PREFIX} ${scope}:${event}`;
  const logger = resolveLogger(level);

  if (detail === undefined) {
    logger.call(console, label);
    return;
  }

  logger.call(console, label, detail);

  // Mirror into verbose QA channel when enabled so local QA sees one stream.
  if (isBitcodeServerTelemetryEnabled()) {
    bitcodeServerTelemetry(level, scope, event, detail);
  }
}
