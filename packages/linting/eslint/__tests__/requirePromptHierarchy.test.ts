import { TSESLint } from '@typescript-eslint/utils';
import { requirePromptHierarchy } from '../src/requirePromptHierarchy';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('require-prompt-hierarchy', requirePromptHierarchy, {
  valid: [
    {
      code: `
        factoryAgentWithPTRR({
          name: 'ok',
          outputSchema: someSchema,
          prompt: agentPrompt,
          stepPrompts: {
            plan: () => stepPrompts.plan,
            try: () => stepPrompts.try,
            refine: () => stepPrompts.refine,
            retry: () => stepPrompts.retry,
          }
        });
      `,
    },
    {
      code: `
        factoryAgentWithPTRR({
          name: 'compatibility-shape',
          outputSchema: someSchema,
          prompts: {
            system: agentPrompt,
            plan: () => stepPrompts.plan,
            try: () => stepPrompts.try,
            refine: () => stepPrompts.refine,
            retry: () => stepPrompts.retry,
          }
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        factoryAgentWithPTRR({
          name: 'missing',
          outputSchema: someSchema
        });
      `,
      errors: [
        { messageId: 'missingPrompt' },
        { messageId: 'missingStepPrompts' },
      ],
    },
    {
      code: `
        factoryAgentWithPTRR({
          name: 'partial',
          outputSchema: someSchema,
          prompt: agentPrompt,
          stepPrompts: {
            plan: () => stepPrompts.plan,
            try: () => stepPrompts.try,
          }
        });
      `,
      errors: [
        { messageId: 'missingStepPrompt', data: { step: 'refine' } },
        { messageId: 'missingStepPrompt', data: { step: 'retry' } },
      ],
    },
    {
      code: `
        factoryAgentWithPTRR({
          name: 'partial-compatibility-shape',
          outputSchema: someSchema,
          prompts: {
            system: agentPrompt,
            plan: () => stepPrompts.plan,
            refine: () => stepPrompts.refine,
            retry: () => stepPrompts.retry,
          }
        });
      `,
      errors: [
        { messageId: 'missingStepPrompt', data: { step: 'try' } },
      ],
    },
    {
      code: `
        async function x(execution:any){ execution.prompt = something }
      `,
      errors: [{ messageId: 'manualExecutionPrompt' }],
    },
  ],
});
