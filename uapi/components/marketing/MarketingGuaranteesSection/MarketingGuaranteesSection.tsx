"use client";

import React from 'react';
import MarketingSectionWrapper from '@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper';
import { NavProcessingIndicator } from '@/components/bitcode/indicators/NavProcessingIndicator/NavProcessingIndicator';

export default function MarketingGuaranteesSection() {
  // File-local class constants for clarity and reuse
  const sectionTitleClass = 'text-3xl laptop:text-5xl desktop:text-6xl font-extrabold leading-snug tracking-tight pb-4 bg-gradient-to-r from-emerald-300 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)]';
  const pillarTitleClass = 'text-2xl tablet:text-4xl laptop:text-5xl desktop:text-6xl font-bold text-emerald-400 super-shiny-text';
  const summaryTextClass = 'text-gray-300 text-base tablet:text-lg laptop:text-xl max-w-3xl mx-auto tracking-wide leading-relaxed';
  const beamHorizontalClass = 'my-8 h-px w-full bg-[linear-gradient(to_right,_#10B981_0%,_#6EE7B7_50%,_#10B981_100%)] drop-shadow-[0_0_6px_rgba(103,254,183,0.5)] block laptop:hidden';
  const beamVerticalClass = 'hidden laptop:block self-stretch w-px bg-[linear-gradient(to_bottom,_#10B981_0%,_#6EE7B7_50%,_#10B981_100%)] drop-shadow-[0_0_6px_rgba(103,254,183,0.5)] mx-6';
  return (
    <MarketingSectionWrapper className="overflow-visible" id="guarantees-section" disableHorizontalPadding>
      <div className="text-center mb-10">
        <h2 className={sectionTitleClass}>
          Unmatched Technical Guarantees
        </h2>
      </div>
      <div className="flex flex-col gap-y-10 laptop:flex-row laptop:gap-y-0 items-start laptop:items-center">
        {/* Pillar 1 */}
        <div className="flex-1 text-center laptop:text-left">
          <h3 className={pillarTitleClass}>
            Ultra-Deep Coding Iteration
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start tablet:items-center">
              <NavProcessingIndicator className="scale-75 mr-3 mt-1 tablet:mt-0 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm tablet:text-base laptop:text-lg leading-snug">
                <strong className="text-white">Volume &amp; Scope</strong>: deconstructs tasks into sequences of 1000s of progressive steps
              </span>
            </li>
            <li className="flex items-start tablet:items-center">
              <NavProcessingIndicator className="scale-75 mr-3 mt-1 tablet:mt-0 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm tablet:text-base laptop:text-lg leading-snug">
                <strong className="text-white">Compounds Validation</strong>: context, language, virtualization, and procurement tools
              </span>
            </li>
          </ul>
        </div>
        {/* Beam separator – vertical on ≥md, horizontal on mobile */}
        <div className={beamHorizontalClass} />
        <div className={beamVerticalClass} />
        {/* Pillar 2 */}
        <div className="flex-1 text-center laptop:text-left">
          <h3 className={pillarTitleClass}>
            Proactively Self-Improving
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start tablet:items-center">
              <NavProcessingIndicator className="scale-75 mr-3 mt-1 tablet:mt-0 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm tablet:text-base laptop:text-lg leading-snug">
                <strong className="text-white">Always Working</strong>: masters knowledge of the codebase, dependencies, and domains
              </span>
            </li>
            <li className="flex items-start tablet:items-center">
              <NavProcessingIndicator className="scale-75 mr-3 mt-1 tablet:mt-0 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm tablet:text-base laptop:text-lg leading-snug">
                <strong className="text-white">Prepared Evidence Documents</strong>: records mistakes, readies tools, studies documentation
              </span>
            </li>
          </ul>
        </div>
        {/* Beam separator – vertical on ≥md, horizontal on mobile */}
        <div className={beamHorizontalClass} />
        <div className={beamVerticalClass} />
        {/* Pillar 3 */}
        <div className="flex-1 text-center laptop:text-left">
          <h3 className={pillarTitleClass}>
            Real Industrial Intelligence
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start tablet:items-center">
              <NavProcessingIndicator className="scale-75 mr-3 mt-1 tablet:mt-0 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm tablet:text-base laptop:text-lg leading-snug">
                <strong className="text-white">Beyond Training Data</strong>: closed-source expertise, private research, monetized
              </span>
            </li>
            <li className="flex items-start tablet:items-center">
              <NavProcessingIndicator className="scale-75 mr-3 mt-1 tablet:mt-0 text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm tablet:text-base laptop:text-lg leading-snug">
                <strong className="text-white">Innovate with AI</strong>: sync with real-world industry to generate new frontiers
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className={summaryTextClass}>
          Plus all the agent essentials—
          <span className="font-semibold text-white">chat shepherding</span>,&nbsp;
          <span className="font-semibold text-white">PR-backed AssetPacks</span>,&nbsp;
          <span className="font-semibold text-white">deep research</span>,&nbsp;
          <span className="font-semibold text-white">source-to-shares fit evidence</span>,&nbsp;
          <span className="font-semibold text-white">system configuration</span>,&nbsp;
          <span className="font-semibold text-white">multi-modality</span>, and&nbsp;
          <span className="font-semibold text-white">data-share compensation</span>.
        </p>
      </div>
    </MarketingSectionWrapper>
  );
}
