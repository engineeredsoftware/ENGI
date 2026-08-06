/**
 * Per-DataPack viewer rights → download and disclosure surface.
 *
 * Always resolve rights for the current user against the specific DataPack:
 *   - depositor: full commercial .patch (bodies) + metadata + measurements
 *   - pre-purchaser: commercial NL + measurements + path metadata (no bodies)
 *   - post-settled-purchaser: entitled .patch + commercial NL + measurements
 *   - anonymous: public catalogue surface only
 */

export type DataPackViewerRole =
  | "depositor"
  | "pre-purchaser"
  | "post-settled-purchaser"
  | "anonymous";

export type DataPackDownloadKind =
  | "source-patch"
  | "path-op-json"
  | "metadata-review"
  | "commercial-brief"
  | "entitled-delivery";

export type DataPackDownloadDescriptor = {
  kind: DataPackDownloadKind;
  label: string;
  description: string;
  /** True when this role may download this artifact. */
  allowed: boolean;
  /** Why blocked when not allowed. */
  blockedReason?: string;
  filenameHint: string;
  mimeType: string;
};

export type ResolveDataPackViewerRoleInput = {
  viewerUserId?: string | null;
  depositorUserId?: string | null;
  settledBuyerUserId?: string | null;
  settlementState?: string | null;
  /** Explicit override when host already classified the role. */
  roleOverride?: DataPackViewerRole | null;
};

export function resolveDataPackViewerRole(
  input: ResolveDataPackViewerRoleInput,
): DataPackViewerRole {
  if (input.roleOverride) return input.roleOverride;
  const viewer = (input.viewerUserId || "").trim().toLowerCase();
  if (!viewer) return "anonymous";
  const depositor = (input.depositorUserId || "").trim().toLowerCase();
  if (depositor && viewer === depositor) return "depositor";
  const buyer = (input.settledBuyerUserId || "").trim().toLowerCase();
  const settled =
    String(input.settlementState || "").toLowerCase().includes("settled") ||
    String(input.settlementState || "").toLowerCase() === "finalized";
  if (buyer && viewer === buyer && settled) return "post-settled-purchaser";
  if (buyer && viewer === buyer) return "pre-purchaser";
  return "pre-purchaser";
}

/**
 * Rights-gated download menu for a DataPack detail surface.
 */
export function resolveDataPackDownloads(
  role: DataPackViewerRole,
): DataPackDownloadDescriptor[] {
  const fullPatchAllowed =
    role === "depositor" || role === "post-settled-purchaser";
  const metadataAllowed = role !== "anonymous";
  const commercialAllowed = true; // commercial brief is source-safe for all roles

  return [
    {
      kind: "source-patch",
      label: "Download .patch",
      description:
        role === "depositor"
          ? "Full commercial .patch with create|modify file bodies (depositor material)."
          : role === "post-settled-purchaser"
            ? "Entitled commercial .patch unlocked after settlement and BTD rights transfer."
            : "Full .patch with file bodies requires depositor ownership or post-settlement rights.",
      allowed: fullPatchAllowed,
      blockedReason: fullPatchAllowed
        ? undefined
        : "Rights required: depositor or post-settled purchaser.",
      filenameHint: "datapack.patch",
      mimeType: "text/x-diff",
    },
    {
      kind: "path-op-json",
      label: "Download path-op JSON",
      description:
        "Path+op envelope with measurements companion (bodies only when entitled).",
      // Same entitlement as full .patch (depositor | post-settled-purchaser).
      allowed: fullPatchAllowed,
      blockedReason: fullPatchAllowed
        ? undefined
        : "Path-op with bodies is rights-gated.",
      filenameHint: "datapack.path-op.json",
      mimeType: "application/json",
    },
    {
      kind: "metadata-review",
      label: "Download DataPack metadata",
      description:
        "Source-safe review artifact: path surface, absolutes honesty, material identity.",
      allowed: metadataAllowed,
      blockedReason: metadataAllowed
        ? undefined
        : "Sign in to download metadata review artifacts.",
      filenameHint: "datapack.review.json",
      mimeType: "application/json",
    },
    {
      kind: "commercial-brief",
      label: "Download commercial brief",
      description:
        "Buyer-facing commercialTitle + commercialDescription (source-safe; no file bodies).",
      allowed: commercialAllowed,
      filenameHint: "datapack.commercial.json",
      mimeType: "application/json",
    },
    {
      kind: "entitled-delivery",
      label: "Download entitled delivery",
      description:
        "Post-settle delivery envelope (entitled patch + settlement readback).",
      allowed: role === "post-settled-purchaser",
      blockedReason:
        role === "post-settled-purchaser"
          ? undefined
          : "Available only after settlement finality and rights transfer.",
      filenameHint: "datapack.entitled.json",
      mimeType: "application/json",
    },
  ];
}

export function buildDataPackCommercialBriefDownload(input: {
  optionId?: string | null;
  title?: string | null;
  summary?: string | null;
  commercialTitle?: string | null;
  commercialDescription?: string | null;
  kind?: string | null;
}): { filename: string; mimeType: string; body: string } {
  const title =
    (input.commercialTitle && input.commercialTitle.trim()) ||
    (input.title && input.title.trim()) ||
    "datapack";
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const body = JSON.stringify(
    {
      schema: "bitcode.datapack.commercial-brief",
      optionId: input.optionId ?? null,
      kind: input.kind ?? null,
      commercialTitle:
        input.commercialTitle || input.title || null,
      commercialDescription:
        input.commercialDescription || input.summary || null,
      disclosure: {
        class: "source-safe-commercial-nl",
        containsFileBodies: false,
        note: "Commercial prose only. Full .patch bodies require depositor or post-settled rights.",
      },
    },
    null,
    2,
  );
  return {
    filename: `${safe || "datapack"}.commercial.json`,
    mimeType: "application/json",
    body,
  };
}
