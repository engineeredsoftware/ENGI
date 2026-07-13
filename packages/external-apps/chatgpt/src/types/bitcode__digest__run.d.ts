declare module '@bitcode/digest/run' {
  export interface GenerateDigestOptions {
    owner: string;
    repo: string;
    commit: string;
    correlationId?: string;
    usePreClonedRepo?: boolean;
    rootDir?: string;
    forceRegenerate?: boolean;
  }

  export interface GenerateDigestResult {
    productDocument?: string;
    agentDocument?: string;
  }

  export function generateDigest(options: GenerateDigestOptions): Promise<GenerateDigestResult>;
}
