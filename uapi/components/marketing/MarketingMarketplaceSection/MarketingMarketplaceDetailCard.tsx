/**
 * Animated detail card for the currently highlighted marketplace listing.
 */
"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BitcodePill from "@/components/bitcode/branding/BitcodePill/BitcodePill";
import type { Listing } from "./marketing-marketplace-data";
import { MarketingMarketplaceTechIcon as TechIcon } from "./MarketingMarketplaceTechIcon";

export interface MarketingMarketplaceDetailCardProps {
  detail: Listing | null;
}

export function MarketingMarketplaceDetailCard({
  detail,
}: MarketingMarketplaceDetailCardProps) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {detail && (
        <motion.div
          key={detail.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="relative flex flex-col justify-between bg-gradient-to-br from-black/40 via-black/20 to-black/40 backdrop-blur-md border border-emerald-400/20 rounded-2xl p-6 shadow-2xl h-full self-stretch"
        >
          <div className="flex items-center">
            <h3 className="text-2xl laptop:text-3xl font-semibold text-white leading-tight">
              {detail.title}
            </h3>
            <div className="flex items-center gap-2 ml-4">
              {detail.tech.map((t, i) => (
                <span key={t + i} className="transform scale-125">
                  <TechIcon tech={t} />
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto text-sm tablet:text-base text-gray-100">
              {detail.type === "evidence_document" ? (
                <BitcodePill className="px-3 py-1 border-amber-500/30 bg-amber-500/20 text-amber-300">
                  Evidence Document
                </BitcodePill>
              ) : (
                <BitcodePill className="px-3 py-1 border-sky-500/30 bg-sky-500/20 text-sky-300">
                  Shippable
                </BitcodePill>
              )}
              <span
                className={`px-3 py-1 rounded-full ${
                  detail.side === "buy"
                    ? "bg-green-600/20 text-green-400 text-sm tablet:text-base"
                    : "bg-red-600/20 text-red-400 text-sm tablet:text-base"
                }`}
              >
                {detail.side}
              </span>
            </div>
          </div>

          <div className="flex flex-col tablet:flex-row items-center my-6 select-none gap-4 tablet:gap-0">
            <div className="flex-1 flex justify-end items-center gap-1">
              <span className="opacity-70 text-gray-400">Price:</span>
              <span className="font-semibold text-gray-300 text-xl">
                {"$" + detail.price.toLocaleString()}
              </span>
            </div>
            <div className="flex-none flex items-center px-8">
              <Image
                src="/icons/logo.svg"
                width={60}
                height={60}
                alt="Bitcode BTD unit"
                className="w-12 h-12 drop-shadow-glow-emerald animate-pulse-slow"
              />
              <span className="ml-3 text-6xl laptop:text-7xl font-extrabold text-emerald-300 drop-shadow-glow-emerald">
                {detail.measuredBtd.toLocaleString()}
              </span>
            </div>
            <div className="flex-1 flex justify-start items-center gap-1">
              <span className="opacity-70 text-gray-400">Avail:</span>
              <span className="font-semibold text-gray-300 text-xl">
                {detail.available}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-12 text-lg tablet:text-xl">
            <div className="flex items-center gap-1">
              <span className="opacity-70 text-orange-400">Measured $BTD:</span>
              <span className="font-semibold text-orange-300">
                {detail.measuredBtd.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="opacity-70 text-purple-400">Relevancy:</span>
              <span className="font-semibold text-purple-300">
                {(detail.measure / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
