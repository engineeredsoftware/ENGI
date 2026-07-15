// @ts-check

/**
 * @param {{
 *   theoremId: string,
 *   passed: boolean,
 *   witnessArtifactPaths?: readonly unknown[],
 *   replayArtifactPaths?: readonly unknown[],
 *   replayStepIds?: readonly unknown[],
 *   failureReasons?: readonly unknown[]
 * }} input
 * @returns {{
 *   theoremId: string,
 *   passed: boolean,
 *   witnessArtifactPaths: string[],
 *   replayArtifactPaths: string[],
 *   replayStepIds: string[],
 *   failureReasons: string[]
 * }}
 */
export function buildTheoremVerdict({
  theoremId,
  passed,
  witnessArtifactPaths = [],
  replayArtifactPaths = [],
  replayStepIds = [],
  failureReasons = []
}) {
  return {
    theoremId,
    passed,
    witnessArtifactPaths: summarizeStrings(witnessArtifactPaths),
    replayArtifactPaths: summarizeStrings(replayArtifactPaths),
    replayStepIds: summarizeStrings(replayStepIds),
    failureReasons: summarizeStrings(failureReasons)
  };
}

/**
 * @param {{
 *   artifactPath: string,
 *   role: string,
 *   theoremIds?: readonly unknown[],
 *   requiredForWitness?: boolean,
 *   requiredForReplay?: boolean
 * }} input
 */
export function buildArtifactBinding({
  artifactPath,
  role,
  theoremIds = [],
  requiredForWitness = true,
  requiredForReplay = true
}) {
  return {
    artifactPath,
    role,
    theoremIds: summarizeStrings(theoremIds),
    requiredForWitness,
    requiredForReplay
  };
}

/**
 * @param {{
 *   stepId: string,
 *   theoremIds?: readonly unknown[],
 *   requiredArtifactPaths?: readonly unknown[],
 *   instruction: string
 * }} input
 */
export function buildReplayStep({
  stepId,
  theoremIds = [],
  requiredArtifactPaths = [],
  instruction
}) {
  return {
    stepId,
    theoremIds: summarizeStrings(theoremIds),
    requiredArtifactPaths: summarizeStrings(requiredArtifactPaths),
    instruction
  };
}

/**
 * @param {Array<{ passed?: boolean }>} [theoremVerdicts=[]]
 * @returns {boolean}
 */
export function allTheoremsPassed(theoremVerdicts = []) {
  return theoremVerdicts.every((entry) => entry.passed === true);
}

/**
 * @param {{
 *   artifactBindings?: Array<{
 *     artifactPath?: unknown,
 *     requiredForWitness?: boolean | undefined,
 *     requiredForReplay?: boolean | undefined
 *   }>,
 *   witnessArtifactPaths?: readonly unknown[],
 *   replayArtifactPaths?: readonly unknown[],
 *   replaySteps?: Array<{
 *     theoremIds?: readonly unknown[],
 *     requiredArtifactPaths?: readonly unknown[]
 *   }>,
 *   theoremIds?: readonly unknown[],
 *   excludeTheoremIds?: readonly unknown[]
 * }} input
 * @returns {{
 *   requiredWitnessPaths: string[],
 *   requiredReplayPaths: string[],
 *   scopedTheoremIds: string[],
 *   witnessBindingsClosed: boolean,
 *   replayBindingsClosed: boolean,
 *   replayStepArtifactCoverageClosed: boolean,
 *   theoremReplayCoverageClosed: boolean,
 *   allClosed: boolean
 * }}
 */
export function computeProofClosure({
  artifactBindings = [],
  witnessArtifactPaths = [],
  replayArtifactPaths = [],
  replaySteps = [],
  theoremIds = [],
  excludeTheoremIds = []
}) {
  const excludedTheoremIds = new Set(summarizeStrings(excludeTheoremIds));
  const scopedTheoremIds = summarizeStrings(theoremIds).filter((theoremId) => !excludedTheoremIds.has(theoremId));
  const requiredWitnessPaths = summarizeStrings(
    artifactBindings
      .filter((binding) => binding?.requiredForWitness !== false)
      .map((binding) => binding?.artifactPath)
  );
  const requiredReplayPaths = summarizeStrings(
    artifactBindings
      .filter((binding) => binding?.requiredForReplay !== false)
      .map((binding) => binding?.artifactPath)
  );
  const normalizedWitnessArtifactPaths = summarizeStrings(witnessArtifactPaths);
  const normalizedReplayArtifactPaths = summarizeStrings(replayArtifactPaths);
  const witnessBindingsClosed = requiredWitnessPaths.every((artifactPath) => normalizedWitnessArtifactPaths.includes(artifactPath));
  const replayBindingsClosed = requiredReplayPaths.every((artifactPath) => normalizedReplayArtifactPaths.includes(artifactPath));
  const replayStepArtifactCoverageClosed = replaySteps.every((step) =>
    summarizeStrings(step?.requiredArtifactPaths || []).every((artifactPath) => normalizedReplayArtifactPaths.includes(artifactPath))
  );
  const theoremReplayCoverageClosed = scopedTheoremIds.every((theoremId) =>
    replaySteps.some((step) => summarizeStrings(step?.theoremIds || []).includes(theoremId))
  );

  return {
    requiredWitnessPaths,
    requiredReplayPaths,
    scopedTheoremIds,
    witnessBindingsClosed,
    replayBindingsClosed,
    replayStepArtifactCoverageClosed,
    theoremReplayCoverageClosed,
    allClosed: witnessBindingsClosed && replayBindingsClosed && replayStepArtifactCoverageClosed && theoremReplayCoverageClosed
  };
}

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
export function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}
