/**
 * OpenAPI Documentation Generator for Bitcode MCP Server
 * 
 * Generates comprehensive Swagger/OpenAPI 3.0 documentation with inline examples,
 * security schemes, and complete API specifications for public consumption.
 * 
 * This generator creates production-ready API documentation that can be:
 * - Imported into Postman, Insomnia, or other API clients
 * - Hosted on Swagger UI for interactive documentation
 * - Used for SDK generation in multiple languages
 * - Integrated with API gateways for validation
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { OpenAPIV3 } from 'openapi-types';

// Tool category constants removed (counts are not maintained to avoid drift)

/**
 * Generate comprehensive OpenAPI 3.0 specification for Bitcode MCP Server
 */
export function generateOpenAPISpec(): OpenAPIV3.Document {
  const spec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title: 'Bitcode MCP Server API',
      version: '1.0.0',
      description: `
# Bitcode MCP Server API

The Model Context Protocol (MCP) server exposing Bitcode’s technical knowledge exchange via standardized tools, resources, and prompts.

## Features

- Tools interface for AssetPack execution and optional Shippable delivery
- Real‑time streaming (WebSocket)
- Multi‑modal attachments (Figma, documents, images, audio, video)
- BTC fee posture plus measured non-fungible $BTD AssetPack amount

## Getting Started

1. **Get API Key** in your Bitcode account
2. **Connect an MCP Client** (e.g., Claude Desktop)
3. **Call a Tool**: 
   - 
     name: \`bitcode://pipelines/asset-pack/execute\`
     
## Support

- **Documentation**: https://docs.bitcode.dev/mcp
- **Community**: https://discord.gg/bitcode-mcp
- **Support**: mcp-support@bitcode.dev
      `,
      contact: {
        name: 'Bitcode API Support',
        url: 'https://bitcode.dev/support',
        email: 'support@bitcode.dev'
      },
      license: {
        name: 'Bitcode Commercial License',
        url: 'https://bitcode.dev/license'
      },
      termsOfService: 'https://bitcode.dev/terms'
    },
    servers: [
      {
        url: 'https://api.bitcode.dev/mcp',
        description: 'Production API'
      },
      {
        url: 'https://staging-api.bitcode.dev/mcp',
        description: 'Staging API'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development'
      }
    ],
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication. Get yours at https://bitcode.dev/api-keys'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from session authentication'
        }
      },
      schemas: {
        // Core Types
        RepositoryContext: {
          type: 'object',
          required: ['owner', 'name'],
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (user or organization)',
              example: 'bitcode-labs'
            },
            name: {
              type: 'string',
              description: 'Repository name',
              example: 'webapp'
            },
            branch: {
              type: 'string',
              description: 'Git branch to work on',
              default: 'main',
              example: 'feature/auth'
            },
            path: {
              type: 'string',
              description: 'Optional path within repository to focus on',
              example: 'src/components'
            },
            connectionId: {
              type: 'integer',
              description: 'GitHub App installation ID',
              example: 12345
            }
          }
        },
        Attachment: {
          type: 'object',
          required: ['type', 'content'],
          properties: {
            type: {
              type: 'string',
              enum: ['image', 'document', 'audio', 'video', 'url', 'figma', 'file'],
              description: 'Type of attachment for specialized processing'
            },
            content: {
              type: 'string',
              description: 'Attachment content (URL, file path, or encoded data)',
              example: 'https://www.figma.com/file/ABC123/Design-System'
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional metadata for processing',
              example: {
                title: 'E-commerce Design System',
                components: ['Button', 'Card', 'Modal']
              }
            }
          }
        },
        PipelineStatus: {
          type: 'string',
          enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
          description: 'Current status of pipeline execution'
        },
        ExecutionMetrics: {
          type: 'object',
          properties: {
            measuredBtd: {
              type: 'integer',
              description: 'Measured non-fungible `$BTD` content amount for the AssetPack',
              example: 150
            },
            tokensProcessed: {
              type: 'integer',
              description: 'Total tokens processed by AI models',
              example: 25000
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence score for the execution results',
              example: 0.92
            },
            duration: {
              type: 'integer',
              description: 'Execution duration in milliseconds',
              example: 180000
            },
            phases: {
              type: 'object',
              description: 'Per-phase execution metrics',
              additionalProperties: {
                type: 'object',
                properties: {
                  duration: { type: 'integer' },
                  success: { type: 'boolean' },
                  confidence: { type: 'number' }
                }
              }
            }
          }
        },
        AssetPack: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Type of AssetPack result created',
              example: 'pull_request'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'External URL for the PR-backed Shippable',
              example: 'https://github.com/bitcode-labs/webapp/pull/123'
            },
            content: {
              type: 'string',
              description: 'Inline AssetPack evidence content'
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional AssetPack metadata'
            }
          }
        },
        // Tool Requests
        AssetPackRequest: {
          type: 'object',
          required: ['task', 'repository', 'subtype'],
          properties: {
            task: {
              type: 'string',
              minLength: 10,
              description: 'Detailed task description (minimum 10 characters)',
              example: 'Create a complete user authentication system with JWT tokens, password hashing, and email verification'
            },
            repository: { $ref: '#/components/schemas/RepositoryContext' },
            subtype: {
              type: 'string',
              enum: ['pull_request'],
              description: 'V26 Shippable type to create'
            },
            attachments: {
              type: 'array',
              items: { $ref: '#/components/schemas/Attachment' },
              description: 'Optional attachments for multimodal processing'
            },
            options: {
              type: 'object',
              properties: {
                createPR: {
                  type: 'boolean',
                  default: true,
                  description: 'Create GitHub pull request'
                },
                runTests: {
                  type: 'boolean',
                  default: true,
                  description: 'Run automated tests'
                },
                generateDocs: {
                  type: 'boolean',
                  default: true,
                  description: 'Generate documentation'
                },
                securityCheck: {
                  type: 'boolean',
                  default: true,
                  description: 'Run security analysis'
                }
              }
            },
            mcpConfig: {
              type: 'object',
              additionalProperties: true,
              description: 'MCP provider configuration for external integrations'
            },
            streaming: {
              type: 'boolean',
              default: true,
              description: 'Enable real-time streaming of pipeline execution'
            }
          }
        },
        
        // Tool Responses
        PipelineResponse: {
          type: 'object',
          properties: {
            pipelineId: {
              type: 'string',
              description: 'Unique pipeline execution identifier',
              example: 'pipeline-123e4567-e89b-12d3-a456-426614174000'
            },
            status: { $ref: '#/components/schemas/PipelineStatus' },
            assetPacks: {
              type: 'array',
              items: { $ref: '#/components/schemas/AssetPack' },
              description: 'Generated AssetPack results and PR Shippables'
            },
            metrics: { $ref: '#/components/schemas/ExecutionMetrics' },
            streamUrl: {
              type: 'string',
              format: 'uri',
              description: 'WebSocket URL for real-time execution updates',
              example: 'wss://stream.bitcode.dev/pipeline/123e4567-e89b-12d3-a456-426614174000'
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'Pipeline execution start time'
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              description: 'Pipeline execution end time'
            }
          }
        },
        // Error Types
        MCPError: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: {
              type: 'string',
              description: 'Machine-readable error code',
              example: 'INVALID_REQUEST'
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
              example: 'Task description must be at least 10 characters long'
            },
            details: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional error context and details'
            },
            retryable: {
              type: 'boolean',
              description: 'Whether the operation can be retried',
              example: false
            },
            suggestion: {
              type: 'string',
              description: 'Suggested fix or next steps',
              example: 'Please provide a more detailed task description with specific requirements'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MCPError' },
              example: {
                code: 'INVALID_REQUEST',
                message: 'Task description must be at least 10 characters long',
                retryable: false,
                suggestion: 'Please provide a more detailed task description'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing API key',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MCPError' },
              example: {
                code: 'AUTHENTICATION_FAILED',
                message: 'Invalid API key provided',
                retryable: false,
                suggestion: 'Check your API key at https://bitcode.dev/api-keys'
              }
            }
          }
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MCPError' },
              example: {
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'User lacks required permissions for this operation',
                retryable: false,
                suggestion: 'Contact your organization admin to grant pipeline creation permissions'
              }
            }
          }
        },
        NotFound: {
          description: 'Not Found - Resource does not exist',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MCPError' },
              example: {
                code: 'RESOURCE_NOT_FOUND',
                message: 'Pipeline not found',
                retryable: false,
                suggestion: 'Check the pipeline ID and try again'
              }
            }
          }
        },
        RateLimitExceeded: {
          description: 'Rate Limit Exceeded - Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MCPError' },
              example: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded for current limits',
                retryable: true,
                suggestion: 'Wait 60 seconds before retrying or contact support to adjust limits'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error - Unexpected server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MCPError' },
              example: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                retryable: true,
                suggestion: 'Please try again or contact support if the issue persists'
              }
            }
          }
        }
      }
    },
    paths: {
      '/tools/list': {
        get: {
          summary: 'List Available Tools',
          description: 'Get a comprehensive list of all available MCP tools with their capabilities and descriptions.',
          operationId: 'listTools',
          tags: ['Tools'],
          responses: {
            '200': {
              description: 'List of available tools',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tools: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              description: 'Tool identifier',
                              example: 'bitcode://pipelines/asset-pack/create'
                            },
                            description: {
                              type: 'string',
                              description: 'Tool description and capabilities',
                              example: 'Create a PR-backed AssetPack with comprehensive testing and documentation'
                            },
                            category: {
                              type: 'string',
                              description: 'Tool category',
                              example: 'pipeline'
                            },
                            schema: {
                              type: 'object',
                              description: 'JSON schema for tool parameters'
                            }
                          }
                        }
                      }
                    }
                  },
                  example: {
                    tools: [
                      {
                        name: 'bitcode://pipelines/asset-pack/create',
                        description: 'Create a PR-backed AssetPack with comprehensive testing and documentation',
                        category: 'pipeline',
                        schema: {
                          type: 'object',
                          required: ['task', 'repository', 'subtype'],
                          properties: {
                            task: { type: 'string', minLength: 10 },
                            repository: { $ref: '#/components/schemas/RepositoryContext' },
                            subtype: { type: 'string', enum: ['pull_request'] }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/tools/call': {
        post: {
          summary: 'Execute MCP Tool',
      description: `Execute supported MCP tools with the provided parameters.

Supports both synchronous and streaming execution modes.`,
          operationId: 'callTool',
          tags: ['Tools'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'arguments'],
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Tool name to execute',
                      example: 'bitcode://pipelines/asset-pack/create'
                    },
                    arguments: {
                      type: 'object',
                      description: 'Tool-specific parameters',
                      example: {
                        task: 'Create user authentication system with JWT and email verification',
                        repository: {
                          owner: 'mycompany',
                          name: 'webapp',
                          branch: 'feature/auth'
                        },
                        subtype: 'pull_request',
                        options: {
                          createPR: true,
                          runTests: true,
                          generateDocs: true,
                          securityCheck: true
                        }
                      }
                    }
                  }
                },
                examples: {
                  createAssetPack: {
                    summary: 'Create Feature AssetPack',
                    description: 'Example of creating a complete feature with pull request',
                    value: {
                      name: 'bitcode://pipelines/asset-pack/create',
                      arguments: {
                        task: 'Create user authentication system with JWT tokens, password hashing, email verification, and password reset functionality',
                        repository: {
                          owner: 'mycompany',
                          name: 'webapp',
                          branch: 'feature/auth'
                        },
                        subtype: 'pull_request',
                        attachments: [
                          {
                            type: 'figma',
                            content: 'https://www.figma.com/file/ABC123/Auth-Flow',
                            metadata: {
                              pages: ['Login', 'Signup', 'Reset Password']
                            }
                          }
                        ],
                        options: {
                          createPR: true,
                          runTests: true,
                          generateDocs: true,
                          securityCheck: true
                        }
                      }
                    }
                  },
                  
                  
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Tool execution completed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PipelineResponse' },
                  examples: {
                    successfulAssetPack: {
                      summary: 'Successful Feature Creation',
                      value: {
                        pipelineId: 'pipeline-123e4567-e89b-12d3-a456-426614174000',
                        status: 'completed',
                        assetPacks: [
                          {
                            type: 'pull_request',
                            url: 'https://github.com/mycompany/webapp/pull/123',
                            metadata: {
                              title: 'Add user authentication system',
                              commits: 7,
                              filesChanged: 15
                            }
                          }
                        ],
                        metrics: {
                          measuredBtd: 150,
                          tokensProcessed: 25000,
                          confidence: 0.92,
                          duration: 480000,
                          phases: {
                            setup: { duration: 60000, success: true, confidence: 0.95 },
                            discovery: { duration: 120000, success: true, confidence: 0.89 },
                            implementation: { duration: 240000, success: true, confidence: 0.93 },
                            testing: { duration: 45000, success: true, confidence: 0.87 },
                            delivery: { duration: 15000, success: true, confidence: 0.96 }
                          }
                        },
                        streamUrl: 'wss://stream.bitcode.dev/pipeline/123e4567-e89b-12d3-a456-426614174000',
                        startTime: '2024-01-15T10:00:00Z',
                        endTime: '2024-01-15T10:08:00Z'
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '429': { $ref: '#/components/responses/RateLimitExceeded' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/pipelines/{pipelineId}': {
        get: {
          summary: 'Get Pipeline Status',
          description: 'Retrieve the current status and results of a specific pipeline execution.',
          operationId: 'getPipelineStatus',
          tags: ['Pipelines'],
          parameters: [
            {
              name: 'pipelineId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                example: 'pipeline-123e4567-e89b-12d3-a456-426614174000'
              },
              description: 'Unique pipeline identifier'
            }
          ],
          responses: {
            '200': {
              description: 'Pipeline status and details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PipelineResponse' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/pipelines/{pipelineId}/cancel': {
        post: {
          summary: 'Cancel Pipeline',
          description: 'Cancel a running pipeline execution. Only pipelines in "pending" or "running" status can be cancelled.',
          operationId: 'cancelPipeline',
          tags: ['Pipelines'],
          parameters: [
            {
              name: 'pipelineId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Unique pipeline identifier'
            }
          ],
          responses: {
            '200': {
              description: 'Pipeline cancelled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      pipelineId: { type: 'string' },
                      status: { type: 'string', enum: ['cancelled'] },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/resources/list': {
        get: {
          summary: 'List Available Resources',
          description: 'Get a list of all available MCP resources for data access and analysis.',
          operationId: 'listResources',
          tags: ['Resources'],
          responses: {
            '200': {
              description: 'List of available resources',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      resources: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            uri: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            mimeType: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/pipelines/{pipelineId}/stream': {
        get: {
          summary: 'Stream Pipeline Events',
          description: 'Connect to real-time pipeline execution updates via Server-Sent Events (SSE).',
          operationId: 'streamPipeline',
          tags: ['Streaming'],
          parameters: [
            {
              name: 'pipelineId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Pipeline execution ID'
            }
          ],
          responses: {
            '200': {
              description: 'SSE stream established',
              content: {
                'text/event-stream': {
                  schema: {
                    type: 'string',
                    description: 'Server-Sent Events stream'
                  },
                  examples: {
                    phaseUpdate: {
                      summary: 'Phase update event',
                      value: 'event: phase_start\\ndata: {"phase":"Implementation","agent":"CodeGenerator","progress":45}\\n\\n'
                    }
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' }
          }
        }
      },
      '/stream/websocket': {
        get: {
          summary: 'WebSocket Streaming',
          description: 'Connect to real-time updates via WebSocket. Append query parameters: ?pipelineId=xxx&token=xxx',
          operationId: 'websocketStream',
          tags: ['Streaming'],
          responses: {
            '101': {
              description: 'WebSocket connection upgraded',
              headers: {
                Upgrade: {
                  schema: { type: 'string', enum: ['websocket'] }
                },
                'Connection': {
                  schema: { type: 'string', enum: ['Upgrade'] }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/webhooks': {
        post: {
          summary: 'Create Webhook',
          description: 'Register a webhook endpoint to receive real-time notifications about pipeline events.',
          operationId: 'createWebhook',
          tags: ['Webhooks'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url', 'events'],
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'Webhook endpoint URL',
                      example: 'https://myapp.com/webhooks/bitcode'
                    },
                    events: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: [
                          'pipeline.started',
                          'pipeline.completed',
                          'pipeline.failed',
                          'pipeline.cancelled',
                          'analysis.finished',
                          'security.alert',
                          'evidence_document.completed'
                        ]
                      },
                      description: 'Events to subscribe to',
                      example: ['pipeline.completed', 'pipeline.failed']
                    },
                    secret: {
                      type: 'string',
                      description: 'Secret for webhook signature verification',
                      example: 'webhook-secret-key'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Webhook created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      webhookId: { type: 'string' },
                      url: { type: 'string' },
                      events: { type: 'array', items: { type: 'string' } },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/InternalServerError' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Tools',
        description: 'Execute sophisticated engineering tools and pipelines',
        externalDocs: {
          description: 'Complete tool reference',
          url: 'https://docs.bitcode.dev/mcp/tools'
        }
      },
      {
        name: 'Pipelines',
        description: 'Monitor and control pipeline executions',
        externalDocs: {
          description: 'Pipeline documentation',
          url: 'https://docs.bitcode.dev/mcp/pipelines'
        }
      },
      {
        name: 'Resources',
        description: 'Access read-only data and analytics'
      },
      {
        name: 'Webhooks',
        description: 'Real-time event notifications'
      },
      {
        name: 'Streaming',
        description: 'Real-time updates via WebSocket/SSE',
        externalDocs: {
          description: 'Streaming guide',
          url: 'https://docs.bitcode.dev/mcp/streaming'
        }
      }
    ],
    externalDocs: {
      description: 'Complete MCP Documentation',
      url: 'https://docs.bitcode.dev/mcp'
    }
  };

  return spec;
}

/**
 * Generate and save OpenAPI specification files
 */
export function generateOpenAPIFiles(): void {
  const spec = generateOpenAPISpec();
  
  // Ensure output directory exists
  const docsDir = join(process.cwd(), 'docs', 'openapi');
  if (!existsSync(docsDir)) {
    mkdirSync(docsDir, { recursive: true });
  }
  
  // Save JSON specification
  const jsonPath = join(docsDir, 'bitcode-mcp-openapi.json');
  writeFileSync(jsonPath, JSON.stringify(spec, null, 2));
  
  // Save YAML specification
  const yamlPath = join(docsDir, 'bitcode-mcp-openapi.yaml');
  const yaml = convertToYAML(spec);
  writeFileSync(yamlPath, yaml);
  
  console.log('✅ OpenAPI specifications generated:');
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   YAML: ${yamlPath}`);
}

/**
 * Convert JSON to YAML format (simple implementation)
 */
function convertToYAML(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      yaml += `${spaces}- ${convertToYAML(item, indent + 1).trim()}\n`;
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
      } else {
        const stringValue = typeof value === 'string' ? `"${value}"` : String(value);
        yaml += `${spaces}${key}: ${stringValue}\n`;
      }
    }
  } else {
    return String(obj);
  }
  
  return yaml;
}

// Generate specifications if run directly
if (require.main === module) {
  generateOpenAPIFiles();
}
