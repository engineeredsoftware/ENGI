/**
 * Rich-response render/edge fallback helpers for Conversations.
 */

import type {
  ConversationRichResponse,
} from '../types/conversations-rich-response';

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
