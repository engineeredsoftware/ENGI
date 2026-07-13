/** Small URL helpers used for optional deep-link validation on attachments. */

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function parseURL(url: string): { domain: string; path?: string } | null {
  try {
    const parsed = new URL(url);
    return {
      domain: parsed.hostname,
      path: parsed.pathname !== '/' ? parsed.pathname : undefined,
    };
  } catch {
    return null;
  }
}
