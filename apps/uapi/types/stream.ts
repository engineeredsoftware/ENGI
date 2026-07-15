// Import canonical ExecutionState from pipelines-generics (SSOT)
import type { ExecutionState } from '@bitcode/pipelines-generics';
export type { ExecutionState };

export interface StreamStatus {
  step?: string;
  progress?: string;
  message?: string;
  detail?: string;
  executionState?: ExecutionState;
}

export interface StreamStatusMessage {
  message: string;
  detail?: string;
  timestamp?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  step?: string;
  progress?: string;
  executionState?: ExecutionState;
}

export interface ParsedStreamData {
  text: string;
  status: StreamStatus | null;
  error: string | null;
  completion: any;
  statusMessages: StreamStatusMessage[];
  type?: string;
  /** For Evidence Document suggestion messages, list of relevant Evidence Documents. */
  evidence_documents?: any[];
  /** For work-update events (agent step / iteration) */
  update?: any;
  scope?: string;
  executionState?: ExecutionState;
  /** Run ID from the pipeline execution */
  runId?: string | null;
  /** Current guide (Design/Develop/Digest) when provided */
  guide?: string | null;
  /** Generic ad-hoc event payload used by conversation-triggered pipeline events */
  event?: Record<string, unknown> | null;
}

export interface LlmCallData {
  model: string;
  purpose: string;
  messages: Array<{ role: string; content: string }>;
  result?: string;
  error?: string;
  duration?: number;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  failsafe?: string;
  generation?: string;
  metadata?: Record<string, any>;
  executionState?: ExecutionState;
}
