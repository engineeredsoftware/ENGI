'use client';

/**
 * Live order-book table for the marketplace section.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import BitcodePill from "@/components/bitcode/branding/BitcodePill/BitcodePill";
import BitcodeSoftwareSvgLogo from "@/components/bitcode/branding/BitcodeSoftwareSvgLogo/BitcodeSoftwareSvgLogo";
import { ROW_VARIANTS, type Listing } from "./marketing-marketplace-data";
import { MarketingMarketplaceTechIcon as TechIcon } from "./MarketingMarketplaceTechIcon";

export interface MarketingMarketplaceOrderBookProps {
  listings: Listing[];
  className: string;
}

export function MarketingMarketplaceOrderBook({
  listings,
  className,
}: MarketingMarketplaceOrderBookProps) {
  return (
    <div className={className}>
      <table className="min-w-full text-sm text-left">
        <thead className="bg-white/5">
          <tr className="text-gray-300">
            {["Bid/Ask", "bitcode", "Tech", "Price", "Type"].map((h) => (
              <th
                key={h}
                className="px-4 py-2 font-semibold whitespace-nowrap text-left"
              >
                {h === "bitcode" ? (
                  <BitcodeSoftwareSvgLogo
                    width="60px"
                    softwareClassName="hidden"
                    className="mx-auto"
                  />
                ) : (
                  h
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {listings.slice(0, 5).map((l) => (
              <motion.tr
                key={l.id}
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={ROW_VARIANTS}
                className={`border-t border-white/5 ${
                  l.flash === "add"
                    ? "bg-emerald-600/10"
                    : l.flash === "trade"
                      ? l.side === "buy"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                      : ""
                }`}
              >
                <td
                  className={`px-4 py-2 font-semibold capitalize ${
                    l.side === "buy" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {l.side}
                </td>
                <td className="px-4 py-2 font-semibold text-emerald-300">
                  {l.measure}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    {l.tech.map((t, idx) => (
                      <TechIcon key={t + idx} tech={t} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2">${l.price}</td>
                <td className="px-4 py-2 capitalize">
                  {l.type === "evidence_document" ? (
                    <BitcodePill className="bg-amber-500/20 text-amber-300">
                      Evidence Document
                    </BitcodePill>
                  ) : (
                    <BitcodePill className="bg-sky-500/20 text-sky-300">
                      Shippable
                    </BitcodePill>
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
