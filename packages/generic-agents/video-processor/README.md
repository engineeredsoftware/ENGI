# Video Processor Agent

## Overview

Advanced video analysis agent that extracts comprehensive insights from video content through multi-modal processing. Combines audio transcription, visual scene analysis, and technical content recognition for implementation guidance extraction.

## Core Capabilities

- **Audio Transcription**: Speech-to-text using OpenAI Whisper with confidence scoring
- **Scene Detection**: Automated keyframe extraction with configurable intervals
- **Visual Content Analysis**: OCR and element detection using GPT-4 Vision
- **Technical Content Recognition**: Code snippet and UI element identification
- **Content Classification**: Categorizes videos as tutorials, demos, meetings, or presentations
- **Quality Assessment**: Multi-dimensional quality scoring with improvement recommendations

## Technical Implementation

### Architecture
- Built on BaseAgent with comprehensive PTRR methodology
- Integrates FFmpeg for video processing operations
- Uses OpenAI APIs for transcription and visual analysis
- Implements parallel frame processing for efficiency

### Processing Pipeline
1. **Plan**: Video attachment identification and processing strategy determination
2. **Try**: Multi-modal analysis execution (audio + visual processing)
3. **Refine**: Quality assessment and improvement identification
4. **Intensify**: Content synthesis and actionable insight generation

### Technical Stack
- **FFmpeg**: Video metadata extraction and frame processing
- **OpenAI Whisper**: Audio transcription with segment timing
- **GPT-4 Vision**: Frame analysis and content recognition
- **Sharp**: Image optimization for API processing

## Output Structure

### Video Analysis Schema
```typescript
{
 metadata: {
 duration: number,
 resolution: { width: number, height: number },
 quality: 'high' | 'medium' | 'low',
 hasAudio: boolean
 },
 transcription: {
 fullText: string,
 segments: Array<{
 start: number,
 end: number,
 text: string,
 confidence: number
 }>,
 language: string,
 confidence: number
 } | null,
 visualAnalysis: {
 sceneCount: number,
 detectedText: string[],
 technicalElements: string[],
 uiElements: string[],
 screenshotType: 'presentation' | 'demo' | 'code' | 'ui' | 'other'
 },
 analysis: {
 contentType: 'tutorial' | 'meeting' | 'demo' | 'presentation' | 'code-review' | 'other',
 technicalTerms: string[],
 topics: string[],
 sentiment: 'positive' | 'negative' | 'neutral'
 },
 relevanceScore: number,
 keyInsights: string[]
}
```

## Performance Characteristics

- **Processing Time**: 30-300 seconds depending on video length and quality
- **Memory Usage**: Temporary storage scales with video size (cleaned automatically)
- **API Dependencies**: Requires OpenAI API for transcription and vision analysis
- **Concurrent Processing**: Parallel frame analysis for improved speed
- **Quality Thresholds**: Adaptive scene count based on video duration

### Quality Metrics
- **Visual Clarity**: Resolution and compression quality assessment
- **Audio Quality**: Transcription confidence and clarity scoring
- **Content Relevance**: Task alignment measurement
- **Technical Depth**: Code and technical element density
- **Overall Score**: Weighted composite quality assessment

### Supported Formats
- **Video**: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V
- **Audio**: Extracted to MP3 for transcription processing
- **Frame Export**: PNG keyframes at 1280x720 resolution

### Analysis Capabilities
- **UI Element Detection**: Buttons, forms, menus, navigation components
- **Technical Content**: Code snippets, API calls, configuration files
- **Presentation Analysis**: Slides, diagrams, technical presentations
- **Demo Recognition**: Step-by-step walkthroughs and tutorials