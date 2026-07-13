type SearchOptions = {
  numResults?: number;
  useAutoprompt?: boolean;
};

export const search = {
  async execute(query: string, options: SearchOptions = {}) {
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
