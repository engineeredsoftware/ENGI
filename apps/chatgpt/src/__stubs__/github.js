"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubProvider = void 0;
class GitHubProvider {
    constructor(_config) {
        this._config = _config;
    }
    async listCommits(_auth, owner, repo, options) {
        const count = options.perPage ?? 3;
        return Array.from({ length: count }).map((_, index) => ({
            sha: `${owner}-${repo}-sha-${index}`,
            message: `Mock commit ${index + 1} on ${options.branch ?? 'main'}`,
            author: { name: 'Bitcode Bot' },
            url: `https://github.com/${owner}/${repo}/commit/mock-${index}`
        }));
    }
    async createRepository(_auth, details, _options) {
        return {
            id: `repo-${details.name}`,
            name: details.name,
            description: details.description,
            private: details.private ?? false,
            url: `https://github.com/mock/${details.name}`
        };
    }
}
exports.GitHubProvider = GitHubProvider;
