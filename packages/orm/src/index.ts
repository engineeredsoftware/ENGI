/**
 * Bitcode ORM - V26 Database Access Layer
 * 
 * Provides type-safe database access for V26 schema with:
 * - Type-safe Supabase client wrapper
 * - AssetPack evidence vector storage support (pgvector)
 * - Consistent model patterns
 * - Row Level Security compliance
 * 
 * @doc-package
 * version: v26-1.0.0
 * pattern: type-safe-orm
 * philosophy: "Database as a typed service"
 */

// ==================== CLIENT ====================
export { createClient, createAdminClient } from './client';
export type { BitcodeOrmClient, AdminClient } from './client';

// ==================== V26 MODELS ====================
// Base model for extension
export { BaseModel } from './models/base';

// Core User & Auth models
export { UserProfilesModel } from './models/user-profiles';
export { UserConnectionsModel } from './models/user-connections';
export { UserModelPreferencesModel } from './models/user-model-preferences';
export { UserBtdBalancesModel } from './models/user-btd-balances';
export { UserBtdTransactionsModel } from './models/user-btd-transactions';
export { BtdRegistryModel } from './models/btd-registry';
export type { BtdRegistryInsertResult, BtdRegistryTable } from './models/btd-registry';

// AssetPack and connected-interface models
export { AssetPackEvidenceModel } from './models/asset-pack-evidence';
export type { AssetPackEvidenceRecord } from './models/asset-pack-evidence';
export {
  AssetPackGeneratedAssetsModel,
  AssetPackPhaseExecutionsModel,
  AssetPackRunJobsModel,
  AssetPackStreamLogsModel,
  AssetPackVectorsModel,
  BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY,
  BitcodeActivityEventsModel,
  BitcodeErrorLogsModel,
  BitcodeTokenCostsModel,
} from './models/bitcode-execution-storage';

// Pipeline Execution models
export { PipelineExecutionsModel } from './models/pipeline-executions';
export { ExecutionEventsModel } from './models/execution-events';

// Essential Infrastructure models
export { NotificationsModel } from './models/notifications';
export { MessageAttachmentsModel } from './models/message-attachments';

// VCS Integration models
export { VCSRepositoryModel, getVCSRepositoryModel } from './models/vcs-repositories';
export type { VCSRepository, VCSRepositoryInsert, VCSRepositoryUpdate, VCSRepositoryMetadata } from './models/vcs-repositories';

// ==================== TYPES ====================
export type { 
  Database, 
  Tables, 
  Insertable, 
  Updatable,
  TableName,
  QueryOptions,
  // V26 specific types
  UserProfileWithBtd,
  AssetPackRunComplete,
  VCSRepositoryWithConnection
} from './types/database';

// Re-export V26 table types for convenience
export type UserProfile = Tables<'user_profiles'>;
export type UserConnection = Tables<'user_connections'>;
export type UserModelPreference = Tables<'user_model_preferences'>;
export type UserBtdBalance = Tables<'user_credits'>;
export type UserBtdTransaction = Tables<'user_credit_usages'>;
export type AssetPackEvidence = Tables<'deliverables'>;
export type PipelineExecution = Tables<'executions'>;
export type ExecutionEvent = Tables<'execution_events'>;
export type PipelineRun = Tables<'pipeline_runs'>;
export type Notification = Tables<'notifications'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type MessageAttachment = Tables<'message_attachments'>;
export {
  hydrateBitcodeProfile,
  mergeBitcodeProfileSettings,
  profileHasWalletBinding,
  profileHasVerifiedWalletBinding,
  readBitcodeProfileSettings,
  readBitcodeWalletCapabilityFromProfile,
  readBitcodeWalletBindingFromProfile,
} from './profile-contract';
export type {
  BitcodeProfileSettings,
  BitcodeWalletCapability,
  BitcodeWalletBinding,
  BitcodeWalletBindingStatus,
  HydratedBitcodeProfileFields,
} from './profile-contract';

// Bitcode execution-storage structured tables (V26)
// Structured persistence for AssetPack synthesis and connected-interface evidence.
export type PhaseExecution = Tables<'phase_executions'>;
export type {
  AssetPackGeneratedAsset,
  AssetPackGeneratedAssetInsert,
  AssetPackGeneratedAssetUpdate,
  AssetPackPhaseExecution,
  AssetPackPhaseExecutionInsert,
  AssetPackPhaseExecutionUpdate,
  AssetPackRunJob,
  AssetPackRunJobInsert,
  AssetPackRunJobUpdate,
  AssetPackStreamLog,
  AssetPackStreamLogInsert,
  AssetPackStreamLogUpdate,
  AssetPackVector,
  AssetPackVectorInsert,
  AssetPackVectorUpdate,
  BitcodeActivityEvent,
  BitcodeActivityEventInsert,
  BitcodeActivityEventUpdate,
  BitcodeErrorLog,
  BitcodeErrorLogInsert,
  BitcodeErrorLogUpdate,
  BitcodeTokenCost,
  BitcodeTokenCostInsert,
  BitcodeTokenCostUpdate,
} from './models/bitcode-execution-storage';

// Conversation System models (V26)
export { ConversationsModel } from './models/conversations';
export { MessagesModel } from './models/messages';

// ==================== AUXILLARY AND ORGANIZATION SUPPORT EXPORTS ====================
// These owners back active MCP/auth/organization surfaces under canonical paths.
export { UsersModel } from './models/users';
export { OrganizationsModel } from './models/organizations';
export { OrganizationMembersModel } from './models/organization-members';
export { UserApiKeysModel } from './models/user-api-keys';
export { OrganizationBtdTreasuryModel } from './models/organization-btd-treasury';
export type { OrganizationBtdTreasuryBalance } from './models/organization-btd-treasury';
export { OrganizationBtdUsageModel } from './models/organization-btd-usage';
export type { OrganizationBtdReadLicenseUsage } from './models/organization-btd-usage';

/**
 * Example usage:
 * 
 * // For API routes (user access)
 * const client = createClient(authToken);
 * const assetPackEvidence = await client.assetPackEvidence.list({
 *   filter: { status: 'active' },
 *   limit: 10 
 * });
 * 
 * // For admin/service operations
 * const adminClient = createAdminClient();
 * const run = await adminClient.pipelineExecutions.create({
 *   user_id: userId,
 *   status: 'pending'
 * });
 * 
 * // Vector rows for similar AssetPack evidence
 * const vectors = await client.assetPackVectors.listByAssetPackEvidenceId(assetPackEvidence.id);
 */

import type { Tables } from './types/database';
