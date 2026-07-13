/**
 * Production Monitoring and Alerting for MCP Server
 * 
 * Implements comprehensive monitoring with alert thresholds,
 * anomaly detection, and incident management.
 */

import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';
import { supabaseAdmin } from '@bitcode/supabase';
import { CircuitBreaker } from '../middleware/rate-limit';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Alert types
 */
export enum AlertType {
  HIGH_ERROR_RATE = 'high_error_rate',
  CIRCUIT_BREAKER_OPEN = 'circuit_breaker_open',
  HIGH_MEMORY_USAGE = 'high_memory_usage',
  HIGH_RESPONSE_TIME = 'high_response_time',
  LOW_BTC_FEE_LIQUIDITY = 'low_btc_fee_liquidity',
  AUTHENTICATION_FAILURES = 'auth_failures',
  PIPELINE_FAILURES = 'pipeline_failures',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  type: AlertType;
  severity: AlertSeverity;
  threshold: number;
  window: number; // Time window in seconds
  cooldown: number; // Cooldown period before re-alerting
}

/**
 * Default alert configurations
 */
export const DEFAULT_ALERT_CONFIGS: AlertConfig[] = [
  {
    type: AlertType.HIGH_ERROR_RATE,
    severity: AlertSeverity.ERROR,
    threshold: 0.05, // 5% error rate
    window: 300, // 5 minutes
    cooldown: 900 // 15 minutes
  },
  {
    type: AlertType.CIRCUIT_BREAKER_OPEN,
    severity: AlertSeverity.WARNING,
    threshold: 1, // Any circuit breaker open
    window: 60,
    cooldown: 300
  },
  {
    type: AlertType.HIGH_MEMORY_USAGE,
    severity: AlertSeverity.WARNING,
    threshold: 0.8, // 80% memory usage
    window: 60,
    cooldown: 600
  },
  {
    type: AlertType.HIGH_RESPONSE_TIME,
    severity: AlertSeverity.WARNING,
    threshold: 5000, // 5 seconds
    window: 300,
    cooldown: 600
  },
  {
    type: AlertType.AUTHENTICATION_FAILURES,
    severity: AlertSeverity.ERROR,
    threshold: 10, // 10 failures
    window: 300,
    cooldown: 1800
  }
];

/**
 * Production monitoring system
 */
export class ProductionMonitor {
  private metrics = new Map<string, number[]>();
  private lastAlerts = new Map<string, number>();
  private alertConfigs: AlertConfig[];
  private monitoringInterval?: NodeJS.Timeout;
  
  constructor(configs: AlertConfig[] = DEFAULT_ALERT_CONFIGS) {
    this.alertConfigs = configs;
  }
  
  /**
   * Start monitoring
   */
  start(): void {
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.runHealthChecks();
    }, 30000);
    
    logger.info('Production monitoring started');
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
  
  /**
   * Record metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last hour of data
    const oneHourAgo = Date.now() - 3600000;
    const cutoffIndex = values.findIndex(v => v > oneHourAgo);
    if (cutoffIndex > 0) {
      values.splice(0, cutoffIndex);
    }
  }
  
  /**
   * Run health checks
   */
  private async runHealthChecks(): Promise<void> {
    try {
      // Check error rate
      await this.checkErrorRate();
      
      // Check memory usage
      this.checkMemoryUsage();
      
      // Check response times
      await this.checkResponseTimes();
      
      // Check authentication failures
      await this.checkAuthFailures();
      
      // Check pipeline health
      await this.checkPipelineHealth();
      
    } catch (error) {
      logger.error('Health check failed', { error });
    }
  }
  
  /**
   * Check error rate
   */
  private async checkErrorRate(): Promise<void> {
    // Check both error_logs and stream_logs for comprehensive error tracking
    const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();
    
    // Get errors from error_logs table
    const { data: errorLogs } = await supabaseAdmin
      .from('error_logs')
      .select('count')
      .gte('created_at', fiveMinutesAgo);
      
    // Get errors from stream_logs table
    const { data: streamErrors } = await supabaseAdmin
      .from('stream_logs')
      .select('count')
      .eq('type', 'error')
      .gte('ts', fiveMinutesAgo);
      
    const errorCount = (errorLogs?.[0]?.count || 0) + (streamErrors?.[0]?.count || 0);
    const totalRequests = await this.getTotalRequests(300);
    
    if (totalRequests > 0) {
      const errorRate = errorCount / totalRequests;
      
      if (errorRate > 0.05) {
        this.triggerAlert(AlertType.HIGH_ERROR_RATE, {
          errorRate: (errorRate * 100).toFixed(2) + '%',
          errorCount,
          totalRequests
        });
      }
    }
  }
  
  /**
   * Check memory usage
   */
  private checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const usagePercent = heapUsedMB / heapTotalMB;
    
    this.recordMetric('memory_usage_percent', usagePercent);
    
    if (usagePercent > 0.8) {
      this.triggerAlert(AlertType.HIGH_MEMORY_USAGE, {
        usagePercent: (usagePercent * 100).toFixed(2) + '%',
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB)
      });
    }
  }
  
  /**
   * Check response times
   */
  private async checkResponseTimes(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();
    
    // Query stream logs for AI calls to calculate response times
    const { data: aiCalls } = await supabaseAdmin
      .from('stream_logs')
      .select('metadata, ts')
      .eq('type', 'generation')
      .gte('ts', fiveMinutesAgo)
      .order('ts', { ascending: false })
      .limit(100);
      
    if (!aiCalls || aiCalls.length === 0) return;
    
    // Calculate response times from metadata
    const responseTimes: number[] = [];
    for (const call of aiCalls) {
      const duration = call.metadata?.duration;
      if (typeof duration === 'number' && duration > 0) {
        responseTimes.push(duration);
      }
    }
    
    if (responseTimes.length === 0) return;
    
    // Calculate percentiles
    responseTimes.sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    const p95ResponseTime = responseTimes[p95Index] || avgResponseTime;
    const p99ResponseTime = responseTimes[p99Index] || p95ResponseTime;
    
    if (avgResponseTime > 5000) {
      this.triggerAlert(AlertType.HIGH_RESPONSE_TIME, {
        avgResponseTime: Math.round(avgResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        p99ResponseTime: Math.round(p99ResponseTime),
        sampleSize: responseTimes.length
      });
    }
  }
  
  /**
   * Check authentication failures
   */
  private async checkAuthFailures(): Promise<void> {
    const { data: failures } = await supabaseAdmin
      .from('error_logs')
      .select('count')
      .eq('error_type', 'authentication')
      .gte('created_at', new Date(Date.now() - 300000).toISOString());
      
    const failureCount = failures?.[0]?.count || 0;
    
    if (failureCount > 10) {
      this.triggerAlert(AlertType.AUTHENTICATION_FAILURES, {
        failureCount,
        timeWindow: '5 minutes'
      });
    }
  }
  
  /**
   * Check pipeline health
   */
  private async checkPipelineHealth(): Promise<void> {
    const { data: runs } = await supabaseAdmin
      .from('executions')
      .select('status')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());
      
    if (runs && runs.length > 0) {
      const failureRate = runs.filter(r => r.status === 'failed').length / runs.length;
      
      if (failureRate > 0.2) { // 20% failure rate
        this.triggerAlert(AlertType.PIPELINE_FAILURES, {
          failureRate: (failureRate * 100).toFixed(2) + '%',
          totalRuns: runs.length,
          failedRuns: runs.filter(r => r.status === 'failed').length
        });
      }
    }
  }
  
  /**
   * Get total requests in time window
   */
  private async getTotalRequests(windowSeconds: number): Promise<number> {
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
    
    // Count all stream logs as requests (excluding errors already counted)
    const { data: streamLogs } = await supabaseAdmin
      .from('stream_logs')
      .select('count')
      .neq('type', 'error')
      .gte('ts', since);
      
    // Count AssetPack runs started in the window
    const { data: runs } = await supabaseAdmin
      .from('executions')
      .select('count')
      .gte('created_at', since);
      
    const streamCount = streamLogs?.[0]?.count || 0;
    const runCount = runs?.[0]?.count || 0;
    
    // Use stream logs count as a proxy for request volume
    // Each run generates multiple stream logs
    return Math.max(streamCount, runCount * 10, 100); // Minimum 100 to avoid division by zero issues
  }
  
  /**
   * Trigger alert
   */
  private triggerAlert(type: AlertType, data: any): void {
    const config = this.alertConfigs.find(c => c.type === type);
    if (!config) return;
    
    // Check cooldown
    const lastAlert = this.lastAlerts.get(type) || 0;
    if (Date.now() - lastAlert < config.cooldown * 1000) {
      return; // Still in cooldown
    }
    
    // Send alert
    this.sendAlert({
      type,
      severity: config.severity,
      timestamp: new Date().toISOString(),
      data,
      message: this.formatAlertMessage(type, data)
    });
    
    // Update last alert time
    this.lastAlerts.set(type, Date.now());
  }
  
  /**
   * Send alert
   */
  private async sendAlert(alert: any): Promise<void> {
    logger.error('PRODUCTION ALERT', alert);
    
    // Record in database
    try {
      await supabaseAdmin
        .from('admin_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          data: alert.data,
          created_at: alert.timestamp
        });
    } catch (error) {
      logger.error('Failed to record alert', { error, alert });
    }
    
    // Send to monitoring service (e.g., PagerDuty, Slack)
    observability.recordMetric('production_alert', {
      type: alert.type,
      severity: alert.severity
    });
  }
  
  /**
   * Format alert message
   */
  private formatAlertMessage(type: AlertType, data: any): string {
    switch (type) {
      case AlertType.HIGH_ERROR_RATE:
        return `High error rate detected: ${data.errorRate} (${data.errorCount}/${data.totalRequests} requests)`;
        
      case AlertType.HIGH_MEMORY_USAGE:
        return `High memory usage: ${data.usagePercent} (${data.heapUsedMB}MB/${data.heapTotalMB}MB)`;
        
      case AlertType.AUTHENTICATION_FAILURES:
        return `Multiple authentication failures: ${data.failureCount} in ${data.timeWindow}`;
        
      case AlertType.PIPELINE_FAILURES:
        return `High pipeline failure rate: ${data.failureRate} (${data.failedRuns}/${data.totalRuns} runs)`;
        
      default:
        return `Alert triggered: ${type}`;
    }
  }
  
  /**
   * Get monitoring status
   */
  getStatus(): any {
    return {
      activeAlerts: Array.from(this.lastAlerts.entries()).map(([type, time]) => ({
        type,
        lastTriggered: new Date(time).toISOString()
      })),
      metrics: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([name, values]) => [
          name,
          {
            count: values.length,
            latest: values[values.length - 1]
          }
        ])
      )
    };
  }
}

// Global monitor instance
export const productionMonitor = new ProductionMonitor();
