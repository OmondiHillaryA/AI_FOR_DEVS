// Core type definitions for Code Quality Metrics Tool
// Following Rule 3: Modular Architecture

// Metrics interfaces
export interface ComplexityMetrics {
  readonly cyclomatic: number;
  readonly cognitive: number;
  readonly nestingDepth: number;
  readonly functionLength: number;
}

export interface MaintainabilityMetrics {
  readonly duplication: number;
  readonly commentRatio: number;
  readonly functionCount: number;
  readonly linesOfCode: number;
}

// Main result interface
export interface MetricsResult {
  readonly file: string;
  readonly complexity: ComplexityMetrics;
  readonly maintainability: MaintainabilityMetrics;
  readonly qualityScore: number;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

// Input/Output types
export interface MetricsInput {
  readonly path: string;
  readonly recursive?: boolean;
  readonly metrics?: readonly MetricsType[];
}

export type MetricsType = 'complexity' | 'maintainability' | 'all';

// Cache types
export interface CacheEntry {
  readonly metrics: MetricsResult;
  readonly timestamp: number;
  readonly hash: string;
}

export interface CacheStats {
  readonly size: number;
  readonly hitRate: number;
}

// Error types
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class AnalysisError extends Error {
  constructor(message: string, public readonly filePath: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// Constants
export const ANALYSIS_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ANALYSIS_TIMEOUT: 5000, // 5 seconds
  MAX_CONCURRENT_FILES: 50,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 1000
} as const;

export const QUALITY_THRESHOLDS = {
  HIGH_COMPLEXITY: 10,
  DEEP_NESTING: 5,
  HIGH_DUPLICATION: 15,
  LOW_COMMENTS: 10
} as const;