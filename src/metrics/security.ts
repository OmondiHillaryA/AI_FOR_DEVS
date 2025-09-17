// Security utilities following Rule 1: Security-First File Operations
import { readFileSync, statSync } from 'fs';
import { resolve, extname } from 'path';
import { SecurityError, ANALYSIS_LIMITS } from './types';

// Optimized with Set for O(1) lookup
const ALLOWED_EXTENSIONS = new Set(['.ts', '.js', '.jsx', '.tsx', '.py', '.java', '.cs']);
const CWD = process.cwd(); // Cache CWD for performance

export function sanitizePath(inputPath: string): string {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new SecurityError('Invalid path provided');
  }
  
  const resolved = resolve(inputPath);
  
  if (!resolved.startsWith(CWD)) {
    throw new SecurityError(`Path traversal detected: ${inputPath}`);
  }
  
  return resolved;
}

export function validateFileSize(filePath: string): void {
  try {
    const stats = statSync(filePath);
    if (stats.size > ANALYSIS_LIMITS.MAX_FILE_SIZE) {
      throw new SecurityError(
        `File too large: ${filePath} (${stats.size} bytes, max: ${ANALYSIS_LIMITS.MAX_FILE_SIZE})`
      );
    }
  } catch (error) {
    if (error instanceof SecurityError) throw error;
    throw new SecurityError(`Cannot access file: ${filePath}`);
  }
}

export function isAllowedFileType(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

export function safeReadFile(filePath: string): string {
  const sanitized = sanitizePath(filePath);
  
  if (!isAllowedFileType(sanitized)) {
    throw new SecurityError(`File type not allowed: ${filePath}`);
  }
  
  validateFileSize(sanitized);
  
  try {
    return readFileSync(sanitized, 'utf8');
  } catch (error) {
    throw new SecurityError(`Failed to read file: ${filePath} - ${error.message}`);
  }
}

// Utility for batch validation
export function validatePaths(paths: readonly string[]): string[] {
  return paths.map(path => {
    const sanitized = sanitizePath(path);
    if (!isAllowedFileType(sanitized)) {
      throw new SecurityError(`File type not allowed: ${path}`);
    }
    return sanitized;
  });
}