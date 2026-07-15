type SearchArgs = {
  pattern: string;
  cwd?: string;
  maxResults?: number;
  ignoreCase?: boolean;
};

export const simpleSystemTextSearch = {
  async execute(args: SearchArgs) {
    const max = args.maxResults ?? 1;
    return Array.from({ length: max }).map((_, index) => ({
      file: `${args.cwd ?? 'repo'}/mock-file-${index}.ts`,
      line: index,
      text: `match for ${args.pattern}`
    }));
  }
};
