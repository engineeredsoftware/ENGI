import { TSESTree as T, ESLintUtils } from '@typescript-eslint/utils';

/*
 * -------------------------------------------------------------------------------------------------
 * no-write-tools-outside-implementation
 * -------------------------------------------------------------------------------------------------
 * Prevents files outside implementation-phase agents from importing tools that have
 * side-effects on the codebase or external systems ("write" tools).
 *
 * Rationale: V26 Bitcode execution restricts mutating capabilities to implementation-phase
 * agents. Discovery and planning agents must stay read-only to guarantee safety and determinism.
 *
 * The rule reports an ESLint error whenever one of the WRITE_TOOLS identifiers is imported from a
 * file whose absolute path does NOT match the ALLOWED_FILES regex.
 */

const WRITE_TOOLS = new Set<string>([
  'textEditorTool',
  'deleteFileTool',
  'renameFileTool',
  'directoryTool',
  'renameSymbolTool',
  'cloneRepositoryTool',
  'createFileContentTool',
  'updateFileContentTool',
  'deleteFileContentTool',
  'createPullRequestTool',
  'createIssueTool',
  'leaveCommentOnIssueTool',
  'createReferenceTool',
  'awsS3PutObjectTool',
  'awsDynamoPutItemTool',
  'awsLambdaInvokeTool',
]);

const ALLOWED_PATH = /[\\/]agents[\\/].*implementation.*agent/i;

export const noWriteToolsOutsideImplementation = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    messages: {
      forbidden:
        'Importing write tool(s) {{names}} outside implementation-phase agents is prohibited.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(ctx) {
    const filename = ctx.getFilename();

    if (/node_modules/.test(filename)) return {};
    if (ALLOWED_PATH.test(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node: T.ImportDeclaration) {
        const badImports: string[] = [];

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') continue;

          const importedName = (specifier.imported as T.Identifier).name;
          if (WRITE_TOOLS.has(importedName)) {
            badImports.push(importedName);
          }
        }

        if (badImports.length) {
          ctx.report({
            node,
            messageId: 'forbidden',
            data: { names: badImports.join(', ') },
          });
        }
      },
    };
  },
});
