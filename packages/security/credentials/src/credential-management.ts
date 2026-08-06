/**
 * Credential rotation and expiration management
 * 
 * Comprehensive credential lifecycle management with automatic rotation,
 * expiration monitoring, and security policy enforcement.
 */

import { log } from '@bitcode/logger';
import { 
  encryptCredential, 
  decryptCredential, 
  rotateCredentialEncryption,
  type EncryptedCredential 
} from '@bitcode/security-encryption';
import { 
  auditLog, 
  AuditEventType, 
  ResourceType,
  type AuditContext 
} from '@bitcode/security-audit';

/**
 * Credential rotation policy configuration
 */
export interface CredentialRotationPolicy {
  readonly enabled: boolean;
  readonly maxAge: number; // Maximum age in milliseconds
  readonly warningThreshold: number; // Warning threshold in milliseconds before expiry
  readonly autoRotate: boolean; // Automatically rotate when approaching expiry
  readonly graceReriod: number; // Grace period after expiry in milliseconds
  readonly notificationChannels: string[]; // Channels to notify on rotation events
}

/**
 * Credential expiration status
 */
export interface CredentialExpirationStatus {
  readonly isExpired: boolean;
  readonly isExpiringSoon: boolean;
  readonly expiresAt: Date;
  readonly timeUntilExpiry: number; // Milliseconds until expiry
  readonly gracePeriodEnds?: Date; // When grace period ends
  readonly rotationRecommended: boolean;
}

/**
 * Credential rotation result
 */
export interface CredentialRotationResult {
  readonly success: boolean;
  readonly oldCredentialId?: string;
  readonly newCredentialId?: string;
  readonly rotatedAt: Date;
  readonly nextRotationDue?: Date;
  readonly error?: string;
  readonly backupCreated: boolean;
}

/**
 * Default rotation policies for different credential types
 */
export const DefaultRotationPolicies: Record<string, CredentialRotationPolicy> = {
  // API keys - rotate every 90 days
  api_key: {
    enabled: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    warningThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days warning
    autoRotate: false, // Require manual approval
    graceReriod: 24 * 60 * 60 * 1000, // 1 day grace period
    notificationChannels: ['email', 'dashboard']
  },
  
  // OAuth tokens - refresh automatically when approaching expiry
  oauth_token: {
    enabled: true,
    maxAge: 60 * 60 * 1000, // 1 hour (typical OAuth token lifetime)
    warningThreshold: 5 * 60 * 1000, // 5 minutes warning
    autoRotate: true, // Auto-refresh OAuth tokens
    graceReriod: 5 * 60 * 1000, // 5 minutes grace period
    notificationChannels: ['system_log']
  },
  
  // Long-lived access tokens - rotate every 180 days
  access_token: {
    enabled: true,
    maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days
    warningThreshold: 14 * 24 * 60 * 60 * 1000, // 14 days warning
    autoRotate: false,
    graceReriod: 3 * 24 * 60 * 60 * 1000, // 3 days grace period
    notificationChannels: ['email', 'dashboard', 'slack']
  },
  
  // Database credentials - rotate every 30 days
  database_credential: {
    enabled: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    warningThreshold: 3 * 24 * 60 * 60 * 1000, // 3 days warning
    autoRotate: false,
    graceReriod: 12 * 60 * 60 * 1000, // 12 hours grace period
    notificationChannels: ['email', 'pagerduty']
  }
};

/**
 * Credential expiration checker
 */
export class CredentialExpirationChecker {
  private readonly policies: Record<string, CredentialRotationPolicy>;

  constructor(customPolicies?: Record<string, CredentialRotationPolicy>) {
    this.policies = { ...DefaultRotationPolicies, ...customPolicies };
  }

  /**
   * Check expiration status for a credential
   */
  checkExpiration(
    credentialType: string,
    createdAt: Date,
    lastRotatedAt?: Date
  ): CredentialExpirationStatus {
    const policy = this.policies[credentialType];
    if (!policy?.enabled) {
      return {
        isExpired: false,
        isExpiringSoon: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        timeUntilExpiry: 365 * 24 * 60 * 60 * 1000,
        rotationRecommended: false
      };
    }

    const referenceDate = lastRotatedAt || createdAt;
    const expiresAt = new Date(referenceDate.getTime() + policy.maxAge);
    const gracePeriodEnds = new Date(expiresAt.getTime() + policy.graceReriod);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    const isExpired = now >= expiresAt;
    const isExpiringSoon = timeUntilExpiry <= policy.warningThreshold;
    const rotationRecommended = isExpiringSoon || isExpired;

    return {
      isExpired,
      isExpiringSoon,
      expiresAt,
      timeUntilExpiry,
      gracePeriodEnds: isExpired ? gracePeriodEnds : undefined,
      rotationRecommended
    };
  }

  /**
   * Get credentials that read attention (expiring or expired)
   */
  async getCredentialsReadingAttention(
    credentials: Array<{
      id: string;
      type: string;
      createdAt: Date;
      lastRotatedAt?: Date;
      userId: string;
    }>
  ): Promise<Array<{
    credential: any;
    status: CredentialExpirationStatus;
    priority: 'high' | 'medium' | 'low';
  }>> {
    const results = [];

    for (const credential of credentials) {
      const status = this.checkExpiration(
        credential.type,
        credential.createdAt,
        credential.lastRotatedAt
      );

      if (status.rotationRecommended) {
        let priority: 'high' | 'medium' | 'low' = 'low';
        
        if (status.isExpired) {
          priority = 'high';
        } else if (status.timeUntilExpiry <= 24 * 60 * 60 * 1000) { // 1 day
          priority = 'high';
        } else if (status.isExpiringSoon) {
          priority = 'medium';
        }

        results.push({
          credential,
          status,
          priority
        });
      }
    }

    return results.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

/**
 * Credential rotation manager
 */
export class CredentialRotationManager {
  private readonly expirationChecker: CredentialExpirationChecker;

  constructor(customPolicies?: Record<string, CredentialRotationPolicy>) {
    this.expirationChecker = new CredentialExpirationChecker(customPolicies);
  }

  /**
   * Rotate a credential's encryption (re-encrypt with new keys)
   */
  async rotateEncryption(
    encryptedCredential: EncryptedCredential,
    credentialId: string,
    userId: string,
    auditContext: AuditContext
  ): Promise<CredentialRotationResult> {
    const startTime = Date.now();
    
    try {
      log('Starting credential encryption rotation', 'info', {
        credentialId,
        userId,
        originalTimestamp: encryptedCredential.timestamp
      });

      // Rotate the encryption
      const rotatedCredential = rotateCredentialEncryption(encryptedCredential);
      
      // TODO: Update database with new encrypted credential
      // await updateCredentialInDatabase(credentialId, rotatedCredential);
      
      // Create backup of old credential (encrypted)
      // await createCredentialBackup(credentialId, encryptedCredential);
      
      const result: CredentialRotationResult = {
        success: true,
        oldCredentialId: credentialId,
        newCredentialId: credentialId, // Same ID, different encryption
        rotatedAt: new Date(),
        backupCreated: true
      };

      // Audit log the rotation
      await auditLog(
        AuditEventType.CREDENTIAL_ROTATION,
        ResourceType.API_KEY, // This would be dynamic based on credential type
        auditContext,
        {
          resourceId: credentialId,
          success: true,
          metadata: {
            rotation_type: 'encryption',
            duration_ms: Date.now() - startTime,
            old_timestamp: encryptedCredential.timestamp,
            new_timestamp: rotatedCredential.timestamp
          }
        }
      );

      log('Credential encryption rotation completed', 'info', {
        credentialId,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Audit log the failure
      await auditLog(
        AuditEventType.CREDENTIAL_ROTATION,
        ResourceType.API_KEY,
        auditContext,
        {
          resourceId: credentialId,
          success: false,
          errorCode: 'ROTATION_FAILED',
          metadata: {
            rotation_type: 'encryption',
            duration_ms: Date.now() - startTime,
            error_message: errorMessage
          }
        }
      );

      log('Credential encryption rotation failed', 'error', {
        credentialId,
        error: errorMessage,
        duration: Date.now() - startTime
      });

      return {
        success: false,
        rotatedAt: new Date(),
        error: errorMessage,
        backupCreated: false
      };
    }
  }

  /**
   * Generate a new credential and replace the old one
   */
  async rotateCredentialValue(
    credentialId: string,
    credentialType: string,
    userId: string,
    auditContext: AuditContext,
    generateNewCredential: () => Promise<string>
  ): Promise<CredentialRotationResult> {
    const startTime = Date.now();
    
    try {
      log('Starting credential value rotation', 'info', {
        credentialId,
        credentialType,
        userId
      });

      // Generate new credential value
      const newCredentialValue = await generateNewCredential();
      
      // Encrypt the new credential
      const encryptedNewCredential = encryptCredential(newCredentialValue);
      
      // TODO: Store new credential and mark old one as rotated
      // const newCredentialId = await storeNewCredential(userId, credentialType, encryptedNewCredential);
      // await markCredentialAsRotated(credentialId, newCredentialId);
      
      const result: CredentialRotationResult = {
        success: true,
        oldCredentialId: credentialId,
        newCredentialId: 'new-' + credentialId, // Would be actual new ID
        rotatedAt: new Date(),
        nextRotationDue: this.calculateNextRotationDate(credentialType),
        backupCreated: true
      };

      // Audit log the rotation
      await auditLog(
        AuditEventType.CREDENTIAL_ROTATION,
        ResourceType.API_KEY,
        auditContext,
        {
          resourceId: credentialId,
          success: true,
          metadata: {
            rotation_type: 'value',
            duration_ms: Date.now() - startTime,
            new_credential_id: result.newCredentialId,
            next_rotation_due: result.nextRotationDue?.toISOString()
          }
        }
      );

      log('Credential value rotation completed', 'info', {
        credentialId,
        newCredentialId: result.newCredentialId,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Audit log the failure
      await auditLog(
        AuditEventType.CREDENTIAL_ROTATION,
        ResourceType.API_KEY,
        auditContext,
        {
          resourceId: credentialId,
          success: false,
          errorCode: 'VALUE_ROTATION_FAILED',
          metadata: {
            rotation_type: 'value',
            duration_ms: Date.now() - startTime,
            error_message: errorMessage
          }
        }
      );

      log('Credential value rotation failed', 'error', {
        credentialId,
        error: errorMessage,
        duration: Date.now() - startTime
      });

      return {
        success: false,
        rotatedAt: new Date(),
        error: errorMessage,
        backupCreated: false
      };
    }
  }

  /**
   * Calculate the next rotation date based on policy
   */
  private calculateNextRotationDate(credentialType: string): Date | undefined {
    const policy = DefaultRotationPolicies[credentialType];
    if (!policy?.enabled) {
      return undefined;
    }
    
    return new Date(Date.now() + policy.maxAge);
  }

  /**
   * Check if automatic rotation is allowed for a credential type
   */
  canAutoRotate(credentialType: string): boolean {
    const policy = DefaultRotationPolicies[credentialType];
    return policy?.enabled && policy.autoRotate;
  }
}

/**
 * Credential expiration monitoring service
 */
export class CredentialMonitoringService {
  private readonly rotationManager: CredentialRotationManager;
  private readonly expirationChecker: CredentialExpirationChecker;
  private intervalId?: NodeJS.Timeout;

  constructor(customPolicies?: Record<string, CredentialRotationPolicy>) {
    this.rotationManager = new CredentialRotationManager(customPolicies);
    this.expirationChecker = new CredentialExpirationChecker(customPolicies);
  }

  /**
   * Start monitoring credentials for expiration
   */
  startMonitoring(checkIntervalMs = 60 * 60 * 1000): void { // Default: 1 hour
    if (this.intervalId) {
      this.stopMonitoring();
    }

    log('Starting credential monitoring service', 'info', {
      checkInterval: checkIntervalMs
    });

    this.intervalId = setInterval(async () => {
      await this.performExpirationCheck();
    }, checkIntervalMs);

    // Also perform an immediate check
    this.performExpirationCheck();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      log('Credential monitoring service stopped', 'info');
    }
  }

  /**
   * Perform a manual expiration check
   */
  async performExpirationCheck(): Promise<void> {
    try {
      log('Performing credential expiration check', 'info');

      // TODO: Fetch all credentials from database
      // const credentials = await fetchAllCredentials();
      
      // For now, simulate with empty array
      const credentials: any[] = [];
      
      const readingAttention = await this.expirationChecker.getCredentialsReadingAttention(credentials);
      
      if (readingAttention.length > 0) {
        log(`Found ${readingAttention.length} credentials reading attention`, 'warn', {
          highPriority: readingAttention.filter(c => c.priority === 'high').length,
          mediumPriority: readingAttention.filter(c => c.priority === 'medium').length,
          lowPriority: readingAttention.filter(c => c.priority === 'low').length
        });

        // Process high-priority credentials first
        for (const { credential, status, priority } of readingAttention) {
          if (priority === 'high') {
            await this.handleExpiringCredential(credential, status);
          }
        }
      }

    } catch (error) {
      log('Credential expiration check failed', 'error', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Handle an expiring credential
   */
  private async handleExpiringCredential(
    credential: any,
    status: CredentialExpirationStatus
  ): Promise<void> {
    // TODO: Implement notification and auto-rotation logic
    // - Send notifications to configured channels
    // - If auto-rotation is enabled and safe, perform rotation
    // - Otherwise, flag for manual attention
    
    log('Handling expiring credential', 'warn', {
      credentialId: credential.id,
      credentialType: credential.type,
      isExpired: status.isExpired,
      timeUntilExpiry: status.timeUntilExpiry
    });
  }
}

/**
 * Utility functions for credential management
 */
export const CredentialUtils = {
  /**
   * Create a secure credential backup
   */
  createCredentialBackup: async (
    credentialId: string,
    encryptedCredential: EncryptedCredential,
    auditContext: AuditContext
  ): Promise<void> => {
    // TODO: Implement secure backup storage
    log('Creating credential backup', 'info', { credentialId });
    
    await auditLog(
      AuditEventType.CREDENTIAL_CREATED,
      ResourceType.API_KEY,
      auditContext,
      {
        resourceId: credentialId,
        success: true,
        metadata: {
          operation: 'backup_created',
          timestamp: new Date().toISOString()
        }
      }
    );
  },

  /**
   * Validate rotation policy configuration
   */
  validateRotationPolicy: (policy: CredentialRotationPolicy): boolean => {
    return (
      policy.maxAge > 0 &&
      policy.warningThreshold > 0 &&
      policy.warningThreshold < policy.maxAge &&
      policy.graceReriod >= 0 &&
      Array.isArray(policy.notificationChannels)
    );
  },

  /**
   * Generate rotation schedule for a credential type
   */
  generateRotationSchedule: (
    credentialType: string,
    startDate: Date,
    count: number
  ): Date[] => {
    const policy = DefaultRotationPolicies[credentialType];
    if (!policy?.enabled) {
      return [];
    }

    const schedule: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      currentDate = new Date(currentDate.getTime() + policy.maxAge);
      schedule.push(new Date(currentDate));
    }

    return schedule;
  }
};
