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

async function loadBitcodeDemonstrationShellModule() {
  const hostReady = await waitForBitcodeDemonstrationHost();
  if (!hostReady) return null;
  return import('../public/app.js');
}

/**
 * @returns {Promise<(() => void) | undefined>}
 */
export async function mountBitcodeDemonstrationShell() {
  globalThis.__BITCODE_DEMONSTRATION_SHELL_AUTOBOOT__ = false;
  const module = await loadBitcodeDemonstrationShellModule();
  if (!module) return undefined;
  if (typeof module.mountBitcodeDemonstrationShell === 'function') {
    return module.mountBitcodeDemonstrationShell();
  }
  return undefined;
}

export async function readBitcodeDemonstrationShellSnapshot() {
  const module = await loadBitcodeDemonstrationShellModule();
  if (!module) return null;
  const snapshotReader = globalThis.__BITCODE_DEMONSTRATION_SHELL_SNAPSHOT__;
  if (typeof snapshotReader === 'function') {
    try {
      return snapshotReader();
    } catch {
      return null;
    }
  }
  return null;
}

export async function readBitcodeDemonstrationShellControls() {
  const module = await loadBitcodeDemonstrationShellModule();
  if (!module) return null;
  const controls = globalThis.__BITCODE_DEMONSTRATION_SHELL_CONTROLS__;
  if (controls && typeof controls === 'object') {
    return controls;
  }
  return null;
}
