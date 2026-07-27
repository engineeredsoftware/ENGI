"use client";

/**
 * Rights-gated DataPack download menu.
 * Resolve role per DataPack; only enable downloads the viewer is entitled to.
 */

import React, { useMemo } from "react";
import {
  buildDataPackCommercialBriefDownload,
  resolveDataPackDownloads,
  resolveDataPackViewerRole,
  type DataPackDownloadDescriptor,
  type DataPackViewerRole,
  type ResolveDataPackViewerRoleInput,
} from "@/components/datapacks/models/datapack-viewer-rights";

export type DataPackDownloadsProps = {
  roleInput?: ResolveDataPackViewerRoleInput;
  /** Explicit role when host already classified. */
  role?: DataPackViewerRole;
  optionId?: string | null;
  title?: string | null;
  summary?: string | null;
  commercialTitle?: string | null;
  commercialDescription?: string | null;
  kind?: string | null;
  /** Builders for entitled artifacts (host supplies when allowed). */
  onDownloadSourcePatch?: () => void;
  onDownloadPathOpJson?: () => void;
  onDownloadMetadata?: () => void;
  onDownloadEntitled?: () => void;
  className?: string;
  testIdPrefix?: string;
};

function downloadTextFile(file: {
  filename: string;
  mimeType: string;
  body: string;
}) {
  const blob = new Blob([file.body], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function DataPackDownloads({
  roleInput,
  role: roleProp,
  optionId,
  title,
  summary,
  commercialTitle,
  commercialDescription,
  kind,
  onDownloadSourcePatch,
  onDownloadPathOpJson,
  onDownloadMetadata,
  onDownloadEntitled,
  className = "",
  testIdPrefix = "datapack-downloads",
}: DataPackDownloadsProps) {
  const role = useMemo(
    () => roleProp || resolveDataPackViewerRole(roleInput || {}),
    [roleProp, roleInput],
  );
  const downloads = useMemo(() => resolveDataPackDownloads(role), [role]);

  const handleClick = (d: DataPackDownloadDescriptor) => {
    if (!d.allowed) return;
    switch (d.kind) {
      case "source-patch":
        onDownloadSourcePatch?.();
        break;
      case "path-op-json":
        onDownloadPathOpJson?.();
        break;
      case "metadata-review":
        onDownloadMetadata?.();
        break;
      case "commercial-brief":
        downloadTextFile(
          buildDataPackCommercialBriefDownload({
            optionId,
            title,
            summary,
            commercialTitle,
            commercialDescription,
            kind,
          }),
        );
        break;
      case "entitled-delivery":
        onDownloadEntitled?.();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`grid gap-2 ${className}`}
      data-testid={testIdPrefix}
      data-viewer-role={role}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.58rem] font-medium uppercase tracking-[0.14em] text-neutral-400">
          Downloads
        </p>
        <p
          className="text-[0.62rem] text-neutral-500"
          data-testid={`${testIdPrefix}-role`}
        >
          Rights: {role}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {downloads.map((d) => {
          const hasHandler =
            d.kind === "commercial-brief" ||
            (d.kind === "source-patch" && onDownloadSourcePatch) ||
            (d.kind === "path-op-json" && onDownloadPathOpJson) ||
            (d.kind === "metadata-review" && onDownloadMetadata) ||
            (d.kind === "entitled-delivery" && onDownloadEntitled);
          const enabled = d.allowed && hasHandler;
          return (
            <button
              key={d.kind}
              type="button"
              data-testid={`${testIdPrefix}-${d.kind}`}
              data-allowed={d.allowed ? "true" : "false"}
              title={d.allowed ? d.description : d.blockedReason || d.description}
              disabled={!enabled}
              onClick={() => handleClick(d)}
              className={
                enabled
                  ? "border border-emerald-300/40 bg-emerald-300/14 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-emerald-50 transition hover:border-emerald-200/55 hover:bg-emerald-300/20"
                  : "cursor-not-allowed border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-neutral-500 opacity-60"
              }
            >
              {d.label}
            </button>
          );
        })}
      </div>
      {downloads.some((d) => !d.allowed) ? (
        <p className="text-[0.68rem] leading-5 text-neutral-500">
          Some artifacts stay locked until depositor ownership or post-settlement
          rights apply for this DataPack.
        </p>
      ) : null}
    </div>
  );
}
