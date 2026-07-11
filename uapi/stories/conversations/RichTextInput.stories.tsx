import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import EnhancedRichTextInput from '@/components/conversations/ConversationsEnhancedRichTextInput/ConversationsEnhancedRichTextInput';

const meta = {
  title: 'Conversations/Rich Text Input',
  component: EnhancedRichTextInput,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EnhancedRichTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data providers
const mockAttachments = [
  {
    id: 'att-1',
    name: 'requirements.pdf',
    type: 'file' as const,
    size: 245760,
    mimeType: 'application/pdf',
    url: '/uploads/requirements.pdf',
    preview: 'OAuth 2.0 authentication requirements...',
    createdAt: '2024-01-15T10:00:00Z',
    text: 'requirements.pdf',
    displayInfo: 'file • 240 KB • 2h ago'
  },
  {
    id: 'att-2',
    name: 'API Documentation',
    type: 'url' as const,
    size: 0,
    mimeType: 'text/uri-list',
    url: 'https://docs.example.com/api',
    preview: 'Complete API documentation for authentication endpoints',
    createdAt: '2024-01-15T09:00:00Z',
    text: 'API Documentation',
    displayInfo: 'url • External link • 3h ago'
  },
  {
    id: 'att-3',
    name: 'Design System Notes',
    type: 'text' as const,
    size: 1024,
    mimeType: 'text/plain',
    url: null,
    preview: 'Component design patterns and style guidelines...',
    createdAt: '2024-01-15T08:00:00Z',
    text: 'Design System Notes',
    displayInfo: 'text • 1 KB • 4h ago'
  }
];

const mockSources = [
  {
    id: 'conn-1',
    provider: 'github',
    accountName: 'mycompany',
    avatarUrl: 'https://avatars.githubusercontent.com/u/123456',
    repositories: [
      {
        id: 789,
        name: 'myapp',
        fullName: 'mycompany/myapp',
        owner: 'mycompany',
        private: false,
        defaultBranch: 'main',
        description: 'Main application repository',
        language: 'TypeScript',
        text: 'mycompany/myapp',
        displayInfo: 'TypeScript • Public • 2d ago'
      },
      {
        id: 790,
        name: 'api-service',
        fullName: 'mycompany/api-service',
        owner: 'mycompany',
        private: true,
        defaultBranch: 'main',
        description: 'Backend API service',
        language: 'Node.js',
        text: 'mycompany/api-service',
        displayInfo: 'Node.js • Private • 1d ago'
      }
    ],
    text: 'github: mycompany',
    displayInfo: 'github • 30d ago'
  }
];

const mockShippables = [
  {
    id: 'del-1',
    title: 'Authentication System',
    description: 'Implement OAuth 2.0 authentication with JWT tokens',
    status: 'completed',
    createdAt: '2024-01-10T10:00:00Z',
    text: 'Authentication System',
    displayInfo: 'Completed • OAuth 2.0 • 5d ago'
  },
  {
    id: 'del-2',
    title: 'User Dashboard',
    description: 'Create responsive user dashboard with analytics',
    status: 'in_progress',
    createdAt: '2024-01-14T15:00:00Z',
    text: 'User Dashboard',
    displayInfo: 'In Progress • Analytics • 1d ago'
  },
  {
    id: 'del-3',
    title: 'Wallet Settlement Flow',
    description: 'Implement wallet-gated BTC settlement and $BTD issuance flow',
    status: 'pending',
    createdAt: '2024-01-15T09:00:00Z',
    text: 'Wallet Settlement Flow',
    displayInfo: 'Pending • Wallet + GitHub • 3h ago'
  }
];

const mockUpgrades = [
  {
    id: 'upg-1',
    title: 'React 18 Migration',
    description: 'Upgrade to React 18 with concurrent features',
    status: 'completed',
    createdAt: '2024-01-08T14:00:00Z',
    text: 'React 18 Migration',
    displayInfo: 'Completed • React 18 • 7d ago'
  },
  {
    id: 'upg-2',
    title: 'TypeScript Strict Mode',
    description: 'Enable strict TypeScript configuration',
    status: 'available',
    createdAt: '2024-01-15T11:00:00Z',
    text: 'TypeScript Strict Mode',
    displayInfo: 'Available • TypeScript • 1h ago'
  }
];

const mockCommands = [
  {
    id: 'shippable',
    name: 'shippable',
    description: 'Create a new shippable pipeline',
    category: 'pipeline',
    shortcut: 'Ctrl+D',
    icon: '🚀',
    requiresAuth: true,
    requiresGitHub: true,
    text: '/shippable',
    displayInfo: 'Create shippable pipeline • Requires GitHub'
  },
  {
    id: 'history',
    name: 'history',
    description: 'View conversation history',
    category: 'navigation',
    shortcut: 'Ctrl+H',
    icon: '📜',
    requiresAuth: true,
    text: '/history',
    displayInfo: 'Show conversation history • Navigation'
  },
  {
    id: 'clear',
    name: 'clear',
    description: 'Clear conversation',
    category: 'action',
    shortcut: 'Ctrl+L',
    icon: '🗑️',
    requiresAuth: true,
    text: '/clear',
    displayInfo: 'Clear conversation • Action'
  }
];

export const BasicInput: Story = {
  args: {
    value: '',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands
  }
};

export const WithContent: Story = {
  args: {
    value: 'I want to add authentication to my React app',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands
  }
};

export const WithSourceToken: Story = {
  args: {
    value: 'I want to add authentication to my React app #mycompany/myapp',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands,
    selectedTokens: [
      {
        type: 'source',
        value: 'mycompany/myapp',
        metadata: {
          repoSlug: 'mycompany/myapp',
          branch: 'main',
          selectedFiles: ['src/App.js', 'src/components/Auth.js']
        }
      }
    ]
  }
};

export const WithAttachmentToken: Story = {
  args: {
    value: 'Here are the requirements +requirements.pdf',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands,
    selectedTokens: [
      {
        type: 'attachment',
        value: 'requirements.pdf',
        metadata: {
          id: 'att-1',
          name: 'requirements.pdf',
          type: 'file',
          size: 245760,
          preview: 'OAuth 2.0 authentication requirements...'
        }
      }
    ]
  }
};

export const WithShippableToken: Story = {
  args: {
    value: 'Create a new feature @shippable Authentication System',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands,
    selectedTokens: [
      {
        type: 'shippable',
        value: 'Authentication System',
        metadata: {
          id: 'del-1',
          priority: 'high',
          measuredBtdEstimate: 150
        }
      }
    ]
  }
};

export const WithUpgradeToken: Story = {
  args: {
    value: 'Apply this improvement ^React 18 Migration',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands,
    selectedTokens: [
      {
        type: 'upgrade',
        value: 'React 18 Migration',
        metadata: {
          id: 'upg-1',
          type: 'framework_upgrade',
          measuredBtdEstimate: 100
        }
      }
    ]
  }
};

export const WithCommandToken: Story = {
  args: {
    value: 'Show me the conversation :history',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands,
    selectedTokens: [
      {
        type: 'command',
        value: 'history',
        metadata: {
          id: 'history',
          category: 'navigation',
          shortcut: 'Ctrl+H'
        }
      }
    ]
  }
};

export const WithMultipleTokens: Story = {
  args: {
    value: 'Implement auth for #mycompany/myapp using +requirements.pdf and create @shippable Authentication System',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands,
    selectedTokens: [
      {
        type: 'source',
        value: 'mycompany/myapp',
        metadata: {
          repoSlug: 'mycompany/myapp',
          branch: 'main',
          selectedFiles: ['src/App.js', 'src/components/Auth.js']
        }
      },
      {
        type: 'attachment',
        value: 'requirements.pdf',
        metadata: {
          id: 'att-1',
          name: 'requirements.pdf',
          type: 'file',
          size: 245760,
          preview: 'OAuth 2.0 authentication requirements...'
        }
      },
      {
        type: 'shippable',
        value: 'Authentication System',
        metadata: {
          id: 'del-new',
          priority: 'high',
          measuredBtdEstimate: 150
        }
      }
    ]
  }
};

export const StreamingState: Story = {
  args: {
    value: '',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: true,
    disabled: true,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands
  }
};

export const LoadingState: Story = {
  args: {
    value: 'Processing your request...',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    loading: true,
    disabled: true,
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands
  }
};

export const ErrorState: Story = {
  args: {
    value: 'There was an error processing your request.',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    error: 'Network connection failed. Please try again.',
    attachments: mockAttachments,
    sources: mockSources,
    shippables: mockShippables,
    upgrades: mockUpgrades,
    commands: mockCommands
  }
};

export const EmptyDataStates: Story = {
  args: {
    value: 'No data available #',
    placeholder: 'Ask Conversations anything...',
    onSend: (content: string, tokens: any[]) => {
      console.log('Sent:', { content, tokens });
    },
    isStreaming: false,
    attachments: [],
    sources: [],
    shippables: [],
    upgrades: [],
    commands: []
  }
};
