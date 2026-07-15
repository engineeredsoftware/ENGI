/**
 * Pure helpers for deposit source selection (repository path parsing, JSON).
 */

/** Split `owner/repo` full names used by VCS API coordinates. */
export function splitRepositoryFullName(
  fullName?: string | null,
): { owner: string; repo: string } | null {
  const normalized = fullName?.trim();
  if (!normalized || !normalized.includes("/")) return null;
  const [owner, repo] = normalized.split("/", 2);
  if (!owner || !repo) return null;
  return { owner, repo };
}

/** Read JSON only when the response looks like application/json. */
export async function readJsonResponse(
  response: Response,
): Promise<unknown | null> {
  const contentType = response.headers?.get?.("content-type") || "";
  if (contentType && !contentType.includes("application/json")) return null;
  return response.json().catch(() => null);
}
