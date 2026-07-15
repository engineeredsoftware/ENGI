'use client';

/* eslint-disable react/no-multi-comp */


/**
 * Competitor comparison table section for marketing pages.
 * Data and subpanels live co-located; this file owns table interaction shell.
 */
import React, { useState } from "react";
import styles from './marketing-competitor-table-section.module.css';
import MarketingSectionWrapper from '@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper';
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { DisabledTooltipWrapper } from "@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper";

import {
  ORDERED_COLUMNS,
  ROWS,
  COLUMN_INFO,
  BITCODE_CRUSH_COPY,
  type Status,
} from './marketing-competitor-table-data';
import { MarketingCompetitorDocBox } from './MarketingCompetitorDocBox';
import { MarketingBitcodeAdvantageCard } from './MarketingBitcodeAdvantageCard';
import Logo from '@/components/bitcode/branding/Logo/Logo';

export default function MarketingCompetitorTableSection() {
  // default focus "Deep Coding" (index 0) so card is visible and height fixed
  const [activeCol, setActiveCol] = useState<number>(0);

  const activeColumnKey = ORDERED_COLUMNS[activeCol];

  return (
    <MarketingSectionWrapper id="comparison" disablePadding className={`py-16 desktop:py-24 ${styles.competitorSection}`}>
      {/* Heading */}
      <div className="mx-auto max-w-6xl text-center mb-6">
        <h2 className="text-2xl laptop:text-3xl font-bold mb-4 super-shiny-text">
          The Autonomous, Self-Improving Software Factory
        </h2>
        <p className="text-base laptop:text-lg text-gray-300 max-w-3xl mx-auto">
          Source-to-shares execution measures Reads, reviews fit, and produces AssetPacks with proof-visible settlement evidence.
        </p>
      </div>

      {/* Styles moved to CSS Module */}

      {/* Dual card area – generic column explainer (left) & Bitcode advantage (right)
       * Reduce fixed height to tighten vertical space (approx. one-third less). */}
      <div className="mx-auto max-w-6xl mb-10 grid grid-cols-1 laptop:grid-cols-2 gap-6 h-[150px] relative">
        {/* Generic explainer */}
        <MarketingCompetitorDocBox
          content={{
            title: COLUMN_INFO[activeColumnKey].title,
            subtitle: COLUMN_INFO[activeColumnKey].subtitle,
            body: COLUMN_INFO[activeColumnKey].description,
          }}
        />

        {/* Bitcode Excellence / Elimination wrapper with persistent logo */}
        <div className="relative w-full h-full">
          {/* Persistent glowing logo */}
          {/* Logo + floating label */}
          <div className="absolute top-3 right-3 laptop:top-4 laptop:right-4 flex items-center gap-1 pointer-events-none select-none z-20">
            {activeColumnKey === 'Local Interfaces' ? (
              <>
                <Logo
                  className="marketing-glowing-logo-red rotate-90"
                  width="w-6 laptop:w-7"
                  height="h-6 laptop:h-7"
                  fill="theme(colors.brand.red)"
                />
                <span className="text-[9px] laptop:text-[10px] font-semibold uppercase tracking-wider text-red-400 marketing-glowing-label-red">
                  Bitcode&nbsp;Elimination
                </span>
              </>
            ) : (
              <>
                <Logo
                  className="marketing-glowing-logo"
                  width="w-6 laptop:w-7"
                  height="h-6 laptop:h-7"
                  fill="theme(colors.brand.emerald)"
                />
                <span className="text-[9px] laptop:text-[10px] font-semibold uppercase tracking-wider text-brand-emerald marketing-glowing-label">
                  Bitcode&nbsp;Excellence
                </span>
              </>
            )}
          </div>

          {/* Animated content */}
          <AnimatePresence mode="wait" initial={false}>
            <MarketingBitcodeAdvantageCard
              content={BITCODE_CRUSH_COPY[activeColumnKey]}
              key={activeColumnKey}
              variant={activeColumnKey === 'Local Interfaces' ? 'elimination' : 'excellence'}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Comparison table */}
      {/*
       * Scroll container – add left padding equal to the sticky column’s width
       * (≈ 96 px) so that column no longer counts toward the scrollable area.
       * Then pull the actual table back to its original visual start with a
       * matching negative margin.
       *
       * This reduces `scrollWidth` by exactly the sticky-column width while
       * keeping the layout and look unchanged.
       */}
      <div
        className="overflow-x-auto max-w-6xl mx-auto laptop:pl-[96px]"
        onMouseLeave={() => setActiveCol(0)}
      >
        {/* Clip-box makes the scrollable area exactly table-width minus the
            sticky column (calculated inside with table's calc-size). This eliminates the overscroll without
            altering table layout. */}
        {/* Clip-box – keep x-hidden to cap scroll width (sticky column hack) */}
        {/*
         * The clip-box MUST keep its `overflow-x-hidden` behaviour across all
         * break-points. A recent mobile tweak flipped the default to
         * `overflow-x-visible` which inadvertently collapsed the scrollable
         * area down to 0 px height on some browsers — effectively hiding the
         * entire table (headers & rows disappeared). Restoring the original
         * `overflow-x-hidden` value fixes the regression while still allowing
         * the wider table to scroll inside its parent wrapper as intended.
         */}
        <div
          className="inline-block w-max min-w-full rounded-lg border border-white/10 overflow-x-auto phone:overflow-x-scroll laptop:overflow-x-hidden laptop:-ml-[96px] touch-pan-x"
        >
          {/*
           * Use `w-max` instead of `min-w-full` so the table’s scrollable width
           * always hugs the content exactly.  This prevents an extra blank space
           * (that looked like an empty column) showing up once the user scrolls
           * all the way to the far-right edge.
           */}
          {/*
         * Use `table-fixed` so the browser calculates the scrollable width
         * purely from the explicit column sizes instead of trying to auto-
         * expand for sticky cells (Chrome/Safari bug – sticky first column adds
         * its width twice, producing ~ one-column of blank space on the far
         * right).  Keeping `w-max` ensures we still hug the content width. */}
          <table
            className="text-xs phone:text-xs tablet:text-sm border-collapse border-spacing-0 w-max laptop:table-fixed min-w-full"
          >
            <thead className="bg-white/5 backdrop-blur">
              <tr>
                {/* Header cell for the sticky competitor column – match body padding
                 so we don't end up with what visually looks like an empty/extra
                 column at the far edge of the table. */}
                {/* Sticky header for the competitor column so that the column
                 behaves exactly like the body cells (otherwise the table keeps
                 the extra width of the column even after it scrolls out of
                 view, letting the user scroll one-column further than
                 necessary). */}
                <th
                  className="text-left font-semibold text-gray-300 px-2.5 py-2 whitespace-nowrap laptop:sticky laptop:left-0 backdrop-blur z-[2] bg-black/30"
                >
                  <span className="sr-only">Competitor</span>
                </th>

                {ORDERED_COLUMNS.map((col, idx) => (
                  <th
                    key={col}
                    className={`px-2.5 py-2 font-semibold whitespace-normal leading-snug min-w-[6.5rem] transition-colors text-sm tablet:text-base ${activeCol === idx
                        ? col === 'Local Interfaces'
                          ? 'text-red-400'
                          : 'text-brand-emerald'
                        : 'text-gray-300'
                      }`}
                    onMouseEnter={() => setActiveCol(idx)}
                    onMouseOver={() => setActiveCol(idx)}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, rowIdx) => (
                <motion.tr
                  key={row.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIdx * 0.04 }}
                  className={`relative ${row.name === "Bitcode"
                    ? "marketing-bitcode-row-glow"
                    : "border-t border-white/5"
                    }`}
                >
                  {/* Company name */}
                  <th
                    className={`text-left font-medium px-2.5 py-2 whitespace-nowrap laptop:sticky laptop:left-0 backdrop-blur z-[1] relative flex items-center ${row.name === "Bitcode"
                      ? "marketing-bitcode-logo-cell"
                      : "bg-black/30 text-gray-100 text-sm"
                      }`}
                  >
                    {row.name === "Bitcode" ? (
                      <BitcodeSoftwareSvgLogo
                        width="92px"
                        height="auto"
                        softwareClassName="hidden"
                      />
                    ) : (
                      row.name
                    )}
                  </th>

                  {/* Values */}
                  {row.values.map((value, colIdx) => (
                    <td
                      key={colIdx}
                      className={`text-center px-2.5 py-2 ${row.name === "Bitcode"
                        ? "bg-brand-emerald/5 font-semibold text-[1.55rem] laptop:text-[2.3rem]"
                        : "text-xl"
                        }`}
                      onMouseEnter={() => setActiveCol(colIdx)}
                      onMouseOver={() => setActiveCol(colIdx)}
                    >
                      <span
                        className={
                          activeCol === colIdx
                            ? "inline-block scale-110 transition-transform"
                            : ""
                        }
                      >
                        {value === "✅" ? (
                          <CheckCircleIcon
                            className={`inline text-brand-emerald ${row.name === "Bitcode" ? "h-9 w-9 marketing-bitcode-icon-glow" : "h-6 w-6"
                              }`}
                          />
                        ) : value === "±" ? (
                          <MinusCircleIcon
                            className={`inline text-yellow-400 ${row.name === "Bitcode" ? "h-9 w-9 marketing-bitcode-icon-glow" : "h-6 w-6"
                              }`}
                          />
                        ) : value === "⏳" ? (
                          row.name === "Bitcode" ? (
                            <DisabledTooltipWrapper
                              tooltip="Coming&nbsp;Soon"
                              placement="left"
                              variant="purple"
                            >
                              <ClockIcon
                                className="inline text-purple-300 h-9 w-9 marketing-coming-soon-spin"
                                style={{
                                  filter:
                                    'drop-shadow(0 0 4px theme(colors.brand.purple-glow)) drop-shadow(0 0 10px theme(colors.brand.purple-glow-subtle))',
                                }}
                              />
                            </DisabledTooltipWrapper>
                          ) : (
                            <ClockIcon
                              className={`inline text-gray-400 ${row.name === "Bitcode" ? "h-9 w-9" : "h-6 w-6"}`}
                            />
                          )
                        ) : (
                          <XCircleIcon
                            className={`inline text-red-500 ${row.name === "Bitcode" && ORDERED_COLUMNS[colIdx] === "Local Interfaces"
                              ? "h-9 w-9 marketing-bitcode-no-icon-glow"
                              : row.name === "Bitcode"
                                ? "h-9 w-9 marketing-bitcode-icon-glow"
                                : "h-6 w-6"
                              }`}
                          />
                        )}
                      </span>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div> {/* end clip-box */}
      </div>

      {/* Spacer at bottom */}
      <div className="h-8" />
    </MarketingSectionWrapper>
  );
}
