/**
 * Obfuscations panel header controls — load/clear/anchor name popover.
 * Presentational; parent owns anchor state and persistence handlers.
 */
"use client";

import React from "react";
import { Anchor, RefreshCw, Sparkles } from "lucide-react";
import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect/SearchableSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/Popover/Popover";
import { ObfuscationsAnchorDescription } from "@/components/deposits/DepositObfuscationsPathIcons/DepositObfuscationsPathIcons";
import { formatObfuscationsAnchorDescription } from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import type { DepositObfuscationsAnchor } from "@/components/deposits/models/deposit-activity-ledger";

export type DepositObfuscationsAnchorControlsProps = {
  isConfigLocked: boolean;
  obfuscations: string;
  obfuscationsAnchors: readonly DepositObfuscationsAnchor[];
  obfuscationsAnchorName: string;
  onObfuscationsAnchorNameChange: (value: string) => void;
  isObfuscationsAnchorPopoverOpen: boolean;
  onObfuscationsAnchorPopoverOpenChange: (open: boolean) => void;
  isAnchoringObfuscations: boolean;
  onAnchorObfuscations: () => void | Promise<void>;
  onDeleteObfuscationsAnchor: (id: string) => void | Promise<void>;
  onLoadAnchor: (anchor: DepositObfuscationsAnchor) => void;
  onClear: () => void;
  forcedInclusionsLength: number;
  forcedExclusionsLength: number;
};

export function DepositObfuscationsAnchorControls(
  props: DepositObfuscationsAnchorControlsProps,
) {
  const {
    isConfigLocked,
    obfuscations,
    obfuscationsAnchors,
    obfuscationsAnchorName,
    onObfuscationsAnchorNameChange,
    isObfuscationsAnchorPopoverOpen,
    onObfuscationsAnchorPopoverOpenChange,
    isAnchoringObfuscations,
    onAnchorObfuscations,
    onDeleteObfuscationsAnchor,
    onLoadAnchor,
    onClear,
    forcedInclusionsLength,
    forcedExclusionsLength,
  } = props;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {obfuscationsAnchors.length > 0 ? (
        <div className="w-56">
          <SearchableSelect
            aria-label="Load a previously anchored Obfuscations configuration"
            items={obfuscationsAnchors.map((anchor) => ({
              key: anchor.id,
              label:
                anchor.name ||
                anchor.repositoryFullName ||
                "Obfuscations anchor",
              // Sub-text: clipped body | include icon+count | exclude
              // icon+count — same icons as the picker section headers.
              description: (
                <ObfuscationsAnchorDescription
                  text={anchor.text}
                  forcedInclusions={anchor.forcedInclusions}
                  forcedExclusions={anchor.forcedExclusions}
                />
              ),
              searchText: [
                anchor.name,
                anchor.repositoryFullName,
                formatObfuscationsAnchorDescription({
                  text: anchor.text,
                  forcedInclusions: anchor.forcedInclusions,
                  forcedExclusions: anchor.forcedExclusions,
                }),
              ]
                .filter(Boolean)
                .join(" "),
              deletable: true,
            }))}
            value={null}
            disabled={isConfigLocked}
            onSelect={(key) => {
              if (isConfigLocked) return;
              const anchor = obfuscationsAnchors.find(
                (entry) => entry.id === key,
              );
              if (!anchor) return;
              onLoadAnchor(anchor);
            }}
            onDeleteItem={
              isConfigLocked
                ? undefined
                : (key) => {
                    void onDeleteObfuscationsAnchor(key);
                  }
            }
            // One-shot load-in: always shows the placeholder, never
            // a selected value — no check indicator in the list.
            showSelectionIndicator={false}
            placeholder="Load anchor..."
            searchPlaceholder="Search anchors..."
            emptyMessage="No anchors yet."
            className="h-9"
          />
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Clear obfuscations"
        title="Clear obfuscations"
        disabled={
          isConfigLocked ||
          (!obfuscations &&
            !obfuscationsAnchorName &&
            forcedInclusionsLength === 0 &&
            forcedExclusionsLength === 0)
        }
        onClick={onClear}
        className="border border-white/10 px-2.5 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-rose-300/35 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Clear
      </button>
      <Popover
        open={isObfuscationsAnchorPopoverOpen}
        onOpenChange={(open) => {
          // Require Obfuscations body before opening the name popover.
          if (isConfigLocked) return;
          if (open && !obfuscations.trim()) return;
          if (isAnchoringObfuscations) return;
          onObfuscationsAnchorPopoverOpenChange(open);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Anchor obfuscations to the activity ledger"
            title="Anchor obfuscations to the activity ledger"
            disabled={
              isConfigLocked || !obfuscations.trim() || isAnchoringObfuscations
            }
            className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAnchoringObfuscations ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Anchor className="h-4 w-4" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-64 border-white/10 bg-neutral-950 p-3 text-neutral-100 shadow-xl"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
            Name this anchor
          </p>
          <input
            id="deposit-obfuscations-anchor-name"
            type="text"
            value={obfuscationsAnchorName}
            onChange={(event) =>
              onObfuscationsAnchorNameChange(event.target.value.slice(0, 80))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onAnchorObfuscations();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onObfuscationsAnchorPopoverOpenChange(false);
              }
            }}
            placeholder="Optional name"
            maxLength={80}
            autoFocus
            aria-label="Obfuscations anchor name"
            className="mt-2 h-9 w-full border border-white/10 bg-black/40 px-2.5 text-xs text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-300/35"
          />
          <p className="mt-1.5 text-[0.68rem] leading-4 text-neutral-500">
            Shown as the label when reloading. Leave blank to use the repository
            name.
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onObfuscationsAnchorPopoverOpenChange(false)}
              disabled={isAnchoringObfuscations}
              className="border border-white/10 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-white/25 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void onAnchorObfuscations();
              }}
              disabled={!obfuscations.trim() || isAnchoringObfuscations}
              className="inline-flex items-center gap-1.5 border border-emerald-300/30 bg-emerald-300/12 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAnchoringObfuscations ? (
                <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <Anchor className="h-3 w-3" aria-hidden="true" />
              )}
              Save anchor
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <Sparkles className="h-5 w-5 text-emerald-200" aria-hidden="true" />
    </div>
  );
}
