"use client";

import React from "react";

import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import { cn } from "@bitcode/styling";

type AuxillariesWorkspaceTone = "default" | "emerald" | "sky" | "violet" | "amber";

const TONE_STYLES: Record<AuxillariesWorkspaceTone, string> = {
  default: "border-white/10 bg-black/20",
  emerald: "border-emerald-300/18 bg-emerald-400/8",
  sky: "border-sky-300/18 bg-sky-400/8",
  violet: "border-violet-300/18 bg-violet-400/8",
  amber: "border-amber-300/18 bg-amber-400/8",
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
        "rounded-none border p-5 shadow-[0_20px_45px_rgba(0,0,0,0.2)]",
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
