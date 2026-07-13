/**
 * CircleCI MCP Tools - Modern Tool Class Architecture
 * 
 * CircleCI CI/CD integration tools using the Tool class pattern.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  circleciConfigHelperTool as _circleciConfigHelper,
  circleciGetLatestPipelineStatusTool as _circleciGetLatestPipelineStatus,
  circleciCreatePromptTemplateTool as _circleciCreatePromptTemplate,
  circleciGenerateTestsForPromptTemplateTool as _circleciGenerateTestsForPromptTemplate,
  circleciGetBuildFailureLogsTool as _circleciGetBuildFailureLogs,
  circleciFindFlakyTestsTool as _circleciFindFlakyTests,
  circleciListProjectsTool as _circleciListProjects,
  circleciGetPipelineDetailsTool as _circleciGetPipelineDetails,
  circleciRerunWorkflowTool as _circleciRerunWorkflow,
  circleciGetProjectSettingsTool as _circleciGetProjectSettings,
  circleciAddEnvVarTool as _circleciAddEnvVar,
  circleciApproveJobTool as _circleciApproveJob,
} from '@bitcode/ci-circle';

// Import DocCodeToolPrompt
import { CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT } from './prompts/CircleCIMCPDocCodeToolPrompt';

/**
 * CircleCI Configuration Helper Tool for CI/CD pipeline configuration
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciConfigHelperTool extends Tool<typeof _circleciConfigHelper> {
  use = _circleciConfigHelper;
}

/**
 * CircleCI Get Latest Pipeline Status Tool for monitoring pipeline health
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciGetLatestPipelineStatusTool extends Tool<typeof _circleciGetLatestPipelineStatus> {
  use = _circleciGetLatestPipelineStatus;
}

/**
 * CircleCI Create Prompt Template Tool for automated template generation
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciCreatePromptTemplateTool extends Tool<typeof _circleciCreatePromptTemplate> {
  use = _circleciCreatePromptTemplate;
}

/**
 * CircleCI Generate Tests for Prompt Template Tool for test automation
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciGenerateTestsForPromptTemplateTool extends Tool<typeof _circleciGenerateTestsForPromptTemplate> {
  use = _circleciGenerateTestsForPromptTemplate;
}

/**
 * CircleCI Get Build Failure Logs Tool for debugging CI/CD issues
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciGetBuildFailureLogsTool extends Tool<typeof _circleciGetBuildFailureLogs> {
  use = _circleciGetBuildFailureLogs;
}

/**
 * CircleCI Find Flaky Tests Tool for test reliability analysis
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciFindFlakyTestsTool extends Tool<typeof _circleciFindFlakyTests> {
  use = _circleciFindFlakyTests;
}

/**
 * CircleCI List Projects Tool for project management operations
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciListProjectsTool extends Tool<typeof _circleciListProjects> {
  use = _circleciListProjects;
}

/**
 * CircleCI Get Pipeline Details Tool for detailed pipeline information
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciGetPipelineDetailsTool extends Tool<typeof _circleciGetPipelineDetails> {
  use = _circleciGetPipelineDetails;
}

/**
 * CircleCI Rerun Workflow Tool for workflow management operations
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciRerunWorkflowTool extends Tool<typeof _circleciRerunWorkflow> {
  use = _circleciRerunWorkflow;
}

/**
 * CircleCI Get Project Settings Tool for project configuration management
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciGetProjectSettingsTool extends Tool<typeof _circleciGetProjectSettings> {
  use = _circleciGetProjectSettings;
}

/**
 * CircleCI Add Environment Variable Tool for environment configuration
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciAddEnvVarTool extends Tool<typeof _circleciAddEnvVar> {
  use = _circleciAddEnvVar;
}

/**
 * CircleCI Approve Job Tool for manual approval workflow operations
 * 
 * @doc-code-tool
 * @prompt CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT
 */
class CircleciApproveJobTool extends Tool<typeof _circleciApproveJob> {
  use = _circleciApproveJob;
}

// Export singleton instances - proper non-barrel exports
export const circleciConfigHelperTool = new CircleciConfigHelperTool();
export const circleciGetLatestPipelineStatusTool = new CircleciGetLatestPipelineStatusTool();
export const circleciCreatePromptTemplateTool = new CircleciCreatePromptTemplateTool();
export const circleciGenerateTestsForPromptTemplateTool = new CircleciGenerateTestsForPromptTemplateTool();
export const circleciGetBuildFailureLogsTool = new CircleciGetBuildFailureLogsTool();
export const circleciFindFlakyTestsTool = new CircleciFindFlakyTestsTool();
export const circleciListProjectsTool = new CircleciListProjectsTool();
export const circleciGetPipelineDetailsTool = new CircleciGetPipelineDetailsTool();
export const circleciRerunWorkflowTool = new CircleciRerunWorkflowTool();
export const circleciGetProjectSettingsTool = new CircleciGetProjectSettingsTool();
export const circleciAddEnvVarTool = new CircleciAddEnvVarTool();
export const circleciApproveJobTool = new CircleciApproveJobTool();

// Export DocCodeToolPrompt instance
export { CIRCLECI_MCP_DOC_CODE_TOOL_PROMPT };

// Export classes for type safety and extensibility
export { CircleciConfigHelperTool };
export { CircleciGetLatestPipelineStatusTool };
export { CircleciCreatePromptTemplateTool };
export { CircleciGenerateTestsForPromptTemplateTool };
export { CircleciGetBuildFailureLogsTool };
export { CircleciFindFlakyTestsTool };
export { CircleciListProjectsTool };
export { CircleciGetPipelineDetailsTool };
export { CircleciRerunWorkflowTool };
export { CircleciGetProjectSettingsTool };
export { CircleciAddEnvVarTool };
export { CircleciApproveJobTool };
