# Bitcode MCP Server Testing Suite

## Overview

The Bitcode MCP Server testing suite represents the state-of-the-art in Model Context Protocol testing, combining comprehensive protocol compliance validation, sophisticated mocking, dry running capabilities, and customer-focused scenarios to ensure our MCP server delivers exceptional technical-knowledge value.

## Test Architecture

### 🏗️ Framework Components

- **MCPTestFramework**: Core testing framework with advanced mocking and dry running
- **MCPTestFixtures**: Comprehensive test data and customer scenarios  
- **MockOrchestrator Integration**: Leverages Bitcode's existing sophisticated mocking infrastructure
- **Dry Run System**: Production-like testing without external API calls
- **Customer Scenario Validation**: Real-world usage scenarios with business value metrics

### 🎯 Test Categories

1. **Protocol Compliance Tests**: MCP 2024-11-05 specification validation
2. **Authentication & Authorization Tests**: Security and permission validation
3. **Tool Execution Tests**: Tool execution scenarios across categories
4. **Performance & Load Tests**: Throughput, latency, and scalability validation
5. **Security Tests**: Injection attacks, input validation, and audit compliance
6. **Customer Scenario Tests**: Real-world usage with business value metrics
7. **Dry Run & Mock Tests**: Production simulation without external dependencies

## Getting Started

### Prerequisites

- Node.js 18+ 
- Jest 29+
- TypeScript 5+
- 2GB+ available memory for comprehensive tests

### Installation

```bash
# Install dependencies
npm install

# Install additional test reporters
npm install --save-dev jest-html-reporters jest-junit @jest/reporter-github-actions
```

### Running Tests

#### Quick Test Commands

```bash
# Run all MCP tests
npm run test:mcp

# Run tests in watch mode
npm run test:mcp:watch

# Run with dry run mode (no external API calls)
npm run test:dry-run

# Generate comprehensive test report
npm run test:report
```

#### Targeted Test Commands

```bash
# Performance tests only
npm run test:mcp:performance

# Security tests only  
npm run test:mcp:security

# Customer scenario tests only
npm run test:mcp:customer

# CI environment (with coverage)
npm run test:mcp:ci
```

## Test Configuration

### Environment Variables

```bash
# Core test settings
NODE_ENV=test                    # Test environment
DRY_RUN_MODE=true               # Enable dry run mode
MCP_TEST_MODE=true              # Enable MCP-specific test features
LOG_LEVEL=debug                 # Detailed logging

# Performance settings
MCP_TEST_TIMEOUT=300000         # 5 minute timeout
MCP_TEST_MAX_MEMORY=2048        # 2GB memory limit
MCP_TEST_MAX_CPU=80             # 80% CPU limit

# Mock settings
MOCK_GITHUB_API=true            # Mock GitHub API calls
MOCK_OPENAI_API=true            # Mock OpenAI API calls
MOCK_FIGMA_API=true             # Mock Figma API calls
MOCK_SUPABASE=true              # Mock Supabase calls
```

### Jest Configuration

The test suite uses `jest.config.mcp.js` with optimized settings:

- **Multi-project setup** for different test categories
- **Custom reporters** for comprehensive reporting
- **95% coverage targets** for core components
- **Performance monitoring** with resource limits
- **Advanced mocking** with MockOrchestrator integration

## Test Structure

### Directory Organization

```
packages/mcp-server/src/__tests__/
├── framework/                   # Core testing framework
│   ├── MCPTestFramework.ts     # Main test framework
│   └── ...
├── fixtures/                   # Test data and scenarios
│   ├── MCPTestFixtures.ts      # Comprehensive test fixtures
│   └── ...
├── suites/                     # Main test suites
│   ├── MCPServerTestSuite.test.ts    # Integration tests
│   └── ...
├── tools/                      # Tool-specific tests
│   ├── MCPToolsTestSuite.test.ts     # Tool surfaces across categories
│   └── ...
├── setup/                      # Test environment setup
│   ├── mcpTestSetup.ts         # Global test setup
│   ├── mcpGlobalSetup.ts       # Pre-test initialization
│   └── mcpGlobalTeardown.ts    # Post-test cleanup
└── processors/                 # Custom test processors
    └── mcpTestResultsProcessor.js    # Enhanced reporting
```

### Test Fixtures

The testing suite includes comprehensive fixtures for:

- **Authentication Contexts**: Owner, Admin, Developer, Limited User scenarios
- **Repository Contexts**: Next.js, React Native, Python API, retired projects
- **Multimodal Attachments**: Figma designs, screenshots, documents, videos
- **Pipeline Results**: Success, failure, and cancellation scenarios
- **Streaming Events**: Real-time pipeline execution events
- **Customer Scenarios**: 5+ real-world usage scenarios with business value metrics

## Customer-Focused Testing

### Business Value Validation

Every test includes customer impact metrics:

- **Business Value Assertions**: Quantifiable improvement metrics (80% faster, 95% fewer issues)
- **User Experience Validation**: Excellent, Good, Poor, Broken ratings
- **Risk Assessment**: Low, Medium, High, Critical risk levels
- **Customer Satisfaction Scoring**: 0-100% satisfaction metrics

### Real-World Scenarios

1. **Startup Developer Building MVP**: E-commerce checkout with 80% time-to-market acceleration
2. **Enterprise Team Lead Upgrading**: Retired system migration with 95% risk reduction
3. **Mobile Developer**: Real-time chat feature 3x faster delivery
4. **Freelancer with Limited BTC Fee Liquidity**: Cost-effective development validation
5. **Security Team Audit**: 95% automated vulnerability identification

## Advanced Features

### Dry Run System

The dry run system provides production-like testing without external dependencies:

- **Schema-Aware Mocking**: Intelligent mock response generation
- **Agent Test Factories**: Scalable testing patterns for pipeline agents
- **Performance Simulation**: Configurable delays and failure rates
- **Configuration Loading**: Agent-specific test configurations

### MockOrchestrator Integration

Leverages Bitcode's sophisticated mocking infrastructure:

- **Extensive Mockable Features**: Comprehensive service mocking
- **Intelligent Caching**: Performance-optimized with TTL/LRU eviction
- **Plugin Architecture**: Extensible mock functionality
- **Environment-Based Configuration**: Dynamic mock behavior

### Performance Monitoring

Built-in performance tracking:

- **Real-time Metrics**: Memory, CPU, duration, throughput
- **Threshold Validation**: Automatic performance regression detection
- **Resource Utilization**: Detailed resource usage analysis
- **Bottleneck Identification**: Automatic slow test detection

## Interpreting Test Results

### Test Report Structure

```json
{
  "summary": {
    "totalTests": 150,
    "passed": 147,
    "failed": 3,
    "passRate": 98.0,
    "duration": 180000
  },
  "customerImpact": {
    "satisfactionScore": 92.5,
    "riskLevel": "low",
    "businessValueTests": {
      "passed": 45,
      "total": 47,
      "percentage": 95.7
    }
  },
  "performance": {
    "throughput": 25.5,
    "latency": 1200,
    "errorRate": 0.02,
    "resourceUtilization": 65
  }
}
```

### Quality Metrics

- **Overall Quality Score**: Weighted combination of test results (40%), customer impact (40%), and performance (20%)
- **Customer Satisfaction Score**: Based on business value test results with critical test bonuses
- **Risk Level Calculation**: Based on failure patterns and critical test results
- **Performance Benchmarks**: Throughput targets (>10 tests/sec), latency limits (<5s), error rates (<5%)

### Recommendations Engine

The test suite automatically generates actionable recommendations:

- **Coverage Improvements**: Specific areas reading more test coverage
- **Performance Optimizations**: Slow tests and bottleneck identification
- **Customer Impact Enhancement**: Focus areas for better customer value
- **Risk Mitigation**: Critical issues requiring immediate attention

## Best Practices

### Writing MCP Tests

```typescript
import { MCPTestFramework, MCPTestConfig } from '../framework/MCPTestFramework';
import { TEST_CONFIGURATIONS, CUSTOMER_SCENARIOS } from '../fixtures/MCPTestFixtures';

describe('My MCP Feature', () => {
  it('should deliver exceptional customer value', async () => {
    const config: MCPTestConfig = {
      ...TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
      testName: 'My Feature Test',
      customerScenarios: [CUSTOMER_SCENARIOS.STARTUP_DEVELOPER]
    };
    
    const framework = new MCPTestFramework(config);
    const result = await framework.executeTestSuite();
    
    expect(result.passed).toBe(true);
    expect(result.customerImpact.overallScore).toBeGreaterThan(85);
    expect(result.customerImpact.riskLevel).toBe('low');
  });
});
```

### Customer Scenario Design

```typescript
{
  name: 'Descriptive Scenario Name',
  description: 'Clear description of the user workflow',
  userContext: AUTH_CONTEXTS.APPROPRIATE_USER,
  inputs: {
    task: 'Specific, measurable task description',
    repository: APPROPRIATE_REPO_CONTEXT,
    attachments: [RELEVANT_ATTACHMENTS]
  },
  expectedOutcome: 'success' | 'failure' | 'partial',
  businessValue: 'Quantifiable business impact with metrics'
}
```

### Performance Optimization

- **Use dry run mode** for development to avoid external API rate limits
- **Run targeted test suites** for faster feedback cycles
- **Monitor resource usage** to identify memory leaks or CPU bottlenecks
- **Parallelize appropriately** while maintaining test isolation

## Continuous Integration

### GitHub Actions Integration

```yaml
- name: Run MCP Tests
  run: npm run test:mcp:ci
  env:
    NODE_ENV: test
    DRY_RUN_MODE: true
    CI: true

- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: mcp-test-reports
    path: |
      coverage/
      tmp/test-reports/
```

### Quality Gates

- **Minimum 85% test coverage** for overall codebase
- **95% coverage requirement** for core MCP server components
- **90% customer satisfaction score** for customer scenario tests
- **Zero critical security findings** in security test suite
- **Performance thresholds**: <5s latency, >10 tests/sec throughput

## Troubleshooting

### Common Issues

**Tests timing out**:
- Increase `MCP_TEST_TIMEOUT` environment variable
- Use dry run mode to eliminate external API delays
- Check for resource constraints (memory/CPU limits)

**Memory issues**:
- Reduce `MCP_TEST_MAX_MEMORY` if needed
- Run test suites individually rather than all at once
- Check for memory leaks in test cleanup

**Mock failures**:
- Verify MockOrchestrator configuration
- Check external service mock responses
- Ensure proper test isolation

**Performance degradation**:
- Use performance profiling: `npm run test:mcp:performance`
- Check resource utilization metrics
- Identify slow tests with bottleneck analysis

### Debug Mode

```bash
# Enable verbose logging
LOG_LEVEL=debug npm run test:mcp

# Run single test file
npx jest --config jest.config.mcp.js src/__tests__/suites/MCPServerTestSuite.test.ts

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --config jest.config.mcp.js --runInBand
```

## Contributing

### Adding New Tests

1. **Create test fixtures** in `fixtures/MCPTestFixtures.ts`
2. **Design customer scenarios** with clear business value metrics
3. **Implement test suite** following the MCPTestFramework pattern
4. **Add performance benchmarks** and quality thresholds
5. **Update documentation** with new test categories

### Extending the Framework

1. **Enhance MCPTestFramework** for new testing capabilities
2. **Add mock providers** to MockOrchestrator integration
3. **Create specialized validators** for domain-specific testing
4. **Improve reporting** with additional metrics and visualizations

## Conclusion

The Bitcode MCP Server testing suite covers MCP behavior, customer scenarios, and operational requirements so the interface can deliver customer value while maintaining quality, performance, and security.

Through mocking, customer scenarios, and production-grade validation, the MCP server is checked against the technical-knowledge exchange behavior customers depend on.
