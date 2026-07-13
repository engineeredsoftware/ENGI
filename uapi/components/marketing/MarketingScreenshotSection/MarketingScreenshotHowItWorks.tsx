/**
 * How-it-Works 1-2-3 step cards with gallery-linked floating thumbnails.
 */
"use client";

import React from "react";
import {
  EnvelopeIcon,
  ArrowDownTrayIcon,
  WalletIcon,
  BuildingOfficeIcon,
  FolderIcon,
  ArrowPathRoundedSquareIcon,
  HashtagIcon,
  SquaresPlusIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PaperClipIcon,
  LinkIcon,
  CodeBracketIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import MarketingThumbnailStack from "@/components/marketing/MarketingThumbnailStack/MarketingThumbnailStack";
import type { Screenshot } from "@/components/marketing/MarketingTypes/marketing-types";
import {
  STEP1_SCREENS,
  STEP2_SCREENS,
  STEP3_SCREENS,
  type ScreenshotHighlightGroup,
} from "./marketing-screenshot-data";

export interface MarketingScreenshotHowItWorksProps {
  howItWorksRef: React.RefObject<HTMLDivElement | null>;
  step1Ref: React.RefObject<HTMLDivElement | null>;
  installRef: React.RefObject<HTMLLIElement | null>;
  arrowRef: React.RefObject<SVGSVGElement | null>;
  arrowPathRef: React.RefObject<SVGPathElement | null>;
  arrowHeadRef: React.RefObject<SVGPathElement | null>;
  highlightGroup: ScreenshotHighlightGroup | null;
  setHighlightGroup: (group: ScreenshotHighlightGroup | null) => void;
  openGallery: (screens: Screenshot[], index?: number) => void;
}

export function MarketingScreenshotHowItWorks({
  howItWorksRef,
  step1Ref,
  installRef,
  arrowRef,
  arrowPathRef,
  arrowHeadRef,
  highlightGroup: _highlightGroup,
  setHighlightGroup,
  openGallery,
}: MarketingScreenshotHowItWorksProps) {
  const step1Screens = STEP1_SCREENS;
  const step2Screens = STEP2_SCREENS;
  const step3Screens = STEP3_SCREENS;

  return (
    <div
      ref={howItWorksRef}
      className="mt-12 w-full max-w-5xl mx-auto px-4 relative z-10"
      id="how-it-works"
    >
      <svg
        ref={arrowRef}
        className="hidden laptop:block absolute pointer-events-none"
        style={{ overflow: "visible" }}
        width="0"
        height="0"
        viewBox="0 0 1 1"
        fill="none"
      >
        <path
          ref={arrowPathRef}
          stroke="#34d399"
          strokeWidth="3"
          strokeDasharray="4 8"
          vectorEffect="non-scaling-stroke"
        />
        <path ref={arrowHeadRef} fill="#34d399" />
      </svg>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 tablet:gap-6 gap-y-8">
        {/* STEP 1 – Setup */}
        <div
          ref={step1Ref}
          className="relative p-6 rounded-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-400/10 to-black/10 backdrop-blur-sm flex flex-col overflow-visible"
        >
          <div className="flex items-center mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/25 text-emerald-300 font-bold mr-3">
              1
            </span>
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Setup
            </h3>
          </div>
          <p className="absolute -top-4 left-4 right-4 text-center text-[12px] laptop:text-sm font-medium text-emerald-100 leading-snug select-none pointer-events-none px-3 py-1 rounded-md bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/30 shadow-md">
            Minimal Onboarding, Easy Integration
          </p>
          <ul className="space-y-3">
            {[
              { label: "Confirm email", icon: EnvelopeIcon },
              { label: "Install GitHub App", icon: ArrowDownTrayIcon },
              { label: "Acquire $BTD", icon: WalletIcon },
            ].map(({ label, icon: Icon }, idx) => (
              <li
                key={label}
                ref={idx === 1 ? installRef : undefined}
                className="flex items-center text-base text-slate-200 font-medium px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 shadow-sm"
                style={{ filter: "drop-shadow(0 0 12px rgba(52,211,153,0.55))" }}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 mr-4 rounded-full bg-emerald-500/20">
                  <Icon className="w-5 h-5 text-emerald-300" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          {step1Screens.slice(0, 3).map((shot, idx) => {
            const positions = [
              "absolute right-0 translate-x-full bottom-10 w-32 h-20 invisible",
              "absolute right-4 laptop:left-1/4 laptop:-translate-x-1/2 w-28 laptop:w-32 h-16",
              "absolute right-4 laptop:left-3/4 laptop:-translate-x-1/2 w-28 laptop:w-32 h-16",
            ];
            return (
              <div
                key={shot.id}
                className={`${positions[idx]} pointer-events-auto hover:scale-[1.06] transition-transform ${idx === 1 ? "top-[34%] laptop:top-[90%]" : idx === 2 ? "top-[59%] laptop:top-[90%]" : ""}`}
                style={{ filter: "drop-shadow(0 0 12px rgba(52,211,153,0.55))" }}
              >
                <MarketingThumbnailStack
                  images={[shot.src]}
                  onThumbClick={() => openGallery(step1Screens, idx)}
                  pad={false}
                  className="!w-full !h-full grid grid-cols-1 !grid-rows-1 gap-0 border border-slate-700 rounded-md shadow-lg"
                />
              </div>
            );
          })}
        </div>

        {/* STEP 2 – Command */}
        <div className="relative p-6 rounded-lg border border-sky-500/40 bg-gradient-to-br from-sky-400/10 to-black/10 backdrop-blur-sm flex flex-col overflow-visible min-w-0">
          <div className="flex items-center mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/25 text-sky-300 font-bold mr-3">
              2
            </span>
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
              Command
            </h3>
          </div>
          <p className="absolute -top-4 left-4 right-4 text-center text-[12px] laptop:text-sm font-medium text-sky-100 leading-snug select-none pointer-events-none px-3 py-1 rounded-md bg-sky-500/15 backdrop-blur-sm border border-sky-400/30 shadow-md">
            Define Tasks, Attach References
          </p>

          <div className="grid grid-cols-2 gap-6 text-xs place-content-center justify-items-center px-4 w-full mt-4 tablet:mt-8">
            <div
              onMouseEnter={() => setHighlightGroup("assetPacks")}
              onMouseLeave={() => setHighlightGroup(null)}
              className="relative flex flex-col justify-center items-center p-3 rounded-md border border-sky-400/15"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1">
                  <BuildingOfficeIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200">Org</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FolderIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200">Repo</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowPathRoundedSquareIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200">Branch</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <HashtagIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200">Commit</span>
                </div>
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full text-sky-200 text-xs font-semibold text-nowrap">
                Source Snapshot
              </span>
            </div>

            <div
              onMouseEnter={() => setHighlightGroup("evidenceDocuments")}
              onMouseLeave={() => setHighlightGroup(null)}
              className="relative flex flex-col justify-center items-center p-3 rounded-md border border-sky-400/15"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1">
                  <PencilSquareIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200 text-center text-nowrap">
                    Issue, PR
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <PaperClipIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200 text-center">Files</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <LinkIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200">URLs</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <SquaresPlusIcon className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] text-sky-200 text-center">Connects</span>
                </div>
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full text-sky-200 text-xs font-semibold">
                Attachments
              </span>
            </div>
          </div>

          {Array.from({ length: 4 }).map((_, idx) => {
            const shot = step2Screens[idx % step2Screens.length];
            const positions = [
              "absolute left-1/4 -translate-x-1/2 bottom-14 w-32 h-20 invisible",
              "absolute left-3/4 -translate-x-1/2 bottom-14 w-32 h-20 invisible",
              "absolute left-1/4 -translate-x-1/2 -bottom-8 w-32 h-16",
              "absolute left-3/4 -translate-x-1/2 -bottom-8 w-32 h-16",
            ];
            return (
              <div
                key={shot.id + idx}
                className={`${positions[idx]} pointer-events-auto hover:scale-[1.06] transition-transform`}
                style={{ filter: "drop-shadow(0 0 12px rgba(56,189,248,0.55))" }}
              >
                <MarketingThumbnailStack
                  images={[shot.src]}
                  onThumbClick={() =>
                    openGallery(step2Screens, idx % step2Screens.length)
                  }
                  pad={false}
                  className="!w-full !h-full grid grid-cols-1 !grid-rows-1 gap-0 border border-slate-700 rounded-md shadow-lg"
                />
              </div>
            );
          })}
        </div>

        {/* STEP 3 – Receive */}
        <div className="relative p-6 rounded-lg border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-400/10 to-black/10 backdrop-blur-sm flex flex-col overflow-visible min-w-0">
          <div className="flex items-center mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-fuchsia-500/25 text-fuchsia-300 font-bold mr-3">
              3
            </span>
            <h3 className="text-xl font-bold bg-gradient-to-r from-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
              Receive
            </h3>
          </div>
          <p className="absolute -top-4 left-4 right-4 text-center text-[12px] laptop:text-sm font-medium text-fuchsia-100 leading-snug select-none pointer-events-none px-3 py-1 rounded-md bg-fuchsia-500/15 backdrop-blur-sm border border-fuchsia-400/30 shadow-md">
            AssetPacks Finished Through Pull Requests
          </p>
          <div className="space-y-4 mt-1 text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300 select-none text-left mb-3">
                AssetPack
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: "PR Shippable",
                    icon: CodeBracketIcon,
                    cls: "bg-blue-600/20 text-blue-200 border-blue-500/40",
                  },
                  {
                    label: "Code Changes",
                    icon: DocumentTextIcon,
                    cls: "bg-yellow-600/20 text-yellow-200 border-yellow-500/40",
                  },
                  {
                    label: "Proof Receipts",
                    icon: ClipboardDocumentCheckIcon,
                    cls: "bg-emerald-600/20 text-emerald-200 border-emerald-500/40",
                  },
                ].map(({ label, icon: Icon, cls }) => (
                  <span
                    key={label}
                    className={`relative inline-flex items-center pr-4 pl-6 py-1.5 rounded-md border text-sm leading-tight whitespace-nowrap ${cls}`}
                  >
                    <Icon className="absolute -top-3 -left-3 w-6 h-6 p-1 rounded-full bg-black/70 shadow-md pointer-events-none" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300 select-none text-left mb-3">
                Evidence Documents
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: "MCP APIs",
                    icon: WrenchScrewdriverIcon,
                    cls: "bg-indigo-600/20 text-indigo-200 border-indigo-500/40",
                  },
                  {
                    label: "Extensions",
                    icon: PuzzlePieceIcon,
                    cls: "bg-purple-600/20 text-purple-200 border-purple-500/40",
                  },
                  {
                    label: "Feedback",
                    icon: MegaphoneIcon,
                    cls: "bg-pink-600/20 text-pink-200 border-pink-500/40",
                  },
                ].map(({ label, icon: Icon, cls }) => (
                  <span
                    key={label}
                    className={`relative inline-flex items-center pr-4 pl-6 py-1.5 rounded-md border text-sm leading-tight whitespace-nowrap ${cls}`}
                  >
                    <Icon className="absolute -top-3 -left-3 w-6 h-6 p-1 rounded-full bg-black/70 shadow-md pointer-events-none" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {step3Screens.slice(0, 4).map((shot, idx) => {
            const positions = [
              "absolute left-1/4 -translate-x-1/2 -bottom-5 w-32 h-20 invisible",
              "absolute left-[66%] -translate-x-1/2 -bottom-5 w-32 h-16",
              "absolute right-4 laptop:-right-2 top-[17%] laptop:top-[55%] -translate-y-1/2 w-32 h-16 laptop:translate-x-1/2",
              "absolute right-4 translate-x-1/4 top-6 w-32 h-16",
            ];
            return (
              <div
                key={shot.id}
                className={`${positions[idx]} pointer-events-auto hover:scale-[1.06] transition-transform`}
                style={{ filter: "drop-shadow(0 0 12px rgba(232,121,249,0.55))" }}
              >
                <MarketingThumbnailStack
                  images={[shot.src]}
                  onThumbClick={() => openGallery(step3Screens, idx)}
                  pad={false}
                  className="!w-full !h-full grid grid-cols-1 !grid-rows-1 gap-0 border border-slate-700 rounded-md shadow-lg"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
