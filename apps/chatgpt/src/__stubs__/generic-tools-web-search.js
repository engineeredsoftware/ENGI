"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
exports.search = {
    async execute(query, options = {}) {
        const count = options.numResults ?? 3;
        return {
            results: Array.from({ length: count }).map((_, index) => ({
                title: `Mock reference ${index + 1} for ${query}`,
                url: `https://example.com/${encodeURIComponent(query)}/${index + 1}`,
                summary: `Auto-sourced insight ${index + 1}`,
                snippet: `Auto-sourced insight ${index + 1}`
            }))
        };
    }
};
