/**
 * Vercel MCP Tools - Modern Tool Class Architecture
 * 
 * Vercel deployment and platform integration tools using the Tool class pattern.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  getDeployment,
  getDeploymentBuildLogs,
  getDeploymentEvents,
  getProject,
  listDeployments,
  listProjects,
  listTeams,
  searchDocumentation,
  deployToVercel,
  buyDomain,
  checkDomainAvailability
} from '@bitcode/externals-vercel';

// Import DocCodeToolPrompt
import { VERCEL_MCP_DOC_CODE_TOOL_PROMPT } from './prompts/VercelMCPDocCodeToolPrompt';

/**
 * Vercel Get Deployment Events Tool for deployment monitoring and diagnostics
 * 
 * @doc-code-tool
 * @prompt VERCEL_MCP_DOC_CODE_TOOL_PROMPT
 */
class VercelGetDeploymentEventsTool extends Tool<typeof getDeploymentEvents> {
  use = getDeploymentEvents;
}

/**
 * Vercel Get Deployment Tool for deployment information and status
 * 
 * @doc-code-tool
 * @prompt VERCEL_MCP_DOC_CODE_TOOL_PROMPT
 */
class VercelGetDeploymentTool extends Tool<typeof getDeployment> {
  use = getDeployment;
}

class VercelListDeploymentsTool extends Tool<typeof listDeployments> {
  use = listDeployments;
}

class VercelGetDeploymentBuildLogsTool extends Tool<typeof getDeploymentBuildLogs> {
  use = getDeploymentBuildLogs;
}

class VercelListProjectsTool extends Tool<typeof listProjects> {
  use = listProjects;
}

class VercelGetProjectTool extends Tool<typeof getProject> {
  use = getProject;
}

class VercelListTeamsTool extends Tool<typeof listTeams> {
  use = listTeams;
}

class VercelSearchDocumentationTool extends Tool<typeof searchDocumentation> {
  use = searchDocumentation;
}

class VercelDeployProjectTool extends Tool<typeof deployToVercel> {
  use = deployToVercel;
}

class VercelBuyDomainTool extends Tool<typeof buyDomain> {
  use = buyDomain;
}

class VercelCheckDomainAvailabilityTool extends Tool<typeof checkDomainAvailability> {
  use = checkDomainAvailability;
}

// Export singleton instances - proper non-barrel exports
export const vercelGetDeploymentEventsTool = new VercelGetDeploymentEventsTool();
export const vercelGetDeploymentTool = new VercelGetDeploymentTool();
export const vercelListDeploymentsTool = new VercelListDeploymentsTool();
export const vercelGetDeploymentBuildLogsTool = new VercelGetDeploymentBuildLogsTool();
export const vercelListProjectsTool = new VercelListProjectsTool();
export const vercelGetProjectTool = new VercelGetProjectTool();
export const vercelListTeamsTool = new VercelListTeamsTool();
export const vercelSearchDocumentationTool = new VercelSearchDocumentationTool();
export const vercelDeployProjectTool = new VercelDeployProjectTool();
export const vercelBuyDomainTool = new VercelBuyDomainTool();
export const vercelCheckDomainAvailabilityTool = new VercelCheckDomainAvailabilityTool();

// Export DocCodeToolPrompt instance
export { VERCEL_MCP_DOC_CODE_TOOL_PROMPT };

// Export classes for type safety and extensibility
export { VercelGetDeploymentEventsTool };
export { VercelGetDeploymentTool };
export { VercelListDeploymentsTool };
export { VercelGetDeploymentBuildLogsTool };
export { VercelListProjectsTool };
export { VercelGetProjectTool };
export { VercelListTeamsTool };
export { VercelSearchDocumentationTool };
export { VercelDeployProjectTool };
export { VercelBuyDomainTool };
export { VercelCheckDomainAvailabilityTool };
