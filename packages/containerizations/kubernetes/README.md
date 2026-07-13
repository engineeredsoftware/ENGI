# @bitcode/kubernetes

Kubernetes cluster management tools for the Bitcode platform. Provides essential cluster introspection and resource management capabilities.

## Available Tools

- **kubernetesListPodsTool**: List all pods in cluster
- **kubernetesListServicesTool**: List all services in cluster  
- **kubernetesListDeploymentsTool**: List all deployments in cluster
- **kubernetesDescribeNodeTool**: Get detailed node information

## Usage

```typescript
import { 
  kubernetesListPodsTool,
  kubernetesListServicesTool,
  kubernetesDescribeNodeTool 
} from '@bitcode/kubernetes';

// List cluster resources
const pods = await kubernetesListPodsTool();
const services = await kubernetesListServicesTool();
const deployments = await kubernetesListDeploymentsTool();

// Get node details
const nodeInfo = await kubernetesDescribeNodeTool({ 
  nodeName: 'worker-node-1' 
});
```

## Return Types

All tools return structured data with resource information:
- **Pods**: Pod status, containers, resource usage
- **Services**: Service endpoints, selectors, ports
- **Deployments**: Replica status, rolling update state
- **Nodes**: Capacity, conditions, allocated resources

## Architecture

Tools provide abstracted access to Kubernetes API resources. Designed for integration with Bitcode pipeline monitoring and infrastructure management workflows.
