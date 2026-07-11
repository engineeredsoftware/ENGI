"use client";

import React from "react";

import Logo from "@/components/bitcode/branding/logo";

export type NavSurface = "terminal" | "packs" | "auxillaries" | "conversations" | null;
export type NavBrandSurface = Exclude<NavSurface, null> | 'home' | 'network' | 'deposit' | 'read' | 'docs' | null;

interface NavBrandProps {
  animated?: boolean;
  visible?: boolean;
  onClick: () => void;
  surface: NavBrandSurface;
}

const SURFACE_COPY: Record<Exclude<NavBrandSurface, null>, { eyebrow: string; title: string }> = {
  home: {
    eyebrow: "Bitcode",
    title: "homepage",
  },
  terminal: {
    eyebrow: "Bitcode",
    title: "terminal",
  },
  network: {
    eyebrow: "Bitcode",
    title: "packs",
  },
  deposit: {
    eyebrow: "Bitcode",
    title: "deposit",
  },
  read: {
    eyebrow: "Bitcode",
    title: "read",
  },
  docs: {
    eyebrow: "Bitcode",
    title: "docs",
  },
  auxillaries: {
    eyebrow: "Bitcode",
    title: "auxillaries",
  },
  conversations: {
    eyebrow: "Bitcode",
    title: "conversations",
  },
};

export default function NavBrand({ animated = true, visible = true, onClick, surface }: NavBrandProps) {
  const surfaceCopy = surface ? SURFACE_COPY[surface] : null;
  const entranceClassName = animated ? 'nav-logo-animated' : visible ? 'opacity-100' : 'opacity-0';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 items-center gap-3 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left ${entranceClassName}`}
    >
      <div
        className={
          surfaceCopy
            ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.2rem] border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(101,254,183,0.16),rgba(101,254,183,0.06))] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            : ""
        }
      >
        <Logo beta={!surfaceCopy} height="h-9" width="w-9" />
      </div>
      {surfaceCopy ? (
        <div className="min-w-0">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-emerald-300/80 sm:text-[0.62rem]">
            {surfaceCopy.eyebrow}
          </p>
          <p className="mt-1 truncate text-[0.84rem] text-neutral-200 sm:text-sm">{surfaceCopy.title}</p>
        </div>
      ) : null}
    </button>
  );
}
