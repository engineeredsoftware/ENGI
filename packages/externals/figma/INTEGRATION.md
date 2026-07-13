# Figma Integration for Bitcode

This package provides Figma design extraction and analysis integration for Bitcode AssetPack evidence and Read-satisfaction work.

## 🏗️ Architecture Overview

The Figma integration consists of three layers:

### 1. Core Package (`@bitcode/figma`)
- **Location**: `packages/figma/`
- **Purpose**: Low-level Figma API client with authentication, rate limiting, and image extraction
- **Key Functions**:
  - `figmaListRecentFiles()` - Browse user's recent Figma files
  - `figmaListArtboards()` - Discover frames in a file
  - `figmaGetArtboardPNG()` - Extract high-resolution PNG images
  - `figmaFindArtboardByName()` - Search for specific artboards
  - `figmaGetFile()` - Get complete file structure

### 2. MCP Tools (`@bitcode/figma-tools`)
- **Location**: `packages/generic-tools/mcps-tools/figma/`
- **Purpose**: Tool wrappers that expose Figma functions to AI agents
- **Pattern**: Follows same structure as AWS MCP tools (`tool()` + type exports)

### 3. Generic Agent (`@bitcode/figma-processor-agent`)
- **Location**: `packages/generic-agents/figma-processor/`
- **Purpose**: PTRR-based agent that orchestrates Figma extraction workflow
- **Uses**: Modern `promptFn` + `tools` pattern with automatic tool execution

## 🔄 Pipeline Integration

### Setup Phase Integration
**File**: `packages/pipelines/asset-pack/src/phases/setup.ts`

```typescript
const agentGroups = [
  { agent: 'setup:asset-pack-clone-vcs-repository-agent' },
  { agent: 'setup:asset-pack-setup-plan-agent' },
  { agent: 'setup:asset-pack-comprehend-read-agent' },
  { agent: 'setup:asset-pack-initialize-mcps-tools-agent' },
];
```

**Agent**: `figmaProcessor`
- **When**: Runs in setup phase, after attachment familiarization, before repository prep
- **Input**: Detects Figma URLs in Read attachments
- **Output**: Extracts PNG images and adds them as new attachments to global context

### Discovery Phase Enhancement
**File**: `packages/pipelines/asset-pack/src/agents/discovery-agents.ts`

**Enhanced**: Existing multimodal comprehension agent now detects Figma-extracted images
- **Detection**: Identifies attachments with `metadata.extractedFromFigma = true`
- **Processing**: Routes to existing image processing agent with enhanced context
- **Analysis**: OCR + computer vision with Figma-specific insights

## 🎯 User Flow

1. **User attaches Figma URL** to task (e.g., `https://figma.com/file/ABC123/Design?node-id=12%3A34`)

2. **Setup Phase - Figma Extraction**:
   - Detects Figma URL in attachments
   - Authenticates with `FIGMA_ACCESS_TOKEN`
   - Extracts PNG at 2x scale for specified artboard
   - Adds PNG as new attachment with metadata:
     ```typescript
     {
       id: 'figma-extracted-12-34',
       type: 'image/png',
       name: 'Dashboard Design - Artboard.png',
       content: '<base64-png-data>',
       metadata: {
         extractedFromFigma: true,
         originalUrl: 'https://figma.com/file/...',
         fileKey: 'ABC123',
         nodeId: '12:34',
         artboardName: 'Dashboard - Desktop View'
       }
     }
     ```

3. **Discovery Phase - Multimodal Analysis**:
   - Comprehension agent detects PNG with Figma metadata
   - Routes to image processing agent (OCR + computer vision)
   - Enhanced analysis includes:
     - UI component identification
     - Design pattern recognition  
     - Implementation specifications
     - Original Figma context preservation

4. **Result**: AI agents have both:
   - **Visual reference**: High-quality PNG for pixel-perfect implementation
   - **Design context**: Figma metadata linking back to source design system

## 🔐 Authentication Setup

Set environment variable:
```bash
export FIGMA_ACCESS_TOKEN="your-personal-access-token"
```

Or configure via Bitcode's OAuth integration (future enhancement).

## 🧪 Testing

Run integration test:
```bash
cd packages/pipelines/asset-pack
node src/test-figma-integration.ts
```

This verifies the complete flow from Figma URL detection through multimodal analysis.

## 📊 Key Benefits

1. **Seamless Design Integration**: Figma URLs become first-class design references
2. **No Manual Work**: Automatic PNG extraction at optimal resolution
3. **Rich Context**: Preserves design metadata for implementation guidance
4. **Multimodal Analysis**: Existing OCR/vision processing enhanced with Figma context
5. **Clean Architecture**: Three-layer design enables reuse and testing

## 🔮 Future Enhancements

- **OAuth Integration**: Replace personal access tokens with user-scoped OAuth
- **Multi-Artboard Support**: Extract all artboards when no node-id specified  
- **Version History**: Track design changes and link to specific Figma versions
- **Component Extraction**: Identify and extract Figma components separately
- **Real-time Sync**: Webhook integration for design update notifications

---

**Status**: ✅ **Integrated and Ready**  
**Pipeline Phase**: Setup → Discovery  
**Dependencies**: `FIGMA_ACCESS_TOKEN` environment variable
