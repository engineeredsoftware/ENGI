// Consolidated MCP definitions formerly under `apps/uapi/lib/mcp/definitions.ts`.

export interface McpConfigField {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}

export interface McpDefinition {
  id: string;
  name: string;
  description?: string;
  configFields: McpConfigField[];
}

type DefinitionMap = Record<string, McpDefinition>;

export const MCP_DEFINITIONS: DefinitionMap = {
  'mcp-supabase': {
    id: 'mcp-supabase',
    name: 'Supabase',
    description: 'Connect to your Supabase project to query or mutate data.',
    configFields: [
      { name: 'url', label: 'Supabase URL', placeholder: 'https://xyzcompany.supabase.co' },
      { name: 'anonKey', label: 'Anon Key', placeholder: 'public-anon-key', type: 'password' },
      { name: 'serviceRoleKey', label: 'Service Role Key', placeholder: 'service-role-key', type: 'password' },
    ],
  },
  'mcp-aws': {
    id: 'mcp-aws',
    name: 'AWS',
    description: 'Invoke AWS SDK operations inside your pipeline runs.',
    configFields: [
      { name: 'accessKeyId', label: 'Access Key ID' },
      { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
      { name: 'region', label: 'Default Region', placeholder: 'us-east-1' },
    ],
  },
  'mcp-vercel': {
    id: 'mcp-vercel',
    name: 'Vercel',
    description: 'Deploy and manage sites with Vercel.',
    configFields: [
      { name: 'token', label: 'Vercel Token', type: 'password' },
      { name: 'team', label: 'Team / Scope', placeholder: 'my-team' },
    ],
  },
} as const;
