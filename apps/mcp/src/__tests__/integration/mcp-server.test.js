"use strict";
/**
 * Integration tests for the retained Bitcode MCP server.
 *
 * These tests stay aligned to the current public server surface:
 * startup/shutdown, health reporting, resource-limit enforcement, and
 * production monitoring. Broader tool/customer coverage is carried by the
 * retained MCP tools proof suite.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const server_1 = require("../../server");
(0, globals_1.describe)('Bitcode MCP Server Integration Tests', () => {
    let server;
    (0, globals_1.beforeAll)(async () => {
        server = new server_1.BitcodeMCPServer({
            authentication: {
                required: false,
                methods: []
            }
        });
    });
    (0, globals_1.afterAll)(async () => {
        await server.shutdown();
    });
    (0, globals_1.it)('starts and exposes a live production monitor surface', () => {
        const monitor = server.getProductionMonitor();
        (0, globals_1.expect)(monitor).toBeDefined();
        (0, globals_1.expect)(typeof monitor.recordMetric).toBe('function');
        (0, globals_1.expect)(typeof monitor.getStatus).toBe('function');
    });
    (0, globals_1.it)('executes a bounded tool successfully under resource limits', async () => {
        const result = await server.executeToolWithLimits({
            name: 'integration-success',
            execute: async () => ({
                ok: true,
                output: 'bitcode'
            })
        }, {}, {
            userId: 'test-user',
            organizationId: 'test-org',
            role: 'owner',
            permissions: {
                pipelines: { create: true, read: true, cancel: true, retry: true },
                organization: { manageMembers: true, viewAnalytics: true, manageBtd: true },
                resources: { read: true, export: true }
            },
            btdBalance: 1000,
            mcpCredentials: {}
        });
        (0, globals_1.expect)(result).toMatchObject({
            ok: true,
            output: 'bitcode'
        });
    });
    (0, globals_1.it)('fails closed on execution timeout without exhausting heap', async () => {
        await (0, globals_1.expect)(server.executeToolWithLimits({
            name: 'integration-timeout',
            execute: async () => {
                await new Promise(resolve => setTimeout(resolve, 25));
                return 'late';
            }
        }, {}, {
            userId: 'test-user',
            organizationId: 'test-org',
            role: 'owner',
            permissions: {
                pipelines: { create: true, read: true, cancel: true, retry: true },
                organization: { manageMembers: true, viewAnalytics: true, manageBtd: true },
                resources: { read: true, export: true }
            },
            btdBalance: 1000,
            mcpCredentials: {}
        }, { maxExecutionTime: 5 })).rejects.toThrow(/timeout/i);
    });
    (0, globals_1.it)('records production metrics through the retained monitor', () => {
        const monitor = server.getProductionMonitor();
        monitor.recordMetric('integration_metric', 100);
        monitor.recordMetric('integration_metric', 200);
        const status = monitor.getStatus();
        (0, globals_1.expect)(status.metrics.integration_metric).toBeDefined();
        (0, globals_1.expect)(status.metrics.integration_metric.count).toBe(2);
        (0, globals_1.expect)(status.metrics.integration_metric.latest).toBe(200);
    });
});
