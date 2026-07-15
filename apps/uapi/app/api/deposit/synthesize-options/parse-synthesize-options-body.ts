/**
 * Pure body parsers for POST /api/deposit/synthesize-options.
 * Co-located with the route; no Next/runtime dependencies.
 */

export type SynthesizeOptionsBody = {
  runId?: unknown;
  repositoryFullName?: unknown;
  sourceBranch?: unknown;
  sourceCommit?: unknown;
  obfuscations?: unknown;
  /** Permissible sources roots — when non-empty, inventory is scoped to these paths. */
  permissibleSources?: unknown;
  impermissibleSources?: unknown;
  /** @deprecated Prefer permissibleSources. Accepted for dual-read. */
  forcedInclusions?: unknown;
  /** @deprecated Prefer impermissibleSources. Accepted for dual-read. */
  forcedExclusions?: unknown;
  demandContext?: unknown;
  depositoryDemandSignals?: unknown;
  readingDemandSignals?: unknown;
  existingDepositorySignals?: unknown;
};

export function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function readStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

export function readSignals(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) =>
      entry && typeof entry === "object" && !Array.isArray(entry)
        ? (entry as Record<string, unknown>)
        : null,
    )
    .filter((entry): entry is Record<string, unknown> => entry !== null)
    .map((entry) => ({
      id: readString(entry.id),
      label: readString(entry.label),
      summary: readString(entry.summary),
      weight: typeof entry.weight === "number" ? entry.weight : null,
    }));
}

export type ParsedSynthesizeOptionsSteering = {
  repositoryFullName: string;
  requestedRunId: string | null;
  sourceBranch: string | null;
  sourceCommit: string | null;
  obfuscations: string | null;
  permissibleSourcesRaw: string[];
  impermissibleSourcesRaw: string[];
  demandContext: string[];
  depositoryDemandSignals: ReturnType<typeof readSignals>;
  readingDemandSignals: ReturnType<typeof readSignals>;
  existingDepositorySignals: ReturnType<typeof readSignals>;
};

/**
 * Parse and normalize steering fields from a validated JSON body.
 * Does not validate repository ownership or auth — route owns those gates.
 */
export function parseSynthesizeOptionsSteering(
  body: SynthesizeOptionsBody,
): ParsedSynthesizeOptionsSteering | { error: string; status: number } {
  const repositoryFullName = readString(body.repositoryFullName);
  if (!repositoryFullName || !/^[\w.-]+\/[\w.-]+$/.test(repositoryFullName)) {
    return {
      error: "repositoryFullName (owner/repo) is required.",
      status: 400,
    };
  }
  return {
    repositoryFullName,
    requestedRunId: readString(body.runId),
    sourceBranch: readString(body.sourceBranch),
    sourceCommit: readString(body.sourceCommit),
    obfuscations: readString(body.obfuscations),
    permissibleSourcesRaw: readStringList(
      body.permissibleSources ?? body.forcedInclusions,
    ),
    impermissibleSourcesRaw: readStringList(
      body.impermissibleSources ?? body.forcedExclusions,
    ),
    demandContext: readStringList(body.demandContext),
    depositoryDemandSignals: readSignals(body.depositoryDemandSignals),
    readingDemandSignals: readSignals(body.readingDemandSignals),
    existingDepositorySignals: readSignals(body.existingDepositorySignals),
  };
}
