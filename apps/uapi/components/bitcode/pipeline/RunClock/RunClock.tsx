'use client';

import React, { useEffect, useState } from 'react';

/**
 * Format an elapsed duration as a run clock: 'm:ss' under an hour
 * ('0:07', '4:53'), 'h:mm:ss' from one hour up ('1:04:09'). Negative and
 * non-finite inputs clamp to '0:00'. Pure + exported for unit testing.
 */
export function formatRunClock(elapsedMs: number): string {
  const totalSeconds = Number.isFinite(elapsedMs) ? Math.max(0, Math.floor(elapsedMs / 1000)) : 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${minutes}:${two(seconds)}`;
}

interface RunClockProps {
  /** Run start (ms since epoch) — typically the first event's created_at. */
  startedAtMs: number | null;
  /** Ticks once a second while true; freezes when it flips false. */
  running: boolean;
  /** Optional authoritative end (e.g. the completion event's created_at). */
  endedAtMs?: number | null;
  className?: string;
}

/**
 * TOTAL RUN TIME clock: ticks once a second while the run is processing and
 * freezes on completion/error (at `endedAtMs` when known, else at the last
 * tick).
 */
export function RunClock({ startedAtMs, running, endedAtMs, className = '' }: RunClockProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (startedAtMs === null || !Number.isFinite(startedAtMs)) return null;

  const endMs = running ? nowMs : endedAtMs ?? nowMs;
  return (
    <span className={`tabular-nums ${className}`} data-testid="telemetry-run-clock" title="Total run time">
      {formatRunClock(endMs - startedAtMs)}
    </span>
  );
}
