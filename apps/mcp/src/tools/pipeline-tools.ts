export function registerPipelineTools(): MCPTool[] {
  return [
    {
      name: 'bitcode://synthesize-asset-packs-for-deposit',
      description: 'Test harness wrapper for deposit AssetPack synthesis ingress.',
      inputSchema: AssetPackPipelineToolSchema,
      execute: async (args: z.infer<typeof AssetPackPipelineToolSchema>, context: MCPAuthContext) => {
        return executePipelineWithMonitoring(args, context, 'asset-pack');
      },
    },
  ];
}
