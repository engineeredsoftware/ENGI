/**
 * Local digest generation entry after removal of @bitcode/digest.
 * Full repository digester implementation was retired with packages/digest.
 * Callers should treat this as fail-closed until reimplemented on digester agent.
 */

export type DigestOptions = Record<string, unknown>;

export type GenerateDigestResult = {
  digestPath: string;
  [key: string]: unknown;
};

export async function generateDigest(_options: DigestOptions = {}): Promise<GenerateDigestResult> {
  throw new Error(
    '@bitcode/digest was removed. Reimplement repository digest generation under @bitcode/generic-agents-digesting if needed.'
  );
}

export async function callLLMAPI(..._args: unknown[]): Promise<unknown> {
  throw new Error(
    '@bitcode/digest was removed. Use @bitcode/generic-llms / models for LLM calls.'
  );
}
