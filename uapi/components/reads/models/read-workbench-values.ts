/**
 * Pure value readers for the deposit/read workbench (no React).
 */
export function readMetricValue(
  metrics: Array<{ label: string; value: string }>,
  label: string,
): string {
  return metrics.find((metric) => metric.label === label)?.value || '0';
}

export function readRowValue(
  rows: Array<{ label: string; value: string }>,
  label: string,
): string {
  return rows.find((row) => row.label === label)?.value || '—';
}

export function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function textValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function shortIdentifier(value: unknown): string | null {
  const text = textValue(value);
  if (!text) return null;
  return text.length > 18 ? `${text.slice(0, 12)}...` : text;
}

export function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
}

export function countList(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export function numericValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export type TerminalReadNeedState = Record<string, unknown> & {
  schema?: 'bitcode.read.need';
  needId?: string;
  reviewState?: string;
  measurementRoot?: string;
  request?: {
    requestId?: string;
    previousNeedId?: string | null;
    feedbackHistory?: string[];
  };
  requirements?: string[];
  closureCriteria?: string[];
  failureModes?: string[];
  targetArtifactKinds?: string[];
  proofExpectations?: string[];
  feedbackHistory?: string[];
  pricingMeasurementInputs?: {
    weightedRequestedVolume?: number;
    measurementVector?: Array<{ dimension?: string; weight?: number; volume?: number }>;
  };
};

export type TerminalReadNeedReviewRuntimeState = Record<string, unknown> & {
  schema?: 'bitcode.read-need-review-resynthesis-runtime';
  runtimeId?: string;
  action?: string;
  reviewState?: string;
  findingFitsAdmission?: {
    admitted?: boolean;
    blockers?: string[];
  };
  reviewLoop?: Record<string, unknown>;
  proofRoots?: {
    runtimeRoot?: string;
    storageRoot?: string;
    telemetryRoot?: string;
    readRequestRoot?: string;
  };
};

export function terminalReadNeed(value: unknown): TerminalReadNeedState | null {
  const record = objectValue(value);
  return record?.schema === 'bitcode.read.need' ? (record as TerminalReadNeedState) : null;
}

export type ReadFitsFindingProgressState = 'draft' | 'measured' | 'admitted' | 'fit-recorded';
