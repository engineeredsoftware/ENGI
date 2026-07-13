# Multimodal Processing Utilities

## Overview

Comprehensive multimodal processing utilities for handling audio, video, image, and document content with production-grade error handling, retry logic, performance optimizations, and intelligent caching. Designed for high-throughput pipeline integration with configurable rate limiting and resource management.

## Core Functionality

- **Multi-format Support**: Audio, video, image, document, and text processing strategies
- **Performance Optimization**: Concurrency limiting, memory management, and streaming processing
- **Intelligent Caching**: Memory-aware LRU cache with TTL and size-based eviction
- **Rate Limiting**: Token bucket algorithm for API quota management
- **Error Recovery**: Comprehensive retry logic with exponential backoff
- **Resource Management**: Memory limits, file size validation, and garbage collection

## API Reference

### MultimodalProcessor Class

#### Constructor
```typescript
new MultimodalProcessor(config?: Partial<MultimodalConfig>)
```

**Configuration:**
```typescript
interface MultimodalConfig {
 concurrency: {
 maxConcurrent: number; // Default: 3
 maxRetries: number; // Default: 2
 backoffMs: number; // Default: 1000
 };
 caching: {
 enabled: boolean; // Default: true
 ttlMs: number; // Default: 3600000 (1 hour)
 maxSizeBytes: number; // Default: 100MB
 };
 performance: {
 timeoutMs: number; // Default: 300000 (5 min)
 maxFileSizeBytes: number; // Default: 50MB
 memoryLimitMB: number; // Default: 512MB
 };
 apis: {
 openaiRateLimit: number; // Default: 60 requests/min
 whisperTimeoutMs: number; // Default: 300000
 visionTimeoutMs: number; // Default: 45000
 };
}
```

#### Core Methods

##### `processFile<T>(fileUrl, processor, options?)`

Process single file with comprehensive error handling and caching.

**Parameters:**
- `fileUrl: string` - File URL or path to process
- `processor: () => Promise<T>` - Processing function
- `options?: ProcessingOptions` - Processing configuration

**Returns:** `Promise<T>` - Processing result with caching and telemetry

##### `processFiles<T>(files, options?)`

Process multiple files with intelligent batching and memory management.

**Parameters:**
- `files: Array<FileProcessor<T>>` - Array of file processing definitions
- `options?: { batchSize?: number }` - Batch processing options

**Returns:** `Promise<Array<ProcessingResult<T>>>` - Results with error handling per file

## Usage Examples

### Basic File Processing
```typescript
import { MultimodalProcessor } from '@bitcode/multimodal-utils';

const processor = new MultimodalProcessor({
 concurrency: { maxConcurrent: 5 },
 caching: { enabled: true, ttlMs: 7200000 }, // 2 hours
 performance: { timeoutMs: 600000 } // 10 minutes
});

// Process audio file
const audioResult = await processor.processFile(
 'https://example.com/audio.mp3',
 async () => {
 // Your audio processing logic
 const transcription = await transcribeAudio(audioUrl);
 return { text: transcription, duration: metadata.duration };
 },
 {
 cacheKey: 'audio-transcription-abc123',
 timeoutMs: 300000
 }
);
```

### Batch Processing
```typescript
// Process multiple files efficiently
const files = [
 {
 url: 'video1.mp4',
 processor: () => extractVideoFrames(url),
 cacheKey: 'frames-video1'
 },
 {
 url: 'audio1.wav',
 processor: () => transcribeAudio(url),
 cacheKey: 'transcript-audio1'
 },
 {
 url: 'image1.png',
 processor: () => analyzeImage(url),
 cacheKey: 'analysis-image1'
 }
];

const results = await processor.processFiles(files, {
 batchSize: 3
});

// Handle results and errors
results.forEach(result => {
 if (result.error) {
 console.error(`Failed to process ${result.url}:`, result.error);
 } else {
 console.log(`Processed ${result.url}:`, result.result);
 }
});
```

### OpenAI Integration
```typescript
// Rate-limited OpenAI API calls
await processor.acquireOpenAIToken(); // Waits for available token

const analysis = await processor.processFile(
 imageUrl,
 async () => {
 const response = await openai.chat.completions.create({
 model: "gpt-4-vision-preview",
 messages: [{
 role: "user",
 content: [
 { type: "text", text: "Analyze this image" },
 { type: "image_url", image_url: { url: imageUrl } }
 ]
 }]
 });
 return response.choices[0].message.content;
 },
 { cacheKey: `vision-analysis-${imageHash}` }
);
```

### Processing Strategy Selection
```typescript
import { multimodalUtils } from '@bitcode/multimodal-utils';

// Automatic strategy selection
const strategy = multimodalUtils.getProcessingStrategy('document.pdf');
// Returns: 'document'

const estimatedTime = multimodalUtils.estimateProcessingTime(
 'video',
 50 * 1024 * 1024 // 50MB
);
// Returns: ~400000ms (6.7 minutes)

// Create optimized processor for strategy
const docProcessor = multimodalUtils.createProcessor({
 performance: {
 timeoutMs: estimatedTime * 1.5,
 maxFileSizeBytes: 100 * 1024 * 1024
 }
});
```

### Error Handling
```typescript
import {
 MultimodalProcessingError,
 RateLimitError,
 TimeoutError,
 multimodalUtils
} from '@bitcode/multimodal-utils';

try {
 const result = await processor.processFile(url, processingFunc);
} catch (error) {
 if (error instanceof RateLimitError) {
 // Wait and retry
 await new Promise(resolve => setTimeout(resolve, 60000));
 return processor.processFile(url, processingFunc);
 }

 if (error instanceof TimeoutError) {
 // Increase timeout and retry
 return processor.processFile(url, processingFunc, {
 timeoutMs: error.details.timeoutMs * 2
 });
 }

 if (multimodalUtils.isRetryableError(error)) {
 // Automatic retry with backoff
 return retryWithBackoff(() =>
 processor.processFile(url, processingFunc)
 );
 }

 // Non-retryable error
 throw multimodalUtils.createError(
 'Processing failed permanently',
 'PERMANENT_FAILURE',
 { originalError: error.message, url }
 );
}
```

## Performance Characteristics

### Concurrency Management
- **Parallel Processing**: Configurable concurrent operation limits (default: 3)
- **Memory Batching**: Automatic batching prevents memory exhaustion
- **Garbage Collection**: Explicit GC triggers between batches
- **Resource Cleanup**: Automatic cleanup of temporary resources

### Caching Strategy
- **Memory-Aware LRU**: Size-based eviction with memory usage tracking
- **TTL Expiration**: Time-based cache invalidation (default: 1 hour)
- **Hit Rate Optimization**: Intelligent cache key generation and storage
- **Size Estimation**: JSON-based size calculation with UTF-16 encoding

### Rate Limiting
- **Token Bucket**: Configurable rate limiting for external APIs
- **Automatic Refill**: Time-based token replenishment
- **Blocking Acquisition**: Async token acquisition with queue management
- **Service-specific Limits**: Per-API rate limiting configuration

### Error Recovery
- **Exponential Backoff**: Configurable retry delays with jitter
- **Failure Classification**: Automatic retry decision based on error type
- **Circuit Breaking**: Automatic failure isolation and recovery
- **Telemetry Integration**: Comprehensive error tracking and metrics

## Utility Functions

### Processing Strategy Detection
```typescript
multimodalUtils.getProcessingStrategy(filename: string): ProcessingType
```
Maps file extensions to processing strategies: `audio`, `video`, `image`, `document`, `text`

### Performance Estimation
```typescript
multimodalUtils.estimateProcessingTime(fileType: string, fileSizeBytes: number): number
```
Estimates processing time based on file type and size with empirical models

### Error Utilities
```typescript
multimodalUtils.createError(message: string, code: string, details?: any): MultimodalProcessingError
multimodalUtils.isRetryableError(error: Error): boolean
```

## Configuration Patterns

### Production Configuration
```typescript
const productionProcessor = new MultimodalProcessor({
 concurrency: {
 maxConcurrent: 10,
 maxRetries: 3,
 backoffMs: 2000
 },
 caching: {
 enabled: true,
 ttlMs: 3600000, // 1 hour
 maxSizeBytes: 500 * 1024 * 1024 // 500MB
 },
 performance: {
 timeoutMs: 900000, // 15 minutes
 maxFileSizeBytes: 200 * 1024 * 1024, // 200MB
 memoryLimitMB: 2048 // 2GB
 },
 apis: {
 openaiRateLimit: 100, // 100 requests/min
 whisperTimeoutMs: 600000, // 10 minutes
 visionTimeoutMs: 90000 // 1.5 minutes
 }
});
```

### Development Configuration
```typescript
const devProcessor = new MultimodalProcessor({
 concurrency: { maxConcurrent: 2, maxRetries: 1 },
 caching: { enabled: false }, // Disable for development
 performance: { timeoutMs: 120000 }, // 2 minutes
 apis: { openaiRateLimit: 20 } // Conservative rate limiting
});
```

## Default Instance

For quick usage, a default configured instance is available:

```typescript
import { defaultMultimodalProcessor } from '@bitcode/multimodal-utils';

// Use with default configuration
const result = await defaultMultimodalProcessor.processFile(
 fileUrl,
 processingFunction
);
```

This utility package provides the foundation for reliable, high-performance multimodal content processing across the Bitcode platform with comprehensive error handling and resource management.
