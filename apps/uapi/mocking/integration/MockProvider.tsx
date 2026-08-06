/**
 * Mock Provider - Seamless Component-Level Mock Integration
 * 
 * Provides React components with transparent access to mock data through:
 * - Context-based mock data delivery
 * - Automatic mock/real data switching
 * - Type-safe hook interfaces
 * - Performance-optimized caching
 * - Real-time scenario switching
 * - Developer experience tools
 */

'use client';

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback, 
  useMemo,
  ReactNode 
} from 'react';

import type {
  MockableFeature,
  MockScenarioType,
  MockDataContainer,
  MockPerformanceMetrics
} from '../types/core';

import { MockOrchestrator } from '../core/MockOrchestrator';
import { mockDataGenerator } from '../generators/MockDataGenerators';

// ============================================================================
// Context and Provider Types
// ============================================================================

interface MockContextValue {
  // Data access
  getMockData: <T>(feature: MockableFeature) => Promise<MockDataContainer<T> | null>;
  
  // State management
  isEnabled: boolean;
  currentScenario: MockScenarioType;
  
  // Control functions
  setScenario: (scenario: MockScenarioType) => void;
  setEnabled: (enabled: boolean) => void;
  refreshData: (feature?: MockableFeature) => Promise<void>;
  
  // Performance and debugging
  getPerformanceMetrics: () => MockPerformanceMetrics;
  validateSystem: () => Promise<any>;
  
  // Developer tools
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => CacheStats;
}

interface CacheStats {
  hitRatio: number;
  itemCount: number;
  totalSizeKB: number;
  oldestEntryAge: number;
}

interface MockProviderProps {
  children: ReactNode;
  initialScenario?: MockScenarioType;
  enabled?: boolean;
  debugMode?: boolean;
  performanceMonitoring?: boolean;
}

// ============================================================================
// Context Creation
// ============================================================================

const MockContext = createContext<MockContextValue | null>(null);

/**
 * High-performance Mock Provider with intelligent caching and state management
 */
export const MockProvider: React.FC<MockProviderProps> = ({
  children,
  initialScenario = 'demo',
  enabled = true,
  debugMode = false,
  performanceMonitoring = true
}) => {
  // Core state management
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentScenario, setCurrentScenario] = useState<MockScenarioType>(initialScenario);
  const [isDebugMode, setDebugMode] = useState(debugMode);
  
  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState<MockPerformanceMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hitRatio: 0,
    itemCount: 0,
    totalSizeKB: 0,
    oldestEntryAge: 0
  });

  // Orchestrator instance
  const orchestrator = useMemo(() => MockOrchestrator.getInstance(), []);

  // ============================================================================
  // Core Mock Data Functions
  // ============================================================================

  const getMockData = useCallback(async <T,>(
    feature: MockableFeature
  ): Promise<MockDataContainer<T> | null> => {
    if (!isEnabled) return null;

    try {
      const startTime = performance.now();
      const data = await orchestrator.getMockData<T>(feature, currentScenario);
      const endTime = performance.now();

      if (isDebugMode) {
        console.log(`MockProvider: Retrieved ${feature} data in ${(endTime - startTime).toFixed(2)}ms`);
      }

      return data;
    } catch (error) {
      console.error(`MockProvider: Error getting mock data for ${feature}:`, error);
      return null;
    }
  }, [isEnabled, currentScenario, orchestrator, isDebugMode]);

  const refreshData = useCallback(async (feature?: MockableFeature): Promise<void> => {
    if (!isEnabled) return;

    try {
      if (feature) {
        // Refresh specific feature
        await orchestrator.getMockData(feature, currentScenario);
      } else {
        // Clear cache to force refresh of all data
        orchestrator.reset();
      }

      if (isDebugMode) {
        console.log(`MockProvider: Refreshed ${feature || 'all'} data`);
      }
    } catch (error) {
      console.error('MockProvider: Error refreshing data:', error);
    }
  }, [isEnabled, currentScenario, orchestrator, isDebugMode]);

  // ============================================================================
  // Scenario Management
  // ============================================================================

  const setScenario = useCallback((scenario: MockScenarioType) => {
    if (scenario === currentScenario) return;

    setCurrentScenario(scenario);
    
    // Clear cache when scenario changes to ensure fresh data
    orchestrator.reset();

    if (isDebugMode) {
      console.log(`MockProvider: Switched to scenario '${scenario}'`);
    }
  }, [currentScenario, orchestrator, isDebugMode]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    
    if (isDebugMode) {
      console.log(`MockProvider: ${enabled ? 'Enabled' : 'Disabled'} mocking`);
    }
  }, [isDebugMode]);

  // ============================================================================
  // Performance and Debugging
  // ============================================================================

  const getPerformanceMetrics = useCallback((): MockPerformanceMetrics => {
    return orchestrator.getPerformanceMetrics();
  }, [orchestrator]);

  const validateSystem = useCallback(async () => {
    return await orchestrator.validateSystem();
  }, [orchestrator]);

  const clearCache = useCallback(() => {
    orchestrator.reset();
    setCacheStats({
      hitRatio: 0,
      itemCount: 0,
      totalSizeKB: 0,
      oldestEntryAge: 0
    });

    if (isDebugMode) {
      console.log('MockProvider: Cache cleared');
    }
  }, [orchestrator, isDebugMode]);

  const getCacheStats = useCallback((): CacheStats => {
    return cacheStats;
  }, [cacheStats]);

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  useEffect(() => {
    if (!performanceMonitoring) return;

    const interval = setInterval(() => {
      const metrics = getPerformanceMetrics();
      setPerformanceMetrics(metrics);

      // Update cache stats
      setCacheStats({
        hitRatio: metrics.mocking.cacheHitRatio,
        itemCount: metrics.mocking.activeScenarios,
        totalSizeKB: metrics.system.memoryUsageMB * 1024,
        oldestEntryAge: Date.now() // Simplified for now
      });

      if (isDebugMode) {
        console.log('MockProvider Performance:', metrics);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [performanceMonitoring, getPerformanceMetrics, isDebugMode]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: MockContextValue = useMemo(() => ({
    // Data access
    getMockData,
    
    // State management
    isEnabled,
    currentScenario,
    
    // Control functions
    setScenario,
    setEnabled,
    refreshData,
    
    // Performance and debugging
    getPerformanceMetrics,
    validateSystem,
    
    // Developer tools
    debugMode: isDebugMode,
    setDebugMode,
    
    // Cache management
    clearCache,
    getCacheStats
  }), [
    getMockData,
    isEnabled,
    currentScenario,
    setScenario,
    setEnabled,
    refreshData,
    getPerformanceMetrics,
    validateSystem,
    isDebugMode,
    setDebugMode,
    clearCache,
    getCacheStats
  ]);

  // ============================================================================
  // Development Tools
  // ============================================================================

  useEffect(() => {
    if (isDebugMode && typeof window !== 'undefined') {
      // Expose debugging tools to window for development
      (window as any).__bitcodeMockProvider = {
        getMetrics: getPerformanceMetrics,
        validateSystem,
        clearCache,
        setScenario,
        setEnabled,
        refreshData,
        getCacheStats
      };
    }
  }, [
    isDebugMode,
    getPerformanceMetrics,
    validateSystem,
    clearCache,
    setScenario,
    setEnabled,
    refreshData,
    getCacheStats
  ]);

  return (
    <MockContext.Provider value={contextValue}>
      {children}
      {isDebugMode && <MockDebugPanel />}
    </MockContext.Provider>
  );
};

// ============================================================================
// Hook for accessing mock data
// ============================================================================

/**
 * Primary hook for components to access mock data
 */
export const useMockData = <T,>(feature: MockableFeature): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} => {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockProvider');
  }

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!context.isEnabled) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const mockData = await context.getMockData<T>(feature);
      setData(mockData?.data || null);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [context, feature]);

  const refresh = useCallback(async () => {
    await context.refreshData(feature);
    await loadData();
  }, [context, feature, loadData]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData, context.currentScenario, context.isEnabled]);

  return { data, loading, error, refresh };
};

/**
 * Hook for accessing mock context
 */
export const useMockContext = (): MockContextValue => {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMockContext must be used within a MockProvider');
  }
  return context;
};

/**
 * Hook for conditional mock data loading
 */
export const useMockDataConditional = <T,>(
  feature: MockableFeature,
  condition: boolean
): T | null => {
  const { data } = useMockData<T>(feature);
  return condition ? data : null;
};

/**
 * Hook for multiple mock data features
 */
export const useMockDataMultiple = (features: MockableFeature[]): Record<string, any> => {
  const context = useMockContext();
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context.isEnabled) {
      setData({});
      setLoading(false);
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      const results: Record<string, any> = {};

      await Promise.all(
        features.map(async (feature) => {
          try {
            const mockData = await context.getMockData(feature);
            results[feature] = mockData?.data || null;
          } catch (error) {
            console.error(`Error loading mock data for ${feature}:`, error);
            results[feature] = null;
          }
        })
      );

      setData(results);
      setLoading(false);
    };

    loadAllData();
  }, [context, features, context.currentScenario]);

  return loading ? {} : data;
};

// ============================================================================
// Debug Panel Component
// ============================================================================

const MockDebugPanel: React.FC = () => {
  const context = useMockContext();
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<MockPerformanceMetrics | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(context.getPerformanceMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, [context]);

  if (!context.debugMode) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#1f2937',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔧 Mock Debug
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '0',
          backgroundColor: '#1f2937',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          minWidth: '300px',
          maxHeight: '400px',
          overflow: 'auto',
          border: '1px solid #374151'
        }}>
          <div><strong>Mock Provider Debug</strong></div>
          <div>Status: {context.isEnabled ? '🟢 Enabled' : '🔴 Disabled'}</div>
          <div>Scenario: {context.currentScenario}</div>
          
          {metrics && (
            <>
              <div style={{ marginTop: '12px' }}><strong>Performance</strong></div>
              <div>Cache Hit Ratio: {(metrics.mocking.cacheHitRatio * 100).toFixed(1)}%</div>
              <div>Total Calls: {metrics.mocking.totalMockCalls}</div>
              <div>Memory Usage: {metrics.system.memoryUsageMB.toFixed(1)} MB</div>
            </>
          )}

          <div style={{ marginTop: '12px' }}>
            <button
              onClick={() => context.clearCache()}
              style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Clear Cache
            </button>
            
            <button
              onClick={() => context.refreshData()}
              style={{
                backgroundColor: '#059669',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh All
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <select
              value={context.currentScenario}
              onChange={(e) => context.setScenario(e.target.value as MockScenarioType)}
              style={{
                backgroundColor: '#374151',
                color: '#fff',
                border: '1px solid #4b5563',
                padding: '4px',
                borderRadius: '4px',
                width: '100%'
              }}
            >
              <option value="demo">Demo</option>
              <option value="testing">Testing</option>
              <option value="onboarding">Onboarding</option>
              <option value="enterprise">Enterprise</option>
              <option value="empty">Empty</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Component that only renders when mocking is enabled
 */
export const MockOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const context = useMockContext();
  return context.isEnabled ? <>{children}</> : null;
};

/**
 * Component that only renders when mocking is disabled
 */
export const RealOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const context = useMockContext();
  return !context.isEnabled ? <>{children}</> : null;
};

/**
 * Higher-order component for automatic mock data injection
 */
export function withMockData<P extends object, T>(
  Component: React.ComponentType<P & { mockData: T }>,
  feature: MockableFeature
) {
  return function WithMockDataComponent(props: P) {
    const { data: mockData } = useMockData<T>(feature);
    return <Component {...props} mockData={mockData} />;
  };
}

// Export everything for easy importing
export type { MockContextValue, CacheStats };
export default MockProvider;
