import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { ErrorRecoveryGrace } from '@/components/bitcode/overlays/ErrorRecoveryGrace/ErrorRecoveryGrace';

const meta: Meta<typeof ErrorRecoveryGrace> = {
  title: 'Bitcode/Surprise & Delight/Error Recovery Grace',
  component: ErrorRecoveryGrace,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### ◇ Error Recovery Grace - Diagnostic Intelligence & Learning Moments

Transforms errors from frustrating roadblocks into graceful learning opportunities with guidance and learning:

- **Intelligent error analysis** - Contextual understanding of error types, patterns, and user skill level
- **Learning moment synthesis** - Converts each error into educational insights with prevention tips
- **Recovery guidance system** - Step-by-step solutions with confidence ratings and time estimates
- **Pattern recognition** - Tracks recurring errors to provide personalized coaching
- **Graceful UX design** - Makes errors feel like part of the supportive journey rather than failures
- **Expert guidance integration** - Provides encouraging, advanced insights to maintain positive mindset
- **Progressive disclosure** - Expandable sections to avoid overwhelming users
- **Alternative solutions** - Multiple recovery paths based on complexity and user preferences

The system embodies **graceful error recovery** - transforming moments of frustration into opportunities for growth, learning, and mastery development.
        `,
      },
    },
  },
  argTypes: {
    graceStyle: {
      control: { type: 'select' },
      options: ['gentle', 'encouraging', 'instructional', 'intensive'],
      description: 'Visual and emotional style of grace presentation',
    },
    graceIntensity: {
      control: { type: 'select' },
      options: ['subtle', 'standard', 'deep', 'intensive'],
      description: 'Intensity of graceful visual effects',
    },
    showLearningMoments: {
      control: 'boolean',
      description: 'Show learning insights and educational content',
    },
    showRecoveryGuidance: {
      control: 'boolean',
      description: 'Show step-by-step recovery solutions',
    },
    showPatternInsights: {
      control: 'boolean',
      description: 'Show error pattern recognition insights',
    },
    showExpertGuidance: {
      control: 'boolean',
      description: 'Show encouraging expert guidance quotes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Syntax Error - Beginner Level
export const SyntaxErrorBeginner: Story = {
  args: {
    error: {
      id: 'syntax-001',
      type: 'syntax',
      message: 'Unexpected token \'}\'. Expected \')\' before closing brace.',
      location: {
        file: 'src/components/UserProfile.tsx',
        line: 23,
        column: 15
      },
      timestamp: new Date(),
      severity: 'error',
      context: {
        userAction: 'Adding new function to component',
        affectedComponents: ['UserProfile'],
        relatedPatterns: ['function-syntax', 'parentheses-matching']
      }
    },
    errorPatterns: [
      {
        id: 'syntax-pattern',
        errorType: 'syntax',
        frequency: 5,
        lastSeen: new Date(Date.now() - 3600000),
        resolutionSuccess: 0.6,
        learningProgress: 0.3,
        mastery: 'learning'
      }
    ],
    recoveryMastery: {
      overallLevel: 0.2,
      strongAreas: [],
      improvementAreas: ['syntax', 'debugging'],
      recentProgress: 0.1
    },
    repositoryContext: {
      language: 'TypeScript',
      framework: 'React',
      complexity: 0.3,
      commonPatterns: ['components', 'hooks']
    },
    graceStyle: 'encouraging',
    showLearningMoments: true,
    showRecoveryGuidance: true,
    showPatternInsights: true,
    showExpertGuidance: true,
    graceIntensity: 'standard',
  },
  parameters: {
    docs: {
      description: {
        story: 'Beginner-friendly syntax error with encouraging guidance and learning moments',
      },
    },
  },
};

// Type Error - Intermediate Level
export const TypeErrorIntermediate: Story = {
  args: {
    error: {
      id: 'type-001',
      type: 'type',
      message: 'Type \'string | undefined\' is not assignable to type \'string\'. Type \'undefined\' is not assignable to type \'string\'.',
      location: {
        file: 'src/hooks/useUserData.ts',
        line: 42,
        column: 8
      },
      timestamp: new Date(),
      severity: 'error',
      context: {
        userAction: 'Implementing user data hook',
        affectedComponents: ['useUserData', 'UserProfile'],
        relatedPatterns: ['type-safety', 'null-checking', 'optional-chaining']
      }
    },
    errorPatterns: [
      {
        id: 'type-pattern',
        errorType: 'type',
        frequency: 8,
        lastSeen: new Date(Date.now() - 1800000),
        resolutionSuccess: 0.75,
        learningProgress: 0.6,
        mastery: 'comfortable'
      }
    ],
    recoveryMastery: {
      overallLevel: 0.5,
      strongAreas: ['components', 'hooks'],
      improvementAreas: ['type-safety', 'advanced-patterns'],
      recentProgress: 0.2
    },
    repositoryContext: {
      language: 'TypeScript',
      framework: 'React',
      complexity: 0.6,
      commonPatterns: ['hooks', 'type-safety', 'data-fetching']
    },
    graceStyle: 'instructional',
    showLearningMoments: true,
    showRecoveryGuidance: true,
    showPatternInsights: true,
    showExpertGuidance: true,
    graceIntensity: 'deep',
  },
  parameters: {
    docs: {
      description: {
        story: 'Intermediate TypeScript error with guidance-focused guidance and type safety education',
      },
    },
  },
};

// Runtime Error - Advanced Level
export const RuntimeErrorAdvanced: Story = {
  args: {
    error: {
      id: 'runtime-001',
      type: 'runtime',
      message: 'Cannot read properties of undefined (reading \'map\')',
      location: {
        file: 'src/components/DataVisualization.tsx',
        line: 156,
        column: 42
      },
      stackTrace: `
        at DataVisualization.tsx:156:42
        at Array.map (<anonymous>)
        at DataVisualization (DataVisualization.tsx:155:18)
        at renderWithHooks (react-dom.development.js:14985)
      `,
      timestamp: new Date(),
      severity: 'error',
      context: {
        userAction: 'Rendering data visualization with async data',
        affectedComponents: ['DataVisualization', 'Dashboard'],
        relatedPatterns: ['async-data', 'error-boundaries', 'defensive-programming'],
        environmentDetails: 'Production-like data with edge cases'
      }
    },
    errorPatterns: [
      {
        id: 'runtime-pattern',
        errorType: 'runtime',
        frequency: 12,
        lastSeen: new Date(Date.now() - 900000),
        resolutionSuccess: 0.85,
        learningProgress: 0.8,
        mastery: 'comfortable'
      }
    ],
    recoveryMastery: {
      overallLevel: 0.75,
      strongAreas: ['components', 'hooks', 'debugging', 'type-safety'],
      improvementAreas: ['error-boundaries', 'performance-optimization'],
      recentProgress: 0.15
    },
    repositoryContext: {
      language: 'TypeScript',
      framework: 'React/Next.js',
      complexity: 0.8,
      commonPatterns: ['async-data', 'error-handling', 'performance', 'data-visualization']
    },
    graceStyle: 'intensive',
    showLearningMoments: true,
    showRecoveryGuidance: true,
    showPatternInsights: true,
    showExpertGuidance: true,
    graceIntensity: 'intensive',
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced runtime error with intensive guidance and defensive programming insights',
      },
    },
  },
};

// Logic Error - Expert Level
export const LogicErrorExpert: Story = {
  args: {
    error: {
      id: 'logic-001',
      type: 'logic',
      message: 'Performance optimization causing incorrect data aggregation in complex filtering scenarios',
      location: {
        file: 'src/utils/dataProcessor.ts',
        line: 289,
        column: 15
      },
      timestamp: new Date(),
      severity: 'warning',
      context: {
        userAction: 'Optimizing data processing pipeline',
        affectedComponents: ['DataProcessor', 'Analytics', 'Reports'],
        relatedPatterns: ['performance-optimization', 'data-integrity', 'algorithm-correctness'],
        environmentDetails: 'Large dataset processing with complex business logic'
      }
    },
    errorPatterns: [
      {
        id: 'logic-pattern',
        errorType: 'logic',
        frequency: 3,
        lastSeen: new Date(Date.now() - 7200000),
        resolutionSuccess: 0.95,
        learningProgress: 0.9,
        mastery: 'mastered'
      }
    ],
    recoveryMastery: {
      overallLevel: 0.9,
      strongAreas: ['architecture', 'performance', 'debugging', 'algorithms', 'system-design'],
      improvementAreas: ['distributed-systems'],
      recentProgress: 0.05
    },
    repositoryContext: {
      language: 'TypeScript',
      framework: 'advanced-architecture',
      complexity: 0.95,
      commonPatterns: ['performance-optimization', 'data-processing', 'algorithm-design', 'testing']
    },
    graceStyle: 'intensive',
    showLearningMoments: true,
    showRecoveryGuidance: true,
    showPatternInsights: true,
    showExpertGuidance: true,
    graceIntensity: 'intensive',
  },
  parameters: {
    docs: {
      description: {
        story: 'Expert-level logic error with intensive guidance and algorithm optimization guidance',
      },
    },
  },
};

// Interactive Error Scenarios
export const InteractiveErrorScenarios: Story = {
  render: () => {
    const [selectedScenario, setSelectedScenario] = useState(0);
    const [graceStyle, setGraceStyle] = useState<'gentle' | 'encouraging' | 'instructional' | 'intensive'>('instructional');
    const [showError, setShowError] = useState(true);
    
    const errorScenarios = [
      {
        name: 'Missing Semicolon',
        level: 'Beginner',
        error: {
          id: 'syntax-semicolon',
          type: 'syntax' as const,
          message: 'Missing semicolon after variable declaration',
          location: { file: 'src/index.js', line: 15, column: 25 },
          timestamp: new Date(),
          severity: 'error' as const,
          context: {
            userAction: 'Adding new variable',
            affectedComponents: ['main'],
            relatedPatterns: ['syntax-basics']
          }
        },
        mastery: { overallLevel: 0.2, strongAreas: [], improvementAreas: ['syntax'], recentProgress: 0.1 }
      },
      {
        name: 'Null Reference',
        level: 'Intermediate',
        error: {
          id: 'runtime-null',
          type: 'runtime' as const,
          message: 'Cannot read property \'length\' of null',
          location: { file: 'src/utils/validator.ts', line: 89, column: 12 },
          timestamp: new Date(),
          severity: 'error' as const,
          context: {
            userAction: 'Validating user input',
            affectedComponents: ['validator', 'form'],
            relatedPatterns: ['null-checking', 'defensive-programming']
          }
        },
        mastery: { overallLevel: 0.5, strongAreas: ['basics'], improvementAreas: ['error-handling'], recentProgress: 0.2 }
      },
      {
        name: 'Type Mismatch',
        level: 'Intermediate',
        error: {
          id: 'type-mismatch',
          type: 'type' as const,
          message: 'Argument of type \'number\' is not assignable to parameter of type \'string\'',
          location: { file: 'src/components/Counter.tsx', line: 34, column: 18 },
          timestamp: new Date(),
          severity: 'error' as const,
          context: {
            userAction: 'Passing data between components',
            affectedComponents: ['Counter', 'Display'],
            relatedPatterns: ['type-safety', 'component-props']
          }
        },
        mastery: { overallLevel: 0.6, strongAreas: ['components'], improvementAreas: ['typescript'], recentProgress: 0.15 }
      },
      {
        name: 'Race Condition',
        level: 'Advanced',
        error: {
          id: 'logic-race',
          type: 'logic' as const,
          message: 'State update race condition causing inconsistent UI state',
          location: { file: 'src/hooks/useAsyncData.ts', line: 67, column: 8 },
          timestamp: new Date(),
          severity: 'warning' as const,
          context: {
            userAction: 'Managing async state updates',
            affectedComponents: ['useAsyncData', 'DataComponent'],
            relatedPatterns: ['async-patterns', 'state-management', 'race-conditions']
          }
        },
        mastery: { overallLevel: 0.8, strongAreas: ['hooks', 'async'], improvementAreas: ['concurrency'], recentProgress: 0.1 }
      }
    ];
    
    const currentScenario = errorScenarios[selectedScenario];
    
    const triggerNewError = () => {
      setShowError(false);
      setTimeout(() => {
        setShowError(true);
      }, 500);
    };
    
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
        {/* Control Panel */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-400/30 rounded-lg p-4 max-w-2xl">
          <h3 className="text-lg font-medium text-slate-100 mb-4 text-center">
            ◇ Error Recovery Grace Scenarios
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Error Scenario</div>
                {errorScenarios.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedScenario(index);
                      triggerNewError();
                    }}
                    className={`w-full px-3 py-2 rounded transition-all duration-200 text-left text-sm
                      ${selectedScenario === index 
                        ? 'bg-red-600/50 text-red-100 border border-red-400/50' 
                        : 'bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 border border-transparent'
                      }`}
                  >
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-xs opacity-75">{scenario.level} Level</div>
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Grace Style</div>
                {(['gentle', 'encouraging', 'instructional', 'intensive'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setGraceStyle(style)}
                    className={`w-full px-3 py-2 rounded transition-all duration-200 text-left text-sm
                      ${graceStyle === style 
                        ? 'bg-blue-600/50 text-blue-100 border border-blue-400/50' 
                        : 'bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 border border-transparent'
                      }`}
                  >
                    <div className="font-medium capitalize">{style}</div>
                    <div className="text-xs opacity-75">
                      {style === 'gentle' && 'Soft, non-intimidating approach'}
                      {style === 'encouraging' && 'Positive, motivating guidance'}
                      {style === 'instructional' && 'Educational, insightful coaching'}
                      {style === 'intensive' && 'Advanced, profound understanding'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-slate-700/30">
              <div className="text-sm text-slate-300">
                <div><strong>Current:</strong> {currentScenario.name}</div>
                <div><strong>Level:</strong> {currentScenario.level}</div>
                <div><strong>Mastery:</strong> {Math.round(currentScenario.mastery.overallLevel * 100)}%</div>
              </div>
              
              <button
                onClick={triggerNewError}
                className="px-4 py-2 bg-red-600/40 text-red-100 rounded text-sm
                         hover:bg-red-600/60 transition-all duration-200"
              >
                Trigger Error
              </button>
            </div>
          </div>
        </div>
        
        {/* Error Recovery Grace */}
        {showError && (
          <ErrorRecoveryGrace
            error={currentScenario.error}
            errorPatterns={[{
              id: 'current-pattern',
              errorType: currentScenario.error.type,
              frequency: Math.floor(Math.random() * 10) + 1,
              lastSeen: new Date(Date.now() - Math.random() * 86400000),
              resolutionSuccess: currentScenario.mastery.overallLevel,
              learningProgress: currentScenario.mastery.overallLevel,
              mastery: currentScenario.mastery.overallLevel > 0.7 ? 'mastered' :
                      currentScenario.mastery.overallLevel > 0.5 ? 'comfortable' :
                      currentScenario.mastery.overallLevel > 0.3 ? 'learning' : 'struggling'
            }]}
            recoveryMastery={currentScenario.mastery}
            repositoryContext={{
              language: 'TypeScript',
              framework: 'React',
              complexity: selectedScenario / (errorScenarios.length - 1),
              commonPatterns: currentScenario.error.context.relatedPatterns || []
            }}
            graceStyle={graceStyle}
            showLearningMoments={true}
            showRecoveryGuidance={true}
            showPatternInsights={true}
            showExpertGuidance={true}
            graceIntensity={
              graceStyle === 'intensive' ? 'intensive' :
              graceStyle === 'instructional' ? 'deep' :
              graceStyle === 'encouraging' ? 'standard' : 'subtle'
            }
            onErrorResolved={(resolution) => {
              console.log('Error resolved:', resolution);
            }}
            onLearningMoment={(moment) => {
              console.log('Learning moment:', moment);
            }}
            onPatternRecognized={(pattern) => {
              console.log('Pattern recognized:', pattern);
            }}
            onGuidanceAccepted={(guidance) => {
              console.log('Guidance gained:', guidance);
            }}
          />
        )}
        
        {/* Background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 opacity-10">
            <div className="text-9xl">◇</div>
            <div className="text-3xl text-slate-300 font-light">
              Graceful Recovery
            </div>
            <div className="text-xl text-slate-400 italic">
              {currentScenario.name} • {graceStyle} Style
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of different error scenarios and grace styles',
      },
    },
  },
};

// Grace Style Comparison
export const GraceStyleComparison: Story = {
  render: () => {
    const [selectedStyle, setSelectedStyle] = useState<'gentle' | 'encouraging' | 'instructional' | 'intensive'>('instructional');
    
    const sampleError = {
      id: 'comparison-error',
      type: 'type' as const,
      message: 'Property \'user\' does not exist on type \'undefined\'. Object is possibly \'undefined\'.',
      location: {
        file: 'src/components/Profile.tsx',
        line: 87,
        column: 24
      },
      timestamp: new Date(),
      severity: 'error' as const,
      context: {
        userAction: 'Accessing user profile data',
        affectedComponents: ['Profile', 'UserCard'],
        relatedPatterns: ['null-checking', 'optional-chaining', 'type-guards']
      }
    };
    
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="absolute top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-400/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-slate-100 mb-4">
            ✨ Grace Style Variations
          </h3>
          
          <div className="space-y-3">
            {(['gentle', 'encouraging', 'instructional', 'intensive'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-left
                  ${selectedStyle === style 
                    ? 'bg-purple-600/50 text-purple-100 border border-purple-400/50' 
                    : 'bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
              >
                <div className="font-medium capitalize">{style}</div>
                <div className="text-xs opacity-75 mt-1">
                  {style === 'gentle' && 'Soft, non-intimidating comfort'}
                  {style === 'encouraging' && 'Positive, motivating energy'}
                  {style === 'instructional' && 'Educational, insightful guidance'}
                  {style === 'intensive' && 'Advanced, profound understanding'}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700/30 text-xs text-slate-300">
            <div className="space-y-1">
              <div>Error Type: <span className="text-slate-100">Type Safety</span></div>
              <div>Severity: <span className="text-slate-100">Error</span></div>
              <div>Style: <span className="text-slate-100 capitalize">{selectedStyle}</span></div>
            </div>
          </div>
        </div>
        
        <ErrorRecoveryGrace
          error={sampleError}
          errorPatterns={[{
            id: 'type-safety-pattern',
            errorType: 'type',
            frequency: 6,
            lastSeen: new Date(Date.now() - 1800000),
            resolutionSuccess: 0.7,
            learningProgress: 0.5,
            mastery: 'learning'
          }]}
          recoveryMastery={{
            overallLevel: 0.6,
            strongAreas: ['components', 'hooks'],
            improvementAreas: ['type-safety', 'null-handling'],
            recentProgress: 0.2
          }}
          repositoryContext={{
            language: 'TypeScript',
            framework: 'React',
            complexity: 0.5,
            commonPatterns: ['type-safety', 'null-checking', 'optional-chaining']
          }}
          graceStyle={selectedStyle}
          showLearningMoments={true}
          showRecoveryGuidance={true}
          showPatternInsights={true}
          showExpertGuidance={true}
          graceIntensity={
            selectedStyle === 'intensive' ? 'intensive' :
            selectedStyle === 'instructional' ? 'deep' :
            selectedStyle === 'encouraging' ? 'standard' : 'subtle'
          }
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 opacity-10">
            <div className="text-9xl">💫</div>
            <div className="text-3xl text-slate-300 font-light">
              Grace Style Comparison
            </div>
            <div className="text-xl text-slate-400 italic capitalize">
              {selectedStyle} Approach
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Compare different grace styles from gentle to intensive guidance',
      },
    },
  },
};

// Learning Moment Focus
export const LearningMomentFocus: Story = {
  args: {
    error: {
      id: 'learning-focus',
      type: 'runtime',
      message: 'Cannot access property before null check in async data flow',
      location: {
        file: 'src/hooks/useProfile.ts',
        line: 45,
        column: 18
      },
      timestamp: new Date(),
      severity: 'error',
      context: {
        userAction: 'Implementing async user profile loading',
        affectedComponents: ['useProfile', 'ProfileCard', 'UserDashboard'],
        relatedPatterns: ['async-patterns', 'null-checking', 'error-boundaries', 'loading-states'],
        environmentDetails: 'Production async data flow with network delays'
      }
    },
    errorPatterns: [
      {
        id: 'async-null-pattern',
        errorType: 'runtime',
        frequency: 4,
        lastSeen: new Date(Date.now() - 7200000),
        resolutionSuccess: 0.5,
        learningProgress: 0.3,
        mastery: 'learning'
      }
    ],
    recoveryMastery: {
      overallLevel: 0.4,
      strongAreas: ['basic-components', 'styling'],
      improvementAreas: ['async-patterns', 'error-handling', 'defensive-programming'],
      recentProgress: 0.25
    },
    repositoryContext: {
      language: 'TypeScript',
      framework: 'React/Next.js',
      complexity: 0.6,
      commonPatterns: ['async-data', 'error-handling', 'user-management', 'loading-states']
    },
    graceStyle: 'instructional',
    showLearningMoments: true,
    showRecoveryGuidance: true,
    showPatternInsights: false,
    showExpertGuidance: true,
    graceIntensity: 'deep',
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus on learning moments with educational insights and guidance synthesis',
      },
    },
  },
};
