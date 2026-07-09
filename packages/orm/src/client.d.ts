/**
 * ORM CLIENT - Database Connection Management
 *
 * Manages database connections with different access levels
 */
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
import { AssetPackGeneratedAssetsModel, AssetPackPhaseExecutionsModel, AssetPackRunJobsModel, AssetPackStreamLogsModel, AssetPackVectorsModel, BitcodeActivityEventsModel, BitcodeErrorLogsModel, BitcodeTokenCostsModel } from './models/bitcode-execution-storage';
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
}
/**
 * Create standard client
 */
export declare function createClient(authToken?: string): BitcodeOrmClient;
/**
 * Create admin client for build-time operations
 */
export declare function createAdminClient(): AdminClient;
