/**
 * File Gates - Enforce meta-phase file editing restrictions
 *
 * Ensures that each meta-phase can only edit its designated files:
 * - Design: Only .docs/PRODUCT.md
 * - Develop: Codebase files (not .docs/, except PRODUCT.md updates)
 * - Digest: Only .docs/AGENTS.md and .docs/PRODUCT.md
 *
 * @package @bitcode/pipelines-generics
 */

import type { MetaPhase, MetaPhaseConfig } from './types';
import { META_PHASE_CONFIGS } from './types';

function matchPattern(filePath: string, pattern: string): boolean {
  if (pattern === '**/*') return true;
  if (pattern.endsWith('/**')) {
    return filePath.startsWith(pattern.slice(0, -3));
  }
  if (pattern.startsWith('**/')) {
    return filePath.endsWith(pattern.slice(3));
  }
  if (pattern.includes('*')) {
    const regex = new RegExp(
      '^' + pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*') + '$'
    );
    return regex.test(filePath);
  }
  return filePath === pattern;
}

/**
 * Check if a file path is allowed in the current meta-phase
 */
export function isFileAllowed(filePath: string, metaPhase: MetaPhase): boolean {
  const config = META_PHASE_CONFIGS[metaPhase];
  const patterns = config.allowedFilePatterns;

  // Check each pattern
  for (const pattern of patterns) {
    // Negation pattern (exclusion)
    if (pattern.startsWith('!')) {
      const negativePattern = pattern.slice(1);
      if (matchPattern(filePath, negativePattern)) {
        return false;
      }
    }
    // Positive pattern (inclusion)
    else {
      if (matchPattern(filePath, pattern)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filter file list to only allowed files
 */
export function filterAllowedFiles(filePaths: string[], metaPhase: MetaPhase): string[] {
  return filePaths.filter((path) => isFileAllowed(path, metaPhase));
}

/**
 * Validate file operations for meta-phase compliance
 */
export function validateFileOperation(
  operation: 'read' | 'write' | 'delete',
  filePath: string,
  metaPhase: MetaPhase
): { allowed: boolean; reason?: string } {
  const config = META_PHASE_CONFIGS[metaPhase];

  // Read operations are always allowed
  if (operation === 'read') {
    return { allowed: true };
  }

  // Write/delete operations must respect file gates
  const allowed = isFileAllowed(filePath, metaPhase);

  if (!allowed) {
    const primaryDoc = config.primaryDocument || 'designated files';
    return {
      allowed: false,
      reason: `${metaPhase} phase can only ${operation} ${primaryDoc}. Attempted: ${filePath}`,
    };
  }

  return { allowed: true };
}

/**
 * Get helpful message about what files can be edited
 */
export function getAllowedFilesMessage(metaPhase: MetaPhase): string {
  const config = META_PHASE_CONFIGS[metaPhase];

  switch (metaPhase) {
    case 'Design':
      return 'In Design phase, you can only edit .docs/PRODUCT.md to specify what should be built.';

    case 'Develop':
      return 'In Develop phase, you can edit codebase files to implement the design. PRODUCT.md can be updated with refinements.';

    case 'Digest':
      return 'In Digest phase, update .docs/AGENTS.md with learnings and finalize .docs/PRODUCT.md.';

    default:
      return `Allowed files: ${config.allowedFilePatterns.join(', ')}`;
  }
}

/**
 * Tool wrapper that enforces file gates
 */
export function createGatedTool<TInput, TOutput>(
  originalTool: (input: TInput) => Promise<TOutput>,
  extractFilePath: (input: TInput) => string,
  operation: 'read' | 'write' | 'delete'
) {
  return async (input: TInput, metaPhase: MetaPhase): Promise<TOutput> => {
    const filePath = extractFilePath(input);
    const validation = validateFileOperation(operation, filePath, metaPhase);

    if (!validation.allowed) {
      throw new Error(
        `File operation blocked: ${validation.reason}\n\n${getAllowedFilesMessage(metaPhase)}`
      );
    }

    return originalTool(input);
  };
}
