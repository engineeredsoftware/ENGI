// @ts-check

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ACTIVE_CANON_VERSION,
  ACTIVE_PROVEN_APPENDIX_PATH,
  CURRENT_CANON_OPERATOR_LABEL,
  CURRENT_CANON_POSTURE,
  CURRENT_POLICY_REF,
  CURRENT_SPEC_VERSION_LABEL,
  DRAFT_TARGET_VERSION
} from '../canon-posture.js';
import { buildInitialState, publicState } from '../bitcode-demo.js';
import { buildV21GeneratedArtifactContents } from './v21-specifying.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DEFAULT_V22_CANON_POSTURE_REPO_ROOT = path.resolve(__dirname, '../../../..');
export const V22_CANON_POSTURE_REPORT_ID = 'v22-canon-posture-drift-report';
export const V22_CANON_POSTURE_GENERATOR_ID = 'bitcode.v22-canon-posture.v1';
export const V23_CANON_POSTURE_REPORT_ID = 'v23-canon-posture-drift-report';
export const V23_CANON_POSTURE_GENERATOR_ID = 'bitcode.v23-canon-posture.v1';
export const V24_CANON_POSTURE_REPORT_ID = 'v24-canon-posture-drift-report';
export const V24_CANON_POSTURE_GENERATOR_ID = 'bitcode.v24-canon-posture.v1';
export const V25_CANON_POSTURE_REPORT_ID = 'v25-canon-posture-drift-report';
export const V25_CANON_POSTURE_GENERATOR_ID = 'bitcode.v25-canon-posture.v1';

/**
 * @param {Array<{ checkId: string, passed: boolean, detail: string }>} checks
 * @param {string} checkId
 * @param {boolean} passed
 * @param {string} detail
 */
function pushCheck(checks, checkId, passed, detail) {
  checks.push({ checkId, passed, detail });
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * @param {string} activeCanonVersion
 * @param {string} [draftTargetVersion='']
 * @returns {'ENGI' | 'Bitcode'}
 */
function projectLabel(activeCanonVersion, draftTargetVersion = '') {
  const activeNumeric = Number.parseInt(String(activeCanonVersion || '').replace(/^V/u, ''), 10);
  const draftNumeric = Number.parseInt(String(draftTargetVersion || '').replace(/^V/u, ''), 10);
  return (Number.isInteger(activeNumeric) && activeNumeric >= 25)
    || (Number.isInteger(draftNumeric) && draftNumeric >= 25)
    ? 'Bitcode'
    : 'ENGI';
}

/**
 * @param {string} activeCanonVersion
 * @param {string} [draftTargetVersion='']
 * @returns {string}
 */
function specFamilyPrefix(activeCanonVersion, draftTargetVersion = '') {
  return projectLabel(activeCanonVersion, draftTargetVersion) === 'Bitcode' ? 'BITCODE_SPEC' : 'ENGI_SPEC';
}

/**
 * @param {string} repoRoot
 * @param {string} activeCanonVersion
 * @param {string} [draftTargetVersion='']
 * @returns {string}
 */
function resolveSpecPointerFilename(repoRoot, activeCanonVersion, draftTargetVersion = '') {
  const preferred = `${specFamilyPrefix(activeCanonVersion, draftTargetVersion)}.txt`;
  if (existsSync(path.join(repoRoot, preferred))) return preferred;

  const fallback = preferred === 'BITCODE_SPEC.txt' ? 'ENGI_SPEC.txt' : 'BITCODE_SPEC.txt';
  if (existsSync(path.join(repoRoot, fallback))) return fallback;

  return preferred;
}

/**
 * @param {{
 *   repoRoot?: string,
 *   version?: string,
 *   activeCanonVersion?: string,
 *   draftTargetVersion?: string,
 *   proofSourceCommit?: string,
 *   generatedAt?: string,
 *   generatorId?: string,
 *   worktreeState?: string
 * }} [input={}]
 */
export function buildCanonPostureDriftReport({
  repoRoot = DEFAULT_V22_CANON_POSTURE_REPO_ROOT,
  version = 'V22',
  activeCanonVersion = ACTIVE_CANON_VERSION,
  draftTargetVersion = DRAFT_TARGET_VERSION,
  proofSourceCommit = 'unbound-preview',
  generatedAt = new Date().toISOString(),
  generatorId = `bitcode.${version.toLowerCase()}-canon-posture.v1`,
  worktreeState = 'clean'
} = {}) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const activeSpecFamilyPrefix = specFamilyPrefix(activeCanonVersion, draftTargetVersion);
  const pointerFilename = resolveSpecPointerFilename(resolvedRepoRoot, activeCanonVersion, draftTargetVersion);
  const activeProvenAppendixPath = `${activeSpecFamilyPrefix}_${activeCanonVersion}_PROVEN.md`;
  const pointerVersion = readFileSync(path.join(resolvedRepoRoot, pointerFilename), 'utf8').trim();
  // V48: protocol-demonstration removed. Canon-posture drift is owned by packages/specifying.
  const specifyingReadmePath = path.join(resolvedRepoRoot, 'packages', 'specifying', 'README.md');
  const specifyingCanonPosturePath = path.join(resolvedRepoRoot, 'packages', 'specifying', 'src', 'canon-posture.js');
  const specifyingPackagePath = path.join(resolvedRepoRoot, 'packages', 'specifying', 'package.json');
  const specifyingIndexPath = path.join(resolvedRepoRoot, 'packages', 'specifying', 'src', 'index.js');
  const specifyingReadmeContent = readFileSync(specifyingReadmePath, 'utf8');
  const specifyingCanonPostureContent = readFileSync(specifyingCanonPosturePath, 'utf8');
  const specifyingPackageContent = readFileSync(specifyingPackagePath, 'utf8');
  const specifyingIndexContent = readFileSync(specifyingIndexPath, 'utf8');
  const activeProjectLabel = projectLabel(activeCanonVersion, draftTargetVersion);

  const initialState = buildInitialState();
  const projectedState = publicState(initialState, 'public');

  /** @type {Array<{ checkId: string, passed: boolean, detail: string }>} */
  const checks = [];

  pushCheck(
    checks,
    'pointer-active-canon-alignment',
    pointerVersion === activeCanonVersion,
    `${pointerFilename} points to ${pointerVersion || 'none'} while runtime expects ${activeCanonVersion}.`
  );
  pushCheck(
    checks,
    'canon-posture-constant-alignment',
    CURRENT_CANON_POSTURE.activeCanonVersion === activeCanonVersion
      && CURRENT_CANON_POSTURE.draftTargetVersion === draftTargetVersion
      && CURRENT_CANON_POSTURE.operatorLabel === CURRENT_CANON_OPERATOR_LABEL
      && CURRENT_CANON_POSTURE.specVersionLabel === CURRENT_SPEC_VERSION_LABEL,
    `canon-posture constants resolve ${CURRENT_CANON_POSTURE.activeCanonVersion}/${CURRENT_CANON_POSTURE.draftTargetVersion} with operator label ${CURRENT_CANON_OPERATOR_LABEL}.`
  );
  pushCheck(
    checks,
    'proven-appendix-alignment',
    ACTIVE_PROVEN_APPENDIX_PATH === activeProvenAppendixPath
      && CURRENT_CANON_POSTURE.activeProvenAppendixPath === ACTIVE_PROVEN_APPENDIX_PATH,
    `active generated appendix path is ${ACTIVE_PROVEN_APPENDIX_PATH}.`
  );
  pushCheck(
    checks,
    'policy-ref-alignment',
    CURRENT_POLICY_REF === `policy://bitcode/spec-${activeCanonVersion.toLowerCase()}-active-${draftTargetVersion.toLowerCase()}-system-draft/current`
      && CURRENT_CANON_POSTURE.policyRef === CURRENT_POLICY_REF,
    `policy reference is ${CURRENT_POLICY_REF}.`
  );
  pushCheck(
    checks,
    'runtime-state-alignment',
    initialState.specVersion === CURRENT_SPEC_VERSION_LABEL
      && initialState.canonPosture?.activeCanonVersion === activeCanonVersion
      && initialState.canonPosture?.draftTargetVersion === draftTargetVersion,
    `buildInitialState() reports ${initialState.specVersion} with canon posture ${initialState.canonPosture?.activeCanonVersion || 'missing'}/${initialState.canonPosture?.draftTargetVersion || 'missing'}.`
  );
  pushCheck(
    checks,
    'public-state-alignment',
    projectedState.specVersion === CURRENT_SPEC_VERSION_LABEL
      && projectedState.canonPosture?.activeCanonVersion === activeCanonVersion
      && projectedState.canonPosture?.draftTargetVersion === draftTargetVersion
      && projectedState.canonPosture?.activeProvenAppendixPath === ACTIVE_PROVEN_APPENDIX_PATH,
    `publicState() reports ${projectedState.specVersion} with canon posture ${projectedState.canonPosture?.activeCanonVersion || 'missing'}/${projectedState.canonPosture?.draftTargetVersion || 'missing'}.`
  );
  pushCheck(
    checks,
    'specifying-package-alignment',
    specifyingPackageContent.includes('"@bitcode/specifying"')
      && existsSync(specifyingCanonPosturePath)
      && specifyingIndexContent.includes('buildCanonPostureDriftReport'),
    'packages/specifying owns @bitcode/specifying and exports buildCanonPostureDriftReport.'
  );
  pushCheck(
    checks,
    'specifying-canon-posture-source-alignment',
    specifyingCanonPostureContent.includes(`ACTIVE_CANON_VERSION`)
      && specifyingCanonPostureContent.includes(activeCanonVersion)
      && specifyingCanonPostureContent.includes(draftTargetVersion)
      && !specifyingCanonPostureContent.includes('protocol-demonstration/'),
    `packages/specifying/src/canon-posture.js declares active ${activeCanonVersion} and draft ${draftTargetVersion} without protocol-demonstration coupling.`
  );
  pushCheck(
    checks,
    'specifying-readme-alignment',
    specifyingReadmeContent.length > 0
      && (specifyingReadmeContent.includes('specifying') || specifyingReadmeContent.includes('Specifying') || specifyingReadmeContent.includes('canon'))
      && !specifyingReadmeContent.includes('V15 canonical deterministic local prototype'),
    'packages/specifying/README.md is present as the commercial specifying owner after protocol-demonstration removal.'
  );
  pushCheck(
    checks,
    'protocol-demonstration-removed',
    !existsSync(path.join(resolvedRepoRoot, 'protocol-demonstration')),
    'protocol-demonstration/ is removed; commercial specifying lives under packages/specifying.'
  );

  const blockingFailures = checks.filter((check) => !check.passed);
  return {
    reportId: `${version.toLowerCase()}-canon-posture-drift-report`,
    version,
    checkedActiveCanonVersion: activeCanonVersion,
    checkedDraftTargetVersion: draftTargetVersion,
    pointerVersion,
    proofSourceCommit,
    generatedAt,
    generatorId,
    worktreeState,
    passed: blockingFailures.length === 0,
    checkCount: checks.length,
    blockingFailureCount: blockingFailures.length,
    blockingFailures: blockingFailures.map((check) => `${check.checkId}: ${check.detail}`),
    runtimeSpecVersion: initialState.specVersion,
    publicSpecVersion: projectedState.specVersion,
    activeProvenAppendixPath: ACTIVE_PROVEN_APPENDIX_PATH,
    policyRef: CURRENT_POLICY_REF,
    checkedFiles: [
      path.relative(resolvedRepoRoot, specifyingReadmePath),
      path.relative(resolvedRepoRoot, specifyingCanonPosturePath),
      path.relative(resolvedRepoRoot, specifyingPackagePath),
      path.relative(resolvedRepoRoot, specifyingIndexPath)
    ],
    checks
  };
}

/**
 * @param {Parameters<typeof buildCanonPostureDriftReport>[0]} [input]
 */
export function buildV22CanonPostureDriftReport(input = {}) {
  return buildCanonPostureDriftReport({
    version: 'V22',
    generatorId: V22_CANON_POSTURE_GENERATOR_ID,
    ...input
  });
}

/**
 * @param {Parameters<typeof buildCanonPostureDriftReport>[0]} [input]
 */
export function buildV23CanonPostureDriftReport(input = {}) {
  return buildCanonPostureDriftReport({
    version: 'V23',
    generatorId: V23_CANON_POSTURE_GENERATOR_ID,
    ...input
  });
}

/**
 * @param {Parameters<typeof buildCanonPostureDriftReport>[0]} [input]
 */
export function buildV24CanonPostureDriftReport(input = {}) {
  return buildCanonPostureDriftReport({
    version: 'V24',
    generatorId: V24_CANON_POSTURE_GENERATOR_ID,
    ...input
  });
}

/**
 * @param {Parameters<typeof buildCanonPostureDriftReport>[0]} [input]
 */
export function buildV25CanonPostureDriftReport(input = {}) {
  return buildCanonPostureDriftReport({
    version: 'V25',
    generatorId: V25_CANON_POSTURE_GENERATOR_ID,
    ...input
  });
}

/**
 * @param {{
 *   version: string,
 *   proofSourceCommit: string,
 *   generatedAt: string,
 *   generatorId: string,
 *   worktreeState: string,
 *   specFamilyReport: ReturnType<typeof import('./v21-specifying.js').buildV21SpecFamilyReport>,
 *   canonicalInputReport: ReturnType<typeof import('./v21-specifying.js').buildV21CanonicalInputReport>,
 *   canonPostureDriftReport: ReturnType<typeof buildV22CanonPostureDriftReport>
 * }} input
 */
export function buildCanonPostureGeneratedArtifactContents({
  version,
  proofSourceCommit,
  generatedAt,
  generatorId,
  worktreeState,
  specFamilyReport,
  canonicalInputReport,
  canonPostureDriftReport
}) {
  return {
    ...buildV21GeneratedArtifactContents({
      version,
      proofSourceCommit,
      generatedAt,
      generatorId,
      worktreeState,
      specFamilyReport,
      canonicalInputReport
    }),
    [`.bitcode/${version.toLowerCase()}-canon-posture-drift-report.json`]: `${JSON.stringify(canonPostureDriftReport, null, 2)}\n`
  };
}

/**
 * @param {Parameters<typeof buildCanonPostureGeneratedArtifactContents>[0]} input
 */
export function buildV22GeneratedArtifactContents(input) {
  return buildCanonPostureGeneratedArtifactContents(input);
}

/**
 * @param {Parameters<typeof buildCanonPostureGeneratedArtifactContents>[0]} input
 */
export function buildV23GeneratedArtifactContents(input) {
  return buildCanonPostureGeneratedArtifactContents(input);
}

/**
 * @param {Parameters<typeof buildCanonPostureGeneratedArtifactContents>[0]} input
 */
export function buildV24GeneratedArtifactContents(input) {
  return buildCanonPostureGeneratedArtifactContents(input);
}

/**
 * @param {Parameters<typeof buildCanonPostureGeneratedArtifactContents>[0]} input
 */
export function buildV25GeneratedArtifactContents(input) {
  return buildCanonPostureGeneratedArtifactContents(input);
}
