declare module '@bitcode/generic-tools-mcps-vercel' {
  type ToolResult = Promise<Record<string, unknown>>;

  export const vercelListTeamsTool: { execute: () => ToolResult };
  export const vercelListProjectsTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelGetProjectTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelListDeploymentsTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelGetDeploymentTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelGetDeploymentEventsTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelGetDeploymentBuildLogsTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelSearchDocumentationTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelDeployProjectTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelBuyDomainTool: { execute: (input?: Record<string, unknown>) => ToolResult };
  export const vercelCheckDomainAvailabilityTool: { execute: (input?: Record<string, unknown>) => ToolResult };
}
