/**
 * Docker MCP Tools - Modern Tool Class Architecture
 * 
 * Docker containerization integration tools using the Tool class pattern.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  dockerListContainersTool as _dockerListContainers,
  dockerCreateContainerTool as _dockerCreateContainer,
  dockerRunContainerTool as _dockerRunContainer,
  dockerRecreateContainerTool as _dockerRecreateContainer,
  dockerStartContainerTool as _dockerStartContainer,
  dockerFetchContainerLogsTool as _dockerFetchContainerLogs,
  dockerStopContainerTool as _dockerStopContainer,
  dockerRemoveContainerTool as _dockerRemoveContainer,
  dockerListImagesTool as _dockerListImages,
  dockerPullImageTool as _dockerPullImage,
  dockerPushImageTool as _dockerPushImage,
  dockerBuildImageTool as _dockerBuildImage,
  dockerRemoveImageTool as _dockerRemoveImage,
  dockerListNetworksTool as _dockerListNetworks,
  dockerCreateNetworkTool as _dockerCreateNetwork,
  dockerRemoveNetworkTool as _dockerRemoveNetwork,
  dockerListVolumesTool as _dockerListVolumes,
  dockerCreateVolumeTool as _dockerCreateVolume,
  dockerRemoveVolumeTool as _dockerRemoveVolume,
} from '@bitcode/containerizations-docker';

// Import DocCodeToolPrompt
import { DOCKER_MCP_DOC_CODE_TOOL_PROMPT } from './prompts/DockerMCPDocCodeToolPrompt';

// Container Tools
class DockerListContainersTool extends Tool<typeof _dockerListContainers> {
  use = _dockerListContainers;
}

class DockerCreateContainerTool extends Tool<typeof _dockerCreateContainer> {
  use = _dockerCreateContainer;
}

class DockerRunContainerTool extends Tool<typeof _dockerRunContainer> {
  use = _dockerRunContainer;
}

class DockerRecreateContainerTool extends Tool<typeof _dockerRecreateContainer> {
  use = _dockerRecreateContainer;
}

class DockerStartContainerTool extends Tool<typeof _dockerStartContainer> {
  use = _dockerStartContainer;
}

class DockerFetchContainerLogsTool extends Tool<typeof _dockerFetchContainerLogs> {
  use = _dockerFetchContainerLogs;
}

class DockerStopContainerTool extends Tool<typeof _dockerStopContainer> {
  use = _dockerStopContainer;
}

class DockerRemoveContainerTool extends Tool<typeof _dockerRemoveContainer> {
  use = _dockerRemoveContainer;
}

// Image Tools
class DockerListImagesTool extends Tool<typeof _dockerListImages> {
  use = _dockerListImages;
}

class DockerPullImageTool extends Tool<typeof _dockerPullImage> {
  use = _dockerPullImage;
}

class DockerPushImageTool extends Tool<typeof _dockerPushImage> {
  use = _dockerPushImage;
}

class DockerBuildImageTool extends Tool<typeof _dockerBuildImage> {
  use = _dockerBuildImage;
}

class DockerRemoveImageTool extends Tool<typeof _dockerRemoveImage> {
  use = _dockerRemoveImage;
}

// Network Tools
class DockerListNetworksTool extends Tool<typeof _dockerListNetworks> {
  use = _dockerListNetworks;
}

class DockerCreateNetworkTool extends Tool<typeof _dockerCreateNetwork> {
  use = _dockerCreateNetwork;
}

class DockerRemoveNetworkTool extends Tool<typeof _dockerRemoveNetwork> {
  use = _dockerRemoveNetwork;
}

// Volume Tools
class DockerListVolumesTool extends Tool<typeof _dockerListVolumes> {
  use = _dockerListVolumes;
}

class DockerCreateVolumeTool extends Tool<typeof _dockerCreateVolume> {
  use = _dockerCreateVolume;
}

class DockerRemoveVolumeTool extends Tool<typeof _dockerRemoveVolume> {
  use = _dockerRemoveVolume;
}

// Export singleton instances - proper non-barrel exports
export const dockerListContainersTool = new DockerListContainersTool();
export const dockerCreateContainerTool = new DockerCreateContainerTool();
export const dockerRunContainerTool = new DockerRunContainerTool();
export const dockerRecreateContainerTool = new DockerRecreateContainerTool();
export const dockerStartContainerTool = new DockerStartContainerTool();
export const dockerFetchContainerLogsTool = new DockerFetchContainerLogsTool();
export const dockerStopContainerTool = new DockerStopContainerTool();
export const dockerRemoveContainerTool = new DockerRemoveContainerTool();
export const dockerListImagesTool = new DockerListImagesTool();
export const dockerPullImageTool = new DockerPullImageTool();
export const dockerPushImageTool = new DockerPushImageTool();
export const dockerBuildImageTool = new DockerBuildImageTool();
export const dockerRemoveImageTool = new DockerRemoveImageTool();
export const dockerListNetworksTool = new DockerListNetworksTool();
export const dockerCreateNetworkTool = new DockerCreateNetworkTool();
export const dockerRemoveNetworkTool = new DockerRemoveNetworkTool();
export const dockerListVolumesTool = new DockerListVolumesTool();
export const dockerCreateVolumeTool = new DockerCreateVolumeTool();
export const dockerRemoveVolumeTool = new DockerRemoveVolumeTool();

// Export DocCodeToolPrompt instance
export { DOCKER_MCP_DOC_CODE_TOOL_PROMPT };

// Export classes for type safety and extensibility
export {
  DockerListContainersTool, DockerCreateContainerTool, DockerRunContainerTool, DockerRecreateContainerTool,
  DockerStartContainerTool, DockerFetchContainerLogsTool, DockerStopContainerTool, DockerRemoveContainerTool,
  DockerListImagesTool, DockerPullImageTool, DockerPushImageTool, DockerBuildImageTool, DockerRemoveImageTool,
  DockerListNetworksTool, DockerCreateNetworkTool, DockerRemoveNetworkTool,
  DockerListVolumesTool, DockerCreateVolumeTool, DockerRemoveVolumeTool
};
