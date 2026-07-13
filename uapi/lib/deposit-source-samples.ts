/**
 * Bounded prompt excerpts for deposit source inventory.
 *
 * Pure: prioritizes manifests/README, then shallow source files, capped by
 * count and character length for LLM prompt budgets.
 */

import type { HostSourceFile } from "@bitcode/pipeline-hosts";

const SAMPLE_PRIORITY_PATTERNS = [
  /^readme/i,
  /^package\.json$/i,
  /^pyproject\.toml$/i,
  /^cargo\.toml$/i,
  /^go\.mod$/i,
  /^setup\.(py|cfg)$/i,
  /^requirements.*\.txt$/i,
];

export const DEPOSIT_MAX_SAMPLE_FILES = 24;
export const DEPOSIT_MAX_SAMPLE_CHARS = 4000;

/** Bounded prompt excerpts derived from the real checkout (manifests/README + shallow source). */
export function pickDepositSourceSamples(
  sources: HostSourceFile[],
): { path: string; excerpt: string }[] {
  const byPath = new Map(sources.map((file) => [file.path, file.content]));
  const allPaths = sources.map((file) => file.path);
  const prioritized = allPaths.filter((path) =>
    SAMPLE_PRIORITY_PATTERNS.some((pattern) =>
      pattern.test(path.split("/").pop() || ""),
    ),
  );
  const sourceLike = allPaths.filter(
    (path) =>
      !prioritized.includes(path) &&
      /\.(ts|tsx|js|jsx|py|rs|go|rb|java|cs|swift|sol|md)$/i.test(path) &&
      path.split("/").length <= 3,
  );
  return [...prioritized, ...sourceLike]
    .slice(0, DEPOSIT_MAX_SAMPLE_FILES)
    .map((path) => ({
      path,
      excerpt: (byPath.get(path) || "").slice(0, DEPOSIT_MAX_SAMPLE_CHARS),
    }));
}
