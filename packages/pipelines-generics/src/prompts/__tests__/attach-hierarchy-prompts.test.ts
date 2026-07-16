import { Execution } from '@bitcode/execution-generics';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import {
  buildExecutionHierarchySystemPrompt,
  PRIMITIVE_EXECUTION_SYSTEM_PROMPT,
} from '@bitcode/execution-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  attachPipelinePromptHierarchy,
  attachPhasePromptHierarchy,
  resolvePipelinePromptHost,
} from '../attach-hierarchy-prompts';
import { applyPromptRegistryToExecutionPrompt } from '../compose-execution-prompt';
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

  it('attachPipelinePromptHierarchy folds Execution + pipeline layers once', () => {
    const exec = pipelineLike('pipeline:test');
    const base = new Prompt();
    base.set('pattern', createPromptPart('SDIVF_BASE'));
    const specific = new Prompt();
    specific.set('lens', createPromptPart('READ_LENS'));
    attachPipelinePromptHierarchy(exec, { base, specific });

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

  it('attachPipelinePromptHierarchy lands on root, not sequential child', () => {
    const root = pipelineLike('pipeline:asset_pack');
    const seq0 = root.child('seq-0');
    const base = new Prompt();
    base.set('pattern', createPromptPart('SDIVF_ON_ROOT'));
    attachPipelinePromptHierarchy(seq0, { base });
    expect(resolvePipelinePromptHost(seq0)).toBe(root);
    const rootWire = buildExecutionHierarchySystemPrompt(root);
    expect(rootWire).toContain('SDIVF_ON_ROOT');
    expect(rootWire).toMatch(/You are in an Execution/i);
  });

  it('attachPhasePromptHierarchy does not re-emit Execution', () => {
    const exec: any = new Execution('phase:setup');
    exec.prompt = blankPrompt();
    const specific = new Prompt();
    specific.set('objective', createPromptPart('READ_SETUP_OBJECTIVE'));
    attachPhasePromptHierarchy(exec, 'setup', { specific });
    const wire = buildExecutionHierarchySystemPrompt(exec);
    expect(wire).toMatch(/You are in a Phase/i);
    expect(wire).toContain('READ_SETUP_OBJECTIVE');
    expect(wire).not.toMatch(/You are in an Execution/i);
  });

  it('pipeline + phase parent chain has Execution only on pipeline block', () => {
    const pipeline = pipelineLike('pipeline:asset_pack');
    attachPipelinePromptHierarchy(pipeline, {
      base: new Prompt().set('pattern', createPromptPart('SDIVF_BASE')),
    });
    const phase: any = new Execution('phase:setup', pipeline);
    phase.prompt = blankPrompt();
    attachPhasePromptHierarchy(phase, 'setup', {
      specific: new Prompt().set('objective', createPromptPart('SETUP_SPECIFIC')),
    });
    const wire = buildExecutionHierarchySystemPrompt(phase);
    expect((wire.match(/You are in an Execution/gi) || []).length).toBe(1);
    expect(wire).toMatch(/You are in a Pipeline/i);
    expect(wire).toMatch(/You are in a Phase/i);
    expect(wire).toContain('SETUP_SPECIFIC');
    expect(wire).toContain(PRIMITIVE_EXECUTION_SYSTEM_PROMPT.get('identity') as string);
  });
});
