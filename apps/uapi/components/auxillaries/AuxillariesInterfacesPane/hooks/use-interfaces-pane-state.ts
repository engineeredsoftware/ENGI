/**
 * Interfaces pane defaults, admission catalog projection, and debounced autosave.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { useUserData } from '@/hooks/useUserData';
import type { AuxillariesPreferenceCardItem } from '@/components/auxillaries/shared/AuxillariesPreferenceCards/AuxillariesPreferenceCards';

import {
  DEFAULT_INTERFACES_DEFAULTS,
  type ExecutionBias,
  type ExternalInterfaceEntry,
  type InterfaceAdmissionRecord,
  type InterfacesDefaults,
  type ProofMode,
  type PromptTone,
  type TerminalDetailDensity,
} from '../models/interfaces-pane-defaults';

export function useInterfacesPaneState({
  onSave,
  onCompletionStatusChange,
}: {
  onSave: (data: any) => void;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}) {
  const { data, interfaceAdmissions } = useUserData();
  const hasCalledCompletionRef = useRef(false);
  const lastInterfacesAutosaveSignatureRef = useRef<string | null>(null);
  const savedPreferences = (data?.modelPreferences as Record<string, any> | null) || null;
  const admissionRecords = Array.isArray(interfaceAdmissions)
    ? (interfaceAdmissions as InterfaceAdmissionRecord[])
    : Array.isArray(data?.interfaceAdmissions)
      ? (data.interfaceAdmissions as InterfaceAdmissionRecord[])
    : [];
  const readyAdmissionCount = admissionRecords.filter((admission) => admission.readiness === 'ready').length;
  const blockedAdmissionCount = admissionRecords.filter((admission) => admission.readiness === 'blocked').length;
  const deferredAdmissionCount = admissionRecords.filter(
    (admission) => admission.deferredProductDepth && admission.deferredProductDepth !== 'none',
  ).length;
  const [defaults, setDefaults] = useState<InterfacesDefaults>(() => ({
    ...DEFAULT_INTERFACES_DEFAULTS,
    ...(savedPreferences?.workspaceDefaults || {}),
    ...(savedPreferences?.interfacesDefaults || {}),
  }));
  const [globalSystemPrompt, setGlobalSystemPrompt] = useState(
    String(savedPreferences?.globalSystemPrompt || ''),
  );
  const [tokenCount, setTokenCount] = useState(
    typeof savedPreferences?.tokenCount === 'number' ? savedPreferences.tokenCount : 0,
  );

  useEffect(() => {
    if (onCompletionStatusChange && !hasCalledCompletionRef.current) {
      hasCalledCompletionRef.current = true;
      onCompletionStatusChange(true);
    }
  }, [onCompletionStatusChange]);

  useEffect(() => {
    if (!savedPreferences) {
      return;
    }

    setDefaults((current) => ({
      ...current,
      ...(savedPreferences.workspaceDefaults || {}),
      ...(savedPreferences.interfacesDefaults || {}),
    }));
    setGlobalSystemPrompt(String(savedPreferences.globalSystemPrompt || ''));
    setTokenCount(typeof savedPreferences.tokenCount === 'number' ? savedPreferences.tokenCount : 0);
  }, [savedPreferences]);

  const updateTokenCounter = (value: string) => {
    setTokenCount(Math.ceil(value.length / 4));
  };

  const preferenceCards = useMemo<AuxillariesPreferenceCardItem[]>(
    () => [
      {
        id: 'terminal-detail-density',
        title: 'Terminal detail density',
        description: 'Choose how much structured operator signal opens by default in transactions.',
        value: defaults.productDetailDensity,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            productDetailDensity: value as TerminalDetailDensity,
          })),
        options: [
          {
            value: 'signal',
            label: 'Signal',
            hint: 'Favor concise field groups and higher-level closure cues first.',
          },
          {
            value: 'balanced',
            label: 'Balanced',
            hint: 'Keep summary and consequence detail readable together.',
          },
          {
            value: 'full',
            label: 'Full',
            hint: 'Bias toward denser detail and fuller transaction context on open.',
          },
        ],
      },
      {
        id: 'external-interface-entry',
        title: 'External interface entry',
        description: 'Control which interface should receive work when Bitcode leaves the website surface.',
        value: defaults.externalInterfaceEntry,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            externalInterfaceEntry: value as ExternalInterfaceEntry,
          })),
        options: [
          {
            value: 'mcp',
            label: 'MCP API',
            hint: 'Prefer the protocol API boundary when integrators invoke Bitcode.',
          },
          {
            value: 'chatgpt',
            label: 'ChatGPT App',
            hint: 'Prefer the integratable ChatGPT App path for conversational operators.',
          },
          {
            value: 'terminal',
            label: 'Terminal',
            hint: 'Return to the website Terminal when the work should stay in-product.',
          },
        ],
      },
      {
        id: 'proof-mode',
        title: 'Proof read mode',
        description: 'Decide how evidence and JSON-bearing detail should open when you inspect proofs.',
        value: defaults.proofMode,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            proofMode: value as ProofMode,
          })),
        options: [
          {
            value: 'visual',
            label: 'Visual',
            hint: 'Lead with shaped evidence and field summaries.',
          },
          {
            value: 'mixed',
            label: 'Mixed',
            hint: 'Keep structured shape and raw payload equally visible.',
          },
          {
            value: 'raw',
            label: 'Raw',
            hint: 'Bias toward exact payload reading first.',
          },
        ],
      },
      {
        id: 'prompt-tone',
        title: 'Instruction tone',
        description: 'Choose the user-facing reasoning posture Bitcode should prefer.',
        value: defaults.promptTone,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            promptTone: value as PromptTone,
          })),
        options: [
          {
            value: 'bounded',
            label: 'Bounded',
            hint: 'Stay careful, exact, and boundary-honest before expanding.',
          },
          {
            value: 'formal',
            label: 'Formal',
            hint: 'Keep a clear, operator-grade reading posture.',
          },
          {
            value: 'decisive',
            label: 'Decisive',
            hint: 'Lean toward firmer calls and shorter interpretive flow.',
          },
        ],
      },
      {
        id: 'execution-bias',
        title: 'Execution bias',
        description: 'Set the preferred tradeoff Bitcode should carry when it chooses defaults.',
        value: defaults.executionBias,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            executionBias: value as ExecutionBias,
          })),
        options: [
          {
            value: 'balanced',
            label: 'Balanced',
            hint: 'Keep throughput, quality, and interpretability in tension.',
          },
          {
            value: 'quality',
            label: 'Quality',
            hint: 'Bias toward more bounded, auditable output.',
          },
          {
            value: 'throughput',
            label: 'Throughput',
            hint: 'Bias toward faster flow and quicker default follow-through.',
          },
        ],
      },
    ],
    [defaults],
  );

  const interfacesAutosavePayload = useMemo(
    () => {
      const preservedPreferences = { ...(savedPreferences || {}) };
      delete preservedPreferences.defaultModel;
      delete preservedPreferences.defaultProvider;
      delete preservedPreferences.preferred_model;
      delete preservedPreferences.preferredProvider;

      return {
        ...preservedPreferences,
        globalSystemPrompt,
        tokenCount,
        interfacesDefaults: defaults,
        workspaceDefaults: defaults,
        ledgerizedPipelineModels: 'registry_deterministic',
        modelSelectionScope: 'non_ledgerized_conversation_only',
        review_profile: savedPreferences?.review_profile || 'bitcode-operator-workspace',
      };
    },
    [defaults, globalSystemPrompt, savedPreferences, tokenCount],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(interfacesAutosavePayload);
  };

  useEffect(() => {
    const signature = JSON.stringify(interfacesAutosavePayload);
    if (lastInterfacesAutosaveSignatureRef.current === null) {
      lastInterfacesAutosaveSignatureRef.current = signature;
      return;
    }
    if (lastInterfacesAutosaveSignatureRef.current === signature) {
      return;
    }

    const timer = window.setTimeout(() => {
      lastInterfacesAutosaveSignatureRef.current = signature;
      onSave(interfacesAutosavePayload);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [interfacesAutosavePayload, onSave]);

  return {
    defaults,
    admissionRecords,
    readyAdmissionCount,
    blockedAdmissionCount,
    deferredAdmissionCount,
    preferenceCards,
    globalSystemPrompt,
    setGlobalSystemPrompt,
    tokenCount,
    updateTokenCounter,
    handleSubmit,
  };
}
