export function registerMeasureTools(): MCPTool[] {
  const measureContract = getBtdMcpToolContract('bitcode://measure');

  return [
    {
      name: measureContract.toolId,
      description: measureContract.description,
      inputSchema: RepositoryMeasureSchema,
      execute: async (args: z.infer<typeof RepositoryMeasureSchema>, context: MCPAuthContext) => {
        return executeRepositoryMeasure(
          args.repository,
          args.measureType,
          {
            depth: args.depth,
            includeMetrics: args.includeMetrics,
            outputFormat: args.outputFormat,
          },
          context,
        );
      },
    },
  ];
}

// Multi-measure sub-tools (trends/patterns/dependencies) collapsed into bitcode://measure.
