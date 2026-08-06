'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { CheckIcon, MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons';

import {
  CONVERSATION_SOURCE_SELECTOR_OPTIONS,
  DEFAULT_CONVERSATION_SOURCE_SELECTOR_GOVERNANCE,
  buildConversationSourceSelectorPreview,
  getConversationSourceSelectorOption,
  type ConversationSourceSelectorGovernance,
  type ConversationSourceSelectorInput,
  type ConversationSourceSelectorKind,
  type ConversationSourceSelectorPreview,
} from '@/components/conversations/models/conversation-source-selector';

type ConversationSourceSelectorProps = {
  initialKind?: ConversationSourceSelectorKind;
  initialSourceRef?: string;
  initialGovernance?: Partial<ConversationSourceSelectorGovernance>;
  onSelect?: (preview: ConversationSourceSelectorPreview) => void | Promise<void>;
};

const GOVERNANCE_OPTIONS: {
  [K in keyof ConversationSourceSelectorGovernance]: Array<{ value: ConversationSourceSelectorGovernance[K]; label: string }>;
} = {
  account: [
    { value: 'authenticated', label: 'Account authenticated' },
    { value: 'missing', label: 'Account missing' },
  ],
  organization: [
    { value: 'allowed', label: 'Organization allowed' },
    { value: 'unknown', label: 'Organization unknown' },
    { value: 'denied', label: 'Organization denied' },
  ],
  wallet: [
    { value: 'not_required', label: 'Wallet not required' },
    { value: 'present', label: 'Wallet present' },
    { value: 'missing', label: 'Wallet missing' },
  ],
  rights: [
    { value: 'preview_allowed', label: 'Preview rights' },
    { value: 'full_rights', label: 'Full rights' },
    { value: 'pending', label: 'Rights pending' },
    { value: 'denied', label: 'Rights denied' },
  ],
  settlement: [
    { value: 'not_required', label: 'Settlement not required' },
    { value: 'settled', label: 'Settled' },
    { value: 'pending', label: 'Settlement pending' },
    { value: 'required_for_full_source', label: 'Required for full source' },
  ],
  disclosure: [
    { value: 'source_safe', label: 'Source-safe preview' },
    { value: 'protected_source_requested', label: 'Protected source requested' },
    { value: 'unpaid_assetpack_source_requested', label: 'Unpaid AssetPack source requested' },
  ],
  policy: [
    { value: 'allowed', label: 'Policy allowed' },
    { value: 'unknown', label: 'Policy unknown' },
    { value: 'denied', label: 'Policy denied' },
  ],
};

export default function ConversationSourceSelector({
  initialKind = 'repository',
  initialSourceRef = '',
  initialGovernance,
  onSelect,
}: ConversationSourceSelectorProps) {
  const [kind, setKind] = useState<ConversationSourceSelectorKind>(initialKind);
  const [sourceRef, setSourceRef] = useState(initialSourceRef);
  const [governance, setGovernance] = useState<ConversationSourceSelectorGovernance>({
    ...DEFAULT_CONVERSATION_SOURCE_SELECTOR_GOVERNANCE,
    ...initialGovernance,
  });
  const [status, setStatus] = useState('Source selector ready.');

  const option = getConversationSourceSelectorOption(kind);
  const selectorInput: ConversationSourceSelectorInput = useMemo(
    () => ({
      kind,
      sourceRef,
      governance,
    }),
    [governance, kind, sourceRef],
  );
  const preview = useMemo(() => buildConversationSourceSelectorPreview(selectorInput), [selectorInput]);

  const updateGovernance = useCallback(
    <K extends keyof ConversationSourceSelectorGovernance>(
      key: K,
      value: ConversationSourceSelectorGovernance[K],
    ) => {
      setGovernance((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const refreshPreview = useCallback(() => {
    setStatus(
      preview.previewState === 'allowed'
        ? 'Source-safe preview allowed.'
        : preview.previewState === 'denied'
          ? `Source selector denied: ${preview.denialReason || 'policy denied'}.`
          : `Source selector needs retry: ${preview.retryAction || 'refresh required'}.`,
    );
  }, [preview.denialReason, preview.previewState, preview.retryAction]);

  const selectPreview = useCallback(async () => {
    await onSelect?.(preview);
    setStatus(`${preview.label} selected with ${preview.previewState.replace('_', ' ')} preview state.`);
  }, [onSelect, preview]);

  return (
    <section
      className="conversation-source-selector"
      data-testid="conversation-source-selector"
      aria-label="Conversation source selector"
    >
      <div className="conversation-source-selector__header">
        <div className="conversation-source-selector__title">
          <MagnifyingGlassIcon aria-hidden="true" />
          <div>
            <h2>Source Selector</h2>
            <p>source-safe context governed by account, rights, settlement, disclosure, and policy</p>
          </div>
        </div>
        <div className="conversation-source-selector__actions">
          <button type="button" onClick={refreshPreview} aria-label="Refresh source selector preview">
            <ReloadIcon aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={() => void selectPreview()} aria-label="Select conversation source">
            <CheckIcon aria-hidden="true" />
            <span>Select</span>
          </button>
        </div>
      </div>

      <div className="conversation-source-selector__main">
        <label>
          <span>Kind</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as ConversationSourceSelectorKind)}
            aria-label="Source selector kind"
          >
            {CONVERSATION_SOURCE_SELECTOR_OPTIONS.map((candidate) => (
              <option key={candidate.kind} value={candidate.kind}>
                {candidate.label}
              </option>
            ))}
          </select>
        </label>

        <label className="conversation-source-selector__source-ref">
          <span>Source Reference</span>
          <input
            value={sourceRef}
            onChange={(event) => setSourceRef(event.target.value)}
            placeholder={option.sourceRefPlaceholder}
            aria-label="Source reference"
          />
        </label>
      </div>

      <div className="conversation-source-selector__governance" aria-label="Source selector governance">
        {(Object.keys(GOVERNANCE_OPTIONS) as Array<keyof ConversationSourceSelectorGovernance>).map((key) => (
          <label key={key}>
            <span>{key}</span>
            <select
              value={governance[key]}
              onChange={(event) =>
                updateGovernance(
                  key,
                  event.target.value as ConversationSourceSelectorGovernance[typeof key],
                )
              }
              aria-label={`${key} posture`}
            >
              {GOVERNANCE_OPTIONS[key].map((candidate) => (
                <option key={candidate.value} value={candidate.value}>
                  {candidate.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="conversation-source-selector__preview" aria-label="Source-safe selector preview">
        <div>
          <span data-state={preview.previewState}>{preview.previewState.replace('_', ' ')}</span>
          <strong>{preview.label}</strong>
        </div>
        <p>{preview.sourceSafeRefSummary}</p>
        <dl>
          <div>
            <dt>Proof</dt>
            <dd>{preview.proofRoot}</dd>
          </div>
          <div>
            <dt>Event</dt>
            <dd>{preview.eventId}</dd>
          </div>
          <div>
            <dt>Disclosure</dt>
            <dd>source-safe selector metadata only</dd>
          </div>
          <div>
            <dt>Retry</dt>
            <dd>{preview.retryAction || 'not required'}</dd>
          </div>
        </dl>
      </div>

      <div role="status" aria-live="polite" className="conversation-source-selector__status">
        {status}
      </div>
    </section>
  );
}
