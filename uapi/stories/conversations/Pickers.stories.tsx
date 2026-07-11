import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SourcePicker from '@/components/conversations/ConversationsSourcePicker/ConversationsSourcePicker';
import AttachmentPicker from '@/components/conversations/ConversationsAttachmentPicker/ConversationsAttachmentPicker';
import ShippablePicker from '@/components/conversations/ConversationsShippablePicker/ConversationsShippablePicker';
import UpgradePicker from '@/components/conversations/components/ConversationsUpgradePicker';
// CommandMenu overlay removed; stories pruned.

// Source Picker Stories
const SourcePickerMeta = {
  title: 'Conversations/Pickers/Source Picker',
  component: SourcePicker,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SourcePicker>;

export default SourcePickerMeta;

const mockRepositories = [
  {
    id: 789,
    name: 'myapp',
    fullName: 'mycompany/myapp',
    owner: 'mycompany',
    private: false,
    defaultBranch: 'main',
    description: 'Main application repository',
    language: 'TypeScript',
    updatedAt: '2024-01-13T10:00:00Z',
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
    updatedAt: '2024-01-14T15:00:00Z',
    text: 'mycompany/api-service',
    displayInfo: 'Node.js • Private • 1d ago'
  },
  {
    id: 791,
    name: 'mobile-app',
    fullName: 'mycompany/mobile-app',
    owner: 'mycompany',
    private: false,
    defaultBranch: 'develop',
    description: 'React Native mobile application',
    language: 'JavaScript',
    updatedAt: '2024-01-12T09:00:00Z',
    text: 'mycompany/mobile-app',
    displayInfo: 'JavaScript • Public • 3d ago'
  }
];

const mockFileTree = {
  path: 'src',
  files: [
    {
      name: 'App.js',
      path: 'src/App.js',
      type: 'file' as const,
      size: 2048,
      sha: 'abc123',
      text: 'App.js',
      displayInfo: 'file • 2 KB • Main component'
    },
    {
      name: 'index.js',
      path: 'src/index.js',
      type: 'file' as const,
      size: 512,
      sha: 'def456',
      text: 'index.js',
      displayInfo: 'file • 512 B • Entry point'
    }
  ],
  directories: [
    {
      name: 'components',
      path: 'src/components',
      type: 'dir' as const,
      text: 'components/',
      displayInfo: 'directory • React components'
    },
    {
      name: 'hooks',
      path: 'src/hooks',
      type: 'dir' as const,
      text: 'hooks/',
      displayInfo: 'directory • Custom hooks'
    },
    {
      name: 'utils',
      path: 'src/utils',
      type: 'dir' as const,
      text: 'utils/',
      displayInfo: 'directory • Utility functions'
    }
  ],
  breadcrumbs: ['src']
};

export const SourcePickerDefault: StoryObj<typeof SourcePicker> = {
  args: {
    repositories: mockRepositories,
    onSelect: (repo) => console.log('Selected repository:', repo),
    onFileSelect: (files) => console.log('Selected files:', files),
    isLoading: false
  }
};

export const SourcePickerWithFileTree: StoryObj<typeof SourcePicker> = {
  args: {
    repositories: mockRepositories,
    selectedRepository: mockRepositories[0],
    fileTree: mockFileTree,
    selectedFiles: ['src/App.js', 'src/components/Auth.js'],
    onSelect: (repo) => console.log('Selected repository:', repo),
    onFileSelect: (files) => console.log('Selected files:', files),
    isLoading: false
  }
};

export const SourcePickerLoading: StoryObj<typeof SourcePicker> = {
  args: {
    repositories: [],
    onSelect: (repo) => console.log('Selected repository:', repo),
    onFileSelect: (files) => console.log('Selected files:', files),
    isLoading: true
  }
};

export const SourcePickerEmpty: StoryObj<typeof SourcePicker> = {
  args: {
    repositories: [],
    onSelect: (repo) => console.log('Selected repository:', repo),
    onFileSelect: (files) => console.log('Selected files:', files),
    isLoading: false,
    error: 'No repositories found. Please connect your GitHub account.'
  }
};

// Attachment Picker Stories
const AttachmentPickerMeta = {
  title: 'Conversations/Pickers/Attachment Picker',
  component: AttachmentPicker,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AttachmentPicker>;

const mockAttachments = [
  {
    id: 'att-1',
    name: 'requirements.pdf',
    type: 'file' as const,
    size: 245760,
    mimeType: 'application/pdf',
    url: '/uploads/requirements.pdf',
    preview: 'OAuth 2.0 authentication requirements and specifications...',
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
    name: 'mockup.png',
    type: 'file' as const,
    size: 1048576,
    mimeType: 'image/png',
    url: '/uploads/mockup.png',
    preview: 'Login page mockup with OAuth provider buttons',
    createdAt: '2024-01-15T08:00:00Z',
    text: 'mockup.png',
    displayInfo: 'file • 1 MB • 4h ago'
  },
  {
    id: 'att-4',
    name: 'Design Notes',
    type: 'text' as const,
    size: 1024,
    mimeType: 'text/plain',
    url: null,
    preview: 'Component design patterns and style guidelines for the authentication flow...',
    createdAt: '2024-01-15T07:00:00Z',
    text: 'Design Notes',
    displayInfo: 'text • 1 KB • 5h ago'
  }
];

export const AttachmentPickerDefault: StoryObj<typeof AttachmentPicker> = {
  args: {
    attachments: mockAttachments,
    onSelect: (attachment) => console.log('Selected attachment:', attachment),
    onUpload: (file) => console.log('Uploading file:', file),
    onCreateUrl: (name, url) => console.log('Creating URL attachment:', { name, url }),
    onCreateText: (name, content) => console.log('Creating text attachment:', { name, content }),
    isLoading: false
  }
};

export const AttachmentPickerWithSelection: StoryObj<typeof AttachmentPicker> = {
  args: {
    attachments: mockAttachments,
    selectedAttachments: [mockAttachments[0], mockAttachments[2]],
    onSelect: (attachment) => console.log('Selected attachment:', attachment),
    onUpload: (file) => console.log('Uploading file:', file),
    onCreateUrl: (name, url) => console.log('Creating URL attachment:', { name, url }),
    onCreateText: (name, content) => console.log('Creating text attachment:', { name, content }),
    isLoading: false
  }
};

export const AttachmentPickerUploading: StoryObj<typeof AttachmentPicker> = {
  args: {
    attachments: mockAttachments,
    onSelect: (attachment) => console.log('Selected attachment:', attachment),
    onUpload: (file) => console.log('Uploading file:', file),
    onCreateUrl: (name, url) => console.log('Creating URL attachment:', { name, url }),
    onCreateText: (name, content) => console.log('Creating text attachment:', { name, content }),
    isLoading: false,
    uploadProgress: 45,
    uploadingFileName: 'new-document.pdf'
  }
};

export const AttachmentPickerEmpty: StoryObj<typeof AttachmentPicker> = {
  args: {
    attachments: [],
    onSelect: (attachment) => console.log('Selected attachment:', attachment),
    onUpload: (file) => console.log('Uploading file:', file),
    onCreateUrl: (name, url) => console.log('Creating URL attachment:', { name, url }),
    onCreateText: (name, content) => console.log('Creating text attachment:', { name, content }),
    isLoading: false
  }
};

// Shippable Picker Stories
const ShippablePickerMeta = {
  title: 'Conversations/Pickers/Shippable Picker',
  component: ShippablePicker,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ShippablePicker>;

const mockShippables = [
  {
    id: 'ship-1',
    title: 'Authentication System',
    description: 'Implement OAuth 2.0 authentication with JWT tokens and role-based access control',
    status: 'completed' as const,
    priority: 'high' as const,
    measuredBtdEstimate: 150,
    measuredBtd: 145,
    createdAt: '2024-01-10T10:00:00Z',
    completedAt: '2024-01-11T15:30:00Z',
    pullRequestUrl: 'https://github.com/mycompany/myapp/pull/123',
    text: 'Authentication System',
    displayInfo: 'Completed • OAuth 2.0 • 5d ago'
  },
  {
    id: 'ship-2',
    title: 'User Dashboard',
    description: 'Create responsive user dashboard with analytics widgets and real-time data',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    measuredBtdEstimate: 200,
    progress: 65,
    createdAt: '2024-01-14T15:00:00Z',
    text: 'User Dashboard',
    displayInfo: 'In Progress • 65% • Analytics • 1d ago'
  },
  {
    id: 'ship-3',
    title: 'Wallet Settlement Flow',
    description: 'Implement wallet-gated BTC settlement with audited $BTD issuance and GitHub delivery gating',
    status: 'pending' as const,
    priority: 'low' as const,
    measuredBtdEstimate: 180,
    createdAt: '2024-01-15T09:00:00Z',
    text: 'Wallet Settlement Flow',
    displayInfo: 'Pending • Wallet + GitHub • 3h ago'
  },
  {
    id: 'ship-4',
    title: 'API Documentation',
    description: 'Generate comprehensive OpenAPI documentation with examples',
    status: 'failed' as const,
    priority: 'medium' as const,
    measuredBtdEstimate: 80,
    createdAt: '2024-01-14T12:00:00Z',
    failedAt: '2024-01-14T12:45:00Z',
    errorMessage: 'Insufficient repository permissions',
    text: 'API Documentation',
    displayInfo: 'Failed • Permissions error • 1d ago'
  }
];

export const ShippablePickerDefault: StoryObj<typeof ShippablePicker> = {
  args: {
    shippables: mockShippables,
    onSelect: (shippable) => console.log('Selected Shippable:', shippable),
    onCreate: (title, description) => console.log('Creating Shippable:', { title, description }),
    isLoading: false
  }
};

export const ShippablePickerWithSelection: StoryObj<typeof ShippablePicker> = {
  args: {
    shippables: mockShippables,
    selectedShippable: mockShippables[0],
    onSelect: (shippable) => console.log('Selected Shippable:', shippable),
    onCreate: (title, description) => console.log('Creating Shippable:', { title, description }),
    isLoading: false
  }
};

export const ShippablePickerLoading: StoryObj<typeof ShippablePicker> = {
  args: {
    shippables: [],
    onSelect: (shippable) => console.log('Selected Shippable:', shippable),
    onCreate: (title, description) => console.log('Creating Shippable:', { title, description }),
    isLoading: true
  }
};

export const ShippablePickerEmpty: StoryObj<typeof ShippablePicker> = {
  args: {
    shippables: [],
    onSelect: (shippable) => console.log('Selected Shippable:', shippable),
    onCreate: (title, description) => console.log('Creating Shippable:', { title, description }),
    isLoading: false
  }
};

// Upgrade Picker Stories
const UpgradePickerMeta = {
  title: 'Conversations/Pickers/Upgrade Picker',
  component: UpgradePicker,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UpgradePicker>;

const mockUpgrades = [
  {
    id: 'upg-1',
    title: 'React 18 Migration',
    description: 'Upgrade to React 18 with concurrent features and automatic batching',
    type: 'framework_upgrade' as const,
    status: 'completed' as const,
    measuredBtdEstimate: 100,
    measuredBtd: 95,
    createdAt: '2024-01-08T14:00:00Z',
    completedAt: '2024-01-09T10:30:00Z',
    pullRequestUrl: 'https://github.com/mycompany/myapp/pull/456',
    text: 'React 18 Migration',
    displayInfo: 'Completed • Framework • 7d ago'
  },
  {
    id: 'upg-2',
    title: 'TypeScript Strict Mode',
    description: 'Enable strict TypeScript configuration and fix type errors',
    type: 'code_improvement' as const,
    status: 'available' as const,
    measuredBtdEstimate: 120,
    recommendationScore: 85,
    createdAt: '2024-01-15T11:00:00Z',
    text: 'TypeScript Strict Mode',
    displayInfo: 'Available • 85% recommended • TypeScript • 1h ago'
  },
  {
    id: 'upg-3',
    title: 'Performance Optimization',
    description: 'Bundle splitting, lazy loading, and performance improvements',
    type: 'performance' as const,
    status: 'in_progress' as const,
    measuredBtdEstimate: 160,
    progress: 30,
    createdAt: '2024-01-15T08:00:00Z',
    text: 'Performance Optimization',
    displayInfo: 'In Progress • 30% • Performance • 4h ago'
  },
  {
    id: 'upg-4',
    title: 'Security Audit',
    description: 'Comprehensive security audit and vulnerability fixes',
    type: 'security' as const,
    status: 'recommended' as const,
    measuredBtdEstimate: 200,
    recommendationScore: 95,
    urgency: 'high' as const,
    createdAt: '2024-01-15T10:00:00Z',
    text: 'Security Audit',
    displayInfo: 'Recommended • 95% score • High urgency • 2h ago'
  }
];

export const UpgradePickerDefault: StoryObj<typeof UpgradePicker> = {
  args: {
    upgrades: mockUpgrades,
    onSelect: (upgrade) => console.log('Selected upgrade:', upgrade),
    onApply: (upgradeId) => console.log('Applying upgrade:', upgradeId),
    isLoading: false
  }
};

export const UpgradePickerWithSelection: StoryObj<typeof UpgradePicker> = {
  args: {
    upgrades: mockUpgrades,
    selectedUpgrade: mockUpgrades[1],
    onSelect: (upgrade) => console.log('Selected upgrade:', upgrade),
    onApply: (upgradeId) => console.log('Applying upgrade:', upgradeId),
    isLoading: false
  }
};

export const UpgradePickerLoading: StoryObj<typeof UpgradePicker> = {
  args: {
    upgrades: [],
    onSelect: (upgrade) => console.log('Selected upgrade:', upgrade),
    onApply: (upgradeId) => console.log('Applying upgrade:', upgradeId),
    isLoading: true
  }
};

export const UpgradePickerEmpty: StoryObj<typeof UpgradePicker> = {
  args: {
    upgrades: [],
    onSelect: (upgrade) => console.log('Selected upgrade:', upgrade),
    onApply: (upgradeId) => console.log('Applying upgrade:', upgradeId),
    isLoading: false
  }
};

// Command Menu Stories
const CommandMenuMeta = {
  title: 'Conversations/Pickers/Command Menu',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommandMenu>;

/* CommandMenu stories removed with retired overlay. Keeping pickers only.
const mockCommands = [
  {
    id: 'shippable',
    name: 'shippable',
    description: 'Create a new AssetPack pipeline to deliver a requested Shippable',
    category: 'pipeline' as const,
    shortcut: 'Ctrl+D',
    icon: '🚀',
    requiresAuth: true,
    requiresGitHub: true,
    text: '/shippable',
    displayInfo: 'Create Shippable delivery • Requires GitHub connection'
  },
  {
    id: 'upgrade',
    name: 'upgrade',
    description: 'Apply an upgrade to improve code quality or framework versions',
    category: 'pipeline' as const,
    shortcut: 'Ctrl+U',
    icon: '⬆️',
    requiresAuth: true,
    requiresGitHub: true,
    text: '/upgrade',
    displayInfo: 'Apply upgrade pipeline • Requires GitHub connection'
  },
  {
    id: 'history',
    name: 'history',
    description: 'View conversation history and previous interactions',
    category: 'navigation' as const,
    shortcut: 'Ctrl+H',
    icon: '📜',
    requiresAuth: true,
    text: '/history',
    displayInfo: 'Show conversation history • Navigation'
  },
  {
    id: 'runs',
    name: 'runs',
    description: 'View pipeline runs and their status',
    category: 'navigation' as const,
    shortcut: 'Ctrl+R',
    icon: '🏃',
    requiresAuth: true,
    text: '/runs',
    displayInfo: 'Show pipeline runs • Navigation'
  },
  {
    id: 'clear',
    name: 'clear',
    description: 'Clear the current conversation',
    category: 'action' as const,
    shortcut: 'Ctrl+L',
    icon: '🗑️',
    requiresAuth: true,
    text: '/clear',
    displayInfo: 'Clear conversation • Action'
  },
  {
    id: 'export',
    name: 'export',
    description: 'Export conversation to markdown or PDF',
    category: 'action' as const,
    shortcut: 'Ctrl+E',
    icon: '📤',
    requiresAuth: true,
    text: '/export',
    displayInfo: 'Export conversation • Action'
  },
  {
    id: 'btd',
    name: 'btd',
    description: 'View current $BTD balance and acquisition options',
    category: 'settings' as const,
    icon: '💳',
    requiresAuth: true,
    text: '/btd',
    displayInfo: 'Check $BTD balance • Settings'
  },
  {
    id: 'help',
    name: 'help',
    description: 'Get help and view documentation',
    category: 'help' as const,
    shortcut: 'F1',
    icon: '❓',
    requiresAuth: false,
    text: '/help',
    displayInfo: 'Get help • Documentation'
  }
];

*/
