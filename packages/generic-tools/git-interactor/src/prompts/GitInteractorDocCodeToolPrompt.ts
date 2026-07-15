import { PROMPTPART_GENERIC_DOCCODE_METADATA_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_metadata_label';
import { PROMPTPART_GENERIC_DOCCODE_PURPOSE_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_purpose_label';
import { PROMPTPART_GENERIC_DOCCODE_CAPABILITIES_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_capabilities_label';
import { PROMPTPART_GENERIC_DOCCODE_PARAMETERS_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_parameters_label';
import { PROMPTPART_GENERIC_DOCCODE_OUTPUT_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_output_label';
import { PROMPTPART_GENERIC_DOCCODE_EXAMPLES_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_examples_label';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLNAME } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolname';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLPURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolpurpose';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLCAPABILITIES } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolcapabilities';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLPARAMETERS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolparameters';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLOUTPUT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetooloutput';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLEXAMPLE1 } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolexample1';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLEXAMPLE2 } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolexample2';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLEXAMPLE3 } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolexample3';
import { PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLMIGRATION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_gitinteractor_doccodetoolmigration';
/**
 * GIT INTERACTOR DOC-CODE-TOOL PROMPT
 * 
 * @doc-comment-developing-promptdevelopment
 * versions: []
 * domain: tool
 * intent: "Git operations tool for comprehensive version control interactions"
 * 
 * Bitcode Git operation toolkit for repository-bound AssetPack and product
 * workflows. Provider-generic behavior is routed through the VCS layer.
 */

import { DocCodeToolPrompt } from '@bitcode/tools-generics';
import { PromptPart } from '@bitcode/prompts/parts/PromptPart';

// Import generic labels from /raw_promptparts/generic/







// Import specific PromptParts from /raw_promptparts/specific/










export class GitInteractorDocCodeToolPrompt extends DocCodeToolPrompt {
  constructor() {
    super();
    
    // Set metadata directly
    this.set('metadata:name', PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLNAME);
    this.set('metadata:category', 'version-control' as PromptPart);
    this.set('metadata:version', 'V26.00.0' as PromptPart);
    this.set('metadata:priority', 'medium' as PromptPart);
    this.set('metadata:stability', 'stable' as PromptPart);
    
    this.setPurpose(PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLPURPOSE);
    this.setCapabilities(PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLCAPABILITIES);
    this.setParameters(PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLPARAMETERS);
    this.setOutput(PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLOUTPUT);
    
    this.set('examples:1', PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLEXAMPLE1);
    this.set('examples:2', PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLEXAMPLE2);
    this.set('examples:3', PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLEXAMPLE3);

    // Provider boundary guide.
    this.set('migration', PROMPTPART_SPECIFIC_TOOL_GITINTERACTOR_DOCCODETOOLMIGRATION);
  }
}

// Export singleton instance
export const GIT_INTERACTOR_DOC_CODE_TOOL_PROMPT = new GitInteractorDocCodeToolPrompt();
