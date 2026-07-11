"use client";

import { toast, toastPhase } from '@/components/shadcn/sonner';

type Phase = 'setup'|'discovery'|'implementation'|'validation'|'finish';
type Level = 'info'|'success'|'warning'|'error';

export type PipelineLogLine = {
  phase: Phase;
  level?: Level;
  message: string;
};

/**
 * Show a toast for a pipeline event/log line with Bitcode phase tinting.
 * Intended to be called from the execution logs subscription.
 */
export function showPipelineEventToast(line: PipelineLogLine) {
  const { phase, level = 'info', message } = line;
  // prefer explicit level handling, otherwise use phase tint
  if (level === 'success') return toast.success(message);
  if (level === 'warning') return toast.warning(message);
  if (level === 'error')   return toast.error(message);
  return toastPhase(message, { phase });
}
