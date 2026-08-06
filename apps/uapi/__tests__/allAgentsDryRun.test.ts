import { testAgent } from './agentTestFactory';

// ------------------------------------------------------------------
// AssetPack - Setup
// ------------------------------------------------------------------
import { AssetPackCloneVCSRepositoryAgent } from '@bitcode/asset-packs-pipelines-syntheses-domain';

// ------------------------------------------------------------------
// Discovery (subset)
// ------------------------------------------------------------------
import { SIMPLE_TEXT_SEARCH_AGENT } from '@bitcode/generic-agents-text-search';

// ------------------------------------------------------------------
// Matrix: [agentConst, phase, [expected tool names]]
const MATRIX: Array<[any, string, string[]]> = [
  [AssetPackCloneVCSRepositoryAgent, 'setup', ['asset-pack-clone-vcs-repository-tool']],
  [SIMPLE_TEXT_SEARCH_AGENT, 'discovery', ['simpleSystemTextSearch']],
];

MATRIX.forEach(([agent, phase, tools]) => testAgent(agent, phase, tools));
