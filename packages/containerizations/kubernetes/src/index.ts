export async function kubernetesListPodsTool(params?: {}): Promise<any> {
  return { pods: [] };
}

export async function kubernetesListServicesTool(params?: {}): Promise<any> {
  return { services: [] };
}

export async function kubernetesListDeploymentsTool(params?: {}): Promise<any> {
  return { deployments: [] };
}

export async function kubernetesDescribeNodeTool(params: { nodeName: string }): Promise<any> {
  return { nodeName: params.nodeName, details: {} };
}
