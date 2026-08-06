/**
 * ORM CLIENT - Database Connection Management
 *
 * Manages database connections with different access levels
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/database';
import { UserProfilesModel } from './models/user-profiles';
import { UserModelPreferencesModel } from './models/user-model-preferences';
import { UserBtdTransactionsModel } from './models/user-btd-transactions';
import { PipelineExecutionsModel } from './models/pipeline-executions';
import { AssetPackEvidenceModel } from './models/asset-pack-evidence';
import { ExecutionEventsModel } from './models/execution-events';
import { PipelineRunsModel } from './models/pipeline-runs';
import { NotificationsModel } from './models/notifications';
import { MessageAttachmentsModel } from './models/message-attachments';
import { UserConnectionsModel } from './models/user-connections';
import { UserBtdBalancesModel } from './models/user-btd-balances';
import { BtdRegistryModel } from './models/btd-registry';
import {
  AssetPackGeneratedAssetsModel,
  AssetPackPhaseExecutionsModel,
  AssetPackRunJobsModel,
  AssetPackStreamLogsModel,
  AssetPackVectorsModel,
  BitcodeActivityEventsModel,
  BitcodeErrorLogsModel,
  BitcodeTokenCostsModel,
} from './models/bitcode-execution-storage';

const allowLocalSupabaseFallback =
  process.env.NODE_ENV !== 'production' ||
  process.env.CI === 'true' ||
  process.env.NEXT_PHASE === 'phase-production-build';

function resolveSupabaseUrl(): string {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    (allowLocalSupabaseFallback ? 'http://localhost:54321' : '');

  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
  }

  return supabaseUrl;
}

function resolveSupabasePublicKey(): string {
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    (allowLocalSupabaseFallback ? 'local-anon-key' : '');

  if (!publicKey) {
    throw new Error(
      'Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_PUBLISHABLE_KEY.',
    );
  }

  return publicKey;
}

function resolveSupabaseAdminKey(): string {
  const adminKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ADMIN_KEY ||
    (allowLocalSupabaseFallback ? 'local-service-role-key' : '');

  if (!adminKey) {
    throw new Error(
      'Missing Supabase admin key. Set SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEY, or SUPABASE_ADMIN_KEY.',
    );
  }

  return adminKey;
}

/**
 * Standard client interface
 */
export interface BitcodeOrmClient {
  userProfiles: UserProfilesModel;
  userModelPreferences: UserModelPreferencesModel;
  userBtdTransactions: UserBtdTransactionsModel;
  pipelineExecutions: PipelineExecutionsModel;
  pipelineRuns: PipelineRunsModel;
  assetPackEvidence: AssetPackEvidenceModel;
  executionEvents: ExecutionEventsModel;
  assetPackVectors: AssetPackVectorsModel;
  assetPackPhaseExecutions: AssetPackPhaseExecutionsModel;
  assetPackRunJobs: AssetPackRunJobsModel;
  assetPackStreamLogs: AssetPackStreamLogsModel;
  assetPackGeneratedAssets: AssetPackGeneratedAssetsModel;
  bitcodeActivityEvents: BitcodeActivityEventsModel;
  bitcodeErrorLogs: BitcodeErrorLogsModel;
  bitcodeTokenCosts: BitcodeTokenCostsModel;
  notifications: NotificationsModel;
  messageAttachments: MessageAttachmentsModel;
  userConnections: UserConnectionsModel;
  userBtdBalances: UserBtdBalancesModel;
  btdRegistry: BtdRegistryModel;
}

/**
 * Admin client with additional capabilities
 */
export interface AdminClient extends BitcodeOrmClient {
  // Admin-only operations are added here when they become Bitcode-owned APIs.
}

/**
 * Create standard client
 */
export function createClient(authToken?: string): BitcodeOrmClient {
  const supabase = createSupabaseClient<Database>(
    resolveSupabaseUrl(),
    resolveSupabasePublicKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      }
    }
  );

  return {
    userProfiles: new UserProfilesModel(supabase),
    userModelPreferences: new UserModelPreferencesModel(supabase),
    userBtdTransactions: new UserBtdTransactionsModel(supabase),
    pipelineExecutions: new PipelineExecutionsModel(supabase),
    pipelineRuns: new PipelineRunsModel(supabase),
    assetPackEvidence: new AssetPackEvidenceModel(supabase),
    executionEvents: new ExecutionEventsModel(supabase),
    assetPackVectors: new AssetPackVectorsModel(supabase),
    assetPackPhaseExecutions: new AssetPackPhaseExecutionsModel(supabase),
    assetPackRunJobs: new AssetPackRunJobsModel(supabase),
    assetPackStreamLogs: new AssetPackStreamLogsModel(supabase),
    assetPackGeneratedAssets: new AssetPackGeneratedAssetsModel(supabase),
    bitcodeActivityEvents: new BitcodeActivityEventsModel(supabase),
    bitcodeErrorLogs: new BitcodeErrorLogsModel(supabase),
    bitcodeTokenCosts: new BitcodeTokenCostsModel(supabase),
    notifications: new NotificationsModel(supabase),
    messageAttachments: new MessageAttachmentsModel(supabase),
    userConnections: new UserConnectionsModel(supabase),
    userBtdBalances: new UserBtdBalancesModel(supabase),
    btdRegistry: new BtdRegistryModel(supabase)
  };
}

/**
 * Create admin client for build-time operations
 */
export function createAdminClient(): AdminClient {
  const supabase = createSupabaseClient<Database>(
    resolveSupabaseUrl(),
    resolveSupabaseAdminKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  const baseClient = {
    userProfiles: new UserProfilesModel(supabase),
    userModelPreferences: new UserModelPreferencesModel(supabase),
    userBtdTransactions: new UserBtdTransactionsModel(supabase),
    pipelineExecutions: new PipelineExecutionsModel(supabase),
    pipelineRuns: new PipelineRunsModel(supabase),
    assetPackEvidence: new AssetPackEvidenceModel(supabase),
    executionEvents: new ExecutionEventsModel(supabase),
    assetPackVectors: new AssetPackVectorsModel(supabase),
    assetPackPhaseExecutions: new AssetPackPhaseExecutionsModel(supabase),
    assetPackRunJobs: new AssetPackRunJobsModel(supabase),
    assetPackStreamLogs: new AssetPackStreamLogsModel(supabase),
    assetPackGeneratedAssets: new AssetPackGeneratedAssetsModel(supabase),
    bitcodeActivityEvents: new BitcodeActivityEventsModel(supabase),
    bitcodeErrorLogs: new BitcodeErrorLogsModel(supabase),
    bitcodeTokenCosts: new BitcodeTokenCostsModel(supabase),
    notifications: new NotificationsModel(supabase),
    messageAttachments: new MessageAttachmentsModel(supabase),
    userConnections: new UserConnectionsModel(supabase),
    userBtdBalances: new UserBtdBalancesModel(supabase),
    btdRegistry: new BtdRegistryModel(supabase)
  };

  return {
    ...baseClient
    // Admin operations stay explicit rather than hidden behind route-local clients.
  };
}
