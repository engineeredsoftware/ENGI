"use client";

/**
 * Need panel header controls — load/clear/anchor name popover.
 * Presentational; parent owns anchor state and persistence handlers.
 * Deposit twin: DepositObfuscationsAnchorControls (orange tone for Reads).
 */

import React from "react";
import { Anchor, FolderMinus, FolderPlus, RefreshCw } from "lucide-react";
import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect/SearchableSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/Popover/Popover";
import {
  formatNeedAnchorDescription,
  normalizeNeedAnchorPaths,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import type { ReadNeedAnchor } from "@/components/reads/models/read-activity-ledger";

function clipNeedAnchorText(text: string, textClipLength = 40): string {
  const clipAt = Math.max(8, textClipLength);
  const raw =
    typeof text === "string" ? text.trim().replace(/\s+/g, " ") : "";
  if (!raw) return "(empty)";
  return raw.length > clipAt ? `${raw.slice(0, clipAt).trimEnd()}…` : raw;
}

function NeedAnchorDescription({
  text,
  relevantPaths,
  irrelevantPaths,
  textClipLength,
}: {
  text: string;
  relevantPaths?: string[] | null;
  irrelevantPaths?: string[] | null;
  textClipLength?: number;
}) {
  const clipped = clipNeedAnchorText(text, textClipLength);
  const relevantCount = normalizeNeedAnchorPaths(relevantPaths).length;
  const irrelevantCount = normalizeNeedAnchorPaths(irrelevantPaths).length;
  const relevantAria = `${relevantCount} relevant path${
    relevantCount === 1 ? "" : "s"
  }`;
  const irrelevantAria = `${irrelevantCount} irrelevant path${
    irrelevantCount === 1 ? "" : "s"
  }`;

  return (
    <span className="flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap">
      <span className="min-w-0 truncate text-neutral-400" title={clipped}>
        {clipped}
      </span>
      <span className="shrink-0 text-neutral-600" aria-hidden="true">
        |
      </span>
      <span
        className="inline-flex shrink-0 items-center gap-0.5 text-neutral-300"
        aria-label={relevantAria}
        title={relevantAria}
      >
        <FolderPlus
          className="h-3 w-3 text-orange-300/80"
          aria-hidden="true"
        />
        <span className="tabular-nums">{relevantCount}</span>
      </span>
      <span className="shrink-0 text-neutral-600" aria-hidden="true">
        |
      </span>
      <span
        className="inline-flex shrink-0 items-center gap-0.5 text-neutral-300"
        aria-label={irrelevantAria}
        title={irrelevantAria}
      >
        <FolderMinus className="h-3 w-3 text-rose-300/80" aria-hidden="true" />
        <span className="tabular-nums">{irrelevantCount}</span>
      </span>
    </span>
  );
}

export type ReadsNeedAnchorControlsProps = {
  isConfigLocked: boolean;
  need: string;
  needAnchors: readonly ReadNeedAnchor[];
  needAnchorName: string;
  onNeedAnchorNameChange: (value: string) => void;
  isNeedAnchorPopoverOpen: boolean;
  onNeedAnchorPopoverOpenChange: (open: boolean) => void;
  isAnchoringNeed: boolean;
  onAnchorNeed: () => void | Promise<void>;
  onDeleteNeedAnchor: (id: string) => void | Promise<void>;
  onLoadAnchor: (anchor: ReadNeedAnchor) => void;
  onClear: () => void;
  relevantPathsLength: number;
  irrelevantPathsLength: number;
};

export function ReadsNeedAnchorControls(props: ReadsNeedAnchorControlsProps) {
  const {
    isConfigLocked,
    need,
    needAnchors,
    needAnchorName,
    onNeedAnchorNameChange,
    isNeedAnchorPopoverOpen,
    onNeedAnchorPopoverOpenChange,
    isAnchoringNeed,
    onAnchorNeed,
    onDeleteNeedAnchor,
    onLoadAnchor,
    onClear,
    relevantPathsLength,
    irrelevantPathsLength,
  } = props;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {needAnchors.length > 0 ? (
        <div className="w-56">
          <SearchableSelect
            aria-label="Load a previously anchored Need configuration"
            items={needAnchors.map((anchor) => ({
              key: anchor.id,
              label:
                anchor.name || anchor.repositoryFullName || "Need anchor",
              description: (
                <NeedAnchorDescription
                  text={anchor.text}
                  relevantPaths={anchor.relevantPaths}
                  irrelevantPaths={anchor.irrelevantPaths}
                />
              ),
              searchText: [
                anchor.name,
                anchor.repositoryFullName,
                formatNeedAnchorDescription({
                  text: anchor.text,
                  relevantPaths: anchor.relevantPaths,
                  irrelevantPaths: anchor.irrelevantPaths,
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
              const anchor = needAnchors.find((entry) => entry.id === key);
              if (!anchor) return;
              onLoadAnchor(anchor);
            }}
            onDeleteItem={
              isConfigLocked
                ? undefined
                : (key) => {
                    void onDeleteNeedAnchor(key);
                  }
            }
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
        aria-label="Clear need"
        title="Clear need"
        disabled={
          isConfigLocked ||
          (!need &&
            !needAnchorName &&
            relevantPathsLength === 0 &&
            irrelevantPathsLength === 0)
        }
        onClick={onClear}
        className="border border-white/10 px-2.5 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-rose-300/35 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Clear
      </button>
      <Popover
        open={isNeedAnchorPopoverOpen}
        onOpenChange={(open) => {
          if (isConfigLocked) return;
          if (open && !need.trim()) return;
          if (isAnchoringNeed) return;
          onNeedAnchorPopoverOpenChange(open);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Anchor need to the activity ledger"
            title="Anchor need to the activity ledger"
            data-testid="reads-need-anchor-button"
            disabled={isConfigLocked || !need.trim() || isAnchoringNeed}
            className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-orange-300/35 hover:bg-orange-300/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAnchoringNeed ? (
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
            id="reads-need-anchor-name"
            type="text"
            value={needAnchorName}
            onChange={(event) =>
              onNeedAnchorNameChange(event.target.value.slice(0, 80))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onAnchorNeed();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onNeedAnchorPopoverOpenChange(false);
              }
            }}
            placeholder="Optional name"
            maxLength={80}
            autoFocus
            aria-label="Need anchor name"
            className="mt-2 h-9 w-full border border-white/10 bg-black/40 px-2.5 text-xs text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-orange-300/35"
          />
          <p className="mt-1.5 text-[0.68rem] leading-4 text-neutral-500">
            Shown as the label when reloading. Leave blank to use the repository
            name.
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onNeedAnchorPopoverOpenChange(false)}
              disabled={isAnchoringNeed}
              className="border border-white/10 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-white/25 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="reads-need-anchor-save"
              onClick={() => {
                void onAnchorNeed();
              }}
              disabled={!need.trim() || isAnchoringNeed}
              className="inline-flex items-center gap-1.5 border border-orange-300/30 bg-orange-300/12 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-orange-100 transition hover:border-orange-200/45 hover:bg-orange-300/18 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAnchoringNeed ? (
                <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <Anchor className="h-3 w-3" aria-hidden="true" />
              )}
              Save anchor
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
