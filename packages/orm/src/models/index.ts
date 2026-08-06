/**
 * ORM Models Index - V26 Tables Only
 * 
 * This file exports active V26 storage owners for Bitcode identity,
 * execution, AssetPack, activity, and connected-interface evidence.
 */

// Base model
export { BaseModel } from './base';

// User-related models (V26)
export { UserProfilesModel } from './user-profiles';
export { UserConnectionsModel } from './user-connections';
export { UserModelPreferencesModel } from './user-model-preferences';
export { UserBtdBalancesModel } from './user-btd-balances';
export { UserBtdTransactionsModel } from './user-btd-transactions';

// AssetPack and connected-interface models (V26)
export { AssetPackEvidenceModel } from './asset-pack-evidence';
export type { AssetPackEvidenceRecord } from './asset-pack-evidence';
export { PipelineExecutionsModel } from './pipeline-executions';
export { ExecutionEventsModel } from './execution-events';
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
} from './bitcode-execution-storage';

// Pipeline models (V26)
export { PipelineRunsModel } from './pipeline-runs';

// System models (V26)
export { NotificationsModel } from './notifications';
export { MessageAttachmentsModel } from './message-attachments';

// Auxillary and organization support models
export { UsersModel } from './users';
export { OrganizationsModel } from './organizations';
export { OrganizationMembersModel } from './organization-members';
export { UserApiKeysModel } from './user-api-keys';

// Type exports for convenience
export type {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
} from './user-profiles';

export type {
  UserConnection,
  UserConnectionInsert,
  UserConnectionUpdate,
} from './user-connections';

export type {
  UserModelPreference,
  UserModelPreferenceInsert,
  UserModelPreferenceUpdate,
} from './user-model-preferences';

export type {
  UserBtdBalance,
  UserBtdBalanceInsert,
  UserBtdBalanceUpdate,
} from './user-btd-balances';

export type {
  UserBtdTransaction,
  UserBtdTransactionInsert,
  UserBtdTransactionUpdate,
} from './user-btd-transactions';

export type {
  PipelineRun,
  PipelineRunInsert,
  PipelineRunUpdate,
} from './pipeline-runs';

export type {
  PipelineExecution,
  PipelineExecutionInsert,
  PipelineExecutionUpdate,
} from './pipeline-executions';

export type {
  ExecutionEvent,
  ExecutionEventInsert,
} from './execution-events';

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
} from './bitcode-execution-storage';
