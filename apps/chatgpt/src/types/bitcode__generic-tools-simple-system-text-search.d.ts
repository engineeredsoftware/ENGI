declare module '@bitcode/generic-tools-simple-system-text-search' {
  export const simpleSystemTextSearch: {
    execute: (args: {
      pattern: string;
      cwd?: string;
      maxResults?: number;
      ignoreCase?: boolean;
    }) => Promise<Array<{ file: string; line: number; text: string }>>;
  };
}
