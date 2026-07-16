'use client';

// Header of the execution page including inline V26 pull-request delivery-template selection.

/* eslint-disable react/no-multi-comp */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
// ReactMarkdown is only needed after a run completes; code-split to keep the
// initial header bundle small. The chunk loads long before the user can see
// the summary, so there is no visible delay.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import ExecutionsHeaderTitle from '@/components/bitcode/pipeline/ExecutionsHeaderTitle/ExecutionsHeaderTitle';
import { ScrollContainer } from '@/components/bitcode/panels/ScrollContainer/ScrollContainer';
import Logo from '@/components/bitcode/branding/Logo/Logo';
import WordRotate from "@/components/bitcode/WordRotate/WordRotate";
import InstructionConfidenceTimer from "@/components/bitcode/pipeline/InstructionConfidenceTimer/InstructionConfidenceTimer";
import type { HeaderProcessingStats } from '@/components/bitcode/pipeline/ExecutionsCompleteHeaderContent/ExecutionsCompleteHeaderContent';
// Load the heavy prism-based code highlighter lazily so the header bundle
// stays small until a markdown section with a <code> block is actually
// rendered.
const CodeBlock = dynamic(() => import("@/components/bitcode/media/SyntaxHighlighter/SyntaxHighlighter"), {
  ssr: false,
});
import { ProcessingIndicator } from "@/components/bitcode/indicators/ProcessingIndicator/ProcessingIndicator";
// global styles for the header
import "@/styles/settle-delivery-header.css";

// Extracted component & styles
import DeliveryTemplateText from "@/components/bitcode/pipeline/ExecutionsDeliveryTemplateText/ExecutionsDeliveryTemplateText";
  import { PageHeaderSection } from '@/components/bitcode/page-header/PageHeaderSection/PageHeaderSection';
  import { CompleteHeaderContent } from '@/components/bitcode/pipeline/ExecutionsCompleteHeaderContent/ExecutionsCompleteHeaderContent';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

// Variants for individual lines / elements to create a smooth, staggered
// "line‑by‑line" reveal when the summary accordion first opens.
const lineItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] }
  }
} as const;

// Container variants to stagger children.
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: 'beforeChildren'
    }
  }
} as const;

const INSTRUCTION_WAIT_THRESHOLD = 0.8;
const INSTRUCTION_CONFIDENCE_MEDIUM = 0.6;
const INSTRUCTION_CONFIDENCE_LOW = 0.4;

const markdownComponents = {

  // Enhanced table styling
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-6 rounded-none border border-purple-500/20 bg-black/20">
      <table {...props} className="min-w-full">
        {props.children}
      </table>
    </div>
  ),
  // Enhanced code block styling with syntax highlighting
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <CodeBlock language={match[1]} className={className}>
        {children as string}
      </CodeBlock>
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    );
  },
  // Enhanced blockquote styling
  blockquote: ({ node, ...props }: any) => (
    <motion.blockquote
      variants={lineItemVariants}
      {...props}
      className="border-l-4 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-transparent pl-4 py-1 my-4 italic"
    >
      {props.children}
    </motion.blockquote>
  ),
  // Enhanced image styling
  img: ({ node, ...props }: any) => (
    <div className="my-6 flex justify-center">
      <img
        {...props}
        className="rounded-none shadow-glow-emerald-subtle max-w-full border border-emerald-500/20 transition-all duration-300 hover:shadow-glow-emerald"
      />
    </div>
  ),
  // Enhanced heading styling
  h1: ({ node, ...props }: any) => (
    <motion.h1
      variants={lineItemVariants}
      {...props}
      className="text-2xl font-bold text-emerald-300 mt-6 mb-4 pb-2 border-b border-emerald-500/20"
    >
      {props.children}
    </motion.h1>
  ),
  h2: ({ node, ...props }: any) => (
    <motion.h2
      variants={lineItemVariants}
      {...props}
      className="text-xl font-semibold text-emerald-300 mt-5 mb-3 pb-1 border-b border-emerald-500/10"
    >
      {props.children}
    </motion.h2>
  ),
  // Enhanced list styling
  ul: ({ node, ...props }: any) => (
    <motion.ul
      variants={lineItemVariants}
      {...props}
      className="pl-6 my-4 space-y-2 list-disc"
    >
      {props.children}
    </motion.ul>
  ),
  ol: ({ node, ...props }: any) => (
    <motion.ol
      variants={lineItemVariants}
      {...props}
      className="pl-6 my-4 space-y-2 list-decimal"
    >
      {props.children}
    </motion.ol>
  ),
  li: ({ node, ...props }: any) => (
    <motion.li
      variants={lineItemVariants}
      {...props}
      className="my-1"
    >
      {props.children}
    </motion.li>
  ),
  p: ({ node, ...props }: any) => (
    <motion.p
      variants={lineItemVariants}
      {...props}
    >
      {props.children}
    </motion.p>
  ),
}

interface DeliveryMechanismSurface {
  url: string;
  number?: number;
  title?: string;
  description?: string;
  content?: string;
  status?: 'open' | 'closed' | 'merged' | 'draft';
  createdAt?: string;
}

interface FileChanges {
  edited: number;
  created: number;
  deleted: number;
  paths: string[];
  /** Optional character-level diff. */
  charDiff?: {
    edited: number;
    created: number;
    deleted: number;
  };
}

interface EduContent {
  title: string;
  subtitle: string;
  body: string | React.ReactNode;
}

interface DeliveryTemplate {
  id: string;
  name: string;
  text: string;
}

type ExtendedProcessingStats = HeaderProcessingStats & {
  gate?: string | null;
  phase?: string | null;
  agent?: string | null;
  iteration?: number | null;
  confidence?: number | null;
  selfInstruction?: string | null;
  suggestions?: string[];
  latestIterationTimestamp?: string | null;
  timeoutSeconds?: number | undefined;
  timeRemainingSeconds?: number | undefined;
  awaitingInstruction?: boolean | undefined;
  runId?: string;
  digest?: {
    agentsDocUpdated: boolean;
    readyToFinish: boolean;
    summary?: string | null;
    questionsAnswered?: number;
    patternsDocumented?: number;
    capturedAt?: string;
  };
};

interface DeliveryTemplateSets {
  pullRequests: DeliveryTemplate[];
}

interface ExecutionPageHeaderProps {
  executionStatus: "execute" | "executing" | "executed";
  onSelectDeliveryTemplateDefinitionOfNeed: (definitionOfRead: string) => void;
  /** If false, suppresses rendering of the summary/TL;DR doc area inside the header */
  renderDocInsideHeader?: boolean;
  /** If false, suppresses rendering of the cards panel inside the header */
  renderCardsInsideHeader?: boolean;
  /** Unified postprocessed object to render under TL;DR */
  postprocessed?: any;
  showSourceEdu?: boolean;
  showAttachmentsEdu?: boolean;
  showEnhanceEdu?: boolean;
  showSaveTemplateEdu?: boolean;
  showExecuteButtonEdu?: boolean;
  showIterationsEdu?: boolean | 'minimize' | 'maximize';
  templates?: DeliveryTemplateSets;
  onTemplateSelect?: (templateId: string, templateCategory: keyof DeliveryTemplateSets) => void;
  /** Settle delivery (buyer PR after rights). Bitcode-owned meaning lives in AssetPack evidence first. */
  settleDelivery?: {
    pullRequest?: DeliveryMechanismSurface | null; // Singular PR delivery mechanism.
    fileChanges?: FileChanges | null;
    summary?: string | null;
  };
  /** Processing metrics from real execution */
  processingStats?: ExtendedProcessingStats;
  /** Repository snapshot metadata */
  repoSnapshot?: { org: string; repo: string; branch: string; commit: string };
  /** Execution type to drive header visuals */
  executionType?: 'agentic-execution:asset-pack';
}

// Define our variants for the header content
const contentVariants = {
  open: {
    height: "auto",
    opacity: 1,
    scale: 1,
    transition: {
      height: { duration: 0.25, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.2, ease: "linear" },
      scale: { duration: 0.2, ease: [0.33, 1, 0.68, 1] }
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    scale: 0.98,
    transition: {
      height: { duration: 0.2, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.15 },
      scale: { duration: 0.15, ease: [0.33, 1, 0.68, 1] }
    },
  },
};

// Define text fade variants with stagger
const textFadeVariants = {
  initial: {
    opacity: 0,
    y: 15,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.33, 1, 0.68, 1],
      delay: 0.05,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1]
    }
  }
};

// Child variant for staggered animations
const childVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1]
    }
  }
};

// (lineItemVariants & staggerContainerVariants now declared near top imports)

/**
 * ExecutionsPageHeader
 *
 * Bitcode shell for choosing delivery mechanisms and reading
 * post-run summaries while Bitcode-owned asset-pack meaning lives in the
 * written-asset surfaces rendered below.
 * Final styling updates:
 * - Perfect corner dot alignment
 * - Clean file changes sub-columns
 * - Larger spacing for comfortable reading
 */
export default function ExecutionsPageHeader({
  executionStatus: mode,
  settleDelivery,
  processingStats,
  repoSnapshot,
  onSelectDeliveryTemplateDefinitionOfNeed,
  renderDocInsideHeader,
  renderCardsInsideHeader,
  showSourceEdu,
  showAttachmentsEdu,
  showEnhanceEdu,
  showSaveTemplateEdu,
  showExecuteButtonEdu,
  showIterationsEdu,
  templates,
  onTemplateSelect,
  executionType,
  postprocessed
}: ExecutionPageHeaderProps) {
  const [activeEdu, setActiveEdu] = React.useState<EduContent | null>(null);
  
  // Memoized education content setters to prevent infinite loops
  const handlePullRequestHover = useCallback(() => {
    setActiveEdu({
      title: "Pull Requests",
      subtitle: "Code Integration",
      body: "Complete code changes that integrate with your architecture. Includes tests, documentation, and adherence to codebase standards."
    });
  }, []);
  
  // Dev Mode feature flag (always off in production)
  const devMode = false;
  // State hooks for dev mode controls (not used when devMode=false)
  const [devModeActive, setDevModeActive] = useState(false);
  const [devModeSettings, setDevModeSettings] = useState({
    mode: 'execute',
    slowEntranceAnimations: false,
    showMockData: false,
    enabledSettleDelivery: {
      pullRequest: false,
      fileChanges: false,
      summary: false,
    },
  });
  // Controls collapsible final summary details
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [entranceKey, setEntranceKey] = useState(0);
  // Refs for scrolling to sections during entrance animation
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  // Animation speed factor
  const entranceSpeedFactor = 1;

  // Helper to scroll a section into view with top margin
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const margin = vh * 0.2;
    let deltaY = 0;
    if (rect.top < margin) {
      // Section starts above desired top margin: scroll up
      deltaY = rect.top - margin;
    } else if (rect.bottom > vh - margin) {
      // Section ends below bottom margin: scroll down
      deltaY = rect.bottom - (vh - margin);
    } else {
      // Already within visible margin bounds
      return;
    }
    window.scrollTo({ top: window.scrollY + deltaY, behavior: 'smooth' });
  };
  // Dynamically scale variants for debugging entrance animations
  const scaledContentVariants = React.useMemo(() => {
    if (entranceSpeedFactor === 1) return contentVariants;
    return {
      open: {
        ...contentVariants.open,
        transition: {
          ...contentVariants.open.transition,
          height: {
            ...contentVariants.open.transition.height,
            duration: contentVariants.open.transition.height.duration * entranceSpeedFactor,
          },
          opacity: {
            ...contentVariants.open.transition.opacity,
            duration: contentVariants.open.transition.opacity.duration * entranceSpeedFactor,
          },
          scale: {
            ...contentVariants.open.transition.scale,
            duration: contentVariants.open.transition.scale.duration * entranceSpeedFactor,
          },
        },
      },
      closed: {
        ...contentVariants.closed,
        transition: {
          ...contentVariants.closed.transition,
          height: {
            ...contentVariants.closed.transition.height,
            duration: contentVariants.closed.transition.height.duration * entranceSpeedFactor,
          },
          opacity: {
            ...contentVariants.closed.transition.opacity,
            duration: contentVariants.closed.transition.opacity.duration * entranceSpeedFactor,
          },
          scale: {
            ...contentVariants.closed.transition.scale,
            duration: contentVariants.closed.transition.scale.duration * entranceSpeedFactor,
          },
        },
      },
    };
  }, [entranceSpeedFactor]);

  const scaledTextFadeVariants = React.useMemo(() => {
    if (entranceSpeedFactor === 1) return textFadeVariants;
    return {
      initial: textFadeVariants.initial,
      animate: {
        ...textFadeVariants.animate,
        transition: {
          ...textFadeVariants.animate.transition,
          duration: (textFadeVariants.animate.transition.duration || 0) * entranceSpeedFactor,
          delay: (textFadeVariants.animate.transition.delay || 0) * entranceSpeedFactor,
          staggerChildren: 0.4 * entranceSpeedFactor,
        },
      },
      exit: {
        ...textFadeVariants.exit,
        transition: {
          ...textFadeVariants.exit.transition,
          duration: (textFadeVariants.exit.transition.duration || 0) * entranceSpeedFactor,
        },
      },
    };
  }, [entranceSpeedFactor]);

  const scaledChildVariants = React.useMemo(() => {
    if (entranceSpeedFactor === 1) return childVariants;
    return {
      initial: childVariants.initial,
      animate: {
        ...childVariants.animate,
        transition: {
          ...childVariants.animate.transition,
          duration: (childVariants.animate.transition.duration || 0) * entranceSpeedFactor,
        },
      },
    };
  }, [entranceSpeedFactor]);

  const effectiveSettleDelivery = settleDelivery ?? {};
  const effectiveMode = mode;
  const iterationConfidence = typeof processingStats?.confidence === 'number' ? processingStats?.confidence : undefined;
  const awaitingInstruction = processingStats?.awaitingInstruction ?? (typeof iterationConfidence === 'number' ? iterationConfidence < INSTRUCTION_WAIT_THRESHOLD : false);
  const timerInitialSecondsRaw = typeof processingStats?.timeRemainingSeconds === 'number'
    ? processingStats.timeRemainingSeconds
    : typeof processingStats?.timeoutSeconds === 'number'
      ? processingStats.timeoutSeconds
      : undefined;
  const timerInitialSeconds = typeof timerInitialSecondsRaw === 'number' && Number.isFinite(timerInitialSecondsRaw)
    ? Math.max(0, Math.round(timerInitialSecondsRaw))
    : undefined;
  const confidenceLevel: 'high' | 'medium' | 'low' = iterationConfidence === undefined
    ? 'high'
    : iterationConfidence >= INSTRUCTION_WAIT_THRESHOLD
      ? 'high'
      : iterationConfidence >= INSTRUCTION_CONFIDENCE_MEDIUM
        ? 'medium'
        : 'low';
  const shouldShowInstructionTimer =
    effectiveMode === 'executing' &&
    awaitingInstruction &&
    typeof timerInitialSeconds === 'number';
  const instructionSuggestions = (processingStats?.suggestions || []).filter(Boolean);
  const instructionSummary = processingStats?.selfInstruction;
  const confidencePercent = iterationConfidence !== undefined ? Math.round(iterationConfidence * 100) : undefined;

  // Track the last shown edu content
  const [lastEduContent, setLastEduContent] = useState<EduContent | null>(null);

  // Handle edu content updates
  useEffect(() => {
    if (showSourceEdu) {
      const sourceEdu = {
        title: "Source",
        subtitle: "Repository Selection",
        body: "Select the codebase snapshot as foundation for generated work. For pull requests, this defines the base branch for changes."
      };
      setActiveEdu(sourceEdu);
      setLastEduContent(sourceEdu);
    } else if (showAttachmentsEdu) {
      const attachmentsEdu = {
        title: "Attachments",
        subtitle: "Contextual Materials",
        body: "Provide files, URLs, and references that establish context. These materials help the agent understand requirements and implementation details."
      };
      setActiveEdu(attachmentsEdu);
      setLastEduContent(attachmentsEdu);
    } else if (showEnhanceEdu) {
      const enhanceEdu = {
        title: "Enhance Writing",
        subtitle: "Improve Definition of Read",
        body: "Use AI to refine and elaborate your Definition of Read, making it more precise and informative."
      };
      setActiveEdu(enhanceEdu);
      setLastEduContent(enhanceEdu);
    } else if (showSaveTemplateEdu) {
      const saveTemplateEdu = {
        title: "Save as Template",
        subtitle: "Save Definition of Read",
        body: "Save your current Definition of Read as a reusable template for future AssetPack runs."
      };
      setActiveEdu(saveTemplateEdu);
      setLastEduContent(saveTemplateEdu);
    } else if (showExecuteButtonEdu) {
      const executeButtonEdu = {
        title: "Execute",
        subtitle: "Initiate Work",
        body: <EducationBodyWithLogo />
      };
      setActiveEdu(executeButtonEdu);
      setLastEduContent(executeButtonEdu);
    } else if (showIterationsEdu) {
      const iterationsEdu = (showIterationsEdu === 'minimize')
        ? {
            title: "Auto-Minimize",
            subtitle: "Efficiency Mode",
            body: (
              <div className="space-y-2 text-sm">
                <div className="text-blue-300">Automatically determines minimum iterations needed to complete the Definition of Read.</div>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li><span className="text-white">Focus on efficiency</span>: Completes requirements with minimal processing</li>
                  <li><span className="text-white">Smart optimization</span>: Balances speed with correctness</li>
                  <li><span className="text-white">Ideal for</span>: Simple fixes, routine tasks, or when speed matters most</li>
                </ul>
                <div className="text-xs text-gray-500 mt-2">The pipeline will self-regulate to find the optimal minimum iteration count.</div>
              </div>
            )
          }
        : (showIterationsEdu === 'maximize')
        ? {
            title: "Auto-Maximize",
            subtitle: "Quality Mode",
            body: (
              <div className="space-y-2 text-sm">
                <div className="text-purple-300">Aggressively ensures comprehensive quality with exhaustive refinement.</div>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li><span className="text-white">Exhaustive testing</span>: Comprehensive test coverage and edge cases</li>
                  <li><span className="text-white">Full documentation</span>: Detailed docs, comments, and explanations</li>
                  <li><span className="text-white">Maximum abstraction</span>: Optimal code organization and reusability</li>
                  <li><span className="text-white">Error handling</span>: Robust error management and recovery</li>
                </ul>
                <div className="text-xs text-gray-500 mt-2">Ideal for production-critical settle delivery requiring maximum reliability.</div>
              </div>
            )
          }
        : {
            title: "Pipeline Iterations",
            subtitle: "DIV Inner Loop Control",
            body: (
              <div className="space-y-2 text-sm">
                <p>Controls the number of Discovery-Implementation-Validation (DIV) cycles the pipeline will execute.</p>
                <p className="text-emerald-300">Each iteration refines and improves the AssetPack output through intelligent feedback loops.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li><span className="text-white">3 iterations (MIN)</span>: Quick first pass, suitable for simple tasks</li>
                  <li><span className="text-white">10-20 iterations</span>: Balanced quality for most AssetPack runs</li>
                  <li><span className="text-white">50+ iterations</span>: Deep refinement for complex work</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Auto-Minimize/Maximize toggles enable automatic iteration adjustment based on pipeline feedback.</p>
              </div>
            )
          };
      setActiveEdu(iterationsEdu);
      setLastEduContent(iterationsEdu);
    } else if (lastEduContent) {
      setActiveEdu(lastEduContent);
    }
  }, [showSourceEdu, showAttachmentsEdu, showEnhanceEdu, showSaveTemplateEdu, showExecuteButtonEdu, showIterationsEdu]);

  // Prepare TL;DR items for the V26 pull-request delivery mechanism.
  const tldrItems: React.ReactNode[] = [];

  // Individual delivery-mechanism links with icons and titles (works for both real and
  // mock data).  We no longer fall back to the older single‑sentence mock
  // summary so that the rich format is always shown when mock data is enabled.

  const pr = effectiveSettleDelivery?.pullRequest;
  if (pr) {
    tldrItems.push(
      <a
        key={`pr-${pr.number}`}
        href={pr.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-emerald-300 hover:text-emerald-200 text-sm"
      >
        <svg className="w-4 h-4 mr-1 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
        </svg>
        <strong className="mr-1">PR:</strong> {pr.title || `#${pr.number}`}
      </a>
    );
  }

  if (tldrItems.length === 0) {
    tldrItems.push(<span key="none">No settle delivery to summarize</span>);
  }
  return (
    <section data-experience="settle-delivery">
      <div
        className={`
          relative
          flex flex-col items-center justify-center text-left space-y-8
          overflow-visible
          max-w-4.5xl
          mx-auto
          transition-[margin,padding] duration-700 ease-orbit-snap
          ${effectiveMode === "execute"
            ? "mb-10 mt-18"
            : effectiveMode === "executing"
              ? "mb-0 mt-18 pointer-events-none"
              : "mb-8 mt-18"
          }
        `}
      >
        {/* Header content */}
        <motion.div
          key={entranceKey}
          className="flex flex-col space-y-8 relative overflow-visible w-full"
          variants={scaledContentVariants}
          initial="open"
          animate={effectiveMode === "executing" ? "closed" : "open"}
        >
          {/* Pipeline run confidence / instruction wait (product execution UI) */}
          {(effectiveMode === "executing" || effectiveMode === "executed") && (
            <motion.div
              className="flex flex-col space-y-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Confidence timer / status while pipeline is executing */}
              {effectiveMode === "executing" && (
                <div className="space-y-3 w-full">
                  {shouldShowInstructionTimer ? (
                    <InstructionConfidenceTimer
                      timeRemaining={timerInitialSeconds!}
                      confidenceLevel={confidenceLevel}
                      isActive={awaitingInstruction}
                      currentPhase={processingStats?.phase || "Implementation"}
                      currentAgent={processingStats?.agent || undefined}
                      onTimerExpire={() => {
                        console.log('[Confidence] Timer expired, agent proceeding autonomously');
                      }}
                    />
                  ) : awaitingInstruction && iterationConfidence !== undefined ? (
                    <div className="rounded-none border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-sm">
                      <p className="font-semibold text-amber-100">
                        Awaiting your instruction ({confidencePercent ?? 0}% confidence).
                      </p>
                      <p className="mt-1 text-amber-100/80">
                        Provide guidance to unlock the next iteration, or choose “No notes” to proceed.
                      </p>
                    </div>
                  ) : iterationConfidence !== undefined ? (
                    <div className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-sm">
                      <p className="font-semibold text-emerald-100">
                        Confidence {confidencePercent ?? 0}% — continuing autonomously.
                      </p>
                      <p className="mt-1 text-emerald-100/80">
                        Add a note at any time to shape the next iteration.
                      </p>
                    </div>
                  ) : null}

                  {(instructionSummary || instructionSuggestions.length > 0) && (
                    <div className="rounded-none border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-200 space-y-2">
                      {instructionSummary && (
                        <p className="font-medium text-sky-100">{instructionSummary}</p>
                      )}
                      {instructionSuggestions.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1">
                          {instructionSuggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sky-100/90">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* execute-mode instructions */}
          {(effectiveMode === "execute" || effectiveMode == "executing") && (
            <motion.div
              className={`relative flex flex-col space-y-6 ${effectiveMode == 'executing' && 'invisible'}`}
              variants={scaledTextFadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.h1
                className="text-3xl tablet:text-4xl desktop:text-5xl font-bold tracking-tight leading-normal mb-2 break-words"
                variants={scaledChildVariants}
              >
                <div className="relative inline-block">
                  <ExecutionsHeaderTitle type={(executionType ?? 'agentic-execution:asset-pack') as any} className="max-w-[100%]" />
                </div>
              </motion.h1>

              <motion.div
                className="flex flex-col desktop:flex-row space-y-6 desktop:space-y-0 desktop:space-x-6"
                variants={scaledChildVariants}
              >
                <motion.div
                  className="space-y-8 max-w-xl flex-shrink-0 pr-4"
                  variants={scaledChildVariants}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-gray-400 text-lg bg-transparent">
                        Connect your codebase, attach multi-modal context, and describe your Read's{' '}
                        <span
                          className="text-gray-300 hover:border-b hover:border-purple-300/90 transition-all duration-150 cursor-help"
                          onMouseEnter={() => setActiveEdu({
                            title: 'Definition of Read',
                            subtitle: 'Success Criteria',
                            body: 'Articulate the precise outcome that defines success. Clear criteria ensure shared understanding of the expected AssetPack evidence and shippable result.'
                          })}
                        >
                          Definition of Read
                        </span>.
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-400 text-lg self-start">
                    <>
                      V26 Finish delivers AssetPack evidence through a{' '}
                    <DeliveryTemplateText
                      text="pull request"
                      templates={templates?.pullRequests}
                      defaultNeed="an opened pull request for:"
                      onSelect={onSelectDeliveryTemplateDefinitionOfNeed}
                      onTemplateSelect={(templateId) => onTemplateSelect?.(templateId, 'pullRequests')}
                      onMouseEnter={handlePullRequestHover}
                      duration={3.2}
                      width={250}
                    /> and records completion as AssetPack evidence.
                    </>
                  </div>
                </motion.div>

                <div className="w-full">
                  <DocBox content={activeEdu} />
                </div>
              </motion.div>
            </motion.div>
          )}

          {effectiveMode === "executed" && effectiveSettleDelivery && (renderDocInsideHeader !== false) && (
            <CompleteHeaderContent
              settleDelivery={effectiveSettleDelivery as any}
              processingStats={processingStats as any}
              repoSnapshot={repoSnapshot as any}
              executionType={executionType}
              postprocessed={postprocessed}
            />
          )}
        </motion.div>
      </div>

    </section>
  );
}

// Removed unused local MetalPlate (shared variant lives at components/bitcode/metal-plate)

function EducationBodyWithLogo() {
  return (
    <div>
      <span><span className="font-bold">This action costs <span className="text-green-primary font-black">$BTD</span>!</span> The source, attachments, and task will be iterated on until you receive a single high-quality asset pack and its delivery result. (<span className="font-normal">~200-500&nbsp;</span>
        <Logo width="w-3.5" height="h-3.5" beta={false} className="inline-block align-middle relative -top-0.5" />
        <span className="font-normal">&nbsp;/&nbsp;Pipeline Run</span>)</span>
    </div>
  );
}

function DocBox({ content }: { content: EduContent | null }) {
  return (
    <motion.div
      className="w-full sticky top-4"
      initial={false}
      animate={{
        opacity: content ? 1 : 0,
        scale: content ? 1 : 0.97,
      }}
      transition={{
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1],
        scale: { duration: 0.4 }
      }}
    >
      <motion.div
        className="relative rounded-none border border-emerald-500/20 bg-black/40 backdrop-blur-sm p-4 overflow-hidden h-[150px]"
        animate={{
          boxShadow: content
            ? "0 0 25px rgba(186, 84, 236, 0.05)"
            : "0 0 0 rgba(186, 84, 236, 0)",
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
          animate={{
            opacity: content ? 1 : 0,
            scale: content ? 1 : 1.1
          }}
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1]
          }}
        />

        {/* Content */}
        <div className="relative h-full">
          <AnimatePresence mode="sync">
            {content && (
              <motion.div
                key={content.title}
                initial={{
                  opacity: 0,
                  y: 15,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.3, // Slightly faster overall duration
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.2 }, // Faster fade for tighter transition
                  scale: { duration: 0.3 },
                  exitBeforeEnter: false // Allow overlap between exit/enter
                }}
                className="absolute inset-0 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <motion.h3
                    className="text-purple-300 font-medium text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {content.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-400 text-xs font-medium ml-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    {content.subtitle}
                  </motion.p>
                </div>
                <motion.p
                  className="text-gray-300 text-sm leading-relaxed mt-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {content.body}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500/20 rounded-full" />
          <div className="absolute top-2 right-6 w-1 h-1 bg-purple-500/10 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}
