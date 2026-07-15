import type { User } from '@supabase/supabase-js';
import type { VCSProviderType, VCSRepository } from '@bitcode/vcs-generics';

import { ENABLE_MOCKS, MOCK_USER_AUXILLARIES, MOCK_USER_AUXILLARIES_SCENARIO } from '@/config/featureFlags';
import {
  buildMockBitcodeWalletConnectionStatus,
  type BitcodeWalletConnectionStatus,
} from '@/app/api/wallet/_shared';

const REVIEW_USER_ID = 'mock-bitcode-review-user';
const REVIEW_TIMESTAMP = '2026-04-16T12:00:00.000Z';
const REVIEW_COMPLETED_STEPS = ['profile', 'externals', 'interfaces', 'wallet'] as const;

type MockRepositoryConnectionStatus = {
  connected: boolean;
  provider: VCSProviderType;
  valid: boolean;
  username?: string;
  instanceUrl?: string;
  metadata: {
    mock_mode: boolean;
    repositories?: number;
    account?: string;
    status?: string;
    supported?: boolean;
  };
};

type MockGitHubConnection = {
  installationId: number;
  provider: 'github';
  account: string;
  login: string;
  status: 'connected';
  repositories: number;
  mock_mode: true;
};

type MockWalletBinding = {
  address: string;
  provider: string;
  status: 'verified';
  boundAt: string;
};

type MockAuxillariesData = {
  profile: {
    user_id: string;
    username: string;
    display_name: string;
    bio: string;
    company_name: string;
    avatar_url: string;
    email: string;
    is_verified: boolean;
    wallet_address: string;
    wallet_provider: string;
    wallet_binding_status: 'verified';
    wallet_bound_at: string;
    wallet_binding: MockWalletBinding;
    btc_balance: number;
    onboarded_steps: string[];
    team_members: {
      id: string;
      username: string;
      display_name: string;
      role: string;
    }[];
    mock_mode: true;
    mock_scenario: string;
  };
  githubConnection: MockGitHubConnection;
  walletConnectionStatus: BitcodeWalletConnectionStatus;
  repositoryConnectionStatus: MockRepositoryConnectionStatus;
  repositories: VCSRepository[];
  repositoryInventorySource: 'mock_repository_inventory';
  organizations: string[];
  btdBalance: number;
  btcFeeBalance: number;
  recentBtdAssetPacks: Array<{
    assetPackId: string;
    label: string;
    rangeStart: number;
    rangeEndExclusive: number;
    acquiredAt: string;
  }>;
  modelPreferences: {
    preferred_model: string;
    temperature: number;
    max_tokens: number;
    review_profile: string;
  };
  onboardedPanes: string[];
  onboarded_steps: string[];
  isOnboardingComplete: true;
};

export function isAuxillariesMockMode() {
  return ENABLE_MOCKS && MOCK_USER_AUXILLARIES;
}

export function getAuxillariesMockScenario() {
  return MOCK_USER_AUXILLARIES_SCENARIO || 'default';
}

export function buildMockReviewUser(): User {
  return {
    id: REVIEW_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'reviewer@bitcode.ai',
    email_confirmed_at: REVIEW_TIMESTAMP,
    phone: '',
    confirmed_at: REVIEW_TIMESTAMP,
    last_sign_in_at: REVIEW_TIMESTAMP,
    app_metadata: {
      provider: 'mock',
      providers: ['mock'],
      reviewScenario: getAuxillariesMockScenario(),
    },
    user_metadata: {
      full_name: 'Avery Mercer',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      company_name: 'Bitcode Review Lab',
    },
    identities: [],
    created_at: REVIEW_TIMESTAMP,
    updated_at: REVIEW_TIMESTAMP,
    is_anonymous: false,
  } as User;
}

function buildMockGitHubConnection(repositories: VCSRepository[]): MockGitHubConnection {
  return {
    installationId: 424242,
    provider: 'github',
    account: 'bitcode',
    login: 'bitcode',
    status: 'connected',
    repositories: repositories.length,
    mock_mode: true,
  };
}

export function buildMockVcsConnectionStatus(provider: VCSProviderType): MockRepositoryConnectionStatus {
  if (provider !== 'github') {
    return {
      connected: false,
      provider,
      valid: false,
      metadata: {
        mock_mode: true,
        supported: false,
      },
    };
  }

  const repositories = buildMockVcsRepositories(provider);
  const githubConnection = buildMockGitHubConnection(repositories);

  return {
    connected: true,
    provider,
    valid: true,
    username: githubConnection.login || githubConnection.account || 'bitcode',
    instanceUrl: undefined,
    metadata: {
      mock_mode: true,
      repositories: githubConnection.repositories || 0,
      account: githubConnection.account || 'bitcode',
      status: githubConnection.status || 'connected',
    },
  };
}

export function buildMockAuxillariesData(): MockAuxillariesData {
  const onboardedPanes = [...REVIEW_COMPLETED_STEPS];
  const repositories = buildMockVcsRepositories('github');
  const githubConnection = buildMockGitHubConnection(repositories);
  const walletBinding: MockWalletBinding = {
    address: 'tb1qbitcodemockoperator0000000000000000000000',
    provider: 'walletconnect',
    status: 'verified',
    boundAt: REVIEW_TIMESTAMP,
  };
  const organizations = Array.from(
    new Set(
      repositories
        .filter((repository) => repository.owner?.type === 'organization')
        .map((repository) => repository.owner.username),
    ),
  );

  return {
    profile: {
      user_id: REVIEW_USER_ID,
      username: 'avery-mercer',
      display_name: 'Avery Mercer',
      bio: 'Reviewing the Bitcode commercial surface in deterministic mock mode.',
      company_name: 'Bitcode Review Lab',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      email: 'reviewer@bitcode.ai',
      is_verified: true,
      wallet_address: walletBinding.address,
      wallet_provider: walletBinding.provider,
      wallet_binding_status: walletBinding.status,
      wallet_bound_at: walletBinding.boundAt,
      wallet_binding: walletBinding,
      btc_balance: 0.042,
      onboarded_steps: onboardedPanes,
      team_members: [
        { id: 'tm-1', username: 'lin', display_name: 'Lin Ortega', role: 'admin' },
        { id: 'tm-2', username: 'sora', display_name: 'Sora Ames', role: 'reviewer' },
      ],
      mock_mode: true,
      mock_scenario: getAuxillariesMockScenario(),
    },
    githubConnection,
    walletConnectionStatus: buildMockBitcodeWalletConnectionStatus(
      walletBinding.provider,
      walletBinding.address,
    ),
    repositoryConnectionStatus: buildMockVcsConnectionStatus('github'),
    repositories,
    repositoryInventorySource: 'mock_repository_inventory',
    organizations,
    btdBalance: 1200,
    btcFeeBalance: 0.042,
    recentBtdAssetPacks: [
      {
        assetPackId: 'asset-pack-run-branch-remediation',
        label: 'Run Branch Remediation',
        rangeStart: 1190,
        rangeEndExclusive: 1200,
        acquiredAt: '2026-05-06T18:12:00.000Z',
      },
      {
        assetPackId: 'asset-pack-exchange-route-rendering',
        label: 'Exchange Route Rendering',
        rangeStart: 1178,
        rangeEndExclusive: 1190,
        acquiredAt: '2026-05-06T17:44:00.000Z',
      },
      {
        assetPackId: 'asset-pack-wallet-fee-rehearsal',
        label: 'Wallet Fee Rehearsal',
        rangeStart: 1164,
        rangeEndExclusive: 1178,
        acquiredAt: '2026-05-06T16:58:00.000Z',
      },
      {
        assetPackId: 'asset-pack-auxillaries-mvp-qa',
        label: 'Auxillaries MVP QA',
        rangeStart: 1148,
        rangeEndExclusive: 1164,
        acquiredAt: '2026-05-06T16:21:00.000Z',
      },
    ],
    modelPreferences: {
      preferred_model: 'claude-3-7-sonnet',
      temperature: 0.4,
      max_tokens: 3200,
      review_profile: 'bitcode-terminal-demo',
    },
    onboardedPanes,
    onboarded_steps: onboardedPanes,
    isOnboardingComplete: true,
  };
}

export function buildMockOnboardingData() {
  return {
    completedPanes: [...REVIEW_COMPLETED_STEPS],
    completedSteps: [...REVIEW_COMPLETED_STEPS],
    currentPane: 'profile',
    currentStep: 'profile',
    isOnboardingComplete: true,
  };
}

export function buildMockVcsRepositories(provider: VCSProviderType): VCSRepository[] {
  if (provider !== 'github') {
    return [];
  }

  return [
    {
      id: 'mock-repo-bitcode',
      name: 'bitcode',
      fullName: 'bitcode/bitcode',
      description: 'Primary Bitcode Terminal workspace and route-local composition carrier.',
      private: true,
      defaultBranch: 'main',
      url: 'https://github.com/bitcode/bitcode',
      cloneUrl: 'https://github.com/bitcode/bitcode.git',
      sshUrl: 'git@github.com:bitcode/bitcode.git',
      owner: {
        id: 'bitcode',
        username: 'bitcode',
        type: 'organization',
      },
      createdAt: new Date(REVIEW_TIMESTAMP),
      updatedAt: new Date(REVIEW_TIMESTAMP),
      language: 'TypeScript',
      topics: ['bitcode', 'terminal', 'protocol'],
      archived: false,
      fork: false,
      forksCount: 0,
      starsCount: 0,
      size: 2048,
    },
    {
      id: 'mock-repo-core',
      name: 'bitcode-core',
      fullName: 'bitcode/bitcode-core',
      description: 'System specification, proof, and pipeline-core integration surface for Bitcode.',
      private: true,
      defaultBranch: 'main',
      url: 'https://github.com/bitcode/bitcode-core',
      cloneUrl: 'https://github.com/bitcode/bitcode-core.git',
      sshUrl: 'git@github.com:bitcode/bitcode-core.git',
      owner: {
        id: 'bitcode',
        username: 'bitcode',
        type: 'organization',
      },
      createdAt: new Date(REVIEW_TIMESTAMP),
      updatedAt: new Date(REVIEW_TIMESTAMP),
      language: 'TypeScript',
      topics: ['bitcode', 'proof', 'pipelines'],
      archived: false,
      fork: false,
      forksCount: 0,
      starsCount: 0,
      size: 1024,
    },
    {
      id: 'mock-repo-economics',
      name: 'economic-ledger',
      fullName: 'bitcode/economic-ledger',
      description: 'Settlement, accounting, and proof-publishing surfaces feeding Terminal and Exchange.',
      private: true,
      defaultBranch: 'main',
      url: 'https://github.com/bitcode/economic-ledger',
      cloneUrl: 'https://github.com/bitcode/economic-ledger.git',
      sshUrl: 'git@github.com:bitcode/economic-ledger.git',
      owner: {
        id: 'bitcode',
        username: 'bitcode',
        type: 'organization',
      },
      createdAt: new Date(REVIEW_TIMESTAMP),
      updatedAt: new Date(REVIEW_TIMESTAMP),
      language: 'Rust',
      topics: ['bitcode', 'settlement', 'proof'],
      archived: false,
      fork: false,
      forksCount: 0,
      starsCount: 0,
      size: 1536,
    },
  ];
}
