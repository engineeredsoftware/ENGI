/**
 * EXECUTION STORAGE ADAPTER - Bridge to artifact storage
 * 
 * Integrates with the artifacts package for persistent storage.
 * Execution-generics knows nothing about S3 - that's artifacts' job.
 */

import { saveArtifact } from '@bitcode/generic-artifacts-compose';
import { ExecutionStorageConfig } from './StorageDestination';

/**
 * Adapter for persistent storage
 * 
 * Uses the artifacts package which handles S3/Supabase fallback
 */
export class ExecutionStorageAdapter {
  /**
   * Store data persistently
   */
  static async store(
    key: string, 
    value: any, 
    config?: ExecutionStorageConfig
  ): Promise<{ url: string; size: number }> {
    // Serialize the value
    const serialized = JSON.stringify(value);
    const buffer = Buffer.from(serialized);
    
    // Use artifacts package
    const result = await saveArtifact(
      buffer,
      key,
      config?.contentType || 'application/json'
    );
    
    return {
      url: result.url,
      size: result.size
    };
  }
  
  /**
   * Note: Retrieval is not implemented in artifacts package
   * This is intentional - artifacts are write-only for pipelines
   * If retrieval is needed, it should be done through the artifacts service
   */
}