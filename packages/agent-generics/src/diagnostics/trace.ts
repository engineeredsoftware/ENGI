import type { Execution } from '@bitcode/execution-generics/Execution';

export interface ExecutionTraceNode {
  id: string;
  type: 'agent' | 'step' | 'generation' | 'execution';
  path: string[];
  namespaces: Record<string, Record<string, any>>;
  prompt?: { formatted?: string };
  children: ExecutionTraceNode[];
}

function classify(execution: any): ExecutionTraceNode['type'] {
  const id: string = execution?.id || '';
  if (id.includes('agent:')) return 'agent';
  if (id.includes('step:')) return 'step';
  if (
    id.includes('failsafe:') ||
    id.includes('thinkings:') ||
    id.includes('generation:')
  ) {
    return 'generation';
  }
  return 'execution';
}

function collectNamespaces(execution: any): Record<string, Record<string, any>> {
  const result: Record<string, Record<string, any>> = {};
  try {
    const ns = execution.getNamespaces?.() || [];
    for (const name of ns) {
      const map = execution.getAll?.(name);
      if (map && typeof map === 'object' && 'forEach' in map) {
        const out: Record<string, any> = {};
        (map as Map<string, any>).forEach((v: any, k: string) => {
          out[k] = v;
        });
        result[name] = out;
      }
    }
  } catch {}
  return result;
}

function collectPrompt(execution: any): { formatted?: string } | undefined {
  try {
    if ('prompt' in execution && execution.prompt && typeof execution.prompt.format === 'function') {
      const formatted = execution.prompt.format();
      if (formatted && String(formatted).trim()) {
        return { formatted: String(formatted) };
      }
    }
  } catch {}
  return undefined;
}

export function collectExecutionTrace(root: Execution): ExecutionTraceNode {
  const visit = (node: any): ExecutionTraceNode => {
    const children: ExecutionTraceNode[] = [];
    try {
      node.children?.forEach?.((child: Execution) => {
        children.push(visit(child));
      });
    } catch {}
    return {
      id: node.id,
      type: classify(node),
      path: (node.getPath?.() || []),
      namespaces: collectNamespaces(node),
      prompt: collectPrompt(node),
      children
    };
  };
  return visit(root);
}

// Convenience: narrow to agent subtree when you have an AgentExecution
export function collectAgentTrace(agentExecution: Execution): ExecutionTraceNode {
  return collectExecutionTrace(agentExecution);
}

export interface ExecutionTraceSummary {
  nodeCount: number;
  namespaceCount: number;
  stepIds: string[];
  /** Generation-shaped node ids (failsafe / thinkings / tools). */
  generationIds: string[];
}

export function summarizeExecutionTrace(trace: ExecutionTraceNode): ExecutionTraceSummary {
  let nodeCount = 0;
  let namespaceCount = 0;
  const stepIds: string[] = [];
  const generationIds: string[] = [];
  const visit = (n: ExecutionTraceNode) => {
    nodeCount++;
    namespaceCount += Object.keys(n.namespaces || {}).length;
    if (n.type === 'step') stepIds.push(n.id);
    if (n.type === 'generation') generationIds.push(n.id);
    for (const c of n.children || []) visit(c);
  };
  visit(trace);
  return {
    nodeCount,
    namespaceCount,
    stepIds,
    generationIds,
  };
}

export function extractFirstProviderModel(trace: ExecutionTraceNode): { provider?: string; model?: string } {
  let provider: string | undefined;
  let model: string | undefined;
  const visit = (n: ExecutionTraceNode) => {
    if (!provider || !model) {
      const llmNS = n.namespaces?.llm as any;
      if (llmNS && (llmNS.provider || llmNS.model)) {
        provider = provider || (typeof llmNS.provider === 'string' ? llmNS.provider : undefined);
        model = model || (typeof llmNS.model === 'string' ? llmNS.model : undefined);
      }
      for (const c of n.children || []) visit(c);
    }
  };
  visit(trace);
  return { provider, model };
}
