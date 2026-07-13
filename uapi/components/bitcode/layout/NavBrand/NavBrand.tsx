"use client";

/**
 * Nav brand mark + logo-area secondary links.
 *
 * Logo + "BITCODE" supertext navigate home. Subtext is three themed icon links:
 * Whitepaper (single page) | Docs (page stack) | X (social).
 */

import React from "react";
import Link from "next/link";
import { FileText, Files } from "lucide-react";

import Logo from "@/components/bitcode/branding/Logo/Logo";
import XLogo from "@/components/bitcode/branding/XLogo/XLogo";

export type NavSurface = "packs" | "auxillaries" | "conversations" | null;
export type NavBrandSurface =
  | Exclude<NavSurface, null>
  | "home"
  | "network"
  | "deposit"
  | "read"
  | "docs"
  | "terminal"
  | null;

interface NavBrandProps {
  animated?: boolean;
  visible?: boolean;
  onClick: () => void;
  /** Kept for route-aware callers; subtext is fixed icon links. */
  surface: NavBrandSurface;
}

/** Protocol lightpaper / whitepaper (source-bearing public reference). */
export const BITCODE_WHITEPAPER_URL =
  process.env.NEXT_PUBLIC_BITCODE_WHITEPAPER_URL?.trim() ||
  "https://github.com/engineeredsoftware/ENGI/blob/main/BITCODE_LIGHTOPAPER.md";

/** Bitcode on X — override with NEXT_PUBLIC_BITCODE_X_URL when handle is confirmed. */
export const BITCODE_X_URL =
  process.env.NEXT_PUBLIC_BITCODE_X_URL?.trim() || "https://x.com/bitcode";

const DOCS_HREF = "/docs";

/** Soft thematic green icons; un-soften + glow on hover. */
const logoAreaIconLinkClassName =
  "inline-flex shrink-0 items-center justify-center rounded-sm p-0.5 " +
  "text-emerald-300/50 transition duration-200 ease-out " +
  "[filter:drop-shadow(0_0_3px_rgba(101,254,183,0.18))] " +
  "hover:text-emerald-200 " +
  "hover:[filter:drop-shadow(0_0_6px_rgba(101,254,183,0.72))_drop-shadow(0_0_14px_rgba(101,254,183,0.38))] " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300/50";

const logoAreaDividerClassName =
  "select-none text-[0.7rem] leading-none text-emerald-300/28";

export default function NavBrand({
  animated = true,
  visible = true,
  onClick,
  surface,
}: NavBrandProps) {
  const entranceClassName = animated
    ? "nav-logo-animated"
    : visible
      ? "opacity-100"
      : "opacity-0";
  const showWordmark = surface !== null;

  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${entranceClassName}`}
      data-nav-brand-surface={surface ?? "null"}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Bitcode home"
        className="flex shrink-0 cursor-pointer appearance-none items-center border-0 bg-transparent p-0"
      >
        <div
          className={
            showWordmark
              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.2rem] border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(101,254,183,0.16),rgba(101,254,183,0.06))] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
              : ""
          }
        >
          <Logo beta={!showWordmark} height="h-9" width="w-9" />
        </div>
      </button>

      {showWordmark ? (
        <div className="min-w-0">
          <button
            type="button"
            onClick={onClick}
            className="cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
          >
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-emerald-200/90 sm:text-[0.64rem] sm:font-semibold">
              Bitcode
            </p>
          </button>
          <nav
            className="mt-1.5 flex min-w-0 items-center gap-1.5"
            aria-label="Bitcode references"
          >
            <a
              href={BITCODE_WHITEPAPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Whitepaper"
              title="Whitepaper"
              className={logoAreaIconLinkClassName}
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            </a>
            <span className={logoAreaDividerClassName} aria-hidden="true">
              |
            </span>
            <Link
              href={DOCS_HREF}
              aria-label="Docs"
              title="Docs"
              className={logoAreaIconLinkClassName}
            >
              <Files className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <span className={logoAreaDividerClassName} aria-hidden="true">
              |
            </span>
            <a
              href={BITCODE_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bitcode on X"
              title="Bitcode on X"
              className={logoAreaIconLinkClassName}
            >
              <XLogo className="h-3 w-3" />
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
