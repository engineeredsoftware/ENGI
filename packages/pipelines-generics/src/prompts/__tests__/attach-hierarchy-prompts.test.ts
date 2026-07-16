import { Execution } from '@bitcode/execution-generics';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
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

/** Minimal PipelineExecution-like host for resolvePipelinePromptHost. */
function pipelineLike(id: string, parent?: Execution): any {
  const exec: any = new Execution(id, parent);
  exec.prompt = blankPrompt();
  exec.agents = { getAgent: () => null };
  return exec;
}

describe('prompt hierarchy attach', () => {
  it('applies namespaced parts onto ExecutionPrompt', () => {
    const target = blankPrompt();
    const source = new Prompt();
    source.set('identity', createPromptPart('PRIMITIVE_PIPELINE'));
    applyPromptRegistryToExecutionPrompt(target, source, { namespace: 'pipeline:primitive' });
    const formatted = target.format();
    expect(formatted).toContain('PRIMITIVE_PIPELINE');
  });

  it('attachPipelinePromptHierarchy includes primitive + base + specific', () => {
    const exec = pipelineLike('pipeline:test');
    const base = new Prompt();
    base.set('pattern', createPromptPart('SDIVF_BASE'));
    const specific = new Prompt();
    specific.set('lens', createPromptPart('READ_LENS'));
    attachPipelinePromptHierarchy(exec, { base, specific });
    const text = exec.prompt.format();
    expect(text).toMatch(/Bitcode Pipeline/i);
    expect(text).toContain('SDIVF_BASE');
    expect(text).toContain('READ_LENS');
  });

  it('attachPipelinePromptHierarchy lands on root, not sequential child', () => {
    const root = pipelineLike('pipeline:asset_pack');
    const seq0 = root.child('seq-0');
    const base = new Prompt();
    base.set('pattern', createPromptPart('SDIVF_ON_ROOT'));
    // Mimic factorySDIVFPipelineFromExecutors: attach while running on seq-0
    attachPipelinePromptHierarchy(seq0, { base });
    expect(resolvePipelinePromptHost(seq0)).toBe(root);
    const rootText = root.prompt.format();
    expect(rootText).toMatch(/Bitcode Pipeline/i);
    expect(rootText).toContain('SDIVF_ON_ROOT');
    // seq-0 must not be the only carrier (sibling seq-2 would miss it)
    const seqText =
      seq0.prompt instanceof ExecutionPrompt ? String(seq0.prompt.format() || '') : '';
    expect(seqText).not.toContain('SDIVF_ON_ROOT');
  });

  it('attachPhasePromptHierarchy includes setup objective', () => {
    const exec: any = new Execution('phase:setup');
    exec.prompt = blankPrompt();
    const specific = new Prompt();
    specific.set('objective', createPromptPart('READ_SETUP_OBJECTIVE'));
    attachPhasePromptHierarchy(exec, 'setup', { specific });
    const text = exec.prompt.format();
    expect(text).toMatch(/phase "setup"/i);
    expect(text).toContain('READ_SETUP_OBJECTIVE');
  });
});
