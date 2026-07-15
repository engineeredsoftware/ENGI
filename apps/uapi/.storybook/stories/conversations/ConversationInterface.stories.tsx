import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ConversationCard from '@/components/conversations/ConversationsCard/ConversationsCard';
import MessageWaterfall from '@/components/conversations/ConversationsMessageWaterfall/ConversationsMessageWaterfall';
import EnhancedRichTextInput from '@/components/conversations/ConversationsEnhancedRichTextInput/ConversationsEnhancedRichTextInput';

const meta = {
  title: 'Conversations/Conversation Interface',
  component: ConversationCard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock conversation data
const mockMessages = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: 'I want to add authentication to my React app #mycompany/myapp +auth-spec.pdf',
    created_at: '2024-01-15T10:30:00Z',
    tokens: [
      {
        type: 'source' as const,
        value: 'mycompany/myapp',
        metadata: {
          repoSlug: 'mycompany/myapp',
          branch: 'main',
          selectedFiles: ['src/App.js', 'src/components/Login.js']
        }
      },
      {
        type: 'attachment' as const,
        value: 'auth-spec.pdf',
        metadata: {
          id: 'att-123',
          name: 'auth-spec.pdf',
          type: 'file',
          size: 245760,
          preview: 'OAuth 2.0 authentication requirements...'
        }
      }
    ]
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: "I'll help you implement OAuth authentication for your React app. Based on your source code and specification document, I can see you read:\n\n1. **OAuth Integration** - Google, GitHub, and Apple ID sign-in\n2. **JWT Token Management** - Secure token handling with proper expiry\n3. **Role-Based Access Control** - User roles and permission matrix\n4. **Route Protection** - Secure routing based on user roles\n\nI'm starting a shippable pipeline to implement this complete authentication system.",
    created_at: '2024-01-15T10:31:00Z',
    shippable_id: 'del-456'
  },
  {
    id: 'msg-3',
    role: 'user' as const,
    content: 'Also consider these UI mockups +login-mockup.png +dashboard-mockup.png',
    created_at: '2024-01-15T10:32:00Z',
    tokens: [
      {
        type: 'attachment' as const,
        value: 'login-mockup.png',
        metadata: {
          id: 'att-890',
          name: 'login-mockup.png',
          type: 'file',
          mimeType: 'image/png',
          size: 245760,
          preview: 'Image: login-mockup.png (245 KB)'
        }
      },
      {
        type: 'attachment' as const,
        value: 'dashboard-mockup.png',
        metadata: {
          id: 'att-891',
          name: 'dashboard-mockup.png',
          type: 'file',
          mimeType: 'image/png',
          size: 189440,
          preview: 'Image: dashboard-mockup.png (189 KB)'
        }
      }
    ]
  }
];

const mockPipelineEvents = [
  {
    id: 'pipeline-1',
    type: 'shippable',
    runId: 'del-456',
    status: 'running',
    progress: 65,
    phase: 'Implementation',
    events: [
      { timestamp: '10:31:00', message: '🚀 Pipeline started: OAuth authentication system' },
      { timestamp: '10:31:15', message: '🔍 Analyzing repository structure...' },
      { timestamp: '10:31:30', message: '📝 Processing authentication requirements document' },
      { timestamp: '10:32:00', message: '🎨 Analyzing UI mockups for design patterns' },
      { timestamp: '10:32:15', message: '⚡ Generating OAuth provider configurations' },
      { timestamp: '10:32:30', message: '🔐 Implementing JWT token management' },
      { timestamp: '10:32:45', message: '👥 Creating role-based access control system' }
    ]
  }
];

export const BasicConversation: Story = {
  args: {
    conversation: {
      id: 'conv-123',
      title: 'Authentication Implementation',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:32:45Z'
    },
    messages: mockMessages,
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(['del-456']),
    completedPipelines: new Set(),
    pipelineEvents: mockPipelineEvents
  }
};

export const StreamingResponse: Story = {
  args: {
    conversation: {
      id: 'conv-124',
      title: 'Real-time Streaming Demo',
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:30Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'How do I optimize my React app performance?',
        created_at: '2024-01-15T11:00:00Z'
      }
    ],
    isStreaming: true,
    currentContent: "I'll help you optimize your React application performance. Here are the key strategies:\n\n1. **Component Optimization**\n   - Use React.memo for expensive components\n   - Implement useMemo and useCallback for expensive calculations\n   - Avoid inline object creation in render\n\n2. **Bundle Optimization**\n   - Code splitting with React.lazy and Suspense\n   - Tree shaking to eliminate dead code\n   - Optimize chunk sizes with webpack\n\n3. **State Management**\n   - Minimize re-renders with proper state structure",
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: []
  }
};

export const MultiplePipelines: Story = {
  args: {
    conversation: {
      id: 'conv-125',
      title: 'Full-Stack Terminal Build',
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T09:45:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: '@shippable Create a React dashboard with user authentication\n@upgrade Migrate to TypeScript\n@shippable Add real-time notifications',
        created_at: '2024-01-15T09:00:00Z',
        tokens: [
          {
            type: 'shippable' as const,
            value: 'Create a React dashboard with user authentication',
            metadata: { priority: 'high' }
          },
          {
            type: 'upgrade' as const,
            value: 'Migrate to TypeScript',
            metadata: { priority: 'medium' }
          },
          {
            type: 'shippable' as const,
            value: 'Add real-time notifications',
            metadata: { priority: 'low' }
          }
        ]
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(['del-789', 'upg-123']),
    completedPipelines: new Set(['del-456']),
    pipelineEvents: [
      {
        id: 'pipeline-1',
        type: 'shippable',
        runId: 'del-789',
        status: 'running',
        progress: 30,
        phase: 'Discovery',
        events: [
          { timestamp: '09:00:15', message: '🚀 Starting dashboard creation pipeline' },
          { timestamp: '09:00:30', message: '🔍 Analyzing project structure' },
          { timestamp: '09:01:00', message: '📊 Designing dashboard layout' }
        ]
      },
      {
        id: 'pipeline-2',
        type: 'upgrade',
        runId: 'upg-123',
        status: 'running',
        progress: 75,
        phase: 'Implementation',
        events: [
          { timestamp: '09:05:00', message: '🔄 TypeScript migration started' },
          { timestamp: '09:10:00', message: '📝 Converting JavaScript files' },
          { timestamp: '09:20:00', message: '🔧 Adding type definitions' }
        ]
      },
      {
        id: 'pipeline-3',
        type: 'shippable',
        runId: 'del-456',
        status: 'completed',
        progress: 100,
        phase: 'Complete',
        events: [
          { timestamp: '08:30:00', message: '✅ Authentication system completed' },
          { timestamp: '08:30:15', message: '🎉 Pull request created: #123' }
        ]
      }
    ]
  }
};

export const ErrorHandling: Story = {
  args: {
    conversation: {
      id: 'conv-126',
      title: 'Error Recovery Demo',
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:05:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Deploy my app to production',
        created_at: '2024-01-15T12:00:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'I encountered an error while trying to deploy your application. It appears there is insufficient $BTD in your account. Acquire more $BTD to continue with the deployment pipeline.',
        created_at: '2024-01-15T12:01:00Z',
        error: {
          message: 'Insufficient $BTD for deployment pipeline',
          code: 'INSUFFICIENT_BTD',
          details: {
            required: 150,
            current: 25
          }
        }
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'Insufficient $BTD for deployment pipeline'
  }
};

export const RichTextTokens: Story = {
  args: {
    conversation: {
      id: 'conv-127',
      title: 'Rich Text Integration Demo',
      created_at: '2024-01-15T13:00:00Z',
      updated_at: '2024-01-15T13:05:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Help me implement a search feature #acme/search-service +requirements.pdf :history @shippable',
        created_at: '2024-01-15T13:00:00Z',
        tokens: [
          {
            type: 'source' as const,
            value: 'acme/search-service',
            metadata: {
              repoSlug: 'acme/search-service',
              branch: 'main',
              selectedFiles: ['src/search/index.js', 'src/api/search.js']
            }
          },
          {
            type: 'attachment' as const,
            value: 'requirements.pdf',
            metadata: {
              id: 'att-999',
              name: 'requirements.pdf',
              type: 'file',
              size: 512000,
              preview: 'Search feature requirements: Full-text search, filtering, faceted search...'
            }
          },
          {
            type: 'command' as const,
            value: 'history',
            metadata: {
              id: 'cmd-hist',
              category: 'navigation'
            }
          },
          {
            type: 'shippable' as const,
            value: 'Implement advanced search functionality',
            metadata: {
              priority: 'high',
              measuredBtdEstimate: 200
            }
          }
        ]
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: "Perfect! I can see you want to implement an advanced search feature. Based on your source code in the search-service repository and the requirements document, I'll create a comprehensive search solution.\n\n**From your requirements document:**\n- Full-text search with relevance scoring\n- Advanced filtering and faceted search\n- Real-time search suggestions\n- Performance optimization for large datasets\n\n**From your repository analysis:**\n- Current basic search implementation in `src/search/index.js`\n- REST API endpoints in `src/api/search.js`\n- Opportunity to enhance with Elasticsearch integration\n\n🚀 **Starting shippable pipeline** to implement the advanced search functionality with all your specified requirements.",
        created_at: '2024-01-15T13:01:00Z',
        shippable_id: 'del-999'
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(['del-999']),
    completedPipelines: new Set(),
    pipelineEvents: [
      {
        id: 'pipeline-search',
        type: 'shippable',
        runId: 'del-999',
        status: 'running',
        progress: 20,
        phase: 'Setup',
        events: [
          { timestamp: '13:01:00', message: '🚀 Advanced search implementation started' },
          { timestamp: '13:01:15', message: '📖 Processing requirements document' },
          { timestamp: '13:01:30', message: '🔍 Analyzing existing search implementation' },
          { timestamp: '13:01:45', message: '🏗️ Planning Elasticsearch integration' }
        ]
      }
    ]
  }
};

export const EmptyState: Story = {
  args: {
    conversation: {
      id: 'conv-new',
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    messages: [],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: []
  }
};
