import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { ReadDefinitionInput } from '@/components/bitcode/inputs/ReadDefinitionInput/ReadDefinitionInput';

const meta: Meta<typeof ReadDefinitionInput> = {
  title: 'Bitcode/Surprise & Delight/Definition of Read Input',
  component: ReadDefinitionInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### 🧠 Enhanced Definition of Read Input

The core creative interface transformed into an intelligent, pattern-recognizing system:

- **Real-time pattern recognition** - AI analyzes and categorizes what you're building
- **Confidence visualization** - Border glow intensity reflects AI understanding
- **Intelligence enhancement** - Context-aware suggestions based on patterns and repository
- **Pattern celebration** - ✨ Golden celebration when AI achieves pattern mastery
- **Learning insights** - Shows how AI is learning from your patterns over time
- **Measurement estimation** - Real-time measured $BTD and time predictions based on complexity
- **Repository awareness** - Adapts suggestions to your tech stack and architecture

The intelligence layer builds as you type, providing increasingly sophisticated assistance.
        `,
      },
    },
  },
  argTypes: {
    showPatternInsights: {
      control: 'boolean',
      description: 'Show pattern recognition panel below input',
    },
    showEnhancementSuggestions: {
      control: 'boolean',
      description: 'Enable AI enhancement suggestions',
    },
    intensityLevel: {
      control: { type: 'select' },
      options: ['subtle', 'moderate', 'enhanced'],
      description: 'Visual enhancement intensity',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Intelligence
export const BasicIntelligence: Story = {
  args: {
    value: '',
    onChange: () => {},
    showPatternInsights: true,
    showEnhancementSuggestions: true,
    intensityLevel: 'moderate',
    placeholder: "Define what you want to create...",
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic input - start typing to see pattern recognition activate',
      },
    },
  },
};

// Component Pattern Recognition
export const ComponentPattern: Story = {
  args: {
    value: `Create a React component for user authentication that includes:
- Login form with email and password
- Social login buttons (Google, GitHub)
- Form validation with TypeScript
- Responsive design for mobile and desktop`,
    onChange: () => {},
    repositoryContext: {
      language: 'TypeScript',
      architecture: 'React/Next.js',
      testCoverage: 94,
      componentCount: 247,
    },
    showPatternInsights: true,
    showEnhancementSuggestions: true,
    intensityLevel: 'enhanced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component pattern detected with high confidence - shows TypeScript and React awareness',
      },
    },
  },
};

// Service Pattern Recognition
export const ServicePattern: Story = {
  args: {
    value: `Build a user authentication service that handles:
- JWT token generation and validation
- Password hashing with bcrypt
- Database integration for user storage
- Rate limiting for login attempts
- Email verification workflow`,
    onChange: () => {},
    repositoryContext: {
      language: 'TypeScript',
      architecture: 'microservices',
      testCoverage: 87,
    },
    attachments: [
      { type: 'github_issue', metadata: { title: 'Authentication Service Requirements' } },
      { type: 'file', metadata: { name: 'user.model.ts' } }
    ],
    showPatternInsights: true,
    showEnhancementSuggestions: true,
    intensityLevel: 'enhanced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Service pattern with microservices architecture awareness and attachment context',
      },
    },
  },
};

// Pattern Mastery Celebration
export const PatternMastery: Story = {
  args: {
    value: `Refactor the payment processing component to use modern React patterns:
- Convert class component to functional component with hooks
- Implement proper TypeScript interfaces for props
- Add comprehensive unit tests with Jest and React Testing Library
- Ensure accessibility compliance (WCAG 2.1 AA)
- Optimize performance with React.memo and useMemo`,
    onChange: () => {},
    repositoryContext: {
      language: 'TypeScript',
      architecture: 'React/Next.js',
      testCoverage: 96,
      componentCount: 450,
      codeStyle: 'functional-components'
    },
    showPatternInsights: true,
    showEnhancementSuggestions: true,
    intensityLevel: 'enhanced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple pattern mastery - refactor + component + test patterns with golden celebration',
      },
    },
  },
};

// Interactive Pattern Building
export const InteractivePatternBuilding: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [recognizedPatterns, setRecognizedPatterns] = useState<any[]>([]);
    const [confidence, setConfidence] = useState(0);
    const [measuredBtdEstimate, setEstimatedBtd] = useState(50);
    
    const sampleTexts = [
      '',
      'Create a user',
      'Create a user dashboard component',
      'Create a user dashboard component with React hooks and TypeScript',
      'Create a user dashboard component with React hooks and TypeScript that includes data visualization charts, real-time updates, and responsive design'
    ];
    
    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < sampleTexts.length) {
          setValue(sampleTexts[index]);
          index++;
        } else {
          index = 0;
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-400">
            Watch pattern recognition evolve as the Definition of Read becomes more detailed
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <span>Patterns: <span className="text-brand-emerald">{recognizedPatterns.length}</span></span>
            <span>Confidence: <span className="text-brand-emerald">{Math.round(confidence * 100)}%</span></span>
            <span>Measured estimate: <span className="text-brand-emerald">{measuredBtdEstimate} $BTD</span></span>
          </div>
        </div>
        
        <ReadDefinitionInput
          value={value}
          onChange={setValue}
          repositoryContext={{
            language: 'TypeScript',
            architecture: 'React/Next.js',
            testCoverage: 92,
            componentCount: 150,
          }}
          onPatternRecognized={setRecognizedPatterns}
          onConfidenceChange={setConfidence}
          onBtdEstimated={setEstimatedBtd}
          showPatternInsights={true}
          showEnhancementSuggestions={true}
          intensityLevel="enhanced"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing how pattern recognition builds as Definition of Read becomes more detailed',
      },
    },
  },
};

// Repository-Aware Intelligence
export const RepositoryAware: Story = {
  args: {
    value: `Implement caching layer for API responses using Redis`,
    onChange: () => {},
    repositoryContext: {
      language: 'Rust',
      architecture: 'hexagonal',
      testCoverage: 94,
    },
    showPatternInsights: true,
    showEnhancementSuggestions: true,
    intensityLevel: 'enhanced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository-aware intelligence adapting to Rust and hexagonal architecture',
      },
    },
  },
};

// Enhancement Demo
export const EnhancementDemo: Story = {
  render: () => {
    const [value, setValue] = useState('Create a login form');
    const [isEnhancing, setIsEnhancing] = useState(false);
    
    const handleEnhance = async () => {
      setIsEnhancing(true);
      
      // Simulate enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setValue(`Create a login form component with the following features:

Requirements:
- TypeScript props interface with proper typing
- Email and password input fields with validation
- Remember me checkbox functionality
- Forgot password link integration
- Loading states during authentication
- Error handling and display
- Responsive design for mobile and desktop
- Accessibility compliance (WCAG 2.1 AA)

Technical Specifications:
- Use React hooks for state management
- Implement form validation with react-hook-form
- Follow hexagonal architecture with clear ports and adapters
- Include comprehensive test suite with edge cases
- Support dark/light theme variants
- Integrate with existing authentication service`);
      
      setIsEnhancing(false);
    };
    
    return (
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-4">
            Click the enhance button to see AI-powered Definition of Read improvement
          </div>
          <button
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="px-4 py-2 bg-ai-thinking/20 text-ai-thinking rounded-lg 
                     hover:bg-ai-thinking/30 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnhancing ? 'Enhancing...' : 'Trigger Enhancement'}
          </button>
        </div>
        
        <ReadDefinitionInput
          value={value}
          onChange={setValue}
          onEnhance={handleEnhance}
          repositoryContext={{
            language: 'TypeScript',
            architecture: 'hexagonal',
            testCoverage: 89,
          }}
          showPatternInsights={true}
          showEnhancementSuggestions={true}
          intensityLevel="enhanced"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'AI enhancement demo - transforms simple Definition of Read into comprehensive specification',
      },
    },
  },
};

// Performance Comparison
export const PerformanceComparison: Story = {
  render: () => {
    const [value] = useState(`Create a React component for displaying user profiles with:
- Avatar image with fallback
- Name and bio display
- Social media links
- Edit profile functionality
- Responsive grid layout`);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 text-center">Subtle</h3>
          <ReadDefinitionInput
            value={value}
            onChange={() => {}}
            repositoryContext={{
              language: 'TypeScript',
              architecture: 'React/Next.js',
              testCoverage: 88,
            }}
            showPatternInsights={true}
            intensityLevel="subtle"
          />
          <p className="text-xs text-gray-500 text-center">Minimal effects, maximum performance</p>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 text-center">Moderate</h3>
          <ReadDefinitionInput
            value={value}
            onChange={() => {}}
            repositoryContext={{
              language: 'TypeScript',
              architecture: 'React/Next.js',
              testCoverage: 88,
            }}
            showPatternInsights={true}
            intensityLevel="moderate"
          />
          <p className="text-xs text-gray-500 text-center">Balanced intelligence and performance</p>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 text-center">Enhanced</h3>
          <ReadDefinitionInput
            value={value}
            onChange={() => {}}
            repositoryContext={{
              language: 'TypeScript',
              architecture: 'React/Next.js',
              testCoverage: 88,
            }}
            showPatternInsights={true}
            intensityLevel="enhanced"
          />
          <p className="text-xs text-gray-500 text-center">Full intelligence with celebrations</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance optimization comparison across different intensity levels',
      },
    },
  },
};

// Learning Insights Demo
export const LearningInsights: Story = {
  args: {
    value: `Build a notification system component that supports:
- Toast notifications with auto-dismiss
- Different notification types (success, error, warning, info)
- Queue management for multiple notifications
- Custom positioning and animation options`,
    onChange: () => {},
    repositoryContext: {
      language: 'TypeScript',
      architecture: 'React/Next.js',
      testCoverage: 91,
      componentCount: 320,
    },
    showPatternInsights: true,
    showEnhancementSuggestions: true,
    intensityLevel: 'enhanced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Learning insights showing how AI recognizes user patterns and provides contextual guidance',
      },
    },
  },
};
// Canonical story: renamed from EnhancedReadDefinitionInput
