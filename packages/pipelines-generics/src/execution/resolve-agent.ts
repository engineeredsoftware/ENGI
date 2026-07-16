import type { ExecutionAgent } from './ExecutionPipelineAgentRegistry';

type RegisteredAgent = ExecutionAgent | (() => Promise<ExecutionAgent | { default?: ExecutionAgent }>);

export async function resolveRegisteredAgent(
  agentName: string,
  registeredAgent: RegisteredAgent | undefined
): Promise<ExecutionAgent> {
  if (!registeredAgent) {
    throw new Error(`Agent not found: ${agentName}`);
  }

  if (typeof registeredAgent !== 'function') {
    throw new Error(`Registered agent is not executable: ${agentName}`);
  }

  if (registeredAgent.length === 0) {
    const loaded = await (registeredAgent as () => Promise<ExecutionAgent | { default?: ExecutionAgent }>)();
    if (typeof loaded === 'function') {
      return loaded;
    }
    if (typeof loaded?.default === 'function') {
      return loaded.default;
    }
  }

  return registeredAgent as ExecutionAgent;
}
