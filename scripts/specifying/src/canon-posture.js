// @ts-check

export const ACTIVE_CANON_VERSION = 'V47';
export const DRAFT_TARGET_VERSION = 'V48';
export const CURRENT_CANON_OPERATOR_LABEL = `${ACTIVE_CANON_VERSION} active canon / ${DRAFT_TARGET_VERSION} system draft`;

/**
 * @param {string} activeCanonVersion
 * @param {string} draftTargetVersion
 * @returns {boolean}
 */
const CURRENT_PROJECT_LABEL = 'Bitcode';
const CURRENT_SPEC_FAMILY_PREFIX = 'BITCODE_SPEC';
export const ACTIVE_PROVEN_APPENDIX_PATH = `${CURRENT_SPEC_FAMILY_PREFIX}_${ACTIVE_CANON_VERSION}_PROVEN.md`;
export const DRAFT_SPEC_PATH = `${CURRENT_SPEC_FAMILY_PREFIX}_${DRAFT_TARGET_VERSION}.md`;
export const DRAFT_DELTA_PATH = `${CURRENT_SPEC_FAMILY_PREFIX}_${DRAFT_TARGET_VERSION}_DELTA.md`;
export const DRAFT_PARITY_PATH = `${CURRENT_SPEC_FAMILY_PREFIX}_${DRAFT_TARGET_VERSION}_PARITY_MATRIX.md`;
export const CURRENT_SPEC_VERSION_LABEL = `${CURRENT_PROJECT_LABEL} Spec ${CURRENT_CANON_OPERATOR_LABEL}`;
export const CURRENT_POLICY_REF = `policy://bitcode/spec-${ACTIVE_CANON_VERSION.toLowerCase()}-active-${DRAFT_TARGET_VERSION.toLowerCase()}-system-draft/current`;

/**
 * @returns {{
 *   activeCanonVersion: string,
 *   draftTargetVersion: string,
 *   operatorLabel: string,
 *   specVersionLabel: string,
 *   documentTitle: string,
 *   policyRef: string,
 *   activeProvenAppendixPath: string,
 *   draftSpecPath: string,
 *   draftDeltaPath: string,
 *   draftParityPath: string,
 *   inheritedCanonSurfaceLabel: string,
 *   heroEyebrow: string,
 *   heroLede: string,
 *   heroTip: string
 * }}
 */
export function buildCanonPosture() {
  return {
    activeCanonVersion: ACTIVE_CANON_VERSION,
    draftTargetVersion: DRAFT_TARGET_VERSION,
    operatorLabel: CURRENT_CANON_OPERATOR_LABEL,
    specVersionLabel: CURRENT_SPEC_VERSION_LABEL,
    documentTitle: `${CURRENT_PROJECT_LABEL} Demonstration`,
    policyRef: CURRENT_POLICY_REF,
    activeProvenAppendixPath: ACTIVE_PROVEN_APPENDIX_PATH,
    draftSpecPath: DRAFT_SPEC_PATH,
    draftDeltaPath: DRAFT_DELTA_PATH,
    draftParityPath: DRAFT_PARITY_PATH,
    inheritedCanonSurfaceLabel: 'V16/V17/V18/V19/V20/V21/V22/V23/V24/V25/V26/V27/V28/V29/V30/V31/V32/V33/V34/V35/V36/V37/V38/V39/V40/V41/V42/V43/V44/V45/V46',
    heroEyebrow: `${CURRENT_PROJECT_LABEL} transactions and activity`,
    heroLede: 'Set the active scenario, select supply, and follow the flow from deposit through settlement.',
    heroTip: 'Use the guide and lower runtime surfaces when you read exact replay, proof, or settlement detail.'
  };
}

export const CURRENT_CANON_POSTURE = buildCanonPosture();
