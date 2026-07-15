"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBitcodeTools = getBitcodeTools;
require("./env");
const node_buffer_1 = require("node:buffer");
const node_path_1 = __importDefault(require("node:path"));
const context_1 = require("@bitcode/context-generics");
const rest_1 = require("@octokit/rest");
const generic_tools_mcps_aws_1 = require("@bitcode/generic-tools-mcps-aws");
const generic_tools_simple_system_text_search_1 = require("@bitcode/generic-tools-simple-system-text-search");
const generic_tools_web_search_1 = require("@bitcode/generic-tools-web-search");
const run_1 = require("@bitcode/digest/run");
const generic_tools_mcps_vercel_1 = require("@bitcode/generic-tools-mcps-vercel");
const VercelMCPDocCodeToolPrompt_1 = require("@bitcode/generic-tools-mcps-vercel/src/prompts/VercelMCPDocCodeToolPrompt");
const github_1 = require("@bitcode/generic-vcs-github");
const vcs_1 = require("@bitcode/vcs-generics");
const zod_1 = require("zod");
const SimpleSystemTextSearchDocCodeToolPrompt_1 = require("@bitcode/generic-tools-simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt");
const WebSearchDocCodeToolPrompt_1 = require("@bitcode/generic-tools-web-search/src/prompts/WebSearchDocCodeToolPrompt");
const AWSMCPDocCodeToolPrompt_1 = require("@bitcode/generic-tools-mcps-aws/src/prompts/AWSMCPDocCodeToolPrompt");
const chatgpt_tool_doc_prompts_1 = require("./prompts/chatgpt-tool-doc-prompts");
function assertConfirmedConnectedInterfaceWrite(confirmed) {
    if (confirmed !== true) {
        throw new Error('Bitcode ChatGPT App write admission requires confirmed: true before connected-interface writes can execute.');
    }
}
function buildChatGptAppWriteAdmission(input) {
    return {
        admitted: true,
        interfaceSurface: 'chatgpt_app',
        permission: 'explicit_user_confirmation',
        ingressBasis: 'chatgpt_conversation_confirmed_payload',
        protocolScope: 'source_to_shares',
        exchangeStateRole: 'connected_interface_delivery_mechanism',
        outputMeaning: 'asset_pack_delivery_mechanism',
        connectedInterface: input.connectedInterface,
        operation: input.operation,
        targetAnchor: input.targetAnchor
    };
}
const PRODUCT_MD_TEMPLATE = `###### What is this document?

\`.ai/PRODUCT.md\` *Design Document* is the **"design of source code"** and is the canonical, complete, and precise software product reference for this repository.

# PRODUCT'S PURPOSE:

[]

# PRODUCT'S FEATURES:

- []

# SOURCE FILES:

- []
`;
const AGENTS_MD_TEMPLATE = `###### What is this document?

\`.ai/AGENTS.md\` *Design Document* is the **design of the agent(s)** which includes instructions for it/them to follow and high-quality (“seeking”) questions.

# AGENTS' INSTRUCTIONS:

- []

# AGENTS' SEEKING QUESTIONS:

- []
`;
const DEFAULT_CONTEXT_TOKEN_LIMIT = 6000;
const SIMPLE_SYSTEM_TEXT_SEARCH_DOC = SimpleSystemTextSearchDocCodeToolPrompt_1.SIMPLE_SYSTEM_TEXT_SEARCH_DOC_CODE_TOOL_PROMPT.format();
const WEB_SEARCH_DOC = WebSearchDocCodeToolPrompt_1.WEB_SEARCH_DOC_CODE_TOOL_PROMPT.format();
const VERCEL_MCP_DOC = VercelMCPDocCodeToolPrompt_1.VERCEL_MCP_DOC_CODE_TOOL_PROMPT.format();
const AWS_MCP_DOC = AWSMCPDocCodeToolPrompt_1.AWS_MCP_DOC_CODE_TOOL_PROMPT.format();
const DEPICT_DESIGN_ASSET_DOC = chatgpt_tool_doc_prompts_1.DEPICT_DESIGN_ASSET_DOC_CODE_TOOL_PROMPT.format();
const DESIGN_CODE_DOC = chatgpt_tool_doc_prompts_1.DESIGN_CODE_DOC_CODE_TOOL_PROMPT.format();
const CODE_DESIGN_DOC = chatgpt_tool_doc_prompts_1.CODE_DESIGN_DOC_CODE_TOOL_PROMPT.format();
const READ_CODE_CHANGES_VCS_DOC = chatgpt_tool_doc_prompts_1.READ_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT.format();
const WRITE_CODE_CHANGES_VCS_DOC = chatgpt_tool_doc_prompts_1.WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT.format();
const IMPROVE_DEVELOPING_BEHAVIOR_DOC = chatgpt_tool_doc_prompts_1.IMPROVE_DEVELOPING_BEHAVIOR_DOC_CODE_TOOL_PROMPT.format();
function buildPreparedContextMetadata(input) {
    const files = [
        input.productDocument ? '.ai/PRODUCT.md' : null,
        input.agentDocument ? '.ai/AGENTS.md' : null
    ].filter(Boolean);
    if (files.length === 0)
        return undefined;
    const concise = (0, context_1.prepareConciseContext)({
        files,
        context: {
            productDocument: input.productDocument,
            agentDocument: input.agentDocument,
            attachments: input.attachments ?? [],
            insights: input.insights ?? []
        }
    }, { tokenLimit: input.tokenLimit ?? DEFAULT_CONTEXT_TOKEN_LIMIT });
    return {
        preparedContexts: concise.preparedContexts,
        preparedContextStats: {
            chunked: concise.chunked,
            chunkCount: concise.chunkCount,
            contextSize: concise.contextSize
        }
    };
}
// ---------------------------------------------------------------------------
// Tool validators + executors
// ---------------------------------------------------------------------------
const CODEBASE_QUERY_VALIDATOR = zod_1.z.object({
    query: zod_1.z.string().min(1, 'query must be provided').describe('Regex-friendly search pattern to run against the repository'),
    cwd: zod_1.z.string().min(1).optional().describe('Optional working directory to scope the search'),
    maxResults: zod_1.z.number().int().min(1).max(500).optional().describe('Maximum matches to return (default 100)'),
    ignoreCase: zod_1.z.boolean().optional().describe('Perform a case insensitive search (default false)')
}).strict();
async function executeAnswerCodebaseQuery(args) {
    const matches = await generic_tools_simple_system_text_search_1.simpleSystemTextSearch.execute({
        pattern: args.query,
        cwd: args.cwd ?? process.cwd(),
        maxResults: args.maxResults ?? 100,
        ignoreCase: args.ignoreCase ?? false
    });
    const lines = matches.map((match) => `• ${match.file}:${match.line + 1} — ${match.text}`);
    const guidance = matches.length > 0
        ? `I found ${matches.length} ${matches.length === 1 ? 'spot' : 'spots'} touching “${args.query}”. Let’s review them and decide whether we’re extending or replacing existing behaviour.`
        : `Nothing references “${args.query}” yet. Perfect—we can introduce it confidently and note the addition in PRODUCT.md.`;
    const answer = lines.length > 0 ? [guidance, lines.join('\n')].join('\n\n') : guidance;
    return {
        answer,
        metadata: {
            matches,
            matchCount: matches.length,
            guidance
        }
    };
}
const CODEBASE_QUERY_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        query: {
            type: 'string',
            description: 'Regex-friendly search pattern to run against the repository'
        },
        cwd: {
            type: 'string',
            description: 'Optional working directory to scope the search'
        },
        maxResults: {
            type: 'integer',
            minimum: 1,
            maximum: 500,
            description: 'Maximum matches to return (default 100)'
        },
        ignoreCase: {
            type: 'boolean',
            description: 'Perform a case insensitive search (default false)'
        }
    },
    required: ['query']
};
const WEB_SEARCH_VALIDATOR = zod_1.z.object({
    query: zod_1.z.string().min(1, 'query must be provided').describe('Web search query to send to Exa'),
    numResults: zod_1.z.number().int().min(1).max(20).optional().describe('Maximum number of documents to fetch (default 8)'),
    useAutoprompt: zod_1.z.boolean().optional().describe('Allow provider autoprompting to refine the query (default true)')
}).strict();
async function executeAnswerCodewebQuery(args) {
    const response = await generic_tools_web_search_1.search.execute(args.query, {
        numResults: args.numResults ?? 8,
        useAutoprompt: args.useAutoprompt ?? true
    });
    const results = Array.isArray(response?.results)
        ? response.results
        : Array.isArray(response?.documents)
            ? response.documents
            : [];
    const normalized = results.slice(0, args.numResults ?? 8).map((item) => ({
        title: item.title ?? item.name ?? 'Untitled result',
        url: item.url ?? item.link ?? '',
        summary: item.snippet ?? item.summary ?? undefined
    }));
    const preface = normalized.length > 0
        ? `Here’s a focused reading list (top ${normalized.length}) to reinforce our plan for “${args.query}”.`
        : `No trustworthy sources surfaced for “${args.query}”. Let’s lean on domain expertise and circle back once we have new keywords.`;
    const listing = normalized
        .map((item, index) => `${index + 1}. ${item.title} — ${item.url}`)
        .join('\n');
    const answer = listing ? `${preface}\n\n${listing}` : preface;
    return {
        answer: answer || 'No external references discovered.',
        metadata: {
            provider: 'exa',
            total: normalized.length,
            results: normalized,
            guidance: preface
        }
    };
}
const WEB_SEARCH_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        query: {
            type: 'string',
            description: 'Web search query to send to Exa'
        },
        numResults: {
            type: 'integer',
            minimum: 1,
            maximum: 20,
            description: 'Maximum number of documents to fetch (default 8)'
        },
        useAutoprompt: {
            type: 'boolean',
            description: 'Allow provider autoprompting to refine the query (default true)'
        }
    },
    required: ['query']
};
const DEPICT_ASSET_VALIDATOR = zod_1.z.object({
    assetData: zod_1.z.string().min(1, 'assetData must be provided').describe('Base64 or UTF-8 encoded representation of the asset'),
    focus: zod_1.z.string().optional().describe('Optional emphasis for the depiction'),
    notes: zod_1.z.string().optional().describe('Additional author hints')
}).strict();
async function executeDepictDesignAsset(args) {
    const payload = args.assetData.includes(';base64,')
        ? args.assetData.split(',').pop() ?? ''
        : args.assetData;
    let bytes = 0;
    try {
        bytes = node_buffer_1.Buffer.from(payload, 'base64').length;
        if (Number.isNaN(bytes) || !Number.isFinite(bytes)) {
            bytes = node_buffer_1.Buffer.byteLength(payload, 'utf8');
        }
    }
    catch {
        bytes = node_buffer_1.Buffer.byteLength(payload, 'utf8');
    }
    const depictionLines = [
        'Asset depiction generated for the Bitcode ChatGPT App.',
        args.focus ? `Primary focus: ${args.focus}.` : 'No specific focus provided.',
        args.notes ? `Notes from author: ${args.notes}.` : 'No author notes supplied.',
        'Further visual analysis can be layered on during a dedicated design review turn.'
    ];
    return {
        depiction: depictionLines.join(' '),
        metadata: {
            focus: args.focus,
            bytes
        }
    };
}
const DEPICT_ASSET_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        assetData: {
            type: 'string',
            description: 'Base64 or UTF-8 encoded representation of the asset'
        },
        focus: {
            type: 'string',
            description: 'Optional emphasis for the depiction'
        },
        notes: {
            type: 'string',
            description: 'Additional author hints'
        }
    },
    required: ['assetData']
};
const DESIGN_CODE_VALIDATOR = zod_1.z.object({
    ideas: zod_1.z.string().min(1, 'ideas must be provided').describe('Raw ideas or requirements to incorporate into PRODUCT.md'),
    currentProductMd: zod_1.z.string().optional().describe('Optional snapshot of the existing PRODUCT.md for contextual diffing'),
    regenerateFromDigest: zod_1.z.boolean().optional().describe('Regenerate the baseline PRODUCT.md from digest before applying ideas')
}).strict();
async function executeDesignCode(args) {
    const ideaLines = args.ideas
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    const sections = ideaLines.map((line, index) => `Section ${index + 1}`);
    const newBullets = ideaLines.map((line) => `- ${line}`);
    const update = ['### Proposed Updates', ...newBullets].join('\n');
    const baseGuidance = sections.length > 0
        ? `Documented ${sections.length} ${sections.length === 1 ? 'idea' : 'ideas'} so the rest of the conversation can reference them explicitly.`
        : 'Captured high-level intent. Encourage the user to add at least one actionable bullet.';
    let baseDocument = args.currentProductMd && args.currentProductMd.trim().length > 0
        ? args.currentProductMd.trim()
        : '';
    let digestUsed = false;
    let digestError;
    const shouldRegenerate = !baseDocument || args.regenerateFromDigest;
    if (shouldRegenerate) {
        try {
            const repoName = node_path_1.default.basename(process.cwd());
            const digestResult = await (0, run_1.generateDigest)({
                owner: 'local',
                repo: repoName,
                commit: 'local',
                correlationId: `product-md-${Date.now()}`,
                usePreClonedRepo: true,
                rootDir: process.cwd(),
                forceRegenerate: args.regenerateFromDigest ?? false
            });
            if (digestResult.productDocument) {
                baseDocument = digestResult.productDocument.trim();
                digestUsed = true;
            }
        }
        catch (error) {
            digestError = error instanceof Error ? error.message : String(error);
            console.warn('[design_code] digest refresh failed:', digestError);
        }
    }
    if (!baseDocument) {
        baseDocument = PRODUCT_MD_TEMPLATE.trim();
    }
    const PROPOSED_UPDATES_HEADER = '### Proposed Updates';
    const proposedSectionRegex = new RegExp(`${PROPOSED_UPDATES_HEADER}[\\s\\S]*?(?=\\n### |\\n# |$)`, 'g');
    const existingBullets = [];
    const cleanedDocument = baseDocument.replace(proposedSectionRegex, (section) => {
        const lines = section.split('\n').slice(1);
        lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ')) {
                existingBullets.push(trimmed);
            }
        });
        return '';
    }).trim();
    const bulletSet = new Set();
    const combinedBullets = [];
    existingBullets.forEach((bullet) => {
        if (!bulletSet.has(bullet)) {
            bulletSet.add(bullet);
            combinedBullets.push(bullet);
        }
    });
    newBullets.forEach((bullet) => {
        if (!bulletSet.has(bullet)) {
            bulletSet.add(bullet);
            combinedBullets.push(bullet);
        }
    });
    const updatesSection = combinedBullets.length > 0
        ? [PROPOSED_UPDATES_HEADER, ...combinedBullets].join('\n')
        : '';
    const latestDesign = [cleanedDocument, updatesSection].filter(Boolean).join('\n\n').trim();
    const guidance = digestUsed
        ? `${baseGuidance} Refreshed PRODUCT.md via digest before applying updates.`
        : digestError
            ? `${baseGuidance} Digest refresh unavailable (${digestError}); using provided PRODUCT.md context.`
            : baseGuidance;
    const contextMetadata = buildPreparedContextMetadata({
        productDocument: latestDesign,
        insights: ideaLines
    });
    return {
        update,
        latest_design: latestDesign,
        metadata: {
            sections,
            created: !args.currentProductMd,
            aiDocument: '.ai/PRODUCT.md',
            guidance,
            digestUsed,
            digestError,
            ...(contextMetadata ?? {})
        }
    };
}
const DESIGN_CODE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        ideas: {
            type: 'string',
            description: 'Raw ideas or requirements to incorporate into PRODUCT.md'
        },
        currentProductMd: {
            type: 'string',
            description: 'Optional snapshot of the existing PRODUCT.md for contextual diffing'
        },
        regenerateFromDigest: {
            type: 'boolean',
            description: 'Regenerate the baseline PRODUCT.md from digest before applying ideas'
        }
    },
    required: ['ideas']
};
const CODE_DESIGN_VALIDATOR = zod_1.z.object({
    update: zod_1.z.string().min(1, 'update must be provided').describe('Implementation update or summary driving code changes'),
    latest_design: zod_1.z.string().optional().describe('Latest PRODUCT.md content used as specification'),
    files: zod_1.z.array(zod_1.z.object({
        path: zod_1.z.string().min(1, 'path must be provided').describe('Target file path'),
        intent: zod_1.z.string().min(1, 'intent must be described').describe('Purpose of the change for the given file')
    })).optional().describe('Optional explicit file targets to draft patches for')
}).strict();
async function executeCodeDesign(args) {
    const tasks = args.update
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => `Task ${index + 1}: ${line}`);
    const files = args.files ?? [];
    const patchSections = files.length > 0
        ? files.map((file) => `diff --git a/${file.path} b/${file.path}
--- a/${file.path}
+++ b/${file.path}
@@
# Intent: ${file.intent}
# TODO: Replace this comment with the concrete diff generated from Bitcode's plan.
`).join('\n')
        : '# TODO: Identify concrete file edits required to satisfy the specification.';
    const update = ['### Implementation Actions', ...tasks, '', '```diff', patchSections.trimEnd(), '```']
        .filter(Boolean)
        .join('\n');
    const latestDesign = args.latest_design?.trim()?.length ? args.latest_design.trim() : PRODUCT_MD_TEMPLATE.trim();
    const guidance = files.length > 0
        ? `Review the ${files.length === 1 ? 'target file' : 'target files'} above with the user before executing code so they can confirm scope.`
        : 'No files selected yet—prompt the user to identify where these changes should live.';
    const contextMetadata = buildPreparedContextMetadata({
        productDocument: latestDesign,
        insights: tasks
    });
    return {
        update,
        latest_design: latestDesign,
        metadata: {
            taskCount: tasks.length,
            fileCount: files.length,
            aiDocument: '.ai/PRODUCT.md',
            guidance,
            ...(contextMetadata ?? {})
        }
    };
}
const CODE_DESIGN_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        update: {
            type: 'string',
            description: 'Implementation update or summary driving code changes'
        },
        latest_design: {
            type: 'string',
            description: 'Latest PRODUCT.md content used as specification'
        },
        files: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    path: {
                        type: 'string',
                        description: 'Target file path'
                    },
                    intent: {
                        type: 'string',
                        description: 'Purpose of the change for the given file'
                    }
                },
                required: ['path', 'intent']
            }
        }
    },
    required: ['update']
};
const READ_CODE_CHANGES_VALIDATOR = zod_1.z.object({
    accessToken: zod_1.z.string().min(1, 'accessToken must be provided').describe('GitHub access token with repo scope'),
    owner: zod_1.z.string().min(1, 'owner must be provided').describe('Repository owner (user or organisation)'),
    repo: zod_1.z.string().min(1, 'repo must be provided').describe('Repository name'),
    branch: zod_1.z.string().optional().describe('Optional branch ref (default default branch)'),
    limit: zod_1.z.number().int().min(1).max(50).optional().describe('Maximum commits to retrieve (default 10)')
}).strict();
async function executeReadCodeChanges(args) {
    const provider = new github_1.GitHubProvider((0, vcs_1.getVCSConfig)('github'));
    const auth = {
        accessToken: args.accessToken,
        tokenType: 'token',
        provider: 'github'
    };
    const commits = await provider.listCommits(auth, args.owner, args.repo, {
        branch: args.branch,
        perPage: args.limit ?? 10
    });
    const slice = commits.slice(0, args.limit ?? 10);
    const summary = slice.length > 0
        ? `Here are the last ${slice.length} commits on ${args.branch ?? 'the default branch'}. Use them to narrate recent motion before we add new work.`
        : `No commits found for ${args.repo}. If this is a new space, we’ll be creating the very first history together.`;
    const changeLines = slice
        .map((commit) => `• ${commit.sha.slice(0, 7)} — ${commit.message} (by ${commit.author?.name ?? 'Unknown'})`)
        .join('\n');
    const changes = changeLines ? `${summary}\n\n${changeLines}` : summary;
    return {
        changes,
        metadata: {
            branch: args.branch,
            commitCount: slice.length,
            urlSamples: slice.map((commit) => commit.url),
            guidance: summary
        }
    };
}
const READ_CODE_CHANGES_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        accessToken: {
            type: 'string',
            description: 'GitHub access token with repo scope'
        },
        owner: {
            type: 'string',
            description: 'Repository owner (user or organisation)'
        },
        repo: {
            type: 'string',
            description: 'Repository name'
        },
        branch: {
            type: 'string',
            description: 'Optional branch ref (default default branch)'
        },
        limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            description: 'Maximum commits to retrieve (default 10)'
        }
    },
    required: ['accessToken', 'owner', 'repo']
};
const WRITE_CODE_CHANGES_VALIDATOR = zod_1.z.object({
    operation: zod_1.z.enum(['createRepository', 'createOrUpdateFile']).describe('Write operation to perform'),
    confirmed: zod_1.z.literal(true).describe('Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'),
    accessToken: zod_1.z.string().min(1, 'accessToken must be provided').describe('GitHub access token with repo scope'),
    owner: zod_1.z.string().optional().describe('Owner for file operations (required for createOrUpdateFile)'),
    repo: zod_1.z.string().optional().describe('Repo for file operations (required for createOrUpdateFile)'),
    name: zod_1.z.string().optional().describe('Repository name for createRepository'),
    description: zod_1.z.string().optional().describe('Repository description'),
    private: zod_1.z.boolean().optional().describe('Whether repository should be private'),
    path: zod_1.z.string().optional().describe('File path to create or update'),
    content: zod_1.z.string().optional().describe('Raw UTF-8 file contents'),
    message: zod_1.z.string().optional().describe('Commit message for file change'),
    branch: zod_1.z.string().optional().describe('Branch to commit against (default default branch)')
}).strict();
async function executeWriteCodeChanges(args) {
    assertConfirmedConnectedInterfaceWrite(args.confirmed);
    const auth = {
        accessToken: args.accessToken,
        tokenType: 'token',
        provider: 'github'
    };
    if (args.operation === 'createRepository') {
        const provider = new github_1.GitHubProvider((0, vcs_1.getVCSConfig)('github'));
        const repositoryName = args.name ?? `bitcode-${Date.now()}`;
        const repo = await provider.createRepository(auth, {
            name: repositoryName,
            description: args.description,
            private: args.private ?? false,
            autoInit: true
        }, undefined);
        return {
            result: repo,
            metadata: {
                operation: args.operation,
                writeAdmission: buildChatGptAppWriteAdmission({
                    connectedInterface: 'github',
                    operation: args.operation,
                    targetAnchor: `github:${repositoryName}`
                })
            }
        };
    }
    const owner = args.owner;
    const repoName = args.repo;
    const path = args.path;
    if (!owner || !repoName || !path) {
        throw new Error('owner, repo, and path must be provided for createOrUpdateFile');
    }
    const octokit = new rest_1.Octokit({ auth: args.accessToken });
    let sha;
    try {
        const existing = await octokit.repos.getContent({ owner, repo: repoName, path, ref: args.branch });
        const data = existing.data;
        if (!Array.isArray(data) && typeof data?.sha === 'string') {
            sha = data.sha;
        }
    }
    catch (error) {
        if (error?.status !== 404) {
            throw error;
        }
    }
    const commit = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path,
        message: args.message ?? `Bitcode update ${new Date().toISOString()}`,
        content: node_buffer_1.Buffer.from(args.content ?? '', 'utf8').toString('base64'),
        branch: args.branch,
        sha
    });
    return {
        result: commit.data,
        metadata: {
            operation: args.operation,
            sha: commit.data.content?.sha,
            writeAdmission: buildChatGptAppWriteAdmission({
                connectedInterface: 'github',
                operation: args.operation,
                targetAnchor: `github:${owner}/${repoName}/${path}${args.branch ? `@${args.branch}` : ''}`
            })
        }
    };
}
const WRITE_CODE_CHANGES_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        operation: {
            type: 'string',
            enum: ['createRepository', 'createOrUpdateFile'],
            description: 'Write operation to perform'
        },
        confirmed: {
            type: 'boolean',
            const: true,
            description: 'Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'
        },
        accessToken: {
            type: 'string',
            description: 'GitHub access token with repo scope'
        },
        owner: {
            type: 'string',
            description: 'Owner for file operations (required for createOrUpdateFile)'
        },
        repo: {
            type: 'string',
            description: 'Repo for file operations (required for createOrUpdateFile)'
        },
        name: {
            type: 'string',
            description: 'Repository name for createRepository'
        },
        description: {
            type: 'string',
            description: 'Repository description'
        },
        private: {
            type: 'boolean',
            description: 'Whether repository should be private'
        },
        path: {
            type: 'string',
            description: 'File path to create or update'
        },
        content: {
            type: 'string',
            description: 'Raw UTF-8 file contents'
        },
        message: {
            type: 'string',
            description: 'Commit message for file change'
        },
        branch: {
            type: 'string',
            description: 'Branch to commit against (default default branch)'
        }
    },
    required: ['operation', 'confirmed', 'accessToken']
};
const IMPROVE_BEHAVIOR_VALIDATOR = zod_1.z.object({
    behaviorImprovement: zod_1.z.string().optional().describe('Notes about desired development behavior changes'),
    currentAgentsMd: zod_1.z.string().optional().describe('Optional current AGENTS.md for reference'),
    regenerateFromDigest: zod_1.z.boolean().optional().describe('Regenerate the baseline AGENTS.md from digest before applying updates')
}).strict();
async function executeImproveDevelopingBehavior(args) {
    const focus = args.behaviorImprovement?.slice(0, 120) || 'general';
    const update = ['### Behavior Improvement', args.behaviorImprovement ?? 'Capture new behaviors next session.'].join('\n');
    let baseDocument = args.currentAgentsMd && args.currentAgentsMd.trim().length > 0
        ? args.currentAgentsMd.trim()
        : '';
    let digestUsed = false;
    let digestError;
    const shouldRegenerate = !baseDocument || args.regenerateFromDigest;
    if (shouldRegenerate) {
        try {
            const repoName = node_path_1.default.basename(process.cwd());
            const digestResult = await (0, run_1.generateDigest)({
                owner: 'local',
                repo: repoName,
                commit: 'local',
                correlationId: `agents-md-${Date.now()}`,
                usePreClonedRepo: true,
                rootDir: process.cwd(),
                forceRegenerate: args.regenerateFromDigest ?? false
            });
            if (digestResult.agentDocument) {
                baseDocument = digestResult.agentDocument.trim();
                digestUsed = true;
            }
        }
        catch (error) {
            digestError = error instanceof Error ? error.message : String(error);
            console.warn('[improve_developing_behavior] digest refresh failed:', digestError);
        }
    }
    if (!baseDocument) {
        baseDocument = AGENTS_MD_TEMPLATE.trim();
    }
    const latestBehavior = [baseDocument, update].filter(Boolean).join('\n\n').trim();
    const created = !(args.currentAgentsMd && args.currentAgentsMd.trim().length > 0) && !digestUsed;
    const guidance = digestUsed
        ? 'Updated AGENTS.md from digest before appending new behaviour notes.'
        : digestError
            ? `Digest refresh unavailable (${digestError}); using provided AGENTS.md context.`
            : 'Appended behaviour notes to the provided AGENTS.md context.';
    const behaviorInsights = args.behaviorImprovement
        ? args.behaviorImprovement
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
        : [];
    const behaviorContextMetadata = buildPreparedContextMetadata({
        agentDocument: latestBehavior,
        insights: behaviorInsights
    });
    return {
        behaviorDelta: update,
        latestBehaviorDocument: latestBehavior,
        latestBehavior: latestBehavior,
        metadata: {
            focus,
            created,
            aiDocument: '.ai/AGENTS.md',
            digestUsed,
            digestError,
            guidance,
            ...(behaviorContextMetadata ?? {})
        }
    };
}
const IMPROVE_BEHAVIOR_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        behaviorImprovement: {
            type: 'string',
            description: 'Notes about desired development behavior changes'
        },
        currentAgentsMd: {
            type: 'string',
            description: 'Optional current AGENTS.md for reference'
        },
        regenerateFromDigest: {
            type: 'boolean',
            description: 'Regenerate the baseline AGENTS.md from digest before applying updates'
        }
    }
};
const VERCEL_READ_VALIDATOR = zod_1.z.object({
    request: zod_1.z.enum([
        'list_teams',
        'list_projects',
        'get_project',
        'list_deployments',
        'get_deployment',
        'get_deployment_events',
        'get_deployment_build_logs',
        'search_documentation'
    ]).describe('Vercel read tool to invoke'),
    payload: zod_1.z.record(zod_1.z.any()).default({}).describe('Parameters to forward to the Vercel MCP tool')
}).strict();
async function executeUseVercelReadExternalMcp(args) {
    let answer;
    let guidance;
    switch (args.request) {
        case 'list_teams':
            answer = await generic_tools_mcps_vercel_1.vercelListTeamsTool.execute();
            guidance = 'Teams enumerated so we can choose the right scope before deploying or inspecting projects.';
            break;
        case 'list_projects':
            answer = await generic_tools_mcps_vercel_1.vercelListProjectsTool.execute({
                teamId: args.payload.teamId ?? 'team_bitcode'
            });
            guidance = 'Projects retrieved—use this to anchor subsequent deployment or domain questions.';
            break;
        case 'get_project':
            answer = await generic_tools_mcps_vercel_1.vercelGetProjectTool.execute({
                projectId: args.payload.projectId ?? args.payload.name ?? 'prj_Yapper',
                teamId: args.payload.teamId ?? 'team_bitcode'
            });
            guidance = 'Project details ready. Summarise the stack, domains, and env vars for the user.';
            break;
        case 'list_deployments':
            answer = await generic_tools_mcps_vercel_1.vercelListDeploymentsTool.execute({
                projectId: args.payload.projectId ?? 'prj_Yapper',
                teamId: args.payload.teamId ?? 'team_bitcode',
                limit: args.payload.limit
            });
            guidance = 'Deployment history collected; highlight production vs preview to set expectations.';
            break;
        case 'get_deployment':
            answer = await generic_tools_mcps_vercel_1.vercelGetDeploymentTool.execute({
                idOrUrl: args.payload.idOrUrl ?? args.payload.deploymentId,
                teamId: args.payload.teamId ?? 'team_bitcode'
            });
            guidance = 'Deployment snapshot captured—surface status, target, and relevant commit details.';
            break;
        case 'get_deployment_events':
            answer = await generic_tools_mcps_vercel_1.vercelGetDeploymentEventsTool.execute({
                idOrUrl: args.payload.idOrUrl ?? args.payload.deploymentId,
                teamId: args.payload.teamId ?? 'team_bitcode'
            });
            guidance = 'Timeline ready. Walk the user through build → ready events to explain progress.';
            break;
        case 'get_deployment_build_logs':
            answer = await generic_tools_mcps_vercel_1.vercelGetDeploymentBuildLogsTool.execute({
                idOrUrl: args.payload.idOrUrl ?? args.payload.deploymentId,
                teamId: args.payload.teamId ?? 'team_bitcode',
                limit: args.payload.limit
            });
            guidance = 'Build logs fetched—call out failures or long-running steps in plain language.';
            break;
        case 'search_documentation':
            answer = await generic_tools_mcps_vercel_1.vercelSearchDocumentationTool.execute({
                topic: args.payload.topic ?? 'deployment',
                tokens: args.payload.tokens
            });
            guidance = 'Documentation surfaced—summarise each link and explain why it matters for our plan.';
            break;
        default:
            throw new Error(`Unsupported Vercel read request: ${args.request}`);
    }
    return {
        answer,
        metadata: {
            provider: 'vercel',
            request: args.request,
            aiDocument: '.ai/MCPS.md',
            guidance
        }
    };
}
const VERCEL_READ_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        request: {
            type: 'string',
            enum: [
                'list_teams',
                'list_projects',
                'get_project',
                'list_deployments',
                'get_deployment',
                'get_deployment_events',
                'get_deployment_build_logs',
                'search_documentation'
            ],
            description: 'Vercel read tool to invoke'
        },
        payload: {
            type: 'object',
            description: 'Parameters to forward to the Vercel MCP tool'
        }
    },
    required: ['request']
};
const VERCEL_WRITE_VALIDATOR = zod_1.z.object({
    request: zod_1.z.enum(['deploy_to_vercel', 'buy_domain', 'check_domain_availability']).describe('Vercel write tool to invoke'),
    confirmed: zod_1.z.literal(true).describe('Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'),
    payload: zod_1.z.record(zod_1.z.any()).default({}).describe('Parameters to forward to the Vercel MCP tool')
}).strict();
async function executeUseVercelWriteExternalMcp(args) {
    assertConfirmedConnectedInterfaceWrite(args.confirmed);
    let result;
    let guidance;
    let targetAnchor = 'vercel:unscoped';
    switch (args.request) {
        case 'deploy_to_vercel':
            result = await generic_tools_mcps_vercel_1.vercelDeployProjectTool.execute({
                projectId: args.payload.projectId ?? 'prj_Yapper',
                teamId: args.payload.teamId ?? 'team_bitcode',
                message: args.payload.message
            });
            targetAnchor = `vercel:${args.payload.teamId ?? 'team_bitcode'}/${args.payload.projectId ?? 'prj_Yapper'}`;
            guidance = 'Deployment requested—explain the pending status and remind the user to monitor readiness.';
            break;
        case 'buy_domain':
            result = await generic_tools_mcps_vercel_1.vercelBuyDomainTool.execute({
                name: args.payload.name ?? 'yapper.app',
                expectedPrice: args.payload.expectedPrice,
                contact: args.payload.contact ?? {
                    country: 'US',
                    firstName: 'Bitcode',
                    lastName: 'Builder',
                    email: 'builder@bitcode.dev'
                }
            });
            targetAnchor = `vercel:domain/${args.payload.name ?? 'yapper.app'}`;
            guidance = 'Domain purchase simulated—note renewal details and next steps for DNS configuration.';
            break;
        case 'check_domain_availability':
            result = await generic_tools_mcps_vercel_1.vercelCheckDomainAvailabilityTool.execute({
                names: Array.isArray(args.payload?.names) ? args.payload.names : [String(args.payload?.name ?? 'yapper.app')]
            });
            targetAnchor = `vercel:domain-availability/${Array.isArray(args.payload?.names) ? args.payload.names.join(',') : String(args.payload?.name ?? 'yapper.app')}`;
            guidance = 'Domain availability report ready—guide the user toward the best available option.';
            break;
        default:
            throw new Error(`Unsupported Vercel write request: ${args.request}`);
    }
    return {
        result,
        metadata: {
            provider: 'vercel',
            request: args.request,
            aiDocument: '.ai/MCPS.md',
            guidance,
            writeAdmission: buildChatGptAppWriteAdmission({
                connectedInterface: 'vercel',
                operation: args.request,
                targetAnchor
            })
        }
    };
}
const VERCEL_WRITE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        request: {
            type: 'string',
            enum: ['deploy_to_vercel', 'buy_domain', 'check_domain_availability'],
            description: 'Vercel write tool to invoke'
        },
        confirmed: {
            type: 'boolean',
            const: true,
            description: 'Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'
        },
        payload: {
            type: 'object',
            description: 'Parameters to forward to the Vercel MCP tool'
        }
    },
    required: ['request', 'confirmed']
};
const AWS_READ_VALIDATOR = zod_1.z.object({
    request: zod_1.z.enum(['lambda.invoke', 's3.getObject', 'dynamo.getItem', 'cloudwatch.log']).describe('AWS read action to perform'),
    payload: zod_1.z.record(zod_1.z.any()).default({}).describe('Raw AWS parameters (function name, bucket/key, table/key, etc.)')
}).strict();
async function executeUseAwsReadExternalMcp(args) {
    let answer;
    let guidance;
    switch (args.request) {
        case 'lambda.invoke':
            answer = await generic_tools_mcps_aws_1.awsLambdaInvokeTool.execute(args.payload);
            guidance = 'Invoked the Lambda so we can narrate its live response or surface any execution errors.';
            break;
        case 's3.getObject':
            answer = await generic_tools_mcps_aws_1.awsS3GetObjectTool.execute(args.payload);
            guidance = 'Fetched the S3 object—perfect for confirming configuration or sharing assets inline.';
            break;
        case 'dynamo.getItem':
            answer = await generic_tools_mcps_aws_1.awsDynamoGetItemTool.execute(args.payload);
            guidance = 'Pulled the Dynamo item so we can read back stored state without writing code.';
            break;
        case 'cloudwatch.log':
            answer = await generic_tools_mcps_aws_1.awsCloudWatchLogTool.execute(args.payload);
            guidance = 'Collected CloudWatch log entries to help explain current production behaviour.';
            break;
        default:
            answer = await generic_tools_mcps_aws_1.awsMcpTool.execute(args.payload);
            guidance = 'Routed through the generic AWS MCP tool (double-check the payload before sharing externally).';
            break;
    }
    return {
        answer,
        metadata: {
            provider: 'aws',
            request: args.request,
            aiDocument: '.ai/MCPS.md',
            guidance
        }
    };
}
const AWS_READ_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        request: {
            type: 'string',
            enum: ['lambda.invoke', 's3.getObject', 'dynamo.getItem', 'cloudwatch.log'],
            description: 'AWS read action to perform'
        },
        payload: {
            type: 'object',
            description: 'Parameters passed through to the AWS MCP tool'
        }
    },
    required: ['request']
};
const AWS_WRITE_VALIDATOR = zod_1.z.object({
    request: zod_1.z.enum(['s3.putObject', 'dynamo.putItem']).describe('AWS write action to perform'),
    confirmed: zod_1.z.literal(true).describe('Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'),
    payload: zod_1.z.record(zod_1.z.any()).default({}).describe('Raw AWS parameters (bucket/key/body, table/item, etc.)')
}).strict();
async function executeUseAwsWriteExternalMcp(args) {
    assertConfirmedConnectedInterfaceWrite(args.confirmed);
    let result;
    let guidance;
    let targetAnchor = 'aws:unscoped';
    switch (args.request) {
        case 's3.putObject':
            result = await generic_tools_mcps_aws_1.awsS3PutObjectTool.execute(args.payload);
            targetAnchor = `aws:s3/${String(args.payload.bucket ?? 'bitcode-demo')}/${String(args.payload.key ?? 'config/demo.json')}`;
            guidance = 'Uploaded to S3—confirm the path in follow-up so collaborators can fetch it easily.';
            break;
        case 'dynamo.putItem':
            result = await generic_tools_mcps_aws_1.awsDynamoPutItemTool.execute(args.payload);
            targetAnchor = `aws:dynamodb/${String(args.payload.table ?? 'bitcode-demo-table')}`;
            guidance = 'Stored the record in DynamoDB; let’s document the schema impact in PRODUCT.md.';
            break;
        default:
            throw new Error(`Unsupported AWS write tool: ${args.request}`);
    }
    return {
        result,
        metadata: {
            provider: 'aws',
            request: args.request,
            aiDocument: '.ai/MCPS.md',
            guidance,
            writeAdmission: buildChatGptAppWriteAdmission({
                connectedInterface: 'aws',
                operation: args.request,
                targetAnchor
            })
        }
    };
}
const AWS_WRITE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        request: {
            type: 'string',
            enum: ['s3.putObject', 'dynamo.putItem'],
            description: 'AWS write action to perform'
        },
        confirmed: {
            type: 'boolean',
            const: true,
            description: 'Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'
        },
        payload: {
            type: 'object',
            description: 'Parameters passed through to the AWS MCP tool'
        }
    },
    required: ['request', 'confirmed']
};
// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------
function getBitcodeTools() {
    return [
        {
            name: 'answer_codebase_query',
            description: 'Answer technical questions about the codebase by running high-signal searches.',
            inputSchema: CODEBASE_QUERY_SCHEMA,
            validator: CODEBASE_QUERY_VALIDATOR,
            execute: executeAnswerCodebaseQuery,
            meta: {
                readOnlyHint: true,
                categories: ['codebase-intelligence'],
                docCodePrompt: SIMPLE_SYSTEM_TEXT_SEARCH_DOC
            }
        },
        {
            name: 'answer_codeweb_query',
            description: 'Research external technical references, examples, or documentation.',
            inputSchema: WEB_SEARCH_SCHEMA,
            validator: WEB_SEARCH_VALIDATOR,
            execute: executeAnswerCodewebQuery,
            meta: {
                readOnlyHint: true,
                categories: ['web-intelligence'],
                docCodePrompt: WEB_SEARCH_DOC
            }
        },
        {
            name: 'depict_design_asset',
            description: 'Describe design assets (screenshots, diagrams) in text form for reference.',
            inputSchema: DEPICT_ASSET_SCHEMA,
            validator: DEPICT_ASSET_VALIDATOR,
            execute: executeDepictDesignAsset,
            meta: {
                readOnlyHint: true,
                categories: ['design'],
                docCodePrompt: DEPICT_DESIGN_ASSET_DOC
            }
        },
        {
            name: 'design_code',
            description: 'Update `.ai/PRODUCT.md` based on new ideas or requirements provided in conversation.',
            inputSchema: DESIGN_CODE_SCHEMA,
            validator: DESIGN_CODE_VALIDATOR,
            execute: executeDesignCode,
            meta: {
                readOnlyHint: true,
                categories: ['design'],
                docCodePrompt: DESIGN_CODE_DOC
            }
        },
        {
            name: 'code_design',
            description: 'Translate the latest design intent into concrete implementation actions and patch stubs.',
            inputSchema: CODE_DESIGN_SCHEMA,
            validator: CODE_DESIGN_VALIDATOR,
            execute: executeCodeDesign,
            meta: {
                categories: ['implementation'],
                docCodePrompt: CODE_DESIGN_DOC
            }
        },
        {
            name: 'read_code_changes_from_vcs',
            description: 'Inspect recent GitHub changes to understand repository activity.',
            inputSchema: READ_CODE_CHANGES_SCHEMA,
            validator: READ_CODE_CHANGES_VALIDATOR,
            execute: executeReadCodeChanges,
            meta: {
                readOnlyHint: true,
                categories: ['version-control'],
                docCodePrompt: READ_CODE_CHANGES_VCS_DOC
            }
        },
        {
            name: 'write_code_changes_to_vcs',
            description: 'Create repositories or push file updates to GitHub after confirmed Bitcode connected-interface write admission.',
            inputSchema: WRITE_CODE_CHANGES_SCHEMA,
            validator: WRITE_CODE_CHANGES_VALIDATOR,
            execute: executeWriteCodeChanges,
            meta: {
                requiresConfirmation: true,
                categories: ['version-control', 'write'],
                docCodePrompt: WRITE_CODE_CHANGES_VCS_DOC
            }
        },
        {
            name: 'improve_developing_behavior',
            description: 'Evolve `.ai/AGENTS.md` with new behavioral guidance based on session learnings.',
            inputSchema: IMPROVE_BEHAVIOR_SCHEMA,
            validator: IMPROVE_BEHAVIOR_VALIDATOR,
            execute: executeImproveDevelopingBehavior,
            meta: {
                readOnlyHint: true,
                categories: ['ai-documents'],
                docCodePrompt: IMPROVE_DEVELOPING_BEHAVIOR_DOC
            }
        },
        {
            name: 'use_vercel_read_external_mcp',
            description: 'Pull Vercel deployment details or event timelines for conversational status updates.',
            inputSchema: VERCEL_READ_SCHEMA,
            validator: VERCEL_READ_VALIDATOR,
            execute: executeUseVercelReadExternalMcp,
            meta: {
                readOnlyHint: true,
                categories: ['devops'],
                docCodePrompt: VERCEL_MCP_DOC
            }
        },
        {
            name: 'use_vercel_write_external_mcp',
            description: 'Execute confirmed Vercel delivery mechanisms with Bitcode ChatGPT App write-admission receipts.',
            inputSchema: VERCEL_WRITE_SCHEMA,
            validator: VERCEL_WRITE_VALIDATOR,
            execute: executeUseVercelWriteExternalMcp,
            meta: {
                requiresConfirmation: true,
                categories: ['devops', 'write'],
                docCodePrompt: VERCEL_MCP_DOC
            }
        },
        {
            name: 'use_aws_read_external_mcp',
            description: 'Run read-only AWS checks (Lambda invoke, S3 get, Dynamo get, CloudWatch log) to narrate backend health.',
            inputSchema: AWS_READ_SCHEMA,
            validator: AWS_READ_VALIDATOR,
            execute: executeUseAwsReadExternalMcp,
            meta: {
                readOnlyHint: true,
                categories: ['devops'],
                docCodePrompt: AWS_MCP_DOC
            }
        },
        {
            name: 'use_aws_write_external_mcp',
            description: 'Perform scoped AWS delivery writes after confirmed Bitcode ChatGPT App write admission.',
            inputSchema: AWS_WRITE_SCHEMA,
            validator: AWS_WRITE_VALIDATOR,
            execute: executeUseAwsWriteExternalMcp,
            meta: {
                requiresConfirmation: true,
                categories: ['devops', 'write'],
                docCodePrompt: AWS_MCP_DOC
            }
        }
    ];
}
