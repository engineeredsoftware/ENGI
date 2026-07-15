"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocCodeToolPrompt = void 0;
class DocCodeToolPrompt {
    constructor() {
        this.metadata = {};
        this.purpose = '';
        this.capabilities = '';
        this.parameters = '';
        this.output = '';
    }
    setMetadata(name, category, version, priority, stability) {
        this.metadata = { name, category, version, priority, stability };
    }
    setPurpose(value) {
        this.purpose = value;
    }
    setCapabilities(value) {
        this.capabilities = value;
    }
    setParameters(value) {
        this.parameters = value;
    }
    setOutput(value) {
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
exports.DocCodeToolPrompt = DocCodeToolPrompt;
