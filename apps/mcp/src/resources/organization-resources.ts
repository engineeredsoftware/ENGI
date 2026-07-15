/**
 * Bitcode MCP Organization Resources - ORM Integration
 * 
 * Updated to use ORM models for all database operations.
 * Provides access to organization-level data through MCP resources.
 * 
 * @doc-code
 * type: resources
 * category: organization
 * pattern: orm-integration
 */

import { z } from 'zod';
import { logger } from '@bitcode/logger';
import { createClient } from '@bitcode/supabase';
import {
  OrganizationsModel,
  OrganizationMembersModel,
  UserProfilesModel,
  UserConnectionsModel,
  PipelineExecutionsModel,
  OrganizationBtdTreasuryModel,
} from '@bitcode/orm';
import type { MCPAuthContext } from '../types';

/**
 * MCP Resource interface
 */
interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
  read?: (uri: string, context: MCPAuthContext) => Promise<any>;
}

function getTimestamp(value: string | null | undefined): number {
  return value ? new Date(value).getTime() : 0;
}

function getRunMetadata(run: { metadata?: unknown }): Record<string, any> {
  return (run.metadata as Record<string, any> | null) || {};
}

/**
 * Extract organization ID from URI
 */
function extractOrganizationId(uri: string): string | null {
  const match = uri.match(/\/organizations\/([a-f0-9-]{36})/);
  return match?.[1] || null;
}

/**
 * Parse query parameters from URI
 */
function parseQueryParams(uri: string): Record<string, any> {
  const url = new URL(uri, 'http://localhost');
  const params: Record<string, any> = {};
  
  for (const [key, value] of url.searchParams) {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      params[arrayKey] = params[arrayKey] || [];
      params[arrayKey].push(value);
    } else if (value === 'true' || value === 'false') {
      params[key] = value === 'true';
    } else if (!isNaN(Number(value))) {
      params[key] = Number(value);
    } else {
      params[key] = value;
    }
  }
  
  return params;
}

/**
 * Get organization analytics using ORM
 */
async function getOrganizationAnalytics(
  organizationId: string,
  context: MCPAuthContext,
  options: any = {}
): Promise<any> {
  const supabase = createClient();
  const organizations = new OrganizationsModel(supabase);
  const organizationMembers = new OrganizationMembersModel(supabase);
  const userProfiles = new UserProfilesModel(supabase);
  const userConnections = new UserConnectionsModel(supabase);
  const runs = new PipelineExecutionsModel(supabase);
  const organizationBtdTreasury = new OrganizationBtdTreasuryModel(supabase);

  try {
    // Verify organization access
    if (context.organizationRole !== 'admin' && 
        context.organizationRole !== 'owner' && 
        organizationId !== context.organizationId) {
      throw new Error('Insufficient permissions to view organization analytics');
    }

    // Get organization details
    const organization = await organizations.getById(organizationId);
    if (!organization) {
      throw new Error('Organization not found or access denied');
    }

    // Get team members
    const members = await organizationMembers.getMembers(organizationId);
    
    // Get member profiles
    const memberProfiles = await Promise.all(
      members.map(async (member) => {
        const profile = await userProfiles.getByUserId(member.user_id);
        return { ...member, profile };
      })
    );

    // Get organization treasury balance
    const btdTreasury = await organizationBtdTreasury.getByOrganizationId(organizationId);

    // Get repository connections
    const connections = await userConnections.getByOrganization(organizationId);

    // Get pipeline runs for analytics
    const allRuns = await runs.getAll();
    const timeframeStart = getTimeframeStart(options.timeframe || '30d').getTime();
    const orgRuns = allRuns.filter((run) => {
      const metadata = getRunMetadata(run);
      return metadata.organizationId === organizationId &&
             getTimestamp(run.created_at) >= timeframeStart;
    });

    // Analyze the data
    const analytics = analyzeOrganizationData({
      organization,
      members: memberProfiles,
      runs: orgRuns,
      connections,
      btdTreasury,
      options
    });

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        btdBalance: btdTreasury?.balance || 0,
        memberCount: members.length,
        activeRepositories: connections.filter(c => c.is_active).length,
        createdAt: organization.created_at
      },
      
      ...analytics,
      
      metadata: {
        generatedAt: new Date().toISOString(),
        timeframe: options.timeframe || '30d',
        dataPoints: orgRuns.length + members.length + connections.length,
        organizationId
      }
    };

  } catch (error) {
    logger.error('Error getting organization analytics', { organizationId, error });
    throw error;
  }
}

/**
 * Get timeframe start date
 */
function getTimeframeStart(timeframe: string): Date {
  const now = new Date();
  const days = parseInt(timeframe.replace('d', ''));
  now.setDate(now.getDate() - days);
  return now;
}

/**
 * Analyze organization data
 */
function analyzeOrganizationData(data: {
  organization: any;
  members: any[];
  runs: any[];
  connections: any[];
  btdTreasury: any;
  options: any;
}): any {
  const { members, runs, connections, btdTreasury, options } = data;

  // Team analytics
  const teamAnalytics = {
    totalMembers: members.length,
    roleDistribution: members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    averageTenure: members.length > 0 
      ? members.reduce((sum, member) => {
          const tenure = Date.now() - new Date(member.joined_at).getTime();
          return sum + tenure;
        }, 0) / members.length / (1000 * 60 * 60 * 24) // days
      : 0,
    
    activeMembers: members.filter(member => {
      // Check if member has recent pipeline activity
      return runs.some(run => {
        const metadata = run.metadata as any;
        return metadata?.userId === member.user_id &&
               new Date(run.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      });
    }).length
  };

  // Pipeline analytics
  const pipelineAnalytics = {
    totalPipelines: runs.length,
    
    successRate: runs.length > 0 
      ? runs.filter(r => r.status === 'completed').length / runs.length
      : 0,
    
    pipelineTypeDistribution: runs.reduce((acc, run) => {
      const pipeline = (run.metadata as any)?.pipeline || 'asset-pack';
      acc[pipeline] = (acc[pipeline] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    totalMeasuredBtd: runs.reduce((sum, run) => 
      sum + (((run.metadata as any)?.measuredBtd) || 0), 0
    ),
    
    averageMeasuredBtdPerPipeline: runs.length > 0 
      ? runs.reduce((sum, run) => 
          sum + (((run.metadata as any)?.measuredBtd) || 0), 0
        ) / runs.length
      : 0,
    
    mostActiveUser: getMostActiveUser(runs, members),
    
    dailyActivity: getDailyActivity(runs)
  };

  // Repository analytics
  const repositoryAnalytics = {
    totalRepositories: connections.length,
    
    providerDistribution: connections.reduce((acc, conn) => {
      acc[conn.provider] = (acc[conn.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    repositoryActivity: getRepositoryActivity(runs, connections),
    
    mostActiveRepository: getMostActiveRepository(runs)
  };

  // Productivity metrics
  const productivityMetrics = {
    pipelinesPerMember: teamAnalytics.totalMembers > 0 
      ? pipelineAnalytics.totalPipelines / teamAnalytics.totalMembers
      : 0,
    
    measuredBtdPerMember: teamAnalytics.totalMembers > 0 
      ? pipelineAnalytics.totalMeasuredBtd / teamAnalytics.totalMembers
      : 0,
    
    repositoriesPerMember: teamAnalytics.totalMembers > 0 
      ? repositoryAnalytics.totalRepositories / teamAnalytics.totalMembers
      : 0,
    
    adoptionRate: teamAnalytics.totalMembers > 0 
      ? teamAnalytics.activeMembers / teamAnalytics.totalMembers
      : 0
  };

  // Quality metrics
  const qualityMetrics = {
    averageConfidence: runs.length > 0 
      ? runs
          .map(r => (r.metadata as any)?.confidence || 0)
          .filter(c => c > 0)
          .reduce((sum, conf, _, arr) => sum + conf / arr.length, 0)
      : 0,
    
    errorRate: 1 - pipelineAnalytics.successRate,
    
    consistencyScore: calculateConsistencyScore(runs),
    
    improvementTrend: calculateImprovementTrend(runs)
  };

  return {
    team: teamAnalytics,
    pipelines: pipelineAnalytics,
    repositories: repositoryAnalytics,
    productivity: productivityMetrics,
    quality: qualityMetrics,
    
    insights: generateOrganizationInsights({
      teamAnalytics,
      pipelineAnalytics,
      repositoryAnalytics,
      productivityMetrics,
      qualityMetrics
    }),
    
    recommendations: generateOrganizationRecommendations({
      teamAnalytics,
      pipelineAnalytics,
      repositoryAnalytics,
      productivityMetrics,
      qualityMetrics
    })
  };
}

/**
 * Helper functions for analytics calculations
 */
function getMostActiveUser(runs: any[], members: any[]): any {
  const userActivity = runs.reduce((acc, run) => {
    const userId = (run.metadata as any)?.userId;
    if (userId) {
      acc[userId] = (acc[userId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const mostActiveUserId = (Object.entries(userActivity) as Array<[string, number]>)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  if (!mostActiveUserId) return null;

  const member = members.find(m => m.user_id === mostActiveUserId);
  return {
    userId: mostActiveUserId,
    name: member?.profile?.display_name || member?.profile?.full_name || 'Unknown',
    pipelineCount: userActivity[mostActiveUserId],
    role: member?.role || 'unknown'
  };
}

function getDailyActivity(runs: any[]): Record<string, number> {
  return runs.reduce((acc, run) => {
    const date = run.created_at
      ? new Date(run.created_at).toISOString().split('T')[0]
      : 'unknown';
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function getRepositoryActivity(runs: any[], connections: any[]): any[] {
  const repoActivity = runs.reduce((acc, run) => {
    const repository = (run.metadata as any)?.repository;
    if (repository) {
      const repoKey = `${repository.owner}/${repository.name}`;
      acc[repoKey] = (acc[repoKey] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (Object.entries(repoActivity) as Array<[string, number]>)
    .map(([repo, count]) => ({
      repository: repo,
      pipelineCount: count,
      lastActivity: getLastActivityForRepo(repo, runs)
    }))
    .sort((a, b) => b.pipelineCount - a.pipelineCount);
}

function getMostActiveRepository(runs: any[]): string | null {
  const repoActivity = runs.reduce((acc, run) => {
    const repository = (run.metadata as any)?.repository;
    if (repository) {
      const repoKey = `${repository.owner}/${repository.name}`;
      acc[repoKey] = (acc[repoKey] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (Object.entries(repoActivity) as Array<[string, number]>)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
}

function getLastActivityForRepo(repo: string, runs: any[]): string | null {
  const [owner, name] = repo.split('/');
  const repoRuns = runs.filter(r => {
    const repository = (r.metadata as any)?.repository;
    return repository?.owner === owner && repository?.name === name;
  });
  
  if (repoRuns.length === 0) return null;
  
  return repoRuns
    .sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at))[0]
    .created_at;
}

function calculateConsistencyScore(runs: any[]): number {
  if (runs.length < 2) return 1;

  const successRates = [];
  const weeklyGroups = groupByWeek(runs);
  
  for (const pipelineRuns of Object.values(weeklyGroups)) {
    if (pipelineRuns.length > 0) {
      const successful = pipelineRuns.filter(r => r.status === 'completed').length;
      successRates.push(successful / pipelineRuns.length);
    }
  }

  if (successRates.length < 2) return 1;

  const mean = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;
  const variance = successRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / successRates.length;
  
  // Return consistency score (1 = perfectly consistent, 0 = highly variable)
  return Math.max(0, 1 - Math.sqrt(variance));
}

function calculateImprovementTrend(runs: any[]): 'improving' | 'declining' | 'stable' {
  const weeklyGroups = groupByWeek(runs);
  const weeks = Object.keys(weeklyGroups).sort();
  
  if (weeks.length < 2) return 'stable';

  const firstHalfWeeks = weeks.slice(0, Math.floor(weeks.length / 2));
  const secondHalfWeeks = weeks.slice(Math.floor(weeks.length / 2));

  const firstHalfSuccess = firstHalfWeeks.reduce((total, week) => {
    const weekRuns = weeklyGroups[week];
    return total + weekRuns.filter(r => r.status === 'completed').length;
  }, 0) / firstHalfWeeks.reduce((total, week) => total + weeklyGroups[week].length, 0);

  const secondHalfSuccess = secondHalfWeeks.reduce((total, week) => {
    const weekRuns = weeklyGroups[week];
    return total + weekRuns.filter(r => r.status === 'completed').length;
  }, 0) / secondHalfWeeks.reduce((total, week) => total + weeklyGroups[week].length, 0);

  const improvement = secondHalfSuccess - firstHalfSuccess;
  const threshold = 0.05; // 5% threshold

  if (Math.abs(improvement) < threshold) return 'stable';
  return improvement > 0 ? 'improving' : 'declining';
}

function groupByWeek(runs: any[]): Record<string, any[]> {
  return runs.reduce((groups, run) => {
    const date = new Date(run.created_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    groups[weekKey] = groups[weekKey] || [];
    groups[weekKey].push(run);
    return groups;
  }, {} as Record<string, any[]>);
}

/**
 * Generate organization insights
 */
function generateOrganizationInsights(metrics: any): any[] {
  const insights = [];

  // Team insights
  if (metrics.teamAnalytics.activeMembers / metrics.teamAnalytics.totalMembers > 0.8) {
    insights.push({
      type: 'positive',
      category: 'team',
      title: 'High Team Adoption',
      description: `${Math.round(metrics.productivityMetrics.adoptionRate * 100)}% of team members are actively using Bitcode pipelines`,
      confidence: 0.9
    });
  }

  // Productivity insights
  if (metrics.productivityMetrics.pipelinesPerMember > 10) {
    insights.push({
      type: 'positive',
      category: 'productivity',
      title: 'High Productivity',
      description: `Team is averaging ${Math.round(metrics.productivityMetrics.pipelinesPerMember)} pipelines per member`,
      confidence: 0.85
    });
  }

  // Quality insights
  if (metrics.qualityMetrics.averageConfidence > 0.85) {
    insights.push({
      type: 'positive',
      category: 'quality',
      title: 'High Quality Output',
      description: `Pipeline confidence score of ${Math.round(metrics.qualityMetrics.averageConfidence * 100)}% indicates high-quality results`,
      confidence: 0.88
    });
  }

  // Repository coverage insights
  if (metrics.repositoryAnalytics.totalRepositories < 5) {
    insights.push({
      type: 'opportunity',
      category: 'coverage',
      title: 'Expansion Opportunity',
      description: `Only ${metrics.repositoryAnalytics.totalRepositories} repositories connected - consider expanding coverage`,
      confidence: 0.75
    });
  }

  return insights;
}

/**
 * Generate organization recommendations
 */
function generateOrganizationRecommendations(metrics: any): any[] {
  const recommendations = [];

  // Low adoption recommendation
  if (metrics.productivityMetrics.adoptionRate < 0.5) {
    recommendations.push({
      category: 'adoption',
      priority: 'high',
      title: 'Increase Team Adoption',
      description: `Only ${Math.round(metrics.productivityMetrics.adoptionRate * 100)}% of team members are actively using pipelines`,
      actions: [
        'Provide training sessions for inactive team members',
        'Create onboarding guides for common use cases',
        'Establish pipeline usage metrics and goals'
      ],
      impact: 'high',
      effort: 'medium'
    });
  }

  // Quality improvement recommendation
  if (metrics.pipelineAnalytics.successRate < 0.8) {
    recommendations.push({
      category: 'quality',
      priority: 'high',
      title: 'Improve Pipeline Success Rate',
      description: `Current success rate of ${Math.round(metrics.pipelineAnalytics.successRate * 100)}% needs improvement`,
      actions: [
        'Review and address common failure patterns',
        'Implement better error handling and validation',
        'Provide templates for common use cases'
      ],
      impact: 'high',
      effort: 'medium'
    });
  }

  // Cost optimization recommendation
  if (metrics.pipelineAnalytics.averageMeasuredBtdPerPipeline > 150) {
    recommendations.push({
      category: 'cost',
      priority: 'medium',
      title: 'Optimize $BTD Usage',
      description: `Average of ${Math.round(metrics.pipelineAnalytics.averageMeasuredBtdPerPipeline)} measured $BTD per pipeline could be optimized`,
      actions: [
        'Review prompt optimization strategies',
        'Train team on efficient pipeline usage',
        'Implement measured $BTD holding-read monitoring'
      ],
      impact: 'medium',
      effort: 'low'
    });
  }

  return recommendations;
}

/**
 * Get team members data using ORM
 */
async function getTeamMembers(organizationId: string, context: MCPAuthContext): Promise<any> {
  const supabase = createClient();
  const organizationMembers = new OrganizationMembersModel(supabase);
  const userProfiles = new UserProfilesModel(supabase);
  const runs = new PipelineExecutionsModel(supabase);

  try {
    // Verify organization access
    if (context.organizationRole !== 'admin' && 
        context.organizationRole !== 'owner' && 
        organizationId !== context.organizationId) {
      throw new Error('Insufficient permissions to view team members');
    }

    // Get members
    const members = await organizationMembers.getMembers(organizationId);
    
    // Get member profiles and activity
    const memberData = await Promise.all(
      members.map(async (member) => {
        const profile = await userProfiles.getByUserId(member.user_id);
        
        // Get recent activity
        const allRuns = await runs.getAll();
        const memberRuns = allRuns.filter((run) => {
          const metadata = getRunMetadata(run);
          return metadata.userId === member.user_id &&
                 getTimestamp(run.created_at) >= getTimeframeStart('30d').getTime();
        });

        return {
          userId: member.user_id,
          name: profile?.display_name || profile?.full_name || 'Unknown',
          email: profile?.email || '',
          avatar: profile?.avatar_url,
          role: member.role,
          btcFeeBudget: member.btc_fee_budget,
          isActive: member.is_active,
          joinedAt: member.joined_at,
          recentActivity: {
            pipelineCount: memberRuns.length,
            successRate: memberRuns.length > 0
              ? memberRuns.filter((run) => run.status === 'completed').length / memberRuns.length
              : 0,
            lastActive: memberRuns.length > 0
              ? memberRuns.sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at))[0].created_at
              : null
          }
        };
      })
    );

    return {
      members: memberData,
      
      summary: {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.is_active).length,
        roleDistribution: members.reduce((acc, member) => {
          acc[member.role] = (acc[member.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };

  } catch (error) {
    logger.error('Error getting team members', { organizationId, error });
    throw error;
  }
}

/**
 * Register organization resources
 */
export function registerOrganizationResources(): MCPResource[] {
  return [
    {
      uri: 'bitcode://resources/organizations/{id}/analytics',
      name: 'Organization Analytics',
      description: 'Comprehensive analytics and insights for organization-level data',
      mimeType: 'application/json',
      
      read: async (uri: string, context: MCPAuthContext) => {
        const organizationId = extractOrganizationId(uri);
        if (!organizationId) {
          throw new Error('Invalid organization ID in URI');
        }
        
        const options = parseQueryParams(uri);
        return getOrganizationAnalytics(organizationId, context, options);
      }
    },

    {
      uri: 'bitcode://resources/organizations/{id}/members',
      name: 'Organization Team Members',
      description: 'Team member information and activity analytics',
      mimeType: 'application/json',
      
      read: async (uri: string, context: MCPAuthContext) => {
        const organizationId = extractOrganizationId(uri);
        if (!organizationId) {
          throw new Error('Invalid organization ID in URI');
        }
        
        return getTeamMembers(organizationId, context);
      }
    }
  ];
}
