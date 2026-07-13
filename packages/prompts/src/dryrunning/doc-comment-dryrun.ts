/**
 * DOC-PROMPTDRYRUN PLUGIN - LLM Response Mocking
 * 
 * This plugin enables dry-run mode for prompts by declaring hardcoded
 * responses that can be used instead of actual LLM calls during testing.
 * Multiple scenarios can be defined per prompt.
 * 
 * @doc-comment-plugin
 * name: doc-promptdryrun
 * pattern: @doc-comment-promptdryrun
 */

import { 
  DocCommentPlugin, 
  DocComment, 
  DocCommentMetadata,
  ParseLocation 
} from '@bitcode/doc-comment-generics';

export interface PromptDryRunScenario {
  scenario: string;
  context?: Record<string, any>;
  response: any;
  metadata?: {
    tokens?: number;
    latency?: number;
    model?: string;
  };
}

export interface PromptDryRunMetadata extends DocCommentMetadata {
  type: 'promptdryrun';
  scenarios: PromptDryRunScenario[];
}

export class DocPromptDryRunPlugin implements DocCommentPlugin {
  name = 'doc-promptdryrun';
  pattern = /@doc-comment-promptdryrun/;

  matches(comment: string): boolean {
    return this.pattern.test(comment);
  }

  parse(comment: DocComment, context: ParseLocation): DocCommentMetadata | null {
    if (!this.matches(comment.raw)) {
      return null;
    }

    const scenarios = this.extractScenarios(comment.raw);
    
    if (scenarios.length === 0) {
      return null;
    }

    const metadata: PromptDryRunMetadata = {
      type: 'promptdryrun',
      scenarios,
      version: '1.0.0'
    };

    return metadata;
  }

  transform(metadata: DocCommentMetadata, context: ParseLocation): string {
    const dryRunMeta = metadata as PromptDryRunMetadata;
    
    const parts = [`// DRY RUN SCENARIOS: ${dryRunMeta.scenarios.length}`];
    
    dryRunMeta.scenarios.forEach((scenario, i) => {
      parts.push(`// Scenario ${i + 1}: ${scenario.scenario}`);
      if (scenario.metadata?.model) {
        parts.push(`// Model: ${scenario.metadata.model}`);
      }
    });
    
    return parts.join('\n');
  }

  async generate?(metadata: DocCommentMetadata): Promise<unknown> {
    const dryRunMeta = metadata as PromptDryRunMetadata;
    
    // Generate dry run handler that can intercept LLM calls
    return {
      isDryRunEnabled: true,
      scenarios: dryRunMeta.scenarios,
      
      // Handler function that can be used at runtime
      handleDryRun: (scenario: string, context?: Record<string, any>) => {
        const match = dryRunMeta.scenarios.find(s => 
          s.scenario === scenario && 
          this.contextMatches(s.context, context)
        );
        
        if (match) {
          return {
            response: match.response,
            metadata: match.metadata || {},
            isDryRun: true
          };
        }
        
        // Default scenario
        const defaultScenario = dryRunMeta.scenarios.find(s => 
          s.scenario === 'default'
        );
        
        if (defaultScenario) {
          return {
            response: defaultScenario.response,
            metadata: defaultScenario.metadata || {},
            isDryRun: true
          };
        }
        
        throw new Error(`No dry run scenario found for: ${scenario}`);
      }
    };
  }

  private extractScenarios(comment: string): PromptDryRunScenario[] {
    const scenarios: PromptDryRunScenario[] = [];
    
    // Match all @doc-comment-promptdryrun blocks
    const pattern = /@doc-comment-promptdryrun\s*\n([\s\S]*?)(?=@doc-comment-promptdryrun|@doc-|$)/g;
    let match;
    
    while ((match = pattern.exec(comment)) !== null) {
      const block = match[1];
      
      // Extract scenario name
      const scenarioMatch = block.match(/scenario:\s*"([^"]+)"/);
      if (!scenarioMatch) continue;
      
      const scenario: PromptDryRunScenario = {
        scenario: scenarioMatch[1],
        response: {}
      };
      
      // Extract context (optional)
      const contextMatch = block.match(/context:\s*({[\s\S]*?})\s*(?:response:|metadata:|$)/);
      if (contextMatch) {
        try {
          scenario.context = JSON.parse(contextMatch[1]);
        } catch (e) {
          // Invalid JSON, skip context
        }
      }
      
      // Extract response
      const responseMatch = block.match(/response:\s*({[\s\S]*?})\s*(?:metadata:|$)/);
      if (responseMatch) {
        try {
          scenario.response = JSON.parse(responseMatch[1]);
        } catch (e) {
          // Try as string
          const stringResponseMatch = block.match(/response:\s*"([^"]+)"/);
          if (stringResponseMatch) {
            scenario.response = stringResponseMatch[1];
          }
        }
      }
      
      // Extract metadata (optional)
      const metadataMatch = block.match(/metadata:\s*({[\s\S]*?})/);
      if (metadataMatch) {
        try {
          scenario.metadata = JSON.parse(metadataMatch[1]);
        } catch (e) {
          // Invalid JSON, skip metadata
        }
      }
      
      scenarios.push(scenario);
    }
    
    return scenarios;
  }
  
  private contextMatches(
    scenarioContext?: Record<string, any>, 
    runtimeContext?: Record<string, any>
  ): boolean {
    if (!scenarioContext) return true;
    if (!runtimeContext) return false;
    
    // Check if all scenario context keys match runtime context
    return Object.entries(scenarioContext).every(([key, value]) => 
      runtimeContext[key] === value
    );
  }
}

export const docPromptDryRunPlugin = new DocPromptDryRunPlugin();

// Export types for use in other modules
export type { PromptDryRunScenario, PromptDryRunMetadata };

// Auto-register when imported
import { registerPlugin } from '@bitcode/doc-comment-generics';
registerPlugin(docPromptDryRunPlugin);