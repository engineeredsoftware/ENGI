/**
 * Relocated from app/terminal/demonstration-witness-runtime.ts.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */

'use client';

export type BitcodeDemonstrationShellSnapshot = Record<string, any> | null;

export type BitcodeDemonstrationShellControlSet = Record<
  string,
  ((...args: unknown[]) => unknown | Promise<unknown>) | undefined
> | null;

type BitcodeDemonstrationModule = {
  mountBitcodeDemonstrationShell?: () => (() => void) | undefined;
};

type BitcodeDemonstrationGlobal = typeof globalThis & {
  __BITCODE_DEMONSTRATION_SHELL_AUTOBOOT__?: boolean;
  __BITCODE_DEMONSTRATION_SHELL_SNAPSHOT__?: () => unknown;
  __BITCODE_DEMONSTRATION_SHELL_CONTROLS__?: Record<
    string,
    ((...args: unknown[]) => unknown | Promise<unknown>) | undefined
  >;
};

const BITCODE_DEMONSTRATION_WITNESS_SCRIPT_HREF = ''; // protocol-demonstration removed; witness script disabled

async function waitForBitcodeDemonstrationHost() {
  if (typeof document === 'undefined') return false;

  for (let index = 0; index < 12; index += 1) {
    if (document.getElementById('bitcodeDemonstrationRoot') && document.getElementById('heroEyebrow')) {
      return true;
    }

    await new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve(undefined));
    });
  }

  return false;
}

async function loadBitcodeDemonstrationWitnessModule(): Promise<BitcodeDemonstrationModule | null> {
  if (!BITCODE_DEMONSTRATION_WITNESS_SCRIPT_HREF) return null;
  const hostReady = await waitForBitcodeDemonstrationHost();
  if (!hostReady) return null;

  (globalThis as BitcodeDemonstrationGlobal).__BITCODE_DEMONSTRATION_SHELL_AUTOBOOT__ = false;
  const scriptHref = BITCODE_DEMONSTRATION_WITNESS_SCRIPT_HREF;
  return import(/* webpackIgnore: true */ scriptHref) as Promise<BitcodeDemonstrationModule>;
}

export async function mountBitcodeDemonstrationShell() {
  const module = await loadBitcodeDemonstrationWitnessModule();
  return module?.mountBitcodeDemonstrationShell?.();
}

export async function readBitcodeDemonstrationShellSnapshot(): Promise<BitcodeDemonstrationShellSnapshot> {
  await loadBitcodeDemonstrationWitnessModule();
  const snapshotReader = (globalThis as BitcodeDemonstrationGlobal).__BITCODE_DEMONSTRATION_SHELL_SNAPSHOT__;
  if (typeof snapshotReader !== 'function') return null;

  try {
    return snapshotReader() as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function readBitcodeDemonstrationShellControls(): Promise<BitcodeDemonstrationShellControlSet> {
  await loadBitcodeDemonstrationWitnessModule();
  const controls = (globalThis as BitcodeDemonstrationGlobal).__BITCODE_DEMONSTRATION_SHELL_CONTROLS__;
  return controls && typeof controls === 'object' ? controls : null;
}
