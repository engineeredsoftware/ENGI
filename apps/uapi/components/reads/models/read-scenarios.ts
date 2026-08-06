/**
 * Read scenario state model.
 * Relocated from product experience components/read-scenarios.
 */

type ShellSnapshot = {
  selection?: {
    scenarioId?: string | null;
  } | null;
  scenarios?: Array<{
    scenarioId?: string | null;
    scenarioFamily?: string | null;
    repo?: string | null;
    profileShortLabel?: string | null;
    selected?: boolean | null;
  }> | null;
  readingSurface?: {
    parserKind?: string | null;
    closureCriteria?: string[] | null;
    targetArtifactKinds?: string[] | null;
  } | null;
} | null;

export type ProductReadScenariosState = {
  selectedScenarioId: string;
  parserKind: string;
  closureCriteriaCount: number;
  targetKindCount: number;
  scenarios: Array<{
    id: string;
    label: string;
    repo: string;
    profile: string;
    selected: boolean;
  }>;
};

export type ProductReadFittingReviewState = {
  scenarioId: string;
  readId: string;
  task: string;
  reviewStage: string;
  requiredBefore: string;
  status: string;
  action: string;
  fitSearchAdmitted: boolean;
  admissionReason: string;
  blockedStages: string[];
  admittedStages: string[];
  allowedActions: string[];
  reviewQuestions: string[];
  measurementHash: string;
  reviewableReadRef: string;
  settlementReviewStage: string;
  objectiveContractId: string;
  receiptCarryThrough: string[];
  requiredFitStages: string[];
  blockedUntil: string;
};

export function normalizeReadScenarios(snapshot: ShellSnapshot): ProductReadScenariosState | null {
  if (!snapshot) return null;

  const scenarios = (snapshot.scenarios || [])
    .map((scenario) => {
      const id = String(scenario.scenarioId || '').trim();
      if (!id) return null;
      return {
        id,
        label: String(scenario.scenarioFamily || id).trim() || id,
        repo: String(scenario.repo || '—').trim() || '—',
        profile: String(scenario.profileShortLabel || 'profile pending').trim() || 'profile pending',
        selected: Boolean(scenario.selected) || id === String(snapshot.selection?.scenarioId || '').trim(),
      };
    })
    .filter(
      (
        scenario,
      ): scenario is {
        id: string;
        label: string;
        repo: string;
        profile: string;
        selected: boolean;
      } => Boolean(scenario),
    );

  return {
    selectedScenarioId: scenarios.find((scenario) => scenario.selected)?.id || scenarios[0]?.id || '',
    parserKind: String(snapshot.readingSurface?.parserKind || '—').trim() || '—',
    closureCriteriaCount: Array.isArray(snapshot.readingSurface?.closureCriteria)
      ? snapshot.readingSurface?.closureCriteria.length
      : 0,
    targetKindCount: Array.isArray(snapshot.readingSurface?.targetArtifactKinds)
      ? snapshot.readingSurface?.targetArtifactKinds.length
      : 0,
    scenarios,
  };
}

function stringValue(value: unknown, fallback = '—') {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized || fallback;
}

function recordValue(value: unknown): Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
}

export function normalizeReadFittingReview(payload: unknown): ProductReadFittingReviewState | null {
  const root = recordValue(payload);
  const review = recordValue(root.readFittingReview);
  if (!review.artifactKind && !root.reviewableRead) return null;

  const reviewableRead = recordValue(root.reviewableRead);
  const measurement = recordValue(root.measurement);
  const fitSearchAdmission = recordValue(review.fitSearchAdmission || root.fitSearchAdmission || reviewableRead.fitSearchAdmission);
  const settlementReview = recordValue(review.settlementReview);
  const candidateFitRequirements = recordValue(review.candidateFitRequirements);

  return {
    scenarioId: stringValue(review.scenarioId || recordValue(root.scenario).scenarioId, '—'),
    readId: stringValue(review.readId || reviewableRead.readId || measurement.readId, '—'),
    task: stringValue(review.task || measurement.task || recordValue(reviewableRead.measuredReadSnapshot).task, '—'),
    reviewStage: stringValue(review.reviewStage || root.reviewStage || reviewableRead.reviewStage, 'post-measurement-pre-fit'),
    requiredBefore: stringValue(review.requiredBefore || reviewableRead.requiredBefore, 'find-fitting-settlement'),
    status: stringValue(review.status || reviewableRead.status, 'ready-for-review'),
    action: stringValue(review.action || recordValue(root.reviewDecision).action, 'pending operator review'),
    fitSearchAdmitted: fitSearchAdmission.admitted === true,
    admissionReason: stringValue(fitSearchAdmission.admissionReason, 'Read must be accepted before Finding Fits begins.'),
    blockedStages: stringList(fitSearchAdmission.blockedStages || candidateFitRequirements.blockedStages),
    admittedStages: stringList(fitSearchAdmission.admittedStages || candidateFitRequirements.admittedStages),
    allowedActions: stringList(review.allowedActions || root.allowedActions || reviewableRead.allowedActions),
    reviewQuestions: stringList(review.reviewQuestions || reviewableRead.reviewQuestions),
    measurementHash: stringValue(review.measurementHash || measurement.measurementHash, '—'),
    reviewableReadRef: stringValue(review.reviewableReadRef || measurement.reviewableReadRef, '—'),
    settlementReviewStage: stringValue(settlementReview.reviewStage, 'present-fit-for-settlement-review'),
    objectiveContractId: stringValue(
      settlementReview.quantizedObjectiveContractId,
      'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
    ),
    receiptCarryThrough: stringList(settlementReview.receiptCarryThrough),
    requiredFitStages: stringList(candidateFitRequirements.requiredStages),
    blockedUntil: stringValue(candidateFitRequirements.blockedUntil, 'Read review action=accept'),
  };
}
