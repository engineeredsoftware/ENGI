/**
 * Kubernetes MCP Tools - Modern Tool Class Architecture
 * 
 * Kubernetes cluster management and orchestration tools using the Tool class pattern.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  kubernetesListPodsTool as _kubernetesListPods,
  kubernetesListServicesTool as _kubernetesListServices,
  kubernetesListDeploymentsTool as _kubernetesListDeployments,
  kubernetesDescribeNodeTool as _kubernetesDescribeNode,
} from '@bitcode/containerizations-kubernetes';

// Import DocCodeToolPrompt
import { KUBERNETES_MCP_DOC_CODE_TOOL_PROMPT } from './prompts/KubernetesMCPDocCodeToolPrompt';

/**
 * Kubernetes List Pods Tool for pod discovery and monitoring
 * 
 * @doc-code-tool
 * @prompt KUBERNETES_MCP_DOC_CODE_TOOL_PROMPT
 */
class KubernetesListPodsTool extends Tool<typeof _kubernetesListPods> {
  use = _kubernetesListPods;
}

/**
 * Kubernetes List Services Tool for service discovery and networking
 * 
 * @doc-code-tool
 * @prompt KUBERNETES_MCP_DOC_CODE_TOOL_PROMPT
 */
class KubernetesListServicesTool extends Tool<typeof _kubernetesListServices> {
  use = _kubernetesListServices;
}

/**
 * Kubernetes List Deployments Tool for deployment management
 * 
 * @doc-code-tool
 * @prompt KUBERNETES_MCP_DOC_CODE_TOOL_PROMPT
 */
class KubernetesListDeploymentsTool extends Tool<typeof _kubernetesListDeployments> {
  use = _kubernetesListDeployments;
}

/**
 * Kubernetes Describe Node Tool for node inspection and diagnostics
 * 
 * @doc-code-tool
 * @prompt KUBERNETES_MCP_DOC_CODE_TOOL_PROMPT
 */
class KubernetesDescribeNodeTool extends Tool<typeof _kubernetesDescribeNode> {
  use = _kubernetesDescribeNode;
}

// Export singleton instances - proper non-barrel exports
export const kubernetesListPodsTool = new KubernetesListPodsTool();
export const kubernetesListServicesTool = new KubernetesListServicesTool();
export const kubernetesListDeploymentsTool = new KubernetesListDeploymentsTool();
export const kubernetesDescribeNodeTool = new KubernetesDescribeNodeTool();

// Export DocCodeToolPrompt instance
export { KUBERNETES_MCP_DOC_CODE_TOOL_PROMPT };

// Export classes for type safety and extensibility
export { KubernetesListPodsTool };
export { KubernetesListServicesTool };
export { KubernetesListDeploymentsTool };
export { KubernetesDescribeNodeTool };
