/**
 * MCP Global Test Setup
 * 
 * Global setup for MCP test suite with infrastructure initialization,
 * test database setup, and performance monitoring initialization.
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Global setup function executed once before all tests
 */
export default async function globalSetup(): Promise<void> {
  console.log('🌍 MCP Global Test Setup Starting...');
  
  try {
    // 1. Environment Setup
    await setupTestEnvironment();
    
    // 2. Create test directories
    await createTestDirectories();
    
    // 3. Initialize test data
    await initializeTestData();
    
    // 4. Setup performance monitoring
    await setupPerformanceMonitoring();
    
    // 5. Initialize mock services
    await initializeMockServices();
    
    // 6. Validate test prerequisites
    await validateTestPrerequisites();
    
    console.log('✅ MCP Global Test Setup Complete');
    
  } catch (error) {
    console.error('❌ MCP Global Test Setup Failed:', error);
    process.exit(1);
  }
}

/**
 * Setup test environment variables and configuration
 */
async function setupTestEnvironment(): Promise<void> {
  console.log('📝 Setting up test environment...');
  
  // Core environment variables
  process.env.NODE_ENV = 'test';
  process.env.DRY_RUN_MODE = 'true';
  process.env.MCP_TEST_MODE = 'true';
  process.env.LOG_LEVEL = 'debug';
  
  // Test-specific configuration
  process.env.MCP_TEST_TIMEOUT = '300000'; // 5 minutes
  process.env.MCP_TEST_MAX_MEMORY = '2048'; // 2GB
  process.env.MCP_TEST_MAX_CPU = '80'; // 80%
  
  // Mock API endpoints
  process.env.MOCK_GITHUB_API = 'true';
  process.env.MOCK_OPENAI_API = 'true';
  process.env.MOCK_FIGMA_API = 'true';
  process.env.MOCK_SUPABASE = 'true';
  
  // Test database configuration
  process.env.TEST_DB_URL = 'memory://test-db';
  process.env.TEST_REDIS_URL = 'memory://test-redis';
  
  // Disable external network calls
  process.env.DISABLE_EXTERNAL_REQUESTS = 'true';
  
  // Performance monitoring
  process.env.ENABLE_TEST_METRICS = 'true';
  process.env.TEST_METRICS_INTERVAL = '1000'; // 1 second
  
  console.log('✅ Test environment configured');
}

/**
 * Create necessary test directories
 */
async function createTestDirectories(): Promise<void> {
  console.log('📁 Creating test directories...');
  
  const testDirs = [
    'tmp/jest-cache-mcp',
    'tmp/test-data',
    'tmp/test-logs',
    'tmp/test-metrics',
    'tmp/test-fixtures',
    'coverage',
    'coverage/html-report'
  ];
  
  const rootDir = process.cwd();
  
  for (const dir of testDirs) {
    const fullPath = join(rootDir, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`  Created: ${dir}`);
    }
  }
  
  console.log('✅ Test directories created');
}

/**
 * Initialize test data and fixtures
 */
async function initializeTestData(): Promise<void> {
  console.log('🗃️ Initializing test data...');
  
  const testDataDir = join(process.cwd(), 'tmp/test-data');
  
  // Create mock repository data
  const mockRepoData = {
    repositories: [
      {
        id: 123456,
        name: 'test-repo',
        full_name: 'test-org/test-repo',
        owner: { login: 'test-org' },
        private: false,
        default_branch: 'main',
        language: 'TypeScript',
        stargazers_count: 100,
        forks_count: 25
      }
    ],
    pulls: [
      {
        number: 123,
        title: 'Test Pull Request',
        state: 'open',
        html_url: 'https://github.com/test-org/test-repo/pull/123'
      }
    ],
    issues: [
      {
        number: 456,
        title: 'Test Issue',
        state: 'open',
        html_url: 'https://github.com/test-org/test-repo/issues/456'
      }
    ]
  };
  
  writeFileSync(
    join(testDataDir, 'mock-github-data.json'),
    JSON.stringify(mockRepoData, null, 2)
  );
  
  // Create mock pipeline data
  const mockPipelineData = {
    pipelines: [
      {
        id: 'test-pipeline-001',
        type: 'asset-pack',
        subtype: 'pull_request',
        status: 'completed',
        repository: 'test-org/test-repo',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metrics: {
          measuredBtd: 150,
          tokensProcessed: 25000,
          confidence: 0.92
        }
      }
    ],
    executions: [
      {
        pipelineId: 'test-pipeline-001',
        phase: 'implementation',
        status: 'completed',
        duration: 300000,
        outputs: ['pull_request', 'documentation', 'tests']
      }
    ]
  };
  
  writeFileSync(
    join(testDataDir, 'mock-pipeline-data.json'),
    JSON.stringify(mockPipelineData, null, 2)
  );
  
  // Create mock user data
  const mockUserData = {
    users: [
      {
        id: 'test-user-001',
        role: 'owner',
        organizationId: 'test-org-001',
        btdBalance: 10000,
        permissions: {
          pipelines: { create: true, read: true, cancel: true, retry: true },
          organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
          resources: { read: true, export: true }
        }
      }
    ],
    organizations: [
      {
        id: 'test-org-001',
        name: 'Test Organization',
        subscription: 'enterprise',
        btdBalance: 50000
      }
    ]
  };
  
  writeFileSync(
    join(testDataDir, 'mock-user-data.json'),
    JSON.stringify(mockUserData, null, 2)
  );
  
  console.log('✅ Test data initialized');
}

/**
 * Setup performance monitoring for tests
 */
async function setupPerformanceMonitoring(): Promise<void> {
  console.log('📊 Setting up performance monitoring...');
  
  const metricsDir = join(process.cwd(), 'tmp/test-metrics');
  
  // Create performance monitoring configuration
  const perfConfig = {
    enabled: true,
    interval: 1000, // 1 second
    metrics: [
      'memory_usage',
      'cpu_usage',
      'test_duration',
      'test_count',
      'error_rate',
      'throughput'
    ],
    thresholds: {
      maxMemoryUsage: 2048 * 1024 * 1024, // 2GB
      maxCpuUsage: 80, // 80%
      maxTestDuration: 300000, // 5 minutes
      maxErrorRate: 0.05 // 5%
    },
    outputPath: metricsDir
  };
  
  writeFileSync(
    join(metricsDir, 'performance-config.json'),
    JSON.stringify(perfConfig, null, 2)
  );
  
  // Initialize metrics collection
  global.testMetrics = {
    startTime: Date.now(),
    tests: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    performance: {
      memory: [],
      cpu: [],
      duration: []
    },
    errors: []
  };
  
  // Start metrics collection interval
  global.metricsInterval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    global.testMetrics.performance.memory.push({
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });
    
    global.testMetrics.performance.cpu.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
  }, 1000);
  
  console.log('✅ Performance monitoring configured');
}

/**
 * Initialize mock services for testing
 */
async function initializeMockServices(): Promise<void> {
  console.log('🎭 Initializing mock services...');
  
  // Mock HTTP server for external API calls
  global.mockServer = {
    port: 0, // Will be assigned dynamically
    routes: new Map(),
    responses: new Map()
  };
  
  // Pre-configure common mock responses
  global.mockServer.responses.set('github-api', {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Mock GitHub API response',
      data: {}
    })
  });
  
  global.mockServer.responses.set('openai-api', {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4',
      choices: [{
        message: {
          role: 'assistant',
          content: 'Mock AI response for testing'
        },
        finish_reason: 'stop'
      }]
    })
  });
  
  global.mockServer.responses.set('figma-api', {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mock Figma Design',
      lastModified: new Date().toISOString(),
      thumbnailUrl: 'https://figma.com/thumb/mock'
    })
  });
  
  console.log('✅ Mock services initialized');
}

/**
 * Validate test prerequisites
 */
async function validateTestPrerequisites(): Promise<void> {
  console.log('🔍 Validating test prerequisites...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    throw new Error(`Node.js version 18 or higher required, found ${nodeVersion}`);
  }
  
  // Check available memory
  const memUsage = process.memoryUsage();
  const availableMemory = memUsage.heapTotal;
  const requiredMemory = 512 * 1024 * 1024; // 512MB
  if (availableMemory < requiredMemory) {
    throw new Error(`Insufficient memory: ${availableMemory} bytes available, ${requiredMemory} bytes required`);
  }
  
  // Check test data files exist
  const testDataDir = join(process.cwd(), 'tmp/test-data');
  const requiredFiles = [
    'mock-github-data.json',
    'mock-pipeline-data.json',
    'mock-user-data.json'
  ];
  
  for (const file of requiredFiles) {
    const filePath = join(testDataDir, file);
    if (!existsSync(filePath)) {
      throw new Error(`Required test data file missing: ${file}`);
    }
  }
  
  // Validate environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'DRY_RUN_MODE',
    'MCP_TEST_MODE',
    'LOG_LEVEL'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable missing: ${envVar}`);
    }
  }
  
  console.log('✅ Test prerequisites validated');
  console.log(`   Node.js version: ${nodeVersion}`);
  console.log(`   Available memory: ${Math.round(availableMemory / 1024 / 1024)}MB`);
  console.log(`   Test data files: ${requiredFiles.length} files`);
  console.log(`   Environment variables: ${requiredEnvVars.length} variables`);
}

// Export for use in tests
export { globalSetup };
