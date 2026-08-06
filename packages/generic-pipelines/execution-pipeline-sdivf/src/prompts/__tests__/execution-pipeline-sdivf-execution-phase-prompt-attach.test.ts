import { Execution } from '@bitcode/execution-generics';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import {
  buildExecutionHierarchySystemPrompt,
  PRIMITIVE_EXECUTION_SYSTEM_PROMPT,
} from '@bitcode/execution-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { attachExecutionPipelinePromptHierarchy } from '@bitcode/pipelines-generics/prompts/execution-prompt-attach-hierarchy';
import { attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy } from '../execution-pipeline-sdivf-execution-phase-prompt-attach';
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

describe('SDIVF phase prompt attach (no Execution re-emit)', () => {
  it('attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy does not re-emit Execution', () => {
    const exec: any = new Execution('phase:setup');
    exec.prompt = blankPrompt();
    const specific = new Prompt();
    specific.set('objective', createPromptPart('READ_SETUP_OBJECTIVE'));
    attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy(exec, 'setup', { specific });
    const wire = buildExecutionHierarchySystemPrompt(exec);
    expect(wire).toMatch(/You are in a Phase/i);
    expect(wire).toContain('READ_SETUP_OBJECTIVE');
    expect(wire).not.toMatch(/You are in an Execution/i);
  });

  it('pipeline + phase parent chain has Execution only on pipeline block', () => {
    const pipeline = pipelineLike('pipeline:asset_pack');
    attachExecutionPipelinePromptHierarchy(pipeline, {
      base: new Prompt().set('pattern', createPromptPart('SDIVF_BASE')),
    });
    const phase: any = new Execution('phase:setup', pipeline);
    phase.prompt = blankPrompt();
    attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy(phase, 'setup', {
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
