declare module '@bitcode/generic-tools-web-search' {
  export const search: {
    execute: (
      query: string,
      options?: { numResults?: number; useAutoprompt?: boolean }
    ) => Promise<{ results: Array<{ title: string; url: string; summary?: string; snippet?: string }> }>;
  };
}
