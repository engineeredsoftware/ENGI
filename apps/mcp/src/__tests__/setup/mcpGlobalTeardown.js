"use strict";
/**
 * MCP Global Test Teardown
 *
 * Global teardown for MCP test suite with cleanup, metrics reporting,
 * and test result analysis.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalTeardown;
exports.globalTeardown = globalTeardown;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Global teardown function executed once after all tests
 */
async function globalTeardown() {
    console.log('🧹 MCP Global Test Teardown Starting...');
    try {
        // 1. Stop performance monitoring
        await stopPerformanceMonitoring();
        // 2. Generate test metrics report
        await generateMetricsReport();
        // 3. Cleanup mock services
        await cleanupMockServices();
        // 4. Generate test summary
        await generateTestSummary();
        // 5. Cleanup temporary files
        await cleanupTemporaryFiles();
        // 6. Final validation
        await validateTeardown();
        console.log('✅ MCP Global Test Teardown Complete');
    }
    catch (error) {
        console.error('❌ MCP Global Test Teardown Failed:', error);
        // Don't exit with error code as tests may have completed successfully
    }
}
/**
 * Stop performance monitoring and collect final metrics
 */
async function stopPerformanceMonitoring() {
    console.log('📊 Stopping performance monitoring...');
    // Stop metrics collection interval
    if (global.metricsInterval) {
        clearInterval(global.metricsInterval);
        global.metricsInterval = null;
    }
    // Finalize metrics
    if (global.testMetrics) {
        global.testMetrics.endTime = Date.now();
        global.testMetrics.totalDuration = global.testMetrics.endTime - global.testMetrics.startTime;
        // Calculate final statistics
        const memUsage = global.testMetrics.performance.memory;
        const cpuUsage = global.testMetrics.performance.cpu;
        if (memUsage.length > 0) {
            global.testMetrics.statistics = {
                memory: {
                    peak: Math.max(...memUsage.map(m => m.heapUsed)),
                    average: memUsage.reduce((sum, m) => sum + m.heapUsed, 0) / memUsage.length,
                    final: memUsage[memUsage.length - 1].heapUsed
                },
                cpu: {
                    totalUser: cpuUsage.reduce((sum, c) => sum + c.user, 0),
                    totalSystem: cpuUsage.reduce((sum, c) => sum + c.system, 0),
                    samples: cpuUsage.length
                },
                tests: {
                    totalTests: global.testMetrics.tests.total,
                    passRate: global.testMetrics.tests.total > 0
                        ? (global.testMetrics.tests.passed / global.testMetrics.tests.total) * 100
                        : 0,
                    errorRate: global.testMetrics.tests.total > 0
                        ? (global.testMetrics.tests.failed / global.testMetrics.tests.total) * 100
                        : 0
                }
            };
        }
    }
    console.log('✅ Performance monitoring stopped');
}
/**
 * Generate comprehensive metrics report
 */
async function generateMetricsReport() {
    console.log('📈 Generating metrics report...');
    if (!global.testMetrics) {
        console.log('⚠️ No metrics data available');
        return;
    }
    const metricsDir = (0, path_1.join)(process.cwd(), 'tmp/test-metrics');
    const reportPath = (0, path_1.join)(metricsDir, 'test-metrics-report.json');
    const report = {
        summary: {
            testSuite: 'Bitcode MCP Server Test Suite',
            executionTime: new Date().toISOString(),
            totalDuration: global.testMetrics.totalDuration,
            totalTests: global.testMetrics.tests.total,
            passedTests: global.testMetrics.tests.passed,
            failedTests: global.testMetrics.tests.failed,
            skippedTests: global.testMetrics.tests.skipped,
            passRate: global.testMetrics.statistics?.tests.passRate || 0,
            errorRate: global.testMetrics.statistics?.tests.errorRate || 0
        },
        performance: {
            memory: {
                peakUsage: global.testMetrics.statistics?.memory.peak || 0,
                averageUsage: global.testMetrics.statistics?.memory.average || 0,
                finalUsage: global.testMetrics.statistics?.memory.final || 0,
                samples: global.testMetrics.performance.memory.length
            },
            cpu: {
                totalUserTime: global.testMetrics.statistics?.cpu.totalUser || 0,
                totalSystemTime: global.testMetrics.statistics?.cpu.totalSystem || 0,
                samples: global.testMetrics.statistics?.cpu.samples || 0
            },
            timeline: {
                memoryUsage: global.testMetrics.performance.memory.slice(-100), // Last 100 samples
                cpuUsage: global.testMetrics.performance.cpu.slice(-100) // Last 100 samples
            }
        },
        errors: global.testMetrics.errors || [],
        thresholds: {
            memory: {
                limit: 2048 * 1024 * 1024, // 2GB
                exceeded: (global.testMetrics.statistics?.memory.peak || 0) > (2048 * 1024 * 1024)
            },
            duration: {
                limit: 600000, // 10 minutes
                exceeded: (global.testMetrics.totalDuration || 0) > 600000
            },
            passRate: {
                minimum: 95, // 95%
                achieved: (global.testMetrics.statistics?.tests.passRate || 0) >= 95
            }
        },
        recommendations: generatePerformanceRecommendations(global.testMetrics)
    };
    (0, fs_1.writeFileSync)(reportPath, JSON.stringify(report, null, 2));
    // Generate human-readable summary
    const summaryPath = (0, path_1.join)(metricsDir, 'test-summary.txt');
    const summaryText = generateTextSummary(report);
    (0, fs_1.writeFileSync)(summaryPath, summaryText);
    console.log('✅ Metrics report generated');
    console.log(`   Report: ${reportPath}`);
    console.log(`   Summary: ${summaryPath}`);
}
/**
 * Generate performance recommendations based on metrics
 */
function generatePerformanceRecommendations(metrics) {
    const recommendations = [];
    if (!metrics.statistics) {
        return ['No performance data available for analysis'];
    }
    // Memory recommendations
    const peakMemoryMB = (metrics.statistics.memory.peak || 0) / (1024 * 1024);
    if (peakMemoryMB > 1024) { // > 1GB
        recommendations.push(`High memory usage detected (${Math.round(peakMemoryMB)}MB peak). Consider optimizing memory-intensive operations.`);
    }
    // Duration recommendations
    const durationMinutes = (metrics.totalDuration || 0) / (1000 * 60);
    if (durationMinutes > 5) {
        recommendations.push(`Long test execution time (${Math.round(durationMinutes)} minutes). Consider parallelizing tests or optimizing slow tests.`);
    }
    // Error rate recommendations
    const errorRate = metrics.statistics.tests.errorRate || 0;
    if (errorRate > 5) {
        recommendations.push(`High error rate (${Math.round(errorRate)}%). Review failing tests and improve test stability.`);
    }
    // Pass rate recommendations
    const passRate = metrics.statistics.tests.passRate || 0;
    if (passRate < 95) {
        recommendations.push(`Low pass rate (${Math.round(passRate)}%). Address failing tests to improve overall test suite reliability.`);
    }
    // CPU recommendations
    const totalCpuMs = ((metrics.statistics.cpu.totalUser || 0) + (metrics.statistics.cpu.totalSystem || 0)) / 1000;
    if (totalCpuMs > 60000) { // > 1 minute of CPU time
        recommendations.push(`High CPU usage (${Math.round(totalCpuMs / 1000)} seconds). Optimize CPU-intensive operations.`);
    }
    if (recommendations.length === 0) {
        recommendations.push('Performance metrics are within acceptable thresholds. Great job!');
    }
    return recommendations;
}
/**
 * Generate human-readable text summary
 */
function generateTextSummary(report) {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('Bitcode MCP Server Test Suite - Final Report');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push('SUMMARY:');
    lines.push(`  Execution Time: ${report.summary.executionTime}`);
    lines.push(`  Total Duration: ${Math.round(report.summary.totalDuration / 1000)} seconds`);
    lines.push(`  Total Tests: ${report.summary.totalTests}`);
    lines.push(`  Passed: ${report.summary.passedTests}`);
    lines.push(`  Failed: ${report.summary.failedTests}`);
    lines.push(`  Skipped: ${report.summary.skippedTests}`);
    lines.push(`  Pass Rate: ${Math.round(report.summary.passRate)}%`);
    lines.push('');
    lines.push('PERFORMANCE:');
    lines.push(`  Peak Memory: ${Math.round(report.performance.memory.peakUsage / 1024 / 1024)}MB`);
    lines.push(`  Average Memory: ${Math.round(report.performance.memory.averageUsage / 1024 / 1024)}MB`);
    lines.push(`  Total CPU Time: ${Math.round((report.performance.cpu.totalUserTime + report.performance.cpu.totalSystemTime) / 1000)}ms`);
    lines.push('');
    lines.push('THRESHOLDS:');
    lines.push(`  Memory Limit: ${report.thresholds.memory.exceeded ? '❌ EXCEEDED' : '✅ OK'}`);
    lines.push(`  Duration Limit: ${report.thresholds.duration.exceeded ? '❌ EXCEEDED' : '✅ OK'}`);
    lines.push(`  Pass Rate Target: ${report.thresholds.passRate.achieved ? '✅ ACHIEVED' : '❌ BELOW TARGET'}`);
    lines.push('');
    if (report.errors && report.errors.length > 0) {
        lines.push('ERRORS:');
        report.errors.slice(0, 5).forEach((error, index) => {
            lines.push(`  ${index + 1}. ${error.message || error}`);
        });
        if (report.errors.length > 5) {
            lines.push(`  ... and ${report.errors.length - 5} more errors`);
        }
        lines.push('');
    }
    lines.push('RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
        lines.push(`  ${index + 1}. ${rec}`);
    });
    lines.push('');
    lines.push('='.repeat(60));
    return lines.join('\n');
}
/**
 * Cleanup mock services
 */
async function cleanupMockServices() {
    console.log('🎭 Cleaning up mock services...');
    // Cleanup mock server
    if (global.mockServer) {
        global.mockServer.routes.clear();
        global.mockServer.responses.clear();
        global.mockServer = null;
    }
    // Clear global test utilities
    if (global.testUtils) {
        global.testUtils = null;
    }
    console.log('✅ Mock services cleaned up');
}
/**
 * Generate final test summary
 */
async function generateTestSummary() {
    console.log('📋 Generating test summary...');
    const summary = {
        testSuite: 'Bitcode MCP Server Test Suite',
        completedAt: new Date().toISOString(),
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        },
        configuration: {
            dryRunMode: process.env.DRY_RUN_MODE === 'true',
            testMode: process.env.MCP_TEST_MODE === 'true',
            logLevel: process.env.LOG_LEVEL,
            timeout: process.env.MCP_TEST_TIMEOUT
        },
        metrics: global.testMetrics ? {
            totalDuration: global.testMetrics.totalDuration,
            totalTests: global.testMetrics.tests.total,
            passRate: global.testMetrics.statistics?.tests.passRate,
            peakMemory: global.testMetrics.statistics?.memory.peak
        } : null
    };
    const summaryPath = (0, path_1.join)(process.cwd(), 'tmp/test-logs/final-summary.json');
    (0, fs_1.writeFileSync)(summaryPath, JSON.stringify(summary, null, 2));
    console.log('✅ Test summary generated');
    console.log(`   Summary: ${summaryPath}`);
}
/**
 * Cleanup temporary files and directories
 */
async function cleanupTemporaryFiles() {
    console.log('🗑️ Cleaning up temporary files...');
    // Keep important files, clean up temporary data
    const cleanupPaths = [
        'tmp/jest-cache-mcp',
        'tmp/test-data'
    ];
    let cleanedCount = 0;
    for (const path of cleanupPaths) {
        const fullPath = (0, path_1.join)(process.cwd(), path);
        if ((0, fs_1.existsSync)(fullPath)) {
            try {
                (0, fs_1.rmSync)(fullPath, { recursive: true, force: true });
                cleanedCount++;
                console.log(`  Removed: ${path}`);
            }
            catch (error) {
                console.warn(`  Warning: Could not remove ${path}:`, error);
            }
        }
    }
    console.log(`✅ Cleaned up ${cleanedCount} temporary directories`);
}
/**
 * Validate teardown completion
 */
async function validateTeardown() {
    console.log('🔍 Validating teardown completion...');
    // Check that important files were preserved
    const preservedPaths = [
        'coverage',
        'tmp/test-metrics',
        'tmp/test-logs'
    ];
    for (const path of preservedPaths) {
        const fullPath = (0, path_1.join)(process.cwd(), path);
        if (!(0, fs_1.existsSync)(fullPath)) {
            console.warn(`⚠️ Warning: Expected directory not found: ${path}`);
        }
        else {
            console.log(`  Preserved: ${path}`);
        }
    }
    // Check memory usage
    const finalMemory = process.memoryUsage();
    console.log(`  Final memory usage: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
    // Check for any remaining intervals or timeouts
    const activeHandles = process._getActiveHandles();
    const activeRequests = process._getActiveRequests();
    if (activeHandles.length > 0) {
        console.warn(`⚠️ Warning: ${activeHandles.length} active handles remaining`);
    }
    if (activeRequests.length > 0) {
        console.warn(`⚠️ Warning: ${activeRequests.length} active requests remaining`);
    }
    console.log('✅ Teardown validation complete');
}
