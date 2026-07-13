/**
 * Production-Grade Configuration Management and Environment Validation
 * Enterprise-Level Environment Setup, Validation, and Runtime Configuration
 */

import { log } from '@bitcode/logger';
import { z } from 'zod';

// ============================================================================
// Environment Schema Validation
// ============================================================================

const EnvironmentSchema = z.object({
  // Core API Keys
  EXA_API_KEY: z.string().min(1, 'Exa API key is required'),
  GITHUB_API_KEY: z.string().optional(),
  STACKEXCHANGE_API_KEY: z.string().optional(),
  SEMANTIC_SCHOLAR_API_KEY: z.string().optional(),
  
  // Environment Configuration
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Performance Configuration
  WEB_SEARCH_CACHE_SIZE: z.string().regex(/^\d+$/).transform(Number).default('1000'),
  WEB_SEARCH_CACHE_TTL: z.string().regex(/^\d+$/).transform(Number).default('300000'), // 5 minutes
  WEB_SEARCH_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default('15000'),
  WEB_SEARCH_MAX_RESULTS: z.string().regex(/^\d+$/).transform(Number).default('20'),
  
  // Rate Limiting
  WEB_SEARCH_RATE_LIMIT_EXA: z.string().regex(/^\d+$/).transform(Number).default('60'),
  WEB_SEARCH_RATE_LIMIT_GITHUB: z.string().regex(/^\d+$/).transform(Number).default('30'),
  WEB_SEARCH_RATE_LIMIT_STACKOVERFLOW: z.string().regex(/^\d+$/).transform(Number).default('30'),
  WEB_SEARCH_RATE_LIMIT_SEMANTIC_SCHOLAR: z.string().regex(/^\d+$/).transform(Number).default('100'),
  
  // Circuit Breaker Configuration
  WEB_SEARCH_CIRCUIT_BREAKER_THRESHOLD: z.string().regex(/^\d+$/).transform(Number).default('5'),
  WEB_SEARCH_CIRCUIT_BREAKER_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default('30000'),
  WEB_SEARCH_CIRCUIT_BREAKER_RESET_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default('60000'),
  
  // Retry Configuration
  WEB_SEARCH_RETRY_ATTEMPTS: z.string().regex(/^\d+$/).transform(Number).default('3'),
  WEB_SEARCH_RETRY_BASE_DELAY: z.string().regex(/^\d+$/).transform(Number).default('1000'),
  WEB_SEARCH_RETRY_MAX_DELAY: z.string().regex(/^\d+$/).transform(Number).default('10000'),
  
  // Feature Flags
  WEB_SEARCH_ENABLE_CACHING: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  WEB_SEARCH_ENABLE_URL_INTELLIGENCE: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  WEB_SEARCH_ENABLE_MULTI_PROVIDER: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  WEB_SEARCH_ENABLE_RESILIENCE: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  WEB_SEARCH_ENABLE_METRICS: z.string().transform(val => val.toLowerCase() === 'true').default('true'),
  
  // Security Configuration
  WEB_SEARCH_ALLOWED_DOMAINS: z.string().optional(),
  WEB_SEARCH_BLOCKED_DOMAINS: z.string().optional(),
  WEB_SEARCH_MAX_QUERY_LENGTH: z.string().regex(/^\d+$/).transform(Number).default('500'),
  
  // Monitoring and Observability
  WEB_SEARCH_METRICS_INTERVAL: z.string().regex(/^\d+$/).transform(Number).default('300000'), // 5 minutes
  WEB_SEARCH_HEALTH_CHECK_INTERVAL: z.string().regex(/^\d+$/).transform(Number).default('60000'), // 1 minute
  
  // Provider-Specific Configuration
  GITHUB_API_VERSION: z.string().default('2022-11-28'),
  STACKEXCHANGE_SITE: z.string().default('stackoverflow'),
  SEMANTIC_SCHOLAR_FIELDS: z.string().default('title,abstract,url,venue,year,citationCount,authors'),
}).partial().transform((data) => {
  // Transform environment variables that might not exist into proper defaults
  const env = process.env;
  const result: any = {};
  
  Object.keys(data).forEach(key => {
    result[key] = env[key] !== undefined ? data[key] : EnvironmentSchema.shape[key as keyof typeof EnvironmentSchema.shape]._def.defaultValue?.();
  });
  
  // Apply actual environment values
  Object.entries(env).forEach(([key, value]) => {
    if (key in EnvironmentSchema.shape && value !== undefined) {
      try {
        const fieldSchema = EnvironmentSchema.shape[key as keyof typeof EnvironmentSchema.shape];
        result[key] = fieldSchema.parse(value);
      } catch (error) {
        // Keep original value if parsing fails
        result[key] = value;
      }
    }
  });
  
  return result;
});

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;

// ============================================================================
// Configuration Manager
// ============================================================================

export class ConfigurationManager {
  private config: EnvironmentConfig;
  private validationErrors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.config = this.loadAndValidateConfig();
    this.performRuntimeValidation();
  }

  private normalizeEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
    const normalized = { ...env };
    if (!normalized.EXA_API_KEY && normalized.EXASEARCH_API_KEY) {
      normalized.EXA_API_KEY = normalized.EXASEARCH_API_KEY;
    }
    return normalized;
  }

  private loadAndValidateConfig(): EnvironmentConfig {
    try {
      const config = EnvironmentSchema.parse(this.normalizeEnv(process.env));
      log('Configuration loaded successfully', 'info', {
        environment: config.NODE_ENV,
        featuresEnabled: this.getEnabledFeatures(config)
      });
      return config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.validationErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        log('Configuration validation failed', 'error', {
          errors: this.validationErrors
        });
        
        // Attempt to use defaults for critical missing values
        return this.createFallbackConfig();
      }
      throw error;
    }
  }

  private createFallbackConfig(): EnvironmentConfig {
    const resolvedExaKey = process.env.EXA_API_KEY ?? process.env.EXASEARCH_API_KEY ?? '';
    const fallback = {
      EXA_API_KEY: resolvedExaKey,
      NODE_ENV: 'development' as const,
      LOG_LEVEL: 'info' as const,
      WEB_SEARCH_CACHE_SIZE: 1000,
      WEB_SEARCH_CACHE_TTL: 300000,
      WEB_SEARCH_TIMEOUT: 15000,
      WEB_SEARCH_MAX_RESULTS: 20,
      WEB_SEARCH_RATE_LIMIT_EXA: 60,
      WEB_SEARCH_RATE_LIMIT_GITHUB: 30,
      WEB_SEARCH_RATE_LIMIT_STACKOVERFLOW: 30,
      WEB_SEARCH_RATE_LIMIT_SEMANTIC_SCHOLAR: 100,
      WEB_SEARCH_CIRCUIT_BREAKER_THRESHOLD: 5,
      WEB_SEARCH_CIRCUIT_BREAKER_TIMEOUT: 30000,
      WEB_SEARCH_CIRCUIT_BREAKER_RESET_TIMEOUT: 60000,
      WEB_SEARCH_RETRY_ATTEMPTS: 3,
      WEB_SEARCH_RETRY_BASE_DELAY: 1000,
      WEB_SEARCH_RETRY_MAX_DELAY: 10000,
      WEB_SEARCH_ENABLE_CACHING: true,
      WEB_SEARCH_ENABLE_URL_INTELLIGENCE: true,
      WEB_SEARCH_ENABLE_MULTI_PROVIDER: true,
      WEB_SEARCH_ENABLE_RESILIENCE: true,
      WEB_SEARCH_ENABLE_METRICS: true,
      WEB_SEARCH_MAX_QUERY_LENGTH: 500,
      WEB_SEARCH_METRICS_INTERVAL: 300000,
      WEB_SEARCH_HEALTH_CHECK_INTERVAL: 60000,
      GITHUB_API_VERSION: '2022-11-28',
      STACKEXCHANGE_SITE: 'stackoverflow',
      SEMANTIC_SCHOLAR_FIELDS: 'title,abstract,url,venue,year,citationCount,authors'
    } as EnvironmentConfig;

    log('Using fallback configuration due to validation errors', 'warn', {
      errors: this.validationErrors
    });

    return fallback;
  }

  private performRuntimeValidation(): void {
    // Check API key availability and warn about limited functionality
    if (!this.config.EXA_API_KEY) {
      this.validationErrors.push('EXA_API_KEY is required for basic search functionality');
    }

    if (!this.config.GITHUB_API_KEY) {
      this.warnings.push('GITHUB_API_KEY not set - GitHub search will be disabled');
    }

    if (!this.config.STACKEXCHANGE_API_KEY) {
      this.warnings.push('STACKEXCHANGE_API_KEY not set - Stack Overflow search will be disabled');
    }

    if (!this.config.SEMANTIC_SCHOLAR_API_KEY) {
      this.warnings.push('SEMANTIC_SCHOLAR_API_KEY not set - Academic search will be disabled');
    }

    // Validate performance settings
    if (this.config.WEB_SEARCH_TIMEOUT < 5000) {
      this.warnings.push('WEB_SEARCH_TIMEOUT is set below 5 seconds - this may cause frequent timeouts');
    }

    if (this.config.WEB_SEARCH_CACHE_SIZE > 10000) {
      this.warnings.push('WEB_SEARCH_CACHE_SIZE is very large - this may consume significant memory');
    }

    // Production environment specific validations
    if (this.config.NODE_ENV === 'production') {
      this.validateProductionConfig();
    }

    // Log warnings
    if (this.warnings.length > 0) {
      log('Configuration warnings detected', 'warn', {
        warnings: this.warnings
      });
    }
  }

  private validateProductionConfig(): void {
    if (!this.config.EXA_API_KEY) {
      this.validationErrors.push('EXA_API_KEY is required in production');
    }

    if (this.config.LOG_LEVEL === 'debug') {
      this.warnings.push('Debug logging is enabled in production - consider using info level');
    }

    if (!this.config.WEB_SEARCH_ENABLE_RESILIENCE) {
      this.warnings.push('Resilience features are disabled in production - this is not recommended');
    }

    if (!this.config.WEB_SEARCH_ENABLE_METRICS) {
      this.warnings.push('Metrics are disabled in production - monitoring will be limited');
    }

    if (this.config.WEB_SEARCH_RETRY_ATTEMPTS > 5) {
      this.warnings.push('Retry attempts are set very high - this may impact performance');
    }
  }

  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  public isFeatureEnabled(feature: keyof Pick<EnvironmentConfig, 
    'WEB_SEARCH_ENABLE_CACHING' | 
    'WEB_SEARCH_ENABLE_URL_INTELLIGENCE' | 
    'WEB_SEARCH_ENABLE_MULTI_PROVIDER' | 
    'WEB_SEARCH_ENABLE_RESILIENCE' | 
    'WEB_SEARCH_ENABLE_METRICS'
  >): boolean {
    return Boolean(this.config[feature]);
  }

  public getProviderConfig(provider: 'exa' | 'github' | 'stackoverflow' | 'semantic_scholar') {
    const baseConfig = {
      timeout: this.config.WEB_SEARCH_TIMEOUT,
      retryAttempts: this.config.WEB_SEARCH_RETRY_ATTEMPTS,
      retryBaseDelay: this.config.WEB_SEARCH_RETRY_BASE_DELAY,
      retryMaxDelay: this.config.WEB_SEARCH_RETRY_MAX_DELAY,
      circuitBreakerThreshold: this.config.WEB_SEARCH_CIRCUIT_BREAKER_THRESHOLD,
      circuitBreakerTimeout: this.config.WEB_SEARCH_CIRCUIT_BREAKER_TIMEOUT,
      circuitBreakerResetTimeout: this.config.WEB_SEARCH_CIRCUIT_BREAKER_RESET_TIMEOUT
    };

    switch (provider) {
      case 'exa':
        return {
          ...baseConfig,
          apiKey: this.config.EXA_API_KEY,
          rateLimit: this.config.WEB_SEARCH_RATE_LIMIT_EXA,
          enabled: Boolean(this.config.EXA_API_KEY)
        };
      case 'github':
        return {
          ...baseConfig,
          apiKey: this.config.GITHUB_API_KEY,
          rateLimit: this.config.WEB_SEARCH_RATE_LIMIT_GITHUB,
          apiVersion: this.config.GITHUB_API_VERSION,
          enabled: Boolean(this.config.GITHUB_API_KEY)
        };
      case 'stackoverflow':
        return {
          ...baseConfig,
          apiKey: this.config.STACKEXCHANGE_API_KEY,
          rateLimit: this.config.WEB_SEARCH_RATE_LIMIT_STACKOVERFLOW,
          site: this.config.STACKEXCHANGE_SITE,
          enabled: Boolean(this.config.STACKEXCHANGE_API_KEY)
        };
      case 'semantic_scholar':
        return {
          ...baseConfig,
          apiKey: this.config.SEMANTIC_SCHOLAR_API_KEY,
          rateLimit: this.config.WEB_SEARCH_RATE_LIMIT_SEMANTIC_SCHOLAR,
          fields: this.config.SEMANTIC_SCHOLAR_FIELDS,
          enabled: Boolean(this.config.SEMANTIC_SCHOLAR_API_KEY)
        };
      default:
        return baseConfig;
    }
  }

  public getValidationStatus(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    enabledProviders: string[];
    disabledProviders: string[];
  } {
    const providers = ['exa', 'github', 'stackoverflow', 'semantic_scholar'] as const;
    const enabledProviders: string[] = [];
    const disabledProviders: string[] = [];

    providers.forEach(provider => {
      const config = this.getProviderConfig(provider);
      if (config.enabled) {
        enabledProviders.push(provider);
      } else {
        disabledProviders.push(provider);
      }
    });

    return {
      isValid: this.validationErrors.length === 0,
      errors: this.validationErrors,
      warnings: this.warnings,
      enabledProviders,
      disabledProviders
    };
  }

  public getSecurityConfig() {
    return {
      allowedDomains: this.config.WEB_SEARCH_ALLOWED_DOMAINS?.split(',').map(d => d.trim()).filter(Boolean) || [],
      blockedDomains: this.config.WEB_SEARCH_BLOCKED_DOMAINS?.split(',').map(d => d.trim()).filter(Boolean) || [],
      maxQueryLength: this.config.WEB_SEARCH_MAX_QUERY_LENGTH,
      rateLimiting: {
        exa: this.config.WEB_SEARCH_RATE_LIMIT_EXA,
        github: this.config.WEB_SEARCH_RATE_LIMIT_GITHUB,
        stackoverflow: this.config.WEB_SEARCH_RATE_LIMIT_STACKOVERFLOW,
        semantic_scholar: this.config.WEB_SEARCH_RATE_LIMIT_SEMANTIC_SCHOLAR
      }
    };
  }

  public getPerformanceConfig() {
    return {
      caching: {
        enabled: this.config.WEB_SEARCH_ENABLE_CACHING,
        size: this.config.WEB_SEARCH_CACHE_SIZE,
        ttl: this.config.WEB_SEARCH_CACHE_TTL
      },
      timeouts: {
        search: this.config.WEB_SEARCH_TIMEOUT,
        circuitBreaker: this.config.WEB_SEARCH_CIRCUIT_BREAKER_TIMEOUT,
        circuitBreakerReset: this.config.WEB_SEARCH_CIRCUIT_BREAKER_RESET_TIMEOUT
      },
      retry: {
        maxAttempts: this.config.WEB_SEARCH_RETRY_ATTEMPTS,
        baseDelay: this.config.WEB_SEARCH_RETRY_BASE_DELAY,
        maxDelay: this.config.WEB_SEARCH_RETRY_MAX_DELAY
      },
      limits: {
        maxResults: this.config.WEB_SEARCH_MAX_RESULTS,
        maxQueryLength: this.config.WEB_SEARCH_MAX_QUERY_LENGTH
      }
    };
  }

  private getEnabledFeatures(config: EnvironmentConfig): string[] {
    const features: string[] = [];
    
    if (config.WEB_SEARCH_ENABLE_CACHING) features.push('caching');
    if (config.WEB_SEARCH_ENABLE_URL_INTELLIGENCE) features.push('url-intelligence');
    if (config.WEB_SEARCH_ENABLE_MULTI_PROVIDER) features.push('multi-provider');
    if (config.WEB_SEARCH_ENABLE_RESILIENCE) features.push('resilience');
    if (config.WEB_SEARCH_ENABLE_METRICS) features.push('metrics');
    
    return features;
  }

  public reloadConfig(): void {
    log('Reloading configuration from environment', 'info');
    
    const previousConfig = this.config;
    this.validationErrors = [];
    this.warnings = [];
    
    this.config = this.loadAndValidateConfig();
    this.performRuntimeValidation();
    
    // Log configuration changes
    const changes = this.detectConfigChanges(previousConfig, this.config);
    if (changes.length > 0) {
      log('Configuration changes detected', 'info', { changes });
    }
  }

  private detectConfigChanges(oldConfig: EnvironmentConfig, newConfig: EnvironmentConfig): string[] {
    const changes: string[] = [];
    
    Object.keys(newConfig).forEach(key => {
      const typedKey = key as keyof EnvironmentConfig;
      if (oldConfig[typedKey] !== newConfig[typedKey]) {
        changes.push(`${key}: ${oldConfig[typedKey]} -> ${newConfig[typedKey]}`);
      }
    });
    
    return changes;
  }
}

// ============================================================================
// Global Configuration Instance
// ============================================================================

let globalConfigManager: ConfigurationManager | null = null;

export function getConfigManager(): ConfigurationManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigurationManager();
  }
  return globalConfigManager;
}

export function reloadGlobalConfig(): void {
  if (globalConfigManager) {
    globalConfigManager.reloadConfig();
  }
}

// ============================================================================
// Environment Validation Utilities
// ============================================================================

export function validateEnvironment(): {
  isReady: boolean;
  summary: string;
  details: {
    requiredKeys: { key: string; present: boolean; masked?: string }[];
    optionalKeys: { key: string; present: boolean; masked?: string }[];
    configuration: { valid: boolean; errors: string[]; warnings: string[] };
    features: { name: string; enabled: boolean }[];
    providers: { name: string; enabled: boolean; ready: boolean }[];
  };
} {
  const configManager = getConfigManager();
  const validation = configManager.getValidationStatus();
  
  const requiredKeys = [
    { key: 'EXA_API_KEY', present: Boolean(process.env.EXA_API_KEY), masked: process.env.EXA_API_KEY ? `${process.env.EXA_API_KEY.slice(0, 8)}...` : undefined }
  ];
  
  const optionalKeys = [
    { key: 'GITHUB_API_KEY', present: Boolean(process.env.GITHUB_API_KEY), masked: process.env.GITHUB_API_KEY ? `${process.env.GITHUB_API_KEY.slice(0, 8)}...` : undefined },
    { key: 'STACKEXCHANGE_API_KEY', present: Boolean(process.env.STACKEXCHANGE_API_KEY), masked: process.env.STACKEXCHANGE_API_KEY ? `${process.env.STACKEXCHANGE_API_KEY.slice(0, 8)}...` : undefined },
    { key: 'SEMANTIC_SCHOLAR_API_KEY', present: Boolean(process.env.SEMANTIC_SCHOLAR_API_KEY), masked: process.env.SEMANTIC_SCHOLAR_API_KEY ? `${process.env.SEMANTIC_SCHOLAR_API_KEY.slice(0, 8)}...` : undefined }
  ];
  
  const features = [
    { name: 'Caching', enabled: configManager.isFeatureEnabled('WEB_SEARCH_ENABLE_CACHING') },
    { name: 'URL Intelligence', enabled: configManager.isFeatureEnabled('WEB_SEARCH_ENABLE_URL_INTELLIGENCE') },
    { name: 'Multi-Provider', enabled: configManager.isFeatureEnabled('WEB_SEARCH_ENABLE_MULTI_PROVIDER') },
    { name: 'Resilience', enabled: configManager.isFeatureEnabled('WEB_SEARCH_ENABLE_RESILIENCE') },
    { name: 'Metrics', enabled: configManager.isFeatureEnabled('WEB_SEARCH_ENABLE_METRICS') }
  ];
  
  const providers = [
    { name: 'Exa', enabled: validation.enabledProviders.includes('exa'), ready: Boolean(process.env.EXA_API_KEY) },
    { name: 'GitHub', enabled: validation.enabledProviders.includes('github'), ready: Boolean(process.env.GITHUB_API_KEY) },
    { name: 'Stack Overflow', enabled: validation.enabledProviders.includes('stackoverflow'), ready: Boolean(process.env.STACKEXCHANGE_API_KEY) },
    { name: 'Semantic Scholar', enabled: validation.enabledProviders.includes('semantic_scholar'), ready: Boolean(process.env.SEMANTIC_SCHOLAR_API_KEY) }
  ];
  
  const isReady = validation.isValid && requiredKeys.every(k => k.present);
  
  const summary = isReady
    ? `Environment ready: ${validation.enabledProviders.length}/${providers.length} providers enabled, ${features.filter(f => f.enabled).length}/${features.length} features active`
    : `Environment issues: ${validation.errors.length} errors, ${validation.warnings.length} warnings`;
  
  return {
    isReady,
    summary,
    details: {
      requiredKeys,
      optionalKeys,
      configuration: {
        valid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      features,
      providers
    }
  };
}

export function getConfigSummary(): string {
  const configManager = getConfigManager();
  const config = configManager.getConfig();
  const validation = configManager.getValidationStatus();
  
  return `
🔧 Web Search Configuration Summary
Environment: ${config.NODE_ENV}
✅ Providers: ${validation.enabledProviders.join(', ')}
❌ Disabled: ${validation.disabledProviders.join(', ')}
⚡ Features: Caching(${config.WEB_SEARCH_ENABLE_CACHING}), Multi-Provider(${config.WEB_SEARCH_ENABLE_MULTI_PROVIDER}), Resilience(${config.WEB_SEARCH_ENABLE_RESILIENCE})
📊 Performance: ${config.WEB_SEARCH_MAX_RESULTS} max results, ${config.WEB_SEARCH_TIMEOUT}ms timeout
${validation.errors.length > 0 ? `🚨 Errors: ${validation.errors.length}` : ''}
${validation.warnings.length > 0 ? `⚠️  Warnings: ${validation.warnings.length}` : ''}
`.trim();
}
