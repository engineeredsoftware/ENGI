// @ts-check

/**
 * Canonical Bitcode pointer predicates must keep older generated artifacts
 * green after a later promotion while still rejecting regressed pointers.
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseBitcodeVersionNumber(value) {
  const match = String(value ?? '').trim().match(/^V(\d+)$/u);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

/**
 * @param {unknown} version
 * @param {string} minimumVersion
 * @returns {boolean}
 */
export function bitcodeVersionAtLeast(version, minimumVersion) {
  const versionNumber = parseBitcodeVersionNumber(version);
  const minimumNumber = parseBitcodeVersionNumber(minimumVersion);
  return versionNumber !== null && minimumNumber !== null && versionNumber >= minimumNumber;
}

/**
 * Gate-closure roadmap predicates must keep older closed-gate artifacts green
 * after the roadmap's `Current working gate:` posture advances to a later gate
 * or a later draft version.
 *
 * @param {unknown} roadmap
 * @param {string} minimumVersion
 * @param {number} minimumGateNumber
 * @returns {boolean}
 */
export function roadmapWorkingGatePostureAtLeast(roadmap, minimumVersion, minimumGateNumber) {
  const minimumNumber = parseBitcodeVersionNumber(minimumVersion);
  const versionMatch = String(roadmap ?? '').match(/Current working gate:\s+V(\d+)/u);
  if (minimumNumber === null || !versionMatch) return false;
  const versionNumber = Number.parseInt(versionMatch[1], 10);
  if (versionNumber !== minimumNumber) return versionNumber > minimumNumber;
  const gateMatch = String(roadmap ?? '').match(/Current working gate:\s+V\d+ Gate (\d+)/u);
  return gateMatch !== null && Number.parseInt(gateMatch[1], 10) >= minimumGateNumber;
}
