"use strict";
/**
 * Health Check System for MCP Server
 *
 * Provides comprehensive health monitoring for production readiness
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.performHealthCheck = performHealthCheck;
exports.isReady = isReady;
exports.isAlive = isAlive;
exports.createHealthCheckEndpoint = createHealthCheckEndpoint;
exports.createReadinessEndpoint = createReadinessEndpoint;
const logger_1 = require("@bitcode/logger");
const supabase_1 = require("@bitcode/supabase");
const pipeline_stream_1 = require("../streaming/pipeline-stream");
/**
 * Perform comprehensive health check
 */
async function performHealthCheck(circuitBreakers) {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        checks: {
            database: await checkDatabase(),
            authentication: await checkAuthentication(),
            streaming: await checkStreaming(),
            pipelines: await checkPipelines(),
            circuitBreakers: checkCircuitBreakers(circuitBreakers),
            memory: checkMemory(),
            btd: await checkCredits()
        },
        environment: process.env.NODE_ENV,
        serverId: process.env.SERVER_ID
    };
    // Determine overall health status
    const checks = Object.values(healthStatus.checks).filter(check => check && typeof check === 'object' && 'status' in check);
    const hasErrors = checks.some(check => check.status === 'error');
    const hasWarnings = checks.some(check => check.status === 'warning');
    if (hasErrors) {
        healthStatus.status = 'unhealthy';
    }
    else if (hasWarnings) {
        healthStatus.status = 'degraded';
    }
    return healthStatus;
}
/**
 * Check database connectivity
 */
async function checkDatabase() {
    const start = Date.now();
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('health_check')
            .select('id')
            .limit(1);
        if (error) {
            // Try a simpler query
            const { error: fallbackError } = await supabase_1.supabaseAdmin
                .from('api_keys')
                .select('count')
                .limit(1);
            if (fallbackError) {
                return {
                    status: 'error',
                    message: 'Database connection failed',
                    details: { error: fallbackError.message }
                };
            }
        }
        const latency = Date.now() - start;
        return {
            status: latency > 1000 ? 'warning' : 'ok',
            message: 'Database connected',
            latency
        };
    }
    catch (error) {
        return {
            status: 'error',
            message: 'Database check failed',
            details: { error: error instanceof Error ? error.message : error }
        };
    }
}
/**
 * Check authentication service
 */
async function checkAuthentication() {
    try {
        // Check if auth service is reachable
        const { data, error } = await supabase_1.supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1
        });
        if (error) {
            return {
                status: 'error',
                message: 'Authentication service unavailable',
                details: { error: error.message }
            };
        }
        return {
            status: 'ok',
            message: 'Authentication service healthy'
        };
    }
    catch (error) {
        return {
            status: 'error',
            message: 'Authentication check failed',
            details: { error: error instanceof Error ? error.message : error }
        };
    }
}
/**
 * Check streaming service
 */
async function checkStreaming() {
    try {
        const stats = pipeline_stream_1.streamManager.getConnectionStats();
        if (stats.totalConnections > 1000) {
            return {
                status: 'warning',
                message: 'High number of streaming connections',
                details: stats
            };
        }
        return {
            status: 'ok',
            message: 'Streaming service healthy',
            details: stats
        };
    }
    catch (error) {
        return {
            status: 'error',
            message: 'Streaming check failed',
            details: { error: error instanceof Error ? error.message : error }
        };
    }
}
/**
 * Check pipeline execution system
 */
async function checkPipelines() {
    try {
        // Check for stuck pipelines
        const { data: stuckPipelines, error } = await supabase_1.supabaseAdmin
            .from('executions')
            .select('count')
            .eq('status', 'running')
            .lt('created_at', new Date(Date.now() - 3600000).toISOString()); // Running > 1 hour
        if (error) {
            return {
                status: 'error',
                message: 'Pipeline check failed',
                details: { error: error.message }
            };
        }
        const stuckCount = stuckPipelines?.[0]?.count || 0;
        if (stuckCount > 10) {
            return {
                status: 'error',
                message: `${stuckCount} stuck pipelines detected`
            };
        }
        else if (stuckCount > 5) {
            return {
                status: 'warning',
                message: `${stuckCount} potentially stuck pipelines`
            };
        }
        return {
            status: 'ok',
            message: 'Pipeline system healthy'
        };
    }
    catch (error) {
        return {
            status: 'error',
            message: 'Pipeline check failed',
            details: { error: error instanceof Error ? error.message : error }
        };
    }
}
/**
 * Check circuit breakers
 */
function checkCircuitBreakers(circuitBreakers) {
    return Object.entries(circuitBreakers).map(([name, breaker]) => {
        const state = breaker.getState();
        const stats = breaker.getStats();
        return {
            name,
            state,
            failures: stats.failures,
            successRate: stats.successRate
        };
    });
}
async function isReady() {
    const database = await checkDatabase();
    const memory = checkMemory();
    return database.status !== 'error' && memory.status !== 'error';
}
async function isAlive() {
    return checkMemory().status !== 'error';
}
/**
 * Check memory usage
 */
function checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);
    let status = 'ok';
    if (usagePercent > 90) {
        status = 'error';
    }
    else if (usagePercent > 80) {
        status = 'warning';
    }
    return {
        status,
        heapUsedMB,
        heapTotalMB,
        usagePercent,
        rss: Math.round(usage.rss / 1024 / 1024)
    };
}
/**
 * Check BTD holding-read storage carrier
 */
async function checkCredits() {
    try {
        // Check if BTD holding-read storage is functioning
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_credits')
            .select('user_id')
            .limit(1);
        if (error) {
            return {
                status: 'error',
                message: 'BTD holding-read storage unavailable',
                details: { error: error.message }
            };
        }
        return {
            status: 'ok',
            message: 'BTD holding-read storage healthy'
        };
    }
    catch (error) {
        return {
            status: 'error',
            message: 'BTD holding-read check failed',
            details: { error: error instanceof Error ? error.message : error }
        };
    }
}
/**
 * Express health check endpoint handler
 */
function createHealthCheckEndpoint() {
    return async (req, res) => {
        try {
            const health = await performHealthCheck({});
            const statusCode = health.status === 'healthy' ? 200 :
                health.status === 'degraded' ? 200 : 503;
            res.status(statusCode).json(health);
        }
        catch (error) {
            logger_1.logger.error('Health check endpoint error', { error });
            res.status(503).json({
                status: 'unhealthy',
                error: 'Health check failed'
            });
        }
    };
}
/**
 * Express readiness check endpoint handler
 */
function createReadinessEndpoint() {
    return async (req, res) => {
        try {
            // Quick checks for readiness
            const dbCheck = await checkDatabase();
            const memCheck = checkMemory();
            const isReady = dbCheck.status !== 'error' && memCheck.status !== 'error';
            res.status(isReady ? 200 : 503).json({
                ready: isReady,
                database: dbCheck.status,
                memory: memCheck.status
            });
        }
        catch (error) {
            logger_1.logger.error('Readiness check error', { error });
            res.status(503).json({ ready: false });
        }
    };
}
