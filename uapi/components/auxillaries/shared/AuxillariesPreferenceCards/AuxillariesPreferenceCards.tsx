"use client";

import React from "react";

import { cn } from "@bitcode/styling";

export interface AuxillariesPreferenceOption {
  value: string;
  label: string;
  hint: string;
}

export interface AuxillariesPreferenceCardItem {
  id: string;
  title: string;
  description: string;
  value: string;
  options: AuxillariesPreferenceOption[];
  onChange: (value: string) => void;
}

interface AuxillariesPreferenceCardsProps {
  items: AuxillariesPreferenceCardItem[];
}

export default function AuxillariesPreferenceCards({
  items,
}: AuxillariesPreferenceCardsProps) {
  return (
    <div className="grid gap-3 tablet:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[20px] border border-white/8 bg-black/20 p-4"
        >
          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
          <p className="mt-2 text-sm leading-6 text-white/64">{item.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.options.map((option) => {
              const isActive = item.value === option.value;

              return (
                <button
                  key={`${item.id}-${option.value}`}
                  type="button"
                  onClick={() => item.onChange(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-left transition focus-visible:outline-none",
                    isActive
                      ? "border-emerald-300/40 bg-emerald-400/14 text-emerald-50"
                      : "border-white/10 bg-white/5 text-white/72 hover:border-white/18 hover:bg-white/8",
                  )}
                  aria-pressed={isActive}
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em]">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
