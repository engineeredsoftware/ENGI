import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MessageWaterfall from '@/components/conversations/ConversationsMessageWaterfall/ConversationsMessageWaterfall';
import SidebarLogs from '@/components/conversations/ConversationsSidebarLogs/ConversationsSidebarLogs';

const meta = {
  title: 'Conversations/Pipeline Integration',
  component: MessageWaterfall,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageWaterfall>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock pipeline data
const mockSinglePipeline = [
  {
    id: 'pipeline-1',
    type: 'shippable' as const,
    runId: 'del-456',
    status: 'running' as const,
    progress: 65,
    phase: 'Implementation',
    measuredBtdEstimate: 150,
    measuredBtd: 98,
    startedAt: '2024-01-15T10:31:00Z',
    events: [
      {
        id: 'evt-1',
        timestamp: '10:31:00',
        phase: 'Setup',
        message: '🚀 Pipeline started: OAuth authentication system',
        level: 'info' as const
      },
      {
        id: 'evt-2',
        timestamp: '10:31:15',
        phase: 'Setup',
        message: '🔍 Analyzing repository structure and dependencies',
        level: 'info' as const
      },
      {
        id: 'evt-3',
        timestamp: '10:31:30',
        phase: 'Discovery',
        message: '📝 Processing authentication requirements document',
        level: 'info' as const
      },
      {
        id: 'evt-4',
        timestamp: '10:32:00',
        phase: 'Discovery',
        message: '🎨 Analyzing UI mockups for design patterns',
        level: 'info' as const
      },
      {
        id: 'evt-5',
        timestamp: '10:32:15',
        phase: 'Implementation',
        message: '⚡ Generating OAuth provider configurations',
        level: 'info' as const
      },
      {
        id: 'evt-6',
        timestamp: '10:32:30',
        phase: 'Implementation',
        message: '🔐 Implementing JWT token management service',
        level: 'info' as const,
        details: {
          filesCreated: ['src/services/auth.js', 'src/utils/jwt.js'],
          linesAdded: 245
        }
      },
      {
        id: 'evt-7',
        timestamp: '10:32:45',
        phase: 'Implementation',
        message: '👥 Creating role-based access control middleware',
        level: 'info' as const,
        details: {
          filesModified: ['src/middleware/auth.js'],
          linesAdded: 89,
          linesRemoved: 12
        }
      }
    ]
  }
];

const mockMultiplePipelines = [
  {
    id: 'pipeline-1',
    type: 'shippable' as const,
    runId: 'del-789',
    status: 'running' as const,
    progress: 30,
    phase: 'Discovery',
    measuredBtdEstimate: 200,
    measuredBtd: 60,
    startedAt: '2024-01-15T09:00:00Z',
    events: [
      {
        id: 'evt-d1',
        timestamp: '09:00:15',
        phase: 'Setup',
        message: '🚀 Starting dashboard creation pipeline',
        level: 'info' as const
      },
      {
        id: 'evt-d2',
        timestamp: '09:00:30',
        phase: 'Setup',
        message: '🔍 Analyzing project structure for dashboard integration',
        level: 'info' as const
      },
      {
        id: 'evt-d3',
        timestamp: '09:01:00',
        phase: 'Discovery',
        message: '📊 Designing responsive dashboard layout',
        level: 'info' as const
      },
      {
        id: 'evt-d4',
        timestamp: '09:01:30',
        phase: 'Discovery',
        message: '📈 Planning analytics widget architecture',
        level: 'info' as const
      }
    ]
  },
  {
    id: 'pipeline-2',
    type: 'upgrade' as const,
    runId: 'upg-123',
    status: 'running' as const,
    progress: 75,
    phase: 'Implementation',
    measuredBtdEstimate: 100,
    measuredBtd: 75,
    startedAt: '2024-01-15T09:05:00Z',
    events: [
      {
        id: 'evt-u1',
        timestamp: '09:05:00',
        phase: 'Setup',
        message: '🔄 TypeScript migration pipeline started',
        level: 'info' as const
      },
      {
        id: 'evt-u2',
        timestamp: '09:10:00',
        phase: 'Implementation',
        message: '📝 Converting JavaScript files to TypeScript',
        level: 'info' as const,
        details: {
          filesConverted: 15,
          totalFiles: 20
        }
      },
      {
        id: 'evt-u3',
        timestamp: '09:15:00',
        phase: 'Implementation',
        message: '🔧 Adding comprehensive type definitions',
        level: 'info' as const
      },
      {
        id: 'evt-u4',
        timestamp: '09:20:00',
        phase: 'Validation',
        message: '✅ TypeScript compilation successful',
        level: 'success' as const
      }
    ]
  },
  {
    id: 'pipeline-3',
    type: 'shippable' as const,
    runId: 'del-456',
    status: 'completed' as const,
    progress: 100,
    phase: 'Complete',
    measuredBtdEstimate: 150,
    measuredBtd: 145,
    startedAt: '2024-01-15T08:00:00Z',
    completedAt: '2024-01-15T08:30:00Z',
    pullRequestUrl: 'https://github.com/mycompany/myapp/pull/123',
    events: [
      {
        id: 'evt-c1',
        timestamp: '08:30:00',
        phase: 'Finish',
        message: '✅ Authentication system implementation completed',
        level: 'success' as const
      },
      {
        id: 'evt-c2',
        timestamp: '08:30:15',
        phase: 'Finish',
        message: '🎉 Pull request created: OAuth Authentication System (#123)',
        level: 'success' as const,
        details: {
          pullRequestUrl: 'https://github.com/mycompany/myapp/pull/123',
          filesChanged: 8,
          linesAdded: 456,
          linesRemoved: 23
        }
      }
    ]
  }
];

const mockFailedPipeline = [
  {
    id: 'pipeline-error',
    type: 'shippable' as const,
    runId: 'del-error',
    status: 'failed' as const,
    progress: 45,
    phase: 'Implementation',
    measuredBtdEstimate: 180,
    measuredBtd: 81,
    startedAt: '2024-01-15T11:00:00Z',
    failedAt: '2024-01-15T11:15:00Z',
    error: {
      message: 'Insufficient repository permissions',
      code: 'GITHUB_PERMISSIONS_ERROR',
      details: {
        missingPermissions: ['contents:write', 'pull_requests:write'],
        repositoryUrl: 'https://github.com/mycompany/restricted-repo'
      }
    },
    events: [
      {
        id: 'evt-e1',
        timestamp: '11:00:00',
        phase: 'Setup',
        message: '🚀 Starting API documentation generation',
        level: 'info' as const
      },
      {
        id: 'evt-e2',
        timestamp: '11:05:00',
        phase: 'Discovery',
        message: '📖 Analyzing API endpoints and schemas',
        level: 'info' as const
      },
      {
        id: 'evt-e3',
        timestamp: '11:10:00',
        phase: 'Implementation',
        message: '📝 Generating OpenAPI documentation',
        level: 'info' as const
      },
      {
        id: 'evt-e4',
        timestamp: '11:15:00',
        phase: 'Implementation',
        message: '❌ Failed to create pull request: Insufficient repository permissions',
        level: 'error' as const,
        error: {
          message: 'Insufficient repository permissions',
          code: 'GITHUB_PERMISSIONS_ERROR',
          details: {
            missingPermissions: ['contents:write', 'pull_requests:write']
          }
        }
      }
    ]
  }
];

export const SingleActivePipeline: Story = {
  args: {
    pipelines: mockSinglePipeline,
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId)
  }
};

export const MultiplePipelines: Story = {
  args: {
    pipelines: mockMultiplePipelines,
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId)
  }
};

export const FailedPipeline: Story = {
  args: {
    pipelines: mockFailedPipeline,
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId)
  }
};

export const EmptyPipelineState: Story = {
  args: {
    pipelines: [],
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId)
  }
};

// Sidebar Logs Stories
const SidebarLogsMeta = {
  title: 'Conversations/Pipeline Integration/Sidebar Logs',
  component: SidebarLogs,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarLogs>;

export const SidebarLogsActive: StoryObj<typeof SidebarLogs> = {
  args: {
    activePipelines: new Set(['del-456', 'upg-123']),
    pipelineEvents: mockMultiplePipelines,
    onViewFullLog: (runId) => console.log('Viewing full log for:', runId),
    onRetryPipeline: (runId) => console.log('Retrying pipeline:', runId),
    isCollapsed: false
  }
};

export const SidebarLogsCollapsed: StoryObj<typeof SidebarLogs> = {
  args: {
    activePipelines: new Set(['del-456']),
    pipelineEvents: mockSinglePipeline,
    onViewFullLog: (runId) => console.log('Viewing full log for:', runId),
    onRetryPipeline: (runId) => console.log('Retrying pipeline:', runId),
    isCollapsed: true
  }
};

export const SidebarLogsWithError: StoryObj<typeof SidebarLogs> = {
  args: {
    activePipelines: new Set(),
    pipelineEvents: mockFailedPipeline,
    onViewFullLog: (runId) => console.log('Viewing full log for:', runId),
    onRetryPipeline: (runId) => console.log('Retrying pipeline:', runId),
    isCollapsed: false
  }
};

export const SidebarLogsEmpty: StoryObj<typeof SidebarLogs> = {
  args: {
    activePipelines: new Set(),
    pipelineEvents: [],
    onViewFullLog: (runId) => console.log('Viewing full log for:', runId),
    onRetryPipeline: (runId) => console.log('Retrying pipeline:', runId),
    isCollapsed: false
  }
};

// Performance and Edge Cases
export const HighVolumeStreaming: Story = {
  args: {
    pipelines: [
      {
        id: 'pipeline-volume',
        type: 'shippable' as const,
        runId: 'del-volume',
        status: 'running' as const,
        progress: 85,
        phase: 'Implementation',
        measuredBtdEstimate: 300,
        measuredBtd: 255,
        startedAt: '2024-01-15T12:00:00Z',
        events: Array.from({ length: 50 }, (_, i) => ({
          id: `evt-volume-${i}`,
          timestamp: `12:${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
          phase: i < 10 ? 'Setup' : i < 20 ? 'Discovery' : i < 40 ? 'Implementation' : 'Validation',
          message: `Processing step ${i + 1}: ${[
            'Analyzing codebase structure',
            'Installing dependencies',
            'Generating boilerplate code',
            'Running tests and validation',
            'Optimizing performance'
          ][i % 5]}`,
          level: 'info' as const,
          details: i % 10 === 9 ? {
            filesProcessed: Math.floor(Math.random() * 10) + 1,
            linesAdded: Math.floor(Math.random() * 100) + 50
          } : undefined
        }))
      }
    ],
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId)
  }
};

export const RealTimeUpdates: Story = {
  args: {
    pipelines: [
      {
        id: 'pipeline-realtime',
        type: 'upgrade' as const,
        runId: 'upg-realtime',
        status: 'running' as const,
        progress: 42,
        phase: 'Implementation',
        measuredBtdEstimate: 120,
        measuredBtd: 50,
        startedAt: '2024-01-15T13:00:00Z',
        events: [
          {
            id: 'evt-rt1',
            timestamp: '13:00:00',
            phase: 'Setup',
            message: '🔄 Real-time dependency upgrade started',
            level: 'info' as const
          },
          {
            id: 'evt-rt2',
            timestamp: '13:01:00',
            phase: 'Discovery',
            message: '📦 Analyzing package dependencies and conflicts',
            level: 'info' as const
          },
          {
            id: 'evt-rt3',
            timestamp: '13:02:00',
            phase: 'Implementation',
            message: '⬆️ Upgrading React from 17.0.2 to 18.2.0',
            level: 'info' as const,
            isStreaming: true
          }
        ]
      }
    ],
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId),
    isLiveStreaming: true
  }
};

export const PipelineRecovery: Story = {
  args: {
    pipelines: [
      {
        id: 'pipeline-recovery',
        type: 'shippable' as const,
        runId: 'del-recovery',
        status: 'running' as const,
        progress: 65,
        phase: 'Implementation',
        measuredBtdEstimate: 150,
        measuredBtd: 98,
        startedAt: '2024-01-15T14:00:00Z',
        retryCount: 2,
        events: [
          {
            id: 'evt-r1',
            timestamp: '14:00:00',
            phase: 'Setup',
            message: '🚀 Starting payment integration implementation',
            level: 'info' as const
          },
          {
            id: 'evt-r2',
            timestamp: '14:05:00',
            phase: 'Implementation',
            message: '⚠️ Warning: API rate limit approaching',
            level: 'warning' as const
          },
          {
            id: 'evt-r3',
            timestamp: '14:06:00',
            phase: 'Implementation',
            message: '⏸️ Pipeline paused due to rate limiting',
            level: 'warning' as const
          },
          {
            id: 'evt-r4',
            timestamp: '14:07:00',
            phase: 'Implementation',
            message: '🔄 Pipeline resumed - implementing wallet settlement and treasury receipt flow',
            level: 'info' as const
          },
          {
            id: 'evt-r5',
            timestamp: '14:10:00',
            phase: 'Implementation',
            message: '₿ Wallet settlement endpoints and $BTD issuance receipts created successfully',
            level: 'success' as const
          }
        ]
      }
    ],
    onRetry: (runId) => console.log('Retrying pipeline:', runId),
    onCancel: (runId) => console.log('Cancelling pipeline:', runId),
    onViewDetails: (runId) => console.log('Viewing details for:', runId),
    showRecoveryActions: true
  }
};
