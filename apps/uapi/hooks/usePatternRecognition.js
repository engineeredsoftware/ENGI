'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePatternRecognition = void 0;
const react_1 = require("react");
// Simulated AI pattern recognition (replace with real API in production)
const simulatePatternRecognition = async (readDefinition, context, attachments, history) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    const patterns = [];
    const readDefinitionLower = readDefinition.toLowerCase();
    // Component pattern detection
    if (readDefinitionLower.includes('component') || readDefinitionLower.includes('ui') || readDefinitionLower.includes('interface')) {
        const componentKeywords = ['react', 'vue', 'props', 'state', 'render', 'jsx', 'tsx'];
        const keywordCount = componentKeywords.filter(k => readDefinitionLower.includes(k)).length;
        patterns.push({
            type: 'component',
            confidence: Math.min(0.6 + (keywordCount * 0.1) + (context?.language === 'TypeScript' ? 0.2 : 0), 0.95),
            previousOccurrences: history?.filter(h => h.pattern.type === 'component').length || 0,
            averageSuccess: history?.filter(h => h.pattern.type === 'component' && h.success).length / Math.max(1, history?.filter(h => h.pattern.type === 'component').length || 1) || 0.8,
            estimatedComplexity: readDefinition.length > 300 ? 'complex' : readDefinition.length > 150 ? 'moderate' : 'simple',
            suggestedApproach: context?.architecture === 'hexagonal' ? 'Clean architecture with dependency injection' : 'Standard React component pattern',
            keywords: componentKeywords.filter(k => readDefinitionLower.includes(k)),
            architecturalFit: context?.architecture ? 0.9 : 0.7,
            testabilityScore: context?.testCoverage ? context.testCoverage / 100 : 0.8,
            riskLevel: readDefinition.length > 400 ? 'high' : readDefinition.length > 200 ? 'medium' : 'low'
        });
    }
    // Service pattern detection
    if (readDefinitionLower.includes('service') || readDefinitionLower.includes('api') || readDefinitionLower.includes('endpoint') || readDefinitionLower.includes('backend')) {
        const serviceKeywords = ['api', 'endpoint', 'service', 'repository', 'database', 'crud'];
        const keywordCount = serviceKeywords.filter(k => readDefinitionLower.includes(k)).length;
        patterns.push({
            type: 'service',
            confidence: Math.min(0.7 + (keywordCount * 0.08), 0.93),
            previousOccurrences: history?.filter(h => h.pattern.type === 'service').length || 0,
            averageSuccess: history?.filter(h => h.pattern.type === 'service' && h.success).length / Math.max(1, history?.filter(h => h.pattern.type === 'service').length || 1) || 0.85,
            estimatedComplexity: readDefinitionLower.includes('microservice') || readDefinitionLower.includes('distributed') ? 'complex' : 'moderate',
            suggestedApproach: 'Domain-driven design with clear boundaries',
            keywords: serviceKeywords.filter(k => readDefinitionLower.includes(k)),
            architecturalFit: context?.architecture === 'microservices' ? 0.95 : 0.8,
            testabilityScore: 0.9, // Services are typically easier to test
            riskLevel: readDefinitionLower.includes('database') || readDefinitionLower.includes('migration') ? 'high' : 'medium'
        });
    }
    // Test pattern detection
    if (readDefinitionLower.includes('test') || readDefinitionLower.includes('spec') || readDefinitionLower.includes('coverage')) {
        patterns.push({
            type: 'test',
            confidence: 0.9,
            previousOccurrences: history?.filter(h => h.pattern.type === 'test').length || 0,
            averageSuccess: 0.95, // Tests usually succeed
            estimatedComplexity: readDefinitionLower.includes('integration') || readDefinitionLower.includes('e2e') ? 'complex' : 'simple',
            keywords: ['test', 'spec', 'coverage', 'unit', 'integration'],
            architecturalFit: 0.95,
            testabilityScore: 1.0,
            riskLevel: 'low'
        });
    }
    // Refactor pattern detection
    if (readDefinitionLower.includes('refactor') || readDefinitionLower.includes('improve') || readDefinitionLower.includes('optimize') || readDefinitionLower.includes('clean')) {
        patterns.push({
            type: 'refactor',
            confidence: 0.8,
            previousOccurrences: history?.filter(h => h.pattern.type === 'refactor').length || 0,
            averageSuccess: 0.75, // Refactors can be tricky
            estimatedComplexity: readDefinitionLower.includes('architecture') || readDefinitionLower.includes('restructure') ? 'complex' : 'moderate',
            keywords: ['refactor', 'improve', 'optimize', 'clean', 'restructure'],
            architecturalFit: 0.8,
            testabilityScore: context?.testCoverage ? context.testCoverage / 100 : 0.6,
            riskLevel: readDefinitionLower.includes('breaking') ? 'high' : 'medium'
        });
    }
    // Documentation pattern detection
    if (readDefinitionLower.includes('document') || readDefinitionLower.includes('readme') || readDefinitionLower.includes('guide') || readDefinitionLower.includes('docs')) {
        patterns.push({
            type: 'documentation',
            confidence: 0.85,
            previousOccurrences: history?.filter(h => h.pattern.type === 'documentation').length || 0,
            averageSuccess: 0.9,
            estimatedComplexity: 'simple',
            keywords: ['document', 'readme', 'guide', 'docs', 'manual'],
            architecturalFit: 0.9,
            testabilityScore: 0.8,
            riskLevel: 'low'
        });
    }
    return patterns;
};
// Local storage keys for pattern learning
const PATTERN_HISTORY_KEY = 'bitcode_pattern_history';
const PATTERN_INSIGHTS_KEY = 'bitcode_pattern_insights';
const usePatternRecognition = (readDefinitionText, attachments = [], repositoryContext, options = {}) => {
    const { minLength = 50, debounceMs = 1000, enableLearning = true, mockMode = false } = options;
    const [patterns, setPatterns] = (0, react_1.useState)([]);
    const [isAnalyzing, setIsAnalyzing] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [patternHistory, setPatternHistory] = (0, react_1.useState)([]);
    const [learningInsights, setLearningInsights] = (0, react_1.useState)([]);
    const debounceRef = (0, react_1.useRef)();
    const lastAnalyzedRef = (0, react_1.useRef)('');
    // Load pattern history from localStorage
    (0, react_1.useEffect)(() => {
        if (!enableLearning)
            return;
        try {
            const stored = localStorage.getItem(PATTERN_HISTORY_KEY);
            if (stored) {
                const history = JSON.parse(stored);
                setPatternHistory(history.slice(-100)); // Keep last 100 patterns
            }
            const insights = localStorage.getItem(PATTERN_INSIGHTS_KEY);
            if (insights) {
                setLearningInsights(JSON.parse(insights));
            }
        }
        catch (err) {
            console.warn('Failed to load pattern history:', err);
        }
    }, [enableLearning]);
    // Save pattern history to localStorage
    const savePatternHistory = (0, react_1.useCallback)((newHistory) => {
        if (!enableLearning)
            return;
        try {
            localStorage.setItem(PATTERN_HISTORY_KEY, JSON.stringify(newHistory.slice(-100)));
        }
        catch (err) {
            console.warn('Failed to save pattern history:', err);
        }
    }, [enableLearning]);
    // Main pattern analysis function
    const analyzePatterns = (0, react_1.useCallback)(async (readDefinition) => {
        if (readDefinition === lastAnalyzedRef.current || readDefinition.length < minLength) {
            return;
        }
        lastAnalyzedRef.current = readDefinition;
        setIsAnalyzing(true);
        setError(null);
        try {
            let recognizedPatterns;
            if (mockMode) {
                recognizedPatterns = await simulatePatternRecognition(readDefinition, repositoryContext, attachments, patternHistory);
            }
            else {
                // Real API call would go here
                const response = await fetch('/api/patterns/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        readDefinition,
                        repositoryContext,
                        attachments: attachments.map(a => ({ type: a.type, metadata: a.metadata })),
                        patternHistory: patternHistory.slice(-20) // Send recent history for context
                    })
                });
                if (!response.ok) {
                    throw new Error(`Pattern analysis failed: ${response.status}`);
                }
                recognizedPatterns = await response.json();
            }
            setPatterns(recognizedPatterns);
            // Generate insights based on patterns and history
            if (enableLearning && recognizedPatterns.length > 0) {
                const insights = generateLearningInsights(recognizedPatterns, patternHistory, repositoryContext);
                setLearningInsights(insights);
                localStorage.setItem(PATTERN_INSIGHTS_KEY, JSON.stringify(insights));
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Pattern analysis failed';
            setError(errorMessage);
            console.error('Pattern recognition error:', err);
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [minLength, mockMode, repositoryContext, attachments, patternHistory, enableLearning]);
    // Debounced analysis trigger
    (0, react_1.useEffect)(() => {
        if (readDefinitionText.length < minLength) {
            setPatterns([]);
            return;
        }
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            analyzePatterns(readDefinitionText);
        }, debounceMs);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [readDefinitionText, minLength, debounceMs, analyzePatterns]);
    // Record pattern success
    const recordPatternSuccess = (0, react_1.useCallback)((pattern, metrics) => {
        const historyEntry = {
            pattern,
            timestamp: Date.now(),
            success: true,
            measuredBtd: metrics.measuredBtd,
            timeToComplete: metrics.timeToComplete
        };
        const newHistory = [...patternHistory, historyEntry];
        setPatternHistory(newHistory);
        savePatternHistory(newHistory);
    }, [patternHistory, savePatternHistory]);
    // Record pattern failure
    const recordPatternFailure = (0, react_1.useCallback)((pattern, reason) => {
        const historyEntry = {
            pattern: { ...pattern, suggestedApproach: reason },
            timestamp: Date.now(),
            success: false
        };
        const newHistory = [...patternHistory, historyEntry];
        setPatternHistory(newHistory);
        savePatternHistory(newHistory);
    }, [patternHistory, savePatternHistory]);
    // Clear current analysis
    const clearAnalysis = (0, react_1.useCallback)(() => {
        setPatterns([]);
        setError(null);
        lastAnalyzedRef.current = '';
    }, []);
    // Calculate overall confidence
    const confidence = (0, react_1.useMemo)(() => {
        if (patterns.length === 0)
            return 0;
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
        const historyBonus = patterns.reduce((bonus, p) => {
            const successRate = p.averageSuccess;
            return bonus + (successRate * 0.2); // Up to 20% bonus for successful patterns
        }, 0) / patterns.length;
        return Math.min(avgConfidence + historyBonus, 1.0);
    }, [patterns]);
    // Calculate suggested $BTD and duration
    const { suggestedBtd, suggestedDuration } = (0, react_1.useMemo)(() => {
        if (patterns.length === 0) {
            return { suggestedBtd: 50, suggestedDuration: 5 };
        }
        const baseMeasuredBtd = 40;
        const baseDuration = 3;
        const complexityMultiplier = patterns.reduce((avg, p) => {
            const mult = p.estimatedComplexity === 'simple' ? 0.8 : p.estimatedComplexity === 'complex' ? 1.4 : 1.0;
            return avg + mult;
        }, 0) / patterns.length;
        const confidenceMultiplier = 1.2 - (confidence * 0.4); // Higher confidence = lower cost
        const riskMultiplier = patterns.some(p => p.riskLevel === 'high') ? 1.3 : patterns.some(p => p.riskLevel === 'medium') ? 1.1 : 1.0;
        return {
            suggestedBtd: Math.round(baseMeasuredBtd * complexityMultiplier * confidenceMultiplier * riskMultiplier),
            suggestedDuration: Math.round(baseDuration * complexityMultiplier * riskMultiplier)
        };
    }, [patterns, confidence]);
    return {
        patterns,
        isAnalyzing,
        error,
        confidence,
        suggestedBtd,
        suggestedDuration,
        learningInsights,
        patternHistory,
        analyzePatterns,
        recordPatternSuccess,
        recordPatternFailure,
        clearAnalysis
    };
};
exports.usePatternRecognition = usePatternRecognition;
// Generate learning insights from patterns and history
const generateLearningInsights = (patterns, history, context) => {
    const insights = [];
    // Pattern frequency insights
    const patternCounts = patterns.reduce((counts, p) => {
        counts[p.type] = (counts[p.type] || 0) + 1;
        return counts;
    }, {});
    const mostCommon = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0];
    if (mostCommon && mostCommon[1] > 1) {
        insights.push(`You frequently work on ${mostCommon[0]} patterns - I'm getting better at recognizing them`);
    }
    // Success rate insights
    const successfulPatterns = history.filter(h => h.success);
    if (successfulPatterns.length > 5) {
        const avgMeasuredBtd = successfulPatterns.reduce((sum, h) => sum + (h.measuredBtd || 0), 0) / successfulPatterns.length;
        insights.push(`Your average successful shippable uses ${Math.round(avgMeasuredBtd)} $BTD`);
    }
    // Architecture insights
    if (context?.architecture && patterns.some(p => p.architecturalFit > 0.9)) {
        insights.push(`These patterns align well with your ${context.architecture} architecture`);
    }
    // Risk assessment insights
    const highRiskPatterns = patterns.filter(p => p.riskLevel === 'high');
    if (highRiskPatterns.length > 0) {
        insights.push(`Detected ${highRiskPatterns.length} high-risk pattern(s) - consider splitting the AssetPack synthesis into smaller shippables`);
    }
    return insights;
};
exports.default = exports.usePatternRecognition;
