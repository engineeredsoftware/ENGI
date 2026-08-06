import { Execution } from '@bitcode/execution-generics';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import {
  buildExecutionHierarchySystemPrompt,
  PRIMITIVE_EXECUTION_SYSTEM_PROMPT,
} from '@bitcode/execution-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  attachExecutionPipelinePromptHierarchy,
  resolveExecutionPipelinePromptHost,
} from '../execution-prompt-attach-hierarchy';
import { applyPromptRegistryToExecutionPrompt } from '../execution-prompt-compose';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

function blankPrompt() {
  const p = new ExecutionPrompt();
  p.set('generic_system', ' ' as PromptPart);
  p.set('specific_execution', ' ' as PromptPart);
  return p;
}

function pipelineLike(id: string, parent?: Execution): any {
  const exec: any = new Execution(id, parent);
  exec.prompt = blankPrompt();
  exec.agents = { getAgent: () => null };
  return exec;
}

describe('prompt hierarchy attach (Execution-once + call_site compose)', () => {
  it('applies namespaced parts onto ExecutionPrompt', () => {
    const target = blankPrompt();
    const source = new Prompt();
    source.set('identity', createPromptPart('PRIMITIVE_PIPELINE'));
    applyPromptRegistryToExecutionPrompt(target, source, { namespace: 'pipeline:primitive' });
    const formatted = target.format();
    expect(formatted).toContain('PRIMITIVE_PIPELINE');
  });

  it('attachExecutionPipelinePromptHierarchy folds Execution + pipeline layers once', () => {
    const exec = pipelineLike('pipeline:test');
    const base = new Prompt();
    base.set('pattern', createPromptPart('SDIVF_BASE'));
    const specific = new Prompt();
    specific.set('lens', createPromptPart('READ_LENS'));
    attachExecutionPipelinePromptHierarchy(exec, { base, specific });

    const wire = buildExecutionHierarchySystemPrompt(exec);
    // Execution once
    expect(wire).toMatch(/You are in an Execution/i);
    // Pipeline primitive
    expect(wire).toMatch(/You are in a Pipeline/i);
    expect(wire).toContain('SDIVF_BASE');
    expect(wire).toContain('READ_LENS');
    // Not doubled: one Execution block
    const execHits = (wire.match(/You are in an Execution/gi) || []).length;
    expect(execHits).toBe(1);
  });

  it('attachExecutionPipelinePromptHierarchy lands on root, not sequential child', () => {
    const root = pipelineLike('pipeline:asset_pack');
    const seq0 = root.child('seq-0');
    const base = new Prompt();
    base.set('pattern', createPromptPart('SDIVF_ON_ROOT'));
    attachExecutionPipelinePromptHierarchy(seq0, { base });
    expect(resolveExecutionPipelinePromptHost(seq0)).toBe(root);
    const rootWire = buildExecutionHierarchySystemPrompt(root);
    expect(rootWire).toContain('SDIVF_ON_ROOT');
    expect(rootWire).toMatch(/You are in an Execution/i);
  });
});
