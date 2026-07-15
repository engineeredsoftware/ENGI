'use client';

/**
 * Hero product pillars: Deposit (purple) · Read (orange) · Settle (green).
 * Each card keeps its own chrome, metrics, and supply/need/settlement story.
 */

import React from 'react';
import { motion } from 'framer-motion';

import BitcodeSoftwareSvgLogo from '@/components/bitcode/branding/BitcodeSoftwareSvgLogo/BitcodeSoftwareSvgLogo';

import {
  entranceEase,
  heroHighlightClass,
  measureCardAxes,
  measureCardReadNeed,
  measuremintCandles,
  paintedMotionStyle,
  productPillars,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

type MarketingLandingPillarCardProps = (typeof productPillars)[number] & {
  index: number;
};

export function MarketingLandingPillarCard({
  description,
  index,
  title,
  Icon,
}: MarketingLandingPillarCardProps) {
  const hasBtdInDescription = description.includes('$BTD');
  const [beforeBtd, afterBtd] = hasBtdInDescription ? description.split('$BTD') : [description, ''];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.75,
        delay: 0.1 + index * 0.08,
        ease: entranceEase,
      }}
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-none border p-3 backdrop-blur-xl phone:p-4 ${
        title.includes('$BTD')
          ? 'border-orange-300/20 bg-black/30 shadow-[0_18px_50px_rgba(79,30,0,0.34)]'
          : 'border-white/10 bg-white/5 shadow-[0_16px_50px_rgba(2,8,17,0.32)]'
      } ${title.includes('$BTD') ? 'phone:col-span-2 desktop:col-span-1' : ''}`}
      style={paintedMotionStyle}
    >
      {title === 'Deposit' ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,6,29,0.98),rgba(40,18,62,0.9))]" />
          <div
            className="absolute inset-[10px] rounded-none bg-white/[0.04]"
            style={{
              boxShadow: 'inset 2px 2px 8px 2px rgba(0,0,0,0.82), 2px 2px 14px 2px rgba(0,0,0,0.18)',
            }}
          />
          <div className="absolute inset-[1px] rounded-none border border-white/20" />
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-200/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(192,132,252,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.12),transparent_30%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,transparent_0,transparent_31px,rgba(255,255,255,0.07)_32px),linear-gradient(180deg,transparent_0,transparent_31px,rgba(255,255,255,0.05)_32px)] [background-size:32px_32px]" />
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative text-violet-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                  <div className="min-w-0">
                    {/* pe avoids bg-clip-text clipping the last glyph on wide tracking. */}
                    <p className="whitespace-nowrap bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 bg-clip-text pe-[0.2em] text-[11px] font-semibold uppercase tracking-[0.16em] text-transparent">
                      {title}
                    </p>
                    <p className="mt-1 max-w-[16ch] text-[9px] uppercase leading-snug tracking-[0.16em] text-violet-100/52 phone:text-[10px]">
                      <span className="block whitespace-nowrap">Deposit Knowledge</span>
                      <span className="block whitespace-nowrap">Supply</span>
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center rounded-none border border-white/12 bg-white/8 px-2 py-1 text-center text-[8px] uppercase tracking-[0.14em] text-violet-100/70">
                  Sell
                </span>
              </div>
            </div>
            <p className="mt-1.5 min-h-[4.5rem] text-[11px] leading-4 text-violet-50/88 phone:min-h-[5rem] phone:text-[13px] phone:leading-5">
              {description}
            </p>
            <div className="mt-auto space-y-3 border-t border-white/12 pt-4">
              <div className="border-l-4 border-purple-400 pl-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  What you package
                </p>
                <p className="mt-1 text-[11px] leading-4 text-violet-100/72">
                  code, files, designs, data, and notes
                </p>
              </div>
              <div className="border-l-4 border-pink-400 pl-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Proven on deposit
                </p>
                <p className="mt-1 text-[11px] leading-4 text-violet-100/72">
                  source inclusions, obfuscations, and pack's contents
                </p>
              </div>
            </div>
          </div>
        </>
      ) : title === 'Read' ? (
        <>
          {/* Read — orange (middle of purple → orange → green order). */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#170900]/95 via-[#3c1700]/82 to-[#02060d]" />
          <div
            className="absolute inset-[10px] rounded-none bg-white/[0.04]"
            style={{
              boxShadow: 'inset 2px 2px 8px 2px rgba(0,0,0,0.82), 2px 2px 14px 2px rgba(0,0,0,0.18)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 28px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 28px)',
                maskImage: 'linear-gradient(180deg, transparent 0%, white 18%, white 82%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(180deg, transparent 0%, white 18%, white 82%, transparent 100%)',
              }}
            />
            <div className="absolute inset-0 translate-y-[5%] overflow-hidden opacity-80">
              {measuremintCandles.map((candle, candleIndex) => (
                <React.Fragment key={`measuremint-candle-${candleIndex}`}>
                  <span
                    className={`absolute w-[1px] ${candle.bullish ? 'bg-orange-300/50' : 'bg-rose-300/40'}`}
                    style={{
                      left: candle.left,
                      top: candle.wickTop,
                      height: candle.wickHeight,
                    }}
                  />
                  <span
                    className={`absolute w-[6px] rounded-none ${candle.bullish ? 'bg-orange-300/40' : 'bg-rose-300/30'}`}
                    style={{
                      left: `calc(${candle.left} - 2px)`,
                      top: candle.bodyTop,
                      height: candle.bodyHeight,
                    }}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="absolute inset-[1px] rounded-none border border-orange-200/10" />
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-orange-100/70 to-transparent" />
          <div className="absolute inset-0 -z-10 opacity-10 [mask-image:linear-gradient(to_bottom,transparent,white,white,transparent)] bg-[repeating-linear-gradient(90deg,#ffffff0d_0_40px,transparent_40px_80px)] bg-[length:160px_160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.1),transparent_30%)]" />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative text-orange-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                  <div className="min-w-0">
                    <p className="whitespace-nowrap bg-gradient-to-r from-orange-200 via-orange-300 to-amber-200 bg-clip-text pe-[0.2em] text-[11px] font-semibold uppercase tracking-[0.16em] text-transparent">
                      {title}
                    </p>
                    <p className="mt-1 max-w-[16ch] text-[9px] uppercase leading-snug tracking-[0.16em] text-orange-100/52 phone:text-[10px]">
                      <span className="block whitespace-nowrap">Options that</span>
                      <span className="block whitespace-nowrap">fit Need</span>
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center rounded-none border border-orange-200/12 bg-orange-400/8 px-2 py-1 text-center text-[8px] uppercase tracking-[0.14em] text-orange-50/72">
                  Buy
                </span>
              </div>
            </div>
            <p className="mt-1.5 min-h-[4.5rem] text-[11px] leading-4 text-orange-50/88 phone:min-h-[5rem] phone:text-[13px] phone:leading-5">
              {description}
            </p>
            <div className="relative mt-auto pt-4">
              <div className="relative grid grid-cols-3 gap-2">
                {measureCardAxes.map((axis, axisIndex) => (
                  <div
                    key={axis.label}
                    className={`px-1 text-center ${axisIndex === 0 ? '' : 'border-l border-orange-200/12'}`}
                  >
                    <p className="whitespace-nowrap text-[7px] uppercase leading-none tracking-[0.12em] text-orange-200/58">
                      {axis.label}
                    </p>
                    <p className="mt-1 text-[2.2rem] font-semibold leading-none text-white">{axis.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-none border border-orange-200/12 bg-black/25 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-orange-200/62">
                example need
              </p>
              <p className="mt-1 font-mono text-[10px] leading-4 text-orange-50/84 phone:text-[11px]">
                {measureCardReadNeed}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Settle — green. */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#021511]/95 via-[#06231f]/84 to-[#02060d]" />
          <div
            className="absolute inset-[10px] rounded-none bg-white/[0.04]"
            style={{
              boxShadow: 'inset 2px 2px 8px 2px rgba(0,0,0,0.85), 2px 2px 14px 2px rgba(0,0,0,0.18)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0 20px, rgba(255,255,255,0.08) 21px), repeating-linear-gradient(90deg, transparent 0 20px,rgba(255,255,255,0.08) 21px)',
                maskImage: 'radial-gradient(circle 220px at center, white 72%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle 220px at center, white 72%, transparent 100%)',
              }}
            />
          </div>
          <div className="absolute inset-[1px] rounded-none border border-emerald-200/10" />
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.1),transparent_30%)]" />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative pr-14 text-emerald-100 phone:pr-16">
              {/* Logo top-aligned with Settle title; icon size matches Deposit/Read title row. */}
              <div className="absolute right-0 top-0">
                <BitcodeSoftwareSvgLogo width="36px" softwareClassName="hidden" className="opacity-90" />
              </div>
              <div className="flex min-w-0 items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <div className="min-w-0">
                  <p className="bg-gradient-to-r from-emerald-200 via-emerald-300 to-teal-200 bg-clip-text text-[11px] font-semibold uppercase tracking-[0.18em] text-transparent">
                    {title}
                  </p>
                  <p className="mt-1 max-w-[16ch] text-[9px] uppercase leading-snug tracking-[0.16em] text-emerald-100/52 phone:text-[10px]">
                    <span className="block whitespace-nowrap">BTC · BTD</span>
                    <span className="block whitespace-nowrap">On-Chain</span>
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-1.5 min-h-[4.5rem] text-[11px] leading-4 text-emerald-50/88 phone:min-h-[5rem] phone:text-[13px] phone:leading-5">
              {hasBtdInDescription ? (
                <>
                  {beforeBtd}
                  <span className={`${heroHighlightClass} font-semibold`}>$BTD</span>
                  {afterBtd}
                </>
              ) : (
                description
              )}
            </p>
            <div className="mt-auto space-y-3 pt-4">
              <div className="rounded-none border border-emerald-200/12 bg-black/25 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-50/76">
                  {'buyer pays BTC · seller earns · rights transfer'}
                </p>
              </div>
              <div className="rounded-none border border-emerald-200/12 bg-black/25 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-50/76">
                  {'source unlocks only after finality + BTD rights'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
