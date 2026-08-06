import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

interface RefreshOptions {
  input: string;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const packageRoot = path.resolve(__dirname, '..');
  const generatedTarget = path.join(packageRoot, 'src/types/database.generated.ts');
  const ormTarget = path.join(packageRoot, 'src/types/database.ts');
  const inputPath = path.resolve(process.cwd(), options.input);
  const generatedSource = readFileSync(inputPath, 'utf8');

  copyFileSync(inputPath, generatedTarget);
  writeFileSync(ormTarget, insertOrmHelpers(generatedSource), 'utf8');

  console.log(`Refreshed generated types: ${generatedTarget}`);
  console.log(`Refreshed ORM database types: ${ormTarget}`);
}

function parseArgs(args: string[]): RefreshOptions {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === '--') {
      continue;
    }

    if (arg === '--input') {
      return { input: requireValue('--input', next) };
    }

    if (arg.startsWith('--input=')) {
      return { input: requireValue('--input', arg.slice('--input='.length)) };
    }

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  throw new Error('Missing --input <generated-types-file>.');
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function insertOrmHelpers(generatedSource: string): string {
  const sourceWithStorageCompatibility = insertStorageCompatibilityTables(generatedSource);
  const marker = '\nexport type Enums<';
  const markerIndex = sourceWithStorageCompatibility.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('Generated Supabase types did not contain the expected Enums marker.');
  }

  return `${sourceWithStorageCompatibility.slice(0, markerIndex)}${ORM_HELPERS}${sourceWithStorageCompatibility.slice(markerIndex)}`;
}

function insertStorageCompatibilityTables(generatedSource: string): string {
  if (/\n\s+executions:\s+\{/.test(generatedSource)) {
    return generatedSource;
  }

  const marker = '    Tables: {\n';
  const markerIndex = generatedSource.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('Generated Supabase types did not contain the expected public Tables marker.');
  }

  return `${generatedSource.slice(0, markerIndex + marker.length)}${STORAGE_COMPATIBILITY_TABLES}${generatedSource.slice(markerIndex + marker.length)}`;
}

const STORAGE_COMPATIBILITY_TABLES = `      executions: {
        Row: {
          completed_at: string | null
          config: Json | null
          context: Json | null
          created_at: string | null
          deliverable_id: string | null
          duration_ms: number | null
          error: Json | null
          id: string
          input: Json | null
          items: Json | null
          output: Json | null
          pipeline_run_id: string | null
          started_at: string | null
          status: string | null
          total_cost: number | null
          total_tokens: number | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          context?: Json | null
          created_at?: string | null
          deliverable_id?: string | null
          duration_ms?: number | null
          error?: Json | null
          id?: string
          input?: Json | null
          items?: Json | null
          output?: Json | null
          pipeline_run_id?: string | null
          started_at?: string | null
          status?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          context?: Json | null
          created_at?: string | null
          deliverable_id?: string | null
          duration_ms?: number | null
          error?: Json | null
          id?: string
          input?: Json | null
          items?: Json | null
          output?: Json | null
          pipeline_run_id?: string | null
          started_at?: string | null
          status?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      execution_events: {
        Row: {
          agent_name: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          phase: string | null
          run_id: string
        }
        Insert: {
          agent_name?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          phase?: string | null
          run_id: string
        }
        Update: {
          agent_name?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          phase?: string | null
          run_id?: string
        }
        Relationships: []
      }
      phase_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error: Json | null
          id: string
          input: Json | null
          output: Json | null
          phase_name: string
          run_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error?: Json | null
          id?: string
          input?: Json | null
          output?: Json | null
          phase_name: string
          run_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error?: Json | null
          id?: string
          input?: Json | null
          output?: Json | null
          phase_name?: string
          run_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      generated_assets: {
        Row: {
          asset_data: Json | null
          asset_name: string
          asset_type: string
          asset_url: string | null
          created_at: string | null
          id: string
          run_id: string | null
          user_id: string
        }
        Insert: {
          asset_data?: Json | null
          asset_name: string
          asset_type: string
          asset_url?: string | null
          created_at?: string | null
          id?: string
          run_id?: string | null
          user_id: string
        }
        Update: {
          asset_data?: Json | null
          asset_name?: string
          asset_type?: string
          asset_url?: string | null
          created_at?: string | null
          id?: string
          run_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
`;

const ORM_HELPERS = `

export type TableName = keyof DefaultSchema["Tables"];

export type Insertable<T extends TableName> = TablesInsert<T>
export type Updatable<T extends TableName> = TablesUpdate<T>

export interface QueryOptions<T extends TableName = TableName> {
  limit?: number
  offset?: number
  orderBy?: keyof Tables<T>
  ascending?: boolean
}

export type UserProfileWithBtd = Tables<'user_profiles'> & {
  btdBalance?: Tables<'user_credits'> | null
}

export type AssetPackRunComplete = Tables<'pipeline_runs'> & {
  execution?: Tables<'executions'> | null
  events?: Tables<'execution_events'>[]
}

export type VCSRepositoryWithConnection = Tables<'vcs_repositories'> & {
  connection?: Tables<'user_connections'> | null
}
`;

function printHelp() {
  console.log(`
Refresh Bitcode ORM Supabase schema types from a generated Supabase type file.

Usage:
  supabase gen types typescript --project-id <project-ref> --schema public > .tmp/database.types.ts
  pnpm -C packages/orm run schema-types:refresh -- --input ../../.tmp/database.types.ts
`);
}

main();
