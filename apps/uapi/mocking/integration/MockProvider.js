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
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealOnly = exports.MockOnly = exports.useMockDataMultiple = exports.useMockDataConditional = exports.useMockContext = exports.useMockData = exports.MockProvider = void 0;
exports.withMockData = withMockData;
const react_1 = __importStar(require("react"));
const MockOrchestrator_1 = require("../core/MockOrchestrator");
// ============================================================================
// Context Creation
// ============================================================================
const MockContext = (0, react_1.createContext)(null);
/**
 * High-performance Mock Provider with intelligent caching and state management
 */
const MockProvider = ({ children, initialScenario = 'demo', enabled = true, debugMode = false, performanceMonitoring = true }) => {
    // Core state management
    const [isEnabled, setIsEnabled] = (0, react_1.useState)(enabled);
    const [currentScenario, setCurrentScenario] = (0, react_1.useState)(initialScenario);
    const [isDebugMode, setDebugMode] = (0, react_1.useState)(debugMode);
    // Performance tracking
    const [performanceMetrics, setPerformanceMetrics] = (0, react_1.useState)(null);
    const [cacheStats, setCacheStats] = (0, react_1.useState)({
        hitRatio: 0,
        itemCount: 0,
        totalSizeKB: 0,
        oldestEntryAge: 0
    });
    // Orchestrator instance
    const orchestrator = (0, react_1.useMemo)(() => MockOrchestrator_1.MockOrchestrator.getInstance(), []);
    // ============================================================================
    // Core Mock Data Functions
    // ============================================================================
    const getMockData = (0, react_1.useCallback)(async (feature) => {
        if (!isEnabled)
            return null;
        try {
            const startTime = performance.now();
            const data = await orchestrator.getMockData(feature, currentScenario);
            const endTime = performance.now();
            if (isDebugMode) {
                console.log(`MockProvider: Retrieved ${feature} data in ${(endTime - startTime).toFixed(2)}ms`);
            }
            return data;
        }
        catch (error) {
            console.error(`MockProvider: Error getting mock data for ${feature}:`, error);
            return null;
        }
    }, [isEnabled, currentScenario, orchestrator, isDebugMode]);
    const refreshData = (0, react_1.useCallback)(async (feature) => {
        if (!isEnabled)
            return;
        try {
            if (feature) {
                // Refresh specific feature
                await orchestrator.getMockData(feature, currentScenario);
            }
            else {
                // Clear cache to force refresh of all data
                orchestrator.reset();
            }
            if (isDebugMode) {
                console.log(`MockProvider: Refreshed ${feature || 'all'} data`);
            }
        }
        catch (error) {
            console.error('MockProvider: Error refreshing data:', error);
        }
    }, [isEnabled, currentScenario, orchestrator, isDebugMode]);
    // ============================================================================
    // Scenario Management
    // ============================================================================
    const setScenario = (0, react_1.useCallback)((scenario) => {
        if (scenario === currentScenario)
            return;
        setCurrentScenario(scenario);
        // Clear cache when scenario changes to ensure fresh data
        orchestrator.reset();
        if (isDebugMode) {
            console.log(`MockProvider: Switched to scenario '${scenario}'`);
        }
    }, [currentScenario, orchestrator, isDebugMode]);
    const setEnabled = (0, react_1.useCallback)((enabled) => {
        setIsEnabled(enabled);
        if (isDebugMode) {
            console.log(`MockProvider: ${enabled ? 'Enabled' : 'Disabled'} mocking`);
        }
    }, [isDebugMode]);
    // ============================================================================
    // Performance and Debugging
    // ============================================================================
    const getPerformanceMetrics = (0, react_1.useCallback)(() => {
        return orchestrator.getPerformanceMetrics();
    }, [orchestrator]);
    const validateSystem = (0, react_1.useCallback)(async () => {
        return await orchestrator.validateSystem();
    }, [orchestrator]);
    const clearCache = (0, react_1.useCallback)(() => {
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
    const getCacheStats = (0, react_1.useCallback)(() => {
        return cacheStats;
    }, [cacheStats]);
    // ============================================================================
    // Performance Monitoring
    // ============================================================================
    (0, react_1.useEffect)(() => {
        if (!performanceMonitoring)
            return;
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
    const contextValue = (0, react_1.useMemo)(() => ({
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
    (0, react_1.useEffect)(() => {
        if (isDebugMode && typeof window !== 'undefined') {
            // Expose debugging tools to window for development
            window.__bitcodeMockProvider = {
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
    return (<MockContext.Provider value={contextValue}>
      {children}
      {isDebugMode && <MockDebugPanel />}
    </MockContext.Provider>);
};
exports.MockProvider = MockProvider;
// ============================================================================
// Hook for accessing mock data
// ============================================================================
/**
 * Primary hook for components to access mock data
 */
const useMockData = (feature) => {
    const context = (0, react_1.useContext)(MockContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockProvider');
    }
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const loadData = (0, react_1.useCallback)(async () => {
        if (!context.isEnabled) {
            setData(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const mockData = await context.getMockData(feature);
            setData(mockData?.data || null);
        }
        catch (err) {
            setError(err.message);
            setData(null);
        }
        finally {
            setLoading(false);
        }
    }, [context, feature]);
    const refresh = (0, react_1.useCallback)(async () => {
        await context.refreshData(feature);
        await loadData();
    }, [context, feature, loadData]);
    // Load data on mount and when dependencies change
    (0, react_1.useEffect)(() => {
        loadData();
    }, [loadData, context.currentScenario, context.isEnabled]);
    return { data, loading, error, refresh };
};
exports.useMockData = useMockData;
/**
 * Hook for accessing mock context
 */
const useMockContext = () => {
    const context = (0, react_1.useContext)(MockContext);
    if (!context) {
        throw new Error('useMockContext must be used within a MockProvider');
    }
    return context;
};
exports.useMockContext = useMockContext;
/**
 * Hook for conditional mock data loading
 */
const useMockDataConditional = (feature, condition) => {
    const { data } = (0, exports.useMockData)(feature);
    return condition ? data : null;
};
exports.useMockDataConditional = useMockDataConditional;
/**
 * Hook for multiple mock data features
 */
const useMockDataMultiple = (features) => {
    const context = (0, exports.useMockContext)();
    const [data, setData] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!context.isEnabled) {
            setData({});
            setLoading(false);
            return;
        }
        const loadAllData = async () => {
            setLoading(true);
            const results = {};
            await Promise.all(features.map(async (feature) => {
                try {
                    const mockData = await context.getMockData(feature);
                    results[feature] = mockData?.data || null;
                }
                catch (error) {
                    console.error(`Error loading mock data for ${feature}:`, error);
                    results[feature] = null;
                }
            }));
            setData(results);
            setLoading(false);
        };
        loadAllData();
    }, [context, features, context.currentScenario]);
    return loading ? {} : data;
};
exports.useMockDataMultiple = useMockDataMultiple;
// ============================================================================
// Debug Panel Component
// ============================================================================
const MockDebugPanel = () => {
    const context = (0, exports.useMockContext)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            setMetrics(context.getPerformanceMetrics());
        }, 2000);
        return () => clearInterval(interval);
    }, [context]);
    if (!context.debugMode)
        return null;
    return (<div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 10000,
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
            backgroundColor: '#1f2937',
            color: '#fff',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
        }}>
        🔧 Mock Debug
      </button>

      {isOpen && (<div style={{
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
          
          {metrics && (<>
              <div style={{ marginTop: '12px' }}><strong>Performance</strong></div>
              <div>Cache Hit Ratio: {(metrics.mocking.cacheHitRatio * 100).toFixed(1)}%</div>
              <div>Total Calls: {metrics.mocking.totalMockCalls}</div>
              <div>Memory Usage: {metrics.system.memoryUsageMB.toFixed(1)} MB</div>
            </>)}

          <div style={{ marginTop: '12px' }}>
            <button onClick={() => context.clearCache()} style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '8px'
            }}>
              Clear Cache
            </button>
            
            <button onClick={() => context.refreshData()} style={{
                backgroundColor: '#059669',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
            }}>
              Refresh All
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <select value={context.currentScenario} onChange={(e) => context.setScenario(e.target.value)} style={{
                backgroundColor: '#374151',
                color: '#fff',
                border: '1px solid #4b5563',
                padding: '4px',
                borderRadius: '4px',
                width: '100%'
            }}>
              <option value="demo">Demo</option>
              <option value="testing">Testing</option>
              <option value="onboarding">Onboarding</option>
              <option value="enterprise">Enterprise</option>
              <option value="empty">Empty</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>)}
    </div>);
};
// ============================================================================
// Utility Components
// ============================================================================
/**
 * Component that only renders when mocking is enabled
 */
const MockOnly = ({ children }) => {
    const context = (0, exports.useMockContext)();
    return context.isEnabled ? <>{children}</> : null;
};
exports.MockOnly = MockOnly;
/**
 * Component that only renders when mocking is disabled
 */
const RealOnly = ({ children }) => {
    const context = (0, exports.useMockContext)();
    return !context.isEnabled ? <>{children}</> : null;
};
exports.RealOnly = RealOnly;
/**
 * Higher-order component for automatic mock data injection
 */
function withMockData(Component, feature) {
    return function WithMockDataComponent(props) {
        const { data: mockData } = (0, exports.useMockData)(feature);
        return <Component {...props} mockData={mockData}/>;
    };
}
exports.default = exports.MockProvider;
