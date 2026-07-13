import type { VCSAuth } from './vcs';

type Commit = {
  sha: string;
  message: string;
  author?: { name?: string };
  url: string;
};

export class GitHubProvider {
  constructor(private readonly _config: Record<string, unknown>) {}

  async listCommits(_auth: VCSAuth, owner: string, repo: string, options: { branch?: string; perPage?: number }): Promise<Commit[]> {
    const count = options.perPage ?? 3;
    return Array.from({ length: count }).map((_, index) => ({
      sha: `${owner}-${repo}-sha-${index}`,
      message: `Mock commit ${index + 1} on ${options.branch ?? 'main'}`,
      author: { name: 'Bitcode Bot' },
      url: `https://github.com/${owner}/${repo}/commit/mock-${index}`
    }));
  }

  async createRepository(
    _auth: VCSAuth,
    details: { name: string; description?: string; private?: boolean; autoInit?: boolean },
    _options?: unknown
  ) {
    return {
      id: `repo-${details.name}`,
      name: details.name,
      description: details.description,
      private: details.private ?? false,
      url: `https://github.com/mock/${details.name}`
    };
  }
}
