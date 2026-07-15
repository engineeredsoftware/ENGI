type PromptPart = string;

export class DocCodeToolPrompt {
  private metadata: Record<string, PromptPart> = {};
  private purpose = '';
  private capabilities = '';
  private parameters = '';
  private output = '';

  setMetadata(
    name: PromptPart,
    category: PromptPart,
    version: PromptPart,
    priority: PromptPart,
    stability: PromptPart
  ) {
    this.metadata = { name, category, version, priority, stability };
  }

  setPurpose(value: PromptPart) {
    this.purpose = value;
  }

  setCapabilities(value: PromptPart) {
    this.capabilities = value;
  }

  setParameters(value: PromptPart) {
    this.parameters = value;
  }

  setOutput(value: PromptPart) {
    this.output = value;
  }

  format() {
    return [
      `Tool: ${this.metadata.name ?? ''}`,
      `Category: ${this.metadata.category ?? ''}`,
      `Purpose: ${this.purpose}`,
      `Capabilities: ${this.capabilities}`,
      `Parameters: ${this.parameters}`,
      `Output: ${this.output}`,
    ].join('\n');
  }
}
