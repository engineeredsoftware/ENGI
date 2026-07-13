/**
 * Embedded Terminal-style UI specimens within docs articles.
 */
import React from 'react';

import TerminalWorkspaceCard from '@/components/bitcode/pipeline/BitcodeWorkspaceCard/BitcodeWorkspaceCard';
import type { DocsEmbeddedUiSpecimen } from '@/components/docs/models/bitcode-docs-types';
import { signalToneClassName } from '@/components/docs/models/docs-signal-tone';

function EmbeddedUiSpecimen({ specimen }: { specimen: DocsEmbeddedUiSpecimen }) {
  return (
    <TerminalWorkspaceCard
      id={specimen.id}
      kicker={specimen.eyebrow}
      title={specimen.title}
      summary={specimen.summary}
      explainer={specimen.explainer}
      size="compact"
      tone="emerald"
      className="scroll-mt-32"
      childrenClassName="space-y-4"
    >
      {specimen.signals?.length ? (
        <div className="grid gap-3 tablet:grid-cols-3">
          {specimen.signals.map((signal) => (
            <div
              key={`${specimen.id}-${signal.label}`}
              className={`rounded-none border px-4 py-3 ${signalToneClassName(signal.tone)}`}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-65">{signal.label}</p>
              <p className="mt-2 text-sm font-semibold">{signal.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      {specimen.steps?.length ? (
        <div className="grid gap-3 tablet:grid-cols-3">
          {specimen.steps.map((step, index) => (
            <article
              key={`${specimen.id}-${step.label}`}
              className="rounded-none border border-white/8 bg-black/20 px-4 py-4"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/62">
                {String(index + 1).padStart(2, '0')} / {step.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/76">{step.body}</p>
            </article>
          ))}
        </div>
      ) : null}
    </TerminalWorkspaceCard>
  );
}

export function DocsEmbeddedUiSection({ specimens }: { specimens: readonly DocsEmbeddedUiSpecimen[] }) {
  if (!specimens.length) return null;

  return (
    <section className="grid gap-4">
      <div className="rounded-none border border-cyan-300/10 bg-cyan-400/[0.035] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/72">Interface preview</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Learn with the same UI grammar used in Terminal
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-cyan-50/72">
          These embedded specimens reuse the Terminal card and explainer pattern so docs readers
          become familiar with the real product surfaces before they operate against them.
        </p>
      </div>
      {specimens.map((specimen) => (
        <EmbeddedUiSpecimen key={specimen.id} specimen={specimen} />
      ))}
    </section>
  );
}
