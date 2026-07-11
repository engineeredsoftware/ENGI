"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useUserData } from "@/hooks/useUserData";

import AuxillariesInterfacesPaneHeader from "@/components/auxillaries/headers/AuxillariesInterfacesPaneHeader/AuxillariesInterfacesPaneHeader";
import SystemPromptSection from "@/components/auxillaries/models/SystemPromptSection/SystemPromptSection";
import { auxillaryPaneExplainers } from "@/components/auxillaries/AuxillaryPaneExplainers/AuxillaryPaneExplainers";
import AuxillariesPreferenceCards, {
  type AuxillariesPreferenceCardItem,
} from "@/components/auxillaries/shared/AuxillariesPreferenceCards/AuxillariesPreferenceCards";
import AuxillariesStatGrid from "@/components/auxillaries/shared/AuxillariesStatGrid/AuxillariesStatGrid";
import AuxillariesWorkspaceSection from "@/components/auxillaries/shared/AuxillariesWorkspaceSection/AuxillariesWorkspaceSection";

export interface AuxillariesInterfacesPaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  isOnboardingComplete?: boolean;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

type TerminalDetailDensity = "signal" | "balanced" | "full";
type ExternalInterfaceEntry = "mcp" | "chatgpt" | "terminal";
type ProofMode = "visual" | "mixed" | "raw";
type PromptTone = "bounded" | "formal" | "decisive";
type ExecutionBias = "balanced" | "quality" | "throughput";

interface InterfaceAdmissionRecord {
  interfaceId?: string;
  surface?: string;
  authMode?: string;
  readiness?: string;
  policyRequirements?: string[];
  policyConstraints?: string[];
  supportedActions?: string[];
  allowedActions?: string[];
  blockers?: string[];
  sourceSafetyClass?: string;
  deferredProductDepth?: string;
  interfaceAdmissionRoot?: string;
}

interface InterfacesDefaults {
  terminalDetailDensity: TerminalDetailDensity;
  externalInterfaceEntry: ExternalInterfaceEntry;
  proofMode: ProofMode;
  promptTone: PromptTone;
  executionBias: ExecutionBias;
}

const DEFAULT_INTERFACES_DEFAULTS: InterfacesDefaults = {
  terminalDetailDensity: "balanced",
  externalInterfaceEntry: "terminal",
  proofMode: "mixed",
  promptTone: "formal",
  executionBias: "balanced",
};

function formatAdmissionValue(value: string | undefined | null) {
  return String(value || "unknown").replace(/[_.-]+/g, " ");
}

function formatAdmissionList(values: string[] | undefined, fallback = "none") {
  if (!Array.isArray(values) || values.length === 0) return fallback;
  return values.map(formatAdmissionValue).join(", ");
}

export default function AuxillariesInterfacesPane({
  onSave,
  loading,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: AuxillariesInterfacesPaneProps) {
  const { data, interfaceAdmissions } = useUserData();
  const hasCalledCompletionRef = useRef(false);
  const lastInterfacesAutosaveSignatureRef = useRef<string | null>(null);
  const savedPreferences = (data?.modelPreferences as Record<string, any> | null) || null;
  const admissionRecords = Array.isArray(interfaceAdmissions)
    ? (interfaceAdmissions as InterfaceAdmissionRecord[])
    : Array.isArray(data?.interfaceAdmissions)
      ? (data.interfaceAdmissions as InterfaceAdmissionRecord[])
    : [];
  const readyAdmissionCount = admissionRecords.filter((admission) => admission.readiness === "ready").length;
  const blockedAdmissionCount = admissionRecords.filter((admission) => admission.readiness === "blocked").length;
  const deferredAdmissionCount = admissionRecords.filter(
    (admission) => admission.deferredProductDepth && admission.deferredProductDepth !== "none",
  ).length;
  const [defaults, setDefaults] = useState<InterfacesDefaults>(() => ({
    ...DEFAULT_INTERFACES_DEFAULTS,
    ...(savedPreferences?.workspaceDefaults || {}),
    ...(savedPreferences?.interfacesDefaults || {}),
  }));
  const [globalSystemPrompt, setGlobalSystemPrompt] = useState(
    String(savedPreferences?.globalSystemPrompt || ""),
  );
  const [tokenCount, setTokenCount] = useState(
    typeof savedPreferences?.tokenCount === "number" ? savedPreferences.tokenCount : 0,
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
    setGlobalSystemPrompt(String(savedPreferences.globalSystemPrompt || ""));
    setTokenCount(typeof savedPreferences.tokenCount === "number" ? savedPreferences.tokenCount : 0);
  }, [savedPreferences]);

  const updateTokenCounter = (value: string) => {
    setTokenCount(Math.ceil(value.length / 4));
  };

  const preferenceCards = useMemo<AuxillariesPreferenceCardItem[]>(
    () => [
      {
        id: "terminal-detail-density",
        title: "Terminal detail density",
        description: "Choose how much structured operator signal opens by default in transactions.",
        value: defaults.terminalDetailDensity,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            terminalDetailDensity: value as TerminalDetailDensity,
          })),
        options: [
          {
            value: "signal",
            label: "Signal",
            hint: "Favor concise field groups and higher-level closure cues first.",
          },
          {
            value: "balanced",
            label: "Balanced",
            hint: "Keep summary and consequence detail readable together.",
          },
          {
            value: "full",
            label: "Full",
            hint: "Bias toward denser detail and fuller transaction context on open.",
          },
        ],
      },
      {
        id: "external-interface-entry",
        title: "External interface entry",
        description: "Control which interface should receive work when Bitcode leaves the website surface.",
        value: defaults.externalInterfaceEntry,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            externalInterfaceEntry: value as ExternalInterfaceEntry,
          })),
        options: [
          {
            value: "mcp",
            label: "MCP API",
            hint: "Prefer the protocol API boundary when integrators invoke Bitcode.",
          },
          {
            value: "chatgpt",
            label: "ChatGPT App",
            hint: "Prefer the integratable ChatGPT App path for conversational operators.",
          },
          {
            value: "terminal",
            label: "Terminal",
            hint: "Return to the website Terminal when the work should stay in-product.",
          },
        ],
      },
      {
        id: "proof-mode",
        title: "Proof read mode",
        description: "Decide how evidence and JSON-bearing detail should open when you inspect proofs.",
        value: defaults.proofMode,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            proofMode: value as ProofMode,
          })),
        options: [
          {
            value: "visual",
            label: "Visual",
            hint: "Lead with shaped evidence and field summaries.",
          },
          {
            value: "mixed",
            label: "Mixed",
            hint: "Keep structured shape and raw payload equally visible.",
          },
          {
            value: "raw",
            label: "Raw",
            hint: "Bias toward exact payload reading first.",
          },
        ],
      },
      {
        id: "prompt-tone",
        title: "Instruction tone",
        description: "Choose the user-facing reasoning posture Bitcode should prefer.",
        value: defaults.promptTone,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            promptTone: value as PromptTone,
          })),
        options: [
          {
            value: "bounded",
            label: "Bounded",
            hint: "Stay careful, exact, and boundary-honest before expanding.",
          },
          {
            value: "formal",
            label: "Formal",
            hint: "Keep a clear, operator-grade reading posture.",
          },
          {
            value: "decisive",
            label: "Decisive",
            hint: "Lean toward firmer calls and shorter interpretive flow.",
          },
        ],
      },
      {
        id: "execution-bias",
        title: "Execution bias",
        description: "Set the preferred tradeoff Bitcode should carry when it chooses defaults.",
        value: defaults.executionBias,
        onChange: (value) =>
          setDefaults((current) => ({
            ...current,
            executionBias: value as ExecutionBias,
          })),
        options: [
          {
            value: "balanced",
            label: "Balanced",
            hint: "Keep throughput, quality, and interpretability in tension.",
          },
          {
            value: "quality",
            label: "Quality",
            hint: "Bias toward more bounded, auditable output.",
          },
          {
            value: "throughput",
            label: "Throughput",
            hint: "Bias toward faster flow and quicker default follow-through.",
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
        ledgerizedPipelineModels: "registry_deterministic",
        modelSelectionScope: "non_ledgerized_conversation_only",
        review_profile: savedPreferences?.review_profile || "bitcode-operator-workspace",
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
                  label: "Terminal detail",
                  value:
                    defaults.terminalDetailDensity === "signal"
                      ? "Dense signal"
                      : defaults.terminalDetailDensity === "full"
                        ? "Full read"
                        : "Balanced read",
                  detail: "How much structured detail opens first in transactions.",
                  tone: "emerald",
                },
                {
                  label: "Interface entry",
                  value:
                    defaults.externalInterfaceEntry === "mcp"
                      ? "MCP API"
                      : defaults.externalInterfaceEntry === "chatgpt"
                        ? "ChatGPT App"
                        : "Terminal",
                  detail: "How external interface work should enter or return to Bitcode.",
                  tone: "sky",
                },
                {
                  label: "Proof posture",
                  value:
                    defaults.proofMode === "visual"
                      ? "Visual"
                      : defaults.proofMode === "raw"
                        ? "Raw"
                        : "Mixed",
                  detail: "The default evidence-reading posture for proof-bearing detail.",
                  tone: "violet",
                },
                {
                  label: "Pipeline models",
                  value: "Registry fixed",
                  detail: "Ledgerized Reading uses protocol configuration, not user model preferences.",
                  tone: "amber",
                },
                {
                  label: "Admissions",
                  value: admissionRecords.length ? `${readyAdmissionCount}/${admissionRecords.length} ready` : "Pending",
                  detail: blockedAdmissionCount
                    ? `${blockedAdmissionCount} blocked, ${deferredAdmissionCount} deferred.`
                    : "No blocked interface records.",
                  tone: blockedAdmissionCount ? "amber" : "emerald",
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
            <div className="grid gap-3 lg:grid-cols-2" data-testid="auxillaries-interface-admission-catalog">
              {admissionRecords.length > 0 ? (
                admissionRecords.map((admission) => {
                  const admissionRoot =
                    typeof admission.interfaceAdmissionRoot === "string"
                      ? admission.interfaceAdmissionRoot
                      : "missing-root";
                  const blockers = Array.isArray(admission.blockers) ? admission.blockers : [];
                  const supportedActions = Array.isArray(admission.supportedActions)
                    ? admission.supportedActions
                    : [];
                  const allowedActions = Array.isArray(admission.allowedActions)
                    ? admission.allowedActions
                    : [];
                  const policyRequirements = Array.isArray(admission.policyRequirements)
                    ? admission.policyRequirements
                    : Array.isArray(admission.policyConstraints)
                      ? admission.policyConstraints
                      : [];

                  return (
                    <article
                      key={`${admission.interfaceId || admission.surface}-${admissionRoot}`}
                      className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                            {formatAdmissionValue(admission.surface)}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-white">
                            {formatAdmissionValue(admission.interfaceId)}
                          </h3>
                        </div>
                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                            admission.readiness === "ready"
                              ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
                              : admission.readiness === "blocked"
                                ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                                : "border-sky-300/40 bg-sky-400/10 text-sky-100",
                          ].join(" ")}
                        >
                          {formatAdmissionValue(admission.readiness)}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm text-white/72 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Auth</dt>
                          <dd className="mt-1 font-medium text-white/86">
                            {formatAdmissionValue(admission.authMode)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Source</dt>
                          <dd className="mt-1 font-medium text-white/86">
                            {formatAdmissionValue(admission.sourceSafetyClass)}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Supported</dt>
                          <dd className="mt-1">{formatAdmissionList(supportedActions)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Admitted now</dt>
                          <dd className="mt-1">{formatAdmissionList(allowedActions)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Policy</dt>
                          <dd className="mt-1">{formatAdmissionList(policyRequirements)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Blockers</dt>
                          <dd className="mt-1">{formatAdmissionList(blockers)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Root</dt>
                          <dd className="mt-1 break-all font-mono text-xs text-white/60">{admissionRoot}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[18px] border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Interface admission records are not loaded yet.
                </div>
              )}
            </div>
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

            <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
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
