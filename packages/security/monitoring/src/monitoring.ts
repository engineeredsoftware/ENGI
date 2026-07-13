/**
 * Security monitoring and alerting for suspicious credential usage patterns
 * 
 * Advanced threat detection and anomaly monitoring for credential-related
 * activities with configurable alerting and automated response capabilities.
 */

import { log } from '@bitcode/logger';
import { 
  auditLog, 
  AuditEventType, 
  ResourceType,
  type AuditContext 
} from '@bitcode/security-audit';

/**
 * Suspicious activity patterns and thresholds
 */
export interface SecurityThresholds {
  readonly maxFailedAttemptsPerHour: number;
  readonly maxCredentialAccessPerHour: number;
  readonly maxIpAddressesPerUser: number;
  readonly maxGeographicLocations: number;
  readonly unusualHoursThreshold: number; // Hours outside 9-17 local time
  readonly rapidRequestThreshold: number; // Requests per minute
  readonly credentialEnumerationThreshold: number;
  readonly bruteForceWindowMs: number;
  readonly anomalyDetectionSensitivity: 'low' | 'medium' | 'high';
}

/**
 * Security alert severity levels
 */
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Security alert types
 */
export enum AlertType {
  BRUTE_FORCE = 'brute_force_attack',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  UNUSUAL_LOCATION = 'unusual_location',
  RAPID_REQUESTS = 'rapid_requests',
  CREDENTIAL_ENUMERATION = 'credential_enumeration',
  MULTIPLE_FAILURES = 'multiple_failures',
  UNUSUAL_HOURS = 'unusual_hours',
  SUSPICIOUS_USER_AGENT = 'suspicious_user_agent',
  IP_REPUTATION = 'ip_reputation',
  CREDENTIAL_EXPOSED = 'credential_exposed',
  ANOMALOUS_BEHAVIOR = 'anomalous_behavior'
}

/**
 * Security alert interface
 */
export interface SecurityAlert {
  readonly id: string;
  readonly type: AlertType;
  readonly severity: AlertSeverity;
  readonly title: string;
  readonly description: string;
  readonly userId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp: Date;
  readonly metadata: Record<string, any>;
  readonly recommended_actions: string[];
  readonly auto_mitigated: boolean;
}

/**
 * Activity pattern for anomaly detection
 */
export interface ActivityPattern {
  readonly userId: string;
  readonly ipAddresses: Set<string>;
  readonly userAgents: Set<string>;
  readonly locations: Set<string>;
  readonly hourlyActivity: Map<number, number>; // Hour of day -> count
  requestFrequency: number[]; // Recent request timestamps
  failedAttempts: number;
  successfulAttempts: number;
  credentialAccess: number;
  lastActivity: Date;
  readonly firstSeen: Date;
}

/**
 * Default security thresholds
 */
const DEFAULT_SECURITY_THRESHOLDS: SecurityThresholds = {
  maxFailedAttemptsPerHour: 10,
  maxCredentialAccessPerHour: 50,
  maxIpAddressesPerUser: 5,
  maxGeographicLocations: 3,
  unusualHoursThreshold: 8, // Outside 9-17 local time
  rapidRequestThreshold: 30, // 30 requests per minute
  credentialEnumerationThreshold: 20,
  bruteForceWindowMs: 60 * 60 * 1000, // 1 hour
  anomalyDetectionSensitivity: 'medium'
};

/**
 * Security monitoring service
 */
export class SecurityMonitoringService {
  private readonly thresholds: SecurityThresholds;
  private readonly activityPatterns = new Map<string, ActivityPattern>();
  private readonly alertHistory = new Map<string, SecurityAlert[]>();
  private readonly suspiciousIPs = new Set<string>();
  
  constructor(customThresholds?: Partial<SecurityThresholds>) {
    this.thresholds = { ...DEFAULT_SECURITY_THRESHOLDS, ...customThresholds };
  }

  /**
   * Monitor credential access attempt
   */
  async monitorCredentialAccess(
    auditContext: AuditContext,
    accessType: 'read' | 'write' | 'create' | 'delete',
    success: boolean,
    metadata: Record<string, any> = {}
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    if (!auditContext.userId || !auditContext.ipAddress) {
      return alerts;
    }

    // Update activity pattern
    const pattern = this.updateActivityPattern(auditContext, success, accessType);
    
    // Check for various suspicious patterns
    alerts.push(...await this.detectBruteForceAttack(pattern, auditContext));
    alerts.push(...await this.detectRapidRequests(pattern, auditContext));
    alerts.push(...await this.detectUnusualLocation(pattern, auditContext));
    alerts.push(...await this.detectUnusualHours(pattern, auditContext));
    alerts.push(...await this.detectCredentialEnumeration(pattern, auditContext));
    alerts.push(...await this.detectAnomalousBehavior(pattern, auditContext));

    // Process and store alerts
    for (const alert of alerts) {
      await this.processSecurityAlert(alert, auditContext);
    }

    return alerts;
  }

  /**
   * Update user activity pattern
   */
  private updateActivityPattern(
    auditContext: AuditContext,
    success: boolean,
    accessType: string
  ): ActivityPattern {
    const userId = auditContext.userId;
    const now = new Date();
    
    let pattern = this.activityPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        ipAddresses: new Set(),
        userAgents: new Set(),
        locations: new Set(),
        hourlyActivity: new Map(),
        requestFrequency: [],
        failedAttempts: 0,
        successfulAttempts: 0,
        credentialAccess: 0,
        lastActivity: now,
        firstSeen: now
      };
    }

    // Update pattern data
    if (auditContext.ipAddress) {
      pattern.ipAddresses.add(auditContext.ipAddress);
    }
    
    if (auditContext.userAgent) {
      pattern.userAgents.add(auditContext.userAgent);
    }

    // Update hourly activity
    const hour = now.getHours();
    const currentHourActivity = pattern.hourlyActivity.get(hour) || 0;
    pattern.hourlyActivity.set(hour, currentHourActivity + 1);

    // Update request frequency (keep last 100 requests)
    pattern.requestFrequency.push(now.getTime());
    if (pattern.requestFrequency.length > 100) {
      pattern.requestFrequency = pattern.requestFrequency.slice(-100);
    }

    // Update counters
    if (success) {
      pattern.successfulAttempts++;
    } else {
      pattern.failedAttempts++;
    }

    if (accessType === 'read' || accessType === 'write') {
      pattern.credentialAccess++;
    }

    pattern.lastActivity = now;
    
    // Store updated pattern
    this.activityPatterns.set(userId, pattern);
    
    return pattern;
  }

  /**
   * Detect brute force attacks
   */
  private async detectBruteForceAttack(
    pattern: ActivityPattern,
    auditContext: AuditContext
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const recentWindow = Date.now() - this.thresholds.bruteForceWindowMs;
    
    // Count recent failed attempts
    const recentFailures = pattern.requestFrequency.filter(
      timestamp => timestamp > recentWindow
    ).length;

    if (pattern.failedAttempts >= this.thresholds.maxFailedAttemptsPerHour && 
        recentFailures >= this.thresholds.maxFailedAttemptsPerHour * 0.8) {
      
      alerts.push({
        id: `brute_force_${pattern.userId}_${Date.now()}`,
        type: AlertType.BRUTE_FORCE,
        severity: AlertSeverity.HIGH,
        title: 'Brute Force Attack Detected',
        description: `User ${pattern.userId} has ${pattern.failedAttempts} failed authentication attempts`,
        userId: pattern.userId,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        timestamp: new Date(),
        metadata: {
          failed_attempts: pattern.failedAttempts,
          recent_failures: recentFailures,
          window_ms: this.thresholds.bruteForceWindowMs,
          unique_ips: pattern.ipAddresses.size,
          unique_user_agents: pattern.userAgents.size
        },
        recommended_actions: [
          'Block IP address temporarily',
          'Require additional authentication factors',
          'Monitor for continued attacks',
          'Check for credential compromise'
        ],
        auto_mitigated: false
      });

      // Add IP to suspicious list
      if (auditContext.ipAddress) {
        this.suspiciousIPs.add(auditContext.ipAddress);
      }
    }

    return alerts;
  }

  /**
   * Detect rapid requests (potential bot activity)
   */
  private async detectRapidRequests(
    pattern: ActivityPattern,
    auditContext: AuditContext
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const oneMinuteAgo = Date.now() - 60 * 1000;
    
    const recentRequests = pattern.requestFrequency.filter(
      timestamp => timestamp > oneMinuteAgo
    ).length;

    if (recentRequests >= this.thresholds.rapidRequestThreshold) {
      alerts.push({
        id: `rapid_requests_${pattern.userId}_${Date.now()}`,
        type: AlertType.RAPID_REQUESTS,
        severity: AlertSeverity.MEDIUM,
        title: 'Rapid Request Pattern Detected',
        description: `${recentRequests} requests in the last minute from user ${pattern.userId}`,
        userId: pattern.userId,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        timestamp: new Date(),
        metadata: {
          requests_per_minute: recentRequests,
          threshold: this.thresholds.rapidRequestThreshold,
          user_agent: auditContext.userAgent,
          possible_bot: this.isPossibleBot(auditContext.userAgent || '')
        },
        recommended_actions: [
          'Implement rate limiting',
          'Verify user agent authenticity',
          'Consider CAPTCHA challenge',
          'Monitor for automation tools'
        ],
        auto_mitigated: false
      });
    }

    return alerts;
  }

  /**
   * Detect unusual geographic locations
   */
  private async detectUnusualLocation(
    pattern: ActivityPattern,
    auditContext: AuditContext
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // This would typically use GeoIP data
    // For now, we'll simulate based on IP address patterns
    if (pattern.ipAddresses.size > this.thresholds.maxIpAddressesPerUser) {
      alerts.push({
        id: `unusual_location_${pattern.userId}_${Date.now()}`,
        type: AlertType.UNUSUAL_LOCATION,
        severity: AlertSeverity.MEDIUM,
        title: 'Multiple Geographic Locations Detected',
        description: `User ${pattern.userId} accessing from ${pattern.ipAddresses.size} different IP addresses`,
        userId: pattern.userId,
        ipAddress: auditContext.ipAddress,
        timestamp: new Date(),
        metadata: {
          unique_ips: pattern.ipAddresses.size,
          threshold: this.thresholds.maxIpAddressesPerUser,
          recent_ips: Array.from(pattern.ipAddresses).slice(-10)
        },
        recommended_actions: [
          'Verify user location',
          'Require additional authentication',
          'Check for account sharing',
          'Monitor for compromised credentials'
        ],
        auto_mitigated: false
      });
    }

    return alerts;
  }

  /**
   * Detect activity during unusual hours
   */
  private async detectUnusualHours(
    pattern: ActivityPattern,
    auditContext: AuditContext
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const currentHour = new Date().getHours();
    
    // Define business hours (9 AM to 5 PM)
    const isBusinessHours = currentHour >= 9 && currentHour <= 17;
    
    if (!isBusinessHours) {
      // Count activity during unusual hours
      const unusualHourActivity = Array.from(pattern.hourlyActivity.entries())
        .filter(([hour]) => hour < 9 || hour > 17)
        .reduce((sum, [, count]) => sum + count, 0);
      
      if (unusualHourActivity >= this.thresholds.unusualHoursThreshold) {
        alerts.push({
          id: `unusual_hours_${pattern.userId}_${Date.now()}`,
          type: AlertType.UNUSUAL_HOURS,
          severity: AlertSeverity.LOW,
          title: 'Activity During Unusual Hours',
          description: `User ${pattern.userId} active during non-business hours`,
          userId: pattern.userId,
          ipAddress: auditContext.ipAddress,
          timestamp: new Date(),
          metadata: {
            current_hour: currentHour,
            unusual_hour_activity: unusualHourActivity,
            threshold: this.thresholds.unusualHoursThreshold,
            hourly_distribution: Object.fromEntries(pattern.hourlyActivity)
          },
          recommended_actions: [
            'Verify user timezone',
            'Check for automated scripts',
            'Monitor for suspicious patterns',
            'Consider business hour restrictions'
          ],
          auto_mitigated: false
        });
      }
    }

    return alerts;
  }

  /**
   * Detect credential enumeration attempts
   */
  private async detectCredentialEnumeration(
    pattern: ActivityPattern,
    auditContext: AuditContext
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Look for patterns that suggest credential enumeration
    const failureRate = pattern.failedAttempts / Math.max(pattern.successfulAttempts + pattern.failedAttempts, 1);
    
    if (pattern.failedAttempts >= this.thresholds.credentialEnumerationThreshold && 
        failureRate > 0.8) {
      
      alerts.push({
        id: `credential_enum_${pattern.userId}_${Date.now()}`,
        type: AlertType.CREDENTIAL_ENUMERATION,
        severity: AlertSeverity.HIGH,
        title: 'Potential Credential Enumeration',
        description: `High failure rate detected for user ${pattern.userId}`,
        userId: pattern.userId,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        timestamp: new Date(),
        metadata: {
          failed_attempts: pattern.failedAttempts,
          successful_attempts: pattern.successfulAttempts,
          failure_rate: failureRate,
          threshold: this.thresholds.credentialEnumerationThreshold
        },
        recommended_actions: [
          'Block enumeration attempts',
          'Implement account lockout',
          'Monitor for credential lists',
          'Check dark web exposure'
        ],
        auto_mitigated: false
      });
    }

    return alerts;
  }

  /**
   * Detect anomalous behavior using pattern analysis
   */
  private async detectAnomalousBehavior(
    pattern: ActivityPattern,
    auditContext: AuditContext
  ): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Calculate behavior scores
    const scores = this.calculateAnomalyScores(pattern);
    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    // Determine threshold based on sensitivity
    let threshold = 0.7; // medium sensitivity
    if (this.thresholds.anomalyDetectionSensitivity === 'low') {
      threshold = 0.8;
    } else if (this.thresholds.anomalyDetectionSensitivity === 'high') {
      threshold = 0.6;
    }

    if (overallScore >= threshold) {
      alerts.push({
        id: `anomaly_${pattern.userId}_${Date.now()}`,
        type: AlertType.ANOMALOUS_BEHAVIOR,
        severity: overallScore >= 0.9 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        title: 'Anomalous Behavior Detected',
        description: `Unusual activity pattern detected for user ${pattern.userId}`,
        userId: pattern.userId,
        ipAddress: auditContext.ipAddress,
        timestamp: new Date(),
        metadata: {
          anomaly_score: overallScore,
          component_scores: scores,
          threshold,
          sensitivity: this.thresholds.anomalyDetectionSensitivity
        },
        recommended_actions: [
          'Review user activity manually',
          'Verify user identity',
          'Check for account compromise',
          'Monitor closely for additional anomalies'
        ],
        auto_mitigated: false
      });
    }

    return alerts;
  }

  /**
   * Calculate anomaly scores for different behavioral aspects
   */
  private calculateAnomalyScores(pattern: ActivityPattern): Record<string, number> {
    const now = Date.now();
    const daysSinceFirstSeen = (now - pattern.firstSeen.getTime()) / (24 * 60 * 60 * 1000);
    
    return {
      // High number of unique IPs relative to account age
      ip_diversity: Math.min(pattern.ipAddresses.size / Math.max(daysSinceFirstSeen, 1), 1),
      
      // High failure rate
      failure_rate: pattern.failedAttempts / Math.max(pattern.successfulAttempts + pattern.failedAttempts, 1),
      
      // Unusual user agent diversity
      user_agent_diversity: Math.min(pattern.userAgents.size / Math.max(daysSinceFirstSeen * 2, 1), 1),
      
      // High credential access rate
      credential_access_rate: Math.min(pattern.credentialAccess / Math.max(daysSinceFirstSeen * 10, 1), 1),
      
      // Request frequency anomaly
      request_frequency_anomaly: Math.min(
        pattern.requestFrequency.filter(t => t > now - 60 * 60 * 1000).length / 
        this.thresholds.maxCredentialAccessPerHour, 1
      )
    };
  }

  /**
   * Check if user agent suggests bot activity
   */
  private isPossibleBot(userAgent: string): boolean {
    const botIndicators = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
      'automated', 'script', 'headless', 'phantom', 'selenium'
    ];
    
    const userAgentLower = userAgent.toLowerCase();
    return botIndicators.some(indicator => userAgentLower.includes(indicator));
  }

  /**
   * Process security alert (store, notify, auto-mitigate)
   */
  private async processSecurityAlert(
    alert: SecurityAlert,
    auditContext: AuditContext
  ): Promise<void> {
    // Store alert in history
    const userAlerts = this.alertHistory.get(alert.userId || 'unknown') || [];
    userAlerts.push(alert);
    this.alertHistory.set(alert.userId || 'unknown', userAlerts);

    // Audit log the alert
    await auditLog(
      AuditEventType.SUSPICIOUS_ACTIVITY,
      ResourceType.USER_SESSION,
      auditContext,
      {
        success: true,
        metadata: {
          alert_id: alert.id,
          alert_type: alert.type,
          alert_severity: alert.severity,
          auto_mitigated: alert.auto_mitigated,
          ...alert.metadata
        }
      }
    );

    // Log security alert
    log('Security alert generated', 'warn', {
      alertId: alert.id,
      alertType: alert.type,
      severity: alert.severity,
      userId: alert.userId,
      ipAddress: alert.ipAddress ? alert.ipAddress.substring(0, 8) + '***' : undefined
    });

    // TODO: Implement notification system
    // await this.sendSecurityNotification(alert);
    
    // TODO: Implement auto-mitigation
    // await this.performAutoMitigation(alert);
  }

  /**
   * Get security alerts for a user
   */
  getAlertsForUser(userId: string, limit = 50): SecurityAlert[] {
    const alerts = this.alertHistory.get(userId) || [];
    return alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get all high-severity alerts
   */
  getHighSeverityAlerts(limit = 100): SecurityAlert[] {
    const allAlerts: SecurityAlert[] = [];
    
    for (const userAlerts of this.alertHistory.values()) {
      allAlerts.push(...userAlerts.filter(alert => 
        alert.severity === AlertSeverity.HIGH || alert.severity === AlertSeverity.CRITICAL
      ));
    }
    
    return allAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Check if IP address is suspicious
   */
  isSuspiciousIP(ipAddress: string): boolean {
    return this.suspiciousIPs.has(ipAddress);
  }

  /**
   * Clear old activity patterns and alerts
   */
  cleanup(retentionDays = 30): void {
    const cutoff = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
    
    // Clean up old activity patterns
    for (const [userId, pattern] of this.activityPatterns.entries()) {
      if (pattern.lastActivity < cutoff) {
        this.activityPatterns.delete(userId);
      }
    }
    
    // Clean up old alerts
    for (const [userId, alerts] of this.alertHistory.entries()) {
      const recentAlerts = alerts.filter(alert => alert.timestamp >= cutoff);
      if (recentAlerts.length === 0) {
        this.alertHistory.delete(userId);
      } else {
        this.alertHistory.set(userId, recentAlerts);
      }
    }
    
    log('Security monitoring cleanup completed', 'info', {
      retention_days: retentionDays,
      active_patterns: this.activityPatterns.size,
      users_with_alerts: this.alertHistory.size
    });
  }
}
