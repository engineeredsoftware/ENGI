/**
 * CONVERSATIONS RICH RESPONSE FACTORY - REVOLUTIONARY RESPONSE GENERATION
 * 
 * Creates intelligent, context-aware rich responses for the most advanced
 * engineering chat experience. Handles multiple response types and edge cases.
 */

import { 
  ConversationRichResponse,
  ConversationRichResponseFactory,
  ConversationRichResponseType,
  PipelineLogsCompactData,
  PipelineLogsDetailedData,
  CodeDiffViewerData,
  DataTableInteractiveData,
  ConversationThreadData
} from '../types/conversations-rich-response';

export class ConversationRichResponseFactoryImpl implements ConversationRichResponseFactory {
  private generateId(): string {
    return `rich_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create compact pipeline logs for inline display
   */
  createPipelineLogsCompact(runId: string, data: PipelineLogsCompactData): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'pipeline_logs_compact',
      data,
      metadata: {
        title: `${data.pipelineType} Pipeline`,
        description: `${data.status} • ${data.progress.percentage}% complete`,
        priority: data.status === 'failed' ? 'high' : 'medium',
        renderMode: 'compact',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'low',
          updateFrequency: data.status === 'running' ? 'realtime' : 'static'
        }
      },
      actions: this.createPipelineActions(runId, data.status),
      liveUpdate: data.status === 'running' ? {
        enabled: true,
        interval: 2000,
        eventSource: `/api/pipelines/${runId}/events`,
        updateStrategy: 'merge'
      } : undefined
    };
  }

  /**
   * Create detailed pipeline logs for full view
   */
  createPipelineLogsDetailed(runId: string, data: PipelineLogsDetailedData): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'pipeline_logs_detailed',
      data,
      metadata: {
        title: `${data.pipelineType} Pipeline - Detailed View`,
        description: `Complete pipeline execution details and metrics`,
        priority: 'high',
        renderMode: 'expanded',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'high',
          updateFrequency: data.status === 'running' ? 'realtime' : 'static'
        }
      },
      actions: [
        ...this.createPipelineActions(runId, data.status),
        {
          id: 'export_logs',
          type: 'download',
          label: 'Export Full Logs',
          icon: 'download',
          handler: 'export_detailed_logs'
        },
        {
          id: 'share_execution',
          type: 'share',
          label: 'Share Execution',
          icon: 'share',
          handler: 'share_pipeline_execution'
        }
      ],
      liveUpdate: data.status === 'running' ? {
        enabled: true,
        interval: 1000,
        eventSource: `/api/pipelines/${runId}/events`,
        updateStrategy: 'merge'
      } : undefined
    };
  }

  /**
   * Create code diff viewer for file comparisons
   */
  createCodeDiffViewer(data: CodeDiffViewerData): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'code_diff_viewer',
      data,
      metadata: {
        title: data.title,
        description: `${data.summary.totalFiles} files, +${data.summary.totalAdditions} -${data.summary.totalDeletions}`,
        priority: 'high',
        renderMode: 'expanded',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'medium',
          updateFrequency: 'static'
        }
      },
      actions: [
        {
          id: 'view_in_github',
          type: 'navigate',
          label: 'View in GitHub',
          icon: 'external-link',
          handler: 'view_in_github'
        },
        {
          id: 'apply_changes',
          type: 'execute',
          label: 'Apply Changes',
          icon: 'check',
          handler: 'apply_code_changes',
          config: {
            confirmation: {
              required: true,
              message: 'Apply these changes to your codebase?'
            }
          }
        },
        {
          id: 'download_patch',
          type: 'download',
          label: 'Download Patch',
          icon: 'download',
          handler: 'download_patch_file'
        }
      ]
    };
  }

  /**
   * Create interactive data table
   */
  createDataTableInteractive(data: DataTableInteractiveData): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'data_table_interactive',
      data,
      metadata: {
        title: 'Data Table',
        description: `${data.pagination.total} rows with interactive filtering and sorting`,
        priority: 'medium',
        renderMode: 'expanded',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'medium',
          updateFrequency: 'static'
        }
      },
      actions: [
        {
          id: 'export_csv',
          type: 'download',
          label: 'Export CSV',
          icon: 'download',
          handler: 'export_table_csv'
        },
        {
          id: 'create_chart',
          type: 'execute',
          label: 'Create Chart',
          icon: 'bar-chart',
          handler: 'create_chart_from_data'
        },
        {
          id: 'save_view',
          type: 'execute',
          label: 'Save View',
          icon: 'bookmark',
          handler: 'save_table_view'
        }
      ]
    };
  }

  /**
   * Create conversation thread view
   */
  createConversationThread(data: ConversationThreadData): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'conversation_thread',
      data,
      metadata: {
        title: data.title,
        description: `${data.messages.length} messages with ${data.participants.length} participants`,
        priority: 'medium',
        renderMode: 'expanded',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'medium',
          updateFrequency: data.status === 'active' ? 'realtime' : 'static'
        }
      },
      actions: [
        {
          id: 'open_conversation',
          type: 'navigate',
          label: 'Open Conversation',
          icon: 'message-circle',
          handler: 'open_conversation'
        },
        {
          id: 'branch_conversation',
          type: 'execute',
          label: 'Branch Conversation',
          icon: 'git-branch',
          handler: 'branch_conversation'
        },
        {
          id: 'export_thread',
          type: 'download',
          label: 'Export Thread',
          icon: 'download',
          handler: 'export_conversation_thread'
        }
      ],
      liveUpdate: data.status === 'active' ? {
        enabled: true,
        interval: 5000,
        eventSource: `/api/conversations/${data.conversationId}/events`,
        updateStrategy: 'append'
      } : undefined
    };
  }

  /**
   * Create multiple rich responses for complex queries
   */
  createMultiResponse(responses: ConversationRichResponse[]): ConversationRichResponse[] {
    // Sort by priority and optimize render order
    return responses.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority];
    });
  }

  /**
   * Smart response selection based on context
   */
  selectOptimalResponse(
    data: any, 
    context: { 
      userPreference?: string; 
      screenSize?: string; 
      performance?: string; 
    }
  ): ConversationRichResponse {
    // Determine optimal response type based on context
    const { screenSize = 'desktop', performance = 'high' } = context;
    
    // Mobile optimization
    if (screenSize === 'mobile') {
      return this.createMobileOptimizedResponse(data);
    }
    
    // Performance optimization
    if (performance === 'low') {
      return this.createLowPerformanceResponse(data);
    }
    
    // Default to full-featured response
    return this.createFullFeaturedResponse(data);
  }

  /**
   * Create pipeline-specific actions
   */
  private createPipelineActions(runId: string, status: string) {
    const baseActions = [
      {
        id: 'view_details',
        type: 'navigate' as const,
        label: 'View Details',
        icon: 'eye',
        handler: 'view_pipeline_details'
      },
      {
        id: 'copy_run_id',
        type: 'copy' as const,
        label: 'Copy Run ID',
        icon: 'copy',
        handler: 'copy_run_id'
      }
    ];

    const statusActions = [];
    
    if (status === 'running') {
      statusActions.push({
        id: 'pause_pipeline',
        type: 'execute' as const,
        label: 'Pause',
        icon: 'pause',
        handler: 'pause_pipeline',
        config: {
          confirmation: {
            required: true,
            message: 'Pause this pipeline execution?'
          }
        }
      });
      
      statusActions.push({
        id: 'stop_pipeline',
        type: 'execute' as const,
        label: 'Stop',
        icon: 'stop',
        handler: 'stop_pipeline',
        config: {
          confirmation: {
            required: true,
            message: 'Stop this pipeline execution? This cannot be undone.'
          }
        }
      });
    }
    
    if (status === 'failed') {
      statusActions.push({
        id: 'retry_pipeline',
        type: 'execute' as const,
        label: 'Retry',
        icon: 'refresh',
        handler: 'retry_pipeline'
      });
      
      statusActions.push({
        id: 'debug_failure',
        type: 'navigate' as const,
        label: 'Debug',
        icon: 'bug',
        handler: 'debug_pipeline_failure'
      });
    }
    
    if (status === 'completed') {
      statusActions.push({
        id: 'view_results',
        type: 'navigate' as const,
        label: 'View Results',
        icon: 'check-circle',
        handler: 'view_pipeline_results'
      });
    }

    return [...baseActions, ...statusActions];
  }

  /**
   * Create mobile-optimized response
   */
  private createMobileOptimizedResponse(data: any): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'pipeline_logs_compact',
      data,
      metadata: {
        title: 'Pipeline Status',
        description: 'Mobile-optimized view',
        priority: 'medium',
        renderMode: 'compact',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'low',
          updateFrequency: 'static'
        }
      },
      actions: [
        {
          id: 'view_mobile_details',
          type: 'navigate',
          label: 'Details',
          icon: 'info',
          handler: 'view_mobile_details'
        }
      ]
    };
  }

  /**
   * Create low-performance response
   */
  private createLowPerformanceResponse(data: any): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'pipeline_logs_compact',
      data,
      metadata: {
        title: 'Pipeline Status',
        description: 'Performance-optimized view',
        priority: 'medium',
        renderMode: 'compact',
        interactionLevel: 'read_only',
        performance: {
          renderCost: 'low',
          updateFrequency: 'static'
        }
      },
      actions: []
    };
  }

  /**
   * Create full-featured response
   */
  private createFullFeaturedResponse(data: any): ConversationRichResponse {
    return {
      id: this.generateId(),
      type: 'pipeline_logs_detailed',
      data,
      metadata: {
        title: 'Pipeline Execution',
        description: 'Full-featured view with all capabilities',
        priority: 'high',
        renderMode: 'expanded',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'high',
          updateFrequency: 'realtime'
        }
      },
      actions: this.createPipelineActions(data.runId, data.status)
    };
  }
}

// Factory instance for use throughout Conversations.
export const conversationRichResponseFactory = new ConversationRichResponseFactoryImpl();

/**
 * Edge case handlers for rich responses
 */
export class ConversationRichResponseEdgeCaseHandler {
  /**
   * Handle failed rich response rendering
   */
  static handleRenderFailure(
    richResponse: ConversationRichResponse, 
    error: Error
  ): ConversationRichResponse {
    return {
      id: richResponse.id,
      type: 'data_table_interactive',
      data: {
        error: {
          message: 'Failed to render rich response',
          details: error.message,
          fallback: 'A simple text representation is shown instead.',
          recovery: 'Try refreshing or contact support if the issue persists.'
        }
      },
      metadata: {
        title: 'Render Error',
        description: 'Rich response failed to render',
        priority: 'high',
        renderMode: 'compact',
        interactionLevel: 'read_only',
        performance: {
          renderCost: 'low',
          updateFrequency: 'static'
        }
      },
      actions: [
        {
          id: 'retry_render',
          type: 'refresh',
          label: 'Retry',
          icon: 'refresh',
          handler: 'retry_rich_response_render'
        },
        {
          id: 'report_issue',
          type: 'execute',
          label: 'Report Issue',
          icon: 'alert-triangle',
          handler: 'report_render_issue'
        }
      ]
    };
  }

  /**
   * Handle network timeout for live updates
   */
  static handleNetworkTimeout(richResponse: ConversationRichResponse): ConversationRichResponse {
    return {
      ...richResponse,
      liveUpdate: {
        ...richResponse.liveUpdate!,
        enabled: false
      },
      metadata: {
        ...richResponse.metadata,
        description: richResponse.metadata.description + ' (Live updates paused - network timeout)'
      },
      actions: [
        ...richResponse.actions || [],
        {
          id: 'reconnect_live_updates',
          type: 'refresh',
          label: 'Reconnect',
          icon: 'wifi',
          handler: 'reconnect_live_updates'
        }
      ]
    };
  }

  /**
   * Handle insufficient permissions
   */
  static handleInsufficientPermissions(
    richResponse: ConversationRichResponse
  ): ConversationRichResponse {
    return {
      ...richResponse,
      metadata: {
        ...richResponse.metadata,
        interactionLevel: 'read_only',
        description: richResponse.metadata.description + ' (Limited access)'
      },
      actions: [
        {
          id: 'request_access',
          type: 'execute',
          label: 'Request Access',
          icon: 'lock',
          handler: 'request_additional_permissions'
        }
      ]
    };
  }
}

export default conversationRichResponseFactory;
