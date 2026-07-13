import { TSESTree as T, ESLintUtils } from '@typescript-eslint/utils';

/*
 * -------------------------------------------------------------------------------------------------
 * require-prompt-hierarchy
 * -------------------------------------------------------------------------------------------------
 * Enforces Bitcode Registry-backed prompt hierarchy for agents:
 * - factoryAgentWithPTRR configs must include an AgentPrompt registry carrier
 * - step prompt registries must cover plan/try/refine/retry so generic and specific PromptParts
 *   compose into every agent phase
 * - Forbid manual assignment to `execution.prompt = ...`
 */

const REQUIRED_STEP_PROMPTS = ['plan', 'try', 'refine', 'retry'] as const;

export const requirePromptHierarchy = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    messages: {
      missingPrompt:
        'factoryAgentWithPTRR Bitcode prompt composition must include `prompt: AgentPrompt` or `prompts.system` as the Registry-backed prompt carrier.',
      missingStepPrompts:
        'factoryAgentWithPTRR Bitcode prompt composition must include `stepPrompts` or `prompts` with plan/try/refine/retry Prompt registries.',
      missingStepPrompt:
        'factoryAgentWithPTRR Bitcode prompt composition is missing `{{step}}` step Prompt registry.',
      manualExecutionPrompt:
        'Do not assign to execution.prompt directly; pass Registry-backed prompts through factoryAgentWithPTRR.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(ctx) {
    return {
      AssignmentExpression(node: T.AssignmentExpression) {
        if (
          node.left.type === 'MemberExpression' &&
          !node.left.computed &&
          node.left.object.type === 'Identifier' &&
          node.left.object.name === 'execution' &&
          node.left.property.type === 'Identifier' &&
          node.left.property.name === 'prompt'
        ) {
          ctx.report({ node, messageId: 'manualExecutionPrompt' });
        }
      },

      CallExpression(node: T.CallExpression) {
        const callee = node.callee;
        if (callee.type !== 'Identifier' || callee.name !== 'factoryAgentWithPTRR') return;
        if (!node.arguments.length) return;
        const arg = node.arguments[0];
        if (arg.type !== 'ObjectExpression') return;

        let hasPrompt = false;
        let hasStepPrompts = false;
        const configuredStepPrompts = new Set<string>();
        let stepPromptNode: T.Node | undefined;

        const recordStepPrompt = (name: string) => {
          if (REQUIRED_STEP_PROMPTS.includes(name as (typeof REQUIRED_STEP_PROMPTS)[number])) {
            configuredStepPrompts.add(name);
          }
        };
        const recordCompleteStepPromptRegistry = () => {
          for (const step of REQUIRED_STEP_PROMPTS) recordStepPrompt(step);
        };

        for (const prop of arg.properties) {
          if (prop.type !== 'Property' || prop.key.type !== 'Identifier') continue;
          const key = prop.key.name;
          if (key === 'prompt') hasPrompt = true;
          if (key === 'prompts' && prop.value.type === 'ObjectExpression') {
            stepPromptNode = prop.value;
            for (const lp of prop.value.properties) {
              if (lp.type === 'SpreadElement') {
                recordCompleteStepPromptRegistry();
                continue;
              }
              if (lp.type !== 'Property' || lp.key.type !== 'Identifier') continue;
              const lk = lp.key.name;
              if (lk === 'system') hasPrompt = true;
              recordStepPrompt(lk);
            }
            hasStepPrompts = true;
          }
          if (key === 'stepPrompts') {
            hasStepPrompts = true;
            stepPromptNode = prop.value;
            if (prop.value.type === 'ObjectExpression') {
              for (const sp of prop.value.properties) {
                if (sp.type === 'SpreadElement') {
                  recordCompleteStepPromptRegistry();
                  continue;
                }
                if (sp.type !== 'Property' || sp.key.type !== 'Identifier') continue;
                recordStepPrompt(sp.key.name);
              }
            } else {
              recordCompleteStepPromptRegistry();
            }
          }
        }

        if (!hasPrompt) {
          ctx.report({ node: arg, messageId: 'missingPrompt' });
        }
        if (!hasStepPrompts) {
          ctx.report({ node: arg, messageId: 'missingStepPrompts' });
        } else {
          for (const step of REQUIRED_STEP_PROMPTS) {
            if (!configuredStepPrompts.has(step)) {
              ctx.report({
                node: stepPromptNode ?? arg,
                messageId: 'missingStepPrompt',
                data: { step },
              });
            }
          }
        }
      },
    };
  },
});
