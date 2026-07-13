import './env';

import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { prepareConciseContext } from '@bitcode/context';
import { Octokit } from '@octokit/rest';
import { awsCloudWatchLogTool, awsDynamoGetItemTool, awsDynamoPutItemTool, awsLambdaInvokeTool, awsMcpTool, awsS3GetObjectTool, awsS3PutObjectTool } from '@bitcode/generic-tools-mcps-aws';
import { simpleSystemTextSearch } from '@bitcode/generic-tools-simple-system-text-search';
import { search as webSearch } from '@bitcode/generic-tools-web-search';
import { generateDigest } from '@bitcode/digest/run';
import {
  evaluateBtdOrganizationInterfaceAuthority,
  type BtdOrganizationRole,
  type BtdSettlementAuthorityState,
} from '@bitcode/btd';
import {
  buildBtdInterfaceAuthorizationPolicy,
} from '@bitcode/btd/interface-authorization-policy';
import {
  buildBtdChatGptAppActionContractRegistry,
  renderBtdChatGptAppSourceSafeResponse,
  type BtdChatGptAppActionContract,
  type BtdChatGptAppActionId,
} from '@bitcode/btd/chatgpt-app-action-contract';
import {
  vercelGetDeploymentEventsTool,
  vercelGetDeploymentTool,
  vercelListDeploymentsTool,
  vercelGetDeploymentBuildLogsTool,
  vercelListProjectsTool,
  vercelGetProjectTool,
  vercelListTeamsTool,
  vercelSearchDocumentationTool,
  vercelDeployProjectTool,
  vercelBuyDomainTool,
  vercelCheckDomainAvailabilityTool
} from '@bitcode/generic-tools-mcps-vercel';
import { VERCEL_MCP_DOC_CODE_TOOL_PROMPT } from '@bitcode/generic-tools-mcps-vercel/src/prompts/VercelMCPDocCodeToolPrompt';
import { GitHubProvider } from '@bitcode/github';
import { getVCSConfig, type VCSAuth } from '@bitcode/vcs';
import { z } from 'zod';
import { SIMPLE_SYSTEM_TEXT_SEARCH_DOC_CODE_TOOL_PROMPT } from '@bitcode/generic-tools-simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt';
import { WEB_SEARCH_DOC_CODE_TOOL_PROMPT } from '@bitcode/generic-tools-web-search/src/prompts/WebSearchDocCodeToolPrompt';
import { AWS_MCP_DOC_CODE_TOOL_PROMPT } from '@bitcode/generic-tools-mcps-aws/src/prompts/AWSMCPDocCodeToolPrompt';
import {
  DEPICT_DESIGN_ASSET_DOC_CODE_TOOL_PROMPT,
  DESIGN_CODE_DOC_CODE_TOOL_PROMPT,
  CODE_DESIGN_DOC_CODE_TOOL_PROMPT,
  READ_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT,
  WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT,
  IMPROVE_DEVELOPING_BEHAVIOR_DOC_CODE_TOOL_PROMPT
} from './prompts/chatgpt-tool-doc-prompts';

export type BitcodeToolExecutionResult = Record<string, unknown>;

export interface BitcodeTool<T extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  validator: T;
  execute: (args: z.infer<T>) => Promise<BitcodeToolExecutionResult>;
  meta?: Record<string, unknown>;
}

type ChatGptAppConnectedInterface = 'github' | 'vercel' | 'aws';

type ChatGptAppWriteAdmissionInput = {
  connectedInterface: ChatGptAppConnectedInterface;
  operation: string;
  targetAnchor?: string;
  readAccess: ChatGptAppReadAccessDecision;
  organizationAuthority: ChatGptAppOrganizationAuthorityDecision;
};

type ChatGptAppOrganizationAuthorityDecision =
  ReturnType<typeof evaluateBtdOrganizationInterfaceAuthority> & {
    interfaceAuthorizationPolicy: {
      policyId: string;
      decision: 'allowed' | 'denied';
      denialCodes: string[];
      policyRoot: string;
      readableDenial: string | null;
      repairActions: string[];
    };
  };

type ChatGptAppReadAccessDecision = {
  assetPackId: string;
  walletId: string;
  decision: 'owner_read' | 'licensed_read';
  accessPolicyHash: string;
  reason: string;
};

type ChatGptAppOrganizationAuthorityInput = {
  organizationId: string;
  organizationRole: BtdOrganizationRole;
  organizationPermissionGrants?: string[];
  walletId?: string;
  settlementState: BtdSettlementAuthorityState;
  repairApprovalState?: 'not_required' | 'required' | 'approved';
};

const CHATGPT_APP_READ_ACCESS_VALIDATOR = z.object({
  assetPackId: z.string().min(1, 'assetPackId must be provided'),
  walletId: z.string().min(1, 'walletId must be provided'),
  decision: z.enum(['owner_read', 'licensed_read']),
  accessPolicyHash: z.string().min(1, 'accessPolicyHash must be provided'),
  reason: z.string().min(1, 'reason must be provided')
}).strict();

const CHATGPT_APP_ORGANIZATION_AUTHORITY_VALIDATOR = z.object({
  organizationId: z.string().min(1, 'organizationId must be provided'),
  organizationRole: z.enum(['viewer', 'member', 'admin', 'owner']),
  organizationPermissionGrants: z.array(z.string()).default([]),
  walletId: z.string().optional(),
  settlementState: z.enum(['not_required', 'pending', 'settled']),
  repairApprovalState: z.enum(['not_required', 'required', 'approved']).optional()
}).strict();

const CHATGPT_APP_READ_ACCESS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    assetPackId: {
      type: 'string',
      description: 'AssetPack id whose registry read access admits this connected-interface write'
    },
    walletId: {
      type: 'string',
      description: 'Wallet id used for the owner-read or licensed-read check'
    },
    decision: {
      type: 'string',
      enum: ['owner_read', 'licensed_read'],
      description: 'Registry-derived read access decision'
    },
    accessPolicyHash: {
      type: 'string',
      description: 'Committed access policy hash that matched the registry decision'
    },
    reason: {
      type: 'string',
      description: 'Registry-derived reason for the access decision'
    }
  },
  required: ['assetPackId', 'walletId', 'decision', 'accessPolicyHash', 'reason']
};

const CHATGPT_APP_ORGANIZATION_AUTHORITY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    organizationId: {
      type: 'string',
      description: 'Organization id whose role and grants authorize the ChatGPT connected-interface write'
    },
    organizationRole: {
      type: 'string',
      enum: ['viewer', 'member', 'admin', 'owner'],
      description: 'Registry-derived organization role for the actor'
    },
    organizationPermissionGrants: {
      type: 'array',
      items: { type: 'string' },
      description: 'Optional registry-derived organization permission grants'
    },
    walletId: {
      type: 'string',
      description: 'Wallet id bound to the actor; defaults to readAccess.walletId when omitted'
    },
    settlementState: {
      type: 'string',
      enum: ['not_required', 'pending', 'settled'],
      description: 'Settlement state for protected-source delivery'
    },
    repairApprovalState: {
      type: 'string',
      enum: ['not_required', 'required', 'approved'],
      description: 'Repair approval state when the write repairs a projection'
    }
  },
  required: ['organizationId', 'organizationRole', 'settlementState']
};

function assertConfirmedConnectedInterfaceWrite(confirmed: unknown): void {
  if (confirmed !== true) {
    throw new Error(
      'Bitcode ChatGPT App write admission requires confirmed: true before connected-interface writes can execute.'
    );
  }
}

function assertChatGptAppReadAccess(readAccess: unknown): ChatGptAppReadAccessDecision {
  const parsed = CHATGPT_APP_READ_ACCESS_VALIDATOR.safeParse(readAccess);
  if (!parsed.success) {
    throw new Error(
      'Bitcode ChatGPT App write admission requires readAccess owner-read or licensed-read registry evidence.'
    );
  }

  if (parsed.data.decision !== 'owner_read' && parsed.data.decision !== 'licensed_read') {
    throw new Error(
      'Bitcode ChatGPT App write admission requires owner-read or licensed-read registry access evidence.'
    );
  }

  return parsed.data as ChatGptAppReadAccessDecision;
}

function assertChatGptAppOrganizationAuthority(
  organizationAuthority: unknown,
  input: {
    operation: string;
    targetAnchor?: string;
    readAccess: ChatGptAppReadAccessDecision;
  }
) {
  const parsed = CHATGPT_APP_ORGANIZATION_AUTHORITY_VALIDATOR.safeParse(organizationAuthority);
  if (!parsed.success) {
    throw new Error(
      'Bitcode ChatGPT App write admission requires organizationAuthority role, settlement, and registry grant evidence.'
    );
  }

  const issuedAt = new Date().toISOString();
  const policy = buildBtdInterfaceAuthorizationPolicy({
    policyId: `chatgpt-app-write:${input.operation}`,
    interfaceSurface: 'chatgpt_app',
    action: 'deliver_asset_pack',
    authIssuer: {
      issuerKind: 'chatgpt_session',
      issuerId: 'chatgpt-app-connected-interface',
      issuedAt,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      issuerRoot: stableChatGptAuthorizationRoot('chatgpt-auth-issuer', [
        input.operation,
        input.targetAnchor ?? '',
      ]),
    },
    actorId: 'chatgpt_app_connected_interface',
    organizationId: parsed.data.organizationId,
    teamId: parsed.data.organizationId,
    memberId: 'chatgpt_app_connected_interface',
    organizationRole: parsed.data.organizationRole,
    organizationPermissionGrants: parsed.data.organizationPermissionGrants,
    walletCapability: {
      state: 'verified',
      walletId: parsed.data.walletId ?? input.readAccess.walletId,
      canAuthorizeDelivery: true,
      capabilityRoot: stableChatGptAuthorizationRoot('chatgpt-wallet-capability', [
        parsed.data.walletId ?? input.readAccess.walletId,
      ]),
    },
    readLicense: {
      state: input.readAccess.decision,
      assetPackId: input.readAccess.assetPackId,
      walletId: input.readAccess.walletId,
      accessPolicyHash: input.readAccess.accessPolicyHash,
      reason: input.readAccess.reason,
    },
    assetPackRights: {
      state: input.readAccess.decision === 'owner_read' ? 'owned' : 'licensed',
      assetPackId: input.readAccess.assetPackId,
    },
    protectedSource: {
      disclosureState: 'requested_locked_source',
      settlementState: parsed.data.settlementState,
      previewOnly: false,
    },
    confirmed: true,
    repairPosture: {
      state: parsed.data.repairApprovalState === 'approved'
        ? 'approved'
        : parsed.data.repairApprovalState === 'required'
          ? 'required'
          : 'not_required',
    },
    targetAnchor: input.targetAnchor ?? input.operation,
    at: issuedAt,
  });
  const decision = policy.organizationAuthority.actionDecision;

  if (policy.decision !== 'allowed' || !decision || decision.decision !== 'allowed') {
    throw new Error(
      `Bitcode ChatGPT App write admission denied by interface authorization policy: ${policy.denialCodes.join(', ')}.`
    );
  }

  return {
    ...decision,
    interfaceAuthorizationPolicy: {
      policyId: policy.policyId,
      decision: policy.decision,
      denialCodes: policy.denialCodes,
      policyRoot: policy.proofRoots.policyRoot,
      readableDenial: policy.readableDenial,
      repairActions: policy.repairActions,
    },
  };
}

function buildChatGptAppWriteAdmission(input: ChatGptAppWriteAdmissionInput) {
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
    targetAnchor: input.targetAnchor,
    readAccess: input.readAccess,
    organizationAuthority: input.organizationAuthority
  };
}

function stableChatGptAuthorizationRoot(scope: string, payload: unknown): string {
  return `${scope}:${createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 24)}`;
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
const SIMPLE_SYSTEM_TEXT_SEARCH_DOC = SIMPLE_SYSTEM_TEXT_SEARCH_DOC_CODE_TOOL_PROMPT.format();
const WEB_SEARCH_DOC = WEB_SEARCH_DOC_CODE_TOOL_PROMPT.format();
const VERCEL_MCP_DOC = VERCEL_MCP_DOC_CODE_TOOL_PROMPT.format();
const AWS_MCP_DOC = AWS_MCP_DOC_CODE_TOOL_PROMPT.format();
const DEPICT_DESIGN_ASSET_DOC = DEPICT_DESIGN_ASSET_DOC_CODE_TOOL_PROMPT.format();
const DESIGN_CODE_DOC = DESIGN_CODE_DOC_CODE_TOOL_PROMPT.format();
const CODE_DESIGN_DOC = CODE_DESIGN_DOC_CODE_TOOL_PROMPT.format();
const READ_CODE_CHANGES_VCS_DOC = READ_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT.format();
const WRITE_CODE_CHANGES_VCS_DOC = WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT.format();
const IMPROVE_DEVELOPING_BEHAVIOR_DOC = IMPROVE_DEVELOPING_BEHAVIOR_DOC_CODE_TOOL_PROMPT.format();

function buildPreparedContextMetadata(input: {
  productDocument?: string;
  agentDocument?: string;
  attachments?: Array<Record<string, unknown>>;
  insights?: string[];
  tokenLimit?: number;
}) {
  const files = [
    input.productDocument ? '.ai/PRODUCT.md' : null,
    input.agentDocument ? '.ai/AGENTS.md' : null
  ].filter(Boolean) as string[];

  if (files.length === 0) return undefined;

  const concise = prepareConciseContext(
    {
      files,
      context: {
        productDocument: input.productDocument,
        agentDocument: input.agentDocument,
        attachments: input.attachments ?? [],
        insights: input.insights ?? []
      }
    },
    { tokenLimit: input.tokenLimit ?? DEFAULT_CONTEXT_TOKEN_LIMIT }
  );

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

const CODEBASE_QUERY_VALIDATOR = z.object({
  query: z.string().min(1, 'query must be provided').describe('Regex-friendly search pattern to run against the repository'),
  cwd: z.string().min(1).optional().describe('Optional working directory to scope the search'),
  maxResults: z.number().int().min(1).max(500).optional().describe('Maximum matches to return (default 100)'),
  ignoreCase: z.boolean().optional().describe('Perform a case insensitive search (default false)')
}).strict();

async function executeAnswerCodebaseQuery(args: z.infer<typeof CODEBASE_QUERY_VALIDATOR>) {
  const matches = await simpleSystemTextSearch.execute({
    pattern: args.query,
    cwd: args.cwd ?? process.cwd(),
    maxResults: args.maxResults ?? 100,
    ignoreCase: args.ignoreCase ?? false
  });

  const lines = matches.map((match) => `• ${match.file}:${match.line + 1} — ${match.text}`);

  const guidance =
    matches.length > 0
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

const WEB_SEARCH_VALIDATOR = z.object({
  query: z.string().min(1, 'query must be provided').describe('Web search query to send to Exa'),
  numResults: z.number().int().min(1).max(20).optional().describe('Maximum number of documents to fetch (default 8)'),
  useAutoprompt: z.boolean().optional().describe('Allow provider autoprompting to refine the query (default true)')
}).strict();

async function executeAnswerCodewebQuery(args: z.infer<typeof WEB_SEARCH_VALIDATOR>) {
  const response = await webSearch.execute(
    args.query,
    {
      numResults: args.numResults ?? 8,
      useAutoprompt: args.useAutoprompt ?? true
    }
  );

  const results = Array.isArray((response as any)?.results)
    ? (response as any).results
    : Array.isArray((response as any)?.documents)
      ? (response as any).documents
      : [];

  const normalized = results.slice(0, args.numResults ?? 8).map((item: any) => ({
    title: item.title ?? item.name ?? 'Untitled result',
    url: item.url ?? item.link ?? '',
    summary: item.snippet ?? item.summary ?? undefined
  }));

  const preface =
    normalized.length > 0
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

const DEPICT_ASSET_VALIDATOR = z.object({
  assetData: z.string().min(1, 'assetData must be provided').describe('Base64 or UTF-8 encoded representation of the asset'),
  focus: z.string().optional().describe('Optional emphasis for the depiction'),
  notes: z.string().optional().describe('Additional author hints')
}).strict();

async function executeDepictDesignAsset(args: z.infer<typeof DEPICT_ASSET_VALIDATOR>) {
  const payload = args.assetData.includes(';base64,')
    ? args.assetData.split(',').pop() ?? ''
    : args.assetData;

  let bytes = 0;
  try {
    bytes = Buffer.from(payload, 'base64').length;
    if (Number.isNaN(bytes) || !Number.isFinite(bytes)) {
      bytes = Buffer.byteLength(payload, 'utf8');
    }
  } catch {
    bytes = Buffer.byteLength(payload, 'utf8');
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

const DESIGN_CODE_VALIDATOR = z.object({
  ideas: z.string().min(1, 'ideas must be provided').describe('Raw ideas or requirements to incorporate into PRODUCT.md'),
  currentProductMd: z.string().optional().describe('Optional snapshot of the existing PRODUCT.md for contextual diffing'),
  regenerateFromDigest: z.boolean().optional().describe('Regenerate the baseline PRODUCT.md from digest before applying ideas')
}).strict();

async function executeDesignCode(args: z.infer<typeof DESIGN_CODE_VALIDATOR>) {
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
  let digestError: string | undefined;

  const shouldRegenerate = !baseDocument || args.regenerateFromDigest;
  if (shouldRegenerate) {
    try {
      const repoName = path.basename(process.cwd());
      const digestResult = await generateDigest({
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
    } catch (error) {
      digestError = error instanceof Error ? error.message : String(error);
      console.warn('[design_code] digest refresh failed:', digestError);
    }
  }

  if (!baseDocument) {
    baseDocument = PRODUCT_MD_TEMPLATE.trim();
  }

  const PROPOSED_UPDATES_HEADER = '### Proposed Updates';
  const proposedSectionRegex = new RegExp(`${PROPOSED_UPDATES_HEADER}[\\s\\S]*?(?=\\n### |\\n# |$)`, 'g');

  const existingBullets: string[] = [];
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

  const bulletSet = new Set<string>();
  const combinedBullets: string[] = [];

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
      evidenceDocument: '.ai/PRODUCT.md',
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

const CODE_DESIGN_VALIDATOR = z.object({
  update: z.string().min(1, 'update must be provided').describe('Implementation update or summary driving code changes'),
  latest_design: z.string().optional().describe('Latest PRODUCT.md content used as specification'),
  files: z.array(
    z.object({
      path: z.string().min(1, 'path must be provided').describe('Target file path'),
      intent: z.string().min(1, 'intent must be described').describe('Purpose of the change for the given file')
    })
  ).optional().describe('Optional explicit file targets to draft patches for')
}).strict();

async function executeCodeDesign(args: z.infer<typeof CODE_DESIGN_VALIDATOR>) {
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
      evidenceDocument: '.ai/PRODUCT.md',
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

const READ_CODE_CHANGES_VALIDATOR = z.object({
  accessToken: z.string().min(1, 'accessToken must be provided').describe('GitHub access token with repo scope'),
  owner: z.string().min(1, 'owner must be provided').describe('Repository owner (user or organisation)'),
  repo: z.string().min(1, 'repo must be provided').describe('Repository name'),
  branch: z.string().optional().describe('Optional branch ref (default default branch)'),
  limit: z.number().int().min(1).max(50).optional().describe('Maximum commits to retrieve (default 10)')
}).strict();

async function executeReadCodeChanges(args: z.infer<typeof READ_CODE_CHANGES_VALIDATOR>) {
  const provider = new GitHubProvider(getVCSConfig('github'));
  const auth: VCSAuth = {
    accessToken: args.accessToken,
    tokenType: 'token',
    provider: 'github'
  };

  const commits = await provider.listCommits(auth, args.owner, args.repo, {
    branch: args.branch,
    perPage: args.limit ?? 10
  });

  const slice = commits.slice(0, args.limit ?? 10);
  const summary =
    slice.length > 0
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

const WRITE_CODE_CHANGES_VALIDATOR = z.object({
  operation: z.enum(['createRepository', 'createOrUpdateFile']).describe('Write operation to perform'),
  confirmed: z.literal(true).describe('Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'),
  readAccess: CHATGPT_APP_READ_ACCESS_VALIDATOR.describe('Registry owner-read or licensed-read evidence required before connected-interface writes execute'),
  organizationAuthority: CHATGPT_APP_ORGANIZATION_AUTHORITY_VALIDATOR.describe('Organization role and settlement evidence required before ChatGPT App delivery writes execute'),
  accessToken: z.string().min(1, 'accessToken must be provided').describe('GitHub access token with repo scope'),
  owner: z.string().optional().describe('Owner for file operations (required for createOrUpdateFile)'),
  repo: z.string().optional().describe('Repo for file operations (required for createOrUpdateFile)'),
  name: z.string().optional().describe('Repository name for createRepository'),
  description: z.string().optional().describe('Repository description'),
  private: z.boolean().optional().describe('Whether repository should be private'),
  path: z.string().optional().describe('File path to create or update'),
  content: z.string().optional().describe('Raw UTF-8 file contents'),
  message: z.string().optional().describe('Commit message for file change'),
  branch: z.string().optional().describe('Branch to commit against (default default branch)')
}).strict();

async function executeWriteCodeChanges(args: z.infer<typeof WRITE_CODE_CHANGES_VALIDATOR>) {
  assertConfirmedConnectedInterfaceWrite(args.confirmed);
  const readAccess = assertChatGptAppReadAccess(args.readAccess);

  const auth: VCSAuth = {
    accessToken: args.accessToken,
    tokenType: 'token',
    provider: 'github'
  };

  if (args.operation === 'createRepository') {
    const provider = new GitHubProvider(getVCSConfig('github'));
    const repositoryName = args.name ?? `bitcode-${Date.now()}`;
    const targetAnchor = `github:${repositoryName}`;
    const organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
      operation: args.operation,
      targetAnchor,
      readAccess
    });
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
          targetAnchor,
          readAccess,
          organizationAuthority
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
  const targetAnchor = `github:${owner}/${repoName}/${path}${args.branch ? `@${args.branch}` : ''}`;
  const organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
    operation: args.operation,
    targetAnchor,
    readAccess
  });

  const octokit = new Octokit({ auth: args.accessToken });
  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({ owner, repo: repoName, path, ref: args.branch });
    const data = existing.data as any;
    if (!Array.isArray(data) && typeof data?.sha === 'string') {
      sha = data.sha;
    }
  } catch (error: any) {
    if (error?.status !== 404) {
      throw error;
    }
  }

  const commit = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: repoName,
    path,
    message: args.message ?? `Bitcode update ${new Date().toISOString()}`,
    content: Buffer.from(args.content ?? '', 'utf8').toString('base64'),
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
        targetAnchor,
        readAccess,
        organizationAuthority
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
    readAccess: CHATGPT_APP_READ_ACCESS_SCHEMA,
    organizationAuthority: CHATGPT_APP_ORGANIZATION_AUTHORITY_SCHEMA,
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
  required: ['operation', 'confirmed', 'readAccess', 'organizationAuthority', 'accessToken']
};

const IMPROVE_BEHAVIOR_VALIDATOR = z.object({
  behaviorImprovement: z.string().optional().describe('Notes about desired development behavior changes'),
  currentAgentsMd: z.string().optional().describe('Optional current AGENTS.md for reference'),
  regenerateFromDigest: z.boolean().optional().describe('Regenerate the baseline AGENTS.md from digest before applying updates')
}).strict();

async function executeImproveDevelopingBehavior(args: z.infer<typeof IMPROVE_BEHAVIOR_VALIDATOR>) {
  const focus = args.behaviorImprovement?.slice(0, 120) || 'general';
  const update = ['### Behavior Improvement', args.behaviorImprovement ?? 'Capture new behaviors next session.'].join('\n');

  let baseDocument = args.currentAgentsMd && args.currentAgentsMd.trim().length > 0
    ? args.currentAgentsMd.trim()
    : '';
  let digestUsed = false;
  let digestError: string | undefined;

  const shouldRegenerate = !baseDocument || args.regenerateFromDigest;
  if (shouldRegenerate) {
    try {
      const repoName = path.basename(process.cwd());
      const digestResult = await generateDigest({
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
    } catch (error) {
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
      evidenceDocument: '.ai/AGENTS.md',
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

const VERCEL_READ_VALIDATOR = z.object({
  request: z.enum([
    'list_teams',
    'list_projects',
    'get_project',
    'list_deployments',
    'get_deployment',
    'get_deployment_events',
    'get_deployment_build_logs',
    'search_documentation'
  ]).describe('Vercel read tool to invoke'),
  payload: z.record(z.any()).default({}).describe('Parameters to forward to the Vercel MCP tool')
}).strict();

async function executeUseVercelReadExternalMcp(args: z.infer<typeof VERCEL_READ_VALIDATOR>) {
  let answer: unknown;
  let guidance: string;

  switch (args.request) {
    case 'list_teams':
      answer = await vercelListTeamsTool.execute();
      guidance = 'Teams enumerated so we can choose the right scope before deploying or inspecting projects.';
      break;
    case 'list_projects':
      answer = await vercelListProjectsTool.execute({
        teamId: args.payload.teamId ?? 'team_bitcode'
      });
      guidance = 'Projects retrieved—use this to anchor subsequent deployment or domain questions.';
      break;
    case 'get_project':
      answer = await vercelGetProjectTool.execute({
        projectId: args.payload.projectId ?? args.payload.name ?? 'prj_Yapper',
        teamId: args.payload.teamId ?? 'team_bitcode'
      });
      guidance = 'Project details ready. Summarise the stack, domains, and env vars for the user.';
      break;
    case 'list_deployments':
      answer = await vercelListDeploymentsTool.execute({
        projectId: args.payload.projectId ?? 'prj_Yapper',
        teamId: args.payload.teamId ?? 'team_bitcode',
        limit: args.payload.limit
      });
      guidance = 'Deployment history collected; highlight production vs preview to set expectations.';
      break;
    case 'get_deployment':
      answer = await vercelGetDeploymentTool.execute({
        idOrUrl: args.payload.idOrUrl ?? args.payload.deploymentId,
        teamId: args.payload.teamId ?? 'team_bitcode'
      });
      guidance = 'Deployment snapshot captured—surface status, target, and relevant commit details.';
      break;
    case 'get_deployment_events':
      answer = await vercelGetDeploymentEventsTool.execute({
        idOrUrl: args.payload.idOrUrl ?? args.payload.deploymentId,
        teamId: args.payload.teamId ?? 'team_bitcode'
      });
      guidance = 'Timeline ready. Walk the user through build → ready events to explain progress.';
      break;
    case 'get_deployment_build_logs':
      answer = await vercelGetDeploymentBuildLogsTool.execute({
        idOrUrl: args.payload.idOrUrl ?? args.payload.deploymentId,
        teamId: args.payload.teamId ?? 'team_bitcode',
        limit: args.payload.limit
      });
      guidance = 'Build logs fetched—call out failures or long-running steps in plain language.';
      break;
    case 'search_documentation':
      answer = await vercelSearchDocumentationTool.execute({
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
      evidenceDocument: '.ai/MCPS.md',
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

const VERCEL_WRITE_VALIDATOR = z.object({
  request: z.enum(['deploy_to_vercel', 'buy_domain', 'check_domain_availability']).describe('Vercel write tool to invoke'),
  confirmed: z.literal(true).describe('Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'),
  readAccess: CHATGPT_APP_READ_ACCESS_VALIDATOR.describe('Registry owner-read or licensed-read evidence required before connected-interface writes execute'),
  organizationAuthority: CHATGPT_APP_ORGANIZATION_AUTHORITY_VALIDATOR.describe('Organization role and settlement evidence required before ChatGPT App delivery writes execute'),
  payload: z.record(z.any()).default({}).describe('Parameters to forward to the Vercel MCP tool')
}).strict();

async function executeUseVercelWriteExternalMcp(args: z.infer<typeof VERCEL_WRITE_VALIDATOR>) {
  assertConfirmedConnectedInterfaceWrite(args.confirmed);
  const readAccess = assertChatGptAppReadAccess(args.readAccess);

  let result: unknown;
  let guidance: string;
  let targetAnchor = 'vercel:unscoped';
  let organizationAuthority!: ChatGptAppOrganizationAuthorityDecision;

  switch (args.request) {
    case 'deploy_to_vercel':
      targetAnchor = `vercel:${args.payload.teamId ?? 'team_bitcode'}/${args.payload.projectId ?? 'prj_Yapper'}`;
      organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
        operation: args.request,
        targetAnchor,
        readAccess
      });
      result = await vercelDeployProjectTool.execute({
        projectId: args.payload.projectId ?? 'prj_Yapper',
        teamId: args.payload.teamId ?? 'team_bitcode',
        message: args.payload.message
      });
      guidance = 'Deployment requested—explain the pending status and remind the user to monitor readiness.';
      break;
    case 'buy_domain':
      targetAnchor = `vercel:domain/${args.payload.name ?? 'yapper.app'}`;
      organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
        operation: args.request,
        targetAnchor,
        readAccess
      });
      result = await vercelBuyDomainTool.execute({
        name: args.payload.name ?? 'yapper.app',
        expectedPrice: args.payload.expectedPrice,
        contact: args.payload.contact ?? {
          country: 'US',
          firstName: 'Bitcode',
          lastName: 'Builder',
          email: 'builder@bitcode.dev'
        }
      });
      guidance = 'Domain purchase simulated—note renewal details and next steps for DNS configuration.';
      break;
    case 'check_domain_availability':
      targetAnchor = `vercel:domain-availability/${Array.isArray(args.payload?.names) ? args.payload.names.join(',') : String(args.payload?.name ?? 'yapper.app')}`;
      organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
        operation: args.request,
        targetAnchor,
        readAccess
      });
      result = await vercelCheckDomainAvailabilityTool.execute({
        names: Array.isArray(args.payload?.names) ? args.payload.names : [String(args.payload?.name ?? 'yapper.app')]
      });
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
      evidenceDocument: '.ai/MCPS.md',
      guidance,
      writeAdmission: buildChatGptAppWriteAdmission({
        connectedInterface: 'vercel',
        operation: args.request,
        targetAnchor,
        readAccess,
        organizationAuthority
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
    readAccess: CHATGPT_APP_READ_ACCESS_SCHEMA,
    organizationAuthority: CHATGPT_APP_ORGANIZATION_AUTHORITY_SCHEMA,
    payload: {
      type: 'object',
      description: 'Parameters to forward to the Vercel MCP tool'
    }
  },
  required: ['request', 'confirmed', 'readAccess', 'organizationAuthority']
};

const AWS_READ_VALIDATOR = z.object({
  request: z.enum(['lambda.invoke', 's3.getObject', 'dynamo.getItem', 'cloudwatch.log']).describe('AWS read action to perform'),
  payload: z.record(z.any()).default({}).describe('Raw AWS parameters (function name, bucket/key, table/key, etc.)')
}).strict();

async function executeUseAwsReadExternalMcp(args: z.infer<typeof AWS_READ_VALIDATOR>) {
  let answer: unknown;
  let guidance: string;
  switch (args.request) {
    case 'lambda.invoke':
      answer = await awsLambdaInvokeTool.execute(
        args.payload as Parameters<typeof awsLambdaInvokeTool.execute>[0]
      );
      guidance = 'Invoked the Lambda so we can narrate its live response or surface any execution errors.';
      break;
    case 's3.getObject':
      answer = await awsS3GetObjectTool.execute(args.payload as Parameters<typeof awsS3GetObjectTool.execute>[0]);
      guidance = 'Fetched the S3 object—perfect for confirming configuration or sharing assets inline.';
      break;
    case 'dynamo.getItem':
      answer = await awsDynamoGetItemTool.execute(
        args.payload as Parameters<typeof awsDynamoGetItemTool.execute>[0]
      );
      guidance = 'Pulled the Dynamo item so we can read back stored state without writing code.';
      break;
    case 'cloudwatch.log':
      answer = await awsCloudWatchLogTool.execute(
        args.payload as Parameters<typeof awsCloudWatchLogTool.execute>[0]
      );
      guidance = 'Collected CloudWatch log entries to help explain current production behaviour.';
      break;
    default:
      answer = await awsMcpTool.execute(args.payload as Parameters<typeof awsMcpTool.execute>[0]);
      guidance = 'Routed through the generic AWS MCP tool (double-check the payload before sharing externally).';
      break;
  }

  return {
    answer,
    metadata: {
      provider: 'aws',
      request: args.request,
      evidenceDocument: '.ai/MCPS.md',
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

const AWS_WRITE_VALIDATOR = z.object({
  request: z.enum(['s3.putObject', 'dynamo.putItem']).describe('AWS write action to perform'),
  confirmed: z.literal(true).describe('Explicit user confirmation required before Bitcode ChatGPT App connected-interface writes execute'),
  readAccess: CHATGPT_APP_READ_ACCESS_VALIDATOR.describe('Registry owner-read or licensed-read evidence required before connected-interface writes execute'),
  organizationAuthority: CHATGPT_APP_ORGANIZATION_AUTHORITY_VALIDATOR.describe('Organization role and settlement evidence required before ChatGPT App delivery writes execute'),
  payload: z.record(z.any()).default({}).describe('Raw AWS parameters (bucket/key/body, table/item, etc.)')
}).strict();

async function executeUseAwsWriteExternalMcp(args: z.infer<typeof AWS_WRITE_VALIDATOR>) {
  assertConfirmedConnectedInterfaceWrite(args.confirmed);
  const readAccess = assertChatGptAppReadAccess(args.readAccess);

  let result: unknown;
  let guidance: string;
  let targetAnchor = 'aws:unscoped';
  let organizationAuthority!: ChatGptAppOrganizationAuthorityDecision;
  switch (args.request) {
    case 's3.putObject':
      targetAnchor = `aws:s3/${String(args.payload.bucket ?? 'bitcode-demo')}/${String(args.payload.key ?? 'config/demo.json')}`;
      organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
        operation: args.request,
        targetAnchor,
        readAccess
      });
      result = await awsS3PutObjectTool.execute(args.payload as Parameters<typeof awsS3PutObjectTool.execute>[0]);
      guidance = 'Uploaded to S3—confirm the path in follow-up so collaborators can fetch it easily.';
      break;
    case 'dynamo.putItem':
      targetAnchor = `aws:dynamodb/${String(args.payload.table ?? 'bitcode-demo-table')}`;
      organizationAuthority = assertChatGptAppOrganizationAuthority(args.organizationAuthority, {
        operation: args.request,
        targetAnchor,
        readAccess
      });
      result = await awsDynamoPutItemTool.execute(
        args.payload as Parameters<typeof awsDynamoPutItemTool.execute>[0]
      );
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
      evidenceDocument: '.ai/MCPS.md',
      guidance,
      writeAdmission: buildChatGptAppWriteAdmission({
        connectedInterface: 'aws',
        operation: args.request,
        targetAnchor,
        readAccess,
        organizationAuthority
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
    readAccess: CHATGPT_APP_READ_ACCESS_SCHEMA,
    organizationAuthority: CHATGPT_APP_ORGANIZATION_AUTHORITY_SCHEMA,
    payload: {
      type: 'object',
      description: 'Parameters passed through to the AWS MCP tool'
    }
  },
  required: ['request', 'confirmed', 'readAccess', 'organizationAuthority']
};

const CHATGPT_READING_ACTION_NEXT_ACTION: Record<BtdChatGptAppActionId, string> = {
  bitcode_request_read: 'synthesize-read-need',
  bitcode_review_read_need: 'request-finding-fits',
  bitcode_request_finding_fits: 'review-assetpack-preview',
  bitcode_review_asset_pack_preview: 'quote-assetpack-fee',
  bitcode_quote_asset_pack_fee: 'settle-assetpack-fee',
  bitcode_settle_asset_pack: 'deliver-assetpack-after-finality',
  bitcode_deliver_asset_pack: 'delivery-admitted',
};

function buildValidatorFromContract(contract: BtdChatGptAppActionContract): z.ZodTypeAny {
  const schema = contract.inputSchema as {
    properties?: Record<string, { type?: string }>;
    required?: string[];
  };
  const required = new Set(schema.required ?? []);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [field, fieldSchema] of Object.entries(schema.properties ?? {})) {
    let zodField: z.ZodTypeAny;
    if (fieldSchema.type === 'boolean') {
      zodField = z.boolean();
    } else if (fieldSchema.type === 'integer') {
      zodField = z.number().int();
    } else if (fieldSchema.type === 'number') {
      zodField = z.number();
    } else {
      zodField = z.string().min(1, `${field} must be provided`);
    }
    shape[field] = required.has(field) ? zodField : zodField.optional();
  }

  return z.object(shape).strict();
}

function stableChatGptActionRoot(prefix: string, actionId: BtdChatGptAppActionId, payload: unknown): string {
  const hash = createHash('sha256')
    .update(stableChatGptJson({ actionId, payload }))
    .digest('hex')
    .slice(0, 24);
  return `${prefix}:${hash}`;
}

function stableChatGptJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableChatGptJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableChatGptJson(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value) ?? 'undefined';
}

function executeChatGptReadingAction(
  contract: BtdChatGptAppActionContract,
  args: Record<string, unknown>,
): BitcodeToolExecutionResult {
  const requestRoot = stableChatGptActionRoot('chatgpt-action-request', contract.actionId, args);
  const responseFields: Record<string, unknown> = {};

  for (const field of contract.responseRootFields) {
    if (field === 'nextAction') {
      responseFields[field] = CHATGPT_READING_ACTION_NEXT_ACTION[contract.actionId];
    } else if (field === 'candidateCount') {
      responseFields[field] = Number(args.candidateLimit ?? 0);
    } else if (field === 'fitQuality') {
      responseFields[field] = 'source-safe-preview-measurements-only';
    } else if (field === 'btcAmountSats') {
      responseFields[field] = 'deterministic-fee-quote-pending-measurement-finalization';
    } else if (field === 'finalityState') {
      responseFields[field] = args.confirmationState ?? 'pending';
    } else if (field === 'deliveryState') {
      responseFields[field] = 'admitted-after-settlement-and-read-license-proof';
    } else if (field === 'reviewState') {
      responseFields[field] = args.decision ?? 'reviewed';
    } else if (field === 'readinessState') {
      responseFields[field] = 'admitted-for-read-need-comprehension';
    } else if (field.endsWith('Root')) {
      responseFields[field] = args[field] ?? stableChatGptActionRoot(`chatgpt-${field}`, contract.actionId, args);
    } else {
      responseFields[field] = args[field] ?? 'source-safe';
    }
  }

  const sourceSafeResponse = renderBtdChatGptAppSourceSafeResponse({
    actionId: contract.actionId,
    status: 'accepted',
    requestRoot,
    visibleFields: responseFields,
    proofRootProjection: {
      writeAdmission: contract.actionId === 'bitcode_settle_asset_pack' || contract.actionId === 'bitcode_deliver_asset_pack'
        ? 'chatgpt-confirmed-action'
        : 'not-required-for-source-safe-chatgpt-action',
    },
  });

  return {
    result: sourceSafeResponse.visibleFields,
    metadata: {
      actionContract: {
        actionId: contract.actionId,
        flowObject: contract.flowObject,
        contractRoot: contract.contractRoot,
        inputSchemaId: contract.inputSchemaId,
        outputSchemaId: contract.outputSchemaId,
        authPolicyId: contract.authPolicyId,
        sourceSafeRendererId: contract.sourceSafeRendererId,
      },
      sourceSafeResponse,
    },
  };
}

function getChatGptReadingActionTools(): BitcodeTool[] {
  const registry = buildBtdChatGptAppActionContractRegistry();
  return registry.actions.map((contract) => ({
    name: contract.actionId,
    description: contract.description,
    inputSchema: contract.inputSchema,
    validator: buildValidatorFromContract(contract),
    execute: async (args) => executeChatGptReadingAction(contract, args as Record<string, unknown>),
    meta: {
      readOnlyHint: !['bitcode_settle_asset_pack', 'bitcode_deliver_asset_pack'].includes(contract.actionId),
      requiresConfirmation: ['bitcode_settle_asset_pack', 'bitcode_deliver_asset_pack'].includes(contract.actionId),
      categories: ['reading', 'source-safe-action'],
      contractRoot: contract.contractRoot,
      flowObject: contract.flowObject,
      sourceSafeRendererId: contract.sourceSafeRendererId,
      deniedStates: contract.deniedStates.map((state) => ({
        code: state.code,
        readableMessage: state.readableMessage,
        repairAction: state.repairAction,
      })),
    },
  }));
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export function getBitcodeTools(): BitcodeTool[] {
  return [
    ...getChatGptReadingActionTools(),
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
