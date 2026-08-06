/**
 * TEMPLATED PROMPT PART - DYNAMIC SEMANTIC UNITS
 * 
 * TemplatedPromptParts are PromptParts with variable placeholders
 * that get resolved at composition time.
 */

import type { PromptPart } from './PromptPart';
import { createPromptPart } from './PromptPart';

/**
 * A prompt part with template variables
 */
export interface TemplatedPromptPart<TVariables = Record<string, any>> {
  /** The template string with {{variable}} placeholders */
  template: string;
  
  /** Required variables for this template */
  variables: (keyof TVariables)[];
  
  /** Optional default values */
  defaults?: Partial<TVariables>;
  
  /** Validation for variables */
  validate?: (vars: TVariables) => boolean;
}

/**
 * Create a templated prompt part
 */
export function createTemplatedPromptPart<T extends Record<string, any> = Record<string, any>>(
  template: string,
  variables?: (keyof T)[],
  defaults?: Partial<T>
): TemplatedPromptPart<T> {
  // Extract variables from template if not provided
  const extractedVars = variables || extractVariables(template) as (keyof T)[];
  
  return {
    template,
    variables: extractedVars,
    defaults
  };
}

/**
 * Resolve a templated prompt part with actual values
 */
export function resolveTemplate<T extends Record<string, any>>(
  templated: TemplatedPromptPart<T>,
  values: T
): PromptPart {
  // Merge with defaults
  const finalValues = { ...templated.defaults, ...values } as T;
  
  // Validate if validator provided
  if (templated.validate && !templated.validate(finalValues)) {
    throw new Error('Template validation failed');
  }
  
  // Check all required variables are provided
  for (const variable of templated.variables) {
    if (!(variable in (finalValues as object))) {
      throw new Error(`Missing required template variable: ${String(variable)}`);
    }
  }
  
  // Replace variables
  let result = templated.template;
  for (const [key, value] of Object.entries(finalValues as any)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  
  return createPromptPart(result);
}

/**
 * Extract variable names from a template string
 */
function extractVariables(template: string): string[] {
  const regex = /{{(\w+)}}/g;
  const variables = new Set<string>();
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

/**
 * Common templated parts for reuse
 */
export const Templates = {
  agent: createTemplatedPromptPart<{name: string; role: string}>(
    'You are {{name}}, an AI agent specialized in {{role}}.',
    ['name', 'role']
  ),
  
  phase: createTemplatedPromptPart<{phase: string; objective: string}>(
    'You are in the {{phase}} phase. Your objective: {{objective}}',
    ['phase', 'objective']
  ),
  
  step: createTemplatedPromptPart<{step: string; description: string}>(
    'Executing {{step}} step: {{description}}',
    ['step', 'description']
  ),
  
  tool: createTemplatedPromptPart<{toolName: string; purpose: string}>(
    'Using {{toolName}} to {{purpose}}',
    ['toolName', 'purpose']
  ),
  
  error: createTemplatedPromptPart<{error: string; suggestion: string}>(
    'Error: {{error}}\nSuggestion: {{suggestion}}',
    ['error', 'suggestion']
  ),
  
  success: createTemplatedPromptPart<{action: string; result: string}>(
    'Successfully {{action}}: {{result}}',
    ['action', 'result']
  )
};
