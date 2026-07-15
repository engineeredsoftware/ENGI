import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ConversationCard from '@/components/conversations/ConversationsCard/ConversationsCard';
import EnhancedRichTextInput from '@/components/conversations/ConversationsEnhancedRichTextInput/ConversationsEnhancedRichTextInput';

const meta = {
  title: 'Conversations/Error Handling & Edge Cases',
  component: ConversationCard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Authentication Errors
export const AuthenticationError: Story = {
  args: {
    conversation: {
      id: 'conv-auth-error',
      title: 'Authentication Error Demo',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:01:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Create a new shippable for user authentication',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'I encountered an authentication error. Please log in again to continue using Conversations.',
        created_at: '2024-01-15T10:01:00Z',
        error: {
          message: 'Authentication token has expired',
          code: 'AUTH_TOKEN_EXPIRED',
          details: {
            expiredAt: '2024-01-15T09:45:00Z',
            redirectUrl: '/login'
          }
        }
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'Authentication token has expired'
  }
};

// BTD Insufficient Errors
export const InsufficientBtdError: Story = {
  args: {
    conversation: {
      id: 'conv-btd-error',
      title: 'Insufficient $BTD Demo',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:02:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: '@shippable Build a comprehensive e-commerce platform with payment processing',
        created_at: '2024-01-15T10:00:00Z',
        tokens: [
          {
            type: 'shippable' as const,
            value: 'Build a comprehensive e-commerce platform with payment processing',
            metadata: {
              priority: 'high',
              measuredBtdEstimate: 500
            }
          }
        ]
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'I cannot start this shippable pipeline because you have insufficient $BTD. This shippable requires 500 $BTD, but you currently have 45 $BTD available.',
        created_at: '2024-01-15T10:02:00Z',
        error: {
          message: 'Insufficient $BTD for shippable pipeline',
          code: 'INSUFFICIENT_BTD',
          details: {
            required: 500,
            current: 45,
            treasuryUrl: '/btd',
            btdPackages: [
              { name: 'Micro', btd: 100, price: 10 },
              { name: 'Industry', btd: 1000, price: 100 }
            ]
          }
        }
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'Insufficient $BTD for shippable pipeline'
  }
};

// GitHub Connection Errors
export const GitHubConnectionError: Story = {
  args: {
    conversation: {
      id: 'conv-github-error',
      title: 'GitHub Connection Error Demo',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:03:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Add authentication to my app #mycompany/secure-repo',
        created_at: '2024-01-15T10:00:00Z',
        tokens: [
          {
            type: 'source' as const,
            value: 'mycompany/secure-repo',
            metadata: {
              repoSlug: 'mycompany/secure-repo',
              branch: 'main'
            }
          }
        ]
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'I cannot access the repository "mycompany/secure-repo" because either your GitHub connection has expired or the repository requires additional permissions.',
        created_at: '2024-01-15T10:03:00Z',
        error: {
          message: 'GitHub repository access denied',
          code: 'GITHUB_ACCESS_DENIED',
          details: {
            repository: 'mycompany/secure-repo',
            missingPermissions: ['contents:read', 'metadata:read'],
            reconnectUrl: '/connections/github',
            connectionId: null
          }
        }
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'GitHub repository access denied'
  }
};

// Network Connectivity Errors
export const NetworkError: Story = {
  args: {
    conversation: {
      id: 'conv-network-error',
      title: 'Network Error Demo',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:01:30Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Help me debug this React component',
        created_at: '2024-01-15T10:00:00Z'
      }
    ],
    isStreaming: false,
    currentContent: 'I\'m experiencing connectivity issues. Please check your internet connection and try again. The streaming response was interrupted.',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'Network connection failed. Streaming interrupted.',
    isRetrying: true,
    retryCount: 2
  }
};

// API Rate Limiting
export const RateLimitError: Story = {
  args: {
    conversation: {
      id: 'conv-rate-limit',
      title: 'Rate Limit Error Demo',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:05:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Analyze this large codebase and suggest improvements',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'I\'ve hit the API rate limit while analyzing your codebase. Please wait a moment before sending another request.',
        created_at: '2024-01-15T10:05:00Z',
        error: {
          message: 'API rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            resetTime: '2024-01-15T10:06:00Z',
            retryAfter: 60,
            requestsRemaining: 0,
            requestsPerHour: 100
          }
        }
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'API rate limit exceeded',
    rateLimitInfo: {
      resetTime: '2024-01-15T10:06:00Z',
      retryAfter: 60
    }
  }
};

// Pipeline Failure Scenarios
export const PipelineFailureError: Story = {
  args: {
    conversation: {
      id: 'conv-pipeline-failure',
      title: 'Pipeline Failure Demo',
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T09:30:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: '@shippable Create API documentation',
        created_at: '2024-01-15T09:00:00Z',
        tokens: [
          {
            type: 'shippable' as const,
            value: 'Create API documentation',
            metadata: {
              priority: 'medium',
              measuredBtdEstimate: 80
            }
          }
        ]
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'I started the API documentation pipeline, but it failed during the implementation phase due to repository permission issues.',
        created_at: '2024-01-15T09:30:00Z',
        shippable_id: 'del-failed'
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [
      {
        id: 'pipeline-failed',
        type: 'shippable' as const,
        runId: 'del-failed',
        status: 'failed' as const,
        progress: 65,
        phase: 'Implementation',
        measuredBtdEstimate: 80,
        measuredBtd: 52,
        startedAt: '2024-01-15T09:01:00Z',
        failedAt: '2024-01-15T09:30:00Z',
        error: {
          message: 'Repository permission denied during file creation',
          code: 'REPOSITORY_PERMISSION_DENIED',
          details: {
            repository: 'mycompany/api-service',
            operation: 'create_file',
            path: 'docs/api.md',
            requiredPermissions: ['contents:write']
          }
        },
        events: [
          {
            id: 'evt-1',
            timestamp: '09:01:00',
            phase: 'Setup',
            message: '🚀 API documentation generation started',
            level: 'info' as const
          },
          {
            id: 'evt-2',
            timestamp: '09:10:00',
            phase: 'Discovery',
            message: '📖 Analyzing API endpoints and schemas',
            level: 'info' as const
          },
          {
            id: 'evt-3',
            timestamp: '09:20:00',
            phase: 'Implementation',
            message: '📝 Generating comprehensive API documentation',
            level: 'info' as const
          },
          {
            id: 'evt-4',
            timestamp: '09:30:00',
            phase: 'Implementation',
            message: '❌ Failed to create documentation file: Permission denied',
            level: 'error' as const,
            error: {
              message: 'Repository permission denied during file creation',
              code: 'REPOSITORY_PERMISSION_DENIED'
            }
          }
        ]
      }
    ]
  }
};

// File Upload Errors  
export const FileUploadError: Story = {
  args: {
    conversation: {
      id: 'conv-upload-error',
      title: 'File Upload Error Demo',
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:02:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'I tried to upload my design file but it failed',
        created_at: '2024-01-15T11:00:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'The file upload failed because the file size exceeds the 25MB limit. Please try uploading a smaller file or compress your design file.',
        created_at: '2024-01-15T11:02:00Z',
        error: {
          message: 'File upload failed: File too large',
          code: 'FILE_TOO_LARGE',
          details: {
            fileName: 'design-mockups.psd',
            fileSize: 45 * 1024 * 1024, // 45MB
            maxSize: 25 * 1024 * 1024,   // 25MB
            supportedFormats: ['pdf', 'png', 'jpg', 'jpeg', 'txt', 'md', 'json']
          }
        }
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'File upload failed: File too large'
  }
};

// Validation Errors
export const ValidationError: Story = {
  args: {
    conversation: {
      id: 'conv-validation-error',
      title: 'Validation Error Demo',
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:01:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: '',
        created_at: '2024-01-15T12:00:00Z'
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(),
    completedPipelines: new Set(),
    pipelineEvents: [],
    error: 'Message content cannot be empty',
    validationErrors: [
      {
        field: 'content',
        message: 'Message content is required',
        code: 'REQUIRED_FIELD'
      }
    ]
  }
};

// Recovery and Retry Scenarios
export const RecoveryScenario: Story = {
  args: {
    conversation: {
      id: 'conv-recovery',
      title: 'Error Recovery Demo',
      created_at: '2024-01-15T13:00:00Z',
      updated_at: '2024-01-15T13:05:00Z'
    },
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Deploy my application to production',
        created_at: '2024-01-15T13:00:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'The deployment failed initially due to a temporary service outage, but I\'ve automatically retried and the deployment is now proceeding successfully.',
        created_at: '2024-01-15T13:05:00Z'
      }
    ],
    isStreaming: false,
    currentContent: '',
    activePipelines: new Set(['del-deploy']),
    completedPipelines: new Set(),
    pipelineEvents: [
      {
        id: 'pipeline-recovery',
        type: 'shippable' as const,
        runId: 'del-deploy',
        status: 'running' as const,
        progress: 40,
        phase: 'Implementation',
        measuredBtdEstimate: 100,
        measuredBtd: 40,
        startedAt: '2024-01-15T13:01:00Z',
        retryCount: 1,
        events: [
          {
            id: 'evt-1',
            timestamp: '13:01:00',
            phase: 'Setup',
            message: '🚀 Production deployment pipeline started',
            level: 'info' as const
          },
          {
            id: 'evt-2',
            timestamp: '13:02:00',
            phase: 'Implementation',
            message: '❌ Deployment failed: Service temporarily unavailable',
            level: 'error' as const,
            error: {
              message: 'Service temporarily unavailable',
              code: 'SERVICE_UNAVAILABLE'
            }
          },
          {
            id: 'evt-3',
            timestamp: '13:03:00',
            phase: 'Setup',
            message: '🔄 Retrying deployment after service recovery',
            level: 'warning' as const
          },
          {
            id: 'evt-4',
            timestamp: '13:04:00',
            phase: 'Implementation',
            message: '✅ Deployment resumed successfully',
            level: 'success' as const
          },
          {
            id: 'evt-5',
            timestamp: '13:05:00',
            phase: 'Implementation',
            message: '📦 Building production artifacts',
            level: 'info' as const
          }
        ]
      }
    ],
    showRecoveryInfo: true,
    recoveryActions: [
      {
        id: 'retry',
        label: 'Retry Pipeline',
        action: () => console.log('Retrying pipeline')
      },
      {
        id: 'support',
        label: 'Contact Support',
        action: () => console.log('Opening support')
      }
    ]
  }
};

// Input Error Handling
const InputErrorMeta = {
  title: 'Conversations/Error Handling & Edge Cases/Input Errors',
  component: EnhancedRichTextInput,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EnhancedRichTextInput>;

export const InputTooLong: StoryObj<typeof EnhancedRichTextInput> = {
  args: {
    value: 'A'.repeat(10001), // Exceeds 10,000 character limit
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    error: 'Message too long. Please keep messages under 10,000 characters.',
    maxLength: 10000,
    attachments: [],
    sources: [],
    shippables: [],
    upgrades: [],
    commands: []
  }
};

export const TooManyTokens: StoryObj<typeof EnhancedRichTextInput> = {
  args: {
    value: 'Process these files: #repo1 #repo2 #repo3 +file1.pdf +file2.pdf +file3.pdf @del1 @del2 @del3 ^upg1 ^upg2',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    error: 'Too many tokens in message. Please limit to 10 tokens per message.',
    maxTokens: 10,
    selectedTokens: Array(12).fill(null).map((_, i) => ({
      type: 'attachment' as const,
      value: `file${i}.pdf`,
      metadata: { id: `att-${i}` }
    })),
    attachments: [],
    sources: [],
    shippables: [],
    upgrades: [],
    commands: []
  }
};

export const InvalidTokenFormat: StoryObj<typeof EnhancedRichTextInput> = {
  args: {
    value: 'Check this malformed token #invalid/repo/format/with/too/many/slashes',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    error: 'Invalid repository format. Use owner/repository format (e.g., #mycompany/myapp).',
    attachments: [],
    sources: [],
    shippables: [],
    upgrades: [],
    commands: []
  }
};

export const DataLoadingError: StoryObj<typeof EnhancedRichTextInput> = {
  args: {
    value: 'I want to attach a file +',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: [],
    sources: [],
    shippables: [],
    upgrades: [],
    commands: [],
    error: 'Failed to load attachments. Please try again.',
    isLoadingAttachments: false,
    attachmentLoadError: 'Network error: Unable to fetch attachments'
  }
};
