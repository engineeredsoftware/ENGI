'use client';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer';

import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import TerminalOpenConversationsButton from './TerminalOpenConversationsButton';
import TerminalOpenAuxillariesButton from './TerminalOpenAuxillariesButton';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from './terminal-workspace-explainers';
import { TERMINAL_ACTIONS, TERMINAL_EXPERIENCES } from './terminal-experience-architecture';
import { jumpToShellSection } from './terminal-shell-reading';

interface TerminalExperienceFrameProps {
  onOpenConversations: () => void;
  conversationsEnabled?: boolean;
}

export default function TerminalExperienceFrame({
  onOpenConversations,
  conversationsEnabled = true,
}: TerminalExperienceFrameProps) {
  return (
    <TerminalWorkspaceCard
      kicker="Mode map"
      title="Keep Terminal focused on Deposit, Read, and recent results"
      summary="Terminal stays focused on writing Deposit and Read work, reading recent activity results, and continuing closure from the selected result."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.experienceMap}
    >
      <div className="grid gap-3 text-xs uppercase tracking-[0.22em] text-neutral-400 tablet:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2">
            <p className="text-emerald-300/85">Read window</p>
            <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.readWindow} />
          </div>
          <p className="mt-2 text-neutral-200">recent activity + selected result</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-2">
            <p className="text-emerald-300/85">Write posture</p>
            <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.writePosture} />
          </div>
          <p className="mt-2 text-neutral-200">deposit + read + closure</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {TERMINAL_EXPERIENCES.filter((experience) => experience.id === 'terminal-activity').map((experience) => (
          <article key={experience.id} className="rounded-[1.6rem] border border-white/8 bg-black/20 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">{experience.badge}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{experience.label}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-300">
                experience
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-300">{experience.description}</p>
            <div className="mt-5">
              {experience.id === 'terminal-activity' ? (
                <button
                  type="button"
                  onClick={() => jumpToShellSection(experience.targetId)}
                  className="rounded-[1.3rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
                >
                  Focus activity ledger
                </button>
              ) : experience.id === 'conversations' && conversationsEnabled ? (
                <TerminalOpenConversationsButton
                  onOpen={onOpenConversations}
                  className="rounded-[1.3rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
                />
              ) : (
                <TerminalOpenAuxillariesButton
                  className="rounded-[1.3rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10"
                />
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {TERMINAL_ACTIONS.map((action) => (
          <article
            key={action.id}
            className="rounded-[1.6rem] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(8,14,28,0.92),rgba(5,10,20,0.9))] px-5 py-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">{action.badge}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{action.label}</h3>
              </div>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-200">
                action
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-300">{action.description}</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => jumpToShellSection(action.targetId)}
                className="rounded-[1.3rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
              >
                Focus {action.label.toLowerCase()}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-black/20 px-5 py-5">
        <div className="flex items-center gap-2">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Closure stages</p>
          <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.closureAction} />
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Verification, branch artifacts, settlement, proofs, asset packs, and history stay connected as one working
          chain instead of scattering across separate destinations.
        </p>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(8,14,28,0.92),rgba(5,10,20,0.9))] px-5 py-5">
        <div className="flex items-center gap-2">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-emerald-300/80">Production realism</p>
          <BitcodeInlineExplainer explainer={TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime} />
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Bitcode is built for open, auditable, formal operation across producers, consumers, investors, partners, and
          researchers, with modular and observable system surfaces tuned toward throughput, quality, cost, and trust.
        </p>
      </div>
    </TerminalWorkspaceCard>
  );
}
