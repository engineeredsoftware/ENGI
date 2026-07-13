/**
 * @bitcode/api/streams — real-time pipeline streaming primitives
 *
 * Grouped under the API package with responses (HTTP/stream primitives).
 * BC: `@bitcode/streams` re-exports this module.
 *
 * Streams Package - Real-time pipeline communication
 * 
 * @doc-package
 * version: 1.0.0
 * philosophy: "Streams connect pipeline intelligence in real-time"
 */


// Export core streaming functionality (explicit exports only)
export {
  // Stable type aliases (actual types from @bitcode/pipelines-generics)
  type ExecutionPhase,
  type ExecutionStep,
  type FailsafeStep,
  type GenerationStep,
  type MetaPhase,
  type ExecutionState,
  // Stream-specific types
  type ToolUseMessage,
  type GenerationMessage,
  type StreamMessage,
  type FileDiff,
  type FileTreeChange,
  type DataStream,
  // Stream writers
  writeStreamMessage,
  writeStreamError,
  writeStreamWarning,
  writeStreamToolUse,
  writeStreamGeneration,
  writeStreamThinking
} from './streams';

// Export file diff helpers
export {
  writeFileDiff,
  writeFileTreeChanges,
  calculateFileTreeStats,
  extractFileDiffsFromToolResults
} from './file-diff-helpers';

// Export generic streaming infrastructure (explicit)
export {
  type PipelineStreamConfig,
  type PipelineStreamMessage,
  StreamEventType,
  GenericStreamManager,
  StreamFactory,
  StreamTracked
} from './generic-streaming';

// Export streamer (explicit)
export {
  type StreamEventHandler,
  type StreamerConfig,
  Streamer
} from './streamer';
