"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIntelligenceResources = registerIntelligenceResources;
const logger_1 = require("@bitcode/logger");
const supabase_1 = require("@bitcode/supabase");
const orm_1 = require("@bitcode/orm");
function getTimestamp(value) {
    return value ? new Date(value).getTime() : 0;
}
function getMetadata(run) {
    return run.metadata || {};
}
function getRepositoryKey(metadata) {
    const repository = metadata.repository;
    if (repository &&
        typeof repository === 'object' &&
        typeof repository.owner === 'string' &&
        typeof repository.name === 'string') {
        return `${repository.owner}/${repository.name}`;
    }
    return null;
}
/**
 * Parse query parameters from URI
 */
function parseQueryParams(uri) {
    const url = new URL(uri, 'http://localhost');
    const params = {};
    for (const [key, value] of url.searchParams) {
        if (key.endsWith('[]')) {
            const arrayKey = key.slice(0, -2);
            params[arrayKey] = params[arrayKey] || [];
            params[arrayKey].push(value);
        }
        else if (value === 'true' || value === 'false') {
            params[key] = value === 'true';
        }
        else if (!isNaN(Number(value))) {
            params[key] = Number(value);
        }
        else {
            params[key] = value;
        }
    }
    return params;
}
/**
 * Synthesize technical knowledge
 */
async function synthesizeIntelligence(context, options = {}) {
    const supabase = (0, supabase_1.createClient)();
    const pipelineRuns = new orm_1.PipelineExecutionsModel(supabase);
    try {
        logger_1.logger.info('Synthesizing technical knowledge', {
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
            allRuns = allRuns.filter(run => run.metadata?.organizationId === context.organizationId);
        }
        else if (options.scope === 'user') {
            allRuns = allRuns.filter(run => run.metadata?.userId === context.userId);
        }
        else if (context.organizationRole !== 'admin' &&
            context.organizationRole !== 'owner' &&
            context.organizationId) {
            // Default org filtering for non-admins
            allRuns = allRuns.filter(run => run.metadata?.organizationId === context.organizationId);
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
    }
    catch (error) {
        logger_1.logger.error('Error synthesizing intelligence', { error });
        throw error;
    }
}
/**
 * Perform actual intelligence synthesis from pipeline data
 */
async function performIntelligenceSynthesis(pipelines, _options) {
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
    }, {});
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
    }, {});
    // Calculate BTD usage patterns
    const btdUsage = pipelines
        .map((pipeline) => {
        const metadata = getMetadata(pipeline);
        const metrics = metadata.metrics || {};
        return typeof metrics.measuredBtd === 'number'
            ? metrics.measuredBtd
            : typeof metadata.measuredBtd === 'number'
                ? metadata.measuredBtd
                : 0;
    })
        .filter((btd) => btd > 0);
    const totalBtdUsed = btdUsage.reduce((sum, btd) => sum + btd, 0);
    const avgBtdPerPipeline = btdUsage.length > 0 ? totalBtdUsed / btdUsage.length : 0;
    // Identify trends
    const timeBasedAnalysis = analyzeTimeBasedTrends(pipelines);
    const pipelineTypeEntries = Object.entries(pipelineTypeUsage);
    const repositoryActivityEntries = Object.entries(repositoryActivity);
    return {
        insights: {
            productivity: {
                pipelinesExecuted: totalPipelines,
                successRate: Math.round(successRate * 100) / 100,
                averageExecutionTime: Math.round(avgExecutionTime / 1000 / 60), // minutes
                mostUsedPipeline: pipelineTypeEntries
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none',
                trend: timeBasedAnalysis.productivityTrend
            },
            efficiency: {
                averageBtdPerPipeline: Math.round(avgBtdPerPipeline),
                totalBtdUsed: totalBtdUsed,
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
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none',
                repositoryDistribution: repositoryActivity,
                collaborationScore: calculateCollaborationScore(repositoryActivity)
            }
        },
        recommendations: generateRecommendations(pipelines, {
            successRate,
            avgExecutionTime,
            avgBtdPerPipeline,
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
                costEfficiency: { yours: avgBtdPerPipeline, industry: 120 }
            }
        }
    };
}
/**
 * Analyze time-based trends
 */
function analyzeTimeBasedTrends(pipelines) {
    // Group pipelines by week and month
    const weeklyGroups = groupPipelinesByPeriod(pipelines, 'week');
    const monthlyGroups = groupPipelinesByPeriod(pipelines, 'month');
    return {
        productivityTrend: calculateTrend(Object.values(weeklyGroups).map(g => g.length)),
        costTrend: calculateTrend(Object.values(weeklyGroups).map(g => g.reduce((sum, pipeline) => {
            const metadata = getMetadata(pipeline);
            const metrics = metadata.metrics || {};
            const measuredBtd = typeof metrics.measuredBtd === 'number'
                ? metrics.measuredBtd
                : typeof metadata.measuredBtd === 'number'
                    ? metadata.measuredBtd
                    : 0;
            return sum + measuredBtd;
        }, 0))),
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
function groupPipelinesByPeriod(pipelines, period) {
    return pipelines.reduce((groups, pipeline) => {
        const date = new Date(pipeline.created_at || Date.now());
        let key;
        if (period === 'week') {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
        }
        else {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        groups[key] = groups[key] || [];
        groups[key].push(pipeline);
        return groups;
    }, {});
}
/**
 * Calculate trend direction
 */
function calculateTrend(values) {
    if (values.length < 2)
        return 'stable';
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    if (firstAvg === 0) {
        return secondAvg === 0 ? 'stable' : 'increasing';
    }
    const changeThreshold = 0.1; // 10% change threshold
    const changeRatio = Math.abs(secondAvg - firstAvg) / firstAvg;
    if (changeRatio < changeThreshold)
        return 'stable';
    return secondAvg > firstAvg ? 'increasing' : 'decreasing';
}
/**
 * Calculate various quality and efficiency scores
 */
function calculateQualityScore(runs) {
    if (runs.length === 0)
        return 0;
    const factors = {
        successRate: runs.filter(r => r.status === 'completed').length / runs.length,
        avgConfidence: calculateAverageConfidence(runs),
        consistencyScore: calculateConsistencyScore(runs)
    };
    return Math.round((factors.successRate * 0.4 + factors.avgConfidence * 0.4 + factors.consistencyScore * 0.2) * 100);
}
function calculateAverageConfidence(runs) {
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
function calculateConsistencyScore(pipelines) {
    // Track consistency in execution times and success rates
    const executionTimes = pipelines
        .filter((pipeline) => pipeline.completed_at && pipeline.created_at)
        .map((pipeline) => getTimestamp(pipeline.completed_at) - getTimestamp(pipeline.created_at));
    if (executionTimes.length < 2)
        return 1;
    const mean = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const variance = executionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / executionTimes.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    // Lower variation = higher consistency
    return Math.max(0, 1 - coefficientOfVariation);
}
function calculateResourceUtilization(pipelines) {
    if (pipelines.length === 0) {
        return 0;
    }
    const utilizationSignals = pipelines.map((pipeline) => {
        const metadata = getMetadata(pipeline);
        const metrics = metadata.metrics || {};
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
function calculateCollaborationScore(repositoryActivity) {
    const repos = Object.keys(repositoryActivity).length;
    const totalActivity = Object.values(repositoryActivity).reduce((sum, count) => sum + count, 0);
    if (repos === 0)
        return 0;
    // Higher score for more distributed activity across repositories
    const averageActivity = totalActivity / repos;
    const variance = Object.values(repositoryActivity)
        .reduce((sum, count) => sum + Math.pow(count - averageActivity, 2), 0) / repos;
    return Math.max(0, 1 - (variance / (averageActivity * averageActivity)));
}
function identifyUsagePatterns(pipelines) {
    // Analyze patterns in pipeline usage
    const hourlyUsage = pipelines.reduce((acc, pipeline) => {
        const hour = new Date(pipeline.created_at || Date.now()).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});
    const hourlyEntries = Object.entries(hourlyUsage);
    const peakHour = hourlyEntries
        .sort(([, a], [, b]) => b - a)[0]?.[0];
    return {
        peakUsageHour: peakHour ? parseInt(peakHour) : null,
        hourlyDistribution: hourlyUsage,
        workingHoursUsage: hourlyEntries
            .filter(([hour]) => parseInt(hour) >= 9 && parseInt(hour) <= 17)
            .reduce((sum, [, count]) => sum + count, 0),
        afterHoursUsage: hourlyEntries
            .filter(([hour]) => parseInt(hour) < 9 || parseInt(hour) > 17)
            .reduce((sum, [, count]) => sum + count, 0)
    };
}
/**
 * Generate AI recommendations based on analysis
 */
function generateRecommendations(pipelines, metrics) {
    const recommendations = [];
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
    if (metrics.avgBtdPerPipeline > 150) {
        recommendations.push({
            category: 'cost',
            priority: 'medium',
            title: 'Optimize BTD Measurement',
            description: `Average measured BTD amount of ${Math.round(metrics.avgBtdPerPipeline)} per pipeline is above optimal range.`,
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
 * Get ai_document recommendations
 */
async function getUpgradeRecommendations(context, options = {}) {
    const supabase = (0, supabase_1.createClient)();
    const assetPackEvidenceStorage = new orm_1.AssetPackEvidenceModel(supabase);
    const pipelineRuns = new orm_1.PipelineExecutionsModel(supabase);
    try {
        // Get AssetPack evidence rows with ai_document metadata
        let allAssetPackEvidence = await assetPackEvidenceStorage.getAll();
        // Apply organization filtering
        if (context.organizationRole !== 'admin' &&
            context.organizationRole !== 'owner' &&
            context.organizationId) {
            allAssetPackEvidence = allAssetPackEvidence.filter((entry) => entry.organization_id === context.organizationId);
        }
        // Filter for upgrade-related AssetPack evidence rows
        const upgradeAssetPackEvidence = allAssetPackEvidence.filter((entry) => {
            const metadata = entry.metadata;
            return metadata?.type === 'ai_document' ||
                metadata?.pipeline === 'ai_document' ||
                entry.name?.toLowerCase().includes('ai_document');
        });
        // Get runs for these AssetPack evidence rows to analyze effectiveness
        const upgradeRuns = await Promise.all(upgradeAssetPackEvidence.slice(0, 50).map(async (entry) => {
            const assetPackRuns = await pipelineRuns.getByAssetPackEvidenceId(entry.id);
            return { assetPackEvidence: entry, runs: assetPackRuns };
        }));
        // Generate recommendations based on ai_document history
        const recommendations = generateUpgradeRecommendations(upgradeRuns, options);
        return {
            recommendations,
            metadata: {
                basedOnUpgrades: upgradeRuns.length,
                generatedAt: new Date().toISOString(),
                confidence: 0.82
            }
        };
    }
    catch (error) {
        logger_1.logger.error('Error getting ai_document recommendations', { error });
        throw error;
    }
}
/**
 * Generate ai_document recommendations
 */
function generateUpgradeRecommendations(upgradeData, _options) {
    const recommendations = [];
    for (const upgrade of upgradeData) {
        const metadata = upgrade.assetPackEvidence.metadata || {};
        const packageName = (typeof metadata.package === 'string' && metadata.package) ||
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
            const metrics = runMetadata.metrics || {};
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
            currentVersion: (typeof metadata.fromVersion === 'string' && metadata.fromVersion) ||
                (typeof metadata.currentVersion === 'string' && metadata.currentVersion) ||
                'unknown',
            recommendedVersion: (typeof metadata.toVersion === 'string' && metadata.toVersion) ||
                (typeof metadata.targetVersion === 'string' && metadata.targetVersion) ||
                'unspecified',
            priority: successRate < 0.8 ? 'high' : 'medium',
            impact: successRate < 0.5 ? 'high' : 'medium',
            effort: typeof metadata.estimatedEffort === 'string' ? metadata.estimatedEffort : 'medium',
            reason: (typeof metadata.reason === 'string' && metadata.reason) ||
                `Observed upgrade AssetPack evidence activity for ${packageName}`,
            repositories: repository ? [repository] : [],
            measuredBtdEstimate,
            breakingChanges: Boolean(metadata.breakingChanges),
            migrationGuide: typeof metadata.migrationGuide === 'string' ? metadata.migrationGuide : null,
            confidence: successRate > 0 ? successRate : 0.5
  });
    }
    return recommendations.slice(0, 5);
}
/**
 * Register intelligence resources
 */
function registerIntelligenceResources() {
    return [
        {
            uri: 'bitcode://resources/intelligence/synthesis',
            name: 'Technical Knowledge Synthesis',
            description: 'AI-powered synthesis of engineering insights, trends, and recommendations',
            mimeType: 'application/json',
            read: async (uri, context) => {
                const options = parseQueryParams(uri);
                return synthesizeIntelligence(context, options);
            }
        },
        {
            uri: 'bitcode://resources/intelligence/recommendations/ai_documents',
            name: 'AI Document Recommendations',
            description: 'AI-generated recommendations for dependency and framework ai_documents',
            mimeType: 'application/json',
            read: async (uri, context) => {
                const options = parseQueryParams(uri);
                return getUpgradeRecommendations(context, options);
            }
        }
    ];
}
