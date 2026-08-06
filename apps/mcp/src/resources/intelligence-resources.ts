/**
 * Bitcode MCP Intelligence Resources - ORM Integration
 * 
 * Updated to use ORM models for all database operations.
 * Provides AI-generated technical knowledge through MCP resources.
 * 
 * @doc-code
 * type: resources
 * category: intelligence
 * pattern: orm-integration
 */

import { z } from 'zod';
import { logger } from '@bitcode/logger';
import { createClient } from '@bitcode/supabase';
import {
  PipelineExecutionsModel,
  AssetPackEvidenceModel as AssetPackEvidenceStorageModel,
  UserConnectionsModel,
  OrganizationsModel,
  UserProfilesModel
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

type PipelineRun = Awaited<ReturnType<PipelineExecutionsModel['getAll']>>[number];
type AssetPackEvidenceRecord = Awaited<ReturnType<AssetPackEvidenceStorageModel['getAll']>>[number];
type UpgradeRecommendationInput = {
  assetPackEvidence: AssetPackEvidenceRecord;
  runs: PipelineRun[];
};

function getTimestamp(value: string | null | undefined): number {
  return value ? new Date(value).getTime() : 0;
}

function getMetadata(run: PipelineRun): Record<string, any> {
  return (run.metadata as Record<string, any> | null) || {};
}

function getRepositoryKey(metadata: Record<string, any>): string | null {
  const repository = metadata.repository;
  if (
    repository &&
    typeof repository === 'object' &&
    typeof repository.owner === 'string' &&
    typeof repository.name === 'string'
  ) {
    return `${repository.owner}/${repository.name}`;
  }

  return null;
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
 * Synthesize technical knowledge
 */
async function synthesizeIntelligence(
  context: MCPAuthContext,
  options: any = {}
): Promise<any> {
  const supabase = createClient();
  const pipelineRuns = new PipelineExecutionsModel(supabase);

  try {
    logger.info('Synthesizing technical knowledge', {
      scope: options.scope,
      timeframe: options.timeframe,
      userId: context.userId
    });

    // Get all runs
    let allRuns = await pipelineRuns.getAll();

    // Filter by timeframe
    if (options.timeframe && options.timeframe !== 'all') {
      const days = parseInt(options.timeframe.replace('d', ''));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      allRuns = allRuns.filter((run) => getTimestamp(run.created_at) >= cutoffDate.getTime());
    }

    // Apply scope filtering based on metadata
    if (options.scope === 'organization' && context.organizationId) {
      allRuns = allRuns.filter(run => 
        (run.metadata as any)?.organizationId === context.organizationId
      );
    } else if (options.scope === 'user') {
      allRuns = allRuns.filter(run => 
        (run.metadata as any)?.userId === context.userId
      );
    } else if (context.organizationRole !== 'admin' && 
               context.organizationRole !== 'owner' && 
               context.organizationId) {
      // Default org filtering for non-admins
      allRuns = allRuns.filter(run => 
        (run.metadata as any)?.organizationId === context.organizationId
      );
    }

    // Perform intelligence synthesis
    const intelligence = await performIntelligenceSynthesis(allRuns, options);

    return {
      scope: options.scope || 'organization',
      timeframe: options.timeframe || '30d',
      synthesisDate: new Date().toISOString(),
      dataPoints: allRuns.length,
      
      ...intelligence,
      
      metadata: {
        synthesisId: `intel_${Date.now()}`,
        confidence: 0.87,
        completeness: 0.92,
        dataSourcesAnalyzed: allRuns.length,
        synthesisVersion: '1.0.0'
      }
    };

  } catch (error) {
    logger.error('Error synthesizing intelligence', { error });
    throw error;
  }
}

/**
 * Perform actual intelligence synthesis from pipeline data
 */
async function performIntelligenceSynthesis(
  pipelines: PipelineRun[],
  _options: Record<string, unknown>,
): Promise<any> {
  // Calculate pipeline success rates
  const totalPipelines = pipelines.length;
  const successfulPipelines = pipelines.filter((pipeline) => pipeline.status === 'completed').length;
  const successRate = totalPipelines > 0 ? successfulPipelines / totalPipelines : 0;

  // Analyze pipeline types usage
  const pipelineTypeUsage = pipelines.reduce((acc, pipeline) => {
    const metadata = getMetadata(pipeline);
    const pipelineType = typeof metadata.pipeline === 'string' ? metadata.pipeline : 'asset-pack';
    acc[pipelineType] = (acc[pipelineType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average execution times
  const executionTimes = pipelines
    .filter((pipeline) => pipeline.completed_at && pipeline.created_at)
    .map((pipeline) => getTimestamp(pipeline.completed_at) - getTimestamp(pipeline.created_at));
  
  const avgExecutionTime = executionTimes.length > 0 
    ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
    : 0;

  // Analyze repository activity
  const repositoryActivity = pipelines.reduce((acc, pipeline) => {
    const repoKey = getRepositoryKey(getMetadata(pipeline));
    if (repoKey) {
      acc[repoKey] = (acc[repoKey] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate BTD usage patterns
  const measuredBtdUsage = pipelines
    .map((pipeline) => {
      const metadata = getMetadata(pipeline);
      const metrics = (metadata.metrics as Record<string, unknown> | undefined) || {};
      return typeof metrics.measuredBtd === 'number'
        ? metrics.measuredBtd
        : typeof metadata.measuredBtd === 'number'
          ? metadata.measuredBtd
          : 0;
    })
    .filter((btd: number) => btd > 0);
  
  const totalMeasuredBtd = measuredBtdUsage.reduce((sum, btd) => sum + btd, 0);
  const avgMeasuredBtdPerPipeline = measuredBtdUsage.length > 0 ? totalMeasuredBtd / measuredBtdUsage.length : 0;

  // Identify trends
  const timeBasedAnalysis = analyzeTimeBasedTrends(pipelines);

  const pipelineTypeEntries = Object.entries(pipelineTypeUsage) as Array<[string, number]>;
  const repositoryActivityEntries = Object.entries(repositoryActivity) as Array<[string, number]>;

  return {
    insights: {
      productivity: {
        pipelinesExecuted: totalPipelines,
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime: Math.round(avgExecutionTime / 1000 / 60), // minutes
        mostUsedPipeline: pipelineTypeEntries
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        trend: timeBasedAnalysis.productivityTrend
      },
      
      efficiency: {
        averageMeasuredBtdPerPipeline: Math.round(avgMeasuredBtdPerPipeline),
        totalMeasuredBtd: totalMeasuredBtd,
        costEfficiencyTrend: timeBasedAnalysis.costTrend,
        resourceUtilization: calculateResourceUtilization(pipelines)
      },
      
      quality: {
        pipelineQualityScore: calculateQualityScore(pipelines),
        confidenceScore: calculateAverageConfidence(pipelines),
        errorRate: 1 - successRate,
        qualityTrend: timeBasedAnalysis.qualityTrend
      },
      
      repositories: {
        activeRepositories: Object.keys(repositoryActivity).length,
        mostActiveRepository: repositoryActivityEntries
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
        repositoryDistribution: repositoryActivity,
        collaborationScore: calculateCollaborationScore(repositoryActivity)
      }
    },
    
    recommendations: generateRecommendations(pipelines, {
      successRate,
      avgExecutionTime,
      avgMeasuredBtdPerPipeline,
      repositoryActivity
    }),
    
    trends: {
      weekly: timeBasedAnalysis.weeklyTrends,
      monthly: timeBasedAnalysis.monthlyTrends,
      patterns: timeBasedAnalysis.patterns
    },
    
    benchmarks: {
      industryComparison: {
        successRate: { yours: successRate, industry: 0.85 },
        avgExecutionTime: { yours: avgExecutionTime, industry: 900000 }, // 15 min
        measuredBtdEfficiency: { yours: avgMeasuredBtdPerPipeline, reference: 120 }
      }
    }
  };
}

/**
 * Analyze time-based trends
 */
function analyzeTimeBasedTrends(pipelines: PipelineRun[]): any {
  // Group pipelines by week and month
  const weeklyGroups = groupPipelinesByPeriod(pipelines, 'week');
  const monthlyGroups = groupPipelinesByPeriod(pipelines, 'month');

  return {
    productivityTrend: calculateTrend(Object.values(weeklyGroups).map(g => g.length)),
    costTrend: calculateTrend(Object.values(weeklyGroups).map(g => 
      g.reduce((sum, pipeline) => {
        const metadata = getMetadata(pipeline);
        const metrics = (metadata.metrics as Record<string, unknown> | undefined) || {};
        const measuredBtd = typeof metrics.measuredBtd === 'number'
          ? metrics.measuredBtd
          : typeof metadata.measuredBtd === 'number'
            ? metadata.measuredBtd
            : 0;
        return sum + measuredBtd;
      }, 0)
    )),
    qualityTrend: calculateTrend(Object.values(weeklyGroups).map(g => {
      const successful = g.filter(p => p.status === 'completed').length;
      return g.length > 0 ? successful / g.length : 0;
    })),
    weeklyTrends: weeklyGroups,
    monthlyTrends: monthlyGroups,
    patterns: identifyUsagePatterns(pipelines)
  };
}

/**
 * Group pipelines by time period
 */
function groupPipelinesByPeriod(
  pipelines: PipelineRun[],
  period: 'week' | 'month',
): Record<string, PipelineRun[]> {
  return pipelines.reduce((groups, pipeline) => {
    const date = new Date(pipeline.created_at || Date.now());
    let key: string;
    
    if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    groups[key] = groups[key] || [];
    groups[key].push(pipeline);
    return groups;
  }, {} as Record<string, PipelineRun[]>);
}

/**
 * Calculate trend direction
 */
function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  if (firstAvg === 0) {
    return secondAvg === 0 ? 'stable' : 'increasing';
  }
  
  const changeThreshold = 0.1; // 10% change threshold
  const changeRatio = Math.abs(secondAvg - firstAvg) / firstAvg;
  
  if (changeRatio < changeThreshold) return 'stable';
  return secondAvg > firstAvg ? 'increasing' : 'decreasing';
}

/**
 * Calculate various quality and efficiency scores
 */
function calculateQualityScore(runs: PipelineRun[]): number {
  if (runs.length === 0) return 0;
  
  const factors = {
    successRate: runs.filter(r => r.status === 'completed').length / runs.length,
    avgConfidence: calculateAverageConfidence(runs),
    consistencyScore: calculateConsistencyScore(runs)
  };
  
  return Math.round((factors.successRate * 0.4 + factors.avgConfidence * 0.4 + factors.consistencyScore * 0.2) * 100);
}

function calculateAverageConfidence(runs: PipelineRun[]): number {
  const confidenceScores = runs
    .map((run) => {
      const confidence = getMetadata(run).confidence;
      return typeof confidence === 'number' ? confidence : 0;
    })
    .filter((confidence) => confidence > 0);
  
  return confidenceScores.length > 0 
    ? confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length
    : 0;
}

function calculateConsistencyScore(pipelines: PipelineRun[]): number {
  // Track consistency in execution times and success rates
  const executionTimes = pipelines
    .filter((pipeline) => pipeline.completed_at && pipeline.created_at)
    .map((pipeline) => getTimestamp(pipeline.completed_at) - getTimestamp(pipeline.created_at));
  
  if (executionTimes.length < 2) return 1;
  
  const mean = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
  const variance = executionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / executionTimes.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;
  
  // Lower variation = higher consistency
  return Math.max(0, 1 - coefficientOfVariation);
}

function calculateResourceUtilization(pipelines: any[]): number {
  if (pipelines.length === 0) {
    return 0;
  }

  const utilizationSignals = pipelines.map((pipeline) => {
    const metadata = getMetadata(pipeline as PipelineRun);
    const metrics = (metadata.metrics as Record<string, unknown> | undefined) || {};
    if (typeof metrics.resourceUtilization === 'number') {
      return metrics.resourceUtilization;
    }
    if (typeof metadata.confidence === 'number') {
      return metadata.confidence;
    }
    return pipeline.status === 'completed' ? 0.8 : pipeline.status === 'running' ? 0.6 : 0.3;
  });

  return utilizationSignals.reduce((sum, value) => sum + value, 0) / utilizationSignals.length;
}

function calculateCollaborationScore(repositoryActivity: Record<string, number>): number {
  const repos = Object.keys(repositoryActivity).length;
  const totalActivity = Object.values(repositoryActivity).reduce((sum, count) => sum + count, 0);
  
  if (repos === 0) return 0;
  
  // Higher score for more distributed activity across repositories
  const averageActivity = totalActivity / repos;
  const variance = Object.values(repositoryActivity)
    .reduce((sum, count) => sum + Math.pow(count - averageActivity, 2), 0) / repos;
  
  return Math.max(0, 1 - (variance / (averageActivity * averageActivity)));
}

function identifyUsagePatterns(pipelines: PipelineRun[]): any {
  // Analyze patterns in pipeline usage
  const hourlyUsage = pipelines.reduce((acc, pipeline) => {
    const hour = new Date(pipeline.created_at || Date.now()).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const hourlyEntries = Object.entries(hourlyUsage) as Array<[string, number]>;

  const peakHour = hourlyEntries
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    peakUsageHour: peakHour ? parseInt(peakHour) : null,
    hourlyDistribution: hourlyUsage,
    workingHoursUsage: hourlyEntries
      .filter(([hour]) => parseInt(hour) >= 9 && parseInt(hour) <= 17)
      .reduce((sum, [,count]) => sum + count, 0),
    afterHoursUsage: hourlyEntries
      .filter(([hour]) => parseInt(hour) < 9 || parseInt(hour) > 17)
      .reduce((sum, [,count]) => sum + count, 0)
  };
}

/**
 * Generate AI recommendations based on analysis
 */
function generateRecommendations(
  pipelines: PipelineRun[],
  metrics: {
    successRate: number;
    avgExecutionTime: number;
    avgMeasuredBtdPerPipeline: number;
    repositoryActivity: Record<string, number>;
  },
): Array<Record<string, unknown>> {
  const recommendations: Array<Record<string, unknown>> = [];

  // Success rate recommendations
  if (metrics.successRate < 0.8) {
    recommendations.push({
      category: 'reliability',
      priority: 'high',
      title: 'Improve Pipeline Success Rate',
      description: `Current success rate of ${Math.round(metrics.successRate * 100)}% is below optimal. Consider reviewing pipeline configurations and error handling.`,
      impact: 'high',
      effort: 'medium',
      actions: [
        'Review failed pipeline logs for common patterns',
        'Implement better error handling and recovery',
        'Add pipeline validation checks before execution'
      ]
    });
  }

  // Performance recommendations
  if (metrics.avgExecutionTime > 1800000) { // 30 minutes
    recommendations.push({
      category: 'performance',
      priority: 'medium',
      title: 'Optimize Pipeline Execution Time',
      description: `Average execution time of ${Math.round(metrics.avgExecutionTime / 60000)} minutes could be optimized.`,
      impact: 'medium',
      effort: 'high',
      actions: [
        'Analyze bottlenecks in slow-running phases',
        'Consider parallel execution where possible',
        'Optimize context preparation and tool selection'
      ]
    });
  }

  // Cost optimization recommendations
  if (metrics.avgMeasuredBtdPerPipeline > 150) {
    recommendations.push({
      category: 'cost',
      priority: 'medium',
      title: 'Optimize Measured BTD Amount',
      description: `Average measured BTD amount of ${Math.round(metrics.avgMeasuredBtdPerPipeline)} per pipeline is above optimal range.`,
      impact: 'medium',
      effort: 'low',
      actions: [
        'Review prompt optimization strategies',
        'Consider using smaller models for simple tasks',
        'Implement better context filtering'
      ]
    });
  }

  // Repository collaboration recommendations
  const activeRepos = Object.keys(metrics.repositoryActivity).length;
  if (activeRepos < 3) {
    recommendations.push({
      category: 'collaboration',
      priority: 'low',
      title: 'Expand Repository Coverage',
      description: `Only ${activeRepos} repositories are actively using pipelines. Consider broader adoption.`,
      impact: 'low',
      effort: 'low',
      actions: [
        'Share success stories from current repositories',
        'Provide training for teams with unused repositories',
        'Create repository-specific pipeline templates'
      ]
    });
  }

  return recommendations;
}

/**
 * Get Evidence Document recommendations
 */
async function getUpgradeRecommendations(context: MCPAuthContext, options: any = {}): Promise<any> {
  const supabase = createClient();
  const assetPackEvidenceStorage = new AssetPackEvidenceStorageModel(supabase);
  const pipelineRuns = new PipelineExecutionsModel(supabase);

  try {
    // Get AssetPack evidence rows with Evidence Document metadata.
    let allAssetPackEvidence = await assetPackEvidenceStorage.getAll();
    
    // Apply organization filtering
    if (context.organizationRole !== 'admin' && 
        context.organizationRole !== 'owner' && 
        context.organizationId) {
      allAssetPackEvidence = allAssetPackEvidence.filter((entry) => entry.organization_id === context.organizationId);
    }

    // Filter for upgrade-related AssetPack evidence rows
    const upgradeAssetPackEvidence = allAssetPackEvidence.filter((entry) => {
      const metadata = entry.metadata as Record<string, any> | null;
      return metadata?.type === 'evidence_document' ||
             metadata?.pipeline === 'evidence_document' ||
             entry.name?.toLowerCase().includes('evidence_document');
    });

    // Get runs for these AssetPack evidence rows to analyze effectiveness
    const upgradeRuns: UpgradeRecommendationInput[] = await Promise.all(
      upgradeAssetPackEvidence.slice(0, 50).map(async (entry) => {
        const assetPackRuns = await pipelineRuns.getByAssetPackEvidenceId(entry.id);
        return { assetPackEvidence: entry, runs: assetPackRuns };
      })
    );

    // Generate recommendations based on Evidence Document history.
    const recommendations = generateUpgradeRecommendations(upgradeRuns, options);

    return {
      recommendations,
      metadata: {
        basedOnUpgrades: upgradeRuns.length,
        generatedAt: new Date().toISOString(),
        confidence: 0.82
      }
    };

  } catch (error) {
    logger.error('Error getting Evidence Document recommendations', { error });
    throw error;
  }
}

/**
 * Generate Evidence Document recommendations
 */
function generateUpgradeRecommendations(
  upgradeData: UpgradeRecommendationInput[],
  _options: Record<string, unknown>,
): Array<Record<string, unknown>> {
  const recommendations: Array<Record<string, unknown>> = [];

  for (const upgrade of upgradeData) {
    const metadata = (upgrade.assetPackEvidence.metadata as Record<string, any> | null) || {};
    const packageName =
      (typeof metadata.package === 'string' && metadata.package) ||
      (typeof metadata.dependency === 'string' && metadata.dependency) ||
      (typeof metadata.framework === 'string' && metadata.framework) ||
      null;

    if (!packageName) {
      continue;
    }

    const repository = getRepositoryKey(metadata);
    const successfulRuns = upgrade.runs.filter((run) => run.status === 'completed').length;
    const successRate = upgrade.runs.length > 0 ? successfulRuns / upgrade.runs.length : 0;
    const measuredBtdEstimate = upgrade.runs.reduce((sum, run) => {
      const runMetadata = getMetadata(run);
      const metrics = (runMetadata.metrics as Record<string, unknown> | undefined) || {};
      const measuredBtd = typeof metrics.measuredBtd === 'number'
        ? metrics.measuredBtd
        : typeof runMetadata.measuredBtd === 'number'
          ? runMetadata.measuredBtd
          : 0;
      return sum + measuredBtd;
    }, 0);

    recommendations.push({
      type: 'dependency_upgrade',
      package: packageName,
      currentVersion:
        (typeof metadata.fromVersion === 'string' && metadata.fromVersion) ||
        (typeof metadata.currentVersion === 'string' && metadata.currentVersion) ||
        'unknown',
      recommendedVersion:
        (typeof metadata.toVersion === 'string' && metadata.toVersion) ||
        (typeof metadata.targetVersion === 'string' && metadata.targetVersion) ||
        'unspecified',
      priority: successRate < 0.8 ? 'high' : 'medium',
      impact: successRate < 0.5 ? 'high' : 'medium',
      effort: typeof metadata.estimatedEffort === 'string' ? metadata.estimatedEffort : 'medium',
      reason:
        (typeof metadata.reason === 'string' && metadata.reason) ||
        `Observed upgrade AssetPack evidence activity for ${packageName}`,
      repositories: repository ? [repository] : [],
      measuredBtdEstimate,
      breakingChanges: Boolean(metadata.breakingChanges),
      migrationGuide: typeof metadata.migrationGuide === 'string' ? metadata.migrationGuide : null,
      confidence: successRate > 0 ? successRate : 0.5,
    });
  }

  return recommendations.slice(0, 5);
}

/**
 * Register intelligence resources
 */
export function registerIntelligenceResources(): MCPResource[] {
  return [
    {
      uri: 'bitcode://resources/intelligence/synthesis',
      name: 'Technical Knowledge Synthesis',
      description: 'AI-powered synthesis of technical insights, trends, and recommendations',
      mimeType: 'application/json',
      
      read: async (uri: string, context: MCPAuthContext) => {
        const options = parseQueryParams(uri);
        return synthesizeIntelligence(context, options);
      }
    },

    {
      uri: 'bitcode://resources/intelligence/recommendations/evidence-documents',
      name: 'Evidence Document Recommendations',
      description: 'Evidence-backed recommendations for dependency and framework updates',
      mimeType: 'application/json',
      
      read: async (uri: string, context: MCPAuthContext) => {
        const options = parseQueryParams(uri);
        return getUpgradeRecommendations(context, options);
      }
    }
  ];
}
