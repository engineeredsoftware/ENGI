/**
 * Conversation → Digest → Pipeline Experience Tests
 *
 * These tests validate the concrete pieces that power the end-to-end
 * experience without spinning up live services.  We exercise the rich
 * response factory (rendering), pipeline trigger detection (command parsing),
 * and live update fallbacks so the core UX contract stays trustworthy.
 */

import { describe, it, expect } from '@jest/globals';
import {
  conversationRichResponseFactory,
  ConversationRichResponseEdgeCaseHandler
} from '../../app/conversations/utilities/rich-response-factory';
import type {
  ConversationThreadData,
  PipelineLogsCompactData,
  PipelineLogsDetailedData,
  CodeDiffViewerData,
  ConversationRichResponse
} from '../../types/conversations-rich-response';
import { detectPipelineTriggers } from '@bitcode/conversations';

const baseTimestamp = new Date().toISOString();

describe('E2E: Conversation → Digest → Pipeline Flow (unit-backed)', () => {
  describe('Conversation Initialization', () => {
    it('creates live threads with digest metadata and SSE wiring', () => {
      const threadData: ConversationThreadData = {
        conversationId: 'conv-live',
        title: 'Repo Digest · Authentication',
        participants: [
          { id: 'user-123', name: 'Builder', role: 'user' },
          { id: 'bitcode', name: 'Bitcode', role: 'assistant' }
        ],
        messages: [
          {
            id: 'm1',
            authorId: 'user-123',
            content: 'What changed in auth lately?',
            timestamp: baseTimestamp,
            type: 'text'
          },
          {
            id: 'm2',
            authorId: 'bitcode',
            content: 'Loaded digest with 12 files and 3 pending PRs.',
            timestamp: baseTimestamp,
            type: 'rich_response'
          }
        ],
        status: 'active',
        linkedPipelines: [
          { id: 'pipe-1', type: 'shippable', status: 'running', link: '/pipelines/pipe-1' }
        ],
        context: {
          repo: 'engineeredsoftware/bitcode',
          branch: 'feat/auth-digest',
          tags: ['digest', 'auth']
        }
      };

      const threadResponse = conversationRichResponseFactory.createConversationThread(threadData);

      expect(threadResponse.metadata.title).toBe('Repo Digest · Authentication');
      expect(threadResponse.metadata.description).toContain('messages');
      expect(threadResponse.liveUpdate?.eventSource).toBe('/api/conversations/conv-live/events');
      expect(threadResponse.actions?.map((a) => a.id)).toEqual([
        'open_conversation',
        'branch_conversation',
        'export_thread'
      ]);
    });

    it('disables live updates for archived threads to prevent idle SSE usage', () => {
      const archivedThread = conversationRichResponseFactory.createConversationThread({
        conversationId: 'conv-old',
        title: 'Former Thread',
        participants: [{ id: 'user', name: 'Builder', role: 'user' }],
        messages: [],
        status: 'archived',
        context: {}
      });

      expect(archivedThread.liveUpdate).toBeUndefined();
      expect(archivedThread.metadata.performance.updateFrequency).toBe('static');
    });
  });

  describe('Message Processing & Response Selection', () => {
    const pipelineData: PipelineLogsDetailedData = {
      runId: 'run-digest',
      pipelineType: 'asset-pack',
      status: 'running',
      currentPhase: 'plan',
      progress: { completed: 1, total: 4, percentage: 25 },
      recentLogs: [
        { timestamp: baseTimestamp, level: 'info', message: 'Planning', phase: 'plan', agent: 'planner' }
      ],
      metrics: { duration: 45, tokensUsed: 1200, btdConsumed: 4 },
      fullLogs: [
        {
          id: 'log-1',
          timestamp: baseTimestamp,
          level: 'info',
          message: 'Planning',
          phase: 'plan',
          agent: 'planner'
        }
      ],
      phases: [
        { name: 'plan', status: 'completed', startTime: baseTimestamp, endTime: baseTimestamp, agents: [] },
        { name: 'try', status: 'running', startTime: baseTimestamp, agents: [] }
      ],
      systemMetrics: {
        cpuUsage: [0.1],
        memoryUsage: [0.2],
        diskIO: [0.01],
        networkIO: [0.1]
      }
    };

    it('switches to compact render path on mobile', () => {
      const mobileResponse = conversationRichResponseFactory.selectOptimalResponse(pipelineData, {
        screenSize: 'mobile'
      });

      expect(mobileResponse.metadata.renderMode).toBe('compact');
      expect(mobileResponse.actions?.[0].id).toBe('view_mobile_details');
    });

    it('downgrades interaction level when performance budget is low', () => {
      const lowPerfResponse = conversationRichResponseFactory.selectOptimalResponse(pipelineData, {
        performance: 'low'
      });

      expect(lowPerfResponse.metadata.interactionLevel).toBe('read_only');
      expect(lowPerfResponse.actions).toEqual([]);
    });
  });

  describe('Pipeline Triggering', () => {
    it('detects shippable and evidence_document trigger markers inside responses', () => {
      const response =
        'Starting [PIPELINE_TRIGGER:shippable:Add auth auditing] and ' +
        '[PIPELINE_TRIGGER:evidence_document:Speed up tests] for you.';

      const triggers = detectPipelineTriggers(response);

      expect(triggers).toEqual([
        { type: 'shippable', task: 'Add auth auditing' },
        { type: 'evidence_document', task: 'Speed up tests' }
      ]);
    });

    it('ignores malformed pipeline trigger content', () => {
      const response = 'No triggers here [PIPELINE_TRIGGER:unknown:???] [PIPELINE_TRIGGER:evidence_document]';
      expect(detectPipelineTriggers(response)).toEqual([]);
    });
  });

  describe('SSE Streaming & Live Updates', () => {
    const compactData: PipelineLogsCompactData = {
      runId: 'run-compact',
      pipelineType: 'evidence_document',
      status: 'running',
      currentPhase: 'try',
      progress: { completed: 2, total: 5, percentage: 40 },
      recentLogs: [
        { timestamp: baseTimestamp, level: 'info', message: 'Running try', phase: 'try', agent: 'executor' }
      ],
      metrics: { duration: 60, tokensUsed: 2_400, btdConsumed: 8 }
    };

    it('enables live updates and exposes pause/stop controls mid-run', () => {
      const streaming = conversationRichResponseFactory.createPipelineLogsCompact('run-compact', compactData);

      expect(streaming.liveUpdate?.enabled).toBe(true);
      expect(streaming.liveUpdate?.eventSource).toBe('/api/pipelines/run-compact/events');

      const actionIds = (streaming.actions || []).map((action) => action.id);
      expect(actionIds).toContain('pause_pipeline');
      expect(actionIds).toContain('stop_pipeline');
    });

    it('provides completion actions when pipeline finishes', () => {
      const completed = conversationRichResponseFactory.createPipelineLogsCompact('run-done', {
        ...compactData,
        status: 'completed',
        progress: { completed: 5, total: 5, percentage: 100 }
      });

      expect(completed.liveUpdate).toBeUndefined();
      expect((completed.actions || []).map((a) => a.id)).toContain('view_results');
    });

    it('pauses live updates on network timeout via edge case handler', () => {
      const streaming = conversationRichResponseFactory.createPipelineLogsCompact('run-compact', compactData);
      const afterTimeout = ConversationRichResponseEdgeCaseHandler.handleNetworkTimeout(streaming);

      expect(afterTimeout.liveUpdate?.enabled).toBe(false);
      expect(afterTimeout.metadata.description).toContain('Live updates paused');
      expect((afterTimeout.actions || []).some((a) => a.id === 'reconnect_live_updates')).toBe(true);
    });
  });

  describe('Rich Reply Rendering', () => {
    it('creates diff viewers with actionable metadata', () => {
      const diffData: CodeDiffViewerData = {
        title: 'Auth delta',
        files: [
          {
            path: 'auth/user.ts',
            language: 'typescript',
            newContent: 'export const user = {}',
            changeType: 'modified',
            stats: { additions: 20, deletions: 5, changes: 25 }
          }
        ],
        summary: {
          totalFiles: 1,
          totalAdditions: 20,
          totalDeletions: 5
        },
        context: {
          repo: 'engineeredsoftware/bitcode',
          branch: 'main'
        }
      };

      const diffViewer = conversationRichResponseFactory.createCodeDiffViewer(diffData);

      expect(diffViewer.metadata.description).toContain('+20');
      expect(diffViewer.actions?.map((action) => action.id)).toEqual([
        'view_in_github',
        'apply_changes',
        'download_patch'
      ]);
    });

    it('offers render failure fallbacks that stay actionable', () => {
      const streaming = conversationRichResponseFactory.createPipelineLogsCompact('run-compact', {
        runId: 'run-compact',
        pipelineType: 'evidence_document',
        status: 'running',
        currentPhase: 'try',
        progress: { completed: 1, total: 4, percentage: 25 },
        recentLogs: [
          { timestamp: baseTimestamp, level: 'info', message: 'Planning', phase: 'plan', agent: 'planner' }
        ],
        metrics: { duration: 45, tokensUsed: 1200, btdConsumed: 4 }
      });

      const fallback = ConversationRichResponseEdgeCaseHandler.handleRenderFailure(
        streaming,
        new Error('Renderer crashed')
      );

      expect(fallback.metadata.title).toBe('Render Error');
      expect(fallback.actions?.map((action) => action.id)).toEqual([
        'retry_render',
        'report_issue'
      ]);
    });
  });

  describe('Integration Flow Ordering', () => {
    it('sorts multi responses by priority to keep Jobsian focus', () => {
      const responses: ConversationRichResponse[] = [
        conversationRichResponseFactory.createCodeDiffViewer({
          title: 'Diff',
          files: [
            {
              path: 'file.ts',
              language: 'typescript',
              newContent: 'export {}',
              changeType: 'modified',
              stats: { additions: 1, deletions: 0, changes: 1 }
            }
          ],
          summary: { totalFiles: 1, totalAdditions: 1, totalDeletions: 0 },
          context: { repo: 'engineeredsoftware/bitcode', branch: 'main' }
        }),
        conversationRichResponseFactory.createDataTableInteractive({
          columns: [{ key: 'metric', label: 'Metric', type: 'string', sortable: true }],
          rows: [{ metric: 'duration' }],
          pagination: { page: 1, pageSize: 10, total: 1, hasNext: false, hasPrev: false },
          filters: [],
          sorting: [],
          actions: {}
        }),
        conversationRichResponseFactory.createPipelineLogsCompact('run-compact', {
          runId: 'run-compact',
          pipelineType: 'evidence_document',
          status: 'failed',
          currentPhase: 'refine',
          progress: { completed: 3, total: 4, percentage: 75 },
          recentLogs: [
            { timestamp: baseTimestamp, level: 'error', message: 'Lint step failed', phase: 'refine', agent: 'validator' }
          ],
          metrics: { duration: 120, tokensUsed: 3_000, btdConsumed: 12 }
        })
      ];

      const ordered = conversationRichResponseFactory.createMultiResponse(responses);
      const priorities = ordered.map((response) => response.metadata.priority);

      expect(priorities).toEqual(['high', 'high', 'medium']);
      expect(ordered[0].type).not.toBe('data_table_interactive'); // pipeline/diff first
    });
  });
});
