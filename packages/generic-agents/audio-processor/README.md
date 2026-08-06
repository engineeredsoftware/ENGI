# Audio Processor Agent

Advanced audio analysis agent for speech-to-text transcription and content comprehension.

## Overview

The Audio Processor Agent provides comprehensive audio processing capabilities including high-accuracy transcription, metadata extraction, content analysis, and technical requirement identification. Built on OpenAI Whisper and ffmpeg for robust audio handling.

## Core Capabilities

### 1. Speech-to-Text Transcription
- High-accuracy transcription using OpenAI Whisper API
- Multi-language support with confidence scoring
- Segment-level timestamps and text extraction
- Automatic format conversion for compatibility

### 2. Audio Metadata Extraction
- Duration, format, sample rate, and channel information
- Bitrate analysis and quality assessment
- File size tracking for processing optimization
- Quality classification (high/medium/low)

### 3. Content Analysis
- Speaker estimation and segmentation
- Topic identification through frequency analysis
- Technical term extraction for development contexts
- Sentiment analysis (positive/negative/neutral)
- Relevance scoring against task requirements

### 4. Technical Understanding
- Software development terminology recognition
- Architecture and design discussion analysis
- Requirement specification extraction
- Implementation guidance synthesis

## Technical Implementation

### Dependencies
- `ffmpeg-static` - Audio processing and format conversion
- `fluent-ffmpeg` - FFmpeg wrapper for Node.js
- `axios` - HTTP client for API communication
- `form-data` - Multipart form data handling
- OpenAI API key required for Whisper transcription

### Supported Audio Formats
- Direct support: mp3, wav, mp4, m4a, aac, ogg, flac, wma
- Automatic conversion for unsupported formats

### PTRR Implementation
- **Plan**: Identifies audio attachments and creates processing strategy
- **Try**: Executes parallel audio processing for all attachments
- **Refine**: Assesses processing quality and suggests improvements
- **Retry**: Consolidates insights and generates implementation guidance

## Usage

The agent automatically processes audio attachments in the task context:

```typescript
const result = await AUDIO_PROCESSING_AGENT.processAudio({
 attachmentId: "audio1",
 audioUrl: "https://example.com/audio.mp3",
 audioFormat: "mp3",
 taskDescription: "Extract requirements from meeting recording"
});
```

## Output Structure

### Audio Analysis Result
```typescript
{
 metadata: {
 duration: number,
 format: string,
 quality: 'high' | 'medium' | 'low',
 fileSize: number
 },
 transcription: {
 fullText: string,
 segments: TranscriptionSegment[],
 language: string,
 confidence: number
 },
 analysis: {
 estimatedSpeakers: number,
 topics: string[],
 sentiment: 'positive' | 'negative' | 'neutral',
 technicalTerms: string[]
 },
 relevanceScore: number,
 keyInsights: string[]
}
```

## Performance Characteristics
- Parallel processing for multiple audio files
- 5-minute timeout for transcription API calls
- 2-minute timeout for audio file downloads
- Automatic cleanup of temporary files
- Telemetry tracking for processing metrics

## Configuration
- `OPENAI_API_KEY` environment variable required
- Temperature: 0.3 (optimized for accuracy)
- Max tokens: 4000 per response
- Retry: 2 attempts with 2-second backoff

## Integration
The agent integrates with the discovery phase pipeline, updating global context with processed audio insights for downstream implementation agents to reference.