/**
 * Docs content module: api reference chatgpt app.
 */
import type { DocsInterfaceApiSection } from '../bitcode-docs-types';

export const chatGptAppApiReference = [
  {
    id: 'chatgpt-app-tools',
    title: 'ChatGPT App MCP tools',
    summary:
      'These are the canonical tools exported by packages/chatgptapp. Read tools gather evidence; write tools require confirmed: true and return write-admission metadata.',
    packagePath: 'apps/chatgpt/src/tools.ts',
    features: [
      {
        name: 'answer_codebase_query',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Ask a targeted question about the current repository or find existing implementation points.',
        howToUse:
          'Call with a regex-friendly query and optional cwd/maxResults. Use the returned file lines to decide whether to extend existing behavior or introduce new behavior.',
        inputs: [
          'query: required search pattern.',
          'cwd: optional working directory scope.',
          'maxResults: optional 1-500 cap, default 100.',
          'ignoreCase: optional boolean, default false.',
        ],
        outputs: [
          'answer: plain-language summary plus file:line hits.',
          'metadata.matches: structured match objects.',
          'metadata.matchCount and guidance: count and next-step framing.',
        ],
        verifyInProduct: 'Use the resulting files as source context before a product or connected-interface write.',
      },
      {
        name: 'answer_codeweb_query',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Research external technical references, examples, or documentation for a product or implementation decision.',
        howToUse:
          'Call with a focused query. Keep the result as external reference evidence, not route state, until it is attached to a real Bitcode action.',
        inputs: [
          'query: required web research query.',
          'numResults: optional 1-20 cap, default 8.',
          'useAutoprompt: optional provider refinement toggle, default true.',
        ],
        outputs: [
          'answer: numbered reading list or no-source guidance.',
          'metadata.provider: exa.',
          'metadata.results: normalized title, url, and summary records.',
        ],
      },
      {
        name: 'depict_design_asset',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Turn a screenshot, diagram, or wireframe into text that later tools can reference.',
        howToUse:
          'Pass base64 or text asset data with an optional focus. Use the depiction as context for design_code or code_design.',
        inputs: [
          'assetData: required base64 or UTF-8 asset representation.',
          'focus: optional analysis emphasis.',
          'notes: optional author hints.',
        ],
        outputs: [
          'depiction: textual description of the asset.',
          'metadata.focus: requested emphasis.',
          'metadata.bytes: decoded/estimated asset size.',
        ],
      },
      {
        name: 'design_code',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Capture conversational product intent into .ai/PRODUCT.md before planning implementation.',
        howToUse:
          'Pass raw ideas. Optionally include current PRODUCT.md or request digest regeneration before appending proposed updates.',
        inputs: [
          'ideas: required raw ideas or requirements.',
          'currentProductMd: optional current .ai/PRODUCT.md snapshot.',
          'regenerateFromDigest: optional boolean to rebuild the baseline from digest.',
        ],
        outputs: [
          'update: proposed update block.',
          'latest_design: full latest PRODUCT.md content.',
          'metadata.evidenceDocument, guidance, digestUsed, and prepared context stats.',
        ],
        verifyInProduct: 'Treat this as design context until a later write creates /packs-readable activity.',
      },
      {
        name: 'code_design',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Translate accepted design intent into tasks and patch scaffolds before code changes.',
        howToUse:
          'Pass the design update and optional target files. Review the generated implementation actions before executing any write.',
        inputs: [
          'update: required implementation update or summary.',
          'latest_design: optional PRODUCT.md content.',
          'files: optional array of { path, intent } targets.',
        ],
        outputs: [
          'update: numbered implementation actions plus diff scaffold.',
          'latest_design: design basis used for the plan.',
          'metadata.taskCount, fileCount, guidance, and prepared context stats.',
        ],
      },
      {
        name: 'read_code_changes_from_vcs',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Summarize recent GitHub activity before deciding what changed or what to build next.',
        howToUse:
          'Pass a GitHub token, owner, repo, and optional branch/limit. Use the result as VCS read evidence.',
        inputs: [
          'accessToken: required GitHub repo-scoped token.',
          'owner and repo: required repository coordinates.',
          'branch: optional branch ref.',
          'limit: optional 1-50 commit cap, default 10.',
        ],
        outputs: [
          'changes: human-readable commit summary.',
          'metadata.branch and commitCount.',
          'metadata.urlSamples: source URLs for follow-up.',
        ],
      },
      {
        name: 'write_code_changes_to_vcs',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Create a GitHub repository or write file contents after explicit user confirmation.',
        howToUse:
          'Set confirmed: true. For createRepository, pass name/description/private. For createOrUpdateFile, pass owner/repo/path/content/message/branch.',
        inputs: [
          'operation: createRepository or createOrUpdateFile.',
          'confirmed: required true.',
          'accessToken: required GitHub repo-scoped token.',
          'name, description, private: repository creation inputs.',
          'owner, repo, path, content, message, branch: file-write inputs.',
        ],
        outputs: [
          'result: GitHub repository or commit response.',
          'metadata.operation and optional sha.',
          'metadata.writeAdmission: interfaceSurface, permission basis, operation, and targetAnchor.',
        ],
        verifyInProduct: 'Reread the connected-interface result as a delivery mechanism, not independent product truth.',
        failureModes: [
          'Throws if confirmed is not true.',
          'Throws if createOrUpdateFile lacks owner, repo, or path.',
        ],
        requiresConfirmation: true,
      },
      {
        name: 'improve_developing_behavior',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Record collaboration rules or development behavior preferences into .ai/AGENTS.md.',
        howToUse:
          'Pass behaviorImprovement and optional current AGENTS.md. Use regenerateFromDigest when the baseline should be rebuilt first.',
        inputs: [
          'behaviorImprovement: optional behavior note.',
          'currentAgentsMd: optional current AGENTS.md snapshot.',
          'regenerateFromDigest: optional boolean.',
        ],
        outputs: [
          'behaviorDelta: appended behavior block.',
          'latestBehaviorDocument and latestBehavior: latest AGENTS.md.',
          'metadata.evidenceDocument, guidance, digestUsed, and prepared context stats.',
        ],
      },
      {
        name: 'use_vercel_read_external_mcp',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Read Vercel teams, projects, deployments, build logs, events, or docs from ChatGPT.',
        howToUse:
          'Set request to the Vercel read operation and pass provider-specific arguments in payload.',
        inputs: [
          'request: list_teams, list_projects, get_project, list_deployments, get_deployment, get_deployment_events, get_deployment_build_logs, or search_documentation.',
          'payload: optional Vercel arguments such as teamId, projectId, idOrUrl, limit, topic, or tokens.',
        ],
        outputs: [
          'answer: Vercel tool response.',
          'metadata.provider: vercel.',
          'metadata.request, evidenceDocument, and guidance.',
        ],
      },
      {
        name: 'use_vercel_write_external_mcp',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Request Vercel delivery actions after explicit user confirmation.',
        howToUse:
          'Set confirmed: true and request deploy_to_vercel, buy_domain, or check_domain_availability with provider arguments in payload.',
        inputs: [
          'request: deploy_to_vercel, buy_domain, or check_domain_availability.',
          'confirmed: required true.',
          'payload: projectId/teamId/message, domain names/contact, or availability names.',
        ],
        outputs: [
          'result: Vercel write or availability result.',
          'metadata.provider, request, guidance, and evidenceDocument.',
          'metadata.writeAdmission with connectedInterface vercel and targetAnchor.',
        ],
        failureModes: ['Throws if confirmed is not true.'],
        requiresConfirmation: true,
      },
      {
        name: 'use_aws_read_external_mcp',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Read AWS runtime state from ChatGPT for health checks or configuration confirmation.',
        howToUse:
          'Set request to the AWS read action and pass the raw AWS-style payload through to the underlying tool.',
        inputs: [
          'request: lambda.invoke, s3.getObject, dynamo.getItem, or cloudwatch.log.',
          'payload: raw function, bucket/key, table/key, or log query arguments.',
        ],
        outputs: [
          'answer: AWS read result.',
          'metadata.provider: aws.',
          'metadata.request, evidenceDocument, and guidance.',
        ],
      },
      {
        name: 'use_aws_write_external_mcp',
        method: 'tools/call',
        packagePath: 'apps/chatgpt/src/tools.ts',
        useWhen: 'Write scoped AWS delivery/configuration outputs after explicit user confirmation.',
        howToUse:
          'Set confirmed: true and request s3.putObject or dynamo.putItem with the underlying AWS payload.',
        inputs: [
          'request: s3.putObject or dynamo.putItem.',
          'confirmed: required true.',
          'payload: bucket/key/body or table/item style arguments.',
        ],
        outputs: [
          'result: AWS write result.',
          'metadata.provider, request, guidance, and evidenceDocument.',
          'metadata.writeAdmission with connectedInterface aws and targetAnchor.',
        ],
        failureModes: ['Throws if confirmed is not true.'],
        requiresConfirmation: true,
      },
    ],
  },
] as const satisfies readonly DocsInterfaceApiSection[];
