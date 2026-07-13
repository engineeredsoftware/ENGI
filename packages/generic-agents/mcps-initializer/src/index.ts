

import { 
   
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { log } from '@bitcode/logger';

// ==================== SOPHISTICATED SCHEMAS ====================

/**
 * Input schema for MCP initialization requests
 */
const McpInputSchema = z.object({
  mcpConfigs: z.record(z.any()).optional().describe('Specific MCP configurations to initialize'),
  initializationMode: z.enum(['configured', 'all', 'selective']).default('configured').describe('MCP initialization mode'),
  registerTools: z.boolean().default(true).describe('Register MCP tools in global context'),
  validateConnections: z.boolean().default(true).describe('Validate MCP connections after initialization')
});

// Sophisticated domain-specific interfaces for MCP management
interface McpConfiguration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
  version?: string;
  dependencies?: string[];
}

interface McpInitializationResult {
  mcpId: string;
  name: string;
  success: boolean;
  tools: string[];
  capabilities: string[];
  version?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  error?: string;
}

/**
 * Plan step result schema - MCP discovery and initialization strategy
 */
const McpsInitializerAgentPlanStepOutput = z.object({
  discoveredMcps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    enabled: z.boolean(),
    configExists: z.boolean(),
    dependencies: z.array(z.string())
  })),
  initializationPlan: z.object({
    strategy: z.string(),
    initializationOrder: z.array(z.string()),
    expectedTools: z.number(),
    validationRequired: z.boolean()
  }),
  toolRegistrationTargets: z.array(z.object({
    mcpId: z.string(),
    expectedToolCount: z.number(),
    registrationScope: z.enum(['global', 'local', 'conditional'])
  })),
  success: z.boolean(),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional(),
  error: z.string().optional()
}).describe('McpPlanResult');

/**
 * Try step result schema - MCP initialization execution and tool collection
 */
const McpsInitializerAgentTryStepOutput = z.object({
  initializedMcps: z.array(z.object({
    mcpId: z.string(),
    name: z.string(),
    success: z.boolean(),
    tools: z.array(z.string()),
    capabilities: z.array(z.string()),
    version: z.string().optional(),
    connectionStatus: z.enum(['connected', 'disconnected', 'error']),
    initializationTime: z.number(),
    error: z.string().optional()
  })),
  toolRegistry: z.object({
    totalTools: z.number(),
    registeredTools: z.array(z.object({
      name: z.string(),
      mcpSource: z.string(),
      capabilities: z.array(z.string()),
      registered: z.boolean()
    })),
    failedRegistrations: z.array(z.object({
      toolName: z.string(),
      mcpSource: z.string(),
      error: z.string()
    }))
  }),
  processingMetrics: z.object({
    totalMcps: z.number(),
    successfulInitializations: z.number(),
    failedInitializations: z.number(),
    totalProcessingTime: z.number()
  }),
  success: z.boolean(),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional(),
  error: z.string().optional()
}).describe('McpGenerateResult');

/**
 * Refine step result schema - MCP validation and optimization recommendations
 */
const McpsInitializerAgentRefineStepOutput = z.object({
  validationResults: z.object({
    connectionValidation: z.number(),
    toolValidation: z.number(),
    configurationValidation: z.number(),
    dependencyValidation: z.number(),
    overallHealth: z.number()
  }),
  optimizations: z.array(z.object({
    area: z.string(),
    recommendation: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    impact: z.string()
  })),
  healthInsights: z.array(z.string()),
  success: z.boolean(),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional(),
  error: z.string().optional()
}).describe('McpRefineResult');

/**
 * Final result schema - Consolidated MCP initialization with system integration
 */
const McpsInitializerAgentRetryStepOutput = z.object({
  consolidatedIntegration: z.object({
    totalMcps: z.number(),
    activeMcps: z.number(),
    totalTools: z.number(),
    registeredTools: z.array(z.object({
      name: z.string(),
      mcpSource: z.string(),
      available: z.boolean()
    })),
    integrationStatus: z.enum(['complete', 'partial', 'failed'])
  }),
  systemCapabilities: z.array(z.string()),
  integrationHealth: z.object({
    overallScore: z.number(),
    connectionHealth: z.number(),
    toolAvailability: z.number(),
    configurationHealth: z.number()
  }),
  operationalGuidance: z.array(z.string()),
  processingTime: z.number().describe('Processing time in milliseconds'),
  success: z.boolean(),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional(),
  error: z.string().optional()
}).describe('McpFinalResult');

export type McpInput = z.infer<typeof McpInputSchema>;
export type McpResult = z.infer<typeof McpsInitializerAgentRetryStepOutput>;

// ==================== PTRR STEP IMPLEMENTATIONS ====================

/**
 * PLAN: Analyze MCP configurations and create comprehensive initialization strategy
 */
const factoryPlanStep = async (input: McpInput): Promise<McpsInitializerAgentPlanStepOutput> => {
  log('Planning MCP initialization', 'info', {
    initializationMode: input.initializationMode,
    registerTools: input.registerTools
  });
  
  try {
    // Discover MCPs from multiple sources
    const discoveredMcps: Array<{
      id: string;
      name: string;
      type: string;
      enabled: boolean;
      configExists: boolean;
      dependencies: string[];
    }> = [];

    // 1. MCPs explicitly configured for this run via UI
    const configuredMcpMap: Record<string, any> = input.mcpConfigs || {};
    Object.entries(configuredMcpMap).forEach(([mcpId, cfg]) => {
      if (!mcpId.startsWith('mcp-')) return;
      const key = mcpId.substring(4);
      discoveredMcps.push({
        id: mcpId,
        name: key.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' MCP',
        type: cfg.type || 'generic',
        enabled: cfg.enabled !== false,
        configExists: true,
        dependencies: cfg.dependencies || []
      });
    });

    // Filter enabled MCPs based on initialization mode
    const enabledMcps = discoveredMcps.filter(mcp => {
      if (input.initializationMode === 'all') return true;
      if (input.initializationMode === 'configured') return mcp.enabled && mcp.configExists;
      return mcp.enabled; // selective mode
    });

    // Determine initialization order (dependencies first)
    const initializationOrder = [];
    const processed = new Set<string>();
    
    // Simple dependency resolution
    const addToOrder = (mcpId: string) => {
      if (processed.has(mcpId)) return;
      const mcp = enabledMcps.find(m => m.id === mcpId);
      if (!mcp) return;
      
      // Add dependencies first
      mcp.dependencies.forEach(dep => {
        if (enabledMcps.some(m => m.id === dep)) {
          addToOrder(dep);
        }
      });
      
      initializationOrder.push(mcpId);
      processed.add(mcpId);
    };
    
    enabledMcps.forEach(mcp => addToOrder(mcp.id));

    // Create tool registration targets
    const toolRegistrationTargets = enabledMcps.map(mcp => ({
      mcpId: mcp.id,
      expectedToolCount: 5, // Default estimate
      registrationScope: 'global' as const // Register all tools globally by default
    }));

    const initializationPlan = {
      strategy: input.initializationMode === 'all' 
        ? 'Initialize all discovered MCPs regardless of configuration'
        : input.initializationMode === 'configured'
        ? 'Initialize only properly configured and enabled MCPs'
        : 'Selective initialization based on availability',
      initializationOrder,
      expectedTools: toolRegistrationTargets.reduce((sum, target) => sum + target.expectedToolCount, 0),
      validationRequired: input.validateConnections
    };

    const plan = {
      discoveredMcps,
      initializationPlan,
      toolRegistrationTargets,
      success: enabledMcps.length > 0
    };
    
    log('MCP initialization strategy planned', 'info', {
      discoveredMcpsCount: discoveredMcps.length,
      enabledMcpsCount: enabledMcps.length,
      initializationOrder: initializationOrder.length,
      expectedTools: initializationPlan.expectedTools
    });
    
    if (enabledMcps.length === 0) {
      plan.success = false;
      plan.error = 'No enabled MCPs found for initialization';
    }
    
    return plan;
    
  } catch (error) {
    log('MCP initialization planning failed', 'error', { error });
    
    return {
      discoveredMcps: [],
      initializationPlan: {
        strategy: 'Planning failed',
        initializationOrder: [],
        expectedTools: 0,
        validationRequired: false
      },
      toolRegistrationTargets: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * TRY: Execute MCP initializations and collect tool registrations
 */
const factoryTryStep = async (
  planResult: McpsInitializerAgentPlanStepOutput,
  input: McpInput
): Promise<McpsInitializerAgentTryStepOutput> => {
  log('Executing MCP initialization', 'info', {
    mcpsToInitialize: planResult.initializationPlan.initializationOrder.length,
    strategy: planResult.initializationPlan.strategy
  });
  
  const startTime = Date.now();
  
  try {
    if (!planResult.success || planResult.initializationPlan.initializationOrder.length === 0) {
      return {
        initializedMcps: [],
        toolRegistry: {
          totalTools: 0,
          registeredTools: [],
          failedRegistrations: []
        },
        processingMetrics: {
          totalMcps: 0,
          successfulInitializations: 0,
          failedInitializations: 0,
          totalProcessingTime: Date.now() - startTime
        },
        success: false,
        error: planResult.error || 'No MCPs to initialize'
      };
    }

    const initializedMcps = [];
    const registeredTools = [];
    const failedRegistrations = [];
    let successfulInitializations = 0;
    let failedInitializations = 0;

    // Initialize MCPs in dependency order
    for (const mcpId of planResult.initializationPlan.initializationOrder) {
      const mcpInfo = planResult.discoveredMcps.find(m => m.id === mcpId);
      if (!mcpInfo) {
        failedInitializations++;
        continue;
      }

      const initStart = Date.now();
      
      try {
        // Mock MCP initialization (would call actual MCP initialization functions)
        const mockInitResult = await initializeMcp(mcpId, mcpInfo);
        
        const initializationTime = Date.now() - initStart;
        
        if (mockInitResult.success) {
          successfulInitializations++;
          
          initializedMcps.push({
            mcpId: mcpId,
            name: mcpInfo.name,
            success: true,
            tools: mockInitResult.tools,
            capabilities: mockInitResult.capabilities,
            version: mockInitResult.version,
            connectionStatus: 'connected' as const,
            initializationTime
          });

          // Register tools if enabled
          if (input.registerTools) {
            mockInitResult.tools.forEach(toolName => {
              registeredTools.push({
                name: toolName,
                mcpSource: mcpId,
                capabilities: mockInitResult.capabilities,
                registered: true
              });
            });
          }
        } else {
          failedInitializations++;
          
          initializedMcps.push({
            mcpId: mcpId,
            name: mcpInfo.name,
            success: false,
            tools: [],
            capabilities: [],
            connectionStatus: 'error' as const,
            initializationTime,
            error: mockInitResult.error
          });
        }
      } catch (error) {
        failedInitializations++;
        const initializationTime = Date.now() - initStart;
        
        initializedMcps.push({
          mcpId: mcpId,
          name: mcpInfo.name,
          success: false,
          tools: [],
          capabilities: [],
          connectionStatus: 'error' as const,
          initializationTime,
          error: error instanceof Error ? error.message : String(error)
        });
        
        log('MCP initialization failed', 'error', {
          mcpId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (input.registerTools && registeredTools.length > 0) {
      log('Registered MCP tools during initialization', 'info', {
        toolsRegistered: registeredTools.length
      });
    }

    const totalProcessingTime = Date.now() - startTime;
    
    const processingMetrics = {
      totalMcps: planResult.initializationPlan.initializationOrder.length,
      successfulInitializations,
      failedInitializations,
      totalProcessingTime
    };

    const toolRegistry = {
      totalTools: registeredTools.length,
      registeredTools,
      failedRegistrations
    };

    const result = {
      initializedMcps,
      toolRegistry,
      processingMetrics,
      success: successfulInitializations > 0
    };
    
    log('MCP initialization completed', 'info', {
      totalMcps: processingMetrics.totalMcps,
      successfulInitializations,
      failedInitializations,
      toolsRegistered: registeredTools.length,
      totalProcessingTime
    });
    
    return result;
    
  } catch (error) {
    log('MCP initialization execution failed', 'error', { error });
    
    return {
      initializedMcps: [],
      toolRegistry: {
        totalTools: 0,
        registeredTools: [],
        failedRegistrations: []
      },
      processingMetrics: {
        totalMcps: 0,
        successfulInitializations: 0,
        failedInitializations: 1,
        totalProcessingTime: Date.now() - startTime
      },
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * REFINE: Validate MCP integrations and identify optimization opportunities
 */
const factoryRefineStep = async (
  tryResult: McpsInitializerAgentTryStepOutput
): Promise<McpsInitializerAgentRefineStepOutput> => {
  log('Refining MCP initialization', 'info', {
    initializedMcps: tryResult.initializedMcps.length,
    successfulInitializations: tryResult.processingMetrics.successfulInitializations
  });
  
  try {
    const mcps = tryResult.initializedMcps;
    const successfulMcps = mcps.filter(m => m.success);
    const failedMcps = mcps.filter(m => !m.success);
    
    // Calculate validation metrics
    const connectionValidation = mcps.length > 0 
      ? successfulMcps.filter(m => m.connectionStatus === 'connected').length / mcps.length 
      : 0;
      
    const toolValidation = tryResult.toolRegistry.totalTools > 0 
      ? tryResult.toolRegistry.registeredTools.filter(t => t.registered).length / tryResult.toolRegistry.totalTools 
      : 0;
      
    const configurationValidation = mcps.length > 0 
      ? successfulMcps.filter(m => m.tools.length > 0).length / mcps.length 
      : 0;
      
    const dependencyValidation = mcps.length > 0 
      ? successfulMcps.filter(m => m.capabilities.length > 0).length / mcps.length 
      : 0;
      
    const overallHealth = (connectionValidation + toolValidation + configurationValidation + dependencyValidation) / 4;

    // Generate optimization recommendations
    const optimizations = [];
    if (connectionValidation < 0.8) {
      optimizations.push({
        area: 'Connection Health',
        recommendation: 'Review MCP connection configurations and network connectivity',
        priority: 'high' as const,
        impact: 'Critical for MCP functionality and tool availability'
      });
    }
    if (toolValidation < 0.7) {
      optimizations.push({
        area: 'Tool Registration',
        recommendation: 'Verify MCP tool registration process and global context updates',
        priority: 'medium' as const,
        impact: 'Affects available tooling for subsequent pipeline stages'
      });
    }
    if (configurationValidation < 0.6) {
      optimizations.push({
        area: 'Configuration Quality',
        recommendation: 'Improve MCP configuration completeness and validation',
        priority: 'medium' as const,
        impact: 'Better configurations lead to more reliable MCP performance'
      });
    }
    if (failedMcps.length > 0) {
      optimizations.push({
        area: 'Initialization Failures',
        recommendation: `Address ${failedMcps.length} failed MCP initializations`,
        priority: 'high' as const,
        impact: 'Failed MCPs reduce available system capabilities'
      });
    }
    if (optimizations.length === 0) {
      optimizations.push({
        area: 'System Excellence',
        recommendation: 'MCP initialization is performing excellently - maintain current standards',
        priority: 'low' as const,
        impact: 'Continued high-quality MCP integration'
      });
    }

    // Generate health insights
    const healthInsights = [
      `Initialized ${successfulMcps.length} of ${mcps.length} MCPs successfully`,
      `Registered ${tryResult.toolRegistry.totalTools} tools across all MCPs`,
      `Overall integration health: ${(overallHealth * 100).toFixed(1)}%`,
      `Connection health: ${(connectionValidation * 100).toFixed(1)}%`,
      `Tool availability: ${(toolValidation * 100).toFixed(1)}%`,
      failedMcps.length > 0 
        ? `${failedMcps.length} MCPs require attention for optimal performance`
        : 'All MCPs are operating within expected parameters'
    ];

    const result = {
      validationResults: {
        connectionValidation,
        toolValidation,
        configurationValidation,
        dependencyValidation,
        overallHealth
      },
      optimizations,
      healthInsights,
      success: true
    };
    
    log('MCP initialization refined', 'info', {
      overallHealth: (overallHealth * 100).toFixed(1),
      optimizationsCount: optimizations.length,
      healthInsightsCount: healthInsights.length
    });
    
    return result;
    
  } catch (error) {
    log('MCP initialization refinement failed', 'error', { error });
    
    return {
      validationResults: {
        connectionValidation: 0.5,
        toolValidation: 0.5,
        configurationValidation: 0.5,
        dependencyValidation: 0.5,
        overallHealth: 0.5
      },
      optimizations: [],
      healthInsights: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * RETRY: Finalize MCP initialization with comprehensive system integration
 */
const factoryRetryStep = async (
  refineResult: McpsInitializerAgentRefineStepOutput,
  input: McpInput,
  tryResult?: McpsInitializerAgentTryStepOutput
): Promise<McpsInitializerAgentRetryStepOutput> => {
  log('Finalizing MCP initialization', 'info', {
    overallHealth: refineResult.validationResults.overallHealth,
    optimizationsCount: refineResult.optimizations.length
  });
  
  const startTime = Date.now();
  
  try {
    if (!tryResult?.initializedMcps) {
      return {
        consolidatedIntegration: {
          totalMcps: 0,
          activeMcps: 0,
          totalTools: 0,
          registeredTools: [],
          integrationStatus: 'failed'
        },
        systemCapabilities: [],
        integrationHealth: {
          overallScore: 0,
          connectionHealth: 0,
          toolAvailability: 0,
          configurationHealth: 0
        },
        operationalGuidance: ['MCP initialization incomplete - no integration data available'],
        processingTime: Date.now() - startTime,
        success: false,
        error: 'No MCP initialization data available for finalization'
      };
    }

    const { validationResults } = refineResult;
    const mcps = tryResult.initializedMcps;
    const toolRegistry = tryResult.toolRegistry;
    const activeMcps = mcps.filter(m => m.success);

    // Consolidate integration status
    const consolidatedIntegration = {
      totalMcps: mcps.length,
      activeMcps: activeMcps.length,
      totalTools: toolRegistry.totalTools,
      registeredTools: toolRegistry.registeredTools.map(tool => ({
        name: tool.name,
        mcpSource: tool.mcpSource,
        available: tool.registered
      })),
      integrationStatus: activeMcps.length === mcps.length 
        ? 'complete' as const
        : activeMcps.length > 0 
        ? 'partial' as const 
        : 'failed' as const
    };

    // Extract system capabilities
    const systemCapabilities = [
      ...new Set(activeMcps.flatMap(mcp => mcp.capabilities))
    ];

    // Generate operational guidance
    const operationalGuidance = [
      `${activeMcps.length} MCP${activeMcps.length === 1 ? '' : 's'} active and ready for use`,
      `${toolRegistry.totalTools} tools available through MCP integrations`,
      validationResults.overallHealth > 0.8 
        ? 'MCP system is operating at optimal performance'
        : validationResults.overallHealth > 0.6
        ? 'MCP system is functional with room for optimization'
        : 'MCP system requires attention for optimal performance',
      ...refineResult.optimizations.filter(opt => opt.priority === 'high')
        .map(opt => `Priority action: ${opt.recommendation}`)
    ];

    // Create integration health summary
    const integrationHealth = {
      overallScore: validationResults.overallHealth,
      connectionHealth: validationResults.connectionValidation,
      toolAvailability: validationResults.toolValidation,
      configurationHealth: validationResults.configurationValidation
    };

    log('MCP integration state prepared', 'info', {
      activeMcps: activeMcps.length,
      totalTools: toolRegistry.totalTools,
      integrationStatus: consolidatedIntegration.integrationStatus,
      overallHealth: validationResults.overallHealth
    });

    const processingTime = Date.now() - startTime;

    const result = {
      consolidatedIntegration,
      systemCapabilities,
      integrationHealth,
      operationalGuidance,
      processingTime,
      success: activeMcps.length > 0
    };
    
    log('MCP initialization finalized', 'info', {
      totalMcps: mcps.length,
      activeMcps: activeMcps.length,
      totalTools: toolRegistry.totalTools,
      processingTime
    });
    
    return result;
    
  } catch (error) {
    log('MCP initialization finalization failed', 'error', { error });
    
    return {
      consolidatedIntegration: {
        totalMcps: 0,
        activeMcps: 0,
        totalTools: 0,
        registeredTools: [],
        integrationStatus: 'failed'
      },
      systemCapabilities: [],
      integrationHealth: {
        overallScore: 0,
        connectionHealth: 0,
        toolAvailability: 0,
        configurationHealth: 0
      },
      operationalGuidance: [],
      processingTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Mock MCP initialization function (would integrate with actual MCP systems)
 */
async function initializeMcp(mcpId: string, mcpInfo: any): Promise<{
  success: boolean;
  tools: string[];
  capabilities: string[];
  version?: string;
  error?: string;
}> {
  // Mock implementation - would call actual MCP initialization
  try {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    // Mock success rate (90% success)
    if (Math.random() > 0.1) {
      const mockTools = [
        `${mcpId}_tool_1`,
        `${mcpId}_tool_2`,
        `${mcpId}_search`,
        `${mcpId}_analyze`
      ];
      
      const mockCapabilities = [
        'data_processing',
        'integration',
        'analysis',
        mcpInfo.type === 'database' ? 'query_execution' : 'api_integration'
      ];
      
      return {
        success: true,
        tools: mockTools,
        capabilities: mockCapabilities,
        version: '1.0.0'
      };
    } else {
      return {
        success: false,
        tools: [],
        capabilities: [],
        error: 'Mock initialization failure for testing'
      };
    }
  } catch (error) {
    return {
      success: false,
      tools: [],
      capabilities: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ==================== PROMPTS ====================

export const mcpsInitializerPrompt = new AgentPrompt({
  name: 'mcps-initializer' as PromptPart,
  identity: 'MCP initialization specialist' as PromptPart
});

export const mcpsInitializerStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze requirements' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute operation' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance results' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Complete processing' as PromptPart })
};

// ==================== AGENT IMPLEMENTATION ====================

/**
 * Comprehensive MCP initialization agent using full PTRR cycle for detailed system integration
 */
const comprehensiveMcp = factoryPTRRAgent<McpInput, McpsInitializerAgentRetryStepOutput>({
  name: 'comprehensive-mcp',
  description: 'Complete MCP initialization with validation, tool registration, and system integration',
  prompt: mcpsInitializerPrompt,
  stepPrompts: {
    plan: () => mcpsInitializerStepPrompts.plan,
    try: () => mcpsInitializerStepPrompts.try,
    refine: () => mcpsInitializerStepPrompts.refine,
    retry: () => mcpsInitializerStepPrompts.retry
  },
  outputSchema: McpsInitializerAgentRetryStepOutput,
  plan: { chunkThreshold: 500 },
  try: { chunkThreshold: 1500, enableParallelChunks: false },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1, backoff: 1000 }
});

/**
 * Quick MCP initialization agent for basic tool registration
 */
const quickMcp = factoryAgentWithSingleStep<McpInput, McpsInitializerAgentRetryStepOutput>({
  name: 'quick-mcp',
  description: 'Fast MCP initialization for basic tool registration and system setup',
  execute: async (input, execution) => {
    // Simple MCP initialization without full PTRR cycle
    const plan = await factoryPlanStep(input);
    
    if (!plan.success) {
      return {
        consolidatedIntegration: {
          totalMcps: 0,
          activeMcps: 0,
          totalTools: 0,
          registeredTools: [],
          integrationStatus: 'failed'
        },
        systemCapabilities: [],
        integrationHealth: {
          overallScore: 0,
          connectionHealth: 0,
          toolAvailability: 0,
          configurationHealth: 0
        },
        operationalGuidance: ['MCP initialization failed - check configuration'],
        processingTime: 1000,
        success: false,
        error: plan.error
      };
    }
    
    const result = await factoryTryStep(plan, input);
    
    // Convert to final schema format with minimal processing
    return {
      consolidatedIntegration: {
        totalMcps: result.processingMetrics.totalMcps,
        activeMcps: result.processingMetrics.successfulInitializations,
        totalTools: result.toolRegistry.totalTools,
        registeredTools: result.toolRegistry.registeredTools.map(tool => ({
          name: tool.name,
          mcpSource: tool.mcpSource,
          available: tool.registered
        })),
        integrationStatus: result.processingMetrics.successfulInitializations > 0 
          ? (result.processingMetrics.successfulInitializations === result.processingMetrics.totalMcps ? 'complete' : 'partial')
          : 'failed'
      },
      systemCapabilities: [...new Set(result.initializedMcps.flatMap(mcp => mcp.capabilities))],
      integrationHealth: {
        overallScore: result.processingMetrics.successfulInitializations / Math.max(1, result.processingMetrics.totalMcps),
        connectionHealth: result.initializedMcps.filter(m => m.connectionStatus === 'connected').length / Math.max(1, result.initializedMcps.length),
        toolAvailability: result.toolRegistry.registeredTools.length / Math.max(1, result.toolRegistry.totalTools),
        configurationHealth: 0.8 // Default for quick mode
      },
      operationalGuidance: [
        'Quick MCP initialization completed',
        `${result.processingMetrics.successfulInitializations} MCPs active`,
        `${result.toolRegistry.totalTools} tools registered`,
        'Use comprehensive initialization for detailed validation'
      ],
      processingTime: result.processingMetrics.totalProcessingTime,
      success: result.success,
      error: result.error
    };
  }
});

/**
 * MCPs Initializer Agent - Default PTRR implementation
 * Main agent using comprehensive MCP initialization
 */
export const mcpsInitializer = comprehensiveMcp;

/**
 * Quick MCPs Initializer Agent - Simple version prefixed with "quick"
 * Fast MCP initialization for basic tool registration
 */
export const quickMcpsInitializer = quickMcp;

// Removed former export.
