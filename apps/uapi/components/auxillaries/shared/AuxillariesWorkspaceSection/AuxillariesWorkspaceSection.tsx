"use client";

import React from "react";

import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import { cn } from "@bitcode/styling";

type AuxillariesWorkspaceTone = "default" | "emerald" | "sky" | "violet" | "amber";

/** Borders keep hue; fills use glass tokens so right column matches left opacity. */
const TONE_STYLES: Record<AuxillariesWorkspaceTone, string> = {
  default: "auxillaries-glass-card border-white/10",
  emerald: "auxillaries-glass-card border-emerald-300/18",
  sky: "auxillaries-glass-card border-sky-300/18",
  violet: "auxillaries-glass-card border-violet-300/18",
  amber: "auxillaries-glass-card border-amber-300/18",
};

interface AuxillariesWorkspaceSectionProps {
  kicker?: string;
  title: string;
  description?: string;
  explainer?: BitcodeExplainer;
  tone?: AuxillariesWorkspaceTone;
  className?: string;
  children: React.ReactNode;
}

export default function AuxillariesWorkspaceSection({
  kicker,
  title,
  description,
  explainer,
  tone = "default",
  className,
  children,
}: AuxillariesWorkspaceSectionProps) {
  return (
    <section
      className={cn(
        "rounded-none border p-5",
        TONE_STYLES[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {kicker ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/72">
              {kicker}
            </p>
          ) : null}
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-7 text-white/68">{description}</p>
          ) : null}
        </div>
        {explainer ? (
          <BitcodeInlineExplainer explainer={explainer} side="bottom" className="shrink-0" />
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
