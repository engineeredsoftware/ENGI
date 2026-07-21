import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SplitGrid from '@/components/conversations/ConversationsSplitGrid/ConversationsSplitGrid';
import FullscreenPortal from '@/components/conversations/ConversationsFullscreenPortal/ConversationsFullscreenPortal';

const meta = {
  title: 'Conversations/Complete System Demo',
  component: SplitGrid,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SplitGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Complete conversation with all features
const completeConversationData = {
  conversation: {
    id: 'conv-complete',
    title: 'Bitcode Transaction Workspace Development',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T12:30:00Z'
  },
  messages: [
    {
      id: 'msg-1',
      role: 'user' as const,
      content: 'I want to build a complete Bitcode transaction workspace with modern stack #mycompany/bitcode-transaction-workspace +requirements.pdf +ui-mockups.figma',
      created_at: '2024-01-15T08:00:00Z',
      tokens: [
        {
          type: 'source' as const,
          value: 'mycompany/bitcode-transaction-workspace',
          metadata: {
            repoSlug: 'mycompany/bitcode-transaction-workspace',
            branch: 'main',
            selectedFiles: ['package.json', 'src/App.js', 'src/components/Layout.js']
          }
        },
        {
          type: 'attachment' as const,
          value: 'requirements.pdf',
          metadata: {
            id: 'att-req',
            name: 'requirements.pdf',
            type: 'file',
            size: 2048000,
            preview: 'Bitcode transaction workspace requirements: auth, wallet settlement, treasury posture, GitHub delivery...'
          }
        },
        {
          type: 'attachment' as const,
          value: 'ui-mockups.figma',
          metadata: {
            id: 'att-figma',
            name: 'ui-mockups.figma',
            type: 'url',
            url: 'https://figma.com/file/123/bitcode-transaction-mockups',
            preview: 'Complete UI/UX mockups for Bitcode transaction workspace'
          }
        }
      ]
    },
    {
      id: 'msg-2',
      role: 'assistant' as const,
      content: "Excellent! I'll help you build a complete Bitcode transaction workspace. Based on your requirements document and UI mockups, I can see you read:\n\n**Core Features:**\n- User authentication and profiles\n- Wallet-gated BTC settlement\n- Issued $BTD treasury posture\n- GitHub-connected delivery flow\n- Read and asset-pack tracking\n- Admin dashboard\n\n**Technology Stack Analysis:**\nFrom your repository, I can see you're using React. I'll enhance it with:\n- Next.js for SSR and API routes\n- TypeScript for type safety\n- Prisma for database management\n- Wallet and GitHub connection flows\n- Tailwind CSS for styling\n\n🚀 **Starting multiple pipelines** to build this comprehensively:",
      created_at: '2024-01-15T08:02:00Z'
    },
    {
      id: 'msg-3',
      role: 'user' as const,
      content: '@shippable User Authentication System @shippable Product Catalog with Search @shippable Shopping Cart & Checkout',
      created_at: '2024-01-15T08:05:00Z',
      tokens: [
        {
          type: 'shippable' as const,
          value: 'User Authentication System',
          metadata: {
            priority: 'high',
            measuredBtdEstimate: 150
          }
        },
        {
          type: 'shippable' as const,
          value: 'Product Catalog with Search',
          metadata: {
            priority: 'high',
            measuredBtdEstimate: 200
          }
        },
        {
          type: 'shippable' as const,
          value: 'Shopping Cart & Checkout',
          metadata: {
            priority: 'medium',
            measuredBtdEstimate: 180
          }
        }
      ]
    },
    {
      id: 'msg-4',
      role: 'assistant' as const,
      content: "Perfect! I've started three parallel shippable pipelines:\n\n✅ **User Authentication System** (Pipeline #1)\n- OAuth integration (Google, GitHub, Apple)\n- JWT token management\n- Role-based access control\n- User profile management\n\n✅ **Read + Asset Pack Catalog** (Pipeline #2) \n- Read CRUD operations\n- Advanced search with filters\n- Data pack grouping\n- Evidence upload and optimization\n\n✅ **Wallet Settlement & Treasury Flow** (Pipeline #3)\n- Wallet state management\n- BTC settlement and issued $BTD flow\n- GitHub-before-transacting gating\n- Notification and receipt workflow\n\nAll pipelines are running with full context from your repository and requirements. You can monitor progress in the sidebar!",
      created_at: '2024-01-15T08:07:00Z'
    },
    {
      id: 'msg-5',
      role: 'user' as const,
      content: 'Great progress! Can you also :runs to show me current status?',
      created_at: '2024-01-15T09:30:00Z',
      tokens: [
        {
          type: 'command' as const,
          value: 'runs',
          metadata: {
            id: 'runs',
            category: 'navigation'
          }
        }
      ]
    },
    {
      id: 'msg-6',
      role: 'assistant' as const,
      content: "📊 **Pipeline Status Report**\n\n**✅ Completed:**\n- **User Authentication System** (del-auth) - Completed in 25 minutes\n  - Created 12 files, 1,240 lines of code\n  - Pull Request: #156 (Ready for review)\n  - Features: OAuth, JWT, RBAC, profiles\n\n**🚀 Active:**\n- **Read + Asset Pack Catalog** (del-catalog) - 75% complete (Implementation phase)\n  - ETA: 10 minutes remaining\n  - Current: Implementing search functionality\n  - Created 8 files so far\n\n- **Wallet Settlement & Treasury Flow** (del-cart) - 45% complete (Discovery phase)\n  - ETA: 20 minutes remaining  \n  - Current: Analyzing wallet settlement and issuance patterns\n  - Processed treasury requirements\n\n**💎 $BTD Used:** 425 of 530 estimated\n**🎯 Success Rate:** 100% (all pipelines on track)",
      created_at: '2024-01-15T09:31:00Z'
    },
    {
      id: 'msg-7',
      role: 'user' as const,
      content: 'Excellent! Now let\'s add some improvements: ^React 18 Migration ^TypeScript Strict Mode',
      created_at: '2024-01-15T10:00:00Z',
      tokens: [
        {
          type: 'upgrade' as const,
          value: 'React 18 Migration',
          metadata: {
            type: 'framework_upgrade',
            measuredBtdEstimate: 100,
            recommendationScore: 90
          }
        },
        {
          type: 'upgrade' as const,
          value: 'TypeScript Strict Mode',
          metadata: {
            type: 'code_improvement',
            measuredBtdEstimate: 120,
            recommendationScore: 85
          }
        }
      ]
    },
    {
      id: 'msg-8',
      role: 'assistant' as const,
      content: "🔄 **Upgrade Pipelines Started**\n\nI've initiated two upgrade pipelines to modernize your codebase:\n\n**⬆️ React 18 Migration** (upg-react18)\n- Upgrading from React 17 to React 18\n- Implementing concurrent features\n- Automatic batching optimizations\n- Updating dependencies and types\n- Testing concurrent rendering\n\n**📊 TypeScript Strict Mode** (upg-typescript)\n- Enabling strict TypeScript configuration\n- Fixing type errors across codebase\n- Adding comprehensive type definitions\n- Improving code quality and safety\n\nThese upgrades will run in parallel with your shippable pipelines and will enhance the entire platform's performance and maintainability!",
      created_at: '2024-01-15T10:02:00Z'
    }
  ],
  isStreaming: false,
  currentContent: '',
  activePipelines: new Set(['del-catalog', 'del-cart', 'upg-react18', 'upg-typescript']),
  completedPipelines: new Set(['del-auth']),
  pipelineEvents: [
    {
      id: 'pipeline-auth',
      type: 'shippable' as const,
      runId: 'del-auth',
      status: 'completed' as const,
      progress: 100,
      phase: 'Complete',
      measuredBtdEstimate: 150,
      measuredBtd: 145,
      startedAt: '2024-01-15T08:07:00Z',
      completedAt: '2024-01-15T08:32:00Z',
      pullRequestUrl: 'https://github.com/mycompany/ecommerce-platform/pull/156',
      events: [
        {
          id: 'evt-auth-complete',
          timestamp: '08:32:00',
          phase: 'Finish',
          message: '✅ User Authentication System completed successfully',
          level: 'success' as const
        },
        {
          id: 'evt-auth-pr',
          timestamp: '08:32:15',
          phase: 'Finish',
          message: '🎉 Pull Request #156: OAuth Authentication System (Ready for review)',
          level: 'success' as const,
          details: {
            pullRequestUrl: 'https://github.com/mycompany/ecommerce-platform/pull/156',
            filesChanged: 12,
            linesAdded: 1240,
            linesRemoved: 35
          }
        }
      ]
    },
    {
      id: 'pipeline-catalog',
      type: 'shippable' as const,
      runId: 'del-catalog',
      status: 'running' as const,
      progress: 75,
      phase: 'Implementation',
      measuredBtdEstimate: 200,
      measuredBtd: 150,
      startedAt: '2024-01-15T08:07:30Z',
      events: [
        {
          id: 'evt-cat-current',
          timestamp: '09:45:00',
          phase: 'Implementation',
          message: '🔍 Implementing advanced product search with Elasticsearch',
          level: 'info' as const,
          isStreaming: true
        }
      ]
    },
    {
      id: 'pipeline-cart',
      type: 'shippable' as const,
      runId: 'del-cart',
      status: 'running' as const,
      progress: 45,
      phase: 'Discovery',
      measuredBtdEstimate: 180,
      measuredBtd: 81,
      startedAt: '2024-01-15T08:07:45Z',
      events: [
        {
          id: 'evt-cart-current',
          timestamp: '09:25:00',
          phase: 'Discovery',
          message: '₿ Analyzing wallet settlement and $BTD issuance patterns',
          level: 'info' as const
        }
      ]
    },
    {
      id: 'pipeline-react18',
      type: 'upgrade' as const,
      runId: 'upg-react18',
      status: 'running' as const,
      progress: 30,
      phase: 'Implementation',
      measuredBtdEstimate: 100,
      measuredBtd: 30,
      startedAt: '2024-01-15T10:02:30Z',
      events: [
        {
          id: 'evt-react-current',
          timestamp: '10:15:00',
          phase: 'Implementation',
          message: '⬆️ Upgrading React components to use concurrent features',
          level: 'info' as const,
          isStreaming: true
        }
      ]
    },
    {
      id: 'pipeline-typescript',
      type: 'upgrade' as const,
      runId: 'upg-typescript',
      status: 'running' as const,
      progress: 20,
      phase: 'Setup',
      measuredBtdEstimate: 120,
      measuredBtd: 24,
      startedAt: '2024-01-15T10:03:00Z',
      events: [
        {
          id: 'evt-ts-current',
          timestamp: '10:10:00',
          phase: 'Setup',
          message: '📊 Configuring strict TypeScript settings',
          level: 'info' as const
        }
      ]
    }
  ]
};

export const CompleteECommerceDemo: Story = {
  args: {
    leftPanel: {
      component: 'ConversationCard',
      props: completeConversationData
    },
    rightPanel: {
      component: 'SidebarLogs',
      props: {
        activePipelines: completeConversationData.activePipelines,
        pipelineEvents: completeConversationData.pipelineEvents,
        onViewFullLog: (runId: string) => console.log('Viewing full log for:', runId),
        onRetryPipeline: (runId: string) => console.log('Retrying pipeline:', runId),
        isCollapsed: false
      }
    },
    isFullscreen: false,
    splitRatio: 70
  }
};

// Fullscreen Experience
export const FullscreenExperience: Story = {
  render: () => (
    <FullscreenPortal isOpen onClose={() => console.log('Closing fullscreen')}>
      <SplitGrid
        leftPanel={{
          component: 'ConversationCard',
          props: completeConversationData
        }}
        rightPanel={{
          component: 'SidebarLogs',
          props: {
            activePipelines: completeConversationData.activePipelines,
            pipelineEvents: completeConversationData.pipelineEvents,
            onViewFullLog: (runId: string) => console.log('Viewing full log for:', runId),
            onRetryPipeline: (runId: string) => console.log('Retrying pipeline:', runId),
            isCollapsed: false
          }
        }}
        isFullscreen={true}
        splitRatio={65}
      />
    </FullscreenPortal>
  )
};

// Mobile-Responsive Experience
export const MobileExperience: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  args: {
    leftPanel: {
      component: 'ConversationCard',
      props: {
        ...completeConversationData,
        isMobile: true
      }
    },
    rightPanel: {
      component: 'SidebarLogs',
      props: {
        activePipelines: completeConversationData.activePipelines,
        pipelineEvents: completeConversationData.pipelineEvents,
        onViewFullLog: (runId: string) => console.log('Viewing full log for:', runId),
        onRetryPipeline: (runId: string) => console.log('Retrying pipeline:', runId),
        isCollapsed: true,
        isMobile: true
      }
    },
    isFullscreen: false,
    splitRatio: 100, // Full width on mobile
    isMobile: true
  }
};

// Performance Stress Test
export const PerformanceStressTest: Story = {
  args: {
    leftPanel: {
      component: 'ConversationCard',
      props: {
        ...completeConversationData,
        messages: [
          ...completeConversationData.messages,
          // Add 50 more messages to test performance
          ...Array.from({ length: 50 }, (_, i) => ({
            id: `stress-msg-${i}`,
            role: (i % 2 === 0 ? 'user' : 'assistant') as const,
            content: `Stress test message ${i + 1}: This is a longer message to test performance with large conversations. It includes multiple sentences and technical details about the implementation process.`,
            created_at: new Date(Date.now() + i * 60000).toISOString(),
            tokens: i % 5 === 0 ? [
              {
                type: 'attachment' as const,
                value: `test-file-${i}.pdf`,
                metadata: { id: `att-stress-${i}` }
              }
            ] : undefined
          }))
        ]
      }
    },
    rightPanel: {
      component: 'SidebarLogs',
      props: {
        activePipelines: new Set(['stress-test-1', 'stress-test-2', 'stress-test-3']),
        pipelineEvents: Array.from({ length: 10 }, (_, i) => ({
          id: `stress-pipeline-${i}`,
          type: 'shippable' as const,
          runId: `stress-test-${i}`,
          status: 'running' as const,
          progress: Math.floor(Math.random() * 100),
          phase: ['Setup', 'Discovery', 'Implementation', 'Validation', 'Finish'][Math.floor(Math.random() * 5)],
          measuredBtdEstimate: 100,
          measuredBtd: Math.floor(Math.random() * 100),
          startedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          events: Array.from({ length: 20 }, (_, j) => ({
            id: `stress-evt-${i}-${j}`,
            timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString().slice(11, 19),
            phase: ['Setup', 'Discovery', 'Implementation'][Math.floor(Math.random() * 3)],
            message: `Stress test event ${j + 1} for pipeline ${i + 1}`,
            level: 'info' as const
          }))
        })),
        onViewFullLog: (runId: string) => console.log('Viewing full log for:', runId),
        onRetryPipeline: (runId: string) => console.log('Retrying pipeline:', runId),
        isCollapsed: false
      }
    },
    isFullscreen: false,
    splitRatio: 70
  }
};

// Real-Time Streaming Demo
export const RealTimeStreamingDemo: Story = {
  args: {
    leftPanel: {
      component: 'ConversationCard',
      props: {
        ...completeConversationData,
        isStreaming: true,
        currentContent: "I'm analyzing your Bitcode transaction workspace requirements and creating a comprehensive implementation plan. This includes:\n\n1. **Database Schema Design**\n   - User tables with authentication\n   - Read and data pack catalog tables\n   - Treasury and settlement tracking\n\n2. **API Architecture**\n   - RESTful endpoints for all operations\n   - Real-time activity updates\n   - Wallet settlement and issued $BTD flow\n\n3. **Frontend Components**\n   - Responsive read and data pack surfaces\n   - Interactive transaction workspace\n   - Wallet and GitHub gating with validation\n\nI'm now implementing these features across multiple parallel pipelines to deliver your complete Bitcode solution efficiently.",
        activePipelines: new Set(['del-streaming'])
      }
    },
    rightPanel: {
      component: 'SidebarLogs',
      props: {
        activePipelines: new Set(['del-streaming']),
        pipelineEvents: [
          {
            id: 'streaming-pipeline',
            type: 'shippable' as const,
            runId: 'del-streaming',
            status: 'running' as const,
            progress: 55,
            phase: 'Implementation',
            measuredBtdEstimate: 250,
            measuredBtd: 138,
            startedAt: '2024-01-15T12:00:00Z',
            events: [
              {
                id: 'stream-evt-current',
                timestamp: '12:25:00',
                phase: 'Implementation',
                message: '🔄 Real-time implementation in progress...',
                level: 'info' as const,
                isStreaming: true
              }
            ]
          }
        ],
        onViewFullLog: (runId: string) => console.log('Viewing full log for:', runId),
        onRetryPipeline: (runId: string) => console.log('Retrying pipeline:', runId),
        isCollapsed: false
      }
    },
    isFullscreen: false,
    splitRatio: 70
  }
};
