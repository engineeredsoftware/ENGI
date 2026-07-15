"use client";

/**
 * Interfaces auxillary pane — detail density, admission catalog, prompt baseline.
 * Preference state and autosave live in hooks/use-interfaces-pane-state.
 */

import React from 'react';

import AuxillariesInterfacesPaneHeader from '@/components/auxillaries/headers/AuxillariesInterfacesPaneHeader/AuxillariesInterfacesPaneHeader';
import SystemPromptSection from '@/components/auxillaries/models/SystemPromptSection/SystemPromptSection';
import { auxillaryPaneExplainers } from '@/components/auxillaries/AuxillaryPaneExplainers/AuxillaryPaneExplainers';
import AuxillariesPreferenceCards from '@/components/auxillaries/shared/AuxillariesPreferenceCards/AuxillariesPreferenceCards';
import AuxillariesStatGrid from '@/components/auxillaries/shared/AuxillariesStatGrid/AuxillariesStatGrid';
import AuxillariesWorkspaceSection from '@/components/auxillaries/shared/AuxillariesWorkspaceSection/AuxillariesWorkspaceSection';

import { useInterfacesPaneState } from './hooks/use-interfaces-pane-state';
import InterfaceAdmissionCatalog from './InterfaceAdmissionCatalog/InterfaceAdmissionCatalog';

export interface AuxillariesInterfacesPaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  isOnboardingComplete?: boolean;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

export default function AuxillariesInterfacesPane({
  onSave,
  loading: _loading,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: AuxillariesInterfacesPaneProps) {
  const {
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
  } = useInterfacesPaneState({ onSave, onCompletionStatusChange });

  return (
    <div data-testid="interfaces-pane-container">
      <div className="orbital-step-content interfaces-step">
        <AuxillariesInterfacesPaneHeader isOnboardingComplete={isOnboardingComplete} />

        <div className="space-y-5">
          <AuxillariesWorkspaceSection
            kicker="Interfaces posture"
            title="Shape transactions before you reopen them"
            description="Interfaces is where you keep Terminal detail density, MCP API and ChatGPT App entry posture, proof reading, and the shared instruction baseline aligned to one predictable operator posture."
            explainer={auxillaryPaneExplainers.interfacesDefaults}
            tone="emerald"
          >
            <AuxillariesStatGrid
              items={[
                {
                  label: 'Terminal detail',
                  value:
                    defaults.productDetailDensity === 'signal'
                      ? 'Dense signal'
                      : defaults.productDetailDensity === 'full'
                        ? 'Full read'
                        : 'Balanced read',
                  detail: 'How much structured detail opens first in transactions.',
                  tone: 'emerald',
                },
                {
                  label: 'Interface entry',
                  value:
                    defaults.externalInterfaceEntry === 'mcp'
                      ? 'MCP API'
                      : defaults.externalInterfaceEntry === 'chatgpt'
                        ? 'ChatGPT App'
                        : 'Terminal',
                  detail: 'How external interface work should enter or return to Bitcode.',
                  tone: 'sky',
                },
                {
                  label: 'Proof posture',
                  value:
                    defaults.proofMode === 'visual'
                      ? 'Visual'
                      : defaults.proofMode === 'raw'
                        ? 'Raw'
                        : 'Mixed',
                  detail: 'The default evidence-reading posture for proof-bearing detail.',
                  tone: 'violet',
                },
                {
                  label: 'Pipeline models',
                  value: 'Registry fixed',
                  detail: 'Ledgerized Reading uses protocol configuration, not user model preferences.',
                  tone: 'amber',
                },
                {
                  label: 'Admissions',
                  value: admissionRecords.length ? `${readyAdmissionCount}/${admissionRecords.length} ready` : 'Pending',
                  detail: blockedAdmissionCount
                    ? `${blockedAdmissionCount} blocked, ${deferredAdmissionCount} deferred.`
                    : 'No blocked interface records.',
                  tone: blockedAdmissionCount ? 'amber' : 'emerald',
                },
              ]}
              columns={4}
            />
          </AuxillariesWorkspaceSection>

          <AuxillariesWorkspaceSection
            kicker="Interface admission catalog"
            title="Admitted surfaces and source boundaries"
            description="Terminal, API, MCP, ChatGPT App, Exchange, and future hooks read from the same source-safe admission records before any protected action can run."
            explainer={auxillaryPaneExplainers.interfacesDefaults}
            tone="sky"
          >
            <InterfaceAdmissionCatalog admissionRecords={admissionRecords} />
          </AuxillariesWorkspaceSection>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuxillariesWorkspaceSection
              kicker="Interface defaults"
              title="Terminal detail and interface defaults"
              description="Set the opening behavior the operator should see when moving between Terminal transactions, proofs, the MCP API, and the ChatGPT App."
              explainer={auxillaryPaneExplainers.interfacesDefaults}
            >
              <AuxillariesPreferenceCards items={preferenceCards} />
            </AuxillariesWorkspaceSection>

            <AuxillariesWorkspaceSection
              kicker="Prompt baseline"
              title="Interface instruction baseline"
              description="Keep a reusable operator instruction surface for how Bitcode should summarize and explain non-ledgerized interface reads."
              explainer={auxillaryPaneExplainers.interfacesPrompt}
              tone="sky"
            >
              <SystemPromptSection
                value={globalSystemPrompt}
                onChange={setGlobalSystemPrompt}
                tokenCount={tokenCount}
                updateTokenCounter={updateTokenCounter}
              />
            </AuxillariesWorkspaceSection>

            <div className="rounded-none border border-white/10 bg-black/20 px-5 py-4">
              <p className="text-sm leading-7 text-white/68">
                Changes save automatically so Terminal transactions, proofs, MCP API calls, and ChatGPT App work reopen with the same interface defaults. Ledgerized Reading pipelines keep protocol-owned model configuration.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
