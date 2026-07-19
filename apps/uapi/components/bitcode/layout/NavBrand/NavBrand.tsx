"use client";

/**
 * Nav brand mark + logo-area secondary links.
 *
 * Bare logo icon + optional "BITCODE" supertext navigate home.
 * Whitepaper sits beside the wordmark and is grid-aligned over the deck icon
 * so OS/browser wordmark metrics cannot shift that stack. Lower row is Docs | X | Deck.
 */

import React from "react";
import Link from "next/link";
import { FileText, Files, Presentation } from "lucide-react";

import Logo from "@/components/bitcode/branding/Logo/Logo";
import XLogo from "@/components/bitcode/branding/XLogo/XLogo";
import {
  GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL,
  GLOBAL_CONSTANT_BITCODE_X_URL,
} from "@bitcode/global-constants";

export type NavSurface = "packs" | "auxillaries" | "conversations" | null;
export type NavBrandSurface =
  | Exclude<NavSurface, null>
  | "home"
  | "network"
  | "deposit"
  | "read"
  | "docs"
  | null;

interface NavBrandProps {
  animated?: boolean;
  visible?: boolean;
  onClick: () => void;
  /** Kept for route-aware callers; subtext is fixed icon links. */
  surface: NavBrandSurface;
}

/** Protocol whitepaper — SSOT: constants/global-constant-bitcode-whitepaper-url.txt */
export const BITCODE_WHITEPAPER_URL =
  process.env.NEXT_PUBLIC_BITCODE_WHITEPAPER_URL?.trim() ||
  GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL;

/** Bitcode on X — SSOT: constants/global-constant-bitcode-x-url.txt */
export const BITCODE_X_URL =
  process.env.NEXT_PUBLIC_BITCODE_X_URL?.trim() || GLOBAL_CONSTANT_BITCODE_X_URL;

const DOCS_HREF = "/docs";

/**
 * Pitch deck — served from monorepo SoT `.bd/the-pitch.key` via API (no public copy).
 */
export const BITCODE_DECK_HREF = "/api/deck";

/** Soft thematic green icons; un-soften + glow on hover. */
const logoAreaIconLinkClassName =
  "inline-flex shrink-0 items-center justify-center rounded-none p-0.5 " +
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
      className={`flex min-w-0 items-center gap-2.5 ${entranceClassName}`}
      data-nav-brand-surface={surface ?? "null"}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Bitcode home"
        className="flex shrink-0 cursor-pointer appearance-none items-center justify-center self-center border-0 bg-transparent p-0 leading-none"
      >
        <Logo className="block leading-none" height="h-9" width="w-9" />
      </button>

      {showWordmark ? (
        /*
          Shared two-column grid: whitepaper + deck share col 2 and stay centered
          on each other even when "Bitcode" glyph width differs (OS/browser weight).
          Lower nav uses subgrid so docs|X|deck remain one a11y group.
        */
        <div className="grid min-w-0 grid-cols-[auto_auto] items-center gap-x-1.5 gap-y-1.5 self-center leading-none">
          <button
            type="button"
            onClick={onClick}
            className="cursor-pointer appearance-none border-0 bg-transparent p-0 text-left leading-none"
          >
            <p className="font-sans text-[0.625rem] font-medium uppercase leading-none tracking-[0.22em] text-emerald-200/90 antialiased [font-synthesis:none]">
              Bitcode
            </p>
          </button>
          <a
            href={BITCODE_WHITEPAPER_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Whitepaper"
            title="Whitepaper"
            className={`${logoAreaIconLinkClassName} justify-self-center`}
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          </a>
          <nav
            className="col-span-2 grid grid-cols-subgrid items-center gap-x-1.5 leading-none"
            aria-label="Bitcode references"
          >
            <div className="flex min-w-0 items-center gap-1.5 leading-none">
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
              <span className={logoAreaDividerClassName} aria-hidden="true">
                |
              </span>
            </div>
            <a
              href={BITCODE_DECK_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pitch deck"
              title="Pitch deck"
              className={`${logoAreaIconLinkClassName} justify-self-center`}
            >
              <Presentation className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
