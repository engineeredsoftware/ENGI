import { TSESLint } from '@typescript-eslint/utils';
import { noWriteToolsOutsideImplementation } from '../src/noWriteToolsOutsideImplementation';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

const ASSET_PACK_IMPLEMENTATION_AGENT =
  'packages/pipelines/asset-pack/src/agents/implementation/asset-pack-synthesize-artifacts-agent.ts';

ruleTester.run('no-write-tools-outside-implementation', noWriteToolsOutsideImplementation, {
  valid: [
    {
      filename: ASSET_PACK_IMPLEMENTATION_AGENT,
      code: "import { textEditorTool } from '@bitcode/generic-tools-files-maintaining';",
    },
    {
      filename: 'packages/pipelines/asset-pack/src/agents/discovery/gather-context-agent.ts',
      code: "import { definitionTool } from '@bitcode/generic-tools-lsp-query';",
    },
  ],
  invalid: [
    {
      filename: 'packages/other-agent/foo.ts',
      code: "import { textEditorTool, renameSymbolTool } from '@bitcode/generic-tools-files-maintaining';",
      errors: [
        {
          messageId: 'forbidden',
          data: { names: 'textEditorTool, renameSymbolTool' },
        },
      ],
    },
  ],
});
