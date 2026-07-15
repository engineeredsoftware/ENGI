import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { VCSConnections, VCSService, type VCSProviderType } from '@bitcode/vcs-generics';

import {
  buildMockVcsConnectionStatus,
  buildMockVcsRepositories,
  isAuxillariesMockMode,
} from '../../../lib/mock-review-mode';

const resourceSchema = z.enum([
  'connections',
  'accounts',
  'repositories',
  'branches',
  'commits',
  'issues',
  'tree',
]);
const providerSchema = z.enum(['github', 'gitlab', 'bitbucket']);

function getRouteVcsService() {
  return new VCSService({ supabaseClient: supabaseAdmin as any });
}

function resolveConnectionHandle(connection: any) {
  return (
    connection?.connectionData?.connectionId ||
    connection?.connectionData?.provider_user_id ||
    connection?.connection_data?.connectionId ||
    connection?.connection_data?.provider_user_id ||
    connection?.provider_user_id ||
    connection?.id ||
    null
  );
}

function buildEmptyResourcePayload(resource: z.infer<typeof resourceSchema>) {
  switch (resource) {
    case 'connections':
      return { connections: [] };
    case 'accounts':
      return { accounts: [] };
    case 'repositories':
      return { repositories: [] };
    case 'branches':
      return { branches: [], defaultBranch: null };
    case 'commits':
      return { commits: [] };
    case 'issues':
      return { issues: [] };
    case 'tree':
      return { items: [] };
  }
}

function buildMockPayload(resource: z.infer<typeof resourceSchema>, provider: VCSProviderType) {
  const repositories = buildMockVcsRepositories(provider);
  const defaultRepository = repositories[0];

  switch (resource) {
    case 'connections':
      return {
        connections: [
          {
            id: `${provider}-mock-connection`,
            provider,
            username: buildMockVcsConnectionStatus(provider).username || 'bitcode',
            createdAt: '2026-04-16T12:00:00.000Z',
          },
        ],
      };
    case 'accounts':
      return {
        accounts: provider === 'github'
          ? [{ id: 424242, login: 'bitcode', type: 'User' }]
          : [],
      };
    case 'repositories':
      return { repositories };
    case 'branches':
      return {
        branches: defaultRepository
          ? [
              {
                name: defaultRepository.defaultBranch,
                protected: true,
                default: true,
                commit: {
                  sha: 'mock-branch-head',
                  message: 'Mock review branch head',
                  author: {
                    name: 'Bitcode Review',
                    email: 'reviewer@bitcode.ai',
                    date: '2026-04-16T12:00:00.000Z',
                  },
                },
              },
            ]
          : [],
        defaultBranch: defaultRepository?.defaultBranch || null,
      };
    case 'commits':
      return {
        commits: [
          {
            sha: 'mock-run-branch-remediation',
            message: 'Mock retained execution branch for fourth-gate review',
            author: {
              name: 'Bitcode Review',
              email: 'reviewer@bitcode.ai',
              date: '2026-04-16T12:00:00.000Z',
            },
            parents: [],
          },
        ],
      };
    case 'issues':
      return {
        issues: [
          {
            id: 101,
            number: 101,
            title: 'Read ingestion proof for retained execution selectors',
            html_url: 'https://github.com/bitcode/bitcode/issues/101',
          },
          {
            id: 202,
            number: 202,
            title: 'Fourth-gate retained execution surface cleanup',
            html_url: 'https://github.com/bitcode/bitcode/pull/202',
            pull_request: {},
          },
        ],
      };
    case 'tree':
      return {
        items: [
          { path: 'src', type: 'tree', sha: 'mock-tree-src' },
          { path: 'README.md', type: 'blob', sha: 'mock-blob-readme', size: 2048 },
        ],
      };
  }
}

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const resourceResult = resourceSchema.safeParse(url.searchParams.get('resource') || 'connections');
  if (!resourceResult.success) {
    return NextResponse.json({ error: 'Invalid VCS resource' }, { status: 400 });
  }

  const providerResult = providerSchema.safeParse(url.searchParams.get('provider') || 'github');
  if (!providerResult.success) {
    return NextResponse.json({ error: 'Invalid VCS provider' }, { status: 400 });
  }

  const resource = resourceResult.data;
  const provider = providerResult.data;

  if (isAuxillariesMockMode()) {
    return NextResponse.json(buildMockPayload(resource, provider));
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(buildEmptyResourcePayload(resource));
  }

  const manager = new VCSConnections(supabaseAdmin as any);
  const connection = await manager.getConnection(user.id, provider);
  if (!connection) {
    if (resource === 'connections') {
      const connections = await manager.listConnections(user.id);
      return NextResponse.json({ connections });
    }
    return NextResponse.json(buildEmptyResourcePayload(resource));
  }

  if (resource === 'connections') {
    const connections = await manager.listConnections(user.id);
    return NextResponse.json({ connections });
  }

  if (resource === 'accounts') {
    const username =
      connection.connectionData?.provider_username ||
      connection.connectionData?.login ||
      'connected-account';

    return NextResponse.json({
      accounts: [
        {
          id: Number(resolveConnectionHandle(connection)) || 0,
          login: username,
          type: 'User',
        },
      ],
    });
  }

  const owner = url.searchParams.get('owner') || undefined;
  const repo = url.searchParams.get('repo') || undefined;
  const branch = url.searchParams.get('branch') || undefined;
  const connectionHandle = resolveConnectionHandle(connection);
  const vcsService = getRouteVcsService();

  if (!connectionHandle) {
    return NextResponse.json(buildEmptyResourcePayload(resource));
  }

  try {
    switch (resource) {
      case 'repositories': {
        const repositories = await vcsService.listRepositories(user.id, { perPage: 100 });
        const filteredRepositories = owner
          ? repositories.filter(
              (repository) =>
                repository.owner.username === owner ||
                repository.owner.id === owner ||
                repository.fullName === owner,
            )
          : repositories;
        return NextResponse.json({ repositories: filteredRepositories });
      }
      case 'branches': {
        if (!owner || !repo) return NextResponse.json(buildEmptyResourcePayload(resource));
        const [repoInfo, branches] = await Promise.all([
          vcsService.getRepository(connectionHandle, owner, repo),
          vcsService.listBranches(connectionHandle, owner, repo),
        ]);
        return NextResponse.json({ branches, defaultBranch: repoInfo.defaultBranch || null });
      }
      case 'commits': {
        if (!owner || !repo || !branch) return NextResponse.json(buildEmptyResourcePayload(resource));
        const commits = await vcsService.listCommits(connectionHandle, owner, repo, { branch });
        return NextResponse.json({ commits });
      }
      case 'tree': {
        if (!owner || !repo) return NextResponse.json(buildEmptyResourcePayload(resource));
        const treePath = url.searchParams.get('path') || '';
        const ref = url.searchParams.get('ref') || undefined;
        const items = await vcsService.getRepositoryContent(
          connectionHandle,
          owner,
          repo,
          treePath,
          ref,
        );
        return NextResponse.json({ items });
      }
      case 'issues': {
        if (!owner || !repo) return NextResponse.json(buildEmptyResourcePayload(resource));
        const [issues, pullRequests] = await Promise.all([
          vcsService.listIssues(connectionHandle, owner, repo, { state: 'open' }),
          vcsService.listPullRequests(connectionHandle, owner, repo, { state: 'open' }),
        ]);
        return NextResponse.json({
          issues: [
            ...(issues || []).map((issue) => ({
              id: issue.number,
              number: issue.number,
              title: issue.title,
              html_url: issue.url,
            })),
            ...(pullRequests || []).map((pullRequest) => ({
              id: pullRequest.number,
              number: pullRequest.number,
              title: pullRequest.title,
              html_url: pullRequest.url,
              pull_request: {},
            })),
          ],
        });
      }
      default:
        return NextResponse.json(buildEmptyResourcePayload(resource));
    }
  } catch (routeError) {
    const message =
      routeError instanceof Error ? routeError.message : 'Failed to load VCS route data';

    return NextResponse.json(
      {
        ...buildEmptyResourcePayload(resource),
        error: message,
      },
      { status: 200 },
    );
  }
}
