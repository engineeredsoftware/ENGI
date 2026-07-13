"use client";

/**
 * Nav brand mark + logo-area secondary links.
 *
 * Logo + "Bitcode" eyebrow navigate home. The former page-name subtext is
 * replaced by fixed public links: docs (spelled) | whitepaper (icon).
 */

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

import Logo from "@/components/bitcode/branding/Logo/Logo";

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
  /** Kept for route-aware callers; subtext is fixed docs | whitepaper links. */
  surface: NavBrandSurface;
}

/** Protocol lightpaper / whitepaper (source-bearing public reference). */
export const BITCODE_WHITEPAPER_URL =
  process.env.NEXT_PUBLIC_BITCODE_WHITEPAPER_URL?.trim() ||
  "https://github.com/engineeredsoftware/ENGI/blob/main/BITCODE_LIGHTOPAPER.md";

const DOCS_HREF = "/docs";

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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-emerald-300/80 sm:text-[0.62rem]">
              Bitcode
            </p>
          </button>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[0.84rem] text-neutral-200 sm:text-sm">
            <Link
              href={DOCS_HREF}
              className="truncate transition hover:text-emerald-200"
              aria-label="Docs"
            >
              docs
            </Link>
            <span className="select-none text-neutral-500" aria-hidden="true">
              |
            </span>
            <a
              href={BITCODE_WHITEPAPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Whitepaper"
              title="Whitepaper"
              className="inline-flex shrink-0 items-center text-neutral-300 transition hover:text-emerald-200"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
