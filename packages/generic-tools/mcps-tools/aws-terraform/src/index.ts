/**
 * AWS Terraform MCP Tools - Modern Tool Class Architecture
 *
 * Stubs inlined (no @bitcode/aws package — removed; artifact S3 is
 * @bitcode/generic-artifacts-aws-provider).
 */

import { Tool } from '@bitcode/tools-generics';
import { AWS_TERRAFORM_MCP_DOC_CODE_TOOL_PROMPT } from './prompts/AWSTerraformMCPDocCodeToolPrompt';

async function _awsTerraformSecurityScan(_params: { code: string }): Promise<{
  secure: boolean;
  issues: unknown[];
}> {
  return { secure: true, issues: [] };
}

async function _awsTerraformModuleSuggestion(_params: { code: string }): Promise<{
  suggestions: unknown[];
}> {
  return { suggestions: [] };
}

async function _awsTerraformCheckovScan(_params: { code: string }): Promise<{
  secure: boolean;
  issues: unknown[];
}> {
  return { secure: true, issues: [] };
}

async function _awsTerraformGenerateAwsModule(_params: { code: string }): Promise<{
  suggestions: unknown[];
}> {
  return { suggestions: [] };
}

class AwsTerraformSecurityScanTool extends Tool<typeof _awsTerraformSecurityScan> {
  use = _awsTerraformSecurityScan;
}

class AwsTerraformModuleSuggestionTool extends Tool<typeof _awsTerraformModuleSuggestion> {
  use = _awsTerraformModuleSuggestion;
}

class AwsTerraformCheckovScanTool extends Tool<typeof _awsTerraformCheckovScan> {
  use = _awsTerraformCheckovScan;
}

class AwsTerraformGenerateAwsModuleTool extends Tool<typeof _awsTerraformGenerateAwsModule> {
  use = _awsTerraformGenerateAwsModule;
}

export const awsTerraformSecurityScanTool = new AwsTerraformSecurityScanTool();
export const awsTerraformModuleSuggestionTool = new AwsTerraformModuleSuggestionTool();
export const awsTerraformCheckovScanTool = new AwsTerraformCheckovScanTool();
export const awsTerraformGenerateAwsModuleTool = new AwsTerraformGenerateAwsModuleTool();

export { AWS_TERRAFORM_MCP_DOC_CODE_TOOL_PROMPT };
export {
  AwsTerraformSecurityScanTool,
  AwsTerraformModuleSuggestionTool,
  AwsTerraformCheckovScanTool,
  AwsTerraformGenerateAwsModuleTool,
};
