export type ConversationWritingWorkspaceMode =
  | 'read_request'
  | 'need_feedback'
  | 'assetpack_review_note'
  | 'terminal_handoff_summary';

export type ConversationWritingWorkspaceSummary = {
  modeId: ConversationWritingWorkspaceMode;
  label: string;
  characterCount: number;
  wordCount: number;
  lineCount: number;
  sourceSafePreview: string;
  redactionApplied: boolean;
  sourceSafetyVerdict: 'source-safe-conversation-writing-workspace-metadata';
};

export type ConversationWritingWorkspaceHandoff = {
  modeId: ConversationWritingWorkspaceMode;
  message: string;
  summary: ConversationWritingWorkspaceSummary;
  metadata: {
    workspaceMode: ConversationWritingWorkspaceMode;
    disclosureClass: 'source_safe_conversation_writing_workspace_handoff';
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    globalLedgerAuthorityClaimed: false;
  };
};

export const CONVERSATION_WRITING_WORKSPACE_MODES: Array<{
  id: ConversationWritingWorkspaceMode;
  label: string;
  shortLabel: string;
  draftScope: string;
  placeholder: string;
}> = [
  {
    id: 'read_request',
    label: 'Read Request',
    shortLabel: 'Request',
    draftScope: 'reader-authored request for technical knowledge',
    placeholder: 'Draft the Read Request the Need comprehension pipeline should understand.',
  },
  {
    id: 'need_feedback',
    label: 'Need Feedback',
    shortLabel: 'Need',
    draftScope: 'reader feedback for synthesized Need revision',
    placeholder: 'Draft feedback for the synthesized Need before asking Bitcode to revise it.',
  },
  {
    id: 'assetpack_review_note',
    label: 'AssetPack Review Note',
    shortLabel: 'Review',
    draftScope: 'source-safe preview review note',
    placeholder: 'Draft review notes against source-safe AssetPack measurements and preview metadata.',
  },
  {
    id: 'terminal_handoff_summary',
    label: 'Terminal Handoff Summary',
    shortLabel: 'Handoff',
    draftScope: 'source-safe Terminal transaction intent summary',
    placeholder: 'Draft a source-safe handoff summary for Terminal transaction work.',
  },
];

export function getConversationWritingWorkspaceMode(modeId: ConversationWritingWorkspaceMode) {
  return CONVERSATION_WRITING_WORKSPACE_MODES.find((mode) => mode.id === modeId) ?? CONVERSATION_WRITING_WORKSPACE_MODES[0];
}

export function buildConversationWritingWorkspaceStorageKey(
  conversationId: string | undefined,
  modeId: ConversationWritingWorkspaceMode,
) {
  return `bitcode:conversation-writing-workspace:${conversationId || 'new'}:${modeId}`;
}

export function redactConversationWritingWorkspaceText(text: string) {
  let redactionApplied = false;
  const redact = (value: string, pattern: RegExp, replacement: string) => {
    if (pattern.test(value)) {
      redactionApplied = true;
      return value.replace(pattern, replacement);
    }
    return value;
  };

  let output = text;
  output = redact(output, /```[\s\S]*?```/gu, '[redacted-source-block]');
  output = redact(output, /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gu, '[redacted-private-key]');
  output = redact(output, /\bsk-[A-Za-z0-9_-]{16,}\b/gu, '[redacted-provider-token]');
  output = redact(output, new RegExp(`\\b${['sb', 'secret'].join('_')}__[A-Za-z0-9_-]+\\b`, 'gu'), '[redacted-service-token]');
  output = redact(output, /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu, '[redacted-jwt]');
  output = redact(output, /\b(?:password|secret|token|private_key)\s*[:=]\s*\S+/giu, '[redacted-secret-field]');

  return {
    text: output,
    redactionApplied,
  };
}

export function summarizeConversationWritingWorkspaceDraft(
  modeId: ConversationWritingWorkspaceMode,
  draft: string,
): ConversationWritingWorkspaceSummary {
  const mode = getConversationWritingWorkspaceMode(modeId);
  const trimmed = draft.trim();
  const redacted = redactConversationWritingWorkspaceText(trimmed);
  const normalizedPreview = redacted.text.replace(/\s+/gu, ' ').trim();

  return {
    modeId,
    label: mode.label,
    characterCount: trimmed.length,
    wordCount: trimmed ? trimmed.split(/\s+/u).length : 0,
    lineCount: trimmed ? trimmed.split(/\r?\n/u).length : 0,
    sourceSafePreview: normalizedPreview.slice(0, 360) || 'No draft content yet.',
    redactionApplied: redacted.redactionApplied,
    sourceSafetyVerdict: 'source-safe-conversation-writing-workspace-metadata',
  };
}

export function buildConversationWritingWorkspaceHandoff(
  modeId: ConversationWritingWorkspaceMode,
  draft: string,
): ConversationWritingWorkspaceHandoff {
  const summary = summarizeConversationWritingWorkspaceDraft(modeId, draft);
  const message = [
    `[ConversationWritingWorkspace:${summary.label}]`,
    summary.sourceSafePreview,
    '',
    `Metrics: ${summary.wordCount} words, ${summary.characterCount} characters.`,
    'Disclosure: source-safe workspace summary only.',
  ].join('\n');

  return {
    modeId,
    message,
    summary,
    metadata: {
      workspaceMode: modeId,
      disclosureClass: 'source_safe_conversation_writing_workspace_handoff',
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      globalLedgerAuthorityClaimed: false,
    },
  };
}
