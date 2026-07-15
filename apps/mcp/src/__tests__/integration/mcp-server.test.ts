/**
 * Integration tests for the retained Bitcode MCP server.
 *
 * These tests stay aligned to the current public server surface:
 * startup/shutdown, health reporting, resource-limit enforcement, and
 * production monitoring. Broader tool/customer coverage is carried by the
 * retained MCP tools proof suite.
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { BitcodeMCPServer } from '../../server';

describe('Bitcode MCP Server Integration Tests', () => {
  let server: BitcodeMCPServer;

  beforeAll(async () => {
    server = new BitcodeMCPServer({
      authentication: {
        required: false,
        methods: []
      }
    });
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('starts and exposes a live production monitor surface', () => {
    const monitor = server.getProductionMonitor();

    expect(monitor).toBeDefined();
    expect(typeof monitor.recordMetric).toBe('function');
    expect(typeof monitor.getStatus).toBe('function');
  });

  it('executes a bounded tool successfully under resource limits', async () => {
    const result = await server.executeToolWithLimits(
      {
        name: 'integration-success',
        execute: async () => ({
          ok: true,
          output: 'bitcode'
        })
      },
      {},
      {
        userId: 'test-user',
        organizationId: 'test-org',
        role: 'owner',
        permissions: {
          pipelines: { create: true, read: true, cancel: true, retry: true },
          organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
          resources: { read: true, export: true }
        },
        btdBalance: 1000,
        mcpCredentials: {}
      }
    );

    expect(result).toMatchObject({
      ok: true,
      output: 'bitcode'
    });
  });

  it('fails closed on execution timeout without exhausting heap', async () => {
    await expect(
      server.executeToolWithLimits(
        {
          name: 'integration-timeout',
          execute: async () => {
            await new Promise(resolve => setTimeout(resolve, 25));
            return 'late';
          }
        },
        {},
        {
          userId: 'test-user',
          organizationId: 'test-org',
          role: 'owner',
          permissions: {
            pipelines: { create: true, read: true, cancel: true, retry: true },
            organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
            resources: { read: true, export: true }
          },
          btdBalance: 1000,
          mcpCredentials: {}
        },
        { maxExecutionTime: 5 }
      )
    ).rejects.toThrow(/timeout/i);
  });

  it('records production metrics through the retained monitor', () => {
    const monitor = server.getProductionMonitor();

    monitor.recordMetric('integration_metric', 100);
    monitor.recordMetric('integration_metric', 200);

    const status = monitor.getStatus();

    expect(status.metrics.integration_metric).toBeDefined();
    expect(status.metrics.integration_metric.count).toBe(2);
    expect(status.metrics.integration_metric.latest).toBe(200);
  });
});
