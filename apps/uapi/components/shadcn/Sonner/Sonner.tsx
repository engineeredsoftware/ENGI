"use client";

import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { BitcodeStatusIcon } from '@/components/bitcode/icons/StatusIcon/StatusIcon';
import { BitcodePhaseIcon } from '@/components/bitcode/icons/PhaseIcon/PhaseIcon';

// Bitcode-styled Toaster wrapper
// Aesthetic: Dark, glassy surface with neon mint glow accents (#65FEB7 / #67feb7),
// subtle border, and elegant contrast for title/description.
type ToasterProps = {
  position?: 'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right';
  className?: string;
};

export const Toaster: React.FC<ToasterProps> = ({ position = 'bottom-right', className = '' }) => {
  return (
    <SonnerToaster
      position={position}
      richColors
      closeButton
      expand
      // Above Auxillaries/Orbitals full-screen portal (z-index 100) so errors
      // from Disconnect/Refresh are not trapped under the shell.
      className={`!z-[10200] [--toaster-bg:theme(colors.slate.900/.92)] [--toaster-color:theme(colors.slate.100)] [--toaster-border:theme(colors.emerald.400/.25)] [--toaster-shadow:0_0_24px_rgba(101,254,183,0.22),0_0_48px_rgba(101,254,183,0.10)] ${className}`}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
            "bg-[--toaster-bg] text-[--toaster-color] border border-[--toaster-border] shadow-[--toaster-shadow] " +
            "backdrop-blur-md rounded-xl ring-1 ring-emerald-400/10 " +
            "transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out " +
            "data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=open]:slide-in-from-bottom-2",
          title: "text-slate-100 font-medium tracking-wide",
          description: "text-slate-300",
          actionButton:
            "rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 " +
            "hover:bg-emerald-400/20 hover:text-emerald-200 transition-colors",
          cancelButton:
            "rounded-md border border-slate-700/60 bg-transparent text-slate-300 " +
            "hover:text-slate-100 hover:bg-slate-800/40",
          closeButton: "text-slate-400 hover:text-slate-200",
          icon: "",
          success: "",
          error: "",
          warning: "",
          info: "",
          loading: "",
        },
      }}
    />
  );
};

// Bitcode toast helpers for consistent usage across the app
type ToastOptions = {
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
};

const withDurations = (variant: 'info'|'success'|'warning'|'error', opts: ToastOptions) => ({
  duration:
    opts.duration ?? (variant === 'error' ? 6000 : variant === 'warning' ? 5200 : variant === 'success' ? 4200 : 3500),
  ...opts,
});

export const toast = {
  info: (message: string, opts: ToastOptions = {}) =>
    sonnerToast(message, { ...withDurations('info', opts), icon: <BitcodeStatusIcon variant="info" /> }),
  success: (message: string, opts: ToastOptions = {}) =>
    sonnerToast.success(message, { ...withDurations('success', opts), icon: <BitcodeStatusIcon variant="success" /> }),
  error: (message: string, opts: ToastOptions = {}) =>
    sonnerToast.error(message, { ...withDurations('error', opts), icon: <BitcodeStatusIcon variant="error" /> }),
  warning: (message: string, opts: ToastOptions = {}) =>
    (sonnerToast as any).warning
      ? (sonnerToast as any).warning(message, { ...withDurations('warning', opts), icon: <BitcodeStatusIcon variant="warning" /> })
      : sonnerToast(message, { ...withDurations('warning', opts), icon: <BitcodeStatusIcon variant="warning" /> }),
  raw: sonnerToast,
};

// Phase/pipeline-tinted toasts
type Phase = 'setup'|'discovery'|'implementation'|'validation'|'finish';
export const phasePalette: Record<Phase, { variant: 'info'|'success'|'warning'|'error'; }> = {
  setup:          { variant: 'info' },
  discovery:      { variant: 'info' },
  implementation: { variant: 'success' },
  validation:     { variant: 'warning' },
  finish:         { variant: 'info' },
};

export const toastPhase = (
  message: string,
  opts: ToastOptions & { phase: Phase }
) => {
  const { phase, ...rest } = opts;
  const base = withDurations('info', rest);
  const icon = <BitcodePhaseIcon phase={phase} />;
  const v = phasePalette[phase]?.variant || 'info';
  if (v === 'success') return sonnerToast.success(message, { ...base, icon });
  if (v === 'warning') return (sonnerToast as any).warning
    ? (sonnerToast as any).warning(message, { ...base, icon })
    : sonnerToast(message, { ...base, icon });
  if (v === 'error') return sonnerToast.error(message, { ...base, icon });
  return sonnerToast(message, { ...base, icon });
};
